
const util = require('util');
const { chdir } = require('process');
const exec = util.promisify(require('child_process').exec);
const gitlab = require('./gitlab');
const parallelLimit = require('async/parallelLimit');
const asyncify = require('async/asyncify');
const gogs = require('./gogs');
const config = require('./secure');
Object.assign(gogs, config.gogs);
Object.assign(gitlab, config.gitlab);

async function performMigrations() {
    await exec('mkdir -p migrations');

    console.log("Getting initial data");
    const [repos] = await Promise.all([
        await gogs('/user/repos'),
        gitlab.init(),
    ])

    chdir('migrations');

    console.log("Looping repos", repos.length);

    // await parallelLimit(repos.map(function (repo) {
    //     //return migrate.bind(null, repo);
    //     return asyncify(migrate.bind(null, repo));
    // }), 3);
    for (let repo of repos) {
        if (repo.name !== 'test-repo') {
            //continue;
        }
        try {
            await migrate(repo);
        } catch (ex) {
            console.error(ex, repo)
        }
    }

    chdir('..');
}

async function migrate(repo) {
    const { ssh_url, full_name, name, description, private, default_branch } = repo;
    const groupName = repo.owner.login;

    if (gitlab.getProjectExists(full_name)) {
        console.log("Project already exits", full_name);
        return;
    }

    console.log("Getting issues", full_name);
    const issues = await gogs(`/repos/${full_name}/issues`);

    console.log("Cloning", ssh_url);
    await exec(`git clone --mirror ${ssh_url} ${name}`);

    console.log('Getting namespace', name);
    const namespace_id = await gitlab.getNamespaceID(groupName);
    console.log("Creating gitlab project", full_name, namespace_id);
    const project = await gitlab('POST', '/projects', {
        name,
        namespace_id,
        description,
        visibility: private ? 'private' : 'internal',
        default_branch,
        issues_enabled: true,
    });

    console.log("Uploading issues", full_name);
    await Promise.all(issues.map(async issue=>{
        const {title, body, state, created_at, labels} = issue;
        const {id} = await gitlab('POST', `/projects/${project.id}/issues`, {
            title,
            description: body,
            labels: labels.map(l=>l.name).join(','),
            created_at,
        });
        if (state === 'closed') {
            await gitlab('PUT', `/projects/${project_id}/issues/${id}`, { state_event: 'close' })
        }
    }));

    console.log("Pushing", project.ssh_url_to_repo);
    const gitOp = { cwd: name };
    await exec(`git remote add gitlab ${project.ssh_url_to_repo}`, gitOp);
    await exec('git push --all gitlab', gitOp);
    await exec('git push --tags gitlab', gitOp);
    await exec(`rm -rf ${name}`);
}

performMigrations().catch(err => console.error(err));
