import { Telegraf } from 'telegraf';

import { LoginCommand } from './commands/login';
import { StartCommand } from './commands/start';
import { logMiddleware } from './middlwares/log';

export function createBot(token: string) {
  const startCommand = new StartCommand();
  const bot = new Telegraf(token);
  const loginCommand = new LoginCommand(bot);

  bot.use(logMiddleware);

  bot.start(startCommand.execute);
  bot.command('login',loginCommand.execute);
  return bot;
}
