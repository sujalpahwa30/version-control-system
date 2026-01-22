const Repository = require('../repo/Repository');
const color = require('../utils/color');

module.exports = function checkoutCommand(program) {
    program 
        .command('checkout <ref>')
        .description('Switch branches or restore working tree')
        .action((ref) => {
            try {
                const repo = new Repository(process.cwd());
                repo.checkout(ref);
            } catch (e) {
                console.log(color.red(e.message));
            }
        });
};