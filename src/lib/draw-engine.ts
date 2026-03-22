export type DrawMode = "random" | "algorithmic";

export function generateRandomNumbers(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 5).sort((a, b) => a - b);
}

export function generateAlgorithmicNumbers(scores: number[]): number[] {
  if (scores.length === 0) return generateRandomNumbers();
  const freq: Record<number, number> = {};
  for (const s of scores) freq[s] = (freq[s] ?? 0) + 1;
  const pool: number[] = [];
  for (let n = 1; n <= 45; n++) {
    const weight = (freq[n] ?? 0) + 1;
    for (let w = 0; w < weight; w++) pool.push(n);
  }
  const picked = new Set<number>();
  let attempts = 0;
  while (picked.size < 5 && attempts < 500) {
    picked.add(pool[Math.floor(Math.random() * pool.length)]);
    attempts++;
  }
  if (picked.size < 5) return generateRandomNumbers();
  return Array.from(picked).sort((a, b) => a - b);
}

export function matchScores(userScores: number[], winningNumbers: number[]): { matched: number[]; matchType: "3-match" | "4-match" | "5-match" | null } {
  const winSet = new Set(winningNumbers);
  const matched = userScores.filter(s => winSet.has(s));
  if (matched.length >= 5) return { matched, matchType: "5-match" };
  if (matched.length === 4) return { matched, matchType: "4-match" };
  if (matched.length === 3) return { matched, matchType: "3-match" };
  return { matched, matchType: null };
}

export function calculatePrizes(totalPool: number, jackpotRollover = 0) {
  const effective = totalPool + jackpotRollover;
  return {
    fiveMatch:  Math.round(effective   * 0.40 * 100) / 100,
    fourMatch:  Math.round(totalPool   * 0.35 * 100) / 100,
    threeMatch: Math.round(totalPool   * 0.25 * 100) / 100,
  };
}

export function splitPrize(totalPrize: number, winnerCount: number): number {
  if (winnerCount === 0) return 0;
  return Math.round((totalPrize / winnerCount) * 100) / 100;
}