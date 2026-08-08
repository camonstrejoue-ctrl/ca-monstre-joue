import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import type { SiteContent } from '@/types/content';

// URL du site une fois publié sur GitHub Pages (cf. .github/workflows/deploy.yml
// à la racine du repo). Le contenu (jeux/articles/catégories) est généré
// automatiquement par scripts/export-data.js à chaque push sur main.
// Peut être surchargée en local (ex: pour tester contre `serve.ps1`) via
// EXPO_PUBLIC_SITE_BASE_URL dans un fichier .env.
export const SITE_BASE_URL =
  process.env.EXPO_PUBLIC_SITE_BASE_URL || 'https://camonstrejoue-ctrl.github.io/ca-monstre-joue';
const CONTENT_URL = `${SITE_BASE_URL}/data/content.json`;
const CACHE_KEY = 'cmj:content-cache';

/** Résout un chemin relatif (ex: "assets/games/x/cover.jpg") en URL absolue vers le site. */
export function resolveAsset(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_BASE_URL}/${path}`;
}

async function readCache(): Promise<SiteContent | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  return raw ? (JSON.parse(raw) as SiteContent) : null;
}

async function writeCache(content: SiteContent): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(content));
}

export async function fetchContent(): Promise<SiteContent> {
  try {
    const response = await fetch(CONTENT_URL, { cache: 'no-store' as RequestCache });
    if (!response.ok) throw new Error(`Réponse ${response.status}`);
    const content = (await response.json()) as SiteContent;
    await writeCache(content);
    return content;
  } catch (fetchError) {
    const cached = await readCache();
    if (cached) return cached;
    throw fetchError;
  }
}

interface UseContentState {
  content: SiteContent | null;
  loading: boolean;
  error: Error | null;
}

export function useContent() {
  const [state, setState] = useState<UseContentState>({
    content: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const content = await fetchContent();
      setState({ content, loading: false, error: null });
    } catch (err) {
      setState({ content: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
