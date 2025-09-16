// Hash utilities for Filecoin storage
// @ts-ignore
import { createHash } from 'crypto-browserify';

/**
 * Generate SHA-256 hash of data
 */
export function sha256(data: Uint8Array | string): string {
  const hash = createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data, 'utf8');
  } else {
    hash.update(data);
  }
  return hash.digest('hex');
}

/**
 * Generate SHA-256 hash of file content
 */
export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return sha256(uint8Array);
}

/**
 * Generate content hash for note data
 */
export function hashNote(note: any): string {
  const noteString = JSON.stringify(note, Object.keys(note).sort());
  return sha256(noteString);
}
