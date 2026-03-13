import { NextRequest, NextResponse } from "next/server";
import type { I18nConfig, Loaders } from "./lib/types";

export function createMiddleware<
  const TLocales extends readonly string[],
  TLoaders extends Loaders<TLocales>,
>(config: I18nConfig<TLocales, TLoaders>) {
  const middleware = (request: NextRequest): NextResponse | undefined => {
    const { pathname } = request.nextUrl;

    const hasLocale = config.locales.some(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (hasLocale) return undefined;

    request.nextUrl.pathname = `/${config.defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl, { status: 308 });
  };

  const middlewareConfig = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
  } as const;

  return { middleware, middlewareConfig };
}
