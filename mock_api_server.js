#!/usr/bin/env node

/**
 * Mock API Server for testing agent configuration
 * This simulates the API that would provide agent config data
 */

import { createServer } from 'http';

const sampleConfigs = {
  'mortgage-agent': {
    agent: {
      name: 'Mortgage Lending Assistant',
      description: 'AI agent specialized in mortgage lending guidelines, regulations, and best practices'
    },
    workflow: {
      steps: [
        'Analyze input RAG chunks for mortgage-related content',
        'Extract key topics and regulatory requirements',
        'Generate synthetic queries covering different aspects',
        'Format output according to specified requirements'
      ],
      description: 'Multi-step workflow for processing mortgage lending documentation and generating comprehensive synthetic training data'
    },
    output: {
      naturalLanguageFormat: 'Generate natural language questions that a mortgage professional would ask when researching specific topics in lending guidelines',
      expectedFormat: 'json',
      syntheticRecordsCount: 25
    },
    ragChunks: [
      {
        score: 0.92,
        textLength: 1800,
        fileName: 'lending-guidelines-2024.pdf',
        pageLabel: 156,
        textPreview: '# Income Verification Requirements\n\nFor all mortgage applications, lenders must verify borrower income through...'
      },
      {
        score: 0.88,
        textLength: 2100,
        fileName: 'lending-guidelines-2024.pdf', 
        pageLabel: 157,
        textPreview: '# Employment History Validation\n\nBorrowers must provide a minimum of 2 years employment history...'
      }
    ]
  },
  'compliance-agent': {
    agent: {
      name: 'Regulatory Compliance Assistant',
      description: 'AI agent focused on financial regulations, compliance requirements, and risk assessment'
    },
    workflow: {
      steps: [
        'Parse regulatory documents and compliance texts',
        'Identify compliance requirements and risk factors',
        'Generate scenario-based queries for training',
        'Create structured compliance data sets'
      ],
      description: 'Workflow designed to process complex regulatory content and generate targeted compliance training scenarios'
    },
    output: {
      naturalLanguageFormat: 'Create compliance-focused questions that regulators or compliance officers would ask when reviewing financial institution practices',
      expectedFormat: 'structured_json',
      syntheticRecordsCount: 15
    },
    ragChunks: [
      {
        score: 0.95,
        textLength: 2200,
        fileName: 'cfpb-regulations-2024.pdf',
        pageLabel: 89,
        textPreview: '# Consumer Protection Requirements\n\nFinancial institutions must implement comprehensive consumer protection measures...'
      }
    ]
  }
};

const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://localhost:3001`);
    const agentId = url.searchParams.get('agentId');
    
    console.log(`📥 Config request for agent: ${agentId || 'default'}`);
    
    let config;
    if (agentId && sampleConfigs[agentId]) {
      config = sampleConfigs[agentId];
    } else {
      // Return default config
      config = sampleConfigs['mortgage-agent'];
    }
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      agentId: agentId || 'default',
      ...config
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available agent configs:`);
  console.log(`   - mortgage-agent: http://localhost:${PORT}?agentId=mortgage-agent`);
  console.log(`   - compliance-agent: http://localhost:${PORT}?agentId=compliance-agent`);
  console.log(`   - default: http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mock API server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});