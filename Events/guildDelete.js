// /Events/guildDelete.js

const { Events } = require('discord.js');
const color = require('colors');
const db = require('../Modules/database');
const { format } = require('date-fns');

module.exports = {
    name: Events.GuildDelete,
    once: false,

    async execute(guild) {
        const time = format(new Date(), 'HH:mm:ss');

        try {
            await db.pool.execute(`DELETE FROM servers WHERE server_id = ?`, [guild.id]);

            await db.pool.execute(`DELETE FROM temp_channels WHERE server_id = ?`, [guild.id]);

            console.log(color.yellow(`[INFO ${time}] Guild ${guild.id} removed from database (bot left or guild deleted).`));

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in guildDelete:`), error);
        }
    }
};