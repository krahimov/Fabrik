#!/usr/bin/env node

/**
 * Test real Gemini API with Samantha Longo data
 */

import { spawn } from 'child_process';

async function testRealGemini() {
  console.log('🤖 Testing Real Gemini API with Samantha Longo Data');
  console.log('===================================================');
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
  console.log('');

  // Start MCP server
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY }
  });

  // Log server output
  mcpServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('[FABRIK]')) {
      console.log('🔧', output);
    }
  });

  // Initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'gemini-real-test', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('✅ MCP Server initialized\n');

  // Test Gemini with a simple query
  console.log('🧠 Testing Gemini with Samantha Longo Context');
  console.log('==============================================');
  
  const geminiRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'gemini_with_config',
      arguments: {
        configId: 'morty-ai',
        userQuery: 'What is Samantha Longo\'s qualifying monthly income and why can\'t she get a mortgage?',
        apiUrl: 'http://unused.com'
      }
    }
  };

  console.log('⚙️  Sending query to Gemini 2.5 Pro...');
  console.log('📝 Query: "What is Samantha Longo\'s qualifying monthly income and why can\'t she get a mortgage?"');
  console.log('⏳ Waiting for response (this may take 30-60 seconds)...\n');

  mcpServer.stdin.write(JSON.stringify(geminiRequest) + '\n');

  // Capture response with longer timeout
  const responsePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout after 60 seconds'));
    }, 60000); // 60 second timeout

    const onData = (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id === 2 && response.result && response.result.content) {
            clearTimeout(timeout);
            const result = JSON.parse(response.result.content[0].text);
            mcpServer.stdout.off('data', onData);
            resolve(result);
            break;
          }
        } catch (e) {
          // Continue parsing
        }
      }
    };
    mcpServer.stdout.on('data', onData);
  });

  try {
    const result = await responsePromise;
    
    console.log('🎉 SUCCESS! Gemini 2.5 Pro Response Received!');
    console.log('==============================================');
    console.log(`📊 Response Length: ${result.response?.length || 0} characters`);
    console.log(`🔍 Contains "Samantha": ${result.response?.includes('Samantha') ? 'Yes ✅' : 'No ❌'}`);
    console.log(`💰 Contains "income": ${result.response?.includes('income') ? 'Yes ✅' : 'No ❌'}`);
    console.log(`🏦 Contains "mortgage": ${result.response?.includes('mortgage') ? 'Yes ✅' : 'No ❌'}`);
    console.log('');
    
    console.log('📝 Gemini Response Preview (first 500 chars):');
    console.log('─'.repeat(60));
    console.log(result.response?.substring(0, 500) + '...');
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('This could be due to:');
    console.log('- API key issues');
    console.log('- Network connectivity');
    console.log('- Gemini API rate limits');
    console.log('- Server processing time');
  }

  // Cleanup
  mcpServer.kill();
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}

testRealGemini().catch(console.error);
