// /Modules/cleanup.js

const color = require('colors');
const db = require('./database');
const { format } = require('date-fns');

module.exports = async (client) => {
    const time = format(new Date(), 'HH:mm:ss');
    console.log(color.yellow(`[INFO ${time}] Starting cleanup...`));

    try {
        const [rows] = await db.pool.execute(`SELECT channel_id, server_id FROM temp_channels`);

        let deleted = 0;

        for (const row of rows) {
            const guild = client.guilds.cache.get(row.server_id);

            if (!guild) {
                await db.pool.execute(`DELETE FROM temp_channels WHERE server_id = ?`, [row.server_id]);
                deleted++;
                continue;
            }

            const channel = guild.channels.cache.get(row.channel_id);

            if (!channel) {
                await db.pool.execute(`DELETE FROM temp_channels WHERE channel_id = ?`, [row.channel_id]);
                deleted++;
                continue;
            }

            if (channel.members.size === 0) {
                await channel.delete();
                await db.pool.execute(`DELETE FROM temp_channels WHERE channel_id = ?`, [row.channel_id]);
                deleted++;
            }
        }

        console.log(color.green(`[INFO ${time}] Cleanup done. ${deleted} orphan channel(s) removed.`));

    } catch (error) {
        console.error(color.red(`[ERROR ${time}] An error occurred during cleanup:`), error);
    }
};