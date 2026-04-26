const { createServer } = require("node:http");
const next = require("next");

const port = Number(process.env.PORT || process.env.WEB_PORT || 3001);
const hostname = process.env.HOST || "0.0.0.0";
const app = next({
  dev: false,
  dir: "./apps/web",
  hostname,
  port
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((request, response) => {
    handle(request, response);
  }).listen(port, hostname, () => {
    console.log(`Opplexify web is running on http://${hostname}:${port}`);
  });
});
