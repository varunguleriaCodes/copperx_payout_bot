import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { walletApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';

export class GetWalletCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken)
      try{
      const userWalletData = await walletApi.getWallets();
      console.log(userWalletData)
      if (!Array.isArray(userWalletData)) {
        console.error('API returned an error:', userWalletData);
        ctx.reply('Failed to fetch wallet details. Please try again later.');
        return;
    }

    if (userWalletData.length === 0) {
        ctx.reply('No wallets found for your account.');
        return;
    }

    // Process and display wallet details
    const walletDetails = userWalletData.map(wallet => 
        `🔹 **Wallet Type**: ${wallet.walletType}\n` +
        `🔹 **Network**: ${wallet.network}\n` +
        `🔹 **Wallet Address**: ${wallet.walletAddress}\n` +
        `🔹 **Default**: ${wallet.isDefault ? '✅ Yes' : '❌ No'}`
    ).join('\n\n');

    ctx.reply(`Here are your wallets:\n\n${walletDetails}`);
        }
        catch{
            ctx.reply('Facing Some issue while trying to fetch details! Try again later!')
        }
      return;
    }
    else{
        ctx.reply('Please Login First! Access Token has expired.')
        return;
    }
    
  };
}