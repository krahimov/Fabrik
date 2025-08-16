#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';

// Schema for RAG chunk processing
const RagChunkSchema = z.object({
  score: z.number(),
  textLength: z.number(),
  fileName: z.string(),
  pageLabel: z.number(),
  textPreview: z.string(),
  fullText: z.string().optional(),
});

const ProcessRagChunksSchema = z.object({
  chunks: z.array(RagChunkSchema),
  context: z.string().optional().default(""),
});

const GetConfigSchema = z.object({
  apiUrl: z.string().url(),
  agentId: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

const GeminiWithConfigSchema = z.object({
  configId: z.string(),
  userQuery: z.string(),
  apiUrl: z.string().url().optional().default("https://api.placeholder.com/config"),
  ragChunks: z.array(RagChunkSchema).optional(),
});

class McpServer {
  private server: Server;
  private supabase: any;
  private genAI: GoogleGenAI;

  constructor() {
    this.server = new Server(
      {
        name: "fabrik-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Supabase (using environment variables)
    const supabaseUrl = process.env['SUPABASE_URL'] || 'https://placeholder.supabase.co';
    const supabaseKey = process.env['SUPABASE_ANON_KEY'] || 'placeholder-key';
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Gemini AI (using environment variable)
    const geminiApiKey = process.env['GEMINI_API_KEY'] || 'placeholder-key';
    this.genAI = new GoogleGenAI({
      apiKey: geminiApiKey,
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "echo",
            description: "Echo back the input text",
            inputSchema: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                  description: "Text to echo back",
                },
              },
              required: ["text"],
            },
          },
          {
            name: "add",
            description: "Add two numbers together",
            inputSchema: {
              type: "object",
              properties: {
                a: {
                  type: "number",
                  description: "First number",
                },
                b: {
                  type: "number",
                  description: "Second number",
                },
              },
              required: ["a", "b"],
            },
          },
          {
            name: "process_rag_chunks",
            description: "Process RAG chunks and generate synthetic queries that could have retrieved them",
            inputSchema: {
              type: "object",
              properties: {
                chunks: {
                  type: "array",
                  description: "Array of RAG chunk sources",
                  items: {
                    type: "object",
                    properties: {
                      score: { type: "number", description: "Relevance score" },
                      textLength: { type: "number", description: "Length of text content" },
                      fileName: { type: "string", description: "Source file name" },
                      pageLabel: { type: "number", description: "Page number" },
                      textPreview: { type: "string", description: "Preview of chunk content" },
                      fullText: { type: "string", description: "Full text content (optional)" }
                    },
                    required: ["score", "textLength", "fileName", "pageLabel", "textPreview"]
                  }
                },
                context: {
                  type: "string",
                  description: "Additional context about the query domain (optional)",
                  default: ""
                }
              },
              required: ["chunks"],
            },
          },
          {
            name: "get_agent_config",
            description: "Fetch agent configuration from API including workflow steps and synthetic data requirements",
            inputSchema: {
              type: "object",
              properties: {
                apiUrl: {
                  type: "string",
                  format: "uri",
                  description: "API endpoint URL to fetch configuration from"
                },
                agentId: {
                  type: "string", 
                  description: "Optional agent ID to specify which agent config to fetch"
                },
                headers: {
                  type: "object",
                  description: "Optional HTTP headers for the API request",
                  additionalProperties: { type: "string" }
                }
              },
              required: ["apiUrl"],
            },
          },
          {
            name: "gemini_with_config",
            description: "Query Gemini 2.5 Pro with dynamically fetched configuration as system prompt",
            inputSchema: {
              type: "object",
              properties: {
                configId: {
                  type: "string",
                  description: "Configuration ID to fetch from API"
                },
                userQuery: {
                  type: "string",
                  description: "User query to send to Gemini"
                },
                apiUrl: {
                  type: "string",
                  format: "uri",
                  description: "API endpoint to fetch config (defaults to placeholder)",
                  default: "https://api.placeholder.com/config"
                },
                ragChunks: {
                  type: "array",
                  description: "Optional RAG chunks to include in context",
                  items: {
                    type: "object",
                    properties: {
                      score: { type: "number" },
                      textLength: { type: "number" },
                      fileName: { type: "string" },
                      pageLabel: { type: "number" },
                      textPreview: { type: "string" }
                    }
                  }
                }
              },
              required: ["configId", "userQuery"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "echo": {
            const parsed = z.object({ text: z.string() }).parse(args);
            return {
              content: [
                {
                  type: "text",
                  text: `Echo: ${parsed.text}`,
                },
              ],
            };
          }

          case "add": {
            const parsed = z.object({ 
              a: z.number(), 
              b: z.number() 
            }).parse(args);
            const result = parsed.a + parsed.b;
            return {
              content: [
                {
                  type: "text",
                  text: `${parsed.a} + ${parsed.b} = ${result}`,
                },
              ],
            };
          }

          case "process_rag_chunks": {
            const parsed = ProcessRagChunksSchema.parse(args);
            const syntheticQueries = this.generateSyntheticQueries(parsed.chunks, parsed.context);
            
            const result = {
              input: {
                chunks: parsed.chunks,
                context: parsed.context,
                metadata: {
                  chunksProcessed: parsed.chunks.length,
                  timestamp: new Date().toISOString(),
                }
              },
              output: {
                analysis: {
                  topicsIdentified: this.extractTopics(parsed.chunks),
                  averageScore: this.calculateAverageScore(parsed.chunks),
                  sources: this.analyzeSources(parsed.chunks),
                },
                syntheticQueries: syntheticQueries,
              }
            };
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case "get_agent_config": {
            const parsed = GetConfigSchema.parse(args);
            const config = await this.fetchAgentConfig(parsed.apiUrl, parsed.agentId, parsed.headers);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(config, null, 2),
                },
              ],
            };
          }

          case "gemini_with_config": {
            const parsed = GeminiWithConfigSchema.parse(args);
            const result = await this.queryGeminiWithConfig(parsed.configId, parsed.userQuery, parsed.apiUrl, parsed.ragChunks);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
          );
        }
        throw error;
      }
    });
  }

  private extractTopics(chunks: z.infer<typeof RagChunkSchema>[]): string[] {
    const topics = new Set<string>();
    
    chunks.forEach(chunk => {
      const text = chunk.textPreview.toLowerCase();
      
      // Extract key terms and topics from text preview
      const headings = text.match(/#\s*([^#\n]+)/g) || [];
      headings.forEach(heading => {
        const cleanHeading = heading.replace(/#\s*/, '').trim();
        if (cleanHeading.length > 3) {
          topics.add(cleanHeading);
        }
      });
      
      // Extract potential key phrases (capitalize words that appear in context)
      const keyPhrases = [
        'borrower', 'loan', 'mortgage', 'income', 'eligibility', 'requirements',
        'rental', 'property', 'financing', 'homeready', 'qualifying', 'ltv',
        'cltv', 'hcltv', 'subordinate', 'buydown', 'appraisal', 'credit'
      ];
      
      keyPhrases.forEach(phrase => {
        if (text.includes(phrase)) {
          topics.add(phrase);
        }
      });
    });
    
    return Array.from(topics).slice(0, 10); // Return top 10 topics
  }

  private calculateAverageScore(chunks: z.infer<typeof RagChunkSchema>[]): number {
    const sum = chunks.reduce((acc, chunk) => acc + chunk.score, 0);
    return Math.round((sum / chunks.length) * 1000) / 1000; // Round to 3 decimal places
  }

  private analyzeSources(chunks: z.infer<typeof RagChunkSchema>[]): {
    uniqueFiles: string[];
    pageRange: { min: number; max: number };
    averageTextLength: number;
  } {
    const uniqueFiles = [...new Set(chunks.map(chunk => chunk.fileName))];
    const pages = chunks.map(chunk => chunk.pageLabel);
    const textLengths = chunks.map(chunk => chunk.textLength);
    
    return {
      uniqueFiles,
      pageRange: { min: Math.min(...pages), max: Math.max(...pages) },
      averageTextLength: Math.round(textLengths.reduce((a, b) => a + b, 0) / textLengths.length),
    };
  }

  private generateSyntheticQueries(chunks: z.infer<typeof RagChunkSchema>[], context: string): {
    broad: string[];
    specific: string[];
    questionBased: string[];
  } {
    const topics = this.extractTopics(chunks);
    
    // Generate broad queries based on topics
    const broadQueries = [
      `What are the requirements for ${topics.slice(0, 2).join(' and ')}?`,
      `How do ${topics.slice(0, 3).join(', ')} work together?`,
      `Guidelines for ${topics[0] || 'lending'} in mortgage lending`,
      `${topics[0] || 'Eligibility'} eligibility criteria`,
    ];

    // Add context-based queries if context is provided
    if (context) {
      broadQueries.push(`${context} requirements and guidelines`);
    }

    // Generate specific queries based on content
    const specificQueries: string[] = [];
    
    chunks.forEach(chunk => {
      const preview = chunk.textPreview;
      
      // Extract specific concepts from previews
      if (preview.includes('Monthly Qualifying Rental Income')) {
        specificQueries.push('How to calculate monthly qualifying rental income?');
      }
      if (preview.includes('Borrower Eligibility Requirements')) {
        specificQueries.push('What are the general borrower eligibility requirements?');
      }
      if (preview.includes('HomeReady Transactions')) {
        specificQueries.push('What are HomeReady transaction requirements for high LTV ratios?');
      }
      if (preview.includes('first-time homebuyer')) {
        specificQueries.push('What are the first-time homebuyer criteria?');
      }
      if (preview.includes('subordinate financing')) {
        specificQueries.push('Rules for subordinate financing in mortgages');
      }
      if (preview.includes('credit report')) {
        specificQueries.push('Credit report requirements for loan applications');
      }
    });

    // Generate question-based queries
    const questionBased = [
      `What information is needed for ${topics[0]}?`,
      `How are ${topics[1]} calculated or determined?`,
      `What are the limits for ${topics[2] || topics[0]}?`,
      `When do ${topics[0]} requirements apply?`,
      `Who qualifies for ${topics[1] || topics[0]} programs?`,
    ];

    return {
      broad: broadQueries.slice(0, 4),
      specific: [...new Set(specificQueries)].slice(0, 6),
      questionBased: questionBased.slice(0, 5),
    };
  }

  private async queryGeminiWithConfig(configId: string, userQuery: string, apiUrl: string, ragChunks?: z.infer<typeof RagChunkSchema>[]): Promise<any> {
    try {
      // Step 1: Fetch configuration from API
      console.error(`[FABRIK] Fetching config for ID: ${configId}`);
      const configResponse = await this.fetchConfigById(configId, apiUrl);
      
      // Step 2: Build system prompt from configuration
      const systemPrompt = this.buildSystemPromptFromConfig(configResponse, ragChunks);
      
      // Step 3: Query Gemini 2.5 Pro with dynamic system prompt
      console.error(`[FABRIK] Querying Gemini 2.5 Pro with config-based system prompt`);
      
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
              text: `${systemPrompt}\n\nUser Query: ${userQuery}`,
            },
          ],
        },
      ];

      console.error(`[FABRIK] Sending request to Gemini API...`);
      let generatedText = '';
      
      try {
        // Try streaming first
        const response = await this.genAI.models.generateContentStream({
          model,
          config,
          contents,
        });
        
        console.error(`[FABRIK] Processing Gemini response stream...`);
        for await (const chunk of response) {
          if (chunk.text) {
            generatedText += chunk.text;
            console.error(`[FABRIK] Received chunk: ${chunk.text.substring(0, 50)}...`);
          }
        }
        console.error(`[FABRIK] Gemini response complete. Length: ${generatedText.length}`);
        
      } catch (streamError) {
        console.error(`[FABRIK] Stream failed, trying non-streaming:`, streamError instanceof Error ? streamError.message : String(streamError));
        
        // Fallback to non-streaming
        try {
          const response = await this.genAI.models.generateContent({
            model,
            config,
            contents,
          });
          
          if (response.text) {
            generatedText = response.text;
            console.error(`[FABRIK] Non-streaming response complete. Length: ${generatedText.length}`);
          } else {
            throw new Error('No text in response');
          }
        } catch (nonStreamError) {
          console.error(`[FABRIK] Non-streaming also failed:`, nonStreamError);
          throw nonStreamError;
        }
      }
      
      // Step 4: Store interaction in Supabase (optional)
      await this.storeInteraction(configId, userQuery, generatedText, configResponse);
      
      return {
        configId: configId,
        userQuery: userQuery,
        configuration: configResponse,
        systemPrompt: systemPrompt,
        geminiResponse: generatedText,
        metadata: {
          timestamp: new Date().toISOString(),
          model: "gemini-2.5-pro",
          ragChunksIncluded: ragChunks ? ragChunks.length : 0,
          promptLength: systemPrompt.length
        }
      };
      
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to query Gemini with config: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async fetchConfigById(configId: string, apiUrl: string): Promise<any> {
    try {
      const url = `${apiUrl}/${configId}`;
      console.error(`[FABRIK] Fetching config from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-MCP-Client': 'FABRIK-v1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Config API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildSystemPromptFromConfig(config: any, ragChunks?: z.infer<typeof RagChunkSchema>[]): string {
    const systemPrompt = `# FABRIK AI Agent Configuration

## Agent Identity
Name: ${config.agent?.name || config.agentName || 'AI Assistant'}
Description: ${config.agent?.description || config.description || 'AI assistant for specialized tasks'}

## Workflow Instructions
${config.workflow?.description || config.workflowDescription || 'Standard AI assistant workflow'}

### Specific Steps:
${config.workflow?.steps ? 
  config.workflow.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') : 
  '1. Understand user query\n2. Provide helpful response'
}

## Output Format Requirements
- Format: ${config.output?.expectedFormat || config.expectedFormat || 'natural language'}
- Style: ${config.output?.naturalLanguageFormat || config.naturalLanguageOutput || 'professional and helpful'}
- Records: Generate up to ${config.output?.syntheticRecordsCount || config.numberOfSyntheticRecords || 10} relevant items when applicable

${ragChunks && ragChunks.length > 0 ? `

## Contextual Information (RAG Chunks)
The following documents are relevant to this conversation:

${ragChunks.map((chunk, i) => `
### Document ${i + 1}: ${chunk.fileName} (Page ${chunk.pageLabel})
Relevance Score: ${chunk.score}
Content: ${chunk.textPreview}
`).join('\n')}

Use this contextual information to provide accurate, source-backed responses.` : ''}

## Behavioral Guidelines
- Always follow the agent identity and workflow described above
- Maintain the specified output format and style
- Reference provided contextual information when relevant
- Be accurate, helpful, and professional in all responses

---

You are now configured and ready to assist. Please respond to the following user query according to these specifications.
`;

    return systemPrompt;
  }

  private async storeInteraction(configId: string, userQuery: string, response: string, config: any): Promise<void> {
    try {
      // Store in Supabase for analytics and monitoring
      const { error } = await this.supabase
        .from('fabrik_interactions')
        .insert({
          config_id: configId,
          user_query: userQuery,
          ai_response: response,
          config_used: config,
          timestamp: new Date().toISOString(),
          model: 'gemini-2.5-pro'
        });
      
      if (error) {
        console.error('[FABRIK] Failed to store interaction in Supabase:', error);
      } else {
        console.error('[FABRIK] Interaction stored successfully in Supabase');
      }
    } catch (error) {
      console.error('[FABRIK] Supabase storage error:', error);
      // Don't throw - storage failure shouldn't break the main functionality
    }
  }

  private async fetchAgentConfig(apiUrl: string, agentId?: string, headers?: Record<string, string>): Promise<any> {
    try {
      // Build URL with agentId if provided
      const url = new URL(apiUrl);
      if (agentId) {
        url.searchParams.set('agentId', agentId);
      }

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MCP-RAG-Processor/1.0',
          ...(headers || {})
        }
      };

      // Make the API request
      const response = await fetch(url.toString(), fetchOptions);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate and structure the response
      const config = {
        timestamp: new Date().toISOString(),
        apiUrl: url.toString(),
        agentId: agentId || null,
        data: data,
        // Expected structure based on your requirements:
        agent: {
          name: data.agent?.name || data.agentName || 'Unknown Agent',
          description: data.agent?.description || data.description || '',
        },
        workflow: {
          steps: data.workflow?.steps || data.workflowSteps || [],
          description: data.workflow?.description || data.workflowDescription || '',
        },
        output: {
          naturalLanguageFormat: data.output?.naturalLanguageFormat || data.naturalLanguageOutput || '',
          expectedFormat: data.output?.expectedFormat || data.expectedFormat || 'json',
          syntheticRecordsCount: data.output?.syntheticRecordsCount || data.numberOfSyntheticRecords || 10,
        },
        ragChunks: data.ragChunks || data.chunks || [],
        rawResponse: data
      };

      return config;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch agent configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP server running on stdio");
  }
}

const server = new McpServer();
server.run().catch(console.error);