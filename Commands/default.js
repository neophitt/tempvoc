const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const color = require('colors');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('')
        .setDescription('')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        
    }
};