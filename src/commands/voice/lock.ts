/*
 * __/\\\\\\\\\\\\\\\__/\\\\____________/\\\\__/\\\\\\\\\\\\\\\_
 *  _\/\\\///////////__\/\\\\\\________/\\\\\\_\///////\\\/////__
 *   _\/\\\_____________\/\\\//\\\____/\\\//\\\_______\/\\\_______
 *    _\/\\\\\\\\\\\_____\/\\\\///\\\/\\\/_\/\\\_______\/\\\_______
 *     _\/\\\///////______\/\\\__\///\\\/___\/\\\_______\/\\\_______
 *      _\/\\\_____________\/\\\____\///_____\/\\\_______\/\\\_______
 *       _\/\\\_____________\/\\\_____________\/\\\_______\/\\\_______
 *        _\/\\\\\\\\\\\\\\\_\/\\\_____________\/\\\_______\/\\\_______
 *         _\///////////////__\///______________\///________\///________
 */

import * as Discord  from 'discord.js';
import {TempChannel} from '../../models/TempChannel';

/**
 * Command to lock the voice channel the member invoking the command is currently in, assuming that the member invoking
 * the command is the owner.
 *
 * @param client
 * @param msg
 */
export async function run(client : Discord.Client, msg : Discord.Message) : Promise<void>
{
    let voiceChannel : Discord.VoiceChannel | null = msg.member.voice.channel;
    if (voiceChannel === null)
    {
        msg.member.send('You are not in a voice channel.').catch(console.error);
        return;
    }

    TempChannel
        .findOne(
            {
                where: {
                    channel_id: msg.member.voice.channel.id,
                },
            },
        )
        .then(function (ch : TempChannel | null)
        {
            if (ch === null)
            {
                msg.member.send('You are not in a temporary voice channel.').catch(console.error);
                return;
            }
            else if (ch.owner_id !== msg.member.id)
            {
                msg.member.send('You do not own the voice channel.').catch(console.error);
                return;
            }

            // Allow the owner to connect to the channel in case they accidentally leave it then lock it.
            voiceChannel.updateOverwrite(msg.member, {CONNECT: true}).catch(console.error);
            voiceChannel.updateOverwrite(msg.guild.roles.everyone, {CONNECT: false}).catch(console.error);
        });
}
