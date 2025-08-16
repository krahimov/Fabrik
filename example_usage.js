#!/usr/bin/env node

/**
 * Example: How to integrate RAG chunk processing with your existing system
 * 
 * This demonstrates how you would call the MCP server from your RAG application
 * to generate synthetic queries based on retrieved chunks.
 */

import { spawn } from 'child_process';

class RagChunkProcessor {
  constructor() {
    this.mcpServer = null;
    this.requestId = 1;
  }

  async startServer() {
    console.log('🚀 Starting MCP Server...');
    this.mcpServer = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Initialize the server
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'rag-client', version: '1.0.0' }
      }
    };

    this.mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ MCP Server initialized');
  }

  async processSources(sources, context = '') {
    const chunks = sources.map(source => ({
      score: source.score,
      textLength: source.textLength,
      fileName: source.fileName,
      pageLabel: source.pageLabel,
      textPreview: source.textPreview,
      fullText: source.fullText || ''
    }));

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'process_rag_chunks',
        arguments: { chunks, context }
      }
    };

    return new Promise((resolve, reject) => {
      let response = '';
      
      const onData = (data) => {
        response += data.toString();
        
        // Try to parse each line as JSON
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
              // Continue trying to parse more lines
            }
          }
        }
      };

      this.mcpServer.stdout.on('data', onData);
      this.mcpServer.stdin.write(JSON.stringify(request) + '\n');

      // Timeout after 5 seconds
      setTimeout(() => {
        this.mcpServer.stdout.removeListener('data', onData);
        reject(new Error('Request timeout'));
      }, 5000);
    });
  }

  stop() {
    if (this.mcpServer) {
      this.mcpServer.kill();
    }
  }
}

// Example usage simulation
async function simulateRagWorkflow() {
  console.log('🔍 Simulating RAG Query Processing Workflow');
  console.log('==========================================\n');

  const processor = new RagChunkProcessor();
  await processor.startServer();

  try {
    // Simulate different RAG retrieval scenarios
    const scenarios = [
      {
        name: 'Rental Income Query',
        context: 'rental property income calculations',
        sources: [
          {
            score: 0.91,
            textLength: 1850,
            fileName: 'lending-guide.pdf',
            pageLabel: 45,
            textPreview: '# Rental Income Verification\n\nFor investment properties, rental income must be verified through lease agreements and documented rental history...'
          },
          {
            score: 0.87,
            textLength: 2100,
            fileName: 'lending-guide.pdf',
            pageLabel: 46,
            textPreview: '# Income Calculation Methods\n\nNet rental income is calculated by taking gross rental income minus expenses including taxes, insurance, maintenance...'
          }
        ]
      },
      {
        name: 'First-Time Homebuyer Query',
        context: 'first-time homebuyer programs',
        sources: [
          {
            score: 0.89,
            textLength: 1950,
            fileName: 'homebuyer-guide.pdf',
            pageLabel: 12,
            textPreview: '# First-Time Homebuyer Definition\n\nA first-time homebuyer is someone who has not owned a home in the past 3 years...'
          },
          {
            score: 0.84,
            textLength: 2200,
            fileName: 'homebuyer-guide.pdf',
            pageLabel: 13,
            textPreview: '# Available Programs\n\nFirst-time homebuyers may qualify for reduced down payment requirements, lower interest rates...'
          }
        ]
      }
    ];

    for (const scenario of scenarios) {
      console.log(`📋 Processing: ${scenario.name}`);
      console.log(`   Context: ${scenario.context}`);
      console.log(`   Sources: ${scenario.sources.length} chunks\n`);

      const result = await processor.processSources(scenario.sources, scenario.context);

      console.log('   🎯 Top Generated Queries:');
      result.syntheticQueries.broad.slice(0, 2).forEach((query, i) => {
        console.log(`      ${i + 1}. ${query}`);
      });
      result.syntheticQueries.specific.slice(0, 2).forEach((query, i) => {
        console.log(`      ${i + 3}. ${query}`);
      });

      console.log(`   📊 Average Score: ${result.analysis.averageScore}`);
      console.log(`   📝 Topics: ${result.analysis.topicsIdentified.slice(0, 3).join(', ')}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    processor.stop();
    console.log('🏁 Workflow completed');
  }
}

// Integration example for your RAG system
function integrateWithYourRagSystem() {
  console.log('\n💡 Integration Example:');
  console.log('======================\n');
  
  console.log(`
// In your RAG system:
async function handleUserQuery(userQuery) {
  // 1. Perform normal RAG retrieval
  const ragResponse = await ragEngine.query(userQuery);
  
  // 2. Extract source chunks
  const sourceChunks = ragResponse.sourceNodes.map(node => ({
    score: node.score,
    textLength: node.text.length,
    fileName: node.metadata.fileName,
    pageLabel: node.metadata.pageLabel,
    textPreview: node.text.substring(0, 200) + '...',
    fullText: node.text
  }));
  
  // 3. Generate synthetic queries using MCP server
  const processor = new RagChunkProcessor();
  await processor.startServer();
  const analysis = await processor.processSources(sourceChunks, 'mortgage lending');
  processor.stop();
  
  // 4. Use synthetic queries for:
  // - Query expansion
  // - Training data generation  
  // - Testing retrieval quality
  // - User suggestion prompts
  
  return {
    answer: ragResponse.response,
    sources: sourceChunks,
    syntheticQueries: analysis.syntheticQueries,
    analysis: analysis.analysis
  };
}
  `);
}

// Run the example
simulateRagWorkflow()
  .then(() => integrateWithYourRagSystem())
  .catch(console.error);