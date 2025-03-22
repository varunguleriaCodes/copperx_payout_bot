import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { NETWORK_MAP } from '../../config';

import { walletApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';

export class GetDefaultWalletCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken);
      try {
        const userDefaultWalletData = await walletApi.getDefaultWallet();
        console.log(userDefaultWalletData);
        
        if ('id' in userDefaultWalletData) {
          const networkName = NETWORK_MAP[userDefaultWalletData.network] || userDefaultWalletData.network;
          
          ctx.reply(`Default Wallet: ${networkName}`);
        } else if('message' in userDefaultWalletData){
          await ctx.reply(`Failed to fetch Details. Error Message : ${userDefaultWalletData.message}`)
        } else {
          await ctx.reply('No Default Wallet Set!!');
        }
      } catch {
        ctx.reply('Facing Some issue while trying to fetch details! Try again later!');
      }
      return;
    } else {
      ctx.reply('Please Login First! Access Token has expired.');
      return;
    }
  };
}