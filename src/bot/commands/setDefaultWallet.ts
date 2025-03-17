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

        this.bot.hears(/.+/, async (ctx) => {
            console.log('17777');

            const existingToken = await ctx.getToken(); // Ensuring `getToken` is accessed correctly
            
            if (existingToken) {
                apiService.setAuthToken(existingToken);
                try {
                    const walletId = ctx.message.text; 
                    const userWalletData = await walletApi.setdefaultWallet(walletId);
                    console.log(userWalletData);

                    if ('id' in userWalletData) {
                        await ctx.reply('Default Wallet Updated!');
                    } else {
                        await ctx.reply('Unable to update Default Wallet! Please try again later!');
                    }
                } catch (error) {
                    console.error('Error fetching details:', error);
                    await ctx.reply('Facing some issue while trying to fetch details! Try again later!');
                }
                return;
            } else {
                await ctx.reply('Please Login First! Access Token has expired.');
                return;
            }
        });
    };
}
