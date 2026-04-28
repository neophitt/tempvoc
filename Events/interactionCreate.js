// /Events/interactionCreate.js

const { Events, MessageFlags } = require('discord.js');
const color = require('colors');
const { format } = require('date-fns')

module.exports = {
    name: Events.InteractionCreate,
    once: false,

    async execute(interaction) {
        const time = format(new Date(), 'HH:mm:ss');
        const user = interaction.user;

        if(!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if(!command) {
            console.log(color.yellow(`[WARN ${time}] No command matching "${interaction.commandName}" was found.`));
            return;
        }

        try {
            await command.execute(interaction);
            console.log(color.green(`[INFO ${time}] ${user.username} used ${interaction.commandName} command.`));
        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occured during execution of ${interaction.commandName} command: `, error));

            const errorMessage = {
                content: "`🙁` Une erreur est survenue lors de l'exécution de la demande.",
                flags: MessageFlags.Ephemeral
            }

            if(interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
}