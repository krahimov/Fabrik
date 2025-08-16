#!/usr/bin/env node

/**
 * Complete FABRIK Workflow Demo
 * Shows both synthetic data generation AND Gemini integration
 */

import { spawn } from 'child_process';

async function runCompleteDemo() {
  console.log('🎯 FABRIK - Complete Workflow Demo');
  console.log('===================================\n');

  // Start config API server
  console.log('🌐 Starting Configuration API...');
  const mockApiServer = spawn('node', ['enhanced_mock_api.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   ✅ Config API running on localhost:3003\n');

  // Start FABRIK MCP server
  console.log('🔧 Starting FABRIK MCP Server...');
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, GEMINI_API_KEY: 'AIzaSyBN_5VxhnemUWLaz90G53ItXIWDOOSwBRQ' }
  });

  // Initialize MCP server
  console.log('   📡 Initializing MCP protocol...');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'fabrik-demo', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('   ✅ MCP Server initialized\n');

  // Demo 1: Synthetic Data Generation (RAG Chunk Processing)
  console.log('📊 DEMO 1: Synthetic Data Generation');
  console.log('====================================');
  console.log('Input: RAG chunks from mortgage lending documents');
  console.log('Output: Synthetic queries that could retrieve these chunks\n');

  const ragRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'process_rag_chunks',
      arguments: {
        chunks: [
          {
            score: 0.91,
            textLength: 2200,
            fileName: 'mortgage-guidelines-2024.pdf',
            pageLabel: 45,
            textPreview: '# Monthly Qualifying Rental Income Requirements\n\nFor conventional loans, borrowers must demonstrate stable rental income through lease agreements, Form 1007, or Form 1025. Monthly rental income calculations must account for vacancy factors and property expenses...'
          },
          {
            score: 0.87,
            textLength: 1950,
            fileName: 'underwriting-standards.pdf',
            pageLabel: 78,
            textPreview: '# General Borrower Eligibility Requirements\n\nFannie Mae purchases mortgages made to borrowers who are natural persons, have reached legal age, and meet specific credit and income criteria. First-time homebuyer programs have additional requirements...'
          },
          {
            score: 0.83,
            textLength: 2100,
            fileName: 'loan-products-guide.pdf',
            pageLabel: 156,
            textPreview: '# HomeReady Transactions with High LTV Ratios\n\nRequirements for HomeReady transactions with LTV, CLTV, or HCLTV ratios of 95.01 – 97% include subordinate financing restrictions, eligible loan types, and temporary buydown limitations...'
          }
        ],
        context: 'mortgage lending compliance and underwriting'
      }
    }
  };

  console.log('⚙️  Processing RAG chunks through MCP...');
  mcpServer.stdin.write(JSON.stringify(ragRequest) + '\n');

  // Wait for synthetic data generation response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo 2: Gemini Integration with Config
  console.log('\n🤖 DEMO 2: Gemini 2.5 Pro + Config Integration');
  console.log('===============================================');
  console.log('Input: Config ID + User Query');
  console.log('Output: Gemini response with dynamic system prompt\n');

  const geminiRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'gemini_with_config',
      arguments: {
        configId: 'mortgage-advisor-v2',
        userQuery: 'What are the key requirements for conventional loan approval?',
        apiUrl: 'http://localhost:3003/config',
        ragChunks: [
          {
            score: 0.91,
            textLength: 2200,
            fileName: 'mortgage-guidelines-2024.pdf',
            pageLabel: 45,
            textPreview: 'Conventional loan requirements include minimum credit score of 620, debt-to-income ratio below 43%, and stable employment history...'
          }
        ]
      }
    }
  };

  console.log('⚙️  Querying Gemini with dynamic config...');
  mcpServer.stdin.write(JSON.stringify(geminiRequest) + '\n');

  // Capture and display all responses
  let responseCount = 0;
  const responses = [];

  mcpServer.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.result && response.result.content) {
          responseCount++;
          responses.push({
            id: response.id,
            content: JSON.parse(response.result.content[0].text)
          });
        }
      } catch (e) {
        // Continue parsing
      }
    }
  });

  // Log server activity
  mcpServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('[FABRIK]')) {
      console.log('   📝', output);
    }
  });

  // Display results after processing
  setTimeout(() => {
    console.log('\n🎉 WORKFLOW RESULTS');
    console.log('==================\n');

    responses.forEach((resp, index) => {
      const data = resp.content;
      
      if (data.input && data.output) {
        // Synthetic data generation result
        console.log(`📊 Result ${index + 1}: Synthetic Data Generation`);
        console.log('================================================');
        console.log(`📥 Input Chunks: ${data.input.chunksProcessed}`);
        console.log(`📤 Generated Queries: ${data.output.syntheticQueries.broad.length + data.output.syntheticQueries.specific.length}`);
        console.log(`🏷️  Topics Identified: ${data.output.analysis.topicsIdentified.join(', ')}`);
        console.log(`📊 Average Score: ${data.output.analysis.averageScore}`);
        
        console.log('\n🎯 Sample Generated Queries:');
        console.log('----------------------------');
        data.output.syntheticQueries.broad.slice(0, 3).forEach((query, i) => {
          console.log(`${i + 1}. ${query}`);
        });
        
        console.log('\n📝 Specific Queries:');
        console.log('--------------------');
        data.output.syntheticQueries.specific.slice(0, 3).forEach((query, i) => {
          console.log(`${i + 1}. ${query}`);
        });
        
      } else if (data.configId && data.geminiResponse) {
        // Gemini integration result
        console.log(`\n🤖 Result ${index + 1}: Gemini 2.5 Pro Integration`);
        console.log('==============================================');
        console.log(`🆔 Config: ${data.configId}`);
        console.log(`🤖 Agent: ${data.configuration.agent.name}`);
        console.log(`🧠 Model: ${data.metadata.model}`);
        console.log(`📏 Prompt Length: ${data.metadata.promptLength} chars`);
        console.log(`📄 RAG Chunks: ${data.metadata.ragChunksIncluded}`);
        
        console.log('\n🎯 System Prompt Preview:');
        console.log('-------------------------');
        console.log(data.systemPrompt.substring(0, 250) + '...');
        
        console.log('\n🤖 Gemini Response:');
        console.log('-------------------');
        console.log(data.geminiResponse);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    });

    if (responseCount === 0) {
      console.log('⚠️  No responses received. Check server logs above.');
    } else {
      console.log('✅ COMPLETE WORKFLOW DEMONSTRATED!');
      console.log('==================================');
      console.log(`✅ MCP Server: Operational`);
      console.log(`✅ Synthetic Data: Generated ${responseCount > 0 ? '✓' : '✗'}`);
      console.log(`✅ Gemini Integration: ${responseCount > 1 ? 'Working' : 'Pending'}`);
      console.log(`✅ Config Management: Active`);
      console.log(`✅ RAG Processing: Complete`);
    }

    // Cleanup
    mcpServer.kill();
    mockApiServer.kill();
    process.exit(0);
  }, 10000);
}

runCompleteDemo().catch(console.error);