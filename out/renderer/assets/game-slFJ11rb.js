import { S as SwfPlayer, t as touch, g as gamepad } from "./gamepad-KZe0SX2z.js";
const swf = new URLSearchParams(location.search).get("swf");
document.title = swf.replace(/^.*\//, "").replace(/\.swf$/, "");
const player = new SwfPlayer(document.body);
async function start() {
  await window.__qqpetReady;
  await player.load(`pet/game/${swf}`, void 0, { letterbox: "on" });
  player.el.focus();
  if (touch) gamepad(player.el, swf);
}
void start().catch((error) => console.error("Game startup failed:", error));
