import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
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
        getConnInfo(c).remote.address || "unknown",
    })
  );
}
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/generate", (c) => {
  logger.info(getConnInfo(c).remote.address)
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
    logger.error({
      requestId: c.get("requestId"),
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json(
      {
        message: "Error generating text",
        ok: false,
      },
      500
    );
  }
});

export default app;