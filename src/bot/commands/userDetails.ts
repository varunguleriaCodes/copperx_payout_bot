import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { authApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ICommand } from './types';

export class UserDetailsCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken)
      try{
      const userData = await authApi.userDetails();
      if('id' in userData){
      ctx.reply(`User Account Details:
                \n-Status: ${userData.status}
                \n-Email: ${userData.email}
                \n-Role: ${userData.role}
                \n-Wallet Type: ${userData.walletAccountType}
                \n-Organization ID: ${userData.organizationId}
                \n-Wallet ID: ${userData.walletId}`
                );
        }
        else if('message' in userData){
          await ctx.reply(`Failed to fetch Details. Error Message : ${userData.message}`)
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
