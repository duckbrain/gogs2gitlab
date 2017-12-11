const fetch = require('node-fetch');

async function gogs(path) {
    const response = await fetch(`${gogs.path}/api/v1${path}`, {
        method: 'GET',
        headers: { Authorization: 'token ' + gogs.key }
    });
    const json = await response.json();
    if (!response.ok) {
        throw json;
    }
    return json;
}

module.exports = gogs;
