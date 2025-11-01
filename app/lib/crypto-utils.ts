// Utility pentru generare chei criptografice

export class EntropyCollector {
  private pool: number[] = [];
  private readonly maxPoolSize = 1024;

  addEntropy(data: number[]): void {
    this.pool.push(...data);
    if (this.pool.length > this.maxPoolSize) {
      this.pool = this.pool.slice(-this.maxPoolSize);
    }
  }

  getEntropyLevel(): number {
    return Math.min(100, (this.pool.length / this.maxPoolSize) * 100);
  }

  async generateKey(length: number = 32): Promise<string> {
    if (this.pool.length < 256) {
      throw new Error("Insufficient entropy. Move the pendulum more!");
    }

    // Combinăm entropia colectată cu timestamp și random
    const entropyData = new Uint8Array([
      ...this.pool.slice(-512),
      ...Array.from(crypto.getRandomValues(new Uint8Array(32))),
      ...this.numberToBytes(Date.now()),
      ...this.numberToBytes(performance.now()),
    ]);

    // Hash cu SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", entropyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Dacă vrem mai mult de 32 bytes, facem hash iterativ
    let result = hashArray;
    while (result.length < length) {
      const nextHash = await crypto.subtle.digest(
        "SHA-256",
        new Uint8Array([...result, ...this.pool.slice(-128)])
      );
      result.push(...Array.from(new Uint8Array(nextHash)));
    }

    return this.bytesToHex(result.slice(0, length));
  }

  private numberToBytes(num: number): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < 8; i++) {
      bytes.push((num >> (i * 8)) & 0xff);
    }
    return bytes;
  }

  private bytesToHex(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  reset(): void {
    this.pool = [];
  }

  getPoolStats() {
    if (this.pool.length === 0) return { mean: 0, variance: 0, entropy: 0 };

    const mean = this.pool.reduce((a, b) => a + b, 0) / this.pool.length;
    const variance =
      this.pool.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      this.pool.length;

    // Shannon entropy simplificată
    const freq: { [key: number]: number } = {};
    this.pool.forEach((v) => {
      const bucket = Math.floor(v);
      freq[bucket] = (freq[bucket] || 0) + 1;
    });

    const entropy = -Object.values(freq).reduce((sum, f) => {
      const p = f / this.pool.length;
      return sum + p * Math.log2(p);
    }, 0);

    return { mean, variance, entropy };
  }
}

export function formatKey(key: string, groupSize: number = 8): string {
  return key.match(new RegExp(`.{1,${groupSize}}`, "g"))?.join(" ") || key;
}