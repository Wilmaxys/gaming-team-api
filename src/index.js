import express from 'express';
import dotenv from 'dotenv';
import * as VSQ from '@fabricio-191/valve-server-query';
import cors from 'cors';

import { TeamSpeak, QueryProtocol } from 'ts3-nodejs-library';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());

const teamspeak = await TeamSpeak.connect({
  host: '54.36.127.125',
  queryport: 10011,
  serverport: 9987,
  protocol: QueryProtocol.RAW,
  username: 'BOTSite',
  password: 'qG+I5vY8',
  nickname: 'Waren Bot',
});

teamspeak.on('close', async () => {
  console.log('disconnected, trying to reconnect...');
  await teamspeak.reconnect(-1, 1000);
  console.log('reconnected!');
});

app.get('/server', async (req, res) => {
  try {
    const server = await VSQ.default.Server({
      ip: '63.251.20.212',
      port: 27015,
      timeout: 2000,
    });

    const players =
      (await server.getPlayers())?.map((player) => player.name) || [];
    res.status(200).send(players);
  } catch (error) {
    console.log(error);
  }
});

app.get('/teamspeak', async (req, res) => {
  const channels = await teamspeak.channelList();
  const formatedChannels = (
    await Promise.all(
      channels.map(async (channel) => ({
        name: channel.propcache.channelName.replace(new RegExp(/\[.*\]/gm), ''),
        clients:
          channel.totalClients > 0
            ? (
                await channel.getClients()
              ).map((client) => client.propcache.clientNickname)
            : [],
      }))
    )
  ).filter((channel) => channel.name != '');

  res.status(200).send(formatedChannels);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
