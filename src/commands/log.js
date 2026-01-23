const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function logCommand(program) {
    program 
        .command('log')
        .option('-n, --number <count>', 'Number of commits', parseInt, 10)
        .description('Show commit history')
        .action((opts) => {
            try {
                const repo = new Repository(process.cwd());
                repo.log(opts.number);
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};
