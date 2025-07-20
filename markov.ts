import { RiMarkov } from "rita";

if (!process.env.INPUT_TXT) {
  console.error(
    "Please set the INPUT_TXT environment variable to the path of the text file."
  );
  process.exit(1);
}

const path = await Bun.file(process.env.INPUT_TXT as string).text();

export default function generateText(paragraphs: number = 1): string[] {
  const output: string[] = [];

  for (let i = 0; i < paragraphs; i++) {
    const markov = new RiMarkov(3);
    markov.addText(path);
    const sentences = markov.generate(10, {
      maxLength: 30,
      minLength: 10,
      temperature: 0.1,
    });
    const paragraph = sentences.join(" ").replace(/['"`]/g, "");
    output.push(paragraph);
  }
  return output
}

generateText();
