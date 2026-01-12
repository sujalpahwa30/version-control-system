const Repository = require('../repo/Repository');

module.exports = function initCommand(program) {
    program 
        .command('init')
        .description('Initialize a new repository')
        .action(() => {
            const repo = new Repository(process.cwd()); 
            const created = repo.init(); 

            if (!created) {
                console.log('Repository already exists.');
            }
        });
};