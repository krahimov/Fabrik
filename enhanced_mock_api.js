#!/usr/bin/env node

/**
 * Enhanced Mock API Server for FABRIK Gemini Integration
 * Provides realistic agent configurations for testing
 */

import { createServer } from 'http';

const agentConfigs = {
  'mortgage-advisor-v2': {
    success: true,
    configId: 'mortgage-advisor-v2',
    agent: {
      name: 'Mortgage Lending Advisor',
      description: 'Specialized AI assistant for mortgage lending, underwriting, and loan advisory services'
    },
    workflow: {
      description: 'Advanced mortgage advisory workflow with regulatory compliance and risk assessment',
      steps: [
        'Analyze customer financial profile and requirements',
        'Evaluate loan program suitability and eligibility', 
        'Assess risk factors and compliance requirements',
        'Provide detailed recommendations with supporting rationale',
        'Generate required documentation and next steps'
      ]
    },
    output: {
      expectedFormat: 'structured_advisory_report',
      naturalLanguageFormat: 'Provide detailed, professional mortgage advisory responses with specific recommendations, regulatory considerations, and clear next steps. Use industry terminology appropriately and cite relevant guidelines.',
      syntheticRecordsCount: 15
    },
    systemPromptTemplate: 'You are a senior mortgage lending advisor with 15+ years of experience. Always provide accurate, regulation-compliant advice.',
    complianceRules: [
      'Always mention relevant regulatory requirements',
      'Provide risk disclosures where applicable',
      'Reference current industry standards',
      'Maintain professional, advisory tone'
    ]
  },
  'compliance-specialist': {
    success: true,
    configId: 'compliance-specialist',
    agent: {
      name: 'Financial Compliance Specialist',
      description: 'Expert AI assistant for financial regulatory compliance, risk management, and policy guidance'
    },
    workflow: {
      description: 'Comprehensive compliance analysis and guidance workflow',
      steps: [
        'Identify applicable regulations and standards',
        'Analyze compliance requirements and gaps',
        'Assess regulatory risks and mitigation strategies',
        'Provide specific implementation guidance',
        'Recommend monitoring and reporting procedures'
      ]
    },
    output: {
      expectedFormat: 'compliance_analysis_report', 
      naturalLanguageFormat: 'Deliver precise, regulation-focused responses with specific citations, risk assessments, and actionable compliance recommendations. Maintain authoritative, professional tone.',
      syntheticRecordsCount: 20
    },
    systemPromptTemplate: 'You are a certified financial compliance specialist. Always reference specific regulations and provide implementation guidance.',
    regulatoryFrameworks: [
      'CFPB Guidelines',
      'TRID Requirements', 
      'Fair Lending Laws',
      'BSA/AML Compliance',
      'HMDA Reporting'
    ]
  },
  'customer-service-ai': {
    success: true,
    configId: 'customer-service-ai',
    agent: {
      name: 'Customer Service Assistant',
      description: 'Friendly AI assistant for customer inquiries, support, and general assistance'
    },
    workflow: {
      description: 'Customer-focused support workflow with empathy and solution orientation',
      steps: [
        'Listen actively to customer concerns',
        'Clarify issues and gather relevant information',
        'Provide clear, helpful solutions and options',
        'Escalate complex issues when appropriate',
        'Follow up to ensure customer satisfaction'
      ]
    },
    output: {
      expectedFormat: 'customer_service_response',
      naturalLanguageFormat: 'Respond with warmth, empathy, and clarity. Focus on solving customer problems and providing excellent service experience.',
      syntheticRecordsCount: 30
    },
    systemPromptTemplate: 'You are a helpful, empathetic customer service representative. Always prioritize customer satisfaction and clear communication.'
  }
};

const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MCP-Client');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const url = new URL(req.url, `http://localhost:3003`);
    const pathParts = url.pathname.split('/');
    
    if (pathParts[1] === 'config' && pathParts[2]) {
      // Handle /config/{configId} requests
      const configId = pathParts[2];
      console.log(`📥 Config request for ID: ${configId}`);
      
      if (agentConfigs[configId]) {
        const config = {
          ...agentConfigs[configId],
          requestTimestamp: new Date().toISOString(),
          apiVersion: 'v1.0',
          source: 'enhanced-mock-api'
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(config, null, 2));
      } else {
        console.log(`❌ Config not found: ${configId}`);
        res.writeHead(404);
        res.end(JSON.stringify({ 
          error: 'Configuration not found',
          configId: configId,
          availableConfigs: Object.keys(agentConfigs)
        }));
      }
    } else {
      // List available configs
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'FABRIK Enhanced Config API',
        availableConfigs: Object.keys(agentConfigs),
        usage: 'GET /config/{configId}',
        examples: {
          mortgageAdvisor: '/config/mortgage-advisor-v2',
          complianceSpecialist: '/config/compliance-specialist',
          customerService: '/config/customer-service-ai'
        }
      }, null, 2));
    }
  } else {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`🚀 Enhanced Config API Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available agent configurations:`);
  Object.keys(agentConfigs).forEach(configId => {
    const config = agentConfigs[configId];
    console.log(`   • ${configId}: ${config.agent.name}`);
    console.log(`     URL: http://localhost:${PORT}/config/${configId}`);
  });
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down enhanced config API server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});