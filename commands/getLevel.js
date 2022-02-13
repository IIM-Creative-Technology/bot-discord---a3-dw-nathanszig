const Discord = require('discord.js');
const con = require('../src/MySqlConnector');
/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message, arguments) => {
    // On récupère les infos du user
    con.executeQuery('SELECT * FROM xp_user WHERE user_id ='+message.author.id+ ' AND serverId ='+message.guildId).then((response)=>{
        if(response[0]){
            // On lui envoie son niveau et l'xp manquante
            const embed = new Discord.MessageEmbed();
            embed
                .setTitle('Vous êtes niveau '+response[0].xp_level)
                .setDescription('Il vous manque '+((response[0].xp_level+4)-response[0].xp_count) + " d'XP avant le niveau suivant.")
            
            message.channel.send({
                embeds: [embed]
            })
        }
    })
};

module.exports.name = 'getLevel';
