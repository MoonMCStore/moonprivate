require("dotenv").config()

const express = require("express")
const fetch = require("node-fetch")

const { client, giveRole } = require("./bot")

const app = express()

app.use(express.json())
app.use(express.static("public"))

app.post("/link-discord", async (req,res)=>{

const discordId = req.body.discordId

await giveRole(discordId)

await fetch(process.env.DISCORD_WEBHOOK,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
content:`✅ User linked Discord: <@${discordId}>`
})
})

res.send({success:true})

})

app.listen(process.env.PORT, ()=>{
console.log("Server running")
})