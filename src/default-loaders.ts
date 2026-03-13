import { I18nError } from "./lib/errors";
import type { Loaders } from "./lib/types";

async function resolveDictionaryPath(customPath?: string): Promise<string> {
  const { access } = await import("fs/promises");
  const { join, isAbsolute } = await import("path");

  if (customPath) {
    const resolved = isAbsolute(customPath)
      ? customPath
      : join(process.cwd(), customPath);
    try {
      await access(resolved);
    } catch {
      throw new I18nError(`Dictionary folder not found at: ${resolved}`);
    }
    return resolved;
  }

  const cwd = process.cwd();
  const candidates = [
    join(cwd, "dictionary"),
    join(cwd, "src", "dictionary"),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }

  throw new I18nError(
    `Dictionary folder not found. Tried: ${candidates.join(", ")}. ` +
    "Create a 'dictionary' folder or set 'dictionaryPath' in config.",
  );
}

export function createDefaultLoaders<const TLocales extends readonly string[]>(
  locales: TLocales,
  dictionaryPath?: string,
): Loaders<TLocales> {
  const basePathPromise = resolveDictionaryPath(dictionaryPath);

  const loaders = {} as Record<string, () => Promise<unknown>>;

  for (const locale of locales) {
    loaders[locale] = async () => {
      const { readFile } = await import("fs/promises");
      const { join } = await import("path");
      const basePath = await basePathPromise;
      return JSON.parse(await readFile(join(basePath, `${locale}.json`), "utf-8"));
    };
  }

  return loaders as Loaders<TLocales>;
}
