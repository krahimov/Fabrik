#!/usr/bin/env node

/**
 * Complete Gemini MCP Integration Test Guide
 * Tests FABRIK MCP server with multiple approaches
 */

console.log('🎯 FABRIK MCP Server - Gemini Integration Guide');
console.log('===============================================\n');

console.log('🔧 STEP 1: MCP Inspector Testing');
console.log('=================================');
console.log('✅ MCP Inspector should be running at: http://localhost:6274');
console.log('✅ Server command: node build/index.js');
console.log('✅ Expected tools visible:');
console.log('   • process_rag_chunks - Generate synthetic queries from RAG chunks');
console.log('   • get_agent_config - Fetch agent configurations from API');
console.log('   • gemini_with_config - Query Gemini with dynamic system prompts\n');

console.log('📋 Test in Inspector:');
console.log('1. Check if handshake/metadata loads');
console.log('2. Verify all 3 tools are visible');
console.log('3. Run process_rag_chunks with sample data');
console.log('4. Inspect request/response in the UI\n');

console.log('🌐 STEP 2: Gemini Configuration');
console.log('===============================');
console.log('✅ Configuration file created: ~/.gemini/settings.json');
console.log('✅ Server registered as: "fabrik-mcp"');
console.log('✅ Environment variables configured');

console.log('\n📄 Current Gemini Config:');
console.log('-------------------------');
console.log(JSON.stringify({
  "mcpServers": {
    "fabrik-mcp": {
      "command": "node",
      "args": ["/Users/karimrahimov/Desktop/mcp_boilerplate/build/index.js"],
      "env": {
        "GEMINI_API_KEY": "AIzaSyBN_5VxhnemUWLaz90G53ItXIWDOOSwBRQ",
        "SUPABASE_URL": "https://placeholder.supabase.co",
        "SUPABASE_ANON_KEY": "placeholder-key"
      }
    }
  }
}, null, 2));

console.log('\n🔧 STEP 3: Gemini CLI Testing');
console.log('=============================');
console.log('1. Start Gemini CLI:');
console.log('   gemini\n');

console.log('2. Check MCP servers:');
console.log('   /mcp\n');

console.log('3. List available tools:');
console.log('   /tools\n');

console.log('4. Test synthetic data generation:');
console.log('   @fabrik-mcp run the process_rag_chunks tool with some mortgage document chunks\n');

console.log('5. Test config-based Gemini queries:');
console.log('   @fabrik-mcp run the gemini_with_config tool with configId="mortgage-advisor-v2" and userQuery="What are loan requirements?"\n');

console.log('🎨 STEP 4: VS Code Gemini Code Assist');
console.log('====================================');
console.log('1. Reload VS Code window: Developer: Reload Window');
console.log('2. Open Command Palette: Cmd+Shift+P');
console.log('3. Search for "Gemini" commands');
console.log('4. In Agent mode, mention @fabrik-mcp in conversations\n');

console.log('📊 STEP 5: Sample Test Commands');
console.log('===============================');

const sampleCommands = [
  {
    tool: 'process_rag_chunks',
    description: 'Generate synthetic queries from mortgage document chunks',
    command: '@fabrik-mcp process RAG chunks about mortgage lending requirements and generate synthetic queries',
  },
  {
    tool: 'get_agent_config',
    description: 'Fetch agent configuration from API',
    command: '@fabrik-mcp get agent config for mortgage-advisor-v2 from the API',
  },
  {
    tool: 'gemini_with_config',
    description: 'Query with dynamic system prompt',
    command: '@fabrik-mcp query Gemini using config mortgage-advisor-v2 with the question "What are conventional loan requirements?"',
  }
];

sampleCommands.forEach((cmd, index) => {
  console.log(`${index + 1}. ${cmd.description}:`);
  console.log(`   "${cmd.command}"\n`);
});

console.log('🔍 TROUBLESHOOTING');
console.log('==================');
console.log('❌ Server not showing up?');
console.log('   • Check absolute paths in settings.json');
console.log('   • Reload VS Code window');
console.log('   • Re-run /mcp in Gemini CLI\n');

console.log('❌ Tools not appearing?');
console.log('   • Verify in MCP Inspector first');
console.log('   • Check server logs for errors');
console.log('   • Ensure build/index.js exists\n');

console.log('❌ Gemini calls failing?');
console.log('   • Verify GEMINI_API_KEY is valid');
console.log('   • Check network connectivity');
console.log('   • Try different model names\n');

console.log('✅ SUCCESS INDICATORS');
console.log('=====================');
console.log('✅ MCP Inspector shows all 3 tools');
console.log('✅ Gemini CLI displays "fabrik-mcp" in /mcp');
console.log('✅ /tools shows FABRIK tools alongside built-ins');
console.log('✅ @fabrik-mcp commands execute successfully');
console.log('✅ Synthetic data generation works end-to-end');
console.log('✅ Gemini integration responds with configured prompts\n');

console.log('🎉 Ready to test! Start with MCP Inspector, then move to Gemini CLI.');
console.log('📱 Access Inspector at: http://localhost:6274');
console.log('💡 Run: gemini (CLI) or use VS Code Gemini Code Assist');

// Also start our config API for complete testing
import { spawn } from 'child_process';

console.log('\n🌐 Starting Config API for Complete Testing...');
const configApi = spawn('node', ['enhanced_mock_api.js'], {
  stdio: ['inherit', 'inherit', 'inherit']
});

console.log('✅ Config API running on localhost:3003');
console.log('🎯 Now test the complete workflow in Gemini!\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  configApi.kill();
  process.exit(0);
});