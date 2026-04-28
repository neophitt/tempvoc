// /Events/voiceStateUpdate.js

const { Events, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../Modules/database');
const { format } = require('date-fns');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,

    async execute(oldState, newState) {
        const time = format(new Date(), 'HH:mm:ss');

        // ✅ Suppression automatique quand le salon est vide
        if (oldState.channelId) {
            try {
                const [rows] = await db.pool.execute(
                    `SELECT channel_id FROM temp_channels WHERE channel_id = ?`,
                    [oldState.channelId]
                );

                if (rows.length > 0) {
                    const channel = oldState.guild.channels.cache.get(oldState.channelId);

                    if (channel && channel.members.size === 0) {
                        await channel.delete();
                        await db.pool.execute(
                            `DELETE FROM temp_channels WHERE channel_id = ?`,
                            [oldState.channelId]
                        );
                        console.log(color.green(`[INFO ${time}] Temp channel ${oldState.channelId} deleted (empty)`));
                    }
                }
            } catch (error) {
                console.error(color.red(`[ERROR ${time}] Error while deleting temp channel:`), error);
            }
        }

        // L'utilisateur rejoint un salon
        if (!newState.channelId) return;

        try {
            const [rows] = await db.pool.execute(
                `SELECT channel_id, category_id FROM servers WHERE server_id = ?`,
                [newState.guild.id]
            );

            if (rows.length === 0) return;

            const { channel_id, category_id } = rows[0];

            if (newState.channelId !== channel_id) return;

            const member = newState.member;

            const tempChannel = await newState.guild.channels.create({
                name: `Salon de ${member.user.displayName}`,
                type: ChannelType.GuildVoice,
                parent: category_id,
                permissionOverwrites: [
                    {
                        id: newState.guild.id,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.DeafenMembers,
                            PermissionFlagsBits.MoveMembers,
                        ],
                    },
                ],
            });

            await member.voice.setChannel(tempChannel);

            await db.pool.execute(
                `INSERT INTO temp_channels (channel_id, server_id, owner_id, created_at) VALUES (?, ?, ?, ?)`,
                [tempChannel.id, newState.guild.id, member.id, Math.floor(Date.now() / 1000)]
            );

            const embed = new EmbedBuilder()
                .setTitle('🎙️ Salon vocal temporaire')
                .setDescription(`Bienvenue ${member} dans ton salon vocal temporaire !\nUtilise les commandes ci-dessous pour le gérer.`)
                .addFields(
                    { name: '🔒 `/lock`', value: 'Verrouiller le salon', inline: true },
                    { name: '🔓 `/unlock`', value: 'Déverrouiller le salon', inline: true },
                    { name: '👥 `/limit`', value: 'Définir une limite d\'utilisateurs', inline: true },
                    { name: '👢 `/kick`', value: 'Expulser un utilisateur', inline: true },
                    { name: '🚫 `/ban`', value: 'Bannir un utilisateur du salon', inline: true },
                    { name: '✅ `/unban`', value: 'Débannir un utilisateur du salon', inline: true },
                    { name: '📨 `/invite`', value: 'Inviter un utilisateur dans le salon', inline: true },
                    { name: '🔑 `/transfer`', value: 'Transférer la propriété du salon', inline: true },
                    { name: '👑 `/claim`', value: 'Récupérer la propriété du salon vocal', inline: true },
                )
                .setColor(0xf9cb3d)
                .setFooter({ text: 'Le salon sera supprimé automatiquement quand il sera vide.' });

            await tempChannel.send({ content: `${member}`, embeds: [embed] });

            console.log(color.green(`[INFO ${time}] Temp channel created for ${member.user.tag} in guild ${newState.guild.id}`));

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in voiceStateUpdate:`), error);
        }
    }
};