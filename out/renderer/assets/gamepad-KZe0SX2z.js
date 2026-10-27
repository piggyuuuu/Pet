function readPlayerPanic(player) {
  const root = player.shadowRoot;
  const details = root?.querySelector("#panic-details-content textarea")?.value;
  if (!details?.trim()) return null;
  return {
    url: player.dataset.swf ?? null,
    title: (root?.querySelector("#panic-title")?.textContent ?? "").slice(0, 512),
    body: (root?.querySelector("#panic-body")?.textContent ?? "").slice(0, 2048),
    details: details.slice(0, 32768)
  };
}
function isFatalRufflePanic(panic) {
  if (!panic.details.trim()) return false;
  const name = /^Error name: (.*)$/m.exec(panic.details)?.[1]?.trim();
  const message = /^Error message: (.*)$/m.exec(panic.details)?.[1]?.trim() ?? "";
  if (name === "AbortError" || /^(?:Failed to begin SWF load: )?(?:Error: )?AbortError\b/.test(message)) return false;
  return !/^(?:Failed to fetch\b|Not a valid swf:|Invalid options:)/.test(message);
}
const FONT = "HappyZcool-2016";
const BASE = new URL("./", location.href).href;
const CONFIG = {
  base: BASE,
  wmode: "transparent",
  backgroundColor: null,
  autoplay: "on",
  splashScreen: false,
  unmuteOverlay: "hidden",
  contextMenu: "off",
  letterbox: "off",
  allowScriptAccess: true,
  // Ruffle ships no CJK glyphs; without this every Chinese text field is blank.
  fontSources: [BASE + "pet/qqfont.ttf"],
  defaultFonts: { sans: [FONT], serif: [FONT], typewriter: [FONT] },
  logLevel: "error"
};
let constructingListeners = null;
function createRuffleElement(parent) {
  const document2 = parent.ownerDocument;
  const listeners = [];
  const restore = [];
  const previous = constructingListeners;
  const cleanup = () => {
    for (const entry of listeners.splice(0)) entry.remove.call(entry.target, entry.type, entry.listener, entry.capture);
  };
  let el;
  constructingListeners = listeners;
  try {
    for (const target of /* @__PURE__ */ new Set([document2, document2.documentElement, document2.defaultView])) {
      if (!target || typeof target.addEventListener !== "function") continue;
      const descriptor = Object.getOwnPropertyDescriptor(target, "addEventListener");
      const add = target.addEventListener;
      const remove = target.removeEventListener;
      const wrapped = function(type, listener, options) {
        add.call(this, type, listener, options);
        if (this === target && listener && constructingListeners === listeners)
          listeners.push({ target, type, listener, capture: typeof options === "boolean" ? options : Boolean(options?.capture), remove });
      };
      Object.defineProperty(target, "addEventListener", { configurable: true, writable: true, value: wrapped });
      restore.push(() => {
        if (descriptor) Object.defineProperty(target, "addEventListener", descriptor);
        else Reflect.deleteProperty(target, "addEventListener");
      });
    }
    el = document2.defaultView.RufflePlayer.newest().createPlayer();
    el.style.width = "100%";
    el.style.height = "100%";
    parent.appendChild(el);
    safari14Styles(el);
    return { el, cleanup };
  } catch (error) {
    cleanup();
    el?.remove();
    throw error;
  } finally {
    for (const undo of restore.reverse()) undo();
    constructingListeners = previous;
  }
}
const players = /* @__PURE__ */ new Set();
const LOAD_MS = 3e4;
const CALLBACK_MS = 1e4;
const RECOVERY_WINDOW_MS = 3e4;
const RECOVERY_LIMIT = 3;
let hostPaused = Boolean(window.__qqpetHostPaused);
function setHostPaused(paused) {
  hostPaused = paused;
  window.__qqpetHostPaused = paused;
  if (paused) window.__qqpetInput?.({ phase: "cancel", id: -1, x: 0, y: 0 });
  for (const player of players) player.pauseForHost(paused);
}
window.__qqpetSetPaused = setHostPaused;
const removed = new MutationObserver(() => {
  for (const player of players) {
    const frame = player.el.ownerDocument.defaultView?.frameElement;
    if (!player.el.isConnected || frame && !frame.isConnected) player.destroy();
  }
});
removed.observe(document.documentElement, { childList: true, subtree: true });
function safari14Styles(el) {
  const shadow = el.shadowRoot;
  if (!shadow || shadow.getElementById("qqpet-safari14")) return;
  const style = el.ownerDocument.createElement("style");
  style.id = "qqpet-safari14";
  style.textContent = "#container,#message-overlay,#panic,#panic-details-modal,#play-button,#splash-screen,#unmute-overlay,#unmute-overlay .background{top:0;right:0;bottom:0;left:0}";
  shadow.appendChild(style);
}
const releasedCanvases = /* @__PURE__ */ new WeakSet();
function releaseRetiredCanvas(canvas) {
  if (!canvas || canvas.isConnected || releasedCanvases.has(canvas)) return;
  try {
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return;
    releasedCanvases.add(canvas);
    if (!gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
  }
}
function releaseRemovedCanvases(records = []) {
  for (const record of records) {
    for (const node of record.removedNodes) {
      if (node.nodeType !== 1) continue;
      const element = node;
      if (element.tagName === "CANVAS") releaseRetiredCanvas(element);
      for (const canvas of element.querySelectorAll("canvas")) releaseRetiredCanvas(canvas);
    }
  }
}
function disposeDetached(el) {
  const canvas = el.shadowRoot?.querySelector("#container > canvas");
  try {
    el.volume = 0;
    el.ruffle().suspend();
    const disconnected = el.disconnectedCallback;
    disconnected?.call(el);
  } catch {
  } finally {
    releaseRetiredCanvas(canvas);
  }
}
class SwfPlayer {
  /** The SWF's ExternalInterface calls go to the globals of the window that owns `parent`. */
  constructor(parent, { recoverContext = false } = {}) {
    this.meta = null;
    this.startedAt = 0;
    this.stoppedAt = null;
    this.callbacks = /* @__PURE__ */ new Set();
    this.muted = false;
    this.volume = 1;
    this.destroyed = false;
    this.revision = 0;
    this.loading = false;
    this.pausedAt = null;
    this.pending = /* @__PURE__ */ new Set();
    this.globalCleanup = () => {
    };
    this.keyboardCleanup = () => {
    };
    this.panicObserver = null;
    this.reportedPanic = false;
    this.canvas = null;
    this.contextCleanup = () => {
    };
    this.lastLoad = null;
    this.callbackArgs = /* @__PURE__ */ new Map();
    this.movie = 0;
    this.recovering = false;
    this.recovery = 0;
    this.recoveryTimes = [];
    this.resumeWaiters = /* @__PURE__ */ new Set();
    this.recoverContext = recoverContext;
    const created = createRuffleElement(parent);
    this.el = created.el;
    this.globalCleanup = created.cleanup;
    try {
      players.add(this);
      if (this.el.shadowRoot) {
        if (recoverContext) {
          const root = this.el.shadowRoot;
          const lost = (event) => this.contextLost(event);
          root.addEventListener("webglcontextlost", lost, true);
          this.contextCleanup = () => root.removeEventListener("webglcontextlost", lost, true);
        }
        this.panicObserver = new MutationObserver((records) => {
          this.publishPanic();
          releaseRemovedCanvases(records);
        });
        this.panicObserver.observe(this.el.shadowRoot, { childList: true, subtree: true, characterData: true });
      }
      const keyboard = this.el.shadowRoot?.getElementById("virtual-keyboard");
      const composing = (e) => {
        if (e.isComposing) e.stopImmediatePropagation();
      };
      if (keyboard) {
        const committed = () => {
          keyboard.dispatchEvent(new Event("input"));
        };
        for (const type of ["input", "keydown", "keyup"]) keyboard.addEventListener(type, composing, true);
        keyboard.addEventListener("compositionend", committed);
        this.keyboardCleanup = () => {
          for (const type of ["input", "keydown", "keyup"]) keyboard.removeEventListener(type, composing, true);
          keyboard.removeEventListener("compositionend", committed);
        };
      }
    } catch (error) {
      this.destroy();
      throw error;
    }
  }
  cancelPending(message) {
    for (const cancel of [...this.pending]) cancel(new Error(message));
  }
  failMovie(url, error, terminal) {
    if (this.destroyed) return;
    const message = error instanceof Error ? error.message : String(error);
    this.cancelPending(message);
    this.destroy();
    window.dispatchEvent(new CustomEvent("qqpet-swf-error", { detail: { url, message, ...terminal ? { terminal } : {} } }));
  }
  contextLost(event) {
    const canvas = event.target;
    const frame = this.el.ownerDocument.defaultView?.frameElement;
    if (this.destroyed || !this.el.isConnected || frame && !frame.isConnected || !canvas?.isConnected || canvas !== this.el.shadowRoot?.querySelector("#container > canvas")) return;
    if (this.loading) {
      this.failMovie(this.el.dataset.swf ?? "", new Error("WebGL context was lost while loading"), this.recovering ? "context-recovery-failed" : void 0);
      return;
    }
    if (!this.meta || !this.lastLoad || canvas !== this.canvas) return;
    const now = performance.now();
    this.recoveryTimes = this.recoveryTimes.filter((at) => now - at < RECOVERY_WINDOW_MS);
    if (this.recoveryTimes.length >= RECOVERY_LIMIT) {
      this.failMovie(this.lastLoad.url, new Error("WebGL context recovery limit exceeded"), "context-recovery-exhausted");
      return;
    }
    this.recoveryTimes.push(now);
    const recovery = ++this.recovery;
    this.recovering = true;
    void this.restoreMovie(this.lastLoad, recovery);
  }
  async waitForResume() {
    if (!hostPaused) return;
    await new Promise((resolve, reject) => {
      const finish = () => {
        this.pending.delete(cancel);
        this.resumeWaiters.delete(resume);
      };
      const resume = () => {
        finish();
        resolve();
      };
      const cancel = (error) => {
        finish();
        reject(error);
      };
      this.pending.add(cancel);
      this.resumeWaiters.add(resume);
    });
  }
  async restoreMovie(request, recovery) {
    const current = () => !this.destroyed && this.recovery === recovery;
    try {
      await this.loadMovie(request.url, request.base, request.options, true);
      const replayed = /* @__PURE__ */ new Map();
      while (current()) {
        const next = [...this.callbackArgs].find(([name2, args2]) => replayed.get(name2) !== args2);
        if (!next) break;
        const [name] = next;
        const host = this.el;
        const ready = await this.waitFor(() => {
          if (typeof host[name] === "function") return host[name];
          return hostPaused ? "paused" : null;
        }, `SWF callback ${name}`, CALLBACK_MS);
        if (!current()) return;
        if (ready === "paused") {
          await this.waitForResume();
          continue;
        }
        const args = this.callbackArgs.get(name);
        if (!args) continue;
        this.callbacks.add(name);
        ready.apply(this.el, args);
        replayed.set(name, args);
      }
      if (!current()) return;
      this.recovering = false;
      if (this.stoppedAt !== null) this.el.ruffle().suspend();
      this.pauseForHost(hostPaused);
    } catch (error) {
      if (current()) this.failMovie(request.url, error, "context-recovery-failed");
    } finally {
      if (this.recovery === recovery) this.recovering = false;
    }
  }
  publishPanic() {
    if (this.destroyed || this.reportedPanic) return;
    const panic = readPlayerPanic(this.el);
    if (!panic) return;
    this.reportedPanic = true;
    window.dispatchEvent(new CustomEvent("qqpet-ruffle-panic", { detail: { ...panic, fatal: isFatalRufflePanic(panic) } }));
  }
  bounded(operation, label, milliseconds) {
    return new Promise((resolve, reject) => {
      const finish = () => {
        clearTimeout(timer);
        this.pending.delete(cancel);
      };
      const cancel = (error) => {
        finish();
        reject(error);
      };
      const timer = setTimeout(() => cancel(new Error(`${label} timed out`)), milliseconds);
      this.pending.add(cancel);
      operation.then((value) => {
        finish();
        resolve(value);
      }, cancel);
      if (this.destroyed) cancel(new Error("SWF player was destroyed"));
    });
  }
  waitFor(read, label, milliseconds) {
    return new Promise((resolve, reject) => {
      const deadline = performance.now() + milliseconds;
      let timer;
      const finish = () => {
        clearTimeout(timer);
        this.pending.delete(cancel);
      };
      const cancel = (error) => {
        finish();
        reject(error);
      };
      const poll = () => {
        try {
          const value = read();
          if (value != null) {
            finish();
            resolve(value);
            return;
          }
          if (performance.now() >= deadline) return cancel(new Error(`${label} timed out`));
          timer = setTimeout(poll, 50);
        } catch (error) {
          cancel(error instanceof Error ? error : new Error(String(error)));
        }
      };
      this.pending.add(cancel);
      poll();
    });
  }
  /**
   * Mutes or unmutes the movie's audio. Ruffle seeds every new player instance from its own
   * element-wide volume, which is not reachable from here, so load() re-applies this after
   * each load — setting it once would be undone by the next one.
   */
  setMuted(muted) {
    this.muted = muted;
    this.el.volume = muted ? 0 : this.volume;
  }
  /** Master volume for all sounds in this movie, retained across loads. */
  setVolume(volume) {
    this.volume = Math.min(1, Math.max(0, volume));
    this.el.volume = this.muted ? 0 : this.volume;
  }
  /** `base` (relative to the page) resolves the SWF's own relative URLs; `options` override Ruffle's config. */
  async load(url, base = BASE, options = {}) {
    ++this.recovery;
    this.recovering = false;
    ++this.movie;
    this.lastLoad = null;
    this.callbackArgs.clear();
    return this.loadMovie(url, base, options);
  }
  async loadMovie(url, base, options, recovering = false) {
    if (this.destroyed) throw new Error("SWF player was destroyed");
    if (this.loading) {
      this.destroy();
      throw new Error("SWF player had an unfinished load; a new player is required");
    }
    if (this.revision) this.cancelPending("SWF movie was replaced");
    const revision = ++this.revision;
    this.meta = null;
    this.el.dataset.swf = url;
    for (const name of this.callbacks) delete this.el[name];
    this.callbacks.clear();
    this.loading = true;
    const previousCanvas = this.el.shadowRoot?.querySelector("#container > canvas");
    try {
      const operation = this.el.ruffle().load({
        ...CONFIG,
        ...this.recoverContext && window.__qqpetNativePetInput === true ? { preferredRenderer: "webgl" } : {},
        ...options,
        base: new URL(base, BASE).href,
        url: new URL(url, BASE).href
      }).finally(() => {
        releaseRetiredCanvas(previousCanvas);
        if (this.destroyed || revision !== this.revision) disposeDetached(this.el);
      });
      releaseRetiredCanvas(previousCanvas);
      await this.bounded(operation, "SWF load", LOAD_MS);
      if (this.destroyed || revision !== this.revision) throw new Error("SWF load was cancelled");
      this.el.volume = this.muted ? 0 : this.volume;
      const metadata = await this.waitFor(() => this.el.ruffle().metadata, "SWF metadata", LOAD_MS);
      if (this.destroyed || revision !== this.revision) throw new Error("SWF load was cancelled");
      this.meta = metadata;
      this.canvas = this.el.shadowRoot?.querySelector("#container > canvas") ?? null;
      this.startedAt = performance.now();
      this.stoppedAt = recovering && this.stoppedAt !== null ? this.startedAt : null;
      this.pausedAt = null;
      if (this.recoverContext) this.lastLoad = { url, base, options: { ...options } };
      this.pauseForHost(hostPaused);
      return this.meta;
    } catch (error) {
      const cancelled = this.destroyed;
      this.destroy();
      if (!cancelled) {
        const message = error instanceof Error ? error.message : String(error);
        window.dispatchEvent(new CustomEvent("qqpet-swf-error", { detail: { url, message, ...recovering ? { terminal: "context-recovery-failed" } : {} } }));
      }
      throw error;
    } finally {
      this.loading = false;
    }
  }
  /** 0-based, same convention as Flash's CurrentFrame(). -1 (== totalFrames - 1) before the first load. */
  get currentFrame() {
    if (!this.meta) return -1;
    const elapsed = (this.stoppedAt ?? this.pausedAt ?? performance.now()) - this.startedAt;
    return Math.min(Math.floor(elapsed / 1e3 * this.meta.frameRate), this.meta.numFrames - 1);
  }
  get totalFrames() {
    return this.meta?.numFrames ?? 0;
  }
  get isPlaying() {
    return !this.recovering && !hostPaused && this.stoppedAt === null && this.el.ruffle().isPlaying;
  }
  get isRecovering() {
    return this.recovering;
  }
  stop() {
    if (!this.recovering) this.el.ruffle().suspend();
    this.stoppedAt ??= this.pausedAt ?? performance.now();
  }
  pauseForHost(paused) {
    if (this.destroyed || !this.meta) return;
    const now = performance.now();
    if (paused) {
      this.pausedAt ??= now;
      this.el.ruffle().suspend();
    } else {
      if (this.pausedAt !== null) {
        const elapsed = now - this.pausedAt;
        this.startedAt += elapsed;
        if (this.stoppedAt !== null) this.stoppedAt += elapsed;
        this.pausedAt = null;
      }
      if (this.stoppedAt === null || this.recovering) this.el.ruffle().resume();
      for (const resume of [...this.resumeWaiters]) resume();
    }
  }
  async nextPaint() {
    const view = this.el.ownerDocument.defaultView;
    let first = 0;
    let second = 0;
    try {
      await this.bounded(new Promise((resolve) => {
        first = view.requestAnimationFrame(() => {
          second = view.requestAnimationFrame(() => resolve());
        });
      }), "SWF paint", LOAD_MS);
    } finally {
      view.cancelAnimationFrame(first);
      view.cancelAnimationFrame(second);
    }
  }
  /**
   * Resolves with a function the SWF registered via ExternalInterface.addCallback.
   * SWFs register from their first frame script, some time after load() resolves.
   */
  async callback(name) {
    if (this.destroyed) throw new Error("SWF player was destroyed");
    const movie = this.movie || 1;
    const host = this.el;
    if (!this.recovering)
      await this.waitFor(() => typeof host[name] === "function" ? true : null, `SWF callback ${name}`, CALLBACK_MS);
    if (this.destroyed || movie !== this.movie) throw new Error("SWF callback was replaced or destroyed");
    this.callbacks.add(name);
    return (...args) => {
      if (this.destroyed || movie !== this.movie) throw new Error("SWF callback was replaced or destroyed");
      if (this.recoverContext) this.callbackArgs.set(name, args);
      if (this.recovering) return;
      const fn = host[name];
      if (typeof fn !== "function") throw new Error(`SWF callback ${name} is unavailable`);
      return fn.apply(this.el, args);
    };
  }
  destroy() {
    if (this.destroyed) return;
    this.publishPanic();
    this.destroyed = true;
    ++this.recovery;
    this.recovering = false;
    this.lastLoad = null;
    this.callbackArgs.clear();
    this.recoveryTimes = [];
    this.contextCleanup();
    releaseRemovedCanvases(this.panicObserver?.takeRecords?.());
    this.panicObserver?.disconnect();
    this.globalCleanup();
    ++this.revision;
    this.cancelPending("SWF player was destroyed");
    this.keyboardCleanup();
    players.delete(this);
    const canvas = this.el.shadowRoot?.querySelector("#container > canvas") ?? this.canvas;
    this.canvas = null;
    this.el.remove();
    releaseRetiredCanvas(canvas);
  }
}
const touch = matchMedia("(pointer: coarse)").matches;
const pageX = (e) => e.clientX + Number(document.documentElement.dataset.cropX || 0);
const pageY = (e) => e.clientY + Number(document.documentElement.dataset.cropY || 0);
function div(cls, ...children) {
  const d = document.createElement("div");
  d.className = cls;
  d.append(...children);
  return d;
}
function img(cls, src) {
  const i = document.createElement("img");
  i.className = cls;
  i.src = src;
  return i;
}
function button(cls, onClick, ...children) {
  const d = div(cls, ...children);
  d.addEventListener("click", onClick);
  return d;
}
function typeable(input) {
  const activate = () => window.qqpet.setFocusable(true);
  input.addEventListener("pointerdown", activate);
  input.addEventListener("focus", activate);
  return input;
}
const named = (label, key, code, keyCode) => ({ label, key, code, keyCode });
const KEYS = [
  named("▲", "ArrowUp", "ArrowUp", 38),
  named("▼", "ArrowDown", "ArrowDown", 40),
  named("◀", "ArrowLeft", "ArrowLeft", 37),
  named("▶", "ArrowRight", "ArrowRight", 39),
  named("空格", " ", "Space", 32),
  named("回车", "Enter", "Enter", 13),
  named("Shift", "Shift", "ShiftLeft", 16),
  named("Ctrl", "Control", "ControlLeft", 17),
  named("Esc", "Escape", "Escape", 27),
  ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c) => named(c, c.toLowerCase(), `Key${c}`, c.charCodeAt(0))),
  ...[..."0123456789"].map((d) => named(d, d, `Digit${d}`, d.charCodeAt(0)))
];
const byCode = new Map(KEYS.map((k) => [k.code, k]));
const DEFAULTS = { up: "ArrowUp", left: "ArrowLeft", right: "ArrowRight", down: "ArrowDown", a: "Enter", b: "Space" };
function onPress(el, run) {
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    run();
  });
}
function gamepad(player, game, host = document.body, quit = () => {
  if (window.qqpet?.closeGame) window.qqpet.closeGame();
  else window.close();
}) {
  const stored = `gamepad:${game}`;
  const settings = { hidden: false, ...JSON.parse(localStorage.getItem(stored) ?? "{}") };
  settings.keys = { ...DEFAULTS, ...settings.keys };
  const persist = () => localStorage.setItem(stored, JSON.stringify(settings));
  let editing = false;
  const send = (type, k) => player.dispatchEvent(new KeyboardEvent(type, { key: k.key, code: k.code, keyCode: k.keyCode, bubbles: true, composed: true }));
  const pick = (b, relabel) => {
    const keys = KEYS.map((k) => {
      const option = div(k.code === settings.keys[b] ? "padPickerKey on" : "padPickerKey", k.label);
      onPress(option, () => {
        settings.keys[b] = k.code;
        persist();
        relabel();
        sheet.remove();
      });
      return option;
    });
    const sheet = div("padPicker", div("padPickerTitle", "选择这个按钮要发送的按键（点空白处取消）"), div("padPickerKeys", ...keys));
    onPress(sheet, () => sheet.remove());
    host.append(sheet);
  };
  const button2 = (b) => {
    const el = div(`padKey ${b}`);
    const relabel = () => void (el.textContent = byCode.get(settings.keys[b]).label);
    relabel();
    let down = null;
    onPress(el, () => {
      if (editing) return pick(b, relabel);
      player.focus();
      down = byCode.get(settings.keys[b]);
      el.classList.add("on");
      send("keydown", down);
    });
    const release = () => {
      if (!down) return;
      el.classList.remove("on");
      send("keyup", down);
      down = null;
    };
    for (const type of ["pointerup", "pointercancel", "pointerleave"]) el.addEventListener(type, release);
    return el;
  };
  const pad = div("gamepad", div("padArrows", button2("up"), button2("left"), button2("right"), button2("down")), div("padButtons", button2("a"), button2("b")));
  const show = (on) => {
    pad.hidden = !on;
    settings.hidden = !on;
    persist();
  };
  show(!settings.hidden);
  const edit = div("padTool", "改键");
  onPress(edit, () => {
    editing = !editing;
    edit.textContent = editing ? "完成" : "改键";
    pad.classList.toggle("editing", editing);
    if (editing) show(true);
  });
  const toggle = div("padTool", "按键");
  onPress(toggle, () => show(settings.hidden));
  const exit = div("padTool", "退出");
  onPress(exit, quit);
  host.append(pad, div("padTools", edit, toggle, exit));
}
export {
  SwfPlayer as S,
  typeable as a,
  button as b,
  pageX as c,
  div as d,
  gamepad as g,
  img as i,
  pageY as p,
  touch as t
};
