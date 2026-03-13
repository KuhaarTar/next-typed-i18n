import { I18nLogger } from "./lib/logger";
import { createLocale } from "./locale";
import { createDictionary } from "./dictionary";
import { createHooks } from "./hooks";
import { createMiddleware } from "./middleware";
import { createStaticParams } from "./static-params";
import { createDefaultLoaders } from "./default-loaders";
import type { I18nConfig, Loaders } from "./lib/types";

export function createI18n<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(config: I18nConfig<TLocales, TLoaders>) {
  const logger = new I18nLogger(config.debug);
  const loaders = (config.loaders ?? createDefaultLoaders(config.locales, config.dictionaryPath)) as TLoaders;
  const resolvedConfig = { ...config, loaders };

  const { setLocale, getLocale } = createLocale(resolvedConfig);
  const { getDictionary } = createDictionary(resolvedConfig, getLocale, logger);
  const { useDictionary } = createHooks(resolvedConfig);
  const { middleware, middlewareConfig } = createMiddleware(resolvedConfig);
  const { getStaticParams } = createStaticParams(resolvedConfig);

  return {
    setLocale,
    getLocale,
    getDictionary,
    useDictionary,
    middleware,
    middlewareConfig,
    getStaticParams,
    locales: config.locales,
    defaultLocale: config.defaultLocale,
  };
}
