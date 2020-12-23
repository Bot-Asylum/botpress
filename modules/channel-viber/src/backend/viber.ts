import { Router } from 'express'
import * as http from 'http';
import { ViberClient } from 'messaging-api-viber';
import { EventType } from 'messaging-api-viber/dist/ViberTypes';


import { Config } from '../config';
import { Client } from './client';

import _ from 'lodash';

import * as sdk from 'botpress/sdk';

const debug = DEBUG('channel-viber');
const debugMessages = debug.sub('messages');
const debugHttp = debug.sub('http');
const debugWebhook = debugHttp.sub('webhook');
const debugHttpOut = debugHttp.sub('out');

interface MountedBot {
  botId: string
  client: Client
}

export class ViberService {
  private mountedBots: MountedBot[] = [];
  private appSecret: string;
  private router: Router & sdk.http.RouterExtension;

  constructor(private bp: typeof sdk) {
  }

  private handleOutgoingEvent(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback): void {
    if (event.channel !== 'viber') {
      return next();
    }
  }

  private handleIncomingEvent(req, res): void {
  }

  private getConfig(): Promise<Config> {
    return this.bp.config.getModuleConfig('channel-viber');
  }

  private async handleIncomingMessage(req, res) {
    console.log(req);
    // // console.log(req.body);
    // // const body = req.body
    // //
    // // if (body.event === 'message') {
    // //   this.mountedBots[0].client.sendMessage(
    // //     body.sender,
    // //     body.message,
    // //   )
    // // }
    //
    // return res.status(200)
  }

  public async initialize(): Promise<void> {
    const config = await this.getConfig();

    if (!config.verifyToken?.length || config.verifyToken === 'verify_token') {
      throw new Error('You need to set a valid value for "verifyToken" in data/global/config/channel-viber.json');
    }

    if (!config.appSecret?.length || config.appSecret === 'app_secret') {
      throw new Error('You need to set a valid value for "appSecret" in data/global/config/channel-viber.json');
    }

    this.appSecret = config.appSecret;

    this.router = this.bp.http.createRouterForBot('channel-viber', {
      checkAuthentication: false,
      enableJsonBodyParser: false // we use our custom json body parser instead, see below
    });

    const publicPath = await this.router.getPublicPath();
    if (!publicPath.startsWith('https://')) {
      this.bp.logger.warn('Viber requires HTTPS to be setup to work properly. See EXTERNAL_URL botpress config.');
    }
    this.bp.logger.info(`Viber Webhook URL is ${publicPath.replace('BOT_ID', '___')}/webhook`);

    this.router.use('/webhook', this.handleIncomingMessage.bind(this))
  }

  async mountBot(botId: string): Promise<void> {
    try {
      const server = http.createServer((req, res) => {
        console.log(req);
        res.writeHead(200);
        res.end();
      });

      server.listen(4001, async () => {
        const config = await this.getConfig();
        const webhookPath = (await this.router.getPublicPath()) + '/webhook';
        const viberClient = new ViberClient(
          {
            accessToken: '4ca2b2be59000d19-b49363357bf1b496-c941a1ab955b7eb6',
            sender: {
              name: config.name || 'mfksdwef',
              avatar: config.avatar || ''
            },
            origin: config.origin,
            onRequest: request => {
              console.log('request.body');
              console.log(request.body);
              console.log('request.body');
            }
          }
        );

        await viberClient.setWebhook(
          'https://e3c863139976.ngrok.io/webhook',
          {
            eventTypes: [EventType.Delivered, EventType.Seen]
          }
        );
        const client = new Client(viberClient);
        this.mountedBots.push({ client, botId });
      })
    } catch (e) {
      console.log(e);
      debugWebhook(`[Viber] error on set webhook ${e}`);
    }
  }

  async unmountBot(botId: string) {
    this.mountedBots = _.remove(this.mountedBots, x => x.botId === botId);
  }
}
