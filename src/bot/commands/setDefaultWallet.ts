import { type Telegraf, type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { NETWORK_MAP } from '../../config';

import { walletApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';

export class SetDefaultWalletCommand implements ICommand {
    private bot: Telegraf;
    private validNetworks = ['polygon', 'arbitrum', 'base', 'starknet'];
    
    constructor(bot: Telegraf) {
        this.bot = bot;
    }
    
    public execute = async (ctx: Context<Update>): Promise<void> => {
        await ctx.reply('Please Choose the default Wallet:\nPolygon\nArbitrum\nBase\nStarknet');
        
        this.bot.use(async (ctx, next) => {
            if (ctx.message && 'text' in ctx.message) {
                const selectedNetwork = ctx.message.text.trim().toLowerCase();
                
                if (this.validNetworks.includes(selectedNetwork)) {
                    await this.handleNetworkSelection(ctx, selectedNetwork);
                    return;
                }
                else{
                    await ctx.reply('Please select from the mentioned network wallets!');
                    return;
                }
            }
            
            await next();
        });
    };
    
    private handleNetworkSelection = async (ctx: Context<Update>, selectedNetwork: string): Promise<void> => {
        try {
            const existingToken = await ctx.getToken();
            
            if (!existingToken) {
                await ctx.reply('Please Login First! Access Token has expired.');
                return;
            }
            
            apiService.setAuthToken(existingToken);
            
            const userWallets = await walletApi.getWallets();
            
            if (!Array.isArray(userWallets)) {
                await ctx.reply('Unable to fetch your wallets. Please try again later.');
                return;
            }
            
            const selectedWallet = userWallets.find(wallet => 
                NETWORK_MAP[wallet.network].toLowerCase() === selectedNetwork
            );
            
            if (!selectedWallet) {
                const displayNetwork = selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1);
                await ctx.reply(`You don't have a wallet on ${displayNetwork}. Please create one first.`);
                return;
            }
            
            const result = await walletApi.setdefaultWallet(selectedWallet.id);
            
            if ('id' in result) {
                const displayNetwork = selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1);
                await ctx.reply(`Default Wallet Updated to ${displayNetwork}!`);
            } else if('message' in result){
                await ctx.reply(`Failed to fetch Details. Error Message : ${result.message}`)
            } 
            
        } catch (error) {
            console.error('Error updating default wallet:', error);
            await ctx.reply('Facing some issue while trying to update default wallet! Try again later!');
        }
    };
}