// /Commands/utils/invite.js

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Inviter un utilisateur dans votre salon vocal temporaire.')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à inviter dans le salon.')
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
                    content: '`🙁` Tu dois être dans un salon vocal pour utiliser cette commande.',
                });
            }

            const [rows] = await db.pool.execute(
                `SELECT channel_id FROM temp_channels WHERE channel_id = ? AND owner_id = ?`,
                [member.voice.channelId, member.id]
            );

            if (rows.length === 0) {
                return interaction.editReply({
                    content: '`🙁` Tu n\'es pas le propriétaire de ce salon vocal.',
                });
            }

            if (target.id === member.id) {
                return interaction.editReply({
                    content: '`🙁` Tu ne peux pas t\'inviter toi-même.',
                });
            }

            if (target.voice.channelId === member.voice.channelId) {
                return interaction.editReply({
                    content: `\`🙁\` **${target.user.displayName}** est déjà dans ton salon vocal.`,
                });
            }

            const channel = member.voice.channel;

            const targetPerms = channel.permissionOverwrites.cache.get(target.id);
            if (targetPerms?.allow.has(PermissionFlagsBits.Connect)) {
                return interaction.editReply({
                    content: `\`🙁\` **${target.user.displayName}** a déjà été invité dans ton salon vocal.`,
                });
            }

            await channel.permissionOverwrites.edit(target.id, {
                Connect: true,
                ViewChannel: true,
            });

            try {
                await target.send({
                    content: `\`📨\` **${member.user.displayName}** t'invite à rejoindre son salon vocal **${channel.name}** sur **${interaction.guild.name}** !`,
                });

                return interaction.editReply({
                    content: `\`📨\` **${target.user.displayName}** a été invité dans ton salon vocal et a reçu une notification en DM.`,
                });
            } catch {
                return interaction.editReply({
                    content: `\`📨\` **${target.user.displayName}** a été invité dans ton salon vocal mais n'a pas pu être notifié (DMs désactivés).`,
                });
            }

            console.log(color.green(`[INFO ${time}] ${member.user.tag} invited ${target.user.tag} to channel ${channel.id}`));
            return interaction.editReply({
                content: `\`📨\` **${target.user.displayName}** a été invité dans ton salon vocal.`,
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /invite:`), error);
            return interaction.editReply({
                content: '`🙁` Une erreur est survenue lors de l\'invitation.',
            });
        }
    }
};