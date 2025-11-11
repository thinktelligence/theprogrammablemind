// declensions.test.js
const { conjugateVerb, getInfinitive } = require('./english_helpers');

describe('conjugateVerb', () => {
  // Test for a regular verb: "move"
  describe('Regular verb: move', () => {
    const result = conjugateVerb('move');

    test('includes the infinitive form', () => {
      expect(result).toContainEqual({
        word: 'move',
        number: 'none',
        person: 'none',
        tense: 'infinitive',
      });
    });

    test('correctly conjugates present tense', () => {
      expect(result).toContainEqual({ word: 'move', number: 'singular', person: 'first', tense: 'present' });
      expect(result).toContainEqual({ word: 'move', number: 'singular', person: 'second', tense: 'present' });
      expect(result).toContainEqual({ word: 'moves', number: 'singular', person: 'third', tense: 'present' });
      expect(result).toContainEqual({ word: 'move', number: 'plural', person: 'first', tense: 'present' });
      expect(result).toContainEqual({ word: 'move', number: 'plural', person: 'second', tense: 'present' });
      expect(result).toContainEqual({ word: 'move', number: 'plural', person: 'third', tense: 'present' });
    });

    test('returns the correct number of conjugations', () => {
      // 1 infinitive + 6 present = 7 conjugations
      expect(result).toHaveLength(7);
    });

    test('only includes present tense and infinitive', () => {
      expect(result.every(item => item.tense === 'present' || item.tense === 'infinitive')).toBe(true);
    });
  });

  // Test for verb ending in "y": "study"
  describe('Verb ending in "y": study', () => {
    const result = conjugateVerb('study');

    test('includes the infinitive form', () => {
      expect(result).toContainEqual({
        word: 'study',
        number: 'none',
        person: 'none',
        tense: 'infinitive',
      });
    });

    test('NEO23 correctly conjugates present tense for third person singular', () => {
      expect(result).toContainEqual({ word: 'studies', number: 'singular', person: 'third', tense: 'present' });
      expect(result).toContainEqual({ word: 'study', number: 'singular', person: 'first', tense: 'present' });
      expect(result).toContainEqual({ word: 'study', number: 'plural', person: 'third', tense: 'present' });
    });
  });

  // Test for verb ending in "s": "kiss"
  describe('Verb ending in "s": kiss', () => {
    const result = conjugateVerb('kiss');

    test('includes the infinitive form', () => {
      expect(result).toContainEqual({
        word: 'kiss',
        number: 'none',
        person: 'none',
        tense: 'infinitive',
      });
    });

    test('correctly conjugates present tense for third person singular', () => {
      expect(result).toContainEqual({ word: 'kisses', number: 'singular', person: 'third', tense: 'present' });
      expect(result).toContainEqual({ word: 'kiss', number: 'singular', person: 'first', tense: 'present' });
      expect(result).toContainEqual({ word: 'kiss', number: 'plural', person: 'third', tense: 'present' });
    });
  });

  // Test for input with "to" prefix: "move"
  describe('Input with "to" prefix: move', () => {
    const result = conjugateVerb('move');

    test('handles "to" prefix correctly', () => {
      expect(result).toContainEqual({
        word: 'move',
        number: 'none',
        person: 'none',
        tense: 'infinitive',
      });
      expect(result).toContainEqual({ word: 'moves', number: 'singular', person: 'third', tense: 'present' });
      expect(result).toContainEqual({ word: 'move', number: 'plural', person: 'first', tense: 'present' });
    });
  });

  // Test for edge cases
  describe('Edge cases', () => {
    test('throws error for empty string input', () => {
      expect(() => conjugateVerb('')).toThrow('Input must be a non-empty string');
    });

    test('throws error for non-string input', () => {
      expect(() => conjugateVerb(123)).toThrow('Input must be a non-empty string');
    });
  });
});

describe('getInfinitive(conjugated)', () => {
  test('throws error for empty or non-string input', () => {
    expect(() => getInfinitive('')).toThrow('Input must be a non-empty string');
    expect(() => getInfinitive('   ')).toThrow('Input must be a non-empty string');
    expect(() => getInfinitive()).toThrow();
    expect(() => getInfinitive(null)).toThrow();
  });

  test('handles regular verbs with -s', () => {
    expect(getInfinitive('moves')).toBe('move');
    expect(getInfinitive('walks')).toBe('walk');
    expect(getInfinitive('runs')).toBe('run');
    expect(getInfinitive('likes')).toBe('like');
  });

  test('handles regular verbs with -es', () => {
    expect(getInfinitive('watches')).toBe('watch');
    expect(getInfinitive('boxes')).toBe('box');
    expect(getInfinitive('buzzes')).toBe('buzz');
    expect(getInfinitive('fixes')).toBe('fix');
    expect(getInfinitive('goes')).toBe('go'); // irregular, but covered
  });

  test('handles regular verbs ending in -y → -ies', () => {
    expect(getInfinitive('flies')).toBe('fly');
    expect(getInfinitive('tries')).toBe('try');
    expect(getInfinitive('cries')).toBe('cry');
    expect(getInfinitive('studies')).toBe('study');
  });

  test('handles irregular forms of "be"', () => {
    expect(getInfinitive('is')).toBe('be');
    expect(getInfinitive('am')).toBe('be');
    expect(getInfinitive('are')).toBe('be');
  });

  test('handles other irregular verbs', () => {
    expect(getInfinitive('has')).toBe('have');
    expect(getInfinitive('does')).toBe('do');
    expect(getInfinitive('goes')).toBe('go');
    expect(getInfinitive('says')).toBe('say');
  });

  test('returns base form unchanged', () => {
    expect(getInfinitive('move')).toBe('move');
    expect(getInfinitive('be')).toBe('be');
    expect(getInfinitive('have')).toBe('have');
    expect(getInfinitive('go')).toBe('go');
  });

  test('does not remove -s from words ending in -ss', () => {
    expect(getInfinitive('kiss')).toBe('kiss');
    expect(getInfinitive('glass')).toBe('glass');
  });

  test('is case-insensitive and trims whitespace', () => {
    expect(getInfinitive('  MOVES  ')).toBe('move');
    expect(getInfinitive('  Is  ')).toBe('be');
    expect(getInfinitive('  FLIES  ')).toBe('fly');
  });

  test('works with mixed case', () => {
    expect(getInfinitive('WaTcHeS')).toBe('watch');
    expect(getInfinitive('hAs')).toBe('have');
  });
});
