const crypto = require('crypto');
const zlib = require('zlib');

class GitObject {
    constructor(type, content) {
        if (!type || !content) {
            throw new Error('GitObject requires type and content');
        }
        this.type = type;
        this.content = content;
    }

    hash() {
        const header = Buffer.from(
            `${this.type} ${this.content.length}\0`
        );

        const store = Buffer.concat([header, this.content]); 

        return crypto.createHash('sha1').update(store).digest('hex');
    }

    serialize() {
        const header = Buffer.from(
            `${this.type} ${this.content.length}\0` 
        );

        const store = Buffer.concat([header, this.content]);
        return zlib.deflateSync(store); 
    }

    static deserialize(buffer) {
        const decompressed = zlib.inflateSync(buffer);

        const nullIndex = decompressed.indexOf(0);
        if (nullIndex === -1) {
            throw new Error('Invalid Git object format');
        }

        const header = decompressed.slice(0, nullIndex).toString();
        const content = decompressed.slice(nullIndex + 1);

        const [type] = header.split(' ');
        
        return new GitObject(type, content); 
    }
}

module.exports = GitObject; 