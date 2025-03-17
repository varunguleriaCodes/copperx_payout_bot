import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { walletApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type IBalance, type ICommand} from './types';
export class GetBalancesCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken)
      try{
      const userBalancesData = await walletApi.getBalances();
      console.log(userBalancesData)
      if (Array.isArray(userBalancesData) && userBalancesData.length > 0) {
        userBalancesData.forEach(wallet => {
            if ('walletId' in wallet) {
                if (Array.isArray(wallet.balances) && wallet.balances.length > 0) {
                    let balanceMessage = `Wallet ID: ${wallet.walletId} (${wallet.network})\nYour balances:\n`;
    
                    wallet?.balances?.forEach((balance:IBalance) => {
                        balanceMessage += `🔹 ${balance.symbol}: ${parseFloat(balance.balance).toFixed(balance.decimals)} (Decimals: ${balance.decimals})\n`;
                    });
    
                    ctx.reply(balanceMessage);
                } else {
                    ctx.reply(`Wallet ID: ${wallet.walletId} (${wallet.network})\nYou don't have any balance!!`);
                }
            } else {
                ctx.reply('No wallet information found.');
            }
        });
    } else {
        ctx.reply('No wallets found.');
    }
    
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
