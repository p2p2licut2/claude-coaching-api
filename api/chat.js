// api/chat.js
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Enable CORS to allow your Webflow site to make requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST for actual requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationId, previousMessages } = req.body;
    
    // Initialize the Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY, // Store this in Vercel environment variables
    });

    // Prepare messages array including your training context
    const messages = [
      { 
        role: 'system', 
        content: 'You are a life coach assistant trained by [YOUR NAME]. Your purpose is to provide coaching guidance using the specific methods and approaches developed by [YOUR NAME]. [ADD YOUR SPECIFIC COACHING INSTRUCTIONS HERE]' 
      },
      ...previousMessages,
      { role: 'user', content: message }
    ];

    // Call the Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219', // Use your preferred model
      messages: messages,
      max_tokens: 1000,
    });

    // Return the response to the client
    return res.status(200).json({
      reply: response.content[0].text,
      conversationId: conversationId || generateConversationId(),
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

// Simple function to generate a conversation ID if none exists
function generateConversationId() {
  return Math.random().toString(36).substring(2, 15);
}