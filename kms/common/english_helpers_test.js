const { conjugateVerb, getInfinitive } = require('./english_helpers');

describe('conjugateVerb', () => {
  describe('Regular verbs', () => {
    test('walk - full conjugation including past and participles', () => {
      const result = conjugateVerb('walk');

      // Infinitive
      expect(result).toContainEqual({
        form: 'infinitive',
        word: 'walk',
        tense: 'infinitive',
        aspect: null,
        number: 'none',
        person: 'none'
      });

      // Present tense
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'walk', tense: 'present', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'walks', tense: 'present', number: 'singular', person: 'third' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'walk', tense: 'present', number: 'plural',   person: 'third' });

      // Past tense (simple past - same for all persons/numbers in regular verbs)
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'walked', tense: 'past', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'walked', tense: 'past', number: 'plural',   person: 'third' });

      // Past participle
      expect(result).toContainEqual({ form: 'pastParticiple', word: 'walked', tense: 'perfect', aspect: 'perfect', number: 'none', person: 'none' });

      // Present participle
      expect(result).toContainEqual({ form: 'presentParticiple', word: 'walking', tense: 'progressive', aspect: 'continuous', number: 'none', person: 'none' });

      // Total count: 1 inf + 6 present + 6 past + 1 pastPart + 1 presPart = 15
      expect(result.length).toBe(15);
    });

    test('make - made', () => {
      const result = conjugateVerb('make');
      console.log(JSON.stringify(result, null, 2))
      expect(result).toContainEqual({ "form": "pastParticiple", "word": "made", "tense": "perfect", "aspect": "perfect", "number": "none", "person": "none" })
      expect(result).toContainEqual({ "form": "presentParticiple", "word": "making", "tense": "progressive", "aspect": "continuous", "number": "none", "person": "none" })
    });

    test('study - handles consonant + y → ied / ying', () => {
      const result = conjugateVerb('study');
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'studies', tense: 'present', number: 'singular', person: 'third' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'studied', tense: 'past',    number: 'singular', person: 'first' });
      expect(result).toContainEqual({ "form": "pastParticiple", "word": "studied", "tense": "perfect", "aspect": "perfect", "number": "none", "person": "none" })
      expect(result).toContainEqual({ "form": "presentParticiple", "word": "studying", "tense": "progressive", "aspect": "continuous", "number": "none", "person": "none" })
    });

    test('stop - doubles consonant in past/pastParticiple and -ing', () => {
      const result = conjugateVerb('stop');
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'stopped', tense: 'past', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ "form": "presentParticiple", "word": "stopping", "tense": "progressive", "aspect": "continuous", "number": "none", "person": "none" })
      expect(result).toContainEqual({ "form": "pastParticiple", "word": "stopped", "tense": "perfect", "aspect": "perfect", "number": "none", "person": "none" })
    });
  });

  describe('Irregular verbs', () => {
    test('be - highly irregular', () => {
      const result = conjugateVerb('be');

      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'am',   tense: 'present', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'is',   tense: 'present', number: 'singular', person: 'third' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'are',  tense: 'present', number: 'plural',   person: 'first' });

      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'was',  tense: 'past', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'were', tense: 'past', number: 'plural',   person: 'second' });

      expect(result).toContainEqual({ "form": "pastParticiple", "word": "been", "tense": "perfect", "aspect": "perfect", "number": "none", "person": "none" })
      expect(result).toContainEqual({ "form": "presentParticiple", "word": "being", "tense": "progressive", "aspect": "continuous", "number": "none", "person": "none" })
    });

    test('go - past and past participle differ', () => {
      const result = conjugateVerb('go');

      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'go',    tense: 'present', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'goes',  tense: 'present', number: 'singular', person: 'third' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'went',  tense: 'past',    number: 'singular', person: 'first' });

      expect(result).toContainEqual({ "form": "pastParticiple", "word": "gone", "tense": "perfect", "aspect": "perfect", "number": "none", "person": "none" })
      expect(result).toContainEqual({ "form": "presentParticiple", "word": "going", "tense": "progressive", "aspect": "continuous", "number": "none", "person": "none" })
    });

    test('have', () => {
      const result = conjugateVerb('have');
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'has', tense: 'present', number: 'singular', person: 'third' });
      expect(result).toContainEqual({ form: 'finite', aspect: 'simple', word: 'had', tense: 'past', number: 'singular', person: 'first' });
      expect(result).toContainEqual({ "form": "pastParticiple", "word": "had", "tense": "perfect", "aspect": "perfect", "number": "none", "person": "none" });
    });
  });

  describe('Input handling', () => {
    test('strips "to " prefix and trims', () => {
      const result = conjugateVerb('  to   walk  ');
      expect(result).toContainEqual({ "form": "infinitive", "word": "to   walk", "tense": "infinitive", "aspect": null, "number": "none", "person": "none" })
    });

    test('throws on invalid input', () => {
      expect(() => conjugateVerb('')).toThrow('non-empty string');
      expect(() => conjugateVerb(123)).toThrow('non-empty string');
      expect(() => conjugateVerb(null)).toThrow();
    });
  });
});

describe('getInfinitive', () => {
  describe('Past tense and past participle recognition', () => {
    test('regular past/past participle → infinitive', () => {
      expect(getInfinitive('walked')).toBe('walk');
      expect(getInfinitive('stopped')).toBe('stop');
      expect(getInfinitive('studied')).toBe('study');
      expect(getInfinitive('played')).toBe('play');
      expect(getInfinitive('liked')).toBe('like');
    });

    test('irregular past/past participle', () => {
      expect(getInfinitive('went')).toBe('go');
      expect(getInfinitive('gone')).toBe('go');
      expect(getInfinitive('was')).toBe('be');
      expect(getInfinitive('were')).toBe('be');
      expect(getInfinitive('been')).toBe('be');
      expect(getInfinitive('had')).toBe('have');
      expect(getInfinitive('did')).toBe('do');
      expect(getInfinitive('done')).toBe('do');
      expect(getInfinitive('said')).toBe('say');
    });
  });

  describe('-ing form → infinitive (best effort)', () => {
    test('basic cases', () => {
      expect(getInfinitive('walking')).toBe('walk');
      expect(getInfinitive('running')).toBe('run');
      expect(getInfinitive('lying')).toBe('lie');
      expect(getInfinitive('dying')).toBe('die');
      expect(getInfinitive('being')).toBe('be'); // from irregular map
    });
  });

  describe('Existing present tense tests (still valid)', () => {
    test('regular -s / -es / -ies', () => {
      expect(getInfinitive('moves')).toBe('move');
      expect(getInfinitive('watches')).toBe('watch');
      expect(getInfinitive('flies')).toBe('fly');
    });

    test('irregular present forms', () => {
      expect(getInfinitive('is')).toBe('be');
      expect(getInfinitive('has')).toBe('have');
      expect(getInfinitive('does')).toBe('do');
    });
  });

  test('case-insensitive and trims', () => {
    expect(getInfinitive('  GONE  ')).toBe('go');
    expect(getInfinitive('WALKED')).toBe('walk');
    expect(getInfinitive('bEeN')).toBe('be');
  });

  test('returns unknown words unchanged', () => {
    expect(getInfinitive('quantum')).toBe('quantum');
    expect(getInfinitive('kiss')).toBe('kiss'); // -ss not stripped
  });
});
