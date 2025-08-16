#!/usr/bin/env node

import { spawn } from 'child_process';

// Sample RAG chunks based on your provided data
const sampleRagChunks = [
  {
    score: 0.586926,
    textLength: 2161,
    fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
    pageLabel: 338,
    textPreview: '# Calculating Monthly Qualifying Rental Income (or Loss)\n\n# Lease Agreements, Form 1007, or Form 1025\n\n# Treatment of the Income (or Loss)\n\n# Offsetti...'
  },
  {
    score: 0.572078,
    textLength: 2040,
    fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
    pageLabel: 525,
    textPreview: 'appear on the credit report, such as monthly housing expenses for taxes, insurance, must be disclosed in the loan application prior to final submissio...'
  },
  {
    score: 0.5663309,
    textLength: 2126,
    fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
    pageLabel: 242,
    textPreview: 'General Borrower Eligibility Requirements\n\n# General Borrower Eligibility Requirements\n\nFannie Mae purchases or securitizes mortgages made to borrower...'
  },
  {
    score: 0.55391616,
    textLength: 1982,
    fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
    pageLabel: 795,
    textPreview: 'Requirements for HomeReady Transactions with LTV, CLTV, or HCLTV Ratios of 95.01 – 97%\n\n# Subordinate Financing\n\n# Eligible Loan Types\n\n# Temporary Bu...'
  },
  {
    score: 0.5443418,
    textLength: 2649,
    fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
    pageLabel: 561,
    textPreview: 'See Fannie Mae and Freddie Mac Uniform Appraisal Dataset Specification, Appendix D: Field-Specific Standardization Requirements, and the associated FA...'
  },
  {
    score: 0.5425973,
    textLength: 2035,
    fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
    pageLabel: 191,
    textPreview: '# Criteria\n\n# Requirements\n\n- At least one borrower must be a first-time homebuyer, as indicated on the Form 1003 in the Declarations section, when at...'
  }
];

async function testRagChunkProcessing() {
  console.log('🚀 Testing RAG Chunk Processing with MCP Server');
  console.log('===============================================\n');

  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Handle server errors
  mcpServer.stderr.on('data', (data) => {
    console.log('MCP Server:', data.toString().trim());
  });

  // Send the initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  console.log('📡 Sending initialize request...');
  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

  // Send the process_rag_chunks tool call
  const toolCallRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'process_rag_chunks',
      arguments: {
        chunks: sampleRagChunks,
        context: 'mortgage lending guidelines'
      }
    }
  };

  setTimeout(() => {
    console.log('🔧 Calling process_rag_chunks tool...');
    mcpServer.stdin.write(JSON.stringify(toolCallRequest) + '\n');
  }, 100);

  // Collect responses
  let responses = '';
  mcpServer.stdout.on('data', (data) => {
    responses += data.toString();
  });

  // Process responses after a short delay
  setTimeout(() => {
    console.log('\n📊 Processing Responses:');
    console.log('========================\n');
    
    const lines = responses.split('\n').filter(line => line.trim());
    lines.forEach((line, index) => {
      try {
        const response = JSON.parse(line);
        if (response.id === 2 && response.result) {
          console.log('✅ RAG Chunk Processing Results:');
          console.log('================================\n');
          
          const result = JSON.parse(response.result.content[0].text);
          
          console.log('📈 Analysis Summary:');
          console.log(`• Chunks processed: ${result.input.chunksProcessed}`);
          console.log(`• Context: ${result.input.context}`);
          console.log(`• Topics identified: ${result.analysis.topicsIdentified.join(', ')}`);
          console.log(`• Average score: ${result.analysis.averageScore}`);
          console.log(`• Page range: ${result.analysis.sources.pageRange.min} - ${result.analysis.sources.pageRange.max}`);
          console.log(`• Average text length: ${result.analysis.sources.averageTextLength} chars\n`);
          
          console.log('🎯 Generated Synthetic Queries:');
          console.log('===============================\n');
          
          console.log('📝 Broad Queries:');
          result.syntheticQueries.broad.forEach((query, i) => {
            console.log(`   ${i + 1}. ${query}`);
          });
          
          console.log('\n🎯 Specific Queries:');
          result.syntheticQueries.specific.forEach((query, i) => {
            console.log(`   ${i + 1}. ${query}`);
          });
          
          console.log('\n❓ Question-Based Queries:');
          result.syntheticQueries.questionBased.forEach((query, i) => {
            console.log(`   ${i + 1}. ${query}`);
          });
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    });
    
    console.log('\n✨ Test completed successfully!');
    mcpServer.kill();
    process.exit(0);
  }, 1000);

  // Handle server exit
  mcpServer.on('close', (code) => {
    if (code !== 0) {
      console.error(`MCP server exited with code ${code}`);
    }
  });
}

testRagChunkProcessing().catch(console.error);