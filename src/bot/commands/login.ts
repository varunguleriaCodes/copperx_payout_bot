import { type Telegraf, type Context } from 'telegraf';

import { authApi } from '../api_calls/apiEndpoint';

import { type IVerifyData, type ICommand } from './types';

export class LoginCommand implements ICommand {
  private bot: Telegraf;
  private userState: Map<number, { email?: string; sid?: string; step: 'awaitingEmail' | 'awaitingOtp' | 'done' }>;

  constructor(bot: Telegraf) {
    this.bot = bot;
    this.userState = new Map(); // Track user states
    this.setupListeners();
  }

  private setupListeners(): void {
    // Step 1: Ask for Email
    this.bot.hears(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, async (ctx) => {
      const userEmail = ctx.message.text.trim();
      const userId = ctx.from?.id;
      if (!userId) return;

      if (!this.isValidEmail(userEmail)) {
        ctx.reply('Please enter a valid email address.');
        return;
      }

      try {
        const otpCallResponse = await authApi.sendOtp(userEmail);
        if ('email' in otpCallResponse && otpCallResponse.email) {
          ctx.reply(`Email sent to ${otpCallResponse.email}. Please enter the OTP:`);

          // Update user state to expect OTP next
          this.userState.set(userId, {
            email: otpCallResponse.email,
            sid: otpCallResponse.sid,
            step: 'awaitingOtp'
          });
        } else {
          ctx.reply('Failed to send OTP! Please try again later.');
        }
      } catch (error) {
        ctx.reply('An error occurred while sending OTP.');
        console.error('OTP Send Error:', error);
      }
    });

    // Step 2: Expect OTP after email is entered
    this.bot.hears(/^\d{6}$/, async (ctx) => {
      const userEnteredOtp = ctx.message.text.trim();
      const userId = ctx.from?.id;
      if (!userId) return;

      const userData = this.userState.get(userId);
      if (!userData || userData.step !== 'awaitingOtp') {
        ctx.reply('Please enter your email first.');
        return;
      }

      try {
        const params: IVerifyData = {
          email: userData.email!,
          sid: userData.sid!,
          otp: userEnteredOtp
        };
        const verifyOtpResponse = await authApi.verifyOtp(params);

        if ('accessToken' in verifyOtpResponse) {
          ctx.reply('✅ OTP verified successfully! You are now logged in.');
          
          // Mark user as done
          this.userState.set(userId, { step: 'done' });
        } else {
          ctx.reply('❌ OTP verification failed! Please try again.');
        }
      } catch (error) {
        ctx.reply('An error occurred during OTP verification.');
        console.error('OTP Verification Error:', error);
      }
    });

    // Handle unexpected inputs after completion
    this.bot.hears(/.*/, (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const userData = this.userState.get(userId);

      if (!userData) {
        ctx.reply('Please enter your email to begin the login process.');
      } else if (userData.step === 'awaitingOtp') {
        ctx.reply('Please enter the OTP sent to your email.');
      } else if (userData.step === 'done') {
        ctx.reply('✅ You are already verified. No further action is needed.');
        return;
      } else {
        ctx.reply('Invalid input. Please enter a valid email address.');
      }
    });
  }

  public execute = async (ctx: Context): Promise<void> => {
    if (!ctx.from) {
      ctx.reply('An error occurred. Please try again.');
      return;
    }

    ctx.reply('Please enter your email to verify:');
    this.userState.set(ctx.from.id, { step: 'awaitingEmail' });
  };

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
