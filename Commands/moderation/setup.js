const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configurer le bot pour votre serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName('vocal')
                .setDescription('Salon vocal à rejoindre pour créer un salon temporaire.')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('categorie')
                .setDescription('Catégorie où les salons temporaires seront créés.')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const guild = await interaction.guild.fetch();
        let serverId = guild.id;
        let ownerId = guild.ownerId;
        let timestamp = Math.floor(interaction.createdTimestamp / 1000);

        const vocalChannel = interaction.options.getChannel('vocal');
        const categoryChannel = interaction.options.getChannel('categorie');

        try {
            const [rows] = await db.pool.execute(
                `SELECT server_id FROM servers WHERE server_id = ?`,
                [serverId]
            );

            if (rows.length > 0) {
                return interaction.editReply({
                    content: "<:warning:1500502804714754048> Ce serveur est déjà configuré! Besoin de modifications? Utilisez la commande /reset afin de pouvoir utiliser à nouveau cette commande.",
                });
            }

            await db.pool.execute(
                `INSERT INTO servers (server_id, owner_id, added_at, channel_id, category_id) VALUES (?, ?, ?, ?, ?)`,
                [serverId, ownerId, timestamp, vocalChannel.id, categoryChannel.id]
            );

            console.log(color.green(`[INFO ${time}] A new server has been added to the database. (ID: ${serverId})`));
            await interaction.editReply({
                content: '<:check:1500501456426373181> Le bot à bien été configuré pour fonctionner sur votre serveur!',
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred while configuring a server. (ID: ${serverId})`), error);
            await interaction.editReply({
                content: '<:warning:1500502804714754048> Une erreur est survenue lors de la configuration.',
            });
        }
    }
};