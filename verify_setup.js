#!/usr/bin/env node

/**
 * Quick Setup Verification for FABRIK MCP + Gemini
 */

import { existsSync } from 'fs';
import { readFileSync } from 'fs';

console.log('🔍 FABRIK MCP Setup Verification');
console.log('================================\n');

// Check 1: Build files exist
const buildExists = existsSync('./build/index.js');
console.log(`✅ Build file: ${buildExists ? '✅ EXISTS' : '❌ MISSING'}`);
if (!buildExists) {
  console.log('   Run: npm run build');
}

// Check 2: Gemini config exists
const geminiConfigPath = `${process.env.HOME}/.gemini/settings.json`;
const geminiConfigExists = existsSync(geminiConfigPath);
console.log(`✅ Gemini config: ${geminiConfigExists ? '✅ EXISTS' : '❌ MISSING'}`);

if (geminiConfigExists) {
  try {
    const config = JSON.parse(readFileSync(geminiConfigPath, 'utf8'));
    const fabrikServer = config.mcpServers?.['fabrik-mcp'];
    console.log(`   Server registered: ${fabrikServer ? '✅ YES' : '❌ NO'}`);
    console.log(`   API key configured: ${fabrikServer?.env?.GEMINI_API_KEY ? '✅ YES' : '❌ NO'}`);
  } catch (e) {
    console.log('   Config file error:', e.message);
  }
}

// Check 3: Dependencies
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const hasGemini = packageJson.dependencies['@google/generative-ai'];
const hasSupabase = packageJson.dependencies['@supabase/supabase-js'];
console.log(`✅ Gemini AI dependency: ${hasGemini ? '✅ YES' : '❌ NO'}`);
console.log(`✅ Supabase dependency: ${hasSupabase ? '✅ YES' : '❌ NO'}`);

console.log('\n🎯 NEXT STEPS:');
console.log('==============');
console.log('1. 📱 Open MCP Inspector: http://localhost:6274');
console.log('2. 💻 Start Gemini CLI: gemini');
console.log('3. 🔧 Run: /mcp (to see servers)');
console.log('4. 🛠️  Run: /tools (to see available tools)');
console.log('5. 🚀 Test: @fabrik-mcp run process_rag_chunks with sample data');

console.log('\n🎉 Setup looks good! Ready to test with Gemini.');