const Repository = require('../repo/Repository');

module.exports = function logCommand(program) {
    program 
        .command('log')
        .option('-n, --number <count>', 'Number of commits', parseInt, 10)
        .description('Show commit history')
        .action((opts) => {
            const repo = new Repository(process.cwd());
            repo.log(opts.number);
        });
};
