// Runs every check. Usage: node tests/run_all.js <students.min.json>   (download: https://schaledb.com/data/en/students.min.json)
const { spawnSync } = require('child_process'), vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let bad = 0;
// 0. every inline script in index.html parses
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m, i) => {
  try { new vm.Script(m[1]); console.log(`syntax: inline script ${i + 1} ok`); } catch (e) { bad++; console.log(`syntax: inline script ${i + 1} BROKEN: ${e.message}`); }
});
const run = (name, args, env = {}, gating = true) => {
  console.log(`\n##### ${name}`);
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: root, env: { ...process.env, ...env } });
  if (r.status && gating) { bad++; console.log(`>>> ${name} exited with ${r.status}`); }
};
if (process.argv[2]) run('student audit', ['tests/audit_students.js', process.argv[2], '--icons']);
else console.log('\n(student audit skipped: pass the students.min.json path)');
run('scenarios', ['tests/scenarios.js']);
run('boss audit', ['tests/audit_bosses.js', '--icons']);
run('stress: hand-set times, cost overrides, odd targets, settled once (information only, not gating)', ['tests/invariants.js', '300', '1'], {}, false);
[1, 2, 3, 4].forEach(sd => run(`invariants on planned rotations, seed ${sd}`, ['tests/invariants.js', '300', String(sd)], { PURE: '1' }));
console.log(bad ? `\n${bad} check group(s) reported failures` : '\nALL GREEN');
process.exit(bad ? 1 : 0);
