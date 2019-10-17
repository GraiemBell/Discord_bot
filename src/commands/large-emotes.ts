import { Command, Event, parse, subscribe } from 'discord-commander';
import * as fs from 'fs';
import * as path from 'path';

const emoteNames = fs.readdirSync(path.join(__dirname, '..', '..', 'assets', 'emotes'))
  .filter((fileName) => fileName.endsWith('.png'))
  .map((fileName) => fileName.substr(0, fileName.length - '.png'.length));

export class LargeEmoteCommand extends Command('emote') {
  @parse.remaining private requestedEmote: string;

  @subscribe('new', 'edit')
  public async onMessage(ctx: Event) {
    this.requestedEmote = this.requestedEmote.trim();

    console.log(this.requestedEmote);

    if (this.requestedEmote.length === 0) {
      this.sendHelpText(ctx);
      return;
    }

    if (this.requestedEmote.match(/^:.+:$/i)) {
      // Unresolved emotes looks like this :some_name:
      this.requestedEmote = this.requestedEmote.substring(1, this.requestedEmote.length - 1);
    } else if (this.requestedEmote.match(/^<:.+:\d+>$/i)) {
      // Resolved emotes looks like this <:emote_name:some_numerical_id>
      this.requestedEmote = this.requestedEmote.substring(2, this.requestedEmote.lastIndexOf(':'));
    }

    if (! emoteNames.some((name) => name === this.requestedEmote)) {
      this.sendHelpText(ctx);
      return;
    }

    await ctx.channel.send(`${ctx.author}`, {
      files: [
        path.join(__dirname, '..', '..', 'assets', 'emotes', `${this.requestedEmote}.png`),
      ],
    });

    await ctx.message.delete(); // Clean up command
  }

  private async sendHelpText(ctx: Event) {
    await ctx.author.send(`Attempted to display unknown emote "${this.requestedEmote}"
    Available emotes are: ${emoteNames.join(', ')}`);

    await ctx.message.delete(); // Clean up command
  }
}
