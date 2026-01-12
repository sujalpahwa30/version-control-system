const fs = require('fs');
const path = require('path');

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
}

module.exports = Repository; 