#!/usr/bin/env node

/**
 * Direct Gemini 2.5 Pro API Test
 * Test the API directly to verify it's working
 */

import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/genai';

async function testGeminiDirect() {
  console.log('🧪 Direct Gemini 2.5 Pro API Test');
  console.log('=================================\n');

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBN_5VxhnemUWLaz90G53ItXIWDOOSwBRQ';
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    };

    const model = 'gemini-2.5-pro';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 'Hello! Can you confirm you are Gemini 2.5 Pro and briefly explain what you can do?',
          },
        ],
      },
    ];

    console.log('🚀 Calling Gemini 2.5 Pro...');
    console.log(`📝 Model: ${model}`);
    console.log(`💬 Query: ${contents[0].parts[0].text}\n`);

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    console.log('✅ Response from Gemini 2.5 Pro:');
    console.log('================================');
    
    let fullResponse = '';
    for await (const chunk of response) {
      if (chunk.text) {
        process.stdout.write(chunk.text);
        fullResponse += chunk.text;
      }
    }

    console.log('\n\n🎉 SUCCESS! Gemini 2.5 Pro is working!');
    console.log(`📊 Response length: ${fullResponse.length} characters`);
    
  } catch (error) {
    console.error('❌ Error calling Gemini 2.5 Pro:');
    console.error(error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Possible solutions:');
      console.log('   • Check if API key is correct');
      console.log('   • Verify API key has Gemini access');
      console.log('   • Check if billing is enabled');
    }
    
    if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Possible solutions:');
      console.log('   • Enable Gemini API in Google Cloud Console');
      console.log('   • Check API permissions');
    }
    
    if (error.message.includes('model')) {
      console.log('\n💡 Trying fallback model: gemini-1.5-pro');
      
      try {
        const fallbackResponse = await ai.models.generateContentStream({
          model: 'gemini-1.5-pro',
          config,
          contents,
        });
        
        console.log('✅ Fallback model working:');
        for await (const chunk of fallbackResponse) {
          if (chunk.text) {
            process.stdout.write(chunk.text);
          }
        }
        console.log('\n\n🎯 Use gemini-1.5-pro in your MCP server instead');
        
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError.message);
      }
    }
  }
}

testGeminiDirect().catch(console.error);