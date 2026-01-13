const fs = require('fs');
const path = require('path');
const GitObject = require('../objects/GitObject');

class Repository {
    constructor(rootPath) {
        this.rootPath = rootPath; 
        this.vcsDir = path.join(rootPath, '.orion');
        this.objectsDir = path.join(this.vcsDir, 'objects');
        this.refsDir = path.join(this.vcsDir, 'refs');
        this.headsDir = path.join(this.refsDir, 'heads'); 
        this.headFile = path.join(this.vcsDir, 'HEAD');
        this.indexFile = path.join(this.vcsDir, 'index'); 
    }

    init() {
        if (fs.existsSync(this.vcsDir)) {
            return false; 
        }

        fs.mkdirSync(this.vcsDir);
        fs.mkdirSync(this.objectsDir);
        fs.mkdirSync(this.refsDir);
        fs.mkdirSync(this.headsDir); 

        fs.writeFileSync(this.headFile, 'ref: refs/heads/main\n'); 
        fs.writeFileSync(this.indexFile, JSON.stringify({}, null, 2));

        console.log(`Initialized empty repository in ${this.gitDir}`);
        return true; 
    }

    storeObject(obj) {
        const hash = obj.hash();
        const dir = path.join(this.vcsDir, 'objects', hash.slice(0, 2));
        const file = path.join(dir, hash.slice(2));

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, obj.serialize());
        }
        return hash; 
    }

    loadObject(hash) {
        const dir = path.join(this.vcsDir, 'objects', hash.slice(0, 2));
        const file = path.join(dir, hash.slice(2));

        if (!fs.existsSync(file)) {
            throw new Error(`Object ${hash} not found`);
        }

        const data = fs.readFileSync(file);
        return GitObject.deserialize(data);
    }
}

module.exports = Repository; 