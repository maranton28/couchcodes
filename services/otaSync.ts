import AsyncStorage from '@react-native-async-storage/async-storage';
import bundledCatalog from '../assets/data/cheats_gta6.json';
import { CheatCatalogManifest } from '../types/cheats';

const CATALOG_STORAGE_KEY = '@couchcodes:catalog_v1';
const REMOTE_MANIFEST_URL = 'https://cdn.yourdomain.com/v1/cheats_gta6.json';
const SUPPORTED_SCHEMA = 1;

export async function getInitialCatalog(): Promise<CheatCatalogManifest> {
  try {
    const raw = await AsyncStorage.getItem(CATALOG_STORAGE_KEY);
    if (raw) {
      const cached: CheatCatalogManifest = JSON.parse(raw);
      if (
        cached.schemaVersion === SUPPORTED_SCHEMA &&
        cached.dataRevision >= bundledCatalog.dataRevision
      ) {
        return cached;
      }
    }
  } catch {
    // Fallback to bundled JSON
  }
  return bundledCatalog as CheatCatalogManifest;
}

export async function syncCatalogInBackground(
  currentRevision: number
): Promise<CheatCatalogManifest | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${REMOTE_MANIFEST_URL}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const remote: CheatCatalogManifest = await res.json();
    const valid =
      remote.schemaVersion === SUPPORTED_SCHEMA &&
      typeof remote.dataRevision === 'number' &&
      remote.dataRevision > currentRevision &&
      Array.isArray(remote.cheats) &&
      remote.cheats.length > 0;

    if (!valid) return null;

    await AsyncStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(remote));
    return remote;
  } catch {
    return null;
  }
}