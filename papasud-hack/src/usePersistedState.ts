import { useState, useEffect } from "react";

// Reemplazo de useState que persiste en localStorage automáticamente.
// No necesita login ni ID de usuario — cada navegador tiene su propio storage.

export function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // si falla (ej: modo incógnito con storage bloqueado), no rompemos la app
    }
  }, [key, state]);

  return [state, setState] as const;
}
