import test from 'node:test';
import assert from 'node:assert/strict';
import '../core.js';
const n = globalThis.Numerology;
test('component method preserves master numbers and makes its convention explicit', () => {
  assert.equal(n.lifePath({ year: 1990, month: 7, day: 18 }).number, 8);
  assert.equal(n.lifePath({ year: 1990, month: 2, day: 8 }).number, 11);
  assert.equal(n.lifePath({ year: 1980, month: 2, day: 11 }).number, 22);
  assert.equal(n.lifePath({ year: 1982, month: 9, day: 22 }).number, 33);
  assert.equal(n.lifePath({ year: 1980, month: 2, day: 11 }).base, 4);
  assert.equal(n.reduce(38), 11);
  assert.equal(n.reduce(38, false), 2);
});
test('real calendar validation rejects overflow dates and future births', () => {
  assert.doesNotThrow(() => n.lifePath({ year: 2000, month: 2, day: 29 }));
  for (const date of [{year:1900,month:2,day:29},{year:2024,month:4,day:31},{year:9999,month:1,day:1},{year:2000,month:0,day:1},{year:'',month:1,day:1}]) assert.throws(() => n.lifePath(date));
});
test('calendar-year convention uses single digits including leap birthdays', () => {
  assert.equal(n.personalYear({month:7,day:18,year:2026}).number, 8);
  assert.equal(n.personalYear({month:2,day:29,year:2025}).number, 4);
  assert.throws(() => n.personalYear({month:2,day:30,year:2026}));
  assert.throws(() => n.personalYear({month:1,day:1,year:'2026x'}));
});
test('Pythagorean name values, punctuation, accents and unsupported characters', () => {
  assert.equal(n.nameNumber('Jane Doe').sum, 27);
  assert.equal(n.nameNumber('Jane Doe').number, 9);
  assert.equal(n.nameNumber('K').number, 2);
  assert.equal(n.nameNumber('David').number, 22);
  assert.equal(n.nameNumber('José').letters, 'JOSE');
  assert.equal(n.nameNumber('Zoë O’Neil').letters, 'ZOEONEIL');
  assert.equal(n.nameNumber('Ægir').letters, 'AEGIR');
  for (const name of ['', '---', 'Jane123', '<script>', '李明', 'a'.repeat(101)]) assert.throws(() => n.nameNumber(name));
});
test('compatibility is symmetric and retains both master and root numbers', () => {
  const a={year:1980,month:2,day:11},b={year:1990,month:7,day:18};
  const ab=n.compatibility(a,b),ba=n.compatibility(b,a);
  assert.deepEqual(ab.first,ba.second);
  assert.deepEqual(ab.second,ba.first);
  assert.equal(ab.first.number,22);
  assert.equal(ab.first.base,4);
});
