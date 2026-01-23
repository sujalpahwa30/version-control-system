const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function branchCommand(program) {
    program 
        .command('branch [name]')
        .option('-d, --delete', 'Delete branch')
        .description('List, create, or delete branches')
        .action((name, opts) => {
            const repo = new Repository(process.cwd());

            try {
                if (opts.delete && name) {
                    repo.deleteBranch(name);
                    console.log(color.red(`Deleted branch ${name}`));
                } else if (name) {
                    repo.createBranch(name);
                    console.log(color.green(`Created branch ${name}`));
                } else {
                    repo.listBranches();
                }
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};