/**
 * API Key Manager for handling multiple Gemini API keys
 * Provides rotation functionality to avoid rate limits
 */

export class ApiKeyManager {
  private keys: string[] = [];
  private currentKeyIndex: number = 0;

  constructor() {
    this.loadKeysFromEnv();
  }

  /**
   * Load API keys from environment variables
   */
  private loadKeysFromEnv(): void {
    // Find all environment variables that match the pattern GEMINI_API_KEY_*
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) {
        this.keys.push(key);
      }
    }

    if (this.keys.length === 0) {
      throw new Error('No API keys found in environment variables');
    }

    console.log(`Loaded ${this.keys.length} API keys`);
  }

  /**
   * Get the current API key
   */
  public getCurrentKey(): string {
    return this.keys[this.currentKeyIndex];
  }

  /**
   * Rotate to the next API key
   */
  public rotateKey(): string {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
    return this.getCurrentKey();
  }

  /**
   * Get all loaded API keys
   */
  public getAllKeys(): string[] {
    return [...this.keys];
  }

  /**
   * Get the number of loaded API keys
   */
  public getKeyCount(): number {
    return this.keys.length;
  }
} 