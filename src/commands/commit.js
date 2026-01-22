const Repository = require('../repo/Repository');

module.exports = function commitCommand(program) {
    program
        .command('commit')
        .requiredOption('-m, --message <msg>', 'Commit message')
        .action((opts) => {
            const repo = new Repository(process.cwd());
            repo.commit(opts.message);
        });
};