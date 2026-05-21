const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const config = require("./config");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        browser: ["ZAKUNA-MINI", "Safari", "1.0.0"],
        version
    });

    // Pairing Code කොටස
    if (!conn.authState.creds.registered) {
        let phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '');
        await delay(3000);
        try {
            let code = await conn.requestPairingCode(phoneNumber);
            console.log(`\n🔑 YOUR PAIRING CODE: ${code}\n`);
        } catch (error) {
            console.log("❌ Pairing code ලබාගැනීමට නොහැකි වුණා.");
        }
    }

    conn.ev.on("creds.update", saveCreds);

    conn.ev.on("messages.upsert", async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        const from = mek.key.remoteJid;
        const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
        const command = body.split(" ")[0].toLowerCase();

        // ALIVE MSG
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
            await conn.sendMessage(from, { image: { url: "https://i.ibb.co/qYsSXZrJ/dc031647f9ada8c8e991301709c54b76.jpg" }, caption: aliveMsg }, { quoted: mek });
        }

        // MENU MSG
        if (command === '.menu') {
            let menuMsg = `✨ *ZAKUNA-MINI MEGA MENU* ✨

👑 *Owner Info*
 ├ 🧑‍💻 *Name:* Nadil Hansaja
 ├ 🎂 *Age:* 20 Years
 └ 📍 *Location:* Buttala, LK

📊 *Bot Status*
 ├ ⚙️ *Prefix:* [ . ]
 ├ 🕒 *Uptime:* Bot Running
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
            await conn.sendMessage(from, { image: { url: "https://i.ibb.co/qYsSXZrJ/dc031647f9ada8c8e991301709c54b76.jpg" }, caption: menuMsg }, { quoted: mek });
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log("✅ ZAKUNA-MINI බෝට් එක සාර්ථකව Active වුණා!");
            let ownerJid = config.ownerNumber.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
            await conn.sendMessage(ownerJid, { 
                text: "🤖 *ZAKUNA-MINI IS NOW ACTIVE!*\n\nබෝට් එක සාර්ථකව සම්බන්ධ වී වැඩ ආරම්භ කර ඇත. දැන් ඔබට කමාන්ඩ්ස් භාවිතා කළ හැක. ✅" 
            });
        }
    });
}
startBot();
