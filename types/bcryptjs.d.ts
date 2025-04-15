declare module 'bcryptjs' {
  /**
   * Generate a hash for the given string.
   * @param {string|Buffer} s String to hash
   * @param {number|string} salt Salt length to generate or salt to use
   * @param {function(Error, string=)} callback Callback receiving the error, if any, and the resulting hash
   * @returns {Promise<string>} if callback has been omitted
   */
  export function hash(s: string, salt: number | string): Promise<string>;
  export function hash(s: string, salt: number | string, callback: (err: Error, hash: string) => void): void;

  /**
   * Compare a string to a hash.
   * @param {string|Buffer} s String to compare
   * @param {string} hash Hash to compare to
   * @param {function(Error, boolean=)} callback Callback receiving the error, if any, and the result
   * @returns {Promise<boolean>} if callback has been omitted
   */
  export function compare(s: string, hash: string): Promise<boolean>;
  export function compare(s: string, hash: string, callback: (err: Error, success: boolean) => void): void;

  /**
   * Gets the number of rounds used to encrypt the specified hash.
   * @param {string} hash Hash to extract the used number of rounds from
   * @returns {number} Number of rounds used
   */
  export function getRounds(hash: string): number;

  /**
   * Gets the salt portion from a hash.
   * @param {string} hash Hash to extract the salt from
   * @returns {string} Extracted salt part
   */
  export function getSalt(hash: string): string;

  /**
   * Generates a salt.
   * @param {number} rounds Number of rounds to use
   * @param {function(Error, string=)} callback Callback receiving the error, if any, and the resulting salt
   * @returns {Promise<string>} if callback has been omitted
   */
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(rounds: number, callback: (err: Error, salt: string) => void): void;
  export function genSalt(callback: (err: Error, salt: string) => void): void;
} 