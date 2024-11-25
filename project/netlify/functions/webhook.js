import { createBot } from './bot/bot.js';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const token = process.env.BOT_TOKEN;
    if (!token) {
      throw new Error('BOT_TOKEN must be provided!');
    }

    const bot = createBot(token);
    const update = JSON.parse(event.body);
    
    await bot.handleUpdate(update);
    
    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};