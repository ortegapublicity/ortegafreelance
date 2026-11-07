import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';

/**
 * Netlify Blobs como base de datos. Los índices que se leen en bloque se
 * actualizan con escrituras condicionales por ETag, así dos correos que
 * llegan a la vez no se pisan.
 */

type Store = ReturnType<typeof getStore>;

export const authStore = () => getStore({ name: 'auth', consistency: 'strong' });

export const newId = (prefix = '') => `${prefix}${Date.now().toString(36)}${randomBytes(5).toString('hex')}`;

export const getJSON = async <T>(store: Store, key: string): Promise<T | null> =>
  (await store.get(key, { type: 'json' })) as T | null;

/**
 * Lee, transforma y escribe con reintentos si otro proceso escribió en medio.
 * `fn` recibe el valor actual (o `fallback`) y devuelve el nuevo; si devuelve
 * `undefined` no se escribe nada.
 */
export const mutate = async <T>(store: Store, key: string, fallback: T, fn: (current: T) => T | undefined): Promise<T> => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const found = await store.getWithMetadata(key, { type: 'json' });
    const current = (found?.data ?? structuredClone(fallback)) as T;
    const next = fn(current);
    if (next === undefined) return current;
    // El emulador de `netlify dev` no devuelve ETag al leer: allí se escribe
    // sin condición. En producción Blobs siempre lo envía.
    const res = !found
      ? await store.setJSON(key, next, { onlyIfNew: true })
      : found.etag
        ? await store.setJSON(key, next, { onlyIfMatch: found.etag })
        : await store.setJSON(key, next);
    if (res.modified) return next;
    await new Promise((r) => setTimeout(r, 25 * 2 ** attempt + Math.random() * 25));
  }
  throw new Error(`mutate: demasiada contención en ${key}`);
};
