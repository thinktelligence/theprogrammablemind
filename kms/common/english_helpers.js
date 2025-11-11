function conjugateVerb(infinitive) {
  // Validate
  if (typeof infinitive !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Normalise input – remove optional leading "to " and trim
  const baseVerb = infinitive.replace(/^to\s+/i, '').trim().toLowerCase();

  // Validate
  if (!baseVerb) {
    throw new Error('Input must be a non-empty string');
  }

  // Result container
  const conjugations = [];

  // Infinitive form – **without** "to"
  conjugations.push({ word: baseVerb, number: 'none', person: 'none', tense: 'infinitive' });

  // Irregular present-tense forms
  const irregulars = {
    be: {
      singular: { first: 'am', second: 'are', third: 'is' },
      plural:   { first: 'are', second: 'are', third: 'are' }
    },
    have: {
      singular: { first: 'have', second: 'have', third: 'has' },
      plural:   { first: 'have', second: 'have', third: 'have' }
    },
    do: {
      singular: { first: 'do', second: 'do', third: 'does' },
      plural:   { first: 'do', second: 'do', third: 'do' }
    },
    go: {
      singular: { first: 'go', second: 'go', third: 'goes' },
      plural:   { first: 'go', second: 'go', third: 'go' }
    },
    say: {
      singular: { first: 'say', second: 'say', third: 'says' },
      plural:   { first: 'say', second: 'say', third: 'say' }
    }
  };

  // Regular present-tense helper
  function conjugateRegular(verb, number, person) {
    if (number === 'singular' && person === 'third') {
      if (/[sxz]$/.test(verb))                     return verb + 'es';               // box → boxes
      if (/[^aeiou]y$/.test(verb))                 return verb.slice(0, -1) + 'ies'; // fly → flies
      if (/o$/.test(verb))                         return verb + 'es';               // go → goes (fallback)
      if (/[cs]h$/.test(verb))                     return verb + 'es';               // watch → watches
      return verb + 's';                                                            // walk → walks
    }
    return verb;
  }

  const numbers = ['singular', 'plural'];
  const persons = ['first', 'second', 'third'];

  // ----- Conjugation -----
  if (irregulars[baseVerb]) {
    const map = irregulars[baseVerb];
    for (const n of numbers) {
      for (const p of persons) {
        conjugations.push({ word: map[n][p], number: n, person: p, tense: 'present' });
      }
    }
  } else {
    for (const n of numbers) {
      for (const p of persons) {
        const word = conjugateRegular(baseVerb, n, p);
        conjugations.push({ word, number: n, person: p, tense: 'present' });
      }
    }
  }

  return conjugations;
}

function getInfinitive(conjugated) {
  const word = conjugated.trim().toLowerCase();
  if (!word) throw new Error('Input must be a non-empty string');

  // Special cases: irregular 3rd-person singular forms
  const irregularMap = {
    'is':   'be',
    'has':  'have',
    'does': 'do',
    'goes': 'go',
    'says': 'say',
    'am':   'be',
    'are':  'be'
  };

  if (irregularMap[word]) {
    return irregularMap[word];
  }

  // For regular verbs: undo the -s / -es / -ies endings
  if (word.endsWith('ies') && word.length > 3) {
    // flies → fly
    return word.slice(0, -3) + 'y';
  }

  if (word.endsWith('es') && word.length > 3) {
    const stem = word.slice(0, -2);
    // boxes → box, watches → watch, goes → go
    if (/[sxz]$/.test(stem) || /[cs]h$/.test(stem) || stem.endsWith('o')) {
      return stem;
    }
  }

  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 1) {
    // moves → move, walks → walk
    return word.slice(0, -1);
  }

  // If no suffix removed, return as-is (base form or unknown)
  return word;
}

module.exports = { 
  conjugateVerb,
  getInfinitive,
}

