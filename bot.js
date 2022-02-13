const clientLoader = require('./src/clientLoader');
const commandLoader = require('./src/commandLoader');
const con = require('./src/MySqlConnector')
require('colors');

const COMMAND_PREFIX = '!';
con.connect()

clientLoader.createClient(['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'])
  .then(async (client) => {
    await commandLoader.load(client);

    client.on('guildMemberAdd', async (member) => {
      const guild = member.guild;
      var roleExist = false
      // Lorsque un user rejoint le serveur on vérifie si on a des donnés sur lui
      con.executeQuery('SELECT * FROM xp_user WHERE user_id = '+member.id+ ' AND serverId ='+member.guild.id).then((response)=>{
        if(response[0]){
          // Si on a des donnés on regarde tout les rôles voir si son niveau existe
          guild.roles.fetch().then(async (responseRole)=>{
            await responseRole.forEach(async (role) => {
              // Si il existe on lui donne le rôle
              if(role.name == "level "+response[0].xp_level){
                console.log('dans le true')
                
                roleExist = true
                console.log(roleExist)
                await member.roles.add(role)
              }
            });
            // Sinon on créé le rôle
            if(roleExist === false){
              console.log('dans le false')
              const newRole = await guild.roles.create({
                name : 'level '+response[0].xp_level,
                color: 0+(parseInt(response[0].xp_level)*150)
              })
              await member.roles.add(newRole)
            }
          })
          
        }else{
          // Si on a pas d'informations dans la bdd on regarde tout les rôles pour lui donner le niveau 0
          guild.roles.fetch().then(async (responseRole)=>{
            responseRole.forEach(async (role) => {
              // Si il existe on lui donne
              if(role.name == "level 0"){
                roleExist = true
                await member.roles.add(role)
                
              }
            })
            if(roleExist == false){
              // Sinon on créé le rôle et on lui donne
              const newRole = await guild.roles.create({
                name : 'level 0',
                color: 'WHITE'
              })
              await member.roles.add(newRole)
            }
          })
          
        }
      })
      
  
    })

    client.on('messageCreate', async (message) => {
      
      // Ne pas tenir compte des messages envoyés par les bots
      if (message.author.bot) return;
      if(!message.content.startsWith(COMMAND_PREFIX)){
        await client.commands.get('xp').run(client, message);
        
      }
      
      if(!message.content.startsWith(COMMAND_PREFIX)) return
      // On découpe le message pour récupérer tous les mots
      const words = message.content.split(' ');

      const commandName = words[0].slice(1); // Le premier mot du message, auquel on retire le préfix
      const arguments = words.slice(1); // Tous les mots suivants sauf le premier

      if (client.commands.has(commandName)) {
        // La commande existe, on la lance
        client.commands.get(commandName).run(client, message, arguments);
      } else {
        // La commande n'existe pas, on prévient l'utilisateur
        await message.delete();
        await message.channel.send(`The ${commandName} does not exist.`);
      }
    })
  });
