import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { transferApi } from '../api_calls/apiEndpoint';
import { apiService } from '../api_calls/centralizedApiCalls';

import { type ITransfer, type ICommand } from './types';

export class TransferListCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    const existingToken = await ctx.getToken();
    if (existingToken) {
      apiService.setAuthToken(existingToken)
      try{
      const userTransferData = await transferApi.transferListing();
      console.log(userTransferData)
      if('data' in userTransferData && userTransferData.data.length>0){
      let message = '📋 *Last Transactions:*\n\n';
      userTransferData.data.forEach((transaction:ITransfer, index:number) => {
      message += `🔹 *Transaction ${index + 1}*\n`;
      message += `🆔 ID: \`${transaction.id}\`\n`;
      message += `📅 Date: ${new Date(transaction.createdAt).toLocaleString()}\n`;
      message += `✅ Status: *${transaction.status}*\n`;
      message += `💰 Amount: *${transaction.amount} ${transaction.currency}*\n`;
      message += `📌 Type: ${transaction.type}\n`;
      message += `🔄 Mode: ${transaction.mode}\n`;
      message += `👤 Sender: ${transaction.senderDisplayName}\n\n`;
      });

    ctx.reply(message);
    }
    else{
        ctx.reply('No transactions yet!')
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
