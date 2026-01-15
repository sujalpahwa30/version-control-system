const fs = require('fs');
const path = require('path');
const GitObject = require('../objects/GitObject');
const Index = require('../index/Index');
const Blob = require('../objects/Blob');
const Tree = require('../objects/Tree');

class Repository {
    constructor(rootPath) {
        this.rootPath = rootPath; 
        this.vcsDir = path.join(rootPath, '.orion');
        this.objectsDir = path.join(this.vcsDir, 'objects');
        this.refsDir = path.join(this.vcsDir, 'refs');
        this.headsDir = path.join(this.refsDir, 'heads'); 
        this.headFile = path.join(this.vcsDir, 'HEAD');
        this.indexFile = path.join(this.vcsDir, 'index'); 
        this.indexPath = path.join(this.vcsDir, 'index');
        this.index = new Index(this.indexPath); 
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

    addFile(relativePath) {
        const fullPath = path.join(this.rootPath, relativePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${relativePath}`);
        }

        const content = fs.readFileSync(fullPath);
        const blob = new Blob(content);

        const hash = this.storeObject(blob);
        this.index.add(relativePath, hash);
    }

    addPath(targetPath) {
        if (targetPath === '.') {
            this.addDirectory('');
            return; 
        }
        const fullPath = path.join(this.rootPath, targetPath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Path not found: ${targetPath}`);
        }

        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
            this.addFile(targetPath);
        } else if (stat.isDirectory()) {
            this.addDirectory(targetPath);
        }
    }
    
    addDirectory(dirPath) {
        const fullDirPath = path.join(this.rootPath, dirPath);

        const walk = (currentDir) => {
            const entries = fs.readdirSync(currentDir);

            for (const entry of entries) {
                if (entry === '.orion') continue;

                const fullPath = path.join(currentDir, entry);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    walk(fullPath);
                } else if (stat.isFile()) {
                    const relative = path.relative(this.rootPath, fullPath);
                    this.addFile(relative);
                }
            }
        };
        walk(fullDirPath);
    }

    buildTreeFromIndex() {
        const indexEntries = this.index.getEntries();

        if (Object.keys(indexEntries).length === 0) {
            const emptyTree = new Tree([]);
            return this.storeObject(emptyTree);
        }

        const root = {};

        for (const [filePath, hash] of Object.entries(indexEntries)) {
            const parts = filePath.split('/');
            let current = root;

            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = hash;
        }

        const writeTreeRecursive = (node) => {
            const entries = [];

            for (const [name, value] of Object.entries(node)) {
                if (typeof value === 'string') {
                    entries.push({
                        mode: '100644',
                        name,
                        hash: value 
                    });
                } else {
                    const subtreeHash = writeTreeRecursive(value);
                    entries.push({
                        mode: '40000',
                        name,
                        hash: subtreeHash
                    });
                }
            }
            const tree = new Tree(entries);
            return this.storeObject(tree);
        };
        return writeTreeRecursive(root);
    }
}

module.exports = Repository; 