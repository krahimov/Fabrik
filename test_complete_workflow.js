#!/usr/bin/env node

/**
 * Complete Workflow Test
 * 
 * This script demonstrates:
 * 1. Fetching agent configuration from API
 * 2. Processing RAG chunks with new input/output format
 * 3. Integration between config and chunk processing
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

class CompleteWorkflowTester {
  constructor() {
    this.mcpServer = null;
    this.mockApiServer = null;
    this.requestId = 1;
  }

  async startMockApiServer() {
    console.log('🚀 Starting Mock API Server...');
    this.mockApiServer = spawn('node', ['mock_api_server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.mockApiServer.stdout.on('data', (data) => {
      console.log('API Server:', data.toString().trim());
    });

    this.mockApiServer.stderr.on('data', (data) => {
      console.error('API Server Error:', data.toString().trim());
    });

    // Wait for server to start
    await setTimeout(1000);
  }

  async startMcpServer() {
    console.log('\n🚀 Starting MCP Server...');
    this.mcpServer = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.mcpServer.stderr.on('data', (data) => {
      console.log('MCP Server:', data.toString().trim());
    });

    // Initialize MCP server
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'workflow-test-client', version: '1.0.0' }
      }
    };

    this.mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
    await setTimeout(100);
  }

  async testConfigFetching() {
    console.log('\n📡 Testing Agent Configuration Fetching');
    console.log('======================================\n');

    const scenarios = [
      {
        name: 'Mortgage Agent Config',
        apiUrl: 'http://localhost:3002',
        agentId: 'mortgage-agent'
      },
      {
        name: 'Compliance Agent Config',
        apiUrl: 'http://localhost:3002',
        agentId: 'compliance-agent'
      },
      {
        name: 'Default Config',
        apiUrl: 'http://localhost:3001'
      }
    ];

    const configs = [];

    for (const scenario of scenarios) {
      console.log(`🔍 Fetching: ${scenario.name}`);
      
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'get_agent_config',
          arguments: {
            apiUrl: scenario.apiUrl,
            ...(scenario.agentId && { agentId: scenario.agentId }),
            headers: {
              'X-Test-Header': 'test-value'
            }
          }
        }
      };

      const config = await this.makeRequest(request);
      configs.push({ scenario: scenario.name, config });
      
      console.log(`   ✅ Agent: ${config.agent.name}`);
      console.log(`   📝 Description: ${config.agent.description.substring(0, 60)}...`);
      console.log(`   🔢 Synthetic Records: ${config.output.syntheticRecordsCount}`);
      console.log(`   📋 Workflow Steps: ${config.workflow.steps.length}\n`);
    }

    return configs;
  }

  async testRagProcessingWithNewFormat() {
    console.log('\n🔧 Testing RAG Chunk Processing (New Input/Output Format)');
    console.log('========================================================\n');

    const sampleChunks = [
      {
        score: 0.92,
        textLength: 2200,
        fileName: 'mortgage-guidelines-2024.pdf',
        pageLabel: 245,
        textPreview: '# Down Payment Requirements\n\nConventional loans typically require a minimum down payment of 3-5% for first-time homebuyers...'
      },
      {
        score: 0.87,
        textLength: 1950,
        fileName: 'mortgage-guidelines-2024.pdf',
        pageLabel: 246,
        textPreview: '# Credit Score Considerations\n\nBorrowers with credit scores below 620 may face additional requirements including higher down payments...'
      },
      {
        score: 0.84,
        textLength: 2100,
        fileName: 'mortgage-guidelines-2024.pdf',
        pageLabel: 247,
        textPreview: '# Debt-to-Income Ratio Analysis\n\nThe debt-to-income ratio should not exceed 43% for qualified mortgage loans...'
      }
    ];

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'process_rag_chunks',
        arguments: {
          chunks: sampleChunks,
          context: 'mortgage lending requirements'
        }
      }
    };

    console.log('📤 Processing RAG chunks...');
    const result = await this.makeRequest(request);

    console.log('\n📊 Results Summary:');
    console.log('==================');
    console.log(`📥 Input Chunks: ${result.input.metadata.chunksProcessed}`);
    console.log(`🏷️  Context: ${result.input.context}`);
    console.log(`⏰ Timestamp: ${result.input.metadata.timestamp}`);
    console.log(`📈 Average Score: ${result.output.analysis.averageScore}`);
    console.log(`🎯 Topics Found: ${result.output.analysis.topicsIdentified.length}`);

    console.log('\n📝 Generated Synthetic Queries:');
    console.log('================================');
    
    console.log('\n🎯 Broad Queries:');
    result.output.syntheticQueries.broad.forEach((query, i) => {
      console.log(`   ${i + 1}. ${query}`);
    });

    console.log('\n🔍 Specific Queries:');
    result.output.syntheticQueries.specific.forEach((query, i) => {
      console.log(`   ${i + 1}. ${query}`);
    });

    console.log('\n❓ Question-Based Queries:');
    result.output.syntheticQueries.questionBased.forEach((query, i) => {
      console.log(`   ${i + 1}. ${query}`);
    });

    return result;
  }

  async testIntegratedWorkflow(configs) {
    console.log('\n🔄 Testing Integrated Workflow');
    console.log('==============================\n');

    // Use the mortgage agent config
    const mortgageConfig = configs.find(c => c.scenario === 'Mortgage Agent Config')?.config;
    
    if (mortgageConfig && mortgageConfig.ragChunks.length > 0) {
      console.log('🎯 Using RAG chunks from fetched config...');
      
      const request = {
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'process_rag_chunks',
          arguments: {
            chunks: mortgageConfig.ragChunks,
            context: mortgageConfig.agent.description
          }
        }
      };

      const result = await this.makeRequest(request);
      
      console.log('\n📋 Integrated Workflow Results:');
      console.log('===============================');
      console.log(`🤖 Agent: ${mortgageConfig.agent.name}`);
      console.log(`📊 Records to Generate: ${mortgageConfig.output.syntheticRecordsCount}`);
      console.log(`🎯 Queries Generated: ${result.output.syntheticQueries.broad.length + result.output.syntheticQueries.specific.length + result.output.syntheticQueries.questionBased.length}`);
      
      console.log('\n🔗 Sample Integration Output:');
      console.log('-----------------------------');
      
      const integratedOutput = {
        agentConfig: {
          name: mortgageConfig.agent.name,
          description: mortgageConfig.agent.description,
          targetRecords: mortgageConfig.output.syntheticRecordsCount,
          workflow: mortgageConfig.workflow.description
        },
        processingResults: {
          input: result.input,
          output: result.output
        },
        syntheticDataSample: result.output.syntheticQueries.broad.slice(0, 3).map(query => ({
          type: 'broad_query',
          query: query,
          context: result.input.context,
          sourceInfo: {
            averageScore: result.output.analysis.averageScore,
            topicRelevance: result.output.analysis.topicsIdentified.slice(0, 3)
          }
        }))
      };

      console.log(JSON.stringify(integratedOutput, null, 2));
    }
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
              // Continue parsing more lines
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
    console.log('\n🧹 Cleaning up...');
    
    if (this.mcpServer) {
      this.mcpServer.kill();
    }
    
    if (this.mockApiServer) {
      this.mockApiServer.kill();
    }
    
    console.log('✅ Cleanup complete');
  }
}

// Run the complete workflow test
async function runCompleteWorkflow() {
  const tester = new CompleteWorkflowTester();
  
  try {
    await tester.startMockApiServer();
    await tester.startMcpServer();
    
    console.log('\n🎯 Complete RAG + API Configuration Workflow Test');
    console.log('================================================\n');
    
    // Test 1: Config fetching
    const configs = await tester.testConfigFetching();
    
    // Test 2: RAG processing with new format
    await tester.testRagProcessingWithNewFormat();
    
    // Test 3: Integrated workflow
    await tester.testIntegratedWorkflow(configs);
    
    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await tester.cleanup();
  }
}

runCompleteWorkflow().catch(console.error);