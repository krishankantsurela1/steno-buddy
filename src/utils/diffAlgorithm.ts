export interface DiffResult {
  type: 'correct' | 'error' | 'missing' | 'extra' | 'half-error';
  typed?: string;
  correct?: string;
}

export interface AnalysisStats {
  totalMasterWords: number;
  totalTypedWords: number;
  fullMistakes: number;
  halfMistakes: number;
  totalPenalty: number;
  marks: number;
  accuracy: number;
}
// Normalization Map for Kruti Dev Smart Visual Comparison
export const NORMALIZATION_MAP: Record<string, string> = {
  // --- Mandatory Rules (from User Data) ---
  "ä": "Dr",       // Alt+0228 -> Dr
  "Ñ": "d`",       // Alt+0209 -> d + backtick
  "Ø": "dz",       // Alt+0216 -> d + z
  "Ù": "Rr",       // Alt+0217 -> R + r
  "˜": "n~n",      // Dda
  "™": "n~`",      // Dha
  "š": "n~o",      // Dva
  "¶": "Q~",       // Ffa
  "Ì": "n~nk",     // Dda variation
  
  // --- Visual/Common Mistake Bypasses ---
  "U": "a", "E": "a", "i": "a", "j": "a", ".": "a"
};

// Check if two words match after normalization
export const checkWordMatch = (original: string, typed: string): boolean => {
  if (!original || !typed) return false;
  
  const normalize = (text: string): string => {
    let clean = text;
    Object.entries(NORMALIZATION_MAP).forEach(([key, val]) => {
      // Escape special regex characters
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      clean = clean.replace(regex, val);
    });
    return clean;
  };
  
  return normalize(original) === normalize(typed);
};

// Normalize text for accurate comparison
function normalizeText(text: string): string {
  // Apply Kruti Dev character normalization first
  let normalized = text;
  Object.entries(NORMALIZATION_MAP).forEach(([key, val]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    normalized = normalized.replace(regex, val);
  });
  // Unicode normalization for Hindi characters - NFC ensures matras are combined with letters
  normalized = normalized.normalize('NFC');
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ');
  // Trim whitespace
  return normalized.trim();
}

// Tokenize text into whole words only - no character splitting
function tokenizeWholeWords(text: string): string[] {
  const normalizedText = normalizeText(text);
  // Split by whitespace only, keeping whole words intact
  return normalizedText.split(' ').filter(t => t.length > 0);
}

// Tokenize text while preserving Hindi punctuation as separate tokens
function tokenize(text: string): string[] {
  // Normalize text first
  const normalizedText = normalizeText(text);
  
  // Split by whitespace
  const rawTokens = normalizedText.split(' ').filter(t => t.length > 0);
  const tokens: string[] = [];
  
  for (const token of rawTokens) {
    // Handle Hindi Purn Viram (।) and other punctuation as separate tokens
    let current = '';
    for (const char of token) {
      if (char === '।' || char === ',' || char === '.' || char === '?' || char === '!' || char === ';' || char === ':') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
      } else {
        current += char;
      }
    }
    if (current) {
      tokens.push(current);
    }
  }
  
  return tokens;
}

// LCS-based diff algorithm for better alignment
function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp;
}

function backtrackLCS(dp: number[][], a: string[], b: string[], i: number, j: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return result;
}

// Check if token is a punctuation mark that counts as half mistake
function isHalfMistakePunctuation(token: string): boolean {
  return token === ',' || token === '-' || token === '।';
}

// Check if two tokens differ only by punctuation (half mistake)
function isPunctuationOnlyDifference(typed: string, master: string): boolean {
  // Remove punctuation from both and compare
  const punctuationChars = [',', '-', '।'];
  let cleanTyped = typed;
  let cleanMaster = master;
  
  for (const p of punctuationChars) {
    cleanTyped = cleanTyped.replace(new RegExp(`\\${p}`, 'g'), '');
    cleanMaster = cleanMaster.replace(new RegExp(`\\${p}`, 'g'), '');
  }
  
  // If the words are the same without punctuation, it's a punctuation difference
  if (cleanTyped === cleanMaster && cleanTyped.length > 0) {
    return true;
  }
  
  // Check if one is just punctuation added/removed
  const hasPunctuationDiff = punctuationChars.some(p => 
    (typed.includes(p) && !master.includes(p)) || 
    (!typed.includes(p) && master.includes(p))
  );
  
  return hasPunctuationDiff && cleanTyped === cleanMaster;
}

