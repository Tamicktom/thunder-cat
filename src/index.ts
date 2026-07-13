//* Local imports
import { createApp } from "./app";
import { openDatabase } from "./db/client";

const PORT = Number(process.env.PORT ?? 3927);
const HOST = process.env.HOST ?? "127.0.0.1";

const db = openDatabase();
const app = createApp({ db }).listen({
  hostname: HOST,
  port: PORT,
});

console.log(
  `Thunder-Cat is running at http://${app.server?.hostname}:${app.server?.port}`,
);
