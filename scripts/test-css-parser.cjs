const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const parser = require('postcss-selector-parser');
test('flat hostile selector parses within a bounded child process', () => {
  const script = `const p=require('postcss-selector-parser');const s='.a'.repeat(200000);if(p().processSync(s)!==s)process.exit(1)`;
  execFileSync(process.execPath, ['-e', script], {cwd:require('node:path').resolve(__dirname,'..'),timeout:5000});
});
test('IDs, escaped names, nested pseudos and quoted attributes retain their spelling', () => {
  for (const selector of ['#a'.repeat(10000), '.a\\:b:hover > [data-x="a&b"]', ':is(.a, #b):not([x="a,b"])']) {
    assert.equal(parser().processSync(selector), selector);
  }
});
