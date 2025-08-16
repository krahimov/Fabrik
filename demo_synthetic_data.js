#!/usr/bin/env node

/**
 * FABRIK - Synthetic Data Generation Demo
 * 
 * This demonstrates the complete workflow:
 * 1. Fetch agent configuration from API
 * 2. Process different types of RAG chunks
 * 3. Generate various types of synthetic data
 * 4. Show how everything integrates together
 */

import { spawn } from 'child_process';

class FabrikDemo {
  constructor() {
    this.mcpServer = null;
    this.mockApiServer = null;
    this.requestId = 1;
  }

  async startServers() {
    console.log('🚀 FABRIK - Synthetic Data Generation Demo');
    console.log('==========================================\n');

    // Start mock API server
    console.log('🌐 Starting Configuration API Server...');
    this.mockApiServer = spawn('node', ['mock_api_server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.mockApiServer.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output.includes('🚀')) {
        console.log('   ✅ API Server ready');
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start MCP server
    console.log('🔧 Starting MCP Processing Server...');
    this.mcpServer = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.mcpServer.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output.includes('MCP server running')) {
        console.log('   ✅ MCP Server ready\n');
      }
    });

    // Initialize MCP server
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'fabrik-demo', version: '1.0.0' }
      }
    };

    this.mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  async demonstrateCompleteWorkflow() {
    console.log('📋 WORKFLOW DEMONSTRATION');
    console.log('=========================\n');

    // Step 1: Get different agent configurations
    console.log('🎯 Step 1: Fetching Agent Configurations');
    console.log('----------------------------------------');
    
    const agents = ['mortgage-agent', 'compliance-agent'];
    const agentConfigs = {};

    for (const agentId of agents) {
      console.log(`   📡 Fetching config for: ${agentId}`);
      const config = await this.fetchConfig(agentId);
      agentConfigs[agentId] = config;
      console.log(`   ✅ ${config.agent.name} - ${config.output.syntheticRecordsCount} records target\n`);
    }

    // Step 2: Generate synthetic data for different scenarios
    console.log('🎯 Step 2: Generating Synthetic Data for Different Scenarios');
    console.log('------------------------------------------------------------');

    const scenarios = [
      {
        name: 'Mortgage Application Processing',
        agent: 'mortgage-agent',
        chunks: [
          {
            score: 0.94,
            textLength: 2200,
            fileName: 'underwriting-guidelines-2024.pdf',
            pageLabel: 89,
            textPreview: '# Automated Underwriting Systems\n\nDesktop Underwriter (DU) and Loan Prospector (LP) are automated underwriting systems that evaluate loan applications based on comprehensive risk assessment algorithms...'
          },
          {
            score: 0.91,
            textLength: 1950,
            fileName: 'underwriting-guidelines-2024.pdf',
            pageLabel: 90,
            textPreview: '# Manual Underwriting Requirements\n\nWhen automated systems return a "Refer" decision, manual underwriting is required. Underwriters must evaluate compensating factors including...'
          },
          {
            score: 0.88,
            textLength: 2400,
            fileName: 'underwriting-guidelines-2024.pdf',
            pageLabel: 91,
            textPreview: '# Asset Verification Standards\n\nBorrowers must provide documentation for all assets used for down payment, closing costs, and reserves. Acceptable sources include bank statements...'
          }
        ],
        context: 'mortgage underwriting and approval processes'
      },
      {
        name: 'Risk Assessment & Compliance',
        agent: 'compliance-agent',
        chunks: [
          {
            score: 0.96,
            textLength: 2100,
            fileName: 'compliance-manual-2024.pdf',
            pageLabel: 45,
            textPreview: '# Fair Lending Practices\n\nLenders must ensure equal access to credit regardless of race, color, religion, national origin, sex, marital status, age, or disability...'
          },
          {
            score: 0.93,
            textLength: 1800,
            fileName: 'compliance-manual-2024.pdf',
            pageLabel: 46,
            textPreview: '# TRID Compliance Requirements\n\nThe TILA-RESPA Integrated Disclosure (TRID) rule requires specific timing and content for loan estimates and closing disclosures...'
          }
        ],
        context: 'regulatory compliance and risk management'
      },
      {
        name: 'Customer Service Training',
        agent: 'mortgage-agent',
        chunks: [
          {
            score: 0.89,
            textLength: 1700,
            fileName: 'customer-service-guide.pdf',
            pageLabel: 23,
            textPreview: '# Handling Customer Inquiries\n\nWhen customers call about their loan application status, representatives should first verify identity and then provide clear, accurate updates...'
          },
          {
            score: 0.86,
            textLength: 1900,
            fileName: 'customer-service-guide.pdf',
            pageLabel: 24,
            textPreview: '# Escalation Procedures\n\nComplex issues should be escalated to senior staff when customers express dissatisfaction or when regulatory concerns arise...'
          }
        ],
        context: 'customer service and communication best practices'
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n🎪 Scenario: ${scenario.name}`);
      console.log(`   Agent: ${agentConfigs[scenario.agent].agent.name}`);
      console.log(`   Context: ${scenario.context}`);
      console.log(`   Chunks: ${scenario.chunks.length} documents`);

      const result = await this.processChunks(scenario.chunks, scenario.context);
      
      console.log('\n   📊 Generated Synthetic Data:');
      console.log(`   • Topics Identified: ${result.output.analysis.topicsIdentified.slice(0, 4).join(', ')}`);
      console.log(`   • Average Relevance: ${result.output.analysis.averageScore}`);
      console.log(`   • Total Queries Generated: ${result.output.syntheticQueries.broad.length + result.output.syntheticQueries.specific.length + result.output.syntheticQueries.questionBased.length}`);

      // Show sample generated queries
      console.log('\n   🎯 Sample Synthetic Queries:');
      if (result.output.syntheticQueries.broad.length > 0) {
        console.log(`   📝 Broad: "${result.output.syntheticQueries.broad[0]}"`);
      }
      if (result.output.syntheticQueries.specific.length > 0) {
        console.log(`   🔍 Specific: "${result.output.syntheticQueries.specific[0]}"`);
      }
      if (result.output.syntheticQueries.questionBased.length > 0) {
        console.log(`   ❓ Question: "${result.output.syntheticQueries.questionBased[0]}"`);
      }

      // Generate training data according to agent requirements
      const targetRecords = agentConfigs[scenario.agent].output.syntheticRecordsCount;
      const trainingData = this.generateTrainingDataset(result, scenario, targetRecords);
      
      console.log(`\n   💾 Training Dataset: ${trainingData.length} records generated`);
      console.log(`   📋 Format: ${agentConfigs[scenario.agent].output.expectedFormat}`);
      
      // Show sample training record
      if (trainingData.length > 0) {
        console.log('\n   📄 Sample Training Record:');
        console.log('   -------------------------');
        console.log(JSON.stringify(trainingData[0], null, 6));
      }
    }

    console.log('\n🎯 Step 3: Summary & Integration Patterns');
    console.log('------------------------------------------');
    
    console.log('\n📈 Workflow Benefits:');
    console.log('• ✅ Centralized agent configuration via API');
    console.log('• ✅ Consistent synthetic data generation across agents');
    console.log('• ✅ Complete audit trail with input/output tracking');
    console.log('• ✅ Scalable to multiple domains and use cases');
    console.log('• ✅ Configurable output formats and record counts');

    console.log('\n🔄 Integration Pattern:');
    console.log('1️⃣  API Config → Agent settings, requirements, workflow');
    console.log('2️⃣  RAG Chunks → Semantic analysis, topic extraction');
    console.log('3️⃣  Synthesis → Generate queries based on agent needs');
    console.log('4️⃣  Training Data → Format according to agent specifications');
    console.log('5️⃣  Audit Trail → Complete input/output tracking for quality');
  }

  generateTrainingDataset(result, scenario, targetRecords) {
    const allQueries = [
      ...result.output.syntheticQueries.broad,
      ...result.output.syntheticQueries.specific,
      ...result.output.syntheticQueries.questionBased
    ];

    const trainingData = [];
    const maxRecords = Math.min(targetRecords, allQueries.length);

    for (let i = 0; i < maxRecords; i++) {
      const query = allQueries[i % allQueries.length];
      const sourceChunk = scenario.chunks[i % scenario.chunks.length];
      
      trainingData.push({
        id: `${scenario.name.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`,
        query: query,
        context: scenario.context,
        sourceDocument: {
          fileName: sourceChunk.fileName,
          pageLabel: sourceChunk.pageLabel,
          relevanceScore: sourceChunk.score,
          textPreview: sourceChunk.textPreview.substring(0, 150) + '...'
        },
        metadata: {
          scenario: scenario.name,
          agent: scenario.agent,
          generatedAt: result.input.metadata.timestamp,
          topics: result.output.analysis.topicsIdentified.slice(0, 3),
          queryType: i < result.output.syntheticQueries.broad.length ? 'broad' :
                    i < (result.output.syntheticQueries.broad.length + result.output.syntheticQueries.specific.length) ? 'specific' : 'question-based'
        }
      });
    }

    return trainingData;
  }

  async fetchConfig(agentId) {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'get_agent_config',
        arguments: {
          apiUrl: 'http://localhost:3002',
          agentId: agentId
        }
      }
    };

    return await this.makeRequest(request);
  }

  async processChunks(chunks, context) {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'process_rag_chunks',
        arguments: { chunks, context }
      }
    };

    return await this.makeRequest(request);
  }

  async makeRequest(request) {
    return new Promise((resolve, reject) => {
      let response = '';
      
      const onData = (data) => {
        response += data.toString();
        
        const lines = response.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.id === request.id && parsed.result) {
                this.mcpServer.stdout.removeListener('data', onData);
                const result = JSON.parse(parsed.result.content[0].text);
                resolve(result);
                return;
              }
            } catch (e) {
              // Continue parsing
            }
          }
        }
      };

      this.mcpServer.stdout.on('data', onData);
      this.mcpServer.stdin.write(JSON.stringify(request) + '\n');

      setTimeout(() => {
        this.mcpServer.stdout.removeListener('data', onData);
        reject(new Error('Request timeout'));
      }, 5000).unref();
    });
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up servers...');
    if (this.mcpServer) this.mcpServer.kill();
    if (this.mockApiServer) this.mockApiServer.kill();
    console.log('✅ Demo completed successfully!\n');
  }
}

// Run the complete demo
async function runDemo() {
  const demo = new FabrikDemo();
  
  try {
    await demo.startServers();
    await demo.demonstrateCompleteWorkflow();
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    await demo.cleanup();
  }
}

runDemo().catch(console.error);