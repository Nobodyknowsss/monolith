import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 100,
});

export async function chunkText(text: string): Promise<string[]> {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return splitter.splitText(cleaned);
}
