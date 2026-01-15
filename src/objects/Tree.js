const GitObject = require('./GitObject');

class Tree extends GitObject {
    constructor(entries = []) {
        const content = Tree.serializeEntries(entries);
        super('tree', content);
        this.entries = entries;
    }

    static serializeEntries(entries) {
        const sorted = entries.sort((a, b) => 
            a.name.localeCompare(b.name)
        );

        const buffers = [];
        for (const entry of sorted) {
            const header = Buffer.from(
                `${entry.mode} ${entry.name}\0` 
            );
            const hashBuffer = Buffer.from(entry.hash, 'hex');
            buffers.push(Buffer.concat([header, hashBuffer]));
        }

        return Buffer.concat(buffers);
    }

    static deserialize(content) {
        let offset = 0;
        const entries = [];

        while (offset < content.length) {
            const nullIndex = content.indexOf(0, offset);
            const header = content.slice(offset, nullIndex).toString();
            const [mode, name] = header.split(' ');

            const hash = content 
                .slice(nullIndex + 1, nullIndex + 21)
                .toString('hex');

            entries.push({ mode, name, hash });
            offset = nullIndex + 21;
        }

        return new Tree(entries);
    }
}

module.exports = Tree;