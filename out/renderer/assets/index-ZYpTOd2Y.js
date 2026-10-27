const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./main-DOewATYA.js","./gamepad-KZe0SX2z.js","./gamepad-Ccs_hJlq.css","./main-Cg1zahP8.css"])))=>i.map(i=>d[i]);
const scriptRel = /* @__PURE__ */ (function detectScriptRel() {
  const relList = typeof document !== "undefined" && document.createElement("link").relList;
  return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
})();
const assetsURL = function(dep, importerUrl) {
  return new URL(dep, importerUrl).href;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled = function(promises$2) {
      return Promise.all(promises$2.map((p) => Promise.resolve(p).then((value$1) => ({
        status: "fulfilled",
        value: value$1
      }), (reason) => ({
        status: "rejected",
        reason
      }))));
    };
    const links = document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = allSettled(deps.map((dep) => {
      dep = assetsURL(dep, importerUrl);
      if (dep in seen) return;
      seen[dep] = true;
      const isCss = dep.endsWith(".css");
      const cssSelector = isCss ? '[rel="stylesheet"]' : "";
      if (!!importerUrl) for (let i$1 = links.length - 1; i$1 >= 0; i$1--) {
        const link$1 = links[i$1];
        if (link$1.href === dep && (!isCss || link$1.rel === "stylesheet")) return;
      }
      else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
      const link = document.createElement("link");
      link.rel = isCss ? "stylesheet" : scriptRel;
      if (!isCss) link.as = "script";
      link.crossOrigin = "";
      link.href = dep;
      if (cspNonce) link.setAttribute("nonce", cspNonce);
      document.head.appendChild(link);
      if (isCss) return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
      });
    }));
  }
  function handlePreloadError(err$2) {
    const e$1 = new Event("vite:preloadError", { cancelable: true });
    e$1.payload = err$2;
    window.dispatchEvent(e$1);
    if (!e$1.defaultPrevented) throw err$2;
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
async function bootstrap() {
  await window.__qqpetReady;
  const initial = await window.qqpet.load();
  window.__qqpetInitialSave = initial;
  await __vitePreload(() => import("./main-DOewATYA.js"), true ? __vite__mapDeps([0,1,2,3]) : void 0, import.meta.url);
}
void bootstrap().catch((error) => {
  console.error("QQPet startup failed:", error);
  const message = document.createElement("div");
  message.setAttribute("role", "alert");
  message.style.cssText = "padding:16px;background:white;color:#900;font:14px sans-serif";
  message.textContent = `QQPet: ${error instanceof Error ? error.message : String(error)}`;
  document.body.appendChild(message);
});
