const Discord = require('discord.js');
const con = require('../src/MySqlConnector')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message) => {
    // On regarde si le user est présent dans la bdd
    con.executeQuery('SELECT * FROM xp_user WHERE user_id = '+message.author.id+ ' AND serverId ='+message.guildId).then(async (response)=>{
        if(response[0]){
            // Si il est présent on regarde si le message le fait monté de niveau
            if((response[0].xp_count+1) == (response[0].xp_level+4)){
                // On augmente donc son lever et reset le count d'xp
                await con.executeQuery("UPDATE xp_user SET xp_count = 0 , xp_level = xp_level+1 WHERE user_id="+ message.author.id+ ' AND serverId ='+message.guildId)
                const embed = new Discord.MessageEmbed();
                embed
                    .setTitle('Bravo '+message.author.username+', vous avez gagné un niveau !')
                    .setDescription('Vous êtes maintenant niveau '+(parseInt(response[0].xp_level)+1))
                
                message.channel.send({
                    embeds: [embed]
                })

                var roleExist = false
                // On vérifie ensuite tout les rôles du serveur voir si le rôle de son nouveau niveau existe
                var roles = message.guild.roles.fetch().then(async (responseRole)=>{
                    await responseRole.forEach((data)=>{
                        if(data.name == "level "+(parseInt(response[0].xp_level)+1)){
                            // Si il existe on met le rôle au user
                            roleExist = true
                            message.member.roles.add(data.id)
                        }else if(data.name == "level "+response[0].xp_level){
                            // On pense à retirer son ancien rôle
                            message.member.roles.remove(data.id)
                        }
                    })

                    if(roleExist == false){
                        // Si le rôle n'existe pas on le créé et on lui donne
                        const newRole = await message.guild.roles.create({
                            name: 'level '+(parseInt(response[0].xp_level)+1),
                            color: 0+(parseInt(response[0].xp_level)*150),
                        })
                        await message.member.roles.add(newRole)
                    }
                })
                

            }else{
                // Si il n'augmente pas de niveau on augmente de 1 l'xp_count
                await con.executeQuery("UPDATE xp_user SET xp_count = xp_count + 1 WHERE user_id="+ message.author.id+ ' AND serverId ='+message.guildId)
            }
            // On lance ensuite la commande shared
            client.commands.get('shared').run(client, message)
            
        }else{
            // Si le user n'existe pas on le créer dans la bdd
            await con.executeQuery('INSERT INTO xp_user (user_id, xp_count, serverId, avertissements) VALUES ('+message.author.id+', 1,'+message.guildId+', 0)')
            // On lance ensuite la commande shared
            client.commands.get('shared').run(client, message)
        }
    })

    
    
    
    
    
};

module.exports.name = 'xp';
