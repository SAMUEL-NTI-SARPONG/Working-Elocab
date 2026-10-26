const { test } = require("node:test");
const assert = require("node:assert/strict");

test("Vercel rate limits use the nearest forwarded client address", async (t) => {
  const mongoose = require("mongoose");
  const originalConnect = mongoose.connect;
  const originalVercel = process.env.VERCEL;
  const originalLimit = process.env.API_RATE_LIMIT_MAX;
  process.env.VERCEL = "1";
  process.env.API_RATE_LIMIT_MAX = "2";
  // Health requests do not need a database; avoid any external connection.
  mongoose.connect = () => new Promise(() => {});
  const app = require("../server");
  const server = app.listen(0, "127.0.0.1");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    mongoose.connect = originalConnect;
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    if (originalLimit === undefined) delete process.env.API_RATE_LIMIT_MAX;
    else process.env.API_RATE_LIMIT_MAX = originalLimit;
  });
  await new Promise((resolve) => server.once("listening", resolve));
  assert.equal(app.get("trust proxy"), 1);
  const url = `http://127.0.0.1:${server.address().port}/api/health`;
  const request = (address) =>
    fetch(url, { headers: { "X-Forwarded-For": address } });
  assert.equal((await request("198.51.100.10")).status, 200);
  assert.equal((await request("198.51.100.10")).status, 200);
  assert.equal((await request("203.0.113.1, 198.51.100.10")).status, 429);
  assert.equal((await request("198.51.100.11")).status, 200);
});
