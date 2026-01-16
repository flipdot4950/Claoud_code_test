import { testConnection } from '../../../lib/n8n';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test n8n connection
    const result = await testConnection();

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
