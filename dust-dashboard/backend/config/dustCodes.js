module.exports = {
  // Codes to filter for
  CODES: [
    'DU',    // Widespread Dust
    'SA',    // Sand
    'BLSA',  // Blowing Sand
    'BLDU',  // Blowing Dust
    'SS',    // Sandstorm
    'DS',    // Duststorm
    'PO'     // Dust/Sand Whirls
  ],
  // Regex pattern for matching: Supports optional + (heavy) or - (light) prefixes
  // Updated for case-insensitivity and more robust matching
  REGEX_PATTERN: /(^|\s)([+\-])?(DU|SA|BLSA|BLDU|SS|DS|PO)(\s|$)/i
};
