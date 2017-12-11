const fetch = require('node-fetch');

async function gitlab(method, path, body = null) {
    const response = await fetch(`${gitlab.path}/api/v4${path}?per_page=99999`, {
        method,
        headers: {
            'PRIVATE-TOKEN': gitlab.key,
            "Content-Type": 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json();
    if (!response.ok) {
        throw json;
    }
    return json;
}
gitlab.gitlab = gitlab;

gitlab.init = async function() {
    [ n, p ] = await Promise.all([
        gitlab('GET', '/namespaces'),
        (async ()=>{
            const { id } = await gitlab('GET', '/user');
            return await gitlab("GET", `/users/${id}/projects`);
        })()
    ]);
    gitlab.namespaces = n;
    gitlab.projects = p;
}

gitlab.getNamespaceID = async function (groupName) {
    for (let n of gitlab.namespaces) {
        if (n.path === groupName) {
            return n.id;
        }
    }

    const group = await gitlab('POST', '/groups', {
        name: groupName,
        path: groupName,
    });
    console.log("Created group", group);

    gitlab.namespaces.push(group);
    return group.id;
}

gitlab.getProjectExists = function (projectName) {
    for (let p of gitlab.projects) {
        if (p.path_with_namespace === projectName) {
            return true;
        }
    }
    return false;
}

module.exports = gitlab;
