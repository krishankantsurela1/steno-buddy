/**
 * Smart Visual Comparison Engine for Hindi Krutidev (Legacy Font)
 * This module handles all the equivalence mappings for proper comparison
 */

// Alt-Code Conjunct Mappings: Maps single conjunct characters to their decomposed forms
// Format: { altCode: decomposedForm }
export const CONJUNCT_EQUIVALENCES: Record<string, string> = {
  // क्त (Alt-0210) -> क + ् + त
  'क्त': 'क्त',
  // द्द (Alt-0207) -> द + ् + द  
  'द्द': 'द्द',
  // त्त (Alt-0199) -> त + ् + त
  'त्त': 'त्त',
  // द्ध (Alt-0205/0208) -> द + ् + ध
  'द्ध': 'द्ध',
  // द्य (Alt-0215) -> द + ् + य
  'द्य': 'द्य',
  // द्व (Alt-0212) -> द + ् + व
  'द्व': 'द्व',
  // द्म (Alt-0213) -> द + ् + म
  'द्म': 'द्म',
  // ह्न (Alt-0224) -> ह + ् + न
  'ह्न': 'ह्न',
  // ह्म (Alt-0226) -> ह + ् + म
  'ह्म': 'ह्म',
  // ह्य (Alt-0227) -> ह + ् + य
  'ह्य': 'ह्य',
  // ह्र (Alt-0228) -> ह + ् + र
  'ह्र': 'ह्र',
  // ष्ट (Alt-0184) -> ष + ् + त
  'ष्ट': 'ष्ट',
  // ष्ठ (Alt-0185) -> ष + ् + ठ
  'ष्ठ': 'ष्ठ',
  // ड्ड (Alt-0197) -> ड + ् + ड
  'ड्ड': 'ड्ड',
  // ड्ढ (Alt-0198) -> ड + ् + ढ
  'ड्ढ': 'ड्ढ',
  // क्र (Alt-0216) -> क + ् + र
  'क्र': 'क्र',
  // त्र (Alt-0217) -> त + ् + र
  'त्र': 'त्र',
  // श्र (Alt-0221) -> श + ् + र
  'श्र': 'श्र',
  // प्र (Alt-0219) -> प + ् + र
  'प्र': 'प्र',
};

// Nasal Sound Equivalences: Maps half-nasal forms to Anusvar
// Format: halfNasal -> anusvar form
export const NASAL_EQUIVALENCES: Map<string, string[]> = new Map([
  // म् before ब/भ/प/फ/म -> ं
  ['म्ब', ['ंब']],
  ['म्भ', ['ंभ']],
  ['म्प', ['ंप']],
  ['म्फ', ['ंफ']],
  ['म्म', ['ंम']],
  // न् before त/थ/द/ध/न -> ं
  ['न्त', ['ंत']],
  ['न्थ', ['ंथ']],
  ['न्द', ['ंद']],
  ['न्ध', ['ंध']],
  ['न्न', ['ंन']],
  // ण् before ट/ठ/ड/ढ/ण -> ं
  ['ण्ट', ['ंट']],
  ['ण्ठ', ['ंठ']],
  ['ण्ड', ['ंड']],
  ['ण्ढ', ['ंढ']],
  ['ण्ण', ['ंण']],
  // ङ् before क/ख/ग/घ -> ं
  ['ङ्क', ['ंक']],
  ['ङ्ख', ['ंख']],
  ['ङ्ग', ['ंग']],
  ['ङ्घ', ['ंघ']],
  // ञ् before च/छ/ज/झ -> ं
  ['ञ्च', ['ंच']],
  ['ञ्छ', ['ंछ']],
  ['ञ्ज', ['ंज']],
  ['ञ्झ', ['ंझ']],
]);

// Chandra-bindu to Anusvar equivalence
export const CHANDRABINDU_ANUSVAR: [string, string] = ['ँ', 'ं'];

// Nukta character to be stripped
export const NUKTA = '़';

