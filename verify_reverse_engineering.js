#!/usr/bin/env node

/**
 * FABRIK - Reverse Engineering Verification
 * 
 * This script clearly demonstrates that FABRIK takes RAG chunks (the OUTPUT)
 * and generates synthetic queries (the INPUT) that could have produced those chunks.
 * 
 * Perfect for AI/AgentTech evaluation datasets!
 */

import { spawn } from 'child_process';

async function verifyReverseEngineering() {
  console.log('🎯 FABRIK REVERSE ENGINEERING VERIFICATION');
  console.log('==========================================\n');

  console.log('📋 Process Overview:');
  console.log('-------------------');
  console.log('1️⃣  You have: RAG CHUNKS (retrieved documents from a query)');
  console.log('2️⃣  FABRIK generates: SYNTHETIC QUERIES (what input could have retrieved these chunks)');
  console.log('3️⃣  Result: Perfect training data for AI/Agent evaluation\n');

  // Start MCP server
  console.log('🚀 Starting FABRIK MCP Server...');
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mcpServer.stderr.on('data', (data) => {
    if (data.toString().includes('MCP server running')) {
      console.log('✅ FABRIK ready for reverse engineering\n');
    }
  });

  // Initialize server
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'reverse-engineering-verification', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 300));

  // Example: These are your RAG CHUNKS (the OUTPUT from a previous query)
  const ragChunksFromYourSystem = [
    {
      score: 0.89,
      textLength: 2400,
      fileName: 'credit-policy-2024.pdf',
      pageLabel: 112,
      textPreview: '# Credit Score Requirements\n\nFor conventional loans, borrowers must have a minimum credit score of 620. Prime borrowers with scores above 740 receive the best rates and terms. Subprime borrowers between 580-619 may qualify with compensating factors...'
    },
    {
      score: 0.85,
      textLength: 2100,
      fileName: 'credit-policy-2024.pdf',
      pageLabel: 113,
      textPreview: '# Compensating Factors for Lower Credit Scores\n\nBorrowers with credit scores below 740 may still qualify if they demonstrate: higher down payment (20% or more), significant liquid reserves (6+ months payments), stable employment history...'
    },
    {
      score: 0.82,
      textLength: 1950,
      fileName: 'credit-policy-2024.pdf',
      pageLabel: 114,
      textPreview: '# Credit Report Analysis\n\nUnderwriters must review credit reports for: payment history patterns, debt-to-income ratios, recent credit inquiries, collections or charge-offs, bankruptcy or foreclosure history...'
    }
  ];

  console.log('📄 EXAMPLE: Your RAG Chunks (OUTPUT from previous query)');
  console.log('=========================================================');
  console.log('These are the chunks your RAG system retrieved. Now FABRIK will reverse-engineer what queries could have produced them:\n');

  ragChunksFromYourSystem.forEach((chunk, i) => {
    console.log(`📋 Chunk ${i + 1}:`);
    console.log(`   📁 File: ${chunk.fileName}`);
    console.log(`   📄 Page: ${chunk.pageLabel}`);
    console.log(`   🎯 Score: ${chunk.score}`);
    console.log(`   📝 Content: ${chunk.textPreview.substring(0, 100)}...`);
    console.log('');
  });

  // Process chunks with FABRIK
  const reverseEngineerRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'process_rag_chunks',
      arguments: {
        chunks: ragChunksFromYourSystem,
        context: 'credit evaluation and lending standards'
      }
    }
  };

  console.log('⚙️  FABRIK REVERSE ENGINEERING IN ACTION...');
  console.log('==========================================');
  mcpServer.stdin.write(JSON.stringify(reverseEngineerRequest) + '\n');

  // Process response
  let responses = '';
  mcpServer.stdout.on('data', (data) => {
    responses += data.toString();
  });

  setTimeout(() => {
    const lines = responses.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        if (response.id === 2 && response.result) {
          const result = JSON.parse(response.result.content[0].text);
          
          console.log('\n🎯 REVERSE ENGINEERED SYNTHETIC QUERIES (INPUTS)');
          console.log('================================================');
          console.log('These are the queries that could have retrieved your chunks:\n');

          console.log('📝 BROAD INPUT QUERIES:');
          result.output.syntheticQueries.broad.forEach((query, i) => {
            console.log(`   ${i + 1}. "${query}"`);
          });

          console.log('\n🔍 SPECIFIC INPUT QUERIES:');
          result.output.syntheticQueries.specific.forEach((query, i) => {
            console.log(`   ${i + 1}. "${query}"`);
          });

          console.log('\n❓ QUESTION-BASED INPUT QUERIES:');
          result.output.syntheticQueries.questionBased.forEach((query, i) => {
            console.log(`   ${i + 1}. "${query}"`);
          });

          console.log('\n🎯 EVALUATION DATASET READY!');
          console.log('============================');
          console.log('Perfect for AI/AgentTech evaluation:\n');

          // Create evaluation pairs
          const evaluationPairs = [];
          const allQueries = [
            ...result.output.syntheticQueries.broad,
            ...result.output.syntheticQueries.specific,
            ...result.output.syntheticQueries.questionBased
          ];

          allQueries.slice(0, 5).forEach((query, i) => {
            evaluationPairs.push({
              input_query: query,
              expected_output: {
                chunks: ragChunksFromYourSystem,
                topics: result.output.analysis.topicsIdentified,
                relevance_threshold: 0.8
              },
              evaluation_criteria: {
                semantic_similarity: 'Query should retrieve similar content',
                topic_coverage: 'Retrieved chunks should cover identified topics',
                relevance_score: 'Retrieved chunks should have scores above threshold'
              }
            });
          });

          console.log('📊 Sample Evaluation Pairs:');
          console.log('---------------------------');
          evaluationPairs.slice(0, 2).forEach((pair, i) => {
            console.log(`\n🔍 Evaluation Pair ${i + 1}:`);
            console.log(`   INPUT: "${pair.input_query}"`);
            console.log(`   EXPECTED: ${pair.expected_output.chunks.length} chunks about [${pair.expected_output.topics.slice(0, 3).join(', ')}]`);
            console.log(`   CRITERIA: ${pair.evaluation_criteria.semantic_similarity}`);
          });

          console.log('\n✅ CONFIRMATION: FABRIK IS DOING REVERSE ENGINEERING!');
          console.log('=====================================================');
          console.log('🔄 Process: RAG Chunks (OUTPUT) → Synthetic Queries (INPUT)');
          console.log('🎯 Perfect for: AI/Agent evaluation datasets');
          console.log('📊 Result: Query-Document pairs for testing retrieval systems');
          console.log('🚀 Use case: Evaluate if your RAG can retrieve the right docs for these queries\n');

          break;
        }
      } catch (e) {
        // Continue parsing
      }
    }
    
    mcpServer.kill();
  }, 2000);
}

verifyReverseEngineering().catch(console.error);