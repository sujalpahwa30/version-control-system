const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function initCommand(program) {
    program 
        .command('init')
        .description('Initialize a new repository')
        .action(() => {
            try {
                const repo = new Repository(process.cwd()); 
                const created = repo.init(); 

                if (!created) {
                    console.log(color.yellow('Repository already exists.'));
                }
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};