import type { I18nConfig, Loaders } from "./lib/types";

export function createStaticParams<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(config: I18nConfig<TLocales, TLoaders>) {
  const getStaticParams = (paramName = "lang") => {
    return config.locales.map((locale) => ({ [paramName]: locale }));
  };

  return { getStaticParams };
}
