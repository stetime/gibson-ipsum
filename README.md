# Gibson Ipsum

A simple web service for generating random text using a Markov chain algorithm. It was originally envisioned as a William Gibson-themed *lorem ipsum* generator, but it supports any text corpus you provide.

## Prerequisites

*   [Bun](https://bun.sh/docs/installation)
*   An input text file (e.g., `corpus.txt`)

## Setup

1.  **Install dependencies:**
    ```bash
    bun install
    ```

2.  **Configure the input text:**
    Create a `.env` file in the project root and add the following line, pointing to your text corpus:
    ```
    INPUT_TXT=./path/to/your/corpus.txt
    ```

## Running the Server

```bash
bun run index.ts
```

The server will start on `http://localhost:3000`.

## API

### `GET /generate`

Generates random text from the corpus.

**Query Parameters:**

*   `paragraphs` (optional): Number of paragraphs to generate (1-10). Defaults to `1`.

**Example:**

```bash
curl "http://localhost:3000/generate?paragraphs=3"
```