import config from './config';
import express from 'express';
import EngagementTrackingService from './services/EngagementTracking';
import { IConversation } from './interfaces/IConversation';
import {
  deleteConversationFromQueue,
  receiveConversationFromQueue,
} from './services/sqsService';
import loggerInstance from './loaders/logger';

const engagementTrackingService = new EngagementTrackingService();

const consumeConversationQueue = async () => {
  try {
    const message = await receiveConversationFromQueue();
    if (message && message.Body != null) {
      const conversation = JSON.parse(message.Body) as IConversation;
      await engagementTrackingService.trackEngagementHandler(conversation);
      await deleteConversationFromQueue(message.ReceiptHandle || '');
    }
  } catch (e) {
    console.log(`Error: ${e}`);
  }
};

const startServer = async () => {
  const app = express();

  /**
   * Endpoint to check server health
   */
  app.get('/status', (req, res) => {
    res.status(200).end();
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  app
    .listen(config.port, () => {
      loggerInstance.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
      console.log(
        '  App is running at http://localhost:%d in %s mode',
        config.port,
        app.get('env')
      );
      setInterval(consumeConversationQueue, 10000);
    })
    .on('error', (err: any) => {
      loggerInstance.error(err);
      process.exit(1);
    });
};

startServer();
