"use strict";
const electron = require("electron");
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
const send = (channel) => (arg) => electron.ipcRenderer.send(channel, arg);
const api = {
  load: () => electron.ipcRenderer.invoke(IPC.load),
  save: send(IPC.save),
  resetPet: send(IPC.resetPet),
  exportSave: () => electron.ipcRenderer.invoke(IPC.exportSave),
  importSave: () => electron.ipcRenderer.invoke(IPC.importSave),
  openGame: send(IPC.openGame),
  calendar: () => electron.ipcRenderer.invoke(IPC.calendar),
  aiModels: (c) => electron.ipcRenderer.invoke(IPC.aiModels, c),
  aiChat: (c, messages) => electron.ipcRenderer.invoke(IPC.aiChat, c, messages),
  webSearch: (query) => electron.ipcRenderer.invoke(IPC.webSearch, query),
  weather: (city) => electron.ipcRenderer.invoke(IPC.weather, city),
  latestRelease: () => electron.ipcRenderer.invoke(IPC.latestRelease),
  packs: {
    info: () => electron.ipcRenderer.invoke(IPC.packInfo),
    importPack: () => electron.ipcRenderer.invoke(IPC.importPack),
    reset: () => electron.ipcRenderer.invoke(IPC.resetPacks),
    find: () => electron.ipcRenderer.invoke(IPC.findPack),
    findFull: (mirror) => electron.ipcRenderer.invoke(IPC.findFullPack, mirror),
    download: (mirror) => electron.ipcRenderer.invoke(IPC.downloadPack, mirror),
    onProgress: (listener) => {
      electron.ipcRenderer.removeAllListeners(IPC.packProgress);
      electron.ipcRenderer.on(IPC.packProgress, (_e, p) => listener(p));
    },
    relaunch: () => electron.ipcRenderer.send(IPC.relaunch)
  },
  quit: send(IPC.quit),
  copyText: send(IPC.copyText),
  openUrl: send(IPC.openUrl),
  setClickThrough: send(IPC.setClickThrough),
  ...process.platform === "linux" && { setHitShape: send(IPC.setHitShape) },
  setAlwaysOnTop: send(IPC.setAlwaysOnTop),
  setFocusable: send(IPC.setFocusable),
  setAutoStart: send(IPC.setAutoStart),
  setTrayState: send(IPC.setTrayState),
  ...process.platform === "darwin" && {
    popupTrayMenu: send(IPC.trayMenu),
    onTrayMenuAction: (listener) => electron.ipcRenderer.on(IPC.trayMenuAction, (_e, action) => listener(action))
  },
  setDragging: (on) => electron.ipcRenderer.invoke(IPC.setDragging, on),
  onCursor: (listener) => electron.ipcRenderer.on(IPC.cursor, (_e, p) => listener(p)),
  onTrayClick: (listener) => electron.ipcRenderer.on(IPC.trayClick, (_e, c) => listener(c)),
  onTrayHoverLeave: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.trayHoverLeave);
    electron.ipcRenderer.on(IPC.trayHoverLeave, () => listener());
  },
  onGamePlayed: (listener) => electron.ipcRenderer.on(IPC.gamePlayed, (_e, m) => listener(m)),
  onClipboard: (listener) => electron.ipcRenderer.on(IPC.clipboard, (_e, text) => listener(text)),
  onPresence: (listener) => electron.ipcRenderer.on(IPC.presence, (_e, away) => listener(away)),
  onFront: (listener) => electron.ipcRenderer.on(IPC.front, (_e, name) => listener(name)),
  // The preload outlives page reloads: replace per channel, never stack.
  onLanOnline: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.lanOnline);
    electron.ipcRenderer.on(IPC.lanOnline, (_e, p) => listener(p));
  },
  onLanOffline: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.lanOffline);
    electron.ipcRenderer.on(IPC.lanOffline, (_e, p) => listener(p));
  },
  onLanMessage: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.lanMessage);
    electron.ipcRenderer.on(IPC.lanMessage, (_e, fromId, body) => listener(fromId, body));
  },
  onWebhook: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.webhook);
    electron.ipcRenderer.on(IPC.webhook, (_e, m) => listener(m));
  },
  webhookState: () => electron.ipcRenderer.invoke(IPC.webhookState),
  lanSend: (toId, body) => electron.ipcRenderer.invoke(IPC.lanSend, toId, body),
  lanPeers: () => electron.ipcRenderer.invoke(IPC.lanPeers),
  memLoad: () => electron.ipcRenderer.invoke(IPC.memLoad),
  memFacts: (lines) => electron.ipcRenderer.send(IPC.memFacts, lines),
  memRewrite: (lines) => electron.ipcRenderer.send(IPC.memRewrite, lines),
  memDialogueLoad: () => electron.ipcRenderer.invoke(IPC.memDialogueLoad),
  memDialogueSave: (state) => electron.ipcRenderer.send(IPC.memDialogueSave, state),
  memHistory: (turns) => electron.ipcRenderer.send(IPC.memHistory, turns),
  memClear: () => electron.ipcRenderer.send(IPC.memClear),
  voiceAudio: (samples) => electron.ipcRenderer.send(IPC.voiceAudio, samples),
  voicePart: (samples) => electron.ipcRenderer.send(IPC.voicePart, samples),
  onVoicePartial: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.voicePartial);
    electron.ipcRenderer.on(IPC.voicePartial, (_e, text) => listener(text));
  },
  onVoiceStart: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.voiceStart);
    electron.ipcRenderer.on(IPC.voiceStart, () => listener());
  },
  onVoiceStop: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.voiceStop);
    electron.ipcRenderer.on(IPC.voiceStop, () => listener());
  },
  onVoiceText: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.voiceText);
    electron.ipcRenderer.on(IPC.voiceText, (_e, text) => listener(text));
  },
  onVoiceError: (listener) => {
    electron.ipcRenderer.removeAllListeners(IPC.voiceError);
    electron.ipcRenderer.on(IPC.voiceError, (_e, message) => listener(message));
  }
};
electron.contextBridge.exposeInMainWorld("qqpet", api);
