const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function statusCommand(program) {
    program 
        .command('status')
        .description('Show the working tree status')
        .action(() => {
            try {
                const repo = new Repository(process.cwd());
                repo.status();
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};
