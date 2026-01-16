import { createWorkflow, validateWorkflowStructure } from '../../../lib/n8n';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflow } = req.body;

    // Validate input
    if (!workflow || typeof workflow !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: 'Workflow object is required'
      });
    }

    // Validate workflow structure
    const validation = validateWorkflowStructure(workflow);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workflow structure',
        details: validation.errors.join('; ')
      });
    }

    // Create workflow in n8n
    const result = await createWorkflow(workflow);

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
