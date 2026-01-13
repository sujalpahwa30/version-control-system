const fs = require('fs');
const path = require('path');

const Repository = require('../src/repo/Repository');
const Blob = require('../src/objects/Blob');

function assert(condition, msg) {
    if (!condition) throw new Error(msg);
}

const testDir = path.join(__dirname, 'tmp-repo');
fs.rmSync(testDir, { recursive: true, force: true });
fs.mkdirSync(testDir);

process.chdir(testDir);

const repo = new Repository(process.cwd());
repo.init();

(() => {
    const content = Buffer.from('hello blob\n');
    const blob = new Blob(content);

    const hash = repo.storeObject(blob);

    const objDir = path.join(
        testDir,
        '.orion',
        'objects',
        hash.slice(0, 2) 
    );

    const objFile = path.join(objDir, hash.slice(2));

    assert(fs.existsSync(objFile), 'Blob file should exist');

    const loaded = repo.loadObject(hash);

    assert(loaded.type === 'blob', 'Loaded object should be blob');
    assert(
        loaded.content.equals(content),
        'Loaded content should match original'
    );

    console.log('Blob storage test passed.');
})(); 