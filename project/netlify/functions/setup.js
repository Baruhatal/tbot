import { createBot } from './bot/bot.js';

export const handler = async () => {
  try {
    const token = process.env.BOT_TOKEN;
    if (!token) {
      throw new Error('BOT_TOKEN must be provided!');
    }

    const bot = createBot(token);
    const webhookUrl = process.env.URL + '/.netlify/functions/webhook';
    
    await bot.telegram.setWebhook(webhookUrl);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook set successfully' })
    };
  } catch (error) {
    console.error('Setup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};