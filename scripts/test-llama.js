import { LlamaCloudIndex } from "llama-cloud-services";
import { ContextChatEngine } from "@llamaindex/core";

const { LLAMA_CLOUD_API_KEY } = process.env;
if (!LLAMA_CLOUD_API_KEY) {
  console.error(
    "Error: LLAMA_CLOUD_API_KEY is not set. Please export it and rerun."
  );
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
console.log("Constructed ContextChatEngine. Testing retrieval from rack …");

try {
  const nodes = await retriever.retrieve({ query: "rack connectivity test" });
  const count = Array.isArray(nodes) ? nodes.length : 0;
  console.log(`Retriever returned ${count} node(s).`);
  if (count > 0) {
    const first = nodes[0];
    try {
      const preview = JSON.stringify(first, null, 2).slice(0, 800);
      console.log("First node preview:\n", preview);
    } catch {
      console.log("First node: ", first);
    }
  }
  console.log("Done.");
} catch (error) {
  const message = error && typeof error === "object" && "message" in error
    ? error.message
    : String(error);
  console.error("Retrieval error:", message);
  process.exitCode = 2;
}

