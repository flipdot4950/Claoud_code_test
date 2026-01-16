import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

// Initialize Anthropic client
export const getClaudeClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }

  return new Anthropic({
    apiKey: apiKey
  });
};

// Generate workflow from natural language
export const generateWorkflowFromNL = async (userMessage, conversationHistory = []) => {
  try {
    const client = getClaudeClient();

    // Build messages array
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: buildUserPrompt(userMessage)
      }
    ];

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    // Extract the response text
    const responseText = response.content[0].text;

    // Parse JSON from response
    let workflowData;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
                        responseText.match(/```\s*([\s\S]*?)\s*```/);

      if (jsonMatch) {
        workflowData = JSON.parse(jsonMatch[1]);
      } else {
        workflowData = JSON.parse(responseText);
      }
    } catch (parseError) {
      throw new Error(`Failed to parse workflow JSON: ${parseError.message}`);
    }

    // Validate basic structure
    if (!workflowData.name || !workflowData.nodes || !workflowData.connections) {
      throw new Error('Generated workflow is missing required fields (name, nodes, or connections)');
    }

    return {
      success: true,
      workflow: {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || { executionOrder: 'v1' }
      },
      explanation: workflowData.explanation || 'Workflow generated successfully'
    };

  } catch (error) {
    console.error('Error generating workflow:', error);

    // Return structured error
    return {
      success: false,
      error: 'Failed to generate workflow',
      details: error.message
    };
  }
};

// Validate workflow structure before sending to n8n
export const validateWorkflowStructure = (workflow) => {
  const errors = [];

  // Check required fields
  if (!workflow.name) {
    errors.push('Missing workflow name');
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('Missing or invalid nodes array');
  } else {
    // Validate each node
    workflow.nodes.forEach((node, idx) => {
      if (!node.id) errors.push(`Node ${idx}: missing id`);
      if (!node.name) errors.push(`Node ${idx}: missing name`);
      if (!node.type) errors.push(`Node ${idx}: missing type`);
      if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
        errors.push(`Node ${idx}: invalid position (must be [x, y] array)`);
      }
      if (node.typeVersion === undefined) {
        errors.push(`Node ${idx}: missing typeVersion`);
      }
    });
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    errors.push('Missing or invalid connections object');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
