require("dotenv").config()

const { Client, GatewayIntentBits } = require("discord.js")

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers
]
})

client.once("ready", () => {
console.log(`Bot online as ${client.user.tag}`)
})

async function giveRole(discordId){

const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID)

const member = await guild.members.fetch(discordId)

await member.roles.add(process.env.DISCORD_ROLE_ID)

}

module.exports = { client, giveRole }

client.login(process.env.DISCORD_TOKEN)