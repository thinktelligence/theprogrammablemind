function wordPlusInflectedWord(choice) {
  const inflected_word = choice.word
  const word = inflected_word.normalize('NFKD').replace(/[^\x00-\x7F]/g, '');
  choice.inflected_word = inflected_word
  choice.word = word
  return choice
}

function getDeclensions(nominative, genitive = null) {
  // Normalize input
  nominative = nominative.toLowerCase().trim();
  genitive = genitive ? genitive.toLowerCase().trim() : null;

  // Regular expressions for declension identification
  const firstDeclension = /a$/;
  const secondDeclensionUs = /us$/;
  const secondDeclensionEr = /er$/;
  const secondDeclensionUm = /um$/;
  const fourthDeclensionUs = /us$/; // Needs context (genitive)
  const fourthDeclensionU = /u$/;
  const fifthDeclension = /es$/;

  // Irregular nouns
  const irregularNouns = {
    vis: {
      declension: "3rd-i",
      forms: [
        { declension: "nominative", number: "singular", ending: "vis", word: "vis" },
        { declension: "genitive", number: "singular", ending: "vis", word: "vis" },
        { declension: "dative", number: "singular", ending: "vi", word: "vi" },
        { declension: "accusative", number: "singular", ending: "vim", word: "vim" },
        { declension: "ablative", number: "singular", ending: "vi", word: "vi" },
        { declension: "nominative", number: "plural", ending: "vires", word: "vires" },
        { declension: "genitive", number: "plural", ending: "virium", word: "virium" },
        { declension: "dative", number: "plural", ending: "viribus", word: "viribus" },
        { declension: "accusative", number: "plural", ending: "vires", word: "vires" },
        { declension: "ablative", number: "plural", ending: "viribus", word: "viribus" }
      ].map( wordPlusInflectedWord )
    },
    domus: {
      declension: "4th",
      forms: [
        { declension: "nominative", number: "singular", ending: "domus", word: "domus" },
        { declension: "genitive", number: "singular", ending: "ūs", word: "domūs" },
        { declension: "dative", number: "singular", ending: "uī", word: "domuī" },
        { declension: "accusative", number: "singular", ending: "um", word: "domum" },
        { declension: "ablative", number: "singular", ending: "ō", word: "domō" },
        { declension: "nominative", number: "plural", ending: "ūs", word: "domūs" },
        { declension: "genitive", number: "plural", ending: "uum", word: "domuum" },
        { declension: "dative", number: "plural", ending: "ibus", word: "domibus" },
        { declension: "accusative", number: "plural", ending: "ūs", word: "domūs" },
        { declension: "ablative", number: "plural", ending: "ibus", word: "domibus" },
        { declension: "vocative", number: "singular", ending: "domus", word: "domus" }
      ].map( wordPlusInflectedWord )
    }
  };

  // Helper to get stem
  function getStem(noun, declension, gen) {
    if (irregularNouns[noun]) return null; // Handled separately
    if (declension === "1st") return noun.slice(0, -1); // Remove -a
    if (declension === "2nd-us") return noun.slice(0, -2); // Remove -us
    if (declension === "2nd-er") {
      const knownErWithE = ["puer", "liber", "vir"];
      return knownErWithE.includes(noun) ? noun : noun.slice(0, -2) + "r"; // Remove -er, add r for ager
    }
    if (declension === "2nd-um") return noun.slice(0, -2); // Remove -um
    if (declension === "4th-us") return noun.slice(0, -2); // Remove -us
    if (declension === "4th-u") return noun.slice(0, -1); // Remove -u only
    if (declension === "5th") return noun.slice(0, -2); // Remove -es
    if (declension === "3rd" || declension === "3rd-i") {
      if (!gen) throw new Error("Genitive required for 3rd declension.");
      return gen.slice(0, -2); // Remove -is from genitive
    }
    return null;
  }

  // Determine declension
  let declension = null;
  let isNeuter = false;
  if (irregularNouns[nominative]) {
    declension = irregularNouns[nominative].declension;
  } else if (firstDeclension.test(nominative)) {
    declension = "1st";
  } else if (secondDeclensionUs.test(nominative)) {
    // Differentiate 2nd vs 4th using genitive if provided
    if (genitive && genitive.endsWith("ūs")) declension = "4th-us";
    else declension = "2nd-us";
  } else if (secondDeclensionEr.test(nominative)) {
    declension = "2nd-er";
  } else if (secondDeclensionUm.test(nominative)) {
    declension = "2nd-um";
    isNeuter = true;
  } else if (fourthDeclensionU.test(nominative)) {
    declension = "4th-u";
    isNeuter = true;
  } else if (fifthDeclension.test(nominative)) {
    declension = "5th";
  } else if (genitive) {
    // Assume 3rd declension if genitive provided and no other match
    const iStemNouns = ["navis", "mare", "animal"];
    declension = iStemNouns.includes(nominative) ? "3rd-i" : "3rd";
    if (nominative === "mare") isNeuter = true;
  } else {
    return [{ declension: "error", number: null, ending: null, word: "Invalid noun or missing genitive for 3rd declension." }];
  }

  // Handle irregular nouns
  if (irregularNouns[nominative]) {
    return irregularNouns[nominative].forms;
  }

  // Get stem
  let stem;
  try {
    stem = getStem(nominative, declension, genitive);
  } catch (e) {
    return [{ declension: "error", number: null, ending: null, word: e.message }];
  }
  if (!stem) return [{ declension: "error", number: null, ending: null, word: "Unable to determine stem." }];

  // Define endings for each declension
  const endings = {
    "1st": {
      nominativeSingular: { ending: "a", number: "singular" },
      genitiveSingular: { ending: "ae", number: "singular" },
      dativeSingular: { ending: "ae", number: "singular" },
      accusativeSingular: { ending: "am", number: "singular" },
      ablativeSingular: { ending: "ā", number: "singular" },
      nominativePlural: { ending: "ae", number: "plural" },
      genitivePlural: { ending: "ārum", number: "plural" },
      dativePlural: { ending: "īs", number: "plural" },
      accusativePlural: { ending: "ās", number: "plural" },
      ablativePlural: { ending: "īs", number: "plural" },
      vocativeSingular: { ending: "a", number: "singular" }
    },
    "2nd-us": {
      nominativeSingular: { ending: "us", number: "singular" },
      genitiveSingular: { ending: "ī", number: "singular" },
      dativeSingular: { ending: "ō", number: "singular" },
      accusativeSingular: { ending: "um", number: "singular" },
      ablativeSingular: { ending: "ō", number: "singular" },
      nominativePlural: { ending: "ī", number: "plural" },
      genitivePlural: { ending: "ōrum", number: "plural" },
      dativePlural: { ending: "īs", number: "plural" },
      accusativePlural: { ending: "ōs", number: "plural" },
      ablativePlural: { ending: "īs", number: "plural" },
      vocativeSingular: { ending: "e", number: "singular" }
    },
    "2nd-er": {
      nominativeSingular: { ending: nominative, number: "singular" },
      genitiveSingular: { ending: "ī", number: "singular" },
      dativeSingular: { ending: "ō", number: "singular" },
      accusativeSingular: { ending: nominative === "puer" || nominative === "liber" || nominative === "ager" ? "um" : "rum", number: "singular" },
      ablativeSingular: { ending: "ō", number: "singular" },
      nominativePlural: { ending: "ī", number: "plural" },
      genitivePlural: { ending: "ōrum", number: "plural" },
      dativePlural: { ending: "īs", number: "plural" },
      accusativePlural: { ending: "ōs", number: "plural" },
      ablativePlural: { ending: "īs", number: "plural" },
      vocativeSingular: { ending: nominative, number: "singular" }
    },
    "2nd-um": {
      nominativeSingular: { ending: "um", number: "singular" },
      genitiveSingular: { ending: "ī", number: "singular" },
      dativeSingular: { ending: "ō", number: "singular" },
      accusativeSingular: { ending: "um", number: "singular" },
      ablativeSingular: { ending: "ō", number: "singular" },
      nominativePlural: { ending: "a", number: "plural" },
      genitivePlural: { ending: "ōrum", number: "plural" },
      dativePlural: { ending: "īs", number: "plural" },
      accusativePlural: { ending: "a", number: "plural" },
      ablativePlural: { ending: "īs", number: "plural" },
      vocativeSingular: { ending: "um", number: "singular" }
    },
    "3rd": {
      nominativeSingular: { ending: nominative, number: "singular" },
      genitiveSingular: { ending: "is", number: "singular" },
      dativeSingular: { ending: "ī", number: "singular" },
      accusativeSingular: { ending: isNeuter ? nominative : "em", number: "singular" },
      ablativeSingular: { ending: "e", number: "singular" },
      nominativePlural: { ending: isNeuter ? "a" : "ēs", number: "plural" },
      genitivePlural: { ending: "um", number: "plural" },
      dativePlural: { ending: "ibus", number: "plural" },
      accusativePlural: { ending: isNeuter ? "a" : "ēs", number: "plural" },
      ablativePlural: { ending: "ibus", number: "plural" },
      vocativeSingular: { ending: nominative, number: "singular" }
    },
    "3rd-i": {
      nominativeSingular: { ending: nominative, number: "singular" },
      genitiveSingular: { ending: "is", number: "singular" },
      dativeSingular: { ending: "ī", number: "singular" },
      accusativeSingular: { ending: isNeuter ? nominative : "em", number: "singular" },
      ablativeSingular: { ending: isNeuter ? "ī" : "e", number: "singular" },
      nominativePlural: { ending: isNeuter ? "ia" : "ēs", number: "plural" },
      genitivePlural: { ending: "ium", number: "plural" },
      dativePlural: { ending: "ibus", number: "plural" },
      accusativePlural: { ending: isNeuter ? "ia" : "ēs", number: "plural" },
      ablativePlural: { ending: "ibus", number: "plural" },
      vocativeSingular: { ending: nominative, number: "singular" }
    },
    "4th-us": {
      nominativeSingular: { ending: "us", number: "singular" },
      genitiveSingular: { ending: "ūs", number: "singular" },
      dativeSingular: { ending: "uī", number: "singular" },
      accusativeSingular: { ending: "um", number: "singular" },
      ablativeSingular: { ending: "ū", number: "singular" },
      nominativePlural: { ending: "ūs", number: "plural" },
      genitivePlural: { ending: "uum", number: "plural" },
      dativePlural: { ending: "ibus", number: "plural" },
      accusativePlural: { ending: "ūs", number: "plural" },
      ablativePlural: { ending: "ibus", number: "plural" },
      vocativeSingular: { ending: "us", number: "singular" }
    },
    "4th-u": {
      nominativeSingular: { ending: "ū", number: "singular" },
      genitiveSingular: { ending: "ūs", number: "singular" },
      dativeSingular: { ending: "ū", number: "singular" },
      accusativeSingular: { ending: "ū", number: "singular" },
      ablativeSingular: { ending: "ū", number: "singular" },
      nominativePlural: { ending: "ua", number: "plural" },
      genitivePlural: { ending: "uum", number: "plural" },
      dativePlural: { ending: "ibus", number: "plural" },
      accusativePlural: { ending: "ua", number: "plural" },
      ablativePlural: { ending: "ibus", number: "plural" },
      vocativeSingular: { ending: "ū", number: "singular" }
    },
    "5th": {
      nominativeSingular: { ending: "ēs", number: "singular" },
      genitiveSingular: { ending: "eī", number: "singular" },
      dativeSingular: { ending: "eī", number: "singular" },
      accusativeSingular: { ending: "em", number: "singular" },
      ablativeSingular: { ending: "ē", number: "singular" },
      nominativePlural: { ending: "ēs", number: "plural" },
      genitivePlural: { ending: "ērum", number: "plural" },
      dativePlural: { ending: "ēbus", number: "plural" },
      accusativePlural: { ending: "ēs", number: "plural" },
      ablativePlural: { ending: "ēbus", number: "plural" },
      vocativeSingular: { ending: "ēs", number: "singular" }
    }
  };

  // Generate forms
  const forms = [];
  for (const caseName in endings[declension]) {
    const [caseType, number] = caseName.match(/([a-zA-Z]+)(Singular|Plural)/).slice(1);
    const ending = endings[declension][caseName].ending;
    const word = ending === nominative ? nominative : stem + ending;
    forms.push(wordPlusInflectedWord({
      declension: caseType.toLowerCase(),
      number: number.toLowerCase(),
      ending,
      word,
    }));
  }

  return forms;
}

module.exports = { getDeclensions };
