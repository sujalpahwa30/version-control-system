const fs = require('fs');
const path = require('path');
const GitObject = require('../objects/GitObject');
const Index = require('../index/Index');
const Blob = require('../objects/Blob');
const Tree = require('../objects/Tree');
const Commit = require('../objects/Commit');
const color = require('../utils/color'); 

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

        console.log(`Initialized empty repository in ${this.vcsDir}`);
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

    getHead() {
        const headPath = path.join(this.vcsDir, 'HEAD');

        if (!fs.existsSync(headPath)) return null;

        const ref = fs.readFileSync(headPath, 'utf-8').trim();

        if (ref.startsWith('ref: ')) {
            const refPath = path.join(this.vcsDir, ref.slice(5));
            if (fs.existsSync(refPath)) {
                return fs.readFileSync(refPath, 'utf-8').trim();
            }
        }
        return null; 
    }

    updateHead(commitHash) {
        const headPath = path.join(this.vcsDir, 'HEAD');
        const ref = fs.readFileSync(headPath, 'utf-8').trim();

        if (ref.startsWith('ref: ')) {
            const refPath = path.join(this.vcsDir, ref.slice(5));
            fs.writeFileSync(refPath, commitHash + '\n');
        }
    }

    commit(message, author = 'Orion <orion@vcs>') {
        const indexEntries = this.index.getEntries();

        if (Object.keys(indexEntries).length === 0) {
            console.log('Nothing to commit');
            return null; 
        }

        const treeHash = this.buildTreeFromIndex();
        const parent = this.getHead();

        const commit = new Commit({
            tree: treeHash,
            parents: parent ? [parent] : [],
            author,
            committer: author,
            message
        });

        const commitHash = this.storeObject(commit);
        this.updateHead(commitHash);
        this.index.clear();

        console.log(`Committed as ${commitHash}`);
        return commitHash;
    }

    loadCommit(hash) {
        const obj = this.loadObject(hash);
        return Commit.deserialize(obj.content);
    }

    log(limit = 10) {
        let current = this.getHead();

        if (!current) {
            console.log('No commits yet');
            return; 
        }

        let count = 0;

        while (current && count < limit) {
            const commit = this.loadCommit(current);

            console.log(color.yellow(`commit ${current}`));
            console.log(color.cyan(`Author: ${commit.author}`));
            console.log('');
            console.log(`    ${commit.message}`);
            console.log('');

            current = commit.parents[0];
            count++; 
        }
    }

    restoreTree(treeHash, targetPath) {
        const treeObj = this.loadObject(treeHash);
        const Tree = require('../objects/Tree');
        const tree = Tree.deserialize(treeObj.content);

        for (const entry of tree.entries) {
            const fullPath = require('path').join(targetPath, entry.name);

            if (entry.mode === '100644') {
                // blob -> file
                const blobObj = this.loadObject(entry.hash);
                const content = blobObj.content;
                require('fs').writeFileSync(fullPath, content); 
            } else if (entry.mode === '40000') {
                // tree -> directory 
                require('fs').mkdirSync(fullPath, { recursive: true });
                this.restoreTree(entry.hash, fullPath);
            }
        }
    }

    getFilesFromTree(treeHash, base = '') {
        const files = [];
        const Tree = require('../objects/Tree');
        const treeObj = this.loadObject(treeHash);
        const tree = Tree.deserialize(treeObj.content);

        for (const entry of tree.entries) {
            const fullPath = base 
                ? `${base}/${entry.name}`
                : entry.name;

            if (entry.mode === '100644') {
                files.push(fullPath);
            } else {
                files.push(
                    ...this.getFilesFromTree(entry.hash, fullPath)
                );
            }
        }
        return files; 
    }

    clearTrackedFiles(treeHash) {
        const files = this.getFilesFromTree(treeHash);

        for (const file of files) {
            const fullPath = require('path').join(this.rootPath, file);
            try {
                require('fs').unlinkSync(fullPath);
            } catch {}
        }
    }

    resolveCommit(ref) {
        const fs = require('fs');
        const path = require('path');

        const branchPath = path.join(
            this.vcsDir,
            'refs',
            'heads',
            ref 
        );

        if (fs.existsSync(branchPath)) {
            return fs.readFileSync(branchPath, 'utf-8').trim();
        }
        return ref; 
    }

    checkout(ref) {
        const Commit = require('../objects/Commit');
        const fs = require('fs');
        const path = require('path');

        const targetCommitHash = this.resolveCommit(ref);
        const commitObj = this.loadObject(targetCommitHash);
        const commit = Commit.deserialize(commitObj.content);

        const current = this.getHead();
        if (current) {
            const currentCommit = this.loadCommit(current);
            this.clearTrackedFiles(currentCommit.tree);
        }
        this.restoreTree(commit.tree, this.rootPath);

        const headPath = path.join(this.vcsDir, 'HEAD');
        const branchPath = path.join(
            this.vcsDir,
            'refs',
            'heads',
            ref 
        );

        if (fs.existsSync(branchPath)) {
            fs.writeFileSync(
                headPath,
                `ref: refs/heads/${ref}\n`
            );
        } else {
            fs.writeFileSync(headPath, targetCommitHash + '\n');
        }
        console.log(color.green(`Switched to ${ref}`));
    }

    getAllFiles() {
        const fs = require('fs');
        const path = require('path');

        const files = [];

        const walk = (dir) => {
            for (const entry of fs.readdirSync(dir)) {
                if (entry === '.orion') continue;

                const full = path.join(dir, entry);
                const stat = fs.statSync(full);

                if (stat.isDirectory()) {
                    walk(full);
                } else {
                    files.push(path.relative(this.rootPath, full));
                }
            }
        };

        walk(this.rootPath);
        return files;
    }

    getFilesFromTree(treeHash, base = '') {
        const Tree = require('../objects/Tree');
        const files = {};
        const treeObj = this.loadObject(treeHash);
        const tree = Tree.deserialize(treeObj.content);

        for (const entry of tree.entries) {
            const fullPath = base 
                ? `${base}/${entry.name}`
                : entry.name;
            
            if (entry.mode === '100644') {
                files[fullPath] = entry.hash;
            } else {
                Object.assign(
                    files,
                    this.getFilesFromTree(entry.hash, fullPath)
                );
            }
        }
        return files; 
    }

    status() {
        const color = require('../utils/color');
        const fs = require('fs');
        const path = require('path');
        const Blob = require('../objects/Blob');

        const headHash = this.getHead();
        const indexEntries = this.index.getEntries();

        let headFiles = {};
        if (headHash) {
            const commit = this.loadCommit(headHash);
            headFiles = this.getFilesFromTree(commit.tree);
        }

        const workingFiles = {}; 
        for (const file of this.getAllFiles()) {
            const content = fs.readFileSync(
                path.join(this.rootPath, file) 
            );
            const blob = new Blob(content);
            workingFiles[file] = blob.hash();
        }

        const staged = [];
        const modified = [];
        const untracked = [];
        const deleted = [];

        const allPaths = new Set([
            ...Object.keys(headFiles),
            ...Object.keys(indexEntries),
            ...Object.keys(workingFiles)
        ]);

        for (const file of allPaths) {
            const head = headFiles[file];
            const index = indexEntries[file];
            const work = workingFiles[file];

            if (!head && index) {
                staged.push(`new file:   ${file}`);
            } else if (head && index && head !== index) {
                staged.push(`modified:  ${file}`);
            } else if (index && work && index !== work) {
                modified.push(`modified:  ${file}`);
            } else if (!head && !index && work) {
                untracked.push(file);
            } else if (index && !work) {
                deleted.push(`deleted:  ${file}`);
            }
        }

        console.log(color.bold(`On branch ${this.getBranchName()}`));

        if (staged.length) {
            console.log(color.green('\nChanges to be committed:'));
            staged.forEach(f => console.log(`  ${f}`));
        }

        if (modified.length) {
            console.log(color.yellow('\nChanges not staged for commit:'));
            modified.forEach(f => console.log(`  ${f}`)); 
        }

        if (untracked.length) {
            console.log(color.red('\nUntracked files:'));
            untracked.forEach(f => console.log(`   ${f}`));
        }

        if (deleted.length) {
            console.log(color.red('\nDeleted files:'));
            deleted.forEach(f => console.log(`  ${f}`));
        }

        if (
            !staged.length &&
            !modified.length && 
            !untracked.length &&
            !deleted.length
        ) {
            console.log(color.cyan('\nWorking tree clean')); 
        }
    }

    getBranchName() {
        const fs = require('fs');
        const path = require('path');

        const head = fs.readFileSync(
            path.join(this.vcsDir, 'HEAD'),
            'utf-8'
        ).trim();

        if (head.startsWith('ref: refs/heads/')) {
            return head.slice(16);
        }

        return 'DETACHED';
    }

    listBranches() {
        const fs = require('fs');
        const path = require('path');
        const color = require('../utils/color');

        const current = this.getBranchName();
        const headsPath = path.join(
            this.vcsDir,
            'refs',
            'heads' 
        );

        for (const file of fs.readdirSync(headsPath)) {
            const mark = file === current ? '*' : ' ';
            const name = file === current 
                ? color.green(file) 
                : file;

            console.log(`${mark} ${name}`);
        }
    }

    createBranch(name) {
        const fs = require('fs');
        const path = require('path');

        const branchPath = path.join(
            this.vcsDir,
            'refs',
            'heads',
            name
        );

        if (fs.existsSync(branchPath)) {
            throw new Error('Branch already exists');
        }

        const head = this.getHead();
        if (!head) {
            throw new Error('No commits yet');
        }

        fs.writeFileSync(branchPath, head + '\n');
    }

    deleteBranch(name) {
        const fs = require('fs');
        const path = require('path');

        const current = this.getBranchName();
        if (name === current) {
            throw new Error('Cannot delete current branch');
        }

        const branchPath = path.join(
            this.vcsDir,
            'refs',
            'heads',
            name
        );

        if (!fs.existsSync(branchPath)) {
            throw new Error('Branch not found');
        }

        fs.unlinkSync(branchPath);
    }
}

module.exports = Repository; 