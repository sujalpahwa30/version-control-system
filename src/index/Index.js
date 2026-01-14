const fs = require('fs');
const path = require('path');

class Index {
    constructor(indexPath) {
        this.indexPath = indexPath;
        this.entries = this.load();
    }

    load() {
        if (!fs.existsSync(this.indexPath)) {
            return {};
        }

        try {
            const data = fs.readFileSync(this.indexPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    save() {
        fs.writeFileSync(this.indexPath, JSON.stringify(this.entries, null, 2));
    }

    add(filePath, blobHash) {
        this.entries[filePath] = blobHash;
        this.save(); 
    }

    remove(filePath) {
        delete this.entries[filePath];
        this.save(); 
    }

    clear() {
        this.entries = {};
        this.save();
    }

    getEntries() {
        return this.entries;
    }
}

module.exports = Index; 