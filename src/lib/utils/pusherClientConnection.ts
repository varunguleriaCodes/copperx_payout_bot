import Pusher from 'pusher-js';
import { type Context, type Telegraf } from 'telegraf';

import {CONFIG} from '../../config';

import { notificationApi } from '../../bot/api_calls/apiEndpoint'
import { apiService } from '../../bot/api_calls/centralizedApiCalls';
import { pusherClient, setPusherClient } from '../../bot/pusherClient';

export async function initializePusher(bot: Telegraf, ctx: Context) {
    if (pusherClient) {
      console.log('⚠️ Pusher already initialized');
      return pusherClient;
    }
  
    const chatId = ctx.chat?.id?.toString();
    const token = await ctx.getToken();
    if (!token || !chatId) return;
  
    const client = new Pusher(CONFIG.pusher_key.output, {
      cluster: CONFIG.pusher_cluster.output,
      authorizer: (channel) => ({
        authorize: async (socketId, callback) => {
          try {
            apiService.setAuthToken(token);
            const response = await notificationApi.pusherAuth({
              socket_id: socketId,
              channel_name: channel.name,
            });
  
            if ('auth' in response) {
              callback(null, { auth: response.auth });
            } else {
              callback(new Error('Pusher authentication failed'), null);
            }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error('Pusher authorization error:', error);
            callback(error, null);
          }
        },
      }),
    });
  

    setPusherClient(client);
  
    const channel = client.subscribe(`private-org-${CONFIG.organization_id.output}`);
  
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to private channel');
    });
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Subscription error:', error);
    });
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.bind('deposit', (data: any) => {
      bot.telegram.sendMessage(
        chatId,
        `💰 *New Deposit Received*\n\n${data.amount} USDC deposited on Solana`,
        { parse_mode: 'Markdown' }
      );
    });
  
    return client;
  }