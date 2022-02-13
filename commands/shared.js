const Discord = require('discord.js');
const con = require('../src/MySqlConnector');
const banWordList = require('../banword.json')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array<String>} arguments
 */
module.exports.run = async (client, message) => {

    // On split le message pour voir chaque mot un par un
    const messageNotChecked = message.content.split(" ")
    for(var i = 0; i<messageNotChecked.length+1; i++){
        // On regarde si il est dans la liste des banword
        if(banWordList.includes(messageNotChecked[i])){
            var newWord = ""
            for(var j = 0 ; j<messageNotChecked[i].length ; j++){
                // On remplace chaque lettre par un caractère spécial
                newWord += "°"
            }
            messageNotChecked[i] = newWord
            // On augmente le nombre d'avertissement de un
            await con.executeQuery("UPDATE xp_user SET avertissements = avertissements+1 WHERE user_id="+ message.author.id+ ' AND serverId ='+message.guildId)
            // On appelle pour voir le nombre d'avertissements du user
            con.executeQuery("SELECT * FROM xp_user WHERE user_id="+ message.author.id+ ' AND serverId ='+message.guildId).then(async (response)=>{
                // Si c'est égale à 4 on vérifie si on peut le ban et on le ban
            if(response[0].avertissements == 4){
                if(message.member.bannable){
                    await message.member.ban()
                    await message.channel.send(message.member.username + ' a été bannis du serveur')
                }else{
                    // Si on ne peux pas le ban on regarde si le role 'ban' existe, si il n'existe pas on le créé
                    const roleExist = false
                    message.guild.roles.fetch().then(async (allRole)=>{
                        allRole.forEach(async (role)=>{
                            if(role.name == "ban"){
                                roleExist = true
                                await message.member.roles.add(role)
                            }
                        })
                        if(roleExist == false){
                            const newRole = await message.guild.roles.create({
                                name: 'ban',
                                color : 'RED'
                            })
                            await message.member.roles.add(newRole)
                            
                        }
                    })
                    await message.channel.send('Vous avez le rôle bannis')
                }
                
            }else{
                await message.channel.send("Vous avez "+response[0].avertissements+" avertissements, attention à 4 vous êtes bannis")
            }
            })
        }
    }
    const messageChecked = messageNotChecked.join(' ')
    

    // On regarde pour chaque discord ou est présent le bot
    client.guilds.cache.forEach(guild => {
        // On regarde chaque channel voir si il y a un channel 'shared', auquel cas on envoie le message sur le channel
        guild.channels.cache.forEach(channel => {
            if(channel.name == 'shared'){
                con.executeQuery('SELECT * FROM xp_user WHERE user_id='+ message.author.id +' AND serverId='+message.guildId).then((level)=>{
                    const embed = new Discord.MessageEmbed();
                embed
                    .setTitle(message.author.username + ' a écrit depuis le serveur '+message.guild.name)
                    .setDescription('Il est niveau '+level[0].xp_level)
                    .setColor(0+(parseInt(level[0].xp_level)*150))
                    .addField('Contenu du message', messageChecked)
                channel.send({
                    embeds: [embed]
                })
                })
            }
        })
      })
};

module.exports.name = 'shared';
