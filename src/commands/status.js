const Repository = require('../repo/Repository');

module.exports = function statusCommand(program) {
    program 
        .command('status')
        .description('Show the working tree status')
        .action(() => {
            const repo = new Repository(process.cwd());
            repo.status();
        });
};
