import type { FeatureFlag } from '@sentry/types';

/**
 * Ordered LRU cache for storing feature flags in the scope context. The name
 * of each flag in the buffer is unique, and the output of getAll() is ordered
 * from oldest to newest.
 */

export const DEFAULT_MAX_SIZE = 100;

/**
 * Insert into a FeatureFlag array while maintaining ordered LRU properties. Not
 * thread-safe. After inserting:
 * - `flags` is sorted in order of recency, with the newest flag at the end.
 * - No other flags with the same name exist in `flags`.
 * - The length of `flags` does not exceed `maxSize`. The oldest flag is evicted
 *  as needed.
 *
 * @param flags    The array to insert into.
 * @param name     Name of the feature flag to insert.
 * @param value    Value of the feature flag.
 * @param maxSize  Max number of flags the buffer should store. It's recommended
 *   to keep this consistent across insertions. Default is DEFAULT_MAX_SIZE
 */
export function insertToFlagBuffer(
  flags: FeatureFlag[],
  name: string,
  value: boolean,
  maxSize: number = DEFAULT_MAX_SIZE,
): void {
  if (flags.length > maxSize) {
    throw Error(`insertToFlagBuffer called on a buffer larger than the given maxSize=${maxSize}`);
  }

  // Check if the flag is already in the buffer - O(n)
  const index = flags.findIndex(f => f.flag === name);

  if (index !== -1) {
    // The flag was found, remove it from its current position - O(n)
    flags.splice(index, 1);
  }

  if (flags.length === maxSize) {
    // If at capacity, pop the earliest flag - O(n)
    flags.shift();
  }

  // Push the flag to the end - O(1)
  flags.push({
    flag: name,
    result: value,
  });
}
