export interface DiffResult {
  type: 'correct' | 'error' | 'missing' | 'extra';
  typed?: string;
  correct?: string;
}

export interface AnalysisStats {
  totalMasterWords: number;
  totalTypedWords: number;
  errors: number;
  accuracy: number;
}

// Tokenize text while preserving Hindi punctuation as separate tokens
function tokenize(text: string): string[] {
  // Split by whitespace first
  const rawTokens = text.trim().split(/\s+/).filter(t => t.length > 0);
  const tokens: string[] = [];
  
  for (const token of rawTokens) {
    // Handle Hindi Purn Viram (।) and other punctuation as separate tokens
    let current = '';
    for (const char of token) {
      if (char === '।' || char === ',' || char === '.' || char === '?' || char === '!') {
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

export function analyzeText(masterText: string, typedText: string): { results: DiffResult[], stats: AnalysisStats } {
  const masterTokens = tokenize(masterText);
  const typedTokens = tokenize(typedText);
  
  if (masterTokens.length === 0 && typedTokens.length === 0) {
    return {
      results: [],
      stats: { totalMasterWords: 0, totalTypedWords: 0, errors: 0, accuracy: 100 }
    };
  }
  
  const dp = lcs(masterTokens, typedTokens);
  const matches = backtrackLCS(dp, masterTokens, typedTokens, masterTokens.length, typedTokens.length);
  
  const results: DiffResult[] = [];
  let errors = 0;
  
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
        // Both have unmatched tokens - this is an error (typed wrong)
        results.push({ 
          type: 'error', 
          typed: typedTokens[typedIdx], 
          correct: masterTokens[masterIdx] 
        });
        errors++;
        masterIdx++;
        typedIdx++;
      } else if (masterNeedsAdvance) {
        // Missing word from typed text
        results.push({ type: 'missing', correct: masterTokens[masterIdx] });
        errors++;
        masterIdx++;
      } else if (typedNeedsAdvance) {
        // Extra word in typed text
        results.push({ type: 'extra', typed: typedTokens[typedIdx] });
        errors++;
        typedIdx++;
      }
    } else {
      // No more matches - handle remaining tokens
      if (masterIdx < masterTokens.length && typedIdx < typedTokens.length) {
        results.push({ 
          type: 'error', 
          typed: typedTokens[typedIdx], 
          correct: masterTokens[masterIdx] 
        });
        errors++;
        masterIdx++;
        typedIdx++;
      } else if (masterIdx < masterTokens.length) {
        results.push({ type: 'missing', correct: masterTokens[masterIdx] });
        errors++;
        masterIdx++;
      } else if (typedIdx < typedTokens.length) {
        results.push({ type: 'extra', typed: typedTokens[typedIdx] });
        errors++;
        typedIdx++;
      }
    }
  }
  
  const totalMasterWords = masterTokens.length;
  const accuracy = totalMasterWords > 0 
    ? Math.max(0, Math.round(((totalMasterWords - errors) / totalMasterWords) * 100 * 100) / 100)
    : 100;
  
  return {
    results,
    stats: {
      totalMasterWords,
      totalTypedWords: typedTokens.length,
      errors,
      accuracy
    }
  };
}
