import { use } from "react";
import { usePathname } from "next/navigation";
import type { I18nConfig, Loaders, DictionaryOf } from "./lib/types";

export function createHooks<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(config: I18nConfig<TLocales, TLoaders>) {
  type Locale = TLocales[number];
  type Dictionary = DictionaryOf<TLoaders>;

  const dictionaryCache = new Map<string, Promise<Dictionary>>();

  const useDictionary = (): Dictionary => {
    const path = usePathname();

    const found = path
      .split("/")
      .find((seg) => (config.locales as readonly string[]).includes(seg));

    const locale: Locale =
      (found as Locale | undefined) ?? config.defaultLocale;

    if (!dictionaryCache.has(locale)) {
      const loader =
        (config.loaders as Record<string, () => Promise<unknown>>)[locale] ??
        (config.loaders as Record<string, () => Promise<unknown>>)[config.defaultLocale];

      dictionaryCache.set(locale, loader() as Promise<Dictionary>);
    }

    return use(dictionaryCache.get(locale)!);
  };

  return { useDictionary };
}
