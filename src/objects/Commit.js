const GitObject = require('./GitObject');

class Commit extends GitObject {
    constructor({
        tree,
        parents = [],
        author,
        committer,
        message,
        timestamp = Math.floor(Date.now() / 1000)
    }) {
        const content = Commit.serialize({
            tree,
            parents,
            author,
            committer,
            message,
            timestamp
        });

        super('commit', content);

        this.tree = tree;
        this.parents = parents;
        this.author = author;
        this.committer = committer;
        this.message = message;
        this.timestamp = timestamp;
    }

    static serialize({ tree, parents, author, committer, message, timestamp }) {
        const lines = [];

        lines.push(`tree ${tree}`);

        for (const parent of parents) {
            lines.push(`parent ${parent}`);
        }

        lines.push(`author ${author} ${timestamp} +0000`);
        lines.push(`committer ${committer} ${timestamp} +0000`);
        lines.push('');
        lines.push(message);

        return Buffer.from(lines.join('\n'));
    }

    static deserialize(buffer) {
        const text = buffer.toString();
        const lines = text.split('\n');

        let tree = null;
        const parents = [];
        let author = null;
        let committer = null; 
        let message = '';
        let i = 0;

        for (; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('tree ')) {
                tree = line.slice(5);
            } else if (line.startsWith('parent ')) {
                parents.push(line.slice(7));
            } else if (line.startsWith('author ')) {
                author = line.slice(7);
            } else if (line.startsWith('committer ')) {
                committer = line.slice(10);
            } else if (line === '') {
                i++;
                break;
            }
        }

        message = lines.slice(i).join('\n');

        return {
            tree,
            parents,
            author,
            committer,
            message 
        };
    }
}

module.exports = Commit;