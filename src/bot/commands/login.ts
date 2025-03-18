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
    // Message handler for login flow
    this.bot.on('message', async (ctx, next) => {
      if (!ctx.message || !('text' in ctx.message) || !ctx.from) {
        return next();
      }
      
      const userId = ctx.from.id;
      const messageText = ctx.message.text;
      const userData = this.userState.get(userId);
      
      // If user is not in login flow or has completed it, pass to next middleware
      if (!userData || userData.step === 'done') {
        return next();
      }
      
      // Step 1: Process email input
      if (userData.step === 'awaitingEmail') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(messageText)) {
          try {
            const otpCallResponse = await authApi.sendOtp(messageText);
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
        } else {
          ctx.reply('❌ Invalid email format. Please enter a valid email address.');
        }
        return; // Stop processing further handlers
      }
      
      // Step 2: Process OTP input
      if (userData.step === 'awaitingOtp') {
        const otpRegex = /^\d{6}$/;
        if (otpRegex.test(messageText)) {
          try {
            const params: IVerifyData = {
              email: userData.email!,
              sid: userData.sid!,
              otp: messageText
            };
            const verifyOtpResponse = await authApi.verifyOtp(params);
            
            if ('accessToken' in verifyOtpResponse) {
              await ctx.saveToken(verifyOtpResponse.accessToken);
              ctx.reply('✅ OTP verified successfully! You are now logged in.');
              this.userState.set(userId, { step: 'done' });
              setTimeout(() => {
                // Clean up state after a delay
                this.userState.delete(userId);
              }, 5000);
            } else {
              ctx.reply('❌ OTP verification failed! Please try again.');
            }
          } catch (error) {
            ctx.reply('⚠️ An error occurred during OTP verification.');
            console.error('OTP Verification Error:', error);
          }
        } else {
          ctx.reply('🔹 Please enter the 6-digit OTP sent to your email.');
        }
        return; // Stop processing further handlers
      }
      
      // If we reach here, proceed to next middleware
      return next();
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
    
    // Clean up any existing state for this user
    this.userState.delete(ctx.from.id);
    
    ctx.reply('📧 Please enter your email to verify:');
    this.userState.set(ctx.from.id, { step: 'awaitingEmail' });
  };
}