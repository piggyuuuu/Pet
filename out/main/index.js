import { app, dialog, protocol, net, ipcMain, BrowserWindow, Tray, Menu, screen, nativeImage, session, clipboard, shell as shell$1, powerMonitor } from "electron";
import { existsSync, lstatSync, openSync, writeSync, closeSync, rmSync, readdirSync, mkdirSync, writeFileSync, renameSync, readFileSync, fstatSync, readSync, copyFileSync } from "node:fs";
import { tmpdir, networkInterfaces } from "node:os";
import { join, dirname, normalize, isAbsolute, sep } from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { crc32 } from "node:zlib";
import { pathToFileURL } from "node:url";
import { spawn, execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { createInterface } from "node:readline";
import { createSocket } from "node:dgram";
import { createServer, connect } from "node:net";
import { createServer as createServer$1 } from "node:http";
import { createRequire } from "node:module";
const IPC = {
  load: "pet:load",
  save: "pet:save",
  resetPet: "pet:reset",
  exportSave: "pet:export",
  importSave: "pet:import",
  openGame: "game:open",
  calendar: "app:calendar",
  gamePlayed: "game:played",
  aiModels: "ai:models",
  aiChat: "ai:chat",
  webSearch: "web:search",
  weather: "app:weather",
  latestRelease: "app:latest-release",
  packInfo: "pack:info",
  importPack: "pack:import",
  resetPacks: "pack:reset",
  findPack: "pack:find",
  downloadPack: "pack:download",
  findFullPack: "pack:find-full",
  packProgress: "pack:progress",
  relaunch: "app:relaunch",
  quit: "app:quit",
  copyText: "app:copy-text",
  openUrl: "app:open-url",
  clipboard: "clipboard:text",
  presence: "app:presence",
  front: "app:front",
  setClickThrough: "win:set-click-through",
  setHitShape: "win:set-hit-shape",
  setAlwaysOnTop: "win:set-always-on-top",
  setFocusable: "win:set-focusable",
  setAutoStart: "app:set-auto-start",
  setTrayState: "tray:set-state",
  cursor: "win:cursor",
  setDragging: "win:set-dragging",
  trayClick: "tray:click",
  trayHoverLeave: "tray:hover-leave",
  trayMenu: "tray:menu",
  trayMenuAction: "tray:menu-action",
  lanOnline: "lan:online",
  lanOffline: "lan:offline",
  lanMessage: "lan:message",
  webhook: "webhook:message",
  webhookState: "webhook:state",
  lanSend: "lan:send",
  lanPeers: "lan:peers",
  memLoad: "mem:load",
  memFacts: "mem:facts",
  memHistory: "mem:history",
  memClear: "mem:clear",
  memRewrite: "mem:rewrite",
  memDialogueLoad: "mem:dialogue-load",
  memDialogueSave: "mem:dialogue-save",
  voiceStart: "voice:start",
  voiceStop: "voice:stop",
  voiceText: "voice:text",
  voiceError: "voice:error",
  voiceAudio: "voice:audio",
  voicePart: "voice:part",
  voicePartial: "voice:partial"
};
async function withTimeoutSignal(milliseconds, run2) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  try {
    return await run2(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
async function call(fetch, c, path, body) {
  return withTimeoutSignal(6e4, async (signal) => {
    const r = await fetch(c.url.replace(/\/+$/, "") + path, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...c.key && { Authorization: `Bearer ${c.key}` } },
      body: body && JSON.stringify(body),
      signal
    });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
    return await r.json();
  });
}
async function aiModels(fetch, c) {
  return (await call(fetch, c, "/models")).data.map((m) => m.id);
}
async function aiChat(fetch, c, messages) {
  const body = { model: c.model, messages, max_tokens: 300, chat_template_kwargs: { enable_thinking: false } };
  if (/deepseek/i.test(c.url)) body.thinking = { type: "disabled" };
  if (/ollama|:11434/i.test(c.url)) body.reasoning_effort = "none";
  const r = await call(fetch, c, "/chat/completions", body);
  return r.choices[0].message.content.replace(/^[\s\S]*<\/think>/, "").trim();
}
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const stripTags = (s) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ").trim();
function decodeDdgHref(href) {
  try {
    const target = new URL(href, "https://duckduckgo.com").searchParams.get("uddg");
    if (target) return decodeURIComponent(target);
  } catch {
  }
  return href;
}
function decodeBingHref(href) {
  try {
    const u = new URL(href);
    const target = u.searchParams.get("u");
    if (target && u.pathname.includes("/ck/") && typeof atob === "function") {
      const decoded = atob(target);
      if (decoded.startsWith("http")) return decoded;
    }
  } catch {
  }
  return href;
}
async function ddgSearch(fetch, query, max) {
  const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": UA }
  });
  if (!r.ok) return [];
  const html = await r.text();
  const links = [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const snippets = [...html.matchAll(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g)];
  const out = [];
  for (let i = 0; i < links.length && out.length < max; i++) {
    const [, href, title] = links[i];
    const t = stripTags(title);
    if (!t || !href) continue;
    out.push({ title: t, url: decodeDdgHref(href), description: stripTags(snippets[i]?.[1] ?? "") });
  }
  return out;
}
async function bingSearch(fetch, query, max) {
  const r = await fetch(`https://cn.bing.com/search?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": UA }
  });
  if (!r.ok) return [];
  const html = await r.text();
  const out = [];
  for (const seg of html.split("<h2").slice(1)) {
    const a = seg.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!a) continue;
    const title = stripTags(a[2]);
    if (!title) continue;
    const p = seg.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    out.push({ title, url: decodeBingHref(a[1]), description: stripTags(p?.[1] ?? "") });
    if (out.length >= max) break;
  }
  return out;
}
async function tavilySearch(fetch, query, key, max) {
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: key, query, max_results: max, search_depth: "basic" })
  });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results ?? []).map((x) => ({ title: x.title ?? "", url: x.url ?? "", description: x.content ?? "" }));
}
async function braveSearch(fetch, query, key, max) {
  const r = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${max}`, {
    headers: { "X-Subscription-Token": key, Accept: "application/json" }
  });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.web?.results ?? []).map((x) => ({ title: x.title ?? "", url: x.url ?? "", description: x.description ?? "" }));
}
async function webSearch(fetch, query, max = 6, backend = "auto", key = "") {
  if (backend === "tavily" && key) {
    try {
      return await tavilySearch(fetch, query, key, max);
    } catch {
    }
  }
  if (backend === "brave" && key) {
    try {
      return await braveSearch(fetch, query, key, max);
    } catch {
    }
  }
  try {
    const ddg = await ddgSearch(fetch, query, max);
    if (ddg.length) return ddg;
  } catch {
  }
  try {
    return await bingSearch(fetch, query, max);
  } catch {
    return [];
  }
}
const API$2 = "https://api.ankio.net/day?ymd=";
const DAYS = 31;
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
async function fetchDay(fetch, date) {
  return withTimeoutSignal(1e4, async (signal) => {
    const { data: d } = await (await fetch(API$2 + date, { signal })).json();
    const h = Array.isArray(d.holidays) ? null : d.holidays;
    return { date, lunar: `${d.lunar_month_chinese}${d.lunar_day_chinese}`, term: d.term, holiday: h && { name: h.name, off: h.isOffDay } };
  });
}
let cache = null;
function calendar(fetch) {
  const now2 = /* @__PURE__ */ new Date();
  const date = ymd(now2);
  if (cache?.date !== date) {
    const days = Array.from({ length: DAYS }, (_, i) => fetchDay(fetch, ymd(new Date(now2.getFullYear(), now2.getMonth(), now2.getDate() + i))));
    cache = {
      date,
      days: Promise.all(days).catch(() => {
        cache = null;
        return [];
      })
    };
  }
  return cache.days;
}
const API$1 = "https://api.github.com/repos/piggyuuuu/Pet/releases/latest";
async function latestRelease(fetch) {
  return withTimeoutSignal(2e4, async (signal) => {
    const r = await fetch(API$1, { signal });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 100)}`);
    const d = await r.json();
    return { version: d.tag_name.replace(/^v/, ""), url: d.html_url };
  });
}
function toShape(rects, zoom, width, height) {
  const out = [];
  for (const r of rects) {
    const x = Math.max(Math.floor(r.x * zoom), 0);
    const y = Math.max(Math.floor(r.y * zoom), 0);
    const right = Math.min(Math.ceil((r.x + r.width) * zoom), width);
    const bottom = Math.min(Math.ceil((r.y + r.height) * zoom), height);
    if (right > x && bottom > y) out.push({ x, y, width: right - x, height: bottom - y });
  }
  return out.length ? out : [{ x: 0, y: 0, width: 0, height: 0 }];
}
const API = "https://api.ankio.net/weather?city=";
async function weather(fetch, city) {
  return withTimeoutSignal(2e4, async (signal) => {
    const r = await fetch(API + encodeURIComponent(city), { signal });
    if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 100)}`);
    const {
      current_condition: [now2],
      weather: [today, tomorrow]
    } = await r.json();
    const hour = (/* @__PURE__ */ new Date()).getHours();
    return {
      code: +now2.weatherCode,
      max: +today.maxtempC,
      min: +today.mintempC,
      tomorrowMax: +tomorrow.maxtempC,
      hours: today.hourly.map((h) => ({ hour: +h.time / 100, code: +h.weatherCode, wind: +h.windspeedKmph })).filter((h) => h.hour + 3 > hour)
    };
  });
}
const APP_VERSION = "0.1.0";
const MANIFEST = "manifest.json";
const VERSION = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const ID = /^[a-z0-9][a-z0-9-]{0,31}$/;
const SHA = /^[0-9a-f]{64}$/;
function compareVersion(a, b) {
  const pa = a.split(/[+-]/)[0].split(".").map(Number);
  const pb = b.split(/[+-]/)[0].split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  const sa = a.match(/-([^+]+)/)?.[1];
  const sb = b.match(/-([^+]+)/)?.[1];
  if (sa === void 0 || sb === void 0) return 0;
  const qa = sa.split(".");
  const qb = sb.split(".");
  for (let i = 0; i < Math.max(qa.length, qb.length); i++) {
    const x = qa[i];
    const y = qb[i];
    if (x === y) continue;
    if (x === void 0) return -1;
    if (y === void 0) return 1;
    const nx = /^\d+$/.test(x);
    const ny = /^\d+$/.test(y);
    if (nx && ny) return Number(x) - Number(y);
    if (nx !== ny) return nx ? -1 : 1;
    return x < y ? -1 : 1;
  }
  return 0;
}
function checkPath(p) {
  if (typeof p !== "string" || !p.startsWith("pet/") || p.length > 512 || /[\\:\0]/.test(p) || p.split("/").some((s) => s === "" || s === "." || s === ".."))
    throw new Error(`非法路径：${String(p).slice(0, 80)}`);
  return p;
}
function parseManifest(raw2) {
  const m = raw2;
  if (!m || typeof m !== "object") throw new Error("manifest 不是对象");
  if (typeof m.id !== "string" || !ID.test(m.id)) throw new Error("manifest.id 无效");
  for (const k of ["version", "minShell"]) if (typeof m[k] !== "string" || !VERSION.test(m[k])) throw new Error(`manifest.${k} 无效`);
  if (m.base !== void 0 && (typeof m.base !== "string" || !VERSION.test(m.base))) throw new Error("manifest.base 无效");
  if (m.base !== void 0 && compareVersion(m.version, m.base) <= 0) throw new Error("manifest.version 必须高于 base");
  if (!Array.isArray(m.files)) throw new Error("manifest.files 无效");
  const seen = /* @__PURE__ */ new Set();
  for (const f of m.files) {
    const key = checkPath(f?.path).toLowerCase();
    if (seen.has(key)) throw new Error(`重复文件：${f.path}`);
    seen.add(key);
    if (!Number.isSafeInteger(f.size) || f.size < 0 || typeof f.sha256 !== "string" || !SHA.test(f.sha256)) throw new Error(`文件信息无效：${f.path}`);
  }
  if (m.deletes !== void 0 && (!Array.isArray(m.deletes) || m.base === void 0)) throw new Error("manifest.deletes 只能出现在增量包");
  for (const d of m.deletes ?? []) checkPath(d);
  return { id: m.id, version: m.version, minShell: m.minShell, ...m.base && { base: m.base }, files: m.files.map(({ path, size, sha256: sha2562 }) => ({ path, size, sha256: sha2562 })), ...m.deletes?.length && { deletes: [...m.deletes] } };
}
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
function readAt(fd, at, length) {
  const b = Buffer.alloc(length);
  let got = 0;
  while (got < length) {
    const n = readSync(fd, b, got, length - got, at + got);
    if (!n) throw new Error("文件被截断");
    got += n;
  }
  return b;
}
function zipEntries(fd) {
  const size = fstatSync(fd).size;
  const tail = readAt(fd, Math.max(0, size - 65557), Math.min(size, 65557));
  const e = tail.lastIndexOf(Buffer.from([80, 75, 5, 6]));
  if (e < 0) throw new Error("不是 zip 文件");
  const count = tail.readUInt16LE(e + 10);
  const dirSize = tail.readUInt32LE(e + 12);
  const dirAt = tail.readUInt32LE(e + 16);
  if (dirAt + dirSize > size) throw new Error("zip 目录损坏");
  const dir = readAt(fd, dirAt, dirSize);
  const out = /* @__PURE__ */ new Map();
  for (let o = 0, i = 0; i < count; i++) {
    if (dir.readUInt32LE(o) !== 33639248) throw new Error("zip 目录损坏");
    const flags = dir.readUInt16LE(o + 8);
    const method = dir.readUInt16LE(o + 10);
    const csize = dir.readUInt32LE(o + 20);
    const usize = dir.readUInt32LE(o + 24);
    const nl = dir.readUInt16LE(o + 28);
    const xl = dir.readUInt16LE(o + 30);
    const cl = dir.readUInt16LE(o + 32);
    const mode = dir.readUInt32LE(o + 38) >>> 16;
    const name = dir.toString("utf8", o + 46, o + 46 + nl);
    if (flags & 1) throw new Error("不支持加密的 zip");
    if (method !== 0 || csize !== usize) throw new Error("内容包必须是不压缩（store）的 zip");
    if ((mode & 61440) === 40960) throw new Error(`内容包不能含符号链接：${name}`);
    if (name.endsWith("/")) throw new Error(`内容包不能含目录项：${name}`);
    if (name !== MANIFEST) checkPath(name);
    if (out.has(name)) throw new Error(`重复文件：${name}`);
    out.set(name, { name, size: usize, crc: dir.readUInt32LE(o + 16), at: dir.readUInt32LE(o + 42) });
    o += 46 + nl + xl + cl;
  }
  return out;
}
function entryData(fd, e) {
  const h = readAt(fd, e.at, 30);
  if (h.readUInt32LE(0) !== 67324752) throw new Error(`zip 项损坏：${e.name}`);
  const data = readAt(fd, e.at + 30 + h.readUInt16LE(26) + h.readUInt16LE(28), e.size);
  if (crc32(data) !== e.crc) throw new Error(`校验失败：${e.name}`);
  return data;
}
function readPack(file, each) {
  const fd = openSync(file, "r");
  try {
    const entries = zipEntries(fd);
    const me = entries.get(MANIFEST);
    if (!me) throw new Error("缺少 manifest.json");
    let raw2;
    try {
      raw2 = JSON.parse(entryData(fd, me).toString("utf8"));
    } catch (e) {
      throw new Error(`manifest.json 无法解析：${e.message}`);
    }
    const m = parseManifest(raw2);
    if (entries.size !== m.files.length + 1) throw new Error("内容包里有 manifest 未列出的文件");
    for (const f of m.files) {
      const e = entries.get(f.path);
      if (!e) throw new Error(`缺少文件：${f.path}`);
      if (e.size !== f.size) throw new Error(`大小不符：${f.path}`);
      if (each) {
        const data = entryData(fd, e);
        if (sha256(data) !== f.sha256) throw new Error(`sha256 不符：${f.path}`);
        each(f, data);
      }
    }
    return m;
  } finally {
    closeSync(fd);
  }
}
const readManifest = (dir) => {
  try {
    return parseManifest(JSON.parse(readFileSync(join(dir, MANIFEST), "utf8")));
  } catch {
    return null;
  }
};
function installedLayers(packsDir2, bundled2, shell2) {
  let names = [];
  try {
    names = readdirSync(packsDir2);
  } catch {
    return [];
  }
  const all = names.filter((n) => !n.startsWith(".")).map((n) => ({ dir: join(packsDir2, n), manifest: readManifest(join(packsDir2, n)) })).filter((l) => !!l.manifest && compareVersion(l.manifest.minShell, shell2) <= 0).sort((a, b) => compareVersion(a.manifest.version, b.manifest.version));
  const out = [];
  let at = bundled2;
  for (const l of all) {
    const m = l.manifest;
    if (compareVersion(m.version, at) > 0 && (m.base === void 0 || m.base === at)) {
      out.unshift(l);
      at = m.version;
    }
  }
  return out;
}
const contentVersion = (layers2, bundled2) => layers2[0]?.manifest.version ?? bundled2;
function packBlocker(m, content, shell2) {
  if (compareVersion(m.minShell, shell2) > 0) return `需要 v${m.minShell} 或更新的程序（当前 v${shell2}）`;
  if (compareVersion(m.version, content) <= 0) return `当前内容已是 v${content}，不需要导入 v${m.version} 内容包`;
  if (m.base !== void 0 && m.base !== content) return `这是 v${m.base} → v${m.version} 的增量包，当前内容是 v${content}`;
  return null;
}
function installPack(file, packsDir2, content, shell2) {
  const head = readPack(file);
  const why = packBlocker(head, content, shell2);
  if (why) throw new Error(why);
  mkdirSync(packsDir2, { recursive: true });
  const tmp = join(packsDir2, `.tmp-${randomBytes(6).toString("hex")}`);
  try {
    const m = readPack(file, (f, data) => {
      const to = join(tmp, f.path);
      mkdirSync(dirname(to), { recursive: true });
      writeFileSync(to, data);
    });
    writeFileSync(join(tmp, MANIFEST), JSON.stringify(m));
    const final = join(packsDir2, `${m.id}@${m.version}`);
    rmSync(final, { recursive: true, force: true });
    renameSync(tmp, final);
    return m;
  } catch (e) {
    rmSync(tmp, { recursive: true, force: true });
    throw e;
  }
}
function lookup(layers2, bundledRoot, path, cased = (_r, p) => p) {
  for (const l of layers2) {
    const p = cased(l.dir, "/" + path).replace(/^\//, "");
    const file = join(l.dir, p);
    if (existsSync(file) && lstatSync(file).isFile()) return file;
    if (l.manifest.deletes?.some((d) => d.toLowerCase() === path.toLowerCase())) return null;
  }
  return join(bundledRoot, cased(bundledRoot, "/" + path).replace(/^\//, ""));
}
const NO_CONTENT = "0";
const bundledContent = (resourcesRoot2, shell2) => existsSync(join(resourcesRoot2, "pet")) ? shell2 : null;
function mirrored(url, mirror = "") {
  const m = mirror.trim();
  if (!m) return url;
  if (!/^https?:\/\/[^\s]+$/i.test(m)) throw new Error("镜像地址需要以 http:// 或 https:// 开头");
  return m.replace(/\/*$/, "/") + url;
}
function pickFullPack(index, content, shell2) {
  const full = (index.packs ?? []).filter((p) => p.base === void 0).sort((a, b) => compareVersion(b.version, a.version));
  if (!full.length) return "发布页上没有完整内容包";
  return full.find((p) => !packBlocker(p, content, shell2)) ?? packBlocker(full[0], content, shell2);
}
const unreachable = (e) => new Error(`连不上下载地址，请检查网络或换个镜像（${e?.message ?? e}）`);
async function fetchIndex(fetch, url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(2e4) }).catch((e) => {
    throw unreachable(e);
  });
  if (!r.ok) throw new Error(`获取内容包列表失败：HTTP ${r.status}`);
  const index = await r.json();
  if (!Array.isArray(index?.packs)) throw new Error("内容包列表格式不对");
  return index;
}
const STALL_MS = 3e4;
async function downloadTo(fetch, entry, file, opts = {}) {
  const abort = new AbortController();
  let stall;
  const arm = () => {
    clearTimeout(stall);
    stall = setTimeout(() => abort.abort(new Error("下载长时间没有进度，已中断")), opts.stallMs ?? STALL_MS);
  };
  const fd = openSync(file, "w");
  const hash = createHash("sha256");
  let received = 0;
  try {
    arm();
    const r = await fetch(mirrored(entry.url, opts.mirror), { signal: abort.signal }).catch((e) => {
      throw abort.signal.aborted ? e : unreachable(e);
    });
    if (!r.ok || !r.body) throw new Error(`下载失败：HTTP ${r.status}`);
    const reader = r.body.getReader();
    let last = 0;
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      arm();
      writeSync(fd, value);
      hash.update(value);
      received += value.length;
      if (received > entry.size) throw new Error("下载的内容包比预期大，已中断");
      const now2 = Date.now();
      if (now2 - last >= 200) {
        last = now2;
        opts.onProgress?.({ received, total: entry.size });
      }
    }
    opts.onProgress?.({ received, total: entry.size });
    if (received !== entry.size) throw new Error(`下载不完整（${received} / ${entry.size} 字节）`);
    if (hash.digest("hex") !== entry.sha256) throw new Error("下载的内容包校验失败");
  } catch (e) {
    closeSync(fd);
    rmSync(file, { force: true });
    throw abort.signal.aborted && abort.signal.reason instanceof Error ? abort.signal.reason : e;
  } finally {
    clearTimeout(stall);
  }
  closeSync(fd);
}
const listings = /* @__PURE__ */ new Map();
function list$1(dir) {
  let names = listings.get(dir);
  if (!names) {
    try {
      names = readdirSync(dir);
    } catch {
      names = [];
    }
    listings.set(dir, names);
  }
  return names;
}
function petsocPath(root, path) {
  if (!path.startsWith("/pet/petsoc/")) return path;
  let dir = root;
  let out = "";
  for (const part of path.split("/").filter(Boolean)) {
    const names = list$1(dir);
    const want = part.toLowerCase();
    const hit = names.includes(part) ? part : names.find((n) => n.toLowerCase() === want);
    if (!hit) return path;
    dir = join(dir, hit);
    out += "/" + hit;
  }
  return out;
}
const resourcesRoot = app.isPackaged ? process.resourcesPath : join(app.getAppPath(), "resources");
const shell = APP_VERSION.replace(/^v/, "");
const bundled = bundledContent(resourcesRoot, shell);
const hasBundledContent = bundled !== null;
let packsDirPath;
const packsDir = () => packsDirPath ??= join(app.getPath("userData"), "packs");
let layerCache;
const layers = () => layerCache ??= installedLayers(packsDir(), bundled ?? NO_CONTENT, shell);
const installedContent = () => contentVersion(layers(), bundled ?? NO_CONTENT);
const contentMissing = () => installedContent() === NO_CONTENT;
function resourceFile(path) {
  return lookup(layers(), resourcesRoot, path, petsocPath);
}
function install(file) {
  const m = installPack(file, packsDir(), installedContent(), shell);
  return m.version;
}
async function importPack(win) {
  const options = { properties: ["openFile"], filters: [{ name: "QQ宠物内容包", extensions: ["qqpetpack"] }] };
  const r = await (win ? dialog.showOpenDialog(win, options) : dialog.showOpenDialog(options));
  if (r.canceled || !r.filePaths[0]) return null;
  return install(r.filePaths[0]);
}
function resetPacks() {
  rmSync(packsDir(), { recursive: true, force: true });
}
const INDEX = "https://github.com/piggyuuuu/Pet/releases/latest/download/packs.json";
let offered = null;
async function findPack(fetch, url = INDEX) {
  const index = await fetchIndex(fetch, url);
  const content = installedContent();
  const fit = (index.packs ?? []).filter((p) => p.base !== void 0 && !packBlocker(p, content, shell)).sort((a, b) => compareVersion(b.version, a.version))[0];
  offered = fit ?? null;
  return fit ? { version: fit.version, base: fit.base, size: fit.size } : null;
}
async function findFullPack(fetch, mirror = "") {
  const fit = pickFullPack(await fetchIndex(fetch, mirrored(INDEX, mirror)), installedContent(), shell);
  if (typeof fit === "string") throw new Error(fit);
  offered = fit;
  return { version: fit.version, size: fit.size };
}
async function downloadPack(fetch, mirror = "", onProgress) {
  const offer = offered;
  if (!offer) throw new Error("没有可用的内容更新");
  const file = join(tmpdir(), `qqpet-${process.pid}-${offer.version}.qqpetpack`);
  try {
    await downloadTo(fetch, offer, file, { mirror, onProgress });
    return install(file);
  } finally {
    rmSync(file, { force: true });
  }
}
function hidpiSvg(file) {
  const hi = file.replace(/\.(png|gif|bmp|jpg)$/i, "@2x.png");
  if (hi === file || !existsSync(hi)) return void 0;
  const png = readFileSync(hi);
  const w = png.readUInt32BE(16) / 2;
  const h = png.readUInt32BE(20) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><image href="data:image/png;base64,${png.toString("base64")}" width="${w}" height="${h}" preserveAspectRatio="none"/></svg>`;
}
const APP_ORIGIN = "app://bundle";
const rendererRoot = join(import.meta.dirname, "../renderer");
function registerScheme() {
  protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
  ]);
}
function handleScheme() {
  protocol.handle("app", (req) => {
    const path = decodeURIComponent(new URL(req.url).pathname);
    let file;
    if (path.startsWith("/pet/")) {
      const rel = normalize(path.slice(1)).replace(/\\/g, "/");
      if (!rel.startsWith("pet/") || isAbsolute(rel)) return new Response(null, { status: 403 });
      file = resourceFile(rel);
    } else {
      file = normalize(join(rendererRoot, path));
      if (!file.startsWith(rendererRoot + sep)) return new Response(null, { status: 403 });
    }
    if (!file) return new Response(null, { status: 404 });
    const svg = req.headers.has("x-hd") && req.headers.get("accept")?.includes("image/svg+xml") && hidpiSvg(file);
    if (svg) return new Response(svg, { headers: { "content-type": "image/svg+xml" } });
    return net.fetch(pathToFileURL(file).toString());
  });
}
const closeFds = 'for f in /proc/$$/fd/*; do n=${f##*/}; [ "$n" -gt 2 ] && eval "exec $n<&-"; done 2>/dev/null; ';
const waitFor = (pid) => `while kill -0 ${pid} 2>/dev/null; do sleep 0.2; done; `;
function spawnSelf(extraArgs = []) {
  const args = [process.env.APPIMAGE || process.execPath, ...process.argv.slice(1), ...extraArgs];
  const script = closeFds + waitFor(process.pid) + 'exec "$0" "$@"';
  const [file, argv] = existsSync("/bin/bash") ? ["/bin/bash", ["-c", script, ...args]] : [args[0], args.slice(1)];
  spawn(file, argv, { detached: true, stdio: "inherit" }).unref();
}
function relaunch() {
  if (process.platform === "linux" && process.env.APPIMAGE) spawnSelf();
  else app.relaunch();
  app.exit(0);
}
const PAGES$1 = process.env.ELECTRON_RENDERER_URL ?? APP_ORIGIN;
function registerPackIpc() {
  ipcMain.handle(IPC.packInfo, () => ({ content: installedContent(), shell: APP_VERSION, bundled: hasBundledContent }));
  ipcMain.handle(IPC.importPack, (e) => importPack(BrowserWindow.fromWebContents(e.sender)));
  ipcMain.handle(IPC.resetPacks, () => resetPacks());
  ipcMain.handle(IPC.findPack, () => findPack(net.fetch));
  ipcMain.handle(IPC.findFullPack, (_e, mirror) => findFullPack(net.fetch, mirror ?? ""));
  ipcMain.handle(
    IPC.downloadPack,
    (e, mirror) => downloadPack(net.fetch, mirror ?? "", (p) => e.sender.isDestroyed() || e.sender.send(IPC.packProgress, p))
  );
  ipcMain.on(IPC.relaunch, () => relaunch());
}
function openFirstRun() {
  const win = new BrowserWindow({
    width: 520,
    height: 420,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    title: "QQ宠物 - 准备宠物内容",
    show: false,
    autoHideMenuBar: true,
    webPreferences: { preload: join(import.meta.dirname, "../preload/index.cjs"), sandbox: true, contextIsolation: true }
  });
  win.setMenu(null);
  win.once("ready-to-show", () => win.show());
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  void win.loadURL(`${PAGES$1}/firstrun.html`);
  return win;
}
const BUSY = /* @__PURE__ */ new Set(["EPERM", "EACCES", "EBUSY"]);
const RETRIES = 5;
const RETRY_MS = 20;
const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function atomicWrite(file, text, fs = { writeFileSync, renameSync }, sleep = pause) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, text);
  for (let attempt = 0; ; attempt++) {
    try {
      fs.renameSync(tmp, file);
      return;
    } catch (e) {
      if (!BUSY.has(e.code ?? "") || attempt >= RETRIES) throw e;
      sleep(RETRY_MS * (attempt + 1));
    }
  }
}
const now = () => Math.floor(Date.now() / 1e3);
const rand = (min, max) => () => Math.round(Math.random() * (max - min) + min);
const isNum = (v) => typeof v === "number" && !Number.isNaN(v);
const num = (min, max, fallback) => (v) => isNum(v) && v >= min && v <= max ? v : typeof fallback === "function" ? fallback() : fallback;
const bool = (v) => typeof v === "boolean" ? v : false;
const list = (v) => Array.isArray(v) ? v : [];
const str = (fallback) => (v) => typeof v === "string" ? v : fallback;
const nullable = (v) => v === void 0 ? null : v;
const ANY = Infinity;
const AI_URL = "http://127.0.0.1:8000/v1";
const windowDirection = (v) => v === "auto" || v === "screen" ? v : "auto";
const RULES = {
  petInfo: {
    name: (v) => v || "宠宝~",
    host: (v) => v || "主人~",
    sex: (v) => v === "GG" || v === "MM" ? v : "GG",
    growth: num(-ANY, ANY, 0),
    hunger: num(0, ANY, 0),
    clean: num(0, ANY, 0),
    health: num(0, 5, 0),
    mood: num(0, 1e3, 0),
    birthDay: num(1, ANY, now),
    intel: num(-ANY, ANY, rand(5, 50)),
    charm: num(-ANY, ANY, rand(5, 50)),
    strong: num(-ANY, ANY, rand(5, 50)),
    // The original defaulted this to the string "0".
    onLineTime: (v) => isNum(v) ? v : Number(v) || 0,
    lastX: num(0, ANY, -1),
    lastY: num(0, ANY, -1),
    yb: (v) => isNum(v) ? v | 0 : 5e3,
    lastLoginTime: num(0, ANY, 0),
    onlineDataTime: num(0, ANY, 0),
    pinkDiamond: bool,
    PDgrowth: num(0, ANY, 0),
    PDgrowthValue: num(0, ANY, 0),
    PDgrowthValue_next: num(0, ANY, 0),
    PDiamondLevel: num(0, ANY, 0),
    PDiamondBeginDate: num(0, ANY, 0),
    PDiamondExpirationDate: num(0, ANY, 0),
    PDiamondYear: bool,
    sweetHeart: bool,
    sweetHeartOverTime: num(0, ANY, 0)
  },
  petComputedlInfo: {
    level: num(1, ANY, 1),
    upGrowth: num(0, ANY, 0),
    nextGrowth: num(125, ANY, 125),
    hungerMax: num(1e3, ANY, 1e3),
    cleanMax: num(1e3, ANY, 1e3),
    healthMax: num(5, 5, 5),
    moodMax: num(1e3, 1e3, 1e3)
  },
  studyInfo: Object.fromEntries(
    ["chinese", "mathematics", "politics", "music", "art", "manner", "pe", "labouring", "wushu"].map((k) => [k, num(0, ANY, 0)])
  ),
  activeOption: { work: nullable, study: nullable, trip: nullable, ill: nullable, die: nullable },
  selfGoodDatas: {
    ...Object.fromEntries(["food", "clean", "medicine", "background", "nums", "service", "work", "study", "trip"].map((k) => [k, list])),
    // Toys whose id contains "__" were removed from the game; drop them in place.
    toy: (v) => {
      if (!Array.isArray(v)) return [];
      for (let i = v.length - 1; i >= 0; i--) if (String(v[i]).includes("__")) v.splice(i, 1);
      return v;
    }
  },
  selfGoodUseOption: { background: nullable, food: nullable, clean: nullable, toy: nullable },
  gameSaveDatas: {
    fishing_harvestfish: num(0, ANY, 0),
    travel_china: list,
    travel_china_num: num(0, ANY, 0),
    ddw: num(0, ANY, 0),
    yyds: num(0, ANY, 0)
  },
  settings: {
    opacity: num(0, 1, 1),
    music: num(0, 1, 1),
    // On for saves written before the field existed, so an upgrade does not silence the pet.
    sound: (v) => typeof v === "boolean" ? v : true,
    faceClick: (v) => v === 0 || v === 1 || v === 2 ? v : 2,
    quiet: bool,
    autoStart: bool,
    paused: bool,
    hidden: bool,
    hd: bool,
    zoom: num(1, 2, 1),
    windowDirection,
    clip: bool,
    watchApp: bool,
    roam: bool,
    lan: bool,
    webhook: bool,
    webhookPort: num(1024, 65535, 17788),
    webhookToken: str(""),
    voice: (v) => typeof v === "boolean" ? v : true,
    memory: (v) => typeof v === "boolean" ? v : true,
    polish: (v) => typeof v === "boolean" ? v : true,
    search: (v) => typeof v === "boolean" ? v : false,
    searchBackend: (v) => v === "tavily" || v === "brave" ? v : "auto",
    searchKey: (v) => typeof v === "string" ? v : "",
    petBar: (v) => typeof v === "boolean" ? v : true,
    difficulty: (v) => v === "standard" ? "standard" : "easy",
    chatCheat: (v) => typeof v === "boolean" ? v : true,
    cheatTab: bool,
    undying: bool,
    aiUrl: str(AI_URL),
    aiKey: str(""),
    aiModel: str(""),
    weatherCity: str(""),
    autoUpdate: (v) => typeof v === "boolean" ? v : true,
    updateCheckedAt: num(0, ANY, 0),
    petDisplayId: (v) => typeof v === "number" && Number.isSafeInteger(v) ? v : null
  }
};
function fresh() {
  return {
    havePet: false,
    isBury: false,
    saveNum: 0,
    nowTimeLine: 0,
    petInfo: {
      name: "宠宝~",
      host: "主人~",
      sex: "GG",
      growth: 0,
      hunger: 1100,
      clean: 1100,
      health: 5,
      mood: 1e3,
      birthDay: now(),
      intel: rand(5, 50)(),
      charm: rand(5, 50)(),
      strong: rand(5, 50)(),
      onLineTime: 0,
      lastX: -1,
      lastY: -1,
      yb: 5e3,
      lastLoginTime: 0,
      onlineDataTime: 0,
      pinkDiamond: false,
      PDgrowth: 0,
      PDgrowthValue: 0,
      PDgrowthValue_next: 0,
      PDiamondLevel: 0,
      PDiamondBeginDate: 0,
      PDiamondExpirationDate: 0,
      PDiamondYear: false,
      sweetHeart: false,
      sweetHeartOverTime: 0
    },
    petComputedlInfo: { level: 1, upGrowth: 0, nextGrowth: 125, hungerMax: 1100, cleanMax: 1100, healthMax: 5, moodMax: 1e3 },
    studyInfo: { chinese: 0, mathematics: 0, politics: 0, music: 0, art: 0, manner: 0, pe: 0, labouring: 0, wushu: 0 },
    activeOption: { work: null, study: null, trip: null, ill: null, die: null },
    selfGoodDatas: {
      food: ["_10013006*2", "_102010001*3"],
      clean: ["_10021008*2", "_10021005*2"],
      medicine: ["_60001*2", "_50001*1"],
      background: ["_b0000000*1", "_b0000001*1"],
      service: [],
      work: [],
      study: [],
      trip: [],
      toy: ["_t0002*1"],
      nums: []
    },
    selfGoodUseOption: { background: null, food: null, clean: null, toy: null },
    gameSaveDatas: { fishing_harvestfish: 0, travel_china: [], travel_china_num: 0, ddw: 0, yyds: 0 },
    illustrated: [],
    saveJsonData: { email: "{}", task: "{}", signin: "{}", fishs: "{}" },
    settings: {
      opacity: 1,
      music: 1,
      sound: true,
      faceClick: 2,
      quiet: false,
      autoStart: false,
      paused: false,
      hidden: false,
      hd: false,
      zoom: 1,
      windowDirection: "auto",
      clip: false,
      watchApp: false,
      roam: false,
      lan: false,
      webhook: false,
      webhookPort: 17788,
      webhookToken: "",
      voice: true,
      memory: true,
      polish: true,
      search: false,
      searchBackend: "auto",
      searchKey: "",
      petBar: true,
      difficulty: "easy",
      chatCheat: true,
      cheatTab: false,
      undying: false,
      aiUrl: AI_URL,
      aiKey: "",
      aiModel: "",
      weatherCity: "",
      autoUpdate: true,
      updateCheckedAt: 0,
      petDisplayId: null
    }
  };
}
function repair(data) {
  const fixed = [];
  for (const [group, rules] of Object.entries(RULES)) {
    data[group] ??= {};
    for (const [field, rule] of Object.entries(rules)) {
      const v = rule(data[group][field]);
      if (v === data[group][field]) continue;
      data[group][field] = v;
      fixed.push(`${group}.${field}`);
    }
  }
  data.illustrated ??= [];
  data.saveJsonData ??= {};
  return fixed;
}
function petOf(data) {
  const pet = data.petInfoData ?? data;
  delete pet.machineId;
  delete pet.oId;
  return pet;
}
function startSave(stored) {
  if (stored?.havePet) {
    const fixed = repair(stored);
    if (fixed.length) console.warn("repaired save fields:", fixed.join(", "));
    return stored;
  }
  const save2 = fresh();
  if (stored?.settings) Object.assign(save2.settings, stored.settings, { paused: false, hidden: false });
  save2.settings.windowDirection = windowDirection(save2.settings.windowDirection);
  return save2;
}
function applyPatch(save2, patch) {
  const target = save2;
  for (const [key, value] of Object.entries(patch)) {
    const current = target[key];
    if (value && typeof value === "object" && !Array.isArray(value) && current && typeof current === "object") Object.assign(current, value);
    else target[key] = value;
  }
  save2.saveNum++;
}
function buried(save2, sex) {
  save2.havePet = false;
  save2.isBury = false;
  save2.settings.windowDirection = windowDirection(save2.settings.windowDirection);
  if (!sex) return save2;
  const born = startSave(save2);
  born.petInfo.sex = sex;
  born.havePet = true;
  return born;
}
const saveFile = () => join(app.getPath("userData"), "save.json");
const LEGACY_FILE = join(app.getPath("appData"), "Arctic Penguin", "config.json");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
function read() {
  const file = saveFile();
  if (existsSync(file)) {
    try {
      return readJson(file);
    } catch (e) {
      const backup = `${file}.corrupt-${Date.now()}`;
      renameSync(file, backup);
      console.error(`save file is corrupt, moved to ${backup}:`, e);
      return null;
    }
  }
  if (existsSync(LEGACY_FILE)) {
    console.log(`migrating save from ${LEGACY_FILE}`);
    return petOf(readJson(LEGACY_FILE));
  }
  return null;
}
function write(data) {
  atomicWrite(saveFile(), JSON.stringify(data));
}
let retry;
function writeLater() {
  clearTimeout(retry);
  retry = void 0;
  try {
    write(save);
  } catch (e) {
    console.error("save file is busy, retrying:", e);
    retry = setTimeout(writeLater, 1e3);
  }
}
let save;
function loadSave() {
  save = startSave(read());
  write(save);
  return save;
}
function getSave() {
  return save;
}
function patchSave(patch) {
  applyPatch(save, patch);
  writeLater();
}
function exportSave(file) {
  writeFileSync(file, JSON.stringify(save, null, 2));
}
function importSave(file) {
  const pet = petOf(readJson(file));
  if (pet.havePet !== true) throw new Error("no pet in this file");
  copyFileSync(saveFile(), `${saveFile()}.bak`);
  write(pet);
}
function resetSave(sex) {
  save = buried(save, sex);
  write(save);
}
const TRAY_STATES = {
  normal: { frames: 4, tip: "[h]家的[n]" },
  leave: { frames: 0 },
  dirty: { frames: 4, tip: "[n]要清洁~" },
  event: { frames: 2, tip: "[h]家的[n]" },
  feast: { frames: 3 },
  game: { frames: 4, tip: "[n]游戏中~" },
  hungry: { frames: 4, tip: "[n]要吃饭~" },
  ill: { frames: 2, tip: "[n]生病了~" },
  pause: { frames: 5, tip: "[n]暂停了~" },
  study: { frames: 4, tip: "[n]学习中~" },
  travel: { frames: 3, tip: "[n]旅游中~" },
  work: { frames: 3, tip: "[n]工作中~" },
  dead: { frames: 2, tip: "[n]死亡了~" },
  bury: { frames: 2, tip: "[n]已埋葬~" }
};
const label = (s, fallback) => !s || /\[[^\]]]/.test(s) ? fallback : s;
function trayTip(state, pet) {
  return TRAY_STATES[state].tip?.replace(/\[n]/g, label(pet.name, "宠宝~")).replace(/\[h]/g, label(pet.host, "主人~"));
}
const FRAME_MS = 300;
function icon(sex, file, hd) {
  const path = resourceFile(`pet/img_res/Tray/${sex}/${file}`) ?? "";
  return hd ? nativeImage.createFromPath(path) : nativeImage.createFromBuffer(readFileSync(path));
}
function createPetTray(onClick, onLeave) {
  const tray = new Tray(icon("GG", "leave.png", false));
  let poppingMenu = false;
  tray.setToolTip("QQ宠物");
  if (process.platform === "linux") {
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: "宠物状态", click: () => onClick({ kind: "state" }) },
        { label: "菜单", click: () => onClick({ kind: "menu" }) },
        { type: "separator" },
        { label: "退出", click: () => app.quit() }
      ])
    );
  } else {
    tray.on("click", () => {
      if (!poppingMenu) onClick({ kind: "state", ...screen.getCursorScreenPoint(), autoClose: process.platform === "win32" });
    });
    tray.on("mouse-enter", () => {
      if (!poppingMenu) onClick({ kind: "state", ...screen.getCursorScreenPoint(), autoClose: true });
    });
    tray.on("mouse-leave", () => onLeave?.());
    tray.on("right-click", () => onClick({ kind: "menu", ...process.platform !== "darwin" && screen.getCursorScreenPoint() }));
  }
  let timer;
  let current = "leave";
  const retip = (pet) => {
    const tip = trayTip(current, pet);
    if (tip) tray.setToolTip(tip);
  };
  return {
    popupMenu(entries, select) {
      if (process.platform !== "darwin") return;
      const template = (items) => items.map((item) => ({
        label: item.label,
        toolTip: item.toolTip,
        type: item.children ? "submenu" : item.checked === void 0 ? "normal" : "checkbox",
        checked: item.checked,
        submenu: item.children && template(item.children),
        click: () => {
          if (item.action !== void 0) select(item.action);
        }
      }));
      poppingMenu = true;
      try {
        tray.popUpContextMenu(Menu.buildFromTemplate(template(entries)));
      } finally {
        poppingMenu = false;
      }
    },
    /** Re-renders the tooltip, e.g. after a rename. */
    retip,
    /** Without a state: redraws the current one, e.g. after the hd setting changed. */
    setState(s, state = current) {
      const pet = s.petInfo;
      clearTimeout(timer);
      current = state;
      retip(pet);
      const { frames } = TRAY_STATES[state];
      if (frames === 0) return tray.setImage(icon(pet.sex, `${state}.png`, s.settings.hd));
      const images = Array.from({ length: frames }, (_, i) => icon(pet.sex, `${state}/${i + 1}.png`, s.settings.hd));
      const show = (i) => {
        tray.setImage(images[i]);
        timer = setTimeout(() => show((i + 1) % frames), FRAME_MS);
      };
      show(0);
    },
    destroy() {
      clearTimeout(timer);
      tray.destroy();
    }
  };
}
const run = promisify(execFile);
const KNOWN = [
  ["code", "写代码"],
  ["cursor", "写代码"],
  ["webstorm", "写代码"],
  ["pycharm", "写代码"],
  ["goland", "写代码"],
  ["idea", "写代码"],
  ["sublime", "写代码"],
  ["nvim", "写代码"],
  ["vim", "写代码"],
  ["emacs", "写代码"],
  ["chrome", "看网页"],
  ["firefox", "看网页"],
  ["safari", "看网页"],
  ["msedge", "看网页"],
  ["edge", "看网页"],
  ["arc", "看网页"],
  ["weixin", "聊微信"],
  ["wechat", "聊微信"],
  ["qq", "聊QQ"],
  ["slack", "在聊天"],
  ["discord", "在聊天"],
  ["telegram", "在聊天"],
  ["spotify", "听音乐"],
  ["music", "听音乐"],
  ["finder", "翻文件"],
  ["explorer", "翻文件"],
  ["nautilus", "翻文件"],
  ["winword", "写文档"],
  ["excel", "看表格"],
  ["powerpnt", "做PPT"],
  ["pages", "写文档"],
  ["preview", "看文件"],
  ["vlc", "看电影"],
  ["iina", "看电影"],
  ["mpv", "看电影"]
];
const WIN = `
Add-Type -Namespace Q -Name F -MemberDefinition '[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();[DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, System.Text.StringBuilder s, int n);[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint id);'
$h=[Q.F]::GetForegroundWindow(); $s=New-Object System.Text.StringBuilder 256; [void][Q.F]::GetWindowText($h,$s,256); $id=[uint32]0; [void][Q.F]::GetWindowThreadProcessId($h,[ref]$id); $p=Get-Process -Id $id -EA SilentlyContinue; Write-Output ($p.ProcessName+'|'+$s)
`;
async function raw() {
  if (process.platform === "darwin") {
    const { stdout } = await run("osascript", ["-e", 'tell application "System Events" to get name of first application process whose frontmost is true'], { timeout: 3e3 });
    return { app: stdout.trim(), title: "" };
  }
  if (process.platform === "win32") {
    const { stdout } = await run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", WIN], { timeout: 5e3 });
    const [app2, title] = stdout.trim().split("|");
    return { app: app2 ?? "", title: title ?? "" };
  }
  try {
    const { stdout: pid } = await run("xdotool", ["getactivewindow", "getwindowpid"], { timeout: 1500 });
    const app2 = (await readFile(`/proc/${pid.trim()}/comm`, "utf8")).trim();
    let title = "";
    try {
      title = (await run("xdotool", ["getactivewindow", "getwindowname"], { timeout: 1500 })).stdout.trim();
    } catch {
    }
    return { app: app2, title };
  } catch {
    const { stdout } = await run(
      "gdbus",
      ["call", "--session", "--dest", "org.gnome.Shell", "--object-path", "/org/gnome/Shell", "--method", "org.gnome.Shell.Eval", "global.display.focus_window.get_wm_class()"],
      { timeout: 1500 }
    );
    return { app: stdout.match(/"([^"]+)"/)?.[1] ?? "", title: "" };
  }
}
async function frontName() {
  try {
    const { app: app2, title } = await raw();
    if (!app2 || /^(electron|qqpet)$/i.test(app2)) return "";
    const s = `${app2} ${title}`.toLowerCase();
    return KNOWN.filter(([k]) => s.includes(k)).sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? app2;
  } catch {
    return "";
  }
}
function overlayArea(display, insetScreenEdges) {
  const area = display.workArea;
  const screen2 = display.bounds;
  if (!insetScreenEdges || !screen2) return area;
  const left = area.x <= screen2.x ? 1 : 0;
  const top = area.y <= screen2.y ? 1 : 0;
  const right = area.x + area.width >= screen2.x + screen2.width ? 1 : 0;
  const bottom = area.y + area.height >= screen2.y + screen2.height ? 1 : 0;
  return { x: area.x + left, y: area.y + top, width: area.width - left - right, height: area.height - top - bottom };
}
const petDisplay = (desktop, id) => desktop.getAllDisplays().find((display) => display.id === id) ?? desktop.getPrimaryDisplay();
function desktopCursor(win, desktop, initialId, pageZoom = () => 1, placement = (display) => display.workArea) {
  const origin = win.getBounds();
  let id = initialId;
  let sequence = 0;
  return (follow) => {
    const zoom = pageZoom();
    const cursor = desktop.getCursorScreenPoint();
    const display = follow ? desktop.getDisplayNearestPoint(cursor) : petDisplay(desktop, id);
    id = display.id;
    const before = win.getBounds();
    const area = placement(display);
    if (before.x !== area.x || before.y !== area.y || before.width !== area.width || before.height !== area.height) win.setBounds(area);
    const bounds = win.getBounds();
    return {
      x: (cursor.x - bounds.x) / zoom,
      y: (cursor.y - bounds.y) / zoom,
      desktop: {
        id,
        width: bounds.width / zoom,
        height: bounds.height / zoom,
        offset: { x: (origin.x - bounds.x) / zoom, y: (origin.y - bounds.y) / zoom },
        zoom,
        sequence: ++sequence
      }
    };
  };
}
function fullscreenGate(apply, calm = 4) {
  let full = false;
  let clear = 0;
  return (line2) => {
    if (line2 === "1") {
      clear = 0;
      if (!full) apply(full = true);
    } else if (line2 === "0" && full && ++clear >= calm) {
      clear = 0;
      apply(full = false);
    }
  };
}
const CURSOR_INTERVAL_MS = 33;
const PAGES = process.env.ELECTRON_RENDERER_URL ?? APP_ORIGIN;
function createPetWindow() {
  const initialDisplay = petDisplay(screen, getSave().settings.petDisplayId);
  const placement = (display) => overlayArea(display, process.platform === "win32");
  const win = new BrowserWindow({
    ...placement(initialDisplay),
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    // Chromium apps (browsers, 抖音...) treat a work-area-sized window as covering them and stop painting
    // once it stops being click-through; a tool window is never counted.
    ...process.platform === "win32" && { type: "toolbar" },
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.cjs"),
      sandbox: true,
      contextIsolation: true,
      zoomFactor: getSave().settings.zoom
    }
  });
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true);
  if (process.platform === "linux") win.setShape([{ x: 0, y: 0, width: 0, height: 0 }]);
  else win.setIgnoreMouseEvents(true);
  win.once("ready-to-show", () => {
    win.showInactive();
    if (process.platform === "win32") hideOnFullscreen(win);
  });
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  const position = desktopCursor(win, screen, initialDisplay.id, () => getSave().settings.zoom, placement);
  let dragging = false;
  ipcMain.handle(IPC.setDragging, (event, on) => {
    if (event.sender !== win.webContents) throw new Error("Unknown drag sender");
    const point = position(dragging || on);
    dragging = on;
    return point;
  });
  let last = "";
  const timer = setInterval(() => {
    const p = position(dragging);
    const key = JSON.stringify({ ...p, desktop: { ...p.desktop, sequence: 0 } });
    if (key === last) return;
    last = key;
    win.webContents.send(IPC.cursor, p);
  }, CURSOR_INTERVAL_MS);
  win.on("closed", () => {
    clearInterval(timer);
    ipcMain.removeHandler(IPC.setDragging);
  });
  void win.loadURL(`${PAGES}/index.html`);
  if (process.env.ELECTRON_RENDERER_URL) win.webContents.openDevTools({ mode: "detach" });
  return win;
}
const FULLSCREEN_PS = `
$ErrorActionPreference = 'Stop'
Add-Type -Namespace Q -Name W -MemberDefinition '
public struct R { public int L, T, Rt, B; }
public struct M { public int Size; public R Mon, Work; public int Flags; }
[DllImport("shell32.dll")] public static extern int SHQueryUserNotificationState(out int state);
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out R r);
[DllImport("user32.dll")] static extern bool IsZoomed(IntPtr h);
[DllImport("user32.dll")] static extern int GetWindowLong(IntPtr h, int i);
[DllImport("user32.dll")] static extern IntPtr MonitorFromWindow(IntPtr h, int flags);
[DllImport("user32.dll")] static extern bool GetMonitorInfo(IntPtr m, ref M info);
[DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, System.Text.StringBuilder s, int n);
public static bool Shell(IntPtr h) {
  if (h == IntPtr.Zero) return true;
  var c = new System.Text.StringBuilder(32); GetClassName(h, c, 32);
  var n = c.ToString();
  return n == "Shell_TrayWnd" || n == "Shell_SecondaryTrayWnd" || n == "MultitaskingViewFrame" || n == "XamlExplorerHostIslandWindow" || n == "ForegroundStaging";
}
public static bool Covers(IntPtr h) {
  var c = new System.Text.StringBuilder(32); GetClassName(h, c, 32);
  if (c.ToString() == "Progman" || c.ToString() == "WorkerW") return false;
  R r; M m = new M(); m.Size = Marshal.SizeOf(m);
  // A maximized window covers the monitor too once the taskbar auto-hides, so one with a caption does not count.
  // Full screen drops the caption but keeps WS_MAXIMIZE when entered from a maximized window (F11 in a maximized browser).
  if ((IsZoomed(h) && (GetWindowLong(h, -16) & 0xC00000) == 0xC00000) || !GetWindowRect(h, out r) || !GetMonitorInfo(MonitorFromWindow(h, 2), ref m)) return false;
  return r.L <= m.Mon.L && r.T <= m.Mon.T && r.Rt >= m.Mon.Rt && r.B >= m.Mon.B;
}'
while ($true) {
  $s = 0
  [void][Q.W]::SHQueryUserNotificationState([ref]$s)
  $f = [Q.W]::GetForegroundWindow()
  if ([Q.W]::Shell($f)) { [Console]::WriteLine(-1) }
  else { [Console]::WriteLine([int]($f -ne [IntPtr]PET -and ($s -eq 3 -or $s -eq 4 -or [Q.W]::Covers($f)))) }
  Start-Sleep -Milliseconds 500
}`;
function hideOnFullscreen(win) {
  const script = FULLSCREEN_PS.replace("PET", `${win.getNativeWindowHandle().readBigUInt64LE()}`);
  const ps = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], {
    stdio: ["ignore", "pipe", "ignore"],
    windowsHide: true
  });
  createInterface({ input: ps.stdout }).on("line", fullscreenGate((full) => full ? win.hide() : win.showInactive()));
  win.on("closed", () => ps.kill());
}
function openGameWindow(swf, parent) {
  const area = screen.getPrimaryDisplay().workAreaSize;
  const scale = Math.min(1, area.width * 0.9 / 1024, area.height * 0.9 / 768);
  const win = new BrowserWindow({
    parent,
    width: Math.round(1024 * scale),
    height: Math.round(768 * scale),
    useContentSize: true,
    backgroundColor: "#000",
    autoHideMenuBar: true,
    webPreferences: { sandbox: true }
  });
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  void win.loadURL(`${PAGES}/game.html?swf=${encodeURIComponent(swf)}`);
  return win;
}
const UDP_PORT = 47777;
const HELLO_MS = 5e3;
const TIMEOUT_MS = 15e3;
const PING_MS = 3e4;
const MAX_LINE = 64 * 1024;
function persistedLanId(dir) {
  const file = join(dir, "lan-id.json");
  try {
    if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")).id;
  } catch {
  }
  const id = randomUUID();
  writeFileSync(file, JSON.stringify({ id }));
  return id;
}
const line = (o) => `${JSON.stringify(o)}
`;
function broadcastAddrs() {
  const out = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family !== "IPv4" || a.internal) continue;
      const ip = a.address.split(".").map(Number);
      const mask = a.netmask.split(".").map(Number);
      out.push(ip.map((o, i) => o | ~mask[i] & 255).join("."));
    }
  }
  return out;
}
class LanNode {
  constructor(me, handlers = {}, timing = {}) {
    this.udp = null;
    this.server = null;
    this.tcpPort = 0;
    this.links = /* @__PURE__ */ new Map();
    this.dialing = /* @__PURE__ */ new Set();
    this.peers = /* @__PURE__ */ new Map();
    this.me = me;
    this.h = handlers;
    this.helloMs = timing.helloMs ?? HELLO_MS;
    this.timeoutMs = timing.timeoutMs ?? TIMEOUT_MS;
  }
  /** Pet identity follows renames and level-ups. */
  setIdentity(init) {
    this.me = { ...this.me, ...init };
    this.hello();
  }
  async start() {
    this.server = createServer((c) => this.accept(c));
    await new Promise((res, rej) => {
      this.server.once("error", rej);
      this.server.listen(0, () => res());
    });
    this.tcpPort = this.server.address().port;
    const udp = createSocket({ type: "udp4", reuseAddr: true });
    this.udp = udp;
    udp.on("error", (e) => console.error("lan udp error:", e));
    udp.on("message", (buf, rinfo) => this.onDatagram(buf, rinfo.address));
    await new Promise((res, rej) => {
      udp.once("error", rej);
      udp.bind(UDP_PORT, () => res());
    });
    udp.setBroadcast(true);
    this.helloTimer = setInterval(() => this.hello(), this.helloMs);
    this.sweepTimer = setInterval(() => this.sweep(), this.helloMs);
    this.hello();
    setTimeout(() => this.hello(), 300).unref();
    setTimeout(() => this.hello(), 900).unref();
  }
  /** Graceful leave: peers hear `bye` instead of waiting out the timeout. */
  stop() {
    clearInterval(this.helloTimer);
    clearInterval(this.sweepTimer);
    const udp = this.udp;
    try {
      udp?.send(line({ t: "bye", id: this.me.id }), UDP_PORT, "255.255.255.255", () => udp.close());
    } catch {
      udp?.close();
    }
    for (const s of this.links.values()) s.destroy();
    this.links.clear();
    this.server?.close();
    this.server = null;
    this.udp = null;
  }
  /** Sends to one pet over its direct link; false when no link carries it. */
  send(toId, body) {
    const s = this.links.get(toId);
    if (!s) return false;
    s.write(line({ t: "msg", body }));
    return true;
  }
  /** Whether this peer has been heard from recently. */
  knows(id) {
    return this.peers.has(id);
  }
  /** Peers heard from recently; a starting renderer seeds itself from this. */
  peersList() {
    return [...this.peers.values()].map(({ peer }) => peer);
  }
  /** Sends to every linked pet. */
  broadcast(body) {
    for (const s of this.links.values()) s.write(line({ t: "msg", body }));
  }
  hello() {
    const pkt = { t: "hello", v: 1, tcp: this.tcpPort, ...this.me };
    const data = line(pkt);
    const udp = this.udp;
    if (!udp) return;
    const to = (addr) => {
      udp.send(data, UDP_PORT, addr, () => {
      });
    };
    to("255.255.255.255");
    for (const b of broadcastAddrs()) to(b);
    for (const { peer } of this.peers.values()) to(peer.addr);
  }
  onDatagram(buf, addr) {
    let pkt;
    try {
      pkt = JSON.parse(buf.toString("utf8"));
    } catch {
      return;
    }
    if (!("id" in pkt) || pkt.id === this.me.id) return;
    if (pkt.t === "bye") {
      this.drop(pkt.id);
      return;
    }
    if (pkt.t !== "hello") return;
    const seen = this.peers.get(pkt.id);
    const peer = { id: pkt.id, name: pkt.name, host: pkt.host, sex: pkt.sex, level: pkt.level, addr };
    this.peers.set(pkt.id, { peer, tcp: pkt.tcp, lastSeen: Date.now() });
    if (seen) return;
    this.h.online?.(peer);
    this.link(peer, pkt.tcp);
  }
  sweep() {
    const now2 = Date.now();
    for (const [id, { peer, tcp, lastSeen }] of this.peers) {
      if (!this.links.has(id) && now2 - lastSeen < this.timeoutMs) this.link(peer, tcp);
      if (now2 - lastSeen < this.timeoutMs) continue;
      this.peers.delete(id);
      this.links.get(id)?.destroy();
      this.links.delete(id);
      this.h.offline?.(peer);
    }
  }
  drop(id) {
    const seen = this.peers.get(id);
    if (!seen) return;
    this.peers.delete(id);
    this.links.get(id)?.destroy();
    this.links.delete(id);
    this.h.offline?.(seen.peer);
  }
  /** Dials whenever the link is missing (both ends may try; the reader keeps one). */
  link(peer, tcp) {
    if (this.links.has(peer.id) || this.dialing.has(peer.id)) return;
    this.dialing.add(peer.id);
    const sock = connect(tcp, peer.addr);
    sock.on("error", (e) => {
      console.error(`[lan] dial ${peer.name} failed:`, e.message);
      sock.destroy();
    });
    sock.once("connect", () => {
      sock.write(line({ t: "hello", v: 1, tcp: this.tcpPort, ...this.me }));
      if (!this.links.has(peer.id)) {
        this.links.set(peer.id, sock);
        console.log(`[lan] link up: ${peer.name}`);
        this.h.linked?.(peer.id);
      }
    });
    sock.once("close", () => this.dialing.delete(peer.id));
    this.reader(sock, (id) => id ?? peer.id);
    sock.setKeepAlive(true, PING_MS);
  }
  accept(sock) {
    sock.on("error", () => sock.destroy());
    this.reader(sock, (id) => id);
    sock.setKeepAlive(true, PING_MS);
  }
  /** Reads newline-delimited JSON; the `hello` line binds the socket to a peer id. */
  reader(sock, idOf) {
    let id;
    let buf = "";
    sock.on("data", (data) => {
      buf += data.toString("utf8");
      if (buf.length > MAX_LINE && buf.indexOf("\n") < 0) return sock.destroy();
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const text = buf.slice(0, i);
        buf = buf.slice(i + 1);
        if (!text) continue;
        let pkt;
        try {
          pkt = JSON.parse(text);
        } catch {
          continue;
        }
        if (pkt.t === "hello") {
          id = pkt.id;
          if (id === this.me.id) return sock.destroy();
          const prev = this.links.get(id);
          if (prev && prev !== sock) return sock.destroy();
          this.links.set(id, sock);
          console.log(`[lan] link up: ${id}`);
          this.h.linked?.(id);
          continue;
        }
        const from = idOf(id);
        if (!from) return sock.destroy();
        if (pkt.t === "msg") {
          console.log("[lan] msg", from, pkt.body?.t ?? "?");
          this.h.message?.(from, pkt.body);
        }
      }
    });
    sock.on("close", () => {
      const bound = idOf(id);
      if (bound && this.links.get(bound) === sock) this.links.delete(bound);
    });
  }
}
const WEBHOOK_DEFAULT_SECONDS = 30;
const MAX_SECONDS = 3600;
const MAX_TEXT = 500;
const first = (o, keys) => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
};
function parseHook(body, contentType, fields) {
  let o = { ...fields };
  const text = body.trim();
  if (text) {
    if (/json/i.test(contentType) || /^[{[]/.test(text)) {
      try {
        const j = JSON.parse(text);
        if (j && typeof j === "object" && !Array.isArray(j)) o = { ...o, ...j };
        else return null;
      } catch {
        return null;
      }
    } else if (/x-www-form-urlencoded/i.test(contentType)) o = { ...o, ...Object.fromEntries(new URLSearchParams(text)) };
    else o.text = text;
  }
  const msg = first(o, ["text", "message", "msg", "content", "body"]);
  if (!msg) return null;
  const link = first(o, ["url", "link"]);
  const d = Number(first(o, ["duration", "seconds"]));
  return {
    text: msg.slice(0, MAX_TEXT),
    title: first(o, ["title", "subject"])?.slice(0, 60),
    url: link && /^https?:\/\//i.test(link) ? link : void 0,
    duration: Number.isFinite(d) && d >= 0 ? Math.min(d, MAX_SECONDS) : WEBHOOK_DEFAULT_SECONDS
  };
}
function sameToken(a, b) {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
const MAX_BODY = 16 * 1024;
const MAX_PER_MINUTE = 30;
class WebhookServer {
  constructor(deliver) {
    this.deliver = deliver;
    this.recent = [];
  }
  get running() {
    return !!this.server;
  }
  start(port, token) {
    this.stop();
    return new Promise((resolve, reject) => {
      const s = createServer$1((req, res) => {
        const reply = (code, msg) => {
          res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: code === 200, msg }));
        };
        const url = new URL(req.url ?? "/", "http://localhost");
        if (url.pathname !== "/hook") return reply(404, "not found");
        if (req.method !== "POST" && req.method !== "GET") return reply(405, "method not allowed");
        const auth = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization ?? ""))?.[1];
        const supplied = auth ?? (String(req.headers["x-token"] ?? "") || (url.searchParams.get("token") ?? ""));
        if (!sameToken(supplied, token)) return reply(401, "bad token");
        const chunks = [];
        let size = 0;
        let dead = false;
        req.on("data", (c) => {
          size += c.length;
          if (size > MAX_BODY) {
            dead = true;
            reply(413, "too large");
            req.destroy();
          } else chunks.push(c);
        });
        req.on("end", () => {
          if (dead) return;
          const fields = {};
          url.searchParams.forEach((v, k) => k !== "token" && (fields[k] = v));
          const m = parseHook(Buffer.concat(chunks).toString("utf8"), String(req.headers["content-type"] ?? ""), fields);
          if (!m) return reply(400, "need text");
          const now2 = Date.now();
          this.recent = this.recent.filter((t) => now2 - t < 6e4);
          if (this.recent.length >= MAX_PER_MINUTE) return reply(429, "too many");
          this.recent.push(now2);
          this.deliver(m);
          reply(200, "delivered");
        });
      });
      s.once("error", reject);
      s.listen(port, "127.0.0.1", () => {
        s.removeListener("error", reject);
        s.on("error", (e) => console.error("webhook error:", e));
        this.server = s;
        resolve();
      });
    });
  }
  stop() {
    this.server?.close();
    this.server?.closeAllConnections();
    this.server = void 0;
  }
}
class VisitQueue {
  constructor(dir) {
    this.items = [];
    this.file = join(dir, "visit-queue.json");
    try {
      if (existsSync(this.file)) this.items = JSON.parse(readFileSync(this.file, "utf8"));
    } catch {
      this.items = [];
    }
  }
  add(toId, body) {
    this.items.push({ toId, body });
    this.save();
  }
  /** The queued deliveries for one peer, removing them. */
  take(toId) {
    const mine = this.items.filter((q) => q.toId === toId);
    if (mine.length) {
      this.items = this.items.filter((q) => q.toId !== toId);
      this.save();
    }
    return mine.map((q) => q.body);
  }
  save() {
    try {
      writeFileSync(this.file, JSON.stringify(this.items));
    } catch (e) {
      console.error("visit queue save failed:", e);
    }
  }
}
const memFile = () => join(app.getPath("userData"), "memory.md");
const histFile = () => join(app.getPath("userData"), "chat-history.json");
function loadMemory() {
  try {
    if (!existsSync(memFile())) return [];
    return readFileSync(memFile(), "utf8").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- "));
  } catch {
    return [];
  }
}
function addFacts(lines) {
  const have = new Set(loadMemory());
  const add = lines.map((l) => l.trim()).filter((l) => l && !have.has(l));
  if (!add.length) return;
  atomicWrite(memFile(), [...loadMemory(), ...add].map((l) => `${l}
`).join(""));
}
function clearMemory() {
  atomicWrite(memFile(), "");
}
function rewriteFacts(lines) {
  atomicWrite(memFile(), lines.map((l) => `${l.trim()}
`).join(""));
}
function loadHistory() {
  try {
    if (!existsSync(histFile())) return [];
    const v = JSON.parse(readFileSync(histFile(), "utf8"));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function saveHistory(turns) {
  atomicWrite(histFile(), JSON.stringify(turns));
}
const dialogueFile = () => join(app.getPath("userData"), "dialogue-state.json");
function loadDialogueState() {
  try {
    if (!existsSync(dialogueFile())) return { dialogue: [], sinceMemo: 0 };
    const v = JSON.parse(readFileSync(dialogueFile(), "utf8"));
    return {
      dialogue: Array.isArray(v.dialogue) ? v.dialogue : [],
      sinceMemo: typeof v.sinceMemo === "number" ? v.sinceMemo : 0
    };
  } catch {
    return { dialogue: [], sinceMemo: 0 };
  }
}
function saveDialogueState(state) {
  atomicWrite(dialogueFile(), JSON.stringify({ dialogue: state.dialogue, sinceMemo: state.sinceMemo }));
}
const DEFAULT_HOTKEY = "LeftAlt*2";
const NAMED = {
  Ctrl: 17,
  LeftCtrl: 162,
  RightCtrl: 163,
  Alt: 18,
  LeftAlt: 164,
  RightAlt: 165,
  Shift: 16,
  LeftShift: 160,
  RightShift: 161,
  Win: 91,
  RightWin: 92,
  Space: 32,
  Tab: 9,
  CapsLock: 20,
  Backquote: 192,
  Enter: 13,
  Insert: 45,
  Delete: 46,
  Home: 36,
  End: 35,
  PageUp: 33,
  PageDown: 34,
  Mouse3: 4,
  Mouse4: 5,
  Mouse5: 6
};
function parseHotkey(hotkey) {
  const m = /^(.*?)\s*\*\s*([1-3])$/.exec(hotkey.trim());
  const combo = m ? m[1] : hotkey.trim();
  const taps = m ? Number(m[2]) : 1;
  const parts = combo.split("+").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  const codes = [];
  for (const p of parts) {
    let vk = NAMED[p];
    if (vk === void 0 && /^[A-Z0-9]$/.test(p)) vk = p.charCodeAt(0);
    const fn = /^F([1-9]|1\d|2[0-4])$/.exec(p);
    if (vk === void 0 && fn) vk = 111 + Number(fn[1]);
    if (vk === void 0) return null;
    codes.push(vk);
  }
  return { keys: codes, taps };
}
const TAP_MAX_MS = 300;
const TAP_GAP_MS = 400;
function tapTracker(taps, onChange, onTap = () => {
}) {
  let count = 0, lastUp = 0, pressAt = 0, active = false;
  return (down, now2) => {
    if (down) {
      if (count && now2 - lastUp > TAP_GAP_MS) count = 0;
      if (count === taps - 1) {
        count = 0;
        active = true;
        onChange(true);
        return;
      }
      pressAt = now2;
      return;
    }
    if (active) {
      active = false;
      onChange(false);
      return;
    }
    if (now2 - pressAt <= TAP_MAX_MS) {
      count++;
      lastUp = now2;
      onTap(count);
    } else count = 0;
  };
}
async function watchHotkey(hotkey, onChange, pollMs = 30, onTap) {
  if (process.platform !== "win32") return "语音热键目前只支持 Windows";
  let getKey;
  try {
    const koffi = createRequire(import.meta.url)("koffi").default;
    getKey = koffi.load("user32.dll").func("short __stdcall GetAsyncKeyState(int vKey)");
  } catch (err) {
    return `无法读取键盘：${err.message}`;
  }
  const { keys, taps } = hotkey;
  const step = tapTracker(taps, onChange, onTap);
  let down = false;
  const timer = setInterval(() => {
    const now2 = keys.every((vk) => (getKey(vk) & 32768) !== 0);
    if (now2 === down) return;
    down = now2;
    step(now2, Date.now());
  }, pollMs);
  return { stop: () => clearInterval(timer) };
}
const SAMPLE_RATE = 16e3;
const load = () => createRequire(import.meta.url)("sherpa-onnx-node");
const asrRoot = () => join(resourcesRoot, "asr");
const PARA = () => join(asrRoot(), "paraformer-zh-2025-10-07");
const PUNCT = () => join(asrRoot(), "punct-ct-transformer");
let rec = null;
let recPromise = null;
let punct = null;
let punctTried = false;
let detail = "";
async function recognizer() {
  if (rec) return rec;
  recPromise ??= (async () => {
    const model = join(PARA(), "model.int8.onnx");
    const tokens = join(PARA(), "tokens.txt");
    if (!existsSync(model) || !existsSync(tokens)) {
      detail = "识别模型缺失（resources/asr）";
      return null;
    }
    try {
      rec = await load().OfflineRecognizer.createAsync({
        featConfig: { sampleRate: SAMPLE_RATE, featureDim: 80 },
        modelConfig: { paraformer: { model, tokens }, tokens, numThreads: 4, provider: "cpu", debug: 0 }
      });
      detail = "";
      return rec;
    } catch (e) {
      detail = `识别模型载入失败：${e.message}`;
      return null;
    }
  })();
  return recPromise;
}
function addPunctuation(text) {
  if (!text) return text;
  try {
    if (!punct && !punctTried) {
      punctTried = true;
      const ct = join(PUNCT(), "model.onnx");
      if (existsSync(ct)) {
        const S = load();
        punct = new S.OfflinePunctuation({ model: { ctTransformer: ct, numThreads: 4, provider: "cpu", debug: 0 } });
      }
    }
    const p = punct;
    return p ? p.addPunct(text) : text;
  } catch {
    return text;
  }
}
async function transcribe(samples, sampleRate = SAMPLE_RATE) {
  const r = await recognizer();
  if (!r) throw new Error(detail || "识别未就绪");
  const stream = r.createStream();
  stream.acceptWaveform({ sampleRate, samples });
  const out = await r.decodeAsync(stream);
  return addPunctuation((out.text ?? "").trim());
}
function preloadAsr() {
  void recognizer();
}
if (process.env.QQPET_USER_DATA) app.setPath("userData", process.env.QQPET_USER_DATA);
const toX11 = process.platform === "linux" && !!process.env.DISPLAY && app.commandLine.getSwitchValue("ozone-platform") === "wayland" && !process.argv.some((a) => a.startsWith("--ozone-platform"));
if (toX11) {
  spawnSelf(["--ozone-platform=x11"]);
  app.exit(0);
} else if (!app.requestSingleInstanceLock()) app.exit(0);
registerScheme();
app.whenReady().then(() => {
  handleScheme();
  registerPackIpc();
  if (contentMissing()) return void openFirstRun();
  app.dock?.hide();
  loadSave();
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb, details) => {
    if (permission !== "media") return cb(true);
    const types = details.mediaTypes ?? [];
    cb(wc === win.webContents && types.length > 0 && types.every((t) => t === "audio"));
  });
  if (getSave().settings.hd) {
    session.defaultSession.webRequest.onBeforeSendHeaders((d, cb) => cb({ requestHeaders: { ...d.requestHeaders, "X-HD": "1" } }));
  }
  const win = createPetWindow();
  const petInit = () => {
    const s = getSave();
    return { name: s.petInfo.name, host: s.petInfo.host, sex: s.petInfo.sex, level: s.petComputedlInfo.level };
  };
  const lan = new LanNode(
    { id: persistedLanId(app.getPath("userData")), ...petInit() },
    {
      online: (p) => {
        console.log(`[lan] ${p.name}(${p.host}) 出来玩了`);
        win.webContents.send(IPC.lanOnline, p);
      },
      linked: (id) => {
        for (const body of visits.take(id)) if (!lan.send(id, body)) visits.add(id, body);
      },
      offline: (p) => {
        console.log(`[lan] ${p.name}(${p.host}) 回家了`);
        win.webContents.send(IPC.lanOffline, p);
      },
      message: (fromId, body) => win.webContents.send(IPC.lanMessage, fromId, body)
    }
  );
  const visits = new VisitQueue(app.getPath("userData"));
  ipcMain.handle(IPC.lanSend, (_e, toId, body) => {
    if (body?.t?.startsWith("visit")) {
      if (lan.send(toId, body)) return "sent";
      visits.add(toId, body);
      return "queued";
    }
    lan.send(toId, body);
    return "sent";
  });
  ipcMain.handle(IPC.lanPeers, () => lan.peersList());
  ipcMain.handle(IPC.memLoad, () => ({ memory: loadMemory(), history: loadHistory() }));
  ipcMain.on(IPC.memFacts, (_e, lines) => {
    if (Array.isArray(lines)) addFacts(lines);
  });
  ipcMain.on(IPC.memRewrite, (_e, lines) => {
    if (Array.isArray(lines)) rewriteFacts(lines);
  });
  ipcMain.handle(IPC.memDialogueLoad, () => loadDialogueState());
  ipcMain.on(IPC.memDialogueSave, (_e, state) => {
    if (state && Array.isArray(state.dialogue)) saveDialogueState(state);
  });
  ipcMain.on(IPC.memHistory, (_e, turns) => {
    if (Array.isArray(turns)) saveHistory(turns);
  });
  ipcMain.on(IPC.memClear, () => clearMemory());
  ipcMain.on(IPC.voiceAudio, (_e, samples) => {
    void transcribe(samples).then((text) => win.webContents.send(IPC.voiceText, text)).catch((e) => win.webContents.send(IPC.voiceError, String(e.message)));
  });
  let partBusy = false;
  ipcMain.on(IPC.voicePart, (_e, samples) => {
    if (partBusy) return;
    partBusy = true;
    void transcribe(samples).then((text) => {
      if (text) win.webContents.send(IPC.voicePartial, text);
    }).catch(() => {
    }).finally(() => partBusy = false);
  });
  let talkKey;
  const startVoice = () => {
    if (talkKey) return;
    const hot = parseHotkey(DEFAULT_HOTKEY);
    if (!hot) return;
    void watchHotkey(hot, (down) => {
      if (!win.isDestroyed()) win.webContents.send(down ? IPC.voiceStart : IPC.voiceStop);
    }).then((w) => {
      if (typeof w === "string") return console.error("[voice]", w);
      talkKey = w;
      preloadAsr();
    });
  };
  const stopVoice = () => {
    talkKey?.stop();
    talkKey = void 0;
  };
  if (getSave().settings.voice) startVoice();
  let lanOn = false;
  const startLan = () => {
    if (lanOn || !getSave().settings.lan || !getSave().havePet) return;
    lanOn = true;
    void lan.start().catch((e) => console.error("lan start failed:", e));
  };
  startLan();
  let webhookError;
  const webhook = new WebhookServer((m) => win.webContents.send(IPC.webhook, m));
  const syncWebhook = () => {
    const s = getSave().settings;
    webhook.stop();
    webhookError = void 0;
    if (!s.webhook || !s.webhookToken || !getSave().havePet) return;
    webhook.start(s.webhookPort, s.webhookToken).catch((e) => {
      webhookError = e.code === "EADDRINUSE" ? `端口 ${s.webhookPort} 已被占用` : String(e.message);
      console.error("webhook start failed:", e);
    });
  };
  syncWebhook();
  ipcMain.handle(IPC.webhookState, () => ({ running: webhook.running, error: webhookError }));
  const tray = createPetTray((click) => {
    let focusTaken = false;
    if (process.platform === "win32" && click.kind === "state" && getSave().havePet) {
      focusTaken = !win.isFocusable();
      if (focusTaken) win.setFocusable(true);
      win.focus();
    }
    const b = win.getBounds();
    const z = getSave().settings.zoom;
    const message = { ...click, focusTaken };
    win.webContents.send(IPC.trayClick, click.x === void 0 ? message : { ...message, x: (click.x - b.x) / z, y: (click.y - b.y) / z });
  }, () => {
    if (!win.isDestroyed()) win.webContents.send(IPC.trayHoverLeave);
  });
  app.on("before-quit", () => {
    tray.destroy();
    lan.stop();
    webhook.stop();
  });
  ipcMain.on(IPC.trayMenu, (event, items) => {
    if (event.sender !== win.webContents) return;
    tray.popupMenu(items, (action) => {
      if (!win.isDestroyed()) win.webContents.send(IPC.trayMenuAction, action);
    });
  });
  let copied = "";
  void clipboard.readText().then((t) => copied = t);
  setInterval(async () => {
    const text = await clipboard.readText();
    if (text === copied) return;
    copied = text;
    if (text.trim() && getSave().settings.clip) win.webContents.send(IPC.clipboard, text);
  }, 500);
  ipcMain.handle(IPC.load, () => getSave());
  ipcMain.on(IPC.save, (_e, patch) => {
    patchSave(patch);
    if (patch.petInfo) {
      tray.retip(getSave().petInfo);
      lan.setIdentity(petInit());
      startLan();
    }
    if (patch.settings?.hd !== void 0) tray.setState(getSave());
    if (patch.settings?.zoom !== void 0) win.webContents.setZoomFactor(getSave().settings.zoom);
    if (patch.settings?.watchApp !== void 0) watchFront(getSave().settings.watchApp);
    if (patch.settings?.lan !== void 0) {
      if (patch.settings.lan) startLan();
      else {
        lan.stop();
        lanOn = false;
      }
    }
    const hook = patch.settings;
    if (hook && (hook.webhook !== void 0 || hook.webhookPort !== void 0 || hook.webhookToken !== void 0)) syncWebhook();
    if (patch.settings?.voice !== void 0) (patch.settings.voice ? startVoice : stopVoice)();
  });
  ipcMain.on(IPC.resetPet, (_e, sex) => {
    resetSave(sex);
    relaunch();
  });
  ipcMain.handle(IPC.exportSave, async () => {
    const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const r = await dialog.showSaveDialog(win, { defaultPath: `QQPet-${day}.json`, filters: [{ name: "QQ宠物存档", extensions: ["json"] }] });
    if (r.canceled || !r.filePath) return false;
    exportSave(r.filePath);
    return true;
  });
  ipcMain.handle(IPC.importSave, async () => {
    const r = await dialog.showOpenDialog(win, { properties: ["openFile"], filters: [{ name: "QQ宠物存档", extensions: ["json"] }] });
    if (r.canceled) return;
    importSave(r.filePaths[0]);
    relaunch();
  });
  ipcMain.handle(IPC.calendar, () => calendar(net.fetch));
  ipcMain.handle(IPC.aiModels, (_e, c) => aiModels(net.fetch, c));
  ipcMain.handle(IPC.aiChat, (_e, c, messages) => aiChat(net.fetch, c, messages));
  ipcMain.handle(IPC.webSearch, (_e, query) => webSearch(net.fetch, query, 6, getSave().settings.searchBackend, getSave().settings.searchKey));
  ipcMain.handle(IPC.weather, (_e, city) => weather(net.fetch, city));
  ipcMain.handle(IPC.latestRelease, () => latestRelease(net.fetch));
  let panel = false;
  ipcMain.on(IPC.openGame, (_e, swf) => {
    const start = Date.now();
    openGameWindow(swf, panel ? win : void 0).on("closed", () => win.isDestroyed() || win.webContents.send(IPC.gamePlayed, (Date.now() - start) / 6e4));
  });
  ipcMain.on(IPC.quit, () => app.quit());
  ipcMain.on(IPC.copyText, (_e, text) => clipboard.writeText(text));
  ipcMain.on(IPC.openUrl, (_e, url) => /^https?:\/\//.test(url) && void shell$1.openExternal(url));
  ipcMain.on(IPC.setClickThrough, (_e, on) => process.platform === "linux" || win.setIgnoreMouseEvents(on));
  ipcMain.on(IPC.setHitShape, (e, rects) => {
    if (process.platform !== "linux" || e.sender !== win.webContents || !Array.isArray(rects)) return;
    const { width, height } = win.getContentBounds();
    win.setShape(toShape(rects, win.webContents.getZoomFactor(), width, height));
  });
  let lowered = false;
  ipcMain.on(IPC.setAlwaysOnTop, (_e, on) => {
    lowered = !on;
    win.setAlwaysOnTop(on, "screen-saver");
  });
  ipcMain.on(IPC.setFocusable, (_e, on) => {
    panel = on;
    win.setFocusable(on);
    if (process.platform === "darwin") win.setAlwaysOnTop(!lowered, on ? "floating" : "screen-saver");
    if (on) {
      if (process.platform === "darwin") app.focus({ steal: true });
      win.focus();
    }
  });
  ipcMain.on(IPC.setAutoStart, (_e, on) => app.setLoginItemSettings({ openAtLogin: on }));
  ipcMain.on(IPC.setTrayState, (_e, state) => tray.setState(getSave(), state));
  const AWAY_S = 300;
  let away = false;
  const presence = (on) => {
    if (on === away) return;
    away = on;
    win.webContents.send(IPC.presence, away);
  };
  setInterval(() => presence(powerMonitor.getSystemIdleTime() >= AWAY_S), 5e3);
  powerMonitor.on("lock-screen", () => presence(true));
  powerMonitor.on("unlock-screen", () => presence(false));
  powerMonitor.on("suspend", () => presence(true));
  powerMonitor.on("resume", () => presence(false));
  let frontTimer;
  let lastFront = "";
  const watchFront = (on) => {
    clearInterval(frontTimer);
    frontTimer = void 0;
    lastFront = "";
    if (!on) return;
    const tick = () => {
      void frontName().then((name) => {
        if (!name || name === lastFront) return;
        lastFront = name;
        win.webContents.send(IPC.front, name);
      });
    };
    tick();
    frontTimer = setInterval(tick, 15e3);
  };
  watchFront(getSave().settings.watchApp);
});
app.on("window-all-closed", () => app.quit());
