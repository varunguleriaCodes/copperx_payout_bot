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
      const userId = ctx.from?.id;
      if (!userId) return;
      
      // Check if user is already logged in
      const existingToken = await ctx.getToken();
      if (existingToken) {
        ctx.reply('✅ You are already logged in.');
        return;
      }
      
      const userEmail = ctx.message.text.trim();
      if (!this.isValidEmail(userEmail)) {
        ctx.reply('❌ Invalid email format. Please enter a valid email address.');
        return;
      }
      
      try {
        const otpCallResponse = await authApi.sendOtp(userEmail);
        if ('email' in otpCallResponse) {
          ctx.reply(`📩 OTP sent to ${otpCallResponse.email}. Please enter the OTP:`);
          this.userState.set(userId, {
            email: otpCallResponse.email,
            sid: otpCallResponse.sid,
            step: 'awaitingOtp'
          });
        } else {
          ctx.reply('❌ Failed to send OTP. Please try again later.');
        }
      } catch (error) {
        ctx.reply('⚠️ An error occurred while sending OTP.');
        console.error('OTP Send Error:', error);
      }
    });
    
    // Step 2: Expect OTP after email is entered
    this.bot.hears(/^\d{6}$/, async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      
      // Check if user is already logged in
      const existingToken = await ctx.getToken();
      if (existingToken) {
        ctx.reply('✅ You are already logged in.');
        return;
      }
      
      const userData = this.userState.get(userId);
      if (!userData || userData.step !== 'awaitingOtp') {
        ctx.reply('⚠️ Please enter your email first.');
        return;
      }
      
      try {
        const params: IVerifyData = {
          email: userData.email!,
          sid: userData.sid!,
          otp: ctx.message.text.trim()
        };
        const verifyOtpResponse = await authApi.verifyOtp(params);
        
        if ('accessToken' in verifyOtpResponse) {
          await ctx.saveToken(verifyOtpResponse.accessToken);
          ctx.reply('✅ OTP verified successfully! You are now logged in.');
          this.userState.set(userId, { step: 'done' });
        } else {
          ctx.reply('❌ OTP verification failed! Please try again.');
        }
      } catch (error) {
        ctx.reply('⚠️ An error occurred during OTP verification.');
        console.error('OTP Verification Error:', error);
      }
    });
    
    // Handle any other input - make this a lower priority handler
    this.bot.hears('text', async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      
      // Check if user is already logged in - ALWAYS CHECK FIRST
      const existingToken = await ctx.getToken();
      if (existingToken) {
        ctx.reply('✅ You are already logged in.');
        // Don't respond to further messages if already logged in
        return;
      }
      
      const userData = this.userState.get(userId);
            
      if (!userData) {
        ctx.reply('🔹 Please enter your email to begin the login process.');
      } else if (userData.step === 'awaitingOtp') {
        ctx.reply('🔹 Please enter the OTP sent to your email.');
      } else if (userData.step === 'done') {
        // User is done with login process
        return;
      } else {
        ctx.reply('❌ Invalid input. Please enter a valid email address.');
      }
    });
  }
  
  public execute = async (ctx: Context): Promise<void> => {
    if (!ctx.from) {
      ctx.reply('⚠️ An error occurred. Please try again.');
      return;
    }
    
    // Check if user is already logged in before starting the process
    const existingToken = await ctx.getToken();
    if (existingToken) {
      ctx.reply('✅ You are already logged in.');
      return;
    }
        
    ctx.reply('📧 Please enter your email to verify:');
    this.userState.set(ctx.from.id, { step: 'awaitingEmail' });
  };
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}