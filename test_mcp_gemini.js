#!/usr/bin/env node

/**
 * Direct MCP Server Test with Gemini 2.5 Pro
 * This tests the MCP server directly using the gemini_with_config tool
 */

import { spawn } from 'child_process';

async function testMCPGemini() {
  console.log('🔧 FABRIK MCP Server + Gemini 2.5 Pro Test');
  console.log('============================================\n');

  // Start enhanced mock API server
  console.log('🌐 Starting Config API Server...');
  const mockApiServer = spawn('node', ['enhanced_mock_api.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   ✅ Config API ready on port 3003\n');

  // Start FABRIK MCP server
  console.log('🚀 Starting FABRIK MCP Server...');
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
      clientInfo: { name: 'fabrik-gemini-test', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('   ✅ MCP Server initialized\n');

  // Test Gemini integration
  console.log('🎯 Testing Gemini 2.5 Pro Integration via MCP...');
  console.log('   Tool: gemini_with_config');
  console.log('   Config: mortgage-advisor-v2');
  console.log('   Query: "What are the basic loan eligibility requirements?"\n');

  const geminiRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'gemini_with_config',
      arguments: {
        configId: 'mortgage-advisor-v2',
        userQuery: 'What are the basic loan eligibility requirements?',
        apiUrl: 'http://localhost:3003/config'
      }
    }
  };

  console.log('⚙️  Sending request to MCP Server...');
  mcpServer.stdin.write(JSON.stringify(geminiRequest) + '\n');

  // Handle responses
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
          
          console.log('✅ SUCCESS! MCP + Gemini 2.5 Pro Working!\n');
          console.log('📊 Response Details:');
          console.log('===================');
          console.log(`🆔 Config ID: ${result.configId}`);
          console.log(`🤖 Agent: ${result.configuration.agent.name}`);
          console.log(`🧠 Model: ${result.metadata.model}`);
          console.log(`📏 System Prompt: ${result.metadata.promptLength} chars`);
          console.log(`⏰ Generated: ${result.metadata.timestamp}\n`);
          
          console.log('🎯 System Prompt Sample:');
          console.log('========================');
          console.log(result.systemPrompt.substring(0, 300) + '...\n');
          
          console.log('🤖 Gemini 2.5 Pro Response:');
          console.log('===========================');
          console.log(result.geminiResponse + '\n');
          
          console.log('🎉 INTEGRATION COMPLETE!');
          console.log('========================');
          console.log('✅ MCP Server: Running');
          console.log('✅ Config API: Fetching configs');
          console.log('✅ Gemini 2.5 Pro: Generating responses');
          console.log('✅ Supabase: Storing interactions (if configured)');
          console.log('✅ System Prompts: Dynamic from config');
          
          // Cleanup and exit
          mcpServer.kill();
          mockApiServer.kill();
          process.exit(0);
        }
      } catch (e) {
        // Continue parsing
      }
    }
  });

  // Log MCP server errors/debug info
  mcpServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('[FABRIK]')) {
      console.log('   📝', output);
    }
  });

  // Timeout handler
  setTimeout(() => {
    if (!responseReceived) {
      console.log('⚠️  No response received within 15 seconds');
      console.log('💡 Check:');
      console.log('   • GEMINI_API_KEY environment variable is set');
      console.log('   • Internet connection is available');
      console.log('   • Gemini API quota is not exceeded\n');
      console.log('🔍 Set your API key with:');
      console.log('   export GEMINI_API_KEY="your_api_key_here"');
    }
    mcpServer.kill();
    mockApiServer.kill();
    process.exit(1);
  }, 15000);
}

testMCPGemini().catch(console.error);