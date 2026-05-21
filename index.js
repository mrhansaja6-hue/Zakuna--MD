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

        if (command === '.alive') {
            let aliveMsg = `*ᴢᴀᴋᴜɴᴀ-ᴍᴅ IS ALIVE*
╭━━━〔 ᴢᴀᴋᴜɴᴀ-ᴍᴅ 〕━━━╮
*┃Hey...I’m ᴢᴀᴋᴜɴᴀ-ᴍᴅ🙃*
*┃ɪ'ᴍ ᴀᴄᴛɪᴠᴇ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ!*
╰──────────────➣
*┃🗓 ᴅᴀᴛᴇ :* ${new Date().toLocaleDateString()}
*┃⌚ ᴛɪᴍᴇ :* ${new Date().toLocaleTimeString()}
╰──────────────➣
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀᴋᴜɴᴀ ᴍɪɴɪ </>`;
            await conn.sendMessage(from, { image: { url: "https://i.ibb.co/qYsSXZrJ/dc031647f9ada8c8e991301709c54b76.jpg" }, caption: aliveMsg }, { quoted: mek });
        }

        if (command === '.menu') {
            let menuMsg = `✨ *ZAKUNA-MINI MEGA MENU* ✨
🤖 *MAIN COMMANDS*
 ├ 👋 .alive 
 ├ ⚡ .ping 
 └ 👤 .owner 
⚙️ _Powerd by ZAKUNA-MD Team_`;
            await conn.sendMessage(from, { image: { url: "https://i.ibb.co/qYsSXZrJ/dc031647f9ada8c8e991301709c54b76.jpg" }, caption: menuMsg }, { quoted: mek });
        }
    });

    conn.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log("✅ ZAKUNA-MINI බෝට් එක සාර්ථකව Active වුණා!");
            let ownerJid = config.ownerNumber.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
            await conn.sendMessage(ownerJid, { text: "🤖 *ZAKUNA-MINI IS NOW ACTIVE!*" });
        }
    });
}
startBot();

