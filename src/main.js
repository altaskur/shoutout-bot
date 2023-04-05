const tmi = require('tmi.js');
const streamerList = require('./streamerList');
require('dotenv').config();

let streamerShoutOut = [];

const initialDelay = 10; // en milisegundos

let timer = initialDelay;

const client = new tmi.Client({
  options: { debug: false },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: [process.env.CHANNEL_NAME],
});

/*
client.on('streaming', (channel, username, isStreaming) => {
  if (isStreaming) {
    console.log(`${username} está en línea!`);
    client.say(channel, 'El directo ha comenzado');
  } else {
    console.log(`${username} no está en línea.`);
    client.say(channel, 'EL directo ha finalizado');
  }
});
*/

client.on('connected', () => {
  console.log(`conectado al canal ${process.env.CHANNEL_NAME}`);
});

function checkUser(user) {
  const miUser = user.toLowerCase();
  if (streamerList.includes(miUser) && !streamerShoutOut.includes(miUser) && timer === 0) {
    client.say(process.env.CHANNEL_NAME, `Pasaros todo el mundo por el canal de https://www.twitch.tv/${miUser}`);
    streamerShoutOut.push(miUser);
  }
}
client.on('chat', (channel, user, message, self) => {
  if (message.startsWith('!verGente')) {
    client.say(channel, `Esta es la gente anunciada ${streamerShoutOut}`);
  }

  if (message.startsWith('!startSo')) {
    client.say(channel, `Empiezan los shouts en ${initialDelay} segundos`);
    streamerShoutOut = [];
    timer = initialDelay;

    const contador = setInterval(() => {
      if (timer <= 0) {
        timer = 0;
        clearInterval(contador);
      } else {
        timer -= 1;
      }
      console.log(timer);
    }, 1000);
  }

  checkUser(user['display-name']);
});

client.connect();
