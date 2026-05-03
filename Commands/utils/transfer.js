// /Commands/utils/transfer.js

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transférer la propriété de votre salon vocal temporaire.')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à qui transférer la propriété.')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const member = interaction.member;
        const target = interaction.options.getMember('utilisateur');

        try {
            if (!member.voice.channelId) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Tu dois être dans un salon vocal pour utiliser cette commande.',
                });
            }

            const [rows] = await db.pool.execute(
                `SELECT channel_id FROM temp_channels WHERE channel_id = ? AND owner_id = ?`,
                [member.voice.channelId, member.id]
            );

            if (rows.length === 0) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Tu n\'es pas le propriétaire de ce salon vocal.',
                });
            }

            if (target.id === member.id) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Tu ne peux pas te transférer la propriété à toi-même.',
                });
            }

            if (!target.voice.channelId || target.voice.channelId !== member.voice.channelId) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> L\'utilisateur doit être dans ton salon vocal pour recevoir la propriété.',
                });
            }

            const channel = member.voice.channel;

            await channel.permissionOverwrites.edit(member.id, {
                ManageChannels: null,
                MuteMembers: null,
                DeafenMembers: null,
                MoveMembers: null,
            });

            await channel.permissionOverwrites.edit(target.id, {
                ManageChannels: true,
                MuteMembers: true,
                DeafenMembers: true,
                MoveMembers: true,
            });

            await db.pool.execute(
                `UPDATE temp_channels SET owner_id = ? WHERE channel_id = ?`,
                [target.id, channel.id]
            );

            console.log(color.green(`[INFO ${time}] ${member.user.tag} transferred ownership of channel ${channel.id} to ${target.user.tag}`));
            return interaction.editReply({
                content: `<:check:1500501456426373181> La propriété du salon a été transférée à **${target.user.displayName}**.`,
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /transfer:`), error);
            return interaction.editReply({
                content: '<:warning:1500502804714754048> Une erreur est survenue lors du transfert de propriété.',
            });
        }
    }
};