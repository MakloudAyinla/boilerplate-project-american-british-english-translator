const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

class Translator {
  constructor() {
    this.americanOnly = americanOnly;
    this.americanToBritishSpelling = americanToBritishSpelling;
    this.americanToBritishTitles = americanToBritishTitles;
    this.britishOnly = britishOnly;
  }

  translate(text, locale) {
    // Keep original text for comparison
    let translated = text;

    // Choose dictionaries based on translation direction
    if (locale === "american-to-british") {
      // American to British translation
      translated = this.replaceAll(translated, this.americanOnly);
      translated = this.replaceAll(translated, this.americanToBritishSpelling);
      translated = this.replaceAll(translated, this.americanToBritishTitles);
      translated = this.handleTimeFormat(translated, true);
    } else {
      // British to American translation
      translated = this.replaceAll(translated, this.britishOnly);
      translated = this.replaceAll(
        translated,
        this.reverseDict(this.americanToBritishSpelling)
      );
      translated = this.replaceAll(
        translated,
        this.reverseDict(this.americanToBritishTitles)
      );
      translated = this.handleTimeFormat(translated, false);
    }

    // Return original if no translation needed
    return translated === text ? "Everything looks good to me!" : translated;
  }

  reverseDict(dict) {
    return Object.entries(dict).reduce((acc, [key, value]) => {
      acc[value] = key;
      return acc;
    }, {});
  }

  // Helper to replace all occurrences with highlighting
  replaceAll(text, dict) {
    let result = text;
    const entries = Object.entries(dict).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (let [key, value] of entries) {
      const escapedKey = key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

      // Supprimer les \b pour les cas avec ponctuation (comme Mr.)
      const regex = new RegExp(`(?<!\\w)${escapedKey}(?!\\w)`, "gi");

      result = result.replace(regex, (match) => {
        const replacement =
          match[0] === match[0].toUpperCase()
            ? value[0].toUpperCase() + value.slice(1)
            : value;
        return `<span class="highlight">${replacement}</span>`;
      });
    }

    return result;
  }

  // Helper to handle time format conversion (10:30 <-> 10.30)
  handleTimeFormat(text, toBritish) {
    const regex = toBritish
      ? /(\d{1,2}):(\d{2})/g // 12:15 -> 12.15
      : /(\d{1,2})\.(\d{2})/g; // 4.30 -> 4:30

    const replacement = toBritish
      ? '<span class="highlight">$1.$2</span>'
      : '<span class="highlight">$1:$2</span>';

    return text.replace(regex, replacement);
  }

  // Helper to highlight differences between original and translated text
  highlightTranslation(original, translated) {
    let words = translated.split(/\b/);
    let originalWords = original.split(/\b/);

    return words
      .map((word, i) => {
        if (word !== originalWords[i]) {
          return `<span class="highlight">${word}</span>`;
        }
        return word;
      })
      .join("");
  }
}

module.exports = Translator;
