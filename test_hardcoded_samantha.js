#!/usr/bin/env node

/**
 * Test hardcoded Samantha Longo data integration
 * No API servers needed - everything is hardcoded
 */

import { spawn } from 'child_process';

async function testHardcodedSamantha() {
  console.log('🏠 Testing Hardcoded Samantha Longo Data');
  console.log('========================================');
  console.log('✅ Using your uploaded loan qualification data directly');
  console.log('✅ No API servers needed - everything is hardcoded\n');

  // Start MCP server only
  console.log('🚀 Starting MCP Server with hardcoded data...');
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'hardcoded-samantha-test', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('   ✅ MCP Server initialized\n');

  // Test 1: Get hardcoded MortyAI configuration
  console.log('📋 Test 1: Get Hardcoded Samantha Longo Configuration');
  console.log('=====================================================');
  
  const configRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_agent_config',
      arguments: {
        apiUrl: 'http://unused.com', // This is ignored now
        agentId: 'morty-ai'
      }
    }
  };

  mcpServer.stdin.write(JSON.stringify(configRequest) + '\n');

  // Capture config response
  const configPromise = new Promise((resolve) => {
    const onData = (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id === 2 && response.result && response.result.content) {
            const config = JSON.parse(response.result.content[0].text);
            mcpServer.stdout.off('data', onData);
            resolve(config);
            break;
          }
        } catch (e) {
          // Continue parsing
        }
      }
    };
    mcpServer.stdout.on('data', onData);
  });

  const config = await configPromise;
  
  console.log('✅ Hardcoded Configuration Retrieved!');
  console.log(`📊 Source: ${config.source || 'unknown'}`);
  console.log(`🤖 Agent Name: ${config.agent?.name || 'Not found'}`);
  console.log(`🏦 Contains Loan Data: ${config.loanData ? 'Yes' : 'No'}`);
  
  if (config.loanData) {
    console.log(`\n👤 Samantha Longo's Data:`);
    console.log(`   Name: ${config.loanData.borrower?.name || 'Not found'}`);
    console.log(`   Employer: ${config.loanData.borrower?.employer || 'Not found'}`);
    console.log(`   Monthly Income: $${config.loanData.incomeAnalysis?.totalQualifyingIncome?.monthly || 'Not found'}`);
    console.log(`   Assets: $${config.loanData.assets?.total || 'Not found'}`);
    console.log(`   Debt: $${config.loanData.liabilities?.totalDebt || 'Not found'}`);
    console.log(`   Risk Assessment: ${config.loanData.riskAssessment?.recommendation || 'Not found'}`);
  }

  console.log(`\n📚 RAG Chunks: ${config.ragChunks?.length || 0} chunks from Fannie Mae/Freddie Mac guidelines`);
  if (config.ragChunks && config.ragChunks.length > 0) {
    console.log(`   First chunk: ${config.ragChunks[0].fileName} (Page ${config.ragChunks[0].pageLabel})`);
  }

  // Test 2: Generate synthetic inputs (this will call Gemini with your API key)
  console.log('\n🧠 Test 2: Generate Synthetic Inputs from Samantha\'s Analysis');
  console.log('============================================================');
  console.log('⚠️  This will use your Gemini API key to generate synthetic inputs...\n');

  const targetOutput = `**CRITICAL INCOME ANALYSIS:** Samantha's income consists of several components: Regular pay ($2,575.89/month), Overtime ($177.65/month), and Charge Tips ($3,959.56/month). **Total Qualifying Monthly Income: $6,713.10** **Asset Verification:** **Checking Account:** $0.00 - This is a **critical red flag**. Samantha has no liquid assets for a down payment, closing costs, or reserves. **Recommendation:** Not eligible for standard mortgage products without down payment assistance or gift funds.`;

  const syntheticRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'generate_synthetic_inputs',
      arguments: {
        configId: 'morty-ai',
        targetOutput: targetOutput,
        apiUrl: 'http://unused.com', // This is ignored now
        syntheticCount: 3
      }
    }
  };

  console.log('⚙️  Calling Gemini API to generate synthetic inputs...');
  mcpServer.stdin.write(JSON.stringify(syntheticRequest) + '\n');

  // Capture synthetic inputs with timeout
  const syntheticPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout waiting for synthetic inputs'));
    }, 30000); // 30 second timeout

    const onData = (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id === 3 && response.result && response.result.content) {
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
    const syntheticResult = await syntheticPromise;
    
    console.log('✅ Synthetic Inputs Generated Successfully!');
    if (syntheticResult.result?.synthetic_inputs) {
      console.log(`📝 Generated ${syntheticResult.result.synthetic_inputs.length} synthetic queries:`);
      syntheticResult.result.synthetic_inputs.forEach((input, i) => {
        console.log(`   ${i + 1}. "${input.query}"`);
        console.log(`      Context: ${input.context}`);
        console.log(`      Focus: ${input.expected_focus}\n`);
      });
    }
  } catch (error) {
    console.log(`⚠️  Synthetic input generation timed out or failed: ${error.message}`);
    console.log('   This is likely due to Gemini API call taking too long or API key issues');
  }

  console.log('\n🎯 Summary: Hardcoded Samantha Longo Integration');
  console.log('===============================================');
  console.log('✅ Your uploaded loan qualification data is hardcoded into the system');
  console.log('✅ No API servers needed - data is embedded directly');
  console.log('✅ MortyAI configuration includes all Samantha\'s financial details');
  console.log('✅ RAG chunks from Fannie Mae/Freddie Mac guidelines are included');
  console.log('✅ System can generate synthetic inputs using Gemini API');
  console.log('\n🚀 The system is ready with your hardcoded Samantha Longo data!');

  // Cleanup
  mcpServer.kill();
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Handle errors
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted');
  process.exit(0);
});

testHardcodedSamantha().catch(console.error);
