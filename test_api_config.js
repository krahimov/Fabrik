#!/usr/bin/env node

/**
 * Test API Configuration Fetching
 */

import { spawn } from 'child_process';

async function testApiConfig() {
  console.log('🚀 Testing API Configuration Fetching');
  console.log('=====================================\n');

  // Start mock API server
  console.log('🌐 Starting Mock API Server...');
  const mockApiServer = spawn('node', ['mock_api_server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mockApiServer.stdout.on('data', (data) => {
    console.log('API Server:', data.toString().trim());
  });

  // Wait for API server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Start MCP server
  console.log('\n🔧 Starting MCP Server...');
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mcpServer.stderr.on('data', (data) => {
    console.log('MCP Server:', data.toString().trim());
  });

  // Initialize MCP server
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'api-test-client', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 200));

  // Test API config fetching
  const configRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_agent_config',
      arguments: {
        apiUrl: 'http://localhost:3002',
        agentId: 'mortgage-agent',
        headers: {
          'X-Client-Version': '1.0.0',
          'X-Test-Header': 'api-test'
        }
      }
    }
  };

  setTimeout(() => {
    console.log('\n📡 Fetching agent configuration...');
    mcpServer.stdin.write(JSON.stringify(configRequest) + '\n');
  }, 500);

  // Collect response
  let responses = '';
  mcpServer.stdout.on('data', (data) => {
    responses += data.toString();
  });

  setTimeout(() => {
    console.log('\n📋 Configuration Response:');
    console.log('==========================\n');
    
    const lines = responses.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.id === 2 && response.result) {
          const config = JSON.parse(response.result.content[0].text);
          
          console.log('✅ Successfully fetched agent configuration!');
          console.log('============================================\n');
          
          console.log('🤖 Agent Information:');
          console.log(`   • Name: ${config.agent.name}`);
          console.log(`   • Description: ${config.agent.description}\n`);
          
          console.log('🔄 Workflow:');
          console.log(`   • Description: ${config.workflow.description}`);
          console.log('   • Steps:');
          config.workflow.steps.forEach((step, i) => {
            console.log(`     ${i + 1}. ${step}`);
          });
          
          console.log('\n📤 Output Configuration:');
          console.log(`   • Format: ${config.output.expectedFormat}`);
          console.log(`   • Records to generate: ${config.output.syntheticRecordsCount}`);
          console.log(`   • Natural language format: ${config.output.naturalLanguageFormat}\n`);
          
          console.log('📊 Provided RAG Chunks:');
          console.log(`   • Number of chunks: ${config.ragChunks.length}`);
          config.ragChunks.forEach((chunk, i) => {
            console.log(`   • Chunk ${i + 1}: Score ${chunk.score}, Page ${chunk.pageLabel}, Length ${chunk.textLength}`);
          });
          
          console.log('\n📅 Request Metadata:');
          console.log(`   • Timestamp: ${config.timestamp}`);
          console.log(`   • API URL: ${config.apiUrl}`);
          console.log(`   • Agent ID: ${config.agentId}\n`);
          
          console.log('💾 Complete Configuration Structure:');
          console.log('====================================');
          console.log('```json');
          console.log(JSON.stringify(config, null, 2));
          console.log('```\n');
          
          break;
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    }
    
    // Cleanup
    mcpServer.kill();
    mockApiServer.kill();
    console.log('🏁 API configuration test completed successfully!');
  }, 2000);
}

testApiConfig().catch(console.error);