import { Telegraf } from 'telegraf';

import { initializePusher } from '../lib/utils/pusherClientConnection';

import { GetBalancesCommand } from './commands/getBalances';
import { GetDefaultWalletCommand } from './commands/getDefaultWallet';
import { GetWalletCommand } from './commands/getWallets';
import { LoginCommand } from './commands/login';
import { SetDefaultWalletCommand } from './commands/setDefaultWallet';
import { TransferListCommand } from './commands/showTransferList';
import { StartCommand } from './commands/start';
import { UserDetailsCommand } from './commands/userDetails';
import { UserKycCommand } from './commands/userKyc';
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

  bot.start(startCommand.execute);
  bot.command('login',loginCommand.execute);
  bot.command('user',userDetailsCommand.execute);
  bot.command('kyc',kycCommand.execute);
  bot.command('setwallet',setDefaultWalletCommand.execute);
  bot.command('balance',getBalancesCommand.execute);
  bot.command('defaultwallet',getDefaultWalletCommand.execute);
  bot.command('wallets',getWallets.execute);
  bot.command('transferlist',transferListCommand.execute);
  // const pusherClient = new Pusher(process.env.VITE_PUSHER_KEY!, {
  //   cluster: process.env.VITE_PUSHER_CLUSTER!,
  //   authorizer: (channel) => ({
  //     authorize: async (socketId, callback) => {
  //       try {
  //         const response = await axios.post('/api/notifications/auth', {
  //           socket_id: socketId,
  //           channel_name: channel.name
  //         }, {
  //           headers: {
  //             Authorization: `Bearer ${token}`
  //           }
  //         });

  //         if (response.data) {
  //           callback(null, response.data);
  //         } else {
  //           callback(new Error('Pusher authentication failed'), null);
  //         }
  //       } catch (error) {
  //         console.error('Pusher authorization error:', error);
  //         callback(error, null);
  //       }
  //     }
  //   })
  // });

  // // Subscribe to private organization channel
  // const channel = pusherClient.subscribe(`private-org-${process.env.organizationId}`);

  // channel.bind('pusher:subscription_succeeded', () => {
  //   console.log('Successfully subscribed to private channel');
  // });

  // channel.bind('pusher:subscription_error', (error) => {
  //   console.error('Subscription error:', error);
  // });

  // // Listen for deposit events
  // channel.bind('deposit', (data) => {
  //   bot.telegram.sendMessage(
  //     chatId,
  //     `💰 *New Deposit Received*\n\n${data.amount} USDC deposited on Solana`,
  //     { parse_mode: 'Markdown' }
  //   );
  // });

  return bot;
}
