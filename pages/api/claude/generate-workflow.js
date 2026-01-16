import { generateWorkflowFromNL } from '../../../lib/claude';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'Message is required and must be a non-empty string'
      });
    }

    // Check message length (prevent abuse)
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long',
        details: 'Message must be less than 2000 characters'
      });
    }

    // Generate workflow using Claude
    const result = await generateWorkflowFromNL(
      message.trim(),
      conversationHistory || []
    );

    // Return result (already includes success flag)
    return res.status(result.success ? 200 : 500).json(result);

  } catch (error) {
    console.error('API Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
