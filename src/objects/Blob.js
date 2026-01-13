const GitObject = require('./GitObject');

class Blob extends GitObject {
    constructor(content) {
        if (!Buffer.isBuffer(content)) {
            throw new Error('Blob content must be a Buffer');
        }
        super('blob', content);
    }
}

module.exports = Blob; 