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

      // Skip if user is trying to use another command
      if (message.startsWith('/') && message !== '/cancel') {
        return next();
      }

      // Handle cancellation
      if (message === '/cancel') {
        this.activeUsers.delete(userId);
        this.userState.delete(userId);
        await ctx.reply('Wallet transfer process cancelled.');
        return next();
      }

      switch (userData.step) {
        case 1:
          userData.data!.walletAddress = message;
          await ctx.reply('💰 Enter amount:');
          this.userState.set(userId, { step: 2, data: userData.data });
          break;
        case 2:
          userData.data!.amount = message;
          await ctx.reply('🎯 Enter purpose code:');
          this.userState.set(userId, { step: 3, data: userData.data });
          break;
        case 3:
          userData.data!.purposeCode = message;
          await ctx.reply('💱 Enter currency:');
          this.userState.set(userId, { step: 4, data: userData.data });
          break;
        case 4:
          userData.data!.currency = message;
          await ctx.reply('✅ Sending wallet transfer request...');
          
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
            } else {
              await ctx.reply('❌ Transfer failed. Please try again.');
            }
          } catch (error) {
            await ctx.reply('⚠️ An error occurred while processing the transfer.');
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
      
      // Don't call next() here to prevent other handlers from processing this message
    });
  }

  public execute = async (ctx: Context): Promise<void> => {
    if (!ctx.from) {
      await ctx.reply('⚠️ An error occurred. Please try again.');
      return;
    }
    
    const userId = ctx.from.id;
    this.activeUsers.add(userId);
    this.userState.set(userId, { step: 1, data: {} });
    
    await ctx.reply('📋 Enter your wallet address:');
    await ctx.reply('Type /cancel at any time to quit the process.');
  };
}