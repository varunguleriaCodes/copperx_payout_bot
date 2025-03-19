import { Telegraf } from 'telegraf';

import { initializePusher } from '../lib/utils/pusherClientConnection';

import { BankWithdrawalCommand } from './commands/bankWithdrawal';
import { BulkTransfersCommand } from './commands/bulkTransfer';
import { EmailTransfer } from './commands/emailTransfer';
import { GetBalancesCommand } from './commands/getBalances';
import { GetDefaultWalletCommand } from './commands/getDefaultWallet';
import { GetWalletCommand } from './commands/getWallets';
import { HelpCommand } from './commands/help';
import { LoginCommand } from './commands/login';
import { SetDefaultWalletCommand } from './commands/setDefaultWallet';
import { TransferListCommand } from './commands/showTransferList';
import { StartCommand } from './commands/start';
import { UserDetailsCommand } from './commands/userDetails';
import { UserKycCommand } from './commands/userKyc';
import { WalletTransferCommand } from './commands/walletTransfer';
import { logMiddleware } from './middlwares/log';
import { redisAuthMiddleware } from './middlwares/redisMiddleware';
import { pusherClient } from './pusherClient'; 

export function createBot(token: string) {
  const bot = new Telegraf(token);
  bot.use(logMiddleware);
  bot.use(redisAuthMiddleware());
  bot.use(async (ctx, next) => {
    if (!pusherClient && ctx.chat?.id && await ctx.getToken()) {
      initializePusher(bot,ctx);
    }
    return next();
  });

  const startCommand = new StartCommand();
  const loginCommand = new LoginCommand(bot);
  const userDetailsCommand = new UserDetailsCommand();
  const kycCommand=new UserKycCommand();
  const setDefaultWalletCommand=new SetDefaultWalletCommand(bot);
  const getBalancesCommand= new GetBalancesCommand();
  const getDefaultWalletCommand= new GetDefaultWalletCommand();
  const getWallets= new GetWalletCommand();
  const transferListCommand= new TransferListCommand(); 
  const emailTransfer=new EmailTransfer(bot);
  const walletTransferCommand= new WalletTransferCommand(bot);
  const bulkTransfersCommand= new BulkTransfersCommand(bot);
  const bankWithdrawalCommand= new BankWithdrawalCommand(bot);
  const helpCommand = new HelpCommand();

  bot.start(startCommand.execute);
  bot.command('login',loginCommand.execute);
  bot.command('user',userDetailsCommand.execute);
  bot.command('kyc',kycCommand.execute);
  bot.command('setdefaultwallet',setDefaultWalletCommand.execute);
  bot.command('balance',getBalancesCommand.execute);
  bot.command('defaultwallet',getDefaultWalletCommand.execute);
  bot.command('wallets',getWallets.execute);
  bot.command('transfers',transferListCommand.execute);
  bot.command('transfer',emailTransfer.execute);
  bot.command('wallettransfer',walletTransferCommand.execute);
  bot.command('bulktransfer',bulkTransfersCommand.execute);
  bot.command('withdraw',bankWithdrawalCommand.execute);
  bot.command('help',helpCommand.execute);
  return bot;
}
