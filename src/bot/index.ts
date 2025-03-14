import { Telegraf } from 'telegraf';

import { LoginCommand } from './commands/login';
import { SetDefaultWalletCommand } from './commands/setDefaultWallet';
import { StartCommand } from './commands/start';
import { UserDetailsCommand } from './commands/userDetails';
import { UserKycCommand } from './commands/userKyc';
import { logMiddleware } from './middlwares/log';
import { redisAuthMiddleware } from './middlwares/redisMiddleware';

export function createBot(token: string) {
  const bot = new Telegraf(token);
  bot.use(logMiddleware);
  bot.use(redisAuthMiddleware());
  const startCommand = new StartCommand();
  const loginCommand = new LoginCommand(bot);
  const userDetailsCommand = new UserDetailsCommand();
  const kycCommand=new UserKycCommand();
  const setDefaultWalletCommand=new SetDefaultWalletCommand(bot);

  bot.start(startCommand.execute);
  bot.command('login',loginCommand.execute);
  bot.command('user',userDetailsCommand.execute);
  bot.command('kyc',kycCommand.execute);
  bot.command('setwallet',setDefaultWalletCommand.execute);
  return bot;
}
