
# Gogs to Gitlab Migration Tool

This application runs on Node JS. I used v8.4.0. I don't know how well it works on older versions. It uses a lot of new syntax.

## Usage Instructions

1. Clone the repo and cd into the directory. Ensure you computer has key exchanges with both the Gogs and the Gitlab instance. This tool uses the git command line to transfer data, and the API interfaces to make projects and copy metadata.
2. Run `npm install` to get the dependencies
3. Create a `config.js` file using the template in `config/index.js`. You can also set the environment variables defined there.
4. Run `node app.js` to run the migration

The migration will run through all projects your user key on Gogs has accesses to, then attempt to create a similar project on Gitlab and upload it there. It will attempt to copy the issues, but will not copy the comment thread on them. (Pull requests welcome)
