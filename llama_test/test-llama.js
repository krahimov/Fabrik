import { LlamaCloudIndex } from "llama-cloud-services";
import { ContextChatEngine } from "@llamaindex/core";

const { LLAMA_CLOUD_API_KEY } = process.env;
if (!LLAMA_CLOUD_API_KEY) {
  console.error("Missing LLAMA_CLOUD_API_KEY env var");
  process.exit(1);
}

const index = new LlamaCloudIndex({
  name: "appalling-bass-2025-08-03",
  projectName: "Default",
  organizationId: "b78c2c50-166b-4a7d-81f8-e40e65c79214",
  apiKey: LLAMA_CLOUD_API_KEY,
});

const retriever = index.asRetriever({ similarityTopK: 5 });
const chatEngine = new ContextChatEngine({ retriever });

console.log("Testing retrieval…");
try {
  const nodes = await retriever.retrieve({ query: "rack connectivity test" });
  console.log(`Retrieved ${Array.isArray(nodes) ? nodes.length : 0} node(s)`);
  if (Array.isArray(nodes) && nodes.length) {
    const preview = JSON.stringify(nodes[0], null, 2).slice(0, 800);
    console.log("First node preview:\n", preview);
  }
  console.log("Chat test…");
  const response = await chatEngine.chat({ message: "Hello" });
  console.log("Chat response:", response?.message ?? String(response));
} catch (e) {
  console.error("Error: ", e?.message || e);
  process.exit(2);
}

