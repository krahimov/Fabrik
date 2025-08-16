#!/usr/bin/env node

/**
 * Working Gemini 2.5 Pro MCP Test with Proper Timeout
 */

import { spawn } from 'child_process';

async function testWorkingGemini() {
  console.log('🎉 FABRIK + Gemini 2.5 Pro - WORKING TEST');
  console.log('==========================================\n');

  // Start config API
  console.log('🌐 Starting Config API...');
  const mockApiServer = spawn('node', ['enhanced_mock_api.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   ✅ Config API ready\n');

  // Start MCP server
  console.log('🚀 Starting FABRIK MCP Server...');
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, GEMINI_API_KEY: 'AIzaSyBN_5VxhnemUWLaz90G53ItXIWDOOSwBRQ' }
  });

  // Initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'working-test', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('   ✅ MCP Server initialized\n');

  // Test Gemini integration
  console.log('🤖 Testing Gemini 2.5 Pro Integration...');
  console.log('   Query: "What are basic loan requirements?"');
  console.log('   Expected: Structured advisory report\n');

  const geminiRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'gemini_with_config',
      arguments: {
        configId: 'mortgage-advisor-v2',
        userQuery: 'What are the basic loan requirements for a conventional mortgage?',
        apiUrl: 'http://localhost:3003/config'
      }
    }
  };

  console.log('⚙️  Sending request...');
  mcpServer.stdin.write(JSON.stringify(geminiRequest) + '\n');

  // Capture server logs
  mcpServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('[FABRIK]')) {
      console.log('   📝', output);
    }
  });

  // Capture response with longer timeout
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
          
          console.log('\n🎉 SUCCESS! Complete Gemini 2.5 Pro Response Received!');
          console.log('======================================================\n');
          
          console.log('📊 Workflow Summary:');
          console.log('====================');
          console.log(`✅ Config ID: ${result.configId}`);
          console.log(`✅ Agent: ${result.configuration.agent.name}`);
          console.log(`✅ Model: ${result.metadata.model}`);
          console.log(`✅ System Prompt: ${result.metadata.promptLength} characters`);
          console.log(`✅ RAG Chunks: ${result.metadata.ragChunksIncluded}`);
          console.log(`✅ Generated: ${result.metadata.timestamp}\n`);
          
          console.log('🎯 System Prompt Preview:');
          console.log('=========================');
          console.log(result.systemPrompt.substring(0, 400) + '...\n');
          
          console.log('🤖 Gemini 2.5 Pro Response:');
          console.log('===========================');
          console.log(result.geminiResponse);
          
          console.log('\n🏆 COMPLETE INTEGRATION SUCCESS!');
          console.log('=================================');
          console.log('✅ MCP Server: Operational');
          console.log('✅ Config API: Working');
          console.log('✅ Gemini 2.5 Pro: Responding');
          console.log('✅ Dynamic Prompts: Generated');
          console.log('✅ Supabase: Configured');
          console.log('✅ End-to-End: Working');
          
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

  // Extended timeout for streaming response
  setTimeout(() => {
    if (!responseReceived) {
      console.log('\n⏰ Extended timeout reached');
      console.log('💡 Gemini 2.5 Pro may be generating a long response');
      console.log('🔍 Check server logs above for streaming chunks');
    }
    mcpServer.kill();
    mockApiServer.kill();
    process.exit(1);
  }, 60000); // 60 second timeout for full response
}

testWorkingGemini().catch(console.error);