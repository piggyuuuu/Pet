const reason = (e) => String(e?.message ?? e).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
function firstRunFlow(api2, show, relaunchDelayMs = 1200) {
  let busy = false;
  let version = "";
  api2.onProgress((p) => {
    if (!busy || !version) return;
    show(p.received >= p.total ? { kind: "installing", version } : { kind: "downloading", version, received: p.received, total: p.total });
  });
  const finish = (v) => {
    show({ kind: "done", version: v });
    setTimeout(() => api2.relaunch(), relaunchDelayMs);
  };
  const run = async (step) => {
    if (busy) return;
    busy = true;
    try {
      const v = await step();
      if (v) finish(v);
      else show({ kind: "idle" });
    } catch (e) {
      show({ kind: "error", message: reason(e) });
    } finally {
      busy = false;
      version = "";
    }
  };
  show({ kind: "idle" });
  return {
    download: (mirror2 = "") => run(async () => {
      show({ kind: "finding" });
      const offer = await api2.findFull(mirror2);
      version = offer.version;
      show({ kind: "downloading", version, received: 0, total: offer.size });
      return api2.download(mirror2);
    }),
    importPack: () => run(async () => {
      show({ kind: "installing" });
      return api2.importPack();
    })
  };
}
const MIRROR_KEY = "qqpet.packMirror";
const api = window.qqpet.packs;
const app = document.getElementById("app");
const el = (tag, props = {}, ...children) => {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...children);
  return e;
};
const mirror = el("input", { placeholder: "例如 https://ghfast.top/ ，留空直接从 GitHub 下载", value: localStorage.getItem(MIRROR_KEY) ?? "" });
const status = el("div");
const downloadBtn = el("button", { className: "primary", textContent: "下载宠物内容" });
const importBtn = el("button", { textContent: "导入本地内容包…" });
const flow = firstRunFlow(api, render);
downloadBtn.onclick = () => {
  localStorage.setItem(MIRROR_KEY, mirror.value.trim());
  void flow.download(mirror.value);
};
importBtn.onclick = () => void flow.importPack();
app.append(
  el("h1", {}, "欢迎使用 QQ宠物（精简版）"),
  el("p", {}, "精简版安装包不带宠物素材。第一次使用需要下载完整内容包（约 360 MB），或导入已经下载好的 .qqpetpack 文件。完成后会自动启动宠物。"),
  el("p", { className: "muted" }, "内容包在 GitHub 发布页（QQPet-content-版本号.qqpetpack）。下载慢可以填写 GitHub 加速镜像；文件会按发布页公布的校验值检查。"),
  el("div", { className: "row" }, el("span", {}, "下载镜像"), mirror),
  status,
  el("div", { className: "spacer" }),
  el("div", { className: "row" }, downloadBtn, importBtn)
);
function render(s) {
  const busy = s.kind === "finding" || s.kind === "downloading" || s.kind === "installing" || s.kind === "done";
  downloadBtn.disabled = importBtn.disabled = mirror.disabled = busy;
  downloadBtn.textContent = s.kind === "error" ? "重试下载" : "下载宠物内容";
  switch (s.kind) {
    case "idle":
      return status.replaceChildren();
    case "finding":
      return status.replaceChildren(el("p", {}, "正在查找最新的内容包…"));
    case "downloading":
      return status.replaceChildren(
        el("p", {}, `正在下载 v${s.version} 内容包：${mb(s.received)} / ${mb(s.total)}（${Math.floor(s.received / s.total * 100)}%）`),
        el("progress", { max: s.total, value: s.received })
      );
    case "installing":
      return status.replaceChildren(el("p", {}, s.version ? `正在校验并安装 v${s.version} 内容包…` : "请选择 .qqpetpack 文件，选好后会校验并安装（需要几十秒）…"), el("progress"));
    case "done":
      return status.replaceChildren(el("p", {}, `v${s.version} 内容已安装，正在启动宠物~`));
    case "error":
      return status.replaceChildren(el("p", { className: "error" }, `失败：${s.message}`), el("p", { className: "muted" }, "可以检查网络、换一个镜像后重试，或者手动下载内容包再导入。"));
  }
}
