const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function addCommand(program) {
    program 
        .command('add <paths...>')
        .description('Add files or directories to the staging area')
        .action((paths) => {
            try {
                const repo = new Repository(process.cwd());

                for (const p of paths) {
                    repo.addPath(p);
                }

                console.log(color.green('Files added to staging area'));
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};