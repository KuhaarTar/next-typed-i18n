import { cache } from "react";
import { I18nError } from "./lib/errors";
import type { I18nConfig, Loaders } from "./lib/types";

export function createLocale<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(config: I18nConfig<TLocales, TLoaders>) {
  type Locale = TLocales[number];

  let requestLocale: Locale | undefined;

  const setLocale = (locale: Locale): void => {
    requestLocale = locale;
  };

  const getLocale = cache((): Locale => {
    if (!requestLocale) {
      throw new I18nError(
        "Locale not initialized." +
        "Make sure setLocale() is called in your root layout before using getLocale().",
      );
    }
    return requestLocale;
  });

  return { setLocale, getLocale };
}
