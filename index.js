cat << 'EOF' > index.js
const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const yts = require("yt-search");
const config = require("./config");

const botImage = "https://i.ibb.co/qYsSXZrJ/dc031647f9ada8c8e991301709c54b76.jpg";
const startTime = new Date();

function getUptime() {
    const now = new Date();
    const diff = now - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["ZAKUNA-MD", "Safari", "1.0.0"],
        version
    });

    conn.ev.on("creds.update", saveCreds);
    
    conn.ev.on("messages.upsert", async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        const from = mek.key.remoteJid;
        const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
        const command = body.split(" ")[0].toLowerCase();

        if (command === '.alive') {
            let aliveMsg = `*ᴢᴀᴋᴜɴᴀ-ᴍᴅ IS ALIVE*
╭━━━〔 ᴢᴀᴋᴜɴᴀ-ᴍᴅ 〕━━━╮

*╭────────────➣*
*┃Hey...I’m ᴢᴀᴋᴜɴᴀ-ᴍᴅ🙃*
*┃ɪ'ᴍ ᴀᴄᴛɪᴠᴇ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ!*
*╰──────────────➣*

*╭──〔 𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨 〕──➣*
*┃🗓 ᴅᴀᴛᴇ :* ${new Date().toLocaleDateString()}
*┃⌚ ᴛɪᴍᴇ :* ${new Date().toLocaleTimeString()}
*┃⚙ ᴠᴇʀsɪᴏɴ :* 1.0.1
*┃💬 ᴘʀᴇғɪx :* .
*╰──────────────➣*

*╭──〔 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐔𝐬 〕──➣*
*┃👤 ᴏᴡɴᴇʀ :* Zakuna
*┃📞 ɴᴜᴍʙᴇʀ :* 94760576138
*╰──────────────➣*

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀᴋᴜɴᴀ ᴍɪɴɪ </>`;
            await conn.sendMessage(from, { image: { url: botImage }, caption: aliveMsg }, { quoted: mek });
        }

        if (command === '.menu') {
            let menuMsg = `✨ *ZAKUNA-MINI MEGA MENU* ✨

👑 *Owner Info*
 ├ 🧑‍💻 *Name:* Nadil Hansaja
 ├ 🎂 *Age:* 20 Years
 └ 📍 *Location:* Buttala, LK

📊 *Bot Status*
 ├ ⚙️ *Prefix:* [ . ]
 ├ 🕒 *Uptime:* ${getUptime()}
 ├ 🟢 *Auto Status Seen:* ON
 └ 💖 *Status React:* ❤️

🤖 *MAIN COMMANDS*
 ├ 👋 .alive 
 ├ ⚡ .ping 
 └ 👤 .owner 

📥 *DOWNLOAD COMMANDS*
 ├ 🎵 .song [නම] - Audio Download
 ├ 📹 .video [නම] - Video Download
 ├ 📘 .fb [Link] - Facebook Video
 ├ 🎵 .tiktok [Link] - TikTok Video
 ├ 📸 .ig [Link] - Instagram Video
 └ 🎯 .status - Status Download

🎨 *CREATIVE COMMANDS*
 └ ✍️ .logo [නම] 

👥 *GROUP COMMANDS*
 └ 📢 .tagall - Tag All

⚙️ _Powerd by ZAKUNA-MD Team_`;
            await conn.sendMessage(from, { image: { url: botImage }, caption: menuMsg }, { quoted: mek });
        }
    });

    conn.ev.on("connection.update", (update) => {
        if (update.connection === "open") console.log("✅ ZAKUNA-MD සූදානම්!");
    });
}
startBot();
EOF
