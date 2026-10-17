import { client } from "./redis";

export const TTL = {
  FEATURED: 300,
  LATEST: 120,
  LIST: 120,
  SEARCH: 60,
  SINGLE: 600,
};

export const keys = {
  featured: () => "books:featured",
  latest: () => "books:latest",
  all: (search?: string) =>
    `books:all:${search ? search.trim().toLowerCase() : "_"}`,
  search: (q: string) => `books:search:${q.trim().toLowerCase()}`,
  single: (id: string) => `books:single:${id}`,
};

/** Read JSON from cache. Never throws: a Redis failure just means a cache miss. */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.error("Cache get failed:", key, err);
    return null;
  }
}

/** Write JSON to cache with a TTL (seconds). Never throws. */
export async function setCache(key: string, value: unknown, ttl: number) {
  try {
    await client.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err) {
    console.error("Cache set failed:", key, err);
  }
}

/**
 * Delete every cached books entry (books:*).
 * Call this after any book is created, updated, deleted, or its status/featured flag changes.
 */
export async function invalidateBooksCache() {
  try {
    let cursor = "0";
    do {
      const [next, found] = await client.scan(
        cursor,
        "MATCH",
        "books:*",
        "COUNT",
        100,
      );
      cursor = next;
      if (found.length) await client.del(...found);
    } while (cursor !== "0");
  } catch (err) {
    console.error("Cache invalidate failed:", err);
  }
}
