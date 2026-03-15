"use client";

import { use } from "react";
import { usePathname } from "next/navigation";
import type { DictionaryOf, I18nConfig, Loaders } from "./lib/types";

export function createI18nClient<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(config: I18nConfig<TLocales, TLoaders>) {
  type Locale = TLocales[number];
  type Dictionary = DictionaryOf<TLoaders>;

  const dictionaryCache = new Map<Locale, Promise<Dictionary>>();
  const localeSet = new Set<string>(config.locales as readonly string[]);

  const getCachedDictionary = (locale: Locale): Promise<Dictionary> => {
    if (!dictionaryCache.has(locale)) {
      const loader =
        (config.loaders as Record<string, () => Promise<unknown>>)[locale] ??
        (config.loaders as Record<string, () => Promise<unknown>>)[config.defaultLocale];

      dictionaryCache.set(locale, loader() as Promise<Dictionary>);
    }

    return dictionaryCache.get(locale)!;
  };

  const useDictionary = (): Dictionary => {
    const pathname = usePathname();

    const locale =
      (pathname.split("/").find((segment) => localeSet.has(segment)) as Locale | undefined) ??
      config.defaultLocale;

    return use(getCachedDictionary(locale));
  };

  return { useDictionary };
}

export type { I18nConfig, Loaders, DictionaryOf } from "./lib/types";
