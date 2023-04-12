const tmi = require('tmi.js');
const streamerList = require('./streamerList');
const options = require('./options');
require('dotenv').config();

let streamerShoutOut = [];
const shoutQueue = [];
let queueStatus = false;
let timer = options.initialDelay;
let shoutStatus = false;

const client = new tmi.Client({
  options: { debug: false },
  connection: {
    secure: true,
    reconnect: true,
  },
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

function processQueue() {
  if (!queueStatus && shoutQueue.length > 0) {
    queueStatus = true;
    const miUser = shoutQueue.pop();
    client.say(process.env.CHANNEL_NAME, `Pasaros todo el mundo por el canal de https://www.twitch.tv/${miUser}`);
    streamerShoutOut.push(miUser);
    setTimeout(() => {
      queueStatus = false;
      processQueue();
    }, options.shoutDelay);
  }
}
function runShoutQueue(user) {
  if (!shoutQueue.includes(user)) shoutQueue.push(user);
  processQueue();
}
function checkUser(user) {
  const miUser = user.toLowerCase();

  if (streamerList.includes(miUser) && !streamerShoutOut.includes(miUser)) {
    runShoutQueue(miUser);
  }
}
client.on('chat', (channel, user, message, self) => {
  if (self) return;
  if (message.startsWith('!verGente')) {
    client.say(channel, `Esta es la gente anunciada ${streamerShoutOut}`);
  }
  if (message.startsWith('!stopSo')) {
    shoutStatus = false;
    client.say(channel, 'Dejo de hacer shouts');
  }
  if (message.startsWith('!startSo') && user['display-name'] === process.env.CHANNEL_NAME) {
    streamerShoutOut = [];
    timer = options.initialDelay;

    client.say(channel, `Empiezan los shouts en ${options.initialDelay} segundos`);

    const initialCounter = setInterval(() => {
      if (timer <= 0) {
        timer = 0;
        clearInterval(initialCounter);
        shoutStatus = true;
        client.say(channel, 'Empezamos con los shouts');
      } else {
        timer -= 1;
      }
    }, 1000);
  }

  if (shoutStatus) checkUser(user['display-name']);
});

client.connect();
