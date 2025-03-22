import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { kycApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';
export class UserKycCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken)
      try{
      const userkycData = await kycApi.userStatus();
      console.log(userkycData)
      if('hasMore' in userkycData && userkycData.data.length>0){
        ctx.reply(`KYC Status: ${userkycData.data[0].status}`)
      }else if('message' in userkycData){
       await ctx.reply(`Failed to fetch Details. Error Message : ${userkycData.message}`)
      } 
      else{
        ctx.reply('Please start your kyc first, to get details!!')
      }
        }
        catch{
            ctx.reply('Facing Some issue while trying to fetch details! Try again later!')
        }
      return;
    }
    else{
        ctx.reply('Please Login First!')
        return;
    }
    
  };
}
