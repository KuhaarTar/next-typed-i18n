import type { I18nConfig, Loaders, DictionaryOf } from "./lib/types";
import type { I18nLogger } from "./lib/logger";

export function createDictionary<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(
  config: I18nConfig<TLocales, TLoaders>,
  getLocale: () => TLocales[number],
  logger: I18nLogger,
) {
  type Locale = TLocales[number];
  type Dictionary = DictionaryOf<TLoaders>;

  const getDictionary = async (locale?: Locale): Promise<Dictionary> => {
    let lang: Locale;

    if (locale) {
      lang = locale;
    } else {
      try {
        lang = getLocale();
      } catch {
        logger.warn("Locale not initialized. Falling back to default locale.");
        lang = config.defaultLocale;
      }
    }

    const loader =
      (config.loaders as Record<string, () => Promise<unknown>>)[lang] ??
      (config.loaders as Record<string, () => Promise<unknown>>)[config.defaultLocale];

    return loader() as Promise<Dictionary>;
  };

  return { getDictionary };
}
