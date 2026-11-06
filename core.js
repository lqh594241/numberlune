/* Numerology conventions, not predictions. No network or persistent storage. */
(function (root) {
  'use strict';
  const masters = [11, 22, 33];
  function digitSum(n) { return String(n).split('').reduce((sum, digit) => sum + Number(digit), 0); }
  function reduce(n, preserveMasters = true) {
    if (!Number.isSafeInteger(n) || n < 0) throw Error('Use a non-negative whole number.');
    while (n > 9 && !(preserveMasters && masters.includes(n))) n = digitSum(n);
    return n;
  }
  function reductionSteps(n, preserveMasters = true) {
    const steps = [n];
    while (n > 9 && !(preserveMasters && masters.includes(n))) { n = digitSum(n); steps.push(n); }
    return steps.join(' → ');
  }
  function integer(value, label, min, max) {
    const raw = String(value).trim();
    if (!/^\d+$/.test(raw)) throw Error(`Enter ${label} as a whole number.`);
    const n = Number(raw);
    if (!Number.isSafeInteger(n) || n < min || n > max) throw Error(`${label} must be between ${min} and ${max}.`);
    return n;
  }
  function birthday(input, today = new Date()) {
    const year = integer(input.year, 'birth year', 1000, 9999);
    const month = integer(input.month, 'birth month', 1, 12);
    const day = integer(input.day, 'birth day', 1, 31);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) throw Error('That date does not exist. Check the month, day and year.');
    const dateKey = year * 10000 + month * 100 + day;
    const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    if (dateKey > todayKey) throw Error('A birth date must be today or earlier.');
    return { year, month, day };
  }
  function lifePath(input) {
    const date = birthday(input);
    const parts = [date.month, date.day, date.year].map(n => reduce(n));
    const sum = parts.reduce((a, b) => a + b, 0);
    const number = reduce(sum);
    return { number, base: reduce(number, false), date, steps: [
      `Month: ${reductionSteps(date.month)}`,
      `Day: ${reductionSteps(date.day)}`,
      `Year: ${reductionSteps(date.year)}`,
      `Together: ${parts.join(' + ')} = ${reductionSteps(sum)}`
    ] };
  }
  function personalYear(input) {
    const month = integer(input.month, 'birth month', 1, 12);
    const day = integer(input.day, 'birth day', 1, 31);
    // Leap birthdays remain valid in non-leap target years; only month/day matter.
    const check = new Date(Date.UTC(2000, month - 1, day));
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) throw Error('That birthday does not exist. Check the month and day.');
    const year = integer(input.year, 'reading year', 1900, 2199);
    const parts = [month, day, year].map(n => reduce(n, false));
    const sum = parts.reduce((a, b) => a + b, 0);
    const number = reduce(sum, false);
    return { number, year, steps: [
      `Birth month: ${reductionSteps(month, false)}`,
      `Birth day: ${reductionSteps(day, false)}`,
      `Reading year: ${reductionSteps(year, false)}`,
      `Together: ${parts.join(' + ')} = ${reductionSteps(sum, false)}`
    ] };
  }
  function nameNumber(value) {
    const original = String(value).trim();
    if (!original || original.length > 100) throw Error('Enter a name between 1 and 100 characters.');
    const replacements = { 'Æ':'AE', 'Œ':'OE', 'Ø':'O', 'Ł':'L', 'Ð':'D', 'Đ':'D', 'Þ':'TH', 'ẞ':'SS' };
    const normalized = original.toUpperCase().replace(/[ÆŒØŁÐĐÞẞ]/g, c => replacements[c]).normalize('NFD').replace(/\p{M}/gu, '');
    if (/[^A-Z\s.'’\-‐‑–]/.test(normalized)) throw Error('Use A–Z letters, spaces, apostrophes or hyphens. Transliterate other writing systems into Latin letters first.');
    const letters = normalized.replace(/[^A-Z]/g, '');
    if (!letters.length) throw Error('Enter at least one A–Z letter.');
    const values = [...letters].map(c => (c.charCodeAt(0) - 65) % 9 + 1);
    const sum = values.reduce((a, b) => a + b, 0);
    const number = reduce(sum);
    return { number, base: reduce(number, false), letters, values, sum, steps: [
      `Letters used: ${letters}`,
      `Letter values: ${values.join(' + ')} = ${sum}`,
      `Reduce the total: ${reductionSteps(sum)}`
    ] };
  }
  function compatibility(first, second) { return { first: lifePath(first), second: lifePath(second) }; }
  root.Numerology = { reduce, reductionSteps, birthday, lifePath, personalYear, nameNumber, compatibility };
})(globalThis);
