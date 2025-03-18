import { type Telegraf, type Context } from 'telegraf';

import { transferApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand, type ITransferInputPayment } from './types';

export class EmailTransfer implements ICommand {
  private bot: Telegraf;
  private userState: Map<number, Partial<ITransferInputPayment> & { step: number }>;
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

      const userData = this.userState.get(userId) || { step: 0 };
      const message = ctx.message.text.trim();

      // Skip if the user is trying to use another command
      if (message.startsWith('/') && message !== '/cancel') {
        return next();
      }

      // Handle cancellation
      if (message === '/cancel') {
        this.activeUsers.delete(userId);
        this.userState.delete(userId);
        await ctx.reply('Transfer process cancelled.');
        return next();
      }

      switch (userData.step) {
        case 1:
          this.userState.set(userId, { ...userData, walletAddress: message, step: 2 });
          await ctx.reply('📧 Enter email address:');
          break;
        case 2:
          this.userState.set(userId, { ...userData, email: message, step: 3 });
          await ctx.reply('🆔 Enter payee ID:');
          break;
        case 3:
          this.userState.set(userId, { ...userData, payeeId: message, step: 4 });
          await ctx.reply('💰 Enter amount:');
          break;
        case 4:
          this.userState.set(userId, { ...userData, amount: message, step: 5 });
          await ctx.reply('🎯 Enter purpose code:');
          break;
        case 5:
          this.userState.set(userId, { ...userData, purposeCode: message, step: 6 });
          await ctx.reply('💱 Enter currency:');
          break;
        case 6:
          userData.currency = message;
          await ctx.reply('✅ Sending transfer request...');

          try {
            const existingToken = await ctx.getToken();
            if (!existingToken) {
              await ctx.reply('Please login first! Access token expired!');
              this.activeUsers.delete(userId);
              this.userState.delete(userId);
              return;
            }
            apiService.setAuthToken(existingToken);
            const response = await transferApi.emailTransfer(userData as ITransferInputPayment);
            if ('walletAddress' in response) {
              await ctx.reply('✅ Transfer successful!');
            } else {
              await ctx.reply('❌ Transfer failed. Please try again.');
            }
          } catch (error) {
            await ctx.reply('⚠️ An error occurred during transfer.');
            console.error('Transfer Error:', error);
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
    this.userState.set(userId, { step: 1 });
    
    await ctx.reply('💳 Initiating transfer. Enter wallet address:');
    await ctx.reply('Type /cancel at any time to quit the process.');
  };
}