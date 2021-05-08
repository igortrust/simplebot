
const bot = require("@wppconnect-team/wppconnect");
const CronJob = require('cron').CronJob;

bot.create({
    session: 'teste', //Pass the name of the client you want to start the bot
    catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('Number of attempts to read the qrcode: ', attempts);
        console.log('Terminal qrcode: ', asciiQR);
        console.log('base64 image string qrcode: ', base64Qrimg);
        console.log('urlCode (data-ref): ', urlCode);
    },
    statusFind: (statusSession, session) => {
        console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
        //Create session wss return "serverClose" case server for close
        console.log('Session name: ', session);
    },
    headless: true, // Headless chrome
    devtools: false, // Open devtools by default
    useChrome: true, // If false will use Chromium instance
    debug: false, // Opens a debug session
    logQR: true, // Logs QR automatically in terminal
    browserArgs: ['--js-flags="--max_old_space_size=80" --disable-web-security', '--no-sandbox', '--disable-web-security', '--aggressive-cache-discard', '--disable-cache', '--disable-application-cache', '--disable-offline-load-stale-cache', '--disk-cache-size=0', '--disable-background-networking', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--disable-translate', '--hide-scrollbars', '--metrics-recording-only', '--mute-audio', '--no-first-run', '--safebrowsing-disable-auto-update', '--ignore-certificate-errors', '--ignore-ssl-errors', '--ignore-certificate-errors-spki-list'], // Parameters to be added into the chrome browser instance
    refreshQR: 15000, // Will refresh QR every 15 seconds, 0 will load QR once. Default is 30 seconds
    autoClose: 60000, // Will auto close automatically if not synced, 'false' won't auto close. Default is 60 seconds (#Important!!! Will automatically set 'refreshQR' to 1000#)
    disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
}).then((client) => start(client));

async function start(client) {
    async function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    await client.startPhoneWatchdog() //Função Criada por Edgar para buscar status do aparelho.

    //Agendamento para arquivar Mensagens diariamente as 3:10 da manhã.
    const ArquivandoChats = new CronJob('00 10 3 * * *', () => {
        try {
            archiveChat.archiveChat(client) //Não usar await, se usar o seu bot ficará aguardando terminar o arquivamento das msgs.
        } catch (error) {
            console.log(error)
        }
    }, null, true, 'America/Sao_Paulo')

    //Função para arquivar chats com mais de 30 dias sem interação, limitado a 100 arquivamentos por dia e 10 por minuto para evitar possíveis problemas de ban.
    async function archiveChat(client) {
        async function sleep(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }
        console.log("Limpando os chats mais de 30 dias sem interação")
        let chats = await client.getAllChats();
        let cont = 0 // Variavel para criar pausa 
        let contDia = 0 // Variável para limitar os arquivamentos diários.
        for (var i = 0; i < chats.length; i++) {
            let date = new Date(chats[i].t * 1000);

            if (DaysBetween(date) > 30) {
                await client.archiveChat(chats[i].id.id || chats[i].id._serialized, true);

                await sleep(5000) //pausa de 5 segundos para cada arquivamento
                if (cont > 9) {
                    await sleep(30000) //pausa de 30 segundos a cada 10 arquivamentos
                    cont = 0
                }
                if (contDia > 99) {
                    console.log("100 chats arquivados de " + client.session)
                    return "Fim"
                }
                cont++
                contDia++
            }
        }
        function DaysBetween(StartDate) {
            let EndDate = new Date();
            // The number of milliseconds in all UTC days (no DST)
            const oneDay = 1000 * 60 * 60 * 24;

            // A day in UTC always lasts 24 hours (unlike in other time formats)
            const start = Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate());
            const end = Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate());

            // so it's safe to divide by 24 hours
            return (start - end) / oneDay;
        }

        return "fim"
    }

    client.onMessage((message) => {

        if (!message.isGroupMsg && !message.broadcast && message.from != 'status@broadcast' && message.type == 'chat') { // Pernite apenas mensagens individuais e de texto

            let msg = message.body.toUpperCase()
            if (msg == "PING") {
                client.sendText(message.from, 'pong');
            }

        } else {
            if (message.body === 'idGrupo')
                client.sendText(message.from, message.from) //Envia o id do grupo.
        }
    });

}