export function analyzeText(masterText: string, typedText: string): { results: DiffResult[], stats: AnalysisStats } {
  // Use whole word tokenization to prevent word splitting
  const masterTokens = tokenizeWholeWords(masterText);
  const typedTokens = tokenizeWholeWords(typedText);
  
  if (masterTokens.length === 0 && typedTokens.length === 0) {
    return {
      results: [],
      stats: { totalMasterWords: 0, totalTypedWords: 0, fullMistakes: 0, halfMistakes: 0, totalPenalty: 0, marks: 100, accuracy: 100 }
    };
  }
  
  const dp = lcs(masterTokens, typedTokens);
  const matches = backtrackLCS(dp, masterTokens, typedTokens, masterTokens.length, typedTokens.length);
  
  const results: DiffResult[] = [];
  let fullMistakes = 0;
  let halfMistakes = 0;
  
  let masterIdx = 0;
  let typedIdx = 0;
  let matchIdx = 0;
  
  while (masterIdx < masterTokens.length || typedIdx < typedTokens.length) {
    const currentMatch = matchIdx < matches.length ? matches[matchIdx] : null;
    
    if (currentMatch && masterIdx === currentMatch[0] && typedIdx === currentMatch[1]) {
      // Perfect match
      results.push({ type: 'correct', typed: typedTokens[typedIdx] });
      masterIdx++;
      typedIdx++;
      matchIdx++;
    } else if (currentMatch) {
      // Check what's missing or extra
      const masterNeedsAdvance = masterIdx < currentMatch[0];
      const typedNeedsAdvance = typedIdx < currentMatch[1];
      
      if (masterNeedsAdvance && typedNeedsAdvance) {
        // Both have unmatched tokens - check if it's punctuation difference
        if (isPunctuationOnlyDifference(typedTokens[typedIdx], masterTokens[masterIdx])) {
          results.push({ 
            type: 'half-error', 
            typed: typedTokens[typedIdx], 
            correct: masterTokens[masterIdx] 
          });
          halfMistakes++;
        } else {
          results.push({ 
            type: 'error', 
            typed: typedTokens[typedIdx], 
            correct: masterTokens[masterIdx] 
          });
          fullMistakes++;
        }
        masterIdx++;
        typedIdx++;
      } else if (masterNeedsAdvance) {
        // Missing word - check if it's just punctuation
        if (isHalfMistakePunctuation(masterTokens[masterIdx])) {
          results.push({ type: 'half-error', correct: masterTokens[masterIdx] });
          halfMistakes++;
        } else {
          results.push({ type: 'missing', correct: masterTokens[masterIdx] });
          fullMistakes++;
        }
        masterIdx++;
      } else if (typedNeedsAdvance) {
        // Extra word - check if it's just punctuation
        if (isHalfMistakePunctuation(typedTokens[typedIdx])) {
          results.push({ type: 'half-error', typed: typedTokens[typedIdx] });
          halfMistakes++;
        } else {
          results.push({ type: 'extra', typed: typedTokens[typedIdx] });
          fullMistakes++;
        }
        typedIdx++;
      }
    } else {
      // No more matches - handle remaining tokens
      if (masterIdx < masterTokens.length && typedIdx < typedTokens.length) {
        if (isPunctuationOnlyDifference(typedTokens[typedIdx], masterTokens[masterIdx])) {
          results.push({ 
            type: 'half-error', 
            typed: typedTokens[typedIdx], 
            correct: masterTokens[masterIdx] 
          });
          halfMistakes++;
        } else {
          results.push({ 
            type: 'error', 
            typed: typedTokens[typedIdx], 
            correct: masterTokens[masterIdx] 
          });
          fullMistakes++;
        }
        masterIdx++;
        typedIdx++;
      } else if (masterIdx < masterTokens.length) {
        if (isHalfMistakePunctuation(masterTokens[masterIdx])) {
          results.push({ type: 'half-error', correct: masterTokens[masterIdx] });
          halfMistakes++;
        } else {
          results.push({ type: 'missing', correct: masterTokens[masterIdx] });
          fullMistakes++;
        }
        masterIdx++;
      } else if (typedIdx < typedTokens.length) {
        if (isHalfMistakePunctuation(typedTokens[typedIdx])) {
          results.push({ type: 'half-error', typed: typedTokens[typedIdx] });
          halfMistakes++;
        } else {
          results.push({ type: 'extra', typed: typedTokens[typedIdx] });
          fullMistakes++;
        }
        typedIdx++;
      }
    }
  }
  
  const totalMasterWords = masterTokens.length;
  const totalPenalty = fullMistakes * 1.0 + halfMistakes * 0.5;
  
  // Formula: Marks = 100 - ((Total Penalties / Total Words in Original) * 100)
  const marks = totalMasterWords > 0 
    ? Math.max(0, Math.round((100 - (totalPenalty / totalMasterWords) * 100) * 100) / 100)
    : 100;
  
  const accuracy = totalMasterWords > 0 
    ? Math.max(0, Math.round(((totalMasterWords - totalPenalty) / totalMasterWords) * 100 * 100) / 100)
    : 100;
  
  return {
    results,
    stats: {
      totalMasterWords,
      totalTypedWords: typedTokens.length,
      fullMistakes,
      halfMistakes,
      totalPenalty,
      marks,
      accuracy
    }
  };
}
