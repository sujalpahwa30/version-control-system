const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function commitCommand(program) {
    program
        .command('commit')
        .requiredOption('-m, --message <msg>', 'Commit message')
        .action((opts) => {
            try {
                const repo = new Repository(process.cwd());
                repo.commit(opts.message);
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};