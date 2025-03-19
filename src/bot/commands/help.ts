import { type Context } from 'telegraf';
import { type Update } from 'telegraf/typings/core/types/typegram';

import { type ICommand } from './types';

export class HelpCommand implements ICommand {
  public execute = async (ctx: Context<Update>): Promise<void> => {
    await ctx.reply('Please reach out for support: [CopperX Community](https://t.me/copperxcommunity/2183)', {
      parse_mode: 'Markdown',
    });
  };
}
