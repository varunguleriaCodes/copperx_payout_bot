import { type Context, type Middleware } from 'telegraf';

import { tokenService } from '../../lib/utils/redis';

// Extend Telegraf's Context globally
declare module 'telegraf' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Context {
    token?: string | null;
    saveToken: (token: string) => Promise<boolean>;
    getToken: () => Promise<string | null>;
    deleteToken: () => Promise<boolean>;
  }
}

export function redisAuthMiddleware(): Middleware<Context> {
  return async (ctx, next) => {
    if (!ctx.from) {
      return next();
    }

    const userId = ctx.from.id;

    // Inject token functions into context
    ctx.getToken = async () => await tokenService.getToken(userId);
    ctx.saveToken = async (token: string) => await tokenService.saveToken(userId, token);
    ctx.deleteToken = async () => await tokenService.deleteToken(userId);

    ctx.token = await ctx.getToken();

    return next();
  };
}
