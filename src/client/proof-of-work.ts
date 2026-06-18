export interface PoWChallenge {
  prefix: string;
  difficulty: number;
  timestamp: number;
}

export interface PoWSolution {
  nonce: number;
  hash: string;
  timeMs: number;
}

export function generateChallenge(difficulty: number = 4): PoWChallenge {
  const prefix = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    prefix,
    difficulty: Math.min(Math.max(difficulty, 1), 8),
    timestamp: Date.now(),
  };
}

export async function solveChallenge(
  challenge: PoWChallenge
): Promise<PoWSolution> {
  const start = Date.now();
  const target = '0'.repeat(challenge.difficulty);
  let nonce = 0;

  while (true) {
    const input = `${challenge.prefix}:${nonce}`;
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(input)
    );
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (hashHex.startsWith(target)) {
      return {
        nonce,
        hash: hashHex,
        timeMs: Date.now() - start,
      };
    }

    nonce++;

    if (nonce % 1000 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}

export async function verifyChallenge(
  challenge: PoWChallenge,
  solution: PoWSolution
): Promise<boolean> {
  const input = `${challenge.prefix}:${solution.nonce}`;
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const target = '0'.repeat(challenge.difficulty);
  return hashHex === solution.hash && hashHex.startsWith(target);
}
