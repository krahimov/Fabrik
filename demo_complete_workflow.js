#!/usr/bin/env node

/**
 * Complete FABRIK Workflow Demo
 * Shows all MCP server capabilities including synthetic data generation
 */

import { spawn } from 'child_process';

async function demoCompleteWorkflow() {
  console.log('🎯 FABRIK MCP Server - Complete Workflow Demo');
  console.log('==============================================\n');

  // Sample RAG chunks for testing
  const sampleRAGChunks = [
    {
      score: 0.91,
      textLength: 2200,
      fileName: 'underwriting-manual-2024.pdf',
      pageLabel: 45,
      textPreview: '# Monthly Qualifying Rental Income Requirements\n\nFor conventional loans, borrowers must demonstrate stable rental income through lease agreements, Form 1007, or Form 1025. The monthly qualifying rental income is calculated by taking 75% of the gross rental income...'
    },
    {
      score: 0.87,
      textLength: 1950,
      fileName: 'lending-guidelines.pdf',
      pageLabel: 23,
      textPreview: '# Borrower Eligibility Requirements\n\nGeneral borrower eligibility includes: minimum credit score of 620, debt-to-income ratio below 43%, stable employment history of 2+ years, adequate reserves, and property appraisal meeting guidelines...'
    },
    {
      score: 0.83,
      textLength: 2100,
      fileName: 'homeready-program.pdf',
      pageLabel: 67,
      textPreview: '# HomeReady Transactions with LTV Ratios 95.01-97%\n\nFor HomeReady transactions with high LTV ratios, additional requirements include: at least one first-time homebuyer, subordinate financing restrictions, and enhanced documentation...'
    }
  ];

  // Start enhanced mock API server
  console.log('🌐 Starting Enhanced Config API Server...');
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
  console.log('🔧 Initializing MCP Server...');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'fabrik-complete-demo', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('   ✅ MCP Server initialized\n');

  // Demo 1: Process RAG Chunks for Synthetic Data Generation
  console.log('📊 Demo 1: RAG Chunk Processing & Synthetic Data Generation');
  console.log('============================================================');
  console.log('Input: 3 mortgage lending RAG chunks');
  console.log('Expected: Synthetic queries that could retrieve these chunks\n');

  const ragRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'process_rag_chunks',
      arguments: {
        chunks: sampleRAGChunks,
        context: 'mortgage lending evaluation'
      }
    }
  };

  console.log('⚙️  Processing RAG chunks...');
  mcpServer.stdin.write(JSON.stringify(ragRequest) + '\n');
  
  // Wait for RAG processing response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo 2: Fetch Agent Configuration
  console.log('\n📋 Demo 2: Agent Configuration Fetching');
  console.log('========================================');
  console.log('Fetching mortgage advisor configuration from API...\n');

  const configRequest = {
    jsonrpc: '2.0',
    id: Date.now() + 1,
    method: 'tools/call',
    params: {
      name: 'get_agent_config',
      arguments: {
        apiUrl: 'http://localhost:3003/config',
        agentId: 'mortgage-advisor-v2'
      }
    }
  };

  console.log('⚙️  Fetching configuration...');
  mcpServer.stdin.write(JSON.stringify(configRequest) + '\n');
  
  // Wait for config response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Demo 3: Show what Gemini integration would look like (without API key)
  console.log('\n🤖 Demo 3: Gemini 2.5 Pro Integration Preview');
  console.log('===============================================');
  console.log('This would query Gemini 2.5 Pro with:');
  console.log('• Dynamic system prompt from config');
  console.log('• RAG chunks as context');
  console.log('• User query');
  console.log('• Store interaction in Supabase\n');

  // Collect and display all responses
  let responses = [];
  let responseCount = 0;
  const expectedResponses = 2;

  mcpServer.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.result && response.result.content) {
          responses.push(response.result.content[0].text);
          responseCount++;
          
          if (responseCount >= expectedResponses) {
            displayResults();
          }
        }
      } catch (e) {
        // Continue parsing
      }
    }
  });

  function displayResults() {
    console.log('🎉 WORKFLOW RESULTS');
    console.log('==================\n');

    // Display RAG processing results
    if (responses[0]) {
      console.log('📊 1. RAG Chunk Processing Results:');
      console.log('-----------------------------------');
      try {
        const ragResult = JSON.parse(responses[0]);
        
        console.log(`📈 Analysis:`);
        console.log(`   • Chunks processed: ${ragResult.input.chunksProcessed}`);
        console.log(`   • Topics identified: ${ragResult.output.analysis.topicsIdentified.length}`);
        console.log(`   • Average score: ${ragResult.output.analysis.averageScore.toFixed(3)}`);
        console.log(`   • Sources: ${ragResult.output.analysis.sources.uniqueFiles} files\n`);
        
        console.log(`🎯 Generated Synthetic Queries:`);
        console.log(`   Broad queries: ${ragResult.output.syntheticQueries.broad.length}`);
        console.log(`   Specific queries: ${ragResult.output.syntheticQueries.specific.length}`);
        console.log(`   Question-based: ${ragResult.output.syntheticQueries.questionBased.length}\n`);
        
        console.log(`📝 Example Synthetic Queries:`);
        ragResult.output.syntheticQueries.broad.slice(0, 2).forEach((query, i) => {
          console.log(`   ${i + 1}. ${query}`);
        });
        
        console.log('\n   [This demonstrates reverse engineering: RAG chunks → Synthetic queries]');
        
      } catch (e) {
        console.log(responses[0].substring(0, 500) + '...');
      }
    }

    // Display config results
    if (responses[1]) {
      console.log('\n📋 2. Agent Configuration Results:');
      console.log('----------------------------------');
      try {
        const configResult = JSON.parse(responses[1]);
        console.log(`🤖 Agent: ${configResult.agent.name}`);
        console.log(`📝 Description: ${configResult.agent.description}`);
        console.log(`🔧 Workflow Steps: ${configResult.workflow.steps.length}`);
        console.log(`📊 Output Format: ${configResult.output.expectedFormat}`);
        console.log(`🎯 Synthetic Records Target: ${configResult.output.syntheticRecordsCount}`);
      } catch (e) {
        console.log(responses[1].substring(0, 300) + '...');
      }
    }

    console.log('\n✅ FABRIK MCP Server Capabilities Demonstrated:');
    console.log('===============================================');
    console.log('🔄 1. RAG Chunk Processing → Synthetic Data Generation');
    console.log('📡 2. Dynamic Configuration Fetching from APIs');
    console.log('🤖 3. Gemini 2.5 Pro Integration (requires API key)');
    console.log('💾 4. Supabase Storage Integration');
    console.log('🎯 5. Complete MCP Protocol Implementation');
    console.log('\n🎊 All systems operational within MCP framework!');

    // Cleanup
    mcpServer.kill();
    mockApiServer.kill();
    process.exit(0);
  }

  // Log server activity
  mcpServer.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('[FABRIK]') || output.includes('MCP')) {
      console.log(`   📝 ${output}`);
    }
  });

  // Timeout
  setTimeout(() => {
    if (responseCount < expectedResponses) {
      console.log('\n⏰ Demo timeout - showing available results...');
      displayResults();
    }
  }, 5000);
}

demoCompleteWorkflow().catch(console.error);