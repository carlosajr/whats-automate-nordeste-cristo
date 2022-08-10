const { writeFileSync } = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { wait } = require('./functions');

const contacts = require('./assets/json/contacts.json');
const reasons = require('./assets/json/reasons.json');
const already = require('./assets/json/already.json');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('[AUTHENTICATED]');
});

client.on('auth_failure', msg => {
    console.error('[AUTHENTICATION FAILURE]', msg);
});

client.on('ready', async () => {
    console.log('[CLIENT READY]')
    console.log('[ALREADY]', JSON.stringify(already))

    const reasonsAvailable = reasons.filter((reason) => !already.includes(reason.date))

    for (const reason of reasonsAvailable) {
        const timeToWait = new Date(`${reason.date}`) - new Date()
        console.log('[TIME TO WAIT]', timeToWait)
        await wait(timeToWait);

        for (const contact of contacts) {
            const message = MessageMedia.fromFilePath(`assets/images/${reason.img}.png`);
            await client.sendMessage(contact, message, {
                caption: `A Paz de Cristo, Igreja do Senhor!

⚠️Atenção⚠️ para os *motivos de oração*, de HOJE, em prol do Nordeste Para Cristo! Não esqueça do nosso propósito. 🙏🏽` });
            console.log('[MESSAGE SENDED]', contact)
            await wait(3000);
        }

        already.push(reason.date);
        writeFileSync('./assets/json/already.json', JSON.stringify(already))
        console.log('[ALREADY]', JSON.stringify(already))
    }

});

client.on('message', async (msg) => {
    if (msg.body == '!hoje') {
        console.log('[HOJE]', msg.from)

        const [date] = new Date().toISOString().split('T');
        const reason = reasons.find(reason => reason.date.split('T')[0] === date)

        const message = MessageMedia.fromFilePath(`assets/images/${reason.img}.png`);
        await client.sendMessage(msg.from, message, {
            caption: `A Paz de Cristo, Igreja do Senhor!

⚠️Atenção⚠️ para os *motivos de oração*, de HOJE, em prol do Nordeste Para Cristo! Não esqueça do nosso propósito. 🙏🏽` });

        console.log('[MESSAGE SENDED]', msg.from)

    }
});

client.on('message_create', (msg) => {
    if (msg.fromMe && msg.body == 'A paz do senhor!') {
        console.log('[IDENTIFIER]', msg.to)
    }
});

console.log('[INITIALIZED]')
client.initialize();