import { type Telegraf, type Context } from 'telegraf';

import { transferApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand, type ITransferInputPayment } from './types';

export class EmailTransfer implements ICommand {
  private bot: Telegraf;
  private userState: Map<number, Partial<ITransferInputPayment> & { step: number }>;
  private activeUsers: Set<number>;

  // Hardcoded values
  private readonly DEFAULT_CURRENCY = 'USD';
  private readonly DEFAULT_PURPOSE_CODE = 'self';

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

      if (message.startsWith('/') && message !== '/cancel') {
        return next();
      }

      if (message === '/cancel') {
        this.activeUsers.delete(userId);
        this.userState.delete(userId);
        await ctx.reply('Transfer process cancelled.');
        return next();
      }

      switch (userData.step) {
        case 1:
          this.userState.set(userId, { 
            ...userData, 
            walletAddress: message, 
            step: 2,
            // Set hardcoded values right from the start
            currency: this.DEFAULT_CURRENCY,
            purposeCode: this.DEFAULT_PURPOSE_CODE
          });
          await ctx.reply('Enter email address:');
          break;
        case 2:
          this.userState.set(userId, { ...userData, email: message, step: 3 });
          await ctx.reply('Enter payee ID:');
          break;
        case 3:
          this.userState.set(userId, { ...userData, payeeId: message, step: 4 });
          await ctx.reply('Enter amount:');
          break;
        case 4:
          this.userState.set(userId, { ...userData, amount: message });
          
          // Prepare summary with the hardcoded values
          const transferData = this.userState.get(userId) as ITransferInputPayment;
          await ctx.reply(
            '📝 Transfer Summary:\n' +
            `Wallet Address: ${transferData.walletAddress}\n` +
            `Email: ${transferData.email}\n` +
            `Payee ID: ${transferData.payeeId}\n` +
            `Amount: ${transferData.amount} ${this.DEFAULT_CURRENCY}\n` +
            `Purpose Code: ${this.DEFAULT_PURPOSE_CODE}\n\n` +
            'Sending transfer request...'
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
            const response = await transferApi.emailTransfer(transferData);
            if ('walletAddress' in response) {
              await ctx.reply('✅ Transfer successful!');
            } else if('message' in response){
              await ctx.reply(`Failed to fetch Details. Error Message : ${response.message}`)
            } else {
              await ctx.reply('❌ Transfer failed. Please try again.');
            }
          } catch (error) {
            await ctx.reply('⚠️ An error occurred during transfer.');
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
      // Pre-initialize with hardcoded values
      currency: this.DEFAULT_CURRENCY,
      purposeCode: this.DEFAULT_PURPOSE_CODE
    });
    
    await ctx.reply('Initiating transfer. Enter wallet address:');
    await ctx.reply(`Note: Currency (${this.DEFAULT_CURRENCY}) and purpose code (${this.DEFAULT_PURPOSE_CODE}) are set automatically.`);
    await ctx.reply('Type /cancel at any time to quit the process.');
  };
}