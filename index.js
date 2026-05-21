const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const yts = require('yt-search');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Zakuna-Mini', 'Chrome', '1.0.0']
    });

    // Pairing Code එක
    if (!sock.authState.creds.registered) {
        const phoneNumber = '947XXXXXXXX'; // ඔයාගේ නම්බර් එක මෙතන දාන්න
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`Pairing Code: ${code}`);
    }

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message) return;
        
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        // 1. Status Seen & Auto React
        if (from === 'status@broadcast') {
            await sock.readMessages([msg.key]);
            await sock.sendMessage(from, { react: { text: '❤️', key: msg.key } });
            return;
        }

        if (!text) return;

        // 2. Alive Command
        if (text === '.alive') {
            await sock.sendMessage(from, { text: '✨ *Bot is Alive & Working!*' });
        }

        // 3. Menu Command
        if (text === '.menu') {
            const menu = `
┌───「 *ZAKUNA-MINI* 」───
│ 👑 Owner: Akash
│ ⌛ Uptime: ${process.uptime().toFixed(2)}s
└────────────────────
│ ➣ .alive
│ ➣ .song [name]
│ ➣ .video [name]
│ ➣ .ping
│ ➣ .owner
└────────────────────`;
            await sock.sendMessage(from, { text: menu });
        }

        // 4. Ping Command
        if (text === '.ping') {
            await sock.sendMessage(from, { text: '🚀 Pong!' });
        }

        // 5. Song Downloader
        if (text.startsWith('.song ')) {
            const query = text.replace('.song ', '');
            const res = await yts(query);
            const video = res.videos[0];
            await sock.sendMessage(from, { text: `🎵 *${video.title}*\n🔗 ${video.url}` });
        }
        
        // 6. Video Downloader
        if (text.startsWith('.video ')) {
            const query = text.replace('.video ', '');
            const res = await yts(query);
            const video = res.videos[0];
            await sock.sendMessage(from, { text: `🎬 *${video.title}*\n🔗 ${video.url}` });
        }

        // 7. Owner Command
        if (text === '.owner') {
            await sock.sendMessage(from, { text: 'Contact Owner: wa.me/947XXXXXXXX' });
        }
    });

    sock.ev.on('creds.update', saveCreds);
}
startBot();

