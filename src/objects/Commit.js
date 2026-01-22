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
}

module.exports = Commit;