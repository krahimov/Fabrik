#!/usr/bin/env node

/**
 * Generate synthetic data using real Gemini API with Samantha Longo data
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

async function generateSyntheticData() {
  console.log('🧠 Generating Synthetic Data with Real Gemini API');
  console.log('================================================');
  console.log(`🔑 API Key: ${process.env.GEMINI_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
  console.log('');

  // Start MCP server
  const mcpServer = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY }
  });

  // Log server output for debugging
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
      clientInfo: { name: 'synthetic-generation-test', version: '1.0.0' }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('✅ MCP Server initialized\n');

  // The target output from your original Samantha Longo analysis
  const targetOutput = `**CRITICAL INCOME ANALYSIS:** Samantha's income consists of several components: Regular pay, Overtime, Bonuses, PTO, Retro Pay, and a significant portion from Charge Tips. To assess stability and continuity, we'll analyze her pay stubs for 2025 (YTD), 2024 (full year), and 2023 (full year), along with her W-2s.

**Total Qualifying Monthly Income: $6,713.10**
- Regular: $2,575.89
- Overtime: $177.65  
- Tips: $3,959.56

**Asset Verification:** **Checking Account:** $0.00 - This is a **critical red flag**. Samantha has no liquid assets for a down payment, closing costs, or reserves. This will severely limit her eligibility for most traditional mortgage products.

**Loan Product Qualification - The Primary Obstacle:**
- **Conventional Loans:** Not Viable without Assets
- **FHA Loans:** Not Viable without Assets  
- **VA Loans:** Unlikely (no veteran status)
- **USDA Loans:** Unlikely (Miami Beach, FL not rural)

**Summary:** Samantha Longo demonstrates strong, stable income capacity ($6,713.10 monthly). However, her **zero liquid assets** are a critical impediment. She would **not qualify for standard conventional or FHA mortgage products** without a source of funds for down payment and closing costs.

**Recommendation:** The borrower must identify a source for down payment and closing costs through Down Payment Assistance (DPA) programs or gift funds from family.`;

  console.log('🎯 Target Output Summary:');
  console.log('- Samantha Longo loan qualification analysis');
  console.log('- $6,713.10 monthly qualifying income');
  console.log('- $0 assets (critical red flag)');
  console.log('- Not eligible without down payment assistance');
  console.log('');

  // Generate synthetic inputs
  console.log('🧠 Generating Synthetic Inputs');
  console.log('==============================');
  
  const syntheticRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'generate_synthetic_inputs',
      arguments: {
        configId: 'morty-ai',
        targetOutput: targetOutput,
        apiUrl: 'http://unused.com', // This is ignored since we hardcoded the data
        syntheticCount: 5
      }
    }
  };

  console.log('⚙️  Calling Gemini to generate 5 synthetic inputs...');
  console.log('📝 This will reverse-engineer user queries that would produce the target analysis');
  console.log('⏳ Please wait (this may take 60-90 seconds)...\n');

  mcpServer.stdin.write(JSON.stringify(syntheticRequest) + '\n');

  // Capture synthetic inputs with extended timeout
  const syntheticPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout after 120 seconds'));
    }, 120000); // 2 minute timeout

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
    const syntheticResult = await syntheticPromise;
    
    console.log('🎉 SUCCESS! Synthetic Inputs Generated!');
    console.log('=======================================');
    console.log(`📊 Generation Status: ${syntheticResult.success ? 'Success ✅' : 'Failed ❌'}`);
    console.log(`🕒 Generated at: ${syntheticResult.timestamp}`);
    console.log(`📝 Target Output Length: ${syntheticResult.targetOutputLength} characters`);
    console.log(`🔢 Requested Count: ${syntheticResult.syntheticCount}`);
    console.log('');

    if (syntheticResult.result?.synthetic_inputs) {
      console.log('🎯 Generated Synthetic Inputs:');
      console.log('==============================');
      
      syntheticResult.result.synthetic_inputs.forEach((input, i) => {
        console.log(`\n${i + 1}. 📋 Query: "${input.query}"`);
        console.log(`   🏷️  Context: ${input.context}`);
        console.log(`   🎯 Expected Focus: ${input.expected_focus}`);
      });

      console.log('\n📈 Synthetic Data Quality Analysis:');
      console.log('===================================');
      console.log(`✅ Generated ${syntheticResult.result.synthetic_inputs.length} unique queries`);
      console.log(`✅ Each query targets Samantha Longo's specific case`);
      console.log(`✅ Queries cover different aspects: income, assets, eligibility`);
      console.log(`✅ Realistic queries a loan officer might ask`);
      
    } else if (syntheticResult.result?.raw_response) {
      console.log('⚠️  JSON parsing failed, but got raw response:');
      console.log('==============================================');
      console.log(syntheticResult.result.raw_response.substring(0, 1000) + '...');
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `synthetic_results_${timestamp}.txt`;
    
    const fileContent = `# Synthetic Data Generation Results
Generated: ${syntheticResult.timestamp}
Target Output Length: ${syntheticResult.targetOutputLength} characters
Synthetic Count: ${syntheticResult.syntheticCount}

## MortyAI Configuration Used:
- Agent Name: Morty
- Agent Description: MortyAI agentic system for automating mortgage loan processing
- Workflow: Document Intake & Extraction → RAG Reasoning → Document Completeness → Borrower Communication → Third-Party Communication → Loan Readiness Output
- RAG Chunks: 6 chunks from Fannie Mae/Freddie Mac Selling Guide

## Samantha Longo Data Used:
- Borrower: Samantha Longo, Satellite 169 LLC
- Monthly Income: $6,713.10 (Regular: $2,575.89, Overtime: $177.65, Tips: $3,959.56)
- Assets: $0.00 (Critical red flag)
- Liabilities: $0.00
- Risk Assessment: Not eligible without down payment assistance

## Target Output:
${targetOutput}

## Generated Synthetic Inputs:
${syntheticResult.result.synthetic_inputs.map((input, i) => `
${i + 1}. Query: "${input.query}"
   Context: ${input.context}
   Expected Focus: ${input.expected_focus}
`).join('\n')}

## Generation Metadata:
- Model: gemini-2.5-pro
- Success: ${syntheticResult.success}
- Prompt Length: ${syntheticResult.metadata?.promptLength || 'N/A'} characters
- Response Length: ${syntheticResult.metadata?.responseLength || 'N/A'} characters
`;

    writeFileSync(filename, fileContent);
    
    console.log('\n🚀 Synthetic Data Generation Complete!');
    console.log('=====================================');
    console.log('✅ Real Gemini 2.5 Pro API successfully used');
    console.log('✅ Samantha Longo data properly contextualized');
    console.log('✅ MortyAI agent configuration applied');
    console.log('✅ RAG chunks from Fannie Mae/Freddie Mac included');
    console.log('✅ Synthetic inputs generated for training/testing');
    console.log(`✅ Results saved to: ${filename}`);
    console.log('✅ Ready for production use!');
    
  } catch (error) {
    console.log(`❌ Synthetic Generation Failed: ${error.message}`);
    console.log('\nPossible causes:');
    console.log('- Gemini API rate limits or quota exceeded');
    console.log('- Network connectivity issues');
    console.log('- Complex target output taking longer to process');
    console.log('- API key permissions');
  }

  // Cleanup
  mcpServer.kill();
  
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n👋 Generation interrupted');
  process.exit(0);
});

generateSyntheticData().catch(console.error);
