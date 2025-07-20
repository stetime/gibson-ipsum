import { RiMarkov } from "rita";
import { logger } from "./logger";

if (!process.env.INPUT_TXT) {
  logger.error(
    "Please set the INPUT_TXT environment variable to the path of the text file."
  );
  process.exit(1);
}

const corpus = Bun.file(process.env.INPUT_TXT as string)
if (!await corpus.exists()) {
  logger.error(`Input file not found: ${process.env.INPUT_TXT}`);
  process.exit(1);
}


const markov = new RiMarkov(3);
markov.addText(await corpus.text());

export default function generateText(paragraphs: number = 1): string[] {
  const output: string[] = [];
  for (let i = 0; i < paragraphs; i++) {
    const sentences = markov.generate(10, {
      maxLength: 30,
      minLength: 10,
      temperature: 0.1,
    });
    const paragraph = sentences.join(" ").replace(/['"`]/g, "");
    output.push(paragraph);
  }
  return output;
}

generateText();
