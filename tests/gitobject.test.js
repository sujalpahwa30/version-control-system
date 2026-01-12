const GitObject = require('../src/objects/GitObject');
const fs = require('fs');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

(() => {
    const content = Buffer.from('hello world\n');
    const obj = new GitObject('blob', content);

    const hash1 = obj.hash();
    const hash2 = obj.hash();

    assert(hash1 === hash2, 'Hash should be deterministic');
    console.log('Hash determinism test passed.');
})();

(() => {
    const content = Buffer.from('test content');
    const obj = new GitObject('blob', content);

    const serialized = obj.serialize();
    const restored = GitObject.deserialize(serialized);

    assert(restored.type === 'blob', 'Type should match');
    assert(restored.content.equals(content), 'Content should survive round-trip');
    
    console.log('Serialize/Deserialize test passed.');
})();

(() => {
    fs.writeFileSync('tmp.txt', 'hello world\n');

    const content = fs.readFileSync('tmp.txt');
    const obj = new GitObject('blob', content);

    console.log('Computed hash:', obj.hash());
    console.log('Compare with: git hash-object tmp.txt');

    fs.unlinkSync('tmp.txt');
})(); 

