const Repository = require('../repo/Repository');

module.exports = function addCommand(program) {
    program 
        .command('add <paths...>')
        .description('Add files or directories to the staging area')
        .action((paths) => {
            const repo = new Repository(process.cwd());

            for (const p of paths) {
                repo.addPath(p);
            }

            console.log('Files added to staging area');
        });
};