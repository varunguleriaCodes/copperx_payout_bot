import { type Telegraf, type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { walletApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';
export class SetDefaultWalletCommand implements ICommand {
    private bot: Telegraf;
    
    constructor(bot: Telegraf) {
      this.bot = bot;
    }
  public execute = async (ctx: Context<Update>): Promise<void> => {
    await ctx.reply('Please Choose the default Wallet');
    this.bot.hears('text',async(ctx)=>{
        const existingToken = await ctx.getToken();
        if (existingToken) {
          apiService.setAuthToken(existingToken)
          try{
          const walletId = ctx.message.text; 
          const userWalletData = await walletApi.setdefaultWallet(walletId);
          console.log(userWalletData)
          if('id' in userWalletData){
             ctx.reply('Default Wallet Updated!')
          }
          else{
            ctx.reply('Unable to update Default Wallet! Please try again later!')
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
    })
    
  };
}
