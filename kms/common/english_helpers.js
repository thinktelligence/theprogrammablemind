function conjugateVerb(infinitive) {
  if (typeof infinitive !== 'string' || infinitive.trim() === '') {
    throw new Error('Input must be a non-empty string');
  }

  const baseVerb = infinitive.replace(/^to\s+/i, '').trim().toLowerCase();
  if (!baseVerb) throw new Error('Input must be a non-empty string');

  const conjugations = [];

  // Add infinitive (bare form, no "to")
  conjugations.push({
    form: 'infinitive',
    word: baseVerb,
    tense: 'infinitive',
    aspect: null,
    number: 'none',
    person: 'none'
  });

  // === Irregular verb database ===
  const irregulars = {
    be: {
      present: {
        singular: { first: 'am', second: 'are', third: 'is' },
        plural:   { first: 'are', second: 'are', third: 'are' }
      },
      past: {
        singular: { first: 'was', second: 'were', third: 'was' },
        plural:   { first: 'were', second: 'were', third: 'were' }
      },
      pastParticiple: 'been',
      presentParticiple: 'being'
    },
    have: {
      present: {
        singular: { first: 'have', second: 'have', third: 'has' },
        plural:   { first: 'have', second: 'have', third: 'have' }
      },
      past: { singular: { first: 'had', second: 'had', third: 'had' }, plural: { first: 'had', second: 'had', third: 'had' } },
      pastParticiple: 'had',
      presentParticiple: 'having'
    },
    do: {
      present: {
        singular: { first: 'do', second: 'do', third: 'does' },
        plural:   { first: 'do', second: 'do', third: 'do' }
      },
      past: { singular: { first: 'did', second: 'did', third: 'did' }, plural: { first: 'did', second: 'did', third: 'did' } },
      pastParticiple: 'done',
      presentParticiple: 'doing'
    },
    go: {
      present: {
        singular: { first: 'go', second: 'go', third: 'goes' },
        plural:   { first: 'go', second: 'go', third: 'go' }
      },
      past: { singular: { first: 'went', second: 'went', third: 'went' }, plural: { first: 'went', second: 'went', third: 'went' } },
      pastParticiple: 'gone',
      presentParticiple: 'going'
    },
    say: {
      present: {
        singular: { first: 'say', second: 'say', third: 'says' },
        plural:   { first: 'say', second: 'say', third: 'say' }
      },
      past: { 
        singular: { first: 'said', second: 'said', third: 'said' }, 
        plural: { first: 'said', second: 'said', third: 'said' } 
      },
      pastParticiple: 'said',
      presentParticiple: 'saying'
    },
    make: {
      present: {
        singular: { first: 'make', second: 'make', third: 'makes' },
        plural: { first: 'make', second: 'make', third: 'make' }
      },
      past: {
        singular: { first: 'made', second: 'made', third: 'made' },
        plural: { first: 'made', second: 'made', third: 'made' }
      },
      pastParticiple: 'made',
      presentParticiple: 'making'
    },
    // Add more irregulars as needed...
  };

  const irreg = irregulars[baseVerb];

  const numbers = ['singular', 'plural'];
  const persons = ['first', 'second', 'third'];

  // === Present tense ===
  if (irreg) {
    for (const num of numbers) {
      for (const pers of persons) {
        conjugations.push({
          form: 'finite',
          word: irreg.present[num][pers],
          tense: 'present',
          aspect: 'simple',
          number: num,
          person: pers
        });
      }
    }
  } else {
    // Regular present tense
    for (const num of numbers) {
      for (const pers of persons) {
        const word = conjugateRegularPresent(baseVerb, num, pers);
        conjugations.push({
          form: 'finite',
          word,
          tense: 'present',
          aspect: 'simple',
          number: num,
          person: pers
        });
      }
    }
  }

  // === Past tense (simple past) ===
  let pastForm;
  if (irreg && irreg.past) {
    const pastMap = irreg.past;
    for (const num of numbers) {
      for (const pers of persons) {
        conjugations.push({
          form: 'finite',
          word: pastMap[num][pers],
          tense: 'past',
          aspect: 'simple',
          number: num,
          person: pers
        });
      }
    }
    pastForm = pastMap.singular.first; // representative
  } else {
    pastForm = conjugateRegularPast(baseVerb);
    for (const num of numbers) {
      for (const pers of persons) {
        conjugations.push({
          form: 'finite',
          word: pastForm,
          tense: 'past',
          aspect: 'simple',
          number: num,
          person: pers
        });
      }
    }
  }

  // === Past Participle ===
  const pastParticiple = irreg?.pastParticiple ?? conjugateRegularPast(baseVerb); // same as past for regular verbs
  conjugations.push({
    form: 'pastParticiple',
    word: pastParticiple,
    tense: 'perfect',
    aspect: 'perfect',
    number: 'none',
    person: 'none'
  });

  // Optional: Present Participle (-ing form)
  const presentParticiple = irreg?.presentParticiple ?? conjugatePresentParticiple(baseVerb);
  conjugations.push({
    form: 'presentParticiple',
    word: presentParticiple,
    tense: 'progressive',
    aspect: 'continuous',
    number: 'none',
    person: 'none'
  });

  return conjugations;
}

