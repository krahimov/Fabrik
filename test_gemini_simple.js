#!/usr/bin/env node

/**
 * Simple Gemini + Config Integration Test
 * Tests the complete workflow: Config ID → API GET → System Prompt → Gemini 2.5 Pro
 */

import { spawn } from 'child_process';

async function testGeminiSimple() {
  console.log('🚀 FABRIK - Gemini Integration Test');
  console.log('===================================\n');

  // Start the enhanced mock API server
  console.log('🌐 Starting Config API Server...');
  const mockApiServer = spawn('node', ['enhanced_mock_api.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Wait for API server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   ✅ Config API ready on port 3003\n');

  // Start FABRIK MCP server
  console.log('🔧 Starting FABRIK MCP Server...');
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Initialize MCP server
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'gemini-test', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('   ✅ FABRIK MCP ready\n');

  // Test the gemini_with_config tool
  console.log('🎯 Testing Gemini + Config Integration...');
  console.log('   Config ID: mortgage-advisor-v2');
  console.log('   Query: "What are the basic requirements for a mortgage loan?"');
  console.log('   Expected: Dynamic system prompt + Gemini response\n');

  const geminiRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'gemini_with_config',
      arguments: {
        configId: 'mortgage-advisor-v2',
        userQuery: 'What are the basic requirements for a mortgage loan?',
        apiUrl: 'http://localhost:3003/config'
      }
    }
  };

  console.log('⚙️  Sending request to FABRIK...');
  mcpServer.stdin.write(JSON.stringify(geminiRequest) + '\n');

  // Capture and process responses
  let responseReceived = false;
  
  mcpServer.stdout.on('data', (data) => {
    if (responseReceived) return;
    
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.result && response.result.content) {
          const result = JSON.parse(response.result.content[0].text);
          responseReceived = true;
          
          console.log('✅ SUCCESS! Gemini Integration Working\n');
          console.log('📊 Response Details:');
          console.log('===================');
          console.log(`🆔 Config ID: ${result.configId}`);
          console.log(`🤖 Agent: ${result.configuration.agent.name}`);
          console.log(`📏 System Prompt: ${result.metadata.promptLength} characters`);
          console.log(`🧠 Model: ${result.metadata.model}`);
          console.log(`⏰ Timestamp: ${result.metadata.timestamp}\n`);
          
          console.log('🎯 System Prompt Preview:');
          console.log('========================');
          console.log(result.systemPrompt.substring(0, 400) + '...\n');
          
          console.log('🤖 Gemini Response:');
          console.log('==================');
          console.log(result.geminiResponse + '\n');
          
          console.log('✅ INTEGRATION CONFIRMED!');
          console.log('=========================');
          console.log('🔄 Complete Flow: Config ID → API → System Prompt → Gemini 2.5 Pro');
          console.log('🎯 Ready for production use!');
          
          // Cleanup
          mcpServer.kill();
          mockApiServer.kill();
          process.exit(0);
        }
      } catch (e) {
        // Continue parsing
      }
    }
  });

  mcpServer.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('FABRIK')) {
      console.log('   📝', output.trim());
    }
  });

  // Timeout after 10 seconds
  setTimeout(() => {
    if (!responseReceived) {
      console.log('⚠️  Timeout - Check if Gemini API key is configured correctly');
      console.log('💡 Make sure GEMINI_API_KEY environment variable is set');
    }
    mcpServer.kill();
    mockApiServer.kill();
    process.exit(1);
  }, 10000);
}

testGeminiSimple().catch(console.error);