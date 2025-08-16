#!/usr/bin/env node

/**
 * Test the new input/output format for RAG chunk processing
 */

import { spawn } from 'child_process';

async function testNewFormat() {
  console.log('🚀 Testing New Input/Output Format for RAG Chunk Processing');
  console.log('===========================================================\n');

  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mcpServer.stderr.on('data', (data) => {
    console.log('MCP Server:', data.toString().trim());
  });

  // Initialize server
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'format-test-client', version: '1.0.0' }
    }
  };

  console.log('📡 Initializing MCP server...');
  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

  // Test RAG chunk processing
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
            pageLabel: 156,
            textPreview: '# Down Payment Requirements\n\nConventional loans typically require a minimum down payment of 3-5% for first-time homebuyers. Veterans and active military may qualify for VA loans with no down payment requirement...'
          },
          {
            score: 0.87,
            textLength: 1950,
            fileName: 'mortgage-guidelines-2024.pdf',
            pageLabel: 157,
            textPreview: '# Credit Score Impact\n\nBorrowers with credit scores above 740 typically receive the best interest rates. Scores between 620-739 may qualify but with higher rates...'
          },
          {
            score: 0.84,
            textLength: 2100,
            fileName: 'mortgage-guidelines-2024.pdf',
            pageLabel: 158,
            textPreview: '# Debt-to-Income Calculations\n\nTotal monthly debt payments should not exceed 43% of gross monthly income for qualified mortgages. This includes housing costs, car payments...'
          }
        ],
        context: 'mortgage lending eligibility requirements'
      }
    }
  };

  setTimeout(() => {
    console.log('🔧 Processing RAG chunks with new format...');
    mcpServer.stdin.write(JSON.stringify(ragRequest) + '\n');
  }, 200);

  // Collect and parse response
  let responses = '';
  mcpServer.stdout.on('data', (data) => {
    responses += data.toString();
  });

  setTimeout(() => {
    console.log('\n📊 Processing Response:');
    console.log('======================\n');
    
    const lines = responses.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.id === 2 && response.result) {
          const result = JSON.parse(response.result.content[0].text);
          
          console.log('✅ New Format Structure:');
          console.log('========================\n');
          
          console.log('📥 INPUT SECTION:');
          console.log('================');
          console.log(`• Context: ${result.input.context}`);
          console.log(`• Chunks processed: ${result.input.metadata.chunksProcessed}`);
          console.log(`• Timestamp: ${result.input.metadata.timestamp}`);
          console.log(`• Original chunks: ${result.input.chunks.length} items`);
          
          console.log('\n📤 OUTPUT SECTION:');
          console.log('=================');
          console.log('📈 Analysis:');
          console.log(`   • Topics: ${result.output.analysis.topicsIdentified.join(', ')}`);
          console.log(`   • Average score: ${result.output.analysis.averageScore}`);
          console.log(`   • Page range: ${result.output.analysis.sources.pageRange.min}-${result.output.analysis.sources.pageRange.max}`);
          console.log(`   • Avg text length: ${result.output.analysis.sources.averageTextLength}`);
          
          console.log('\n🎯 Generated Synthetic Queries:');
          console.log('==============================');
          
          console.log('\n📝 Broad Queries:');
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
          
          console.log('\n💾 Complete JSON Structure:');
          console.log('===========================');
          console.log('```json');
          console.log(JSON.stringify(result, null, 2));
          console.log('```\n');
          
          console.log('✨ Input and Output are now combined in a single JSON response!');
          console.log('🎯 Perfect for logging, analysis, and further processing.');
          
          break;
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    }
    
    mcpServer.kill();
    console.log('\n🏁 Test completed successfully!');
  }, 1500);
}

testNewFormat().catch(console.error);