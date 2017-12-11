// Create a config.js to override the contents of this file.
// You may use this file as a template.

module.exports = {
	gogs: {
		path: process.env.GOGS_PATH,
		key: process.env.GOGS_KEY,
	},
	gitlab: {
		path: process.env.GITLAB_PATH,
		key: process.env.GITLAB_KEY,
	}
}
