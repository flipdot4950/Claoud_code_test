import axios from 'axios';

// Create axios instance configured for n8n API
export const getN8nClient = () => {
  const apiKey = process.env.N8N_API_KEY;
  const baseURL = process.env.N8N_URL;

  if (!apiKey) {
    throw new Error('N8N_API_KEY is not set in environment variables');
  }

  if (!baseURL) {
    throw new Error('N8N_URL is not set in environment variables');
  }

  return axios.create({
    baseURL: baseURL,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 second timeout
  });
};

// Create workflow in n8n
export const createWorkflow = async (workflowData) => {
  try {
    const client = getN8nClient();

    // Prepare workflow data for n8n API
    const n8nWorkflow = {
      name: workflowData.name,
      nodes: workflowData.nodes,
      connections: workflowData.connections,
      settings: workflowData.settings || { executionOrder: 'v1' },
      active: false // Create as inactive by default
    };

    // Make POST request to n8n API
    const response = await client.post('/api/v1/workflows', n8nWorkflow);

    // Extract workflow ID from response
    const workflowId = response.data.id;
    const n8nUrl = process.env.N8N_URL;

    return {
      success: true,
      workflowId: workflowId,
      url: `${n8nUrl}/workflow/${workflowId}`,
      data: response.data
    };

  } catch (error) {
    console.error('Error creating workflow in n8n:', error);

    // Handle different error types
    let errorMessage = 'Failed to create workflow in n8n';
    let errorDetails = error.message;

    if (error.response) {
      // n8n API returned an error response
      errorMessage = 'n8n API Error';
      errorDetails = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Cannot connect to n8n';
      errorDetails = 'No response from n8n server. Check if N8N_URL is correct and n8n is running.';
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails
    };
  }
};

// Test n8n connection
export const testConnection = async () => {
  try {
    const client = getN8nClient();

    // Try to list workflows to verify connection
    const response = await client.get('/api/v1/workflows');

    return {
      success: true,
      connected: true,
      message: 'Successfully connected to n8n',
      workflowCount: response.data?.data?.length || 0
    };

  } catch (error) {
    console.error('Error testing n8n connection:', error);

    let errorMessage = 'Connection test failed';
    let errorDetails = error.message;

    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        errorMessage = 'Authentication failed';
        errorDetails = 'Invalid N8N_API_KEY. Please check your credentials.';
      } else {
        errorMessage = 'n8n API Error';
        errorDetails = error.response.data?.message || error.response.statusText;
      }
    } else if (error.request) {
      errorMessage = 'Cannot reach n8n';
      errorDetails = 'Please check if N8N_URL is correct and n8n is accessible.';
    }

    return {
      success: false,
      connected: false,
      error: errorMessage,
      details: errorDetails
    };
  }
};

// Validate workflow structure before sending to n8n
export const validateWorkflowStructure = (workflow) => {
  const errors = [];

  // Check required fields
  if (!workflow.name || typeof workflow.name !== 'string') {
    errors.push('Invalid or missing workflow name');
  }

  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    errors.push('Missing or invalid nodes array');
  } else if (workflow.nodes.length === 0) {
    errors.push('Workflow must have at least one node');
  } else {
    // Validate each node
    workflow.nodes.forEach((node, idx) => {
      if (!node.id) errors.push(`Node ${idx}: missing id`);
      if (!node.name) errors.push(`Node ${idx}: missing name`);
      if (!node.type) errors.push(`Node ${idx}: missing type`);
      if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
        errors.push(`Node ${idx} (${node.name}): invalid position (must be [x, y] array)`);
      }
      if (node.typeVersion === undefined) {
        errors.push(`Node ${idx} (${node.name}): missing typeVersion`);
      }
      if (!node.parameters) {
        errors.push(`Node ${idx} (${node.name}): missing parameters`);
      }
    });
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    errors.push('Missing or invalid connections object');
  }

  if (!workflow.settings || typeof workflow.settings !== 'object') {
    errors.push('Missing or invalid settings object');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
