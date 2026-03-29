
/**
 * Utility functions for square root math
 */

export interface Radical {
  coefficient: number;
  radicand: number;
}

/**
 * Simplifies a radical n*sqrt(m)
 * Example: 1*sqrt(8) -> 2*sqrt(2)
 */
export function simplifyRadical(r: Radical): Radical {
  let { coefficient, radicand } = r;
  if (radicand === 0) return { coefficient: 0, radicand: 0 };
  if (radicand === 1) return { coefficient, radicand: 1 };

  let i = 2;
  while (i * i <= radicand) {
    if (radicand % (i * i) === 0) {
      coefficient *= i;
      radicand /= i * i;
    } else {
      i++;
    }
  }
  return { coefficient, radicand };
}

/**
 * Formats a radical to LaTeX
 */
export function formatRadicalLatex(r: Radical): string {
  const { coefficient, radicand } = r;
  
  if (coefficient === 0 || radicand === 0) return "0";
  if (radicand === 1) return `${coefficient}`;
  
  const coeffStr = coefficient === 1 ? "" : coefficient === -1 ? "-" : `${coefficient}`;
  return `${coeffStr}\\sqrt{${radicand}}`;
}

/**
 * Parses user input like "3√2" or "√8" or "5"
 */
export function parseUserInput(input: string): Radical | null {
  const trimmed = input.trim().replace(/\s/g, "");
  if (!trimmed) return null;

  // Pattern 1: Just a number (e.g., "5")
  if (/^-?\d+$/.test(trimmed)) {
    return { coefficient: parseInt(trimmed), radicand: 1 };
  }

  // Pattern 2: Radical (e.g., "3√2", "√2", "-√2", "-3√2")
  const radicalRegex = /^([-+]?\d*)?√(\d+)$/;
  const match = trimmed.match(radicalRegex);
  
  if (match) {
    let coeffStr = match[1];
    let radicandStr = match[2];
    
    let coefficient = 1;
    if (coeffStr === "-") coefficient = -1;
    else if (coeffStr === "+") coefficient = 1;
    else if (coeffStr && coeffStr !== "") coefficient = parseInt(coeffStr);
    
    const radicand = parseInt(radicandStr);
    return { coefficient, radicand };
  }

  return null;
}

/**
 * Compares two radicals for equality after simplification
 */
export function areRadicalsEqual(r1: Radical, r2: Radical): boolean {
  const s1 = simplifyRadical(r1);
  const s2 = simplifyRadical(r2);
  return s1.coefficient === s2.coefficient && s1.radicand === s2.radicand;
}

export type ProblemType = 'multiply' | 'divide';

export interface Problem {
  type: ProblemType;
  op1: Radical;
  op2: Radical;
  answer: Radical;
  latex: string;
}

export function generateProblem(): Problem {
  const type: ProblemType = Math.random() > 0.5 ? 'multiply' : 'divide';
  
  if (type === 'multiply') {
    // a√b * c√d
    const a = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 5) + 1;
    const b = [2, 3, 5, 6, 7, 10][Math.floor(Math.random() * 6)];
    const d = [2, 3, 5, 6, 7, 10][Math.floor(Math.random() * 6)];
    
    const op1 = { coefficient: a, radicand: b };
    const op2 = { coefficient: c, radicand: d };
    const answer = { coefficient: a * c, radicand: b * d };
    
    const latex = `${formatRadicalLatex(op1)} \\times ${formatRadicalLatex(op2)}`;
    
    return { type, op1, op2, answer, latex };
  } else {
    // a√b / c√d
    // To keep it simple for middle school, we'll ensure the result is "clean" or easily rationalized
    // Let's generate the answer first and work backwards
    // Result = (a/c) * √(b/d)
    // Simpler: √A / √B where A is a multiple of B or A/B is a simple fraction
    
    const b = [2, 3, 5, 6, 10][Math.floor(Math.random() * 5)];
    const resRadicand = [2, 3, 5, 6, 10][Math.floor(Math.random() * 5)];
    const aRadicand = b * resRadicand;
    
    const coeff1 = Math.floor(Math.random() * 4) + 1;
    const coeff2 = 1; // Keep divisor coefficient simple for now
    
    const op1 = { coefficient: coeff1, radicand: aRadicand };
    const op2 = { coefficient: coeff2, radicand: b };
    const answer = { coefficient: coeff1, radicand: resRadicand };
    
    const latex = `${formatRadicalLatex(op1)} \\div ${formatRadicalLatex(op2)}`;
    
    return { type, op1, op2, answer, latex };
  }
}
