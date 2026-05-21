import { InferenceClient } from "@huggingface/inference";

const MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const BATCH_SIZE = 32;

export const EMBEDDING_DIM = 384;

let client: InferenceClient | null = null;

function getClient(): InferenceClient {
  if (client) return client;
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set");
  }
  client = new InferenceClient(apiKey);
  return client;
}

export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const c = getClient();
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const output = await c.featureExtraction({
      model: MODEL,
      inputs: batch,
    });
    results.push(...normalizeOutput(output, batch.length));
  }
  return results;
}

// The SDK return type is `(number | number[] | number[][])[]` — too permissive
// for our use. For sentence-transformers + string-array input we always get
// number[][]. Single-input requests can occasionally collapse to a flat
// number[], so we handle that edge case explicitly.
function normalizeOutput(
  output: (number | number[] | number[][])[],
  expectedCount: number,
): number[][] {
  if (
    expectedCount === 1 &&
    output.length > 0 &&
    typeof output[0] === "number"
  ) {
    return [output as unknown as number[]];
  }
  return output as number[][];
}