// Common word pair equivalences (exact matches)
export const WORD_EQUIVALENCES: Map<string, string[]> = new Map([
  // Words with conjuncts
  ['व्यक्ति', ['व्यक्ति', 'व्यक्ति']],
  ['उक्त', ['उक्त', 'उक्त']],
  ['प्रकृति', ['प्रकृति', 'प्रकृति']],
  ['प्रक्रिया', ['प्रक्रिया', 'प्रक्रिया']],
  // Words with/without nukta
  ['गिरफ्तार', ['गिरफ़्तार', 'गिरफतार', 'गिरफ़तार']],
  ['फैसला', ['फ़ैसला', 'फैसला']],
  ['जरूरत', ['ज़रूरत', 'जरूरत']],
  ['सफर', ['सफ़र', 'सफर']],
  ['कफन', ['कफ़न', 'कफन']],
]);

/**
 * Strips Nukta (़) from text for comparison
 */
export function stripNukta(text: string): string {
  return text.replace(/़/g, '');
}

/**
 * Normalizes Chandra-bindu to Anusvar
 */
export function normalizeChandrabindu(text: string): string {
  return text.replace(/ँ/g, 'ं');
}

/**
 * Normalizes half-nasals to Anusvar form
 */
export function normalizeNasals(text: string): string {
  let normalized = text;
  
  // Replace all half-nasal combinations with Anusvar
  NASAL_EQUIVALENCES.forEach((equivalents, halfNasal) => {
    if (normalized.includes(halfNasal)) {
      // Replace with first equivalent (anusvar form)
      normalized = normalized.replace(new RegExp(halfNasal, 'g'), equivalents[0]);
    }
  });
  
  return normalized;
}

/**
 * Normalizes conjunct characters (Alt-codes) to their decomposed forms
 * This ensures both Alt-code and manual typing match
 */
export function normalizeConjuncts(text: string): string {
  let normalized = text;
  
  // Unicode normalization - NFD decomposes, NFC composes
  // First decompose to handle any pre-composed characters
  normalized = normalized.normalize('NFD');
  // Then recompose for consistent comparison
  normalized = normalized.normalize('NFC');
  
  return normalized;
}

/**
 * Master normalization function for Krutidev comparison
 * Applies all equivalence rules to make text comparison-ready
 */
export function normalizeForKrutidev(text: string): string {
  let normalized = text;
  
  // Step 1: Strip Nukta characters (permanent neutrality)
  normalized = stripNukta(normalized);
  
  // Step 2: Normalize Chandra-bindu to Anusvar
  normalized = normalizeChandrabindu(normalized);
  
  // Step 3: Normalize half-nasals to Anusvar
  normalized = normalizeNasals(normalized);
  
  // Step 4: Unicode normalization for conjuncts
  normalized = normalizeConjuncts(normalized);
  
  return normalized;
}

/**
 * Checks if two words are equivalent under Krutidev rules
 */
export function areKrutidevEquivalent(word1: string, word2: string): boolean {
  // First try exact match
  if (word1 === word2) return true;
  
  // Normalize both words
  const norm1 = normalizeForKrutidev(word1);
  const norm2 = normalizeForKrutidev(word2);
  
  // Check normalized match
  if (norm1 === norm2) return true;
  
  // Check word equivalences table
  for (const [key, equivalents] of WORD_EQUIVALENCES) {
    const allForms = [key, ...equivalents];
    const norm1InList = allForms.some(form => normalizeForKrutidev(form) === norm1);
    const norm2InList = allForms.some(form => normalizeForKrutidev(form) === norm2);
    if (norm1InList && norm2InList) return true;
  }
  
  return false;
}

/**
 * Advanced comparison that handles partial matches with Krutidev rules
 */
export function compareKrutidevWords(masterWord: string, typedWord: string): {
  isMatch: boolean;
  isPartialMatch: boolean;
  matchType: 'exact' | 'equivalent' | 'partial' | 'none';
} {
  // Exact match
  if (masterWord === typedWord) {
    return { isMatch: true, isPartialMatch: false, matchType: 'exact' };
  }
  
  // Equivalent match (after normalization)
  if (areKrutidevEquivalent(masterWord, typedWord)) {
    return { isMatch: true, isPartialMatch: false, matchType: 'equivalent' };
  }
  
  // Check for partial match (for half-mistake detection)
  const normMaster = normalizeForKrutidev(masterWord);
  const normTyped = normalizeForKrutidev(typedWord);
  
  // If one is substring of other or differs by small amount
  if (normMaster.includes(normTyped) || normTyped.includes(normMaster)) {
    return { isMatch: false, isPartialMatch: true, matchType: 'partial' };
  }
  
  return { isMatch: false, isPartialMatch: false, matchType: 'none' };
}
