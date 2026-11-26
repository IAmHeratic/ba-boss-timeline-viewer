// Loads the real engine out of index.html so the tests exercise the code that ships, not a copy.
// It takes the inline script from "const FPS" up to "function render(){" (everything that is pure logic, no DOM) and runs it with
// the data files and a tiny localStorage stub.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

function load() {
  const html = read('index.html');
  const a = html.indexOf('const FPS = 30');
  const b = html.indexOf('function render0(){');
  if (a < 0 || b < 0) throw new Error('could not find the engine section of index.html');
  const engine = html.slice(a, b);
  const body = `
    const localStorage = {getItem(){return null;}, setItem(){}};
    const document = {querySelector(){ return {value:'100'}; }};
    ${read('data.js')}
    ${read('bosses.js')}
    ${read('rotations.js')}
    ${engine}
    return {SCHALE, BOSSES, state, team, tset, ueOf, capOf, levelOf, regenInfo, regenWindows, regenAdv, resolve, simBasics, costModel, costAt,
            castsExcept, slotFloor, castable, chainKids, placeByCost, rowOrder, opSetTime, opClearTime, opNudgeTime, opToggleChain, opSetWho, opRemove, opLock, opStepCost, stepWant, opInsert, opAddCast, timed, ownBusy, animDur, ENTITY, aimableEnts, insideIds, relicHeals, entLife, healsRelic, winCache, aimsAtEnemy, allyTargetable, entKills, timeForCost, castWindows, allWindows, targetsAlly, dropCarry, CRED, TIMED_REGEN, PERM_REGEN, SEQ, cid, setSpend, setForm, spendOf, formIdx, baseCost, exLv, MODEL_V, timed, overOnFor, firstAffordable, applyChains, allResolved, bossOf, bossDiff, buffLabel, shortName, OUTFIT, FPS,
            clock: () => ({TOTAL, BATTLE0, COST0}),
            setTotal: v => { TOTAL = +v; BATTLE0 = TOTAL - 0.4; COST0 = TOTAL - 1.98; }};`;
  return new Function(body)();
}
module.exports = { load, root, read };
