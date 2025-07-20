import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON } from "hono/pretty-json";
import generateText from "./markov";
import { logger } from "./logger";


type AppEnv = {
  Variables: {
    requestId: string;
  }
}

const app = new Hono<AppEnv>();
app.use(prettyJSON());
app.use(secureHeaders());
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.info(
    {
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration,
    });
})

if (process.env.NODE_ENV === 'production') {
  app.use(
    rateLimiter({
      windowMs: 60 * 1000,
      limit: 10,
      keyGenerator: (c) =>
        c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
    })
  );
}
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/generate", (c) => {
  try {
    const paragraphs = parseInt(c.req.query("paragraphs") ?? "1") || 1;
    if (isNaN(paragraphs) || paragraphs > 10 || paragraphs < 1) {
      return c.json(
        { message: "Paragraphs must be between 1 and 10", ok: false },
        400
      );

    }
    const text = generateText(paragraphs);
    return c.json({
      message: text,
    });
  } catch (error) {
    return c.json(
      {
        message: "Error generating text",
        error: error instanceof Error ? error.message : "Unknown error",
        ok: false,
      },
      500
    );
  }
});

export default app;