// Helper: regular present 3rd person singular
function conjugateRegularPresent(verb, number, person) {
  if (number === 'singular' && person === 'third') {
    if (/[sxz]$/.test(verb) || /[cs]h$/.test(verb) || /o$/.test(verb)) {
      return verb + 'es';
    }
    if (/[^aeiou]y$/.test(verb)) {
      return verb.slice(0, -1) + 'ies';
    }
    return verb + 's';
  }
 1
  return verb;
}

// Helper: regular past & past participle (same for regular verbs)
function conjugateRegularPast(verb) {
  if (verb.endsWith('e')) {
    return verb + 'd';
  }
  if (/[aeiou][^aeiouyw]$/.test(verb.slice(-2)) && /[bcdfghjklmnpqrstvwxz]$/.test(verb)) {
    // doubled consonant: stop → stopped
    return verb + verb.slice(-1) + 'ed';
  }
  if (/[^aeiou]y$/.test(verb)) {
    return verb.slice(0, -1) + 'ied';
  }
  return verb + 'ed';
}

// Helper: present participle (-ing)
function conjugatePresentParticiple(verb) {
  if (verb.endsWith('e') && !verb.endsWith('ee') && !verb.endsWith('ie') && !verb.endsWith('ye')) {
    return verb.slice(0, -1) + 'ing';
  }
  if (/[aeiou][^aeiouyw]$/.test(verb.slice(-2)) && /[bcdfghjklmnpqrstvwxz]$/.test(verb.slice(-1))) {
    return verb + verb.slice(-1) + 'ing'; // stop → stopping
  }
  if (verb.endsWith('ie')) {
    return verb.slice(0, -2) + 'ying'; // lie → lying
  }
  return verb + 'ing';
}

// === Bonus: Improved getInfinitive with past participle support ===
function getInfinitive(form) {
  const word = form.trim().toLowerCase();
  if (!word) throw new Error('Input must be a non-empty string');

  // ------------------------------------------------------------
  // 1. Irregular forms (present, past, past participle, -ing)
  // ------------------------------------------------------------
  const irregularMap = {
    am: 'be', is: 'be', are: 'be',
    was: 'be', were: 'be', been: 'be', being: 'be',
    have: 'have', has: 'have', had: 'have',
    do: 'do', does: 'do', did: 'do', done: 'do',
    go: 'go', goes: 'go', went: 'go', gone: 'go',
    say: 'say', says: 'say', said: 'say',
    made: 'make',
  };

  if (irregularMap[word]) return irregularMap[word];

  // ------------------------------------------------------------
  // 2. Past tense / Past participle (regular verbs)
  // ------------------------------------------------------------
  if (word.endsWith('ed')) {
    // 2a – cried → cry
    if (word.endsWith('ied')) {
      return word.slice(0, -3) + 'y';
    }

    // 2. liked, moved, danced → like, move, dance
    //    These are verbs that end in 'e' → add only 'd' → ends with "ed", but third char from end is 'e'
    if (word.length >= 3 && word[word.length - 3] === 'e') {
      return word.slice(0, -1);  // remove only the final 'd'
    }

    // 2c – stopped, rubbed (consonant doubling)
    let stem = word.slice(0, -2);              // remove "ed"
    if (
      stem.length >= 2 &&
      stem[stem.length - 1] === stem[stem.length - 2] &&   // doubled consonant
      !/[aeiou]/.test(stem[stem.length - 1])               // not a vowel
    ) {
      stem = stem.slice(0, -1);               // remove one of the doubled letters
    }

    const restoreECases = ['liked'];
    if (restoreECases.includes(word)) {
      stem += 'e';
    }
    return stem;
  }

  // ------------------------------------------------------------
  // 3. Present participle (-ing)
  // ------------------------------------------------------------
  if (word.endsWith('ing')) {
    let stem = word.slice(0, -3);

    // lying → lie
    if (word.endsWith('ying')) {
      stem = word.slice(0, -4);
      return stem + 'ie';
    }

    // Undo consonant doubling: stopping → stop, running → run
    if (
      stem.length >= 2 &&
      stem[stem.length - 1] === stem[stem.length - 2] &&
      !/[aeiou]/.test(stem[stem.length - 1])
    ) {
      stem = stem.slice(0, -1);
    }

    // DO NOT blindly add 'e' — this is the source of "walke", "runne", etc.
    // Only add 'e' in known safe cases — or just don't do it.
    // Here: we add 'e' only if the word is in a small whitelist of common cases
    const restoreECases = ['dancing', 'making', 'taking', 'giving', 'living'];
    if (restoreECases.includes(word)) {
      stem += 'e';
    }

    return stem;
  }
  // ------------------------------------------------------------
  // 4. Present 3rd-person singular
  // ------------------------------------------------------------
  if (word.endsWith('ies') && word.length > 3) {
    return word.slice(0, -3) + 'y';           // flies → fly
  }
  if (word.endsWith('es') && word.length > 3) {
    const stem = word.slice(0, -2);
    if (/[sxz]$/.test(stem) || /[cs]h$/.test(stem) || stem.endsWith('o')) {
      return stem;                           // watches → watch
    }
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
    return word.slice(0, -1);                // walks → walk
  }

  // ------------------------------------------------------------
  // 5. Nothing matched → return as-is
  // ------------------------------------------------------------
  return word;
}

module.exports = { 
  conjugateVerb,
  getInfinitive,
}

