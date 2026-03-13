export type Loaders<TLocales extends readonly string[]> = {
  [K in TLocales[number]]: () => Promise<unknown>;
};

export type DictionaryOf<TLoaders extends Record<string, () => Promise<unknown>>> =
  Awaited<ReturnType<TLoaders[keyof TLoaders]>>;

export type I18nConfig<
  TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
> = {
  locales: TLocales;
  defaultLocale: TLocales[number];
  loaders?: TLoaders;
  dictionaryPath?: string;
  debug?: boolean;
};
