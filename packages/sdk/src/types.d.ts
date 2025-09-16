declare module 'crypto-browserify' {
  import { createHash as NodeCreateHash } from 'crypto';
  export const createHash: typeof NodeCreateHash;
}
