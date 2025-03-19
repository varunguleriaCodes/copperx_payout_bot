import { type Telegraf, type Context } from 'telegraf';

import { transferApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';

export class BankWithdrawalCommand implements ICommand {
  private bot: Telegraf;
  private userState: Map<number, { step: number }>;
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

      // Skip if user is trying to use another command
      if (message.startsWith('/') && message !== '/cancel') {
        return next();
      }

      // Handle cancellation
      if (message === '/cancel') {
        this.activeUsers.delete(userId);
        this.userState.delete(userId);
        await ctx.reply('Bank withdrawal process cancelled.');
        return next();
      }

      switch (userData.step) {
        case 1:
          try {
            const existingToken = await ctx.getToken();
            if (!existingToken) {
              await ctx.reply('Please login first! Access token expired!');
              this.activeUsers.delete(userId);
              this.userState.delete(userId);
              return;
            }
            apiService.setAuthToken(existingToken);
            const requestPayload = JSON.parse(message);
            await ctx.reply('✅ Sending request...');
            
            const response = await transferApi.bankWithdrawal(requestPayload);
            
            if (response && 'id' in response) {
              await ctx.reply('✅ Request submitted successfully!');
            } else {
              await ctx.reply('❌ Request submission failed. Please try again.');
            }
          } catch (error) {
            await ctx.reply('❌ Invalid JSON format. Please enter request data in valid JSON format.');
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
    
    await ctx.reply('Enter request data in JSON format:');
  };
}