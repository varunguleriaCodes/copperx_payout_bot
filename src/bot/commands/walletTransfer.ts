import { type Telegraf, type Context } from 'telegraf';

import { transferApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type IWalletTransfer, type ICommand } from './types';

export class WalletTransferCommand implements ICommand {
  private bot: Telegraf;
  private userState: Map<number, { step: number; data?: Partial<IWalletTransfer> }>;
  private activeUsers: Set<number>;
  
  constructor(bot: Telegraf) {
    this.bot = bot;
    this.userState = new Map();
    this.activeUsers = new Set();
    this.setupListeners();
  }

  private setupListeners(): void {
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId || !this.activeUsers.has(userId) || !ctx.message || !('text' in ctx.message)) {
        return next();
      }

      const userData = this.userState.get(userId) || { step: 0, data: {} };
      const message = ctx.message.text.trim();

      if (message.startsWith('/') && message !== '/cancel') {
        return next();
      }

      if (message === '/cancel') {
        this.activeUsers.delete(userId);
        this.userState.delete(userId);
        await ctx.reply('Wallet transfer process cancelled.');
        return next();
      }

      switch (userData.step) {
        case 1:
          userData.data!.walletAddress = message;
          await ctx.reply('Enter amount');
          this.userState.set(userId, { step: 2, data: userData.data });
          break;
        case 2:
          userData.data!.amount = message || userData.data!.amount;
          userData.data!.purposeCode = 'SELF';
          userData.data!.currency = 'USD';
          
          await ctx.reply(
            '📝 Transfer Summary:\n' +
            `Wallet Address: ${userData.data!.walletAddress}\n` +
            `Amount: ${userData.data!.amount} ${userData.data!.currency}\n` +
            `Purpose Code: ${userData.data!.purposeCode}\n\n` +
            'Sending wallet transfer request...'
          );
          
          try {
            const existingToken = await ctx.getToken();
            if (!existingToken) {
              await ctx.reply('Please login first! Access token expired!');
              this.activeUsers.delete(userId);
              this.userState.delete(userId);
              return;
            }
            apiService.setAuthToken(existingToken);
            const response = await transferApi.walletTransfer(userData.data as IWalletTransfer);
            if (response && 'id' in response) {
              await ctx.reply(`✅ Transfer successful! Transaction ID: ${response.id}`);
            } else if('message' in response){
              await ctx.reply(`Failed to fetch Details. Error Message : ${response.message}`)
            }
          } catch (error) {
            console.error('Transfer error:', error);
            await ctx.reply('An error occurred while processing the transfer.');
          }
          
          this.activeUsers.delete(userId);
          this.userState.delete(userId);
          break;
        default:
          await ctx.reply('❌ Invalid input. Please start again.');
          this.activeUsers.delete(userId);
          this.userState.delete(userId);
          break;
      }
    });
  }

  public execute = async (ctx: Context): Promise<void> => {
    if (!ctx.from) {
      await ctx.reply('An error occurred. Please try again.');
      return;
    }
    
    const userId = ctx.from.id;
    this.activeUsers.add(userId);
    this.userState.set(userId, { 
      step: 1, 
      data: {
        purposeCode: 'self',
        currency: 'USD'
      } 
    });
    
    await ctx.reply('Enter your wallet address:');
  };
}
