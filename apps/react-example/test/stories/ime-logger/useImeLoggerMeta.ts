import { useCallback, useState } from "react";

import type { ImeLoggerMetaFields } from "./detectImeLoggerMeta";
import { resolveImeLoggerMeta, writeImeLoggerMeta } from "./imeLoggerMetaStorage";

export function useImeLoggerMeta() {
  const [meta, setMetaState] = useState<ImeLoggerMetaFields>(resolveImeLoggerMeta);

  const setMeta = useCallback((patch: Partial<ImeLoggerMetaFields>) => {
    setMetaState((prev) => {
      const next = { ...prev, ...patch };
      writeImeLoggerMeta(next);
      return next;
    });
  }, []);

  const setOs = useCallback((os: string) => setMeta({ os }), [setMeta]);
  const setBrowser = useCallback((browser: string) => setMeta({ browser }), [setMeta]);
  const setIme = useCallback((ime: string) => setMeta({ ime }), [setMeta]);

  return {
    os: meta.os,
    browser: meta.browser,
    ime: meta.ime,
    setOs,
    setBrowser,
    setIme,
  };
}
