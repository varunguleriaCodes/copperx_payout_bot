import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { NETWORK_MAP } from '../../config';

import { walletApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type IBalance, type ICommand } from './types';
export class GetBalancesCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken);
      try {
        const userBalancesData = await walletApi.getBalances();
        console.log(userBalancesData);

        if (Array.isArray(userBalancesData) && userBalancesData.length > 0) {
          let combinedMessage = '';
          const networkMessages: Record<string, string> = {};

          userBalancesData.forEach(wallet => {
            if ('walletId' in wallet) {
              const networkName = NETWORK_MAP[wallet.network] || 'Unknown Network';
              if (!networkMessages[networkName]) {
                networkMessages[networkName] = `Network: ${networkName}\n`;
              }
              
              let walletMessage = `  Wallet ID: ${wallet.walletId}\n`;
              
              if (Array.isArray(wallet.balances) && wallet.balances.length > 0) {
                walletMessage += '  Your balances:\n';
                wallet.balances.forEach((balance: IBalance) => {
                  walletMessage += `  ${balance.symbol}: ${parseFloat(balance.balance).toFixed(balance.decimals)} (Decimals: ${balance.decimals})\n`;
                });
              } else {
                walletMessage += '  You don\'t have any balance!!\n';
              }
              
              networkMessages[networkName] += walletMessage + '\n';
            }
          });

          combinedMessage = Object.values(networkMessages).join('\n');
          ctx.reply(combinedMessage.trim());
        }else if('message' in userBalancesData){
           await ctx.reply(`Failed to fetch Details. Error Message : ${userBalancesData.message}`)
          } else {
          ctx.reply('No wallets found.');
        }
      } catch {
        ctx.reply('Facing some issue while trying to fetch details! Try again later!');
      }
      return;
    } else {
      ctx.reply('Please Login First! Access Token has expired.');
      return;
    }
  };
}