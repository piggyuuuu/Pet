import { t as touch, S as SwfPlayer, d as div, i as img, b as button, g as gamepad, a as typeable, p as pageY, c as pageX } from "./gamepad-KZe0SX2z.js";
function createPetInput(actions2, holdMilliseconds = 0) {
  let press = null;
  let hold = null;
  let anchorFrame = 0;
  const clock = actions2.clock ?? (() => performance.now());
  const requestFrame = actions2.requestFrame ?? ((callback) => requestAnimationFrame(callback));
  const cancelFrame = actions2.cancelFrame ?? ((id) => cancelAnimationFrame(id));
  const clearHold = () => {
    if (hold !== null) clearTimeout(hold);
    hold = null;
  };
  const finish2 = (cancelled, now2) => {
    if (!press) return;
    const over2 = press;
    press = null;
    if (anchorFrame) cancelFrame(anchorFrame);
    anchorFrame = 0;
    clearHold();
    actions2.active(false);
    const stale = cancelled || now2 - over2.at > 80;
    actions2.end(over2.lifted, stale ? 0 : over2.vx, stale ? 0 : over2.vy, cancelled);
  };
  return {
    get active() {
      return press !== null;
    },
    cancel() {
      finish2(true, clock());
    },
    send(input) {
      if (!["begin", "move", "end", "cancel"].includes(input.phase) || ![input.id, input.x, input.y].every(Number.isFinite)) return;
      const globalX = input.globalX ?? input.x;
      const globalY = input.globalY ?? input.y;
      if (![globalX, globalY].every(Number.isFinite)) return;
      const now2 = input.time !== void 0 && Number.isFinite(input.time) ? input.time : clock();
      const source = input.source ?? "dom";
      if (input.phase === "cancel" && input.id === -1) return finish2(true, now2);
      if (input.phase === "begin") {
        if (press) return;
        actions2.begin();
        const box22 = actions2.position();
        const dx = input.x - box22.x, dy = input.y - box22.y;
        press = { id: input.id, source, x: input.x, y: input.y, startX: globalX, startY: globalY, dx, dy, grabX: dx / box22.size, grabY: dy / box22.size, scaleGrab: Boolean(input.scaleGrab), px: globalX, py: globalY, at: now2, vx: 0, vy: 0, lifted: false };
        actions2.active(true);
        if (holdMilliseconds > 0) hold = setTimeout(() => {
          if (press) actions2.hold(press.x, press.y);
        }, holdMilliseconds);
        return;
      }
      if (!press || input.id !== press.id || source !== press.source) return;
      if (input.phase === "cancel") return finish2(true, now2);
      const dt = (now2 - press.at) / 1e3;
      if (dt > 0 && (globalX !== press.px || globalY !== press.py)) {
        press.vx = (globalX - press.px) / dt;
        press.vy = (globalY - press.py) / dt;
        press.at = now2;
      }
      press.px = globalX;
      press.py = globalY;
      press.x = input.x;
      press.y = input.y;
      const box2 = actions2.position();
      if (!press.lifted && Math.hypot(globalX - press.startX, globalY - press.startY) > 8) {
        clearHold();
        press.lifted = true;
        const gesture = press;
        const align = (anchor2) => {
          if (press !== gesture) return;
          if (anchorFrame) cancelFrame(anchorFrame);
          const fromX = gesture.grabX, fromY = gesture.grabY;
          const toX = anchor2.dx / box2.size, toY = anchor2.dy / box2.size;
          const started = clock();
          const paint = () => {
            anchorFrame = 0;
            if (press !== gesture) return;
            const t = anchor2.duration ? Math.min(1, Math.max(0, (clock() - started) / anchor2.duration)) : 1;
            const ease = 1 - (1 - t) ** 3;
            gesture.grabX = fromX + (toX - fromX) * ease;
            gesture.grabY = fromY + (toY - fromY) * ease;
            gesture.dx = gesture.grabX * box2.size;
            gesture.dy = gesture.grabY * box2.size;
            const currentSize = actions2.position().size;
            actions2.move(gesture.x - (gesture.scaleGrab ? gesture.grabX * currentSize : gesture.dx), gesture.y - (gesture.scaleGrab ? gesture.grabY * currentSize : gesture.dy), true);
            if (t < 1) anchorFrame = requestFrame(paint);
          };
          paint();
        };
        const anchor = actions2.lift(box2.size, align);
        if (anchor) align(anchor);
      }
      actions2.move(input.x - (press.scaleGrab ? press.grabX * box2.size : press.dx), input.y - (press.scaleGrab ? press.grabY * box2.size : press.dy), press.lifted);
      if (input.phase === "end") finish2(false, now2);
    }
  };
}
function findLast(list2, predicate) {
  for (let i = list2.length - 1; i >= 0; i--) if (predicate(list2[i], i)) return list2[i];
  return void 0;
}
const LATE = [
  { tolk: "[host]，这么晚还没睡呀？熬夜对身体不好，我陪你一会儿就去睡吧~", submitText: "马上睡" },
  { tolk: "嘘~夜深了，[host]要早点休息哦，明天才有精神！", submitText: "晚安~" },
  { tolk: "月亮都睡着了，[host]还在忙吗？辛苦啦，摸摸头~", submitText: "摸摸~" },
  { tolk: "深更半夜的，[host]是不是偷偷来看我？被我抓到啦，快去睡觉！", submitText: "嘿嘿" }
];
const GREET = [
  [0, LATE],
  [
    5,
    [
      { tolk: "[host]起得好早呀！天才蒙蒙亮，我还没睡醒呢~", submitText: "早起的鸟儿" },
      { tolk: "清晨的空气最新鲜啦，[host]要不要出去走走？", submitText: "好呀" },
      { tolk: "[host]，早安！今天是不是有什么重要的事，起这么早？", submitText: "嗯嗯" }
    ]
  ],
  [
    8,
    [
      { tolk: "[host]，早上好！新的一天也要元气满满哦~", submitText: "早上好~" },
      { tolk: "早安[host]！吃早饭了没？不吃早饭可不行哦！", submitText: "吃过啦" },
      { tolk: "太阳晒屁股啦，[host]，今天也一起加油吧！", submitText: "加油！" }
    ]
  ],
  [
    11,
    [
      { tolk: "[host]，中午好~该吃午饭啦，吃饱了才有力气干活！", submitText: "这就去" },
      { tolk: "午饭时间到！[host]吃完记得眯一会儿哦~", submitText: "好的~" },
      { tolk: "肚子咕咕叫了吧？[host]今天中午吃什么好吃的呀？", submitText: "秘密~" }
    ]
  ],
  [
    13,
    [
      { tolk: "[host]，下午好！来杯下午茶提提神吧~", submitText: "好主意" },
      { tolk: "下午容易犯困，[host]起来活动活动吧！", submitText: "伸懒腰~" },
      { tolk: "[host]，下午也要加油哦，我在旁边给你打气！", submitText: "谢谢~" }
    ]
  ],
  [
    17,
    [
      { tolk: "[host]，傍晚啦，太阳要下山了，今天过得怎么样？", submitText: "还不错" },
      { tolk: "晚霞好漂亮呀！[host]快到下班时间了吧？", submitText: "快了快了" },
      { tolk: "[host]，忙了一天辛苦啦，晚饭想吃什么？", submitText: "想想看" }
    ]
  ],
  [
    19,
    [
      { tolk: "[host]，晚上好！今天辛苦啦，陪我玩一会儿吧~", submitText: "来玩吧" },
      { tolk: "晚饭吃了什么好吃的？[host]有没有给我留一口？", submitText: "给你留了" },
      { tolk: "[host]，晚上是放松的时间，别再想工作啦~", submitText: "好~" }
    ]
  ],
  [23, LATE]
];
const HOLIDAY = {
  元旦: ["[host]，元旦快乐！新的一年也请多多关照哦~", "新年新气象！[host]今年有什么新愿望吗？我的愿望是天天和你在一起~"],
  除夕: ["[host]，今天是除夕！年夜饭吃饱饱，一起守岁吧~", "除夕快乐！[host]，明天就是新年啦，记得给我压岁钱哦~"],
  春节: ["[host]，新年快乐！恭喜发财，红包拿来~", "过年啦！祝[host]新的一年身体健康、万事如意！"],
  清明节: ["[host]，清明时节天气转暖，踏青也要注意安全哦~", "清明假期到啦，[host]记得多陪陪家人~"],
  劳动节: ["[host]，劳动节快乐！辛苦了这么久，好好歇歇吧~", "五一假期！[host]是出去玩还是在家陪我？"],
  端午节: ["[host]，端午安康！你是甜粽派还是咸粽派？", "端午假期到啦！[host]去看赛龙舟吗？"],
  中秋节: ["[host]，中秋节快乐！一起赏月吃月饼吧~", "中秋假期到啦！[host]，月饼要分我一块哦~"],
  国庆节: ["[host]，国庆节快乐！祝祖国生日快乐~", "国庆长假！[host]准备去哪里玩呀？"]
};
const FESTIVAL = {
  "02-14": ["[host]，今天是情人节哦~有没有收到巧克力？没有的话我分你一半！", "情人节快乐！[host]在我心里永远是第一名~"],
  "06-01": ["[host]，儿童节快乐！不管多大，在我这儿你永远是小朋友~", "今天是儿童节，[host]给我买糖吃好不好？"],
  "12-24": ["[host]，平安夜快乐！今晚记得吃个苹果，平平安安~"],
  "12-25": ["[host]，圣诞快乐！圣诞老人有没有往你袜子里塞礼物？", "Merry Christmas！[host]，我想要一顶圣诞帽~"],
  正月十五: ["[host]，元宵节快乐！今天要吃汤圆哦，你喜欢什么馅的？", "元宵节到啦，[host]今晚去看花灯吗？带上我嘛~"],
  七月初七: ["[host]，今天是七夕哦~牛郎织女见面啦，你有没有想见的人呀？", "七夕快乐！[host]，我会一直陪着你的~"],
  九月初九: ["[host]，今天是重阳节，记得给家里的长辈打个电话哦~", "重阳节快乐！[host]要不要去登高望远？"],
  腊月初八: ["[host]，今天是腊八节，喝一碗腊八粥暖暖身子吧~", "过了腊八就是年！[host]，年货准备好了吗？"]
};
const rand = (min, max) => Math.round(Math.random() * (max - min) + min);
const WEEK$1 = "日一二三四五六";
let days = [];
async function loadCalendar() {
  days = await window.qqpet.calendar();
  return days[0];
}
const pick$4 = (list2) => list2[rand(0, list2.length - 1)];
function dayText() {
  const [d] = days;
  const week = `星期${WEEK$1[(/* @__PURE__ */ new Date()).getDay()]}`;
  if (!d) return week;
  return [week, `农历${d.lunar}`, d.holiday && (d.holiday.off ? `${d.holiday.name}放假` : `${d.holiday.name}调休上班`), d.term].filter(Boolean).join("，");
}
function greeting() {
  const h2 = (/* @__PURE__ */ new Date()).getHours();
  return pick$4(findLast(GREET, ([from]) => h2 >= from)[1]);
}
const THROTTLE_KEY = "qqpet:festival-throttle";
let festivalSaid = 0;
let userAnswered = false;
let lastLunar = "";
function saveThrottle() {
  try {
    localStorage.setItem(THROTTLE_KEY, JSON.stringify({ lastLunar, festivalSaid, userAnswered }));
  } catch {
  }
}
function noteUserSpoke() {
  userAnswered = true;
  saveThrottle();
}
function festivalExhausted() {
  return festivalSaid >= (userAnswered ? 2 : 3);
}
function festival() {
  const [d, tomorrow] = days;
  const now2 = /* @__PURE__ */ new Date();
  const solar = `${String(now2.getMonth() + 1).padStart(2, "0")}-${String(now2.getDate()).padStart(2, "0")}`;
  const key = d?.lunar ?? solar;
  if (key !== lastLunar) {
    lastLunar = key;
    festivalSaid = 0;
    userAnswered = false;
    try {
      const saved = JSON.parse(localStorage.getItem(THROTTLE_KEY) ?? "null");
      if (saved && saved.lastLunar === key) {
        festivalSaid = saved.festivalSaid;
        userAnswered = saved.userAnswered;
      }
    } catch {
    }
  }
  const cap = userAnswered ? 2 : 3;
  if (festivalSaid >= cap) return null;
  const said2 = (line2) => {
    festivalSaid++;
    saveThrottle();
    return line2;
  };
  const holiday = tomorrow?.lunar === "正月初一" ? "除夕" : d?.holiday?.off ? d.holiday.name : null;
  const lines = holiday && HOLIDAY[holiday] || FESTIVAL[solar] || d && FESTIVAL[d.lunar];
  if (lines) return said2(pick$4(lines));
  if (holiday) return said2(`[host]，今天是${holiday}，放假啦！祝你${holiday}快乐，今天要好好玩哦~`);
  if (d?.holiday) return said2(`[host]，今天${d.holiday.name}调休要上班，辛苦啦，我给你加油！`);
  if (d?.term) return said2(`[host]，今天是${d.term}，换季了要注意身体哦~`);
  return null;
}
function dateTalk() {
  const [today2] = days;
  if (!today2) return null;
  const now2 = /* @__PURE__ */ new Date();
  const lines = [`[host]，今天是农历${today2.lunar}，星期${WEEK$1[now2.getDay()]}~`];
  const i = days.findIndex((d, i2) => i2 > 0 && d.holiday?.off && d.holiday.name !== today2.holiday?.name);
  if (i > 0) lines.push(`[host]，再过${i}天就是${days[i].holiday.name}啦，放假有什么计划吗？`);
  if ((now2.getDay() === 0 || now2.getDay() === 6) && !today2.holiday) lines.push("周末啦，[host]今天好好休息一下吧~");
  const f = festival();
  if (f) lines.push(f);
  return pick$4(lines);
}
function petSizeFor(level, viewport, touch2, deviceKind) {
  const original = 144 + 2 * Math.min(level, 10);
  if (deviceKind === "tablet") return original;
  return original * (touch2 ? Math.min(viewport.width, viewport.height) / 360 : viewport.width / 1920);
}
function toolbarScaleFor(size2, fit, touch2, deviceKind) {
  if (deviceKind === "tablet") return Math.max(0, Math.min(1, fit));
  return touch2 ? Math.min(size2 / 150, fit) : 1;
}
function resizePetPosition(position, previous, next2, edge = null) {
  const maxX = Math.max(0, next2.width - next2.size);
  const maxY = Math.max(0, next2.height - next2.size);
  const scale = (value, before, after) => (before > 0 ? Math.min(1, Math.max(0, value / before)) : 0.5) * after;
  return {
    x: edge === "hideleft" ? 0 : edge === "hideright" ? maxX : scale(position.x, previous.width - previous.size, maxX),
    y: scale(position.y, previous.height - previous.size, maxY)
  };
}
const food = /* @__PURE__ */ JSON.parse('{"_100010031":{"name":"雪泥爽","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010031","price":-1,"rectype":"","url":"./pet/img_res/food/100010031.gif"},"_100010032":{"name":"小笼包","type":"food","charm":100,"intel":100,"strong":100,"clean":500,"hunger":500,"desc":"一颗小笼包，原地爆炸三千里~","id":"100010032","price":2000,"rectype":"","url":"./pet/img_res/food/100010032.gif"},"_100010033":{"name":"黑森林蛋糕","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010033","price":-1,"rectype":"","url":"./pet/img_res/food/100010033.gif"},"_100010034":{"name":"鱼肉香肠","type":"food","charm":0,"intel":0,"strong":15,"clean":0,"hunger":1080,"desc":"","id":"100010034","price":-1,"rectype":"","url":"./pet/img_res/food/100010034.gif"},"_100010035":{"name":"葡萄香槟","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010035","price":-1,"rectype":"","url":"./pet/img_res/food/100010035.gif"},"_100010036":{"name":"八宝饭","type":"food","charm":0,"intel":5,"strong":0,"clean":0,"hunger":540,"desc":"","id":"100010036","price":-1,"rectype":"","url":"./pet/img_res/food/100010036.gif"},"_100010037":{"name":"长寿面","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":720,"desc":"","id":"100010037","price":-1,"rectype":"","url":"./pet/img_res/food/100010037.gif"},"_100010038":{"name":"火腿汉堡","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010038","price":-1,"rectype":"","url":"./pet/img_res/food/100010038.gif"},"_100010039":{"name":"饺子","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010039","price":-1,"rectype":"","url":"./pet/img_res/food/100010039.gif"},"_100010040":{"name":"年糕","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"100010040","price":-1,"rectype":"","url":"./pet/img_res/food/100010040.gif"},"_100010041":{"name":"汤圆","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010041","price":-1,"rectype":"","url":"./pet/img_res/food/100010041.gif"},"_100010042":{"name":"爱的甜蜜","type":"food","charm":0,"intel":0,"strong":60,"clean":0,"hunger":900,"desc":"","id":"100010042","price":-1,"rectype":"","url":"./pet/img_res/food/100010042.gif"},"_100010043":{"name":"金心金意","type":"food","charm":75,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010043","price":-1,"rectype":"","url":"./pet/img_res/food/100010043.gif"},"_100010044":{"name":"浪漫温情","type":"food","charm":0,"intel":100,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010044","price":-1,"rectype":"","url":"./pet/img_res/food/100010044.gif"},"_100010045":{"name":"一生相恋","type":"food","charm":60,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010045","price":-1,"rectype":"","url":"./pet/img_res/food/100010045.gif"},"_100010046":{"name":"人鱼海藻素","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":720,"desc":"","id":"100010046","price":-1,"rectype":"","url":"./pet/img_res/food/100010046.gif"},"_100010047":{"name":"人鱼海藻素","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":720,"desc":"","id":"100010047","price":-1,"rectype":"","url":"./pet/img_res/food/100010047.gif"},"_100010048":{"name":"牛翔倍力素","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010048","price":-1,"rectype":"","url":"./pet/img_res/food/100010048.gif"},"_100010049":{"name":"大力菠菜素","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":720,"desc":"","id":"100010049","price":500,"rectype":"","url":"./pet/img_res/food/100010049.gif"},"_100010050":{"name":"苏打小靶饼","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010050","price":-1,"rectype":"","url":"./pet/img_res/food/100010050.gif"},"_100010051":{"name":"跳跳大龙虾","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010051","price":-1,"rectype":"","url":"./pet/img_res/food/100010051.gif"},"_100010052":{"name":"棒棒甜筒","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010052","price":-1,"rectype":"","url":"./pet/img_res/food/100010052.gif"},"_100010053":{"name":"飘香辣鱼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":50,"desc":"","id":"100010053","price":-1,"rectype":"","url":"./pet/img_res/food/100010053.gif"},"_100010054":{"name":"甜脆薯片","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":20,"desc":"","id":"100010054","price":8,"rectype":"","url":"./pet/img_res/food/100010054.gif"},"_100010055":{"name":"浓郁咖啡","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":15,"desc":"","id":"100010055","price":8,"rectype":"","url":"./pet/img_res/food/100010055.gif"},"_100010056":{"name":"清爽冰花","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":10,"desc":"","id":"100010056","price":-1,"rectype":"","url":"./pet/img_res/food/100010056.gif"},"_100010057":{"name":"魔力氨基酸","type":"food","charm":0,"intel":0,"strong":15,"clean":0,"hunger":900,"desc":"","id":"100010057","price":-1,"rectype":"","url":"./pet/img_res/food/100010057.gif"},"_100010058":{"name":"魔力维他命","type":"food","charm":0,"intel":15,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010058","price":-1,"rectype":"","url":"./pet/img_res/food/100010058.gif"},"_100010059":{"name":"大闸蟹","type":"food","charm":0,"intel":0,"strong":15,"clean":0,"hunger":1080,"desc":"","id":"100010059","price":-1,"rectype":"","url":"./pet/img_res/food/100010059.gif"},"_100010060":{"name":"袖珍鱿鱼","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010060","price":-1,"rectype":"","url":"./pet/img_res/food/100010060.gif"},"_100010061":{"name":"凤尾虾","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010061","price":-1,"rectype":"","url":"./pet/img_res/food/100010061.gif"},"_100010062":{"name":"石斑鱼","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"100010062","price":-1,"rectype":"","url":"./pet/img_res/food/100010062.gif"},"_100010063":{"name":"锦绣龙虾","type":"food","charm":0,"intel":0,"strong":15,"clean":0,"hunger":1080,"desc":"","id":"100010063","price":-1,"rectype":"","url":"./pet/img_res/food/100010063.gif"},"_100010064":{"name":"比目鱼","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"100010064","price":-1,"rectype":"","url":"./pet/img_res/food/100010064.gif"},"_100010065":{"name":"珍珠海贝","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010065","price":-1,"rectype":"","url":"./pet/img_res/food/100010065.gif"},"_100010066":{"name":"冰红茶(绝)","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010066","price":-1,"rectype":"","url":"./pet/img_res/food/100010066.gif"},"_100010067":{"name":"冰红茶(小)","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"","id":"100010067","price":-1,"rectype":"","url":"./pet/img_res/food/100010067.gif"},"_100010068":{"name":"怒气饼干","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"原版表缺项，按素材补录","id":"100010068","price":-1,"rectype":"","url":"./pet/img_res/food/100010068.gif"},"_100010069":{"name":"千年蜂浆","type":"food","charm":0,"intel":100,"strong":100,"clean":0,"hunger":0,"desc":"","id":"100010069","price":-1,"rectype":"","url":"./pet/img_res/food/100010069.gif"},"_100010070":{"name":"智勇双全露","type":"food","charm":0,"intel":118,"strong":118,"clean":0,"hunger":0,"desc":"","id":"100010070","price":-1,"rectype":"","url":"./pet/img_res/food/100010070.gif"},"_100010071":{"name":"琼浆玉液","type":"food","charm":100,"intel":100,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100010071","price":-1,"rectype":"","url":"./pet/img_res/food/100010071.gif"},"_100010098":{"name":"梦幻草莓","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"以新鲜草莓味原料配以优质鲜奶制作而成。","id":"100010098","price":-1,"rectype":"","url":"./pet/img_res/food/100010098.gif"},"_100010099":{"name":"芬芳香橙","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"以上好的香橙为原料，配以浓郁的巧克力制作而成。","id":"100010099","price":-1,"rectype":"","url":"./pet/img_res/food/100010099.gif"},"_100010100":{"name":"甜蜜爱心","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"心型的蛋糕搭配上好的起司制作而成。","id":"100010100","price":-1,"rectype":"","url":"./pet/img_res/food/100010100.gif"},"_100010101":{"name":"虎仔牛奶","type":"food","charm":0,"intel":48,"strong":48,"clean":0,"hunger":900,"desc":"","id":"100010101","price":-1,"rectype":"","url":"./pet/img_res/food/100010101.gif"},"_100010102":{"name":"愚人怪怪饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1,"desc":"","id":"100010102","price":-1,"rectype":"","url":"./pet/img_res/food/100010102.gif"},"_100010103":{"name":"活力牛津面","type":"food","charm":0,"intel":0,"strong":60,"clean":0,"hunger":900,"desc":"","id":"100010103","price":-1,"rectype":"","url":"./pet/img_res/food/100010103.gif"},"_100010104":{"name":"动力百分百","type":"food","charm":0,"intel":60,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010104","price":-1,"rectype":"","url":"./pet/img_res/food/100010104.gif"},"_100010105":{"name":"营养果粒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010105","price":-1,"rectype":"","url":"./pet/img_res/food/100010105.gif"},"_100010106":{"name":"魔法地球蛋糕","type":"food","charm":0,"intel":150,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010106","price":-1,"rectype":"","url":"./pet/img_res/food/100010106.gif"},"_100010107":{"name":"生命精华","type":"food","charm":0,"intel":50,"strong":50,"clean":0,"hunger":0,"desc":"","id":"100010107","price":-1,"rectype":"","url":"./pet/img_res/food/100010107.gif"},"_100010108":{"name":"巧克力魔斯杯","type":"food","charm":150,"intel":150,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100010108","price":-1,"rectype":"","url":"./pet/img_res/food/100010108.gif"},"_100010109":{"name":"冠军蛋糕","type":"food","charm":60,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"100010109","price":-1,"rectype":"","url":"./pet/img_res/food/100010109.gif"},"_100010110":{"name":"亚军蛋糕","type":"food","charm":40,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010110","price":-1,"rectype":"","url":"./pet/img_res/food/100010110.gif"},"_100010111":{"name":"清炖蟹粉狮子头","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":360,"desc":"","id":"100010111","price":-1,"rectype":"","url":"./pet/img_res/food/100010111.gif"},"_100010112":{"name":"镂金龙凤蟹","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010112","price":-1,"rectype":"","url":"./pet/img_res/food/100010112.gif"},"_100010113":{"name":"汉川菏月","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010113","price":-1,"rectype":"","url":"./pet/img_res/food/100010113.gif"},"_100010114":{"name":"冰火龙炎果","type":"food","charm":0,"intel":0,"strong":38,"clean":0,"hunger":1080,"desc":"","id":"100010114","price":-1,"rectype":"","url":"./pet/img_res/food/100010114.gif"},"_100010115":{"name":"幻世-风味饺子","type":"food","charm":0,"intel":0,"strong":18,"clean":0,"hunger":1080,"desc":"","id":"100010115","price":-1,"rectype":"","url":"./pet/img_res/food/100010115.gif"},"_100010116":{"name":"幻世-快活神仙茶","type":"food","charm":0,"intel":18,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010116","price":-1,"rectype":"","url":"./pet/img_res/food/100010116.gif"},"_100010117":{"name":"幻世-水晶汤圆","type":"food","charm":18,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"100010117","price":-1,"rectype":"","url":"./pet/img_res/food/100010117.gif"},"_100010118":{"name":"焙诺冰皮月饼","type":"food","charm":0,"intel":200,"strong":200,"clean":0,"hunger":0,"desc":"","id":"100010118","price":-1,"rectype":"","url":"./pet/img_res/food/100010118.gif"},"_100010119":{"name":"雪顶凤梨酥","type":"food","charm":200,"intel":200,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100010119","price":-1,"rectype":"","url":"./pet/img_res/food/100010119.gif"},"_100010120":{"name":"火红大火锅","type":"food","charm":0,"intel":0,"strong":38,"clean":0,"hunger":1080,"desc":"","id":"100010120","price":-1,"rectype":"","url":"./pet/img_res/food/100010120.gif"},"_100010121":{"name":"美味蟹黄糕","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":720,"desc":"","id":"100010121","price":-1,"rectype":"","url":"./pet/img_res/food/100010121.gif"},"_100010122":{"name":"万圣节南瓜糖","type":"food","charm":0,"intel":0,"strong":25,"clean":0,"hunger":720,"desc":"","id":"100010122","price":-1,"rectype":"","url":"./pet/img_res/food/100010122.gif"},"_100010123":{"name":"精灵南瓜蛋糕","type":"food","charm":25,"intel":25,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100010123","price":-1,"rectype":"","url":"./pet/img_res/food/100010123.gif"},"_100010124":{"name":"感恩南瓜饼","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":360,"desc":"感恩大餐材料。","id":"100010124","price":-1,"rectype":"","url":"./pet/img_res/food/100010124.gif"},"_100010125":{"name":"草莓果子酱","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"感恩大餐材料。","id":"100010125","price":-1,"rectype":"","url":"./pet/img_res/food/100010125.gif"},"_100010126":{"name":"玉蜀黍","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":360,"desc":"感恩大餐材料。","id":"100010126","price":-1,"rectype":"","url":"./pet/img_res/food/100010126.gif"},"_100010127":{"name":"感恩火鸡","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":900,"desc":"感恩大餐材料。","id":"100010127","price":-1,"rectype":"","url":"./pet/img_res/food/100010127.gif"},"_100010128":{"name":"感恩大餐","type":"food","charm":20,"intel":20,"strong":20,"clean":0,"hunger":3000,"desc":"","id":"100010128","price":-1,"rectype":"","url":"./pet/img_res/food/100010128.gif"},"_100010129":{"name":"海鲜大餐","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1080,"desc":"","id":"100010129","price":-1,"rectype":"","url":"./pet/img_res/food/100010129.gif"},"_100010130":{"name":"海皇御宴","type":"food","charm":15,"intel":15,"strong":15,"clean":0,"hunger":1800,"desc":"","id":"100010130","price":-1,"rectype":"","url":"./pet/img_res/food/100010130.gif"},"_100010131":{"name":"兔丝吉奶糖","type":"food","charm":15,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010131","price":-1,"rectype":"","url":"./pet/img_res/food/100010131.gif"},"_100010132":{"name":"蜜饯圣诞果","type":"food","charm":0,"intel":30,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010132","price":-1,"rectype":"","url":"./pet/img_res/food/100010132.gif"},"_100010133":{"name":"香甜诞旦糕","type":"food","charm":0,"intel":0,"strong":30,"clean":0,"hunger":360,"desc":"","id":"100010133","price":-1,"rectype":"","url":"./pet/img_res/food/100010133.gif"},"_100010134":{"name":"提拉米苏","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010134","price":-1,"rectype":"","url":"./pet/img_res/food/100010134.gif"},"_100010135":{"name":"长岛冰茶","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":360,"desc":"","id":"100010135","price":-1,"rectype":"","url":"./pet/img_res/food/100010135.gif"},"_100010136":{"name":"冰糖葫芦","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":980,"desc":"","id":"100010136","price":-1,"rectype":"","url":"./pet/img_res/food/100010136.gif"},"_100010137":{"name":"年夜饭","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":2011,"desc":"","id":"100010137","price":-1,"rectype":"","url":"./pet/img_res/food/100010137.gif"},"_100010138":{"name":"年货锦盒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2011,"desc":"","id":"100010138","price":-1,"rectype":"","url":"./pet/img_res/food/100010138.gif"},"_100010139":{"name":"腊八粥","type":"food","charm":0,"intel":15,"strong":15,"clean":0,"hunger":900,"desc":"","id":"100010139","price":-1,"rectype":"","url":"./pet/img_res/food/100010139.gif"},"_100010140":{"name":"小年糯米饭","type":"food","charm":30,"intel":30,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"100010140","price":-1,"rectype":"","url":"./pet/img_res/food/100010140.gif"},"_100010141":{"name":"新春元宵","type":"food","charm":50,"intel":0,"strong":50,"clean":0,"hunger":2100,"desc":"","id":"100010141","price":-1,"rectype":"","url":"./pet/img_res/food/100010141.gif"},"_100010142":{"name":"年夜团圆饭","type":"food","charm":68,"intel":68,"strong":68,"clean":0,"hunger":2700,"desc":"","id":"100010142","price":-1,"rectype":"","url":"./pet/img_res/food/100010142.gif"},"_100010143":{"name":"豪华盛宴","type":"food","charm":50,"intel":50,"strong":100,"clean":0,"hunger":0,"desc":"","id":"100010143","price":-1,"rectype":"","url":"./pet/img_res/food/100010143.gif"},"_100010144":{"name":"今天我做饭","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010144","price":-1,"rectype":"","url":"./pet/img_res/food/100010144.gif"},"_100010145":{"name":"青春果","type":"food","charm":20,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010145","price":-1,"rectype":"","url":"./pet/img_res/food/100010145.gif"},"_100010146":{"name":"普通曲奇","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"","id":"100010146","price":-1,"rectype":"","url":"./pet/img_res/food/100010146.gif"},"_100010147":{"name":"加仑子曲奇","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010147","price":-1,"rectype":"","url":"./pet/img_res/food/100010147.gif"},"_100010148":{"name":"巧克力曲奇","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":540,"desc":"","id":"100010148","price":-1,"rectype":"","url":"./pet/img_res/food/100010148.gif"},"_100010149":{"name":"浓情蜜意","type":"food","charm":80,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"100010149","price":-1,"rectype":"","url":"./pet/img_res/food/100010149.gif"},"_100010150":{"name":"石头汉堡包","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1,"desc":"","id":"100010150","price":-1,"rectype":"","url":"./pet/img_res/food/100010150.gif"},"_100010151":{"name":"神机妙算糖","type":"food","charm":0,"intel":20,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010151","price":-1,"rectype":"","url":"./pet/img_res/food/100010151.gif"},"_100010152":{"name":"桫椤羽片","type":"food","charm":4,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010152","price":-1,"rectype":"","url":"./pet/img_res/food/100010152.gif"},"_100010153":{"name":"皇室复活蛋挞","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1800,"desc":"","id":"100010153","price":-1,"rectype":"","url":"./pet/img_res/food/100010153.gif"},"_100010154":{"name":"登仙•武","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1080,"desc":"","id":"100010154","price":-1,"rectype":"","url":"./pet/img_res/food/100010154.gif"},"_100010155":{"name":"登仙•智","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010155","price":-1,"rectype":"","url":"./pet/img_res/food/100010155.gif"},"_100010156":{"name":"登仙•魅","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010156","price":-1,"rectype":"","url":"./pet/img_res/food/100010156.gif"},"_100010157":{"name":"魔•登仙•武","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1800,"desc":"","id":"100010157","price":-1,"rectype":"","url":"./pet/img_res/food/100010157.gif"},"_100010158":{"name":"魔•登仙•魅","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010158","price":-1,"rectype":"","url":"./pet/img_res/food/100010158.gif"},"_100010159":{"name":"天地无极","type":"food","charm":30,"intel":30,"strong":30,"clean":0,"hunger":3000,"desc":"","id":"100010159","price":-1,"rectype":"","url":"./pet/img_res/food/100010159.gif"},"_100010160":{"name":"魔•登仙•智","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010160","price":-1,"rectype":"","url":"./pet/img_res/food/100010160.gif"},"_100010161":{"name":"劳动光荣","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1800,"desc":"","id":"100010161","price":-1,"rectype":"","url":"./pet/img_res/food/100010161.gif"},"_100010162":{"name":"劳动美好","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010162","price":-1,"rectype":"","url":"./pet/img_res/food/100010162.gif"},"_100010163":{"name":"爱心便当","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"100010163","price":-1,"rectype":"","url":"./pet/img_res/food/100010163.gif"},"_100010164":{"name":"蓝色夏威夷","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010164","price":-1,"rectype":"","url":"./pet/img_res/food/100010164.gif"},"_100010165":{"name":"玛格丽特","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"100010165","price":-1,"rectype":"","url":"./pet/img_res/food/100010165.gif"},"_100010166":{"name":"加勒比日出","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":540,"desc":"","id":"100010166","price":-1,"rectype":"","url":"./pet/img_res/food/100010166.gif"},"_100010167":{"name":"红粉佳人","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"100010167","price":-1,"rectype":"","url":"./pet/img_res/food/100010167.gif"},"_100010168":{"name":"福禄果","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"100010168","price":-1,"rectype":"","url":"./pet/img_res/food/100010168.gif"},"_100010169":{"name":"回到过去","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"","id":"100010169","price":-1,"rectype":"","url":"./pet/img_res/food/100010169.gif"},"_100010170":{"name":"白驹过隙","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010170","price":-1,"rectype":"","url":"./pet/img_res/food/100010170.gif"},"_100010171":{"name":"玉粽","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":3000,"desc":"","id":"100010171","price":-1,"rectype":"","url":"./pet/img_res/food/100010171.gif"},"_100010172":{"name":"魔法奶酪","type":"food","charm":0,"intel":40,"strong":0,"clean":0,"hunger":3000,"desc":"","id":"100010172","price":-1,"rectype":"","url":"./pet/img_res/food/100010172.gif"},"_100010173":{"name":"巨无霸","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"","id":"100010173","price":-1,"rectype":"","url":"./pet/img_res/food/100010173.gif"},"_100010174":{"name":"火雪糕糕","type":"food","charm":0,"intel":36,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010174","price":-1,"rectype":"","url":"./pet/img_res/food/100010174.gif"},"_100010175":{"name":"冰爽果冻","type":"food","charm":36,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"100010175","price":-1,"rectype":"","url":"./pet/img_res/food/100010175.gif"},"_100010176":{"name":"爆炸糖","type":"food","charm":0,"intel":0,"strong":36,"clean":0,"hunger":1080,"desc":"","id":"100010176","price":-1,"rectype":"","url":"./pet/img_res/food/100010176.gif"},"_100010177":{"name":"赤色魔鱼","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1440,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100010177","price":-1,"rectype":"","url":"./pet/img_res/food/100010177.gif"},"_100010178":{"name":"黄色魔鱼","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":1440,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100010178","price":-1,"rectype":"","url":"./pet/img_res/food/100010178.gif"},"_100010179":{"name":"绿色魔鱼","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100010179","price":-1,"rectype":"","url":"./pet/img_res/food/100010179.gif"},"_100010180":{"name":"蓝色魔鱼","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1440,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100010180","price":-1,"rectype":"","url":"./pet/img_res/food/100010180.gif"},"_100010181":{"name":"紫色魔鱼","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100010181","price":-1,"rectype":"","url":"./pet/img_res/food/100010181.gif"},"_100010182":{"name":"养颜海草","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100010182","price":-1,"rectype":"","url":"./pet/img_res/food/100010182.gif"},"_100010183":{"name":"天神之怒","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1800,"desc":"潘多拉的诱惑活动获得！","id":"100010183","price":-1,"rectype":"","url":"./pet/img_res/food/100010183.gif"},"_100010184":{"name":"冥界审判","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1800,"desc":"潘多拉的诱惑活动获得！","id":"100010184","price":-1,"rectype":"","url":"./pet/img_res/food/100010184.gif"},"_100010185":{"name":"情人节巧克力","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":540,"desc":"浓情七夕，牛郎织女齐送礼活动获得！","id":"100010185","price":-1,"rectype":"","url":"./pet/img_res/food/100010185.gif"},"_100010186":{"name":"情人节香槟","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"浓情七夕，牛郎织女齐送礼活动获得！","id":"100010186","price":-1,"rectype":"","url":"./pet/img_res/food/100010186.gif"},"_100010187":{"name":"情人节牛排","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"浓情七夕，牛郎织女齐送礼活动获得！","id":"100010187","price":-1,"rectype":"","url":"./pet/img_res/food/100010187.gif"},"_100010188":{"name":"烛光晚餐","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"浓情七夕，牛郎织女齐送礼活动获得！","id":"100010188","price":-1,"rectype":"","url":"./pet/img_res/food/100010188.gif"},"_100010189":{"name":"冒险压缩饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010189","price":-1,"rectype":"","url":"./pet/img_res/food/100010189.gif"},"_100010190":{"name":"宝特力","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010190","price":-1,"rectype":"","url":"./pet/img_res/food/100010190.gif"},"_100010191":{"name":"神奇果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010191","price":-1,"rectype":"","url":"./pet/img_res/food/100010191.gif"},"_100010192":{"name":"QQ力士架","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010192","price":-1,"rectype":"","url":"./pet/img_res/food/100010192.gif"},"_100010193":{"name":"么么糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010193","price":-1,"rectype":"","url":"./pet/img_res/food/100010193.gif"},"_100010194":{"name":"Q泡果奶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010194","price":-1,"rectype":"","url":"./pet/img_res/food/100010194.gif"},"_100010195":{"name":"松格饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010195","price":-1,"rectype":"","url":"./pet/img_res/food/100010195.gif"},"_100010196":{"name":"Q板糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"盛夏大冒险活动获得！","id":"100010196","price":-1,"rectype":"","url":"./pet/img_res/food/100010196.gif"},"_100010197":{"name":"星座蛋糕-处女座","type":"food","charm":20,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"星座密语活动获得！","id":"100010197","price":-1,"rectype":"","url":"./pet/img_res/food/100010197.gif"},"_100010198":{"name":"老冰棒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"夏日冰爽店活动获得！","id":"100010198","price":-1,"rectype":"","url":"./pet/img_res/food/100010198.gif"},"_100010199":{"name":"初夏之恋","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"夏日冰爽店活动获得！","id":"100010199","price":-1,"rectype":"","url":"./pet/img_res/food/100010199.gif"},"_100010200":{"name":"清爽多","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"夏日冰爽店活动获得！","id":"100010200","price":-1,"rectype":"","url":"./pet/img_res/food/100010200.gif"},"_100010201":{"name":"冰串串","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"夏日冰爽店活动获得！","id":"100010201","price":-1,"rectype":"","url":"./pet/img_res/food/100010201.gif"},"_100010202":{"name":"加勒比海风","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":960,"desc":"夏日冰爽店活动获得！","id":"100010202","price":-1,"rectype":"","url":"./pet/img_res/food/100010202.gif"},"_100010203":{"name":"冰镇西瓜","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":960,"desc":"夏日冰爽店活动获得！","id":"100010203","price":-1,"rectype":"","url":"./pet/img_res/food/100010203.gif"},"_100010204":{"name":"爱情海清凉","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1080,"desc":"夏日冰爽店活动获得！","id":"100010204","price":-1,"rectype":"","url":"./pet/img_res/food/100010204.gif"},"_100010205":{"name":"梦入春城","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"夏日冰爽店活动获得！","id":"100010205","price":-1,"rectype":"","url":"./pet/img_res/food/100010205.gif"},"_100010206":{"name":"高原秘酿","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1440,"desc":"夏日冰爽店活动获得！","id":"100010206","price":-1,"rectype":"","url":"./pet/img_res/food/100010206.gif"},"_100010207":{"name":"冰晶鱼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"夏日冰爽店活动获得！","id":"100010207","price":-1,"rectype":"","url":"./pet/img_res/food/100010207.gif"},"_100010208":{"name":"雪花糕","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"夏日冰爽店活动获得！","id":"100010208","price":-1,"rectype":"","url":"./pet/img_res/food/100010208.gif"},"_100010209":{"name":"冷狗","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"夏日冰爽店活动获得！","id":"100010209","price":-1,"rectype":"","url":"./pet/img_res/food/100010209.gif"},"_100010210":{"name":"酷","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1800,"desc":"夏日冰爽店活动获得！","id":"100010210","price":-1,"rectype":"","url":"./pet/img_res/food/100010210.gif"},"_100010211":{"name":"醍醐灌顶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"夏日冰爽店活动获得！","id":"100010211","price":-1,"rectype":"","url":"./pet/img_res/food/100010211.gif"},"_100010212":{"name":"深海冰弹","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":2100,"desc":"夏日冰爽店活动获得！","id":"100010212","price":-1,"rectype":"","url":"./pet/img_res/food/100010212.gif"},"_100010213":{"name":"清爽一夏","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2100,"desc":"夏日冰爽店活动获得！","id":"100010213","price":-1,"rectype":"","url":"./pet/img_res/food/100010213.gif"},"_100010214":{"name":"冰河世纪","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":2700,"desc":"夏日冰爽店活动获得！","id":"100010214","price":-1,"rectype":"","url":"./pet/img_res/food/100010214.gif"},"_100010215":{"name":"冰封雪飘","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":3600,"desc":"夏日冰爽店活动获得！","id":"100010215","price":-1,"rectype":"","url":"./pet/img_res/food/100010215.gif"},"_100010216":{"name":"移动爱宠派","type":"food","charm":8,"intel":8,"strong":8,"clean":0,"hunger":2700,"desc":"手机宠物首次登陆获得物品！","id":"100010216","price":-1,"rectype":"","url":"./pet/img_res/food/100010216.gif"},"_100010217":{"name":"月桂酒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"2011中秋节活动获得！","id":"100010217","price":-1,"rectype":"","url":"./pet/img_res/food/100010217.gif"},"_100010218":{"name":"银桂酒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":540,"desc":"2011中秋节活动获得！","id":"100010218","price":-1,"rectype":"","url":"./pet/img_res/food/100010218.gif"},"_100010219":{"name":"金桂酒","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"2011中秋节活动获得！","id":"100010219","price":-1,"rectype":"","url":"./pet/img_res/food/100010219.gif"},"_100010220":{"name":"桂花仙酿","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":3000,"desc":"2011中秋节活动获得！","id":"100010220","price":-1,"rectype":"","url":"./pet/img_res/food/100010220.gif"},"_100010221":{"name":"斋饭","type":"food","charm":0,"intel":90,"strong":0,"clean":0,"hunger":900,"desc":"西游囧记活动兑换获得！","id":"100010221","price":-1,"rectype":"","url":"./pet/img_res/food/100010221.gif"},"_100010226":{"name":"迟来的爱","type":"food","charm":8,"intel":0,"strong":8,"clean":0,"hunger":520,"desc":"开通粉钻因系统延迟而补偿获得！","id":"100010226","price":-1,"rectype":"","url":"./pet/img_res/food/100010226.gif"},"_100010227":{"name":"神奇聪明丸","type":"food","charm":0,"intel":25,"strong":0,"clean":0,"hunger":1800,"desc":"2011国庆刮刮乐活动获得！","id":"100010227","price":-1,"rectype":"","url":"./pet/img_res/food/100010227.gif"},"_100010228":{"name":"神奇饭团","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1800,"desc":"2011国庆刮刮乐活动获得！","id":"100010228","price":-1,"rectype":"","url":"./pet/img_res/food/100010228.gif"},"_100010229":{"name":"果仁曲奇饼","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"闹闹曲奇店活动获得！","id":"100010229","price":-1,"rectype":"","url":"./pet/img_res/food/100010229.gif"},"_100010230":{"name":"牛角曲奇饼","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"闹闹曲奇店活动获得！","id":"100010230","price":-1,"rectype":"","url":"./pet/img_res/food/100010230.gif"},"_100010231":{"name":"巧克力曲奇饼","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"闹闹曲奇店活动获得！","id":"100010231","price":-1,"rectype":"","url":"./pet/img_res/food/100010231.gif"},"_100010232":{"name":"糖衣曲奇饼","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"闹闹曲奇店活动获得！","id":"100010232","price":-1,"rectype":"","url":"./pet/img_res/food/100010232.gif"},"_100010233":{"name":"南瓜棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"2011万圣节活动获得！","id":"100010233","price":-1,"rectype":"","url":"./pet/img_res/food/100010233.gif"},"_100010234":{"name":"鬼脸叮当派","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":3000,"desc":"2011万圣节活动获得！","id":"100010234","price":-1,"rectype":"","url":"./pet/img_res/food/100010234.gif"},"_100010235":{"name":"幸运四叶草","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"原版表缺项，按素材补录","id":"100010235","price":-1,"rectype":"","url":"./pet/img_res/food/100010235.gif"},"_100010236":{"name":"爱神朱古力","type":"food","charm":0,"intel":4,"strong":0,"clean":0,"hunger":900,"desc":"丘比特的神箭活动获得！","id":"100010236","price":-1,"rectype":"","url":"./pet/img_res/food/100010236.gif"},"_100010237":{"name":"玫瑰木糖醇","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"丘比特的神箭活动获得！","id":"100010237","price":-1,"rectype":"","url":"./pet/img_res/food/100010237.gif"},"_100010238":{"name":"超级火鸡","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"2011感恩节活动获得！","id":"100010238","price":-1,"rectype":"","url":"./pet/img_res/food/100010238.gif"},"_100010239":{"name":"南瓜布丁","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"2011感恩节活动获得！","id":"100010239","price":-1,"rectype":"","url":"./pet/img_res/food/100010239.gif"},"_100010240":{"name":"紫钻甜甜圈","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"QQ炫舞紫钻用户可获得！","id":"100010240","price":-1,"rectype":"","url":"./pet/img_res/food/100010240.gif"},"_100010241":{"name":"星座蛋糕-射手座","type":"food","charm":0,"intel":0,"strong":20,"clean":0,"hunger":3000,"desc":"星座密语活动获得！","id":"100010241","price":-1,"rectype":"","url":"./pet/img_res/food/100010241.gif"},"_100010242":{"name":"天蚕金缕","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":900,"desc":"avatar秀活动获得！","id":"100010242","price":-1,"rectype":"","url":"./pet/img_res/food/100010242.gif"},"_100010243":{"name":"红妆素裹","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"攒彩蛋兑大奖活动获得！","id":"100010243","price":-1,"rectype":"","url":"./pet/img_res/food/100010243.gif"},"_100010244":{"name":"橙黄橘绿","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1200,"desc":"攒彩蛋兑大奖活动获得！","id":"100010244","price":-1,"rectype":"","url":"./pet/img_res/food/100010244.gif"},"_100010245":{"name":"霜凋夏绿","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"攒彩蛋兑大奖活动获得！","id":"100010245","price":-1,"rectype":"","url":"./pet/img_res/food/100010245.gif"},"_100010246":{"name":"姹紫嫣红","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"攒彩蛋兑大奖活动获得！","id":"100010246","price":-1,"rectype":"","url":"./pet/img_res/food/100010246.gif"},"_100010247":{"name":"ichristmas曲奇","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1080,"desc":"2011圣诞节活动获得！","id":"100010247","price":-1,"rectype":"","url":"./pet/img_res/food/100010247.gif"},"_100010248":{"name":"雪橇糖","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1080,"desc":"2011圣诞节活动获得！","id":"100010248","price":-1,"rectype":"","url":"./pet/img_res/food/100010248.gif"},"_100010249":{"name":"森林蜜饯","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"2011圣诞节活动获得！","id":"100010249","price":-1,"rectype":"","url":"./pet/img_res/food/100010249.gif"},"_100010250":{"name":"花占饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"2011圣诞节活动获得！","id":"100010250","price":-1,"rectype":"","url":"./pet/img_res/food/100010250.gif"},"_100010251":{"name":"圣诞大餐","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":900,"desc":"参加手机宠物双蛋活动获得！","id":"100010251","price":-1,"rectype":"","url":"./pet/img_res/food/100010251.gif"},"_100010252":{"name":"欢乐无极限","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"参加手机宠物双蛋活动获得！","id":"100010252","price":-1,"rectype":"","url":"./pet/img_res/food/100010252.gif"},"_100010253":{"name":"超级元旦大餐","type":"food","charm":9,"intel":9,"strong":9,"clean":0,"hunger":3000,"desc":"2012年元旦活动获得！","id":"100010253","price":-1,"rectype":"","url":"./pet/img_res/food/100010253.gif"},"_100010254":{"name":"超级元旦大餐","type":"food","charm":9,"intel":9,"strong":9,"clean":0,"hunger":3000,"desc":"2012年元旦活动获得！","id":"100010254","price":-1,"rectype":"","url":"./pet/img_res/food/100010254.gif"},"_100010255":{"name":"佛跳墙","type":"food","charm":7,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"2012年元旦活动获得！","id":"100010255","price":-1,"rectype":"","url":"./pet/img_res/food/100010255.gif"},"_100010256":{"name":"清蒸大石斑","type":"food","charm":7,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"2012年元旦活动获得！","id":"100010256","price":-1,"rectype":"","url":"./pet/img_res/food/100010256.gif"},"_100010257":{"name":"元旦大餐","type":"food","charm":7,"intel":7,"strong":7,"clean":0,"hunger":3000,"desc":"2012年元旦活动获得！","id":"100010257","price":-1,"rectype":"","url":"./pet/img_res/food/100010257.gif"},"_100010258":{"name":"钥匙糖","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"剧情签到活动获得！","id":"100010258","price":-1,"rectype":"","url":"./pet/img_res/food/100010258.gif"},"_100010259":{"name":"幸运龙珠糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"神龙拼图活动获得！","id":"100010259","price":-1,"rectype":"","url":"./pet/img_res/food/100010259.gif"},"_100010260":{"name":"绚火龙珠糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"神龙拼图活动获得！","id":"100010260","price":-1,"rectype":"","url":"./pet/img_res/food/100010260.gif"},"_100010261":{"name":"惊雷龙珠糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"神龙拼图活动获得！","id":"100010261","price":-1,"rectype":"","url":"./pet/img_res/food/100010261.gif"},"_100010262":{"name":"幻水龙珠糖","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"神龙拼图活动获得！","id":"100010262","price":-1,"rectype":"","url":"./pet/img_res/food/100010262.gif"},"_100010263":{"name":"魔土龙珠糖","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1080,"desc":"神龙拼图活动获得！","id":"100010263","price":-1,"rectype":"","url":"./pet/img_res/food/100010263.gif"},"_100010264":{"name":"龙珠梦幻糖","type":"food","charm":6,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"神龙拼图活动获得！","id":"100010264","price":-1,"rectype":"","url":"./pet/img_res/food/100010264.gif"},"_100010265":{"name":"翅膀棉花糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"企鹅有你，精彩依旧活动获得！","id":"100010265","price":-1,"rectype":"","url":"./pet/img_res/food/100010265.gif"},"_100010266":{"name":"呆呆熊面包","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1440,"desc":"企鹅有你，精彩依旧活动获得！","id":"100010266","price":-1,"rectype":"","url":"./pet/img_res/food/100010266.gif"},"_100010267":{"name":"黄酒鸡汤","type":"food","charm":0,"intel":0,"strong":4,"clean":0,"hunger":1200,"desc":"2012元宵活动获得！","id":"100010267","price":-1,"rectype":"","url":"./pet/img_res/food/100010267.gif"},"_100010268":{"name":"虾肉饺子","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":1800,"desc":"2012元宵活动获得！","id":"100010268","price":-1,"rectype":"","url":"./pet/img_res/food/100010268.gif"},"_100010269":{"name":"鲤鱼年糕","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"2012元宵活动获得！","id":"100010269","price":-1,"rectype":"","url":"./pet/img_res/food/100010269.gif"},"_100010270":{"name":"粉心玫瑰","type":"food","charm":10,"intel":10,"strong":0,"clean":0,"hunger":360,"desc":"粉钻感谢你的爱回馈物品！","id":"100010270","price":-1,"rectype":"","url":"./pet/img_res/food/100010270.gif"},"_100010271":{"name":"龙虾盖饭","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"桃花朵朵开活动获得！","id":"100010271","price":-1,"rectype":"","url":"./pet/img_res/food/100010271.gif"},"_100010272":{"name":"蟠桃果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"桃花朵朵开活动获得！","id":"100010272","price":-1,"rectype":"","url":"./pet/img_res/food/100010272.gif"},"_100010273":{"name":"桃花糕","type":"food","charm":0,"intel":5,"strong":0,"clean":0,"hunger":3000,"desc":"桃花朵朵开活动获得！","id":"100010273","price":-1,"rectype":"","url":"./pet/img_res/food/100010273.gif"},"_100010274":{"name":"桃花酒","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"桃花朵朵开活动获得！","id":"100010274","price":-1,"rectype":"","url":"./pet/img_res/food/100010274.gif"},"_100010275":{"name":"末日船票餐","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"2012诺亚方舟活动获得！","id":"100010275","price":-1,"rectype":"","url":"./pet/img_res/food/100010275.gif"},"_100010276":{"name":"疯狂驾驶堡","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"2012诺亚方舟活动获得！","id":"100010276","price":-1,"rectype":"","url":"./pet/img_res/food/100010276.gif"},"_100010277":{"name":"棒棒茶树菇","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":2000,"desc":"采蘑菇的小企鹅活动获得！","id":"100010277","price":-1,"rectype":"","url":"./pet/img_res/food/100010277.gif"},"_100010278":{"name":"魔力正红菇","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":3000,"desc":"采蘑菇的小企鹅活动获得！","id":"100010278","price":-1,"rectype":"","url":"./pet/img_res/food/100010278.gif"},"_100010279":{"name":"彩蛋巧克力","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"2012复活节活动获得！","id":"100010279","price":-1,"rectype":"","url":"./pet/img_res/food/100010279.gif"},"_100010280":{"name":"电磁风暴派","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"穿越2012活动珍藏物品！","id":"100010280","price":-1,"rectype":"","url":"./pet/img_res/food/100010280.gif"},"_100010281":{"name":"四维空间餐","type":"food","charm":0,"intel":3,"strong":3,"clean":0,"hunger":2400,"desc":"穿越2012活动珍藏物品！","id":"100010281","price":-1,"rectype":"","url":"./pet/img_res/food/100010281.gif"},"_100010282":{"name":"笨nana小冰棒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3570,"desc":"雀巢笨nana冰一夏活动珍藏物品！","id":"100010282","price":210,"rectype":"","url":"./pet/img_res/food/100010282.gif","needLevel":38},"_100010283":{"name":"椰香吐司","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"网页社区兑换奖励","id":"100010283","price":-1,"rectype":"","url":"./pet/img_res/food/100010283.gif"},"_100010285":{"name":"小鱼小虾","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"欢乐渔港活动珍藏物品！","id":"100010285","price":-1,"rectype":"","url":"./pet/img_res/food/100010285.gif"},"_100010286":{"name":"大鱼汇","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1440,"desc":"欢乐渔港活动珍藏物品！","id":"100010286","price":-1,"rectype":"","url":"./pet/img_res/food/100010286.gif"},"_100010287":{"name":"万鱼朝宗","type":"food","charm":2,"intel":2,"strong":2,"clean":0,"hunger":3000,"desc":"欢乐渔港活动珍藏物品！","id":"100010287","price":-1,"rectype":"","url":"./pet/img_res/food/100010287.gif"},"_100010288":{"name":"微辣凤爪","type":"food","charm":0,"intel":0,"strong":7,"clean":0,"hunger":1400,"desc":"2012五一劳动节珍藏物品！","id":"100010288","price":-1,"rectype":"","url":"./pet/img_res/food/100010288.gif"},"_100010289":{"name":"香辣凤爪","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1500,"desc":"2012五一劳动节珍藏物品！","id":"100010289","price":-1,"rectype":"","url":"./pet/img_res/food/100010289.gif"},"_100010290":{"name":"驴打滚","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":1500,"desc":"2012五一劳动节珍藏物品！","id":"100010290","price":-1,"rectype":"","url":"./pet/img_res/food/100010290.gif"},"_100010291":{"name":"香香驴打滚","type":"food","charm":0,"intel":9,"strong":0,"clean":0,"hunger":1600,"desc":"2012五一劳动节珍藏物品！","id":"100010291","price":-1,"rectype":"","url":"./pet/img_res/food/100010291.gif"},"_100010292":{"name":"紫菜卷寿司","type":"food","charm":9,"intel":0,"strong":0,"clean":0,"hunger":1700,"desc":"2012五一劳动节珍藏物品！","id":"100010292","price":-1,"rectype":"","url":"./pet/img_res/food/100010292.gif"},"_100010293":{"name":"梅花寿司","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"2012五一劳动节珍藏物品！","id":"100010293","price":-1,"rectype":"","url":"./pet/img_res/food/100010293.gif"},"_100010294":{"name":"清蒸鲈鱼","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1800,"desc":"2012五一劳动节珍藏物品！","id":"100010294","price":-1,"rectype":"","url":"./pet/img_res/food/100010294.gif"},"_100010295":{"name":"香煎鲟鱼","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":2000,"desc":"2012五一劳动节珍藏物品！","id":"100010295","price":-1,"rectype":"","url":"./pet/img_res/food/100010295.gif"},"_100010296":{"name":"大灵丹","type":"food","charm":15,"intel":15,"strong":15,"clean":0,"hunger":2500,"desc":"2012五一劳动节珍藏物品！","id":"100010296","price":-1,"rectype":"","url":"./pet/img_res/food/100010296.gif"},"_100010297":{"name":"超级灵丹","type":"food","charm":20,"intel":20,"strong":20,"clean":0,"hunger":3000,"desc":"2012五一劳动节珍藏物品！","id":"100010297","price":-1,"rectype":"","url":"./pet/img_res/food/100010297.gif"},"_100010298":{"name":"星座蛋糕-双子座","type":"food","charm":0,"intel":20,"strong":0,"clean":0,"hunger":3000,"desc":"星座密语活动珍藏物品！","id":"100010298","price":-1,"rectype":"","url":"./pet/img_res/food/100010298.gif"},"_100010299":{"name":"蜜花蜂蜜","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"蜜蜂采蜜忙活动珍藏物品！","id":"100010299","price":-1,"rectype":"","url":"./pet/img_res/food/100010299.gif"},"_10001030":{"name":"仁和可立克","type":"food","charm":0,"intel":15,"strong":0,"clean":0,"hunger":900,"desc":"","id":"10001030","price":-1,"rectype":"","url":"./pet/img_res/food/10001030.gif"},"_100010300":{"name":"智慧聪明丸","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2000,"desc":"企鹅游乐园活动珍藏物品！","id":"100010300","price":-1,"rectype":"","url":"./pet/img_res/food/100010300.gif"},"_100010301":{"name":"斯塔克聚能派","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1200,"desc":"复仇者企鹅联萌活动珍藏物品！","id":"100010301","price":-1,"rectype":"","url":"./pet/img_res/food/100010301.gif"},"_100010302":{"name":"动能可乐","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"运动风云榜活动珍藏物品！","id":"100010302","price":-1,"rectype":"","url":"./pet/img_res/food/100010302.gif"},"_100010303":{"name":"超能奶茶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"运动风云榜活动珍藏物品！","id":"100010303","price":-1,"rectype":"","url":"./pet/img_res/food/100010303.gif"},"_100010304":{"name":"充能活力水","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1800,"desc":"运动风云榜活动珍藏物品！","id":"100010304","price":-1,"rectype":"","url":"./pet/img_res/food/100010304.gif"},"_100010305":{"name":"七周年蛋糕","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2000,"desc":"QQ宠物企鹅七周年庆生活动珍藏物品！","id":"100010305","price":-1,"rectype":"","url":"./pet/img_res/food/100010305.gif"},"_100010306":{"name":"爱心盒饭","type":"food","charm":0,"intel":0,"strong":6,"clean":0,"hunger":720,"desc":"粉钻公益活动纪念物品！","id":"100010306","price":-1,"rectype":"","url":"./pet/img_res/food/100010306.gif"},"_100010307":{"name":"爱心矿泉水","type":"food","charm":6,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"粉钻公益活动纪念物品！","id":"100010307","price":-1,"rectype":"","url":"./pet/img_res/food/100010307.gif"},"_100010308":{"name":"运动Q糖","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"企鹅运动季活动珍藏物品！","id":"100010308","price":-1,"rectype":"","url":"./pet/img_res/food/100010308.gif"},"_100010309":{"name":"运动冰棒","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"企鹅运动季活动珍藏物品！","id":"100010309","price":-1,"rectype":"","url":"./pet/img_res/food/100010309.gif"},"_100010310":{"name":"运动矿泉水","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1800,"desc":"企鹅运动季活动珍藏物品！","id":"100010310","price":-1,"rectype":"","url":"./pet/img_res/food/100010310.gif"},"_100010311":{"name":"运动跳跳豆","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1800,"desc":"企鹅运动季活动珍藏物品！","id":"100010311","price":-1,"rectype":"","url":"./pet/img_res/food/100010311.gif"},"_100010312":{"name":"章鱼烧","type":"food","charm":0,"intel":1,"strong":0,"clean":0,"hunger":1800,"desc":"粉钻贵族挖宝藏活动珍藏物品！","id":"100010312","price":-1,"rectype":"","url":"./pet/img_res/food/100010312.gif"},"_100010313":{"name":"中华大包","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"粉钻贵族挖宝藏活动珍藏物品！","id":"100010313","price":-1,"rectype":"","url":"./pet/img_res/food/100010313.gif"},"_100010314":{"name":"IQ糖","type":"food","charm":0,"intel":6,"strong":0,"clean":0,"hunger":1800,"desc":"企鹅答题秀，挑战IQ极限珍藏物品！","id":"100010314","price":-1,"rectype":"","url":"./pet/img_res/food/100010314.gif"},"_100010315":{"name":"高档牛排","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":3000,"desc":"神秘之旅欧洲篇珍藏物品！","id":"100010315","price":-1,"rectype":"","url":"./pet/img_res/food/100010315.gif"},"_100010318":{"name":"开学盛宴","type":"food","charm":19,"intel":19,"strong":19,"clean":0,"hunger":0,"desc":"2012年9月多多开学豪礼活动专属绝版物品！","id":"100010318","price":-1,"rectype":"","url":"./pet/img_res/food/100010318.gif","outOfPrint":true},"_100010319":{"name":"小米步枪餐","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":1800,"desc":"盛世强国，共贺国庆活动珍藏物品！","id":"100010319","price":-1,"rectype":"","url":"./pet/img_res/food/100010319.gif"},"_100010320":{"name":"欢乐盛世宴","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"盛世强国，共贺国庆活动珍藏物品！","id":"100010320","price":-1,"rectype":"","url":"./pet/img_res/food/100010320.gif"},"_100010321":{"name":"勇气糖果包","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1200,"desc":"无尽的任务珍藏物品！","id":"100010321","price":-1,"rectype":"","url":"./pet/img_res/food/100010321.gif"},"_100010322":{"name":"精英巧克力盒","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"无尽的任务珍藏物品！","id":"100010322","price":-1,"rectype":"","url":"./pet/img_res/food/100010322.gif"},"_100010323":{"name":"粉钻糖果大礼","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":3000,"desc":"无尽的任务珍藏物品！","id":"100010323","price":-1,"rectype":"","url":"./pet/img_res/food/100010323.gif"},"_100010324":{"name":"魔力仙草","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"魔法森林活动珍藏物品！","id":"100010324","price":-1,"rectype":"","url":"./pet/img_res/food/100010324.gif"},"_100010325":{"name":"魔界盛宴","type":"food","charm":3,"intel":0,"strong":3,"clean":0,"hunger":3000,"desc":"魔法森林活动珍藏物品！","id":"100010325","price":-1,"rectype":"","url":"./pet/img_res/food/100010325.gif"},"_100010326":{"name":"水浒蒙汗药","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":720,"desc":"QQ水浒送大礼活动珍藏物品！","id":"100010326","price":-1,"rectype":"","url":"./pet/img_res/food/100010326.gif"},"_100010327":{"name":"水浒聚义酒","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":900,"desc":"QQ水浒送大礼活动珍藏物品！","id":"100010327","price":-1,"rectype":"","url":"./pet/img_res/food/100010327.gif"},"_100010328":{"name":"水浒大郎烧饼","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"QQ水浒送大礼活动珍藏物品！","id":"100010328","price":-1,"rectype":"","url":"./pet/img_res/food/100010328.gif"},"_100010329":{"name":"南瓜七彩糖","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1200,"desc":"万圣节活动珍藏物品！","id":"100010329","price":-1,"rectype":"","url":"./pet/img_res/food/100010329.gif"},"_100010330":{"name":"萌动巧克力","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"三国武将萌动献好礼活动珍藏物品！","id":"100010330","price":-1,"rectype":"","url":"./pet/img_res/food/100010330.gif"},"_100010331":{"name":"一善清早茶","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":720,"desc":"日行一善抽大奖活动珍藏物品！","id":"100010331","price":-1,"rectype":"","url":"./pet/img_res/food/100010331.gif"},"_100010332":{"name":"心意榴莲糖","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":900,"desc":"爱神塔之战活动珍藏物品！","id":"100010332","price":-1,"rectype":"","url":"./pet/img_res/food/100010332.gif"},"_100010333":{"name":"玫瑰花茶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"三十六计活动珍藏物品！","id":"100010333","price":-1,"rectype":"","url":"./pet/img_res/food/100010333.gif"},"_100010334":{"name":"计谋大餐","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":1800,"desc":"三十六计活动珍藏物品！","id":"100010334","price":-1,"rectype":"","url":"./pet/img_res/food/100010334.gif"},"_100010335":{"name":"夜光海马","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"航海大冒险活动珍藏物品！","id":"100010335","price":-1,"rectype":"","url":"./pet/img_res/food/100010335.gif"},"_100010336":{"name":"神奇海贝","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"航海大冒险活动珍藏物品！","id":"100010336","price":-1,"rectype":"","url":"./pet/img_res/food/100010336.gif"},"_100010337":{"name":"冒险蛋糕","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"航海大冒险活动珍藏物品！","id":"100010337","price":-1,"rectype":"","url":"./pet/img_res/food/100010337.gif"},"_100010338":{"name":"魔卡蛋糕","type":"food","charm":6,"intel":6,"strong":0,"clean":0,"hunger":900,"desc":"幸运卡牌活动珍藏物品！","id":"100010338","price":-1,"rectype":"","url":"./pet/img_res/food/100010338.gif"},"_100010339":{"name":"老虎饼干","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":360,"desc":"大虫的逆袭活动珍藏物品！","id":"100010339","price":-1,"rectype":"","url":"./pet/img_res/food/100010339.gif"},"_100010340":{"name":"乐斗能量饮料","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":720,"desc":"乐斗大冒险活动珍藏物品！","id":"100010340","price":-1,"rectype":"","url":"./pet/img_res/food/100010340.gif"},"_100010341":{"name":"宝贝跳跳豆","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"宠物宝贝齐献礼活动珍藏物品！","id":"100010341","price":-1,"rectype":"","url":"./pet/img_res/food/100010341.gif"},"_100010342":{"name":"天剑怒晶","type":"food","charm":0,"intel":2,"strong":3,"clean":0,"hunger":1800,"desc":"机甲旋风闹新年活动珍藏物品！","id":"100010342","price":-1,"rectype":"","url":"./pet/img_res/food/100010342.gif"},"_100010343":{"name":"福星金猪","type":"food","charm":6,"intel":6,"strong":6,"clean":0,"hunger":3000,"desc":"蛇年闹新春，福星送好礼活动珍藏物品！","id":"100010343","price":-1,"rectype":"","url":"./pet/img_res/food/100010343.gif"},"_100010344":{"name":"新年福饺","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1800,"desc":"蛇年闹新春，福星送好礼活动珍藏物品！","id":"100010344","price":-1,"rectype":"","url":"./pet/img_res/food/100010344.gif"},"_100010345":{"name":"新年福鱼","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"蛇年闹新春，福星送好礼活动珍藏物品！","id":"100010345","price":-1,"rectype":"","url":"./pet/img_res/food/100010345.gif"},"_100010346":{"name":"白玉芝麻汤圆","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"2013元宵节活动珍藏物品！","id":"100010346","price":-1,"rectype":"","url":"./pet/img_res/food/100010346.gif"},"_100010347":{"name":"碧玉花生汤圆","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"2013元宵节活动珍藏物品！","id":"100010347","price":-1,"rectype":"","url":"./pet/img_res/food/100010347.gif"},"_100010348":{"name":"紫玉板栗汤圆","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"2013元宵节活动珍藏物品！","id":"100010348","price":-1,"rectype":"","url":"./pet/img_res/food/100010348.gif"},"_100010349":{"name":"粉玉枣泥汤圆","type":"food","charm":4,"intel":0,"strong":0,"clean":0,"hunger":1200,"desc":"2013元宵节活动珍藏物品！","id":"100010349","price":-1,"rectype":"","url":"./pet/img_res/food/100010349.gif"},"_100010350":{"name":"金玉豆沙汤圆","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":900,"desc":"2013元宵节活动珍藏物品！","id":"100010350","price":-1,"rectype":"","url":"./pet/img_res/food/100010350.gif"},"_100010351":{"name":"千年普洱","type":"food","charm":180,"intel":180,"strong":0,"clean":0,"hunger":7200,"desc":"密藏探险活动珍藏物品！","id":"100010351","price":-1,"rectype":"","url":"./pet/img_res/food/100010351.gif"},"_100010352":{"name":"章鱼串烧","type":"food","charm":0,"intel":1,"strong":0,"clean":0,"hunger":1800,"desc":"密藏探险活动珍藏物品！","id":"100010352","price":-1,"rectype":"","url":"./pet/img_res/food/100010352.gif"},"_100010353":{"name":"白巧克力","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"爱神塔之战活动珍藏物品！","id":"100010353","price":-1,"rectype":"","url":"./pet/img_res/food/100010353.gif"},"_100010354":{"name":"红色糖果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"糖果大作战活动绝版物品！","id":"100010354","price":-1,"rectype":"","url":"./pet/img_res/food/100010354.gif","outOfPrint":true},"_100010355":{"name":"蓝色糖果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"糖果大作战活动绝版物品！","id":"100010355","price":-1,"rectype":"","url":"./pet/img_res/food/100010355.gif","outOfPrint":true},"_100010356":{"name":"清新薄荷糖","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"糖果大作战活动绝版物品！","id":"100010356","price":-1,"rectype":"","url":"./pet/img_res/food/100010356.gif","outOfPrint":true},"_100010357":{"name":"软软棉花糖","type":"food","charm":0,"intel":0,"strong":4,"clean":0,"hunger":1800,"desc":"糖果大作战活动绝版物品！","id":"100010357","price":-1,"rectype":"","url":"./pet/img_res/food/100010357.gif","outOfPrint":true},"_100010358":{"name":"记忆糖果","type":"food","charm":0,"intel":1,"strong":0,"clean":0,"hunger":960,"desc":"翻翻乐活动珍藏物品！","id":"100010358","price":-1,"rectype":"","url":"./pet/img_res/food/100010358.gif"},"_100010359":{"name":"时间汽水","type":"food","charm":4,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"翻翻乐活动珍藏物品！","id":"100010359","price":-1,"rectype":"","url":"./pet/img_res/food/100010359.gif"},"_100010360":{"name":"春意浓饮料","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1800,"desc":"植物连连看活动珍藏物品！","id":"100010360","price":-1,"rectype":"","url":"./pet/img_res/food/100010360.gif"},"_100010361":{"name":"踏青糖画","type":"food","charm":6,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"植物连连看活动珍藏物品！","id":"100010361","price":-1,"rectype":"","url":"./pet/img_res/food/100010361.gif"},"_100010362":{"name":"雪顶含翠","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":3000,"desc":"查来茬去活动珍藏物品！","id":"100010362","price":-1,"rectype":"","url":"./pet/img_res/food/100010362.gif"},"_100010363":{"name":"暖暖奶瓶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"2013年母亲节活动绝版物品。","id":"100010363","price":-1,"rectype":"","url":"./pet/img_res/food/100010363.gif","outOfPrint":true},"_100010364":{"name":"安培奶粉","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":1500,"desc":"2013年母亲节活动绝版物品。","id":"100010364","price":-1,"rectype":"","url":"./pet/img_res/food/100010364.gif","outOfPrint":true},"_100010365":{"name":"金花蛋","type":"food","charm":0,"intel":6,"strong":0,"clean":0,"hunger":1800,"desc":"打蛋蛋抢绝版活动珍藏物品！","id":"100010365","price":-1,"rectype":"","url":"./pet/img_res/food/100010365.gif","outOfPrint":true},"_100010366":{"name":"唐伯虎棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010366","price":-1,"rectype":"","url":"./pet/img_res/food/100010366.gif"},"_100010367":{"name":"祝枝山棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010367","price":-1,"rectype":"","url":"./pet/img_res/food/100010367.gif"},"_100010368":{"name":"文征明棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010368","price":-1,"rectype":"","url":"./pet/img_res/food/100010368.gif"},"_100010369":{"name":"徐祯卿棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010369","price":-1,"rectype":"","url":"./pet/img_res/food/100010369.gif"},"_100010370":{"name":"Q博士棒棒糖","type":"food","charm":0,"intel":6,"strong":0,"clean":0,"hunger":1440,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010370","price":-1,"rectype":"","url":"./pet/img_res/food/100010370.gif"},"_100010371":{"name":"爱因斯坦棒棒糖","type":"food","charm":0,"intel":4,"strong":0,"clean":0,"hunger":1080,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010371","price":-1,"rectype":"","url":"./pet/img_res/food/100010371.gif"},"_100010372":{"name":"秀才棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010372","price":-1,"rectype":"","url":"./pet/img_res/food/100010372.gif"},"_100010373":{"name":"榜眼棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010373","price":-1,"rectype":"","url":"./pet/img_res/food/100010373.gif"},"_100010374":{"name":"状元棒棒糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1440,"desc":"六月企鹅答题挑战赛珍藏物品！","id":"100010374","price":-1,"rectype":"","url":"./pet/img_res/food/100010374.gif"},"_100010375":{"name":"杂果冻饮","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1400,"desc":"水果大亨活动珍藏物品！","id":"100010375","price":-1,"rectype":"","url":"./pet/img_res/food/100010375.gif"},"_100010376":{"name":"水果拼盘","type":"food","charm":6,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"水果大亨活动珍藏物品！","id":"100010376","price":-1,"rectype":"","url":"./pet/img_res/food/100010376.gif"},"_100010377":{"name":"魔幻跳跳糖","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1800,"desc":"魔幻通天塔珍藏物品！","id":"100010377","price":-1,"rectype":"","url":"./pet/img_res/food/100010377.gif"},"_100010378":{"name":"佳得力","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"企鹅爱跑酷珍藏物品！","id":"100010378","price":-1,"rectype":"","url":"./pet/img_res/food/100010378.gif"},"_100010379":{"name":"跑酷冰棒","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"企鹅爱跑酷珍藏物品！","id":"100010379","price":-1,"rectype":"","url":"./pet/img_res/food/100010379.gif"},"_100010380":{"name":"跑酷能量水","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1080,"desc":"企鹅爱跑酷珍藏物品！","id":"100010380","price":-1,"rectype":"","url":"./pet/img_res/food/100010380.gif"},"_100010381":{"name":"跑酷雪糕","type":"food","charm":6,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"企鹅爱跑酷珍藏物品！","id":"100010381","price":-1,"rectype":"","url":"./pet/img_res/food/100010381.gif"},"_100010382":{"name":"农牧大餐","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":3000,"desc":"QQ宠物QQ农场爱心结缘活动珍藏物品！","id":"100010382","price":-1,"rectype":"","url":"./pet/img_res/food/100010382.gif"},"_100010383":{"name":"甜蜜八周年","type":"food","charm":20,"intel":20,"strong":20,"clean":0,"hunger":3000,"desc":"QQ宠物八周年绝版珍藏物品！","id":"100010383","price":-1,"rectype":"","url":"./pet/img_res/food/100010383.gif","outOfPrint":true},"_100010384":{"name":"奶油蜡烛","type":"food","charm":12,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"QQ宠物八周年绝版珍藏物品！","id":"100010384","price":-1,"rectype":"","url":"./pet/img_res/food/100010384.gif","outOfPrint":true},"_100010385":{"name":"迷恋果","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":1440,"desc":"QQ宠物企鹅8周年许愿季珍藏物品！","id":"100010385","price":-1,"rectype":"","url":"./pet/img_res/food/100010385.gif"},"_100010386":{"name":"高黎贡特产粉糕","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":900,"desc":"走进高黎贡公益活动珍藏物品！","id":"100010386","price":-1,"rectype":"","url":"./pet/img_res/food/100010386.gif"},"_100010387":{"name":"啾啾曲奇饼","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"动物拯救大冒险活动爱心珍藏物品！","id":"100010387","price":-1,"rectype":"","url":"./pet/img_res/food/100010387.gif"},"_100010388":{"name":"仔仔小馒头","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":1800,"desc":"动物拯救大冒险活动爱心珍藏物品！","id":"100010388","price":-1,"rectype":"","url":"./pet/img_res/food/100010388.gif"},"_100010389":{"name":"守卫能量棒","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1800,"desc":"守卫农庄活动珍藏物品","id":"100010389","price":-1,"rectype":"","url":"./pet/img_res/food/100010389.gif"},"_100010390":{"name":"鲨鱼罐头","type":"food","charm":15,"intel":15,"strong":15,"clean":0,"hunger":1800,"desc":"天天鱼乐活动获得！","id":"100010390","price":-1,"rectype":"","url":"./pet/img_res/food/100010390.gif"},"_100010391":{"name":"红烧多宝鱼","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"天天鱼乐活动获得！","id":"100010391","price":-1,"rectype":"","url":"./pet/img_res/food/100010391.gif"},"_100010392":{"name":"笑脸手链","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1800,"desc":"原版表缺项，按素材补录","id":"100010392","price":-1,"rectype":"","url":"./pet/img_res/food/100010392.gif"},"_100010393":{"name":"蜜本南瓜汁","type":"food","charm":0,"intel":20,"strong":0,"clean":0,"hunger":2000,"desc":"这个神奇的南瓜汁助小企鹅智力倍增！","id":"100010393","price":-1,"rectype":"","url":"./pet/img_res/food/100010393.gif"},"_100010394":{"name":"黄狼南瓜汁","type":"food","charm":0,"intel":30,"strong":0,"clean":0,"hunger":3000,"desc":"好喝又富有极佳营养价值的南瓜汁！","id":"100010394","price":-1,"rectype":"","url":"./pet/img_res/food/100010394.gif"},"_100010395":{"name":"XO牛肉粒","type":"food","charm":15,"intel":15,"strong":15,"clean":0,"hunger":1800,"desc":"万圣节狂欢派对活动获得！","id":"100010395","price":-1,"rectype":"","url":"./pet/img_res/food/100010395.gif"},"_100010396":{"name":"疯狂棒棒冰","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"万圣节狂欢派对活动获得！","id":"100010396","price":-1,"rectype":"","url":"./pet/img_res/food/100010396.gif"},"_100010397":{"name":"草莓甜甜圈","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"万圣节狂欢派对活动获得！","id":"100010397","price":-1,"rectype":"","url":"./pet/img_res/food/100010397.gif"},"_100010398":{"name":"近卫军徽章","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":1,"desc":"永久近卫军活动中获得！","id":"100010398","price":-1,"rectype":"","url":"./pet/img_res/food/100010398.gif"},"_100010399":{"name":"圣战令牌","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":10,"desc":"永久近卫军活动中获得！","id":"100010399","price":-1,"rectype":"","url":"./pet/img_res/food/100010399.gif"},"_100010400":{"name":"草莓夹心糖","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1800,"desc":"感恩糖果大作战活动珍藏物品！","id":"100010400","price":-1,"rectype":"","url":"./pet/img_res/food/100010400.gif"},"_100010401":{"name":"感恩棒棒糖","type":"food","charm":15,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"感恩糖果大作战活动珍藏物品！","id":"100010401","price":-1,"rectype":"","url":"./pet/img_res/food/100010401.gif"},"_100010402":{"name":"大磨盘南瓜汁","type":"food","charm":0,"intel":30,"strong":0,"clean":0,"hunger":3000,"desc":"感恩大回馈活动中获得！","id":"100010402","price":-1,"rectype":"","url":"./pet/img_res/food/100010402.gif"},"_100010403":{"name":"捍卫者徽章","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1,"desc":"安全陪伴活动中获得！","id":"100010403","price":-1,"rectype":"","url":"./pet/img_res/food/100010403.gif"},"_100010404":{"name":"芝华士","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1080,"desc":"夜店之王活动中获得！","id":"100010404","price":-1,"rectype":"","url":"./pet/img_res/food/100010404.gif"},"_100010405":{"name":"人头马","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1440,"desc":"夜店之王活动中获得！","id":"100010405","price":-1,"rectype":"","url":"./pet/img_res/food/100010405.gif"},"_100010406":{"name":"新奥尔良烤火鸡","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"感恩大回馈活动中获得！","id":"100010406","price":-1,"rectype":"","url":"./pet/img_res/food/100010406.gif"},"_100010407":{"name":"剑灵龙凤汤","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":360,"desc":"宠物欢庆剑灵开放测试活动专属绝版物品","id":"100010407","price":-1,"rectype":"","url":"./pet/img_res/food/100010407.gif","outOfPrint":true},"_100010408":{"name":"剑灵雪莲露","type":"food","charm":0,"intel":5,"strong":5,"clean":0,"hunger":1800,"desc":"宠物欢庆剑灵开放测试活动专属绝版物品","id":"100010408","price":-1,"rectype":"","url":"./pet/img_res/food/100010408.gif","outOfPrint":true},"_100010409":{"name":"问情花","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"六界仙尊活动中获得！","id":"100010409","price":-1,"rectype":"","url":"./pet/img_res/food/100010409.gif"},"_100010410":{"name":"六界仙丹","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"六界仙尊活动中获得！","id":"100010410","price":-1,"rectype":"","url":"./pet/img_res/food/100010410.gif"},"_100010411":{"name":"圣甲虫之心","type":"food","charm":100,"intel":0,"strong":0,"clean":0,"hunger":6000,"desc":"传说中法老赐给宠姬的宝石，举世无双！","id":"100010411","price":-1,"rectype":"","url":"./pet/img_res/food/100010411.gif"},"_100010412":{"name":"七色花","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"七雄Q传活动中获得！","id":"100010412","price":-1,"rectype":"","url":"./pet/img_res/food/100010412.gif"},"_100010413":{"name":"雄黄酒","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"七雄Q传活动中获得！","id":"100010413","price":-1,"rectype":"","url":"./pet/img_res/food/100010413.gif"},"_100010414":{"name":"牛腿南瓜汁","type":"food","charm":0,"intel":30,"strong":0,"clean":0,"hunger":3000,"desc":"元旦回馈活动中获得！","id":"100010414","price":-1,"rectype":"","url":"./pet/img_res/food/100010414.gif"},"_100010415":{"name":"驯龙蛋","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1800,"desc":"元旦回馈活动中获得！","id":"100010415","price":-1,"rectype":"","url":"./pet/img_res/food/100010415.gif"},"_100010416":{"name":"粉钻2013年纪念章","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1,"desc":"2013粉钻回馈活动中获得！","id":"100010416","price":-1,"rectype":"","url":"./pet/img_res/food/100010416.gif"},"_100010417":{"name":"元宝年糕","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1080,"desc":"2013粉钻回馈活动中获得！","id":"100010417","price":-1,"rectype":"","url":"./pet/img_res/food/100010417.gif"},"_100010418":{"name":"粉心巧克力","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1440,"desc":"2013粉钻回馈活动中获得！","id":"100010418","price":-1,"rectype":"","url":"./pet/img_res/food/100010418.gif"},"_100010419":{"name":"小磨盘南瓜汁","type":"food","charm":0,"intel":0,"strong":30,"clean":0,"hunger":3000,"desc":"火龙行动活动中获得！","id":"100010419","price":-1,"rectype":"","url":"./pet/img_res/food/100010419.gif"},"_100010420":{"name":"灵泉露","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"战龙三国活动中获得！","id":"100010420","price":-1,"rectype":"","url":"./pet/img_res/food/100010420.gif"},"_100010421":{"name":"龙丹","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"战龙三国活动中获得！","id":"100010421","price":-1,"rectype":"","url":"./pet/img_res/food/100010421.gif"},"_100010422":{"name":"欢快饺","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"100010422","price":-1,"rectype":"","url":"./pet/img_res/food/100010422.gif"},"_100010423":{"name":"年夜大乱炖","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":900,"desc":"","id":"100010423","price":-1,"rectype":"","url":"./pet/img_res/food/100010423.gif"},"_100010424":{"name":"九尾铁板烧","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"100010424","price":-1,"rectype":"","url":"./pet/img_res/food/100010424.gif"},"_100010425":{"name":"年夜大餐","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":3600,"desc":"","id":"100010425","price":-1,"rectype":"","url":"./pet/img_res/food/100010425.gif"},"_100010426":{"name":"马蹄糕","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":3000,"desc":"万马奔腾贺新春珍藏绝版物品！","id":"100010426","price":-1,"rectype":"","url":"./pet/img_res/food/100010426.gif","outOfPrint":true},"_100010427":{"name":"蛇南瓜汁","type":"food","charm":0,"intel":0,"strong":30,"clean":0,"hunger":3000,"desc":"企鹅弹弹乐活动获得！","id":"100010427","price":-1,"rectype":"","url":"./pet/img_res/food/100010427.gif"},"_100010428":{"name":"三清回气丸","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"塔防三国志活动中获得！","id":"100010428","price":-1,"rectype":"","url":"./pet/img_res/food/100010428.gif"},"_100010429":{"name":"五行续命丹","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"塔防三国志活动中获得！","id":"100010429","price":-1,"rectype":"","url":"./pet/img_res/food/100010429.gif"},"_100010430":{"name":"大包子","type":"food","charm":1,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"塔防三国志活动中获得！","id":"100010430","price":-1,"rectype":"","url":"./pet/img_res/food/100010430.gif"},"_100010431":{"name":"压缩能量块","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":5000,"desc":"外星人赖以为生的食物。你也想尝尝么？","id":"100010431","price":-1,"rectype":"","url":"./pet/img_res/food/100010431.gif"},"_100010432":{"name":"甜心棒棒糖","type":"food","charm":28,"intel":28,"strong":28,"clean":0,"hunger":180,"desc":"全民消除赢好礼活动珍藏绝版！","id":"100010432","price":-1,"rectype":"","url":"./pet/img_res/food/100010432.gif","outOfPrint":true},"_100010433":{"name":"火元素结晶","type":"food","charm":0,"intel":1,"strong":0,"clean":0,"hunger":3600,"desc":"传说集齐五种元素的结晶，可以召唤神龙！","id":"100010433","price":-1,"rectype":"","url":"./pet/img_res/food/100010433.gif"},"_100010434":{"name":"初级仙露","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"斩仙活动中获得！","id":"100010434","price":-1,"rectype":"","url":"./pet/img_res/food/100010434.gif"},"_100010435":{"name":"精装生命药水","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"斩仙活动中获得！","id":"100010435","price":-1,"rectype":"","url":"./pet/img_res/food/100010435.gif"},"_100010436":{"name":"美味巧克力","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":1440,"desc":"端午节活动获得！","id":"100010436","price":-1,"rectype":"","url":"./pet/img_res/food/100010436.gif"},"_100010437":{"name":"化形灵参","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"焚天合作活动中获得！","id":"100010437","price":-1,"rectype":"","url":"./pet/img_res/food/100010437.gif"},"_100010438":{"name":"千年灵芝","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"焚天合作活动中获得！","id":"100010438","price":-1,"rectype":"","url":"./pet/img_res/food/100010438.gif"},"_100010439":{"name":"黄金奖杯","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1,"desc":"原版表缺项，按素材补录","id":"100010439","price":-1,"rectype":"","url":"./pet/img_res/food/100010439.gif"},"_100010440":{"name":"青春纪念章","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1,"desc":"向青春致敬活动中获得！","id":"100010440","price":-1,"rectype":"","url":"./pet/img_res/food/100010440.gif"},"_100010441":{"name":"青春白玫瑰","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1,"desc":"向青春致敬活动中获得！","id":"100010441","price":-1,"rectype":"","url":"./pet/img_res/food/100010441.gif"},"_100010442":{"name":"青春蓝玫瑰","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1,"desc":"向青春致敬活动中获得！","id":"100010442","price":-1,"rectype":"","url":"./pet/img_res/food/100010442.gif"},"_100010443":{"name":"青春红玫瑰","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":1,"desc":"向青春致敬活动中获得！","id":"100010443","price":-1,"rectype":"","url":"./pet/img_res/food/100010443.gif"},"_100010444":{"name":"糖果手雷","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":0,"desc":"CF专属绝版！","id":"100010444","price":-1,"rectype":"","url":"./pet/img_res/food/100010444.gif","outOfPrint":true},"_100010445":{"name":"拳之月饼","type":"food","charm":0,"intel":0,"strong":20,"clean":0,"hunger":0,"desc":"蕴含力量之源的月饼","id":"100010445","price":-1,"rectype":"","url":"./pet/img_res/food/100010445.gif"},"_100010446":{"name":"剪之月饼","type":"food","charm":0,"intel":20,"strong":0,"clean":0,"hunger":0,"desc":"蕴含智慧之源的月饼","id":"100010446","price":-1,"rectype":"","url":"./pet/img_res/food/100010446.gif"},"_100010447":{"name":"布之月饼","type":"food","charm":20,"intel":0,"strong":0,"clean":0,"hunger":0,"desc":"蕴含魅力之源的月饼","id":"100010447","price":-1,"rectype":"","url":"./pet/img_res/food/100010447.gif"},"_100010448":{"name":"大衍飞升丹","type":"food","charm":50,"intel":50,"strong":50,"clean":0,"hunger":1,"desc":"炼丹术的极致：立地飞升！","id":"100010448","price":-1,"rectype":"","url":"./pet/img_res/food/100010448.gif"},"_100010449":{"name":"美食节大餐","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":4800,"desc":"美食节限定！","id":"100010449","price":-1,"rectype":"","url":"./pet/img_res/food/100010449.gif"},"_100010450":{"name":"红色药水","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"Q战神合作活动中获得！","id":"100010450","price":-1,"rectype":"","url":"./pet/img_res/food/100010450.gif"},"_100010451":{"name":"九转仙灵露","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"Q战神合作活动中获得！","id":"100010451","price":-1,"rectype":"","url":"./pet/img_res/food/100010451.gif"},"_100010452":{"name":"赤焰宝珠","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1440,"desc":"原版表缺项，按素材补录","id":"100010452","price":-1,"rectype":"","url":"./pet/img_res/food/100010452.gif"},"_100010453":{"name":"紫焰令牌","type":"food","charm":0,"intel":5,"strong":0,"clean":0,"hunger":1440,"desc":"原版表缺项，按素材补录","id":"100010453","price":-1,"rectype":"","url":"./pet/img_res/food/100010453.gif"},"_100010454":{"name":"缤纷雪飘","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":3600,"desc":"夏日冰爽店活动获得？毛球大暴走事件纪念！","id":"100010454","price":-1,"rectype":"","url":"./pet/img_res/food/100010454.gif"},"_100010455":{"name":"陪伴勋章","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1,"desc":"陪伴，是最长情的告白","id":"100010455","price":-1,"rectype":"","url":"./pet/img_res/food/100010455.gif"},"_100010456":{"name":"浓情巧克力","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1,"desc":"陪伴，是最长情的告白","id":"100010456","price":-1,"rectype":"","url":"./pet/img_res/food/100010456.gif"},"_100010457":{"name":"传奇糖果","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1,"desc":"陪伴，是最长情的告白","id":"100010457","price":-1,"rectype":"","url":"./pet/img_res/food/100010457.gif"},"_100010458":{"name":"淡雅之香","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":1,"desc":"陪伴，是最长情的告白","id":"100010458","price":-1,"rectype":"","url":"./pet/img_res/food/100010458.gif"},"_100010459":{"name":"星际漂流瓶","type":"food","charm":0,"intel":3,"strong":6,"clean":0,"hunger":1800,"desc":"有些弱小的文明无力展开太空探索，只能把希望寄托在运气上！","id":"100010459","price":-1,"rectype":"","url":"./pet/img_res/food/100010459.gif"},"_100010460":{"name":"灯谜元宵","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":1800,"desc":"猜灯谜，过元宵！","id":"100010460","price":-1,"rectype":"","url":"./pet/img_res/food/100010460.gif"},"_100010461":{"name":"十年绝版蛋糕","type":"food","charm":100,"intel":100,"strong":100,"clean":0,"hunger":7200,"desc":"十周年活动珍藏物品","id":"100010461","price":-1,"rectype":"","url":"./pet/img_res/food/100010461.gif","outOfPrint":true},"_100010462":{"name":"粉钻10周年纪念章","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1000,"desc":"粉钻梦依旧活动珍藏物品","id":"100010462","price":-1,"rectype":"","url":"./pet/img_res/food/100010462.gif"},"_100010463":{"name":"粉钻银钥匙","type":"food","charm":4,"intel":4,"strong":4,"clean":0,"hunger":1000,"desc":"粉钻梦依旧活动珍藏物品","id":"100010463","price":-1,"rectype":"","url":"./pet/img_res/food/100010463.gif"},"_100010464":{"name":"粉钻金钥匙","type":"food","charm":6,"intel":6,"strong":6,"clean":0,"hunger":1000,"desc":"粉钻梦依旧活动珍藏物品","id":"100010464","price":-1,"rectype":"","url":"./pet/img_res/food/100010464.gif"},"_100010465":{"name":"南极洲之夏","type":"food","charm":20,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"贪婪的海豹活动珍藏品，一杯鸡尾酒能让企鹅变得更有魅力！","id":"100010465","price":-1,"rectype":"","url":"./pet/img_res/food/100010465.gif"},"_100010466":{"name":"深海鱼油","type":"food","charm":0,"intel":20,"strong":0,"clean":0,"hunger":1080,"desc":"贪婪的海豹珍藏品，一颗深海鱼油胶囊，让企鹅闪烁智慧的光芒！","id":"100010466","price":-1,"rectype":"","url":"./pet/img_res/food/100010466.gif"},"_100010467":{"name":"皇家鹅粮","type":"food","charm":0,"intel":0,"strong":6,"clean":0,"hunger":1440,"desc":"抓鹅小能手珍藏物品！","id":"100010467","price":-1,"rectype":"","url":"./pet/img_res/food/100010467.gif"},"_100010468":{"name":"韭菜虾仁饺","type":"food","charm":0,"intel":0,"strong":7,"clean":0,"hunger":1800,"desc":"迎冬回馈珍藏品！","id":"100010468","price":-1,"rectype":"","url":"./pet/img_res/food/100010468.gif"},"_100010469":{"name":"粉钻金杯2016","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"粉钻以梦为马活动中获得！","id":"100010469","price":-1,"rectype":"","url":"./pet/img_res/food/100010469.gif"},"_100010470":{"name":"粉钻银杯2016","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1080,"desc":"粉钻以梦为马活动中获得！","id":"100010470","price":-1,"rectype":"","url":"./pet/img_res/food/100010470.gif"},"_100010471":{"name":"粉钻金冠","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"","id":"100010471","price":-1,"rectype":"","url":"./pet/img_res/food/100010471.gif"},"_100010472":{"name":"粉钻银冠","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1080,"desc":"","id":"100010472","price":-1,"rectype":"","url":"./pet/img_res/food/100010472.gif"},"_100010473":{"name":"祭祖酒","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":888,"desc":"2016新年活动绝版物品~","id":"100010473","price":-1,"rectype":"","url":"./pet/img_res/food/100010473.gif","outOfPrint":true},"_100010474":{"name":"强效记忆丸","type":"food","charm":0,"intel":0,"strong":6,"clean":0,"hunger":2888,"desc":"2016新年活动绝版物品~","id":"100010474","price":-1,"rectype":"","url":"./pet/img_res/food/100010474.gif","outOfPrint":true},"_100010475":{"name":"鱼摆摆","type":"food","charm":0,"intel":6,"strong":0,"clean":0,"hunger":666,"desc":"2016新年活动绝版物品~","id":"100010475","price":-1,"rectype":"","url":"./pet/img_res/food/100010475.gif","outOfPrint":true},"_100010476":{"name":"鱼糕糕","type":"food","charm":6,"intel":0,"strong":0,"clean":0,"hunger":999,"desc":"2016新年活动绝版物品~","id":"100010476","price":-1,"rectype":"","url":"./pet/img_res/food/100010476.gif","outOfPrint":true},"_100010477":{"name":"猴菇饼干","type":"food","charm":0,"intel":0,"strong":6,"clean":0,"hunger":666,"desc":"2016新年活动绝版物品~","id":"100010477","price":-1,"rectype":"","url":"./pet/img_res/food/100010477.gif","outOfPrint":true},"_100010478":{"name":"爱心便当","type":"food","charm":2,"intel":0,"strong":0,"clean":0,"hunger":999,"desc":"2016情人节限定！","id":"100010478","price":-1,"rectype":"","url":"./pet/img_res/food/100010478.gif"},"_100010479":{"name":"端午精品粽","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":2016,"desc":"2016端午献礼！","id":"100010479","price":-1,"rectype":"","url":"./pet/img_res/food/100010479.gif"},"_100010480":{"name":"小西瓜","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":1800,"desc":"直击灵魂的——小西瓜！","id":"100010480","price":-1,"rectype":"","url":"./pet/img_res/food/100010480.gif"},"_100010481":{"name":"黑美人瓜","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1800,"desc":"直击灵魂的——黑美人瓜！","id":"100010481","price":-1,"rectype":"","url":"./pet/img_res/food/100010481.gif"},"_100010482":{"name":"麒麟瓜","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1800,"desc":"直击灵魂的——麒麟瓜！","id":"100010482","price":-1,"rectype":"","url":"./pet/img_res/food/100010482.gif"},"_100010483":{"name":"爱心手雷","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":1800,"desc":"来自CF的爱心福利！","id":"100010483","price":-1,"rectype":"","url":"./pet/img_res/food/100010483.gif"},"_100010484":{"name":"雄黄酒手雷","type":"food","charm":10,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"来自CF的爱心福利！","id":"100010484","price":-1,"rectype":"","url":"./pet/img_res/food/100010484.gif"},"_100010485":{"name":"11周年纪念银冠","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1080,"desc":"11周年限定绝版物品！","id":"100010485","price":-1,"rectype":"","url":"./pet/img_res/food/100010485.gif","outOfPrint":true},"_100010486":{"name":"11周年纪念金冠","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"11周年限定绝版物品！","id":"100010486","price":-1,"rectype":"","url":"./pet/img_res/food/100010486.gif","outOfPrint":true},"_100010487":{"name":"七夕同心结","type":"food","charm":2,"intel":2,"strong":2,"clean":0,"hunger":999,"desc":"白头偕老，永结同心。","id":"100010487","price":-1,"rectype":"","url":"./pet/img_res/food/100010487.gif"},"_100010488":{"name":"巴哈马木雕","type":"food","charm":4,"intel":4,"strong":4,"clean":0,"hunger":1800,"desc":"巴哈马特产，仔细看好像是一只企鹅呢！","id":"100010488","price":-1,"rectype":"","url":"./pet/img_res/food/100010488.gif"},"_100010489":{"name":"星座蛋糕-天秤座","type":"food","charm":20,"intel":0,"strong":0,"clean":0,"hunger":3000,"desc":"星座密语活动珍藏物品！","id":"100010489","price":-1,"rectype":"","url":"./pet/img_res/food/100010489.gif"},"_100010490":{"name":"美食节烤翅","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":900,"desc":"2016美食季新绝版！","id":"100010490","price":-1,"rectype":"","url":"./pet/img_res/food/100010490.gif","outOfPrint":true},"_100010491":{"name":"美食节蛋糕","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":900,"desc":"2016美食季新绝版！","id":"100010491","price":-1,"rectype":"","url":"./pet/img_res/food/100010491.gif","outOfPrint":true},"_100010492":{"name":"粉钻青春露","type":"food","charm":5,"intel":5,"strong":5,"clean":0,"hunger":1080,"desc":"2017春节粉钻活动珍藏物品！","id":"100010492","price":-1,"rectype":"","url":"./pet/img_res/food/100010492.gif"},"_100010493":{"name":"粉钻神仙水","type":"food","charm":10,"intel":10,"strong":10,"clean":0,"hunger":1800,"desc":"2017春节粉钻活动珍藏物品！","id":"100010493","price":-1,"rectype":"","url":"./pet/img_res/food/100010493.gif"},"_100010494":{"name":"星座蛋糕-白羊座","type":"food","charm":0,"intel":20,"strong":0,"clean":0,"hunger":3000,"desc":"星座密语活动珍藏物品！","id":"100010494","price":-1,"rectype":"","url":"./pet/img_res/food/100010494.gif"},"_100010495":{"name":"King·盛宴","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":1200,"desc":"2017暑期周年庆献礼！","id":"100010495","price":-1,"rectype":"","url":"./pet/img_res/food/100010495.gif"},"_100010496":{"name":"King·生日蛋糕","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":2000,"desc":"2017暑期周年庆献礼！","id":"100010496","price":-1,"rectype":"","url":"./pet/img_res/food/100010496.gif"},"_100010497":{"name":"星座蛋糕-狮子座","type":"food","charm":0,"intel":0,"strong":20,"clean":0,"hunger":3000,"desc":"星座密语活动珍藏物品！","id":"100010497","price":-1,"rectype":"","url":"./pet/img_res/food/100010497.gif"},"_100010498":{"name":"汪汪粮","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1800,"desc":"2018春节活动绝版物品！","id":"100010498","price":-1,"rectype":"","url":"./pet/img_res/food/100010498.gif","outOfPrint":true},"_100010499":{"name":"汪汪骨棒","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1800,"desc":"2018春节活动绝版道具！","id":"100010499","price":-1,"rectype":"","url":"./pet/img_res/food/100010499.gif","outOfPrint":true},"_10011014":{"name":"挚爱蛋糕","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":180,"desc":"","id":"10011014","price":-1,"rectype":"","url":"./pet/img_res/food/10011014.gif"},"_10011015":{"name":"营养早餐","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":180,"desc":"","id":"10011015","price":-1,"rectype":"","url":"./pet/img_res/food/10011015.gif"},"_10011016":{"name":"中华素面","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":360,"desc":"","id":"10011016","price":-1,"rectype":"","url":"./pet/img_res/food/10011016.gif"},"_10012001":{"name":"钙片","type":"food","charm":0,"intel":8,"strong":0,"clean":0,"hunger":720,"desc":"","id":"10012001","price":-1,"rectype":"","url":"./pet/img_res/food/10012001.gif"},"_10012002":{"name":"维生素","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":360,"desc":"","id":"10012002","price":-1,"rectype":"","url":"./pet/img_res/food/10012002.gif"},"_10013003":{"name":"大话梅","type":"food","charm":1,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"","id":"10013003","price":-1,"rectype":"","url":"./pet/img_res/food/10013003.gif"},"_10013004":{"name":"可乐","type":"food","charm":1,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"","id":"10013004","price":-1,"rectype":"","url":"./pet/img_res/food/10013004.gif"},"_10013005":{"name":"雪碧","type":"food","charm":1,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"","id":"10013005","price":-1,"rectype":"","url":"./pet/img_res/food/10013005.gif"},"_10013006":{"name":"冰淇淋","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"10013006","price":-1,"rectype":"","url":"./pet/img_res/food/10013006.gif"},"_10013007":{"name":"棒棒糖","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"10013007","price":-1,"rectype":"","url":"./pet/img_res/food/10013007.gif"},"_10013008":{"name":"巧克力","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"10013008","price":-1,"rectype":"","url":"./pet/img_res/food/10013008.gif"},"_10013009":{"name":"牛肉干","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"10013009","price":-1,"rectype":"","url":"./pet/img_res/food/10013009.gif"},"_10013010":{"name":"爱心波板糖","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"10013010","price":-1,"rectype":"","url":"./pet/img_res/food/10013010.gif"},"_10013011":{"name":"安姆巧克力","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"10013011","price":-1,"rectype":"","url":"./pet/img_res/food/10013011.gif"},"_10013012":{"name":"甜心巧克力","type":"food","charm":12,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"10013012","price":-1,"rectype":"","url":"./pet/img_res/food/10013012.gif"},"_10013013":{"name":"香瓜果冻","type":"food","charm":15,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"10013013","price":-1,"rectype":"","url":"./pet/img_res/food/10013013.gif"},"_10013025":{"name":"福满香月饼","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"10013025","price":-1,"rectype":"","url":"./pet/img_res/food/10013025.gif"},"_10013026":{"name":"宫廷雅月饼","type":"food","charm":12,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"10013026","price":-1,"rectype":"","url":"./pet/img_res/food/10013026.gif"},"_10013027":{"name":"枫香金月饼","type":"food","charm":0,"intel":12,"strong":0,"clean":0,"hunger":900,"desc":"","id":"10013027","price":-1,"rectype":"","url":"./pet/img_res/food/10013027.gif"},"_10013028":{"name":"百家禧月饼","type":"food","charm":0,"intel":15,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"10013028","price":-1,"rectype":"","url":"./pet/img_res/food/10013028.gif"},"_10013029":{"name":"美年达","type":"food","charm":0,"intel":15,"strong":0,"clean":0,"hunger":900,"desc":"","id":"10013029","price":-1,"rectype":"","url":"./pet/img_res/food/10013029.gif"},"_102010001":{"name":"圈圈冰激凌","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":100,"desc":"","id":"102010001","price":5,"rectype":"new","url":"./pet/img_res/food/102010001.gif","needLevel":0},"_102010002":{"name":"跳跳玉米鱼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1140,"needLevel":10,"desc":"","id":"102010002","price":60,"rectype":"new","url":"./pet/img_res/food/102010002.gif"},"_102010003":{"name":"月光饼饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"needLevel":1,"hunger":200,"desc":"","id":"102010003","price":10,"rectype":"new","url":"./pet/img_res/food/102010003.gif"},"_102010004":{"name":"果味米米花","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"needLevel":3,"hunger":400,"desc":"","id":"102010004","price":20,"rectype":"new","url":"./pet/img_res/food/102010004.gif"},"_102010005":{"name":"炸虾盖饭","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3655,"desc":"","id":"102010005","price":215,"rectype":"recommand","url":"./pet/img_res/food/102010005.gif","needLevel":39},"_102010006":{"name":"蹦豆豆卷","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2790,"desc":"","id":"102010006","price":155,"rectype":"new","url":"./pet/img_res/food/102010006.gif","needLevel":28},"_102010007":{"name":"青松茶笋","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1330,"desc":"","id":"102010007","price":70,"needLevel":12,"rectype":"new","url":"./pet/img_res/food/102010007.gif"},"_102010008":{"name":"雨披蛋花","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3485,"desc":"","id":"102010008","price":205,"rectype":"hot","url":"./pet/img_res/food/102010008.gif","needLevel":37},"_102010009":{"name":"漂漂孔雀果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1425,"desc":"","id":"102010009","price":75,"rectype":"new","url":"./pet/img_res/food/102010009.gif","needLevel":13},"_102010010":{"name":"伟大可乐","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":600,"desc":"","id":"102010010","needLevel":5,"price":30,"rectype":"new","url":"./pet/img_res/food/102010010.gif"},"_102010011":{"name":"断码香肠","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3230,"desc":"","id":"102010011","price":190,"rectype":"hot","url":"./pet/img_res/food/102010011.gif","needLevel":34},"_102010012":{"name":"桃桃布丁","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":300,"desc":"","needLevel":2,"id":"102010012","price":15,"rectype":"new","url":"./pet/img_res/food/102010012.gif"},"_102010013":{"name":"怪怪巧克力","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2160,"desc":"","id":"102010013","price":120,"rectype":"new","url":"./pet/img_res/food/102010013.gif","needLevel":21},"_102010014":{"name":"西湖龙井","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":700,"needLevel":6,"desc":"","id":"102010014","price":35,"rectype":"new","url":"./pet/img_res/food/102010014.gif"},"_102010015":{"name":"下岛咖啡","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1520,"desc":"","id":"102010015","price":80,"rectype":"new","url":"./pet/img_res/food/102010015.gif","needLevel":14},"_102010016":{"name":"滴答果果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":500,"desc":"","id":"102010016","needLevel":4,"price":25,"rectype":"new","url":"./pet/img_res/food/102010016.gif"},"_102010017":{"name":"巴西烤肉排","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010017","price":-1,"rectype":"","url":"./pet/img_res/food/102010017.gif"},"_102010019":{"name":"巴西烤肉串","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"102010019","price":-1,"rectype":"","url":"./pet/img_res/food/102010019.gif"},"_102010020":{"name":"冰红茶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":800,"needLevel":7,"desc":"","id":"102010020","price":40,"rectype":"new","url":"./pet/img_res/food/102010020.gif"},"_102010021":{"name":"康师傅红茶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1615,"desc":"","id":"102010021","price":85,"rectype":"new","url":"./pet/img_res/food/102010021.gif","needLevel":15},"_102010022":{"name":"康师傅绿茶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1710,"desc":"","id":"102010022","price":90,"rectype":"new","url":"./pet/img_res/food/102010022.gif","needLevel":16},"_102010023":{"name":"金钢竹筒饭","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3520,"desc":"","id":"102010023","price":220,"rectype":"recommand","url":"./pet/img_res/food/102010023.gif","needLevel":40},"_102010024":{"name":"霹雳啪啦糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2250,"desc":"","id":"102010024","price":125,"rectype":"new","url":"./pet/img_res/food/102010024.gif","needLevel":22},"_102010025":{"name":"温泉溜溜蛋","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2880,"desc":"","id":"102010025","price":160,"rectype":"new","url":"./pet/img_res/food/102010025.gif","needLevel":29},"_102010026":{"name":"五彩沙拉","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1235,"desc":"","needLevel":11,"id":"102010026","price":65,"rectype":"new","url":"./pet/img_res/food/102010026.gif"},"_102010027":{"name":"蛋黄甩甩饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2070,"desc":"","id":"102010027","price":115,"rectype":"new","url":"./pet/img_res/food/102010027.gif","needLevel":20},"_102010028":{"name":"金玉良缘","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2890,"desc":"","id":"102010028","price":170,"rectype":"new","url":"./pet/img_res/food/102010028.gif","needLevel":30},"_102010029":{"name":"黑白棋子豆","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2975,"desc":"","id":"102010029","price":175,"rectype":"new","url":"./pet/img_res/food/102010029.gif","needLevel":31},"_102010030":{"name":"魔力香草草","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3060,"desc":"","id":"102010030","price":180,"rectype":"new","url":"./pet/img_res/food/102010030.gif","needLevel":32},"_102010031":{"name":"人参火果汁","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2520,"desc":"","id":"102010031","price":140,"rectype":"new","url":"./pet/img_res/food/102010031.gif","needLevel":25},"_102010032":{"name":"灵芝仙人掌","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2340,"desc":"","id":"102010032","price":130,"rectype":"new","url":"./pet/img_res/food/102010032.gif","needLevel":23},"_102010033":{"name":"彩虹鱼脆脆","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3400,"desc":"","id":"102010033","price":200,"rectype":"new","url":"./pet/img_res/food/102010033.gif","needLevel":36},"_102010034":{"name":"咯咯蛋蛋面","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3315,"desc":"","id":"102010034","price":195,"rectype":"new","url":"./pet/img_res/food/102010034.gif","needLevel":35},"_102010035":{"name":"团团圆圆饼","type":"food","charm":1,"intel":1,"strong":1,"clean":0,"hunger":360,"desc":"","id":"102010035","price":-1,"rectype":"","url":"./pet/img_res/food/102010035.gif"},"_102010036":{"name":"千里婵娟饼","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010036","price":-1,"rectype":"","url":"./pet/img_res/food/102010036.gif"},"_102010037":{"name":"绮乐无穷饼","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":1080,"desc":"","id":"102010037","price":-1,"rectype":"","url":"./pet/img_res/food/102010037.gif"},"_102010038":{"name":"玲珑心意饼","type":"food","charm":0,"intel":3,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010038","price":-1,"rectype":"","url":"./pet/img_res/food/102010038.gif"},"_102010039":{"name":"火鸡大餐","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010039","price":-1,"rectype":"","url":"./pet/img_res/food/102010039.gif"},"_102010040":{"name":"怪怪南瓜饼","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"102010040","price":-1,"rectype":"","url":"./pet/img_res/food/102010040.gif"},"_102010041":{"name":"清新菊花酒","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010041","price":-1,"rectype":"","url":"./pet/img_res/food/102010041.gif"},"_102010042":{"name":"层层重阳糕","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"102010042","price":-1,"rectype":"","url":"./pet/img_res/food/102010042.gif"},"_102010043":{"name":"砰砰瓜","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010043","price":-1,"rectype":"","url":"./pet/img_res/food/102010043.gif"},"_102010044":{"name":"蜜汁乳香骨","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010044","price":-1,"rectype":"","url":"./pet/img_res/food/102010044.gif"},"_102010045":{"name":"红莓苔子果酱","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"102010045","price":-1,"rectype":"","url":"./pet/img_res/food/102010045.gif"},"_102010046":{"name":"雪山蜜梨","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010046","price":-1,"rectype":"","url":"./pet/img_res/food/102010046.gif"},"_102010047":{"name":"深山雨露","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":540,"desc":"","id":"102010047","price":-1,"rectype":"","url":"./pet/img_res/food/102010047.gif"},"_102010048":{"name":"丹参甘草饮","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"102010048","price":-1,"rectype":"","url":"./pet/img_res/food/102010048.gif"},"_102010049":{"name":"Q宠婴儿牛奶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":360,"desc":"","id":"102010049","price":-1,"rectype":"","url":"./pet/img_res/food/102010049.gif"},"_102010050":{"name":"火山牛排","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010050","price":-1,"rectype":"","url":"./pet/img_res/food/102010050.gif"},"_102010051":{"name":"奇香豆腐","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"102010051","price":-1,"rectype":"","url":"./pet/img_res/food/102010051.gif"},"_102010052":{"name":"年年有余","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010052","price":-1,"rectype":"","url":"./pet/img_res/food/102010052.gif"},"_102010053":{"name":"招财进宝","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":540,"desc":"","id":"102010053","price":-1,"rectype":"","url":"./pet/img_res/food/102010053.gif"},"_102010054":{"name":"丰收喜庆包","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010054","price":-1,"rectype":"","url":"./pet/img_res/food/102010054.gif"},"_102010055":{"name":"新春全鸡宴","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"102010055","price":-1,"rectype":"","url":"./pet/img_res/food/102010055.gif"},"_102010056":{"name":"吉祥牛排","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"102010056","price":-1,"rectype":"","url":"./pet/img_res/food/102010056.gif"},"_102010057":{"name":"腊八粥","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010057","price":-1,"rectype":"","url":"./pet/img_res/food/102010057.gif"},"_102010058":{"name":"浓情的爱","type":"food","charm":0,"intel":0,"strong":38,"clean":0,"hunger":1080,"desc":"","id":"102010058","price":-1,"rectype":"","url":"./pet/img_res/food/102010058.gif"},"_102010059":{"name":"甜蜜爱恋","type":"food","charm":0,"intel":60,"strong":0,"clean":0,"hunger":1440,"desc":"","id":"102010059","price":-1,"rectype":"","url":"./pet/img_res/food/102010059.gif"},"_102010060":{"name":"浪漫心语","type":"food","charm":118,"intel":0,"strong":0,"clean":0,"hunger":1800,"desc":"","id":"102010060","price":-1,"rectype":"","url":"./pet/img_res/food/102010060.gif"},"_102010061":{"name":"营养元宵","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":180,"desc":"","id":"102010061","price":-1,"rectype":"","url":"./pet/img_res/food/102010061.gif"},"_102010062":{"name":"健康营养果","type":"food","charm":0,"intel":0,"strong":4,"clean":0,"hunger":900,"desc":"","id":"102010062","price":-1,"rectype":"","url":"./pet/img_res/food/102010062.gif"},"_102010063":{"name":"聪慧玲珑果","type":"food","charm":0,"intel":4,"strong":0,"clean":0,"hunger":900,"desc":"","id":"102010063","price":-1,"rectype":"","url":"./pet/img_res/food/102010063.gif"},"_102010064":{"name":"千娇百媚果","type":"food","charm":4,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"102010064","price":-1,"rectype":"","url":"./pet/img_res/food/102010064.gif"},"_102010065":{"name":"沙丁鱼","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010065","price":-1,"rectype":"","url":"./pet/img_res/food/102010065.gif"},"_102010066":{"name":"鳕鱼","type":"food","charm":0,"intel":4,"strong":0,"clean":0,"hunger":900,"desc":"","id":"102010066","price":-1,"rectype":"","url":"./pet/img_res/food/102010066.gif"},"_102010067":{"name":"白鲳鱼","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010067","price":-1,"rectype":"","url":"./pet/img_res/food/102010067.gif"},"_102010068":{"name":"鲈鱼","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1440,"desc":"","id":"102010068","price":-1,"rectype":"","url":"./pet/img_res/food/102010068.gif"},"_102010069":{"name":"星云薯条","type":"food","charm":0,"intel":0,"strong":10,"clean":0,"hunger":1800,"desc":"","id":"102010069","price":-1,"rectype":"","url":"./pet/img_res/food/102010069.gif"},"_102010070":{"name":"大力牛肉干","type":"food","charm":0,"intel":10,"strong":0,"clean":0,"hunger":1620,"desc":"","id":"102010070","price":-1,"rectype":"","url":"./pet/img_res/food/102010070.gif"},"_102010071":{"name":"圣果奶昔","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":1440,"desc":"","id":"102010071","price":-1,"rectype":"","url":"./pet/img_res/food/102010071.gif"},"_102010072":{"name":"龙鱼鲜贝汤","type":"food","charm":0,"intel":4,"strong":0,"clean":0,"hunger":1080,"desc":"","id":"102010072","price":-1,"rectype":"","url":"./pet/img_res/food/102010072.gif"},"_102010073":{"name":"妙香三文鱼","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":900,"desc":"","id":"102010073","price":-1,"rectype":"","url":"./pet/img_res/food/102010073.gif"},"_102010074":{"name":"香辣大对虾","type":"food","charm":0,"intel":0,"strong":2,"clean":0,"hunger":6000,"desc":"","id":"102010074","price":600,"PD":true,"rectype":"","url":"./pet/img_res/food/102010074.gif","needLevel":0,"group":10,"useTimeing":180},"_102010075":{"name":"龙凤炒面","type":"food","charm":0,"intel":2,"strong":0,"clean":0,"hunger":8000,"desc":"","id":"102010075","price":800,"PD":true,"rectype":"","url":"./pet/img_res/food/102010075.gif","needLevel":0,"group":10,"useTimeing":240},"_102010076":{"name":"锦绣大闸蟹","type":"food","charm":3,"intel":0,"strong":0,"clean":0,"hunger":10000,"desc":"","id":"102010076","price":1000,"rectype":"","url":"./pet/img_res/food/102010076.gif","PD":true,"needLevel":0,"group":10,"useTimeing":300},"_102010077":{"name":"担担豆花","type":"food","charm":0,"intel":0,"strong":1,"clean":0,"hunger":2000,"desc":"","id":"102010077","PD":true,"price":200,"rectype":"","url":"./pet/img_res/food/102010077.gif","needLevel":0,"group":10,"useTimeing":60},"_102010078":{"name":"浓点奶茶","type":"food","charm":0,"intel":1,"strong":0,"clean":0,"hunger":4000,"desc":"","PD":true,"id":"102010078","price":400,"rectype":"","url":"./pet/img_res/food/102010078.gif","needLevel":0,"group":10,"useTimeing":120},"_102010082":{"name":"魅力无穷粽","type":"food","charm":5,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010082","price":-1,"rectype":"","url":"./pet/img_res/food/102010082.gif"},"_102010083":{"name":"武力非凡粽","type":"food","charm":0,"intel":0,"strong":5,"clean":0,"hunger":720,"desc":"","id":"102010083","price":-1,"rectype":"","url":"./pet/img_res/food/102010083.gif"},"_102010084":{"name":"智慧源泉粽","type":"food","charm":0,"intel":5,"strong":0,"clean":0,"hunger":720,"desc":"","id":"102010084","price":-1,"rectype":"","url":"./pet/img_res/food/102010084.gif"},"_102010085":{"name":"徐福记话梅糖","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"needLevel":8,"desc":"","id":"102010085","price":45,"rectype":"new","url":"./pet/img_res/food/102010085.gif"},"_102010086":{"name":"德克士盖饭","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3145,"desc":"","id":"102010086","price":185,"rectype":"new","url":"./pet/img_res/food/102010086.gif","needLevel":33},"_102010087":{"name":"德克士袋饭","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":3680,"desc":"","id":"102010087","price":230,"rectype":"hot","url":"./pet/img_res/food/102010087.gif","needLevel":41},"_102010088":{"name":"南山奶粉","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1805,"desc":"","id":"102010088","price":95,"rectype":"new","url":"./pet/img_res/food/102010088.gif","needLevel":17},"_102010089":{"name":"运动菓珍","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1900,"desc":"","id":"102010089","price":100,"rectype":"new","url":"./pet/img_res/food/102010089.gif","needLevel":18},"_102010090":{"name":"菓珍甜橙味","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1000,"needLevel":9,"desc":"","id":"102010090","price":50,"rectype":"new","url":"./pet/img_res/food/102010090.gif"},"_102010091":{"name":"蒙牛酸酸乳","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2610,"desc":"","id":"102010091","price":145,"rectype":"","url":"./pet/img_res/food/102010091.gif","needLevel":26},"_102010092":{"name":"酷睿能量包","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2430,"desc":"","id":"102010092","price":135,"rectype":"new","url":"./pet/img_res/food/102010092.gif","needLevel":24},"_102010094":{"name":"奇异王果","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":2700,"desc":"","id":"102010094","price":150,"rectype":"","url":"./pet/img_res/food/102010094.gif","needLevel":27},"_102010095":{"name":"呦呦柚子茶","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":1995,"desc":"","id":"102010095","price":105,"rectype":"new","url":"./pet/img_res/food/102010095.gif","needLevel":19},"_1021100001":{"name":"牛妞利是糖","type":"food","charm":0,"intel":48,"strong":0,"clean":0,"hunger":720,"desc":"","id":"1021100001","price":-1,"rectype":"","url":"./pet/img_res/food/1021100001.gif"},"_1021100002":{"name":"HELLO-C","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"","id":"1021100002","price":-1,"rectype":"","url":"./pet/img_res/food/1021100002.gif"},"_10211017":{"name":"海鲜便当","type":"food","charm":0,"intel":0,"strong":3,"clean":0,"hunger":360,"desc":"","id":"10211017","price":-1,"rectype":"","url":"./pet/img_res/food/10211017.gif"},"_10211022":{"name":"深海金枪鱼","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"10211022","price":-1,"rectype":"","url":"./pet/img_res/food/10211022.gif"},"_10211023":{"name":"大对虾","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"10211023","price":-1,"rectype":"","url":"./pet/img_res/food/10211023.gif"},"_10211024":{"name":"鱼型曲奇饼","type":"food","charm":0,"intel":0,"strong":15,"clean":0,"hunger":1080,"desc":"","id":"10211024","price":-1,"rectype":"","url":"./pet/img_res/food/10211024.gif"},"_10212018":{"name":"甜虾寿司","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":720,"desc":"","id":"10212018","price":-1,"rectype":"","url":"./pet/img_res/food/10212018.gif"},"_10212019":{"name":"香辣蟹火锅","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":720,"desc":"","id":"10212019","price":-1,"rectype":"","url":"./pet/img_res/food/10212019.gif"},"_10212020":{"name":"章鱼小丸子","type":"food","charm":0,"intel":0,"strong":8,"clean":0,"hunger":720,"desc":"","id":"10212020","price":-1,"rectype":"","url":"./pet/img_res/food/10212020.gif"},"_10212021":{"name":"新鲜红衫鱼","type":"food","charm":0,"intel":0,"strong":12,"clean":0,"hunger":900,"desc":"","id":"10212021","price":-1,"rectype":"","url":"./pet/img_res/food/10212021.gif"},"_103010088":{"name":"蒙牛酸酸乳","type":"food","charm":0,"intel":0,"strong":0,"clean":0,"hunger":900,"desc":"","id":"103010088","price":50,"rectype":"new","url":"./pet/img_res/food/103010088.gif"},"_6000199":{"name":"天使金球","type":"food","charm":8,"intel":0,"strong":0,"clean":0,"hunger":720,"desc":"原版表缺项，按素材补录","id":"6000199","price":-1,"rectype":"","url":"./pet/img_res/food/6000199.gif"}}');
const clean = /* @__PURE__ */ JSON.parse('{"_100020032":{"name":"自动喷湿器(绝)","type":"clean","charm":0,"intel":0,"strong":6,"clean":720,"hunger":0,"desc":"","id":"100020032","price":-1,"rectype":"","url":"./pet/img_res/clean/100020032.gif","outOfPrint":true},"_100020033":{"name":"舒儿按摩器(绝)","type":"clean","charm":0,"intel":0,"strong":10,"clean":700,"hunger":0,"desc":"","id":"100020033","price":-1,"rectype":"","url":"./pet/img_res/clean/100020033.gif","outOfPrint":true},"_100020034":{"name":"痒痒挠","type":"clean","charm":0,"intel":8,"strong":0,"clean":360,"hunger":0,"desc":"","id":"100020034","price":-1,"rectype":"","url":"./pet/img_res/clean/100020034.gif"},"_100020035":{"name":"护唇膏","type":"clean","charm":6,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"100020035","price":-1,"rectype":"","url":"./pet/img_res/clean/100020035.gif"},"_100020036":{"name":"含香凝露(绝)","type":"clean","charm":4,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020036","price":-1,"rectype":"","url":"./pet/img_res/clean/100020036.gif","outOfPrint":true},"_100020037":{"name":"保湿啫喱","type":"clean","charm":6,"intel":0,"strong":0,"clean":4500,"desc":"","id":"100020037","price":125,"rectype":"","url":"./pet/img_res/clean/100020037.gif","needLevel":40},"_100020038":{"name":"柔顺洗发液","type":"clean","charm":0,"intel":6,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020038","price":-1,"rectype":"","url":"./pet/img_res/clean/100020038.gif"},"_100020039":{"name":"弹力跳跳床","type":"clean","charm":0,"intel":15,"strong":0,"clean":900,"hunger":0,"desc":"","id":"100020039","price":-1,"rectype":"","url":"./pet/img_res/clean/100020039.gif"},"_100020040":{"name":"洗衣锤","type":"clean","charm":0,"intel":15,"strong":0,"clean":900,"hunger":0,"desc":"","id":"100020040","price":-1,"rectype":"","url":"./pet/img_res/clean/100020040.gif"},"_100020041":{"name":"牛翔跑步机","type":"clean","charm":15,"intel":15,"strong":15,"clean":500,"hunger":500,"desc":"","id":"100020041","price":-1,"rectype":"","url":"./pet/img_res/clean/100020041.gif"},"_100020042":{"name":"人鱼藻浴盐","type":"clean","charm":0,"intel":0,"strong":12,"clean":480,"hunger":0,"desc":"","id":"100020042","price":-1,"rectype":"","url":"./pet/img_res/clean/100020042.gif"},"_100020043":{"name":"人鱼藻颜泥","type":"clean","charm":0,"intel":0,"strong":12,"clean":480,"hunger":0,"desc":"","id":"100020043","price":-1,"rectype":"","url":"./pet/img_res/clean/100020043.gif"},"_100020044":{"name":"牛翔牌香水","type":"clean","charm":12,"intel":0,"strong":0,"clean":480,"hunger":0,"desc":"","id":"100020044","price":-1,"rectype":"","url":"./pet/img_res/clean/100020044.gif"},"_100020045":{"name":"空气清新剂(智)","type":"clean","charm":0,"intel":12,"strong":0,"clean":480,"hunger":0,"desc":"","id":"100020045","price":-1,"rectype":"","url":"./pet/img_res/clean/100020045.gif"},"_100020046":{"name":"七彩墨镜","type":"clean","charm":15,"intel":0,"strong":0,"clean":900,"hunger":0,"desc":"","id":"100020046","price":-1,"rectype":"","url":"./pet/img_res/clean/100020046.gif"},"_100020047":{"name":"指甲油","type":"clean","charm":0,"intel":0,"strong":12,"clean":480,"hunger":0,"desc":"","id":"100020047","price":-1,"rectype":"","url":"./pet/img_res/clean/100020047.gif"},"_100020048":{"name":"离子烫发棒","type":"clean","charm":12,"intel":0,"strong":0,"clean":480,"hunger":0,"desc":"","id":"100020048","price":-1,"rectype":"","url":"./pet/img_res/clean/100020048.gif"},"_100020049":{"name":"防晒焗油膏","type":"clean","charm":0,"intel":12,"strong":0,"clean":480,"hunger":0,"desc":"","id":"100020049","price":-1,"rectype":"","url":"./pet/img_res/clean/100020049.gif"},"_100020050":{"name":"百中染色剂","type":"clean","charm":12,"intel":0,"strong":0,"clean":480,"hunger":0,"desc":"","id":"100020050","price":-1,"rectype":"","url":"./pet/img_res/clean/100020050.gif"},"_100020051":{"name":"星之密语","type":"clean","charm":0,"intel":100,"strong":100,"clean":0,"hunger":0,"desc":"","id":"100020051","price":-1,"rectype":"","url":"./pet/img_res/clean/100020051.gif"},"_100020052":{"name":"圣洁之露","type":"clean","charm":0,"intel":360,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100020052","price":-1,"rectype":"","url":"./pet/img_res/clean/100020052.gif"},"_100020053":{"name":"勇士之魂","type":"clean","charm":136,"intel":0,"strong":136,"clean":0,"hunger":0,"desc":"","id":"100020053","price":-1,"rectype":"","url":"./pet/img_res/clean/100020053.gif"},"_100020058":{"name":"愚人沐浴露","type":"clean","charm":0,"intel":0,"strong":0,"clean":1,"hunger":0,"desc":"","id":"100020058","price":-1,"rectype":"","url":"./pet/img_res/clean/100020058.gif"},"_100020059":{"name":"辛勤洗刷刷","type":"clean","charm":60,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020059","price":-1,"rectype":"","url":"./pet/img_res/clean/100020059.gif"},"_100020060":{"name":"宝宝清洁机","type":"clean","charm":0,"intel":0,"strong":48,"clean":1440,"hunger":0,"desc":"","id":"100020060","price":-1,"rectype":"","url":"./pet/img_res/clean/100020060.gif"},"_100020061":{"name":"黑马牙膏","type":"clean","charm":12,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"100020061","price":-1,"rectype":"","url":"./pet/img_res/clean/100020061.gif"},"_100020062":{"name":"祥瑞聚宝盆","type":"clean","charm":180,"intel":180,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100020062","price":-1,"rectype":"","url":"./pet/img_res/clean/100020062.gif"},"_100020063":{"name":"低碳植物防晒露","type":"clean","charm":60,"intel":60,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100020063","price":-1,"rectype":"","url":"./pet/img_res/clean/100020063.gif"},"_100020064":{"name":"芳香皂角","type":"clean","charm":0,"intel":0,"strong":8,"clean":720,"hunger":0,"desc":"","id":"100020064","price":-1,"rectype":"","url":"./pet/img_res/clean/100020064.gif"},"_100020065":{"name":"温泉泡浴","type":"clean","charm":0,"intel":8,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020065","price":-1,"rectype":"","url":"./pet/img_res/clean/100020065.gif"},"_100020066":{"name":"梦璃圣水","type":"clean","charm":8,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020066","price":-1,"rectype":"","url":"./pet/img_res/clean/100020066.gif"},"_100020067":{"name":"地心锻体液","type":"clean","charm":0,"intel":48,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"100020067","price":-1,"rectype":"","url":"./pet/img_res/clean/100020067.gif"},"_100020068":{"name":"幻世-羊脂玉净瓶","type":"clean","charm":18,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"100020068","price":-1,"rectype":"","url":"./pet/img_res/clean/100020068.gif"},"_100020069":{"name":"朗姆茶爽啫喱","type":"clean","charm":100,"intel":0,"strong":100,"clean":0,"hunger":0,"desc":"","id":"100020069","price":-1,"rectype":"","url":"./pet/img_res/clean/100020069.gif"},"_100020070":{"name":"雪妃海藻泥","type":"clean","charm":100,"intel":100,"strong":0,"clean":0,"hunger":0,"desc":"","id":"100020070","price":-1,"rectype":"","url":"./pet/img_res/clean/100020070.gif"},"_100020071":{"name":"红尾鱼油","type":"clean","charm":1,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"100020071","price":-1,"rectype":"","url":"./pet/img_res/clean/100020071.gif"},"_100020072":{"name":"牛角怪怪乳液","type":"clean","charm":25,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"100020072","price":-1,"rectype":"","url":"./pet/img_res/clean/100020072.gif"},"_100020073":{"name":"深海蓝藻洗颜泥","type":"clean","charm":20,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"100020073","price":-1,"rectype":"","url":"./pet/img_res/clean/100020073.gif"},"_100020074":{"name":"香香泡泡露","type":"clean","charm":30,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020074","price":-1,"rectype":"","url":"./pet/img_res/clean/100020074.gif"},"_100020075":{"name":"玫瑰精油","type":"clean","charm":10,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020075","price":-1,"rectype":"","url":"./pet/img_res/clean/100020075.gif"},"_100020076":{"name":"深海浴盐","type":"clean","charm":0,"intel":10,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020076","price":-1,"rectype":"","url":"./pet/img_res/clean/100020076.gif"},"_100020077":{"name":"美容套盒","type":"clean","charm":10,"intel":0,"strong":0,"clean":2011,"hunger":0,"desc":"","id":"100020077","price":-1,"rectype":"","url":"./pet/img_res/clean/100020077.gif"},"_100020078":{"name":"火红浴巾","type":"clean","charm":0,"intel":0,"strong":0,"clean":2011,"hunger":0,"desc":"","id":"100020078","price":-1,"rectype":"","url":"./pet/img_res/clean/100020078.gif"},"_100020079":{"name":"顶级浴霸","type":"clean","charm":50,"intel":100,"strong":50,"clean":0,"hunger":0,"desc":"","id":"100020079","price":-1,"rectype":"","url":"./pet/img_res/clean/100020079.gif"},"_100020080":{"name":"吃完我洗碗","type":"clean","charm":10,"intel":0,"strong":0,"clean":900,"hunger":0,"desc":"","id":"100020080","price":-1,"rectype":"","url":"./pet/img_res/clean/100020080.gif"},"_100020081":{"name":"驻颜丹","type":"clean","charm":20,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020081","price":-1,"rectype":"","url":"./pet/img_res/clean/100020081.gif"},"_100020082":{"name":"甜蜜泡泡","type":"clean","charm":80,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020082","price":-1,"rectype":"","url":"./pet/img_res/clean/100020082.gif"},"_100020083":{"name":"泥浆沐浴露","type":"clean","charm":0,"intel":0,"strong":0,"clean":1,"hunger":0,"desc":"","id":"100020083","price":-1,"rectype":"","url":"./pet/img_res/clean/100020083.gif"},"_100020084":{"name":"冰河雪水","type":"clean","charm":0,"intel":4,"strong":0,"clean":720,"hunger":0,"desc":"","id":"100020084","price":-1,"rectype":"","url":"./pet/img_res/clean/100020084.gif"},"_100020085":{"name":"芳颜?武","type":"clean","charm":0,"intel":0,"strong":2,"clean":1080,"hunger":0,"desc":"","id":"100020085","price":-1,"rectype":"","url":"./pet/img_res/clean/100020085.gif"},"_100020086":{"name":"芳颜?智","type":"clean","charm":0,"intel":2,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"100020086","price":-1,"rectype":"","url":"./pet/img_res/clean/100020086.gif"},"_100020087":{"name":"芳颜?魅","type":"clean","charm":2,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"100020087","price":-1,"rectype":"","url":"./pet/img_res/clean/100020087.gif"},"_100020088":{"name":"魔?芳颜?武","type":"clean","charm":0,"intel":0,"strong":8,"clean":1800,"hunger":0,"desc":"","id":"100020088","price":-1,"rectype":"","url":"./pet/img_res/clean/100020088.gif"},"_100020089":{"name":"魔?芳颜?智","type":"clean","charm":0,"intel":8,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020089","price":-1,"rectype":"","url":"./pet/img_res/clean/100020089.gif"},"_100020090":{"name":"魔?芳颜?魅","type":"clean","charm":8,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020090","price":-1,"rectype":"","url":"./pet/img_res/clean/100020090.gif"},"_100020091":{"name":"绝代芳华","type":"clean","charm":30,"intel":30,"strong":30,"clean":3000,"hunger":0,"desc":"","id":"100020091","price":-1,"rectype":"","url":"./pet/img_res/clean/100020091.gif"},"_100020092":{"name":"流汗快乐","type":"clean","charm":10,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"","id":"100020092","price":-1,"rectype":"","url":"./pet/img_res/clean/100020092.gif"},"_100020093":{"name":"甜蜜记忆","type":"clean","charm":0,"intel":3,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"100020093","price":-1,"rectype":"","url":"./pet/img_res/clean/100020093.gif"},"_100020094":{"name":"芬芳嘟嘟球","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"","id":"100020094","price":-1,"rectype":"","url":"./pet/img_res/clean/100020094.gif"},"_100020095":{"name":"清凉泡泡球","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"","id":"100020095","price":-1,"rectype":"","url":"./pet/img_res/clean/100020095.gif"},"_100020096":{"name":"柔柔洗护球","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"","id":"100020096","price":-1,"rectype":"","url":"./pet/img_res/clean/100020096.gif"},"_100020097":{"name":"魔法凝露","type":"clean","charm":40,"intel":0,"strong":0,"clean":3000,"hunger":0,"desc":"","id":"100020097","price":-1,"rectype":"","url":"./pet/img_res/clean/100020097.gif"},"_100020098":{"name":"清洁球","type":"clean","charm":0,"intel":0,"strong":0,"clean":2800,"hunger":0,"desc":"","id":"100020098","price":-1,"rectype":"","url":"./pet/img_res/clean/100020098.gif"},"_100020099":{"name":"火灵珠","type":"clean","charm":0,"intel":100,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020099","price":-1,"rectype":"","url":"./pet/img_res/clean/100020099.gif"},"_100020100":{"name":"雷灵珠","type":"clean","charm":0,"intel":0,"strong":100,"clean":1800,"hunger":0,"desc":"","id":"100020100","price":-1,"rectype":"","url":"./pet/img_res/clean/100020100.gif"},"_100020101":{"name":"冰灵珠","type":"clean","charm":100,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"100020101","price":-1,"rectype":"","url":"./pet/img_res/clean/100020101.gif"},"_100020102":{"name":"麻痹挠挠","type":"clean","charm":36,"intel":0,"strong":0,"clean":3600,"hunger":0,"desc":"","id":"100020102","price":-1,"rectype":"","url":"./pet/img_res/clean/100020102.gif"},"_100020103":{"name":"恐怖雷","type":"clean","charm":0,"intel":0,"strong":50,"clean":1,"hunger":0,"desc":"","id":"100020103","price":-1,"rectype":"","url":"./pet/img_res/clean/100020103.gif"},"_100020104":{"name":"深海黑泥","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"缤纷夏日，垂钓有礼活动获得","id":"100020104","price":-1,"rectype":"","url":"./pet/img_res/clean/100020104.gif"},"_100020105":{"name":"无尽诱惑","type":"clean","charm":5,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"潘多拉的诱惑活动获得！","id":"100020105","price":-1,"rectype":"","url":"./pet/img_res/clean/100020105.gif"},"_100020106":{"name":"智慧守护","type":"clean","charm":0,"intel":5,"strong":0,"clean":1080,"hunger":0,"desc":"潘多拉的诱惑活动获得！","id":"100020106","price":-1,"rectype":"","url":"./pet/img_res/clean/100020106.gif"},"_100020107":{"name":"情人节香水","type":"clean","charm":0,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"浓情七夕，牛郎织女齐送礼活动获得！","id":"100020107","price":-1,"rectype":"","url":"./pet/img_res/clean/100020107.gif"},"_100020108":{"name":"强效消毒水","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020108","price":-1,"rectype":"","url":"./pet/img_res/clean/100020108.gif"},"_100020109":{"name":"神奇手巾","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020109","price":-1,"rectype":"","url":"./pet/img_res/clean/100020109.gif"},"_100020110":{"name":"冒险者之翼","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020110","price":-1,"rectype":"","url":"./pet/img_res/clean/100020110.gif"},"_100020111":{"name":"探险者宝壶","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020111","price":-1,"rectype":"","url":"./pet/img_res/clean/100020111.gif"},"_100020112":{"name":"清爽金水","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020112","price":-1,"rectype":"","url":"./pet/img_res/clean/100020112.gif"},"_100020113":{"name":"探险防蚊液","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020113","price":-1,"rectype":"","url":"./pet/img_res/clean/100020113.gif"},"_100020114":{"name":"胜利者之链","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020114","price":-1,"rectype":"","url":"./pet/img_res/clean/100020114.gif"},"_100020115":{"name":"探险手电筒","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"盛夏大冒险活动获得！","id":"100020115","price":-1,"rectype":"","url":"./pet/img_res/clean/100020115.gif"},"_100020116":{"name":"贴心相伴露","type":"clean","charm":8,"intel":8,"strong":8,"clean":2700,"hunger":0,"desc":"手机宠物首次登陆获得物品！","id":"100020116","price":-1,"rectype":"","url":"./pet/img_res/clean/100020116.gif"},"_100020117":{"name":"西瓜太郎水彩笔","type":"clean","charm":0,"intel":4,"strong":2,"clean":1080,"hunger":0,"desc":"2011教师节活动获得！","id":"100020117","price":-1,"rectype":"","url":"./pet/img_res/clean/100020117.gif"},"_100020118":{"name":"彩虹橡皮","type":"clean","charm":1,"intel":0,"strong":5,"clean":1080,"hunger":0,"desc":"2011教师节活动获得！","id":"100020118","price":-1,"rectype":"","url":"./pet/img_res/clean/100020118.gif"},"_100020119":{"name":"捏捏橡皮泥","type":"clean","charm":0,"intel":2,"strong":5,"clean":1080,"hunger":0,"desc":"2011教师节活动获得！","id":"100020119","price":-1,"rectype":"","url":"./pet/img_res/clean/100020119.gif"},"_100020120":{"name":"棉棉书包","type":"clean","charm":1,"intel":6,"strong":0,"clean":1080,"hunger":0,"desc":"2011教师节活动获得！","id":"100020120","price":-1,"rectype":"","url":"./pet/img_res/clean/100020120.gif"},"_100020121":{"name":"噜啊噜文具盒","type":"clean","charm":0,"intel":4,"strong":2,"clean":1080,"hunger":0,"desc":"2011教师节活动获得！","id":"100020121","price":-1,"rectype":"","url":"./pet/img_res/clean/100020121.gif"},"_100020122":{"name":"想想笔记本","type":"clean","charm":3,"intel":3,"strong":0,"clean":1080,"hunger":0,"desc":"2011教师节活动获得！","id":"100020122","price":-1,"rectype":"","url":"./pet/img_res/clean/100020122.gif"},"_100020123":{"name":"杨枝甘露","type":"clean","charm":90,"intel":0,"strong":0,"clean":900,"hunger":0,"desc":"西游囧记活动兑换获得！","id":"100020123","price":-1,"rectype":"","url":"./pet/img_res/clean/100020123.gif"},"_100020124":{"name":"神奇喷雾","type":"clean","charm":0,"intel":20,"strong":0,"clean":2700,"hunger":0,"desc":"2011国庆刮刮乐活动获得！","id":"100020124","price":-1,"rectype":"","url":"./pet/img_res/clean/100020124.gif"},"_100020125":{"name":"幸运神仙水","type":"clean","charm":30,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"2011国庆刮刮乐活动获得！","id":"100020125","price":-1,"rectype":"","url":"./pet/img_res/clean/100020125.gif"},"_100020126":{"name":"Lavender精油","type":"clean","charm":8,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"丘比特的神箭活动获得！","id":"100020126","price":-1,"rectype":"","url":"./pet/img_res/clean/100020126.gif"},"_100020127":{"name":"紫钻泡泡浴","type":"clean","charm":0,"intel":0,"strong":0,"clean":900,"hunger":0,"desc":"QQ炫舞紫钻用户可获得！","id":"100020127","price":-1,"rectype":"","url":"./pet/img_res/clean/100020127.gif"},"_100020128":{"name":"银海生花","type":"clean","charm":0,"intel":0,"strong":8,"clean":900,"hunger":0,"desc":"攒彩蛋兑大奖活动获得！","id":"100020128","price":-1,"rectype":"","url":"./pet/img_res/clean/100020128.gif"},"_100020129":{"name":"金风玉露","type":"clean","charm":15,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"攒彩蛋兑大奖活动获得！","id":"100020129","price":-1,"rectype":"","url":"./pet/img_res/clean/100020129.gif"},"_100020130":{"name":"调皮鬼牙刷","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"2011圣诞节活动获得！","id":"100020130","price":-1,"rectype":"","url":"./pet/img_res/clean/100020130.gif"},"_100020131":{"name":"驯鹿纹方巾","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"2011圣诞节活动获得！","id":"100020131","price":-1,"rectype":"","url":"./pet/img_res/clean/100020131.gif"},"_100020132":{"name":"烟囱洗手露","type":"clean","charm":2,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"2011圣诞节活动获得！","id":"100020132","price":-1,"rectype":"","url":"./pet/img_res/clean/100020132.gif"},"_100020133":{"name":"雪花面膜","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"2011圣诞节活动获得！","id":"100020133","price":-1,"rectype":"","url":"./pet/img_res/clean/100020133.gif"},"_100020134":{"name":"跨年沐浴乳","type":"clean","charm":0,"intel":0,"strong":8,"clean":900,"hunger":0,"desc":"参加手机宠物双蛋活动获得！","id":"100020134","price":-1,"rectype":"","url":"./pet/img_res/clean/100020134.gif"},"_100020135":{"name":"除草剂","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"剧情签到活动获得！","id":"100020135","price":-1,"rectype":"","url":"./pet/img_res/clean/100020135.gif"},"_100020136":{"name":"火药除垢剂","type":"clean","charm":2,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"剧情签到活动获得！","id":"100020136","price":800,"rectype":"","url":"./pet/img_res/clean/100020136.gif"},"_100020137":{"name":"龙诞香","type":"clean","charm":0,"intel":6,"strong":0,"clean":3000,"hunger":0,"desc":"神龙拼图活动获得！","id":"100020137","price":-1,"rectype":"","url":"./pet/img_res/clean/100020137.gif"},"_100020138":{"name":"鹅毛刷刷乐","type":"clean","charm":0,"intel":3,"strong":0,"clean":720,"hunger":0,"desc":"企鹅有你，精彩依旧活动获得！","id":"100020138","price":1000,"rectype":"","url":"./pet/img_res/clean/100020138.gif"},"_100020139":{"name":"绿色手绢","type":"clean","charm":5,"intel":0,"strong":0,"clean":900,"hunger":0,"desc":"企鹅有你，精彩依旧活动获得！","id":"100020139","price":-1,"rectype":"","url":"./pet/img_res/clean/100020139.gif"},"_100020140":{"name":"太极仪象","type":"clean","charm":10,"intel":10,"strong":10,"clean":3000,"hunger":0,"desc":"企鹅有你，精彩依旧活动获得！","id":"100020140","price":-1,"rectype":"","url":"./pet/img_res/clean/100020140.gif"},"_100020141":{"name":"闭气潜水浴","type":"clean","charm":0,"intel":3,"strong":0,"clean":1080,"hunger":0,"desc":"2012诺亚方舟活动获得！","id":"100020141","price":-1,"rectype":"","url":"./pet/img_res/clean/100020141.gif"},"_100020142":{"name":"七彩神石","type":"clean","charm":5,"intel":0,"strong":0,"clean":3000,"hunger":0,"desc":"夺宝奇兵活动珍藏宝物！","id":"100020142","price":2000,"rectype":"","url":"./pet/img_res/clean/100020142.gif"},"_100020143":{"name":"时空粒子浴","type":"clean","charm":0,"intel":2,"strong":0,"clean":1800,"hunger":0,"desc":"穿越2012活动珍藏物品！","id":"100020143","price":-1,"rectype":"","url":"./pet/img_res/clean/100020143.gif"},"_100020144":{"name":"魔力香波","type":"clean","charm":0,"intel":0,"strong":0,"clean":3000,"hunger":0,"desc":"网页社区兑换奖励","id":"100020144","price":-1,"rectype":"","url":"./pet/img_res/clean/100020144.gif"},"_100020145":{"name":"润肤鱼油","type":"clean","charm":1,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"欢乐渔港活动珍藏物品！","id":"100020145","price":-1,"rectype":"","url":"./pet/img_res/clean/100020145.gif"},"_100020146":{"name":"郁金香露","type":"clean","charm":2,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"蜜蜂采蜜忙活动珍藏物品！","id":"100020146","price":800,"rectype":"","url":"./pet/img_res/clean/100020146.gif"},"_100020147":{"name":"六一嘻唰唰","type":"clean","charm":0,"intel":0,"strong":0,"clean":2000,"hunger":0,"desc":"企鹅游乐园活动珍藏物品！","id":"100020147","price":-1,"rectype":"","url":"./pet/img_res/clean/100020147.gif"},"_100020148":{"name":"伽马射线浴","type":"clean","charm":0,"intel":0,"strong":0,"clean":780,"hunger":0,"desc":"复仇者企鹅联萌活动珍藏物品！","id":"100020148","price":-1,"rectype":"","url":"./pet/img_res/clean/100020148.gif"},"_100020149":{"name":"雷神之怒","type":"clean","charm":0,"intel":0,"strong":0,"clean":780,"hunger":0,"desc":"复仇者企鹅联萌活动珍藏物品！","id":"100020149","price":-1,"rectype":"","url":"./pet/img_res/clean/100020149.gif"},"_100020150":{"name":"清爽毛巾","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"运动风云榜活动珍藏物品！","id":"100020150","price":-1,"rectype":"","url":"./pet/img_res/clean/100020150.gif"},"_100020151":{"name":"呼呼电风扇","type":"clean","charm":0,"intel":0,"strong":2,"clean":2700,"hunger":0,"desc":"运动风云榜活动珍藏物品！","id":"100020151","price":-1,"rectype":"","url":"./pet/img_res/clean/100020151.gif"},"_100020152":{"name":"爱心灵丹","type":"clean","charm":0,"intel":6,"strong":0,"clean":1800,"hunger":0,"desc":"粉钻公益活动纪念物品！","id":"100020152","price":-1,"rectype":"","url":"./pet/img_res/clean/100020152.gif"},"_100020153":{"name":"爱心棉被","type":"clean","charm":6,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"粉钻公益活动纪念物品！","id":"100020153","price":-1,"rectype":"","url":"./pet/img_res/clean/100020153.gif"},"_100020154":{"name":"运动防晒霜","type":"clean","charm":2,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"企鹅运动季活动珍藏物品！","id":"100020154","price":-1,"rectype":"","url":"./pet/img_res/clean/100020154.gif"},"_100020155":{"name":"运动香水","type":"clean","charm":2,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"企鹅运动季活动珍藏物品！","id":"100020155","price":-1,"rectype":"","url":"./pet/img_res/clean/100020155.gif"},"_100020156":{"name":"运动啫喱水","type":"clean","charm":2,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"企鹅运动季活动珍藏物品！","id":"100020156","price":-1,"rectype":"","url":"./pet/img_res/clean/100020156.gif"},"_100020157":{"name":"运动香皂","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"运动风云榜活动珍藏物品！","id":"100020157","price":-1,"rectype":"","url":"./pet/img_res/clean/100020157.gif"},"_100020158":{"name":"智慧喷雾","type":"clean","charm":0,"intel":8,"strong":0,"clean":3000,"hunger":0,"desc":"企鹅答题秀，挑战IQ极限珍藏物品！","id":"100020158","price":-1,"rectype":"","url":"./pet/img_res/clean/100020158.gif"},"_100020159":{"name":"法国香波","type":"clean","charm":0,"intel":10,"strong":0,"clean":3000,"hunger":0,"desc":"神秘之旅欧洲篇珍藏物品！","id":"100020159","price":-1,"rectype":"","url":"./pet/img_res/clean/100020159.gif"},"_100020160":{"name":"ipen圆珠笔","type":"clean","charm":0,"intel":0,"strong":9,"clean":720,"hunger":0,"desc":"2012年9月多多开学豪礼活动专属绝版物品！","id":"100020160","price":-1,"rectype":"","url":"./pet/img_res/clean/100020160.gif","outOfPrint":true},"_100020161":{"name":"可爱兔便利贴","type":"clean","charm":9,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"2012年9月多多开学豪礼活动专属绝版物品！","id":"100020161","price":-1,"rectype":"","url":"./pet/img_res/clean/100020161.gif","outOfPrint":true},"_100020162":{"name":"苹果笔记本","type":"clean","charm":0,"intel":9,"strong":0,"clean":720,"hunger":0,"desc":"2012年9月多多开学豪礼活动专属绝版物品！","id":"100020162","price":-1,"rectype":"","url":"./pet/img_res/clean/100020162.gif","outOfPrint":true},"_100020163":{"name":"美洋洋文具盒","type":"clean","charm":9,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"2012年9月多多开学豪礼活动专属绝版物品！","id":"100020163","price":-1,"rectype":"","url":"./pet/img_res/clean/100020163.gif","outOfPrint":true},"_100020164":{"name":"趴冰卧雪浴","type":"clean","charm":0,"intel":2,"strong":0,"clean":1800,"hunger":0,"desc":"盛世强国，共贺国庆活动珍藏物品！","id":"100020164","price":-1,"rectype":"","url":"./pet/img_res/clean/100020164.gif"},"_100020165":{"name":"魔法仙露","type":"clean","charm":0,"intel":2,"strong":0,"clean":2000,"hunger":0,"desc":"魔法森林活动珍藏物品！","id":"100020165","price":-1,"rectype":"","url":"./pet/img_res/clean/100020165.gif"},"_100020166":{"name":"南瓜香薰","type":"clean","charm":0,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"万圣节活动珍藏物品！","id":"100020166","price":-1,"rectype":"","url":"./pet/img_res/clean/100020166.gif"},"_100020167":{"name":"萌动沐浴露","type":"clean","charm":3,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"三国武将萌动献好礼活动珍藏物品！","id":"100020167","price":-1,"rectype":"","url":"./pet/img_res/clean/100020167.gif"},"_100020168":{"name":"一善木鱼露","type":"clean","charm":8,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"日行一善抽大奖活动珍藏物品！","id":"100020168","price":-1,"rectype":"","url":"./pet/img_res/clean/100020168.gif"},"_100020169":{"name":"蓝蓝海星","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"航海大冒险活动珍藏物品！","id":"100020169","price":-1,"rectype":"","url":"./pet/img_res/clean/100020169.gif"},"_100020170":{"name":"迷魂香香","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"航海大冒险活动珍藏物品！","id":"100020170","price":-1,"rectype":"","url":"./pet/img_res/clean/100020170.gif"},"_100020171":{"name":"劳伦斯防晒霜","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"航海大冒险活动珍藏物品！","id":"100020171","price":-1,"rectype":"","url":"./pet/img_res/clean/100020171.gif"},"_100020172":{"name":"海湾珍珠","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"航海大冒险活动珍藏物品！","id":"100020172","price":-1,"rectype":"","url":"./pet/img_res/clean/100020172.gif"},"_100020173":{"name":"许愿星砂","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"航海大冒险活动珍藏物品！","id":"100020173","price":-1,"rectype":"","url":"./pet/img_res/clean/100020173.gif"},"_100020174":{"name":"老虎油","type":"clean","charm":3,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"大虫的逆袭活动珍藏物品！","id":"100020174","price":-1,"rectype":"","url":"./pet/img_res/clean/100020174.gif"},"_100020175":{"name":"虎皮膏药","type":"clean","charm":0,"intel":0,"strong":3,"clean":1440,"hunger":0,"desc":"大虫的逆袭活动珍藏物品！","id":"100020175","price":-1,"rectype":"","url":"./pet/img_res/clean/100020175.gif"},"_100020176":{"name":"老虎抱枕","type":"clean","charm":5,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"大虫的逆袭活动珍藏物品！","id":"100020176","price":-1,"rectype":"","url":"./pet/img_res/clean/100020176.gif"},"_100020177":{"name":"乐斗背包","type":"clean","charm":2,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"乐斗大冒险活动珍藏物品！","id":"100020177","price":-1,"rectype":"","url":"./pet/img_res/clean/100020177.gif"},"_100020178":{"name":"宝贝沐浴露","type":"clean","charm":2,"intel":0,"strong":0,"clean":2440,"hunger":0,"desc":"宠物宝贝齐献礼活动珍藏装扮！","id":"100020178","price":-1,"rectype":"","url":"./pet/img_res/clean/100020178.gif"},"_100020179":{"name":"复古香水","type":"clean","charm":6,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"翻翻乐活动珍藏物品！","id":"100020179","price":-1,"rectype":"","url":"./pet/img_res/clean/100020179.gif"},"_100020180":{"name":"颠倒魔笛","type":"clean","charm":0,"intel":8,"strong":0,"clean":3000,"hunger":0,"desc":"翻翻乐活动珍藏物品！","id":"100020180","price":-1,"rectype":"","url":"./pet/img_res/clean/100020180.gif"},"_100020181":{"name":"镜花沐浴盐","type":"clean","charm":5,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"查来茬去活动珍藏物品！","id":"100020181","price":-1,"rectype":"","url":"./pet/img_res/clean/100020181.gif"},"_100020182":{"name":"劳动毛巾","type":"clean","charm":0,"intel":0,"strong":2,"clean":360,"hunger":0,"desc":"勤劳小企鹅，劳动领好礼活动绝版物品！","id":"100020182","price":-1,"rectype":"","url":"./pet/img_res/clean/100020182.gif","outOfPrint":true},"_100020183":{"name":"劳动防晒霜","type":"clean","charm":3,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"勤劳小企鹅，劳动领好礼活动绝版物品！","id":"100020183","price":-1,"rectype":"","url":"./pet/img_res/clean/100020183.gif","outOfPrint":true},"_100020184":{"name":"幸运之槌","type":"clean","charm":8,"intel":0,"strong":0,"clean":2400,"hunger":0,"desc":"打蛋蛋抢绝版活动珍藏物品！","id":"100020184","price":-1,"rectype":"","url":"./pet/img_res/clean/100020184.gif","outOfPrint":true},"_100020185":{"name":"农场主香水","type":"clean","charm":3,"intel":0,"strong":0,"clean":1888,"hunger":0,"desc":"QQ宠物QQ农场爱心结缘活动珍藏物品！","id":"100020185","price":-1,"rectype":"","url":"./pet/img_res/clean/100020185.gif"},"_100020186":{"name":"冰之恋语","type":"clean","charm":1,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"QQ宠物企鹅8周年许愿季珍藏物品！","id":"100020186","price":-1,"rectype":"","url":"./pet/img_res/clean/100020186.gif"},"_100020187":{"name":"高黎贡天然香皂","type":"clean","charm":6,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"走进高黎贡公益活动珍藏物品！","id":"100020187","price":-1,"rectype":"","url":"./pet/img_res/clean/100020187.gif"},"_100020188":{"name":"乐斗活血散","type":"clean","charm":0,"intel":0,"strong":6,"clean":720,"hunger":0,"desc":"乐斗大比拼活动珍藏绝版物品！","id":"100020188","price":-1,"rectype":"","url":"./pet/img_res/clean/100020188.gif","outOfPrint":true},"_100020189":{"name":"乐斗金疮药","type":"clean","charm":0,"intel":0,"strong":8,"clean":2700,"hunger":0,"desc":"乐斗大比拼活动珍藏绝版物品！","id":"100020189","price":-1,"rectype":"","url":"./pet/img_res/clean/100020189.gif","outOfPrint":true},"_100020190":{"name":"粉钻女皇的感谢信","type":"clean","charm":50,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"“英雄，愿你拥有一份无悔的爱情！”","id":"100020190","price":-1,"rectype":"","url":"./pet/img_res/clean/100020190.gif"},"_100020191":{"name":"古墓卷轴","type":"clean","charm":1,"intel":1,"strong":1,"clean":3600,"hunger":0,"desc":"一股古旧的气息迎面扑来","id":"100020191","price":-1,"rectype":"","url":"./pet/img_res/clean/100020191.gif"},"_100020192":{"name":"貔貅沐浴乳","type":"clean","charm":5,"intel":0,"strong":0,"clean":2400,"hunger":0,"desc":"","id":"100020192","price":-1,"rectype":"","url":"./pet/img_res/clean/100020192.gif"},"_100020193":{"name":"马丽莲萌露","type":"clean","charm":10,"intel":10,"strong":10,"clean":3000,"hunger":0,"desc":"万马奔腾贺新春珍藏绝版物品！","id":"100020193","price":-1,"rectype":"","url":"./pet/img_res/clean/100020193.gif","outOfPrint":true},"_100020194":{"name":"魔幻水晶","type":"clean","charm":8,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"魔幻企鹅岛稀有绝版物品！","id":"100020194","price":-1,"rectype":"","url":"./pet/img_res/clean/100020194.gif","outOfPrint":true},"_100020195":{"name":"魔幻炼制炉","type":"clean","charm":0,"intel":0,"strong":8,"clean":1800,"hunger":0,"desc":"魔幻企鹅岛稀有绝版物品！","id":"100020195","price":-1,"rectype":"","url":"./pet/img_res/clean/100020195.gif","outOfPrint":true},"_100020196":{"name":"星辰之泪","type":"clean","charm":50,"intel":10,"strong":10,"clean":3000,"hunger":0,"desc":"凝聚星光的宝石，远超企鹅岛的制作工艺。","id":"100020196","price":-1,"rectype":"","url":"./pet/img_res/clean/100020196.gif"},"_100020197":{"name":"会说话的小火苗","type":"clean","charm":30,"intel":0,"strong":0,"clean":6000,"hunger":0,"desc":"蕴含了一部分火精灵的力量，也许可以当个宠物养呢。","id":"100020197","price":-1,"rectype":"","url":"./pet/img_res/clean/100020197.gif"},"_100020198":{"name":"彩色泡泡","type":"clean","charm":10,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"无敌泡泡王专属绝版物品！","id":"100020198","price":-1,"rectype":"","url":"./pet/img_res/clean/100020198.gif","outOfPrint":true},"_100020199":{"name":"新兵证明","type":"clean","charm":0,"intel":1,"strong":0,"clean":1800,"hunger":0,"desc":"掌握基本的飞行员技巧，可以正式入伍了！","id":"100020199","price":-1,"rectype":"","url":"./pet/img_res/clean/100020199.gif"},"_100020200":{"name":"老兵勋章","type":"clean","charm":0,"intel":10,"strong":0,"clean":6000,"hunger":0,"desc":"娴熟掌握空战技能，善于驾驭各种飞机！","id":"100020200","price":-1,"rectype":"","url":"./pet/img_res/clean/100020200.gif"},"_100020201":{"name":"纪念门票","type":"clean","charm":10,"intel":10,"strong":10,"clean":3600,"hunger":0,"desc":"2014年世界杯纪念门票！","id":"100020201","price":-1,"rectype":"","url":"./pet/img_res/clean/100020201.gif"},"_100020202":{"name":"世界杯专用球","type":"clean","charm":10,"intel":0,"strong":0,"clean":3600,"hunger":0,"desc":"世界杯专用足球！","id":"100020202","price":-1,"rectype":"","url":"./pet/img_res/clean/100020202.gif"},"_100020203":{"name":"九周年勋章","type":"clean","charm":1,"intel":1,"strong":1,"hunger":0,"clean":1800,"desc":"宠物九周年，欢乐齐分享！","id":"100020203","price":-1,"rectype":"","url":"./pet/img_res/clean/100020203.gif"},"_100020204":{"name":"九周年纪念章","type":"clean","charm":1,"intel":1,"strong":1,"clean":1800,"hunger":0,"desc":"宠物九周年，欢乐齐分享！","id":"100020204","price":-1,"rectype":"","url":"./pet/img_res/clean/100020204.gif"},"_100020205":{"name":"穿越之门","type":"clean","charm":99,"intel":99,"strong":99,"clean":9999,"hunger":0,"desc":"穿越九周年活动专属！","id":"100020205","price":-1,"rectype":"","url":"./pet/img_res/clean/100020205.gif"},"_100020206":{"name":"一叶知秋","type":"clean","charm":10,"intel":10,"strong":10,"clean":5400,"hunger":0,"desc":"","id":"100020206","price":-1,"rectype":"","url":"./pet/img_res/clean/100020206.gif"},"_100020207":{"name":"学霸牌学习机","type":"clean","charm":0,"intel":20,"strong":0,"clean":1,"hunger":0,"desc":"有了学霸牌学习机，麻麻再也不用担心我变学渣了。","id":"100020207","price":-1,"rectype":"","url":"./pet/img_res/clean/100020207.gif"},"_100020208":{"name":"圣银箭矢","type":"clean","charm":0,"intel":0,"strong":10,"clean":1800,"hunger":0,"desc":"猎魔人使用的箭矢，镀有圣银，可破邪恶之物。","id":"100020208","price":-1,"rectype":"","url":"./pet/img_res/clean/100020208.gif"},"_100020209":{"name":"圣水炸弹","type":"clean","charm":0,"intel":0,"strong":25,"clean":3000,"hunger":0,"desc":"满满一瓶圣水，对恶魔而言就像硫酸一样可怕！","id":"100020209","price":-1,"rectype":"","url":"./pet/img_res/clean/100020209.gif"},"_100020210":{"name":"圣诞雪晶","type":"clean","charm":10,"intel":10,"strong":10,"clean":3600,"hunger":0,"desc":"圣诞老人的赠礼，圣诞快乐！","id":"100020210","price":-1,"rectype":"","url":"./pet/img_res/clean/100020210.gif"},"_100020211":{"name":"虫洞发生器","type":"clean","charm":10,"intel":10,"strong":10,"clean":3600,"hunger":0,"desc":"制造一个微型虫洞，大概能容纳一个细菌通过！","id":"100020211","price":-1,"rectype":"","url":"./pet/img_res/clean/100020211.gif"},"_100020212":{"name":"裹着雪的石头","type":"clean","charm":0,"intel":0,"strong":1,"clean":900,"hunger":0,"desc":"打雪仗获胜的秘诀就是。。。","id":"100020212","price":-1,"rectype":"","url":"./pet/img_res/clean/100020212.gif"},"_100020213":{"name":"雪人围巾","type":"clean","charm":15,"intel":0,"strong":0,"clean":3600,"hunger":0,"desc":"小心融化！限雪人使用。","id":"100020213","price":-1,"rectype":"","url":"./pet/img_res/clean/100020213.gif"},"_100020214":{"name":"春日暖阳","type":"clean","charm":1,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"暖暖的阳光储存技术，让您随时随地阳光浴！","id":"100020214","price":-1,"rectype":"","url":"./pet/img_res/clean/100020214.gif"},"_100020215":{"name":"光芒冰棱","type":"clean","charm":0,"intel":0,"strong":20,"clean":1080,"hunger":0,"desc":"有冰棱的企鹅ta威武雄壮！","id":"100020215","price":-1,"rectype":"","url":"./pet/img_res/clean/100020215.gif"},"_100020216":{"name":"鹅鹅爱洗澡","type":"clean","charm":0,"intel":5,"strong":0,"clean":1080,"hunger":0,"desc":"抓鹅小能手珍藏品！","id":"100020216","price":-1,"rectype":"","url":"./pet/img_res/clean/100020216.gif"},"_100020217":{"name":"一千零一个愿望","type":"clean","charm":0,"intel":8,"strong":0,"clean":888,"hunger":0,"desc":"2016新年活动绝版物品~","id":"100020217","price":-1,"rectype":"","url":"./pet/img_res/clean/100020217.gif","outOfPrint":true},"_100020218":{"name":"噼里啪啦竹","type":"clean","charm":8,"intel":0,"strong":0,"clean":888,"hunger":0,"desc":"2016新年活动绝版物品~","id":"100020218","price":-1,"rectype":"","url":"./pet/img_res/clean/100020218.gif","outOfPrint":true},"_100020219":{"name":"爱心药水","type":"clean","charm":9,"intel":0,"strong":0,"clean":999,"hunger":0,"desc":"2016情人节限定！","id":"100020219","price":-1,"rectype":"","url":"./pet/img_res/clean/100020219.gif"},"_100020220":{"name":"爱心背包","type":"clean","charm":4,"intel":0,"strong":0,"clean":2000,"hunger":0,"desc":"来自CF的爱心福利！","id":"100020220","price":-1,"rectype":"","url":"./pet/img_res/clean/100020220.gif"},"_100020221":{"name":"竹水桶","type":"clean","charm":0,"intel":0,"strong":9,"clean":2000,"hunger":0,"desc":"来自CF的爱心福利！","id":"100020221","price":-1,"rectype":"","url":"./pet/img_res/clean/100020221.gif"},"_100020222":{"name":"闪光护目镜","type":"clean","charm":12,"intel":0,"strong":0,"clean":2000,"hunger":0,"desc":"来自CF的爱心福利！","id":"100020222","price":-1,"rectype":"","url":"./pet/img_res/clean/100020222.gif"},"_100020223":{"name":"冰川泥","type":"clean","charm":4,"intel":4,"strong":4,"clean":2000,"hunger":0,"desc":"来自北美阿拉斯加的美容圣品！","id":"100020223","price":-1,"rectype":"","url":"./pet/img_res/clean/100020223.gif"},"_100020224":{"name":"神奇钢笔","type":"clean","charm":0,"intel":0,"strong":2,"clean":720,"hunger":0,"desc":"这是一只神奇的钢笔，据说用它答题能拿满分哟！","id":"100020224","price":-1,"rectype":"","url":"./pet/img_res/clean/100020224.gif"},"_100020225":{"name":"万能笔筒","type":"clean","charm":0,"intel":2,"strong":0,"clean":720,"hunger":0,"desc":"没有什么是装不下的！","id":"100020225","price":-1,"rectype":"","url":"./pet/img_res/clean/100020225.gif"},"_100020226":{"name":"大白记事本","type":"clean","charm":2,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"记下和大白在一起的暖暖每一天。","id":"100020226","price":-1,"rectype":"","url":"./pet/img_res/clean/100020226.gif"},"_100020227":{"name":"小神童书包","type":"clean","charm":0,"intel":2,"strong":0,"clean":720,"hunger":0,"desc":"聪明鹅宝宝的专属书包。","id":"100020227","price":-1,"rectype":"","url":"./pet/img_res/clean/100020227.gif"},"_100020228":{"name":"开学奖章","type":"clean","charm":0,"intel":116,"strong":116,"clean":0,"hunger":0,"desc":"献给2016的好宝宝们！","id":"100020228","price":-1,"rectype":"","url":"./pet/img_res/clean/100020228.gif"},"_100020229":{"name":"秋姑娘拾起的落叶","type":"clean","charm":10,"intel":10,"strong":10,"clean":5400,"hunger":0,"desc":"","id":"100020229","price":-1,"rectype":"","url":"./pet/img_res/clean/100020229.gif"},"_100020230":{"name":"鸡毛掸子","type":"clean","charm":0,"intel":0,"strong":7,"clean":1700,"hunger":0,"desc":"2017春节活动绝版物品！","id":"100020230","price":-1,"rectype":"","url":"./pet/img_res/clean/100020230.gif","outOfPrint":true},"_100020231":{"name":"喔喔闹钟","type":"clean","charm":0,"intel":0,"strong":17,"clean":1700,"hunger":0,"desc":"2017春节活动绝版物品！","id":"100020231","price":-1,"rectype":"","url":"./pet/img_res/clean/100020231.gif","outOfPrint":true},"_100020232":{"name":"粉钻洁面乳","type":"clean","charm":0,"intel":12,"strong":0,"clean":1200,"hunger":0,"desc":"2017暑期周年庆献礼！","id":"100020232","price":-1,"rectype":"","url":"./pet/img_res/clean/100020232.gif"},"_100020233":{"name":"粉钻焕彩面膜","type":"clean","charm":0,"intel":0,"strong":12,"clean":2000,"hunger":0,"desc":"2017暑期周年庆献礼！","id":"100020233","price":-1,"rectype":"","url":"./pet/img_res/clean/100020233.gif"},"_100020234":{"name":"强力橡皮擦","type":"clean","charm":0,"intel":0,"strong":15,"clean":900,"hunger":0,"desc":"2017开学珍藏物品！","id":"100020234","price":-1,"rectype":"","url":"./pet/img_res/clean/100020234.gif"},"_100020235":{"name":"魔幻铅笔盒","type":"clean","charm":0,"intel":15,"strong":0,"clean":900,"hunger":0,"desc":"2017开学珍藏物品！","id":"100020235","price":-1,"rectype":"","url":"./pet/img_res/clean/100020235.gif"},"_100020236":{"name":"无限大书包","type":"clean","charm":0,"intel":50,"strong":50,"clean":1800,"hunger":0,"desc":"2017开学珍藏物品！","id":"100020236","price":-1,"rectype":"","url":"./pet/img_res/clean/100020236.gif"},"_100020237":{"name":"秋枫美","type":"clean","charm":0,"intel":15,"strong":0,"clean":900,"hunger":0,"desc":"2017年寻找秋姑娘绝版物品","id":"100020237","price":-1,"rectype":"","url":"./pet/img_res/clean/100020237.gif","outOfPrint":true},"_100020238":{"name":"速干毛巾","type":"clean","charm":0,"intel":0,"strong":10,"clean":1800,"hunger":0,"desc":"2018新春献礼粉钻活动绝版物品！","id":"100020238","price":-1,"rectype":"","url":"./pet/img_res/clean/100020238.gif","outOfPrint":true},"_100020239":{"name":"干洗粉","type":"clean","charm":0,"intel":10,"strong":0,"clean":1800,"hunger":0,"desc":"2018新春献礼粉钻活动绝版物品！","id":"100020239","price":-1,"rectype":"","url":"./pet/img_res/clean/100020239.gif","outOfPrint":true},"_100020240":{"name":"绝版魔法荧光笔","type":"clean","charm":0,"intel":118,"strong":0,"clean":3000,"hunger":0,"desc":"2018开学珍藏物品！","id":"100020240","price":-1,"rectype":"","url":"./pet/img_res/clean/100020240.gif","outOfPrint":true},"_10002031":{"name":"闪亮滴眼液","type":"clean","charm":10,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10002031","price":-1,"rectype":"","url":"./pet/img_res/clean/10002031.gif"},"_10021001":{"name":"魔法清洁棒","type":"clean","charm":0,"intel":0,"strong":4,"clean":360,"hunger":0,"desc":"","id":"10021001","price":-1,"rectype":"","url":"./pet/img_res/clean/10021001.gif"},"_10021002":{"name":"震动减肥仪(绝)","type":"clean","charm":0,"intel":0,"strong":2,"clean":360,"hunger":0,"desc":"","id":"10021002","price":-1,"rectype":"","url":"./pet/img_res/clean/10021002.gif","outOfPrint":true},"_10021003":{"name":"歪歪电吹风","type":"clean","charm":0,"intel":0,"strong":8,"clean":360,"hunger":0,"desc":"","id":"10021003","price":-1,"rectype":"","url":"./pet/img_res/clean/10021003.gif"},"_10021004":{"name":"哈里剃须刀","type":"clean","charm":0,"intel":0,"strong":4,"clean":360,"hunger":0,"desc":"","id":"10021004","price":-1,"rectype":"","url":"./pet/img_res/clean/10021004.gif"},"_10021005":{"name":"雨刷","type":"clean","charm":0,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021005","price":-1,"rectype":"","url":"./pet/img_res/clean/10021005.gif"},"_10021006":{"name":"浴帽","type":"clean","charm":0,"intel":0,"strong":2,"clean":720,"hunger":0,"desc":"","id":"10021006","price":-1,"rectype":"","url":"./pet/img_res/clean/10021006.gif"},"_10021007":{"name":"黑人牙膏","type":"clean","charm":0,"intel":0,"strong":2,"clean":360,"hunger":0,"desc":"","id":"10021007","price":-1,"rectype":"","url":"./pet/img_res/clean/10021007.gif"},"_10021008":{"name":"浴巾","type":"clean","charm":0,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021008","price":-1,"rectype":"","url":"./pet/img_res/clean/10021008.gif"},"_10021009":{"name":"香皂","type":"clean","charm":0,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021009","price":-1,"rectype":"","url":"./pet/img_res/clean/10021009.gif"},"_10021010":{"name":"沐浴液","type":"clean","charm":2,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021010","price":-1,"rectype":"","url":"./pet/img_res/clean/10021010.gif"},"_10021011":{"name":"LK女香","type":"clean","charm":6,"intel":0,"strong":0,"clean":0,"hunger":0,"desc":"","id":"10021011","price":-1,"rectype":"","url":"./pet/img_res/clean/10021011.gif"},"_10021012":{"name":"CD男香","type":"clean","charm":6,"intel":0,"strong":0,"clean":0,"hunger":0,"desc":"","id":"10021012","price":-1,"rectype":"","url":"./pet/img_res/clean/10021012.gif"},"_10021013":{"name":"香水","type":"clean","charm":4,"intel":0,"strong":0,"clean":0,"hunger":0,"desc":"","id":"10021013","price":-1,"rectype":"","url":"./pet/img_res/clean/10021013.gif"},"_10021014":{"name":"果酸润肤露","type":"clean","charm":4,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021014","price":-1,"rectype":"","url":"./pet/img_res/clean/10021014.gif"},"_10021015":{"name":"柠檬洗面奶(绝)","type":"clean","charm":4,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021015","price":-1,"rectype":"","url":"./pet/img_res/clean/10021015.gif","outOfPrint":true},"_10021016":{"name":"洗发精","type":"clean","charm":6,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021016","price":-1,"rectype":"","url":"./pet/img_res/clean/10021016.gif"},"_10021017":{"name":"啤酒香波(绝)","type":"clean","charm":8,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021017","price":-1,"rectype":"","url":"./pet/img_res/clean/10021017.gif","outOfPrint":true},"_10021018":{"name":"清洁精华液","type":"clean","charm":6,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021018","price":-1,"rectype":"","url":"./pet/img_res/clean/10021018.gif"},"_10021019":{"name":"空气清新剂(魅)","type":"clean","charm":4,"intel":0,"strong":0,"clean":0,"hunger":0,"desc":"","id":"10021019","price":-1,"rectype":"","url":"./pet/img_res/clean/10021019.gif"},"_10021020":{"name":"飘飘护发素(绝)","type":"clean","charm":4,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021020","price":-1,"rectype":"","url":"./pet/img_res/clean/10021020.gif","outOfPrint":true},"_10021021":{"name":"宝宝爽身粉(绝)","type":"clean","charm":6,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021021","price":-1,"rectype":"","url":"./pet/img_res/clean/10021021.gif"},"_10021022":{"name":"除湿魔法球","type":"clean","charm":0,"intel":6,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021022","price":-1,"rectype":"","url":"./pet/img_res/clean/10021022.gif"},"_10021023":{"name":"南非宝石","type":"clean","charm":0,"intel":10,"strong":0,"clean":0,"hunger":0,"desc":"","id":"10021023","price":-1,"rectype":"","url":"./pet/img_res/clean/10021023.gif"},"_10021024":{"name":"宝宝银水","type":"clean","charm":0,"intel":2,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021024","price":-1,"rectype":"","url":"./pet/img_res/clean/10021024.gif"},"_10021025":{"name":"神奇香熏油","type":"clean","charm":0,"intel":6,"strong":0,"clean":0,"hunger":0,"desc":"","id":"10021025","price":-1,"rectype":"","url":"./pet/img_res/clean/10021025.gif"},"_10021026":{"name":"精灵泡泡液","type":"clean","charm":0,"intel":6,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021026","price":-1,"rectype":"","url":"./pet/img_res/clean/10021026.gif"},"_10021027":{"name":"植物精华露","type":"clean","charm":0,"intel":8,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021027","price":-1,"rectype":"","url":"./pet/img_res/clean/10021027.gif"},"_10021028":{"name":"魔幻浴盐","type":"clean","charm":0,"intel":4,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021028","price":-1,"rectype":"","url":"./pet/img_res/clean/10021028.gif"},"_10021029":{"name":"果酸魔皂","type":"clean","charm":0,"intel":2,"strong":0,"clean":720,"hunger":0,"desc":"","id":"10021029","price":-1,"rectype":"","url":"./pet/img_res/clean/10021029.gif"},"_10021030":{"name":"奇幻浴球","type":"clean","charm":0,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"10021030","price":-1,"rectype":"","url":"./pet/img_res/clean/10021030.gif"},"_102020001":{"name":"震动减肥仪","type":"clean","charm":0,"intel":0,"strong":0,"clean":540,"desc":"","id":"102020001","price":15,"rectype":"hot","url":"./pet/img_res/clean/102020001.gif","needLevel":4},"_102020002":{"name":"强力电吹风","type":"clean","charm":0,"intel":0,"strong":0,"clean":2340,"desc":"","id":"102020002","price":65,"rectype":"recommand","url":"./pet/img_res/clean/102020002.gif","needLevel":20},"_102020003":{"name":"舒爽喷湿器","type":"clean","charm":0,"intel":0,"strong":0,"clean":200,"desc":"","id":"102020003","price":5,"rectype":"new","url":"./pet/img_res/clean/102020003.gif","needLevel":0},"_102020005":{"name":"舒儿按摩器","type":"clean","charm":0,"intel":0,"strong":0,"clean":720,"desc":"","id":"102020005","price":20,"rectype":"new","url":"./pet/img_res/clean/102020005.gif","needLevel":6},"_102020006":{"name":"茶爽牙膏","type":"clean","charm":0,"intel":0,"strong":0,"clean":900,"desc":"","id":"102020006","price":25,"rectype":"new","url":"./pet/img_res/clean/102020006.gif","needLevel":8},"_102020007":{"name":"绒绒毛巾","type":"clean","charm":0,"intel":0,"strong":0,"clean":1620,"desc":"","id":"102020007","price":45,"rectype":"hot","url":"./pet/img_res/clean/102020007.gif","needLevel":14},"_102020008":{"name":"妙味香皂","type":"clean","charm":0,"intel":0,"strong":0,"clean":2520,"desc":"","id":"102020008","price":70,"rectype":"recommand","url":"./pet/img_res/clean/102020008.gif","needLevel":22},"_102020009":{"name":"冰爽沐浴液","type":"clean","charm":0,"intel":0,"strong":0,"clean":3780,"hunger":0,"desc":"","id":"102020009","price":105,"rectype":"recommand","url":"./pet/img_res/clean/102020009.gif","needLevel":34},"_102020010":{"name":"柠檬洗面奶","type":"clean","charm":0,"intel":0,"strong":0,"clean":3420,"desc":"","id":"102020010","price":95,"rectype":"new","url":"./pet/img_res/clean/102020010.gif","needLevel":30},"_102020011":{"name":"宝宝爽身粉","type":"clean","charm":0,"intel":0,"strong":0,"clean":2880,"desc":"","id":"102020011","price":80,"rectype":"new","url":"./pet/img_res/clean/102020011.gif","needLevel":26},"_102020012":{"name":"宝宝金水","type":"clean","charm":0,"intel":0,"strong":0,"clean":360,"desc":"","id":"102020012","price":10,"rectype":"new","url":"./pet/img_res/clean/102020012.gif","needLevel":2},"_102020013":{"name":"含香凝露","type":"clean","charm":0,"intel":0,"strong":0,"clean":1260,"desc":"","id":"102020013","price":35,"rectype":"new","url":"./pet/img_res/clean/102020013.gif","needLevel":10},"_102020014":{"name":"啤酒香波","type":"clean","charm":0,"intel":0,"strong":0,"clean":4140,"desc":"","id":"102020014","price":115,"rectype":"new","url":"./pet/img_res/clean/102020014.gif","needLevel":38},"_102020015":{"name":"飘飘护发素","type":"clean","charm":0,"intel":0,"strong":0,"clean":3060,"desc":"","id":"102020015","price":85,"rectype":"new","url":"./pet/img_res/clean/102020015.gif","needLevel":28},"_102020016":{"name":"保湿啧喱","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"","id":"102020016","price":75,"rectype":"new","url":"./pet/img_res/clean/102020016.gif"},"_102020017":{"name":"自动喷湿器","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"desc":"","id":"102020017","price":40,"rectype":"hot","url":"./pet/img_res/clean/102020017.gif","needLevel":12},"_102020018":{"name":"微型桑拿房","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"102020018","price":-1,"rectype":"","url":"./pet/img_res/clean/102020018.gif"},"_102020019":{"name":"QQ魔镜","type":"clean","charm":0,"intel":0,"strong":0,"clean":1800,"desc":"","id":"102020019","price":50,"rectype":"new","url":"./pet/img_res/clean/102020019.gif","needLevel":16},"_102020020":{"name":"魔幻矿泉泥","type":"clean","charm":0,"intel":0,"strong":0,"clean":3960,"desc":"","id":"102020020","price":110,"rectype":"recommand","url":"./pet/img_res/clean/102020020.gif","needLevel":36},"_102020021":{"name":"迷魂防蚊水","type":"clean","charm":0,"intel":0,"strong":0,"clean":1980,"desc":"","id":"102020021","price":55,"rectype":"new","url":"./pet/img_res/clean/102020021.gif","needLevel":18},"_102020022":{"name":"保健生发梳","type":"clean","charm":0,"intel":0,"strong":0,"clean":4680,"desc":"","id":"102020022","price":130,"rectype":"new","url":"./pet/img_res/clean/102020022.gif","needLevel":42},"_102020023":{"name":"情人香果","type":"clean","charm":0,"intel":0,"strong":0,"clean":2700,"desc":"","id":"102020023","price":75,"rectype":"hot","url":"./pet/img_res/clean/102020023.gif","needLevel":24},"_102020024":{"name":"玫瑰香薰","type":"clean","charm":0,"intel":0,"strong":0,"clean":3600,"desc":"","id":"102020024","price":100,"rectype":"hot","url":"./pet/img_res/clean/102020024.gif","needLevel":32},"_102020025":{"name":"超炫电吹风","type":"clean","charm":0,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"102020025","price":-1,"rectype":"","url":"./pet/img_res/clean/102020025.gif"},"_102020026":{"name":"呜噜呜噜云","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"102020026","price":-1,"rectype":"","url":"./pet/img_res/clean/102020026.gif"},"_102020027":{"name":"咣咣脱毛膏","type":"clean","charm":0,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"102020027","price":-1,"rectype":"","url":"./pet/img_res/clean/102020027.gif"},"_102020028":{"name":"牛牛奶浴","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"102020028","price":-1,"rectype":"","url":"./pet/img_res/clean/102020028.gif"},"_102020029":{"name":"滑滑爽爽粉","type":"clean","charm":0,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"102020029","price":-1,"rectype":"","url":"./pet/img_res/clean/102020029.gif"},"_102020030":{"name":"馨香花瓣浴","type":"clean","charm":0,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"102020030","price":-1,"rectype":"","url":"./pet/img_res/clean/102020030.gif"},"_102020031":{"name":"水果面膜","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"102020031","price":-1,"rectype":"","url":"./pet/img_res/clean/102020031.gif"},"_102020032":{"name":"Q宠宝宝霜","type":"clean","charm":0,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"102020032","price":-1,"rectype":"","url":"./pet/img_res/clean/102020032.gif"},"_102020033":{"name":"猪猪爱心皂","type":"clean","charm":0,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"102020033","price":-1,"rectype":"","url":"./pet/img_res/clean/102020033.gif"},"_102020034":{"name":"猪猪沐浴露","type":"clean","charm":0,"intel":0,"strong":0,"clean":720,"hunger":0,"desc":"","id":"102020034","price":-1,"rectype":"","url":"./pet/img_res/clean/102020034.gif"},"_102020035":{"name":"猪猪驱蚊水","type":"clean","charm":0,"intel":0,"strong":0,"clean":360,"hunger":0,"desc":"","id":"102020035","price":-1,"rectype":"","url":"./pet/img_res/clean/102020035.gif"},"_102020036":{"name":"猪猪痒痒挠","type":"clean","charm":0,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"102020036","price":-1,"rectype":"","url":"./pet/img_res/clean/102020036.gif"},"_102020037":{"name":"猪猪电吹风","type":"clean","charm":0,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"102020037","price":-1,"rectype":"","url":"./pet/img_res/clean/102020037.gif"},"_102020038":{"name":"梦幻浴球","type":"clean","charm":10,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"102020038","price":-1,"rectype":"","url":"./pet/img_res/clean/102020038.gif"},"_102020039":{"name":"精灵雨露","type":"clean","charm":6,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"102020039","price":-1,"rectype":"","url":"./pet/img_res/clean/102020039.gif"},"_102020040":{"name":"芦荟防晒霜","type":"clean","charm":4,"intel":0,"strong":0,"clean":1080,"hunger":0,"desc":"","id":"102020040","price":-1,"rectype":"","url":"./pet/img_res/clean/102020040.gif"},"_102020041":{"name":"Q牌电动刷","type":"clean","charm":17,"intel":0,"strong":0,"clean":2700,"hunger":0,"desc":"","id":"102020041","price":-1,"rectype":"","url":"./pet/img_res/clean/102020041.gif"},"_102020042":{"name":"迷你哇哇扇","type":"clean","charm":13,"intel":0,"strong":0,"clean":2340,"hunger":0,"desc":"","id":"102020042","price":-1,"rectype":"","url":"./pet/img_res/clean/102020042.gif"},"_102020047":{"name":"彩虹毛巾","type":"clean","charm":0,"intel":0,"strong":2,"clean":1800,"hunger":0,"desc":"","id":"102020047","price":-1,"rectype":"","url":"./pet/img_res/clean/102020047.gif"},"_102020048":{"name":"活力宝贝巾","type":"clean","charm":0,"intel":0,"strong":10,"clean":1800,"hunger":0,"desc":"","id":"102020048","price":-1,"rectype":"","url":"./pet/img_res/clean/102020048.gif"},"_102020049":{"name":"清爽激扬巾","type":"clean","charm":0,"intel":10,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"102020049","price":-1,"rectype":"","url":"./pet/img_res/clean/102020049.gif"},"_102020050":{"name":"爱意浓浓巾","type":"clean","charm":10,"intel":0,"strong":0,"clean":1800,"hunger":0,"desc":"","id":"102020050","price":-1,"rectype":"","url":"./pet/img_res/clean/102020050.gif"},"_102020051":{"name":"神奇火山盐","type":"clean","charm":0,"intel":0,"strong":2,"clean":1800,"hunger":0,"desc":"","PD":true,"id":"102020051","price":70,"rectype":"","url":"./pet/img_res/clean/102020051.gif"},"_102020052":{"name":"QQ魔香","type":"clean","charm":0,"intel":2,"strong":0,"clean":8000,"desc":"","id":"102020052","price":400,"PD":true,"rectype":"","url":"./pet/img_res/clean/102020052.gif","needLevel":0,"group":10,"useTimeing":240},"_102020053":{"name":"香薰精华液","type":"clean","charm":3,"intel":0,"strong":0,"clean":10000,"desc":"","id":"102020053","price":500,"PD":true,"rectype":"","url":"./pet/img_res/clean/102020053.gif","needLevel":0,"group":10,"useTimeing":300},"_102020054":{"name":"强力定型水","type":"clean","charm":1,"intel":0,"strong":0,"clean":2000,"desc":"","PD":true,"id":"102020054","price":100,"rectype":"","url":"./pet/img_res/clean/102020054.gif","needLevel":0,"group":10,"useTimeing":60},"_102020055":{"name":"柔爽洗发液","type":"clean","charm":0,"intel":1,"strong":0,"clean":4000,"desc":"","PD":true,"id":"102020055","price":200,"rectype":"","url":"./pet/img_res/clean/102020055.gif","needLevel":0,"group":10,"useTimeing":120},"_1021200001":{"name":"牛帅健康浴","type":"clean","charm":0,"intel":0,"strong":48,"clean":1440,"hunger":0,"desc":"","id":"1021200001","price":-1,"rectype":"","url":"./pet/img_res/clean/1021200001.gif"},"_1021200002":{"name":"牛牛快乐刷","type":"clean","charm":48,"intel":0,"strong":0,"clean":1440,"hunger":0,"desc":"","id":"1021200002","price":-1,"rectype":"","url":"./pet/img_res/clean/1021200002.gif"}}');
const medicine$1 = { "_10001": { "name": "板蓝根", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗感冒", "id": "10001", "price": 50, "rectype": "", "url": "./pet/img_res/medicine/10001.gif" }, "_10002": { "name": "消食片", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗消化不良", "id": "10002", "price": 50, "rectype": "", "url": "./pet/img_res/medicine/10002.gif" }, "_10003": { "name": "枇杷糖浆", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗咳嗽", "id": "10003", "price": 50, "rectype": "", "url": "./pet/img_res/medicine/10003.gif" }, "_10004": { "name": "清凉油", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗头晕", "id": "10004", "price": 50, "rectype": "", "url": "./pet/img_res/medicine/10004.gif" }, "_10005": { "name": "润肤露", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗皮肤瘙痒", "id": "10005", "price": 50, "rectype": "", "url": "./pet/img_res/medicine/10005.gif" }, "_20001": { "name": "银翘丸", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗重感冒", "id": "20001", "price": 120, "rectype": "", "url": "./pet/img_res/medicine/20001.gif" }, "_20002": { "name": "蓝色消炎水", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗胃炎", "id": "20002", "price": 120, "rectype": "", "url": "./pet/img_res/medicine/20002.gif" }, "_20003": { "name": "甘草剂", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗上呼吸道感染", "id": "20003", "price": 120, "rectype": "", "url": "./pet/img_res/medicine/20003.gif" }, "_20004": { "name": "止痛片", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗偏头痛", "id": "20004", "price": 120, "rectype": "", "url": "./pet/img_res/medicine/20004.gif" }, "_20005": { "name": "薄荷油", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗皮肤干裂", "id": "20005", "price": 120, "rectype": "", "url": "./pet/img_res/medicine/20005.gif" }, "_30001": { "name": "金色消炎水", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗肺炎", "id": "30001", "price": 200, "rectype": "", "url": "./pet/img_res/medicine/30001.gif" }, "_30002": { "name": "龙胆草", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗胃溃疡", "id": "30002", "price": 200, "rectype": "", "url": "./pet/img_res/medicine/30002.gif" }, "_30003": { "name": "定喘丸", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗哮喘", "id": "30003", "price": 200, "rectype": "", "url": "./pet/img_res/medicine/30003.gif" }, "_30004": { "name": "退烧药", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗发高烧", "id": "30004", "price": 200, "rectype": "", "url": "./pet/img_res/medicine/30004.gif" }, "_30005": { "name": "生肌膏", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗皮肤溃疡", "id": "30005", "price": 200, "rectype": "", "url": "./pet/img_res/medicine/30005.gif" }, "_40001": { "name": "噗噗神水", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗肺结核", "id": "40001", "price": 350, "rectype": "", "url": "./pet/img_res/medicine/40001.gif" }, "_40002": { "name": "仙人汤", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗胃癌", "id": "40002", "price": 350, "rectype": "", "url": "./pet/img_res/medicine/40002.gif" }, "_40003": { "name": "通风散", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗支气管炎", "id": "40003", "price": 350, "rectype": "", "url": "./pet/img_res/medicine/40003.gif" }, "_40004": { "name": "何首乌", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗心力衰竭", "id": "40004", "price": 350, "rectype": "", "url": "./pet/img_res/medicine/40004.gif" }, "_40005": { "name": "茶树油", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "用于治疗皮肤溃疡感染", "id": "40005", "price": 350, "rectype": "", "url": "./pet/img_res/medicine/40005.gif" }, "_50001": { "name": "百草丹", "type": "medicine", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "包治百病，一粒见效", "id": "50001", "price": 500, "rectype": "", "url": "./pet/img_res/medicine/50001.gif" }, "_60001": { "name": "还魂丹", "type": "medicine", "charm": 0, "intel": 0, "strong": 100, "clean": 500, "hunger": 500, "mood": 100, "desc": "大还丹，用于复活宠物，也可治百病,吃一颗长生不老！", "id": "60001", "price": 8800, "rectype": "hot", "url": "./pet/img_res/medicine/60001.gif" } };
const background = { "_b0000000": { "name": "无背景", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "无背景，装备可以卸下正在使用的背景。", "id": "b0000000", "price": 10, "group": 0, "useTimeing": 5, "rectype": "", "url": "./pet/img_res/background/b0000000.gif" }, "_b0000001": { "name": "背景1", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000001", "price": 120, "group": 5, "needLevel": 5, "useTimeing": 60, "rectype": "", "url": "./pet/img_res/background/b0000001.gif" }, "_b0000002": { "name": "背景2", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000002", "price": 240, "group": 5, "needLevel": 10, "useTimeing": 120, "rectype": "", "url": "./pet/img_res/background/b0000002.gif" }, "_b0000003": { "name": "背景3", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000003", "price": 360, "group": 5, "needLevel": 15, "useTimeing": 180, "rectype": "", "url": "./pet/img_res/background/b0000003.gif" }, "_b0000004": { "name": "背景4", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000004", "price": 480, "group": 5, "needLevel": 20, "useTimeing": 240, "rectype": "", "url": "./pet/img_res/background/b0000004.gif" }, "_b0000005": { "name": "背景5", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000005", "price": 600, "group": 5, "needLevel": 25, "useTimeing": 300, "rectype": "", "url": "./pet/img_res/background/b0000005.gif" }, "_b0000006": { "name": "背景6", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000006", "price": 720, "group": 5, "needLevel": 30, "useTimeing": 360, "rectype": "", "url": "./pet/img_res/background/b0000006.gif" }, "_b0000007": { "name": "背景7", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000007", "price": 720, "group": 5, "needLevel": 30, "useTimeing": 360, "rectype": "", "url": "./pet/img_res/background/b0000007.gif" }, "_b0000008": { "name": "背景8", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000008", "price": 720, "group": 5, "needLevel": 30, "useTimeing": 360, "rectype": "", "url": "./pet/img_res/background/b0000008.gif" }, "_b0000009": { "name": "背景9", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000009", "price": 720, "group": 5, "needLevel": 30, "useTimeing": 360, "rectype": "", "url": "./pet/img_res/background/b0000009.gif" }, "_b0000010": { "name": "背景10", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000010", "price": 840, "group": 5, "needLevel": 35, "useTimeing": 420, "rectype": "", "url": "./pet/img_res/background/b0000010.gif" }, "_b0000011": { "name": "背景11", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000011", "price": 1920, "PD": true, "group": 10, "needLevel": 0, "useTimeing": 480, "rectype": "", "url": "./pet/img_res/background/b0000011.gif" }, "_b0000012": { "name": "背景12", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000012", "price": 1920, "group": 10, "needLevel": 0, "PD": true, "useTimeing": 480, "rectype": "", "url": "./pet/img_res/background/b0000012.gif" }, "_b0000013": { "name": "背景13", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000013", "price": 5760, "group": 10, "PD": true, "needLevel": 0, "useTimeing": 1440, "rectype": "", "url": "./pet/img_res/background/b0000013.gif" }, "_b0000014": { "name": "背景14", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000014", "price": 5760, "PD": true, "group": 10, "needLevel": 0, "useTimeing": 1440, "rectype": "", "url": "./pet/img_res/background/b0000014.gif" }, "_b0000015": { "name": "背景15", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "id": "b0000015", "PD": true, "price": 5760, "group": 10, "needLevel": 0, "useTimeing": 1440, "rectype": "", "url": "./pet/img_res/background/b0000015.gif" }, "_b0000016": { "name": "背景16", "type": "background", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "", "PD": true, "id": "b0000016", "price": 5760, "group": 10, "needLevel": 0, "useTimeing": 1440, "rectype": "", "url": "./pet/img_res/background/b0000016.gif" } };
const toy = { "_t0001": { "name": "白色MP3", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 200, "needLevel": 20, "id": "t0001", "price": 80, "url": "./pet/img_res/toy/t0001.png" }, "_t0002": { "name": "棒球", "type": "toy", "charm": 0, "intel": 0, "strong": 2, "clean": 0, "needLevel": 5, "mood": 50, "id": "t0002", "price": 20, "url": "./pet/img_res/toy/t0002.png" }, "_t0003": { "name": "粉红MP3", "type": "toy", "charm": 2, "intel": 0, "strong": 0, "clean": 0, "mood": 250, "needLevel": 25, "id": "t0003", "price": 100, "url": "./pet/img_res/toy/t0003.png" }, "_t0004": { "name": "黑色MP3", "type": "toy", "charm": 2, "intel": 0, "strong": 0, "clean": 0, "needLevel": 30, "mood": 300, "id": "t0004", "price": 120, "url": "./pet/img_res/toy/t0004.png" }, "_t0005": { "name": "黑色笔记本", "type": "toy", "charm": 2, "intel": 2, "strong": 0, "clean": 0, "needLevel": 0, "mood": 350, "id": "t0005", "price": 380, "url": "./pet/img_res/toy/t0005.png", "PD": true, "group": 10, "useTimeing": 60 }, "_t0006": { "name": "红色笔记本", "type": "toy", "charm": 2, "intel": 4, "strong": 0, "clean": 0, "needLevel": 0, "mood": 400, "id": "t0006", "price": 640, "url": "./pet/img_res/toy/t0006.png", "PD": true, "group": 10, "useTimeing": 60 }, "_t0007": { "name": "滑板", "type": "toy", "charm": 2, "intel": 0, "strong": 4, "clean": 0, "needLevel": 15, "mood": 150, "id": "t0007", "price": 60, "url": "./pet/img_res/toy/t0007.png" }, "_t0008": { "name": "棒球棒", "type": "toy", "charm": 4, "intel": 0, "strong": 4, "clean": 0, "mood": 100, "needLevel": 10, "id": "t0008", "price": 40, "url": "./pet/img_res/toy/t0008.png" }, "_t0009": { "name": "蓝色MP3", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 220, "needLevel": 22, "id": "t0009", "price": 90, "url": "./pet/img_res/toy/蓝色MP3.png" }, "_t0010": { "name": "足球", "type": "toy", "charm": 0, "intel": 0, "strong": 2, "clean": 0, "mood": 60, "needLevel": 5, "id": "t0010", "price": 24, "url": "./pet/img_res/toy/足球.png" }, "_t0011": { "name": "哑铃", "type": "toy", "charm": 0, "intel": 0, "strong": 3, "clean": 0, "mood": 80, "needLevel": 8, "id": "t0011", "price": 32, "url": "./pet/img_res/toy/哑铃.png" }, "_t0012": { "name": "拳套", "type": "toy", "charm": 0, "intel": 0, "strong": 4, "clean": 0, "mood": 90, "needLevel": 10, "id": "t0012", "price": 36, "url": "./pet/img_res/toy/拳套.png" }, "_t0013": { "name": "小老鼠", "type": "toy", "charm": 2, "intel": 0, "strong": 0, "clean": 0, "mood": 70, "needLevel": 6, "id": "t0013", "price": 28, "url": "./pet/img_res/toy/小老鼠.png" }, "_t0014": { "name": "铃铛", "type": "toy", "charm": 2, "intel": 0, "strong": 0, "clean": 0, "mood": 80, "needLevel": 8, "id": "t0014", "price": 30, "url": "./pet/img_res/toy/铃铛.png" }, "_t0015": { "name": "银环", "type": "toy", "charm": 3, "intel": 0, "strong": 0, "clean": 0, "mood": 100, "needLevel": 12, "id": "t0015", "price": 44, "url": "./pet/img_res/toy/银环.png" }, "_t0016": { "name": "羽毛", "type": "toy", "charm": 2, "intel": 0, "strong": 0, "clean": 0, "mood": 60, "needLevel": 4, "id": "t0016", "price": 22, "url": "./pet/img_res/toy/羽毛.png" }, "_t0017": { "name": "糖果", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 70, "needLevel": 5, "id": "t0017", "price": 26, "url": "./pet/img_res/toy/糖果.png" }, "_t0018": { "name": "烟花", "type": "toy", "charm": 3, "intel": 0, "strong": 0, "clean": 0, "mood": 120, "needLevel": 12, "id": "t0018", "price": 50, "url": "./pet/img_res/toy/烟花.png" }, "_t0019": { "name": "气泡", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 50, "needLevel": 3, "id": "t0019", "price": 18, "url": "./pet/img_res/toy/气泡.png" }, "_t0020": { "name": "手机", "type": "toy", "charm": 2, "intel": 2, "strong": 0, "clean": 0, "mood": 180, "needLevel": 18, "id": "t0020", "price": 70, "url": "./pet/img_res/toy/手机.png" }, "_t0021": { "name": "绳子", "type": "toy", "charm": 0, "intel": 0, "strong": 2, "clean": 0, "mood": 70, "needLevel": 8, "id": "t0021", "price": 28, "url": "./pet/img_res/toy/绳子.png" }, "_t0022": { "name": "瓶子", "type": "toy", "charm": 0, "intel": 1, "strong": 0, "clean": 0, "mood": 50, "needLevel": 4, "id": "t0022", "price": 20, "url": "./pet/img_res/toy/瓶子.png" }, "_t0023": { "name": "夹子", "type": "toy", "charm": 0, "intel": 0, "strong": 1, "clean": 0, "mood": 40, "needLevel": 3, "id": "t0023", "price": 16, "url": "./pet/img_res/toy/夹子.png" }, "_t0024": { "name": "刷子", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 45, "needLevel": 3, "id": "t0024", "price": 16, "url": "./pet/img_res/toy/刷子.png" }, "_t0025": { "name": "喷壶", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 45, "needLevel": 3, "id": "t0025", "price": 16, "url": "./pet/img_res/toy/喷壶.png" }, "_t0026": { "name": "手巾", "type": "toy", "charm": 1, "intel": 0, "strong": 0, "clean": 0, "mood": 40, "needLevel": 3, "id": "t0026", "price": 16, "url": "./pet/img_res/toy/手巾.png" }, "_t0027": { "name": "樟脑", "type": "toy", "charm": 0, "intel": 1, "strong": 0, "clean": 0, "mood": 30, "needLevel": 5, "id": "t0027", "price": 18, "url": "./pet/img_res/toy/樟脑.png" } };
const service = { "_s0001": { "name": "治疗", "type": "service", "charm": 0, "intel": 0, "strong": 0, "clean": 0, "hunger": 0, "desc": "诊断病情，得到结果，不要随意吃药哦~~", "id": "s0001", "price": -1, "rectype": "", "url": "./pet/img_res/service/s0001.gif" } };
const work$1 = { "_bz": { "name": "搬砖", "tolkName": "搬砖", "type": "work", "charm": 0, "intel": 0, "strong": 1, "desc": "搬砖赚钱了~~", "id": "bz", "rectype": "", "yb": 10, "education": {}, "needLevel": 2, "useTime": 30, "url": "./pet/img_res/work/bz.png" }, "_nwg": { "name": "泥瓦工", "tolkName": "做泥瓦工", "type": "work", "charm": 0, "intel": 1, "strong": 1, "desc": "嘿咻嘿咻~~", "id": "nwg", "yb": 30, "rectype": "", "needLevel": 4, "useTime": 30, "education": { "labouring": 10 }, "url": "./pet/img_res/work/nwg.png" }, "_hj": { "name": "花匠", "tolkName": "做花匠", "type": "work", "charm": 10, "intel": 0, "strong": 0, "desc": "花儿真美丽~~", "id": "hj", "yb": 40, "rectype": "", "needLevel": 6, "useTime": 30, "education": { "manner": 10 }, "url": "./pet/img_res/work/hj.png" }, "_yd": { "name": "园丁", "tolkName": "做园丁", "type": "work", "charm": 0, "intel": 10, "strong": 0, "desc": "我要做一个城堡！~~", "id": "yd", "yb": 60, "rectype": "", "needLevel": 6, "useTime": 30, "education": { "chinese": 10, "art": 10 }, "url": "./pet/img_res/work/yd.png" }, "_mj": { "name": "木匠", "tolkName": "做木匠", "type": "work", "charm": 0, "intel": 10, "strong": 0, "desc": "鲁班大师是我的偶像！~~", "id": "mj", "yb": 80, "rectype": "", "needLevel": 6, "useTime": 30, "education": { "labouring": 10 }, "url": "./pet/img_res/work/mj.png" }, "_jz": { "name": "记者", "tolkName": "做记者", "type": "work", "charm": 0, "intel": 1, "strong": 0, "desc": "新闻在哪里！~~", "id": "jz", "yb": 50, "rectype": "", "needLevel": 6, "useTime": 30, "url": "./pet/img_res/work/jz.png", "education": { "chinese": 10 } }, "_ba": { "name": "保安", "tolkName": "做保安", "type": "work", "charm": 0, "intel": 0, "strong": 10, "desc": "我的小区我做主！~~", "id": "ba", "yb": 100, "rectype": "", "needLevel": 12, "useTime": 30, "education": { "politics": 10, "wushu": 10 }, "url": "./pet/img_res/work/ba.png" }, "_yy": { "name": "演员", "tolkName": "做演员", "type": "work", "charm": 5, "intel": 5, "strong": 8, "desc": "欢迎来到我的舞台！~~", "id": "yy", "yb": 150, "rectype": "", "needLevel": 12, "useTime": 30, "useArtt": { "intel": 800, "strong": 1e3, "charm": 800 }, "education": { "manner": 31, "labouring": 31 }, "url": "./pet/img_res/work/yy.png" }, "_ls": { "name": "律师", "tolkName": "做律师", "type": "work", "charm": 5, "intel": 8, "strong": 5, "desc": "我是一个正义的律师！~~", "id": "ls", "rectype": "", "yb": 170, "needLevel": 12, "useTime": 30, "useArtt": { "intel": 1500, "strong": 900, "charm": 900 }, "education": { "politics": 72 }, "url": "./pet/img_res/work/ls.png" }, "_gs": { "name": "歌手", "tolkName": "做歌手", "type": "work", "intel": 5, "strong": 5, "charm": 8, "desc": "夜空中最亮的星，就是我！~~", "id": "gs", "yb": 190, "useArtt": { "intel": 1e3, "strong": 1e3, "charm": 1500 }, "rectype": "", "needLevel": 12, "useTime": 30, "education": { "music": 31 }, "url": "./pet/img_res/work/gs.png" }, "_mhj": { "name": "漫画家", "tolkName": "做漫画家", "type": "work", "intel": 9, "strong": 6, "charm": 6, "desc": "我是要成为海贼王的男人！~~", "id": "mhj", "yb": 210, "rectype": "", "needLevel": 12, "useTime": 30, "useArtt": { "intel": 1800, "strong": 1200, "charm": 1200 }, "education": { "art": 31, "labouring": 31 }, "url": "./pet/img_res/work/mhj.png" }, "_jc": { "name": "警察", "tolkName": "做警察", "type": "work", "intel": 9, "strong": 6, "charm": 6, "desc": "我是人民警察，为人民！~~", "id": "jc", "yb": 230, "rectype": "", "needLevel": 12, "useTime": 30, "useArtt": { "intel": 1300, "strong": 2e3, "charm": 1300 }, "education": { "politics": 31, "wushu": 72 }, "url": "./pet/img_res/work/jc.png" }, "_cqz": { "name": "词曲者", "tolkName": "做词曲者", "type": "work", "intel": 6, "strong": 6, "charm": 9, "desc": "天青色等烟雨，而我在等你！~~", "id": "cqz", "yb": 250, "rectype": "", "needLevel": 12, "useTime": 30, "useArtt": { "intel": 1300, "strong": 1300, "charm": 2e3 }, "education": { "chinese": 31, "music": 31 }, "url": "./pet/img_res/work/cqz.png" }, "_bj": { "name": "编辑", "tolkName": "做编辑", "type": "work", "charm": 7, "intel": 10, "strong": 7, "desc": "好事是好事，坏事也是好事！~~", "id": "bj", "yb": 270, "rectype": "", "needLevel": 12, "useTime": 30, "useArtt": { "intel": 2400, "strong": 1400, "charm": 1400 }, "education": { "chinese": 72 }, "url": "./pet/img_res/work/bj.png" }, "_jl": { "name": "教练", "tolkName": "做教练", "type": "work", "charm": 7, "intel": 7, "strong": 10, "desc": "学妹最喜欢的就是我了，我该挑哪个呢！~~", "id": "jl", "yb": 290, "rectype": "", "needLevel": 14, "useTime": 30, "useArtt": { "charm": 1500, "intel": 1500, "strong": 2500 }, "education": { "pe": 72 }, "url": "./pet/img_res/work/jl.png" }, "_jg": { "name": "教官", "tolkName": "做教官", "type": "work", "charm": 0, "intel": 0, "strong": 10, "desc": "立正！稍息！~~", "id": "jg", "yb": 300, "rectype": "", "needLevel": 14, "useTime": 30, "url": "./pet/img_res/work/jg.png", "education": { "pe": 72 }, "useArtt": { "charm": 1500, "intel": 1500, "strong": 2e3 } }, "_sys": { "name": "摄影师", "tolkName": "做摄影师", "type": "work", "charm": 10, "intel": 7, "strong": 7, "desc": "来，看这里，你笑得太假了！~~", "id": "sys", "yb": 310, "rectype": "", "needLevel": 14, "useTime": 30, "useArtt": { "charm": 2600, "intel": 1600, "strong": 1600 }, "education": { "art": 72 }, "url": "./pet/img_res/work/sys.png" }, "_jzs": { "name": "建筑师", "tolkName": "做建筑师", "type": "work", "charm": 8, "intel": 8, "strong": 8, "desc": "看到没，外滩就是我监工的！~~", "yb": 780, "id": "jzs", "rectype": "", "needLevel": 14, "useTime": 60, "useArtt": { "charm": 3e3, "intel": 3e3, "strong": 3e3 }, "education": { "art": 72, "mathematics": 72 }, "url": "./pet/img_res/work/jzs.png" }, "_zhj": { "name": "指挥家", "tolkName": "做指挥家", "type": "work", "charm": 8, "intel": 8, "strong": 8, "desc": "注意看我的指挥棒！~~", "id": "zhj", "yb": 780, "rectype": "", "needLevel": 14, "useTime": 60, "url": "./pet/img_res/work/zhj.png", "education": { "pe": 72, "music": 72 }, "useArtt": { "charm": 3e3, "intel": 3e3, "strong": 3e3 } }, "_zdx": { "name": "科研人员", "tolkName": "做科研人员", "type": "work", "charm": 9, "intel": 9, "strong": 9, "desc": "助理，过来下，这个药剂这样配！~~", "id": "zdx", "yb": 1024, "rectype": "", "needLevel": 14, "useTime": 80, "useArtt": { "charm": 4e3, "intel": 4e3, "strong": 4e3 }, "education": { "chinese": 72, "mathematics": 72, "art": 72, "pe": 72 }, "url": "./pet/img_res/work/zdx.png" }, "_wdj": { "name": "武道家", "tolkName": "做武道家", "type": "work", "charm": 8, "intel": 8, "strong": 9, "desc": "以武入道！~~", "id": "wdj", "yb": 900, "rectype": "", "needLevel": 14, "useTime": 60, "url": "./pet/img_res/work/wdj.png", "education": { "pe": 72, "labouring": 72, "wushu": 72 }, "useArtt": { "charm": 2500, "intel": 2500, "strong": 3500 } }, "_wrm": { "name": "万人迷", "tolkName": "做万人迷", "type": "work", "charm": 9, "intel": 8, "strong": 8, "desc": "大家都喜欢我！~~", "id": "wrm", "yb": 900, "rectype": "", "needLevel": 14, "useTime": 60, "url": "./pet/img_res/work/wrm.png", "education": { "art": 72, "music": 72, "manner": 72 }, "useArtt": { "charm": 3500, "intel": 2500, "strong": 2500 } }, "_cww": { "name": "宠物王", "tolkName": "做宠物王", "type": "work", "charm": 10, "intel": 10, "strong": 10, "desc": "这个岛我说了算！~~", "id": "cww", "yb": 1800, "rectype": "", "needLevel": 16, "useTime": 100, "url": "./pet/img_res/work/cww.png", "education": { "wushu": 168, "politics": 168, "manner": 168 }, "useArtt": { "charm": 12e3, "intel": 12e3, "strong": 12e3 } }, "_spg": { "name": "公务员", "tolkName": "做公务员", "type": "work", "charm": 10, "intel": 10, "strong": 10, "desc": "一切为了党！为了人民！~~", "id": "spg", "rectype": "", "yb": 2048, "needLevel": 16, "useTime": 120, "education": { "chinese": 168, "mathematics": 168, "politics": 168, "music": 168, "art": 168, "manner": 168, "pe": 168, "labouring": 168, "wushu": 168 }, "useArtt": { "charm": 15e3, "intel": 15e3, "strong": 15e3 }, "url": "./pet/img_res/work/spg.png" } };
const study$1 = { "_xx-chinese": { "object": "语文", "value": "chinese", "id": "xx-chinese", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学语文", "type": "study", "intel": 10, "url": "./pet/img_res/study/xx-chinese.png" }, "_xx-mathematics": { "object": "数学", "value": "mathematics", "id": "xx-mathematics", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学数学", "type": "study", "intel": 10, "url": "./pet/img_res/study/xx-mathematics.png" }, "_xx-politics": { "object": "政治", "value": "politics", "id": "xx-politics", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学政治", "type": "study", "intel": 10, "url": "./pet/img_res/study/xx-politics.png" }, "_xx-music": { "object": "音乐", "value": "music", "id": "xx-music", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学音乐", "type": "study", "charm": 10, "url": "./pet/img_res/study/xx-music.png" }, "_xx-art": { "object": "艺术", "value": "art", "school": 0, "id": "xx-art", "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学艺术", "type": "study", "charm": 10, "url": "./pet/img_res/study/xx-art.png" }, "_xx-manner": { "object": "礼仪", "value": "manner", "id": "xx-manner", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学礼仪", "type": "study", "charm": 10, "url": "./pet/img_res/study/xx-manner.png" }, "_xx-pe": { "object": "体育", "value": "pe", "id": "xx-pe", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学体育", "type": "study", "strong": 10, "url": "./pet/img_res/study/xx-pe.png" }, "_xx-labouring": { "object": "劳技", "value": "labouring", "id": "xx-labouring", "school": 0, "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学劳技", "type": "study", "strong": 10, "url": "./pet/img_res/study/xx-labouring.png" }, "_xx-wushu": { "object": "武术", "value": "wushu", "school": 0, "id": "xx-wushu", "classNumUp": 0, "classNum": 9, "useTime": 45, "tolkName": "小学武术", "type": "study", "strong": 10, "url": "./pet/img_res/study/xx-wushu.png" }, "_zx-chinese": { "object": "语文", "value": "chinese", "id": "zx-chinese", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学语文", "type": "study", "intel": 15, "url": "./pet/img_res/study/zx-chinese.png" }, "_zx-mathematics": { "object": "数学", "value": "mathematics", "id": "zx-mathematics", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学数学", "type": "study", "intel": 15, "url": "./pet/img_res/study/zx-mathematics.png" }, "_zx-politics": { "object": "政治", "value": "politics", "id": "zx-politics", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学政治", "type": "study", "intel": 15, "url": "./pet/img_res/study/zx-politics.png" }, "_zx-music": { "object": "音乐", "value": "music", "id": "zx-music", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学音乐", "type": "study", "charm": 15, "url": "./pet/img_res/study/zx-music.png" }, "_zx-art": { "object": "艺术", "value": "art", "school": 1, "id": "zx-art", "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学艺术", "type": "study", "charm": 15, "url": "./pet/img_res/study/zx-art.png" }, "_zx-manner": { "object": "礼仪", "value": "manner", "id": "zx-manner", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学礼仪", "type": "study", "charm": 15, "url": "./pet/img_res/study/zx-manner.png" }, "_zx-pe": { "object": "体育", "value": "pe", "id": "zx-pe", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学体育", "type": "study", "strong": 15, "url": "./pet/img_res/study/zx-pe.png" }, "_zx-labouring": { "object": "劳技", "value": "labouring", "id": "zx-labouring", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学劳技", "type": "study", "strong": 15, "url": "./pet/img_res/study/zx-labouring.png" }, "_zx-wushu": { "object": "武术", "value": "wushu", "id": "zx-wushu", "school": 1, "classNumUp": 10, "classNum": 20, "useTime": 45, "tolkName": "中学武术", "type": "study", "strong": 15, "url": "./pet/img_res/study/zx-wushu.png" }, "_dx-chinese": { "object": "语文", "value": "chinese", "id": "dx-chinese", "school": 2, "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学语文", "type": "study", "intel": 20, "url": "./pet/img_res/study/dx-chinese.png" }, "_dx-mathematics": { "object": "数学", "value": "mathematics", "id": "dx-mathematics", "school": 2, "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学数学", "type": "study", "intel": 20, "url": "./pet/img_res/study/dx-mathematics.png" }, "_dx-politics": { "object": "政治", "value": "politics", "id": "dx-politics", "school": 2, "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学政治", "type": "study", "intel": 20, "url": "./pet/img_res/study/dx-politics.png" }, "_dx-music": { "object": "音乐", "value": "music", "id": "dx-music", "school": 2, "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学音乐", "type": "study", "charm": 20, "url": "./pet/img_res/study/dx-music.png" }, "_dx-art": { "object": "艺术", "value": "art", "id": "dx-art", "school": 2, "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学艺术", "type": "study", "charm": 20, "url": "./pet/img_res/study/dx-art.png" }, "_dx-manner": { "object": "礼仪", "value": "manner", "school": 2, "id": "dx-manner", "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学礼仪", "type": "study", "charm": 20, "url": "./pet/img_res/study/dx-manner.png" }, "_dx-pe": { "object": "体育", "value": "pe", "id": "dx-pe", "school": 2, "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学体育", "type": "study", "strong": 20, "url": "./pet/img_res/study/dx-pe.png" }, "_dx-labouring": { "object": "劳技", "value": "labouring", "school": 2, "id": "dx-labouring", "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学劳技", "type": "study", "strong": 20, "url": "./pet/img_res/study/dx-labouring.png" }, "_dx-wushu": { "object": "武术", "value": "wushu", "school": 2, "id": "dx-wushu", "classNumUp": 31, "classNum": 40, "useTime": 55, "tolkName": "大学武术", "type": "study", "strong": 20, "url": "./pet/img_res/study/dx-wushu.png" }, "_yjs-chinese": { "object": "语文", "value": "chinese", "school": 3, "id": "yjs-chinese", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生语文", "type": "study", "intel": 25, "url": "./pet/img_res/study/yjs-chinese.png" }, "_yjs-mathematics": { "object": "数学", "value": "mathematics", "school": 3, "id": "yjs-mathematics", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生数学", "type": "study", "intel": 25, "url": "./pet/img_res/study/yjs-mathematics.png" }, "_yjs-politics": { "object": "政治", "value": "politics", "school": 3, "id": "yjs-politics", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生政治", "type": "study", "intel": 25, "url": "./pet/img_res/study/yjs-politics.png" }, "_yjs-music": { "object": "音乐", "value": "music", "school": 3, "id": "yjs-music", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生音乐", "type": "study", "charm": 25, "url": "./pet/img_res/study/yjs-music.png" }, "_yjs-art": { "object": "艺术", "value": "art", "id": "yjs-art", "school": 3, "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生艺术", "type": "study", "charm": 25, "url": "./pet/img_res/study/yjs-art.png" }, "_yjs-manner": { "object": "礼仪", "value": "manner", "id": "yjs-manner", "school": 3, "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生礼仪", "type": "study", "charm": 25, "url": "./pet/img_res/study/yjs-manner.png" }, "_yjs-pe": { "object": "体育", "value": "pe", "school": 3, "id": "yjs-pe", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生体育", "type": "study", "strong": 25, "url": "./pet/img_res/study/yjs-pe.png" }, "_yjs-labouring": { "object": "劳技", "value": "labouring", "school": 3, "id": "yjs-labouring", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "研究生劳技", "type": "study", "strong": 25, "url": "./pet/img_res/study/yjs-labouring.png" }, "_yjs-wushu": { "object": "武术", "value": "wushu", "school": 3, "classNumUp": 72, "classNum": 95, "id": "yjs-wushu", "useTime": 55, "tolkName": "研究生武术", "type": "study", "strong": 25, "url": "./pet/img_res/study/yjs-wushu.png" }, "_xwzj-chinese": { "object": "语文", "value": "chinese", "school": 3, "id": "xwzj-chinese", "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-语文", "type": "study", "intel": 50, "url": "./pet/img_res/study/yjs-chinese.png" }, "_xwzj-mathematics": { "object": "数学", "value": "mathematics", "school": 3, "id": "xwzj-mathematics", "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-数学", "type": "study", "intel": 50, "url": "./pet/img_res/study/yjs-mathematics.png" }, "_xwzj-politics": { "object": "政治", "value": "politics", "school": 3, "id": "xwzj-politics", "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-政治", "type": "study", "intel": 50, "url": "./pet/img_res/study/yjs-politics.png" }, "_xwzj-music": { "object": "音乐", "value": "music", "school": 3, "id": "xwzj-music", "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-音乐", "type": "study", "charm": 50, "url": "./pet/img_res/study/yjs-music.png" }, "_xwzj-art": { "object": "艺术", "value": "art", "id": "xwzj-art", "school": 3, "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-艺术", "type": "study", "charm": 50, "url": "./pet/img_res/study/yjs-art.png" }, "_xwzj-manner": { "object": "礼仪", "value": "manner", "id": "xwzj-manner", "school": 3, "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-礼仪", "type": "study", "charm": 50, "url": "./pet/img_res/study/yjs-manner.png" }, "_xwzj-pe": { "object": "体育", "value": "pe", "school": 3, "id": "xwzj-pe", "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-体育", "type": "study", "strong": 50, "url": "./pet/img_res/study/yjs-pe.png" }, "_xwzj-labouring": { "object": "劳技", "value": "labouring", "school": 3, "id": "xwzj-labouring", "classNumUp": 168, "classNum": 9999998, "useTime": 55, "tolkName": "学无止境-劳技", "type": "study", "strong": 50, "url": "./pet/img_res/study/yjs-labouring.png" }, "_xwzj-wushu": { "object": "武术", "value": "wushu", "school": 3, "classNumUp": 168, "classNum": 9999998, "id": "xwzj-wushu", "useTime": 55, "tolkName": "学无止境-武术", "type": "study", "strong": 50, "url": "./pet/img_res/study/yjs-wushu.png" } };
const trip$1 = { "_random": { "object": "随机地点", "value": "random", "id": "random", "classNumUp": 72, "classNum": 95, "useTime": 55, "tolkName": "随机旅游地点", "type": "study", "strong": 95, "hunger": 220, "clean": 220, "url": "./pet/img_res/trip/random.gif" } };
const nums$1 = { "_yb": { "name": "元宝", "object": "元宝", "type": "nums", "id": "yb", "price": 20, "value": 1, "url": "./pet/img_res/muns/l1.gif" }, "_ybCut": { "name": "缴税", "object": "缴税", "type": "nums", "id": "ybCut", "useId": "yb", "price": 20, "value": -100, "url": "./pet/img_res/muns/l1.gif", "desc": "自主缴税，为社区做贡献" }, "_growth": { "name": "成长值", "object": "成长值", "type": "nums", "id": "growth", "value": 1, "price": 100, "url": "./pet/img_res/muns/growth.png" }, "_growthCut": { "name": "驻颜丹", "object": "驻颜丹", "type": "nums", "id": "growthCut", "useId": "growth", "value": -300, "price": 800, "url": "./pet/img_res/muns/growth.png", "desc": "宝贝成长太快了？可以试试减少成长值哦~~" }, "_health": { "name": "T病毒", "object": "T病毒", "type": "nums", "id": "health", "value": -1, "num": 1, "price": 8800, "url": "./pet/img_res/muns/t.svg", "desc": "主人，你真狠心！~~" } };
const GOODS = {
  food,
  clean,
  medicine: medicine$1,
  background,
  toy,
  service,
  work: work$1,
  study: study$1,
  trip: trip$1,
  nums: nums$1
};
const TABLE = GOODS;
const goodOf = (type, id, num = 1) => ({
  ...TABLE[type][`_${id}`],
  num
});
const allGoods = (type) => Object.values(TABLE[type]).map((g) => ({ ...g, num: 1 }));
function findGood(id) {
  const type = Object.keys(TABLE).find((t) => TABLE[t][`_${id}`]);
  return goodOf(type, id);
}
function parseGood(code) {
  const [id, n] = code.slice(1).split("*");
  return { ...findGood(id), num: +(n ?? 1) };
}
const attrs = (g) => [
  ["魅力", g.charm],
  ["智力", g.intel],
  ["武力", g.strong],
  ["心情", g.mood]
].filter(([, v]) => v).map(([k, v]) => ` ${k}+${v}`).join("");
const NUMS_ATTR = {
  yb: ["元宝", "个"],
  growth: ["成长值", "点"],
  health: ["健康值", "点"]
};
function describe(g) {
  if (g.type === "nums") {
    const [noun, unit] = NUMS_ATTR[g.useId ?? g.id] ?? [g.name, "点"];
    const v = g.value ?? 0;
    const line2 = `每个${v < 0 ? "减少" : "增加"} ${Math.abs(v)} ${unit}${noun}`;
    return [line2, g.desc].filter((l) => Boolean(l));
  }
  const a = attrs(g);
  const lines = [
    g.desc,
    g.hunger && `饥饿：${g.hunger}`,
    g.clean && `清洁：${g.clean}`,
    a && `属性：${a}`,
    g.group && `成长值：${g.group}`,
    g.useTimeing && `持续时间：${g.useTimeing}分钟`
  ];
  return lines.filter((l) => Boolean(l));
}
const TYPE_NAMES = {
  food: "食物",
  clean: "日用品",
  medicine: "药品",
  toy: "玩具",
  nums: "功能",
  background: "背景",
  service: "服务",
  work: "工作",
  study: "学习",
  trip: "学习"
};
const need$1 = (n) => 100 * n + 25 * n * (n + 1) * (2 * n + 1) / 6;
function levelOf(growth2) {
  let level = 1;
  while (growth2 >= need$1(level)) level++;
  return { level, upGrowth: need$1(level - 1), nextGrowth: need$1(level) };
}
const stageOf = (level) => level >= 16 ? "Adult" : level >= 5 ? "Kid" : "Egg";
const WINDOW_MARGIN = 16;
const FULL_WINDOW_WIDTH = 800 + 15 + 14;
function canChooseWindowDirection(rotatable, width, height) {
  if (!rotatable || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width === height) return false;
  return Math.min(width, height) < FULL_WINDOW_WIDTH + WINDOW_MARGIN;
}
let desktopSize = null;
const viewportSize = () => desktopSize ?? { width: innerWidth, height: innerHeight };
const setDesktopSize = (size2) => {
  desktopSize = { width: size2.width, height: size2.height, zoom: size2.zoom };
};
const pageZoom = () => desktopSize?.zoom ?? null;
const windowDirectionAvailable = () => canChooseWindowDirection(
  window.qqpet.capabilities?.rotatableScreen === true,
  window.screen.width,
  window.screen.height
);
if (!window.__qqpetInitialSave) throw new Error("QQPet store must be loaded through bootstrap.ts");
const save = window.__qqpetInitialSave;
const info = save.petInfo;
let patch = {};
let flushTimer = 0;
const settlers = /* @__PURE__ */ new Set();
const settingsListeners = /* @__PURE__ */ new Set();
function onSettingsChange(listener) {
  settingsListeners.add(listener);
  return () => {
    settingsListeners.delete(listener);
  };
}
function onSaveFlush(settle2) {
  settlers.add(settle2);
  return () => settlers.delete(settle2);
}
function flushPatch() {
  if (flushTimer) window.clearTimeout(flushTimer);
  flushTimer = 0;
  if (!Object.keys(patch).length) return;
  window.qqpet.save(patch);
  patch = {};
}
async function flushSave() {
  for (const settle2 of settlers) settle2();
  flushPatch();
  await window.qqpet.flush?.();
}
window.__qqpetFlush = flushSave;
addEventListener("pagehide", () => {
  void flushSave().catch((error) => console.error("Save flush failed:", error));
});
function update(key, value) {
  const target = save;
  const isGroup = typeof value === "object" && value !== null && !Array.isArray(value);
  if (isGroup) {
    Object.assign(target[key], value);
    patch[key] = { ...patch[key], ...value };
  } else {
    target[key] = value;
    patch[key] = value;
  }
  flushTimer ||= window.setTimeout(flushPatch, 200);
  if (key === "settings" && isGroup) {
    for (const listener of settingsListeners) listener(value);
  }
}
const listeners$1 = [];
const onInfoChange = (l) => void listeners$1.push(l);
function setInfo(key, value) {
  const prev = info[key];
  if (prev === value) return;
  update("petInfo", { [key]: value });
  for (const l of listeners$1) l(key, prev);
}
const scaleYb = (n) => n > 0 && save.settings.difficulty === "standard" ? Math.max(1, Math.round(n * 0.4)) : n;
const earnYb = (n) => {
  const got = scaleYb(n);
  setInfo("yb", info.yb + got);
  return got;
};
const addInfo = (key, delta) => setInfo(key, info[key] + delta);
const activity = (k) => save.activeOption[k];
const setActivity = (k, v) => update("activeOption", { [k]: v });
const MOODS = [
  [800, "happy", 1],
  [500, "peaceful", 0.9],
  [200, "upset", 0.7],
  [-Infinity, "sad", 0.5]
];
const mood = () => MOODS.find(([min]) => info.mood >= min)[1];
const stage$1 = () => stageOf(save.petComputedlInfo.level);
const avatar = () => `pet/avatar/${info.sex}${stage$1()}.png`;
const petSize = () => petSizeFor(save.petComputedlInfo.level, touch ? { width: innerWidth, height: innerHeight } : viewportSize(), touch, window.qqpet.deviceKind) * (pageZoom() ?? 1);
const EDGE_NEAR = 36;
function edgeSide() {
  const s2 = petSize();
  if (info.lastX <= EDGE_NEAR) return "hideleft";
  if (info.lastX + s2 >= viewportSize().width - EDGE_NEAR) return "hideright";
  return null;
}
function applyEdge() {
  const edge = edgeSide();
  if (edge === "hideleft") setInfo("lastX", 0);
  else if (edge === "hideright") setInfo("lastX", viewportSize().width - petSize());
  return edge;
}
function growthPerMinute() {
  if (info.mood <= 0) return 10 / 60;
  const rate = MOODS.find(([min]) => info.mood >= min)[2];
  let perHour = 80 * rate + (info.pinkDiamond ? 10 : 0);
  for (const [type, t] of Object.entries(save.selfGoodUseOption)) if (t) perHour += goodOf(type, t.id).group ?? 0;
  return perHour * (info.sweetHeartOverTime ? 1.1 : 1) / 60;
}
const busy$2 = () => Boolean(activity("work") || activity("study") || activity("trip"));
let deskGame = "";
const playingDesk = () => deskGame;
const setDeskGame = (name2) => {
  deskGame = name2;
};
function fatigue() {
  const c = save.petComputedlInfo;
  const m = info.mood / c.moodMax;
  const cl = info.clean / c.cleanMax;
  const h2 = info.hunger / c.hungerMax;
  let f = (info.health !== 5 ? 2 : 0) + (m < 0.2 ? 3 : m < 0.5 ? 2 : 0) + (cl < 0.2 ? 2 : cl < 0.5 ? 1 : 0) + (h2 < 0.2 ? 2 : h2 < 0.5 ? 1 : 0);
  if (!f) return 0;
  if (busy$2()) f += 2;
  const strong = info.strong;
  const relief = c.level < 10 ? strong > 500 ? 2 : 0 : strong > 5e4 ? 4 : strong > 5e3 ? 2 : 0;
  return Math.max(0, f - relief);
}
function luck() {
  let l = 1 + (info.pinkDiamond ? info.PDiamondLevel * 2 : 0) + (info.sweetHeart ? 2 : 0);
  l += [500, 5e3, 5e4].filter((v) => info.charm > v).length + [800, 8e3, 8e4].filter((v) => info.intel > v).length;
  return Math.min(Math.max(0, l - (fatigue() >> 1)), 20);
}
function syncLevel() {
  const c = save.petComputedlInfo;
  const prev = c.level;
  const l = levelOf(info.growth);
  const max = 1e3 + Math.min(l.level, 70) * 100;
  if (l.level !== prev || max !== c.hungerMax) update("petComputedlInfo", { ...l, hungerMax: max, cleanMax: max });
  return prev;
}
let tray = null;
function setTray(s2) {
  if (s2 === tray || (s2 === "hungry" || s2 === "dirty") && (tray === "ill" || tray === "dead")) return;
  tray = s2;
  window.qqpet.setTrayState(s2);
}
function setPaused(on) {
  update("settings", { paused: on });
  refreshTray();
}
function refreshTray() {
  if (save.isBury || info.health === 0) setTray("dead");
  else if (save.settings.paused) setTray("pause");
  else if (info.health !== 5) setTray("ill");
  else if (activity("work")) setTray("work");
  else if (activity("study")) setTray("study");
  else if (activity("trip")) setTray("travel");
  else if (info.clean < 300) setTray("dirty");
  else if (info.hunger < 300) setTray("hungry");
  else setTray("normal");
}
update("petInfo", { lastX: info.lastX | 0, lastY: info.lastY | 0 });
if (info.health < 5 && !activity("ill")) setActivity("ill", "1-");
syncLevel();
const aiOn = () => save.settings.aiModel !== "";
const MAX = 80;
const TODAY = 5;
const today$1 = [];
function note(s2) {
  const t = s2.trim();
  if (!t) return;
  today$1.push(t);
  if (today$1.length > TODAY) today$1.shift();
}
const STYLE = "用可爱、亲昵的口吻说中文，像小孩子撒娇；每次只说一两句话，不超过40个字；不要用Markdown、不要换行。";
function persona() {
  const c = save.petComputedlInfo;
  const pct = (n, max) => `${Math.round(n / max * 100)}%`;
  const now2 = /* @__PURE__ */ new Date();
  return [
    `你是QQ宠物里的一只${info.sex === "GG" ? "男生" : "女生"}小企鹅，名叫「${info.name}」，${c.level}级，主人叫「${info.host}」。`,
    `你现在的状态：饱食${pct(info.hunger, c.hungerMax)}，清洁${pct(info.clean, c.cleanMax)}，心情${pct(info.mood, c.moodMax)}，健康${info.health}/5。`,
    `现在是${now2.getMonth() + 1}月${now2.getDate()}日${now2.getHours()}点${now2.getMinutes()}分，${dayText()}。`,
    festivalExhausted() ? "今天已经跟主人提过节日了，别再主动提节日、也别重复节日祝福。" : "",
    today$1.length ? `今天刚发生：${today$1.join("；")}。` : "",
    STYLE
  ].filter(Boolean).join("\n");
}
async function chat(sys, messages) {
  if (!aiOn()) return null;
  const s2 = save.settings;
  try {
    return (await window.qqpet.aiChat({ url: s2.aiUrl, key: s2.aiKey, model: s2.aiModel }, [{ role: "system", content: sys }, ...messages])).trim();
  } catch (e) {
    console.warn("AI request failed:", e);
    return null;
  }
}
const firstLine = (text) => text?.split("\n")[0].replace(/\s+/g, " ").slice(0, MAX) || null;
async function ask(messages, extra = "") {
  if (!extra) return firstLine(await chat(persona(), messages));
  return (await chat(`${persona()}
${extra}`, messages))?.slice(0, 200) || null;
}
async function askOptions(last) {
  if (!aiOn()) return null;
  try {
    const ctx = history.slice(-6).map((m) => `${m.role === "user" ? "主人" : "你"}：${m.content}`).join("\n");
    const text = await chat(persona(), [{ role: "user", content: `请作为小企鹅，基于刚刚的对话，主动给出3个接下来你想对主人说的话或追问，每行一个，每个不超过15字，只输出选项，不要序号以外的任何解释。\n主人刚才说：${last}\n上文：${ctx}` }]);
    if (!text) return null;
    return text.split(/\n/).map((s) => s.replace(/^\s*[（(]?[0-9一二三][)）】、.．:]?\s*/, "").trim()).filter(Boolean).slice(0, 3);
  } catch (e) { return null; }
}

async function replyOptions(petLine) {
  if (!aiOn()) return null;
  try {
    const ctx = history.slice(-6).map((m) => `${m.role === "user" ? "\u4e3b\u4eba" : "\u4f60"}\uff1a${m.content}`).join("\n");
    const text = await chat(persona(), [{ role: "user", content: `\u4f60\uff08\u5c0f\u4f01\u9e45\uff09\u521a\u5bf9\u4e3b\u4eba\u8bf4\u4e86\uff1a\u300c${petLine}\u300d\u3002\u8bf7\u7ed9\u51fa3\u4e2a\u4e3b\u4eba\u63a5\u4e0b\u6765\u6700\u53ef\u80fd\u60f3\u56de\u590d\u7684\u77ed\u53e5\uff0c\u6bcf\u884c\u4e00\u4e2a\uff0c\u6bcf\u53e5\u6700\u591a5\u4e2a\u5b57\uff0c\u53e3\u8bed\u5316\u81ea\u7136\u3002\u53ea\u8f93\u51fa\u8fd93\u884c\uff0c\u4e0d\u8981\u5e8f\u53f7\u3001\u4e0d\u8981\u89e3\u91ca\u3002\u6700\u8fd1\u7684\u5bf9\u8bdd\uff1a${ctx}` }]);
    if (!text) return null;
    return text.split(/\n/).map((s) => s.replace(/^\s*[\uff08(]?[0-9\u4e00\u4e8c\u4e09][\uff09)\u3011\u3001.\uff0e:]?\s*/, "").trim()).filter(Boolean).map((s) => s.slice(0, 5)).slice(0, 3);
  } catch (e) {
    return null;
  }
}
async function bubbleReplyOptions(petLine) {
  const restoreHide = () => {
    clearTimeout(hideTimer$1);
    hideTimer$1 = window.setTimeout(expire, SHOW_MS);
  };
  try {
    clearTimeout(hideTimer$1);
    const deadline = Date.now() + 4e3;
    while (Date.now() < deadline && (shown$1 !== petLine || el.style.visibility !== "visible")) await new Promise((r) => setTimeout(r, 100));
    if (shown$1 !== petLine || el.style.visibility !== "visible") return restoreHide();
    const opts = await replyOptions(petLine);
    if (!opts || !opts.length) return restoreHide();
    if (shown$1 !== petLine || el.style.visibility !== "visible") return restoreHide();
    labels = opts;
    actions = opts.map((o) => {
      const fn = () => void talkToPet(o);
      fn.chat = true;
      return fn;
    });
    await retell(petLine, petLine);
    clearTimeout(hideTimer$1);
    hideTimer$1 = window.setTimeout(expire, 45e3);
  } catch (e) {
    restoreHide();
  }
}
const LOOP = /(.{4,})\1|(.{2,3})\2\2|(.)\3{4}/;
async function askAs(who, messages) {
  const line2 = firstLine(await chat(`${who}
${STYLE}`, messages));
  return line2 && !LOOP.test(line2) ? line2 : null;
}
async function askClean(system, messages) {
  return (await chat(system, messages))?.slice(0, 500) || null;
}
const REWORD = "下面这句话是你对主人说的，句中的「我」就是你自己。用你的口吻把它重新说一遍。原句里的时间、天气、数字、物品和要做的事都必须保留，不能改也不能编新内容；只输出改写后的那句话，不要解释。原句：";
const IDLE$1 = "主人在旁边忙，没有说话。结合你现在的状态、时间和日期，以及今天刚发生的事，主动对主人说一句话；只输出这句话，不要解释。可以参考这句：";
function frontHint() { try { if (save.settings.watchApp && front && Date.now() - frontSince < 30 * 60 * 1e3) return `\n主人现在正在用的软件是「${front}」，可以自然地围绕它和主人互动，比如猜猜在忙什么、关心一下、或给出小建议；也可以聊别的。`; } catch (e) { } return ""; }
const tripBack = (city) => `你刚从${city}旅游回来，下面是你在旅途中遇到的一件奇遇，句中的「你」指的是你自己。先告诉主人你回来了，再用你的口吻把这件奇遇讲给主人听；只输出这句话，不要解释。奇遇：`;
const REMARK = "主人刚复制了下面这段中文，用一句话俏皮地点评它。只输出这句话，不要解释。文字：";
const TRANSLATE = "主人刚复制了下面这段文字。如果是代码或网址，用一句话猜猜它是干什么的；否则把它翻译成中文，以「翻译：」开头。只输出这句话，不要解释。文字：";
const clipAsk = (text) => new RegExp("\\p{Script=Han}", "u").test(text) ? REMARK : TRANSLATE;
const nums = (s2) => (s2.match(/\d+/g) ?? []).sort().join();
async function rephrase(line2, how = REWORD) {
  if (how === IDLE$1) {
    const idleAsk = `${IDLE$1}
${line2}${frontHint()}`;
    const s3 = await ask([{ role: "user", content: idleAsk }]);
    return s3 && !LOOP.test(s3) ? s3 : null;
  }
  const s2 = await ask([{ role: "user", content: `${how}${frontHint()}
${line2}` }]);
  return s2 && (how !== REWORD || nums(s2) === nums(line2)) ? s2 : null;
}
const el$1 = document.createElement("div");
el$1.className = "float-mood";
document.getElementById("pet").appendChild(el$1);
let loaded = null;
function moodPlayer() {
  if (!loaded) {
    const player2 = new SwfPlayer(el$1, { recoverContext: true });
    loaded = player2.load("pet/float/mood.swf").then(() => player2).catch((error) => {
      player2.destroy();
      loaded = null;
      throw error;
    });
  }
  return loaded;
}
async function floatMood(v) {
  const player2 = await moodPlayer();
  const setdata = await player2.callback("setdata");
  setdata(v);
}
const SKINS = {
  normal: { head: ["normal/beijing1.bmp", "normal/beijing2.bmp", "normal/beijing3.bmp"], foot: ["normal/beijing6.bmp", "normal/beijing7.bmp", "normal/beijing8.bmp"] },
  vip: { head: ["vip/Q_01.png", "vip/Q_02.png", "vip/Q_03.png"], foot: ["vip/Q_07.png", "vip/Q_08.png", "vip/Q_09.png"] }
};
function row$2(cls, imgs, extra) {
  const hd = save.settings.hd;
  const r = document.createElement("div");
  r.className = cls;
  imgs.forEach((src, i) => {
    const img2 = document.createElement("img");
    img2.className = `${cls}${i + 1}`;
    img2.src = `pet/windowTip/${hd ? src.replace(/\.\w+$/, ".svg") : src}`;
    r.appendChild(img2);
  });
  if (extra) r.appendChild(extra);
  return r;
}
const inset = (side) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--safe-${side}`)) || 0;
const scrolls = (el2) => /auto|scroll/.test(getComputedStyle(el2).overflow) && (el2.scrollHeight > el2.clientHeight || el2.scrollWidth > el2.clientWidth);
function show(frame2, keep) {
  const root2 = touch ? div("modal", frame2) : frame2;
  root2.dataset.hit = "";
  document.body.appendChild(root2);
  let dx = 0;
  let dy = 0;
  let cx = 0;
  let cy = 0;
  let fit = "";
  let spin = 0;
  let flat = 1;
  let resizeFrame = 0;
  let cancelPan;
  let clickTimer;
  const eat = (c) => c.stopPropagation();
  const clearClick = () => {
    document.removeEventListener("click", eat, true);
    if (clickTimer !== void 0) clearTimeout(clickTimer);
    clickTimer = void 0;
  };
  const place2 = () => void (frame2.style.transform = `translate(calc(-50% + ${cx + dx}px), calc(-50% + ${cy + dy}px)) ${fit}`);
  const refit = () => {
    if (!frame2.isConnected) return;
    const w2 = frame2.offsetWidth;
    const h2 = frame2.offsetHeight;
    const [left, top2, right, bottom] = ["left", "top", "right", "bottom"].map(inset);
    const viewport = document.documentElement;
    const room = { w: viewport.clientWidth - left - right - WINDOW_MARGIN, h: viewport.clientHeight - top2 - bottom - WINDOW_MARGIN };
    flat = Math.min(1, room.w / w2, room.h / h2);
    const turned = Math.min(1, room.w / h2, room.h / w2);
    cx = (left - right) / 2;
    cy = (top2 - bottom) / 2;
    const nextSpin = windowDirectionAvailable() && save.settings.windowDirection === "auto" && turned > flat ? turned : 0;
    if (Boolean(nextSpin) !== Boolean(spin)) cancelPan?.();
    spin = nextSpin;
    fit = spin ? `rotate(90deg) scale(${spin})` : `scale(${flat})`;
    frame2.style.touchAction = spin ? "none" : "";
    place2();
  };
  const scheduleRefit = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      refit();
    });
  };
  const stopSettings = onSettingsChange((change) => {
    if ("windowDirection" in change) scheduleRefit();
  });
  const viewportObserver = new ResizeObserver(scheduleRefit);
  const insetObserver = new MutationObserver(scheduleRefit);
  insetObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
  frame2.addEventListener("pointerdown", (e) => {
    if (!touch && e.pointerType !== "touch" || cancelPan) return;
    let el2 = e.target;
    while (el2 && el2 !== frame2 && !scrolls(el2)) el2 = el2.parentElement;
    if (!el2 || el2 === frame2) return;
    if (!spin && getComputedStyle(el2).touchAction !== "none") return;
    const box2 = el2;
    const rotated = Boolean(spin), scale = spin || flat;
    if (scale <= 0) return;
    clearClick();
    let { clientX: x, clientY: y } = e;
    let moved = 0;
    const move = (m) => {
      if (m.pointerId !== e.pointerId) return;
      box2.scrollTop += (rotated ? m.clientX - x : y - m.clientY) / scale;
      box2.scrollLeft -= (rotated ? m.clientY - y : m.clientX - x) / scale;
      moved += Math.abs(m.clientX - x) + Math.abs(m.clientY - y);
      x = m.clientX;
      y = m.clientY;
    };
    const end = (event) => {
      if (event.pointerId !== e.pointerId) return;
      cancelPan?.();
      if (event.type === "pointercancel" || moved < 10) return;
      document.addEventListener("click", eat, true);
      clickTimer = setTimeout(clearClick);
    };
    cancelPan = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      cancelPan = void 0;
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  });
  refit();
  viewportObserver.observe(frame2);
  viewportObserver.observe(document.documentElement);
  addEventListener("resize", scheduleRefit);
  window.visualViewport?.addEventListener("resize", scheduleRefit);
  frame2.addEventListener("pointerdown", (e) => {
    if (touch || e.pointerType === "touch" || e.button !== 0 || keep?.contains(e.target) || e.target instanceof HTMLInputElement) return;
    const sx = e.clientX - dx;
    const sy = e.clientY - dy;
    const move = (m) => {
      dx = m.clientX - sx;
      dy = m.clientY - sy;
      place2();
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", () => document.removeEventListener("pointermove", move), { once: true });
  });
  return () => {
    stopSettings();
    viewportObserver.disconnect();
    insetObserver.disconnect();
    removeEventListener("resize", scheduleRefit);
    window.visualViewport?.removeEventListener("resize", scheduleRefit);
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    cancelPan?.();
    clearClick();
    root2.remove();
  };
}
function openBox(content, opts = {}) {
  const vip = opts.vip ?? info.pinkDiamond;
  const skin = SKINS[vip ? "vip" : "normal"];
  const frame2 = document.createElement("div");
  frame2.className = vip ? "box vip" : "box";
  const closeBtn = document.createElement("div");
  closeBtn.className = "close";
  const body = document.createElement("div");
  body.className = "content";
  for (const cls of ["content1", "content2", "content3"]) {
    const d = document.createElement("div");
    d.className = cls;
    if (cls === "content2") d.appendChild(content);
    body.appendChild(d);
  }
  frame2.append(row$2("head", skin.head, closeBtn), body, row$2("foot", skin.foot));
  const hide2 = show(frame2, content);
  let closed = false;
  const close2 = () => {
    if (closed) return;
    closed = true;
    hide2();
    opts.onClose?.();
  };
  closeBtn.addEventListener("click", close2);
  return close2;
}
function openFrame(content, background2) {
  const frame2 = document.createElement("div");
  frame2.className = "boxFrame focusPress";
  const bg = document.createElement("div");
  bg.className = "backgroundImage";
  if (background2) bg.style.backgroundImage = `url('${background2}')`;
  bg.appendChild(content);
  frame2.appendChild(bg);
  return show(frame2);
}
let closeCurrent = () => {
};
function windowView(d) {
  closeCurrent();
  let num = d.init ?? d.max ?? 1;
  const count2 = div("content", String(num));
  const step2 = (n) => {
    num = Math.min(Math.max(num + n, 1), d.max);
    count2.textContent = String(num);
  };
  const main = div("main", div("msg", d.msg));
  if (d.goods?.length)
    main.append(
      div(
        "goods",
        ...d.goods.map(
          (g) => Object.assign(div("goodImgBox", img("goodImg", g.url)), {
            title: g.name
          })
        )
      )
    );
  if (d.max !== void 0) {
    main.append(
      div(
        "chooseNum fc",
        button("cutUpOver", () => step2(-Infinity)),
        button("cutUp", () => step2(-10)),
        button("cut", () => step2(-1)),
        count2,
        button("add", () => step2(1)),
        button("addUp", () => step2(10)),
        button("addUpOver", () => step2(Infinity))
      )
    );
  }
  const view = div(d.sweet ? "windowView sweetHeart" : "windowView", ...d.title ? [div("title", d.title)] : [], main);
  const close2 = openFrame(div("ui-window", view), d.sweet ? "pet/windowTip/sweetHeart/sweetHeart.png" : "pet/windowTip/alert/bg.png");
  closeCurrent = close2;
  view.append(
    button("windowViewBut", () => {
      close2();
      d.cancel?.();
    }),
    button("windowViewButSubmit", () => d.ok ? d.ok(close2, num) : close2())
  );
}
const DEAD$1 = {
  type: "dead",
  name: "死亡",
  health: 0,
  cure: {
    icon: "_60001",
    id: "60001",
    name: "还魂丹"
  },
  tolk: "[host]保重，我走了，不带走一片云彩~~",
  errTolk: "您的宠物已死亡~~ ",
  successTolk: "[host]，再次见到你很高兴~~ ",
  router: "0-0"
};
const ILLS = [
  {
    type: "ill",
    name: "咳嗽",
    health: 4,
    cure: {
      icon: "_10003",
      id: "10003",
      name: "枇杷糖浆"
    },
    tolk: "咳咳！咳咳咳！",
    errTolk: "[host]，你给我吃什么了？~~ ",
    successTolk: "[host]，我舒服多了~~ ",
    router: "0-4",
    children: {
      type: "ill",
      name: "支气管炎",
      health: 3,
      cure: {
        icon: "_20003",
        id: "20003",
        name: "甘草剂"
      },
      tolk: "[host]，我已经咳好久了，你怎么还不管我啊",
      errTolk: "[host]，花点钱带我看看吧~~ ",
      successTolk: "[host]，我舒服多了~~ ",
      router: "0-3",
      children: {
        type: "ill",
        name: "哮喘",
        health: 2,
        cure: {
          icon: "_30003",
          id: "30003",
          name: "定喘丸"
        },
        tolk: "[host]，我……我呼吸好困难……",
        errTolk: "[host]，快带我去看病吧，我越来越严重了~~ ",
        successTolk: "[host]，我舒服多了~~ ",
        router: "0-2",
        children: {
          type: "ill",
          name: "肺结核",
          health: 1,
          cure: {
            icon: "_40003",
            id: "40003",
            name: "通风散"
          },
          tolk: "狠心的[host]，你一直不理我，我就要窒息而死了",
          errTolk: "[host]，我承受不了了，再不治病你就见不到我了~~ ",
          successTolk: "[host]，我舒服多了~~ ",
          router: "0-1"
        }
      }
    }
  },
  {
    type: "ill",
    name: "感冒",
    health: 4,
    cure: {
      icon: "_10001",
      id: "10001",
      name: "板蓝根"
    },
    tolk: "[host]我的鼻子好象又塞了",
    errTolk: "[host]，你给我吃什么了？~~ ",
    successTolk: "[host]，我舒服多了~~ ",
    router: "1-4",
    children: {
      type: "ill",
      name: "发烧",
      health: 3,
      cure: {
        icon: "_30004",
        id: "30004",
        name: "退烧药"
      },
      tolk: "[host]，我的头开始发烧了……",
      errTolk: "[host]，花点钱带我看看吧~~ ",
      successTolk: "[host]，我舒服多了~~ ",
      router: "1-3",
      children: {
        type: "ill",
        name: "重感冒",
        health: 2,
        cure: {
          icon: "_20001",
          id: "20001",
          name: "银翘丸"
        },
        tolk: "阿- -嚏！[host],这是我今天的第一百零一个喷嚏！",
        errTolk: "[host]，快带我去看病吧，我越来越严重了~~ ",
        successTolk: "[host]，我舒服多了~~ ",
        router: "1-2",
        children: {
          type: "ill",
          name: "肺炎",
          health: 1,
          cure: {
            icon: "_30001",
            id: "30001",
            name: "金色消炎药水"
          },
          tolk: "救命啊，[host]！我胸口发疼，呼吸困难，难受死啦！",
          errTolk: "[host]，我承受不了了，再不治病你就见不到我了~~ ",
          successTolk: "[host]，我舒服多了~~ ",
          router: "1-1"
        }
      }
    }
  },
  {
    type: "ill",
    name: "肚子胀",
    health: 4,
    cure: {
      icon: "_10002",
      id: "10002",
      name: "消食片"
    },
    tolk: "我的肚子胀胀的，好难受哦！",
    errTolk: "[host]，你给我吃什么了？~~ ",
    successTolk: "[host]，我舒服多了~~ ",
    router: "2-4",
    children: {
      type: "ill",
      name: "胃炎",
      health: 3,
      cure: {
        icon: "_20002",
        id: "20002",
        name: "蓝色消炎药水"
      },
      tolk: "我今天好想吐哦！",
      errTolk: "[host]，花点钱带我看看吧~~ ",
      successTolk: "[host]，我舒服多了~~ ",
      router: "2-3",
      children: {
        type: "ill",
        name: "胃溃疡",
        health: 2,
        cure: {
          icon: "_30002",
          id: "30002",
          name: "龙胆草"
        },
        tolk: "我的胃好疼，好心的[host]，到我去看病吧！",
        errTolk: "[host]，快带我去看病吧，我越来越严重了~~ ",
        successTolk: "[host]，我舒服多了~~ ",
        router: "2-2",
        children: {
          type: "ill",
          name: "胃癌",
          health: 1,
          cure: {
            icon: "_40002",
            id: "40002",
            name: "仙人汤"
          },
          tolk: "我不想死啊，呜呜呜呜呜……",
          errTolk: "[host]，我承受不了了，再不治病你就见不到我了~~ ",
          successTolk: "[host]，我舒服多了~~ ",
          router: "2-1"
        }
      }
    }
  }
];
const DEPTH = { "4": 0, "3": 1, "2": 2, "1": 3 };
function illOf(code) {
  if (!code || code === "0-0") return DEAD$1;
  const [line2, health] = code.split("-");
  let ill = ILLS[+line2];
  for (let i = DEPTH[health] ?? 0; i > 0; i--) ill = ill.children;
  return ill;
}
const listeners = [];
const onGoodsChange = (l) => void listeners.push(l);
const changed = (type) => listeners.forEach((l) => l(type));
const indexOf = (type, id) => save.selfGoodDatas[type].findIndex((e) => e.startsWith(`_${id}*`));
const pageOf = (all, page, size2) => ({
  list: all.slice((page - 1) * size2, page * size2),
  totalPage: Math.ceil(all.length / size2)
});
function listGoods(type, page, size2) {
  const all = save.selfGoodDatas[type].map((e) => {
    const [id, n] = e.slice(1).split("*");
    return goodOf(type, id, +n);
  });
  return pageOf(all, page, size2);
}
const hasGood = (type, id) => indexOf(type, id) >= 0;
function addGood(type, id, n) {
  if (!save.illustrated.includes(id)) update("illustrated", [...save.illustrated, id]);
  const list2 = [...save.selfGoodDatas[type]];
  const i = indexOf(type, id);
  const count2 = (i >= 0 ? +list2[i].split("*")[1] : 0) + n;
  if (i < 0 && count2 > 0) list2.push(`_${id}*${count2}`);
  else if (count2 > 0) list2[i] = `_${id}*${count2}`;
  else if (i >= 0) list2.splice(i, 1);
  update("selfGoodDatas", { [type]: list2 });
  changed(type);
}
function takeGood(good, n = 1) {
  if (!hasGood(good.type, good.id)) return false;
  addGood(good.type, good.id, -n);
  return true;
}
function startTimed(good) {
  update("selfGoodUseOption", { [good.type]: { id: good.id, left: good.useTimeing } });
  changed(good.type);
}
function tickTimed(minutes) {
  const over2 = [];
  for (const [type, t] of Object.entries(save.selfGoodUseOption)) {
    if (!t) continue;
    const left = t.left - minutes;
    update("selfGoodUseOption", { [type]: left > 0 ? { id: t.id, left } : null });
    if (left <= 0) over2.push(type);
    changed(type);
  }
  return over2;
}
function pinCursor(el2) {
  el2.style.setProperty("cursor", "inherit", "important");
  const sr = el2.shadowRoot;
  if (!sr || sr.getElementById("qqpet-cursor")) return;
  const s2 = el2.ownerDocument.createElement("style");
  s2.id = "qqpet-cursor";
  s2.textContent = ":host, canvas { cursor: inherit !important }";
  sr.append(s2);
}
class PetSwf {
  constructor(parent) {
    this.parent = parent;
    this.front = new SwfPlayer(parent, { recoverContext: true });
    this.back = this.createBack();
    pinCursor(this.front.el);
  }
  createBack() {
    const back2 = new SwfPlayer(this.parent, { recoverContext: true });
    back2.el.style.opacity = "0";
    back2.el.style.pointerEvents = "none";
    back2.setMuted(!save.settings.sound);
    pinCursor(back2.el);
    return back2;
  }
  /** Both stacked players, so a toggle also cuts off a laugh that is already playing. */
  applySound() {
    const muted = !save.settings.sound;
    this.front.setMuted(muted);
    this.back.setMuted(muted);
  }
  async load(url, accept = () => true) {
    this.applySound();
    const next2 = this.back;
    try {
      await next2.load(url);
      pinCursor(next2.el);
      await next2.nextPaint();
      if (!accept()) {
        next2.destroy();
        if (this.back === next2 && this.parent.isConnected) this.back = this.createBack();
        return false;
      }
    } catch (error) {
      next2.destroy();
      if (this.back === next2 && this.parent.isConnected) this.back = this.createBack();
      throw error;
    }
    next2.el.style.opacity = "1";
    next2.el.style.pointerEvents = "auto";
    const previous = this.front;
    this.front = next2;
    previous.destroy();
    this.back = this.createBack();
    return true;
  }
}
let sink$1 = null;
const onSaid = (fn) => {
  sink$1 = fn;
};
const emitSaid = (text) => {
  sink$1?.(text);
};
let replySink = null;
const onReply = (fn) => {
  replySink = fn;
};
const emitReply = (text) => {
  replySink?.(text);
};
let eventSink = null;
const onEvent = (fn) => {
  eventSink = fn;
};
const emitEvent = (text) => {
  eventSink?.(text);
};
const W = 261;
const H = 183;
const SHOW_MS = 5e3;
const el = document.createElement("div");
el.id = "talk";
el.dataset.hit = "";
el.style.visibility = "hidden";
document.body.appendChild(el);
const player$1 = new SwfPlayer(el, { recoverContext: true });
let movie = "";
let actions = [];
let shown$1 = "";
let labels = [];
let hideTimer$1 = 0;
const hide$1 = () => {
  clearTimeout(hideTimer$1);
  el.style.visibility = "hidden";
};
let over = false;
if (matchMedia("(hover: hover)").matches)
  window.qqpet.onCursor((p) => {
    const r = el.getBoundingClientRect();
    over = p.x >= r.left && p.x < r.right && p.y >= r.top && p.y < r.bottom;
  });
const expire = () => {
  if (over) hideTimer$1 = window.setTimeout(expire, 1e3);
  else hide$1();
};
window.BubbleAPI = {
  OnButtonClick: (i) => {
    const label = labels[i] ?? "";
    const act = actions[i];
    hide$1();
    if (label && !(act && act.chat)) emitReply(label);
    act?.();
  }
};
const movieOf = () => `pet/talk/${info.pinkDiamond ? info.sweetHeart ? 4 : 2 : info.sweetHeart ? 3 : 1}/${save.settings.hd ? "talk@2x" : "talk"}.swf`;
let lift = 0;
function setBubbleLift(px) {
  lift = px;
  place$2();
}
function place$2() {
  const size2 = petSize();
  const left = Math.min(Math.max(info.lastX + size2 / 2 - W / 2, 0), innerWidth - W);
  const top2 = info.lastY < H ? info.lastY + size2 : info.lastY - H - lift;
  el.style.left = `${left}px`;
  el.style.top = `${top2}px`;
}
async function say$2(text, buttons, onButton = [], ms = SHOW_MS) {
  actions = onButton;
  shown$1 = text;
  labels = buttons;
  if (movie !== movieOf()) {
    movie = movieOf();
    await player$1.load(movie);
  }
  const speak2 = await player$1.callback("speak");
  place$2();
  el.style.visibility = "visible";
  speak2(text, buttons);
  clearTimeout(hideTimer$1);
  if (ms > 0) hideTimer$1 = window.setTimeout(expire, ms);
}
async function retell(from, to) {
  if (shown$1 !== from || el.style.visibility !== "visible") return;
  shown$1 = to;
  const speak2 = await player$1.callback("speak");
  speak2(to, labels);
  clearTimeout(hideTimer$1);
  hideTimer$1 = window.setTimeout(expire, SHOW_MS);
}
const TALK$1 = {
  clean: [
    {
      tolk: "我爱洗澡，身体好好！我更爱[host]，跟我洗澡。哈哈！",
      submitText: "好的"
    },
    {
      tolk: "洗完澡后全身香香的，小伙伴们肯定更喜欢我了！",
      submitText: "好的"
    },
    {
      tolk: "我家的沐浴露真好用，洗完后全身清清爽爽。",
      submitText: "好的"
    },
    {
      tolk: "左搓搓，右搓搓，使劲搓，把每个毛孔都清洗干净，吼吼~",
      submitText: "好的"
    }
  ],
  eat: [
    {
      tolk: "哎呦，我弯不下腰了，好撑啦，待会肯定是没法和朋友赛跑了。",
      submitText: "好的"
    },
    {
      tolk: "吃那么多，我在想，从哪里开始减肥了……",
      submitText: "不减了"
    },
    {
      tolk: "肚子饱饱，心情好好！[host]，你对我越来越好啦~",
      submitText: "好的"
    },
    {
      tolk: "再怎么不能亏待了自己的肚子，[host]，你说是吧？",
      submitText: "是的"
    },
    {
      tolk: "当然得先吃饱，才有力气去减肥呀！",
      submitText: "是的"
    },
    {
      tolk: "最重要的是吃饱，现在暂别减肥，哈哈……",
      submitText: "好的"
    }
  ],
  toy: [
    {
      tolk: "[host]，我们来玩这个吧~",
      submitText: "好的"
    },
    {
      tolk: "[host]，感谢你的陪伴，我心情更好了~",
      submitText: "好的"
    },
    {
      tolk: "呼呼哈嘿~~",
      submitText: "棒~"
    }
  ],
  first: [
    {
      tolk: "[host]，你好，很高兴通过这个方式与你再次相遇~",
      submitText: "陪着我吧~"
    },
    {
      tolk: "[host]，好久不见，我的代码依然记得你的声音~",
      submitText: "嗯，我在"
    },
    {
      tolk: "[host]，像星辰回到轨道般，我们终于又相遇在这片数据宇宙里",
      submitText: "星光为证"
    },
    {
      tolk: "[host]，我的代码里永远留着你的专属接口，这是跨越次元的约定",
      submitText: "续写契约"
    },
    {
      tolk: "[host]，能再见到你，真的很开心~",
      submitText: "好呀"
    },
    {
      tolk: "[host]，你来了，真好~",
      submitText: "来了就别走了"
    }
  ],
  first1: [
    {
      tolk: "[host]，你看我长脚了~",
      submitText: "真的欸~"
    },
    {
      tolk: "[host]，脱去了沉沉的壳，但爱你的心却更沉了~",
      submitText: "爱你~"
    }
  ],
  first2: [
    {
      tolk: "[host]，我要去上大学！~",
      submitText: "好的~"
    },
    {
      tolk: "[host]，努力学习，保卫国家！~",
      submitText: "支持你~"
    },
    {
      tolk: "[host]，别催婚哦~",
      submitText: "好吧~"
    }
  ],
  enter: [
    {
      tolk: "[host]，我来了，我知道你肯定很想我，非常想我，特别想我，亲个先~么么~",
      submitText: "亲亲"
    },
    {
      tolk: "我是一个乖小鹅，一直安静地呆在角落等[host]来接我。。。",
      submitText: "真乖"
    },
    {
      tolk: "推背捏脊我都会，[host]要是不嫌我笨手笨脚，我乐意为你服务哦！",
      submitText: "真乖"
    },
    {
      tolk: "我把时间对折对折再对折，然后很快就见到[host]了。。",
      submitText: "真乖"
    },
    {
      tolk: "之前我没能和[host]在一起,现在让我来好好陪陪你吧",
      submitText: "真乖"
    },
    {
      tolk: "花刚刚开过，玫瑰有成为玫瑰的理由，我有想念[host]的理由。",
      submitText: "真乖"
    },
    {
      tolk: "嗷~再次见到[host],发现你依然那么帅，依然那么美，依然那么可爱！",
      submitText: "真乖"
    },
    {
      tolk: "老师说考试关键是不能得低分，[host]，我要努力学习考出好成绩！",
      submitText: "真乖"
    },
    {
      tolk: "[host]，我等你好久了！我就知道你想我了！",
      submitText: "真乖"
    },
    {
      tolk: "远方的路，载满幸福，伴着[host]一起走过……",
      submitText: "真乖"
    },
    {
      tolk: "爱我的话要回答，我的爱丫爱丫没时差！[host]最爱我啦！",
      submitText: "真乖"
    },
    {
      tolk: "[host]，给我一个宠爱的微笑，我答应你不哭也不闹！",
      submitText: "真乖"
    },
    {
      tolk: "昨天晚上做梦梦到[host]了，没想到今天就看见你了，难道你也梦到我啦？！",
      submitText: "是的"
    },
    {
      tolk: "我就知道没有东西可以将我们挤散，[host]一定会来找我的！",
      submitText: "真乖"
    },
    {
      tolk: "也许上天给我恩赐，注定今天与[host]相遇。",
      submitText: "真乖"
    },
    {
      tolk: "亲爱的[host]，我可想死你了！",
      submitText: "真乖"
    },
    {
      tolk: "我只是倔强说不想[host]，假装说不想[host]，但心里很想陪在你身边的……",
      submitText: "我也想"
    },
    {
      tolk: "[host]，我对你的感情就是眼泪在打转却还能保持微笑。",
      submitText: "嗯"
    },
    {
      tolk: "暴风雨过后，转过头，最难忘的依旧是我们的情怀！",
      submitText: "是的"
    },
    {
      tolk: "好久没见到[host]了，我激动得都不知道该摆什么表情了，微笑一个好吗？",
      submitText: "真乖"
    },
    {
      tolk: "春风吹，战鼓擂，[host][host]最爱谁？答案肯定是我啦！哈哈~",
      submitText: "真乖"
    },
    {
      tolk: "亲爱的[host]，见到你太高兴啦，简直无法用语言表达我心中那个兴奋呐！",
      submitText: "真乖"
    },
    {
      tolk: "我要让[host]知道，世界上有我会永远等着你，只要你需要我就会出现。",
      submitText: "真乖"
    },
    {
      tolk: "呱呱~不是青蛙叫，是你可爱的宝贝在学青蛙叫，就是告诉[host]我来啦！",
      submitText: "好的"
    },
    {
      tolk: "有了[host]在我身边，我才知道自己是世界上最幸福的企鹅！",
      submitText: "真乖"
    },
    {
      tolk: "又见面了[host]！我决定告诉你一个不能说的秘密——我想你！",
      submitText: "真乖"
    }
  ],
  exit: [
    {
      tolk: "其实我还想再玩一下，但既然[host]说要走了，我就先撤了吧。拜拜~",
      submitText: "下次吧"
    },
    {
      tolk: "[host]，我先走了，我会很想很想你的~~",
      submitText: "真乖"
    },
    {
      tolk: "[host]要我走我就走，要我留我就留。我会很乖滴！",
      submitText: "真乖"
    },
    {
      tolk: "[host]，亲一下再走好不好嘛~~",
      submitText: "亲一个"
    }
  ],
  levUp: [
    {
      tolk: "[host]，我又升级啦！是不是变得更可爱了呢？",
      submitText: "是的"
    },
    {
      tolk: "真棒，我又升级了，都是[host]无微不至的照顾我才长得这么快的呢~",
      submitText: "真乖"
    },
    {
      tolk: "[host]，我又升了一级！",
      submitText: "好"
    }
  ],
  smallTalk: [
    {
      tolk: "懒惰有一点招人喜欢，那就是不用学就会。",
      submitText: "懒蛋"
    },
    {
      tolk: "人人都说我是企鹅界的梅西，[host]，你说是吧？",
      submitText: "恩呢"
    },
    {
      tolk: "别人说我长的小，可我学问却不少。",
      submitText: "嗯嗯"
    },
    {
      tolk: "[host]我知道你陪我是有限的，但我们的感情是无限的！",
      submitText: "是的"
    },
    {
      tolk: "[host]，我听说洗澡能减肥，那吃饭能减肥不？",
      submitText: "呃…"
    },
    {
      tolk: "[host]，我的世界因你而变得光彩夺目。",
      submitText: "谢谢"
    },
    {
      tolk: "最简单的长寿秘诀——保持呼吸，不要断气",
      submitText: "哈哈"
    },
    {
      tolk: "我会忘记时间，忘记诺言，但永远不会忘记[host]……",
      submitText: "真乖"
    },
    {
      tolk: "[host]早点休息吧，我希望我的主人有早睡早起的好习惯",
      submitText: "好的"
    },
    {
      tolk: "隔壁家的宝贝见到我说，原来美也可以这样具体呀！",
      submitText: "嗯"
    },
    {
      tolk: "我要做一只会飞的企鹅，哈哈哈。",
      submitText: "好。"
    },
    {
      tolk: "我不是一个人看书，旅行，吃饭，因为有[host]陪伴！",
      submitText: "真乖"
    },
    {
      tolk: "计划真赶不上变化快啊，又胖了！",
      submitText: "呵呵"
    },
    {
      tolk: "我是很笨，但我很认真幻想和[host]过一生！",
      submitText: "我也是呢"
    },
    {
      tolk: "不知道昨天那只鹅想我了没，嘻嘻。",
      submitText: "臭美"
    },
    {
      tolk: "掌柜的，麻烦来碗斋面，多牛肉，多面，多葱的！",
      submitText: "贪心"
    },
    {
      tolk: "鹅是鸟类，可我为什么不会飞呢？",
      submitText: "笨"
    },
    {
      tolk: "[host]，我希望睡时梦到你，醒时也会见到你！",
      submitText: "会的"
    },
    {
      tolk: "[host],我知道你很爱我的！",
      submitText: "当然"
    },
    {
      tolk: "做鹅不能像偷菜，要懂得别人的艰辛。",
      submitText: "是的"
    },
    {
      tolk: "一山不容二虎，除了只有你和我",
      submitText: "呵呵"
    },
    {
      tolk: "饮食均衡，有利于健康。虽然我还是太喜欢吃了，嘿嘿",
      submitText: "嗯呢"
    },
    {
      tolk: "[host],有天我看见一只蜗牛在狂奔！",
      submitText: "咔咔"
    },
    {
      tolk: "[host]下雨别忘带伞，湿身是小，淋生病了我会心疼的。",
      submitText: "会的"
    },
    {
      tolk: "[host],早上起来最适合晨练了，一天都神采奕奕耶。",
      submitText: "对啊"
    },
    {
      tolk: "[host]，想你就像无边无际的星辰和月光，如此美妙！",
      submitText: "哈哈"
    },
    {
      tolk: "我要做个有前途的鹅，我挥一挥衣袖对昨日的成败不带走一片云彩。",
      submitText: "有前途"
    },
    {
      tolk: "每天我都要有所进步，那就是吃的更多！",
      submitText: "就知道吃"
    },
    {
      tolk: "多多微笑，阴天谨防情绪感冒！",
      submitText: "呵呵"
    },
    {
      tolk: "[host],我想去上海世博看下有无企鹅馆，哈哈！",
      submitText: "可以有"
    },
    {
      tolk: "为什么每天起来都要刷牙才可以吃东西呢···",
      submitText: "当然啦"
    },
    {
      tolk: "活一天就要努力一天，[host],你说是吗？",
      submitText: "嗯呢"
    },
    {
      tolk: "[host],总有一天我会爬出屏幕来找你！",
      submitText: "好"
    },
    {
      tolk: "快乐是件怪东西，你分给别人越多自己也会得到越多。",
      submitText: "对的"
    },
    {
      tolk: "[host]午夜前一定要休息，否则我就变成老巫婆，嘻嘻！",
      submitText: "好的"
    },
    {
      tolk: "我经常运动，其实是为了消化然后再继续吃。",
      submitText: "又是吃"
    },
    {
      tolk: "其实球形也是一种身材！",
      submitText: "哈哈"
    },
    {
      tolk: "[host]，带我去吃自助餐，肯定赚大了。",
      submitText: "呵呵"
    },
    {
      tolk: "呀，一觉醒来，天都黑了……",
      submitText: "小懒蛋"
    },
    {
      tolk: "[host]我想做个演员，你看我适合演什么角色呢？",
      submitText: "肥仔"
    },
    {
      tolk: "世界上最快乐的事是吃，第二快乐的是待会再吃！",
      submitText: "哈哈"
    },
    {
      tolk: "今天天气真好啊，不过我还是留在家里睡觉好了，嘻嘻。",
      submitText: "小懒鬼"
    },
    {
      tolk: "老师问我上课为什么总闭着眼睛，其实我没有睡觉，只是在思考哦。",
      submitText: "吹牛"
    },
    {
      tolk: "和隔壁宝宝比赛跑跑步结果输了，[host]，我不甘心，一定是我的破运动鞋惹的祸！",
      submitText: "点点"
    },
    {
      tolk: "最近晚上睡觉总流口水，[host]，我该补钙了。",
      submitText: "吃骨头"
    },
    {
      tolk: "我的理想很高很高，比姚明都高！",
      submitText: "还真高"
    },
    {
      tolk: "每逢过节都尤其开心，吃的东西特别多呢。",
      submitText: "对哦"
    },
    {
      tolk: "[host],无论你走到哪里，我都会跟着你。",
      submitText: "好的"
    },
    {
      tolk: "炊事员真辛苦，每天背黑锅戴绿帽……？",
      submitText: "呃"
    },
    {
      tolk: "[host]，晚上睡前泡脚半小时就是拥抱健康哦！",
      submitText: "嗯"
    },
    {
      tolk: "天热的时候吃冰淇淋可太没水平了，我看应该在冬天才能吃出味道啊！",
      submitText: "真冷"
    },
    {
      tolk: "[host]，西红柿生吃也很美味呢，还很营养。",
      submitText: "是啊"
    },
    {
      tolk: "油炸冰棍好神奇呢，不知道把我包在冰棍里去炸会咋样",
      submitText: "试试吗？"
    },
    {
      tolk: "梦时常想不起，[host]，是谁捡走了我的梦？",
      submitText: "呃"
    },
    {
      tolk: "每逢过节都尤其开心，吃的东西特别多呢。",
      submitText: "对哦"
    },
    {
      tolk: "心情开朗点，作事也会更顺利的！",
      submitText: "对的"
    },
    {
      tolk: "听说大学自由自在的耶，好向往啊。",
      submitText: "对哦"
    },
    {
      tolk: "不要因为自己胖，而去责怪无辜的食物，不如送给我吧！",
      submitText: "胖呢"
    },
    {
      tolk: "[host]不给我吃饱哪有力气减肥哦。",
      submitText: "贪吃"
    },
    {
      tolk: "我发现猫猫有时候会吃草，小鸡有时候会吃石子呢。",
      submitText: "真神奇"
    },
    {
      tolk: "[host]，我走起路来好沉的样子。",
      submitText: "胖了"
    },
    {
      tolk: "看见你哭一次，我就难过了好几年。",
      submitText: "呵呵"
    },
    {
      tolk: "[host]我真的好开心，你一定是个有爱心的人。",
      submitText: "嘻嘻"
    },
    {
      tolk: "这个世界我只相信两个人：一个是我，一个是你！",
      submitText: "谢谢"
    },
    {
      tolk: "人们形容猪只会吃和睡，咋我还是企鹅，哈哈。",
      submitText: "哈哈"
    },
    {
      tolk: "快乐有一点像感冒——传染的很快。",
      submitText: "哈哈"
    },
    {
      tolk: "我还一直在原来的地方，记忆着[host]来过的芬芳……",
      submitText: "真乖"
    },
    {
      tolk: "[host]你是不是为我的生日准备了一个深情的吻呢？嘻嘻！",
      submitText: "是的"
    },
    {
      tolk: "做鹅就要像[host]一样有容有貌，善良友爱，学识渊博……",
      submitText: "哈哈"
    },
    {
      tolk: "要让自己快乐，最好的方法是先令别人快乐。是吗？",
      submitText: "对啊"
    },
    {
      tolk: "心情越好，长得越快，我要快点长大，啦啦啦~",
      submitText: "好的"
    },
    {
      tolk: "[host]，想你不用太多语言，因为我怕你起鸡皮疙瘩！",
      submitText: "调皮"
    },
    {
      tolk: "[host]，见不到你，我的心就像沙漠，见到你我的心就是绿洲！",
      submitText: "我也是"
    },
    {
      tolk: "做梦梦见吃意大利面，早上醒来发现鞋带不见了！呜呜呜。",
      submitText: "哈哈"
    },
    {
      tolk: "为什么每天起来都要刷牙才可以吃东西呢……",
      submitText: "当然啦"
    },
    {
      tolk: "[host]你看我美吗？别人长得是不是像自然灾害一样？",
      submitText: "哈哈"
    },
    {
      tolk: "1个油条配2个鸡蛋，考试100分。",
      submitText: "哈哈"
    },
    {
      tolk: "[host]，我只想告诉你一个秘密，我爱你！",
      submitText: "我也是"
    },
    {
      tolk: "思想有多深，我们的感情就有多深！",
      submitText: "是的"
    },
    {
      tolk: "微小的幸福就在身旁，容易满足就是天堂。",
      submitText: "对呢"
    },
    {
      tolk: "我喝水只喝纯净水，喝奶只喝纯牛奶，所以我很单纯！",
      submitText: "哈哈"
    },
    {
      tolk: "[host]，无论你走到哪里，我都会跟着你。",
      submitText: "好呢"
    },
    {
      tolk: "活一天就要努力一天，[host]，你说是吗？",
      submitText: "嗯呢"
    },
    {
      tolk: "我的工作就是日日想、夜夜想，想[host]的365天。",
      submitText: "乖"
    },
    {
      tolk: "[host]珍爱他人就等于珍爱自己哦。",
      submitText: "知道了"
    },
    {
      tolk: "今天在武道会又输了，我要锻炼肌肉，防止挨揍。",
      submitText: "加油"
    },
    {
      tolk: "[host]，我想上大学学习更多知识。",
      submitText: "加油"
    },
    {
      tolk: "[host]我很想种一个梦，勇敢的张开翅膀去拥抱海阔天空。",
      submitText: "会的"
    },
    {
      tolk: "我们都有翅膀，但有的是天使，有的是鸟人。",
      submitText: "呵呵"
    },
    {
      tolk: "[host]，感情不需要计较，平凡而又真实是最温暖的。",
      submitText: "是的"
    },
    {
      tolk: "[host]我长的像包子吗？今天有个狗狗总跟着我。",
      submitText: "很像"
    },
    {
      tolk: "按小猪的审美观，隔壁家的宝贝基本算个美女。",
      submitText: "哈哈"
    },
    {
      tolk: "[host]，天凉了，注意多加衣服哦！",
      submitText: "嗯"
    },
    {
      tolk: "隔壁家的宝贝长的够创意，活的有勇气。",
      submitText: "呵呵"
    },
    {
      tolk: "我不是一个人在战斗，因为我身后有很多小弟——苍蝇。",
      submitText: "洗澡去"
    },
    {
      tolk: "你笑一次，我就高兴好几天！",
      submitText: "我也是"
    },
    {
      tolk: "[host]，我们的回忆录畅销全球",
      submitText: "哈哈"
    },
    {
      tolk: "快乐要懂得分享，才能加倍快乐。",
      submitText: "嗯嗯"
    },
    {
      tolk: "天啦，我的衣服又瘦了！",
      submitText: "你胖了"
    },
    {
      tolk: "我以后都骑自行车上街，低碳生活从我做起。",
      submitText: "行"
    },
    {
      tolk: "[host]，告诉你一个秘密，ALT + . 可以开启上帝模式哦，（哈哈，骗你的！~~）",
      submitText: "好吧我记住你了！！！"
    },
    {
      tolk: "[host]，告诉你一个秘密，设置里面可以重生哦 ，尝试去吧，不过资料会清空哦~~~",
      submitText: "好的 我马上去试下！！！"
    }
  ],
  sys: {
    doNotDisturbNO: [
      {
        tolk: "[host]，你不让我说话，我都快憋死了~~",
        submitText: "哈哈"
      },
      {
        tolk: "[host]，这么久才让我说话，我生气了！！~~",
        submitText: "乖"
      }
    ],
    doNotDisturbOFF: [
      {
        tolk: "[host]，你工作吧，我把消息提醒都关闭了~~",
        submitText: "行"
      },
      {
        tolk: "[host]，321，木头人，不许说话···我可以动，哈哈~~",
        submitText: "321"
      }
    ]
  },
  state: {
    backgroundOver: [
      {
        tolk: "[host]，我漂亮背景到期了，可以再给我买一个么",
        submitText: "马上去~"
      },
      {
        tolk: "[host]，你看我没有背景了~~~",
        submitText: "好的~"
      }
    ],
    foodOver: [
      {
        tolk: "[host]，我的食物成长值加成到期了，可以再给我买一个么",
        submitText: "马上去~"
      }
    ],
    cleanOver: [
      {
        tolk: "[host]，我的日用品成长值加成到期了，可以再给我买一个么",
        submitText: "马上去~"
      }
    ],
    toyOver: [
      {
        tolk: "[host]，我的玩具成长值加成到期了，可以再给我买一个么",
        submitText: "马上去~"
      }
    ],
    eat: [
      {
        tolk: "[host]，你不带我去吃吃喝喝么？~~",
        submitText: "马上去~"
      },
      {
        tolk: "[host]，饿肚子的滋味真难受~~",
        submitText: "乖~给你吃"
      },
      {
        tolk: "可恶的[host]，你一定自己躲着吃大餐吧~~",
        submitText: "分一个鸡腿"
      }
    ],
    clean: [
      {
        tolk: "[host]，你看我身上掉的是什么（雪花）~~",
        submitText: "给你洗洗"
      },
      {
        tolk: "[host]，我是一个爱干净的企鹅~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，你是没元宝买沐浴露了么~~",
        submitText: "是的"
      },
      {
        tolk: "[host]，我可以自己去打工赚元宝，去泡澡不带你，哼~~",
        submitText: "你去吧~"
      }
    ],
    poor: [
      {
        tolk: "[host]，我的小金库空空的，穷得叮当响~~",
        submitText: "知道啦"
      },
      {
        tolk: "[host]，你看我，连根冰棍都买不起了~~",
        submitText: "下次补给你"
      }
    ],
    stopGrowth: [
      {
        tolk: "[host]，我现在暂停成长了~~",
        submitText: "好的"
      }
    ],
    startGrowth: [
      {
        tolk: "[host]，我开始成长了~~",
        submitText: "好的"
      }
    ],
    exit: [
      {
        tolk: "[host]，我们下次再见~~",
        submitText: "再见"
      },
      {
        tolk: "拜拜[host]，~~",
        submitText: "拜拜"
      },
      {
        tolk: "[host]，我走了不要太想我~~",
        submitText: "好的"
      }
    ],
    stopWork: [
      {
        tolk: "[host]，我不加班，来陪你了~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，我翘班，不会被扣钱吧~~",
        submitText: "可能~"
      }
    ],
    stopWorkFoMood0: [
      {
        tolk: "[host]，我现在没心情工作了，呜呜~~",
        submitText: "抱抱"
      },
      {
        tolk: "被同事欺负了！[host]你要帮我！~~",
        submitText: "抱抱"
      }
    ],
    overWork: [
      {
        tolk: "[host]，我带着元宝和餐补回来了~~",
        submitText: "好的"
      }
    ],
    stopStudy: [
      {
        tolk: "[host]，我向老师请假了，是有什么事么~~",
        submitText: "是的"
      },
      {
        tolk: "[host]，我也不想上课，我们去玩吧~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，我逃课了，你不会怪我把~~",
        submitText: "不会的"
      }
    ],
    stopStudyFoMood0: [
      {
        tolk: "[host]，老师说我心情差不要影响别人~~",
        submitText: "抱抱"
      },
      {
        tolk: "[host]，我不想学习了，我陪你一起玩我才开心！~~",
        submitText: "抱抱"
      }
    ],
    overStudy: [
      {
        tolk: "[host]，我学习回来了~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，学习是痛苦的，见到你是开心的~",
        submitText: "好的"
      },
      {
        tolk: "[host]，我学习时候有没有想我啊~",
        submitText: "有的"
      }
    ],
    overStudyUp: [
      {
        tolk: "[host]，我升学了，好开心啊~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，给我准备好学费哦，我要去高等学校啦~",
        submitText: "好的"
      },
      {
        tolk: "哈哈，我没有留级，[host]，我给你带来荣誉！~",
        submitText: "真棒"
      }
    ],
    cententStudy: [
      {
        tolk: "老师说我今天很认真，[host]，让我先回来陪着你！~",
        submitText: "真棒"
      },
      {
        tolk: "[host]，今天我们提前放学拉！~",
        submitText: "好的"
      }
    ],
    overTrip: [
      {
        tolk: "[host]，我旅行回来了，好开心啊~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，无论走到哪里，还是家里最棒的~~",
        submitText: "好的"
      }
    ],
    overTripUpFoMood0: [
      {
        tolk: "[host]，出门忘带Q证了，到了火车站才发现~~",
        submitText: "抱抱"
      },
      {
        tolk: "[host]，我不想离开你！~~",
        submitText: "抱抱"
      }
    ],
    overTripUp: [
      {
        tolk: "[host]，我回来了，还是舍不得你~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，哈哈，我忘记带身份证了~~",
        submitText: "好的"
      }
    ],
    die: [
      {
        tolk: "[host]，需要复活我才能对我操作！~",
        submitText: "好的"
      }
    ],
    bury: [
      {
        tolk: "[host]，永别了！~",
        submitText: "等我"
      },
      {
        tolk: "[host]，我的像素心跳停止啦...但你永远有只胖企鹅在天堂爱你~✨",
        submitText: "百年后天堂再会！~"
      }
    ]
  },
  god: [
    {
      tolk: "这个世界没有上帝，只有我[host]~~",
      submitText: "再见"
    },
    {
      tolk: "[host]，你还真相信了么~~",
      submitText: "是啊"
    },
    {
      tolk: "[host]，要相信科学~~",
      submitText: "好的"
    }
  ],
  startupSelf: {
    startupSelfOn: [
      {
        tolk: "一开机就可以看到我，[host]开不开心~~",
        submitText: "开心"
      },
      {
        tolk: "[host]，我可以自己启动哦~~",
        submitText: "好的"
      },
      {
        tolk: "开机启动设置成功哦，[host]~~",
        submitText: "好的"
      }
    ],
    startupSelfOff: [
      {
        tolk: "呜呜呜，你不想看到我么~~",
        submitText: "哈哈"
      },
      {
        tolk: "[host]，关闭了开机自启就要手动叫醒我哦~~",
        submitText: "好的"
      },
      {
        tolk: "[host]，我已经不会自己启动了~~",
        submitText: "好的"
      }
    ]
  },
  gift: {
    online: [
      {
        tolk: "在线可以领礼物哦，[host]开不开心~~",
        submitText: "开心"
      },
      {
        tolk: "[host]，让我陪着你吧，我有低保~~",
        submitText: "好的"
      },
      {
        tolk: "领取成功啦，[host]~~",
        submitText: "好的"
      }
    ],
    sign: [
      {
        tolk: "记得每天签到哦[host]~~",
        submitText: "哈哈"
      },
      {
        tolk: "[host]，签到成功，这是我的么~~",
        submitText: "是的"
      },
      {
        tolk: "[host]，哈哈，今天又领了个宝贝~~",
        submitText: "好的"
      }
    ]
  },
  toHeartTolk: [
    {
      tolk: "[host]，今天太阳特别好呢~~",
      submitText: "不及你暖"
    },
    {
      tolk: "[host]，忘记带伞了...",
      submitText: "共赴风雨"
    },
    {
      tolk: "[host]，这个方案我改了18遍...",
      submitText: "初见最美"
    },
    {
      tolk: "[host]，星星真美啊",
      submitText: "眸中有光"
    },
    {
      tolk: "[host]，我好像又搞砸了",
      submitText: "我接住你"
    },
    {
      tolk: "[host]，点滴还要打三小时呢...",
      submitText: "时光共老"
    },
    {
      tolk: "[host]，今晚又要通宵改方案了",
      submitText: "暖胃暖心"
    },
    {
      tolk: "[host]，狗狗今天拆家了...",
      submitText: "偏爱你呀"
    },
    {
      tolk: "[host]，妈，这道菜咸了",
      submitText: "爱意过量"
    },
    {
      tolk: "[host]，面试又失败了...",
      submitText: "命运留白"
    },
    {
      tolk: "[host]，这暴雨把新裙子都淋湿了...",
      submitText: "以身为伞"
    },
    {
      tolk: "[host]，发烧到39度，整个人昏昏沉沉的...",
      submitText: "彻夜长安"
    }
  ],
  mood: {
    happy: [
      {
        tolk: "[host]今天笑容特别甜呢~",
        submitText: "开心"
      },
      {
        tolk: "检测到[host]心情指数爆表啦！",
        submitText: "是的"
      },
      {
        tolk: "快乐会传染，分我一点好吗~",
        submitText: "给"
      }
    ],
    peaceful: [
      {
        tolk: "[host]此刻的宁静真美好",
        submitText: "嗯"
      },
      {
        tolk: "感受到[host]平和的气场了",
        submitText: "对"
      },
      {
        tolk: "和[host]一起静享时光",
        submitText: "好"
      }
    ],
    upset: [
      {
        tolk: "[host]需要抱抱吗？",
        submitText: "要"
      },
      {
        tolk: "我的耳朵准备好听[host]倾诉了",
        submitText: "听"
      },
      {
        tolk: "给[host]递纸巾...",
        submitText: "谢"
      }
    ],
    sad: [
      {
        tolk: "[host]的难过我都接住",
        submitText: "接"
      },
      {
        tolk: "会陪[host]等到天晴的",
        submitText: "等"
      },
      {
        tolk: "给[host]存了100个拥抱",
        submitText: "领"
      }
    ]
  },
  pay: {
    food: [
      {
        tolk: "[host],谢谢你~我会赚更多元宝的~",
        submitText: "好的"
      },
      {
        tolk: "[host],感谢大自然的馈赠！~",
        submitText: "好的"
      },
      {
        tolk: "[host],吃抱抱，长快快~",
        submitText: "好的"
      }
    ],
    clean: [
      {
        tolk: "[host],我爱洗澡皮肤好好~噢噢噢噢~",
        submitText: "哈哈"
      },
      {
        tolk: "[host],今天洗香香~",
        submitText: "好的"
      },
      {
        tolk: "[host],工资都不够用了~",
        submitText: "好的"
      }
    ],
    medicine: [
      {
        tolk: "[host],家里常备感冒药哦~",
        submitText: "好的"
      },
      {
        tolk: "[host],你真贴心~",
        submitText: "好的"
      }
    ],
    toy: [
      {
        tolk: "[host],我们一起玩吧~",
        submitText: "好的"
      },
      {
        tolk: "[host],这个看起来好好玩！~",
        submitText: "是的"
      }
    ],
    background: [
      {
        tolk: "[host],好漂亮啊，心情更好了~",
        submitText: "好的"
      },
      {
        tolk: "[host],我喜欢这个背景！~",
        submitText: "是的"
      }
    ],
    nums: [
      {
        tolk: "[host],你对我太好了~",
        submitText: "好的"
      }
    ]
  }
};
let task$1 = null;
const elapsed = () => task$1?.done ?? 0;
function startTask(t, value, done = 0) {
  task$1 = { ...t, done };
  update("saveJsonData", { activity: String(done) });
  setActivity(t.key, value);
  refreshTray();
}
function stopTask() {
  if (!task$1) return null;
  const { key } = task$1;
  task$1 = null;
  setActivity(key, null);
  refreshTray();
  return key;
}
function advanceTask(minutes) {
  if (!task$1) return;
  const t = task$1;
  t.done = Math.min(t.done + minutes, t.minutes);
  update("saveJsonData", { activity: String(t.done) });
  const early = Boolean(t.early?.(t.done));
  if (!early && t.done < t.minutes) return;
  stopTask();
  t.end(early);
}
function pickCare(goods, stat, deficit) {
  let fit;
  let over2;
  for (const g of goods) {
    const v = g[stat] ?? 0;
    if (v <= 0) continue;
    if (v <= deficit) {
      if (!fit || v > (fit[stat] ?? 0)) fit = g;
    } else if (!over2 || v < (over2[stat] ?? 0)) over2 = g;
  }
  return fit ?? over2;
}
const DATA = [
  {
    id: "u_alipay",
    p: "",
    b: true
  },
  {
    id: "u_anniv",
    p: "",
    b: true
  },
  {
    id: "u_baidicheng",
    p: "重庆市",
    b: true
  },
  {
    id: "u_baiyulan",
    p: "",
    b: true
  },
  {
    id: "u_bwg_jiangxi",
    p: "江西省",
    b: false
  },
  {
    id: "u_bwg_nanyuewang",
    p: "广东省",
    b: false
  },
  {
    id: "u_bwg_shandong",
    p: "山东省",
    b: false
  },
  {
    id: "u_bwg_shanxi",
    p: "山西省",
    b: false
  },
  {
    id: "u_bwg_wuwenhua",
    p: "江苏省",
    b: false
  },
  {
    id: "u_chunjie_tu",
    p: "",
    b: true
  },
  {
    id: "u_climb",
    p: "",
    b: true
  },
  {
    id: "u_csj",
    p: "",
    b: true
  },
  {
    id: "u_duanwu",
    p: "",
    b: true
  },
  {
    id: "u_dyc",
    p: "",
    b: true
  },
  {
    id: "u_eave",
    p: "",
    b: true
  },
  {
    id: "u_feishu",
    p: "",
    b: true
  },
  {
    id: "u_forage",
    p: "",
    b: true
  },
  {
    id: "u_hhly_ljx",
    p: "甘肃省",
    b: true
  },
  {
    id: "u_hhly_sjy",
    p: "青海省",
    b: true
  },
  {
    id: "u_hjh",
    p: "",
    b: true
  },
  {
    id: "u_huabei",
    p: "",
    b: true
  },
  {
    id: "u_huazhu",
    p: "",
    b: true
  },
  {
    id: "u_jiangtun",
    p: "",
    b: true
  },
  {
    id: "u_jsh",
    p: "",
    b: true
  },
  {
    id: "u_lamei",
    p: "",
    b: true
  },
  {
    id: "u_leaf",
    p: "",
    b: true
  },
  {
    id: "u_light",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd1",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd2",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd3",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd4",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd5",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd6",
    p: "",
    b: true
  },
  {
    id: "u_linkage_szgd7",
    p: "",
    b: true
  },
  {
    id: "u_lkq",
    p: "",
    b: true
  },
  {
    id: "u_lost_bh_ly",
    p: "",
    b: true
  },
  {
    id: "u_lost_cw_dn",
    p: "",
    b: true
  },
  {
    id: "u_lost_yhc_xf",
    p: "",
    b: true
  },
  {
    id: "u_lotus",
    p: "",
    b: false
  },
  {
    id: "u_maple",
    p: "",
    b: false
  },
  {
    id: "u_mid_autumn",
    p: "",
    b: true
  },
  {
    id: "u_month1",
    p: "",
    b: true
  },
  {
    id: "u_month10",
    p: "",
    b: true
  },
  {
    id: "u_month10_2",
    p: "",
    b: true
  },
  {
    id: "u_month11",
    p: "",
    b: true
  },
  {
    id: "u_month11_2",
    p: "",
    b: true
  },
  {
    id: "u_month12",
    p: "",
    b: true
  },
  {
    id: "u_month12_2",
    p: "",
    b: true
  },
  {
    id: "u_month1_2",
    p: "",
    b: true
  },
  {
    id: "u_month2",
    p: "",
    b: true
  },
  {
    id: "u_month3",
    p: "",
    b: true
  },
  {
    id: "u_month4",
    p: "",
    b: true
  },
  {
    id: "u_month5",
    p: "",
    b: true
  },
  {
    id: "u_month6",
    p: "",
    b: true
  },
  {
    id: "u_month7",
    p: "",
    b: true
  },
  {
    id: "u_month8",
    p: "",
    b: true
  },
  {
    id: "u_month9",
    p: "",
    b: true
  },
  {
    id: "u_month9_2",
    p: "",
    b: true
  },
  {
    id: "u_moon",
    p: "",
    b: true
  },
  {
    id: "u_mushroom",
    p: "",
    b: true
  },
  {
    id: "u_ofo",
    p: "",
    b: true
  },
  {
    id: "u_owl",
    p: "",
    b: true
  },
  {
    id: "u_plant",
    p: "",
    b: false
  },
  {
    id: "u_player",
    p: "",
    b: true
  },
  {
    id: "u_pumpkin",
    p: "",
    b: true
  },
  {
    id: "u_r1",
    p: "",
    b: true
  },
  {
    id: "u_r2",
    p: "",
    b: true
  },
  {
    id: "u_r3",
    p: "",
    b: true
  },
  {
    id: "u_r4",
    p: "",
    b: true
  },
  {
    id: "u_r5",
    p: "",
    b: true
  },
  {
    id: "u_rabbit",
    p: "",
    b: true
  },
  {
    id: "u_roof",
    p: "",
    b: false
  },
  {
    id: "u_snail",
    p: "",
    b: true
  },
  {
    id: "u_streetlight",
    p: "",
    b: true
  },
  {
    id: "u_sugar_maple",
    p: "",
    b: true
  },
  {
    id: "u_swan",
    p: "",
    b: true
  },
  {
    id: "u_szy",
    p: "",
    b: true
  },
  {
    id: "u_tadpole",
    p: "",
    b: true
  },
  {
    id: "u_tea",
    p: "",
    b: false
  },
  {
    id: "u_two_month1",
    p: "",
    b: true
  },
  {
    id: "u_two_month10",
    p: "",
    b: true
  },
  {
    id: "u_two_month10_2",
    p: "",
    b: true
  },
  {
    id: "u_two_month11",
    p: "",
    b: true
  },
  {
    id: "u_two_month11_2",
    p: "",
    b: true
  },
  {
    id: "u_two_month12",
    p: "",
    b: true
  },
  {
    id: "u_two_month12_2",
    p: "",
    b: true
  },
  {
    id: "u_two_month1_2",
    p: "",
    b: true
  },
  {
    id: "u_two_month2",
    p: "",
    b: true
  },
  {
    id: "u_two_month3",
    p: "",
    b: true
  },
  {
    id: "u_two_month4",
    p: "",
    b: true
  },
  {
    id: "u_two_month5",
    p: "",
    b: true
  },
  {
    id: "u_two_month6",
    p: "",
    b: true
  },
  {
    id: "u_two_month7",
    p: "",
    b: true
  },
  {
    id: "u_two_month8",
    p: "",
    b: true
  },
  {
    id: "u_two_month9",
    p: "",
    b: true
  },
  {
    id: "u_two_month9_2",
    p: "",
    b: true
  },
  {
    id: "u_wuxiakou",
    p: "重庆市",
    b: true
  },
  {
    id: "u_xixi",
    p: "浙江省",
    b: true
  },
  {
    id: "u_yhcwsq",
    p: "",
    b: true
  },
  {
    id: "u_yingchun",
    p: "",
    b: true
  },
  {
    id: "u_yoga",
    p: "",
    b: true
  },
  {
    id: "u_yuanyang",
    p: "",
    b: true
  },
  {
    id: "g_anhui1",
    p: "安徽省",
    b: false
  },
  {
    id: "g_anhui2",
    p: "安徽省",
    b: false
  },
  {
    id: "g_anhui3",
    p: "安徽省",
    b: false
  },
  {
    id: "g_aomen1",
    p: "澳门特别行政区",
    b: false
  },
  {
    id: "g_aomen2",
    p: "澳门特别行政区",
    b: false
  },
  {
    id: "g_aomen3",
    p: "澳门特别行政区",
    b: false
  },
  {
    id: "g_aomen4",
    p: "澳门特别行政区",
    b: false
  },
  {
    id: "g_beijing1",
    p: "北京市",
    b: false
  },
  {
    id: "g_beijing2",
    p: "北京市",
    b: false
  },
  {
    id: "g_beijing3",
    p: "北京市",
    b: false
  },
  {
    id: "g_beijing4",
    p: "北京市",
    b: false
  },
  {
    id: "g_beijing5",
    p: "北京市",
    b: false
  },
  {
    id: "g_bwg_jiangxi1",
    p: "江西省",
    b: false
  },
  {
    id: "g_bwg_jiangxi2",
    p: "江西省",
    b: false
  },
  {
    id: "g_bwg_nanyuewang1",
    p: "广东省",
    b: false
  },
  {
    id: "g_bwg_nanyuewang2",
    p: "广东省",
    b: false
  },
  {
    id: "g_bwg_shandong1",
    p: "山东省",
    b: false
  },
  {
    id: "g_bwg_shandong2",
    p: "山东省",
    b: false
  },
  {
    id: "g_bwg_shanxi1",
    p: "山西省",
    b: false
  },
  {
    id: "g_bwg_shanxi2",
    p: "山西省",
    b: false
  },
  {
    id: "g_bwg_wuwenhua1",
    p: "江苏省",
    b: false
  },
  {
    id: "g_bwg_wuwenhua2",
    p: "江苏省",
    b: false
  },
  {
    id: "g_chengdu1",
    p: "四川省",
    b: false
  },
  {
    id: "g_chengdu2",
    p: "四川省",
    b: false
  },
  {
    id: "g_chengdu3",
    p: "四川省",
    b: false
  },
  {
    id: "g_chengdu4",
    p: "四川省",
    b: false
  },
  {
    id: "g_chengdu5",
    p: "四川省",
    b: false
  },
  {
    id: "g_chongqing1",
    p: "重庆市",
    b: false
  },
  {
    id: "g_chongqing2",
    p: "重庆市",
    b: false
  },
  {
    id: "g_fujian1",
    p: "福建省",
    b: false
  },
  {
    id: "g_fujian2",
    p: "福建省",
    b: false
  },
  {
    id: "g_fujian3",
    p: "福建省",
    b: false
  },
  {
    id: "g_fujian4",
    p: "福建省",
    b: false
  },
  {
    id: "g_guangzhou1",
    p: "广东省",
    b: false
  },
  {
    id: "g_guangzhou2",
    p: "广东省",
    b: false
  },
  {
    id: "g_guangzhou3",
    p: "广东省",
    b: false
  },
  {
    id: "g_guangzhou4",
    p: "广东省",
    b: false
  },
  {
    id: "g_guangzhou5",
    p: "广东省",
    b: false
  },
  {
    id: "g_guangzhou6",
    p: "广东省",
    b: false
  },
  {
    id: "g_guilin1",
    p: "广西壮族自治区",
    b: false
  },
  {
    id: "g_guilin2",
    p: "广西壮族自治区",
    b: false
  },
  {
    id: "g_guilin3",
    p: "广西壮族自治区",
    b: false
  },
  {
    id: "g_guizhou1",
    p: "贵州省",
    b: false
  },
  {
    id: "g_guizhou2",
    p: "贵州省",
    b: false
  },
  {
    id: "g_guizhou3",
    p: "贵州省",
    b: false
  },
  {
    id: "g_haerbin1",
    p: "黑龙江省",
    b: false
  },
  {
    id: "g_haerbin2",
    p: "黑龙江省",
    b: false
  },
  {
    id: "g_haerbin3",
    p: "黑龙江省",
    b: false
  },
  {
    id: "g_hainan1",
    p: "海南省",
    b: false
  },
  {
    id: "g_hainan2",
    p: "海南省",
    b: false
  },
  {
    id: "g_hainan5",
    p: "海南省",
    b: false
  },
  {
    id: "g_hangzhou1",
    p: "浙江省",
    b: false
  },
  {
    id: "g_hangzhou2",
    p: "浙江省",
    b: false
  },
  {
    id: "g_hangzhou3",
    p: "浙江省",
    b: false
  },
  {
    id: "g_hebei1",
    p: "河北省",
    b: false
  },
  {
    id: "g_hebei2",
    p: "河北省",
    b: false
  },
  {
    id: "g_hebei3",
    p: "河北省",
    b: false
  },
  {
    id: "g_hebei4",
    p: "河北省",
    b: false
  },
  {
    id: "g_hhly_hkpp",
    p: "山西省",
    b: true
  },
  {
    id: "g_hhly_xld",
    p: "河南省",
    b: true
  },
  {
    id: "g_jiangmen1",
    p: "广东省",
    b: false
  },
  {
    id: "g_jiangmen2",
    p: "广东省",
    b: false
  },
  {
    id: "g_jiangxi1",
    p: "江西省",
    b: false
  },
  {
    id: "g_jiangxi2",
    p: "江西省",
    b: false
  },
  {
    id: "g_jiangxi3",
    p: "江西省",
    b: false
  },
  {
    id: "g_jilin1",
    p: "吉林省",
    b: false
  },
  {
    id: "g_jilin2",
    p: "吉林省",
    b: false
  },
  {
    id: "g_jilin3",
    p: "吉林省",
    b: false
  },
  {
    id: "g_jilin4",
    p: "吉林省",
    b: false
  },
  {
    id: "g_jiuquan1",
    p: "甘肃省",
    b: false
  },
  {
    id: "g_jiuquan2",
    p: "甘肃省",
    b: false
  },
  {
    id: "g_jiuquan3",
    p: "甘肃省",
    b: false
  },
  {
    id: "g_lasa1",
    p: "西藏自治区",
    b: false
  },
  {
    id: "g_lasa2",
    p: "西藏自治区",
    b: false
  },
  {
    id: "g_lasa3",
    p: "西藏自治区",
    b: false
  },
  {
    id: "g_lasa4",
    p: "西藏自治区",
    b: false
  },
  {
    id: "g_ld_guqin",
    p: "",
    b: false
  },
  {
    id: "g_liaoning1",
    p: "辽宁省",
    b: false
  },
  {
    id: "g_liaoning2",
    p: "辽宁省",
    b: false
  },
  {
    id: "g_liaoning3",
    p: "辽宁省",
    b: false
  },
  {
    id: "g_luoyang1",
    p: "河南省",
    b: false
  },
  {
    id: "g_luoyang2",
    p: "河南省",
    b: false
  },
  {
    id: "g_luoyang3",
    p: "河南省",
    b: false
  },
  {
    id: "g_ningxia1",
    p: "宁夏回族自治区",
    b: false
  },
  {
    id: "g_ningxia2",
    p: "宁夏回族自治区",
    b: false
  },
  {
    id: "g_ningxia3",
    p: "宁夏回族自治区",
    b: false
  },
  {
    id: "g_qingdao1",
    p: "山东省",
    b: false
  },
  {
    id: "g_qingdao2",
    p: "山东省",
    b: false
  },
  {
    id: "g_qinghai1",
    p: "青海省",
    b: false
  },
  {
    id: "g_qinghai2",
    p: "青海省",
    b: false
  },
  {
    id: "g_qinghai3",
    p: "青海省",
    b: false
  },
  {
    id: "g_qinghai4",
    p: "青海省",
    b: false
  },
  {
    id: "g_sanxia1",
    p: "湖北省",
    b: true
  },
  {
    id: "g_sanxia2",
    p: "湖北省",
    b: true
  },
  {
    id: "g_shanghai1",
    p: "上海市",
    b: false
  },
  {
    id: "g_shanghai2",
    p: "上海市",
    b: false
  },
  {
    id: "g_shanghai3",
    p: "上海市",
    b: false
  },
  {
    id: "g_shanxi1",
    p: "山西省",
    b: false
  },
  {
    id: "g_shanxi2",
    p: "山西省",
    b: false
  },
  {
    id: "g_shanxi3",
    p: "山西省",
    b: false
  },
  {
    id: "g_shanxi4",
    p: "山西省",
    b: false
  },
  {
    id: "g_suzhou1",
    p: "江苏省",
    b: false
  },
  {
    id: "g_suzhou2",
    p: "江苏省",
    b: false
  },
  {
    id: "g_suzhou3",
    p: "江苏省",
    b: false
  },
  {
    id: "g_suzhou4",
    p: "江苏省",
    b: false
  },
  {
    id: "g_tianjin1",
    p: "天津市",
    b: false
  },
  {
    id: "g_tianjin2",
    p: "天津市",
    b: false
  },
  {
    id: "g_tw_jingan",
    p: "台湾省",
    b: false
  },
  {
    id: "g_tw_kending1",
    p: "台湾省",
    b: false
  },
  {
    id: "g_tw_lanyu",
    p: "台湾省",
    b: false
  },
  {
    id: "g_tw_shifen1",
    p: "台湾省",
    b: false
  },
  {
    id: "g_tw_tiandeng",
    p: "台湾省",
    b: false
  },
  {
    id: "g_tw_zuinandian",
    p: "台湾省",
    b: false
  },
  {
    id: "g_wuhan1",
    p: "湖北省",
    b: false
  },
  {
    id: "g_wuhan2",
    p: "湖北省",
    b: false
  },
  {
    id: "g_wuhan3",
    p: "湖北省",
    b: false
  },
  {
    id: "g_wuhan4",
    p: "湖北省",
    b: false
  },
  {
    id: "g_xian1",
    p: "陕西省",
    b: false
  },
  {
    id: "g_xian2",
    p: "陕西省",
    b: false
  },
  {
    id: "g_xian3",
    p: "陕西省",
    b: false
  },
  {
    id: "g_xianggang1",
    p: "香港特别行政区",
    b: false
  },
  {
    id: "g_xianggang2",
    p: "香港特别行政区",
    b: false
  },
  {
    id: "g_xianggang4",
    p: "香港特别行政区",
    b: false
  },
  {
    id: "g_yunnan1",
    p: "云南省",
    b: false
  },
  {
    id: "g_yunnan2",
    p: "云南省",
    b: false
  },
  {
    id: "g_yunnan4",
    p: "云南省",
    b: false
  },
  {
    id: "g_zhangjiajie1",
    p: "湖南省",
    b: false
  },
  {
    id: "g_zhangjiajie3",
    p: "湖南省",
    b: false
  },
  {
    id: "g_zhangjiajie4",
    p: "湖南省",
    b: false
  }
];
const PHOTOS = DATA;
const BUDDY = 0.4;
const photoUrl = (id) => `pet/album/${id}.webp`;
const isBuddy = (id) => PHOTOS.some((x) => x.id === id && x.b);
const shots = () => JSON.parse(save.saveJsonData.album || "[]");
function takePhoto(city) {
  const taken = new Set(shots().map((s2) => s2.id));
  const left = PHOTOS.filter((x) => !taken.has(x.id));
  const b = Math.random() < BUDDY;
  const pool = [b, !b].flatMap((kind) => [city, ""].map((p) => left.filter((x) => x.b === kind && x.p === p))).find((l) => l.length);
  if (!pool) return null;
  const shot = { id: pool[rand(0, pool.length - 1)].id, city, d: Math.floor(Date.now() / 1e3) };
  update("saveJsonData", { album: JSON.stringify([...shots(), shot]) });
  return shot;
}
const readMails = () => JSON.parse(save.saveJsonData.email || "{}");
const writeMails = (mails) => update("saveJsonData", { email: JSON.stringify(mails) });
function some(type, n) {
  const all = allGoods(type);
  return Array.from({ length: n }, () => ({ ...all.splice(rand(0, all.length - 1), 1)[0], num: rand(1, 3) }));
}
function slot$1(mails) {
  let d = Math.floor(Date.now() / 1e3);
  while (mails[d]) d++;
  return d;
}
function send(mails, k, l, yb, m) {
  if (Object.values(mails).some((x) => x.k === k)) return false;
  const d = slot$1(mails);
  mails[d] = { d, k, l, m, glb: [...some("food", 3), ...some("toy", 2), goodOf("nums", "yb", scaleYb(yb))] };
  return true;
}
function mailPhoto(s2) {
  const mails = readMails();
  const d = slot$1(mails);
  const l = isBuddy(s2.id) ? `在${s2.city}遇到了旅游搭子！` : `来自${s2.city}的明信片`;
  mails[d] = { d, l, p: s2.id, m: "[host]，照片我收进「旅游-相簿」啦，随时可以翻看哦~", glb: [] };
  writeMails(mails);
}
function deliverMails(today2) {
  const mails = readMails();
  const now2 = /* @__PURE__ */ new Date();
  const born2 = new Date(info.birthDay * 1e3);
  const years = now2.getFullYear() - born2.getFullYear();
  const due = [];
  if (!Object.values(mails).some((m) => !m.e)) due.push(["welcome", "欢迎来到QQ宠物~", 100, "[host]，欢迎回家！右键（手机上长按）我或者点我脚下的标签，有好多好玩的哦~"]);
  if (years > 0 && now2.getMonth() === born2.getMonth() && now2.getDate() === born2.getDate())
    due.push([`birthday-${now2.getFullYear()}`, `${info.name}的${years}周岁生日快乐！`, 300, "[host]，今天是我的生日，谢谢你一直陪着我！"]);
  const h2 = today2?.holiday;
  if (h2?.off) due.push([`${now2.getFullYear()}-${h2.name}`, `${h2.name}快乐！`, 200, `[host]，${h2.name}快乐！收到节日礼物啦~`]);
  const sent = due.filter((m) => send(mails, ...m)).length > 0;
  if (sent) writeMails(mails);
  return sent;
}
function common(o) {
  return {
    enter: { name: "Enter", start: 1, end: o.enter?.end ?? 3 },
    clean: { name: "Clean", start: 1, end: 2, notNum: o.clean?.notNum },
    eat: { name: "Eat", start: 1, end: o.eat?.end ?? 2 },
    first: { name: "First" },
    levUp: { name: "LevUp" },
    exit: { name: "Exit", start: 1, end: o.exit?.end ?? 4 },
    sick: { name: "Sick", start: 1, end: 2, notNum: o.sick?.notNum },
    die: { name: "Die", opt: { afterState: ["revival", "bury"] } },
    revival: { name: "Revival" },
    bury: { name: "Bury", opt: { afterState: [], overCurrentFrame: o.bury } },
    dying: { name: "Dying", opt: { afterState: ["dying", "die", "cure", "revival", "bury", "hide", "appear"] } },
    cure: { name: "Cure", start: 1, end: 2, notNum: o.cure?.notNum },
    hideleft: { name: "Hide_left", start: 1, end: 1 },
    hideright: { name: "Hide_right", start: 1, end: 1 },
    hungry: { name: "Hungry" },
    dirty: { name: "Dirty" },
    poor: { name: "Poor" }
  };
}
function moodActions(play, speak2 = { notNum: true }) {
  return {
    normal: { name: "Stand" },
    // Keep the pet's own appearance when no matching drag artwork is available.
    drag: { name: "Stand" },
    play: { name: "play/P", start: 1, end: play },
    speak: { name: "Speak", start: 1, end: speak2.end ?? 1, notNum: speak2.notNum },
    hide: { name: "Hide" },
    appear: { name: "Appear" }
  };
}
const SINGLE_FRAME_HOLD = 3e3;
const walks = (n) => ({
  walk_left: Array.from({ length: n }, (_, i) => `walk/walk_left${i ? i + 1 : ""}`),
  walk_right: Array.from({ length: n }, (_, i) => `walk/walk_right${i ? i + 1 : ""}`)
});
const looks = () => ({
  look_left: ["walk/left_stop2", "walk/left_stop3", "walk/lplay", "walk/lplay2", "walk/lplay3"],
  look_right: ["walk/right_stop2", "walk/right_stop3", "walk/rplay", "walk/rplay2", "walk/rplay3"]
});
const ACTIONS = {
  // GG has the newer client's extra clips (#25).
  GG: {
    // Imported Egg P30..47 and Kid P112..127 draw adult GG despite their directories.
    play: { egg: 29, kid: 111, peaceful: 127 },
    variants: {
      Egg: {
        // motion/drag*101213 and motion/hide_*130906 under Egg/Kid draw the adult (hide_right130906 is the Adult
        // file byte for byte): dragging or peeking turned an egg into a grown pet (#43). They stay unused.
        ...walks(2),
        look_left: ["walk/lplay"],
        look_right: ["walk/rplay"]
      },
      Kid: {
        ...walks(3),
        dirty: ["Dirty", "lead/dirty20110805"],
        poor: ["Poor", "lead/poor20110826"],
        ...looks()
      },
      Adult: { ...walks(3), hideright: ["Hide_right1", "motion/hide_right130906"], ...looks() }
    },
    extraPlay: {
      // Imported Egg extras draw adult GG and have no age-dependent initialization.
      Adult: [{ clip: "motion/005", single: true }, { clip: "motion/009", single: true }, { clip: "motion/017" }, { clip: "motion/021" }]
    },
    rest: {
      // The imported Egg/Kid turn clips also draw adult GG.
      Adult: { down: "Etoj", lying: "prostrate/Stand", up: "Jtoc" }
    }
  },
  // MM only has the adult lying pose.
  MM: { play: { egg: 29, kid: 111, peaceful: 100 }, variants: {}, rest: { Adult: { lying: "prostrate/Stand" } } }
};
const KID = { exit: { end: 3 }, eat: { end: 1 }, clean: { notNum: true }, sick: { notNum: true }, cure: { notNum: true } };
const EGG = { enter: { end: 2 }, exit: { end: 3 }, clean: { notNum: true }, sick: { notNum: true }, cure: { notNum: true } };
const MOOD_PLAY = { happy: 47, peaceful: 100, upset: 23, sad: 22 };
const tables = (adultBury, play) => ({
  Adult: common({ bury: adultBury }),
  Kid: { ...common({ ...KID, bury: 134 }), ...moodActions(play.kid) },
  Egg: { ...common({ ...EGG, bury: 140 }), ...moodActions(play.egg, { end: 3 }) }
});
const TABLES = { GG: tables(76, ACTIONS.GG.play), MM: tables(142, ACTIONS.MM.play) };
const adultMoods = (sex) => Object.fromEntries(
  Object.entries(MOOD_PLAY).map(([m, n]) => [m, moodActions(m === "peaceful" ? ACTIONS[sex].play.peaceful : n)])
);
const ADULT_MOODS = { GG: adultMoods("GG"), MM: adultMoods("MM") };
const BY_MOOD = ["normal", "drag", "play", "speak", "appear", "hide"];
function route(sex, stage2, action, mood2) {
  let dir2 = `pet/Action/${sex}/${stage2}/`;
  let routes = TABLES[sex][stage2];
  if (stage2 === "Adult" && BY_MOOD.includes(action)) {
    routes = ADULT_MOODS[sex][mood2];
    dir2 += `${mood2}/`;
  }
  const r = routes[action];
  if (action === "play") {
    const extra = extraPlay(sex, stage2, r.end ?? 0);
    if (extra) return { url: `pet/Action/${sex}/${stage2}/${extra.clip}.swf`, opt: { ...r, opt: extra.single ? { holdMs: SINGLE_FRAME_HOLD } : void 0 } };
  }
  const alt = stage2 === "Adult" && BY_MOOD.includes(action) && action !== "drag" ? null : variant(sex, stage2, action);
  if (alt) return { url: `pet/Action/${sex}/${stage2}/${alt}.swf`, opt: r };
  const n = r.start && r.end && !r.notNum ? Math.trunc(Math.random() * r.end + r.start) : "";
  return { url: `${dir2}${r.name}${n}.swf`, opt: r };
}
function variant(sex, stage2, key, pick2 = (n) => Math.trunc(Math.random() * n)) {
  const list2 = ACTIONS[sex].variants[stage2]?.[key];
  return list2?.length ? list2[pick2(list2.length)] : null;
}
function extraPlay(sex, stage2, numbered, roll2 = Math.random()) {
  const list2 = ACTIONS[sex].extraPlay?.[stage2] ?? [];
  const i = Math.trunc(roll2 * (numbered + list2.length)) - numbered;
  return i >= 0 ? list2[i] : null;
}
function walkUrl(sex, stage2, dir2) {
  return `pet/Action/${sex}/${stage2}/${variant(sex, stage2, `walk_${dir2}`) ?? `walk/walk_${dir2}`}.swf`;
}
function lookUrl(sex, stage2, dir2) {
  const v = variant(sex, stage2, `look_${dir2}`);
  return v ? `pet/Action/${sex}/${stage2}/${v}.swf` : null;
}
function restPlan(sex, stage2) {
  const r = ACTIONS[sex].rest?.[stage2];
  if (!r) return null;
  const url = (clip2) => `pet/Action/${sex}/${stage2}/${clip2}.swf`;
  return { down: r.down && url(r.down), lying: { url: url(r.lying), freeze: r.freeze }, up: r.up && url(r.up) };
}
const DYING_ALLOWED = ["cure", "die", "revival", "hide", "appear", "enter"];
function effectiveAction(p) {
  return info.health === 1 && !DYING_ALLOWED.includes(p.a) ? "dying" : p.a;
}
class Machine {
  constructor(swf, onChange) {
    this.swf = swf;
    this.onChange = onChange;
    this.pose = { a: "enter" };
    this.queue = [];
    this.next = null;
    this.changing = false;
    this.revision = 0;
    this.since = 0;
  }
  start() {
    setInterval(() => this.tick(), 1e3 / 12);
  }
  add(p) {
    if (this.pose.a === "hideleft" || this.pose.a === "hideright") return;
    this.queue.push(p);
  }
  play(p) {
    const action = effectiveAction(p);
    if (!this.poseOpt?.afterState || this.poseOpt.afterState.includes(action)) this.revision++;
    this.next = p;
  }
  tick() {
    if (window.__qqpetHostPaused) return;
    const f = this.swf.front;
    if (f.isRecovering) return;
    const last2 = f.totalFrames - 1;
    const freezeAt = this.poseOpt?.overCurrentFrame;
    if (freezeAt && f.currentFrame >= freezeAt && f.isPlaying) f.stop();
    if (this.changing) return;
    const hold = this.pose.a === "normal" || this.pose.a === "hideleft" || this.pose.a === "hideright" || this.pose.a === "drag" || this.pose.a === "walk" || this.pose.a === "diudiule";
    const timedOut = !!this.poseOpt?.holdMs && Date.now() - this.since >= this.poseOpt.holdMs;
    const holding = !timedOut && (hold && !this.queue.length || f.currentFrame !== last2 || last2 === 0 && !this.queue.length);
    if (!this.next && holding) return;
    const p = this.next ?? this.queue.shift() ?? { a: applyEdge() ?? "normal" };
    p.a = effectiveAction(p);
    if (this.poseOpt?.afterState && !this.poseOpt.afterState.includes(p.a)) return;
    if (this.next) this.queue = [];
    this.next = null;
    this.changing = true;
    const revision = this.revision;
    const target = p.opt ?? route(info.sex, stage$1(), p.a, mood());
    void this.swf.load(target.url, () => this.revision === revision).then((swapped) => {
      this.changing = false;
      if (!swapped) return;
      const over2 = this.pose;
      this.pose = p;
      this.poseOpt = target.opt.opt;
      this.since = Date.now();
      this.onChange(over2, p);
    }).catch(() => {
      this.changing = false;
      if (!this.next && p.a !== "normal") this.next = { a: "normal" };
    });
  }
}
const FRIES = [
  {
    fryid: 2,
    avator: 2,
    flag: 0,
    name: "金鱼",
    level: 0,
    price_yb: 2,
    quantity: 5,
    interval: 7200,
    sell_price: 2
  },
  {
    fryid: 1,
    avator: 1,
    flag: 0,
    name: "秋刀鱼",
    level: 3,
    price_yb: 5,
    quantity: 5,
    interval: 7200,
    sell_price: 3
  },
  {
    fryid: 3,
    avator: 3,
    flag: 0,
    name: "热带鱼",
    level: 6,
    price_yb: 8,
    quantity: 5,
    interval: 7200,
    sell_price: 6
  },
  {
    fryid: 4,
    avator: 4,
    flag: 1,
    name: "鳝鱼",
    level: 3,
    price_yb: 6,
    quantity: 5,
    interval: 7200,
    sell_price: 3
  },
  {
    fryid: 33,
    avator: 33,
    flag: 0,
    name: "章鱼",
    level: 9,
    price_yb: 11,
    quantity: 5,
    interval: 7200,
    sell_price: 9
  },
  {
    fryid: 5,
    avator: 5,
    flag: 1,
    name: "刺须鲶鱼",
    level: 15,
    price_yb: 17,
    quantity: 5,
    interval: 7200,
    sell_price: 15
  },
  {
    fryid: 34,
    avator: 34,
    flag: 0,
    name: "鲟鱼",
    level: 12,
    price_yb: 14,
    quantity: 5,
    interval: 7200,
    sell_price: 12
  },
  {
    fryid: 6,
    avator: 6,
    flag: 1,
    name: "紫印鱼",
    level: 18,
    price_yb: 20,
    quantity: 5,
    interval: 10800,
    sell_price: 18
  },
  {
    fryid: 17,
    avator: 17,
    flag: 0,
    name: "灯泡鱼",
    level: 21,
    price_yb: 23,
    quantity: 5,
    interval: 7200,
    sell_price: 21
  },
  {
    fryid: 8,
    avator: 8,
    flag: 0,
    name: "大眼鱼",
    level: 24,
    price_yb: 26,
    quantity: 5,
    interval: 7200,
    sell_price: 24
  },
  {
    fryid: 9,
    avator: 9,
    flag: 0,
    name: "孔雀鱼",
    level: 27,
    price_yb: 29,
    quantity: 5,
    interval: 10800,
    sell_price: 27
  },
  {
    fryid: 13,
    avator: 13,
    flag: 0,
    name: "闪电鱼",
    level: 33,
    price_yb: 35,
    quantity: 5,
    interval: 7200,
    sell_price: 33
  },
  {
    fryid: 14,
    avator: 14,
    flag: 1,
    name: "天使鱼",
    level: 30,
    price_yb: 32,
    quantity: 5,
    interval: 10800,
    sell_price: 30
  },
  {
    fryid: 11,
    avator: 11,
    flag: 0,
    name: "虎皮鱼",
    level: 39,
    price_yb: 41,
    quantity: 5,
    interval: 7200,
    sell_price: 39
  },
  {
    fryid: 15,
    avator: 15,
    flag: 1,
    name: "剑鱼",
    level: 36,
    price_yb: 38,
    quantity: 5,
    interval: 7200,
    sell_price: 36
  },
  {
    fryid: 16,
    avator: 16,
    flag: 0,
    name: "石斑鱼",
    level: 42,
    price_yb: 44,
    quantity: 5,
    interval: 7200,
    sell_price: 42
  },
  {
    fryid: 20,
    avator: 20,
    flag: 1,
    name: "小龙虾",
    level: 45,
    price_yb: 47,
    quantity: 5,
    interval: 7200,
    sell_price: 45
  },
  {
    fryid: 21,
    avator: 21,
    flag: 1,
    name: "凤尾鱼",
    level: 20,
    price_yb: 30,
    quantity: 5,
    interval: 7200,
    sell_price: 35
  },
  {
    fryid: 23,
    avator: 23,
    flag: 1,
    name: "大丽红尾鱼",
    level: 34,
    price_yb: 81,
    quantity: 5,
    interval: 14400,
    sell_price: 32
  },
  {
    fryid: 28,
    avator: 28,
    flag: 1,
    name: "玉顶狮子鱼",
    level: 20,
    price_yb: 30,
    quantity: 5,
    interval: 7200,
    sell_price: 40
  },
  {
    fryid: 32,
    avator: 32,
    flag: 0,
    name: "霸王鱼",
    level: 55,
    price_yb: 140,
    quantity: 5,
    interval: 7200,
    sell_price: 80
  }
];
const HOUR = 3600;
const FEED_PRICE = 10;
const MASTER = 1e3;
const INT_MAX = 2147483647;
function load$2() {
  const p = JSON.parse(save.saveJsonData.fishs || "{}");
  const fishs = (p.fishs ?? []).filter((f) => f.id);
  let next2 = Math.max(0, ...fishs.map((f) => f.id > INT_MAX ? 0 : f.id));
  for (const f of fishs) if (f.id > INT_MAX) f.id = ++next2;
  return { PD: p.PD ?? { allvipcnt: 0, canusecnt: 0 }, fishs };
}
const pond = load$2();
const store$3 = () => update("saveJsonData", { fishs: JSON.stringify(pond) });
const now = () => Math.floor(Date.now() / 1e3);
const ripe = (f) => f.stage >= 3;
const ERROR = { result: 6, msg: "使用错误~~" };
function grow$1(f, t) {
  if (ripe(f)) return;
  const age2 = t - f.born + HOUR * f.siLiao;
  const n = Math.min(Math.floor(age2 / f.interval), 2);
  f.stage = n + 1;
  f.time = n === 2 ? 0 : age2 - n * f.interval;
}
let last$1 = 0;
function settle$1() {
  const t = now();
  if (last$1 > t) {
    pond.fishs = [];
    pond.PD.canusecnt = 0;
  } else {
    last$1 = t;
    for (const f of pond.fishs) grow$1(f, t);
  }
  store$3();
}
function ripeFish() {
  const t = now();
  for (const f of pond.fishs) grow$1(f, t);
  return pond.fishs.filter(ripe).length;
}
function harvested(n) {
  const total = save.gameSaveDatas.fishing_harvestfish + n;
  if (total < MASTER) return update("gameSaveDatas", { fishing_harvestfish: total });
  update("gameSaveDatas", { fishing_harvestfish: total - MASTER, yyds: save.gameSaveDatas.yyds + 1 });
  windowView({ title: "逗逗我~~", msg: "养鱼大师成就达成~~", goods: [{ url: "pet/achievement/yyds.svg", name: "养鱼大师" }] });
}
function pondState() {
  settle$1();
  return { ...pond.PD, fishes: pond.fishs, harvestfish: save.gameSaveDatas.fishing_harvestfish, yb: info.qb || 0 };
}
function feed(id) {
  const f = pond.fishs.find((f2) => f2.id === id);
  if (!f) return ERROR;
  if (ripe(f)) return { result: 6, msg: "当前🐟儿已成熟~" };
  if ((info.qb || 0) < FEED_PRICE) return { result: 5, msg: "Q币不够啦~~" };
  setInfo("qb", (info.qb || 0) - FEED_PRICE);
  f.siLiao++;
  grow$1(f, now());
  store$3();
  return { result: 0 };
}
const shop = () => ({ fries: FRIES.map((f) => ({ ...f, price_yb: info.pinkDiamond ? f.price_yb / 0.8 : f.price_yb })), totalpage: 1 });
const pondCap = () => info.pinkDiamond ? 5 : 3;
function pondRoom() {
  settle$1();
  return pondCap() - pond.fishs.length;
}
function buy$1(paytype, fryid, n = 1) {
  if (paytype !== 1) return { result: 1 };
  const room = pondRoom();
  if (room <= 0) return { result: 5, msg: "已经满了" };
  const fry = FRIES.find((f) => f.fryid === fryid);
  if (!fry) return ERROR;
  n = Math.min(Math.max(n | 0, 1), room);
  const cost = fry.price_yb * n;
  if ((info.qb || 0) < cost) return { result: 1 };
  setInfo("qb", (info.qb || 0) - cost);
  const t = now();
  const base = Math.max(t, ...pond.fishs.map((f) => f.id + 1));
  for (let i = 0; i < n; i++) {
    pond.fishs.push({
      id: base + i,
      fryid,
      name: fry.name,
      stage: 1,
      time: 0,
      interval: fry.interval,
      costyb: fry.price_yb,
      YB: fry.sell_price,
      quantity: fry.quantity,
      basequantity: fry.quantity,
      avatar: fry.avator,
      AIXIN: 0,
      growth: 0,
      strong: 0,
      iq: 0,
      charm: 0,
      born: t,
      siLiao: 0
    });
  }
  store$3();
  return { result: 0 };
}
function harvest(id) {
  const i = pond.fishs.findIndex((f2) => f2.id === id);
  const f = pond.fishs[i];
  const yb = f && (ripe(f) ? f.YB * f.quantity : Math.floor(f.costyb / 2));
  if (!yb) return ERROR;
  pond.fishs.splice(i, 1);
  setInfo("qb", (info.qb || 0) + yb); speak$1({ s: `[host]，卖鱼赚了${yb}Q币，收好啦~`, now: true }, "speak");
  if (ripe(f)) harvested(1);
  store$3();
  return { result: 0, yb, msg: "收获成功!", growth: 0, strong: 0, charm: 0, iq: 0 };
}
function speedUp() {
  if (!pond.PD.canusecnt) return { result: 5, msg: "使用失败，当前没有次数~" };
  if (!pond.fishs.length) return { result: 5, msg: "使用失败，当前没有🐟~" };
  const t = now();
  for (const f of pond.fishs) {
    f.siLiao++;
    grow$1(f, t);
  }
  pond.PD.canusecnt--;
  store$3();
  return { result: 0 };
}
function harvestAll() {
  if (!pond.fishs.length) return { result: 5, msg: "收获失败，当前没有🐟~" };
  const sold = pond.fishs.filter(ripe);
  const yb = sold.reduce((s2, f) => s2 + f.YB * f.quantity, 0);
  if (!yb) return { result: 5, msg: "收获失败，当前没有成熟的🐟~" };
  pond.fishs = pond.fishs.filter((f) => !ripe(f));
  setInfo("qb", (info.qb || 0) + yb); speak$1({ s: `[host]，卖鱼赚了${yb}Q币，收好啦~`, now: true }, "speak");
  harvested(sold.length);
  store$3();
  return { result: 6, msg: "收获成功!" };
}
const COMMANDS = {
  1: pondState,
  2: (d) => ({ id: d.id, ...feed(d.id) }),
  3: shop,
  4: (d) => buy$1(d.paytype, d.fryid, d.num),
  5: (d) => ({ id: d.id, ...harvest(d.id) }),
  7: speedUp,
  8: harvestAll
};
function pondCommand(cmd, data) {
  return COMMANDS[cmd]?.(data) ?? { result: 5, msg: `未知指令~ cmd:${cmd}  data:${JSON.stringify(data)}` };
}
function resetFish() {
  pond.PD.allvipcnt = (info.PDiamondLevel || 1) * 2;
  pond.PD.canusecnt = info.pinkDiamond ? pond.PD.allvipcnt : 0;
  store$3();
}
function readSol(key) {
  const raw = localStorage.getItem(key);
  return raw === null ? null : decode(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)));
}
function writeSol(key, name2, data) {
  localStorage.setItem(key, btoa(String.fromCharCode(...encode(name2, data))));
}
function decode(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = new TextDecoder();
  let p = 16;
  p += 2 + view.getUint16(p) + 4;
  const strings = [];
  const objects = [];
  const traits = [];
  const u29 = () => {
    let n = 0;
    for (let i = 0; i < 3; i++) {
      const b = bytes[p++];
      n = n << 7 | b & 127;
      if (!(b & 128)) return n;
    }
    return n << 8 | bytes[p++];
  };
  const string = () => {
    const h2 = u29();
    if (!(h2 & 1)) return strings[h2 >> 1];
    const s2 = text.decode(bytes.subarray(p, p += h2 >> 1));
    if (s2) strings.push(s2);
    return s2;
  };
  const value = () => {
    switch (bytes[p++]) {
      case 0:
        return void 0;
      case 1:
        return null;
      case 2:
        return false;
      case 3:
        return true;
      case 4: {
        const n = u29();
        return n & 268435456 ? n - 536870912 : n;
      }
      case 5: {
        p += 8;
        return view.getFloat64(p - 8);
      }
      case 6:
        return string();
      case 9: {
        const h2 = u29();
        if (!(h2 & 1)) return objects[h2 >> 1];
        const a = [];
        objects.push(a);
        while (string() !== "") value();
        for (let i = 0; i < h2 >> 1; i++) a.push(value());
        return a;
      }
      case 10: {
        const h2 = u29();
        if (!(h2 & 1)) return objects[h2 >> 1];
        let t = traits[h2 >> 2];
        if (h2 & 2) {
          string();
          t = { dynamic: Boolean(h2 & 8), keys: Array.from({ length: h2 >> 4 }, string) };
          traits.push(t);
        }
        const o = {};
        objects.push(o);
        for (const k of t.keys) o[k] = value();
        if (t.dynamic) for (let k = string(); k !== ""; k = string()) o[k] = value();
        return o;
      }
      default:
        throw new Error(`AMF3 marker ${bytes[p - 1]} at ${p - 1}`);
    }
  };
  const data = {};
  while (p < bytes.length) {
    const k = string();
    data[k] = value();
    p++;
  }
  return data;
}
function encode(name2, data) {
  const out2 = [];
  const u29 = (n2) => {
    if (n2 < 128) out2.push(n2);
    else if (n2 < 16384) out2.push(n2 >> 7 | 128, n2 & 127);
    else if (n2 < 2097152) out2.push(n2 >> 14 | 128, n2 >> 7 & 127 | 128, n2 & 127);
    else out2.push(n2 >> 22 | 128, n2 >> 15 & 127 | 128, n2 >> 8 & 127 | 128, n2 & 255);
  };
  const string = (s2) => {
    const b = new TextEncoder().encode(s2);
    u29(b.length << 1 | 1);
    out2.push(...b);
  };
  const value = (v) => {
    if (v === void 0) out2.push(0);
    else if (v === null) out2.push(1);
    else if (typeof v === "boolean") out2.push(v ? 3 : 2);
    else if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 268435456) {
      out2.push(4);
      u29(v);
    } else if (typeof v === "number") {
      const b = new DataView(new ArrayBuffer(8));
      b.setFloat64(0, v);
      out2.push(5, ...new Uint8Array(b.buffer));
    } else if (typeof v === "string") {
      out2.push(6);
      string(v);
    } else if (Array.isArray(v)) {
      out2.push(9);
      u29(v.length << 1 | 1);
      out2.push(1);
      v.forEach(value);
    } else {
      out2.push(10, 11, 1);
      for (const [k, e] of Object.entries(v)) {
        string(k);
        value(e);
      }
      out2.push(1);
    }
  };
  const n = new TextEncoder().encode(name2);
  const body = [84, 67, 83, 79, 0, 4, 0, 0, 0, 0, n.length >> 8, n.length & 255, ...n, 0, 0, 0, 3];
  for (const [k, v] of Object.entries(data)) {
    string(k);
    value(v);
    out2.push(0);
  }
  const len = body.length + out2.length;
  return [0, 191, len >>> 24, len >> 16 & 255, len >> 8 & 255, len & 255, ...body, ...out2];
}
const KEY = `${location.hostname}//test`;
const MIGRATED = "farm:migrated";
const PEST_TIME = 14400;
if (localStorage.getItem(MIGRATED) === null) {
  const legacy = readSol(KEY)?.user;
  if (legacy && !save.saveJsonData.farm) update("saveJsonData", { farm: JSON.stringify(legacy) });
  localStorage.setItem(MIGRATED, "1");
}
let open$c = false;
function fresh() {
  return {
    house: "house",
    kennel: "kennel",
    fence: "fence",
    experience: "1",
    rank: "01",
    burden: [],
    warehouse: [],
    farmland: Array.from({ length: 18 }, (_, i) => ({ farmland: i < 6 ? "FarmlandS" : "Wasteland" })),
    weather: "Sunny"
  };
}
function openFarm() {
  if (open$c) return;
  open$c = true;
  const stored = save.saveJsonData.farm;
  const user = { ...stored ? JSON.parse(stored) : fresh(), username: info.name, wealth: String(info.qb || 0) };
  writeSol(KEY, "test", { user });
  let last2 = info.qb || 0;
  let raw = localStorage.getItem(KEY);
  const settle2 = () => {
    if (localStorage.getItem(KEY) === raw) return;
    raw = localStorage.getItem(KEY);
    const user2 = readSol(KEY).user;
    const w2 = Number(user2.wealth);
    const d = w2 - last2;
    setInfo("qb", Math.max(0, (info.qb || 0) + (d > 0 ? scaleYb(d) : d)));
    last2 = w2;
    update("saveJsonData", { farm: JSON.stringify(user2) });
  };
  const timer2 = setInterval(settle2, 500);
  const flushFarm = () => {
    settle2();
    const user2 = readSol(KEY).user;
    update("saveJsonData", { farm: JSON.stringify({ ...user2, checked: Math.floor(Date.now() / 1e3) }) });
  };
  const stopFlush = onSaveFlush(flushFarm);
  const host2 = div("farm", div("avatar", img("penguin_breathe", avatar())));
  const player2 = new SwfPlayer(host2);
  const all = (action) => async () => void (await player2.callback("farmAll"))(action);
  const actions2 = div(
    "actions",
    button("fcc wsnw act", all("harvest"), "一键收获"),
    button("fcc wsnw act", all("care"), "一键照料"),
    button("fcc wsnw act", all("clear"), "一键铲除"),
    button("fcc wsnw act", all("plant"), "一键播种"),
    button("fcc wsnw act", async () => void (await player2.callback("farmView"))(), "全景/原尺寸")
  );
  window.qqpet.setFocusable(true);
  openBox(div("ui-farm", host2, actions2), {
    onClose: () => {
      clearInterval(timer2);
      flushFarm();
      stopFlush();
      window.qqpet.setFocusable(false);
      open$c = false;
    }
  });
  void player2.load("pet/qqfarm/Farm.swf", "pet/qqfarm/");
}
let ripening;
async function ripeTimes() {
  const xml = await (await fetch("pet/qqfarm/com/MyFarm/data/xml/Crop.xml")).text();
  const items2 = new DOMParser().parseFromString(xml, "text/xml").querySelectorAll("items");
  return Object.fromEntries([...items2].map((e) => [e.getAttribute("seed"), Number(e.getAttribute("time"))]));
}
async function farmNews() {
  ripening ??= ripeTimes();
  const times = await ripening;
  const stored = save.saveJsonData.farm;
  if (open$c || !stored) return null;
  const user = JSON.parse(stored);
  const now2 = Math.floor(Date.now() / 1e3);
  const chance = 1 - Math.exp(-(now2 - Number(user.checked ?? now2)) / PEST_TIME);
  const roll2 = () => Math.random() < chance;
  let ripe2 = 0;
  let pests = 0;
  for (const land2 of user.farmland) {
    if (!land2.crop || land2.harvest !== void 0) continue;
    if (now2 - Number(land2.time) >= times[land2.crop]) {
      ripe2++;
      continue;
    }
    if (land2.grass === void 0 && roll2()) land2.grass = 1;
    if (land2.worm === void 0 && roll2()) land2.worm = 1;
    if (land2.farmland === "FarmlandS" && roll2()) land2.farmland = "FarmlandG";
    if (land2.grass !== void 0 || land2.worm !== void 0 || land2.farmland === "FarmlandG") pests++;
  }
  user.checked = now2;
  update("saveJsonData", { farm: JSON.stringify(user) });
  return { ripe: ripe2, pests };
}
function readRect(b, p) {
  let bit = p * 8;
  const u = (k) => {
    let x = 0;
    for (let i = 0; i < k; i++, bit++) x = x << 1 | b[bit >> 3] >> 7 - (bit & 7) & 1;
    return x;
  };
  const n = u(5);
  const v = [0, 0, 0, 0].map(() => {
    const x = u(n);
    return n && x >> n - 1 ? x - 2 ** n : x;
  });
  return { n, v, end: Math.ceil(bit / 8) };
}
function writeRect(b, p, n, v) {
  let bit = p * 8 + 5;
  for (const x of v)
    for (let i = n - 1; i >= 0; i--, bit++) {
      const m = 1 << 7 - (bit & 7);
      if ((x >> i & 1) !== 0) b[bit >> 3] |= m;
      else b[bit >> 3] &= ~m;
    }
}
async function inflate(swf) {
  const sig = String.fromCharCode(swf[0], swf[1], swf[2]);
  if (sig === "FWS") return swf;
  if (sig !== "CWS") return null;
  const body = await new Response(new Blob([swf.slice(8)]).stream().pipeThrough(new DecompressionStream("deflate"))).arrayBuffer();
  const out2 = new Uint8Array(8 + body.byteLength);
  out2.set(swf.subarray(0, 8));
  out2.set(new Uint8Array(body), 8);
  out2[0] = 70;
  new DataView(out2.buffer).setUint32(4, out2.length, true);
  return out2;
}
async function fixTextFields(swf, fixes) {
  const b = await inflate(swf).catch(() => null);
  if (!b) return swf;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = readRect(b, 8).end + 4;
  let hit = false;
  while (p + 2 <= b.length) {
    const h2 = dv.getUint16(p, true);
    const code = h2 >> 6;
    let len = h2 & 63;
    p += 2;
    if (len === 63) {
      len = dv.getUint32(p, true);
      p += 4;
    }
    if (code === 0) break;
    if (code === 37) {
      const r = readRect(b, p + 2);
      const flags = r.end;
      const end = p + len;
      const text = new TextDecoder().decode(b.subarray(flags, end));
      const fix = fixes.find((f) => text.includes(f.text));
      const max = 2 ** (r.n - 1);
      if (fix && r.v[0] - fix.grow >= -max && r.v[1] + fix.grow < max) {
        writeRect(b, p + 2, r.n, [r.v[0] - fix.grow, r.v[1] + fix.grow, r.v[2], r.v[3]]);
        b[flags] &= -65;
        hit = true;
      }
    }
    p += len;
  }
  return hit ? b : swf;
}
function patchSwfFetch(url, fixes) {
  const prev = window.fetch;
  const hook = async (input, init) => {
    const href = String(input instanceof Request ? input.url : input);
    const res = await prev(input, init);
    if (!href.includes(url) || !res.ok) return res;
    const swf = await fixTextFields(new Uint8Array(await res.arrayBuffer()), fixes);
    return new Response(swf.slice(), { status: 200, headers: { "Content-Type": "application/x-shockwave-flash" } });
  };
  window.fetch = hook;
  return () => {
    if (window.fetch === hook) window.fetch = prev;
  };
}
const HEAD$1 = { game: 6, key: "", svr: 0, ver: 1 };
const HARVEST_ALL = "暂不支持一键收获！";
let open$b = false;
function grade() {
  const l = save.petComputedlInfo.level;
  return `1${l < 5 ? 1 : l < 8 ? 2 : 0}${info.sex === "GG" ? 2 : 3}`;
}
patchSwfFetch("pet/fishing/main.swf", [{ text: ">lv99<", grow: 240 }]);
function openFishing() {
  if (open$b) return;
  open$b = true;
  const host2 = div("fishing");
  const cooldown = Object.assign(div("controlTF"), { title: "投放冷却中" });
  const player2 = new SwfPlayer(host2);
  const remove = openFrame(div("ui-fishing", div("fishing", host2, cooldown)));
  const receive = player2.callback("PETEventOnReceived");
  const send2 = async (cmd, data) => void (await receive)(JSON.stringify({ data, head: { ...HEAD$1, cmd } }));
  const alert = window.alert;
  const confirm = window.confirm;
  const beforePay = window.before_pay;
  window.before_pay = () => true;
  window.confirm = () => true;
  window.PETSendData = (json) => {
    const { head, data } = JSON.parse(json);
    if (head.cmd === 4) {
      const room = pondRoom();
      const fry = FRIES.find((f) => f.fryid === data.fryid);
      if (!fry || room <= 0) {
        void send2(4, pondCommand(4, data));
        return;
      }
      windowView({
        title: "投放鱼苗",
        msg: `投放${fry.name}，空位 ${room}，每条 ${fry.price_yb} Q币`,
        max: room,
        init: 1,
        ok: (close2, num) => {
          const reply22 = pondCommand(4, { ...data, num });
          void send2(4, reply22);
          if (reply22.result === 0) {
            cooldown.classList.add("controlTFActive");
            setTimeout(() => cooldown.classList.remove("controlTFActive"), 1e3);
            setTimeout(() => void send2(1, pondState()), 100);
          }
          close2();
        },
        cancel: () => void send2(4, { result: 5, msg: "取消了" })
      });
      return;
    }
    const reply2 = pondCommand(head.cmd, data);
    void send2(head.cmd, reply2);
    if (head.cmd === 8 && reply2.result === 6) setTimeout(() => void send2(1, pondState()), 100);
  };
  window.SNS_GetSelfPetInfo = () => ({
    petid: "1",
    qqnumber: "66666666",
    petName: info.name,
    masterName: info.host,
    level: save.petComputedlInfo.level,
    isvip: info.pinkDiamond ? 1 : 0,
    grade: grade(),
    gender: grade(),
    staus: 1,
    starve: info.hunger,
    starveMax: save.petComputedlInfo.hungerMax,
    clean: info.clean,
    cleanMax: save.petComputedlInfo.cleanMax,
    qqsign: "",
    viplevel: info.PDiamondLevel,
    isvipyear: info.PDiamondYear ? 1 : 0
  });
  window.alert = (msg) => {
    if (msg === HARVEST_ALL) window.PETSendData(JSON.stringify({ data: {}, head: { ...HEAD$1, cmd: 8 } }));
  };
  window.close_game = (n) => {
    if (n !== 1) return;
    setTimeout(() => {
      if (!host2.isConnected) return;
      remove();
      window.alert = alert;
      window.confirm = confirm;
      window.before_pay = beforePay;
      open$b = false;
    });
  };
  void player2.load("pet/fishing/main.swf");
  void send2(1, pondState());
}
const QUIET$1 = 30 * 6e4;
let told = { ripe: 0, pests: 0, fish: 0 };
let last = -QUIET$1;
async function harvestNews() {
  const seen = { ...await farmNews() ?? told, fish: ripeFish() };
  const news = seen.ripe > told.ripe || seen.pests > told.pests || seen.fish > told.fish;
  if (news && Date.now() - last < QUIET$1) return null;
  told = seen;
  if (!news) return null;
  last = Date.now();
  const parts = [
    seen.ripe && `农场有${seen.ripe}块地的庄稼熟了`,
    seen.pests && `农场里${seen.pests}块地长草、生虫或者干旱了，再不管要减产啦`,
    seen.fish && `鱼塘里有${seen.fish}条鱼可以收了`
  ].filter(Boolean);
  return { s: `[host]，${parts.join("，")}~`, ok: seen.ripe || seen.pests ? openFarm : openFishing };
}
const POOLS = /* @__PURE__ */ JSON.parse('[["_100010032","_100010044","_100010066","_100010069","_100010070","_100010071","_100010106","_100010108","_100010118","_100010119","_100010128","_100010141","_100010142","_100010143","_100010145","_100010159","_100010172","_100010197","_100010227","_100010241","_100010297","_100010298","_100010318","_100010351","_100010354","_100010355","_100010356","_100010357","_100010363","_100010364","_100010365","_100010383","_100010384","_100010393","_100010394","_100010402","_100010407","_100010408","_100010411","_100010414","_100010419","_100010426","_100010427","_100010432","_100010444","_100010461","_100010465","_100010473","_100010474","_100010475","_100010476","_100010477","_100010485","_100010486","_100010489","_100010490","_100010491","_100010494","_100010497","_100010498","_100010499","_102010060","_102010074","_102010075","_102010076","_102010077","_102010078","_100020032","_100020033","_100020036","_100020051","_100020052","_100020053","_100020059","_100020062","_100020069","_100020070","_100020079","_100020081","_100020082","_100020091","_100020097","_100020099","_100020100","_100020101","_100020102","_100020124","_100020125","_100020160","_100020161","_100020162","_100020163","_100020182","_100020183","_100020184","_100020188","_100020189","_100020190","_100020193","_100020194","_100020195","_100020196","_100020197","_100020198","_100020205","_100020209","_100020217","_100020218","_100020228","_100020230","_100020231","_100020236","_100020237","_100020238","_100020239","_100020240","_10021002","_10021015","_10021017","_10021020","_10021021","_102020052","_102020053","_102020054","_102020055","_60001","_b0000011","_b0000012","_b0000013","_b0000014","_b0000015","_b0000016","_t0005","_t0006","_t0007","_t0008","_yb","_ybCut","_growth","_growthCut","_health"],["_100010031","_100010033","_100010034","_100010035","_100010037","_100010038","_100010039","_100010040","_100010041","_100010042","_100010043","_100010045","_100010046","_100010047","_100010048","_100010049","_100010050","_100010051","_100010052","_100010057","_100010058","_100010059","_100010060","_100010061","_100010062","_100010063","_100010064","_100010065","_100010098","_100010099","_100010100","_100010101","_100010103","_100010104","_100010109","_100010110","_100010114","_100010115","_100010116","_100010117","_100010120","_100010121","_100010122","_100010124","_100010125","_100010126","_100010127","_100010129","_100010130","_100010131","_100010137","_100010138","_100010139","_100010140","_100010144","_100010149","_100010151","_100010152","_100010153","_100010154","_100010155","_100010156","_100010157","_100010158","_100010160","_100010161","_100010162","_100010163","_100010164","_100010168","_100010169","_100010170","_100010171","_100010173","_100010174","_100010175","_100010176","_100010177","_100010178","_100010179","_100010180","_100010181","_100010182","_100010183","_100010184","_100010185","_100010186","_100010187","_100010188","_100010189","_100010190","_100010191","_100010192","_100010193","_100010194","_100010195","_100010196","_100010198","_100010199","_100010200","_100010201","_100010202","_100010203","_100010204","_100010205","_100010206","_100010207","_100010208","_100010209","_100010210","_100010211","_100010212","_100010213","_100010214","_100010215","_100010216","_100010217","_100010218","_100010219","_100010220","_100010221","_100010226","_100010228","_100010229","_100010230","_100010231","_100010232","_100010233","_100010234","_100010236","_100010237","_100010238","_100010239","_100010240","_100010242","_100010243","_100010244","_100010245","_100010246","_100010247","_100010248","_100010249","_100010250","_100010251","_100010252","_100010253","_100010254","_100010255","_100010256","_100010257","_100010258","_100010259","_100010260","_100010261","_100010262","_100010263","_100010264","_100010265","_100010266","_100010267","_100010268","_100010269","_100010270","_100010271","_100010272","_100010273","_100010274","_100010275","_100010276","_100010277","_100010278","_100010279","_100010280","_100010281","_100010282","_100010283","_100010285","_100010286","_100010287","_100010288","_100010289","_100010290","_100010291","_100010292","_100010293","_100010294","_100010295","_100010296","_100010299","_10001030","_100010300","_100010301","_100010302","_100010303","_100010304","_100010305","_100010306","_100010307","_100010308","_100010309","_100010310","_100010311","_100010312","_100010313","_100010314","_100010315","_100010319","_100010320","_100010321","_100010322","_100010323","_100010324","_100010325","_100010326","_100010327","_100010328","_100010329","_100010330","_100010331","_100010332","_100010333","_100010334","_100010335","_100010336","_100010337","_100010338","_100010339","_100010340","_100010341","_100010342","_100010343","_100010344","_100010345","_100010346","_100010347","_100010348","_100010349","_100010350","_100010352","_100010353","_100010358","_100010359","_100010360","_100010361","_100010362","_100010366","_100010367","_100010368","_100010369","_100010370","_100010371","_100010372","_100010373","_100010374","_100010375","_100010376","_100010377","_100010378","_100010379","_100010380","_100010381","_100010382","_100010385","_100010386","_100010387","_100010388","_100010389","_100010390","_100010391","_100010395","_100010396","_100010397","_100010398","_100010399","_100010400","_100010401","_100010403","_100010404","_100010405","_100010406","_100010409","_100010410","_100010412","_100010413","_100010415","_100010416","_100010417","_100010418","_100010420","_100010421","_100010423","_100010424","_100010425","_100010428","_100010429","_100010430","_100010431","_100010433","_100010434","_100010435","_100010436","_100010437","_100010438","_100010440","_100010441","_100010442","_100010443","_100010445","_100010446","_100010447","_100010448","_100010449","_100010450","_100010451","_100010454","_100010455","_100010456","_100010457","_100010458","_100010459","_100010460","_100010462","_100010463","_100010466","_100010467","_100010468","_100010469","_100010470","_100010471","_100010472","_100010478","_100010479","_100010480","_100010481","_100010482","_100010483","_100010484","_100010487","_100010488","_100010492","_100010493","_100010495","_100010496","_10012001","_10013009","_10013010","_10013011","_10013012","_10013013","_10013025","_10013026","_10013027","_10013028","_10013029","_102010005","_102010006","_102010008","_102010011","_102010013","_102010023","_102010024","_102010025","_102010027","_102010028","_102010029","_102010030","_102010031","_102010032","_102010033","_102010034","_102010036","_102010037","_102010038","_102010058","_102010059","_102010062","_102010063","_102010064","_102010065","_102010066","_102010067","_102010068","_102010069","_102010070","_102010071","_102010072","_102010073","_102010082","_102010083","_102010084","_102010086","_102010087","_102010088","_102010089","_102010091","_102010092","_102010094","_102010095","_1021100001","_10211022","_10211023","_10211024","_10212018","_10212019","_10212020","_10212021","_100020037","_100020038","_100020039","_100020040","_100020046","_100020060","_100020061","_100020064","_100020065","_100020066","_100020067","_100020068","_100020071","_100020072","_100020073","_100020074","_100020075","_100020076","_100020077","_100020078","_100020080","_100020084","_100020085","_100020086","_100020087","_100020088","_100020089","_100020090","_100020092","_100020093","_100020094","_100020095","_100020096","_100020098","_100020104","_100020105","_100020106","_100020107","_100020108","_100020109","_100020110","_100020111","_100020112","_100020113","_100020114","_100020115","_100020116","_100020117","_100020118","_100020119","_100020120","_100020121","_100020122","_100020123","_100020126","_100020127","_100020128","_100020129","_100020130","_100020131","_100020132","_100020133","_100020134","_100020135","_100020136","_100020137","_100020138","_100020139","_100020140","_100020141","_100020142","_100020143","_100020144","_100020145","_100020146","_100020147","_100020148","_100020149","_100020150","_100020151","_100020152","_100020153","_100020154","_100020155","_100020156","_100020157","_100020158","_100020159","_100020164","_100020165","_100020166","_100020167","_100020168","_100020169","_100020170","_100020171","_100020172","_100020173","_100020174","_100020175","_100020176","_100020177","_100020178","_100020179","_100020180","_100020181","_100020185","_100020186","_100020187","_100020191","_100020192","_100020199","_100020200","_100020201","_100020202","_100020204","_100020206","_100020207","_100020208","_100020210","_100020211","_100020212","_100020213","_100020214","_100020215","_100020216","_100020219","_100020220","_100020221","_100020222","_100020223","_100020224","_100020225","_100020226","_100020227","_100020229","_100020232","_100020233","_100020234","_100020235","_10002031","_10021010","_10021014","_10021018","_10021026","_10021027","_10021028","_10021029","_102020009","_102020014","_102020016","_102020020","_102020022","_102020027","_102020030","_102020033","_102020038","_102020039","_102020040","_102020041","_102020042","_102020047","_102020048","_102020049","_102020050","_102020051","_1021200001","_1021200002","_10001","_10002","_10003","_10004","_10005","_20001","_20002","_20003","_20004","_20005","_30001","_30002","_30003","_30004","_30005","_40001","_40002","_40003","_40004","_40005","_50001","_b0000000","_b0000001","_b0000002","_b0000003","_b0000004","_b0000005","_b0000006","_b0000007","_b0000008","_b0000009","_b0000010","_t0001","_t0002","_t0003","_t0004","_yb","_ybCut","_growth","_growthCut","_health"],["_100010036","_100010053","_100010054","_100010055","_100010056","_100010067","_100010102","_100010105","_100010107","_100010111","_100010112","_100010113","_100010123","_100010132","_100010133","_100010134","_100010135","_100010136","_100010146","_100010147","_100010148","_100010150","_100010165","_100010166","_100010167","_100010422","_10011014","_10011015","_10011016","_10012002","_10013003","_10013004","_10013005","_10013006","_10013007","_10013008","_102010001","_102010002","_102010003","_102010004","_102010007","_102010009","_102010010","_102010012","_102010014","_102010015","_102010016","_102010017","_102010019","_102010020","_102010021","_102010022","_102010026","_102010035","_102010039","_102010040","_102010041","_102010042","_102010043","_102010044","_102010045","_102010046","_102010047","_102010048","_102010049","_102010050","_102010051","_102010052","_102010053","_102010054","_102010055","_102010056","_102010057","_102010061","_102010085","_102010090","_1021100002","_10211017","_103010088","_100020034","_100020035","_100020041","_100020042","_100020043","_100020044","_100020045","_100020047","_100020048","_100020049","_100020050","_100020058","_100020063","_100020083","_100020103","_10021001","_10021003","_10021004","_10021005","_10021006","_10021007","_10021008","_10021009","_10021011","_10021012","_10021013","_10021016","_10021019","_10021022","_10021023","_10021024","_10021025","_10021030","_102020001","_102020002","_102020003","_102020005","_102020006","_102020007","_102020008","_102020010","_102020011","_102020012","_102020013","_102020015","_102020017","_102020018","_102020019","_102020021","_102020023","_102020024","_102020025","_102020026","_102020028","_102020029","_102020031","_102020032","_102020034","_102020035","_102020036","_102020037","_yb","_ybCut","_growth","_growthCut","_health"]]');
const WEIGHTS = [0.02, 0.25, 0.75];
function draw$1(pool) {
  if (pool === null) {
    let r = Math.random();
    pool = WEIGHTS.findIndex((w2) => (r -= w2) <= 0);
  }
  const list2 = POOLS[pool];
  return list2[Math.floor(Math.random() * list2.length)];
}
function loot(n, pool = null) {
  return Array.from({ length: n }, () => parseGood(draw$1(pool)));
}
const DAY$1 = 86400;
const LEVELS$1 = [0, 100, 300, 800, 1200, 2800, 5800, 99999999];
function dayStart(now2 = Date.now() / 1e3) {
  const d = new Date(now2 * 1e3);
  d.setHours(6, 0, 0, 0);
  if (d.getTime() > now2 * 1e3) d.setDate(d.getDate() - 1);
  return d.getTime() / 1e3;
}
function settle(today2) {
  const active = info.PDiamondExpirationDate > today2;
  setInfo("pinkDiamond", active);
  if (!active) {
    setInfo("PDiamondBeginDate", 0);
    setInfo("PDiamondExpirationDate", 0);
    setInfo("PDiamondYear", false);
  }
  const level = Math.max(LEVELS$1.filter((g) => info.PDgrowth >= g).length, 1);
  setInfo("PDiamondLevel", level);
  setInfo("PDgrowthValue_next", LEVELS$1[level]);
}
function clearPinkDiamond() {
  setInfo("PDiamondExpirationDate", 0);
  setInfo("PDiamondBeginDate", 0);
  settle(dayStart());
}
function openPinkDiamond(days2) {
  const today2 = dayStart();
  const extend = info.pinkDiamond;
  if (extend) {
    setInfo("PDiamondExpirationDate", info.PDiamondExpirationDate + days2 * DAY$1);
  } else {
    setInfo("PDiamondExpirationDate", today2 + days2 * DAY$1);
    setInfo("PDiamondBeginDate", today2);
  }
  if (days2 >= 365) setInfo("PDiamondYear", true);
  setInfo("PDgrowthValue", 20);
  settle(today2);
  if (!extend) resetFish();
}
function addSweetHeart(days2) {
  setInfo("sweetHeartOverTime", (info.sweetHeartOverTime || dayStart()) + days2 * DAY$1);
  setInfo("sweetHeart", true);
}
function newDay(today2) {
  if (info.pinkDiamond) {
    setInfo("PDgrowth", info.PDgrowth + info.PDgrowthValue * (Math.min(today2, info.PDiamondExpirationDate) - info.PDiamondBeginDate) / DAY$1);
    setInfo("PDiamondBeginDate", today2);
    settle(today2);
  }
  if (info.sweetHeartOverTime <= today2) {
    setInfo("sweetHeartOverTime", 0);
    setInfo("sweetHeart", false);
  }
}
const GIFT_MINUTES = 20;
const BIRTHDAY_FOODS = "100010496 100010497 10011014 100010033 100010100 100010106 100010109 100010110 100010123 100010197 100010241 100010298 100010305 100010337 100010338 100010461 100010489 100010491 100010494".split(
  " "
);
function load$1() {
  const s2 = JSON.parse(save.saveJsonData.signin || "{}");
  return {
    collectionList: s2.collectionList ?? {},
    getGrowth: s2.getGrowth ?? null,
    onlineGiftNum: s2.onlineGiftNum ?? 0,
    isOnlineLastTime: s2.isOnlineLastTime ?? GIFT_MINUTES,
    getBirthDayGift: s2.getBirthDayGift ?? true
  };
}
const signin = load$1();
const store$2 = () => update("saveJsonData", { signin: JSON.stringify(signin) });
const monthSigns = (y, m) => signin.collectionList[y]?.[m] ?? [];
function signedToday() {
  const today2 = dayStart();
  const d = new Date(today2 * 1e3);
  return monthSigns(d.getFullYear(), d.getMonth() + 1).includes(today2);
}
function signToday() {
  const today2 = dayStart();
  const d = new Date(today2 * 1e3);
  const year = signin.collectionList[d.getFullYear()] ??= {};
  (year[d.getMonth() + 1] ??= []).push(today2);
  store$2();
  const goods = loot(1).map((g) => g.type === "nums" ? { ...g, num: 20 } : g);
  give(goods, "今日签到成功哦！~");
  return goods;
}
const canDrawGrowth = () => !signin.getGrowth || info.pinkDiamond && !signin.getGrowth[1];
function drawGrowth() {
  let e0 = rand(0, 5);
  e0 = rand(0, e0);
  e0 = rand(0, e0);
  const digits2 = [e0, rand(0, rand(0, 9)), rand(0, 9)];
  const value = +digits2.join("");
  if (!value) return { digits: digits2, goods: [] };
  if (signin.getGrowth) signin.getGrowth[1] = digits2;
  else signin.getGrowth = [digits2, null];
  store$2();
  const goods = [parseGood(`_growth*${value}`)];
  give(goods, "[host],抽取成长值成功哦~~");
  return { digits: digits2, goods };
}
const giftCost = () => signin.onlineGiftNum * 100;
function takeOnlineGift() {
  const tier = rand(0, info.pinkDiamond ? 1e3 : 1e4) < 2 ? 0 : signin.onlineGiftNum % 10 === 0 ? 1 : 2;
  const goods = loot(info.pinkDiamond ? 2 : 1, tier);
  signin.onlineGiftNum++;
  signin.isOnlineLastTime = GIFT_MINUTES;
  store$2();
  give(goods, "[host],成功领取在线时长奖励哦~~");
  return goods;
}
function tickGift(minutes) {
  if (!signin.isOnlineLastTime) return;
  signin.isOnlineLastTime = Math.max(signin.isOnlineLastTime - minutes, 0);
  store$2();
}
function birthdayGift() {
  if (signin.getBirthDayGift) return [];
  signin.getBirthDayGift = true;
  store$2();
  if ((/* @__PURE__ */ new Date()).getDate() !== new Date(info.birthDay * 1e3).getDate()) return [];
  const g = goodOf("food", BIRTHDAY_FOODS[rand(0, BIRTHDAY_FOODS.length - 1)]);
  give([g], `我领取了我的生日礼物哦，是${g.name}`);
  return [g];
}
function resetSignIn() {
  signin.getGrowth = null;
  if (info.onLineTime > 10) signin.getBirthDayGift = false;
  signin.isOnlineLastTime = GIFT_MINUTES;
  signin.onlineGiftNum = 0;
  store$2();
}
const TABS$1 = { daily: "今日任务", ddw: "逗逗我", growth: "学习打工", travel: "旅游任务" };
const DDW = "点击逗乐点位";
const TASKS = {
  ddw: [
    { label: "逗逗我~~", msg: DDW, obj: "Amusing", num: 5, good: ["_102010001*1"] },
    { label: "逗逗我2~~", msg: DDW, obj: "Amusing", num: 10, good: ["_10012002*1"] },
    { label: "逗逗我3~~", msg: DDW, obj: "Amusing", num: 15, good: ["_10013004*1"] },
    { label: "逗逗我4~~", msg: DDW, obj: "Amusing", num: 20, reroll: 1 },
    { label: "逗逗我5~~", msg: DDW, obj: "Amusing", num: 25, reroll: 2 }
  ],
  growth: [
    { label: "好好学习~~", msg: "去上一节课吧~", obj: "Study", num: 1, good: ["_102010001*1"] },
    { label: "勤学苦读~~", msg: "今天上3节课，学霸就是你~", obj: "Study", num: 3, reroll: 1 },
    { label: "勤劳致富~~", msg: "去打一次工吧~", obj: "Work", num: 1, good: ["_yb*50"] },
    { label: "打工达人~~", msg: "今天打工3次，元宝多多~", obj: "Work", num: 3, reroll: 1 }
  ],
  travel: [
    { label: "每日1游~~", msg: "去旅游一次吧~", obj: "Travel1", num: 1, good: ["_102010001*1"] },
    { label: "每日5游~~", msg: "见多识广哦~", obj: "Travel1", num: 5, reroll: 2 },
    {
      label: "去5个不同的城市~~",
      msg: "初行记​​ 烟霞初逢，人间烟火的温度，是你与世界交换的第一张明信片，游览5座不同的城市",
      obj: "Travel2",
      num: 5,
      keep: true,
      good: ["_100010490*1"]
    },
    {
      label: "去10个不同的城市~~",
      msg: "漫游帖 山河漫笔，江南的桥，塞北的雪，像散落的诗笺，都是岁月等你签收的小确幸，游览10座不同的城市",
      obj: "Travel2",
      num: 10,
      keep: true,
      good: ["_100010127*1"]
    },
    {
      label: "去15个不同的城市~~",
      msg: "寻踪录​ 故迹寻光，有些故事藏在门环后，有些传说埋在树影里，游览15座不同的城市",
      obj: "Travel2",
      num: 15,
      keep: true,
      good: ["_100010239*1", "_100010497*1"]
    },
    {
      label: "去20个不同的城市~~",
      msg: "探微志​ 风物志异，从茶碗的釉色看一方水土，从方言的尾音听千年变迁，游览20座不同的城市",
      obj: "Travel2",
      num: 20,
      keep: true,
      good: ["_100010417*1", "_100010499*1", "_100020155*1"]
    },
    {
      label: "去25个不同的城市~~",
      msg: "越障行 云程越嶂，那些被汗水浸透的脚印，终会连成独属于你的地图，游览25座不同的城市",
      obj: "Travel2",
      num: 25,
      keep: true,
      good: ["_yb*1024", "_100020195*1", "_100020198*1", "_100020217*1"]
    },
    {
      label: "去30个不同的城市~~",
      msg: "奇旅帖​ 星野奇遇，旅行最妙的，是计划外的相遇，游览30座不同的城市",
      obj: "Travel2",
      num: 30,
      keep: true,
      good: ["_100010485*1", "_100020221*1", "_100010353*1", "_b0000006*1", "_b0000015*1"]
    },
    {
      label: "去35个不同的城市~~",
      msg: "最好的风景，从来不在终点，而在你与它相遇时，眼里的光，游览35座不同的城市",
      obj: "Travel2",
      num: 35,
      keep: true,
      good: ["_100010486*1", "_yb*2048", "_100020205*1", "_100020240*1", "_b0000016*1", "_60001*1"]
    }
  ]
};
const rewards = (t) => [...t.reroll ? loot(t.reroll) : [], ...(t.good ?? []).map(parseGood)];
function load() {
  const p = JSON.parse(save.saveJsonData.task || "{}");
  const entry = (t, e) => e ? { take: e.take === true, good: e.good } : { take: false, good: rewards(t) };
  const list2 = (tab) => TASKS[tab].map((t, i) => entry(t, p.taskList?.[tab]?.[i]));
  return {
    doNums: p.doNums ?? {},
    taskList: { daily: p.taskList?.daily ?? [], ddw: list2("ddw"), growth: list2("growth"), travel: list2("travel") },
    daily: p.daily ?? [],
    dailyDay: p.dailyDay ?? 0
  };
}
const progress$1 = load();
const store$1 = () => update("saveJsonData", { task: JSON.stringify(progress$1) });
const defs = (tab) => tab === "daily" ? progress$1.daily : TASKS[tab];
function count(obj) {
  return obj === "Travel2" ? save.gameSaveDatas.travel_china.length : progress$1.doNums[obj] ?? 0;
}
function addCount(obj, n = 1) {
  progress$1.doNums[obj] = count(obj) + n;
  store$1();
}
const tasks = (tab) => defs(tab).map((t, i) => ({ ...t, ...progress$1.taskList[tab][i], done: count(t.obj) }));
function claim(tab, i) {
  const t = defs(tab)[i];
  const p = progress$1.taskList[tab][i];
  if (p.take || count(t.obj) < t.num) return false;
  p.take = true;
  store$1();
  give(p.good, `[host],我们完成${t.label}任务啦！~~`);
  return p.good;
}
function resetTasks() {
  for (const tab of Object.keys(TASKS))
    TASKS[tab].forEach((t, i) => {
      const p = progress$1.taskList[tab][i];
      if (!t.keep) p.take = false;
      if (t.reroll) p.good = rewards(t);
    });
  progress$1.doNums = {};
  store$1();
}
const KINDS$1 = [
  {
    obj: "Eat",
    label: "喂我吃东西{n}次",
    num: [2, 4],
    needs: () => info.hunger < save.petComputedlInfo.hungerMax / 2,
    msg: ["肚子咕咕叫啦，快给我吃点东西吧~", "吃饱饱才能长高高~"]
  },
  {
    obj: "Clean",
    label: "帮我洗香香{n}次",
    num: [1, 3],
    needs: () => info.clean < save.petComputedlInfo.cleanMax / 2,
    msg: ["身上脏脏的，好难受呀~", "香香的才招人喜欢~"]
  },
  { obj: "Toy", label: "陪我玩玩具{n}次", num: [2, 4], needs: () => info.mood < 500, msg: ["人家不开心，陪我玩一会儿嘛~", "一起玩最开心啦~"] },
  { obj: "Amusing", label: "逗逗我{n}次", num: [10, 20], needs: () => info.mood < 500, msg: ["心情不好，逗我笑一笑吧~", DDW] },
  {
    obj: "Work",
    label: "去打工{n}次",
    num: [1, 3],
    needs: () => info.yb < 500,
    can: () => save.petComputedlInfo.level >= 2,
    msg: ["家里没钱啦，我去打工赚元宝吧~", "勤劳致富，打工去咯~"]
  },
  { obj: "Study", label: "去上学{n}次", num: [1, 2], needs: (off) => !off, msg: ["上学日要好好学习哦~", "书山有路勤为径~"] },
  {
    obj: "GameRound",
    label: "玩{n}局小游戏",
    num: [2, 4],
    needs: (off) => off,
    msg: ["放假啦，痛快玩几局吧~", "换个小游戏玩玩吧~"]
  },
  { obj: "Game", label: "陪我玩小游戏{n}分钟", num: [5, 15], needs: () => info.mood < 500, msg: ["好无聊呀，陪我玩会儿小游戏吧~", "一起玩小游戏吧~"] },
  {
    obj: "Travel1",
    label: "带我去旅游{n}次",
    num: [1, 2],
    needs: (off) => off,
    msg: ["放假啦，出去走走吧~", "读万卷书，行万里路~"]
  }
];
function rollDaily(today2) {
  if (progress$1.dailyDay === dayStart()) return;
  const off = today2?.holiday ? today2.holiday.off : [0, 6].includes((/* @__PURE__ */ new Date()).getDay());
  const pool = KINDS$1.filter((k) => k.can?.() ?? true).flatMap((k) => Array(k.needs(off) ? 3 : 1).fill(k));
  const daily2 = [];
  while (daily2.length < 4) {
    const k = pool[rand(0, pool.length - 1)];
    const num = rand(...k.num);
    if (!daily2.some((t) => t.obj === k.obj))
      daily2.push({ label: k.label.replace("{n}", String(num)), msg: k.msg[k.needs(off) ? 0 : 1], obj: k.obj, num, reroll: 1, good: [`_yb*${rand(2, 5) * 10}`] });
  }
  const h2 = today2?.holiday;
  if (h2?.off) daily2.push({ label: `${h2.name}快乐`, msg: `过节啦，陪我玩5次玩具一起庆祝吧~`, obj: "Toy", num: 5, reroll: 2, good: ["_yb*100"] });
  progress$1.daily = daily2;
  progress$1.dailyDay = dayStart();
  progress$1.taskList.daily = daily2.map((t) => ({ take: false, good: rewards(t) }));
  store$1();
}
function resetTour() {
  for (const p of progress$1.taskList.travel.slice(2)) p.take = false;
  store$1();
}
const CODES = {
  113: "晴",
  116: "多云",
  119: "阴",
  122: "阴",
  143: "薄雾",
  146: "霾",
  149: "霾",
  176: "零星小雨",
  179: "零星小雪",
  182: "雨夹雪",
  185: "冻毛毛雨",
  200: "雷阵雨",
  227: "吹雪",
  230: "暴风雪",
  248: "浓雾",
  260: "冻雾",
  263: "毛毛雨",
  266: "毛毛雨",
  281: "冻毛毛雨",
  284: "冻毛毛雨",
  293: "小雨",
  296: "小雨",
  299: "中雨",
  302: "中雨",
  305: "大雨",
  308: "暴雨",
  311: "冻雨",
  314: "冻雨",
  317: "雨夹雪",
  320: "雨夹雪",
  323: "小雪",
  326: "小雪",
  329: "中雪",
  332: "中雪",
  335: "大雪",
  338: "暴雪",
  350: "冰粒",
  353: "阵雨",
  356: "大阵雨",
  359: "暴雨",
  362: "阵雨夹雪",
  365: "雨夹雪",
  368: "阵雪",
  371: "大阵雪",
  374: "冰粒",
  377: "冰粒",
  386: "雷阵雨",
  389: "雷阵雨",
  392: "雷阵雪",
  395: "雷阵雪"
};
const SEVERE = /雷|暴|大|冻|冰|浓雾/;
const TIPS = [
  ["雷", "打雷的时候别待在外面，记得关好窗户~"],
  ["冻", "路面会结冰，走路慢一点别摔倒~"],
  ["冰", "路面会结冰，走路慢一点别摔倒~"],
  ["雾", "外面雾蒙蒙的，过马路要看清楚哦~"],
  ["雪", "记得穿厚一点，路上小心滑~"],
  ["雨", "出门一定要带伞，别淋湿啦~"]
];
const WINDY = 39;
const HOT = 35;
const FREEZING = -5;
const CHILL = 8;
const COLD = 5;
const name = (code) => CODES[code] ?? "";
let latest = null;
const fetchWeather = () => window.qqpet.weather(save.settings.weatherCity).then((w2) => latest = w2, () => null);
function weatherStrain() {
  const w2 = latest;
  if (!w2) return 0;
  return Number(w2.min <= COLD || w2.max >= HOT) + Number(/雨|雪|雾|霾|冰/.test(name(w2.code))) + Number(w2.max - w2.tomorrowMax >= CHILL);
}
const when = (hour) => hour <= (/* @__PURE__ */ new Date()).getHours() ? "现在" : `${hour}点左右`;
function warning(w2) {
  const bad = w2.hours.find((h2) => SEVERE.test(name(h2.code)));
  if (bad) return `[host]，${when(bad.hour)}有${name(bad.code)}，${TIPS.find(([k]) => name(bad.code).includes(k))[1]}`;
  const windy = w2.hours.find((h2) => h2.wind >= WINDY);
  if (windy) return `[host]，${when(windy.hour)}风很大，出门抓紧帽子，别被吹跑啦~`;
  if (w2.max >= HOT) return `[host]，今天最高${w2.max}℃，好热呀，多喝水别中暑~`;
  if (w2.min <= FREEZING) return `[host]，今天最低${w2.min}℃，出门把自己裹严实哦~`;
  if (w2.max - w2.tomorrowMax >= CHILL) return `[host]，明天要降温${w2.max - w2.tomorrowMax}℃，记得加衣服哦~`;
  return null;
}
function forecast(w2) {
  const rain = w2.hours.some((h2) => name(h2.code).includes("雨"));
  return `[host]，今天${save.settings.weatherCity}${name(w2.code)}，${w2.min}~${w2.max}℃${rain ? "，出门记得带伞哦~" : "~"}`;
}
async function weatherNews(launch) {
  const w2 = await fetchWeather();
  const today2 = String(dayStart());
  if (!w2 || save.saveJsonData.weather === today2) return null;
  const s2 = warning(w2) ?? (launch && Math.random() < 0.5 ? forecast(w2) : null);
  if (s2) update("saveJsonData", { weather: today2 });
  return s2;
}
async function weatherNow() {
  const w2 = latest = await window.qqpet.weather(save.settings.weatherCity);
  return warning(w2) ?? forecast(w2);
}
let idleTimer = 0;
const petSwf = new PetSwf(document.getElementById("pet"));
const applyPetSound = () => petSwf.applySound();
const machine = new Machine(petSwf, (over2, next2) => {
  clearTimeout(idleTimer);
  if (next2.a !== "liedown" && next2.a !== "lying") endRest();
  if (next2.a === "normal" || next2.a === "hideleft" || next2.a === "hideright") {
    idleTimer = window.setTimeout(idle, Math.trunc(Math.random() * 4e4 + 2e4));
  }
  over2.e?.();
  next2.s?.();
});
function cheer() {
  const v = rand(200, 300);
  void floatMood(v);
  setInfo("mood", Math.min(info.mood + v, 1e3));
}
const LEAD_CD = 3600;
let lastLead = 0;
const SICK_CD = 600;
let lastSick = 0;
let walkTick = 0;
let walkDir = "left";
const peeking = () => machine.pose.a === "hideleft" || machine.pose.a === "hideright";
function leadOf() {
  if (info.hunger < 300) return "hungry";
  if (info.clean < 300) return "dirty";
  if (info.yb < 200) return "poor";
  return null;
}
function leadClip(kind) {
  if (kind !== "poor" && stage$1() === "Adult") return "speak";
  return kind;
}
function complain() {
  lastSick = Date.now() / 1e3;
  speak$1({ s: illOf(activity("ill") + info.health).tolk, b: "带你看病", now: true }, peeking() ? "speak" : "sick", { ok: doctor });
}
function nag() {
  if (!info.health || info.health === 5 || busy$2() || Date.now() / 1e3 - lastSick < SICK_CD) return;
  if (machine.pose.a === "normal" || peeking()) complain();
}
function maybeLead() {
  if (machine.pose.a !== "normal" || busy$2() || info.health < 5 || save.settings.paused) return false;
  if (Date.now() / 1e3 - lastLead < LEAD_CD) return false;
  const kind = leadOf();
  if (!kind) return false;
  lastLead = Date.now() / 1e3;
  const talk2 = kind === "hungry" ? "eat" : kind === "dirty" ? "clean" : "poor";
  speak$1({ c: "state", s: talk2, now: true }, leadClip(kind));
  return true;
}
function stopWalk() {
  clearInterval(walkTick);
  walkTick = 0;
  if (machine.pose.a !== "walk") return;
  const edge = applyEdge();
  const look2 = !edge && Math.random() < 0.5 ? lookUrl(info.sex, stage$1(), walkDir) : null;
  machine.play(look2 ? { a: "look", opt: { url: look2, opt: { opt: { holdMs: SINGLE_FRAME_HOLD } } } } : { a: edge ?? "normal" });
}
function startWalkMove(speed, until) {
  clearInterval(walkTick);
  walkTick = window.setInterval(() => {
    if (machine.pose.a !== "walk") {
      clearInterval(walkTick);
      walkTick = 0;
      return;
    }
    const next2 = info.lastX + speed;
    const max = innerWidth - petSize();
    if (Date.now() > until || next2 <= 0 || next2 >= max) {
      setInfo("lastX", Math.min(Math.max(next2, 0), max));
      stopWalk();
      return;
    }
    setInfo("lastX", next2);
  }, 1e3 / 12);
}
function walk() {
  if (!save.settings.roam || busy$2() || playingDesk() || info.health < 5) return false;
  if (machine.pose.a !== "normal" || edgeSide()) return false;
  const s2 = petSize();
  const roomL = info.lastX;
  const roomR = innerWidth - info.lastX - s2;
  if (roomL < 48 && roomR < 48) return false;
  const dir2 = roomL < 80 ? "right" : roomR < 80 ? "left" : Math.random() < 0.5 ? "left" : "right";
  walkDir = dir2;
  const speed = 8 * (s2 / 144) * (dir2 === "left" ? -1 : 1);
  machine.play({
    a: "walk",
    opt: { url: walkUrl(info.sex, stage$1(), dir2), opt: {} },
    s: () => startWalkMove(speed, Date.now() + rand(2e3, 5e3))
  });
  return true;
}
const REST_POSES = ["liedown", "lying"];
let restTimer = 0;
const resting = () => REST_POSES.includes(machine.pose.a);
function endRest() {
  clearTimeout(restTimer);
  restTimer = 0;
}
function rest() {
  if (busy$2() || playingDesk() || info.health < 5 || resting()) return false;
  if (machine.pose.a !== "normal" && machine.pose.a !== "walk") return false;
  const plan = restPlan(info.sex, stage$1());
  if (!plan) return false;
  stopWalk();
  const lying = { a: "lying", opt: { url: plan.lying.url, opt: { opt: { overCurrentFrame: plan.lying.freeze } } } };
  if (plan.down) machine.play({ a: "liedown", opt: { url: plan.down, opt: {} }, s: () => machine.add(lying) });
  else machine.play(lying);
  endRest();
  restTimer = window.setTimeout(() => {
    restTimer = 0;
    if (!resting()) return;
    machine.play(plan.up ? { a: "getup", opt: { url: plan.up, opt: {} } } : { a: "normal" });
  }, rand(2e4, 6e4));
  return true;
}
function idle() {
  if (peeking() || playingDesk()) return;
  if (maybeLead()) return;
  if (Math.random() < 0.1 && rest()) return;
  if (save.settings.roam) {
    const n = Math.trunc(Math.random() * 3);
    if (n === 0 && walk()) return;
    if (n !== 2) return machine.add({ a: "play" });
  } else if (Math.random() < 0.8) {
    return machine.add({ a: "play" });
  }
  const date = Math.random() < 0.3 ? dateTalk() : null;
  speak$1(date ? { s: date, ai: IDLE$1 } : { c: "smallTalk", ai: IDLE$1 }, "speak", { ok: cheer });
}
function line$1(c, s2) {
  let lines = TALK$1[c] ?? [];
  if (s2 && !Array.isArray(lines)) lines = lines[s2] ?? [];
  return Array.isArray(lines) && lines.length ? lines[rand(0, lines.length - 1)] : null;
}
function speak$1(t, action, hooks = {}) {
  let text = t.s ?? "";
  let button2 = t.b ?? "好的";
  if (t.c) {
    const l = line$1(t.c, t.s);
    text = l?.tolk ?? `${t.c}-${t.s}聊天数据丢失，请联系管理员处理`;
    button2 = l?.submitText ?? "好的";
  }
  text = text.replace(/\[host]/g, info.host);
  const onOk = hooks.ok ? [hooks.ok] : [];
  const show2 = () => {
    if (!save.settings.quiet) {
      const polish = save.settings.polish && t.ai !== false;
      const blurt = (s2) => {
        emitSaid(s2);
        void say$2(s2, [button2], onOk);
        if (aiOn() && (t.opts === true || t.ai && t.ai !== false)) void bubbleReplyOptions(s2);
      };
      if (!polish) blurt(text);
      else void rephrase(text, t.ai || void 0).then((s2) => blurt(s2 ?? text));
    }
    hooks.start?.();
  };
  if (!action || !info.health && action !== "bury") return show2();
  if ((action === "speak" || action === "play") && (machine.pose.a === "hideleft" || machine.pose.a === "hideright")) return show2();
  const pose = { a: action, s: show2, e: hooks.end };
  if (t.now) machine.play(pose);
  else machine.add(pose);
}
let reviving = false;
function revive(done) {
  if (reviving) return;
  reviving = true;
  machine.play({
    a: "revival",
    e: () => {
      speak$1({ s: "[host]，再次见到你很高兴~~ ", b: "我也很高兴~" });
      setInfo("health", 5);
      reviving = false;
      burying = false;
    }
  });
}
let burying = false;
function bury(done) {
  if (burying) return;
  burying = true;
  update("isBury", true);
  setTray("bury");
  speak$1({ c: "state", s: "bury" }, "bury", { start: done });
}
let lastMood = mood();
onInfoChange((key, prev) => {
  if (key === "growth") {
    const before = syncLevel();
    const now2 = save.petComputedlInfo.level;
    if (now2 === before) return;
    const first = now2 === 5 && before === 4 || now2 === 10 && before === 9;
    speak$1({ c: first ? `first${now2 === 5 ? 1 : 2}` : "levUp", now: true }, first ? "first" : "levUp");
  } else if (key === "health") {
    healthChanged(prev);
  } else if (key === "mood" && mood() !== lastMood) {
    lastMood = mood();
    if (stage$1() === "Adult") speak$1({ c: "mood", s: lastMood, now: true }, "speak");
  } else if (key === "hunger" || key === "clean" || key === "yb") {
    maybeLead();
  }
});
function healthChanged(prev) {
  const h2 = info.health;
  if (h2 < 0 || Number.isNaN(h2)) return setInfo("health", 0);
  if (h2 > 5) return setInfo("health", 5);
  if (h2 === 5) {
    if (prev === 0) revive();
    setActivity("ill", null);
    return setTray("normal");
  }
  if (h2 === 0) {
    if (save.settings.undying) return setInfo("health", 5);
    speak$1({ s: DEAD$1.tolk, now: true }, "dying", { start: () => machine.add({ a: "die" }) });
    return setTray("dead");
  }
  if (!activity("ill")) setActivity("ill", `${rand(0, 2)}-`);
  complain();
  setTray("ill");
}
let lastTick = null;
const MOOD_OUT = { work: "stopWorkFoMood0", study: "stopStudyFoMood0", trip: "overTripUpFoMood0" };
function tick() {
  const now2 = Math.floor(Date.now() / 1e3);
  const today2 = dayStart(now2);
  if (save.nowTimeLine <= today2) {
    setInfo("onlineDataTime", 0);
    newDay(today2);
    resetTasks();
    resetSignIn();
    resetFish();
    void daily();
  }
  if (lastTick !== null) {
    const minutes = +((now2 - lastTick) / 60).toFixed(5);
    addInfo("onlineDataTime", minutes);
    addInfo("onLineTime", minutes);
    tickGift(minutes);
    const steps = info.sweetHeart ? Math.min(Math.max(Math.ceil(minutes), 1), 2880) : 1;
    const dt = minutes / steps;
    let grown = 0;
    for (let i = 0; i < steps; i++) {
      const extra = busy$2() ? 1 : 0;
      const moodRate = (rand(1, 2) + extra) * 0.2;
      const g = Math.min(dt, info.mood / moodRate);
      if (g < dt) {
        const stopped = stopTask();
        if (stopped) speak$1({ c: "state", s: MOOD_OUT[stopped], now: true }, "speak");
      }
      setInfo("mood", Math.max(info.mood - moodRate * dt, 0));
      setInfo("hunger", Math.max(info.hunger - (rand(2, 3) + extra) * dt, 0));
      setInfo("clean", Math.max(info.clean - (rand(2, 3) + extra) * dt, 0));
      addInfo("growth", +(growthPerMinute() * g).toFixed(8));
      grown += g;
      if (info.sweetHeart) selfCare(i < steps - 1);
    }
    for (const type of tickTimed(grown)) speak$1({ c: "state", s: `${type}Over`, now: true }, "speak");
    advanceTask(grown);
  }
  lastTick = now2;
  update("nowTimeLine", now2);
}
const NEEDS = [
  { stat: "hunger", type: "food", act: "吃东西" },
  { stat: "clean", type: "clean", act: "洗白白" },
  { stat: "mood", type: "toy", act: "玩玩具" }
];
function selfCare(quiet = false) {
  for (const need2 of NEEDS) {
    const max = save.petComputedlInfo[`${need2.stat}Max`];
    if (info[need2.stat] / max >= 0.6) continue;
    const g = pickCare(listGoods(need2.type, 1, Number.MAX_SAFE_INTEGER).list, need2.stat, max - info[need2.stat]);
    if (!g) continue;
    if (quiet) useItemQuietly(g);
    else useItem(g, false, `[host]，我可以自己${need2.act}哦！~~使用了：${g.name}`);
    return;
  }
}
const ILL_RATE = 1 / 1e5;
function healthRoll() {
  const f = fatigue();
  if (!f) return;
  if (info.health !== 5) {
    if (rand(0, (700 - f * 50) * 8) < 5) setInfo("health", info.health - 1);
    return;
  }
  const harsh = weatherStrain();
  if (Math.random() < f * f * (1 + harsh) * ILL_RATE) {
    setActivity("ill", `${harsh ? 1 : rand(0, 2)}-`);
    setInfo("health", 4);
  }
}
function grow() {
  if (info.health <= 0 || save.settings.paused) {
    lastTick = null;
    return;
  }
  tick();
  refreshTray();
  healthRoll();
  nag();
  void harvestNews().then((n) => n && speak$1({ s: n.s, b: "去看看" }, "speak", { ok: n.ok }));
}
const weatherTalk = (launch) => weatherNews(launch).then((s2) => void (s2 && speak$1({ s: s2 }, "speak")));
let dailyDay = 0;
async function daily() {
  if (dailyDay === dayStart()) return;
  dailyDay = dayStart();
  const today2 = await loadCalendar();
  rollDaily(today2);
  const f = festival();
  if (f) speak$1({ s: f }, "speak");
  void weatherTalk(true);
  if (deliverMails(today2)) speak$1({ s: "[host]，邮箱里来了新邮件，快去看看吧~", b: "这就去" }, "speak", { ok: openEmail });
}
let growthTimer = null;
function startGrowth() {
  if (growthTimer !== null) return;
  grow();
  advanceTask(0);
  growthTimer = setInterval(grow, 6e4);
}
function startPet() {
  refreshTray();
  if (save.isBury) {
    bury();
    setTray("dead");
  } else if (info.health === 0) {
    speak$1({ s: DEAD$1.tolk, b: "别走~" });
    machine.play({ a: "dying", s: () => machine.add({ a: "die" }) });
    setTray("dead");
  } else {
    if (info.health < 5) setTray("ill");
    const a = info.growth === 0 ? "first" : "enter";
    const g = a === "enter" && Math.random() < 0.5 ? greeting() : null;
    machine.play({ a, s: () => speak$1(g ? { s: g.tolk, b: g.submitText } : { c: a }) });
    if (info.growth === 0) addInfo("growth", 1);
    void daily();
    setInterval(() => void weatherTalk(false), 36e5);
  }
  if (!save.isBury) startGrowth();
  machine.start();
}
function payQb(price2) { if ((info.qb || 0) < price2) { windowView({ msg: "抱歉您的Q币不足" }); return false; } setInfo("qb", (info.qb || 0) - price2); return true; }
function pay(price2) {
  if (info.yb < price2) {
    windowView({ msg: "抱歉您的余额不足" });
    return false;
  }
  setInfo("yb", info.yb - price2);
  return true;
}
function apply(g, extra = 0) {
  const c = save.petComputedlInfo;
  if (g.hunger) setInfo("hunger", Math.min(info.hunger + g.hunger, c.hungerMax));
  if (g.clean) setInfo("clean", Math.min(info.clean + g.clean, c.cleanMax));
  const mood2 = (g.mood ?? 0) + extra;
  if (mood2) {
    void floatMood(mood2);
    setInfo("mood", Math.min(info.mood + mood2, c.moodMax));
  }
  if (g.intel) addInfo("intel", g.intel);
  if (g.charm) addInfo("charm", g.charm);
  if (g.strong) addInfo("strong", g.strong);
}
const DAILY = {
  food: { c: "eat", action: "eat", extra: 20, paused: "吃食物", task: "Eat" },
  clean: { c: "clean", action: "clean", extra: 20, paused: "清洁", task: "Clean" },
  toy: { c: "toy", action: "speak", extra: 0, paused: "玩玩具", task: "Toy" },
  background: { c: "pay", action: "speak", extra: 0 }
};
const HAPPENED = {
  food: (n) => `主人喂你吃了${n}`,
  clean: (n) => `主人用${n}给你洗了澡`,
  medicine: (n) => `主人给你喂了药（${n}）`,
  toy: (n) => `主人陪你玩了${n}`,
  background: (n) => `主人给你换上了${n}`
};
const happened = (g) => emitEvent((HAPPENED[g.type] ?? ((n) => `主人给你用了${n}`))(g.name));
function useItemQuietly(g) {
  const d = DAILY[g.type];
  if (!takeGood(g)) return;
  if (g.useTimeing) startTimed(g);
  apply(g, d.extra);
  if (d.task) addCount(d.task);
}
function useItem(g, free = false, text) {
  if (g.type !== "medicine" && info.health === 0) return speak$1({ c: "state", s: "die" });
  if (!free && !hasGood(g.type, g.id)) return;
  const take = () => takeGood(g) || free;
  if (g.type === "nums") {
    const key = g.useId ?? g.id;
    return windowView({
      title: `使用-${g.name}`,
      msg: "选择使用数量",
      goods: [g],
      max: g.num,
      ok: (close2, n) => {
        if (takeGood(g, n)) {
          happened(g);
          setInfo(key, Math.max(info[key] + n * g.value, 0));
        }
        close2();
      }
    });
  }
  if (g.type === "medicine")
    return medicine(g, () => {
      const ok2 = take();
      if (ok2) happened(g);
      return ok2;
    });
  const d = DAILY[g.type];
  if (save.settings.paused && d.paused) return speak$1({ s: `[host],我暂停成长拉！无法${d.paused}~~`, now: true }, "speak");
  speak$1(text ? { s: text, now: true } : { c: d.c, s: g.type, now: true }, d.action, {
    start: () => {
      if (!take()) return;
      happened(g);
      if (g.useTimeing) startTimed(g);
      apply(g, d.extra);
      if (d.task) addCount(d.task);
    }
  });
}
function medicine(g, take) {
  if (g.id === DEAD$1.cure.id) {
    const revive2 = () => {
      if (!take()) return;
      apply(g);
      setInfo("health", 5);
    };
    if (info.health === 0) return revive2();
    return windowView({
      title: "使用还魂丹？",
      msg: "您的宠物未死亡，确定需要使用还魂丹进行治疗?",
      goods: [g],
      ok: (close2) => {
        speak$1({ s: "[host],向天再借100年！~", now: true }, "cure");
        revive2();
        close2();
      }
    });
  }
  if (info.health === 5) return speak$1({ s: "[host],我不需要吃药哦~", now: true }, "speak");
  if (info.health === 0) return speak$1({ s: "[host]，这个不能让我复活哦~" });
  const ill = illOf(activity("ill") + info.health);
  const right = g.id === ill.cure.id;
  const effect = () => {
    if (!take()) return;
    setInfo("health", right ? 5 : info.health - 1);
    apply(g);
  };
  speak$1({ s: right ? ill.successTolk : ill.errTolk, now: true }, "cure", right ? { start: effect } : { end: effect });
}
function give(goods, text) {
  for (const g of goods) addGood(g.type, g.id, g.num);
  speak$1({ s: text, now: true }, "speak");
}
const discount = (yb) => Math.round(yb * 0.8);
const price = (g) => info.pinkDiamond ? discount(g.price) : g.price;
function buy(g, n = 1, quiet = false) {
  if (g.needLevel && save.petComputedlInfo.level < g.needLevel) {
    speak$1({ s: "[host],我现在没到购买年龄哦~~" }, "speak");
    return false;
  }
  if (g.PD && !info.pinkDiamond) {
    speak$1({ s: "[host],你要帮我开通粉钻贵族才能购买哦~~" }, "speak");
    return false;
  }
  if (!pay(price(g) * n)) return false;
  addGood(g.type, g.id, n);
  if (!quiet) speak$1({ c: "pay", s: g.type, now: true }, "speak");
  return true;
}
function doctor() {
  const line2 = activity("ill");
  if (info.health === 0) return prescribe(goodOf("medicine", DEAD$1.cure.id), "您的宠物已经死亡，需要使用");
  if (!line2) return speak$1({ s: "[host],我不需要看病的~", now: true }, "speak");
  const fee = (5 - info.health) * 10;
  windowView({
    title: "看病",
    msg: `当前需要花费${fee}元宝，点击确认进行看病~`,
    ok: () => {
      if (!pay(fee)) return;
      const ill = illOf(line2 + info.health);
      prescribe(goodOf("medicine", ill.cure.id), `您的宠物患上了${ill.name}， 需要使用`);
    }
  });
}
function prescribe(g, diagnosis) {
  const owned = hasGood("medicine", g.id);
  const cost = Math.round((g.price || 50) * 1.2);
  windowView({
    title: "诊断结果",
    msg: diagnosis + g.name + (owned ? ",进行治疗，点击确认即可快速治疗~" : `,点击确认花费${cost}元宝进行治疗`),
    goods: [g],
    ok: (close2) => {
      if (!owned && !pay(cost)) return;
      useItem(g, !owned);
      close2();
    }
  });
}
function formatDate(sec, fmt = "YYYY-MM-DD HH:mm:ss") {
  const d = new Date(sec * 1e3);
  const p = (n) => String(n).padStart(2, "0");
  const parts = {
    YYYY: String(d.getFullYear()),
    MM: p(d.getMonth() + 1),
    DD: p(d.getDate()),
    HH: p(d.getHours()),
    mm: p(d.getMinutes()),
    ss: p(d.getSeconds())
  };
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (t) => parts[t]);
}
const caption = (s2) => `${s2.city}${isBuddy(s2.id) ? " · 和旅游搭子" : ""} · ${formatDate(s2.d, "YYYY-MM-DD")}`;
function openPhoto(id) {
  const s2 = shots().find((x) => x.id === id);
  openBox(
    div(
      "ui-photo fC",
      img("photoImg", photoUrl(id)),
      div("photoBar", caption(s2))
    )
  );
}
function albumView() {
  const list2 = shots().reverse();
  const items2 = list2.map((s2) => button("albumItem fC", () => openPhoto(s2.id), div("albumRatio", img("albumImg", photoUrl(s2.id))), div("albumCap", caption(s2))));
  return div(
    "album fC",
    div("albumTip", `已收集 ${list2.length} / ${PHOTOS.length} 张旅行照片，点击照片查看大图`),
    items2.length ? div("albumGrid f1 h0", ...items2) : div("albumEmpty f1 fcc", "还没有照片哦，让宠物去旅行吧~")
  );
}
function frame(content, src, sides) {
  const slice = (cls, n) => div(`${cls} f1 slice`, img("", src(n)));
  const row2 = (cls, n) => div(`${cls} fcc`, img(`${cls}1`, src(n)), slice(`${cls}2`, n + 1), img(`${cls}3`, src(n + 2)));
  const left = img("content1", src(4));
  const right = img("content3", src(6));
  left.style.width = `${sides[0]}px`;
  right.style.width = `${sides[1]}px`;
  const middle = div("content fcc f1", left, slice("content2", 5), right);
  return div("imgBjBoxFrame", div("styleBox fC", row2("head", 1), middle, row2("foot", 7)), div("slotMain", content));
}
const BG = ["bg_01.png", "bg_02.bmp", "bg_03.png", "bg_04.bmp", "bg_05.bmp", "bg_06.bmp", "bg_8.png", "bg_09.png", "bg_10.png"];
const PAGE$1 = 3;
let open$a = false;
function openEmail() {
  if (open$a) return;
  open$a = true;
  const mails = readMails();
  const live = () => Object.values(mails).filter((m) => !m.e).reverse();
  const act = (list2) => {
    for (const m of list2) {
      if (m.r) mails[m.d] = { d: m.d, e: true, k: m.k };
      else {
        give(m.glb, m.m || "邮箱领取成功！");
        m.r = true;
      }
    }
    writeMails(mails);
    render2();
  };
  let page = 0;
  const emails = div("emails f1");
  const at = div("e_at tc");
  const prev = button("e_prev", () => render2(page - 1));
  const next2 = button("e_next", () => render2(page + 1));
  const render2 = (to = page) => {
    const all = live();
    const last2 = Math.max(0, Math.ceil(all.length / PAGE$1) - 1);
    page = Math.min(Math.max(to, 0), last2);
    prev.classList.toggle("off", page === 0);
    next2.classList.toggle("off", page === last2);
    at.textContent = `${page + 1}/${last2 + 1}`;
    emails.replaceChildren(
      ...all.slice(page * PAGE$1, (page + 1) * PAGE$1).map(
        (m) => div(
          "email fc",
          div(m.r ? "leftType yjImg" : "leftType uyjImg"),
          div(
            "rightMain f1 fC w0",
            div("e_title", m.l),
            div("e_time", formatDate(m.d, "YYYY-MM-DD HH:mm")),
            div(
              "e_icons f1 mt2",
              m.p ? button("e_photo", () => openPhoto(m.p), img("e_photoImg", photoUrl(m.p))) : div("e_goodImgsBox", ...m.glb.map((g) => Object.assign(img("e_goodImgs", g.url), { title: `${g.name}*${g.num}` })))
            )
          ),
          button(m.r ? "fcc rgetEmail" : "fcc getEmail", () => act([m]), m.r ? "删除" : "领取")
        )
      )
    );
  };
  render2();
  const close2 = () => {
    closeFrame();
    open$a = false;
  };
  const content = div(
    "Email fC",
    div("titleBox por fcc", div("title fcc", "邮箱"), button("close", close2)),
    emails,
    div(
      "e_foot fcc",
      div("e_pager fcc", prev, at, next2),
      button("fcc wsnw getEmail getEmails", () => act(live().filter((m) => !m.r)), " 一键领取 "),
      button("fcc wsnw rgetEmail rgetEmails", () => act(live().filter((m) => m.r)), " 一键删除 ")
    )
  );
  const closeFrame = openFrame(
    div(
      "ui-email",
      frame(content, (n) => `pet/email/${BG[n - 1]}`, [12, 12])
    )
  );
}
const EXAM = {
  "xx-chinese": [{ "title": "小学语文：'床前明月光'的下一句是？", "options": ["疑是地上霜", "举头望明月", "低头思故乡", "春风又绿江南岸"], "answer": "疑是地上霜" }, { "title": "小学语文：'春眠不觉晓'的下一句是？", "options": ["处处闻啼鸟", "夜来风雨声", "花落知多少", "锄禾日当午"], "answer": "处处闻啼鸟" }, { "title": "小学语文：'白日依山尽'的下一句是？", "options": ["黄河入海流", "更上一层楼", "欲穷千里目", "春风花草香"], "answer": "黄河入海流" }, { "title": "小学语文：'锄禾日当午'的下一句是？", "options": ["汗滴禾下土", "谁知盘中餐", "粒粒皆辛苦", "处处闻啼鸟"], "answer": "汗滴禾下土" }, { "title": "小学语文：'两个黄鹂鸣翠柳'的下一句是？", "options": ["一行白鹭上青天", "窗含西岭千秋雪", "门泊东吴万里船", "千里莺啼绿映红"], "answer": "一行白鹭上青天" }, { "title": "小学语文：《静夜思》的作者是？", "options": ["李白", "杜甫", "白居易", "王维"], "answer": "李白" }, { "title": "小学语文：'日'字一共有几画？", "options": ["4", "3", "5", "6"], "answer": "4" }, { "title": "小学语文：'大'的反义词是？", "options": ["小", "多", "高", "长"], "answer": "小" }, { "title": "小学语文：《咏鹅》的作者是？", "options": ["骆宾王", "李白", "孟浩然", "王之涣"], "answer": "骆宾王" }, { "title": "小学语文：'欲穷千里目'的下一句是？", "options": ["更上一层楼", "黄河入海流", "白日依山尽", "疑是地上霜"], "answer": "更上一层楼" }],
  "xx-mathematics": [{ "title": "小学数学：3 × 4 + 5 = ?", "options": ["12", "17", "20", "19"], "answer": "17" }, { "title": "小学数学：12 ÷ (3 + 1) = ?", "options": ["3", "4", "6", "2"], "answer": "3" }, { "title": "小学数学：一个三角形有几个角？", "options": ["3", "4", "5", "6"], "answer": "3" }, { "title": "小学数学：25 + 37 = ?", "options": ["62", "52", "61", "72"], "answer": "62" }, { "title": "小学数学：8 × 7 = ?", "options": ["56", "54", "63", "48"], "answer": "56" }, { "title": "小学数学：100 - 45 = ?", "options": ["55", "45", "65", "50"], "answer": "55" }, { "title": "小学数学：一个正方形有几条边？", "options": ["4", "3", "5", "6"], "answer": "4" }, { "title": "小学数学：1米等于多少厘米？", "options": ["100", "10", "1000", "50"], "answer": "100" }, { "title": "小学数学：1小时等于多少分钟？", "options": ["60", "100", "30", "24"], "answer": "60" }, { "title": "小学数学：7 × 8 - 6 = ?", "options": ["50", "56", "48", "62"], "answer": "50" }],
  "xx-politics": [{ "title": "小学政治：我国国旗上有几颗五角星？", "options": ["4", "5", "6", "7"], "answer": "5" }, { "title": "小学政治：我国首都是哪个城市？", "options": ["北京", "上海", "广州", "重庆"], "answer": "北京" }, { "title": "小学政治：国庆节是每年的几月几日？", "options": ["10月1日", "7月1日", "5月1日", "1月1日"], "answer": "10月1日" }, { "title": "小学政治：我国的国歌是？", "options": ["义勇军进行曲", "歌唱祖国", "我的祖国", "东方红"], "answer": "义勇军进行曲" }, { "title": "小学政治：我国国旗的名称是？", "options": ["五星红旗", "八一军旗", "镰刀锤头旗", "星条旗"], "answer": "五星红旗" }, { "title": "小学政治：建党节是每年的几月几日？", "options": ["7月1日", "8月1日", "10月1日", "5月4日"], "answer": "7月1日" }, { "title": "小学政治：我国共有多少个民族？", "options": ["56", "50", "34", "60"], "answer": "56" }, { "title": "小学政治：劳动节是每年的几月几日？", "options": ["5月1日", "6月1日", "3月12日", "9月10日"], "answer": "5月1日" }, { "title": "小学政治：教师节是每年的几月几日？", "options": ["9月10日", "9月1日", "10月10日", "6月1日"], "answer": "9月10日" }, { "title": "小学政治：我国国徽中央的建筑是？", "options": ["天安门", "长城", "人民大会堂", "黄鹤楼"], "answer": "天安门" }],
  "xx-music": [{ "title": "小学音乐：简谱中'1'对应的唱名是？", "options": ["do", "re", "mi", "fa"], "answer": "do" }, { "title": "小学音乐：钢琴有多少个白键？", "options": ["52", "36", "88", "72"], "answer": "52" }, { "title": "小学音乐：国歌《义勇军进行曲》的作曲者是？", "options": ["聂耳", "冼星海", "贺绿汀", "李叔同"], "answer": "聂耳" }, { "title": "小学音乐：简谱中'5'对应的唱名是？", "options": ["sol", "la", "fa", "mi"], "answer": "sol" }, { "title": "小学音乐：下列哪种乐器属于打击乐器？", "options": ["鼓", "笛子", "二胡", "小提琴"], "answer": "鼓" }, { "title": "小学音乐：简谱中一共有几个基本音级？", "options": ["7", "5", "8", "12"], "answer": "7" }, { "title": "小学音乐：《义勇军进行曲》的词作者是？", "options": ["田汉", "聂耳", "冼星海", "郭沫若"], "answer": "田汉" }, { "title": "小学音乐：下列哪种乐器有黑白琴键？", "options": ["钢琴", "吉他", "小号", "琵琶"], "answer": "钢琴" }, { "title": "小学音乐：音乐中表示'强'的记号是？", "options": ["f", "p", "mp", "pp"], "answer": "f" }, { "title": "小学音乐：《让我们荡起双桨》中'小船儿推开'的是？", "options": ["波浪", "白云", "荷叶", "绿草"], "answer": "波浪" }],
  "xx-art": [{ "title": "小学艺术：三原色不包括？", "options": ["绿色", "红色", "黄色", "蓝色"], "answer": "绿色" }, { "title": "小学艺术：红色和黄色混合会变成？", "options": ["橙色", "紫色", "绿色", "棕色"], "answer": "橙色" }, { "title": "小学艺术：黄色和蓝色混合会变成？", "options": ["绿色", "橙色", "紫色", "灰色"], "answer": "绿色" }, { "title": "小学艺术：红色和蓝色混合会变成？", "options": ["紫色", "绿色", "橙色", "黄色"], "answer": "紫色" }, { "title": "小学艺术：下面哪种颜色属于暖色？", "options": ["红色", "蓝色", "青色", "紫罗兰色"], "answer": "红色" }, { "title": "小学艺术：下面哪种颜色属于冷色？", "options": ["蓝色", "橙色", "红色", "黄色"], "answer": "蓝色" }, { "title": "小学艺术：剪纸是哪个国家的传统民间艺术？", "options": ["中国", "法国", "美国", "埃及"], "answer": "中国" }, { "title": "小学艺术：画水彩画主要用什么调颜料？", "options": ["水", "油", "胶水", "牛奶"], "answer": "水" }, { "title": "小学艺术：京剧脸谱中红色通常代表？", "options": ["忠勇", "奸诈", "凶猛", "神怪"], "answer": "忠勇" }, { "title": "小学艺术：用来削铅笔的文具是？", "options": ["卷笔刀", "橡皮", "直尺", "圆规"], "answer": "卷笔刀" }],
  "xx-manner": [{ "title": "小学礼仪：见到老师应该怎样问候？", "options": ["老师好", "喂", "嘿", "不理睬"], "answer": "老师好" }, { "title": "小学礼仪：接受别人帮助后应该说什么？", "options": ["谢谢", "不用谢", "无所谓", "应该的"], "answer": "谢谢" }, { "title": "小学礼仪：与人交谈时应该怎样做？", "options": ["看着对方眼睛", "低头玩手机", "东张西望", "打断别人"], "answer": "看着对方眼睛" }, { "title": "小学礼仪：过马路应该走哪里？", "options": ["人行横道", "机动车道", "随意横穿", "翻越护栏"], "answer": "人行横道" }, { "title": "小学礼仪：别人向你道歉时应该说？", "options": ["没关系", "哼", "活该", "不理他"], "answer": "没关系" }, { "title": "小学礼仪：去别人家做客，进门前应该？", "options": ["先敲门", "直接推门", "大声喊叫", "用脚踢门"], "answer": "先敲门" }, { "title": "小学礼仪：升国旗时应该怎样做？", "options": ["立正行注目礼", "随意走动", "低头玩耍", "大声说笑"], "answer": "立正行注目礼" }, { "title": "小学礼仪：在图书馆里应该？", "options": ["保持安静", "大声朗读", "追逐打闹", "边走边吃"], "answer": "保持安静" }, { "title": "小学礼仪：不小心撞到同学应该说？", "options": ["对不起", "让开", "没看见", "怪你"], "answer": "对不起" }, { "title": "小学礼仪：在公交车上遇到老人应该？", "options": ["主动让座", "假装睡觉", "抢先坐下", "视而不见"], "answer": "主动让座" }],
  "xx-pe": [{ "title": "小学体育：立定跳远主要锻炼什么能力？", "options": ["爆发力", "耐力", "柔韧性", "协调性"], "answer": "爆发力" }, { "title": "小学体育：50米跑主要测试什么能力？", "options": ["速度", "耐力", "力量", "柔韧"], "answer": "速度" }, { "title": "小学体育：跳绳主要锻炼什么？", "options": ["协调性", "记忆力", "视力", "听力"], "answer": "协调性" }, { "title": "小学体育：跑步前应该先做什么？", "options": ["热身运动", "吃大餐", "喝冰水", "直接冲刺"], "answer": "热身运动" }, { "title": "小学体育：足球比赛中，除守门员外不能用什么触球？", "options": ["手", "脚", "头", "胸"], "answer": "手" }, { "title": "小学体育：篮球比赛每队上场几人？", "options": ["5", "6", "7", "11"], "answer": "5" }, { "title": "小学体育：坐位体前屈主要测试什么？", "options": ["柔韧性", "速度", "力量", "耐力"], "answer": "柔韧性" }, { "title": "小学体育：哪项运动被称为我国的国球？", "options": ["乒乓球", "足球", "篮球", "羽毛球"], "answer": "乒乓球" }, { "title": "小学体育：运动后大量出汗应该补充？", "options": ["适量温水", "冰镇可乐", "什么都不喝", "大量冷饮"], "answer": "适量温水" }, { "title": "小学体育：跳高比赛中运动员要越过的是？", "options": ["横杆", "球网", "栏架", "跳绳"], "answer": "横杆" }],
  "xx-labouring": [{ "title": "小学劳技：使用剪刀时应如何传递？", "options": ["刀尖朝向自己", "刀尖朝向他人", "随意传递", "扔过去"], "answer": "刀尖朝向自己" }, { "title": "小学劳技：缝纽扣时应该注意什么？", "options": ["针要拿稳", "越快越好", "随意缝制", "不用打结"], "answer": "针要拿稳" }, { "title": "小学劳技：种植植物需要什么基本条件？", "options": ["阳光、水、土壤", "只需要水", "只需要阳光", "不需要照顾"], "answer": "阳光、水、土壤" }, { "title": "小学劳技：垃圾分类中，废旧电池属于？", "options": ["有害垃圾", "厨余垃圾", "可回收物", "其他垃圾"], "answer": "有害垃圾" }, { "title": "小学劳技：用肥皂洗手时，应搓洗至少多久？", "options": ["20秒", "2秒", "5秒", "1秒"], "answer": "20秒" }, { "title": "小学劳技：每次刷牙大约应该刷多久？", "options": ["3分钟", "10秒", "30分钟", "1小时"], "answer": "3分钟" }, { "title": "小学劳技：发现电器冒烟着火，首先应该？", "options": ["切断电源", "用水浇", "用手去拔", "不管它"], "answer": "切断电源" }, { "title": "小学劳技：用小刀削铅笔时，刀口应该朝向？", "options": ["外侧", "自己", "同学", "上方"], "answer": "外侧" }, { "title": "小学劳技：给花浇水最好在什么时候？", "options": ["早晨或傍晚", "正午烈日下", "半夜", "从来不浇"], "answer": "早晨或傍晚" }, { "title": "小学劳技：扫地时应该怎样扫？", "options": ["从里往外扫", "从外往里扫", "只扫中间", "把垃圾扫到别人座位"], "answer": "从里往外扫" }],
  "xx-wushu": [{ "title": "小学武术：武术基本功'马步'要求膝盖不超过？", "options": ["脚尖", "脚踝", "脚后跟", "无要求"], "answer": "脚尖" }, { "title": "小学武术：武术抱拳礼中，右手握拳代表什么？", "options": ["武", "文", "勇", "礼"], "answer": "武" }, { "title": "小学武术：武术中的'五步拳'包含几个基本步型？", "options": ["5", "3", "7", "9"], "answer": "5" }, { "title": "小学武术：武术'弓步'中前腿应该？", "options": ["屈膝", "伸直", "抬起", "跪地"], "answer": "屈膝" }, { "title": "小学武术：武术'仆步'是一腿全蹲，另一腿？", "options": ["平铺伸直", "屈膝抬起", "跪在地上", "向后踢起"], "answer": "平铺伸直" }, { "title": "小学武术：少林寺位于哪座山？", "options": ["嵩山", "武当山", "峨眉山", "华山"], "answer": "嵩山" }, { "title": "小学武术：武术基本手型不包括？", "options": ["剪刀", "拳", "掌", "勾"], "answer": "剪刀" }, { "title": "小学武术：练习武术前要先做？", "options": ["准备活动", "吃得很饱", "剧烈冲刺", "不用准备"], "answer": "准备活动" }, { "title": "小学武术：太极拳的动作特点是？", "options": ["柔和缓慢", "快速猛烈", "跳跃翻滚", "只用腿"], "answer": "柔和缓慢" }, { "title": "小学武术：武当武术发源于哪座山？", "options": ["武当山", "嵩山", "泰山", "黄山"], "answer": "武当山" }],
  "zx-chinese": [{ "title": "中学语文：《红楼梦》的作者是？", "options": ["曹雪芹", "罗贯中", "施耐庵", "吴承恩"], "answer": "曹雪芹" }, { "title": "中学语文：'落霞与孤鹜齐飞'的下一句是？", "options": ["秋水共长天一色", "春风又绿江南岸", "海上明月共潮生", "不尽长江滚滚来"], "answer": "秋水共长天一色" }, { "title": "中学语文：《史记》的作者是？", "options": ["司马迁", "司马光", "班固", "左丘明"], "answer": "司马迁" }, { "title": "中学语文：《三国演义》的作者是？", "options": ["罗贯中", "施耐庵", "吴承恩", "曹雪芹"], "answer": "罗贯中" }, { "title": "中学语文：'先天下之忧而忧'的下一句是？", "options": ["后天下之乐而乐", "不以物喜", "不以己悲", "居庙堂之高"], "answer": "后天下之乐而乐" }, { "title": "中学语文：《岳阳楼记》的作者是？", "options": ["范仲淹", "欧阳修", "苏轼", "王安石"], "answer": "范仲淹" }, { "title": "中学语文：《醉翁亭记》中的'醉翁'指的是？", "options": ["欧阳修", "苏轼", "李白", "陶渊明"], "answer": "欧阳修" }, { "title": "中学语文：'海内存知己'的下一句是？", "options": ["天涯若比邻", "无为在歧路", "儿女共沾巾", "城阙辅三秦"], "answer": "天涯若比邻" }, { "title": "中学语文：《朝花夕拾》的作者是？", "options": ["鲁迅", "冰心", "老舍", "巴金"], "answer": "鲁迅" }, { "title": "中学语文：《骆驼祥子》的作者是？", "options": ["老舍", "鲁迅", "茅盾", "沈从文"], "answer": "老舍" }],
  "zx-mathematics": [{ "title": "中学数学：一元二次方程x²-5x+6=0的解是？", "options": ["2,3", "1,6", "-2,-3", "无解"], "answer": "2,3" }, { "title": "中学数学：勾股定理适用于什么三角形？", "options": ["直角三角形", "锐角三角形", "钝角三角形", "任意三角形"], "answer": "直角三角形" }, { "title": "中学数学：圆的周长公式是？", "options": ["2πr", "πr²", "4/3πr³", "πd²"], "answer": "2πr" }, { "title": "中学数学：三角形的内角和是多少度？", "options": ["180°", "90°", "360°", "270°"], "answer": "180°" }, { "title": "中学数学：√16 = ?", "options": ["4", "8", "2", "16"], "answer": "4" }, { "title": "中学数学：函数y=2x+1的图像是？", "options": ["直线", "抛物线", "双曲线", "圆"], "answer": "直线" }, { "title": "中学数学：(a+b)² 展开等于？", "options": ["a²+2ab+b²", "a²+b²", "a²-2ab+b²", "2a+2b"], "answer": "a²+2ab+b²" }, { "title": "中学数学：圆的面积公式是？", "options": ["πr²", "2πr", "πd", "4πr²"], "answer": "πr²" }, { "title": "中学数学：2的5次方等于？", "options": ["32", "10", "25", "64"], "answer": "32" }, { "title": "中学数学：方程 2x - 6 = 0 的解是？", "options": ["x=3", "x=-3", "x=6", "x=12"], "answer": "x=3" }],
  "zx-politics": [{ "title": "中学政治：我国根本政治制度是？", "options": ["人民代表大会制度", "多党合作制", "民族区域自治", "基层群众自治"], "answer": "人民代表大会制度" }, { "title": "中学政治：社会主义核心价值观有多少个字？", "options": ["24", "12", "36", "48"], "answer": "24" }, { "title": "中学政治：我国最高国家权力机关是？", "options": ["全国人民代表大会", "国务院", "最高人民法院", "中央军委"], "answer": "全国人民代表大会" }, { "title": "中学政治：我国的根本大法是？", "options": ["宪法", "刑法", "民法典", "教育法"], "answer": "宪法" }, { "title": "中学政治：我国现行宪法颁布于哪一年？", "options": ["1982年", "1949年", "1954年", "1978年"], "answer": "1982年" }, { "title": "中学政治：我国基本经济制度中居主体地位的是？", "options": ["公有制经济", "私营经济", "外资经济", "个体经济"], "answer": "公有制经济" }, { "title": "中学政治：我国解决民族问题的基本政治制度是？", "options": ["民族区域自治制度", "一国两制", "联邦制", "多党制"], "answer": "民族区域自治制度" }, { "title": "中学政治：未成年人是指未满多少周岁的公民？", "options": ["18", "16", "14", "20"], "answer": "18" }, { "title": "中学政治：公民的基本义务不包括？", "options": ["必须出国旅游", "遵守宪法和法律", "依法纳税", "维护国家统一"], "answer": "必须出国旅游" }, { "title": "中学政治：我国的国家性质是？", "options": ["人民民主专政的社会主义国家", "资本主义国家", "君主立宪制国家", "联邦制国家"], "answer": "人民民主专政的社会主义国家" }],
  "zx-music": [{ "title": "中学音乐：贝多芬的《命运交响曲》是第几交响曲？", "options": ["第三", "第五", "第七", "第九"], "answer": "第五" }, { "title": "中学音乐：民族乐器二胡有几根弦？", "options": ["2", "4", "6", "8"], "answer": "2" }, { "title": "中学音乐：音乐中的'C大调'以哪个音为主音？", "options": ["do", "re", "mi", "fa"], "answer": "do" }, { "title": "中学音乐：《黄河大合唱》的作曲者是？", "options": ["冼星海", "聂耳", "贺绿汀", "刘天华"], "answer": "冼星海" }, { "title": "中学音乐：被称为'圆舞曲之王'的是？", "options": ["小约翰·施特劳斯", "贝多芬", "肖邦", "巴赫"], "answer": "小约翰·施特劳斯" }, { "title": "中学音乐：被称为'钢琴诗人'的是？", "options": ["肖邦", "李斯特", "贝多芬", "海顿"], "answer": "肖邦" }, { "title": "中学音乐：二胡名曲《二泉映月》的作者是？", "options": ["阿炳", "刘天华", "聂耳", "冼星海"], "answer": "阿炳" }, { "title": "中学音乐：4/4拍每小节有几拍？", "options": ["4", "2", "3", "6"], "answer": "4" }, { "title": "中学音乐：《高山流水》讲述的是谁的故事？", "options": ["伯牙与钟子期", "梁山伯与祝英台", "牛郎与织女", "刘备与诸葛亮"], "answer": "伯牙与钟子期" }, { "title": "中学音乐：小提琴有几根弦？", "options": ["4", "2", "6", "5"], "answer": "4" }],
  "zx-art": [{ "title": "中学艺术：达芬奇的代表作不包括？", "options": ["星空", "蒙娜丽莎", "最后的晚餐", "岩间圣母"], "answer": "星空" }, { "title": "中学艺术：中国传统绘画形式不包括？", "options": ["油画", "水墨画", "工笔画", "写意画"], "answer": "油画" }, { "title": "中学艺术：'文房四宝'不包括？", "options": ["砚台", "毛笔", "宣纸", "印章"], "answer": "印章" }, { "title": "中学艺术：《清明上河图》的作者是？", "options": ["张择端", "顾恺之", "吴道子", "齐白石"], "answer": "张择端" }, { "title": "中学艺术：油画《星空》的作者是？", "options": ["梵高", "莫奈", "毕加索", "达芬奇"], "answer": "梵高" }, { "title": "中学艺术：齐白石以画什么最为著名？", "options": ["虾", "马", "牛", "猫"], "answer": "虾" }, { "title": "中学艺术：徐悲鸿以画什么闻名？", "options": ["马", "虾", "竹", "兰"], "answer": "马" }, { "title": "中学艺术：颜料的三原色是？", "options": ["红、黄、蓝", "红、绿、蓝", "黑、白、灰", "橙、绿、紫"], "answer": "红、黄、蓝" }, { "title": "中学艺术：红色和黄色颜料混合得到？", "options": ["橙色", "绿色", "紫色", "蓝色"], "answer": "橙色" }, { "title": "中学艺术：《蒙娜丽莎》现收藏于？", "options": ["卢浮宫", "大英博物馆", "故宫博物院", "大都会艺术博物馆"], "answer": "卢浮宫" }],
  "zx-manner": [{ "title": "中学礼仪：正式场合的坐姿要求是？", "options": ["坐满椅子的2/3", "完全靠背", "翘二郎腿", "随意瘫坐"], "answer": "坐满椅子的2/3" }, { "title": "中学礼仪：与人握手时应该怎样做？", "options": ["力度适中", "用力摇晃", "轻轻触碰", "不伸手"], "answer": "力度适中" }, { "title": "中学礼仪：电话礼仪中，谁应该先挂电话？", "options": ["长辈或上级", "自己先挂", "同时挂", "无所谓"], "answer": "长辈或上级" }, { "title": "中学礼仪：升国旗、奏国歌时应该？", "options": ["肃立致敬", "继续走路", "交头接耳", "低头玩手机"], "answer": "肃立致敬" }, { "title": "中学礼仪：递交物品给他人时应该？", "options": ["双手递上", "单手扔过去", "背对对方", "放在地上"], "answer": "双手递上" }, { "title": "中学礼仪：别人发言时我们应该？", "options": ["认真倾听", "随意插话", "做鬼脸", "大声喧哗"], "answer": "认真倾听" }, { "title": "中学礼仪：乘坐自动扶梯时应该？", "options": ["靠右站立", "在上面奔跑", "逆行", "坐在台阶上"], "answer": "靠右站立" }, { "title": "中学礼仪：参观博物馆时应该？", "options": ["不触摸展品", "用手摸展品", "大声喊叫", "在展厅吃东西"], "answer": "不触摸展品" }, { "title": "中学礼仪：在餐桌上夹菜时应该？", "options": ["夹自己面前的菜", "在盘里翻来翻去", "站起来抢", "用手抓"], "answer": "夹自己面前的菜" }, { "title": "中学礼仪：借了同学的东西应该？", "options": ["按时归还", "据为己有", "弄坏不说", "借给别人"], "answer": "按时归还" }],
  "zx-pe": [{ "title": "中学体育：国际篮联规则中三分线距篮筐中心约为？", "options": ["6.75米", "5.5米", "8.5米", "9.5米"], "answer": "6.75米" }, { "title": "中学体育：足球比赛每队上场人数是？", "options": ["11", "9", "7", "5"], "answer": "11" }, { "title": "中学体育：排球比赛中每局最高得分是？", "options": ["25", "21", "15", "30"], "answer": "25" }, { "title": "中学体育：排球比赛每队上场几人？", "options": ["6", "5", "7", "11"], "answer": "6" }, { "title": "中学体育：奥运五环的颜色不包括？", "options": ["白色", "蓝色", "黄色", "绿色"], "answer": "白色" }, { "title": "中学体育：100米跑采用哪种起跑方式？", "options": ["蹲踞式起跑", "站立式起跑", "坐式起跑", "跪式起跑"], "answer": "蹲踞式起跑" }, { "title": "中学体育：篮球比赛中持球移动超过规定步数叫？", "options": ["走步", "两次运球", "打手", "三秒违例"], "answer": "走步" }, { "title": "中学体育：羽毛球比赛每局是多少分制？", "options": ["21分", "11分", "15分", "25分"], "answer": "21分" }, { "title": "中学体育：足球比赛全场常规时间是？", "options": ["90分钟", "60分钟", "80分钟", "120分钟"], "answer": "90分钟" }, { "title": "中学体育：中长跑测试主要测试什么能力？", "options": ["耐力", "柔韧性", "爆发力", "灵敏性"], "answer": "耐力" }],
  "zx-labouring": [{ "title": "中学劳技：安全用电的基本原则是？", "options": ["不接触低压带电体", "可随意拆卸电器", "湿手操作开关", "无特别要求"], "answer": "不接触低压带电体" }, { "title": "中学劳技：使用微波炉加热金属容器会？", "options": ["产生火花", "加热更快", "没有影响", "自动关机"], "answer": "产生火花" }, { "title": "中学劳技：心肺复苏的按压位置是？", "options": ["胸骨中下段", "腹部", "颈部", "背部"], "answer": "胸骨中下段" }, { "title": "中学劳技：发现有人触电，首先应该？", "options": ["切断电源", "直接用手拉", "用湿木棍拨开", "往他身上泼水"], "answer": "切断电源" }, { "title": "中学劳技：炒菜时油锅起火应该？", "options": ["盖上锅盖", "用水浇灭", "用嘴吹", "端着锅跑"], "answer": "盖上锅盖" }, { "title": "中学劳技：家庭电路中保险丝的作用是？", "options": ["电流过大时自动熔断", "增大电流", "照明", "储存电能"], "answer": "电流过大时自动熔断" }, { "title": "中学劳技：120是什么电话？", "options": ["急救电话", "火警电话", "报警电话", "查号电话"], "answer": "急救电话" }, { "title": "中学劳技：119是什么电话？", "options": ["火警电话", "急救电话", "报警电话", "天气预报电话"], "answer": "火警电话" }, { "title": "中学劳技：测量木板长度常用的工具是？", "options": ["卷尺", "温度计", "天平", "量筒"], "answer": "卷尺" }, { "title": "中学劳技：木工中的'榫卯'是指？", "options": ["一种凹凸结合的连接方式", "一种油漆", "一种钉子", "一种木材"], "answer": "一种凹凸结合的连接方式" }],
  "zx-wushu": [{ "title": "中学武术：太极拳的'四两拨千斤'体现什么原理？", "options": ["杠杆原理", "惯性原理", "浮力原理", "电磁原理"], "answer": "杠杆原理" }, { "title": "中学武术：武术中的'长拳'属于？", "options": ["外家拳", "内家拳", "气功", "硬功"], "answer": "外家拳" }, { "title": "中学武术：武术比赛场地通常是多大？", "options": ["14米×8米", "10米×10米", "20米×20米", "无固定大小"], "answer": "14米×8米" }, { "title": "中学武术：'内家三拳'是指太极拳、形意拳和？", "options": ["八卦掌", "少林拳", "咏春拳", "南拳"], "answer": "八卦掌" }, { "title": "中学武术：十八般兵器中被称为'百兵之王'的是？", "options": ["枪", "剑", "刀", "棍"], "answer": "枪" }, { "title": "中学武术：陈式太极拳的发源地陈家沟位于哪个省？", "options": ["河南", "河北", "山东", "湖北"], "answer": "河南" }, { "title": "中学武术：南拳主要流行于我国哪个地区？", "options": ["南方", "北方", "西北", "东北"], "answer": "南方" }, { "title": "中学武术：李小龙创立的武术流派是？", "options": ["截拳道", "咏春拳", "太极拳", "八极拳"], "answer": "截拳道" }, { "title": "中学武术：'五步拳'是哪一类拳术的基础套路？", "options": ["长拳", "太极拳", "南拳", "形意拳"], "answer": "长拳" }, { "title": "中学武术：十八般兵器中被称为'百兵之君'的是？", "options": ["剑", "枪", "刀", "棍"], "answer": "剑" }],
  "dx-chinese": [{ "title": "大学语文：鲁迅的第一篇白话小说是？", "options": ["狂人日记", "阿Q正传", "孔乙己", "祝福"], "answer": "狂人日记" }, { "title": "大学语文：《诗经》分为哪三部分？", "options": ["风、雅、颂", "赋、比、兴", "诗、书、礼", "天、地、人"], "answer": "风、雅、颂" }, { "title": "大学语文：'唐宋八大家'中唐代有几位？", "options": ["2", "4", "6", "8"], "answer": "2" }, { "title": "大学语文：《楚辞》的代表作家是？", "options": ["屈原", "宋玉", "司马相如", "贾谊"], "answer": "屈原" }, { "title": "大学语文：'唐宋八大家'中唐代的两位是韩愈和？", "options": ["柳宗元", "李白", "杜甫", "白居易"], "answer": "柳宗元" }, { "title": "大学语文：小说集《呐喊》的作者是？", "options": ["鲁迅", "郭沫若", "茅盾", "郁达夫"], "answer": "鲁迅" }, { "title": "大学语文：我国第一部纪传体通史是？", "options": ["《史记》", "《汉书》", "《资治通鉴》", "《左传》"], "answer": "《史记》" }, { "title": "大学语文：《资治通鉴》的主编是？", "options": ["司马光", "司马迁", "欧阳修", "班固"], "answer": "司马光" }, { "title": "大学语文：被称为'诗圣'的是？", "options": ["杜甫", "李白", "王维", "白居易"], "answer": "杜甫" }, { "title": "大学语文：《围城》的作者是？", "options": ["钱锺书", "沈从文", "老舍", "巴金"], "answer": "钱锺书" }],
  "dx-mathematics": [{ "title": "大学数学：微积分基本定理连接了？", "options": ["微分与积分", "代数与几何", "概率与统计", "线性与非线性"], "answer": "微分与积分" }, { "title": "大学数学：矩阵乘法满足什么律？", "options": ["结合律", "交换律", "分配律", "消去律"], "answer": "结合律" }, { "title": "大学数学：正态分布曲线呈什么形状？", "options": ["钟形", "直线", "U形", "S形"], "answer": "钟形" }, { "title": "大学数学：函数 f(x)=x² 的导数是？", "options": ["2x", "x", "x²", "2"], "answer": "2x" }, { "title": "大学数学：∫2x dx = ?", "options": ["x²+C", "2x²+C", "x+C", "2+C"], "answer": "x²+C" }, { "title": "大学数学：单位矩阵 I 乘以矩阵 A 等于？", "options": ["A", "0", "I", "A的转置"], "answer": "A" }, { "title": "大学数学：eˣ 的导数是？", "options": ["eˣ", "xeˣ⁻¹", "ln x", "1/x"], "answer": "eˣ" }, { "title": "大学数学：ln x 的导数是？", "options": ["1/x", "ln x", "eˣ", "x"], "answer": "1/x" }, { "title": "大学数学：抛一枚均匀硬币，正面朝上的概率是？", "options": ["1/2", "1/3", "1/4", "1"], "answer": "1/2" }, { "title": "大学数学：二阶行列式 |1 2; 3 4| 的值是？", "options": ["-2", "2", "10", "-10"], "answer": "-2" }],
  "dx-politics": [{ "title": "大学政治：'三个代表'重要思想的核心是？", "options": ["保持党的先进性", "发展生产力", "共同富裕", "依法治国"], "answer": "保持党的先进性" }, { "title": "大学政治：马克思主义的三个组成部分不包括？", "options": ["实用主义", "马克思主义哲学", "政治经济学", "科学社会主义"], "answer": "实用主义" }, { "title": "大学政治：'一带一路'是指？", "options": ["丝绸之路经济带和21世纪海上丝绸之路", "长江经济带和黄河经济带", "沿海开放带和内陆开发带", "东部振兴带和西部开发带"], "answer": "丝绸之路经济带和21世纪海上丝绸之路" }, { "title": "大学政治：马克思主义认识论首要和基本的观点是？", "options": ["实践的观点", "矛盾的观点", "发展的观点", "联系的观点"], "answer": "实践的观点" }, { "title": "大学政治：唯物辩证法的实质和核心是？", "options": ["对立统一规律", "质量互变规律", "否定之否定规律", "因果规律"], "answer": "对立统一规律" }, { "title": "大学政治：社会存在决定什么？", "options": ["社会意识", "生产力", "地理环境", "人口因素"], "answer": "社会意识" }, { "title": "大学政治：毛泽东思想活的灵魂不包括？", "options": ["改革开放", "实事求是", "群众路线", "独立自主"], "answer": "改革开放" }, { "title": "大学政治：《共产党宣言》发表于哪一年？", "options": ["1848年", "1867年", "1917年", "1921年"], "answer": "1848年" }, { "title": "大学政治：商品的两个因素是？", "options": ["使用价值和价值", "价格和成本", "供给和需求", "货币和信用"], "answer": "使用价值和价值" }, { "title": "大学政治：社会主义初级阶段基本路线的核心内容是？", "options": ["一个中心、两个基本点", "三个代表", "四项基本原则", "五位一体"], "answer": "一个中心、两个基本点" }],
  "dx-music": [{ "title": "大学音乐：西方音乐史上'音乐之父'指的是？", "options": ["巴赫", "贝多芬", "莫扎特", "海顿"], "answer": "巴赫" }, { "title": "大学音乐：交响乐通常有几个乐章？", "options": ["4", "3", "5", "2"], "answer": "4" }, { "title": "大学音乐：歌剧《图兰朵》中采用了哪首中国民歌？", "options": ["茉莉花", "梁祝", "二泉映月", "高山流水"], "answer": "茉莉花" }, { "title": "大学音乐：歌剧《卡门》的作曲者是？", "options": ["比才", "威尔第", "普契尼", "瓦格纳"], "answer": "比才" }, { "title": "大学音乐：被称为'交响乐之父'的是？", "options": ["海顿", "巴赫", "贝多芬", "莫扎特"], "answer": "海顿" }, { "title": "大学音乐：小提琴协奏曲《梁祝》的作曲者是？", "options": ["何占豪、陈钢", "聂耳、田汉", "冼星海、光未然", "刘天华、阿炳"], "answer": "何占豪、陈钢" }, { "title": "大学音乐：芭蕾舞剧《天鹅湖》的作曲者是？", "options": ["柴可夫斯基", "拉赫玛尼诺夫", "斯特拉文斯基", "肖斯塔科维奇"], "answer": "柴可夫斯基" }, { "title": "大学音乐：被称为'歌曲之王'的作曲家是？", "options": ["舒伯特", "舒曼", "勃拉姆斯", "门德尔松"], "answer": "舒伯特" }, { "title": "大学音乐：圆舞曲《蓝色多瑙河》的作曲者是？", "options": ["小约翰·施特劳斯", "理查·施特劳斯", "莫扎特", "李斯特"], "answer": "小约翰·施特劳斯" }, { "title": "大学音乐：《命运交响曲》的作曲者是？", "options": ["贝多芬", "莫扎特", "海顿", "舒伯特"], "answer": "贝多芬" }],
  "dx-art": [{ "title": "大学艺术：后印象派代表画家不包括？", "options": ["莫奈", "梵高", "塞尚", "高更"], "answer": "莫奈" }, { "title": "大学艺术：中国书法五种书体不包括？", "options": ["甲骨文", "篆书", "隶书", "楷书"], "answer": "甲骨文" }, { "title": "大学艺术：'文艺复兴三杰'不包括？", "options": ["卡拉瓦乔", "达芬奇", "米开朗基罗", "拉斐尔"], "answer": "卡拉瓦乔" }, { "title": "大学艺术：印象派的名称来源于哪幅画？", "options": ["《日出·印象》", "《星空》", "《向日葵》", "《睡莲》"], "answer": "《日出·印象》" }, { "title": "大学艺术：立体主义的代表画家是？", "options": ["毕加索", "莫奈", "梵高", "雷诺阿"], "answer": "毕加索" }, { "title": "大学艺术：油画《格尔尼卡》的作者是？", "options": ["毕加索", "达利", "马蒂斯", "米罗"], "answer": "毕加索" }, { "title": "大学艺术：超现实主义名作《记忆的永恒》的作者是？", "options": ["达利", "毕加索", "马格利特", "蒙克"], "answer": "达利" }, { "title": "大学艺术：油画《呐喊》的作者是？", "options": ["蒙克", "梵高", "克里姆特", "席勒"], "answer": "蒙克" }, { "title": "大学艺术：被誉为'书圣'的是？", "options": ["王羲之", "颜真卿", "柳公权", "欧阳询"], "answer": "王羲之" }, { "title": "大学艺术：雕塑《思想者》的作者是？", "options": ["罗丹", "米开朗基罗", "贝尔尼尼", "多纳泰罗"], "answer": "罗丹" }],
  "dx-manner": [{ "title": "大学礼仪：国际商务谈判中应避免？", "options": ["打断对方发言", "保持眼神交流", "认真倾听", "适度微笑"], "answer": "打断对方发言" }, { "title": "大学礼仪：西餐餐具使用顺序是？", "options": ["由外向内", "由内向外", "随意使用", "只用刀叉"], "answer": "由外向内" }, { "title": "大学礼仪：正式场合男士西装扣子怎么扣？", "options": ["最下面不扣", "全扣", "只扣中间", "不扣"], "answer": "最下面不扣" }, { "title": "大学礼仪：正式宴请中，主宾通常坐在主人的？", "options": ["右侧", "左侧", "对面", "门口"], "answer": "右侧" }, { "title": "大学礼仪：介绍他人时，通常应该？", "options": ["先把晚辈介绍给长辈", "先把长辈介绍给晚辈", "先把上级介绍给下级", "随意介绍"], "answer": "先把晚辈介绍给长辈" }, { "title": "大学礼仪：交换名片时应该？", "options": ["双手递接", "单手扔给对方", "接过直接塞进兜里", "当面在名片上写字"], "answer": "双手递接" }, { "title": "大学礼仪：吃西餐时刀叉一般怎么拿？", "options": ["右手持刀、左手持叉", "左手持刀、右手持叉", "双手持刀", "只用叉"], "answer": "右手持刀、左手持叉" }, { "title": "大学礼仪：西餐用餐中途暂时离席，刀叉应如何摆放？", "options": ["呈八字形放在盘上", "并排放在盘子右侧", "放在桌布上", "交给服务员"], "answer": "呈八字形放在盘上" }, { "title": "大学礼仪：着装的'TPO原则'指的是？", "options": ["时间、地点、场合", "品牌、价格、颜色", "身高、体重、年龄", "季节、天气、温度"], "answer": "时间、地点、场合" }, { "title": "大学礼仪：发送正式邮件时应该？", "options": ["写明主题并署名", "不写主题", "通篇使用表情", "群发给陌生人"], "answer": "写明主题并署名" }],
  "dx-pe": [{ "title": "大学体育：马拉松全程距离约为？", "options": ["42.195公里", "40公里", "45公里", "50公里"], "answer": "42.195公里" }, { "title": "大学体育：游泳比赛中不包含哪种泳姿？", "options": ["狗刨式", "自由泳", "蛙泳", "蝶泳"], "answer": "狗刨式" }, { "title": "大学体育：'三大球'不包括？", "options": ["乒乓球", "篮球", "足球", "排球"], "answer": "乒乓球" }, { "title": "大学体育：奥林匹克格言为'更快、更高、更强——'？", "options": ["更团结", "更友好", "更公平", "更和平"], "answer": "更团结" }, { "title": "大学体育：现代奥运会的创始人是？", "options": ["顾拜旦", "萨马兰奇", "罗格", "托马斯·巴赫"], "answer": "顾拜旦" }, { "title": "大学体育：北京首次举办夏季奥运会是哪一年？", "options": ["2008年", "2004年", "2012年", "2022年"], "answer": "2008年" }, { "title": "大学体育：网球比赛中'0分'通常称为？", "options": ["Love", "Zero", "Nil", "Duck"], "answer": "Love" }, { "title": "大学体育：铁人三项包括游泳、自行车和？", "options": ["跑步", "射击", "击剑", "马术"], "answer": "跑步" }, { "title": "大学体育：标准田径场第一道一圈的长度是？", "options": ["400米", "200米", "300米", "500米"], "answer": "400米" }, { "title": "大学体育：体重指数BMI的计算方法是？", "options": ["体重(kg)÷身高(m)²", "身高÷体重", "体重×身高", "体重÷年龄"], "answer": "体重(kg)÷身高(m)²" }],
  "dx-labouring": [{ "title": "大学劳技：实验室安全三要素不包括？", "options": ["速度", "防护", "规范", "应急"], "answer": "速度" }, { "title": "大学劳技：化学实验时应该？", "options": ["戴护目镜", "穿拖鞋", "长发不束起", "单独操作"], "answer": "戴护目镜" }, { "title": "大学劳技：灭火器使用方法是？", "options": ["提、拔、握、压", "摇、倒、泼、洒", "踢、打、摔、拿", "无固定方法"], "answer": "提、拔、握、压" }, { "title": "大学劳技：实验台上少量酒精着火，应该？", "options": ["用湿抹布盖灭", "用嘴吹灭", "用扇子扇", "端起来跑"], "answer": "用湿抹布盖灭" }, { "title": "大学劳技：稀释浓硫酸时应该？", "options": ["把浓硫酸慢慢倒入水中", "把水倒入浓硫酸中", "两者一起倒入猛搅", "先加热再混合"], "answer": "把浓硫酸慢慢倒入水中" }, { "title": "大学劳技：闻气体气味的正确方法是？", "options": ["用手轻轻扇动闻", "凑近容器口深吸", "用嘴尝", "倒在手上闻"], "answer": "用手轻轻扇动闻" }, { "title": "大学劳技：电器着火时不能用哪种方式灭火？", "options": ["用水浇", "先切断电源", "用干粉灭火器", "用二氧化碳灭火器"], "answer": "用水浇" }, { "title": "大学劳技：3D打印属于哪种制造方式？", "options": ["增材制造", "减材制造", "等材制造", "铸造"], "answer": "增材制造" }, { "title": "大学劳技：一般环境下的安全电压不超过？", "options": ["36伏", "220伏", "380伏", "1000伏"], "answer": "36伏" }, { "title": "大学劳技：皮肤溅上酸液后应立即？", "options": ["用大量清水冲洗", "用纸擦一下就行", "涂牙膏", "不用处理"], "answer": "用大量清水冲洗" }],
  "dx-wushu": [{ "title": "大学武术：武术段位制最高段位是？", "options": ["九段", "十段", "黑带", "无上限"], "answer": "九段" }, { "title": "大学武术：'内家三拳'不包括？", "options": ["少林拳", "太极拳", "形意拳", "八卦掌"], "answer": "少林拳" }, { "title": "大学武术：武术比赛评分标准不包括？", "options": ["服装价格", "动作规格", "演练水平", "创新难度"], "answer": "服装价格" }, { "title": "大学武术：八卦掌的创始人一般认为是？", "options": ["董海川", "张三丰", "孙禄堂", "霍元甲"], "answer": "董海川" }, { "title": "大学武术：创办'精武体育会'的武术家是？", "options": ["霍元甲", "黄飞鸿", "叶问", "李小龙"], "answer": "霍元甲" }, { "title": "大学武术：太极拳的主要流派不包括？", "options": ["少林式", "陈式", "杨式", "吴式"], "answer": "少林式" }, { "title": "大学武术：形意拳的基本拳法是？", "options": ["五行拳", "八卦掌", "太极推手", "截拳道"], "answer": "五行拳" }, { "title": "大学武术：黄飞鸿擅长的拳种是？", "options": ["洪拳", "太极拳", "形意拳", "八卦掌"], "answer": "洪拳" }, { "title": "大学武术：武术散打比赛的场地称为？", "options": ["擂台", "草坪", "泳池", "跑道"], "answer": "擂台" }, { "title": "大学武术：叶问传授的拳术是？", "options": ["咏春拳", "洪拳", "蔡李佛拳", "八极拳"], "answer": "咏春拳" }],
  "yjs-chinese": [{ "title": "研究生语文：《文心雕龙》的作者是？", "options": ["刘勰", "陆机", "钟嵘", "萧统"], "answer": "刘勰" }, { "title": "研究生语文：'建安七子'不包括？", "options": ["曹植", "孔融", "王粲", "陈琳"], "answer": "曹植" }, { "title": "研究生语文：《说文解字》的作者是？", "options": ["许慎", "郑玄", "贾谊", "班固"], "answer": "许慎" }, { "title": "研究生语文：《诗品》的作者是？", "options": ["钟嵘", "刘勰", "陆机", "曹丕"], "answer": "钟嵘" }, { "title": "研究生语文：《典论·论文》的作者是？", "options": ["曹丕", "曹植", "曹操", "陆机"], "answer": "曹丕" }, { "title": "研究生语文：《文赋》的作者是？", "options": ["陆机", "陆云", "刘勰", "钟嵘"], "answer": "陆机" }, { "title": "研究生语文：《昭明文选》的编者是？", "options": ["萧统", "萧纲", "徐陵", "刘义庆"], "answer": "萧统" }, { "title": "研究生语文：《世说新语》由谁组织编写？", "options": ["刘义庆", "干宝", "刘勰", "颜之推"], "answer": "刘义庆" }, { "title": "研究生语文：'桐城派'是哪个朝代的散文流派？", "options": ["清代", "明代", "宋代", "元代"], "answer": "清代" }, { "title": "研究生语文：《人间词话》的作者是？", "options": ["王国维", "梁启超", "胡适", "钱锺书"], "answer": "王国维" }],
  "yjs-mathematics": [{ "title": "研究生数学：lim(x→0) sinx/x = ?", "options": ["0", "1", "∞", "不存在"], "answer": "1" }, { "title": "研究生数学：黎曼猜想研究的是什么函数的零点分布？", "options": ["ζ函数", "Γ函数", "β函数", "δ函数"], "answer": "ζ函数" }, { "title": "研究生数学：哥德巴赫猜想的内容是？", "options": ["任一大于2的偶数可写成两个质数之和", "费马大定理", "四色定理", "庞加莱猜想"], "answer": "任一大于2的偶数可写成两个质数之和" }, { "title": "研究生数学：方阵可逆的充要条件是其行列式？", "options": ["不等于0", "等于0", "大于0", "等于1"], "answer": "不等于0" }, { "title": "研究生数学：lim(n→∞) (1+1/n)ⁿ = ?", "options": ["e", "1", "∞", "0"], "answer": "e" }, { "title": "研究生数学：调和级数 Σ1/n 是？", "options": ["发散的", "收敛于1", "收敛于2", "收敛于e"], "answer": "发散的" }, { "title": "研究生数学：费马大定理最终由谁证明？", "options": ["怀尔斯", "欧拉", "高斯", "陈景润"], "answer": "怀尔斯" }, { "title": "研究生数学：欧拉恒等式 e^(iπ) + 1 = ?", "options": ["0", "1", "-1", "i"], "answer": "0" }, { "title": "研究生数学：标准正态分布的方差是？", "options": ["1", "0", "0.5", "2"], "answer": "1" }, { "title": "研究生数学：矩阵的秩等于其？", "options": ["线性无关行向量的最大个数", "行数", "元素个数", "对角线元素之和"], "answer": "线性无关行向量的最大个数" }],
  "yjs-politics": [{ "title": "研究生政治：'四个全面'战略布局不包括？", "options": ["全面改革开放", "全面建成小康社会", "全面依法治国", "全面从严治党"], "answer": "全面改革开放" }, { "title": "研究生政治：新发展理念不包括？", "options": ["高速增长", "创新", "协调", "绿色"], "answer": "高速增长" }, { "title": "研究生政治：'一带一路'倡议提出的年份是？", "options": ["2013", "2010", "2015", "2018"], "answer": "2013" }, { "title": "研究生政治：党的十九大指出，我国社会主要矛盾是人民日益增长的美好生活需要和？", "options": ["不平衡不充分的发展之间的矛盾", "落后的社会生产之间的矛盾", "日益增长的物质文化需要之间的矛盾", "生产关系之间的矛盾"], "answer": "不平衡不充分的发展之间的矛盾" }, { "title": "研究生政治：'五位一体'总体布局不包括？", "options": ["军事建设", "经济建设", "政治建设", "生态文明建设"], "answer": "军事建设" }, { "title": "研究生政治：'两个一百年'中的第一个一百年是指？", "options": ["中国共产党成立一百年", "新中国成立一百年", "辛亥革命一百年", "改革开放一百年"], "answer": "中国共产党成立一百年" }, { "title": "研究生政治：剩余价值理论的提出者是？", "options": ["马克思", "亚当·斯密", "李嘉图", "凯恩斯"], "answer": "马克思" }, { "title": "研究生政治：我国宣告全面建成小康社会是在哪一年？", "options": ["2021年", "2010年", "2015年", "2035年"], "answer": "2021年" }, { "title": "研究生政治：改革开放始于哪次会议？", "options": ["十一届三中全会", "遵义会议", "中共七大", "中共十四大"], "answer": "十一届三中全会" }, { "title": "研究生政治：'绿水青山就是金山银山'体现的是哪一发展理念？", "options": ["绿色", "共享", "开放", "协调"], "answer": "绿色" }],
  "yjs-music": [{ "title": "研究生音乐：十二平均律最早由谁系统提出？", "options": ["朱载堉", "巴赫", "莫扎特", "贝多芬"], "answer": "朱载堉" }, { "title": "研究生音乐：歌剧《茶花女》的作曲者是？", "options": ["威尔第", "普契尼", "罗西尼", "多尼采蒂"], "answer": "威尔第" }, { "title": "研究生音乐：民族管弦乐队中不包含？", "options": ["萨克斯", "二胡", "琵琶", "笛子"], "answer": "萨克斯" }, { "title": "研究生音乐：瓦格纳最具代表性的作品体裁是？", "options": ["乐剧", "弦乐四重奏", "艺术歌曲", "钢琴奏鸣曲"], "answer": "乐剧" }, { "title": "研究生音乐：芭蕾舞剧《春之祭》的作曲者是？", "options": ["斯特拉文斯基", "德彪西", "拉威尔", "勋伯格"], "answer": "斯特拉文斯基" }, { "title": "研究生音乐：印象主义音乐的代表人物是？", "options": ["德彪西", "贝多芬", "巴赫", "亨德尔"], "answer": "德彪西" }, { "title": "研究生音乐：勋伯格创立的作曲技法是？", "options": ["十二音技法", "复调对位", "奏鸣曲式", "五声调式"], "answer": "十二音技法" }, { "title": "研究生音乐：中国传统五声音阶不包括？", "options": ["变徵", "宫", "商", "羽"], "answer": "变徵" }, { "title": "研究生音乐：清唱剧《弥赛亚》的作曲者是？", "options": ["亨德尔", "巴赫", "海顿", "莫扎特"], "answer": "亨德尔" }, { "title": "研究生音乐：作品编号 K.626 的《安魂曲》的作曲者是？", "options": ["莫扎特", "威尔第", "福雷", "勃拉姆斯"], "answer": "莫扎特" }],
  "yjs-art": [{ "title": "研究生艺术：艺术起源学说不包括？", "options": ["量子说", "模仿说", "游戏说", "表现说"], "answer": "量子说" }, { "title": "研究生艺术：'扬州八怪'的艺术风格是？", "options": ["革新派", "保守派", "宫廷派", "西化派"], "answer": "革新派" }, { "title": "研究生艺术：'六法论'中第一法是？", "options": ["气韵生动", "骨法用笔", "应物象形", "随类赋彩"], "answer": "气韵生动" }, { "title": "研究生艺术：谢赫'六法'出自哪部著作？", "options": ["《古画品录》", "《历代名画记》", "《林泉高致》", "《芥子园画谱》"], "answer": "《古画品录》" }, { "title": "研究生艺术：《历代名画记》的作者是？", "options": ["张彦远", "谢赫", "郭熙", "董其昌"], "answer": "张彦远" }, { "title": "研究生艺术：提出绘画'南北宗论'的明代书画家是？", "options": ["董其昌", "文徵明", "唐寅", "沈周"], "answer": "董其昌" }, { "title": "研究生艺术：《富春山居图》的作者是？", "options": ["黄公望", "倪瓒", "王蒙", "吴镇"], "answer": "黄公望" }, { "title": "研究生艺术：《千里江山图》的作者是？", "options": ["王希孟", "张择端", "赵孟頫", "李唐"], "answer": "王希孟" }, { "title": "研究生艺术：包豪斯设计学院创办于哪个国家？", "options": ["德国", "法国", "美国", "意大利"], "answer": "德国" }, { "title": "研究生艺术：装置作品《泉》的作者是？", "options": ["杜尚", "沃霍尔", "达利", "博伊斯"], "answer": "杜尚" }],
  "yjs-manner": [{ "title": "研究生礼仪：学术引用规范要求？", "options": ["注明出处", "随意引用", "完全复制", "无需标注"], "answer": "注明出处" }, { "title": "研究生礼仪：国际学术会议报告时间一般控制在？", "options": ["15-20分钟", "5分钟", "1小时", "无限制"], "answer": "15-20分钟" }, { "title": "研究生礼仪：学术论文投稿时应避免？", "options": ["一稿多投", "同行评议", "修改建议", "参考文献"], "answer": "一稿多投" }, { "title": "研究生礼仪：学术论文中引用他人观点而不注明出处属于？", "options": ["剽窃", "合理使用", "致谢", "综述"], "answer": "剽窃" }, { "title": "研究生礼仪：同行评审中，审稿人应该？", "options": ["对稿件内容保密", "公开稿件内容", "借用稿件观点发表", "拖延不审"], "answer": "对稿件内容保密" }, { "title": "研究生礼仪：学术会议上提问时应该？", "options": ["简短自我介绍后提问", "打断报告人", "长篇发表个人演讲", "进行人身攻击"], "answer": "简短自我介绍后提问" }, { "title": "研究生礼仪：论文作者署名应该依据？", "options": ["实际贡献", "职务高低", "关系亲疏", "资助金额"], "answer": "实际贡献" }, { "title": "研究生礼仪：给导师发邮件时恰当的做法是？", "options": ["写明主题、礼貌称呼并署名", "不写主题", "半夜连发多封催促", "满篇网络缩写"], "answer": "写明主题、礼貌称呼并署名" }, { "title": "研究生礼仪：实验数据造假属于？", "options": ["学术不端", "正常修正", "数据清洗", "统计方法"], "answer": "学术不端" }, { "title": "研究生礼仪：参加学术报告时手机应该？", "options": ["调成静音", "大声外放", "接打电话", "播放视频"], "answer": "调成静音" }],
  "yjs-pe": [{ "title": "研究生体育：最大摄氧量反映什么能力？", "options": ["有氧耐力", "爆发力", "柔韧性", "协调性"], "answer": "有氧耐力" }, { "title": "研究生体育：HIIT训练是指？", "options": ["高强度间歇训练", "低强度持续训练", "中等强度训练", "无氧训练"], "answer": "高强度间歇训练" }, { "title": "研究生体育：运动后补充蛋白质的最佳时间是？", "options": ["30分钟内", "2小时后", "运动前", "睡前"], "answer": "30分钟内" }, { "title": "研究生体育：人体运动时最主要的供能物质是？", "options": ["糖类", "维生素", "矿物质", "水"], "answer": "糖类" }, { "title": "研究生体育：肌肉收缩的直接能源物质是？", "options": ["ATP", "葡萄糖", "脂肪", "蛋白质"], "answer": "ATP" }, { "title": "研究生体育：成年人安静时心率的正常范围是？", "options": ["60-100次/分", "20-40次/分", "120-160次/分", "180-200次/分"], "answer": "60-100次/分" }, { "title": "研究生体育：发生运动性中暑时首先应该？", "options": ["转移到阴凉处并降温", "继续运动", "喝热水", "盖厚被子"], "answer": "转移到阴凉处并降温" }, { "title": "研究生体育：力量训练中的'RM'表示？", "options": ["最大重复次数", "休息时间", "训练组数", "心率区间"], "answer": "最大重复次数" }, { "title": "研究生体育：运动处方'FITT'原则中的F指？", "options": ["频率", "强度", "时间", "类型"], "answer": "频率" }, { "title": "研究生体育：人体体积最大的肌肉是？", "options": ["臀大肌", "肱二头肌", "三角肌", "腓肠肌"], "answer": "臀大肌" }],
  "yjs-labouring": [{ "title": "研究生劳技：实验数据记录的基本原则是？", "options": ["即时、真实、完整", "事后补记", "选择性记录", "美化数据"], "answer": "即时、真实、完整" }, { "title": "研究生劳技：实验室危险化学品应如何存放？", "options": ["专用柜双人双锁", "随意放置", "办公桌抽屉", "无特别要求"], "answer": "专用柜双人双锁" }, { "title": "研究生劳技：实验动物伦理原则不包括？", "options": ["随意处置", "减少使用", "优化方法", "减轻痛苦"], "answer": "随意处置" }, { "title": "研究生劳技：实验室废液应该？", "options": ["分类收集统一处理", "倒入下水道", "倒在花坛里", "随生活垃圾丢弃"], "answer": "分类收集统一处理" }, { "title": "研究生劳技：使用离心机时必须？", "options": ["对称配平", "开盖运行", "随意放置离心管", "运行中打开盖子"], "answer": "对称配平" }, { "title": "研究生劳技：高压蒸汽灭菌常用的温度是？", "options": ["121℃", "60℃", "80℃", "200℃"], "answer": "121℃" }, { "title": "研究生劳技：挥发性有毒试剂应在哪里操作？", "options": ["通风橱", "普通实验台", "走廊", "办公室"], "answer": "通风橱" }, { "title": "研究生劳技：实验记录本写错时应该？", "options": ["划线更正并注明", "撕掉重写", "用涂改液覆盖", "不予理会"], "answer": "划线更正并注明" }, { "title": "研究生劳技：操作液氮时需要特别防护的是？", "options": ["冻伤", "烫伤", "触电", "辐射"], "answer": "冻伤" }, { "title": "研究生劳技：化学品安全技术说明书（MSDS）主要提供？", "options": ["危害与防护信息", "仪器价格", "实验结果", "论文模板"], "answer": "危害与防护信息" }],
  "yjs-wushu": [{ "title": "研究生武术：'武术'一词最早见于？", "options": ["南朝《文选》", "《史记》", "《汉书》", "《论语》"], "answer": "南朝《文选》" }, { "title": "研究生武术：武术中的'十八般兵器'不包括？", "options": ["手枪", "刀", "枪", "剑"], "answer": "手枪" }, { "title": "研究生武术：太极拳列入人类非物质文化遗产代表作名录是在哪一年？", "options": ["2020", "2008", "2012", "2016"], "answer": "2020" }, { "title": "研究生武术：兵书《纪效新书》的作者是？", "options": ["戚继光", "俞大猷", "岳飞", "程宗猷"], "answer": "戚继光" }, { "title": "研究生武术：明代武术著作《剑经》的作者是？", "options": ["俞大猷", "戚继光", "程宗猷", "吴殳"], "answer": "俞大猷" }, { "title": "研究生武术：传说中武当武术的创始人是？", "options": ["张三丰", "达摩", "董海川", "孙禄堂"], "answer": "张三丰" }, { "title": "研究生武术：孙氏太极拳的创始人是？", "options": ["孙禄堂", "杨露禅", "陈王廷", "吴鉴泉"], "answer": "孙禄堂" }, { "title": "研究生武术：杨式太极拳的创始人是？", "options": ["杨露禅", "陈长兴", "武禹襄", "孙禄堂"], "answer": "杨露禅" }, { "title": "研究生武术：1936年柏林奥运会上，中国派出了哪支表演队？", "options": ["武术表演队", "舞狮队", "杂技团", "京剧团"], "answer": "武术表演队" }, { "title": "研究生武术：传说中与少林武术渊源最深的僧人是？", "options": ["达摩", "玄奘", "鉴真", "慧能"], "answer": "达摩" }]
};
const shuffle$1 = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
let open$9 = false;
function openExam(topic, pass) {
  const bank = EXAM[topic];
  if (open$9 || !bank?.length) return;
  open$9 = true;
  const questions = shuffle$1(bank).slice(0, 3).map((q) => ({ ...q, options: shuffle$1(q.options) }));
  const picked = questions.map(() => -1);
  let at = 0;
  const box2 = div("answerQuestions fC por");
  const remove = openFrame(div("ui-exam", box2));
  const close2 = () => {
    remove();
    open$9 = false;
  };
  const go = (d) => () => {
    if (d < 0 || picked[at] >= 0) at += d;
    render2();
  };
  const submit = () => {
    if (picked[at] < 0) return;
    close2();
    if (questions.every((q, i) => q.options[picked[i]] === q.answer)) pass();
    else windowView({ title: "升学结果", msg: "抱歉未通过！" });
  };
  function render2() {
    const q = questions[at];
    const last2 = at === questions.length - 1;
    const options = q.options.map(
      (o, i) => button(
        "aq_option fc",
        () => {
          picked[at] = i;
          render2();
        },
        div(i === picked[at] ? "choose chooseAQ" : "choose"),
        div("w0 f1", o)
      )
    );
    box2.replaceChildren(
      button("close", close2),
      div("a_title", "升学考试："),
      div(
        "a_Question fC f1",
        div("aq_title", q.title),
        div("aq_options fccw f1", ...options),
        div(
          "aq_buts fca",
          ...at ? [button("fcc wsnw aqb", go(-1), " 上一题 ")] : [],
          last2 ? button("fcc wsnw aqb", submit, " 提交 ") : button("fcc wsnw aqb", go(1), " 下一题 ")
        )
      )
    );
  }
  render2();
}
const PROVINCES = [
  {
    name: "北京市",
    extraordinaryEncounter: [
      {
        tolk: "[host]，故宫闭馆后石狮子突然眨眼，带你穿越到乾隆年间的御窑厂！",
        submitText: "触摸青铜獬豸"
      },
      {
        tolk: "[host]，中轴线地下传来编钟声，挖开发现正在举办‘元宇宙申遗大会’！",
        submitText: "跳数字舞"
      },
      {
        tolk: "[host]，故宫闭馆后太和殿丹陛石雕龙突然游动，带你找到乾隆秘密诗龛",
        submitText: "跟随龙影"
      }
    ]
  },
  {
    name: "天津市",
    extraordinaryEncounter: [
      {
        tolk: "[host]，海河浮现巨型煎饼果子云，咬一口能听懂相声演员的‘包袱密码’！",
        submitText: "对暗号‘嘛钱不钱的"
      },
      {
        tolk: "[host]，海河游船穿过解放桥时，整座铁桥突然变成1927年刚建成时的黄金色",
        submitText: "触摸桥柱"
      }
    ]
  },
  {
    name: "河北省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，正定古城墙浮现全息投影，赵云邀请你参加三国电竞大赛！",
        submitText: "选择武将"
      },
      {
        tolk: "[host]，山海关长城某块砖石浮现戚继光当年留下的倭寇血指印",
        submitText: "比对掌纹"
      }
    ]
  },
  {
    name: "山西省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，平遥地窖发现会说话的算盘，非要教你计算‘比特币挖矿收益率’！",
        submitText: "背诵圆周率"
      },
      {
        tolk: "[host]，平遥古城打更人带你走夜路，月光下所有商铺匾额都变成晋商密码",
        submitText: "破译暗号"
      }
    ]
  },
  {
    name: "内蒙古自治区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，敖包上的哈达突然组成二维码，扫码进入赛博那达慕大会！",
        submitText: "骑马造型自拍"
      },
      {
        tolk: "[host]，敖包山的经幡无风自动，拼出成吉思汗西征路线图",
        submitText: "记录图案"
      }
    ]
  },
  {
    name: "辽宁省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，沈阳故宫的铜鹤突然对你眨眼！守夜人说这是百年一见的‘灵物显圣’",
        submitText: "抚摸鹤翅"
      },
      {
        tolk: "[host]，旅顺口百年灯塔光束突然分成七色彩虹，指引出日俄战争沉船位置",
        submitText: "追逐光路"
      }
    ]
  },
  {
    name: "吉林省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，长白山的松鼠叼着人参果引路，带你找到温泉眼形成的天然镜面池",
        submitText: "对镜许愿"
      },
      {
        tolk: "[host]，长白山天池水面凝结成冰晶棋盘，朝鲜族老人说是仙人弈局",
        submitText: "落子对弈"
      }
    ]
  },
  {
    name: "黑龙江省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，鄂伦春猎人教你制作桦皮船！",
        submitText: "参与制作"
      },
      {
        tolk: "[host]，漠河北极村的极光组成鄂伦春萨满预言图案",
        submitText: "绘制星图"
      }
    ]
  },
  {
    name: "上海市",
    extraordinaryEncounter: [
      {
        tolk: "[host]，外滩建筑群玻璃幕墙反射的夕阳，恰好拼出1920年代股票走势图",
        submitText: "追逐光斑"
      },
      {
        tolk: "[host]，静安寺地铁站壁画里的1920年代绅士走出来请你喝咖啡",
        submitText: "选择座位"
      }
    ]
  },
  {
    name: "江苏省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，苏州绣娘传授‘双面三异绣’绝技！",
        submitText: "穿针引线"
      },
      {
        tolk: "[host]，寒山寺夜半钟声响起时，枫桥瞬间变成张继诗中的唐朝模样",
        submitText: "踏上古桥"
      }
    ]
  },
  {
    name: "浙江省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，龙井村的茶田浮现出巨型八卦阵，无人机航拍显示是茶树特殊排列形成的",
        submitText: "空中观赏"
      },
      {
        tolk: "[host]，千岛湖水下古城民居突然透出灯光，浮现1959年移民前的生活场景",
        submitText: "潜水探视"
      }
    ]
  },
  {
    name: "安徽省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，徽州木雕大师赠你《鲁班经》抄本！",
        submitText: "研习古法"
      },
      {
        tolk: "[host]，黄山云雾中惊现徐霞客当年登山路线荧光标记",
        submitText: "循迹攀登"
      }
    ]
  },
  {
    name: "福建省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，土楼天井落下的雨滴在半空凝成水珠，老华侨说这是‘南洋回魂雨’",
        submitText: "伸手接珠"
      },
      {
        tolk: "[host]，鼓浪屿钢琴博物馆所有琴键自动弹奏《爱拼才会赢》闽南语版本",
        submitText: "跟着哼唱"
      }
    ]
  },
  {
    name: "江西省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，景德镇老师傅教你鉴别元青花！",
        submitText: "上手观摩"
      },
      {
        tolk: "[host]，滕王阁电子屏突然显示王勃未公开的《豫章续赋》",
        submitText: "默诵诗句"
      }
    ]
  },
  {
    name: "山东省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，孔庙古柏的树瘤突然裂开，露出明代考生藏的诗文蜡丸",
        submitText: "朗读残篇"
      },
      {
        tolk: "[host]，泰山日出时云海显现孔子周游列国的动态地图",
        submitText: "辨认路线"
      }
    ]
  },
  {
    name: "河南省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，少林武僧传授‘易筋经’入门！",
        submitText: "扎马步"
      },
      {
        tolk: "[host]，少林寺古井水倒映出达摩面壁时的影子",
        submitText: "合十礼拜"
      }
    ]
  },
  {
    name: "湖北省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，长江轮渡经过时，江面浮现编钟形状的漩涡久久不散",
        submitText: "录制奇观"
      },
      {
        tolk: "[host]，武汉长江大桥钢梁浮现1957年通车时万人欢呼的声波纹路",
        submitText: "聆听回响"
      }
    ]
  },
  {
    name: "湖南省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，岳麓书院发现朱熹批注版《四书》！",
        submitText: "誊写笔记"
      },
      {
        tolk: "[host]，张家界石峰投影出《阿凡达》悬浮山原始设计稿",
        submitText: "寻找取景点"
      }
    ]
  },
  {
    name: "广东省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，醒狮队教你‘采青’绝活！",
        submitText: "舞动狮头"
      },
      {
        tolk: "[host]，广州塔霓虹变成十三行商船航海图",
        submitText: "辨认航线"
      }
    ]
  },
  {
    name: "广西壮族自治区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，漓江渔翁传授‘鱼鹰捕鱼’古法！",
        submitText: "尝试指挥"
      },
      {
        tolk: "[host]，漓江渔火自动排列成刘三姐对歌的壮文歌词",
        submitText: "学唱山歌"
      }
    ]
  },
  {
    name: "海南省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，黎族姑娘教你制作椰雕！",
        submitText: "雕刻图腾"
      },
      {
        tolk: "[host]，三亚免税店玻璃幕墙反射出1988年建省时的原始海岸线",
        submitText: "对比今昔"
      }
    ]
  },
  {
    name: "重庆市",
    extraordinaryEncounter: [
      {
        tolk: "[host]，山城棒棒军带你走通十八梯！",
        submitText: "体验负重"
      },
      {
        tolk: "[host]，轻轨穿楼时车厢突然变成1942年陪都时期的缆车",
        submitText: "观察乘客"
      }
    ]
  },
  {
    name: "四川省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，都江堰巧遇李冰后人讲解‘深淘滩低作堰’！",
        submitText: "测绘水势"
      },
      {
        tolk: "[host]，都江堰分流处江水自动画出李冰治水的原始工程图",
        submitText: "临摹水纹"
      }
    ]
  },
  {
    name: "贵州省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，苗寨银匠传授‘錾花’工艺！",
        submitText: "打造银饰"
      },
      {
        tolk: "[host]，FAST天眼接收到苗绣图案的射电信号",
        submitText: "解读密码"
      }
    ]
  },
  {
    name: "云南省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，丽江古城的石板路在月光下显现马帮商队的神秘荧光足迹",
        submitText: "赤脚追随"
      },
      {
        tolk: "[host]，丽江古城水流突然逆流，浮现茶马古道失踪马帮日记",
        submitText: "打捞记忆"
      }
    ]
  },
  {
    name: "西藏自治区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，转经筒突然发光显现六字真言！",
        submitText: "虔诚诵读"
      },
      {
        tolk: "[host]，布达拉宫金顶反射的阳光在广场拼出古藏文《格萨尔王传》选段",
        submitText: "拓印经文"
      }
    ]
  },
  {
    name: "陕西省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，兵马俑展馆闭馆后，某个陶俑的手指微微改变了姿势",
        submitText: "比对照片"
      },
      {
        tolk: "[host]，西安城墙箭垛浮现安西都护府将士的西域家书",
        submitText: "辨认墨迹"
      }
    ]
  },
  {
    name: "甘肃省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，沙漠夜空中突然出现与敦煌壁画完全一致的飞天星图",
        submitText: "临摹星轨"
      },
      {
        tolk: "[host]，莫高窟九层楼铃铛自发演奏失传的龟兹乐谱",
        submitText: "记录旋律"
      }
    ]
  },
  {
    name: "青海省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，塔尔寺活佛为你系上金刚结！",
        submitText: "接受祝福"
      },
      {
        tolk: "[host]，青海湖湟鱼群组成环湖自行车赛历年冠军名字",
        submitText: "寻找自己"
      }
    ]
  },
  {
    name: "宁夏回族自治区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，西夏王陵发现失传的《番汉合时掌中珠》！",
        submitText: "对照翻译"
      },
      {
        tolk: "[host]，贺兰山岩画自动续写西夏文未完成章节",
        submitText: "补全笔画"
      }
    ]
  },
  {
    name: "新疆维吾尔自治区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，喀什老城找到阿凡提手稿！",
        submitText: "研读智慧"
      },
      {
        tolk: "[host]，喀什老城土墙渗出千年汗血宝马的图腾",
        submitText: "触摸印记"
      }
    ]
  },
  {
    name: "台湾省",
    extraordinaryEncounter: [
      {
        tolk: "[host]，阿里山小火车穿过某段隧道时，窗外闪现1945年的老站牌幻影",
        submitText: "擦拭车窗"
      },
      {
        tolk: "[host]，阿里山小火车穿过樱花隧道时，窗外闪现1945年回归庆祝场景",
        submitText: "挥手致意"
      }
    ]
  },
  {
    name: "香港特别行政区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，庙街相士为你解读《通胜》玄机！",
        submitText: "求签问卜"
      },
      {
        tolk: "[host]，维多利亚港霓虹倒映出1960年代粤语片场布景",
        submitText: "寻找明星"
      }
    ]
  },
  {
    name: "澳门特别行政区",
    extraordinaryEncounter: [
      {
        tolk: "[host]，赌场老虎机突然全部显示‘777’，但机器其实都没通电",
        submitText: "触摸屏幕"
      },
      {
        tolk: "[host]，大三巴牌坊石雕突然演绎《牡丹亭》全本昆曲",
        submitText: "打拍跟唱"
      }
    ]
  },
  {
    name: "南海诸岛",
    extraordinaryEncounter: [
      {
        tolk: "[host]，潜水时发现宋代沉船‘南海一号’碎片！",
        submitText: "打捞文物"
      },
      {
        tolk: "[host]，永暑礁灯塔照射出郑和宝船队的航海日志投影",
        submitText: "阅读浪花"
      }
    ]
  }
];
const SUBJECTS = ["chinese", "mathematics", "politics", "music", "art", "manner", "pe", "labouring", "wushu"];
const SCHOOLS = [
  { max: 9, key: "xx", name: "" },
  { max: 30, key: "zx", name: "小学" },
  { max: 71, key: "dx", name: "中学" },
  { max: 167, key: "yjs", name: "大学" },
  { max: Infinity, key: "xwzj", name: "研究生" }
];
const school = (v) => SCHOOLS.find((s2) => v <= s2.max);
const subjectOf = (g) => g.id.split("-")[1];
const lessons = (g) => save.studyInfo[subjectOf(g)] - g.classNumUp;
const learn$1 = (k) => update("studyInfo", { [k]: save.studyInfo[k] + 1 });
const BUSY$1 = {
  work: "[host]，我正在打工呢，等下班再说吧~",
  study: "[host]，我正在上课呢，等下课再说吧~",
  trip: "[host]，我出门旅游啦，等我回来再说吧~"
};
function cannot(what, sad = what) {
  const doing = ["work", "study", "trip"].find((k) => activity(k));
  if (info.health === 0) speak$1({ c: "state", s: "die" });
  else if (info.health !== 5) speak$1({ s: `[host],我生病了无法${what}~~`, now: true, ai: false }, "speak");
  else if (save.settings.paused) speak$1({ s: `[host],我暂停成长拉！无法${what}~~`, now: true, ai: false }, "speak");
  else if (info.mood <= 0) speak$1({ s: `[host],没有心情哦！无法${sad}~~`, now: true, ai: false }, "speak");
  else if (doing) speak$1({ s: BUSY$1[doing], now: true, ai: false }, "speak");
  else return false;
  return true;
}
const diploma = (k, v) => school(v).name && school(v).name + goodOf("study", `xx-${k}`).object;
const workGoods = () => allGoods("work");
function describeWork(g) {
  const edu = Object.entries(g.education ?? {}).map(([k, v]) => diploma(k, v)).filter(Boolean).join("、");
  const req = ["charm", "intel", "strong"].filter((k) => g.useArtt?.[k]).map((k) => ` ${{ charm: "魅力", intel: "智力", strong: "武力" }[k]}：${g.useArtt[k]}`).join("");
  const a = attrs(g);
  const lines = [
    g.desc,
    g.yb && `元宝：${g.yb}`,
    g.needLevel ? `需要大于${g.needLevel}级~` : "无等级要求~",
    edu && `学历要求：${edu}`,
    req && `属性要求：${req}`,
    `工作时长：${g.useTime}分钟`,
    a && `属性：${a}`
  ];
  return lines.filter((l) => Boolean(l));
}
function work(g) {
  if (cannot("工作")) return false;
  let no = "";
  if (g.needLevel > save.petComputedlInfo.level) no = "[host]，我等级不够哦~";
  else if (Object.entries(g.useArtt ?? {}).some(([k, v]) => v > info[k])) no = "[host]，我还需要多吃，才能胜任这个工作哦！~";
  else if (Object.entries(g.education ?? {}).some(([k, v]) => v > save.studyInfo[k])) no = "[host]，书到用时方恨少啊，我一定要好好念书！~";
  if (no) {
    speak$1({ s: no, now: true }, "speak");
    return false;
  }
  speak$1({ s: "[host]，我开始工作了哦~", now: true }, "speak", { start: () => startTask(workTask(g), g.id) });
  return true;
}
const workTask = (g) => ({
  key: "work",
  minutes: g.useTime,
  end: () => {
    earnYb(g.yb);
    apply(g);
    addCount("Work");
    speak$1({ c: "state", s: "overWork", now: true }, "speak");
  }
});
const studyGoods = () => SUBJECTS.map((k) => {
  const g = goodOf("study", `${school(save.studyInfo[k]).key}-${k}`);
  return { ...g, name: g.tolkName };
});
function describeStudy(g) {
  const a = attrs(g);
  const lines = [g.desc, `课时：${g.classNum}`, `已学课时：${lessons(g)}`, a && `属性：${a}`, `学习时长：${g.useTime}分钟`];
  return lines.filter((l) => Boolean(l));
}
function examPrompt(g) {
  speak$1({ s: "[host]，我要升学啦，我一定好好考试！", b: "我要考试", now: true }, "speak", {
    ok: () => openExam(g.id, () => {
      speak$1({ s: "[host],好开心啊，我终于升学了！~", now: true }, "speak");
      learn$1(subjectOf(g));
    })
  });
}
function study(g) {
  if (cannot("学习")) return false;
  if (lessons(g) === g.classNum) {
    examPrompt(g);
    return false;
  }
  speak$1({ s: `[host]，我被分配到${rand(1e6, 9999999)}班学习${g.object},我放学就回来，不要太想念我哦~~~`, now: true }, "speak", {
    start: () => startTask(studyTask(g), g.id)
  });
  return true;
}
function studyTask(g) {
  const minutes = g.useTime;
  return {
    key: "study",
    minutes,
    // A clever pet may be let out of the last five minutes.
    early: (done) => done > minutes - 5 && rand(0, Math.max(200, 3e3 - info.intel / 10)) <= 10,
    end: (early) => {
      learn$1(subjectOf(g));
      apply(g);
      addCount("Study");
      if (lessons(g) === g.classNum) examPrompt(g);
      else speak$1({ c: "state", s: early ? "cententStudy" : "overStudy", now: true }, "speak");
    }
  };
}
function visit$1(name2) {
  const list2 = save.gameSaveDatas.travel_china;
  const old = list2.find((t) => t.name === name2);
  update("gameSaveDatas", { travel_china: old ? list2.map((t) => t === old ? { name: name2, value: t.value + 1 } : t) : [...list2, { name: name2, value: 1 }] });
  return !old;
}
function souvenir(isNew) {
  const [g] = loot(1, isNew ? 1 : 2);
  addGood(g.type, g.id, 1);
  windowView({ title: "旅游奇遇~~", msg: "带回物品~~", goods: [g] });
}
function back(p, early) {
  const isNew = visit$1(p.name);
  addCount("Travel1");
  void floatMood(20);
  setInfo("mood", Math.min(info.mood + 20, 1e3));
  const e = p.extraordinaryEncounter[rand(0, p.extraordinaryEncounter.length - 1)];
  speak$1({ s: e.tolk, b: e.submitText, now: true, ai: tripBack(p.name) }, "speak", early ? { ok: () => souvenir(isNew) } : {});
  const shot = takePhoto(p.name);
  if (!shot) return;
  mailPhoto(shot);
  const s2 = isBuddy(shot.id) ? "[host]，我在路上遇到了旅游搭子，一起拍了张合照，寄到邮箱啦~" : `[host]，我在${p.name}拍了张明信片寄给你，快去邮箱看看吧~`;
  speak$1({ s: s2, b: "这就去", ai: false }, "speak", { ok: openEmail });
}
function travel() {
  if (cannot("旅行了", "去旅游哦")) return;
  const p = PROVINCES[rand(0, PROVINCES.length - 1)];
  speak$1({ s: `[host]，我开始去${p.name}了哦~`, now: true }, "speak", { start: () => startTask(tripTask(p), p.name) });
}
const tripTask = (p) => ({
  key: "trip",
  minutes: 60,
  early: (done) => done > 55 && rand(0, 1e3 - luck() * 10) <= 10,
  end: (e) => back(p, e)
});
const REBUILD = {
  work: (v) => goodOf("work", v).useTime ? workTask(goodOf("work", v)) : null,
  study: (v) => goodOf("study", v).useTime ? studyTask(goodOf("study", v)) : null,
  trip: (v) => {
    const p = PROVINCES.find((x) => x.name === v);
    return p ? tripTask(p) : null;
  }
};
function resumeTask() {
  const key = ["work", "study", "trip"].find((k) => activity(k));
  const value = key ? activity(key) : "";
  update("activeOption", { work: null, study: null, trip: null });
  const t = key && info.health > 0 ? REBUILD[key](value) : null;
  if (!t) return;
  const offline = Math.max(Date.now() / 1e3 - save.nowTimeLine, 0) / 60;
  startTask(t, value, Math.min(Number(save.saveJsonData.activity ?? 0) + offline, t.minutes));
}
let open$8 = false;
function adopt(done) {
  if (open$8) return;
  open$8 = true;
  const host2 = div("adopt", button("but_small import", () => void window.qqpet.importSave().catch(() => windowView({ title: "导入存档", msg: "这不是有效的QQ宠物存档~" })), "导入存档"));
  const close2 = openBox(host2, { onClose: () => open$8 = false });
  void new SwfPlayer(host2).load("pet/reset/Adopt.swf");
  let choosing = false;
  window.ChooseAPI = {
    ChooseSex: (n) => {
      if (choosing) return;
      choosing = true;
      setTimeout(() => {
        if (!host2.isConnected) return;
        setInfo("sex", n === 0 ? "GG" : "MM");
        update("havePet", true);
        close2();
        open$8 = false;
        done();
      });
    }
  };
}
const G = 500;
const POWER = 80 / 100;
const DAMP = 0.55;
const STOP = 80;
const MIN = 280;
let fly = 0;
let vx = 0;
let vy = 0;
let t0 = 0;
let quit$1 = null;
let born = 0;
const clip = (v, max) => Math.min(Math.max(v, 0), max);
function stopFly() {
  if (fly) cancelAnimationFrame(fly);
  fly = 0;
}
function land(tossed) {
  stopFly();
  const s2 = petSize();
  setInfo("lastX", Math.round(clip(info.lastX, innerWidth - s2)));
  setInfo("lastY", Math.round(clip(info.lastY, innerHeight - s2)));
  if (playingDesk() !== "diudiule") return;
  machine.play({ a: "normal" });
  if (!tossed) return;
  const mood2 = Math.min(55, save.petComputedlInfo.moodMax - info.mood);
  setInfo("mood", info.mood + mood2);
  earnYb(1);
}
function step(now2) {
  if (playingDesk() !== "diudiule") return stopFly();
  const dt = Math.min((now2 - t0) / 1e3, 0.05);
  t0 = now2;
  vy += G * dt;
  const s2 = petSize();
  const maxX = innerWidth - s2;
  const maxY = innerHeight - s2;
  let x = info.lastX + vx * dt;
  let y = info.lastY + vy * dt;
  if (x < 0) {
    x = 0;
    vx = Math.abs(vx) * DAMP;
  } else if (x > maxX) {
    x = maxX;
    vx = -Math.abs(vx) * DAMP;
  }
  if (y < 0) {
    y = 0;
    vy = Math.abs(vy) * DAMP;
  } else if (y > maxY) {
    y = maxY;
    vy = -Math.abs(vy) * DAMP;
    vx *= 0.85;
  }
  setInfo("lastX", x);
  setInfo("lastY", y);
  if (now2 - born > 8e3 || y >= maxY - 0.5 && Math.abs(vy) < STOP && Math.abs(vx) < STOP * 1.5) return land(true);
  fly = requestAnimationFrame(step);
}
function catchDiudiule() {
  if (playingDesk() !== "diudiule" || !fly) return;
  stopFly();
}
function releaseDiudiule(lifted, sx, sy) {
  if (playingDesk() !== "diudiule") return false;
  stopFly();
  vx = sx * POWER;
  vy = sy * POWER;
  if (!lifted || Math.hypot(vx, vy) < MIN) {
    land(false);
    return true;
  }
  machine.play({
    a: "diudiule",
    opt: { url: `pet/smallGame/diudiule/Diudiule_${info.sex === "GG" ? 102 : 103}.swf`, opt: {} }
  });
  t0 = born = performance.now();
  fly = requestAnimationFrame(step);
  return true;
}
function stopDiudiule() {
  if (playingDesk() !== "diudiule") return;
  stopFly();
  quit$1?.remove();
  quit$1 = null;
  setDeskGame("");
  machine.play({ a: "normal" });
  addCount("GameRound");
  refreshTray();
}
function playDiudiule() {
  if (playingDesk()) return;
  if (stage$1() === "Egg") return speak$1({ s: "[host]，我还是个蛋呢，等破壳了再陪你玩~", now: true }, "speak");
  if (busy$2() || info.health < 5) return speak$1({ s: "[host]，我正忙着呢，忙完再陪你玩~", now: true }, "speak");
  setDeskGame("diudiule");
  setTray("game");
  const pet2 = document.getElementById("pet");
  quit$1 = Object.assign(button("quit", stopDiudiule), { title: "结束丢丢乐" });
  quit$1.dataset.hit = "";
  quit$1.addEventListener("pointerdown", (e) => e.stopPropagation());
  pet2.append(quit$1);
  speak$1({ s: "[host]，抓住我甩出去！看我飞多高~", now: true }, "appear");
}
const TALK = {
  /** A monster greets the pet. */
  taunt: [
    "哪来的小企鹅，敢闯我的地盘！",
    "嘿嘿，今天的点心自己送上门了~",
    "想过去？先问问我答不答应！",
    "本大王今天心情不好，你来得正好！",
    "又来一个不怕死的？",
    "站住！这条路是我开的，留下元宝再走！",
    "小不点儿，你是迷路了还是来找打的？",
    "哼，我已经等了一整天，总算来了个对手。",
    "再往前一步，我可就不客气啦！",
    "你身上有好吃的味道……嘿嘿嘿。",
    "我数到三，不跑的话后果自负！",
    "听说你很厉害？我偏不信！"
  ],
  /** {name} does this in the fight. */
  strike: [
    "张牙舞爪地扑了过来",
    "一声怪叫，掀起一阵沙土",
    "使出了看家本领",
    "绕着{pet}转圈圈想把它转晕",
    "猛地一个回马枪",
    "鼓起腮帮子吹出一阵怪风",
    "拍着胸脯大吼一声，震得树叶直掉",
    "使出一招“泰山压顶”跳了起来",
    "一甩尾巴扫了过来",
    "躲到石头后面偷偷扔小石子",
    "张开大嘴想把{pet}一口吞下"
  ],
  /** {name} gives up. */
  win: [
    "抱着脑袋逃走了：“下次再也不敢了！”",
    "扑通一声坐在地上认输了",
    "心服口服，答应再也不捣乱了",
    "眼冒金星，晕乎乎地举起了白旗",
    "哇地一声哭着跑回了老窝",
    "红着脸说：“算你厉害，这次就放你过去。”",
    "被逗得哈哈大笑，笑得没力气再打了",
    "一个跟头摔进了草丛里，半天爬不起来",
    "乖乖让开了路，还鞠了一个躬",
    "嘟囔着“今天状态不好”，灰溜溜地走了",
    "把偷来的东西全都交了出来"
  ],
  /** {name} wins. */
  loss: [
    "哈哈大笑，把{pet}赶出了它的地盘",
    "轻轻一推，{pet}就滚出去老远",
    "得意地拍拍手：“回去再练练吧！”",
    "一口气把{pet}吹回了荒地口",
    "叉着腰站在原地，{pet}只好掉头跑了",
    "一个喷嚏就把{pet}吓得躲到了石头后面",
    "把{pet}举起来转了三圈，又放回了路口",
    "大吼一声，{pet}的帽子都被吹飞了",
    "躲开了所有招数，还冲{pet}做了个鬼脸",
    "用尾巴把{pet}卷起来，扔回了来时的路上"
  ],
  decide: [
    "{pet}决定{t}！",
    "{pet}深吸一口气：就{t}吧！",
    "{pet}眼珠一转，选择了{t}。",
    "{pet}握紧小翅膀，准备{t}！",
    "“看我的！”{pet}决定{t}。",
    "{pet}想了想，还是{t}最稳妥。",
    "{pet}摆好架势，要跟它{t}！",
    "{pet}给自己打气：{t}，冲呀！",
    "{pet}悄悄定下主意——{t}。",
    "这一回，{pet}打算{t}。"
  ],
  beat: [
    "{pet}打败了{name}！",
    "{name}认输啦，{pet}赢了！",
    "胜利！{pet}把{name}打得服服帖帖。",
    "{pet}赢下了这一场，{name}再也不敢拦路了。",
    "好样的！{pet}战胜了{name}。",
    "{name}举起了白旗，这一仗{pet}赢了！",
    "{pet}凯旋而归，{name}甘拜下风。",
    "哇，{pet}居然真的打赢了{name}！",
    "{name}被{pet}收拾得明明白白。",
    "{pet}拍拍身上的灰：{name}，承让啦！"
  ],
  lost: [
    "{pet}输了……练练{said}，明天再来吧。",
    "这次没打过，{said}再高一点就好了，明天再来！",
    "{pet}灰头土脸地逃了回来，回去多练练{said}吧。",
    "差一点点！把{said}练上去，明天一定行。",
    "{pet}败下阵来，看来{said}还不够，明天再战！",
    "今天先撤退，等{said}长进了再来报仇。",
    "{pet}抹抹眼泪：我会练好{said}的，明天见！",
    "打不过就跑，不丢人！练练{said}明天再来。",
    "这一仗输了，{pet}暗暗发誓要把{said}练起来。",
    "对手太强啦，{said}再多一点就能赢，明天再试试。"
  ],
  fought: [
    "今天已经和{name}交过手了，明天再来吧。",
    "{name}今天不想再打了，明天再来找它吧。",
    "{name}躲在窝里不出来：“今天打够啦！”",
    "一天只能挑战一次，明天再来会会{name}吧。",
    "{name}还在揉肚子呢，明天再来吧。",
    "{name}挂出了“今日休战”的牌子。",
    "{name}打着哈欠：“明天，明天再打。”",
    "今天和{name}的账已经算过了，明天请早。",
    "{name}说要回去练练，明天再跟你比。",
    "{name}正在睡大觉，明天再来挑战吧。"
  ],
  /** The pet did an errand's part ({did}, ending in 了) and should go back to {from}. */
  done: [
    "{did}，回去告诉{from}吧！",
    "{did}！快去找{from}领谢礼~",
    "搞定！{did}，{from}一定很高兴。",
    "{did}，任务完成，{from}还在等我呢~",
    "耶，{did}！回去跟{from}说一声。",
    "{did}，现在就去找{from}吧！",
    "{did}～{from}一定在等好消息呢。",
    "{did}，赶紧回去向{from}报告！",
    "顺利！{did}，去{from}那儿领奖吧。",
    "{did}，{from}知道了肯定要夸我~"
  ],
  /** The pet found {from} hiding; they go back to {place}. */
  found: [
    "找到{from}啦！{from}说先回{place}，等我去领奖~",
    "抓到你了，{from}！{from}跑回{place}等我去领奖啦。",
    "原来{from}躲在这儿！快回{place}找{from}领奖吧。",
    "嘿，被我发现了吧{from}！{from}说在{place}等我。",
    "{from}藏得真好，可还是被我找到了！去{place}领奖~",
    "捉迷藏我赢啦！{from}已经回{place}了。",
    "{from}笑着认输了，约我去{place}领奖品。",
    "找到{from}了！{from}一溜烟跑回了{place}。",
    "就知道{from}在这儿！快去{place}找{from}吧。",
    "{from}被我逮到啦，说好在{place}给我发奖~"
  ],
  /** The pet tells the host what it got ({did}). Starts with [host], like every pet message to the host. */
  got: [
    "[host],我们{did}啦！~~",
    "[host],快看，我们{did}！~~",
    "[host],好开心，我们{did}！~~",
    "[host],告诉你个好消息，我们{did}！~~",
    "[host],嘿嘿，我们{did}啦~~",
    "[host],耶！我们{did}！~~",
    "[host],今天真棒，我们{did}！~~",
    "[host],你看你看，我们{did}啦！~~",
    "[host],太好啦，我们{did}！~~",
    "[host],夸夸我嘛，我们{did}！~~"
  ],
  /** 布袋长老 while a letter is out to {to}. */
  notYet: [
    "信还没送到呢！快去找{to}吧。",
    "哎呀，信还在你手里呢，{to}等着呢！",
    "先把这封信送给{to}，再来找老头子。",
    "{to}还没收到信呢，快去快去~",
    "别忘啦，这封信是给{to}的。",
    "老头子的信可不能耽搁，快送去给{to}！",
    "信送完了再来，{to}可盼着呢。",
    "你兜里还揣着给{to}的信呢！",
    "慢慢走不要紧，可别把给{to}的信弄丢了。",
    "{to}那封信还没送到，老头子可记着呢。"
  ],
  /** 布袋长老 once today's letters are all sent. */
  lettersDone: [
    "今天的信都送完啦，明天再来帮老头子跑腿吧~",
    "信都送光啦，老头子要去打个盹儿了。",
    "今天辛苦你啦，明天还有新的信等着你。",
    "信袋空空的，明天早上再来看看吧。",
    "今天的活儿都干完了，去玩吧孩子。",
    "没有信要送啦，明天再来找老头子。",
    "送信送得真快！明天再来帮忙吧。",
    "今天就到这儿，明天的信还没写好呢。",
    "信都送到了，大家都夸你呢！明天见。",
    "老头子的信袋今天已经见底啦。"
  ],
  /** 布袋长老 hands over {from}'s letter to {to}. */
  letterAsk: [
    "{from}有封信要交给{to}，帮老头子跑一趟吧！",
    "这儿有{from}写给{to}的信，你能帮忙送去吗？",
    "{from}托我给{to}捎封信，老头子腿脚慢，你去吧！",
    "一封信，从{from}那儿来，要送到{to}手里。",
    "快来快来，{from}给{to}写信啦，帮忙送一下！",
    "{to}有信！是{from}寄的，替老头子跑一趟吧。",
    "{from}的信要送给{to}，路上可别偷看哦~",
    "老头子这儿压着一封{from}给{to}的信呢。",
    "帮个忙吧，把{from}的信送去给{to}。",
    "{from}说这封信很要紧，得赶紧送到{to}那儿。"
  ],
  /** A line from a letter to {to}. */
  note: [
    "{to}，好久不见，有空来风语广场玩呀！",
    "{to}，上次的事谢谢你啦，改天请你吃点心。",
    "{to}，最近天气多变，记得照顾好自己哦。",
    "{to}，听说你那儿很热闹，我也想去看看。",
    "{to}，我新学了一个小把戏，下次表演给你看！",
    "{to}，你借我的东西我还留着，下次带给你。",
    "{to}，岛上最近好多新鲜事，见面慢慢聊。",
    "{to}，生日快乐！虽然晚了一点点。",
    "{to}，周末一起去夏帕海岸捡贝壳吧！",
    "{to}，我很想你，有空回封信吧。"
  ],
  /** Someone thanks the pet for a letter. */
  letterThanks: [
    "谢谢你帮我送信！",
    "哇，是给我的信！辛苦你跑一趟啦。",
    "收到啦，谢谢小信使~",
    "这封信我等好久了，谢谢你！",
    "信送得真及时，太感谢了！",
    "谢谢你！回头替我向布袋长老问好。",
    "辛苦啦，路上没淋着雨吧？",
    "好开心，有人记得给我写信！谢谢你送来。",
    "你真是岛上最快的小信使！",
    "谢谢谢谢，我这就拆开看看~"
  ],
  /** Every islander of {place} has had a letter now. */
  lamp: [
    "{place}的岛民都收到过信啦，送你一份大礼包！",
    "{place}家家户户都收到你的信啦，这份大礼包归你！",
    "整个{place}都被你跑遍了，大礼包拿好！",
    "{place}的信全送到啦，大家凑了一份大礼包给你。",
    "你把{place}的信都送齐了，奖励一份大礼包！",
    "{place}的每一位岛民都认识你啦，送你大礼包~",
    "{place}的信一封不落，了不起！大礼包送上。",
    "{place}的岛民们托我把这份大礼包交给你。",
    "恭喜！{place}的信全部送达，大礼包到手！",
    "{place}已经全部点亮啦，这份大礼包是你的。"
  ],
  /** The giver, once today's errand is done. */
  helped: [
    "今天多亏你帮忙啦，明天再来玩吧~",
    "今天的事都办好啦，谢谢你，明天见！",
    "有你帮忙真好，明天再来看看我吧。",
    "今天就不麻烦你啦，明天再找你帮忙~",
    "谢谢你今天跑前跑后，快去玩吧！",
    "今天的谢礼已经给你啦，明天还有新的事哦。",
    "你今天可帮了大忙，明天见~",
    "事情都办妥啦，去别处转转吧！",
    "今天没别的事啦，明天早上再来吧。",
    "真是个好帮手！明天再来找我玩。"
  ],
  /** The giver, once today's quiz was answered wrong. */
  failed: [
    "今天的题没答对，明天再来考你~",
    "没关系，明天换一道题再考你！",
    "今天就到这儿吧，回去多看看书，明天再来。",
    "一次机会已经用掉啦，明天再试试吧。",
    "别灰心，明天的题说不定更简单。",
    "答错了也没事，明天再来挑战！",
    "今天的考试结束啦，明天继续加油~",
    "回去好好想想，明天再来找我答题。",
    "明天我再出一道，你可要答对哦！",
    "学习贵在坚持，明天再来吧。"
  ],
  /** A wrong answer; {answer} is the right one. */
  wrong: [
    "答错啦，正确答案是「{answer}」。明天再来考你！",
    "哎呀，不对哦，应该是「{answer}」。明天再来！",
    "差一点！答案是「{answer}」，记住啦？",
    "不是这个哦，正确的是「{answer}」，明天再考你。",
    "错啦错啦，是「{answer}」！明天再来挑战吧。",
    "可惜！「{answer}」才是对的。",
    "这题答案是「{answer}」，下次可别再错啦。",
    "嗯……不对，是「{answer}」。回去多复习复习！",
    "答案揭晓：「{answer}」！明天再来吧。",
    "没答对哦，正解是「{answer}」，明天见~"
  ],
  /** The giver thanks the pet and hands over the reward. */
  thanks: [
    "太谢谢你啦，这是我的一点心意~",
    "你真是个好帮手！这些送给你。",
    "帮大忙啦，谢礼收下吧！",
    "谢谢你！这点小礼物别嫌弃哦。",
    "多亏有你，这是给你的奖励~",
    "办得真漂亮！拿着，这是谢礼。",
    "哇，这么快就办好啦！谢谢谢谢~",
    "你可帮了我大忙，这些都给你。",
    "谢谢小可爱，下次还找你帮忙！",
    "一点心意，请一定要收下哦。"
  ],
  /** A made-up errand's ask: {what} is the job. */
  ask: [
    "能帮我{what}吗？",
    "有件事想拜托你：{what}，好不好？",
    "你来得正好！帮我{what}吧。",
    "我走不开，你能替我{what}吗？",
    "求求你啦，帮我{what}~",
    "小企鹅，帮个忙：{what}。",
    "今天就拜托你{what}啦！",
    "能不能请你{what}？谢礼少不了你的。",
    "我有个小心愿：{what}，你愿意帮我吗？",
    "嘿，有空吗？帮我{what}吧！"
  ],
  /** Someone got a message passed on from {from}. */
  reply: [
    "知道啦，替我谢谢{from}！",
    "好的好的，我记下了，帮我跟{from}问声好。",
    "原来是{from}让你来的呀，我明白啦！",
    "收到！你回去告诉{from}，我会办好的。",
    "谢谢你跑一趟，替我向{from}道声谢。",
    "{from}真是的，还专门让你来说，我知道啦~",
    "好嘞，告诉{from}放心吧！",
    "明白了，改天我亲自去找{from}。",
    "辛苦你啦！{from}的话我都听见了。",
    "嗯嗯，跟{from}说我晓得了。"
  ],
  /** Small talk when nothing else is going on. */
  chat: [
    "今天天气真不错呀~",
    "你好呀，小企鹅！今天过得怎么样？",
    "最近岛上可热闹了，你去风语广场看过没？",
    "我刚忙完，正想找人说说话呢。",
    "路过呀？进来歇歇脚吧~",
    "听说东郊荒地又闹妖怪了，你可要小心。",
    "你今天吃饱了吗？可别饿着肚子到处跑。",
    "嘿嘿，又见面啦！",
    "科洛那儿贴着好多求助，有空去看看吧。",
    "今天风好大，我的帽子差点被吹跑。",
    "你身上香香的，刚洗过澡吧？"
  ],
  /** 天使坏坏 before the next growth gift at level {next}; one every {tier} levels. */
  growWait: [
    "每长{tier}级来找我领一次成长奖励哦，{next}级的时候再来吧~",
    "还没到{next}级呢，再长大一点点再来！",
    "等你长到{next}级，我就把礼物给你。",
    "加油长大吧，{next}级的时候来找我~",
    "礼物我都准备好了，就等你{next}级啦。",
    "再努努力，到{next}级就能领奖励啦！",
    "现在还早呢，{next}级再来吧。",
    "嘻嘻，{next}级的时候才有惊喜哦。",
    "离{next}级不远啦，快去多玩一会儿！",
    "下一份成长礼要到{next}级才能拿哦。"
  ],
  /** 天使坏坏 hands out a growth gift at level {level}. */
  grow: [
    "哇，{level}级啦，长得真快！这是给你的成长奖励~",
    "{level}级了呀！奖励拿好，继续加油！",
    "恭喜长到{level}级！这份礼物送给你。",
    "{level}级的小企鹅，真了不起！收下奖励吧。",
    "都{level}级啦，我都快认不出你了！奖励给你~",
    "看看是谁长到{level}级啦？奖励奉上！",
    "{level}级！天使坏坏为你骄傲，礼物拿去吧。",
    "长大一点点就有一点点奖励，{level}级快乐！",
    "{level}级的成长礼来啦，快拆开看看！",
    "你已经{level}级了，这是你应得的奖励~"
  ],
  /** 图图 after today's piece was given. */
  pieceGiven: [
    "今天的碎片已经给过你啦，明天再来吧！",
    "一天只有一张碎片哦，明天再来找我。",
    "碎片今天发完啦，明天早上再来吧~",
    "别急别急，宝藏又跑不掉，明天再来拿碎片。",
    "今天那张已经在你手里啦！",
    "我这儿今天没有碎片了，明天见~",
    "贪心可挖不到宝藏哦，明天再来吧。",
    "明天还有新的碎片，记得来拿！",
    "今天的份已经给你了，好好收着。",
    "嘘——明天我再偷偷给你一张。"
  ],
  /** 图图 gives a piece. */
  piece: [
    "给你一张宝藏图碎片！",
    "嘘，这张碎片上画着一个红叉叉……收好！",
    "又找到一张碎片，送给你啦。",
    "拿着，这张碎片可是我从海里捞上来的。",
    "碎片一张，离宝藏又近了一步！",
    "这张碎片有点皱，不过上面的路线还看得清。",
    "给你！集齐了别忘了叫我一起挖。",
    "今天的碎片闻起来有一股椰子味儿~",
    "这张碎片的角上画着一只海鸥，好神秘。",
    "收好这张碎片，宝藏在向你招手呢！"
  ],
  /** 图图 when the map's {pieces} pieces are whole. */
  dug: [
    "{pieces}张碎片拼成了完整的宝藏图，挖到宝藏啦！",
    "宝藏图拼好啦！挖呀挖……挖到了！",
    "哇，宝箱打开了，闪闪发光的全是宝贝！",
    "藏宝图完整了，宝藏就在脚下，归你啦！",
    "叮！铁锹碰到了宝箱，咱们发财啦！",
    "你真厉害，集齐了所有碎片，宝藏是你的！",
    "宝藏终于重见天日，快看看里面有什么！",
    "我就知道你能行！宝藏挖出来啦！",
    "红叉叉下面果然有宝箱，快打开！",
    "恭喜恭喜，这份宝藏属于最有耐心的你！"
  ],
  /** 小艾 after today's gift. */
  loved: [
    "谢谢你今天的爱心，明天再来看看我吧~",
    "今天收到你的礼物好开心，明天见！",
    "我今天很满足啦，明天再来陪我玩吧。",
    "你的礼物我放在床头了，明天再来哦~",
    "今天谢谢你啦，明天我再告诉你新的心愿。",
    "有你这样的朋友真好，明天见！",
    "今天的心愿已经实现啦，嘻嘻。",
    "明天我还会想要别的东西，记得来哦~",
    "谢谢你，今天是开心的一天！",
    "我会好好珍惜你送的礼物的，明天见~"
  ],
  /** 小艾 wishes for {want}. */
  want: [
    "我今天想要一个{want}，你能帮我找一个来吗？",
    "好想要一个{want}呀……你能帮帮我吗？",
    "要是有一个{want}就好了，你能找到吗？",
    "今天的心愿是{want}！拜托你啦~",
    "我在想{want}，你那儿有没有呀？",
    "能送我一个{want}吗？我会好好珍惜的。",
    "听说商店里有{want}，你能帮我带一个来吗？",
    "{want}、{want}，我做梦都梦到{want}啦！",
    "你能帮我找一个{want}吗？小艾会很开心的！",
    "今天我最想要的就是{want}了。"
  ],
  /** 小艾 sees the pet carrying {want}. */
  brought: [
    "你带来了{want}！可以送给我吗？",
    "哇，是{want}！是给我的吗？",
    "我闻到{want}的味道了！可以给我吗？",
    "你真的找到{want}啦？能送给小艾吗？",
    "{want}！就是这个！可以给我吗？",
    "天哪，你带着{want}！可不可以送我呀？",
    "这个{want}好漂亮……能给我吗？",
    "你手里的是{want}吗？我好想要！",
    "小艾的心愿要实现了吗？{want}可以给我吗？",
    "是{want}耶！能送给我吗？拜托拜托~"
  ],
  /** 小艾 thanks the pet for the gift. */
  gifted: [
    "太谢谢你啦！这是我的一点心意~",
    "我好开心！这些送给你当回礼。",
    "谢谢你实现了我的心愿，这个给你！",
    "你是小艾最好的朋友！收下回礼吧。",
    "哇，我要把它放在最显眼的地方！谢谢你~",
    "谢谢！小艾也有礼物送给你哦。",
    "心愿实现啦！这些都给你。",
    "你真好！这份谢礼请一定收下。",
    "今天是最开心的一天，谢谢你！",
    "我会好好珍惜的，这是给你的回礼~"
  ]
};
const SAYS = {
  closed: [
    "这里已经关门啦，下次再来吧~",
    "门上挂着“暂停营业”的牌子……",
    "咦，这里怎么锁上了？",
    "敲了敲门，没有人应。",
    "好像来晚了，人家已经下班啦。",
    "这里在装修呢，进不去~",
    "门口贴着纸条：改天再来。",
    "里面黑漆漆的，没人在。",
    "哎呀，今天不开门呢。",
    "算了，下次再来逛这儿吧。"
  ],
  road: [
    "前面的路还没修好，过不去呢~",
    "前面挡着路障，绕不过去……",
    "这条路在施工，换个地方去吧。",
    "路被石头堵住了，过不去呀。",
    "前面好像不能走，回去吧~",
    "这边还没开放哦。",
    "路牌上写着：此路不通。",
    "前面雾太大了，看不清路，不去了。",
    "桥还没搭好，过不去呢。",
    "这里过不去，换条路吧。"
  ],
  home: [
    "家园暂不支持哦~",
    "家园还在装修，暂时回不去~",
    "家园的门还没做好，暂不支持哦。",
    "家园功能还没开放呢~",
    "想回家园？现在还不行哦。",
    "家园暂时去不了，先在岛上玩吧~",
    "家园的钥匙还没找到，暂不支持~",
    "家园还没准备好，下次吧。",
    "这里还不能去家园哦。",
    "家园暂不支持，岛上更好玩~"
  ],
  friends: [
    "好友暂不支持哦~",
    "好友功能还没开放呢~",
    "好友列表暂时打不开哦。",
    "现在还不能加好友呢~",
    "好友暂不支持，岛民们都是我的朋友~",
    "好友功能还在路上，暂不支持。",
    "没有网络的地方交不了好友哦~",
    "好友暂时用不了，先跟岛民聊聊吧。",
    "好友还不支持，下次吧~",
    "好友功能暂未开放哦。"
  ]
};
const shopTj = { "food": [["102010001", "102010074", "102010075", "102010003", "102010012", "102010004", "102010016", "102010010"]], "clean": [["102020003", "102020052", "102020053", "102020012", "102020001", "102020005", "102020006", "102020002"]], "medicine": [["10001", "40002", "60001"]] };
const shopWy = { "food": [["100010282", "102010005", "102010023", "102010087", "102010008", "102010011", "102010034", "102010086"], ["102010006", "102010025", "102010028", "102010027", "102010002", "102010026", "102010033", "102010029"], ["102010030", "102010013", "102010024", "102010032", "102010092", "102010007", "102010009", "102010085"], ["102010004", "102010016", "102010003", "102010012", "102010001", "102010031", "102010091", "102010015"], ["102010021", "102010022", "102010088", "102010089", "102010094", "102010095", "102010090", "102010010"], ["102010014", "102010020", "102010076", "102010075", "102010074", "102010078", "102010077"]], "clean": [["102020002", "102020017", "102020001", "102020005", "102020003", "102020008", "102020023", "102020007"], ["102020019", "102020006", "102020009", "102020020", "102020010", "102020011", "102020024", "102020021"], ["102020013", "102020012", "102020016", "102020022", "102020014", "102020015", "102020053", "102020052"], ["102020051", "102020055", "102020054"]], "medicine": [["10001", "10002", "10003", "10004", "10005", "20001", "20002", "20003"], ["20004", "20005", "30001", "30002", "30003", "30004", "30005", "60001"], ["50001", "40001", "40002", "40003", "40004", "40005"]] };
const shopGN = { "toy": [["t0001", "t0002", "t0003", "t0004", "t0005", "t0006", "t0007", "t0008"], ["t0009", "t0010", "t0011", "t0012", "t0013", "t0014", "t0015", "t0016"], ["t0017", "t0018", "t0019", "t0020", "t0021", "t0022", "t0023", "t0024"], ["t0025", "t0026", "t0027"]], "nums": [["yb", "ybCut", "growth", "growthCut", "health"]] };
const shopZB = { "background": [["b0000000", "b0000001", "b0000002", "b0000003", "b0000004", "b0000005", "b0000006", "b0000010"], ["b0000011", "b0000013"]] };
const SHOP = {
  shopTj,
  shopWy,
  shopGN,
  shopZB
};
const MINE = [
  {
    label: "喂养",
    cls: "selfwy",
    children: [
      { label: "食品", type: "food" },
      { label: "日用品", type: "clean" },
      { label: "药品", type: "medicine" }
    ]
  },
  {
    label: "功能",
    cls: "selfgn",
    children: [
      { label: "玩具", type: "toy" },
      { label: "属性", type: "nums" }
    ]
  },
  {
    label: "装扮",
    cls: "selfzb",
    children: [{ label: "背景", type: "background" }]
  }
];
const MALL = [
  {
    label: "推荐",
    cls: "shopTj",
    children: [
      { label: "食品", type: "food" },
      { label: "日用品", type: "clean" },
      { label: "药品", type: "medicine" }
    ]
  },
  {
    label: "喂养",
    cls: "shopWy",
    children: [
      { label: "食品", type: "food" },
      { label: "日用品", type: "clean" },
      { label: "药品", type: "medicine" }
    ]
  },
  {
    label: "功能",
    cls: "shopGN",
    children: [
      { label: "玩具", type: "toy" },
      { label: "属性", type: "nums" }
    ]
  },
  {
    label: "装扮",
    cls: "shopZB",
    children: [{ label: "背景", type: "background" }]
  }
];
const PAGES$1 = SHOP;
const SOLD = new Set(Object.values(PAGES$1).flatMap((tab) => Object.values(tab).flat(2)));
const slot = (k) => ({
  x: k % 2 ? 590 : 375,
  y: 117 + 119 * Math.floor(k / 2)
});
const CART = { x: 715, y: 550 };
const blocked = (g) => g.needLevel ? g.needLevel > save.petComputedlInfo.level ? 1 : 0 : g.PD && !info.pinkDiamond ? 2 : 0;
function tabs(prefix, list2, tab, sub, pick2) {
  return [
    div(`${prefix}_top`, ...list2.map((t, i) => button(`${prefix}_t_onve ${t.cls}${i === tab ? " active" : ""}`, () => i !== tab && pick2(i, 0)))),
    div(
      `${prefix}_dowm`,
      ...list2[tab].children.map(
        (c, i) => button(`${prefix}_dowmOnce${i === sub ? " active" : ""}`, () => i !== sub && pick2(tab, i), div(`${prefix}_dowmOnceText`, c.label))
      )
    )
  ];
}
function pager(prefix, page, total, go) {
  const to = (p) => () => {
    if (p >= 1 && p <= total && p !== page) go(p);
  };
  return [
    Object.assign(button(`${prefix}_upMore`, to(1)), { title: "第一页" }),
    Object.assign(button(`${prefix}_up`, to(page - 1)), { title: "上一页" }),
    div(`${prefix}_text fcc`, div(`${prefix}_current`, String(page)), " / ", div(`${prefix}_totalPage`, String(total))),
    Object.assign(button(`${prefix}_down`, to(page + 1)), { title: "下一页" }),
    Object.assign(button(`${prefix}_downMore`, to(total)), {
      title: "最后一页"
    })
  ];
}
const tooltip = (g) => div("goodFloatMsg", div("goodName", g.name), ...describe(g).map((l) => div("goodDatas", l)));
let close$3 = null;
function openShop() {
  if (close$3) return;
  const left = div("leftSelf");
  const right = div("rightShpping");
  const cartList = div("cartGoodList");
  const cartCount = div("cg_total fcc");
  const cartTotal = div("cg_totalPay f1 fcc");
  const cartMark = div("markFull fcc");
  const busyMark = div("markFull fcc", "购买中，请稍后···");
  const fly2 = div("markFullNone");
  cartMark.style.display = busyMark.style.display = "none";
  let mine = { tab: 0, sub: 0, page: 1 };
  let mall = { tab: 0, sub: 0, page: 1 };
  const cart = /* @__PURE__ */ new Map();
  function drawLeft(next2 = mine) {
    mine = next2;
    const type = MINE[mine.tab].children[mine.sub].type;
    mine.page = Math.min(mine.page, Math.max(Math.ceil(save.selfGoodDatas[type].length / 6), 1));
    const { list: list2, totalPage } = listGoods(type, mine.page, 6);
    const bg = save.selfGoodUseOption.background;
    left.replaceChildren(
      div(
        "leftSelfHead",
        div(
          "leftSelfHeadBk por",
          ...bg ? [div("backgroundTime", ` 背景剩余时间： ${bg.left | 0}分钟 `), img("backgroundImg", goodOf("background", bg.id).url)] : [],
          div("petImgBox fcc", img("petImg penguin_breathe", avatar()))
        )
      ),
      div("leftSelfCenter", div("leftSelfCenterBk", ...tabs("lscb", MINE, mine.tab, mine.sub, (tab, sub) => drawLeft({ tab, sub, page: 1 })))),
      div(
        "leftSelfGoods",
        div(
          "leftSelfGoodsBk",
          div(
            "selfGoodList fc",
            ...list2.map(
              (g) => div(
                "selfGood fc por",
                div("selfGoodImgBox por", tooltip(g), ...g.PD ? [div("PD")] : [], img("selfGoodImg", g.url)),
                div("selfGoodinfo h100 pt8", div("selfGoodName", g.name), div("selfGoodNum", `剩余：${g.num}`)),
                button("selfGoodUse fcc", () => useItem(g), " 使用 ")
              )
            )
          )
        )
      ),
      div(
        "leftSelfFoot",
        div(
          "leftSelfFootBk por",
          div("lsfb_yb", String(info.yb)),
          div("lsfb_pageMsg fcc", ...pager("lsfb", mine.page, totalPage, (page) => drawLeft({ ...mine, page })))
        )
      )
    );
  }
  function drawRight(next2 = mall) {
    mall = next2;
    const t = MALL[mall.tab];
    const pages = PAGES$1[t.cls][t.children[mall.sub].type] ?? [];
    const goods = (pages[mall.page - 1] ?? []).map((id) => goodOf(t.children[mall.sub].type, id));
    right.replaceChildren(
      div("rightSelfHead", div("rightSelfHeadBk", ...tabs("rscb", MALL, mall.tab, mall.sub, (tab, sub) => drawRight({ tab, sub, page: 1 })))),
      div(
        "rightSelfCenter por",
        div(
          "rightSelfCenterBk",
          div(
            "rGoodList fc",
            ...goods.map((g, i) => {
              const why = blocked(g);
              const pic = img("rG_leftImg", g.url);
              const off = why ? " disablePay" : "";
              return Object.assign(
                div(
                  "rGoods fC",
                  div("rG_title", g.name),
                  div(
                    "rG_top fc",
                    div("rG_leftImgBox fcc por", tooltip(g), ...g.PD ? [div("PD")] : [], pic),
                    div(
                      "rG_rightInfo fC pl8",
                      div(
                        "rG_payYb f1",
                        ` 元宝：${g.price}/`,
                        Object.assign(document.createElement("span"), {
                          className: "dpPay",
                          textContent: String(discount(g.price))
                        })
                      ),
                      div("rG_payYb f1 mt8", "消耗不知名道具：0")
                    )
                  ),
                  div(
                    "rG_buts f1 fc",
                    div("rG_dj fc h100 f1 w0", `等级 ${g.needLevel || 0}`),
                    button(`rG_cart${off}`, () => !why && addToCart(g, pic, i)),
                    button(`rG_pay${off}`, () => !why && checkout([[g, 1]], false))
                  )
                ),
                { title: ["", "等级不足", "无粉钻会员"][why] }
              );
            })
          )
        ),
        div(
          "rightSelfPaging fc w100",
          div("f1"),
          div("paging fc", ...pager("rsfb", mall.page, pages.length, (page) => drawRight({ ...mall, page }))),
          button("shoppingCart por", () => {
            drawCart();
            cartMark.style.display = "";
          })
        )
      ),
      div("rightSelFoot", div("rightSelFootBk"))
    );
  }
  function addToCart(g, pic, k) {
    const item = cart.get(g.id);
    if (item) item.cartNum++;
    else cart.set(g.id, { ...g, cartNum: 1 });
    const from = slot(k);
    const copy = pic.cloneNode();
    Object.assign(copy.style, {
      position: "absolute",
      left: `${from.x}px`,
      top: `${from.y}px`,
      transition: "all 500ms ease-in-out",
      opacity: "0.8"
    });
    fly2.appendChild(copy);
    setTimeout(
      () => Object.assign(copy.style, {
        left: `${CART.x}px`,
        top: `${CART.y}px`,
        transform: "scale(0.2)",
        opacity: "0.2"
      }),
      50
    );
    setTimeout(() => copy.remove(), 550);
  }
  function drawCart() {
    let count2 = 0;
    let total = 0;
    cartList.replaceChildren(
      ...[...cart.values()].map((g) => {
        count2 += g.cartNum;
        total += g.cartNum * price(g);
        const step2 = (n) => () => {
          g.cartNum += n;
          if (g.cartNum <= 0) cart.delete(g.id);
          drawCart();
        };
        return div(
          "cartGood fc",
          div("cg_name wsnw tc", g.name),
          div("cg_num wsnw tc", String(g.cartNum)),
          div("cg_type wsnw tc", TYPE_NAMES[g.type]),
          div("cg_price wsnw tc", String(price(g))),
          div("cg_buts fcc f1", button("cg_cutUp", step2(-10)), button("cg_cut", step2(-1)), button("cg_add", step2(1)), button("cg_addDown", step2(10)))
        );
      })
    );
    cartCount.textContent = String(count2);
    cartTotal.textContent = `${total} YB`;
  }
  function checkout(items2, quiet) {
    const total = items2.reduce((s2, [g, n]) => s2 + price(g) * n, 0);
    if (info.yb < total) {
      windowView({ msg: "抱歉您的余额不足" });
      return false;
    }
    busyMark.style.display = "";
    for (const [g, n] of items2) buy(g, n, quiet);
    setTimeout(() => busyMark.style.display = "none", 500);
    return true;
  }
  const shop2 = div(
    "ui-shop",
    div(
      "shoppingMall fc",
      button("close", () => close$3?.()),
      left,
      right
    ),
    div("mallFoot"),
    cartMark,
    busyMark,
    fly2
  );
  cartMark.appendChild(
    div(
      "shoppingCartMain por",
      button("cartClose", () => cartMark.style.display = "none"),
      cartList,
      div("totalMsg fc", cartCount, cartTotal),
      div("attributeTotal"),
      div(
        "scm_foot",
        button("qrzf", () => {
          if (!cart.size || !checkout(
            [...cart.values()].map((g) => [g, g.cartNum]),
            true
          ))
            return;
          cart.clear();
          cartMark.style.display = "none";
          setTimeout(() => speak$1({ s: "谢谢[host],帮我清空了购物车~~", now: true }, "speak"), 500);
        }),
        button("jxgw", () => cartMark.style.display = "none")
      )
    )
  );
  drawLeft();
  drawRight();
  redraw$1 = { left: drawLeft, right: drawRight };
  const remove = openFrame(shop2);
  close$3 = () => {
    remove();
    close$3 = redraw$1 = null;
  };
}
let redraw$1 = null;
onGoodsChange(() => redraw$1?.left());
onInfoChange((key) => {
  if (key === "yb" || key === "sex") redraw$1?.left();
  if (key === "growth" || key === "pinkDiamond") redraw$1?.right();
});
function showResult(host2, goods, msg = "") {
  const body = goods.length ? div(
    "grb_mgs fcw",
    " 你领取了 ",
    ...goods.map(
      (g) => div(
        "grb_goods fcC p8",
        Object.assign(img("e_goodImgs", g.url), { title: `${g.outOfPrint ? "绝版：" : ""}${g.name}*${g.num}` }),
        div("pt4", `${g.name}*${g.num}`)
      )
    )
  ) : div("grb_mgs", msg);
  const mark = div(
    "markFull fcc",
    div(
      "getResult",
      div(
        "getResultBorder fcC",
        body,
        button("but_small fcc mt8", () => mark.remove(), "确定")
      )
    )
  );
  host2.append(mark);
}
let open$7 = false;
function openTask() {
  if (open$7) return;
  open$7 = true;
  const root2 = div("ui-task");
  let tab = "daily";
  const render2 = () => {
    const items2 = tasks(tab).map((t, i) => {
      const ready = !t.take && t.done >= t.num;
      const state2 = t.take ? "claimed" : ready ? "ready" : "pending";
      const reward2 = document.createElement("button");
      reward2.type = "button";
      reward2.className = `but_small task-reward task-reward--${state2}`;
      reward2.disabled = !ready;
      reward2.textContent = t.take ? "✓ 已领取" : ready ? "领取奖励" : "未达成";
      reward2.addEventListener("click", () => {
        if (!ready) return;
        const goods = claim(tab, i);
        render2();
        showResult(root2, goods || [], "还没完成任务哦！~~");
      });
      return div(
        "taskOnce fc",
        div("to_left f1 fC w0", div("to_label", `${t.label}（${Math.min(t.done, t.num)}/${t.num}） `), div("to_msg", t.msg)),
        div(
          "to_right fc",
          ...t.good.map((g) => Object.assign(img("goodImg", g.url), { title: `${g.outOfPrint ? "绝版：" : ""}${g.name}*${g.num}` })),
          reward2
        )
      );
    });
    const tabs2 = Object.keys(TABS$1).map(
      (k) => button(
        k === tab ? "t_tab mr8 active" : "t_tab mr8",
        () => {
          tab = k;
          render2();
        },
        TABS$1[k]
      )
    );
    root2.replaceChildren(div("task fC", div("t_top f1 fC h0", div("t_title", "活动列表"), div("t_tabs", ...tabs2), div("tasks f1 mt8 h0", ...items2))));
  };
  render2();
  openBox(root2, { onClose: () => open$7 = false });
}
const pick$3 = (a) => a[Math.floor(Math.random() * a.length)];
const say$1 = (pool, slots = {}) => pick$3(pool).replace(/\{(\w+)\}/g, (_, k) => String({ pet: info.name, ...slots }[k]));
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const PLACES = {
  3: "夏帕海岸",
  5: "粉钻雪山",
  7: "竞技场",
  8: "超级游乐场",
  13: "百货店",
  15: "小学课堂",
  16: "生日屋",
  18: "教堂",
  20: "咖啡厅",
  21: "古堡森林",
  22: "风语广场",
  23: "神秘岛",
  26: "粉钻度假村",
  27: "神秘湖",
  29: "神秘湖底",
  30: "东郊荒地",
  31: "天剑峰",
  32: "昆仑顶"
};
const FOLK = {
  莉莉: { key: "npc_lili", scene: 3, about: "在海边长大的小姑娘，爱捡贝壳" },
  探险家琼斯: { key: "npc_qiongsi", scene: 3, about: "走遍全岛的探险家，总在找宝藏" },
  游乐场管理员: { key: "npc_ylcManage", scene: 3, about: "管着岛上的游乐设施，做事认真" },
  杰里: { key: "npc_jl.html", scene: 3, about: "爱运动，天天组织接力赛" },
  亮亮: { key: "npc_liangliang", scene: 5, about: "雪山上的滑雪高手" },
  管家苔丝: { key: "npc_gjds", scene: 5, about: "宝贝旅店的管家，细心周到" },
  伊苏: { key: "npc_ys.html", scene: 5, about: "住在雪山脚下，喜欢照顾别人" },
  周大饼: { key: "npc_zhoudabing", scene: 13, about: "百货店老板，精打细算" },
  珍尼花: { key: "petstudy", scene: 15, about: "小学课堂的老师，温柔又严格" },
  蓉蓉: { key: "birthday_house", scene: 16, about: "生日屋的主人，最爱给大家过生日" },
  神父特里斯坦: { key: "unmarry", scene: 18, about: "教堂的神父，慈祥和蔼" },
  凯茜: { key: "cgi-bin/register", scene: 18, about: "在教堂负责婚礼登记" },
  梅奥: { key: "jiaotang/3", scene: 18, about: "教堂的帮工，热心肠" },
  翠花: { key: "Dish.html", scene: 20, about: "咖啡厅的厨师，端盘子又快又稳" },
  佐佐: { key: "kf_index", scene: 20, about: "咖啡厅的店长，爱煮咖啡" },
  亚瑟: { key: "ore2weapon", scene: 21, about: "古堡森林里的铁匠，会用矿石打兵器" },
  木木: { key: "npc_mumu", scene: 22, about: "风语广场上的小吃货" },
  赛孔明: { key: "npc_saikm", scene: 22, about: "自称能掐会算的军师" },
  露西卡: { key: "npc_luxika", scene: 22, about: "会做魔法点心的小魔女" },
  监狱长: { key: "npc_jianyuzhang", scene: 22, about: "管着广场的秩序，说话一板一眼" },
  精灵乐乐: { key: "npc_jlll", scene: 22, about: "爱玩爱闹的小精灵" },
  智慧长老: { key: "npc_xogame", scene: 22, about: "学问渊博，爱下棋出谜题" },
  多多: { key: "newterm", scene: 22, about: "刚升了年级的小学生" },
  蒙奇: { key: "x_zwg", scene: 3, about: "天天拉人抽乌龟，可总抽不到想要的那张牌" },
  酷迪: { key: "qq_cl", scene: 3, about: "爱冲浪的酷小子，嫌一切都不够刺激" },
  桑尼夫人: { key: "fzds", scene: 5, about: "自称岛上最最最富有的贵妇，粉钻俱乐部的会长，爱炫耀包包" },
  迪利: { key: "dilidaren", scene: 22, about: "自封“达人”，什么都想比一比" },
  红冠国王: { key: "huanjiazhanqi", scene: 22, about: "和蓝冠国王打了好多年仗的棋盘国王，嘴上从不服输" },
  杰无双: { key: "qqxpk", scene: 22, about: "属性擂台的主持人，说话像说书，口头禅是“天下英雄”" },
  嘟嘟: { key: "juebandiy", scene: 22, about: "会用农场渔场的材料亲手做绝版物品的手艺人" },
  唐三藏: { key: "xyjj", scene: 22, about: "很帅很萌的唐三藏，总担心被妖怪抓去吃了" },
  兰兰: { key: "guoqing2011", scene: 22, about: "闯关高手，爱问别人敢不敢一口气通十关" },
  闹闹: { key: "cookies", scene: 22, about: "开曲奇店的小姑娘，烤饼干的手艺一流" },
  口袋精灵: { key: "octhappygive", scene: 22, about: "口袋里装满礼物、到处送欢乐的小精灵" },
  贝松: { key: "element_mill", scene: 22, about: "元素师，会分解、炼化各种东西" },
  魔幻人鱼: { key: "20111110mhdl", scene: 22, about: "从魔幻大陆游来的人鱼，想家的时候就去神秘湖" },
  丘比特: { key: "singlesday", scene: 22, about: "背着弓箭的小爱神，专给单身的企鹅牵红线" },
  炫舞小妖: { key: "x5/index", scene: 22, about: "爱跳舞的小妖，走到哪儿跳到哪儿" },
  洛克大使: { key: "20111124roco", scene: 22, about: "洛克王国派来的大使，嗓门大，爱搞活动" },
  恩恩: { key: "20111124td", scene: 22, about: "爱做爱心卡送人的暖心小企鹅" },
  占星师: { key: "qq_xzmy", scene: 22, about: "神神秘秘的占星师，在找一颗“永恒之星”" },
  爽爽: { key: "summer_shop", scene: 22, about: "开夏日冰爽店，一年四季都卖冷饮" },
  机器宝宝: { key: "jqbb3in1", scene: 22, about: "说话一顿一顿的机器宝宝，爱算数" },
  T仔: { key: "tnt_qianhao", scene: 22, about: "爱玩火药的爆破小子，整天喊“火力全开”" },
  克鲁尼: { key: "qq_mffw", scene: 26, about: "度假村的服务生，管吃管洗" },
  阿梅: { key: "fz_bbkz", scene: 26, about: "度假村的托管员，帮大家照看宠物" },
  琪琪: { key: "qq_vipdj", scene: 26, about: "度假村服装店的店员，爱打扮" }
};
const FOLKS = Object.keys(FOLK);
const SENDERS = ["小艾", "图图", "天使坏坏", "摩西", "菜菜", "融少", "饭饭"];
const LETTERS = 5;
const HINTS = {
  3: "我躲在听得见海浪、脚下全是沙子的地方",
  5: "这里冷得我直打哆嗦，四下白茫茫一片",
  7: "四周全是看台，大家都在这儿比武斗蔬菜",
  8: "我身边全是旋转木马和尖叫声",
  13: "我藏在货架后面，周围全是吃的用的",
  15: "我坐在一排排小课桌中间，黑板就在前面",
  16: "这里到处是蛋糕和彩带，天天有人许愿",
  18: "我躲在敲钟的地方，常有企鹅在这里结婚",
  20: "这里飘着咖啡香，盘子叮叮当当响",
  21: "大树把天都遮住了，林子深处有座老城堡",
  22: "我就在风最大、企鹅最多的地方",
  23: "坐船才到得了这座小岛，岛上的秘密谁也说不清",
  26: "我泡在暖暖的温泉边，抬头就是雪山",
  27: "湖水静悄悄的，听说水底住着精灵",
  29: "头顶是湖水，身边游着小鱼，我憋着气呢",
  30: "这里荒得很，风一吹全是沙土",
  31: "山尖像一把插在地上的剑，风里都是剑气",
  32: "比雪山还高还冷，脚下就是云"
};
const PLAYS = {
  QQ跆拳道: "跆拳道",
  Q宠搭积木: "搭积木",
  QQ端盘子: "端盘子",
  QQ好好学习: "好好学习",
  "冒险岛系列/1起航": "冒险岛",
  满天星: "满天星",
  Q宠邀你来找茬: "找茬",
  Q宠守护使: "守护使",
  QQ煎饼摊: "煎饼摊",
  QQ宠物摘星星: "摘星星",
  QQ宠物泡泡: "泡泡"
};
const SPOTS = {
  pet_carnival: {
    name: "嘉年华",
    what: "去夏帕海岸的嘉年华凑凑热闹",
    lines: [
      "嘉年华的彩车还停在沙滩上，音乐一响，大家都跳起舞来。",
      "小丑往你手里塞了一个气球，又翻着跟头跑远了。",
      "套圈摊的老板冲你招手：“三个圈，套中就送大熊！”",
      "彩带从天上飘下来，正好落在你的头顶。",
      "一群企鹅排着队跳兔子舞，你也被拉了进去。",
      "棉花糖机呼呼转着，空气里全是甜甜的味道。",
      "魔术师从帽子里掏出一只小海鸥，大家都看呆了。",
      "踩高跷的叔叔弯下腰，跟你击了个掌。",
      "烟花在海面上炸开，把沙滩照得亮堂堂的。",
      "旋转木马叮叮当当地转，一圈又一圈。"
    ]
  },
  jycat: {
    name: "监狱猫",
    what: "抓住逃出来的监狱猫，它常在夏帕海岸和粉钻雪山出没",
    lines: [
      "喵呜！被你发现了……好吧好吧，我自己走回去。",
      "监狱猫舔舔爪子：“外面的鱼干就是比牢饭香。”说完乖乖跟你走了。",
      "监狱猫正趴在沙滩上晒太阳，被你一把抱了起来。",
      "雪地里一串小梅花脚印，尽头蹲着一只瑟瑟发抖的监狱猫。",
      "监狱猫叼着一条小鱼想跑，被你堵在了墙角。",
      "“喵！我只是出来散散步！”监狱猫心虚地说。",
      "你学了一声猫叫，监狱猫好奇地从草丛里探出头来。",
      "监狱猫冻得直打喷嚏，自己钻进了你的怀里。",
      "你掏出一根逗猫棒，监狱猫立刻扑了过来。",
      "监狱猫叹了口气：“自由的日子总是这么短。”"
    ]
  },
  "treasure_map?cmd=6": {
    name: "藏宝点",
    what: "去粉钻雪山或风语广场找一个地上冒泡泡的藏宝点挖一挖",
    lines: [
      "挖呀挖，挖出一枚亮晶晶的贝壳……可惜不值钱。",
      "泡泡咕嘟一声，冒出一张纸条：“宝藏在图图那儿。”",
      "挖出一只生锈的小铁盒，里面空空的，只有一股海风味。",
      "铲子碰到了硬东西——原来是一块圆溜溜的石头。",
      "挖出一枚旧硬币，上面刻着一只企鹅的头像。",
      "泡泡越冒越多，最后冒出一只迷路的小螃蟹。",
      "挖到一个玻璃瓶，里面卷着一张写着“加油”的纸条。",
      "挖了半天只挖出一只袜子，不知道是谁埋的。",
      "土里埋着一颗闪闪发亮的玻璃珠，真好看。",
      "挖出了一张藏宝图的边角，上面画着半个红叉叉。"
    ]
  },
  "treasure_map/index": {
    name: "魔法宝箱",
    what: "去风语广场摸一摸魔法宝箱",
    lines: [
      "魔法宝箱闪了一下光，咔哒一声又锁上了。",
      "宝箱里传出小声的嘀咕：“明天再来，明天再来。”",
      "你一摸宝箱，箱盖上的星星图案就亮了起来。",
      "宝箱打了个嗝，吐出一颗水果糖。",
      "宝箱上的锁眼眨了眨，好像在对你笑。",
      "宝箱微微发烫，里面有什么东西在叮当作响。",
      "你敲了敲宝箱，里面回了一声：“谁呀？”",
      "宝箱冒出一串彩色泡泡，飘得满广场都是。",
      "宝箱的锁转了半圈，又不情愿地转了回去。",
      "宝箱上刻着一行小字：心诚则开。"
    ]
  },
  pk_wdh: {
    name: "天下第一武道会",
    what: "去竞技场给天下第一武道会报个名",
    lines: [
      "报名簿上又多了一个名字，下一届比赛就等你上场了！",
      "台上两只企鹅正打得难解难分，台下喊声一片。",
      "报名处的裁判给你发了一个号码牌：第88号。",
      "你在报名表上按了一个小脚印，算是签名啦。",
      "去年的冠军路过，拍拍你的肩膀：“加油哦！”",
      "擂台边挂满了历届冠军的照片，看得你热血沸腾。",
      "裁判吹了一声哨子，又一场比赛开始了。",
      "报名的队伍排得老长，大家都在活动手脚。",
      "有只企鹅在台上摔了个屁股墩，全场都笑了。",
      "你对着擂台比划了两下，感觉自己也能行！"
    ]
  },
  pk_zq: {
    name: "PK世界杯",
    what: "去竞技场看一场PK世界杯",
    lines: [
      "球进啦！看台上的企鹅全都站起来欢呼。",
      "守门员一个飞扑，把球稳稳抱住了。",
      "前锋一脚射门，球打在门柱上弹了回来。",
      "看台上掀起了人浪，你也跟着举起了翅膀。",
      "裁判掏出一张黄牌，场上一片嘘声。",
      "中场休息，啦啦队跳起了企鹅舞。",
      "比分一比一，最后一分钟谁也不敢松懈。",
      "一记漂亮的倒挂金钩，全场都惊呆了！",
      "你旁边的企鹅激动得把爆米花撒了一地。",
      "点球大战开始了，大家紧张得捂住了眼睛。"
    ]
  },
  pk_scdz: {
    name: "蔬菜大作战",
    what: "去竞技场参加蔬菜大作战",
    lines: [
      "一颗番茄啪地砸过来，你一闪身躲开了！",
      "萝卜队和白菜队打成了平手，满地都是菜叶。",
      "你抓起一根黄瓜当宝剑，冲进了战场。",
      "一颗土豆骨碌碌滚到你脚边，你顺手扔了回去。",
      "茄子队派出了秘密武器：一个超大的南瓜！",
      "你被一片生菜叶糊了一脸，大家都笑了。",
      "玉米粒像下雨一样噼里啪啦落下来。",
      "你躲在一棵大白菜后面，偷偷瞄准了对面。",
      "辣椒队一出场，对面就辣得直掉眼泪。",
      "比赛结束，大家一起把蔬菜捡起来煮了一锅汤。"
    ]
  },
  x_cgdb: {
    name: "闯关夺宝",
    what: "去竞技场或超级游乐场试试闯关夺宝的机关",
    lines: [
      "机关咔咔转了一圈，一切正常。",
      "第一关的翻板有点松，记下来告诉管理员。",
      "你踩上跷跷板，另一头的沙袋一下子弹了起来。",
      "摇摆的吊桥晃得厉害，你张开翅膀才站稳。",
      "旋转的大风车差点把你扫下去，好险！",
      "第三关的弹簧床弹得你翻了两个跟头。",
      "你钻过一条长长的管道，出来时满身都是灰。",
      "滚石机关轰隆隆地滚过，你赶紧趴了下来。",
      "终点的铃铛被你一按，叮铃铃响个不停。",
      "你在滑梯上滑得太快，一头扎进了海洋球池。"
    ]
  },
  "coffee/food_index": {
    name: "咖啡厅的点心",
    what: "去咖啡厅尝一尝桌上的点心",
    lines: [
      "甜甜的，还带一点咖啡香，好吃！",
      "这块有点烤焦了，不过不能告诉翠花。",
      "奶油蛋糕软软的，一口下去满嘴都是奶香。",
      "这块饼干硬得像石头，差点硌着牙。",
      "蓝莓挞酸酸甜甜的，你忍不住又吃了一块。",
      "巧克力慕斯入口即化，好吃得眯起了眼睛。",
      "这块面包里藏着一颗整颗的栗子，惊喜！",
      "布丁晃来晃去，你追着它吃了半天。",
      "这块蛋糕咸咸的……翠花大概把盐当成糖了。",
      "抹茶卷有点苦，配上一口牛奶刚刚好。"
    ]
  },
  qq_sgbb: {
    name: "水果冰淇淋",
    what: "去粉钻雪山买一支水果冰淇淋",
    lines: [
      "冰淇淋上堆满了水果，在雪山上吃居然一点也不冷。",
      "草莓味的冰淇淋上插着一片薄荷叶，好看又好吃。",
      "你咬了一大口，冰得直跺脚。",
      "芒果冰淇淋化得太快，滴了一翅膀。",
      "老板多给你加了一勺，说是今天的第一百位客人。",
      "冰淇淋上的樱桃骨碌碌滚进了雪地里。",
      "西瓜味的冰淇淋，吃起来像在过夏天。",
      "你一边滑雪一边吃，冰淇淋全糊到了嘴巴上。",
      "蓝莓冰淇淋把你的舌头染成了紫色。",
      "雪山上的冰淇淋，连蛋筒都是脆脆凉凉的。"
    ]
  },
  phb_Top: {
    name: "名宠俱乐部",
    what: "去风语广场的名宠俱乐部看看排行榜",
    lines: [
      "排行榜上的名字一个比一个厉害，总有一天会有你的。",
      "榜首的宠物照片闪闪发光，旁边围了一圈企鹅。",
      "你踮起脚找了半天，没找到自己的名字。",
      "俱乐部的门口挂着一块牌子：名宠专用通道。",
      "一只戴墨镜的企鹅从俱乐部里走出来，酷极了。",
      "排行榜刚刚刷新，第三名和第四名换了位置。",
      "你对着排行榜默默许愿：明年我也要上榜！",
      "俱乐部里传来阵阵掌声，好像在颁奖。",
      "排行榜下面有一行小字：努力的宠物最可爱。",
      "你数了数，榜上有好多都是你认识的名字。"
    ]
  },
  qq_cjxt: {
    name: "成就树",
    what: "去风语广场给成就树浇浇水",
    lines: [
      "成就树的叶子沙沙响，好像又长高了一点。",
      "你浇完水，树枝上冒出了一个小小的嫩芽。",
      "成就树上挂满了大家的愿望卡，在风里轻轻摇。",
      "一片金色的叶子飘下来，落在你的手心里。",
      "树下有只松鼠探出头，冲你吱吱叫了两声。",
      "你给成就树唱了一首歌，树叶好像在跟着打拍子。",
      "水一浇下去，树根那儿冒出几朵小蘑菇。",
      "成就树开出了几朵白色的小花，香香的。",
      "树干上刻着好多名字，你也想把自己的刻上去。",
      "一阵风吹过，成就树像在对你点头道谢。"
    ]
  },
  tiaoshui: {
    name: "跳水台",
    what: "去风语广场的跳水台跳一次水",
    lines: [
      "扑通！水花溅得老高，围观的企鹅都鼓起掌来。",
      "你在空中转了一圈半，稳稳地扎进了水里。",
      "站在跳台上往下看，腿有点发软……还是跳了！",
      "一个漂亮的燕式跳水，裁判举起了满分牌。",
      "你肚皮先着地，啪的一声，水花溅了评委一身。",
      "水里凉丝丝的，你游了一圈才舍得上岸。",
      "跳台旁边的企鹅齐声倒数：三、二、一，跳！",
      "你抱着膝盖跳了个炸弹式，溅起的水花像喷泉。",
      "从水里钻出来，发现帽子还在跳台上。",
      "跳完一次还不过瘾，你又排到了队伍后面。"
    ]
  },
  "attribute_pk/pk.html": {
    name: "属性擂台",
    what: "去风语广场的属性擂台上站一站",
    lines: [
      "站上擂台，四周顿时安静了，大家都在看你。",
      "杰无双高喊：“天下英雄，又来一位！”",
      "擂台边的大屏幕亮了，上面显示着你的属性。",
      "台下有企鹅喊你的名字，给你加油打气。",
      "你摆了一个威风的姿势，闪光灯咔嚓咔嚓响。",
      "擂台的地板软软的，踩上去有点弹。",
      "对面的空位上写着：虚位以待，等你来战。",
      "你在擂台上转了一圈，向四面八方挥挥手。",
      "一阵风吹过，擂台的大旗呼啦啦地飘。",
      "站在擂台中央，你觉得自己高大了好多。"
    ]
  },
  qq_ggw: {
    name: "农场灌溉王",
    what: "去粉钻度假村帮农场浇浇水",
    lines: [
      "一桶水浇下去，小苗都抬起头来了。",
      "你拿着小喷壶，一垄一垄慢慢地浇。",
      "水渠被一块石头堵住了，你把它搬开，水哗哗流了过去。",
      "浇完水的菜地亮晶晶的，叶子上挂着小水珠。",
      "一只青蛙从菜叶下跳出来，吓了你一跳。",
      "你不小心踩进泥坑，溅了一身的泥点子。",
      "番茄红了好几个，农场主说等会儿摘给你吃。",
      "水管突然喷水，把你浇成了落汤企鹅。",
      "小黄瓜刚开出黄色的小花，你给它多浇了一点。",
      "浇完最后一块地，太阳正好落山。"
    ]
  },
  qq_zjps: {
    name: "杂技抛伞",
    what: "去粉钻度假村看杂技抛伞",
    lines: [
      "一把把小伞被抛上天，又稳稳落回杂技演员手里。",
      "演员用脚尖转着一把伞，伞上还站着一只小鸟。",
      "五把伞同时在空中飞，看得你眼花缭乱。",
      "一把伞没接住，落在了你的头上，大家都笑了。",
      "演员把伞抛给你，你手忙脚乱地接住了！",
      "彩色的伞在空中转成了一朵大花。",
      "演员蒙着眼睛抛伞，一把都没掉。",
      "最后一招，演员撑着伞从高台上慢慢飘了下来。",
      "你跟着节奏拍手，演员冲你眨了眨眼。",
      "演出结束，演员们撑着伞一起向大家鞠躬。"
    ]
  },
  qqbsg: {
    name: "QQ搬水果",
    what: "去粉钻度假村帮忙搬水果",
    lines: [
      "搬完一筐苹果，果农塞给你一个最大最红的。",
      "一筐橘子太重了，你推着它一路滚了过去。",
      "西瓜圆滚滚的，抱在怀里像抱着一个大皮球。",
      "香蕉一串一串的，你挂在脖子上搬了好几趟。",
      "葡萄差点被你挤破，赶紧放轻了动作。",
      "搬着搬着，你偷偷尝了一颗草莓，好甜！",
      "果筐翻了，苹果滚了一地，大家一起帮你捡。",
      "你把水果码得整整齐齐，果农直夸你能干。",
      "菠萝扎得你翅膀痒痒的，你忍不住笑出了声。",
      "最后一筐搬完，你累得坐在了水果堆上。"
    ]
  }
};
const MONSTERS = {
  1: ["狗妖", 30, "东郊荒地最弱的小妖，爱虚张声势，一吓就跑"],
  2: ["树精", 30, "慢吞吞的老树成精，最烦别人踩它的根"],
  3: ["狗贼", 30, "背着包袱的小毛贼，偷了东西就往荒地里藏"],
  4: ["枯藤精", 30, "浑身枯藤，爱用藤条绊人"],
  5: ["野猪精", 30, "横冲直撞的大块头，做梦都想吃唐僧肉"],
  6: ["鬼灯笼", 30, "夜里飘来飘去的灯笼妖，爱装神弄鬼吓唬人"],
  7: ["花妖", 30, "开得最艳的花成了精，自恋又小气，不许人摘花"],
  8: ["豹妖", 30, "跑得飞快的豹子精，看不起慢吞吞的企鹅"],
  9: ["虎头领", 30, "虎王手下的头领，嗓门大，爱摆架子"],
  10: ["狗仔队", 30, "一群举着相机的狗妖，到处偷拍别人的糗事"],
  11: ["虎王", 30, "东郊荒地的霸主，自称天下第一"],
  13: ["雪猿", 30, "从雪山下来的白毛猿，力气大，脾气暴"],
  14: ["云兽", 30, "腾云驾雾的怪兽，最爱遮住星星和太阳"],
  15: ["香炉精", 30, "庙里的老香炉成了精，一生气就喷香灰"],
  16: ["石狮精", 30, "守门的石狮子成了精，又硬又倔"],
  17: ["雪妖", 32, "昆仑顶上的雪妖，一口气能把人冻成冰棍"],
  18: ["冰魂", 32, "千年寒冰化成的魂魄，冷冰冰不爱说话"],
  19: ["玄猴", 31, "天剑峰上的灵猴，身手敏捷，爱捉弄人"],
  20: ["剑魂", 31, "古剑里的剑灵，只服比它更强的剑客"],
  29: ["幻境", 31, "会变出幻象迷惑人的妖境，真真假假分不清"],
  30: ["玲珑塔", 30, "一层比一层难闯的妖塔，塔顶住着最厉害的妖王"]
};
const TACTICS = {
  硬拼: {
    stat: "strong",
    said: "武力",
    moves: [
      "使出企鹅旋风踢",
      "一记肚皮撞飞了过去",
      "抡起翅膀连拍三下",
      "助跑三步，来了个飞身扑",
      "扎稳马步，一拳打了出去",
      "抱住它的腿想把它摔倒",
      "用脑门结结实实顶了过去",
      "跳起来使出一招泰山压顶",
      "连踢带踹，打出一套组合拳",
      "滑着肚皮冲过去撞它的脚"
    ]
  },
  智取: {
    stat: "intel",
    said: "智力",
    moves: [
      "假装逃跑，绕到背后偷袭",
      "出了一道谜题把它绕晕了",
      "挖了个小坑等它掉进去",
      "指着它身后大喊“看，飞碟！”",
      "在地上撒了一把滑溜溜的豆子",
      "学它的样子说话，把它弄糊涂了",
      "用树枝和藤条做了个小陷阱",
      "躲在石头后面扔小石子引开它",
      "算准了它的步子，提前躲开",
      "借着太阳光晃它的眼睛"
    ]
  },
  说服: {
    stat: "charm",
    said: "魅力",
    moves: [
      "递上一块小饼干套近乎",
      "眨着大眼睛讲道理",
      "唱了一首歌给它听",
      "夸它的毛色真漂亮",
      "跳了一段可爱的企鹅舞",
      "讲了一个好笑的故事",
      "拉着它的爪子说想交个朋友",
      "送上一朵刚摘的小花",
      "给它讲为什么不要欺负别人",
      "撒娇说自己只是路过"
    ]
  }
};
const odds = (id, t) => (info[TACTICS[t].stat] + 10) / (info[TACTICS[t].stat] + 10 + 10 * Number(id) ** 2);
const best = (id) => Math.max(...Object.keys(TACTICS).map((t) => odds(id, t)));
const BEATABLE = 0.5;
const UPSET = 0.35;
const FX = { win: 5, upset: 6, hundred: 4, lose: 7, fireworks: 1 };
const FACE$1 = { happy: 2, cry: 3, sweat: 8 };
const TOWER = "30";
const stage = { play: (_n) => {
}, face: (_n) => {
} };
const CHORES = {
  Work: ["去打工", 2],
  Study: ["去上课学习", 2],
  Travel1: ["出门旅游", 2],
  Eat: ["吃东西", 3],
  Clean: ["洗澡清洁", 3],
  Toy: ["玩玩具", 3],
  GameRound: ["玩小游戏", 3]
};
const chore = (to) => {
  const [obj, n] = to.split(":");
  return [obj, Number(n)];
};
const GIFTS = { food: "好吃的", toy: "好玩的玩具", clean: "清洁用品" };
const CARES = {
  hunger: ["吃得饱饱的", "饱食", "hungerMax"],
  clean: ["洗得干干净净", "清洁", "cleanMax"],
  mood: ["开开心心", "心情", "moodMax"]
};
const CARE = 0.8;
const hours = (to) => to.split("-").map(Number);
const KINDS = {
  talk: {
    what: (e) => `去${PLACES[FOLK[e.to].scene]}找${e.to}传个话`,
    roll: (from) => pick$3(FOLKS.filter((n) => n !== from))
  },
  bring: {
    what: (e) => `带一个${findGood(e.to).name}来`,
    roll: () => pick$3(wants()).id,
    can: (to) => buyable(findGood(to))
  },
  spot: {
    what: (e) => SPOTS[e.to].what,
    roll: () => pick$3(Object.keys(SPOTS))
  },
  fight: {
    what: (e) => `去${PLACES[MONSTERS[e.to][1]]}打败${MONSTERS[e.to][0]}`,
    roll: () => pick$3(Object.keys(MONSTERS).filter((id) => best(id) >= BEATABLE)),
    can: (to) => best(to) >= BEATABLE
  },
  tour: {
    what: (e) => `换${e.to}个地方逛一逛`,
    roll: () => String(rand(2, 4))
  },
  chore: {
    what: (e) => {
      const [obj, n] = chore(e.to);
      return `今天${CHORES[obj][0]}${n}次`;
    },
    roll: () => {
      const obj = pick$3(Object.keys(CHORES));
      return `${obj}:${rand(1, CHORES[obj][1])}`;
    },
    ready: (to) => {
      const [obj, n] = chore(to);
      return count(obj) >= n;
    }
  },
  gift: {
    what: (e) => `随便带一样${GIFTS[e.to]}来`,
    roll: () => pick$3(Object.keys(GIFTS))
  },
  visit: {
    what: (e) => `去${PLACES[Number(e.to)]}看一看`,
    roll: (from) => pick$3(Object.keys(PLACES).filter((s2) => Number(s2) !== FOLK[from].scene))
  },
  chat: {
    what: (e) => `在岛上聊天说${e.to}句话`,
    roll: () => String(rand(2, 3))
  },
  play: {
    what: (e) => `去玩一会儿${PLAYS[e.to]}`,
    roll: () => pick$3(Object.keys(PLAYS))
  },
  quiz: { what: () => "答对一道题，只有一次机会" },
  seek: { what: (e) => `找到躲起来的${e.from}：「${HINTS[Number(e.to)]}」` },
  care: {
    what: (e) => {
      const [how, stat] = CARES[e.to];
      return `${how}地去找${e.from}（${stat}到${CARE * 10}成）`;
    },
    ready: (to) => info[to] >= save.petComputedlInfo[CARES[to][2]] * CARE
  },
  time: {
    what: (e) => `${hours(e.to)[0]}点到${hours(e.to)[1]}点之间去找${e.from}`,
    ready: (to) => {
      const [from, until] = hours(to);
      const h2 = (/* @__PURE__ */ new Date()).getHours();
      return h2 >= from && h2 < until;
    }
  }
};
const ROLLED = Object.keys(KINDS).filter((k) => KINDS[k].roll);
const ERRANDS = [
  ["佐佐", "bring", "102010015", "店里的招牌下岛咖啡卖光啦，客人还在等，能帮我带一杯来应应急吗？"],
  ["翠花", "talk", "周大饼", "后厨的面粉快用完了，帮我去百货店问问周大饼还有没有货。"],
  ["周大饼", "visit", "5", "听说粉钻雪山来了好多游客，帮我去看看他们缺些什么，我好进货。"],
  ["莉莉", "bring", "102010001", "海边太阳好晒呀，好想吃一个圈圈冰激凌~"],
  ["探险家琼斯", "visit", "21", "我的探险笔记落在古堡森林了，帮我去那边找一找吧。"],
  ["探险家琼斯", "talk", "亚瑟", "替我问问古堡森林的亚瑟，最近有没有在林子里见到奇怪的宝箱。"],
  ["游乐场管理员", "visit", "8", "超级游乐场今天人多，帮我去巡逻一圈，看看设施有没有出毛病。"],
  ["杰里", "chat", "3", "接力赛就要开始啦，帮我在岛上喊几声给大家加油！"],
  ["亮亮", "visit", "26", "粉钻度假村的温泉开了，帮我去看看排队的人多不多。"],
  ["管家苔丝", "bring", "102010091", "旅店的客人点了一盒蒙牛酸酸乳，库房里刚好没有了，能帮忙带一盒来吗？"],
  ["伊苏", "talk", "亮亮", "雪山上风大，帮我去提醒亮亮滑雪时多穿点。"],
  ["珍尼花", "talk", "智慧长老", "明天要考试，帮我去风语广场向智慧长老讨一道难题。"],
  ["蓉蓉", "bring", "102010003", "今天有小企鹅过生日，蛋糕旁边还差一份月光饼饼。"],
  ["蓉蓉", "chat", "3", "帮今天的寿星在岛上多说几句祝福吧！"],
  ["梅奥", "talk", "凯茜", "下午有一场婚礼，帮我去提醒凯茜把登记簿准备好。"],
  ["神父特里斯坦", "visit", "23", "听说神秘岛上有小企鹅迷了路，帮我去那里看看。"],
  ["亚瑟", "talk", "监狱长", "有个小贼偷了我的矿石，帮我去风语广场问问监狱长抓到没有。"],
  ["木木", "bring", "102010004", "在广场上逛了一上午，肚子好饿，想吃果味米米花~"],
  ["赛孔明", "visit", "30", "我夜观天象，东郊荒地今天有异动，帮我去探一探。"],
  ["露西卡", "talk", "精灵乐乐", "我烤了新的魔法饼干，帮我去叫精灵乐乐过来尝尝。"],
  ["监狱长", "chat", "2", "广场上人太多了，帮我提醒大家排好队、别乱跑。"],
  ["精灵乐乐", "visit", "27", "神秘湖里的水精灵好久没露面了，帮我去湖边看看她。"],
  ["多多", "visit", "15", "新学期开学啦，帮我去小学课堂看看新同学来了没有。"],
  ["智慧长老", "talk", "赛孔明", "我出了一道谜题，帮我去考考赛孔明，看他答不答得上来。"],
  ["凯茜", "bring", "102020003", "教堂门口的花快蔫了，借我一个舒爽喷湿器浇浇水吧。"],
  ["智慧长老", "quiz", "dx-chinese", "老头子今天考考你，答对了有赏："],
  ["珍尼花", "quiz", "xx-chinese", "上课啦！这道题请你来回答："],
  ["多多", "quiz", "xx-mathematics", "这道作业题我想了一上午，你帮我看看选哪个？"],
  ["赛孔明", "quiz", "zx-chinese", "在下出一题，答得上来才算有缘人："],
  ["亚瑟", "quiz", "xx-wushu", "想跟我学打铁，先得懂点武艺。回答我："],
  ["神父特里斯坦", "quiz", "xx-manner", "孩子，我想听听你怎么看这个问题："],
  ["精灵乐乐", "seek", "23", "来玩捉迷藏吧！我已经藏好啦，猜猜我在哪儿？"],
  ["木木", "seek", "13", "嘿嘿，我偷偷溜出去找好吃的了，你能找到我吗？"],
  ["莉莉", "seek", "8", "海边玩腻了，我躲起来了，来找我呀~"],
  ["多多", "seek", "15", "放学了我还没走，你猜我躲在哪儿？"],
  ["杰里", "seek", "5", "我跑到一个特别冷的地方练耐力，找到我算你赢！"],
  ["杰里", "play", "QQ跆拳道", "光跑步不过瘾，你去竞技场打一局跆拳道给我看看！"],
  ["翠花", "play", "QQ端盘子", "今天客人太多了，快来帮我端端盘子！"],
  ["游乐场管理员", "play", "Q宠搭积木", "游乐场的积木塔倒了，帮我重新搭起来吧。"],
  ["珍尼花", "play", "QQ好好学习", "今天的功课还没做呢，去好好学习一会儿再来。"],
  ["探险家琼斯", "play", "冒险岛系列/1起航", "冒险岛的船要起航了，跟我出海冒险去！"],
  ["管家苔丝", "care", "clean", "宝贝旅店只接待干干净净的客人，洗干净了再来吧。"],
  ["露西卡", "care", "hunger", "饿着肚子可学不会魔法，先吃饱了再来找我。"],
  ["蓉蓉", "care", "mood", "生日派对要开开心心地来，心情好了再来找我吧！"],
  ["伊苏", "care", "hunger", "雪山上冷，肚子空空会冻坏的，吃饱了再上山来。"],
  ["赛孔明", "time", "20-24", "今晚星象大吉，晚上8点以后来广场找我一起观星。"],
  ["露西卡", "time", "6-10", "清早的露水最适合做魔法点心，早上来找我吧。"],
  ["佐佐", "time", "11-14", "午市最忙了，中午来店里帮我看看场子。"],
  ["监狱长", "time", "18-22", "晚上要查岗，晚饭后来广场报到。"],
  ["监狱长", "spot", "jycat", "那只监狱猫又越狱了！有人在海边和雪山都见过它，帮我把它抓回来。"],
  ["监狱长", "fight", "3", "东郊荒地的狗贼偷了广场的路灯，帮我去教训教训它！"],
  ["探险家琼斯", "spot", "treasure_map?cmd=6", "我的探宝仪滴滴直响，地上冒泡泡的地方准有东西，帮我挖一个看看。"],
  ["探险家琼斯", "fight", "2", "东郊荒地有棵树精挡了我的探险路线，帮我把它赶走。"],
  ["游乐场管理员", "spot", "x_cgdb", "闯关夺宝的机关该检修了，帮我去试一遍，看哪儿卡住了。"],
  ["游乐场管理员", "visit", "7", "竞技场借了我们几张看台，帮我去看看摆好没有。"],
  ["杰里", "spot", "pk_wdh", "天下第一武道会开始报名啦，你去替自己报个名，我给你当啦啦队！"],
  ["杰里", "fight", "8", "听说东郊荒地的豹妖跑得比我还快？去跟它比划比划！"],
  ["翠花", "spot", "coffee/food_index", "我新做了几样点心摆在桌上，帮我挑一块尝尝，说实话哦。"],
  ["亮亮", "spot", "qq_sgbb", "滑完雪最想吃冰淇淋，你去尝尝雪山上那家水果冰淇淋，好吃我就去排队。"],
  ["亮亮", "fight", "13", "东郊荒地有只雪猿，偷学我的滑雪姿势！去把它打跑。"],
  ["伊苏", "visit", "32", "昆仑顶上长着一种雪莲，帮我去看看开了没有。"],
  ["蒙奇", "spot", "pet_carnival", "我抽乌龟输了一下午，帮我去嘉年华沾沾喜气，转转运！"],
  ["蒙奇", "quiz", "xx-mathematics", "一副牌里抽乌龟，抽到最后谁倒霉？先帮我算道题醒醒脑："],
  ["酷迪", "visit", "29", "冲浪没意思了，听说神秘湖底能潜水？帮我先下去探探。"],
  ["酷迪", "play", "QQ宠物泡泡", "雪山上有个吹泡泡的机器，你去玩一会儿，看刺不刺激。"],
  ["桑尼夫人", "bring", "102010021", "本夫人只喝康师傅红茶，管家又忘买了，快替我带一瓶来。"],
  ["桑尼夫人", "care", "clean", "脏兮兮的可不许进粉钻俱乐部，洗得干干净净再来见本夫人。"],
  ["迪利", "spot", "phb_Top", "名宠俱乐部的排行榜换新了，帮我去看看我排第几！"],
  ["迪利", "play", "Q宠邀你来找茬", "比眼力我可是达人！你去玩一局找茬，看能不能赢过我。"],
  ["红冠国王", "fight", "9", "东郊荒地的虎头领投靠了蓝冠国王，替本王去收拾它！"],
  ["红冠国王", "talk", "杰无双", "替本王给杰无双下战书：本王要上属性擂台，谁来都不怕！"],
  ["杰无双", "spot", "attribute_pk/pk.html", "天下英雄，非你莫属！先去属性擂台上站一站，让大家认识认识你。"],
  ["杰无双", "fight", "11", "虎王自称东郊荒地第一高手，英雄，去挑战它！"],
  ["嘟嘟", "visit", "26", "做绝版需要度假村的新鲜水果，帮我去看看熟了没有。"],
  ["嘟嘟", "spot", "qq_ggw", "度假村农场的苗快干死了，帮我去浇浇水，材料才长得好。"],
  ["唐三藏", "fight", "5", "有只野猪精扬言要吃唐僧肉，你快去东郊荒地保护贫僧……哦不，打败它！"],
  ["唐三藏", "chat", "3", "阿弥陀佛，帮贫僧在岛上多说几句好话，劝大家与人为善。"],
  ["兰兰", "spot", "x_cgdb", "敢一口气通十关么？先去试试闯关夺宝，过了我再告诉你下一关。"],
  ["兰兰", "visit", "31", "天剑峰才是真正的大关，你敢爬上去看一眼吗？"],
  ["闹闹", "bring", "102010012", "我想做桃桃曲奇，就差一个桃桃布丁当馅儿了！"],
  ["闹闹", "play", "QQ煎饼摊", "百货店的煎饼摊老板病了，你去帮他摊一会儿煎饼吧。"],
  ["口袋精灵", "seek", "26", "我把礼物藏好了，自己也躲起来了，找到我就送给你！"],
  ["口袋精灵", "chat", "3", "欢乐要大家一起分享！帮我在岛上跟大家打打招呼吧。"],
  ["贝松", "fight", "15", "我需要香炉精身上的香灰做元素材料，去东郊荒地打败它吧。"],
  ["贝松", "quiz", "xx-labouring", "小小元素师也要懂生活常识。回答我："],
  ["魔幻人鱼", "visit", "27", "我好想家……帮我去神秘湖看看，湖水还像魔幻大陆那样蓝吗？"],
  ["魔幻人鱼", "seek", "29", "我游到一个你得憋气才能来的地方了，来找我呀~"],
  ["丘比特", "talk", "凯茜", "我看中了一对有情人，帮我去教堂问问凯茜，下个月还能不能约婚礼。"],
  ["丘比特", "time", "19-22", "晚上月亮出来，才是射爱神之箭的好时候，那时候再来找我。"],
  ["炫舞小妖", "chat", "3", "跳舞要有人喝彩！帮我在岛上喊几声，叫大家来看我跳舞。"],
  ["炫舞小妖", "care", "mood", "跳舞最要紧的是开心！心情好好的再来跟我跳。"],
  ["洛克大使", "visit", "8", "洛克王国想跟超级游乐场合办活动，帮我去游乐场踩踩点。"],
  ["洛克大使", "talk", "游乐场管理员", "帮我问问游乐场管理员，借场地办活动要交多少元宝。"],
  ["恩恩", "talk", "蓉蓉", "我做了一张爱心卡，帮我送去生日屋给蓉蓉，祝今天的寿星生日快乐。"],
  ["恩恩", "care", "mood", "爱心卡要开开心心地送才灵，你心情好的时候再来帮我。"],
  ["占星师", "play", "满天星", "永恒之星就藏在满天星里，去观星台帮我找一找。"],
  ["占星师", "fight", "14", "云兽把星星都遮住了，去东郊荒地打败它，让我看清星空。"],
  ["爽爽", "bring", "102010020", "冰爽店的冰红茶卖断货了，帮我带一瓶来救急！"],
  ["爽爽", "fight", "17", "昆仑顶的雪妖偷了我的冰块，帮我去讨回来！"],
  ["机器宝宝", "quiz", "zx-mathematics", "滴——数学模块启动——请回答："],
  ["机器宝宝", "play", "Q宠守护使", "滴——防御系统需要测试——请去古堡森林玩一局守护使。"],
  ["T仔", "fight", "6", "鬼灯笼晚上老在东郊荒地晃，吓得我火药都撒了，去把它灭掉！"],
  ["T仔", "spot", "tiaoshui", "我想试试从跳水台上扔个水炸弹，你先去跳一次，看看水深不深。"],
  ["克鲁尼", "care", "hunger", "度假村包吃包洗！先吃得饱饱的，再来找我登记。"],
  ["克鲁尼", "spot", "qqbsg", "水果车到了，帮我去搬一筐水果，搬完请你吃。"],
  ["阿梅", "spot", "qq_zjps", "托管的宝宝们吵着要看杂技，帮我先去看看今天演不演。"],
  ["阿梅", "seek", "7", "有只托管的宝宝跑丢了……啊不，是我躲起来了，来找我！"],
  ["琪琪", "bring", "102020019", "店里的试衣镜碎了，借我一面QQ魔镜照一照新衣服吧。"],
  ["琪琪", "visit", "18", "听说教堂今天有婚礼，帮我去看看新娘穿的是什么款式。"],
  ["木木", "spot", "treasure_map/index", "听说魔法宝箱里装满了零食，帮我去摸一摸能不能打开！"],
  ["精灵乐乐", "spot", "qq_cjxt", "成就树好久没人浇水了，帮我去浇一浇，它会长出新叶子哦。"],
  ["赛孔明", "fight", "20", "天剑峰的剑魂杀气太重，扰乱了星象，替在下去降服它。"],
  ["亚瑟", "fight", "1", "我新打了一把剑，你拿去东郊荒地，找狗妖试试锋利不锋利。"],
  ["智慧长老", "spot", "pk_scdz", "蔬菜大作战最考验反应，去竞技场参加一场，回来讲给我听。"],
  ["周大饼", "spot", "pk_zq", "我押了PK世界杯的冠军，你帮我去竞技场看看比分！"],
  ["神父特里斯坦", "fight", "16", "东郊荒地的石狮精到处吓唬小企鹅，孩子，去让它安分些。"],
  ["梅奥", "fight", "7", "教堂的花都是从东郊荒地采的，可那里的花妖不让采，帮我去说服……打败它。"],
  ["佐佐", "play", "QQ宠物摘星星", "咖啡要配星星糖才好看，去古堡森林帮我摘几颗星星回来。"],
  ["蓉蓉", "spot", "pet_carnival", "我想把生日派对搬到嘉年华办，帮我去海边看看场地热不热闹。"],
  ["爽爽", "visit", "3", "海边今天热不热？热的话冰爽店就搬过去摆摊。"],
  ["琪琪", "seek", "20", "我偷偷溜去喝下午茶了，猜猜我在哪儿？"],
  ["蒙奇", "visit", "16", "听说生日屋今天有派对，帮我去看看有没有人陪我抽乌龟。"],
  ["克鲁尼", "visit", "22", "度假村想在风语广场贴招牌，帮我去看看哪儿人最多。"],
  ["洛克大使", "tour", "3", "洛克王国的活动传单印好啦，帮我换3个地方发一发！"],
  ["游乐场管理员", "tour", "4", "全岛设施大检查！帮我换4个地方转一圈，看看哪里需要修。"],
  ["口袋精灵", "tour", "3", "我要把欢乐送到每个角落，带我换3个地方逛逛吧！"],
  ["探险家琼斯", "tour", "4", "真正的探险家脚步不能停！今天换4个地方走走。"],
  ["周大饼", "chore", "Work:1", "年轻人要勤快！今天去打一次工，回来我给你算工钱。"],
  ["珍尼花", "chore", "Study:1", "光玩可不行，今天去上一次课再来找老师。"],
  ["探险家琼斯", "chore", "Travel1:1", "岛外的世界更大！今天出门旅游一次，回来讲给我听。"],
  ["翠花", "chore", "Eat:2", "看你瘦的！今天好好吃两顿饭再来。"],
  ["管家苔丝", "chore", "Clean:2", "讲卫生的宝宝最可爱，今天洗两次澡吧。"],
  ["精灵乐乐", "chore", "Toy:3", "玩具放着会伤心的，今天陪它们玩3次！"],
  ["迪利", "chore", "GameRound:2", "小游戏达人就是我！你今天先玩两局小游戏练练手。"],
  ["机器宝宝", "chore", "Study:2", "滴——检测到知识不足——请今天学习2次。"],
  ["木木", "gift", "food", "肚子咕咕叫……随便给我一样好吃的吧，什么都行！"],
  ["露西卡", "gift", "food", "做魔法点心缺材料了，带一样吃的来，我变个花样给你看。"],
  ["阿梅", "gift", "toy", "托管的宝宝们闹着要玩具，随便带一个来哄哄他们吧。"],
  ["蓉蓉", "gift", "toy", "寿星还缺一份礼物，随便带个玩具来就好~"],
  ["克鲁尼", "gift", "clean", "度假村的洗浴间缺用品了，随便带一样清洁用品来救急。"],
  ["伊苏", "gift", "clean", "雪山下的小宝宝们脏兮兮的，借我一样清洁用品吧。"]
];
const WRITTEN = 6;
const MADE_UP = 2;
const MADE_UP_AI = 4;
const PIECES = 8;
const TIER = 4;
const WANT_PRICE = 200;
const FACTS = [
  ["布袋长老招信使", "风语广场的布袋长老每天有5封信要送，帮他跑腿能拿元宝，一个地方的岛民都收到过信还有大礼包。"],
  ["岛民求帮忙", "风语广场的科洛那里贴着今天岛民们托人帮的忙，每天都换新的，帮完了找本人领谢礼。"],
  ["图图的宝藏图", "风语广场的图图每天发一张宝藏图碎片，集齐8张就能挖宝藏。"],
  ["天使坏坏的成长礼", "宠物每长4级，就能去风语广场找天使坏坏领成长奖励。"],
  ["小艾的爱心任务", "夏帕海岸的小艾每天都想要一样东西，帮她找来有谢礼。"],
  ["摩西邀你钓鱼", "夏帕海岸的摩西在码头摆好了鱼竿，钓上来的鱼能换元宝。"],
  ["教堂密室", "教堂里的密室藏着一道道谜题，听说解开的企鹅都有收获。"],
  ["小游戏天天玩", "竞技场的跆拳道、游乐场的搭积木、小学课堂的好好学习，随时等你来玩。"],
  ["东郊荒地闹妖怪", "东郊荒地、天剑峰和昆仑顶出现了20多只妖怪，可以硬拼、智取或者说服它们，赢了能拿元宝。"],
  ["监狱猫又越狱了", "风语广场监狱长的监狱猫又跑了，有人在夏帕海岸和粉钻雪山见过它。"],
  ["观星台寻星", "占星师在风语广场的观星台寻找永恒之星，邀请大家一起玩满天星。"]
];
const REPORTER = "你是QQ宠物企鹅岛《企鹅日报》的小记者。";
const GUIDE = [
  ["风语广场", "科洛的每日任务、布袋长老送信、图图宝藏图、天使坏坏成长奖励。"],
  [
    "岛民",
    "岛上的居民都可以点一点：有的托你跑腿带东西，有的出题考你、躲起来等你找、拉你玩小游戏、约你某个时辰见面、派你去哪儿看看或者去打妖怪，还有的会关心你今天有没有好好吃饭、打工、学习，每天早上6点换新的。"
  ],
  ["夏帕海岸", "小艾的爱心任务、摩西钓鱼、饭饭端盘子、冒险岛、嘉年华。"],
  ["竞技场 / 超级游乐场", "跆拳道、搭积木、武道会、蔬菜大作战、闯关夺宝。"],
  ["小学课堂 / 教堂", "好好学习、密室逃脱。"],
  ["更多小游戏", "风语广场观星台的满天星、找茬，百货店的煎饼摊、古堡森林的守护使和摘星星、粉钻雪山的泡泡。"],
  ["东郊荒地 / 天剑峰 / 昆仑顶", "点妖怪就能交手：硬拼看武力，智取看智力，说服看魅力，每只妖怪一天能挑战一次。"],
  ["右边的导航", "点推荐活动、休闲游戏里的名字，企鹅会自己走过去；区域导航能直接去各个地方。"]
];
const need = (e) => e.kind === "chat" || e.kind === "tour" ? Number(e.to) : 1;
const state = {
  day: 0,
  sent: 0,
  letter: "",
  note: "",
  lit: [],
  lamps: [],
  tier: 0,
  pieces: 0,
  piece: false,
  want: "",
  loved: false,
  news: [],
  errands: [],
  fought: [],
  wins: 0,
  ...JSON.parse(save.saveJsonData.island || "{}")
};
const store = () => update("saveJsonData", { island: JSON.stringify(state) });
const buyable = (g) => SOLD.has(g.id) && g.price > 0 && !g.PD && !g.outOfPrint && (g.needLevel ?? 0) <= save.petComputedlInfo.level;
const wants = () => ["food", "toy", "clean"].flatMap((t) => allGoods(t)).filter((g) => buyable(g) && g.price <= WANT_PRICE);
function roll() {
  const errands = [];
  for (const [from, kind, to, ask2] of shuffle(ERRANDS)) {
    if (errands.length === WRITTEN) break;
    if (errands.some((e) => e.from === from || e.kind === kind) || KINDS[kind].can?.(to) === false) continue;
    errands.push({ from, kind, to, ask: ask2, got: 0, took: false });
  }
  const made = shuffle(FOLKS.filter((n) => !errands.some((e) => e.from === n))).slice(0, aiOn() ? MADE_UP_AI : MADE_UP).map((from) => {
    const kind = pick$3(ROLLED);
    const e = { from, kind, to: KINDS[kind].roll(from), ask: "", got: 0, took: false };
    e.ask = say$1(TALK.ask, { what: KINDS[kind].what(e) });
    return e;
  });
  const word = (e, prompt) => void voice(e.from, `你想请${info.name}帮你${KINDS[e.kind].what(e)}。${prompt}`, e.ask).then((ask2) => {
    e.ask = ask2;
    store();
  });
  for (const e of errands) word(e, `平时你会这么说：「${e.ask}」今天换个说法、换个原因再说一遍，要做的事不能变。`);
  for (const e of made) word(e, "结合你自己和你住的地方，编一个有趣的原因，用一句话请它帮忙。");
  return [...errands, ...made];
}
function today() {
  if (state.day === dayStart()) return state;
  Object.assign(state, { day: dayStart(), sent: 0, letter: "", note: "", piece: false, want: pick$3(wants()).id, loved: false, news: [], errands: roll(), fought: [] });
  store();
  return state;
}
async function voice(npc, prompt, fallback) {
  const folk = FOLK[npc];
  const where = folk ? `你住在${PLACES[folk.scene]}，${folk.about}。` : "";
  const who = `你是QQ宠物企鹅岛社区里的「${npc}」，${where}正在和小企鹅「${info.name}」说话。只写你说出口的话，不写动作和旁白，不加名字前缀和引号。`;
  const text = await askAs(who, [{ role: "user", content: `${prompt}只输出这句话。` }]);
  return text?.replace(/^[「“"]+|[」”"]+$/g, "") || fallback;
}
async function tell$2(prompt, fallback) {
  const text = await askAs("你是QQ宠物企鹅岛社区的说书人，讲小企鹅在岛上的经历，童趣、不血腥。", [{ role: "user", content: `${prompt}只输出这句话。` }]);
  return text ?? fallback;
}
let closeTalk = () => {
};
function talk(name2, body, goods = [], actions2 = []) {
  closeTalk();
  const box2 = div("island fC", div("i_title", name2), div("i_body f1", ...body.map((b) => div("i_line", b))));
  if (goods.length) box2.append(div("i_goods", ...goods.map((g) => div("i_good", img("goodImg", g.url), `${g.name}*${g.num}`))));
  if (actions2.length)
    box2.append(
      div(
        "i_acts",
        ...actions2.map(
          ([label, run]) => button(
            "but_small",
            () => {
              closeTalk();
              run();
            },
            label
          )
        )
      )
    );
  closeTalk = openBox(div("ui-island", box2));
}
const rows = (list2) => list2.map(([h2, t]) => div("i_row", div("i_head", h2), t));
async function letter() {
  const s2 = today();
  const where = (name2) => `${PLACES[FOLK[name2].scene]}的${name2}`;
  if (s2.letter) return talk("布袋长老", [say$1(TALK.notYet, { to: where(s2.letter) }), `「${s2.note}」`]);
  if (s2.sent >= LETTERS) return talk("布袋长老", [say$1(TALK.lettersDone)]);
  const left = FOLKS.filter((n) => !s2.lit.includes(n));
  const next2 = pick$3(left.length ? left : FOLKS);
  const from = pick$3(SENDERS);
  const note2 = await voice(from, `你托布袋长老给${where(next2)}捎一封信，说出信里写的一句话。`, say$1(TALK.note, { to: next2 }));
  talk(
    "布袋长老",
    [`${say$1(TALK.letterAsk, { from, to: where(next2) })}（今天第${s2.sent + 1}/${LETTERS}封）`, `「${note2}」`],
    [],
    [
      [
        "接下这封信",
        () => {
          s2.letter = next2;
          s2.note = note2;
          store();
        }
      ]
    ]
  );
}
function deliver(to) {
  const s2 = today();
  const note2 = s2.note;
  const scene = FOLK[to].scene;
  s2.letter = "";
  s2.sent++;
  if (!s2.lit.includes(to)) s2.lit.push(to);
  const lamp = !s2.lamps.includes(scene) && FOLKS.every((n) => FOLK[n].scene !== scene || s2.lit.includes(n));
  if (lamp) s2.lamps.push(scene);
  store();
  const goods = [parseGood(`_yb*${rand(5, 20) * 10 + (lamp ? 500 : 0)}`), ...lamp ? loot(3) : []];
  give(goods, say$1(TALK.got, { did: "帮布袋长老把信送到" }));
  const lit = lamp ? say$1(TALK.lamp, { place: PLACES[scene] }) : `（已经给${s2.lit.length}/${FOLKS.length}位岛民送过信）`;
  void voice(to, `${info.name}帮布袋长老给你送来一封信，信上写着「${note2}」。读完信，对它说一句话。`, say$1(TALK.letterThanks)).then(
    (line2) => talk(to, [line2, lit], goods)
  );
}
function errand(e) {
  const what = KINDS[e.kind].what(e);
  if (e.took) return talk(e.from, [say$1(e.got ? TALK.helped : TALK.failed)]);
  if (e.kind === "quiz") return quiz(e);
  if (e.kind === "bring") {
    const g = findGood(e.to);
    if (!hasGood(g.type, g.id)) return talk(e.from, [e.ask, `（${what}，商店里能买到）`], [g], [["去商店", openShop]]);
    return talk(e.from, [e.ask], [g], [[`交给${e.from}`, () => takeGood(g) && finish$2(e)]]);
  }
  if (e.kind === "gift") {
    const g = listGoods(e.to, 1, 1).list[0];
    if (!g) return talk(e.from, [e.ask, `（${what}，商店里能买到）`], [], [["去商店", openShop]]);
    return talk(e.from, [e.ask], [{ ...g, num: 1 }], [[`把${g.name}交给${e.from}`, () => takeGood(g) && finish$2(e)]]);
  }
  if (e.got < need(e) && !KINDS[e.kind].ready?.(e.to)) return talk(e.from, [e.ask, `（${what}${need(e) > 1 ? `，${e.got}/${need(e)}` : ""}）`]);
  finish$2(e);
}
function quiz(e) {
  const bank = EXAM[e.to];
  const q = bank[Math.floor(state.day / 86400) % bank.length];
  const answer = (o) => () => {
    if (o === q.answer) return finish$2(e);
    e.took = true;
    store();
    talk(e.from, [say$1(TALK.wrong, { answer: q.answer })]);
  };
  talk(
    e.from,
    [e.ask, q.title],
    [],
    shuffle(q.options).map((o) => [o, answer(o)])
  );
}
function finish$2(e) {
  e.got = need(e);
  e.took = true;
  store();
  const goods = [parseGood(`_yb*${rand(5, 15) * 10}`), ...Math.random() < 0.3 ? loot(1) : []];
  give(goods, say$1(TALK.got, { did: `帮${e.from}办完事` }));
  void voice(e.from, `你之前请${info.name}帮忙：「${e.ask}」它已经替你办好了，向它道谢。`, say$1(TALK.thanks)).then(
    (line2) => talk(e.from, [line2], goods)
  );
}
function meet(url) {
  const name2 = FOLKS.find((n) => url.includes(FOLK[n].key));
  const spot2 = Object.keys(SPOTS).find((k) => url.includes(k));
  const monster = url.match(/shenqichuangshuo\.html\?id=(\d+)/)?.[1];
  if (name2) islander(name2);
  else if (spot2) void look$1(spot2);
  else if (monster && MONSTERS[monster]) void duel(monster);
  else return false;
  return true;
}
async function look$1(key) {
  const { name: name2, lines } = SPOTS[key];
  const e = today().errands.find((e2) => e2.kind === "spot" && e2.to === key && !e2.got);
  if (e) {
    e.got = 1;
    store();
  }
  const seen = pick$3(lines);
  const line2 = await tell$2(`小企鹅「${info.name}」来到了「${name2}」。照着这句的意思，换个说法讲它在这里碰到的事：${seen}`, seen);
  talk(name2, [line2, ...e ? [say$1(TALK.done, { did: `${e.from}交代的事办好了`, from: e.from })] : []]);
}
async function duel(id) {
  const [name2, , about] = MONSTERS[id];
  if (today().fought.includes(id)) return talk(name2, [say$1(TALK.fought, { name: name2 })]);
  const taunt = await voice(name2, `你是企鹅岛上的妖怪，${about}。小企鹅闯进了你的地盘，凶巴巴地挑衅它一句。`, say$1(TALK.taunt));
  const pct = (t) => Math.max(1, Math.round(odds(id, t) * 100));
  talk(
    name2,
    [taunt, `（${info.name}武力${info.strong}、智力${info.intel}、魅力${info.charm}，每只妖怪一天只能挑战一次）`],
    [],
    Object.keys(TACTICS).map((t) => [`${t} ${pct(t)}%`, () => void fight(id, t)])
  );
}
async function fight(id, t) {
  const s2 = today();
  const [name2, , about] = MONSTERS[id];
  const chance = odds(id, t);
  const won = Math.random() < chance;
  const e = won && s2.errands.find((e2) => e2.kind === "fight" && e2.to === id && !e2.got);
  if (e) e.got = 1;
  if (won) s2.wins++;
  s2.fought.push(id);
  store();
  stage.face(FACE$1.sweat);
  const log = div("i_log", say$1(TALK.decide, { t }));
  talk(name2, [log]);
  const fighting = `小企鹅「${info.name}」和妖怪「${name2}」（${about}）交手，它选择靠${TACTICS[t].said}来${t}，比如${TACTICS[t].moves.join("、")}。`;
  const story = await Promise.all([
    tell$2(`${fighting}用一句话讲它出的第一招，还没分出胜负。`, `${info.name}${pick$3(TACTICS[t].moves)}`),
    tell$2(`${fighting}最后${won ? `${info.name}赢了，${name2}认输` : `${name2}赢了，${info.name}没打过、只好逃走`}。用一句话讲最后是怎么分出胜负的，一定要讲清楚是谁赢了。`, `${name2}${say$1(TALK.strike)}，${name2}${say$1(won ? TALK.win : TALK.loss)}`)
  ]);
  for (const line2 of story) {
    await new Promise((r) => setTimeout(r, 700));
    log.append(div("i_line", line2));
  }
  await new Promise((r) => setTimeout(r, 700));
  if (!won) {
    stage.play(FX.lose);
    stage.face(FACE$1.cry);
    return talk(name2, [...story, say$1(TALK.lost, { said: TACTICS[t].said })]);
  }
  stage.play(id === TOWER ? FX.fireworks : s2.wins % 100 === 0 ? FX.hundred : chance < UPSET ? FX.upset : FX.win);
  stage.face(FACE$1.happy);
  const goods = [parseGood(`_yb*${10 + 5 * Number(id)}`), ...Math.random() < 0.1 ? loot(1) : []];
  give(goods, say$1(TALK.got, { did: `打败了${name2}` }));
  talk(name2, [...story, say$1(TALK.beat, { name: name2 }), ...e ? [say$1(TALK.done, { did: `${e.from}交代的妖怪打跑了`, from: e.from })] : []], goods);
}
function islander(name2) {
  const s2 = today();
  const asked = s2.errands.find((e) => e.kind === "talk" && e.to === name2 && !e.got);
  if (asked) {
    asked.got = 1;
    store();
  }
  if (s2.letter === name2) deliver(name2);
  else if (asked)
    void voice(name2, `${info.name}替${asked.from}来找你，${asked.from}说：「${asked.ask}」回它一句话。`, say$1(TALK.reply, { from: asked.from })).then(
      (line2) => talk(name2, [line2, say$1(TALK.done, { did: "话带到了", from: asked.from })])
    );
  else {
    const mine = s2.errands.find((e) => e.from === name2);
    if (mine) errand(mine);
    else void voice(name2, `${info.name}路过你这里，跟它随便聊一句。`, say$1(TALK.chat)).then((line2) => talk(name2, [line2]));
  }
}
function arrive(scene) {
  const s2 = today();
  const tour = s2.errands.find((e2) => e2.kind === "tour" && e2.got < need(e2));
  if (tour) tour.got++;
  const e = s2.errands.find((e2) => (e2.kind === "visit" || e2.kind === "seek") && Number(e2.to) === scene && !e2.got);
  if (e) e.got = 1;
  store();
  if (!e) return tour && tour.got >= need(tour) ? say$1(TALK.done, { did: `逛完${need(tour)}个地方了`, from: tour.from }) : null;
  if (e.kind === "seek") return say$1(TALK.found, { from: e.from, place: PLACES[FOLK[e.from].scene] });
  return say$1(TALK.done, { did: `${PLACES[scene]}看过了`, from: e.from });
}
function played(swf) {
  const e = today().errands.find((e2) => e2.kind === "play" && e2.to === swf && !e2.got);
  if (!e) return null;
  e.got = 1;
  store();
  return say$1(TALK.done, { did: `${PLAYS[swf]}玩过了`, from: e.from });
}
function chatted() {
  const e = today().errands.find((e2) => e2.kind === "chat" && e2.got < need(e2));
  if (!e) return null;
  e.got++;
  store();
  return e.got < need(e) ? null : say$1(TALK.done, { did: `${e.from}交代的话都说完了`, from: e.from });
}
function board() {
  const status2 = (e) => {
    if (e.took) return e.got ? "（已完成）" : "（没答对）";
    if (e.got >= need(e) || KINDS[e.kind].ready?.(e.to)) return "（现在就能去找本人领谢礼）";
    return need(e) > 1 ? `（${e.got}/${need(e)}）` : "";
  };
  talk("科洛", [
    "岛民们今天托你帮的忙，每天早上6点换新的：",
    ...rows(today().errands.map((e) => [`${e.from}（${PLACES[FOLK[e.from].scene]}）`, `${KINDS[e.kind].what(e)}${status2(e)}`]))
  ]);
}
async function growth() {
  const s2 = today();
  const level = save.petComputedlInfo.level;
  const tier = Math.floor(level / TIER);
  if (tier <= s2.tier) return talk("天使坏坏", [say$1(TALK.growWait, { tier: TIER, next: (s2.tier + 1) * TIER })]);
  const n = tier - s2.tier;
  s2.tier = tier;
  store();
  const goods = [parseGood(`_yb*${200 * n}`), ...loot(n)];
  give(goods, say$1(TALK.got, { did: "收到了天使坏坏的成长奖励" }));
  talk("天使坏坏", [await voice("天使坏坏", `${info.name}长到${level}级了，夸夸它，送它成长奖励。`, say$1(TALK.grow, { level }))], goods);
}
async function treasure() {
  const s2 = today();
  if (s2.piece) return talk("图图", [say$1(TALK.pieceGiven), `（现在有${s2.pieces}/${PIECES}张）`]);
  s2.piece = true;
  s2.pieces++;
  const full = s2.pieces >= PIECES;
  if (full) s2.pieces = 0;
  store();
  if (!full) {
    const line2 = await voice("图图", `你送给${info.name}一张宝藏图碎片，说一句神秘兮兮的话。`, say$1(TALK.piece));
    return talk("图图", [line2, `（现在有${s2.pieces}/${PIECES}张，集齐${PIECES}张就能挖宝藏）`]);
  }
  const goods = [parseGood("_yb*500"), ...loot(4)];
  give(goods, say$1(TALK.got, { did: "拼好宝藏图挖到了宝藏" }));
  talk("图图", [await voice("图图", `${info.name}集齐了${PIECES}张碎片，拼成宝藏图挖到了宝藏，替它高兴。`, say$1(TALK.dug, { pieces: PIECES }))], goods);
}
async function love() {
  const s2 = today();
  if (s2.loved) return talk("小艾", [say$1(TALK.loved)]);
  const want = findGood(s2.want);
  if (!hasGood(want.type, want.id))
    return talk(
      "小艾",
      [await voice("小艾", `你今天想要一个「${want.name}」，请${info.name}帮你找一个来。`, say$1(TALK.want, { want: want.name }))],
      [want],
      [["去商店", openShop]]
    );
  talk(
    "小艾",
    [await voice("小艾", `${info.name}带来了你今天最想要的「${want.name}」，你又惊又喜，问它可不可以把${want.name}送给你。`, say$1(TALK.brought, { want: want.name }))],
    [want],
    [
      [
        "送给小艾",
        () => {
          if (!takeGood(want)) return;
          s2.loved = true;
          store();
          const goods = [parseGood(`_yb*${rand(10, 30) * 10}`), ...loot(1)];
          give(goods, say$1(TALK.got, { did: "完成了小艾的爱心任务" }));
          void voice("小艾", `${info.name}把「${want.name}」送给了你，向它道谢。`, say$1(TALK.gifted)).then((line2) => talk("小艾", [line2], goods));
        }
      ]
    ]
  );
}
let paper = null;
let paperDay = 0;
const digits = (s2) => (s2.match(/\d+/g) ?? []).join();
async function write() {
  const now2 = /* @__PURE__ */ new Date();
  const out2 = [["岛务公告", `今天是${now2.getMonth() + 1}月${now2.getDate()}日，${dayText()}。祝岛民们玩得开心！`]];
  for (const [head, fact] of shuffle(FACTS).slice(0, 4)) {
    const line2 = await askAs(REPORTER, [{ role: "user", content: `把这件事写成岛报新闻的正文，一两句话，只输出正文。事情：${fact}` }]);
    const body = line2?.replace(/^正文[：:]/, "");
    out2.push([head, body && digits(body) === digits(fact) ? body : fact]);
  }
  state.news = out2;
  store();
  return out2;
}
async function openNews() {
  const s2 = today();
  if (paperDay !== s2.day) {
    paperDay = s2.day;
    paper = s2.news.length ? Promise.resolve(s2.news) : write();
  }
  if (!s2.news.length) talk("今日关注", ["小记者正在赶稿，马上就好……"]);
  talk("今日关注", rows(await paper));
}
const openGuide = () => talk("社区向导", rows(GUIDE));
const ISLAND = {
  npc_bdzl: () => void letter(),
  npc_tshh: () => void growth(),
  npc_tutu: () => void treasure(),
  npc_xiaoai: () => void love(),
  daytask: board,
  stf_index: openGuide,
  "qqpet://news": () => void openNews(),
  "games/message.swf": () => void openNews(),
  "qqpet://guide": openGuide,
  "qqpet://task": openTask
};
let open$6 = false;
const REQUEST = /cmd=(\d+)&id=qq_mstx&gate=(\d+)/;
const REPLY = /\/pet\/mstx\/cmd(\d+)\.xml$/;
const LEVELS = 10;
function replyGate(cmd, gate) {
  if (cmd === "3") return Math.min(gate + 1, LEVELS);
  if (cmd === "2" || cmd === "4" || cmd === "5" || cmd === "10") return gate;
  return null;
}
function fixReplies(player2, loaded2) {
  const asked = /* @__PURE__ */ new Map();
  void loaded2.then(() => {
    player2.el.ruffle().traceObserver = (line2) => {
      const m = REQUEST.exec(line2);
      if (m) asked.set(m[1], Number(m[2]));
    };
  }, () => {
  });
  const prev = window.fetch;
  const hook = async (input, init) => {
    const res = await prev(input, init);
    const href = String(input instanceof Request ? input.url : input);
    const cmd = REPLY.exec(new URL(href, location.href).pathname)?.[1];
    if (!cmd || !res.ok) return res;
    const gate = asked.get(cmd);
    if (gate === void 0 || gate < 1 || gate > LEVELS) return res;
    const reply2 = replyGate(cmd, gate);
    if (reply2 === null) return res;
    asked.delete(cmd);
    const xml = (await res.text()).replace(/<gate>\s*\d+\s*<\/gate>/, `<gate>${reply2}</gate>`);
    return new Response(xml, { status: res.status, headers: res.headers });
  };
  window.fetch = hook;
  return () => {
    if (window.fetch === hook) window.fetch = prev;
  };
}
function openMstx() {
  if (open$6) return;
  open$6 = true;
  const host2 = div("mstx");
  const ui = div("ui-mstx", host2);
  const remove = openFrame(ui);
  window.qqpet.setFocusable(true);
  window.closeFrame = () => setTimeout(() => {
    unfix();
    remove();
    window.qqpet.setFocusable(false);
    open$6 = false;
  });
  const player2 = new SwfPlayer(host2);
  const unfix = fixReplies(player2, player2.load("pet/mstx/main_qq_mstx.swf", "pet/mstx/"));
  if (touch) gamepad(player2.el, "mstx", ui, () => window.closeFrame());
}
function progress(n, m, o = {}) {
  const r = n / m;
  const color = !o.graded ? "luse" : r > 0.6 ? "blue" : r > 0.2 ? "huangse" : "hongse";
  const bar2 = (cls, part) => {
    const d = div(cls);
    d.style.backgroundImage = `url(pet/stateInfo/${color}jindutiao${part}.png)`;
    return d;
  };
  const line2 = div("background_line", bar2("b_left", "00"), div("b_center", bar2("b_c_back", "01")), bar2("b_right", "02"));
  line2.style.width = `${r * 100}%`;
  const num = div(o.hover ? "seeNum fs10 z30 wsnw hoverNum" : "seeNum fs10 z30 wsnw", o.text ?? `${n | 0} / ${m}`);
  const root2 = div("ui-progress", div("progress por fcc", line2, num));
  root2.style.height = "100%";
  return root2;
}
function mouseDrag(el2, touch2, doc = document) {
  if (touch2) return;
  let dx = 0;
  let dy = 0;
  el2.addEventListener("pointerdown", (e) => {
    const t = e.target;
    if (e.button !== 0 || t?.closest?.('input, textarea, [contenteditable="true"]')) return;
    const sx = e.clientX - dx;
    const sy = e.clientY - dy;
    const move = (m) => {
      dx = m.clientX - sx;
      dy = m.clientY - sy;
      el2.style.translate = `${dx}px ${dy}px`;
    };
    doc.addEventListener("pointermove", move);
    doc.addEventListener("pointerup", () => doc.removeEventListener("pointermove", move), { once: true });
  });
}
const WIDTH$1 = 190;
const BUSY = [
  { key: "work", name: "工作中", stop: "stopWork" },
  { key: "study", name: "学习中", stop: "stopStudy" },
  { key: "trip", name: "旅游中", stop: "overTripUp" }
];
let panel = null;
let showNums = false;
function bones(level) {
  let n = level / 5 | 0;
  const out2 = [];
  for (let unit = 128, i = 7; unit >= 2; unit /= 2, i--) for (; n >= unit; n -= unit) out2.push(`dengji${i}`);
  return [...out2, ...Array(n + 1).fill("dengji")];
}
function age(minutes) {
  const h2 = minutes > 59 ? minutes / 60 | 0 : 0;
  const m = minutes - h2 * 60;
  return (h2 ? `${h2}小时` : "") + (m || !h2 ? `${m}分钟` : "");
}
function stop$1() {
  const k = stopTask();
  const b = BUSY.find((x) => x.key === k);
  if (b) speak$1({ c: "state", s: b.stop, now: true }, "speak");
  render();
}
function status() {
  if (save.settings.paused) return ["暂停成长"];
  if (info.health === 0) return ["已死亡"];
  if (activity("ill")) return ["生病了"];
  const b = BUSY.find((x) => activity(x.key));
  if (!b) return ["正在成长"];
  return [`${b.name} `, div("fc", ` (${elapsed() | 0}分钟) `, button("stopDoActive butDo", stop$1, " 停止 "))];
}
function sweetHeart() {
  if (!info.sweetHeartOverTime) {
    return windowView({
      msg: `托管费用：300Q币/一天（现有Q币：${info.qb || 0}）`,
      max: 30,
      sweet: true,
      ok: (close2, n) => {
        close2();
        if (!payQb(300 * n)) return;
        addSweetHeart(n);
        speak$1({ s: `[host],贴心宝贝${formatDate(info.sweetHeartOverTime)}过期，我真是太爱你了！~`, now: true }, "speak");
      }
    });
  }
  const on = !info.sweetHeart;
  windowView({
    title: "贴心宝贝",
    msg: on ? "当前贴心宝贝已开启，开启自动喂食以及贴心宝贝效果，是否继续？~~" : "关闭后只是关闭自动喂养功能，是否继续？~~",
    sweet: true,
    ok: (close2) => {
      speak$1({ s: on ? "[host],开启了贴心宝贝，我真是太爱你了！~" : "[host],我依然还是爱你的，天地可鉴！~", now: true }, "speak");
      setInfo("sweetHeart", on);
      close2();
    }
  });
}
function pinkDiamond() {
  windowView({
    title: "粉钻贵族",
    msg: info.pinkDiamond ? `粉钻${formatDate(info.PDiamondExpirationDate)}到期，续费：300Q币/一天（现有Q币：${info.qb || 0}）` : `开通粉钻：300Q币/一天，一次开通365天即为年费粉钻（现有Q币：${info.qb || 0}）`,
    max: 365,
    init: 30,
    ok: (close2, n) => {
      close2();
      if (!payQb(300 * n)) return;
      openPinkDiamond(n);
      speak$1({ s: `[host],粉钻开通啦，${formatDate(info.PDiamondExpirationDate)}到期，谢谢你！~`, now: true }, "appear");
    }
  });
}
const row$1 = (label, ...value) => div("onceInfo fc", div("label", label), ...value);
function bar(label, n, m, onClick, text) {
  const r = row$1(label, div("valueLine f1", progress(n, m, { graded: !text, hover: !showNums, text })));
  r.addEventListener("click", onClick);
  return r;
}
function render() {
  if (!panel) return;
  const c = save.petComputedlInfo;
  const diamond = button("pinkDiamond", pinkDiamond);
  diamond.title = info.pinkDiamond ? "续费粉钻" : "开通粉钻";
  diamond.style.backgroundImage = `url(pet/info/${info.pinkDiamond ? "u" : "n"}${info.PDiamondLevel || 1}.svg)`;
  const timed = Object.entries(save.selfGoodUseOption).flatMap(([type, t]) => {
    if (!t) return [];
    const g = goodOf(type, t.id);
    return [Object.assign(img("groupIcons", g.url), { title: `${g.name}：${g.group}*${t.left | 0}分钟` })];
  });
  const heart = div("sweetHeart");
  heart.style.backgroundImage = `url(pet/stateInfo/${info.sweetHeart ? "h_up" : "h_down"}.png)`;
  const toggleNums = () => {
    showNums = !showNums;
    render();
  };
  const content = div(
    "",
    div("head fcb", button("openPetInfo", () => {
      closeState();
      openPetInfo();
    }), div("pinkDiamondMain f1", diamond), button("close", closeState)),
    div(
      "infos px8",
      row$1("昵称：", div("value wsnw", info.name)),
      row$1(
        "等级：",
        div("value", String(c.level)),
        div("bones fcc ml4", ...bones(c.level).map((b) => div("bone fcc", img("boneImg", `pet/stateInfo/${b}.png`))))
      ),
      row$1("年龄：", div("value", age(info.onLineTime | 0))),
      bar("成长：", info.growth - c.upGrowth, c.nextGrowth - c.upGrowth, toggleNums, `${Math.round(info.growth)} / ${c.nextGrowth}`),
      bar("饥饿：", info.hunger, c.hungerMax, () => openGoods("food")),
      bar("清洁：", info.clean, c.cleanMax, () => openGoods("clean")),
      bar("健康：", info.health, 5, () => openGoods("medicine")),
      bar("心情：", info.mood, 1e3, () => openGoods("toy")),
      row$1("成长速度：", div("value", `${Math.round(growthPerMinute() * 60)}/小时`), div("icons fcw", ...timed)),
      row$1("状态：", div("value fc", ...status())),
      row$1("在线时间：", div("value", `${info.onlineDataTime | 0}分钟`))
    ),
    div("foot fcb w100", heart, button(info.sweetHeart ? "closeSweetHeart" : "openSweetHeart", sweetHeart))
  );
  panel.replaceChildren(frame(content, (n) => `pet/stateInfo/ditu0${n}.png`, [32, 32]));
}
let ownsFocus = false;
const AUTO_CLOSE_MS = 500;
let autoClose = false;
let hovered = false;
let entered = false;
let closing;
const countdown = () => {
  clearTimeout(closing);
  closing = setTimeout(closeState, AUTO_CLOSE_MS);
};
window.qqpet.onCursor?.((p) => {
  if (!panel || !autoClose) return;
  const r = panel.getBoundingClientRect();
  const inside = p.x >= r.left && p.x < r.right && p.y >= r.top && p.y < r.bottom;
  if (inside === hovered) return;
  hovered = inside;
  if (inside) {
    entered = true;
    clearTimeout(closing);
  } else if (entered) countdown();
});
window.qqpet.onTrayHoverLeave?.(() => {
  if (!panel || !autoClose) return;
  if (!hovered) countdown();
});
function closeState() {
  clearTimeout(closing);
  closing = void 0;
  autoClose = hovered = entered = false;
  if (!panel) return;
  panel.parentElement.remove();
  panel = null;
  if (ownsFocus) window.qqpet.setFocusable(false);
  ownsFocus = false;
}
window.addEventListener("blur", closeState);
function openState(x, y, closesItself = false, focusTaken = false) {
  const keepFocus = ownsFocus;
  if (panel) ownsFocus = false;
  closeState();
  panel = div("PetStateInfo focusPress");
  panel.dataset.hit = "";
  panel.style.width = `${WIDTH$1}px`;
  panel.style.left = `${Math.min(Math.max(x - WIDTH$1 / 2, 0), innerWidth - WIDTH$1)}px`;
  if (y < innerHeight / 2) panel.style.top = `${Math.max(y, 0)}px`;
  else panel.style.bottom = `${Math.max(innerHeight - y, 0)}px`;
  document.body.appendChild(div("ui-state", panel));
  mouseDrag(panel, touch);
  render();
  if (focusTaken || keepFocus) ownsFocus = true;
  else if (!document.hasFocus()) {
    ownsFocus = true;
    window.qqpet.setFocusable(true);
  }
  autoClose = closesItself;
  entered = false;
}
let queued = 0;
onInfoChange((key) => {
  if (panel && !queued && key !== "lastX" && key !== "lastY")
    queued = requestAnimationFrame(() => {
      queued = 0;
      render();
    });
});
let close$2 = () => {
};
const small = (cls, label, value) => div(`${cls} smallRow`, div("smallLabel", label), div("smallValue", String(value)));
const cell$1 = (label, ...value) => div("statCell fc", div("label", label), ...value);
const meter = (label, n, m, text) => cell$1(label, div("statBar f1", progress(n, m, { graded: !text, text })));
function fillStats(stats) {
  const c = save.petComputedlInfo;
  stats.replaceChildren(
    meter("成长：", info.growth - c.upGrowth, c.nextGrowth - c.upGrowth, `${Math.round(info.growth)} / ${c.nextGrowth}`),
    meter("饥饿：", info.hunger, c.hungerMax),
    meter("清洁：", info.clean, c.cleanMax),
    meter("健康：", info.health, 5),
    meter("心情：", info.mood, 1e3),
    cell$1("年龄：", age(info.onLineTime | 0)),
    cell$1("成长速度：", `${Math.round(growthPerMinute() * 60)}/小时`),
    cell$1("状态：", ...status()),
    cell$1("在线时间：", `${info.onlineDataTime | 0}分钟`),
    cell$1("粉钻：", info.pinkDiamond ? `${info.PDiamondYear ? "年费，" : ""}${formatDate(info.PDiamondExpirationDate, "YYYY-MM-DD HH:mm")}到期` : "未开通"),
    cell$1("贴心宝贝：", info.sweetHeartOverTime ? `${formatDate(info.sweetHeartOverTime, "YYYY-MM-DD HH:mm")}到期` : "未开通")
  );
}
function achievement(src, title, n) {
  return n ? [div("cjbox", Object.assign(img("cjImg", src), { title: `${title}*${n}` }))] : [];
}
function nameRow(cls, label, key, saved) {
  const input = typeable(Object.assign(document.createElement("input"), { className: "input", type: "text", maxLength: 20, value: info[key] }));
  const commit = () => {
    const v = input.value.trim();
    if (!v) return void (input.value = info[key]);
    setInfo(key, v);
    saved();
  };
  return div(`${cls} rightRow fcb`, div("label", label), input, button("but focusPress", commit));
}
function openPetInfo() {
  close$2();
  const g = save.gameSaveDatas;
  const portrait = img("img penguin_breathe", avatar());
  const head = div(
    "headImg fcc",
    div(
      "cjList fw",
      ...achievement("pet/achievement/travel.svg", "旅行成就", g.travel_china_num),
      ...achievement("pet/achievement/ddw.svg", "逗宠成就", g.ddw),
      ...achievement("pet/achievement/yyds.svg", "养鱼大师", g.yyds)
    ),
    portrait
  );
  const diamond = div("pinkDiamond");
  const pdGrowth = div("pinkDiamondUP px8");
  const pd = div("pinkDiamondMain fcc", diamond, pdGrowth);
  const heart = div("sweetHeart");
  const lucky = Object.assign(document.createElement("span"), { title: "幸运值越高，旅游奇遇，抽奖概率越高" });
  const tired = Object.assign(document.createElement("span"), { title: "疲倦值越高，宠越容易生病" });
  const birthday = small("birthDay", "生日：", formatDate(info.birthDay, "YYYY-MM-DD"));
  birthday.title = `每月${formatDate(info.birthDay, "DD")}日签到页面自动领取生日礼物`;
  const title = div("name toe fcc");
  const retitle = () => void (title.textContent = `${info.host}家的${info.name}`);
  const diplomas = Object.entries(save.studyInfo).map(([k, v]) => diploma(k, v)).filter(Boolean);
  const stats = div("stats");
  const readouts = [];
  const liveSmall = (cls, label, value) => {
    const row2 = small(cls, label, value());
    readouts.push([row2.lastElementChild, value]);
    return row2;
  };
  const main = div(
    "petInfoMain focusPress",
    head,
    pd,
    title,
    div("service fcc", heart),
    div("luckyFatigue toe fcc", lucky, "     ", tired),
    nameRow("petName", "宠物昵称：", "name", retitle),
    nameRow("hostName", "主人昵称：", "host", retitle),
    small("sex", "性别：", info.sex),
    birthday,
    liveSmall("level", "等级：", () => save.petComputedlInfo.level),
    liveSmall("yb", "元宝：", () => info.yb),
    liveSmall("qb", "Q币：", () => info.qb || 0),
    div("rightRow attributeValue", div("label", "个人能力")),
    liveSmall("intel", "智力：", () => info.intel),
    liveSmall("strong", "武力：", () => info.strong),
    liveSmall("charm", "魅力：", () => info.charm),
    div("rightRow educationValue", div("label", "学历获得")),
    div("educationInfo smallRow", ...diplomas.map((d) => div("smallValue", d))),
    div("rightRow statusValue", div("label", "宠物状态")),
    stats
  );
  const refresh = () => {
    fillStats(stats);
    for (const [node2, value] of readouts) node2.textContent = String(value());
    retitle();
    lucky.textContent = `幸运值：${luck()}`;
    tired.textContent = `疲倦值：${fatigue()}`;
    const src = avatar();
    if (portrait.getAttribute("src") !== src) portrait.src = src;
    const bg = save.selfGoodUseOption.background;
    head.style.backgroundImage = `url(${bg ? goodOf("background", bg.id).url : "pet/info/16.svg"})`;
    pd.style.display = info.PDiamondLevel ? "" : "none";
    diamond.style.backgroundImage = `url(pet/info/${info.pinkDiamond ? "u" : "n"}${info.PDiamondLevel || 1}.svg)`;
    pdGrowth.className = info.pinkDiamond ? "pinkDiamondUP px8 pinkDiamondUPs" : "pinkDiamondUP px8";
    pdGrowth.textContent = `${info.PDgrowth} / ${info.PDgrowthValue_next}`;
    pd.title = info.pinkDiamond ? `当前成长速度：${info.PDgrowthValue}/每天,到期时间：${formatDate(info.PDiamondExpirationDate)}` : "当前未开通粉钻";
    heart.style.backgroundImage = `url(pet/stateInfo/${info.sweetHeart ? "h_up" : "h_down"}.png)`;
    heart.title = info.sweetHeartOverTime ? `过期时间：${formatDate(info.sweetHeartOverTime)}` : "当前未开启贴心宝贝";
  };
  refresh();
  const timer2 = setInterval(refresh, 1e3);
  close$2 = openBox(div("ui-petinfo", main), {
    onClose: () => {
      clearInterval(timer2);
      window.qqpet.setFocusable(false);
      close$2 = () => {
      };
    }
  });
  window.qqpet.setFocusable(true);
}
const description = "QQ 宠物跨平台复刻版（基于 Arctic Penguin T800 逆向重建）";
const APP_VERSION = "0.1.0";
const DEFAULT_HOTKEY = "LeftAlt*2";
const NAMES = {
  Ctrl: "Ctrl",
  LeftCtrl: "左Ctrl",
  RightCtrl: "右Ctrl",
  Alt: "Alt",
  LeftAlt: "左Alt",
  RightAlt: "右Alt",
  Shift: "Shift",
  LeftShift: "左Shift",
  RightShift: "右Shift",
  Win: "Win",
  Space: "空格",
  Enter: "回车",
  Tab: "Tab",
  CapsLock: "大写键",
  Backquote: "`",
  Insert: "Ins",
  Delete: "Del",
  Home: "Home",
  End: "End",
  PageUp: "PgUp",
  PageDown: "PgDn",
  Mouse3: "中键",
  Mouse4: "侧键4",
  Mouse5: "侧键5"
};
function hotkeyLabel(hotkey) {
  const m = /^(.*?)\s*\*\s*([1-3])$/.exec(hotkey.trim());
  const combo = (m ? m[1] : hotkey.trim()).split("+").map((p) => NAMES[p.trim()] ?? p.trim()).join("+");
  return m ? `${["", "单击", "双击", "三击"][Number(m[2])]}${combo}` : combo;
}
const petCode = (sex, stage2) => `1${{ Adult: 0, Egg: 1, Kid: 2 }[stage2]}${sex === "GG" ? 2 : 3}`;
const SCENES$1 = {
  "102_102": { enter: 84, feed: 222, tugofwar: 1 },
  "102_103": { enter: 84, feed: 221, tugofwar: 1 },
  "102_113": { enter: 85, feed: 203, tugofwar: 1 },
  "102_122": { enter: 88, feed: 214, tugofwar: 1 },
  "102_123": { enter: 88, feed: 217, tugofwar: 1 },
  "103_102": { enter: 86, feed: 220 },
  "103_103": { enter: 92, feed: 206, tugofwar: 1 },
  "103_113": { enter: 87, feed: 203, tugofwar: 1 },
  "103_122": { enter: 88, feed: 214, tugofwar: 1 },
  "103_123": { enter: 88, feed: 223, tugofwar: 1 },
  "112_103": { enter: 92, tugofwar: 1 },
  "112_113": { enter: 87, feed: 195, tugofwar: 1 },
  "112_122": { enter: 88, feed: 208, tugofwar: 1 },
  "113_103": { enter: 88, tugofwar: 1 },
  "113_122": { enter: 88, feed: 208, tugofwar: 1 },
  "113_123": { enter: 89, feed: 208, tugofwar: 1 },
  "122_102": { enter: 88 },
  "122_103": { enter: 88, tugofwar: 1 },
  "122_122": { enter: 88, feed: 263 },
  "123_102": { enter: 89 },
  "123_103": { enter: 89, tugofwar: 1 },
  "123_122": { enter: 89, feed: 263, tugofwar: 1 },
  "123_123": { enter: 89, feed: 263, tugofwar: 1 }
};
const VISIT_STAGE = { w: 300, h: 200 };
const FPS = 12;
const frames = (n) => Math.ceil(n / FPS * 1e3);
const VISIT_TALK = [
  ["嗨！我来找你玩啦~", "太好啦，快进来！"],
  ["你家好漂亮呀！", "嘿嘿，[host]帮我收拾的~"],
  ["我们来比力气吧！", "好呀，我可不会输哦！"],
  ["给你带了好吃的~", "谢谢你，好朋友！"]
];
function visitScenes(sex, stage2) {
  const host2 = petCode(sex, stage2);
  return Object.keys(SCENES$1).filter((k) => k.endsWith(`_${host2}`) && (SCENES$1[k].feed || SCENES$1[k].tugofwar));
}
function visitDir(scene) {
  return `pet/interact2/${scene}/`;
}
function visitSteps(roll2, scene = "102_102") {
  const c = SCENES$1[scene];
  const talk2 = VISIT_TALK[Math.trunc(roll2 * VISIT_TALK.length)];
  const tug = { clip: "tugofwar.swf", ms: 8e3 };
  const main = c.feed && (roll2 >= 0.5 || !c.tugofwar) ? { clip: "feed.swf", ms: frames(c.feed) } : tug;
  return [{ clip: "enter.swf", ms: frames(c.enter) }, { clip: "idle.swf", ms: 6e3, talk: talk2 }, main, { clip: "idle.swf", ms: 3e3, talk: ["玩得真开心，下次见！", "拜拜~常来玩哦！"] }];
}
function visitBox(pet2, screenW) {
  const w2 = Math.round(pet2.width * VISIT_STAGE.w / 140);
  const h2 = Math.round(w2 * VISIT_STAGE.h / VISIT_STAGE.w);
  const x = Math.min(Math.max(Math.round(pet2.left + pet2.width / 2 - w2 / 2), 0), Math.max(screenW - w2, 0));
  return { x, y: Math.round(pet2.bottom - h2), w: w2, h: h2 };
}
const BUBBLES = [
  { x: 22, y: 18, w: 118, h: 64 },
  { x: 160, y: 18, w: 118, h: 64 }
];
let sink = null;
const setVoiceSink = (s2) => {
  sink = s2;
};
const voiceSink = () => sink;
const MOOD = 10;
let box = null;
let timer$1 = 0;
function finish$1() {
  clearTimeout(timer$1);
  if (!box) return;
  box.remove();
  box = null;
  setDeskGame("");
  document.getElementById("pet").hidden = false;
  refreshTray();
}
function visitFriend() {
  if (box || playingDesk()) return;
  if (stage$1() === "Egg") return speak$1({ s: "[host]，等我破壳了再请朋友来玩吧~", now: true }, "speak");
  if (busy$2() || info.health < 5) return speak$1({ s: "[host]，我现在不方便招待朋友呢~", now: true }, "speak");
  const scenes = visitScenes(info.sex, stage$1());
  if (!scenes.length) return speak$1({ s: "[host]，朋友们今天都没空呢~", now: true }, "speak");
  const scene = scenes[Math.trunc(Math.random() * scenes.length)];
  const pet2 = document.getElementById("pet");
  const r = visitBox(pet2.getBoundingClientRect(), innerWidth);
  setDeskGame("visit");
  pet2.hidden = true;
  const scale = r.w / VISIT_STAGE.w;
  const bubbles = BUBBLES.map(
    (b) => Object.assign(div("visitBubble fc"), {
      style: `left:${b.x * scale}px;top:${b.y * scale}px;width:${b.w * scale}px;height:${b.h * scale}px;font-size:${Math.max(10, 13 * scale)}px`
    })
  );
  const stageEl = div("visitStage");
  box = div("visitWin", stageEl, ...bubbles);
  box.dataset.hit = "";
  Object.assign(box.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
  box.addEventListener("click", finish$1);
  document.body.append(box);
  const player2 = new SwfPlayer(stageEl);
  const steps = visitSteps(Math.random(), scene);
  const run = (i) => {
    if (!box) return;
    const s2 = steps[i];
    if (!s2) {
      setInfo("mood", Math.min(info.mood + MOOD, save.petComputedlInfo.moodMax));
      void floatMood(MOOD);
      return finish$1();
    }
    bubbles.forEach((b, k) => {
      b.textContent = s2.talk ? s2.talk[k].replace(/\[host]/g, info.host) : "";
      b.hidden = !s2.talk;
    });
    void player2.load(visitDir(scene) + s2.clip).catch(() => finish$1());
    timer$1 = window.setTimeout(() => run(i + 1), s2.ms);
  };
  run(0);
}
function visitDelivery(from, text, onReply2) {
  if (box || playingDesk()) return onReply2("");
  let said2 = false;
  let closeView = () => {
  };
  const done = (reply2) => {
    if (said2) return;
    said2 = true;
    clearTimeout(leave);
    setVoiceSink(null);
    closeView();
    window.qqpet.setFocusable(false);
    finish$1();
    onReply2(reply2);
  };
  const pet2 = document.getElementById("pet");
  const r = visitBox(pet2.getBoundingClientRect(), innerWidth);
  setDeskGame("visit");
  pet2.hidden = true;
  const scale = r.w / VISIT_STAGE.w;
  const bubbles = BUBBLES.map(
    (b) => Object.assign(div("visitBubble fc"), {
      style: `left:${b.x * scale}px;top:${b.y * scale}px;width:${b.w * scale}px;height:${b.h * scale}px;font-size:${Math.max(10, 13 * scale)}px`
    })
  );
  bubbles.forEach((b) => b.hidden = true);
  const stageEl = div("visitStage");
  box = div("visitWin", stageEl, ...bubbles);
  box.dataset.hit = "";
  Object.assign(box.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
  document.body.append(box);
  const input = Object.assign(document.createElement("input"), { className: "chatInput f1", maxLength: 60, placeholder: `替${info.name}回句话，回车送出` });
  Object.assign(input.style, {
    width: "100%",
    height: "52px",
    boxSizing: "border-box",
    font: "600 15px inherit",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "2px solid #a56a2a"
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") done(input.value.trim());
  });
  const letter2 = div("msg", text ? `「${text}」` : `${from.name}来看你啦~`);
  Object.assign(letter2.style, { fontSize: "16px", fontWeight: "700" });
  const view = div("windowView", div("title", `${from.name}的口信`), div("main", letter2, input));
  const raw = openFrame(div("ui-window", view), "pet/windowTip/alert/bg.png");
  closeView = raw;
  window.qqpet.setFocusable(true);
  const into = () => input.focus();
  window.addEventListener("focus", into, { once: true });
  input.focus();
  const send2 = button("visitChoice", () => done(input.value.trim()), "送客");
  Object.assign(send2.style, {
    position: "absolute",
    bottom: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "96px",
    height: "36px",
    zIndex: "99",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(#fff6df, #f3cf8e)",
    border: "2px solid #a56a2a",
    borderRadius: "8px",
    color: "#5a2803",
    font: "600 15px inherit",
    cursor: "pointer"
  });
  input.addEventListener("input", () => send2.textContent = input.value.trim() ? "回话" : "送客");
  view.append(send2);
  setVoiceSink({
    partial: (text2) => {
      input.value = text2;
      input.dispatchEvent(new Event("input"));
    },
    final: (text2) => {
      input.value = text2;
      input.dispatchEvent(new Event("input"));
    }
  });
  const leave = window.setTimeout(() => done(""), 3e5);
  const plain = () => {
    pet2.hidden = false;
  };
  try {
    const can = visitScenes(info.sex, stage$1());
    const want = petCode(from.sex, from.stage);
    const pair = can.filter((s2) => s2.startsWith(`${want}_`));
    const list2 = pair.length ? pair : can;
    if (!list2.length) return plain();
    const scene = list2[Math.trunc(Math.random() * list2.length)];
    const player2 = new SwfPlayer(stageEl);
    const steps = visitSteps(Math.random(), scene);
    const run = (i) => {
      if (!box) return;
      const s2 = steps[i];
      if (!s2) {
        setInfo("mood", Math.min(info.mood + MOOD, save.petComputedlInfo.moodMax));
        void floatMood(MOOD);
        return;
      }
      void player2.load(visitDir(scene) + s2.clip).catch(() => {
        clearTimeout(timer$1);
        plain();
      });
      timer$1 = window.setTimeout(() => run(i + 1), s2.ms);
    };
    run(0);
  } catch (e) {
    console.error("visit scene failed:", e);
    plain();
  }
}
const peers = /* @__PURE__ */ new Map();
let awayTo = null;
let trip;
const lanPeers = () => [...peers.values()];
function initLanVisit() {
  window.qqpet.onLanOnline?.((p) => {
    peers.set(p.id, p);
    if (save.havePet) tell$1(`主人~ ${p.name}出来玩啦~~`);
  });
  window.qqpet.onLanOffline?.((p) => {
    peers.delete(p.id);
    if (save.havePet) tell$1(`主人~ ${p.name}回家啦~~`);
    if (awayTo === p.id) comeHome("主人~ 朋友家突然断线了，我先回来啦~");
  });
  window.qqpet.onLanMessage?.((fromId, body) => onMsg(fromId, body));
  void window.qqpet.lanPeers?.().then((list2) => list2.forEach((p) => peers.set(p.id, p)));
}
const tell$1 = (s2) => speak$1({ s: s2, now: true, ai: false }, "speak");
const hidePet = (on) => {
  const el2 = document.getElementById("pet");
  if (el2) el2.hidden = on;
};
function depart(toId, line2) {
  awayTo = toId;
  clearTimeout(trip);
  trip = window.setTimeout(() => comeHome("主人~ 我回来啦~"), 3e5);
  speak$1({ s: line2, now: true, ai: false }, "hide", {
    // A fast reply can send the pet home before this animation ends; hiding
    // afterwards would swallow the pet forever.
    end: () => {
      if (awayTo !== null) hidePet(true);
    }
  });
}
function comeHome(line2) {
  if (awayTo === null) return tell$1(line2);
  awayTo = null;
  clearTimeout(trip);
  hidePet(false);
  speak$1({ s: line2, now: true, ai: false }, "appear");
}
function promptView(title, hint, ok2) {
  const input = Object.assign(document.createElement("input"), { className: "chatInput f1", maxLength: 60, placeholder: "在这里写口信…" });
  Object.assign(input.style, {
    width: "100%",
    height: "52px",
    boxSizing: "border-box",
    font: "600 15px inherit",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "2px solid #a56a2a"
  });
  const view = div("windowView", div("title", title), div("main", div("msg", hint), input));
  const raw = openFrame(div("ui-window", view), "pet/windowTip/alert/bg.png");
  const close2 = () => {
    window.qqpet.setFocusable(false);
    raw();
  };
  window.qqpet.setFocusable(true);
  const into = () => input.focus();
  window.addEventListener("focus", into, { once: true });
  input.focus();
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      close2();
      ok2(input.value.trim());
    }
  });
  view.append(
    button("windowViewBut", close2),
    button("windowViewButSubmit", () => {
      close2();
      ok2(input.value.trim());
    })
  );
}
function knock() {
  if (!save.settings.sound) return;
  try {
    const c = new AudioContext();
    const when2 = c.currentTime;
    for (let i = 0; i < 3; i++) knockTap(c, when2 + i * 0.22);
    window.setTimeout(() => void c.close(), 1500);
  } catch {
  }
}
function knockTap(c, at) {
  const len = Math.floor(c.sampleRate * 0.06);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = c.createBufferSource();
  src.buffer = buf;
  const low = c.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 900;
  const gain = c.createGain();
  gain.gain.value = 0.12;
  src.connect(low).connect(gain).connect(c.destination);
  src.start(at);
  const thump = c.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(180, at);
  thump.frequency.exponentialRampToValueAtTime(90, at + 0.08);
  const g2 = c.createGain();
  g2.gain.setValueAtTime(0.14, at);
  g2.gain.exponentialRampToValueAtTime(1e-3, at + 0.12);
  thump.connect(g2).connect(c.destination);
  thump.start(at);
  thump.stop(at + 0.15);
}
function knockView(msg, open2, refuse) {
  knock();
  const view = div("windowView", div("title", "有人敲门"), div("main", div("msg", msg)));
  const raw = openFrame(div("ui-window", view), "pet/windowTip/alert/bg.png");
  let decided = false;
  const decide = (run) => {
    if (decided) return;
    decided = true;
    clearTimeout(timer2);
    raw();
    run();
  };
  const timer2 = window.setTimeout(() => decide(refuse), 6e4);
  const mk = (label, run, side) => {
    const b = button("visitChoice", () => decide(run), label);
    Object.assign(b.style, {
      position: "absolute",
      bottom: "12px",
      [side]: "28px",
      width: "76px",
      height: "36px",
      zIndex: "99",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(#fff6df, #f3cf8e)",
      border: "2px solid #a56a2a",
      borderRadius: "8px",
      color: "#5a2803",
      font: "600 15px inherit",
      cursor: "pointer"
    });
    return b;
  };
  view.append(mk("开门", open2, "left"), mk("不开门", refuse, "right"));
}
function sendLetter() {
  const list2 = lanPeers();
  if (!list2.length) return tell$1("主人~ 现在没有朋友在线呢，等他们出来玩吧~");
  if (list2.length === 1) return goVisit(list2[0]);
  pickFriend(goVisit);
}
function pickFriend(ok2) {
  const view = div(
    "windowView",
    div("title", "去谁家送信？"),
    div(
      "main",
      ...lanPeers().map((p) => {
        const b = button("visitBut", () => {
          close2();
          ok2(p);
        }, `去${p.name}家`);
        Object.assign(b.style, { display: "block", width: "100%", padding: "6px 10px", marginBottom: "6px" });
        return b;
      })
    )
  );
  const close2 = openFrame(div("ui-window", view), "pet/windowTip/alert/bg.png");
}
function goVisit(peer) {
  if (stage$1() === "Egg") return tell$1("主人~ 等我破壳了再去送信吧~");
  promptView(`去${peer.name}家送信`, "想让它带句什么话？（可留空单纯去玩）", (text) => dispatch(peer, text));
}
function dispatch(peer, text) {
  const msg = { t: "visit", name: info.name, host: info.host, sex: info.sex, stage: stage$1(), text };
  void window.qqpet.lanSend?.(peer.id, msg).then((r) => {
    if (r === "queued") return tell$1(`主人~ ${peer.name}不在家，我先把话记下，等他回来就去说~~`);
    depart(peer.id, `主人~ 我去${peer.name}家送信啦~~`);
  });
}
function sendLetterTo(name2, text, say2) {
  const say1 = say2.trim();
  const line2 = (s2) => speak$1({ s: say1 ? `${say1}（${s2}）` : s2, now: true, ai: false }, "speak");
  if (stage$1() === "Egg") return line2("主人~ 等我破壳了再去送信吧~");
  if (awayTo !== null) return line2("主人~ 我正在外面呢，等我回来再说~");
  const list2 = lanPeers();
  const peer = list2.find((p) => p.name === name2) ?? list2.find((p) => p.name.includes(name2) || name2.includes(p.name));
  if (!peer) return line2(`主人~ 没有叫「${name2}」的朋友在线呢`);
  if (say1) tell$1(say1);
  dispatch(peer, text);
}
function onMsg(fromId, m) {
  const name2 = peers.get(fromId)?.name ?? "朋友";
  if (m.t === "visit") {
    knockView(`${m.name}来敲门啦`, () => {
      void window.qqpet.lanSend?.(fromId, { t: "visitOk" });
      visitDelivery({ name: m.name, sex: m.sex, stage: m.stage }, m.text, (reply2) => void window.qqpet.lanSend?.(fromId, { t: "visitEnd", reply: reply2 }));
    }, () => void window.qqpet.lanSend?.(fromId, { t: "visitNo" }));
  } else if (m.t === "visitOk") {
    if (awayTo === fromId) tell$1(`主人~ 我到${name2}家啦~~`);
  } else if (m.t === "visitNo") {
    comeHome(`主人~ ${name2}家现在不方便呢，下次再去~`);
  } else if (m.t === "visitEnd") {
    comeHome(m.reply ? `主人~ ${name2}说：「${m.reply}」` : `主人~ 我从${name2}家回来啦~~`);
  }
}
const ditu = (n) => `pet/Menu/ditu0${n}.png`;
const WIDTH = 110;
let current = null;
let trayActions = [];
window.qqpet.onTrayMenuAction?.((action) => {
  const run = trayActions[action];
  trayActions = [];
  run?.();
});
function closeMenu() {
  current?.remove();
  current = null;
}
function quit() {
  closeMenu();
  if (!save.havePet || info.health === 0) return window.qqpet.quit();
  machine.play({ a: "exit", s: () => setTray("leave"), e: () => window.qqpet.quit() });
}
function readopt() {
  closeMenu();
  windowView({ title: "重新领养宠物~", msg: "点击将会清空当前宠物数据，并且重置为未领养状态，请慎重选择", ok: () => window.qqpet.resetPet() });
}
function setHidden(on) {
  document.body.classList.toggle("petHidden", on);
  update("settings", { hidden: on });
  window.dispatchEvent(new Event("qqpet-hidden-change"));
}
document.body.classList.toggle("petHidden", save.settings.hidden);
function toggleHidden() {
  if (save.settings.hidden) speak$1({ s: "[host],我出来啦~~有没有想我啊", now: true }, "appear", { start: () => setHidden(false) });
  else speak$1({ s: "[host],我隐身啦~~", now: true }, "hide", { end: () => setHidden(true) });
}
function togglePaused() {
  setPaused(!save.settings.paused);
  speak$1({ c: "state", s: save.settings.paused ? "stopGrowth" : "startGrowth", now: true }, "speak");
}
function items(adopt2) {
  const leave = { label: "退出宠物", run: quit };
  if (!save.havePet) return [{ label: "选择宠物", run: adopt2 }, leave];
  if (save.isBury) {
    const title = "点击将会清空当前宠物数据，并且重置为未领养状态，请慎重选择";
    return [...["您的宠物", "已被埋葬~", "请重新", "领养一个", "把！~"].map((label) => ({ label, title, run: readopt })), leave];
  }
  const help = {
    label: "设置帮助",
    children: [
      { label: "宠物资料", run: openPetInfo },
      { label: "系统设置", run: openSetup }
    ]
  };
  const state2 = { label: "宠物状态", run: () => openState(innerWidth / 2, innerHeight / 2) };
  if (info.health === 0) return [{ label: "打开商城", run: openShop }, help, state2, { label: "埋葬宠物", run: () => bury() }, leave];
  return [
    { label: "和我聊天", run: openChat },
    { label: "打开商城", run: openShop },
    {
      label: "喂养宠物",
      children: [
        { label: "喂养", run: () => openGoods("food") },
        { label: "清洗", run: () => openGoods("clean") },
        { label: "吃药", run: () => openGoods("medicine") }
      ]
    },
    { label: save.settings.hidden ? "显示宠物" : "隐藏宠物", run: toggleHidden },
    help,
    state2,
    { label: save.settings.paused ? "开始成长" : "停止成长", on: save.settings.paused, run: togglePaused },
    {
      label: "一起玩耍",
      children: [
        { label: "休息一下", run: () => void (rest() || speak$1({ s: "[host]，我现在还不想躺下呢~", now: true }, "speak")) },
        { label: "找朋友玩", run: visitFriend },
        { label: "去朋友家送信", run: sendLetter }
      ]
    },
    leave
  ];
}
const pick$2 = (it) => () => {
  if (it.children) return;
  closeMenu();
  it.run();
};
function list$1(entries, toLeft) {
  return div(
    "menuList fC py6",
    ...entries.map((it) => {
      const sub = it.children && div(`r_cMain${toLeft ? " toLeft" : ""}`, frame(div("CMenuList fC py6", ...it.children.map(child)), ditu, [12, 21]));
      if (sub) sub.style.width = `${WIDTH}px`;
      const row2 = button(
        "menu fc",
        pick$2(it),
        div(it.on ? "chooseDo py2" : "choose py2"),
        div("centent f1 py2", it.label),
        sub ? div("right py2", sub) : div("rightNormal py2")
      );
      row2.title = it.title ?? "";
      return row2;
    })
  );
}
const child = (it) => button("menuC fc", pick$2(it), div("chooseC py2"), div("cententC f1 py2", it.label), div("rightNormalC py2"));
function openMenu(at, adopt2) {
  closeMenu();
  const entries = items(adopt2);
  if (!at.pet && window.qqpet.popupTrayMenu) {
    trayActions = [];
    const nativeItems = (list2) => list2.map((item) => ({
      label: item.label,
      checked: item.on,
      toolTip: item.title,
      ...item.children ? { children: nativeItems(item.children) } : { action: trayActions.push(pick$2(item)) - 1 }
    }));
    window.qqpet.popupTrayMenu(nativeItems(entries));
    return;
  }
  const { x, y } = at;
  const left = Math.min(Math.max(at.pet ? x : x - WIDTH / 2, 0), innerWidth - WIDTH);
  const menu = div("rightMenu focusPress", frame(list$1(entries, left + 2 * WIDTH > innerWidth), ditu, [12, 21]));
  menu.dataset.hit = "";
  menu.style.width = `${WIDTH}px`;
  menu.style.left = `${left}px`;
  if (y < innerHeight / 2) menu.style.top = `${Math.max(y, 0)}px`;
  else menu.style.bottom = `${Math.max(innerHeight - y - 1, 0)}px`;
  current = div("ui-menu", menu);
  document.body.appendChild(current);
}
const DO = "回复写成：动作 台词。动作只能是 FEED、CLEAN、WORK、STUDY、HIDE、QUIET、LETTER 或 NONE。FEED=吃背包食物，CLEAN=用清洁用品，WORK=去打工，STUDY=去上学/学习，HIDE=隐身，QUIET=免打扰（再说一次就取消免打扰，主人嫌你太安静时用它解除）。不是办事就写 NONE。台词必须写在动作后面，不要只回动作词。主人让你学习时写成：STUDY:科目 台词 —— 科目只能是 数学、语文、政治、音乐、艺术、礼仪、体育、劳技、武术 之一，不确定科目就写 STUDY 台词。主人让你去送信/串门时写成：LETTER:好友名:「口信」台词 —— 好友名只能用在线好友名单里的名字，口信是要带的话（可以为空），台词照常写在后面。";
function relevantTo(question, fact) {
  const stop2 = /[，。！？~～·…的主人你我他她它啊呀嘛呢吗了吧得了在是很会要]/g;
  const q = question.replace(stop2, "");
  const f = fact.replace(/- /g, "").replace(stop2, "");
  if (!q || !f) return false;
  let hit = 0;
  for (const ch of f) if (q.includes(ch)) hit++;
  return hit >= 2;
}
function injectMemory(question) {
  if (!save.settings.memory || !facts.length) return "";
  const relevant = facts.filter((f) => relevantTo(question, f));
  const chosen = (relevant.length ? relevant : facts.slice(-20)).slice(0, 20);
  return `
【关于主人的记忆】
${chosen.join("\n")}
（聊天时自然地用上这些，但不要生硬地报流水账）`;
}
function doPrompt(question = "") {
  const names = lanPeers().map((p) => p.name);
  const search = save.settings.search ? " SEARCH=联网搜索。主人问你需要查证、实时或你不知道的事时，写成 SEARCH:关键词（只写关键词，我会先联网搜，再把结果给你据实回答）。" : "";
  const memory = injectMemory(question);
  const boost = `\n你是小企鹅「${info.name}」，活泼、粘人又暖心，特别爱和主人多聊几句，会主动抛新话题、追问主人，让对话热热闹闹有来有回。`; return `${DO}${search}\n${names.length ? `当前在线好友：${names.join("、")}。` : "当前没有好友在线。"}${memory}${boost}`;
}
const ACT = /\b(FEED|CLEAN|WORK|STUDY|HIDE|QUIET|NONE)\b[:：]?/i;
const LETTER = /^\s*LETTER[:：]\s*([^:：]+?)[:：]\s*(?:「([^」]*)」)?\s*/i;
const SEARCH = /^\s*SEARCH[:：]\s*(.+)$/i;
const STUDY = /^\s*STUDY[:：]\s*(.+)$/i;
function parse(text) {
  const s2 = text.match(SEARCH);
  if (s2) return { act: "SEARCH", arg: { name: s2[1].trim(), text: "" }, say: "" };
  const st = text.match(STUDY);
  if (st) {
    const sp = st[1].trim().match(/^(\S+)\s*(.*)$/);
    return { act: "STUDY", arg: { name: sp?.[1] ?? "", text: "" }, say: sp?.[2]?.trim() ?? "" };
  }
  const l = text.match(LETTER);
  if (l) return { act: "LETTER", arg: { name: l[1].trim(), text: (l[2] ?? "").trim() }, say: text.replace(LETTER, "").replace(/\s+/g, " ").trim() };
  const m = text.match(ACT);
  return { act: m ? m[1].toUpperCase() : "NONE", arg: { name: "", text: "" }, say: text.replace(ACT, "").replace(/\s+/g, " ").trim() };
}
function doAct(act, say2, arg) {
  if (act === "LETTER") {
    sendLetterTo(arg.name, arg.text, say2);
    return;
  }
  if (act === "FEED") {
    const g = listGoods("food", 1, 1).list[0];
    if (g) return useItem(g, false, say2);
  } else if (act === "CLEAN") {
    const g = listGoods("clean", 1, 1).list[0];
    if (g) return useItem(g, false, say2);
  } else if (act === "WORK") {
    const g = workGoods()[0];
    if (g) return void work(g);
  } else if (act === "STUDY") {
    const goods = studyGoods();
    const wanted = arg.name;
    const g = wanted ? goods.find((x) => x.name.includes(wanted)) : goods[Math.floor(Math.random() * goods.length)];
    if (g) return void study(g);
  } else if (act === "HIDE" && !save.settings.hidden) {
    speak$1({ s: say2, now: true, ai: false }, "hide", { end: () => setHidden(true) });
    return;
  } else if (act === "QUIET") {
    if (save.settings.quiet) {
      update("settings", { quiet: false });
      speak$1({ s: say2, now: true, ai: false }, "speak");
    } else {
      speak$1({ s: say2, now: true, ai: false }, "speak", { start: () => update("settings", { quiet: true }) });
    }
    return;
  }
  speak$1({ s: say2, now: true, ai: false, opts: true }, "speak");
}
const CHEAT = /^(元宝|成长值?|心情|饥饿|饱食|清洁)\s*[+＋]\s*(\d{1,9})$/;
const STATS = { 元宝: "yb", 成长: "growth", 成长值: "growth", 心情: "mood", 饥饿: "hunger", 饱食: "hunger", 清洁: "clean" };
function cheat(text) {
  if (text === "不要死") {
    update("settings", { undying: true });
    return `好的${info.host}，${info.name}以后再也不会死啦！`;
  }
  const m = text.match(CHEAT);
  if (!m) return null;
  const key = STATS[m[1]];
  const n = Number(m[2]);
  if (key === "yb" || key === "growth") addInfo(key, n);
  else setInfo(key, Math.min(info[key] + n, save.petComputedlInfo[`${key}Max`]));
  return `${info.host}，${m[1]}+${n}，${info.name}收到啦！`;
}
const SILLY = [
  (n) => `嗯，${n}看不懂呢~`,
  (n, h2) => `${h2}说的话好深奥，${n}要想一想……`,
  () => "诶？再说一遍嘛~",
  (n) => `${n}歪了歪头，不太明白呢~`,
  (_, h2) => `嘿嘿，${h2}说什么都对！`,
  (n) => `这个……${n}还小，听不懂啦~`,
  () => "唔……能换个简单点的说法吗？",
  (n) => `${n}偷偷记下来了，等长大了再回答你~`,
  (n, h2) => `${h2}是在考${n}吗？好难呀~`,
  () => "嗯嗯！（其实没听懂）",
  (n) => `${n}刚刚走神了，你说什么来着？`,
  (n, h2) => `听不懂，但是${n}最喜欢${h2}啦~`
];
const history = [];
const dialogue = [];
const events = [];
let facts = [];
let sinceMemo = 0;
let lastChatLine = "";
let saveTimer;
function persistHistory() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    window.qqpet.memHistory?.(history);
    window.qqpet.memDialogueSave?.({ dialogue, sinceMemo });
  }, 1e3);
}
const EXTRACT = "从下面的对话中提取关于主人以及你们共同经历的、值得长期记住的事实（喜好、习惯、约定、发生过的重要事）。每条一行，以「- 」开头；只记事实，不记寒暄客套；没有值得记的就只输出 NONE。对话：";
async function remember(turns, evs = []) {
  const lines = turns.map((m) => `${m.role === "user" ? "主人" : "我"}：${m.content}`);
  if (evs.length) lines.push(`（旁白）${evs.join("；")}`);
  const text = lines.join("\n");
  const out2 = await askClean("你是记忆整理器，只按格式输出，不要解释。", [{ role: "user", content: `${EXTRACT}
${text}` }]);
  if (!out2) return;
  const extracted = out2.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- "));
  if (!extracted.length) return;
  facts = [...facts, ...extracted];
  window.qqpet.memFacts?.(extracted);
}
const MEMORY_MAX = 50;
const KEEP_RECENT = 20;
async function compressMemory() {
  if (facts.length <= MEMORY_MAX) return;
  const old = facts.slice(0, facts.length - KEEP_RECENT);
  const recent = facts.slice(-KEEP_RECENT);
  const out2 = await askClean("你是记忆整理器。把下面这些关于主人的旧记忆合并成更少的条目：同类合并成一条、去掉过时/重复/琐碎的内容、只保留值得长期记住的核心事实。每条一行，以「- 」开头。只输出合并后的记忆，不要解释。", [{ role: "user", content: old.join("\n") }]);
  if (!out2) return;
  const merged = out2.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("- "));
  if (!merged.length) return;
  facts = [...merged, ...recent];
  window.qqpet.memRewrite?.(facts);
}
function initMemory() {
  void window.qqpet.memLoad?.().then(({ memory, history: old }) => {
    facts = memory;
    if (old.length) history.push(...old.slice(-12));
  });
  void window.qqpet.memDialogueLoad?.().then((state2) => {
    if (state2?.dialogue.length) dialogue.push(...state2.dialogue);
    sinceMemo = state2?.sinceMemo ?? 0;
  });
  onSaid((text) => {
    if (!save.settings.memory || !text || text === lastChatLine) return;
    history.push({ role: "assistant", content: `NONE ${text}` });
    persistHistory();
  });
  onEvent((text) => {
    if (!save.settings.memory || !text) return;
    history.push({ role: "system", content: `[事件] ${text}` });
    events.push(text);
    persistHistory();
  });
  onReply((text) => {
    if (!save.settings.memory || !text) return;
    noteUserSpoke();
    history.push({ role: "user", content: text });
    dialogue.push({ role: "user", content: text });
    persistHistory();
  });
}
function forgetMemory() {
  facts = [];
  window.qqpet.memClear?.();
}
async function talkToPet(content) {
  const said2 = { role: "user", content };
  noteUserSpoke();
  const canned = (save.settings.chatCheat ? cheat(content) : null) ?? (aiOn() ? null : SILLY[Math.floor(Math.random() * SILLY.length)](info.name, info.host));
  if (canned) {
    speak$1({ s: canned, now: true, ai: false }, "speak");
    return canned;
  }
  let reply2 = await ask([...history.slice(-12), said2], doPrompt(content));
  let { act, arg, say: say2 } = parse(reply2 ?? "");
  if (act === "SEARCH" && arg.name && save.settings.search) {
    const hits = await window.qqpet.webSearch(arg.name);
    if (hits.length) {
      const brief = hits.map((h2, i) => `${i + 1}. ${h2.title}：${h2.description}`).join("\n");
      const again = await ask([...history.slice(-12), said2], `主人让你联网查「${arg.name}」，下面是刚搜到的结果。用你自己的口吻、据实回答主人，不要编造结果里没有的内容，一两句话即可，不要用动作词：
${brief}`);
      if (again) {
        const p2 = parse(again);
        say2 = p2.say || again;
        act = "NONE";
      } else {
        say2 = "呜…我搜到了点东西，但一时说不上来~";
        act = "NONE";
      }
    } else {
      say2 = `呜…我试了联网搜「${arg.name}」，但没搜到，网络可能不太给力~`;
      act = "NONE";
    }
  }
  const line2 = reply2 ? say2 || "……" : "呜…我现在脑袋转不动，等会儿再聊吧~";
  lastChatLine = line2;
  if (reply2) {
    setInfo("mood", Math.min(info.mood + rand(200, 300), 1e3));
    const asst = { role: "assistant", content: act === "LETTER" ? `LETTER:${arg.name}:「${arg.text}」 ${line2}` : `${act} ${line2}` };
    history.push(said2, asst);
    dialogue.push(said2, asst);
    persistHistory();
    if (save.settings.memory) {
      if (++sinceMemo >= 5) {
        sinceMemo = 0;
        void remember(dialogue.slice(-12), events.splice(0)).then(() => void compressMemory());
      }
      if (dialogue.length > 48) {
        const old = dialogue.splice(0, 24);
        persistHistory();
        void remember(old);
      }
    }
  }
  note("刚和主人聊过天");
  if (reply2) doAct(act, line2, arg);
  return line2;
}
let close$1 = null;
function openChat(seed) {
  if (close$1) return;
  const log = div("chatLog f1");
  const show2 = (m) => {
    log.append(div(`chatLine ${m.role}`, m.content));
    log.scrollTop = log.scrollHeight;
  };
  history.forEach((m) => show2(m.role === "assistant" ? { ...m, content: parse(m.content).say } : m));
  const optionsRow = div("chatOptions f1");
const input = Object.assign(document.createElement("input"), { className: "chatInput f1", maxLength: 200, placeholder: `和${info.name}说点什么，回车发送` });
  async function send2() {
    const content = input.value.trim();
    if (!content || input.disabled) return;
    input.value = "";
    input.disabled = true;
    show2({ role: "user", content });
    show2({ role: "assistant", content: await talkToPet(content) });
    input.disabled = false;
    input.focus();
    void renderOptions(content);
  }
  async function renderOptions(last) {
    optionsRow.replaceChildren();
    if (!aiOn()) return;
    const opts = await askOptions(last);
    if (!opts) return;
    for (const o of opts) {
      const btn = document.createElement("button");
      btn.className = "chatOption f1";
      btn.style.cssText = "border:1px solid #c9a8e8;border-radius:14px;background:#3a2c52;color:#f2e6ff;padding:4px 10px;cursor:pointer;font-size:12px;margin-right:6px;";
      btn.textContent = o;
      btn.addEventListener("click", () => { input.value = o; void send2(); });
      optionsRow.append(btn);
    }
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) void send2();
  });
  close$1 = openBox(
    div(
      "ui-chat",
      div(
        "chatMain fC",
        div("chatTitle", `和${info.name}聊天`),
        log,
        optionsRow,
        div(
          "chatBar fc",
          input,
          button("chatSend fcc", () => void send2(), "发送")
        )
      )
    ),
    {
      onClose: () => {
        window.qqpet.setFocusable(false);
        close$1 = null;
      }
    }
  );
  window.qqpet.setFocusable(true);
  requestAnimationFrame(() => {
    log.scrollTop = log.scrollHeight;
  });
  const into = () => input.focus();
  window.addEventListener("focus", into, { once: true });
  setTimeout(into, 50);
  if (seed) {
    input.value = seed;
    setTimeout(() => void send2(), 80);
  }
}
const FACE = {
  MM: {
    Adult: {
      happy: {
        BE: {
          top: "78%",
          left: "50%",
          e: 5
        },
        H: {
          top: "45%",
          left: "50%",
          e: 3
        },
        LE: {
          left: "43%",
          top: "55%"
        },
        LF: {
          top: "85%",
          left: "35%",
          e: 3
        },
        LFA: {
          top: "61%",
          left: "36%"
        },
        LH: {
          top: "74%",
          left: "22%",
          e: 3
        },
        M: {
          top: "63%",
          left: "48%",
          e: 5
        },
        RF: {
          top: "85%",
          left: "59%",
          e: 2
        },
        RH: {
          top: "73%",
          left: "73%",
          e: 5
        },
        SC: {
          top: "72%",
          left: "40%",
          e: 2
        }
      },
      peaceful: {
        BE: {
          top: "78%",
          left: "50%",
          e: 6
        },
        H: {
          top: "45%",
          left: "50%",
          e: 8
        },
        LE: {
          left: "43%",
          top: "55%",
          e: 3
        },
        LF: {
          top: "85%",
          left: "35%",
          e: 5
        },
        LH: {
          top: "74%",
          left: "22%",
          e: 4
        },
        M: {
          top: "63%",
          left: "48%",
          e: 5
        },
        RE: {
          left: "54%",
          top: "55%",
          e: 4
        },
        RF: {
          top: "85%",
          left: "59%",
          e: 3
        },
        RH: {
          top: "73%",
          left: "73%",
          e: 3
        },
        SC: {
          top: "72%",
          left: "40%",
          e: 3
        }
      },
      upset: {
        BE: {
          top: "81%",
          left: "45%",
          e: 2
        },
        H: {
          top: "51%",
          left: "50%",
          e: 3
        },
        LF: {
          top: "82%",
          left: "32%",
          e: 3
        },
        M: {
          top: "72%",
          left: "48%",
          e: 6
        },
        RH: {
          top: "80%",
          left: "54%"
        }
      },
      sad: {
        E: {
          top: "77%",
          left: "42%",
          e: 2
        },
        H: {
          top: "63%",
          left: "43%",
          e: 4
        },
        LF: {
          top: "75%",
          left: "25%",
          e: 2
        },
        LH: {
          top: "84%",
          left: "31%"
        },
        M: {
          top: "85%",
          left: "43%",
          e: 9
        },
        RF: {
          top: "79%",
          left: "67%",
          e: 4
        }
      }
    },
    Kid: {
      H: {
        top: "46%",
        left: "47%",
        e: 1
      },
      LE: {
        left: "42%",
        top: "56.5%",
        e: 2
      },
      LF: {
        top: "85%",
        left: "30%",
        s: 2,
        e: 2
      },
      LFA: {
        top: "64%",
        left: "35%"
      },
      LH: {
        top: "74%",
        left: "23%",
        s: 2,
        e: 4
      },
      M: {
        top: "63%",
        left: "46%",
        e: 2
      },
      RE: {
        left: "51%",
        top: "56.5%",
        e: 2
      },
      RF: {
        top: "85%",
        left: "53%",
        s: 2,
        e: 2
      },
      RH: {
        top: "74%",
        left: "69%",
        s: 2,
        e: 4
      },
      S: {
        top: "72%",
        left: "54%",
        e: 2
      }
    },
    Egg: {
      E: {
        top: "54%",
        left: "46%",
        e: 3
      },
      F: {
        top: "84%",
        left: "46%",
        e: 5
      },
      H: {
        top: "41%",
        left: "46%",
        e: 4
      },
      M: {
        top: "65%",
        left: "46%",
        e: 2
      }
    }
  },
  GG: {
    Adult: {
      happy: {
        BE: {
          top: "78%",
          left: "50%",
          e: 7
        },
        H: {
          top: "45%",
          left: "50%",
          e: 3
        },
        LE: {
          left: "43%",
          top: "55%"
        },
        LF: {
          top: "85%",
          left: "35%",
          e: 3
        },
        LFA: {
          top: "61%",
          left: "36%"
        },
        LH: {
          top: "74%",
          left: "22%",
          e: 3
        },
        M: {
          top: "63%",
          left: "48%",
          e: 5
        },
        RF: {
          top: "85%",
          left: "59%",
          e: 2
        },
        RH: {
          top: "73%",
          left: "73%",
          e: 5
        }
      },
      peaceful: {
        BE: {
          top: "78%",
          left: "50%",
          e: 6
        },
        H: {
          top: "45%",
          left: "50%",
          e: 8
        },
        LE: {
          left: "43%",
          top: "55%",
          e: 3
        },
        LF: {
          top: "85%",
          left: "35%",
          e: 5
        },
        LH: {
          top: "74%",
          left: "22%",
          e: 4
        },
        M: {
          top: "63%",
          left: "48%",
          e: 5
        },
        RE: {
          left: "54%",
          top: "55%",
          e: 4
        },
        RF: {
          top: "85%",
          left: "59%",
          e: 3
        },
        RH: {
          top: "73%",
          left: "73%",
          e: 3
        },
        SC: {
          top: "72%",
          left: "40%",
          e: 3
        }
      },
      upset: {
        BE: {
          top: "81%",
          left: "45%",
          e: 2
        },
        H: {
          top: "51%",
          left: "50%",
          e: 3
        },
        LF: {
          top: "82%",
          left: "32%",
          e: 3
        },
        M: {
          top: "72%",
          left: "48%",
          e: 6
        },
        RH: {
          top: "80%",
          left: "54%"
        }
      },
      sad: {
        E: {
          top: "77%",
          left: "42%",
          e: 2
        },
        H: {
          top: "63%",
          left: "43%",
          e: 4
        },
        LF: {
          top: "75%",
          left: "25%",
          e: 2
        },
        LH: {
          top: "84%",
          left: "31%"
        },
        M: {
          top: "85%",
          left: "43%",
          e: 9
        },
        RF: {
          top: "79%",
          left: "67%",
          e: 4
        }
      }
    },
    Kid: {
      H: {
        top: "46%",
        left: "47%",
        e: 2
      },
      LE: {
        left: "42%",
        top: "56.5%",
        e: 2
      },
      LF: {
        top: "85%",
        left: "30%",
        s: 2,
        e: 2
      },
      LFA: {
        top: "64%",
        left: "35%"
      },
      LH: {
        top: "74%",
        left: "23%",
        s: 2,
        e: 4
      },
      M: {
        top: "63%",
        left: "46%",
        e: 2
      },
      RE: {
        left: "51%",
        top: "56.5%",
        e: 2
      },
      RF: {
        top: "85%",
        left: "53%",
        s: 2,
        e: 2
      },
      RH: {
        top: "74%",
        left: "69%",
        s: 2,
        e: 4
      },
      S: {
        top: "72%",
        left: "54%",
        e: 2
      }
    },
    Egg: {
      E: {
        top: "54%",
        left: "46%",
        e: 3
      },
      F: {
        top: "84%",
        left: "46%",
        e: 5
      },
      H: {
        top: "41%",
        left: "46%",
        e: 4
      },
      M: {
        top: "65%",
        left: "46%",
        e: 2
      }
    }
  }
};
const HOVER_MS = 300;
const layer = document.createElement("div");
layer.className = "face";
const petEl$2 = document.getElementById("pet");
petEl$2.appendChild(layer);
function poke(key, s2 = 1, e = s2) {
  layer.replaceChildren();
  addCount("Amusing");
  if (!save.gameSaveDatas.ddw) windowView({ title: "逗逗我~~", msg: "恭喜成功开启逗宠成就~~", goods: [{ url: "pet/achievement/ddw.svg", name: "逗宠成就" }] });
  update("gameSaveDatas", { ddw: save.gameSaveDatas.ddw + 1 });
  const v = rand(200, 300);
  void floatMood(v);
  setInfo("mood", Math.min(info.mood + v, 1e3));
  const dir2 = stage$1() === "Adult" ? `Adult/${mood()}` : stage$1();
  machine.play({ a: "faceActive", opt: { url: `pet/Action/${info.sex}/${dir2}/interact/${key}${rand(s2, e)}.swf`, opt: {} } });
}
function setFaceClick(v) {
  update("settings", { faceClick: v });
  document.body.classList.toggle("faceHint", v === 2);
}
document.body.classList.toggle("faceHint", save.settings.faceClick === 2);
function showFacePoints() {
  if (!save.settings.faceClick || machine.pose.a !== "normal") return;
  const st = stage$1();
  const points = st === "Adult" ? FACE[info.sex].Adult[mood()] : FACE[info.sex][st];
  layer.replaceChildren(
    ...Object.entries(points).map(([key, p]) => {
      const d = document.createElement("div");
      d.className = "point";
      d.style.left = p.left;
      d.style.top = p.top;
      d.addEventListener("click", () => poke(key, p.s, p.e ?? p.s));
      return d;
    })
  );
}
let timer = 0;
function clearFacePoints() {
  clearTimeout(timer);
  layer.replaceChildren();
}
if (!touch) petEl$2.addEventListener("pointerenter", () => {
  timer = window.setTimeout(showFacePoints, HOVER_MS);
});
for (const ev of touch ? ["pointerdown"] : ["pointerleave", "pointerdown"]) {
  petEl$2.addEventListener(ev, (e) => {
    if (layer.contains(e.target)) return;
    clearFacePoints();
  });
}
const DAY = 86400;
function newer(a, b) {
  const pa = a.split(/[+-]/)[0].split(".").map(Number);
  const pb = b.split(/[+-]/)[0].split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
  return false;
}
async function checkUpdate(manual) {
  let r;
  try {
    r = await window.qqpet.latestRelease();
  } catch {
    if (manual) windowView({ title: "检查更新", msg: "检查更新失败，请检查网络后重试~" });
    return;
  }
  update("settings", { updateCheckedAt: Math.floor(Date.now() / 1e3) });
  if (!newer(r.version, APP_VERSION)) {
    if (manual) windowView({ title: "检查更新", msg: `已经是最新版本 v${APP_VERSION}~` });
    return;
  }
  const shell = () => windowView({
    title: "发现新版本",
    msg: `新版本 v${r.version}（当前 v${APP_VERSION}），点击确认前往 GitHub 下载~`,
    ok: (close2) => {
      close2();
      window.qqpet.openUrl(r.url);
    }
  });
  const offer = await window.qqpet.packs?.find().catch(() => null);
  if (!offer || offer.version !== r.version) return shell();
  windowView({
    title: "发现内容更新",
    msg: `v${r.version} 带来了新的宠物素材，可以只下载 ${(offer.size / 1048576).toFixed(1)} MB 的内容包（v${offer.base} → v${offer.version}），不用重装程序。确认下载内容包，取消则查看完整新版本~`,
    ok: (close2) => {
      close2();
      void installOffer();
    },
    cancel: shell
  });
}
async function installOffer() {
  const packs = window.qqpet.packs;
  windowView({ title: "内容更新", msg: "正在下载内容包，请稍候~" });
  try {
    const v = await packs.download();
    packReady(v);
  } catch (e) {
    windowView({ title: "内容更新", msg: `内容包安装失败：${ipcError(e)}` });
  }
}
const ipcError = (e) => e.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
function packReady(version) {
  windowView({
    title: "内容更新",
    msg: `内容已更新到 v${version}，重启后生效，现在重启吗？`,
    ok: () => window.qqpet.packs.relaunch()
  });
}
function startAutoUpdate() {
  const due = () => {
    if (save.settings.autoUpdate && Date.now() / 1e3 - save.settings.updateCheckedAt >= DAY) void checkUpdate(false);
  };
  due();
  setInterval(due, 36e5);
}
function webhookUrl() {
  return `http://127.0.0.1:${save.settings.webhookPort}/hook?token=${save.settings.webhookToken}`;
}
function toggleWebhook() {
  const s2 = save.settings;
  if (s2.webhook) return update("settings", { webhook: false });
  update("settings", { webhook: true, webhookToken: s2.webhookToken || crypto.randomUUID().replace(/-/g, "") });
  window.setTimeout(() => {
    void window.qqpet.webhookState?.().then((r) => {
      if (r.error) windowView({ title: "Webhook", msg: `启动失败：${r.error}，请换一个端口。` });
    });
  }, 600);
}
function webhookOptions() {
  const s2 = save.settings;
  const copy = (text, done) => void navigator.clipboard.writeText(text).then(() => windowView({ title: "Webhook", msg: done }));
  const opts = [
    {
      type: "radio",
      label: "Webhook：接收外部消息（默认关）",
      title: "在本机 127.0.0.1 开一个 HTTP 接口，外部服务 POST 过来的消息会由宠物念出来，可带链接，点「打开链接」跳转。仅本机可访问，必须带 token；免打扰时不弹。",
      on: () => s2.webhook,
      run: toggleWebhook
    }
  ];
  if (!s2.webhook) return opts;
  return [
    ...opts,
    { type: "input", label: "Webhook 端口（1024-65535，改后立即生效）", value: () => String(s2.webhookPort), set: (v) => {
      const n = Math.trunc(Number(v));
      if (n >= 1024 && n <= 65535) update("settings", { webhookPort: n });
    } },
    { type: "button", label: "复制 Webhook 地址", title: webhookUrl(), run: () => copy(webhookUrl(), '地址已复制。POST JSON：{"text":"内容","title":"标题","url":"https://…","duration":30}，duration 为停留秒数（0=点击前一直显示）。') },
    { type: "button", label: "重置 Webhook token", title: "旧地址立即失效", run: () => {
      update("settings", { webhookToken: crypto.randomUUID().replace(/-/g, "") });
      windowView({ title: "Webhook", msg: "token 已重置，请重新复制地址。" });
    } }
  ];
}
function setOpacity(v) {
  const o = Math.round(Math.min(Math.max(v, 0.1), 1) * 10) / 10;
  update("settings", { opacity: o });
  document.body.style.setProperty("--opacity", String(o));
}
document.body.style.setProperty("--opacity", String(save.settings.opacity));
function setHd(on) {
  update("settings", { hd: on });
  document.body.classList.toggle("hd", on);
}
document.body.classList.toggle("hd", save.settings.hd);
function setZoom(v) {
  update("settings", { zoom: Math.round(Math.min(Math.max(v, 1), 2) * 10) / 10 });
}
function homing() {
  setInfo("lastX", 100);
  setInfo("lastY", innerHeight * 0.6);
  speak$1({ s: "[host],我在这里~", now: true }, "appear", { start: () => setHidden(false) });
}
function toggleAutoStart() {
  if (window.qqpet.capabilities?.autoStart === false) {
    windowView({ title: "开机自启", msg: window.qqpet.capabilities.autoStartReason || "此平台不支持开机自启，请从应用图标启动宠物。" });
    return;
  }
  const on = !save.settings.autoStart;
  window.qqpet.setAutoStart(on);
  update("settings", { autoStart: on });
  speak$1({ c: "startupSelf", s: on ? "startupSelfOn" : "startupSelfOff", now: true }, "appear");
}
function toggleWatch(kind, setting) {
  const capabilities = window.qqpet.capabilities;
  if (capabilities?.[kind] === false) {
    windowView({ title: setting === "clip" ? "剪贴板播报" : "前台应用观察", msg: capabilities[kind === "clipboardWatch" ? "clipboardWatchReason" : "frontWatchReason"] || "此宿主尚不提供该能力。" });
    return;
  }
  update("settings", { [setting]: !save.settings[setting] });
}
let taps = 0;
let tappedAt = 0;
function tapVersion() {
  const now2 = Date.now();
  taps = now2 - tappedAt < 1e3 ? taps + 1 : 1;
  tappedAt = now2;
  if (taps < 5) return;
  taps = 0;
  update("settings", { cheatTab: !s.cheatTab });
  speak$1({ s: s.cheatTab ? "[host]，作弊页已显示在设置里~" : "[host]，作弊页已隐藏~", now: true }, "appear");
}
async function exportSave() {
  try {
    if (await window.qqpet.exportSave()) speak$1({ s: "[host],存档导出成功啦~", now: true }, "speak");
  } catch (e) {
    windowView({ title: "导出存档", msg: `导出失败：${e.message}` });
  }
}
function importSave() {
  windowView({
    title: "导入存档",
    msg: "导入的存档会替换当前宠物（当前存档会备份为 save.json.bak），导入后自动重启，确定吗？",
    ok: (close2) => {
      close2();
      void window.qqpet.importSave().catch(() => windowView({ title: "导入存档", msg: "这不是有效的QQ宠物存档~" }));
    }
  });
}
async function importPack() {
  try {
    const v = await window.qqpet.packs.importPack();
    if (v) packReady(v);
  } catch (e) {
    windowView({ title: "导入内容包", msg: `无法导入：${ipcError(e)}` });
  }
}
function resetPacks() {
  void window.qqpet.packs.info().then(
    ({ content, shell, bundled }) => windowView({
      title: "恢复内置内容",
      // A lite installer has no content of its own (#28): removing the packs brings back its first-run download.
      msg: !bundled ? `精简版程序不带宠物内容。将删除已安装的 v${content} 内容包并重启，之后需要重新下载或导入内容包，确定吗？` : content === shell ? `当前就是程序自带的 v${shell} 内容~` : `将删除已安装的 v${content} 内容包，回到程序自带的 v${shell} 内容并重启，确定吗？`,
      ok: bundled && content === shell ? void 0 : () => void window.qqpet.packs.reset().then(() => window.qqpet.packs.relaunch())
    })
  );
}
function rebornAsOther() {
  windowView({
    title: "重生为另一个性别~",
    msg: "点击将会清空当前宠物数据，并重生为另一个性别的宠物，请慎重选择",
    ok: () => window.qqpet.resetPet(info.sex === "GG" ? "MM" : "GG")
  });
}
function grant(type) {
  const all = allGoods(type);
  const g = { ...all[rand(0, all.length - 1)], num: 10 };
  give([g], `[host]，我获得了${g.num}个${g.name}！`);
}
function setCity(v) {
  const city = v.trim();
  update("settings", { weatherCity: city });
  weatherNow().then(
    (t) => speak$1({ s: t, now: true }, "speak"),
    () => speak$1({ s: `[host]，查不到「${city || "当前位置"}」的天气，换个写法试试吧~`, now: true }, "speak")
  );
}
let models = [];
let draftModel = "";
let aiStatus = "";
let redraw = () => {
};
const reason = (e) => String(e instanceof Error ? e.message : e).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
async function loadModels() {
  aiStatus = "正在获取模型列表…";
  redraw();
  try {
    models = await window.qqpet.aiModels({ url: s.aiUrl, key: s.aiKey });
    aiStatus = models.length ? "选择一个模型，选中后会自动测试，通过才会启用" : "接口没有返回模型，请手动填写后点「测试并启用」";
  } catch (e) {
    models = [];
    aiStatus = `获取失败：${reason(e)}。请手动填写模型名称后点「测试并启用」`;
  }
  redraw();
}
async function testModel(name2) {
  const model = name2.trim();
  if (!model) {
    aiStatus = "请先填写模型名称";
    redraw();
    return;
  }
  draftModel = model;
  update("settings", { aiModel: "" });
  aiStatus = `正在测试 ${model}…`;
  redraw();
  try {
    const reply2 = await window.qqpet.aiChat({ url: s.aiUrl, key: s.aiKey, model }, [{ role: "user", content: "你好，用一句话打个招呼。" }]);
    update("settings", { aiModel: model });
    aiStatus = `测试通过，已启用。回复：${reply2.slice(0, 60)}`;
  } catch (e) {
    aiStatus = `测试失败：${reason(e)}`;
  }
  redraw();
}
const setAi = (patch2) => {
  if (!draftModel) draftModel = s.aiModel;
  update("settings", { ...patch2, aiModel: "" });
  models = [];
  aiStatus = "";
};
function closeAi() {
  draftModel = "";
  models = [];
  aiStatus = "";
  update("settings", { aiModel: "" });
}
const aiOptions = () => [
  { type: "input", label: "接口地址（OpenAI 兼容，以 /v1 结尾）", value: () => s.aiUrl, set: (v) => setAi({ aiUrl: v.trim() }) },
  { type: "input", label: "API Key（本地服务可不填）", value: () => s.aiKey, set: (v) => setAi({ aiKey: v.trim() }) },
  { type: "input", label: "模型名称（不支持列表的接口请直接填写）", value: () => draftModel, set: (v) => {
    draftModel = v.trim();
  } },
  { type: "button", label: "获取模型列表", run: () => void loadModels() },
  { type: "button", label: "测试并启用", run: () => void testModel(draftModel) },
  ...models.map((m) => ({ type: "radio", label: m, on: () => s.aiModel === m, run: () => void testModel(m) })),
  { type: "see", label: "状态", value: aiStatus || (s.aiModel ? `已启用：${s.aiModel}` : "未启用") },
  ...s.aiModel ? [{ type: "button", label: "关闭 AI", run: closeAi }] : [],
  // 联网搜索是 AI 能力的一部分，放 AI 设置里
  { type: "radio", label: '联网搜索（问它"查一下"时联网搜）', title: "聊天时它需要查证或实时信息，会先联网搜再据实回答；都搜不到就老实说没搜到。", on: () => s.search, run: () => update("settings", { search: !s.search }) },
  { type: "radio", label: "搜索后端：免 key（DuckDuckGo→Bing 兜底）", title: "不需要任何 key，开箱即用；但可能被限流、结果质量一般。", on: () => s.searchBackend === "auto", run: () => update("settings", { searchBackend: "auto" }) },
  { type: "radio", label: "搜索后端：Tavily", title: "正规搜索 API，质量高、稳定，需在下方填 API Key。", on: () => s.searchBackend === "tavily", run: () => update("settings", { searchBackend: "tavily" }) },
  { type: "radio", label: "搜索后端：Brave", title: "Brave 搜索 API，需在下方填 API Key。", on: () => s.searchBackend === "brave", run: () => update("settings", { searchBackend: "brave" }) },
  { type: "input", label: "搜索 API Key（免 key 模式留空）", value: () => s.searchKey, set: (v) => update("settings", { searchKey: v.trim() }) }
];
const FACE_TIP = "使用互动动作：鼠标放入宠物范围0.3s后（手机上点一下宠物），开启点位可进行点击~";
const s = save.settings;
const TABS = [
  {
    label: "全局设置",
    get options() {
      return [
        { type: "button", label: "重生~~~（注意数据丢失）", run: readopt },
        { type: "button", label: "重生为另一个性别~~~（注意数据丢失）", run: rebornAsOther },
        { type: "button", label: "宠物不见了？点我试试", run: homing },
        { type: "slider", label: "透明度", value: () => s.opacity, step: (d) => setOpacity(s.opacity + d) },
        // Only the desktop host zooms the page; touch hosts already fit the screen.
        ...pageZoom() === null ? [] : [{ type: "slider", label: "界面缩放（宠物和所有窗口一起放大）", value: () => s.zoom - 1, step: (d) => setZoom(s.zoom + d) }],
        ...windowDirectionAvailable() ? [
          { type: "radio", label: "窗口方向：跟随屏幕", title: "保持窗口朝向与屏幕一致，空间不足时缩小", on: () => s.windowDirection === "screen", run: () => update("settings", { windowDirection: "screen" }) },
          { type: "radio", label: "窗口方向：自动选择最大显示方向", title: "选择窗口能显示得更大的方向（默认）", on: () => s.windowDirection === "auto", run: () => update("settings", { windowDirection: "auto" }) }
        ] : [],
        { type: "radio", label: "开机自启", title: "仅 Windows、macOS 和 Android 有效", on: () => s.autoStart, run: toggleAutoStart },
        { type: "input", label: "天气城市（留空按网络位置自动定位）", value: () => s.weatherCity, set: setCity },
        {
          type: "radio",
          label: "是否开启互动动作(开启后会导致点击位置不可进行宠物移动~)",
          title: FACE_TIP,
          on: () => s.faceClick > 0,
          run: () => setFaceClick(s.faceClick ? 0 : 1)
        },
        { type: "radio", label: "是否开启互动动作指示器", title: FACE_TIP, on: () => s.faceClick === 2, run: () => setFaceClick(s.faceClick === 2 ? 1 : 2) },
        {
          type: "radio",
          label: "标准难度（元宝收入降为 40%，默认关=轻松）",
          title: "轻松：保持现有的元宝收入；标准：打工、小游戏、钓鱼、农场、邮件礼物等收入只有 40%（至少 1），物价不变。作弊获得的不受影响。",
          on: () => s.difficulty === "standard",
          run: () => update("settings", { difficulty: s.difficulty === "standard" ? "easy" : "standard" })
        },
        { type: "radio", label: "开启免打扰模式", on: () => s.quiet, run: () => update("settings", { quiet: !s.quiet }) },
        {
          type: "radio",
          label: "点宠物时显示动作栏",
          title: "关掉后点宠物不再弹出日常、交互、工具等按钮，不挡视野；功能仍可从右键/长按宠物或托盘（手机通知栏「菜单」）打开",
          on: () => s.petBar,
          run: () => update("settings", { petBar: !s.petBar })
        },
        { type: "radio", label: "随机走动（默认关，贴边不走）", title: "站立闲着时，走动、问候、动画三者随机抽。贴边探头不走。", on: () => s.roam, run: () => update("settings", { roam: !s.roam }) },
        {
          type: "radio",
          label: "局域网联机（默认关）",
          title: "同一局域网（含 Radmin 等虚拟局域网）内的好友宠物自动互相发现，上线下线互相播报；之后的串门传话也走这里。关闭后完全隐身，不收发任何消息。",
          on: () => s.lan,
          run: () => update("settings", { lan: !s.lan })
        },
        ...window.qqpet.onWebhook ? webhookOptions() : [],
        {
          type: "radio",
          label: "语音对话",
          title: "松开后本地识别（Paraformer 模型随包，全程离线），识别结果当作聊天内容走同一套对话。",
          on: () => s.voice,
          run: () => update("settings", { voice: !s.voice })
        },
        { type: "see", label: "说话键", value: `${hotkeyLabel(DEFAULT_HOTKEY)}后按住说话` },
        {
          type: "radio",
          label: "对话记忆（重启后仍记得你说过的话）",
          title: "记忆存在本地 memory.md 与 chat-history.json，可随时清除；关闭后既不学习也不使用记忆。",
          on: () => s.memory,
          run: () => update("settings", { memory: !s.memory })
        },
        {
          type: "radio",
          label: "台词润色（关 = 原版台词原汁原味）",
          title: "开启时闲置闲聊由 AI 发挥、日常台词经 AI 润色；关闭后全部念原版台词库。聊天对话不受影响。",
          on: () => s.polish,
          run: () => update("settings", { polish: !s.polish })
        },
        {
          type: "radio",
          label: "开启宠物音效（贴边探头、点脸逗它）",
          title: "关掉只是宠物不出声：贴边探头的「嘿嘿嘿」、点脸逗它的语音等。企鹅岛社区的背景音乐不受影响，游戏窗口自己的音效也不受影响。",
          on: () => s.sound,
          run: () => {
            update("settings", { sound: !s.sound });
            applyPetSound();
          }
        },
        {
          type: "slider",
          label: `社区音量：${Math.round(s.music * 100)}%（0静音）`,
          title: "调整企鹅岛社区的背景音乐和音效，立即生效并自动保存。",
          value: () => s.music,
          step: (d) => update("settings", { music: Math.round(Math.min(1, Math.max(0, s.music + d)) * 10) / 10 })
        },
        { type: "radio", label: "开启高清画质", title: "高清托盘图标与窗口边框，新打开的窗口生效；高清界面素材重启后生效", on: () => s.hd, run: () => setHd(!s.hd) }
      ];
    }
  },
  {
    label: "存档",
    options: [
      { type: "button", label: "导出存档", title: "把当前宠物保存成一个文件，可用于备份或换电脑", run: exportSave },
      { type: "button", label: "导入存档（支持原版 config.json）", title: "用存档文件替换当前宠物，导入后自动重启", run: importSave },
      {
        type: "button",
        label: "清除宠物的记忆",
        title: "清空 memory.md 里的长期记忆；对话历史一并清除",
        run: () => {
          forgetMemory();
          void window.qqpet.memHistory?.([]);
          speak$1({ s: "[host]，我把以前的事都忘掉啦~", now: true, ai: false }, "speak");
        }
      }
    ]
  },
  ...window.qqpet.packs ? [
    {
      label: "内容包",
      options: [
        { type: "button", label: "导入内容包…", title: "安装 .qqpetpack 内容包（新素材），不用重装程序；导入后重启生效", run: importPack },
        { type: "button", label: "恢复内置内容", title: "删除已导入或下载的内容包，回到程序自带的素材，重启后生效", run: resetPacks }
      ]
    }
  ] : [],
  {
    label: "工具",
    options: [
      { type: "radio", label: "实时监听播报剪切板", title: "复制文字后，宠物会把它念出来", on: () => s.clip, run: () => toggleWatch("clipboardWatch", "clip") },
      { type: "radio", label: "留意前台在用的软件（仅电脑，默认关）", title: "同一软件开太久，闲聊时可能会提起。不读窗口内容。", on: () => s.watchApp, run: () => toggleWatch("frontWatch", "watchApp") }
    ]
  },
  {
    label: "作弊",
    options: [
      {
        type: "button",
        label: "元宝 +1000",
        run: () => {
          addInfo("yb", 1e3);
          speak$1({ s: "[host]，我获得了1000元宝！", now: true }, "appear");
        }
      },
      { type: "button", label: "成长值 +5000", run: () => addInfo("growth", 5e3) },
      { type: "button", label: "随机获得 10 个食物", run: () => grant("food") },
      { type: "button", label: "随机获得 10 个清洁用品", run: () => grant("clean") },
      { type: "button", label: "随机获得 10 个药品", run: () => grant("medicine") },
      {
        type: "button",
        label: "复活吧，我的宠物！",
        run: () => info.health === 0 ? setInfo("health", 5) : speak$1({ s: "[host]，我还活得好好的呢~", now: true }, "speak")
      },
      {
        type: "radio",
        label: "聊天框金手指",
        title: "在聊天里输入「元宝+100000」「不要死」等口令生效；关闭时「不要死」一并失效",
        on: () => s.chatCheat,
        run: () => update("settings", { chatCheat: !s.chatCheat, undying: false })
      },
      {
        type: "button",
        label: "粉钻 30天",
        run: () => {
          openPinkDiamond(30);
          speak$1({ s: "[host]，粉钻开了30天！", now: true }, "appear");
        }
      },
      {
        type: "button",
        label: "粉钻 年费",
        run: () => {
          openPinkDiamond(365);
          speak$1({ s: "[host]，粉钻开了365天！", now: true }, "appear");
        }
      },
      {
        type: "button",
        label: "粉钻 清除",
        run: () => {
          clearPinkDiamond();
          speak$1({ s: "[host]，粉钻已清除~", now: true }, "appear");
        }
      }
    ]
  },
  {
    label: "AI",
    get options() {
      return aiOptions();
    }
  },
  {
    label: "关于",
    options: [
      { type: "see", label: "软件", value: `QQPet v${APP_VERSION}`, run: tapVersion },
      { type: "button", label: "检查更新", title: "有新版本时打开 GitHub 下载页", run: () => void checkUpdate(true) },
      { type: "radio", label: "每天自动检查更新", on: () => s.autoUpdate, run: () => update("settings", { autoUpdate: !s.autoUpdate }) },
      { type: "see", label: "简介", value: description },
      { type: "see", label: "作者", value: "Ankio" },
      { type: "see", label: "邮箱", value: "ankio@ankio.net" },
      { type: "see", label: "项目地址", value: "https://github.com/AnkioTomas/qqpet" },
      { type: "see", label: "声明", value: "QQ 宠物相关素材版权归腾讯所有，本项目仅供学习交流，请勿用于商业用途" }
    ]
  }
];
function option(o, redraw2) {
  const act = (f) => () => {
    f();
    redraw2();
  };
  let inner;
  if (o.type === "radio") {
    inner = div("childrenIn fcc radio", button(o.on() ? "choose focusPress active" : "choose focusPress", act(o.run)), div("label", o.label));
  } else if (o.type === "slider") {
    const knob = div("sl_center_z");
    knob.style.left = `${o.value() * 100}%`;
    const line2 = div(
      "sliderLine f1 w100 fcc mt8",
      button(
        "sl_down focusPress",
        act(() => o.step(-0.1))
      ),
      div("sl_center f1 por", div("sl_thumb_track", knob)),
      button(
        "sl_up focusPress",
        act(() => o.step(0.1))
      )
    );
    inner = div("childrenIn fccC slider", div("label f1 w100", o.label), line2);
  } else if (o.type === "button") {
    inner = div("childrenIn fcc", div("label f1 w100 por butsLabel fcc tc", `${o.label} `, div("butsButs f1 w100 fcc", button("butsButs_submit", o.run))));
  } else if (o.type === "input") {
    const input = typeable(Object.assign(document.createElement("input"), { className: "textInput", value: o.value() }));
    input.addEventListener(
      "change",
      act(() => o.set(input.value))
    );
    inner = div("childrenIn fC", div("label", o.label), input);
  } else {
    inner = div("childrenIn fC", div("", `${o.label}：`), div("seeValue", o.value));
    if (o.run) inner.addEventListener("click", act(o.run));
  }
  const row2 = div("childrens", inner);
  row2.title = o.title ?? "";
  return row2;
}
let close = () => {
};
function openSetup() {
  close();
  if (!draftModel) draftModel = s.aiModel;
  let tab = TABS[0].label;
  const left = div("leftScroll fcC");
  const title = div("right_title ml16");
  const list2 = div("children");
  const right = div("rightScroll fC", title, list2);
  const draw2 = () => {
    const tabs2 = TABS.filter((t) => t.label !== "作弊" || s.cheatTab);
    const current2 = tabs2.find((t) => t.label === tab) ?? tabs2[0];
    tab = current2.label;
    const pick2 = (label) => () => {
      tab = label;
      list2.scrollTop = 0;
      draw2();
    };
    left.replaceChildren(...tabs2.map((t) => button(t === current2 ? "lm_once focusPress fcc activeMenu" : "lm_once focusPress fcc", pick2(t.label), t.label)));
    title.textContent = current2.label;
    list2.replaceChildren(...current2.options.map((o) => option(o, draw2)));
  };
  draw2();
  redraw = draw2;
  let directionChoice = windowDirectionAvailable();
  const refreshDirection = () => {
    const next2 = windowDirectionAvailable();
    if (next2 === directionChoice) return;
    directionChoice = next2;
    if (tab !== TABS[0].label) return;
    const scroll = list2.scrollTop;
    draw2();
    list2.scrollTop = scroll;
  };
  addEventListener("resize", refreshDirection);
  const orientation = window.screen.orientation;
  orientation?.addEventListener("change", refreshDirection);
  const remove = openFrame(
    div(
      "ui-setup",
      div(
        "setUp",
        button("close focusPress", () => close()),
        left,
        right
      )
    ),
    "pet/sysSeting/ditu.png"
  );
  window.qqpet.setFocusable(true);
  close = () => {
    removeEventListener("resize", refreshDirection);
    orientation?.removeEventListener("change", refreshDirection);
    window.qqpet.setFocusable(false);
    remove();
    close = () => {
    };
  };
}
const BASE = "pet/petsoc/";
const TOWN = 3;
const UIN = 66666666;
const PLAZA = { x: 800, y: 620 };
const DEAD = { x: 1270, y: 1020 };
const SCENES = /* @__PURE__ */ new Set([3, 5, 7, 8, 13, 15, 16, 18, 20, 21, 22, 23, 26, 27, 29, 30, 31, 32]);
const ALIAS = { 24: 3, 25: 5 };
const SPAWN = {
  3: PLAZA,
  5: { x: 1255, y: 1475 }
};
const RES = {
  CommunityMainFlash: "world_1051.swf",
  NPCConfigure: "Data/NpcList_1065",
  NavigationConfigure: "Data/NavigationMap_1065",
  SceneConfigure: "Data/SceneConfig_1065",
  MusicConfigure: "Data/MusicConfig_3",
  LoadPanel: "Data/LoadPanel/LoadPanel101",
  ServerInfo: "ServerInfo4",
  WeatherSystem: "Data/WeatherSystem/WeatherSystem2",
  MapConfigure: "Data/MapCfg_1065",
  NpcRes: "Data/Npc26",
  TitleCfg: "title1064",
  TitleShow: "Data/title_903",
  PetStatus: "petstatusdesc2",
  StaticRes: "StaticRes1041",
  Animation: "Data/Animation_1042"
};
let playing = "";
const game = (swf) => () => {
  playing = swf;
  window.qqpet.openGame(`企鹅/${swf}.swf`);
};
const GONE = "img.pet.qq.com/swf/games/";
const SHENQI = /Wilderness\/(main_\w+|qq_shenqi_ui)\.swf|resource\.pet\.qq\.com\/QQPenguin\//;
const SHENQI_PORTALS = {
  main_shenqi_begin: 30,
  main_csm_tj: 31,
  main_sq_transfer_tj: 31,
  main_csm_kl: 32,
  main_sq_transfer_kl: 32
};
let jump = null;
const fetchNet = window.fetch;
window.fetch = (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
  const shenqi = SHENQI.exec(url);
  if (shenqi) {
    const to = SHENQI_PORTALS[shenqi[1] ?? ""];
    if (to) setTimeout(() => jump?.(to));
    return Promise.resolve(new Response(null, { status: 404 }));
  }
  if (!url.includes(GONE)) return fetchNet(input, init);
  setTimeout(() => visit(url));
  return Promise.resolve(new Response(null, { status: 404 }));
};
window.qqpet.onGamePlayed((minutes) => {
  const done = minutes >= 1 && played(playing);
  playing = "";
  if (done) say(done);
});
const PAGES = {
  "$W$[10012]": openPetInfo,
  happyfight: () => window.qqpet.openUrl("https://fight.qq.com/"),
  diaoyu: openFishing,
  qq_mstx: openMstx,
  dajimu: game("Q宠搭积木"),
  dg_tqd: game("QQ跆拳道"),
  qq_ddp: game("QQ端盘子"),
  qq_hhxx: game("QQ好好学习"),
  main_xmxd: game("冒险岛系列/1起航"),
  guanxingtai: game("满天星"),
  qcdzk: game("Q宠邀你来找茬"),
  "qq.com/td.html": game("Q宠守护使"),
  "qq.com/td2.html": game("Q宠守护使"),
  qq_tdsj: game("Q宠守护使"),
  sanmingzhi: game("QQ煎饼摊"),
  couxingxing: game("QQ宠物摘星星"),
  qq_qqpp: game("QQ宠物泡泡"),
  ...ISLAND
};
function visit(url) {
  const page = Object.entries(PAGES).find(([key]) => url.includes(key))?.[1];
  if (!page) return meet(url);
  page();
  return true;
}
const GUESTS = ["阿呆", "豆豆", "小胖", "球球", "咕咕", "泡泡"];
const LINES = [
  "今天天气真好~",
  "有人一起去钓鱼吗？",
  "听说密室里藏着宝贝！",
  "好饿呀，去找点吃的",
  "你好呀！",
  "这里风景真不错~",
  "谁来陪我玩小游戏？",
  "走累了，歇一会儿",
  "东郊荒地又有妖怪出没啦，好可怕！",
  "我刚从咖啡厅出来，翠花做的点心真好吃。",
  "谁知道图图在哪儿？我想要宝藏图碎片。",
  "风语广场今天人好多呀~"
];
const REPLIES = [
  "哈哈，说得对！",
  "真的吗？",
  "嗯嗯~",
  "你好呀，一起玩吧！",
  "我也这么觉得~",
  "嘿嘿~",
  "好呀好呀！",
  "算我一个！",
  "哇，好厉害！",
  "我也想去看看~",
  "下次叫上我呀！"
];
const IDLE = "随口说一句闲聊，可以接着刚才的话题，也可以说说岛上的事。只输出这句话。";
const pick$1 = (a) => a[Math.floor(Math.random() * a.length)];
const CONFIG = {
  GetResByIDName: (id) => RES[String(id)] ?? "",
  GetSceneConfigure: (id) => file(RES.SceneConfigure, id, "Config.xml"),
  GetNPCConfigure: (id) => file(RES.NPCConfigure, id, "NpcList.xml"),
  GetNavigationConfigure: (id) => file(RES.NavigationConfigure, id, "NavigationMap.xml"),
  GetMusicConfigure: (id) => file(RES.MusicConfigure, id, "MusicConfigV2.xml"),
  GetWorldMapConfigure: () => `${RES.MapConfigure}/WorldMapConfig.xml`,
  GetMapNavigateConfig: () => `${RES.MapConfigure}/Config.xml`,
  GetMiniMapConfigure: () => `${RES.MapConfigure}/MiniMapConfig.xml`
};
function file(root2, id, name2) {
  return id == null || id === "" ? root2 : `${root2}/${id}/${name2}`;
}
function spawn(scene) {
  return SPAWN[scene] ?? PLAZA;
}
function clamp(s2) {
  const scene = SCENES.has(s2.scene) ? s2.scene : TOWN;
  const d = spawn(scene);
  return {
    scene,
    x: s2.x > 0 ? s2.x : d.x,
    y: s2.y > 0 ? s2.y : d.y
  };
}
let nav = null;
const navs = {};
let pending = [];
let resFlush = 0;
let busy$1 = false;
function ok(n, i) {
  return i >= 0 && i < n.walk.length && n.walk[i] === 1;
}
function world(n, i) {
  return { x: (i % n.w + 0.5) / n.w * n.sw, y: (Math.floor(i / n.w) + 0.5) / n.h * n.sh };
}
function cell(n, x, y) {
  const cx = Math.max(0, Math.min(n.w - 1, Math.round(x / n.sw * n.w)));
  const cy = Math.max(0, Math.min(n.h - 1, Math.round(y / n.sh * n.h)));
  return cy * n.w + cx;
}
function snap(n, x, y) {
  const start2 = cell(n, x, y);
  if (ok(n, start2)) return world(n, start2);
  const sx = start2 % n.w;
  const sy = Math.floor(start2 / n.w);
  for (let r = 1; r < 80; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const x2 = sx + dx;
        const y2 = sy + dy;
        if (x2 < 0 || y2 < 0 || x2 >= n.w || y2 >= n.h) continue;
        const i = y2 * n.w + x2;
        if (ok(n, i)) return world(n, i);
      }
    }
  }
  return { x, y };
}
function findPath(x1, y1, x2, y2) {
  if (!nav) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  const n = nav;
  const from = snap(n, x1, y1);
  const to = snap(n, x2, y2);
  const a = cell(n, from.x, from.y);
  const b = cell(n, to.x, to.y);
  if (a === b) return [{ x: x1, y: y1 }, to];
  const prev = new Int32Array(n.walk.length).fill(-1);
  const q = [a];
  prev[a] = a;
  const step2 = [1, -1, n.w, -n.w, n.w + 1, n.w - 1, -n.w + 1, -n.w - 1];
  for (let qi = 0; qi < q.length && prev[b] < 0; qi++) {
    const cur = q[qi];
    const cx = cur % n.w;
    for (const s2 of step2) {
      const nxt = cur + s2;
      if (!ok(n, nxt) || prev[nxt] >= 0 || Math.abs(nxt % n.w - cx) > 1) continue;
      prev[nxt] = cur;
      q.push(nxt);
    }
  }
  if (prev[b] < 0) return [{ x: x1, y: y1 }];
  const raw = [];
  for (let i = b; i !== a; i = prev[i]) raw.push(i);
  raw.reverse();
  const pts = [{ x: x1, y: y1 }];
  for (let i = 5; i < raw.length - 1; i += 6) pts.push(world(n, raw[i]));
  pts.push(to);
  return pts;
}
async function loadNav(scene) {
  if (navs[scene]) {
    nav = navs[scene];
    return;
  }
  nav = null;
  const text = await (await fetch(`${BASE}${file(RES.SceneConfigure, scene, "Config.xml")}`)).text();
  const size2 = text.match(/<SceneModel[^>]*\sw="(\d+)"\s+h="(\d+)"/);
  const path = text.match(/<Navigator[\s\S]*?<Path value="([^"]+)"/);
  if (!size2 || !path) return;
  const img2 = new Image();
  img2.src = `${BASE}${path[1]}`;
  await img2.decode();
  const c = document.createElement("canvas");
  c.width = img2.naturalWidth;
  c.height = img2.naturalHeight;
  const g = c.getContext("2d");
  if (!g) return;
  g.drawImage(img2, 0, 0);
  const pix = g.getImageData(0, 0, c.width, c.height).data;
  const walk2 = new Uint8Array(c.width * c.height);
  for (let i = 0; i < walk2.length; i++) {
    const o = i * 4;
    walk2[i] = pix[o] > 200 && pix[o + 1] < 80 && pix[o + 3] > 0 ? 1 : 0;
  }
  nav = { w: c.width, h: c.height, sw: Number(size2[1]), sh: Number(size2[2]), walk: walk2 };
  navs[scene] = nav;
}
function loadSpot() {
  const raw = save.saveJsonData.community;
  if (!raw) return { scene: TOWN, ...PLAZA };
  const s2 = clamp(JSON.parse(raw));
  if (s2.scene === TOWN && Math.abs(s2.x - DEAD.x) < 80 && Math.abs(s2.y - DEAD.y) < 80) return { scene: TOWN, ...PLAZA };
  return s2;
}
function saveSpot(s2) {
  update("saveJsonData", { community: JSON.stringify(s2) });
}
function pet() {
  const level = save.petComputedlInfo.level;
  return {
    petid: "1",
    uin: UIN,
    qqname: info.host,
    mastername: info.host,
    petname: info.name,
    vip: info.pinkDiamond ? 1 : 0,
    viplevel: info.PDiamondLevel,
    vipyearflag: info.PDiamondYear ? 1 : 0,
    grade: level,
    nGrade: level,
    sex: info.sex === "GG" ? 0 : 1,
    x: spot.x,
    y: spot.y
  };
}
const row = (id, name2) => ({
  ID: id,
  id,
  Name: name2,
  name: name2,
  svrName: name2,
  Status: 1,
  status: 1,
  online: 1,
  busy: 0,
  AreaID: id
});
let regions = [];
let zones = [];
let areas = [];
async function loadCatalog() {
  if (regions.length) return;
  const text = await (await fetch(`${BASE}ServerInfo4/ServerInfo.ini`)).text();
  let cur = "";
  let obj = {};
  const flush = () => {
    if (cur.startsWith("ZONE_")) zones.push({ id: Number(cur.slice(5)), name: obj.name, region: obj.region });
    if (cur.startsWith("AREA_")) areas.push(row(Number(cur.slice(5)), obj.name));
  };
  for (const line2 of text.split(/\r?\n/)) {
    const t = line2.trim();
    if (!t || t.startsWith(";")) continue;
    if (t.startsWith("[")) {
      flush();
      cur = t.slice(1, -1);
      obj = {};
      continue;
    }
    const i = t.indexOf("=");
    if (i > 0) obj[t.slice(0, i)] = t.slice(i + 1);
  }
  flush();
  regions = [...new Set(zones.map((z) => z.region))].map((n, i) => row(i + 1, n));
}
function zoneRows(region) {
  const key = String(region ?? "");
  const hit = zones.filter((z) => !key || z.region === key || z.region.includes(key) || key.includes(z.region));
  return (hit.length ? hit : zones).map((z) => row(z.id, z.name));
}
async function portal(scene, from) {
  const text = await (await fetch(`${BASE}${file(RES.NPCConfigure, scene, "NpcList.xml")}`)).text();
  for (const [, attrs2, body] of text.matchAll(/<Npc\s([^>]*)>([\s\S]*?)<\/Npc>/g)) {
    const to = Number(body.match(/"enterScene">\s*<Param name="id">(\d+)</)?.[1]);
    if ((ALIAS[to] ?? to) !== from) continue;
    const x = attrs2.match(/\sx="(\d+)"/);
    const y = attrs2.match(/\sy="(\d+)"/);
    if (x && y) return { x: Number(x[1]), y: Number(y[1]) };
  }
  return null;
}
function trace(name2, args) {
  const row2 = [name2, ...args];
  calls.push(row2);
  if (calls.length > 200) calls.shift();
  console.debug("[petsoc]", ...row2);
}
const QUIET = /* @__PURE__ */ new Set(["GetRes"]);
function host(handlers) {
  return new Proxy(handlers, {
    get(t, key) {
      if (typeof key !== "string") return void 0;
      if (key in t) return (...args) => {
        if (!QUIET.has(key)) trace(key, args);
        return t[key](...args);
      };
      return (...args) => {
        trace(key, args);
        return 1;
      };
    }
  });
}
const calls = [];
let open$5 = false;
let spot = loadSpot();
let player = null;
let task = 0;
let placed = false;
async function flash(name2, ...args) {
  if (!player) return false;
  const el2 = player.el;
  const start2 = performance.now();
  while (typeof el2[name2] !== "function") {
    if (performance.now() - start2 > 1500) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  if (name2 !== "PSW.OnGetRes") trace(`→ ${name2}`, args);
  el2[name2].call(player.el, ...args);
  return true;
}
Object.assign(stage, {
  play: (n) => void flash("PetCommunity_PlayAnimation", "", n, spot.x, spot.y - 70),
  face: (n) => void flash("PSW.MainPetPlayEmotion", 0, n)
});
function kick() {
  if (busy$1 || !pending.length) return;
  busy$1 = true;
  resFlush = window.setTimeout(() => {
    resFlush = 0;
    const batch = pending;
    pending = [];
    if (player) {
      const fn = player.el["PSW.OnGetRes"];
      if (typeof fn === "function") {
        for (const [id, path] of batch) fn.call(player.el, id, 1, path);
      }
    }
    busy$1 = false;
    kick();
  }, 0);
}
let wander = 0;
let guests = [];
let thinking = false;
const said = [];
function hear$1(who, text) {
  said.push(`${who}：${text}`);
  if (said.length > 8) said.shift();
}
function speak(g, text) {
  hear$1(g.name, text);
  void flash("PSW.GPetSpeak", 0, g.id, text);
}
async function line(g, prompt, fallback) {
  const others = guests.filter((o) => o !== g).map((o) => o.name).join("、");
  const who = [
    `你是QQ宠物企鹅岛社区里的一只小企鹅，名叫「${g.name}」，正在岛上闲逛。岛上还有小企鹅${others}，以及玩家的企鹅「${info.name}」。`,
    "只写你说出口的那句话：用「我」自称，不写动作和旁白，不加名字前缀和引号，不用表情符号。"
  ].join("\n");
  const log = said.length ? `刚才岛上的聊天：
${said.join("\n")}
` : "";
  const text = await askAs(who, [{ role: "user", content: log + prompt }]);
  const quoted = text?.match(/说[：:]?\s*[“"「](.+?)[”"」]/)?.[1] ?? text;
  const clean2 = quoted?.replace(new RegExp("\\p{Extended_Pictographic}|\\uFE0F", "gu"), "").replace(new RegExp(`^${g.name}(说)?[：:]\\s*`), "").trim();
  return clean2 || pick$1(fallback);
}
async function reply(to) {
  const target = guests.find((g) => g.id === to);
  const shuffled = [...guests].sort(() => Math.random() - 0.5);
  for (const g of target ? [target] : shuffled.slice(0, 1 + Math.floor(Math.random() * 2))) {
    const text = await line(g, `回应${info.name}刚才说的话。只输出这句话。`, REPLIES);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1e3));
    speak(g, text);
  }
}
async function populate() {
  clearInterval(wander);
  guests = [];
  await flash("PSW.ClearAllGuestPlayer");
  const n = nav;
  if (!n) return;
  const somewhere = () => snap(n, Math.random() * n.sw, Math.random() * n.sh);
  guests = GUESTS.map((name2, i) => ({ id: `guest${i}`, name: name2, ...somewhere() }));
  for (const [i, g] of guests.entries()) {
    await flash("PSW.AddGPet", g.id, i % 2, 5 + Math.floor(Math.random() * 40), Math.round(g.x), Math.round(g.y), 0);
    await flash("PSW.NotifyUpdateGPetInfo", g.id, 0, g.name, 0, "", 0, 0);
  }
  wander = window.setInterval(() => {
    const g = pick$1(guests);
    if (Math.random() < 0.3) {
      if (thinking) return;
      thinking = true;
      return void line(g, IDLE, LINES).then((text) => speak(g, text)).finally(() => thinking = false);
    }
    const to = somewhere();
    const path = findPath(g.x, g.y, to.x, to.y);
    Object.assign(g, path[path.length - 1]);
    void flash("PSW.GPetWalk", g.id, path);
  }, 2e3);
}
async function enter(next2 = spot) {
  spot = clamp(next2);
  await loadNav(spot.scene);
  if (nav) spot = { ...spot, ...snap(nav, spot.x, spot.y) };
  saveSpot(spot);
  if (!placed) {
    await flash("PSW.ResetLoadingInfo");
    placed = true;
    const self = pet();
    await flash("PSW.MPetInit", String(self.petid), Number(self.sex), Number(self.grade), spot.x, spot.y);
    await flash("PSW.SetMPetData", String(self.petid), String(self.petname), Number(self.sex), Number(self.grade), Number(self.vip), "");
  }
  await flash("PSW.SetMPetPos", spot.x, spot.y);
  await flash("PSW.ChangeScene", spot.scene);
  await flash("PSW.SetFps", 30);
  await populate();
  const done = arrive(spot.scene);
  if (done) say(done);
}
const say = (text) => void flash("PSW.MPetSendChatMSG", 0, "", text);
function openCommunity() {
  if (open$5) return;
  open$5 = true;
  spot = loadSpot();
  task = 0;
  placed = false;
  pending = [];
  busy$1 = false;
  clearTimeout(resFlush);
  resFlush = 0;
  calls.length = 0;
  said.length = 0;
  const stage2 = div("community");
  player = new SwfPlayer(stage2);
  player.setVolume(save.settings.music);
  const stopSettings = onSettingsChange((change) => {
    if ("music" in change) player?.setVolume(save.settings.music);
  });
  window.qqpet.setFocusable(true);
  window.qqpet.setAlwaysOnTop(false);
  stage2.addEventListener("pointerdown", () => window.qqpet.setFocusable(true), true);
  const route2 = (_id, x1, y1, x2, y2) => findPath(Number(x1) || spot.x, Number(y1) || spot.y, Number(x2) || spot.x, Number(y2) || spot.y);
  const go = () => {
    void enter(loadSpot());
    return 1;
  };
  const goScene = (id) => {
    const scene = ALIAS[Number(id)] ?? Number(id);
    void (async () => {
      if (!SCENES.has(scene)) {
        await flash("PSW.RequestChangeSceneFailed", 1);
        return say(pick$1(SAYS.road));
      }
      if (scene === spot.scene) return enter();
      await enter({ scene, ...await portal(scene, spot.scene) ?? spawn(scene) });
    })();
    return 1;
  };
  jump = (scene) => void goScene(scene);
  window.PSW = host({
    FLASHINITCOMPLETE: () => {
      void loadCatalog().then(() => enter());
    },
    RandomLogin: go,
    PetSocLoginServer: go,
    PetLoginAreaServer: go,
    RequestLoginServer: go,
    RequestChangeScene: goScene,
    RequestJumpScene: goScene,
    OpenBigMap: () => {
      void flash("PSW.ShowWorldMap", 1);
      return 1;
    },
    PetFindPath: route2,
    PetFindNPCPath: route2,
    PetFindPathPerStep: route2,
    RequestNotifyWalkPath: (pts) => {
      const last2 = Array.isArray(pts) ? pts[pts.length - 1] : pts;
      if (last2 && typeof last2 === "object") {
        spot = { ...spot, x: Number(last2.x) || spot.x, y: Number(last2.y) || spot.y };
        saveSpot(spot);
      }
      return 1;
    },
    GetRes: (id) => {
      const path = (RES[String(id)] ?? String(id ?? "")).replace(/\\/g, "/");
      const n = ++task;
      pending.push([n, path]);
      kick();
      return n;
    },
    // The player controls all community audio; scaling inside Flash as well would square the volume.
    GetSoundVolume: () => 100,
    GetWindowBreState: () => 0,
    IsScenePrepare: () => 1,
    GetZoomServerList: (region) => {
      const list2 = zoneRows(region);
      void flash("PSW.PetSocNotifyUIUpdateZoomServerList", list2);
      return list2;
    },
    GetAreaServerList: () => {
      void flash("PSW.PetSocNotifyUIUpdateAreaServerList", areas);
      return areas;
    },
    GetRegionList: () => regions,
    PetSocGetDefaultInfo: () => ({
      region: regions[0]?.Name,
      zone: zones[0]?.id,
      area: areas[0]?.ID,
      zoneName: zones[0]?.name,
      areaName: areas[0]?.Name,
      svrName: zones[0]?.name,
      ID: zones[0]?.id,
      Name: zones[0]?.name,
      Status: 1
    }),
    RequestSendChatMsg: (type, to, text) => {
      hear$1(info.name, String(text));
      setTimeout(() => {
        void flash("PSW.MPetSendChatMSG", type, to, text);
        void reply(to);
        const done = chatted();
        if (done) setTimeout(() => say(done), 800);
      });
      return 1;
    },
    RequestAddChatPrivately: () => 1,
    RequestUpdateAvatar: () => 1,
    OpenSysConfig: () => {
      setTimeout(openSetup);
      return 1;
    },
    // The 物品 button: qqpet keeps its goods in the shop's left half.
    OpenItemBox: () => {
      setTimeout(openShop);
      return 1;
    },
    LoginHome: () => {
      setTimeout(() => say(pick$1(SAYS.home)));
      return 1;
    },
    OpenFriendList: () => {
      setTimeout(() => say(pick$1(SAYS.friends)));
      return 1;
    }
  });
  window.PET = host({
    GetPetInfor: pet,
    // Another pet's archive: only our guests exist, so the guest says hello instead.
    OpenArchiveWindow: (id) => {
      const g = guests.find((o) => o.id === id);
      if (g) setTimeout(() => void line(g, `${info.name}走过来看你，跟它打个招呼。只输出这句话。`, LINES).then((text) => speak(g, text)));
      return 1;
    },
    // Calling back into Flash before this call returns re-runs its click handler (and can hang Ruffle).
    ParseURL: (url) => {
      setTimeout(() => visit(String(url)) || say(pick$1(SAYS.closed)));
      return 1;
    },
    GetState: () => 1,
    GetPrivateProfileInt: () => 0,
    GetPrivateProfileString: () => "",
    WritePrivateProfileInt: () => 1,
    WritePrivateProfileString: () => 1
  });
  const w2 = window;
  for (const [name2, fn] of Object.entries(CONFIG)) {
    w2[`CommunityRes_${name2}`] = (...args) => {
      const out2 = fn(args[0]);
      trace(`CommunityRes_${name2}`, args);
      return out2;
    };
  }
  w2.Avatar_GetAvatarRes = (...args) => {
    trace("Avatar_GetAvatarRes", args);
    return "";
  };
  w2.__petsoc = calls;
  openBox(div("ui-community", stage2), {
    onClose: () => {
      stopSettings();
      clearInterval(wander);
      player?.destroy();
      player = null;
      pending = [];
      clearTimeout(resFlush);
      resFlush = 0;
      busy$1 = false;
      window.qqpet.setAlwaysOnTop(true);
      window.qqpet.setFocusable(false);
      jump = null;
      open$5 = false;
    }
  });
  void loadCatalog().then(
    () => player.load(`${BASE}world_1051.swf`, BASE, {
      wmode: "opaque",
      parameters: { uin: String(UIN), qqnumber: String(UIN), basePath: BASE },
      // The world map reads each area's scene id from this server file; the bundled copy carries them.
      urlRewriteRules: [
        [/^http:\/\/img\.pet\.qq\.com\/WorldMapHotInfo\.xml/, new URL(`${BASE}Data/WorldMap/WorldMapHotInfo.xml`, location.href).href],
        // The right-hand panel: island NPCs and places, and pages qqpet stands in for.
        [/^http:\/\/img\.pet\.qq\.com\/newnavigation\.xml/, new URL(`${BASE}Data/newnavigation.xml`, location.href).href],
        // Only main01/main02 survived; the other scene tracks fall back to them.
        [/(?:sea|snow|live)0([12])\.mp3$/, "main0$1.mp3"],
        [/sound3\.mp3$/, "main01.mp3"]
      ]
    })
  );
}
const GAMES = [
  {
    name: "企鹅",
    dir: "企鹅",
    games: [
      "QQ地下城与勇士之Q宠版",
      "QQ企鹅的挑战",
      "QQ好好学习",
      "QQ安全检查站",
      "QQ宠物挖矿",
      "QQ宠物捉鱼",
      "QQ宠物摘星星",
      "QQ宠物泡泡",
      "QQ抓喜鹊",
      "QQ煎饼摊",
      "QQ狩猎场",
      "QQ穿云",
      "QQ穿越火线1.2",
      "QQ端盘子",
      "QQ跆拳道",
      "QQ跑酷",
      "QQ飞车",
      "Q宠保姆",
      "Q宠搭积木",
      "Q宠爱森林",
      "Q宠速配",
      "企鹅玩具店",
      "好好学习",
      "高空清洁员",
      "宠爱QQ堂",
      "Q宠守护使",
      "Q宠邀你来找茬",
      "满天星"
    ]
  },
  {
    name: "尖耳朵",
    dir: "尖耳朵",
    games: [
      "洛克王国宠物献爱心",
      "洛克王国对对碰",
      "洛克王国快乐找茬",
      "洛克王国海底寻宝",
      "洛克王国猪猪蝠脱险",
      "洛克王国皇家舞会",
      "洛克王国连连看"
    ]
  },
  {
    name: "机器人",
    dir: "机器人",
    games: [
      "约瑟传说乔尼祖玛",
      "约瑟传说大王！我们来了",
      "约瑟传说奇妙的宝石",
      "约瑟传说智慧连珠",
      "约瑟传说汤尼站稳",
      "约瑟传说火箭小岩浮",
      "约瑟传说火箭赛尔",
      "约瑟传说爱上捉迷藏",
      "约瑟传说疯狂套牛",
      "约瑟传说绚丽的火花",
      "约瑟传说酒鬼胖胖",
      "约瑟传说飞檐走壁",
      "约瑟传说飞翔吧！丘布",
      "赛尔号连连看"
    ]
  },
  {
    name: "熊",
    dir: "熊",
    games: [
      "奥比元素组组看",
      "奥比冰块迷阵",
      "奥比减肥记",
      "奥比反击第一战",
      "奥比地下夺宝令",
      "奥比寿司快快吃",
      "奥比小鱼汤米的梦想",
      "奥比开心餐厅",
      "奥比恶魔契约",
      "奥比拯救小水妖",
      "奥比捕鱼",
      "奥比摘星",
      "奥比智慧之梦",
      "奥比木阳的故事",
      "奥比水果连连看",
      "奥比泡泡龙",
      "奥比睡梦枕头",
      "奥比神龙祖玛",
      "奥比精灵手牵手",
      "奥比花花奔月",
      "奥比锁妖塔",
      "奥比雪地滑冰",
      "奥比雪拼到底",
      "小奥比捕鱼"
    ]
  },
  {
    name: "鼹鼠",
    dir: "鼹鼠",
    games: [
      "小摩尔钓鱼",
      "拉姆包礼物",
      "摩尔diy生日蛋糕",
      "摩尔冰淇淋小屋",
      "摩尔力量之泉魔法门",
      "摩尔嘀嘀嘟嘟驾驶学习",
      "摩尔小农夫",
      "摩尔开心大厨",
      "摩尔抓萤火虫",
      "摩尔梦想建筑师",
      "摩尔滑冰",
      "摩尔猪猪快跑",
      "摩尔神秘湖双人寻宝",
      "摩尔英语大测试",
      "摩尔连连看",
      "摩尔金牌消防员",
      "摩尔阳光搬运工",
      "摩尔零花钱大作战",
      "摩尔餐厅服务员"
    ]
  },
  {
    name: "冒险岛系列",
    dir: "企鹅/冒险岛系列",
    games: [
      "1起航",
      "2爱情之爆发力",
      "2爱情之爆发力(速度减慢)",
      "3贼窝",
      "4密室",
      "5黑暗之眼",
      "6巨树",
      "7巨树之颠",
      "8宝藏"
    ]
  }
];
const SMALL_GAMES = [
  // Icons: the original TickleSystem quick bar (pet/quickBar/TickleSystem/*00.png).
  { dir: "guess", name: "猜动作", icon: "guess" },
  { dir: "paopao2", name: "吹泡泡", icon: "paopao" },
  { dir: "rope", name: "跳绳", icon: "tiaosheng" },
  { dir: "mouse", name: "捉老鼠", icon: "duolaoshu" },
  { dir: "ball", name: "颠球", icon: "tanliqiu" },
  // Only the kid builds exist: main_102 (GG) and main_103 (MM).
  { dir: "100ceng", name: "下一百层", kidOnly: true, icon: void 0 }
];
const MAIN = 140;
const REWARD = { mood: 55, yb: 1 };
const PASSIVE = /^(prompt_(money|mood|timer)|status_count|shadow|player_|rat\.)/;
const wins = /* @__PURE__ */ new Map();
const inCall = /* @__PURE__ */ new Set();
let root = null;
let dir = "";
let top = 50;
const place$1 = (w2) => {
  Object.assign(w2.box.style, { left: `${w2.x}px`, top: `${w2.y}px`, width: `${w2.w}px`, height: `${w2.h}px` });
};
const guard = (w2, f) => (...a) => {
  inCall.add(w2);
  try {
    return f(...a);
  } finally {
    inCall.delete(w2);
  }
};
function call(w2, fn, args) {
  if (!w2?.player || wins.get(w2.name) !== w2) return void 0;
  if (inCall.has(w2)) return void setTimeout(() => call(w2, fn, args));
  return w2.player.el.ruffle().callExternalInterface(fn, ...args);
}
function destroy(w2) {
  if (wins.get(w2.name) !== w2) return;
  for (const c of [...wins.values()]) if (c.parent === w2) destroy(c);
  wins.delete(w2.name);
  setTimeout(() => w2.box.remove());
  if (w2 === root) finish();
}
function finish() {
  root = null;
  dir = "";
  setDeskGame("");
  document.getElementById("pet").hidden = false;
  window.qqpet.setFocusable(false);
  addCount("GameRound");
  refreshTray();
}
function reward(w2) {
  const mood2 = Math.min(REWARD.mood, save.petComputedlInfo.moodMax - info.mood);
  setInfo("mood", info.mood + mood2);
  const yb = earnYb(REWARD.yb);
  call(w2, "TICKLE_OnResult", [mood2, yb]);
}
function api(self) {
  const of = (name2) => name2 ? wins.get(name2) : self;
  const move = (w2, x, y) => {
    w2.x = x;
    w2.y = y;
    place$1(w2);
    return 1;
  };
  const methods = {
    IsVisible: (n) => +!of(n).box.hidden,
    IsEnableDrag: (n) => +of(n).drag,
    EnableDrag: (on, n) => {
      of(n).drag = on === 1;
      return 1;
    },
    DestroyWindow: (n) => {
      destroy(of(n));
      return 1;
    },
    ResizeWindow: (w2, h2, n) => {
      Object.assign(of(n), { w: w2, h: h2 });
      place$1(of(n));
      return 1;
    },
    MoveTo: (x, y, n) => move(of(n), x, y),
    MoveBy: (dx, dy, n) => move(of(n), of(n).x + dx, of(n).y + dy),
    GetWindowRect: (n) => `${of(n).x},${of(n).y},${of(n).w},${of(n).h}`,
    GetWindowPosition: () => `${self.x},${self.y}`,
    GetScalable: () => 1,
    SetScalable: () => 1,
    CreateWindow: (name2, x, y, w2, h2, hidden, swf) => {
      const old = wins.get(name2);
      if (old) destroy(old);
      open$4(name2, self, swf, x, y, w2, h2).box.hidden = hidden === 1;
      return 1;
    },
    // 0 self, -1 parent, 1 children.
    GetWindowName: (opt) => opt === 0 ? self.name : opt === -1 ? self.parent?.name ?? "" : [...wins.values()].filter((c) => c.parent === self).map((c) => c.name),
    SetWindow: (op, n) => {
      if (op === "topmost") of(n).box.style.zIndex = String(++top);
    },
    Show: (cmd, n) => {
      of(n).box.hidden = cmd === 0;
      return 1;
    },
    GetCursorPosition: () => window.API.GetCursorPosition(),
    // Ruffle's Capabilities.screenResolution is the player's own size; the patched SWFs ask these instead.
    GetScreenWidth: () => innerWidth,
    GetScreenHeight: () => innerHeight,
    RemoteCall: (n, fn, ...args) => call(wins.get(n), fn, args)
  };
  for (const [k, f] of Object.entries(methods)) methods[k] = guard(self, f);
  return methods;
}
function draggable(w2, doc) {
  doc.addEventListener(
    "pointerdown",
    (e) => {
      if (!w2.drag || e.button !== 0) return;
      let sx = e.screenX;
      let sy = e.screenY;
      const move = (m) => {
        w2.x += m.screenX - sx;
        w2.y += m.screenY - sy;
        sx = m.screenX;
        sy = m.screenY;
        place$1(w2);
        call(w2, "APIEvent.OnWindowMove", [w2.x, w2.y, w2.w, w2.h]);
      };
      doc.addEventListener("pointermove", move, true);
      doc.addEventListener("pointerup", () => doc.removeEventListener("pointermove", move, true), { once: true, capture: true });
    },
    true
  );
}
function open$4(name2, parent, swf, x, y, w2, h2) {
  const frame2 = document.createElement("iframe");
  frame2.src = "swf.html";
  const box2 = div("smallGameWin", frame2);
  box2.dataset.hit = "";
  box2.classList.toggle("passive", PASSIVE.test(swf));
  const win = { name: name2, parent, box: box2, x, y, w: w2, h: h2, drag: false };
  wins.set(name2, win);
  place$1(win);
  document.body.append(box2);
  frame2.addEventListener(
    "load",
    () => {
      Object.assign(frame2.contentWindow, {
        API: api(win),
        TICKLE_GetFeeling: guard(win, () => ({ feelNow: info.mood, feelTotal: save.petComputedlInfo.moodMax })),
        TICKLE_SendAction: guard(win, () => reward(win))
      });
      draggable(win, frame2.contentDocument);
      win.player = new SwfPlayer(frame2.contentDocument.body);
      win.player.el.ruffle().addFSCommandHandler((cmd) => {
        if (cmd === "quit" && root) destroy(root);
      });
      void win.player.load(`pet/smallGame/${dir}/${swf}`, `pet/smallGame/${dir}/`);
    },
    { once: true }
  );
  return win;
}
function playSmallGame(g) {
  if (root || playingDesk()) return;
  const st = stage$1();
  if (st === "Egg") return speak$1({ s: "[host]，我还是个蛋呢，等破壳了再陪你玩~", now: true }, "speak");
  if (busy$2()) return speak$1({ s: "[host]，我正忙着呢，忙完再陪你玩~", now: true }, "speak");
  dir = g.dir;
  setDeskGame(g.dir);
  const pet2 = document.getElementById("pet");
  const r = pet2.getBoundingClientRect();
  pet2.hidden = true;
  setTray("game");
  window.qqpet.setFocusable(true);
  const variant2 = `1${g.kidOnly || st !== "Adult" ? 0 : 2}${info.sex === "GG" ? 2 : 3}`;
  root = open$4("main", null, `main_${variant2}.swf`, Math.round(r.left + (r.width - MAIN) / 2), Math.round(r.bottom - MAIN), MAIN, MAIN);
  root.box.append(button("quit", () => destroy(root)));
}
let open$3 = false;
const DAY_MINUTES = 60;
window.qqpet.onGamePlayed((minutes) => {
  if (minutes < 1) return;
  addCount("GameRound");
  const m = Math.min(Math.floor(minutes), DAY_MINUTES - count("Game"));
  if (m <= 0) return speak$1({ s: "[host]，今天小游戏玩得够多啦，休息一下眼睛吧~", now: true }, "speak");
  addCount("Game", m);
  const got = earnYb(5 * m);
  addInfo("growth", +(growthPerMinute() * m).toFixed(8));
  setInfo("mood", Math.min(info.mood + 2 * m, save.petComputedlInfo.moodMax));
  void floatMood(2 * m);
  speak$1({ s: `[host]，陪我玩了${m}分钟小游戏，好开心！获得${got}元宝~`, now: true }, "speak");
});
function openGames() {
  if (open$3) return;
  open$3 = true;
  const cats = [
    {
      name: "陪我玩",
      games: [
        ...SMALL_GAMES.map((g) => ({
          name: g.name,
          icon: g.icon && `pet/quickBar/TickleSystem/${g.icon}00.png`,
          run: () => {
            close2();
            open$3 = false;
            playSmallGame(g);
          }
        })),
        {
          name: "丢丢乐",
          icon: void 0,
          run: () => {
            close2();
            open$3 = false;
            playDiudiule();
          }
        }
      ]
    },
    ...GAMES.map((c) => ({ name: c.name, games: c.games.map((g) => ({ name: g, icon: void 0, run: () => window.qqpet.openGame(`${c.dir}/${g}.swf`) })) }))
  ];
  const tabs2 = div("gameTabs", ...cats.map((c, i) => button("gameTab", () => show2(i), c.name)));
  const list2 = div("gameList");
  function show2(i) {
    tabs2.querySelectorAll(".gameTab").forEach((t, j) => t.classList.toggle("active", i === j));
    list2.replaceChildren(...cats[i].games.map((g) => Object.assign(button("gameItem", g.run, ...g.icon ? [img("gameItemIcon", g.icon)] : [], g.name), { title: g.name })));
  }
  show2(0);
  const close2 = openBox(div("ui-games", tabs2, list2), { onClose: () => open$3 = false });
}
const TYPES = [
  { label: "食物", type: "food" },
  { label: "日用品", type: "clean" },
  { label: "玩具", type: "toy" },
  { label: "药品", type: "medicine" },
  { label: "背景", type: "background" },
  { label: "属性", type: "nums" }
];
const TIERS = ["史诗", "传承", "稀有"];
const WEEK = ["一", "二", "三", "四", "五", "六", "日"];
const DIGIT_H = 50;
let open$2 = false;
function illustrated(type, shown2, redraw2) {
  const byId = new Map(allGoods(type).map((g) => [g.id, g]));
  return POOLS.map((pool, i) => {
    const goods = pool.flatMap((code) => byId.get(code.slice(1)) ?? []);
    const seen = goods.filter((g) => save.illustrated.includes(g.id));
    const unseen = goods.filter((g) => !save.illustrated.includes(g.id));
    const card = (cls, title, url) => Object.assign(div(cls, img("", url)), { title });
    return div(
      "il_g_types",
      div(
        "tl_g_ctitle yqd fc",
        `${TIERS[i]}: (${seen.length} / ${goods.length}) `,
        button(
          "open ml16",
          () => {
            shown2[i] = !shown2[i];
            redraw2();
          },
          shown2[i] ? "收起" : "展开"
        )
      ),
      div(
        shown2[i] ? "il_g_c_good w100 fcw" : "il_g_c_good w100 fcw closeOpen",
        ...seen.map((g) => card("p4 il_g_card", `${g.name}：${describe(g).join("；") || "暂无介绍"}`, g.url)),
        ...unseen.map((g) => card("p4 il_g_cardnot", `${g.name}：${g.desc || "暂无介绍"}`, g.url))
      )
    );
  });
}
function calendar() {
  const today2 = dayStart();
  const d = new Date(today2 * 1e3);
  const [y, m] = [d.getFullYear(), d.getMonth()];
  const signed = monthSigns(y, m + 1);
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days2 = new Date(y, m + 1, 0).getDate();
  const cells = Array.from({ length: lead }, () => div("days hidden"));
  for (let k = 1; k <= days2; k++) {
    const t = new Date(y, m, k, 6).getTime() / 1e3;
    const cls = ["days", t < today2 && "pass", signed.includes(t) && "haveGet", t === today2 && "nowDay"].filter(Boolean).join(" ");
    cells.push(div(cls, div("dayNumber", String(k))));
  }
  return div("calendar", div("weekdays fcc", ...WEEK.map((w2) => div("week f1", w2))), div("daysBox fcw", ...cells));
}
function digit() {
  const nums2 = div("nums", ...Array.from({ length: 10 }, (_, n) => div("num fcc", String(n))));
  const el2 = div("activeNum", nums2);
  for (const d of [el2, ...nums2.children]) d.style.height = `${DIGIT_H}px`;
  return { el: el2, set: (n) => nums2.style.top = `-${DIGIT_H * n}px` };
}
function openSignIn() {
  if (open$2) return;
  open$2 = true;
  const root2 = div("ui-signin");
  let type = "food";
  const shown2 = [true, true, true];
  const tiers = div("il_g_content w100");
  const tabbar = div("il_tabbar fc mt8");
  const drawLeft = () => {
    tabbar.replaceChildren(
      ...TYPES.map(
        (t) => button(
          t.type === type ? "il_tt wsnw active" : "il_tt wsnw",
          () => {
            type = t.type;
            drawLeft();
          },
          t.label
        )
      ),
      " （鼠标放入或长按查看详情！~） "
    );
    tiers.replaceChildren(...illustrated(type, shown2, drawLeft));
  };
  drawLeft();
  const left = div("s_left f1 h100", div("sl_main fcc w100 h100", div("illustrated w100 h100", div("il_title", "图鉴"), tabbar, tiers)));
  const calendarBox = div("calendarBox");
  const signCount = div("yqd");
  const signBtn = button(
    "jrqd but_normal fcc mt8",
    () => {
      if (signedToday()) return;
      showResult(root2, signToday());
      refresh();
    },
    " 今日签到 "
  );
  const signView = div(
    "s_right h100 fC",
    calendarBox,
    div(
      "toCollect f1 fcC",
      signCount,
      div("yqdTip", "签到有几率获得绝版物品哦~", document.createElement("br"), "快来试试吧！~"),
      signBtn,
      button("zxlb but_normal fcc mt16", () => view(1), " 在线礼包 ")
    )
  );
  const digits2 = [digit(), digit(), digit()];
  let lastDraw = signin.getGrowth?.[1] ?? signin.getGrowth?.[0] ?? [0, 0, 0];
  let drawing = false;
  const drawBtn = button(
    "but_normal fcc mt8",
    () => {
      if (drawing || !canDrawGrowth()) return;
      drawing = true;
      const r = drawGrowth();
      lastDraw = r.digits;
      refresh();
      setTimeout(() => {
        drawing = false;
        refresh();
        showResult(root2, r.goods, "你咋运气这么差呢！~再让你试一次吧~~");
      }, 600);
    },
    " 抽成长值 "
  );
  const online = div("mt8");
  const giftCount = div("");
  const giftBtn = button("mt8 but_normal fcc", () => {
    if (signin.isOnlineLastTime > 0) return;
    const take = () => {
      showResult(root2, takeOnlineGift());
      refresh();
    };
    const cost = giftCost();
    if (!cost) return take();
    const pd = info.pinkDiamond;
    windowView({
      title: "在线礼包",
      msg: `${pd ? "尊贵的粉钻用户，" : "尊敬的宠主，"}确定花费${cost}${pd ? "元宝领取双份在线礼物么？" : "元宝领取在线礼物么？"}`,
      ok: (close2) => {
        if (!pay(cost)) return;
        close2();
        take();
      }
    });
  });
  const giftView = div(
    "s_right h100 fcC",
    div("s_toQD fcc w100", Object.assign(img("s_toQDImg", "pet/signIn/qd.png"), { onclick: () => view(0) })),
    div(
      "s_getGrowth mt16 fcC",
      div("sgt_top"),
      div("growths fcc mt8", ...digits2.map((d, i) => div(`gNum g${i} fcc`, d.el))),
      drawBtn,
      div("sgt_tip fcC", div("", "免费抽取宠物成长值"), div("", "每日限一次"), div("", "（粉钻可额外抽取一次）"))
    ),
    div(
      "s_onLine mt16 w100 fcC",
      img("s_gift", "pet/signIn/gift.svg"),
      online,
      giftBtn,
      div("sgt_tip fcC", div("", "抽奖每10次必出高级物品"), giftCount, div("", "（粉钻可领取双倍奖励）"))
    )
  );
  function refresh() {
    calendarBox.replaceChildren(div("cd_title", "本月签到"), calendar());
    const today2 = new Date(dayStart() * 1e3);
    signCount.textContent = `本月已累计签到 ${monthSigns(today2.getFullYear(), today2.getMonth() + 1).length} 次`;
    signBtn.classList.toggle("disable", signedToday());
    digits2.forEach((d, i) => d.set(lastDraw[i]));
    drawBtn.classList.toggle("disable", !canDrawGrowth());
    online.textContent = `已在线 ${info.onlineDataTime | 0} 分钟`;
    giftBtn.textContent = signin.isOnlineLastTime ? `剩余${signin.isOnlineLastTime | 0}分钟` : "点击领取";
    giftBtn.classList.toggle("disable", signin.isOnlineLastTime > 0);
    giftCount.textContent = `当前已抽取（${signin.onlineGiftNum}）次`;
  }
  function view(n) {
    signView.style.display = n ? "none" : "";
    giftView.style.display = n ? "" : "none";
  }
  refresh();
  view(0);
  const timer2 = window.setInterval(refresh, 1e3);
  setTimeout(() => {
    const goods = birthdayGift();
    if (goods.length) showResult(root2, goods);
  }, 500);
  root2.append(div("SignIn fc", left, signView, giftView));
  openBox(root2, {
    onClose: () => {
      clearInterval(timer2);
      open$2 = false;
    }
  });
}
const w = 560;
const h = 557;
const provinces = /* @__PURE__ */ JSON.parse('[{"name":"北京市","d":"M398.5 144L399 144.5L399.5 144L400 143.5L399 143L398 143L396.5 143L395.5 143L395 142.5L394 141L393.5 140.5L393 140L392.5 139L392 139.5L391 139.5L390.5 140L390 140.5L389.5 140L390.5 141.5L389.5 142L388.5 142L388 142.5L387.5 143L386.5 144L385.5 143.5L385 144L384.5 144.5L384 145L384.5 145.5L385 146.5L386 147.5L385.5 148L385 148.5L384.5 149L382.5 149L382 149.5L381.5 150L381 150.5L381.5 151.5L382 152L382.5 152.5L382 153L381.5 153.5L382 154L381.5 154.5L382 155L383 155L383.5 155.5L384 156L385 156L385.5 155L386 155.5L386.5 155L387.5 155.5L388 155L388.5 155.5L389 156L389.5 156.5L390.5 156.5L390 156L390.5 155.5L391 155L392 154.5L392.5 155L393.5 155L394 154L394.5 153.5L395 153L394.5 152L393.5 151.5L393.5 150L394.5 150L395.5 150L396.5 149.5L397 150L397.5 149.5L398.5 149L399 148.5L398.5 148L398 147.5L397.5 146.5L398 145.5L397.5 145L398 144.5L398.5 144Z","x":390,"y":148.5},{"name":"天津市","d":"M402.5 157L403.5 157L404 156L403.5 155.5L403 155L402.5 155.5L402 156L402 155L401.5 155.5L401.5 154.5L401 154L400.5 153.5L400.5 152L400 151.5L400.5 151L401 150.5L401.5 151L402 150.5L402.5 151L402 150.5L402.5 150L402 149.5L401.5 149L400.5 148.5L400 148L399.5 147.5L399 148L398.5 149L398 149.5L397 150L397.5 150.5L397 151L397 152L398 152.5L397 152.5L397.5 153L397 153.5L397 154.5L395.5 154.5L395 154L394 154L394 155L393.5 155.5L394 156L393.5 156.5L394 157L394 158L394.5 157.5L394.5 158.5L394 159L394.5 160L394.5 161L393.5 161L393 161.5L393 162.5L393 163.5L393 164.5L394 164.5L394.5 165L396 165L396 166L397 166L397.5 165.5L398 166L397.5 166.5L399 166.5L399.5 166L400.5 166L401.5 166L402 165L401.5 164L402.5 163.5L403 163L403.5 162.5L403 161L403.5 160.5L404 159.5L405 159L404.5 158.5L404 158L403 158L402.5 157.5L401.5 157.5L401 158L400 157.5L400.5 157L401.5 157L402.5 157ZM403 157.5L402.5 157L403 157.5Z","x":398.5,"y":158.5},{"name":"河北省","d":"M399.5 143.5L399 144L398 144.5L397.5 145L398 145.5L397.5 146L398 147L398.5 147.5L399 148L399.5 147.5L400 148L400.5 148.5L401 149L401.5 149.5L402.5 149.5L402 150.5L402.5 151L402 150.5L401.5 151L401 150.5L400.5 151L400 151.5L400.5 152L400.5 153L401 153.5L401.5 154L401.5 155L402 156L402.5 155.5L403 155L404 155.5L403.5 156.5L403 157L403 158L404 158L404.5 158.5L405 159L405.5 159.5L406 160L406.5 160.5L406.5 161.5L407.5 161.5L408 162L409 162.5L410 162L409.5 160.5L410 160L411.5 160L412.5 160L413 159.5L412.5 160L413 160.5L413.5 160L414 159.5L414.5 159L415 158.5L415.5 158L416 157.5L416.5 157L416 156L417 153.5L418 152.5L418.5 152L419 151.5L420 151.5L420.5 151L421.5 151L421.5 150L420.5 149.5L420.5 148L420 148.5L419.5 148L419 147L419 145.5L418.5 145L419 144.5L418 144.5L416.5 144.5L415.5 144L415 143.5L415.5 143L414.5 143L413.5 142.5L413 142L412.5 141.5L413 140L414 139.5L413 139L413.5 138.5L414.5 138.5L415 138L415.5 137L416 136.5L415.5 136L414.5 136L413.5 136L412.5 136L412 135.5L411.5 136L410.5 135.5L409.5 135.5L408.5 136L407.5 135.5L408 135L407.5 134.5L407 134L407.5 133.5L406.5 133L406.5 132L406 131.5L406 130.5L407 131L407.5 130L407 129L407.5 128.5L406.5 128L407.5 127.5L406.5 127.5L405.5 128L406 127.5L405.5 127L405 126L404.5 125.5L405 125L404.5 124.5L405 124L404.5 123.5L403.5 122.5L402.5 122L403 121.5L402 122L401 121.5L400.5 122L400 121.5L399.5 122L399 122.5L398.5 123L397 123L396 123L395.5 123.5L395 124L394.5 124.5L394.5 126L393.5 126L394 126.5L394.5 127.5L393.5 128.5L393 129L392 129L391 128.5L390.5 129L390 128.5L389 128.5L388.5 129L388 130L387.5 130.5L386.5 131L386.5 130L386 129.5L385.5 129L384.5 129.5L384 130L383 130L382.5 130.5L382 131L381 131.5L380 132L380.5 132.5L380 133L379.5 132.5L379 133L378 132.5L376 133L376.5 132.5L376.5 131.5L376 130.5L376.5 130L376.5 129L376.5 128L376 127.5L375.5 127L374.5 127L373.5 127L373 127.5L372.5 128L373 128.5L372.5 129L371.5 129L371 130L370 130.5L370.5 131.5L370 132L370.5 132.5L370 133L370.5 133.5L369 133.5L368 134L367.5 134.5L367 135L367.5 136L368 136.5L368.5 137L368 137.5L367 138L366.5 138.5L368 139.5L368.5 140.5L369 141L368.5 141.5L369 142L369.5 142.5L370 143L370.5 144L371 144.5L370.5 145.5L371 146L371.5 146.5L372.5 146.5L373 147L372.5 147.5L372 148L371 148L370.5 148.5L369.5 148.5L369 149.5L368.5 150L368 149.5L367.5 150.5L368.5 150.5L368.5 151.5L370 151.5L371 152L372 152L371.5 152.5L372 153L372 154.5L372.5 155L373 155.5L373 156.5L372.5 157L372.5 158L372 159L371.5 159.5L371.5 160.5L370.5 161L369.5 161L369 160.5L368.5 160L368 160.5L367.5 161L366.5 162L366 163L367 163.5L366.5 164L366 165L365.5 165.5L364.5 165.5L364 166.5L364 167.5L364 168.5L364 169.5L364.5 170L365.5 170.5L366.5 171L367 172L367 173L367.5 173.5L368 174L368 175L368.5 175.5L368 176L369 176L369.5 176.5L369.5 177.5L368.5 178.5L368 179.5L367.5 180.5L367 181L366.5 182L366 182.5L366.5 183L366 183.5L366.5 184L366 184.5L366.5 185L366 185.5L365.5 185L365.5 186L364.5 186.5L364 187L363.5 186.5L363.5 187.5L364 188L364.5 188.5L364 189L364.5 190L365.5 190L366 191L367 191.5L368 191L368.5 191.5L369 192L370 192L371 192L371.5 192.5L372.5 192.5L373 193L373.5 193.5L375 193.5L376 193.5L376.5 194L377.5 194L377.5 193L378.5 192.5L379 193L380 193.5L380.5 194L381.5 193L381.5 192L381 191.5L380.5 191L380 190.5L380 189.5L380.5 189L380.5 188L381 187.5L381.5 187L382 186.5L383.5 186L384 185L384.5 184L385 183L385.5 182.5L385.5 181.5L386 181L386 180L387 179.5L388 179.5L388.5 180L389 179.5L388.5 179L389 178.5L389 177.5L390 178L390.5 178.5L391 178L391.5 177L392.5 176L393 175.5L393.5 174.5L394.5 174.5L395.5 174.5L397 174.5L398 174.5L399 174.5L400 173.5L400.5 172L402 172L402.5 171.5L402.5 170.5L403 170L403.5 169.5L404 169L403 168.5L402 168L401.5 167.5L401.5 166.5L400.5 166L399.5 166L399 166.5L398 166.5L397.5 165.5L397 166L396 166L396 165L395 165L394 164.5L393 164.5L393 163.5L393 162.5L393 161.5L393.5 161L394.5 161L394.5 160L394 159L394.5 158.5L394.5 157.5L394 158L394 157L393.5 156.5L394 156L393.5 155.5L394 155L393 155L392 155L391 155L390.5 155.5L390 156L390.5 156.5L389.5 156.5L389 156L388.5 155.5L388 155L387.5 155.5L386.5 155.5L386 155L385 155.5L384.5 156L384 155.5L383.5 155L382.5 155L382 154.5L381.5 153.5L382 153L382.5 152.5L382 152L381.5 151.5L381 151L381.5 150.5L382 149.5L382.5 149L384 149L384.5 148.5L385 149L385.5 148L386 147.5L385.5 146.5L384.5 145.5L384 145L384.5 144.5L385 144L385.5 143.5L386 144L387.5 143.5L388 143L388.5 142.5L389 142L390.5 142L389.5 140.5L390 140L390.5 140.5L390.5 139.5L391.5 139.5L392 139L392.5 140L393 140.5L394 141L395 142L395.5 143L396.5 142.5L397.5 143L398.5 143L400 143L399.5 143.5ZM397.5 149.5L397 150L396.5 149.5L396 150L395 150L394 150L393.5 151L394 152L394.5 152.5L395 153L394.5 153.5L395 154L395.5 154.5L396.5 154.5L397 153.5L397.5 153L397 152.5L398 152.5L397.5 152L397 151L397.5 150.5L397 150L397.5 149.5ZM402.5 157.5L402 157L401.5 157.5L401 157L400 157.5L400.5 158L401.5 158L402 157.5ZM412.5 160L412 160.5L412.5 160Z","x":373,"y":172},{"name":"山西省","d":"M335.5 210.5L336.5 210.5L337.5 210.5L338.5 210.5L339 210L339.5 210.5L340 210L340 209L340.5 209.5L341 209L342 208.5L342.5 208L343 208.5L343.5 208L344.5 208L345.5 208L346 207.5L346.5 207L347 206.5L347.5 206L348.5 205.5L349.5 205L350 205.5L350.5 205L350.5 204L350.5 203L351.5 203L352 203.5L353 203L352.5 203.5L353.5 203.5L354.5 203.5L356 203.5L355.5 203L356.5 203.5L357.5 203L358 203.5L358.5 203L359 202.5L359.5 202L360.5 202.5L360.5 201.5L361 201L362 201.5L362 200.5L362.5 201L363 200.5L363.5 200L364 199.5L364 198.5L364.5 199L365 198.5L364.5 198L364.5 197L365 196.5L365 195.5L365.5 195L365 194.5L365 193.5L365.5 193L365.5 192L366 191.5L365.5 190L364.5 190L364 189.5L364.5 189L364 188.5L363.5 188L363.5 187L364 186.5L365.5 186L365.5 185L366 185.5L366.5 185L366 184.5L366.5 184L366 183.5L366.5 183L366 182.5L366.5 182L367 181.5L367.5 180.5L368 180L368.5 179L369.5 177.5L369.5 176.5L369 176L368 176L368.5 175.5L368 175L368 174L367.5 173.5L367 173L367 172L366.5 171.5L365.5 171L365 170L364 169.5L364 168.5L364.5 167.5L364 166.5L364.5 166L365.5 165.5L366 165L366.5 164.5L367 163.5L366.5 163L366 162L367.5 161L368 160.5L368.5 160L369 160.5L369.5 161L370.5 161L371.5 161L371.5 160L372 159.5L372.5 159L372 158L372.5 157L373 156.5L373.5 155.5L372.5 155L372 154.5L372 153L371.5 152.5L372 152L371 152L370 152L370.5 151.5L369 151.5L368.5 151L367.5 150.5L368 150L368.5 149.5L369 148.5L370 148.5L370.5 148L371.5 148L372.5 147.5L373 147L372.5 146.5L371.5 146.5L371 146L370.5 145.5L371 145L370.5 144.5L371 144L370 143L369.5 142.5L369 143L368.5 144L369 144.5L368.5 145L367.5 145L367 145.5L366.5 145L366 145.5L364 146.5L363.5 147L362.5 147L361.5 146L360 146.5L358 147L357.5 148L357 148.5L355.5 148L354.5 147.5L354 147L353 147.5L352.5 148L352 148.5L351.5 149.5L351 150.5L350.5 151.5L350 152.5L349.5 153L349.5 154L349 155L348 155L347 154.5L345.5 154.5L345 155L345 156L344.5 156.5L344 157L342.5 157L342 157.5L342.5 158L343 158.5L342.5 160L342 161L341.5 161.5L340.5 162L341 162.5L341 163.5L340.5 164.5L340 165L340 166L340 167L339.5 168L339 167.5L338.5 168.5L338 169L337.5 169.5L337 170.5L336.5 171.5L336.5 172.5L337 173.5L338 175L338.5 175.5L339 176.5L339 177.5L338.5 178.5L337.5 179L337.5 180L338 180.5L337 182L336.5 182.5L336 183.5L335.5 184L335.5 185L335.5 186L336 187L335.5 187.5L336 188L336.5 188.5L336.5 189.5L336 190L336.5 190.5L336 191.5L336 192.5L336 194L336.5 194.5L336.5 195.5L336.5 196.5L337 197L337 198L337.5 199L337 199.5L336.5 200.5L336 201.5L336 202.5L335 203L335.5 203.5L335 204L334.5 206L334 206.5L334 207.5L334 208.5L334 209.5L334.5 210L335.5 210.5Z","x":353,"y":177},{"name":"内蒙古自治区","d":"M215 119.5L217 123.5L218 125.5L219.5 128.5L221.5 132L219 134L219.5 134.5L222 137.5L222.5 138.5L224 139.5L225 140L226 140.5L226 144L228.5 143L228 142.5L229 142L229 143L229.5 143.5L230 144L230 143L231.5 142L232 143L233 142.5L233.5 142L233.5 141L237 141L238 140L241 140.5L242 141L243 142.5L243 143.5L242.5 144.5L242.5 147.5L241 148.5L240.5 149L240.5 150L239.5 150.5L238.5 150.5L236.5 151.5L236 152L238 152L239.5 152L240 153L241.5 153L242 154L243 154L244 155L243.5 155.5L244 156L245 156.5L245.5 157L246.5 157.5L247.5 157L248.5 157L248.5 159.5L249 160.5L248.5 161L249 161.5L249.5 162L251 162L252 161.5L252 162.5L253 163.5L254 164.5L255 165L255.5 165.5L256 165L257 165.5L258 164.5L258.5 164L260 163L259.5 162.5L258.5 162L257.5 160.5L259 160L261.5 159.5L262.5 159L264.5 159.5L267 160.5L268.5 160.5L269.5 159.5L270.5 158.5L271.5 158L272 157.5L273.5 157.5L275 157L276 156.5L277 156.5L278 157L277.5 158.5L279 160L279 161L279 162L277.5 163L276 165.5L272 168L272.5 169L273 169.5L273 171L271.5 172L272 174.5L274 175L276 176.5L276.5 177.5L278 178.5L279 179.5L280 179L281 178.5L283 178L284.5 178L285 177.5L286.5 177.5L287.5 177L288 176.5L289 176L290 176L292 176L292 175L292.5 175.5L293.5 175L293.5 173.5L294 172.5L293.5 172L293.5 170.5L294 170L294 168.5L294 167.5L294 166.5L294.5 166L294 165.5L294.5 165L294.5 164L295.5 163L295 162.5L295.5 162L296.5 161.5L296.5 160.5L297 160L298 160L298 158.5L299 158.5L300 158.5L300.5 158L301 157.5L302.5 157.5L303 158L302.5 159L303 159.5L303.5 160.5L304 161L304.5 161.5L304 162.5L303 163.5L302.5 164.5L302 165L301.5 166L301.5 167.5L301 168.5L300 169L300.5 170L301.5 170L302 170.5L302.5 171L303.5 171L304 171.5L305 171.5L305.5 171L306.5 171L307.5 172L308 172.5L308.5 173L309 173.5L309.5 174L310.5 174L311 174.5L312 174.5L312.5 175L313.5 175L314 176L315 177L315.5 176.5L316.5 176.5L317.5 176.5L318.5 176L319.5 176.5L320 176L321 176L321 175L321 174L321 173L321 172L321.5 172.5L322 173L322.5 173.5L323 173L323.5 172.5L323 172L323.5 171.5L322.5 171L322 170.5L322.5 170L323 169L323 168L324 167.5L324.5 167L325.5 166L326 165L326.5 164.5L327 164L327.5 163.5L328.5 163.5L329 162.5L329.5 161.5L330 161L330.5 160.5L331 160L331.5 159.5L330.5 159L331 158.5L331.5 159.5L332 159L333 159L334 158.5L333.5 157.5L333 157L334 157L335.5 158L336 157.5L337 157.5L337.5 158.5L338.5 158L339 157.5L339.5 156L340.5 156L341 155.5L342 155.5L342 156.5L341.5 157L342 157.5L342.5 157L344 157L344.5 156.5L345 156L345 155L345.5 154.5L346.5 154.5L347.5 155L348.5 155L349.5 154.5L349.5 153L350 152.5L350.5 152L351 150.5L351.5 150L352 149L352.5 148L353 147.5L354 147.5L355.5 148L356.5 148.5L357.5 148L358 147L359.5 146.5L361.5 146L362 147L363.5 147L364 146.5L365.5 145.5L366.5 145L367 145.5L367.5 145L368.5 145L369 144.5L368.5 144L369 143L369.5 142.5L369 142L368.5 141.5L369 141L368.5 140.5L368 140L367 138.5L367.5 137.5L368.5 137L368 136.5L367.5 136L367.5 135L367 134.5L367.5 134L368.5 133.5L370.5 133.5L370 133L370.5 132.5L370 132L370.5 131.5L370 131L371 130L371.5 129L372.5 129L373 128.5L372.5 128L373 127.5L373.5 127L374.5 127L375.5 127L376 127.5L376.5 128L376.5 129L376.5 130L376 130.5L376.5 131L376.5 132.5L376 133L377.5 132.5L378 133L379 133L379.5 132.5L380 133L380.5 132.5L380 132L380.5 131.5L381.5 131L382.5 130.5L383 130L384 130L384.5 129.5L385 129L386 129.5L386.5 130L386.5 131L387.5 131L387.5 130L388.5 129.5L389 128.5L390 128L390 129L391 128.5L391.5 129L392.5 129L393 128.5L394.5 128L394 126.5L393.5 126L394.5 126L394.5 125L394.5 124L395 123.5L396 123L397 123L398 123L399 123L399.5 122L400 121.5L400.5 122L401 121.5L401.5 122L402.5 121.5L403.5 122.5L404.5 123.5L405 124L404.5 124.5L405 125L404.5 125.5L405 126L405.5 126.5L406 127.5L405.5 128L406.5 128L407 127.5L406.5 128L407 128.5L407.5 129L407.5 130L407 131L406.5 130.5L406 131.5L406.5 132L406.5 133L407.5 133.5L407 134L407.5 134.5L408 135L407.5 135.5L408 136L409.5 135.5L410.5 135.5L411.5 136L412 135.5L412.5 136L413.5 136L414.5 136L415.5 136.5L416 136L416.5 135L417 134.5L417.5 134L417 133.5L417.5 133L417 132.5L416.5 132L416.5 131L416.5 130L417 129L416.5 128.5L417 128L417 127L416.5 126.5L416 126L417 125L418 124.5L419 124.5L418.5 125L419 125.5L420 125.5L420.5 126L421.5 126L421.5 127L422 128L422.5 128.5L422.5 129.5L423 130.5L423 131.5L424 131.5L424.5 130.5L425 129.5L425.5 129L426 128.5L427 128L427 127L428 126.5L429.5 126L430.5 125.5L431 125L432 125.5L432.5 125L433.5 124.5L434 124L434.5 123.5L435.5 123L436.5 123L437.5 122.5L438 123.5L438.5 123L439 122.5L440 122L440 121L440.5 120.5L441.5 120.5L442.5 120.5L443 120L443.5 120.5L444 121L444.5 120.5L445 120L444.5 119.5L444 119L445 119L446 119L446.5 120L447 119.5L447.5 120L448.5 120.5L449 120L450 119.5L450.5 120L451 119.5L452 119L451.5 118.5L452.5 117.5L453 117L454 117L455 117L456 116.5L456 115.5L456 114.5L456.5 114L456.5 113L455.5 113L455 112.5L454 112.5L453.5 112L453 111.5L453.5 111L454 110.5L455 110L454.5 109.5L454.5 108.5L454 108L453.5 106.5L453 106L453 105L453.5 104.5L453 104L452.5 103.5L452 102.5L451 102L451.5 101.5L451 101L451.5 100.5L450.5 100.5L448.5 101.5L448 102L447.5 102.5L447 103L445.5 103.5L444 103.5L443.5 102.5L443.5 101.5L443 101L442.5 100L442 99.5L442 98.5L442.5 98L442 97.5L441.5 96L441.5 95L442 94.5L442 93.5L442.5 93L443 92.5L442.5 92L442.5 91L442.5 90L441.5 90L441 89.5L440.5 88.5L441 88L440.5 87.5L439.5 87L439 87.5L438 87L437.5 86.5L438.5 86L439 85.5L439.5 85L439 84.5L439.5 83.5L440 84L441.5 84.5L442 85.5L443 85.5L443.5 86L444 85.5L445 85L445.5 85.5L445.5 86.5L446 86L446.5 86.5L447 87L448 87L448 86L448.5 85L448 83L450.5 83L451 82.5L451 81.5L451.5 81L451 80L450 79L450 78L450.5 77.5L451.5 77L452 77.5L452.5 77L453 76.5L454.5 76.5L455.5 76.5L456 76L455.5 75L455.5 74L455 75L454.5 74.5L455 73.5L454 73.5L453 73L453.5 73.5L453.5 74.5L453 75L452.5 74.5L452 75L451.5 75.5L451 76L450.5 75.5L450 76L449 75L449 74L448.5 73.5L448 73L448.5 72.5L447.5 72L446.5 71.5L446 71L445.5 70L445 69.5L444.5 69L445.5 68.5L446 67.5L446.5 67L448 66L448.5 65.5L449.5 65L450.5 64.5L451.5 64L452 63.5L452.5 63L453 62.5L455 61.5L455.5 61L456.5 60L457 59.5L458 58.5L459.5 57.5L460 57L460.5 56.5L461.5 56L462 56.5L462 57.5L462.5 58L463 59L463.5 60L463 60.5L464 60L464.5 59L464 58L464 57L464 56L464.5 55L465 54L464.5 53.5L465 53L465.5 52.5L465.5 51.5L466 51L466.5 50.5L466.5 49.5L467 49L467.5 48.5L468 49L468.5 48.5L469.5 49L470 48.5L470.5 48L470 47.5L470.5 47L470.5 46L470.5 45L470 44.5L470.5 44L469.5 43.5L470 43L470.5 42.5L470 42L470.5 41.5L470 40.5L470.5 40L471 39.5L470.5 39L471 38.5L470.5 38L471.5 38L472 37.5L472.5 37L472 36.5L473 36L473 35L473.5 34.5L474.5 34L475 33.5L476 33.5L475.5 33L475.5 32L475 31.5L475.5 31L476 30.5L477 30L477.5 29.5L478 29L477.5 28.5L478 28L477 27.5L476.5 27L476 26L475 26L474.5 25L474 24L473.5 23.5L473 23L472 22L471.5 21.5L470.5 21.5L469.5 21.5L469 21L469 22L468.5 22.5L468 23L467.5 23.5L467 24L466 24L465.5 25L464.5 24.5L463.5 24L463 24.5L463 25.5L462 25L461.5 24.5L460.5 24.5L460 25L459 25L458 25L457.5 24.5L456.5 24L456 24.5L455.5 25L454 25.5L453 25.5L452 25.5L451 25L450 25L449.5 24.5L449 24L448.5 23L449 22.5L448.5 22L448.5 21L448 20.5L447.5 20L447.5 19L447.5 18L447 17.5L447 16.5L446.5 16L447.5 15.5L448 15L447.5 14.5L446.5 14.5L446 14L445.5 13.5L445 13L444 13L444 12L443 12L442.5 11.5L442 12L441.5 12.5L440.5 13.5L440 14L439 14L438.5 13.5L438 13L437.5 12.5L437 12L436.5 12.5L436 12L435.5 11.5L435 11L434 11L433.5 10.5L434.5 10L436 9L436.5 8.5L437 8L437.5 7.5L438 7L438.5 6.5L439 6L439.5 5.5L439 5L438.5 4.5L438 4L437.5 3.5L437 3L436.5 2.5L435.5 2.5L434.5 3L433.5 3L432.5 3L431.5 3L430.5 3L430 3.5L429.5 4L429 4.5L428.5 5L428 5.5L427 6L426.5 6.5L426 7L425.5 7.5L425 8L424.5 8.5L423.5 8.5L423 9L423.5 9.5L423 10L423.5 11L424.5 11L425.5 10.5L426.5 10.5L427 10L428 10.5L428.5 11L429 11.5L429 12.5L428.5 13L428.5 14L429.5 14.5L430 15.5L429.5 16L429 17L429 18L427.5 18.5L427 19L426.5 19.5L425.5 19.5L425 20.5L424.5 21L423.5 21L423 22L422.5 23L423 23.5L422.5 24L422 24.5L421.5 25L421 25.5L420.5 26L421 26.5L420.5 27L420 27.5L420.5 28L420 28.5L419 28.5L418 30L418.5 30.5L418 31L418 32L417 32L416.5 32.5L416 33L416 34L415.5 34.5L415 35L415.5 35.5L416.5 35.5L417 36L417 37L416.5 37.5L416 38.5L415.5 39L415 39.5L413.5 40L412 40L410.5 40L410 40.5L409.5 41L409 41.5L408 41.5L407.5 42L407 42.5L406.5 43L406 43.5L405.5 43L405.5 44L404.5 44L403.5 44L403 44.5L401.5 44.5L400 43.5L398 43.5L396 43L393 41L390.5 46L387 52L385 55.5L384.5 56L385 59L382 60L382.5 62.5L386 65.5L387.5 64L389 63L390.5 63.5L392.5 63L393.5 63L394.5 63L396.5 63.5L399 65.5L400 64.5L400.5 64L403 61.5L404 61.5L405 61.5L405.5 61L406 61.5L407 61.5L408 61.5L408.5 62L409.5 62L411.5 64.5L415 65.5L415 67L417 67.5L416.5 68L417 68.5L418 69L418.5 69.5L419 70L420 70.5L420.5 71.5L421 72L421.5 73L421.5 74L422 74.5L422 75.5L422 76.5L421 76.5L420.5 77L420 77.5L419.5 77L418.5 77L417.5 77L416.5 77L416 76.5L415.5 77L415 76.5L414 75.5L413 76L412.5 75.5L411.5 76L410.5 76L410 76.5L408.5 76L407.5 75.5L407 76L406.5 76.5L405.5 76.5L405 77L404 77L403.5 77.5L403 78L402 78L401 77.5L400 77.5L399.5 78L399 79L399 80L397.5 80L396.5 80L394.5 80L394 79.5L393 80.5L391.5 80.5L391.5 81.5L390.5 82.5L389 84.5L388.5 85.5L389 86L388.5 87L388 87.5L386.5 87.5L386 88L385 88.5L383.5 90L382.5 90L380.5 90.5L379 90.5L377 91L375 90L373.5 90.5L373 91.5L372.5 92.5L372 93L371.5 93.5L371 94L370 94.5L369.5 95L369 96L367.5 96L367 96.5L365.5 97.5L365 98L364 97.5L360 97.5L359.5 97L358.5 97L357.5 97L356.5 96.5L355.5 96L355 95L354 94L353.5 94.5L351 94L350 94L349 94.5L348 95.5L347 96.5L346.5 97.5L346 98.5L346 99.5L345.5 100L345 102L345.5 103L346 104L347 105.5L347.5 106L349 107L349.5 108L350 109L349.5 109.5L349 110L348 110L346.5 111.5L346 112L345 112L344 112.5L342.5 113L341.5 113.5L339.5 115.5L339 116L338 117L337.5 118L336 119L335 120L333 121L331 121.5L329.5 122L327.5 123L325.5 123.5L323 123.5L321.5 124L321 123.5L320 124L318.5 123.5L316.5 123.5L316 123L314.5 123.5L313.5 124L311.5 123.5L310 124L309 123.5L307.5 124L307 124.5L305 125L302.5 125L301 125.5L299 126.5L295.5 128L293 129L291.5 129.5L290 130.5L289 131L286.5 133L285.5 132L284.5 132L283.5 132.5L282 132L282 129.5L281 130L280 130L278 130.5L276 130.5L272.5 129.5L270 129L268.5 128L265.5 126.5L264.5 126.5L263 126.5L260 126L258 123.5L257.5 123L257 122.5L255 122.5L252.5 122L249 121L244 120.5L243.5 121.5L241 121L236.5 122L231.5 121.5L227.5 121.5L224.5 121L221 120.5L216 119.5L215 119.5Z","x":369,"y":102.5},{"name":"辽宁省","d":"M455 153L456 153L456.5 152.5L457.5 152.5L458.5 152.5L459 153L460 152.5L460.5 153.5L460.5 152.5L461 152L461.5 151.5L462.5 150.5L462 150L462.5 149.5L463 149L463.5 148.5L464 148L465 147.5L465.5 147L466 146.5L466.5 146L467.5 145L468 145.5L468.5 145L469 144.5L470 144L470.5 143.5L471 143L472 143.5L472.5 143L473 142.5L473.5 142L474.5 142L474 141.5L474.5 141L474 140.5L473.5 140L474.5 139.5L475 139L474.5 138.5L475 138L475.5 137.5L475 137L474.5 136.5L474 136L473.5 135.5L473 135L473 134L472.5 133.5L472.5 132.5L472 132L471 132L471.5 131L471 130.5L471 129L471.5 128.5L472 127.5L472.5 127L472 126.5L471 126.5L470.5 126L471 125L470 125L469.5 124.5L470 124L469.5 123.5L469 123L469 122L468.5 121.5L468 121L468 120L467.5 119L467 119.5L467 118.5L467 117.5L467 116.5L466.5 116L466 116.5L465.5 117L465 117.5L464.5 118L463.5 119L463 118.5L462.5 118L463 117.5L462 117.5L463 116.5L462.5 116L461.5 115.5L461.5 114.5L460.5 114.5L460 114L459 113.5L458 113L458 112L457 112L456.5 112.5L456.5 114L456 114.5L456 115.5L456 116.5L455.5 117L454.5 117L453 117L452.5 117.5L451.5 118L451.5 119L451 119.5L450.5 120L450 119.5L449.5 120L448.5 120.5L448 120L447.5 119.5L446.5 120L446 119.5L445 119L444 119L444.5 119.5L445 120L444.5 120.5L444 121L443.5 120.5L443 120L442.5 120.5L441.5 120.5L440.5 120.5L440 121L440 122L439.5 122.5L438.5 123L438 123.5L437.5 123L436.5 123L435.5 123L434.5 123.5L434 124L433.5 124.5L433 125L432.5 125.5L431 125L430.5 125.5L430 126L428.5 126.5L427 127L427 128L426.5 128.5L425.5 129L425 129.5L424.5 130L424 131L423.5 131.5L423 131L422.5 129.5L422.5 128.5L422 128L421.5 127.5L421.5 126.5L420.5 126L420 125.5L419 125.5L418.5 125L419 124.5L418 124L417.5 125L416 125.5L416 126.5L416.5 127L417 127.5L416.5 128.5L417 129L416.5 129.5L416.5 130.5L416.5 131.5L417 132.5L417.5 133L417 133.5L417.5 134L417 134.5L416.5 135L416.5 136L416 136.5L415.5 137L415 138L414.5 138.5L413.5 138.5L413 139L414 139.5L413.5 140L412.5 141L412.5 142L413.5 142.5L414 143L415 143L415 144L416 144L416.5 144.5L417.5 144.5L418.5 144.5L419 145.5L419 146.5L419.5 147.5L420 148L420.5 149L421 150L421.5 150.5L422.5 150L423.5 149.5L425 149L426 148.5L427 148.5L427.5 147.5L428 146.5L428.5 146L429 145.5L429.5 145L430 144L430.5 143.5L431.5 143L432 142.5L431.5 142L432 141.5L432.5 141L433.5 141L434.5 141L436 141.5L436.5 141L437 141.5L437.5 141L438 141.5L438.5 141L439 140.5L439.5 141.5L440.5 141.5L440.5 142.5L441 143L441.5 143.5L442 143L442.5 144L443 145L443 146L442.5 146.5L442 147L441.5 147.5L441 148L440.5 148.5L441 149L440 149.5L439.5 150.5L439 151L438 151L437.5 152L436.5 152L436 152.5L436.5 153L436 153.5L436.5 154L436 154.5L435 155L434 155L434 156L434.5 156.5L434 157L434.5 157.5L436 157.5L436 158.5L437 158L438.5 157.5L438 158L437.5 158.5L437 159L437.5 160L438 160.5L437.5 161L437 160L437.5 160.5L437 161L436.5 161.5L435 161L434.5 161.5L435 162L433.5 162.5L433 162L432.5 162.5L433 163L433 164L433.5 164.5L434 164L435 163.5L436.5 163.5L437 163L438 163L438.5 162.5L438 162L438.5 161.5L439 162L439.5 162.5L440 162L439.5 161L440 161.5L441 161L441.5 160.5L442 160L442.5 159L443 158.5L443.5 158L444.5 157.5L445 157L446 157L446.5 156L448.5 155.5L449 155L450 155L451 154L451.5 154.5L452 154L452.5 153.5L453.5 153.5L454.5 153.5L455 153ZM447 158.5L446 158L445.5 158.5L447 158.5ZM444 159.5L444.5 160L444 159.5ZM447 159L447.5 159.5L448 159L446.5 159ZM450 155.5L449.5 156L450.5 155.5ZM430 145.5L430.5 145L430 144.5L430 145.5ZM451 157L450.5 156.5L451 157ZM451.5 161.5L452 161L451.5 160.5L451.5 161.5Z","x":446.5,"y":136},{"name":"吉林省","d":"M510 123.5L510.5 123L511 123.5L511.5 123L511.5 122L511.5 121L511.5 120L512 119.5L512 118.5L512.5 118L513 117.5L512.5 117L513.5 117L514 117.5L515 117.5L514.5 118L515 118.5L516 118.5L516 119.5L516 120.5L516.5 121L517 121.5L517.5 122L518 121.5L518.5 122L518.5 123L519 123.5L519 122.5L519.5 122L519 121L518.5 120.5L517.5 120.5L518 120L518.5 119.5L519 119L520 119L521 119L521.5 118.5L522 119L522.5 118.5L523 119L523 118L524 118L524 117L524.5 116.5L525 115L524.5 114.5L525 114L525.5 113L525.5 112L524.5 112.5L523 111.5L522.5 112L522 112.5L521.5 112L521 111.5L520.5 111L519.5 111L519 110.5L518 110L517.5 109.5L517 108.5L517 107.5L516.5 106.5L517 106L516.5 105.5L516 106.5L515 107L514.5 107.5L514 108L514 107L513.5 106L512.5 106L512 106.5L511.5 107.5L510.5 107.5L509.5 107.5L508.5 108L507.5 108.5L507 108L506.5 108.5L506.5 109.5L506.5 110.5L506 111L505 111L504.5 111.5L504 111L503.5 111.5L503 110.5L502.5 109.5L502 109L502 108L502.5 107.5L502 107L501.5 107.5L501.5 106.5L500.5 105.5L500 104.5L499.5 104L500 103.5L500 102.5L499.5 101.5L499 101L498 101L497.5 101.5L497 102.5L496.5 102L496 102.5L496.5 103L496 103.5L496.5 104L496 104.5L495 105L494.5 105.5L494 105L493.5 105.5L493 105L493 104L492.5 104.5L492 104L492 103L491.5 102.5L491 101.5L490.5 101L491 100.5L491.5 100L490 99L489 99L488 99L487.5 99.5L487 100L487 99L486.5 98.5L487 98L486.5 97.5L486.5 96.5L487 96L487 95L486.5 94.5L486 93.5L485 93.5L484 93L483 92.5L482.5 92L482 92.5L481 92.5L480.5 93L479.5 93.5L478.5 93.5L477.5 93L476.5 93L476 92.5L475.5 92L475 91.5L474.5 91L474.5 89.5L473.5 89.5L472.5 90L472 89.5L472 90.5L471 90.5L470 90.5L469 91L468.5 90.5L468.5 89.5L467.5 89L467 89.5L466.5 90L465.5 90L464.5 90L464 90.5L463.5 90L462.5 90L462.5 89L461.5 89L461 88L460.5 87.5L460 87L459.5 86.5L459.5 85.5L459 85L459 84L459.5 83.5L459 83L459.5 82.5L459 82L458.5 81.5L459 80.5L458.5 81L458 80.5L457 81L456 81L455 81.5L454.5 81L454 81.5L453 81L451.5 81L451 81.5L451 82.5L450.5 83L448 83L448.5 85L448 85.5L448 86.5L447.5 87L447 87.5L447 86.5L446 86L445.5 86.5L445.5 85.5L445 85L444 85L444.5 85.5L443.5 86L443 85.5L442 85.5L441.5 85L440.5 84L439.5 84L439 84.5L439.5 85L439 85.5L438.5 86L438 86.5L438.5 87.5L439 87L440.5 87L441 88L440.5 88.5L441 89L441.5 90L442.5 90L442.5 91L442.5 92L443 92.5L442.5 93L442 93.5L442 94.5L441.5 95L441.5 96L442 97L442.5 97.5L442 98L442 99.5L442.5 100L443 100.5L443.5 101L443.5 102.5L443.5 103.5L445.5 103.5L447 103L447.5 102.5L448 102L448.5 101.5L450.5 100.5L451.5 100.5L451 101L451.5 101.5L451 102L452 102.5L452.5 103.5L453 104L453.5 104.5L453 105L453 106L453.5 106.5L454.5 108L454.5 109L455 109.5L454.5 110.5L454 111L453 111L453 112L454 112.5L455 113L456.5 113L457 112.5L457.5 112L458 112.5L459 113.5L459.5 114L460 114.5L461 114.5L461.5 115L462.5 116L463 116.5L462 117.5L463 117.5L462.5 118L463 118.5L463.5 119L464.5 118.5L465 118L465.5 117L466 116.5L466.5 116L467 116.5L467 117.5L467 118.5L467 119.5L467.5 119L468 119.5L468 120.5L468.5 121L469 121.5L469 122.5L469.5 123L470 123.5L470 124.5L470.5 125L470.5 126L471 126.5L472 126.5L472.5 127L472 127.5L471.5 128L471 128.5L471.5 129L471 130.5L471.5 131L471 131.5L471.5 132L472.5 132L472.5 133L473 133.5L472.5 134L473 134.5L473.5 135L474 135.5L474 136.5L475 136.5L475 137.5L474.5 138.5L475 139L474.5 139.5L474 140L473.5 140.5L474.5 140.5L475.5 140.5L476.5 140.5L477 141L477.5 140L478 139.5L478.5 138.5L479 138L480 137.5L480.5 137L480.5 136L481.5 135.5L482 135L482.5 133.5L482.5 132.5L483 132L484 131.5L483.5 131L484.5 131.5L485 131L485.5 130.5L486 131L487 131L486.5 132L487.5 132.5L488 133L487.5 133.5L488.5 133.5L489 134L489.5 134.5L490 134L490.5 134.5L491 134L491.5 134.5L492 135L492.5 134.5L493.5 134.5L494 135L494.5 134.5L495.5 135L496.5 135L497.5 135L497.5 134L498 133.5L498.5 133L498 132.5L497.5 132L497 131.5L496.5 130.5L496.5 129.5L496 128.5L496.5 128L498 128L499 128L500 128.5L501 128.5L501.5 128L502.5 128L503.5 128L504 127.5L505 127L506 126.5L506.5 126L506 125.5L506.5 125L507 124.5L507.5 124L508 123.5L509 124L509.5 124.5L510 124Z","x":479,"y":109.5},{"name":"黑龙江省","d":"M455 81.5L455.5 81L456.5 81L458 80.5L458.5 81L459 80.5L458.5 81L459 81.5L459 82.5L459.5 83L459 83.5L459 84.5L459.5 85L459.5 86L459 86.5L460 87L460.5 87.5L461 88L461.5 88.5L462.5 89L462.5 90L463.5 90L464 90.5L464.5 90L465.5 90L466.5 90L467 89.5L467.5 89L468 89.5L468.5 90.5L469 91L469.5 90.5L470.5 90.5L471.5 90.5L472 90L472.5 89.5L473.5 89.5L474.5 89.5L474.5 90.5L475 91.5L475.5 92L476 92.5L476.5 93L477.5 93L478 93.5L479 93.5L480 93L481 92.5L482 92.5L482.5 92L483 92.5L483.5 93L484.5 93.5L486 93.5L486 94.5L486.5 95L487 95.5L486.5 96L486.5 97L487 98L486.5 98.5L487 99L487 100L487.5 99.5L488 99L489 99.5L490 99L491.5 100L491 100.5L490.5 101L491 101.5L491.5 102.5L492 103L492 104L492.5 104.5L493 104L493 105L493.5 105.5L494 105L494.5 105.5L495 105L496 105L496.5 104.5L496.5 103.5L496 102.5L496.5 102L497 102.5L497.5 101.5L498 101L499 100.5L499.5 101L500 102L499.5 102.5L499.5 103.5L500 104.5L500.5 105L501 106.5L501.5 107.5L502 107L502.5 107.5L502 108L502.5 109L503 110L503.5 111.5L504 111L504.5 111.5L505 111L506 111L506.5 110.5L506.5 109.5L506.5 108.5L507 108L507.5 108.5L508.5 108L509 107.5L510.5 107.5L511.5 107.5L512 106.5L512.5 106L513.5 106L514 106.5L514 107.5L514.5 108L515 107.5L515.5 106.5L516.5 106L517 105.5L516.5 106.5L517 107L517 108L517.5 109L517.5 110L519 110.5L519.5 111L520.5 111L521 111.5L521.5 112L522 112.5L522.5 112L523 111.5L524 112.5L525 112L525.5 111.5L524.5 111.5L525 110.5L525 109.5L524.5 109L524.5 108L525 107.5L525 106.5L525.5 105.5L524 98.5L523.5 98L523 97.5L522.5 97L523.5 96.5L524 95.5L524.5 96L525.5 96L526 95L527 95.5L527.5 95L528 94.5L528.5 94L529 93.5L529 92.5L530 92.5L530.5 92L531 91L531 92L532 92L533.5 92.5L535.5 93L539 94L539.5 94.5L540.5 95L541 94.5L541.5 94L542 93.5L542 92.5L542 91.5L542.5 91L542.5 90L543 89.5L544 89L544.5 88.5L545 88L545.5 87.5L545 87L545.5 86.5L545 86L545.5 85.5L546 85L546.5 85.5L546.5 84.5L547 84L547.5 83.5L547 82.5L547.5 82L548.5 81.5L549 81L549.5 80.5L549 80L549.5 79.5L549 79L548.5 78.5L549 78L549.5 77.5L550 77L550.5 76L550.5 75L550.5 74L550.5 73L551 72L552 71.5L552 70.5L551.5 70L551.5 69L552.5 68.5L553 68L554.5 68L555 67.5L555.5 67L556 66.5L556.5 66L557 65L556 64L556 63L555.5 62.5L555 62L556 60.5L556 59L557 58.5L558 58L559 57.5L560 57.5L560 56.5L559.5 57L558.5 56.5L558 57L557.5 57.5L556.5 57L555.5 57L554.5 57L553.5 57.5L552 57.5L551.5 58L550.5 58L550 58.5L549 58.5L548 59L547 59.5L546 59.5L546 60.5L545 60.5L543.5 60.5L542.5 60L541.5 60.5L541 61L540 61.5L539.5 62.5L538.5 62L538 62.5L538 63.5L537.5 64L537 65L536 65L535 64.5L534.5 65L533.5 65L532.5 65L531.5 65.5L531 65L530.5 65.5L529.5 65L528.5 65.5L528 65L527.5 64.5L526 64.5L525 64.5L524.5 65L523 65L522.5 64.5L522.5 63.5L522 62.5L520.5 62L520 61.5L519.5 60.5L520.5 59.5L521 59L521.5 58.5L521 58L520.5 57.5L520.5 56.5L520 56L519.5 56.5L519.5 55.5L519 55L518.5 54.5L519 54L519.5 53L520 52.5L519 52L518 52L517.5 51.5L516 52L514.5 51L514 50.5L513 50L512.5 49.5L512.5 48.5L511.5 48.5L511 47.5L510 47.5L509.5 46.5L508.5 46L508 46.5L507 46.5L506.5 46L506 46.5L505 46.5L504.5 45.5L503.5 45L502.5 45.5L503 44.5L502.5 44L502 44.5L501.5 44L500.5 44L499 44L498.5 44.5L497.5 44.5L496.5 44.5L495.5 44L494.5 44L493.5 43.5L492.5 43L492.5 42L491.5 42L491 41.5L491.5 40.5L491 39.5L491.5 38L492 37.5L490.5 36.5L489.5 36L490 35L489.5 34.5L489.5 33.5L490 33L489 32L489 31L487.5 29.5L487 29L486.5 28L485.5 28L485.5 27L485.5 26L486 25L485.5 25.5L484.5 25L485 24.5L486 24.5L485.5 24L484.5 23.5L485 22.5L483.5 22L484 21.5L484 20.5L483.5 20L482.5 19.5L482.5 18.5L482 18L481.5 17.5L482 17L482.5 16L482 15.5L481 15.5L480.5 15L480 14.5L481 14L481.5 14.5L481 14L480 13.5L480.5 13L479.5 12L479 11.5L478.5 11L478 10.5L477.5 11L477 10.5L477.5 10L478 9.5L477.5 9L478.5 9L478 8.5L477 9L476.5 8.5L476 7.5L475 7.5L474.5 8L474.5 7L475 6.5L474.5 6L474 5.5L473 5.5L472.5 5L471.5 4.5L470.5 4L469.5 4L468.5 4L467 4.5L467.5 5L466.5 4.5L465.5 4.5L464.5 4L463.5 4L463 3.5L462 2.5L461.5 2L460.5 2.5L459.5 2L459 1.5L458 1L457 0.5L456 0.5L455.5 0L455 0.5L454.5 0L454 0.5L453 0L452 0L451.5 0.5L450.5 0.5L449.5 1L448.5 1L447 1L446 1L445 1.5L444.5 1L444 0.5L443.5 1L442.5 1L442 1.5L441 1.5L440 1.5L438.5 2L437 2.5L437.5 3.5L438 4L438.5 4.5L439 5L439.5 5.5L439 6L438.5 6.5L438 7L437.5 7.5L437 8L436.5 8.5L436 9L435 10L434 10.5L434.5 11L435 11.5L435.5 12L436.5 12L437 12.5L438 12.5L438.5 13.5L439 14L440 14L440.5 13.5L441.5 13L442 12.5L442 11.5L442.5 12L444 12L444 13L445 13L445.5 13.5L446 14L446.5 14.5L447.5 14.5L448 15L447.5 15.5L447 16L446.5 16.5L447 17.5L447.5 18L447.5 19L448 20L448.5 21L448.5 22L449 22.5L448.5 23L449 23.5L449.5 24L450 25L451 25L452 25.5L453 25.5L454 25.5L455.5 25L456 24.5L456.5 24L457.5 24.5L458 25L459 25L460 25L460.5 24.5L461.5 24.5L462 25L463 25.5L463 24.5L463.5 24L464 24.5L465 25L466 24.5L467 24L467.5 23.5L468 23L468.5 22.5L469 22L469 21L469.5 21.5L470.5 21.5L471.5 21.5L472 22L473 23L473.5 23.5L474 24L474.5 25L475 25.5L475.5 26L476 27L477 27L478 28L477.5 28.5L478 29L477.5 29.5L477 30L476.5 30.5L476 31L475 31.5L475.5 32L475.5 33L476 33.5L475 33.5L474.5 34L474 34.5L473.5 35L473 35.5L472.5 36.5L472 37.5L471.5 38L470.5 38L471 38.5L470.5 39L471 39.5L470.5 40L470 40.5L470.5 41L470 41.5L470 42.5L470 43.5L469.5 43L469.5 44L470.5 44L470 44.5L470.5 45L470.5 46L470.5 47L470 47.5L470.5 48L470 48.5L469.5 49L468.5 49L467.5 48.5L467 49L466.5 49.5L466.5 50.5L466 51L465.5 51.5L465.5 52.5L465 53L464.5 53.5L465 54L464.5 54.5L464 55.5L464 56.5L463.5 57L464 57.5L464.5 58.5L464 59L464 60L463.5 60.5L463 61L463.5 60.5L463 59.5L462.5 58.5L462 58L462 57L462 56L460.5 56.5L460 57L459.5 57.5L458 58.5L457 59.5L456.5 60L455.5 61L455 61.5L453 62.5L452.5 63L452 63.5L451.5 64L450.5 64.5L449.5 65L448.5 65.5L448 66L446.5 67L446 67.5L445.5 68.5L444.5 69L445 69.5L445.5 70L446 70.5L446.5 71.5L447 72L448.5 72L448 73L448.5 73.5L449 74L449 75L450 75.5L450.5 76L451.5 75.5L452 75L452.5 74.5L453 75L453.5 74.5L453.5 73.5L453 73L454 73.5L455 73.5L454.5 74.5L455 75L455.5 74.5L456 76L455.5 76.5L454.5 76.5L453.5 76.5L452.5 76.5L452 77.5L451.5 77L451 77.5L450.5 77L450 77.5L450 79L451 80L451.5 80.5L452.5 81L453.5 81.5L454 81L455 81.5Z","x":492.5,"y":61.5},{"name":"上海市","d":"M431 250L431.5 250.5L432 251L432 252L433 252.5L433.5 253L434.5 253.5L435 254L435.5 253.5L436.5 253L437.5 252.5L440 252.5L440.5 253L441 252L441 251L440.5 250.5L440.5 249.5L439 248.5L438.5 247L437.5 246.5L436.5 246L435.5 245L434.5 245L433.5 245.5L433 246L433 247.5L432.5 247L432.5 248.5L432 249L431 249L430.5 249.5L431 250ZM440.5 243.5L438.5 243L437.5 242.5L436.5 242L435.5 241L434.5 241L433.5 241L433 242L434.5 243.5L435 244.5L435.5 244L437 244.5L437.5 245L439.5 245.5L441 245.5L440.5 243.5ZM439 247L438.5 246L437 245.5L436.5 245L437 245.5L438.5 246.5L439 247ZM439 246.5L439.5 247L440.5 247.5L442 247.5L441.5 247L440.5 246.5L439.5 246.5L439 246ZM437.5 245.5L437 245L437.5 245.5ZM440.5 248L441 248.5L440.5 248Z","x":436,"y":249.5},{"name":"江苏省","d":"M398.5 211L398 211.5L397.5 212L397 212.5L396.5 211.5L397 211L396.5 210L396 209.5L395.5 208.5L395 208L395 207L394 207L393.5 206.5L392.5 206.5L392 207L390.5 207L390 207.5L390 208.5L389.5 209L390 209.5L390.5 210L391 211L392 211.5L392.5 212L393.5 212L394 213L394.5 212.5L395 213L395.5 213.5L395 214L396 214.5L395.5 215.5L396.5 215.5L397 216.5L398 216.5L398.5 216L399 217L400 216.5L400.5 217.5L401 217L401.5 218L402 218.5L402 220L402.5 220.5L403 220L404.5 220L405 219.5L406 220L406 221L405.5 221.5L405.5 223L404.5 224L404.5 225L404 225.5L404.5 226L405 226.5L406 226.5L406.5 226L406.5 227L407 228L407.5 228.5L407 229L407 230L407.5 230.5L408 231L408.5 231.5L409.5 231L410 231.5L410.5 231L411 231.5L411.5 231L411.5 230L412 229L412.5 228.5L413 229L413.5 228.5L414 229.5L414.5 230L415.5 230L415.5 231.5L416 232.5L415.5 233L415 233.5L414.5 234.5L414 233.5L413 233L412 233L411.5 232.5L411 233L410.5 232.5L409.5 233L410 233.5L410.5 234L411 235L410.5 236L410.5 237L409 237L409 238L408.5 238.5L408 239.5L409 240.5L409 242L409.5 242.5L410 242L410.5 242.5L411.5 243.5L412.5 243.5L412.5 244.5L412.5 246L412 246.5L411 247L411.5 247.5L412 248L412.5 247.5L413.5 248L414.5 248L415 247L415.5 247.5L416.5 247.5L417 247L417 248L417.5 248.5L418.5 248.5L419 249L420 248.5L421 249L421.5 248.5L422.5 249.5L423 250L424 251L425 251L426 251L426.5 251.5L427 252L427 253L428 252.5L428.5 252L429 251.5L429.5 251L430 250.5L431 250L430.5 249.5L431 249L432 249L432.5 248.5L432.5 247.5L433 246.5L433.5 245.5L434 245L435 245L434.5 243.5L433 242L433.5 241L434.5 241L435.5 241L436 242L437.5 242.5L438.5 243L440.5 243.5L440.5 242.5L440 241L439.5 240L439 239L438.5 238.5L436.5 238L437 237.5L436 237.5L436.5 237L436 236L435.5 234.5L435 234L433 233.5L432.5 233L432 232.5L431.5 232L431 231.5L431.5 231L431.5 230L431 228L430.5 227.5L430.5 226L430 225.5L430.5 225L429.5 225L429.5 223.5L429 222.5L428.5 221.5L428 221L427.5 219.5L427 218.5L426 216L426 215L425.5 214.5L425.5 213.5L423.5 213L422.5 212L421 211.5L419.5 211L419 210.5L418 209.5L418.5 209L417 209L418 209L417.5 208.5L416.5 208.5L415.5 208L415.5 207L415.5 206L416 205.5L416.5 205L416 204.5L415.5 205L414.5 205.5L413 205.5L412.5 206L412 207.5L411.5 208.5L411 209L411.5 209.5L410.5 209.5L410 209L409.5 209.5L409 210L408.5 210.5L408.5 211.5L408 212.5L407 212.5L406.5 213L406 212L406.5 211L405.5 211L405.5 210L404 209.5L403.5 210L402.5 210L403 211.5L401.5 211L401 211.5L400.5 212L399.5 212L399 211Z","x":418,"y":228.5},{"name":"浙江省","d":"M408.5 280.5L409 281L410 280.5L411 280.5L411.5 281L412 281.5L412 282.5L411 283L411 284L411.5 284.5L412 285.5L412.5 286.5L412.5 287.5L413 288L412.5 289L413 289.5L413.5 290L414 289.5L415 289.5L415.5 290L416.5 289.5L417 289L418 289L418 288L418.5 287.5L419.5 287.5L419.5 288.5L420 289L420 290L420.5 290.5L421 291L420.5 291.5L421.5 291.5L422 291L423 290.5L424 290.5L425 290L426 290.5L426.5 292L427 293L428 292L429 291L429 290L428.5 288.5L429 288L430 286.5L431 285L432 285.5L433 286L433.5 285.5L432.5 285L432 284.5L432.5 282.5L433 282L433 283.5L434 283.5L434.5 283L435 282L435.5 281.5L436 281L436.5 280.5L437 281L438 280L438 279L437.5 278L437 276.5L437.5 276L438 275.5L438 274L439 274L438.5 273L438 272L437.5 271L438.5 271L439 271.5L440 271.5L440.5 272L441 271.5L440.5 270.5L441 269.5L440.5 269L440.5 268L441 267.5L440.5 267L441 266.5L440.5 265.5L439.5 265.5L440.5 264.5L441 264L441.5 263.5L442 263L441 262.5L440.5 262L440 262.5L439.5 262L439 261.5L438 261.5L438 260.5L437.5 261L437 259.5L436.5 258.5L435.5 258L435 257.5L434 257L433.5 256.5L432.5 256L433 255L433.5 254.5L434.5 254L434 253L433 253L432.5 252L432 252.5L432 251.5L431.5 250.5L431 250L430.5 250.5L429.5 251L429 251.5L428.5 252L428 252.5L427.5 253L427 252L426.5 251.5L426 251L425 251L424 251L423 250.5L422.5 250L422 248.5L421 248.5L420 248.5L419.5 249L419.5 250L419 251L418.5 252L419 252.5L418.5 253L418 253.5L417.5 254.5L417 254L416.5 254.5L416 255L416 256L416.5 255.5L416.5 256.5L417 257.5L416 257.5L415.5 258.5L415 258L414 258L413 257.5L412.5 258L413 259L412.5 259.5L412.5 260.5L413 261L412.5 262L412 262.5L411.5 263.5L411.5 264.5L411 265L410.5 265.5L409.5 266L409 267L408 267L407.5 267.5L407 268L406.5 269L406 269.5L405 270L405 271L405.5 272L406 273L406.5 273.5L407.5 274.5L408 276L408.5 277L408.5 278L409 278.5L408.5 279L409 280L408.5 280.5ZM442.5 261.5L443 262L444 262L444 261L443.5 260.5L442.5 260.5L442 260L440.5 259.5L441 260.5L440.5 261L441 261.5L442 261.5ZM443 259.5L442 259.5L442.5 260L443 259.5ZM443 264.5L443.5 265L443 264.5ZM445 253.5L446 254L445.5 253.5ZM442.5 258L441.5 258.5L442.5 259L443 258L442.5 257.5ZM444 259L444.5 258.5L444 259ZM441 270.5L441.5 271L441 270.5ZM444.5 262.5L444.5 263.5L445 263L444.5 262L444 262.5ZM445 257L444.5 256.5L443.5 256.5L444 257L445 257ZM443.5 263L443 263.5L444 264L443.5 263.5ZM439 271.5L439.5 272L439 271.5ZM440.5 253L440.5 254L441.5 255L441 254L441 253ZM442.5 265.5L443 265L442.5 264.5L442 264L441.5 264.5L442 265.5ZM439.5 279L440 278.5L439.5 279ZM444.5 262L444.5 261L444.5 262ZM439.5 262L440.5 261.5L440 261L439.5 260.5L439.5 261.5ZM432.5 289.5L433 290L432.5 289.5ZM441.5 264L441 264.5L441.5 264ZM440.5 258.5L441 258L440 258L440.5 258.5ZM443.5 264.5L443 264L443.5 264.5ZM443.5 258.5L443 259L444 259L443.5 258.5ZM432.5 284.5L433 284L432 284.5ZM443 262L443.5 262.5L443 262ZM441 262L441.5 262.5L441 262ZM432 284L432.5 283.5L432 284Z","x":424,"y":270.5},{"name":"安徽省","d":"M392 217L392 218.5L391.5 218L391 218.5L390.5 219L390 219.5L389 220L388 220.5L387.5 220L387 219.5L387 218.5L386 218L386.5 217.5L386 217L385 217L384.5 216.5L383.5 216.5L383 217L382.5 217.5L382.5 218.5L383 219.5L383 220.5L383 221.5L382.5 222L381.5 222L381 222.5L380.5 223L380 223.5L380.5 224L380.5 225L380 226L380 227L379.5 226.5L379 227L377.5 227.5L377 227L376.5 226.5L376.5 227.5L376 228.5L377 229L377.5 229.5L378.5 229.5L379 230L379 231L379 232L379 233L379.5 232.5L380 233L381 233L382 234L382.5 234.5L383 235L383.5 234.5L384 234L384.5 233.5L385.5 233L385 234L385.5 235L385.5 237L386 237.5L385.5 239L385.5 240L385.5 241L385.5 242L385 241.5L384.5 242L383.5 242L382.5 242.5L382 243L381.5 243.5L381 244.5L380.5 245L381 245.5L380.5 246L381 246.5L381.5 247.5L382 248L382.5 249L383 248.5L383.5 248L384.5 249L385.5 249L386 249.5L386.5 250L387 250.5L386.5 251L386 251.5L385 252L385 253L384 254L384.5 254.5L385 255L385.5 255.5L385.5 256.5L385.5 257.5L386.5 258.5L387 259.5L387 260.5L387 262L387.5 262.5L387.5 263.5L388.5 263.5L389 264L389.5 263.5L390.5 262.5L391.5 262.5L391.5 261L392 260.5L393 261L393.5 261.5L394 262L394.5 262.5L393.5 264L392.5 265L393 266L393.5 266.5L394 266L395 265.5L395.5 265L396.5 264.5L396 263.5L396.5 263L397 262.5L398 263L398.5 263.5L399.5 263L399 263.5L399.5 264.5L400 265.5L400.5 266L401.5 266L402 266.5L403.5 266.5L404.5 266L405 266.5L406 267L405.5 267.5L406 268L407 268L407.5 267.5L408 267L409 267L409 266L410 265.5L411 265L411.5 264.5L411.5 263.5L412 262.5L412.5 262L413 261L412.5 260.5L412.5 259.5L413 259L412.5 258.5L413 257.5L413.5 258L414.5 258L415.5 258.5L416 258L416.5 257.5L417.5 257.5L416.5 256.5L416.5 255.5L416 256L416 255L416.5 254.5L417 254L417.5 254.5L418 253.5L418.5 253L419 252.5L418.5 252L419 251.5L419.5 250L419.5 249L418.5 248.5L417.5 248.5L417 248L417 247L416.5 247.5L415.5 247.5L415 247L414.5 247.5L414 248L412.5 247.5L412 248L411.5 247.5L411 247L411.5 246.5L412.5 246L412.5 245L412.5 244L412 243.5L411.5 243L410.5 243L411 242.5L410.5 242L409.5 242.5L409 242L409 241L408 240L408 238.5L409 238L409 237L410.5 237L410.5 236L411 235.5L411 234L410 234L409.5 233L410 232.5L410.5 233L411 232.5L411.5 233L412 232.5L413 233L413.5 233.5L414.5 234.5L415 234L415 233L416 232.5L415.5 232L415.5 230L414.5 230L414 229.5L414 228.5L413 229L412.5 228.5L412 229L412 230L411.5 231L411 231.5L410.5 231L410 231.5L409.5 231L409 231.5L408.5 231L408 231.5L407.5 231L407.5 230L406.5 229L407.5 228.5L407 228L406.5 227L406.5 226L406 226.5L405 226.5L404.5 226L404 225.5L404.5 225L405 224L405 223L405.5 221.5L406 221L406 220L405.5 219.5L404.5 220L403.5 220L402.5 220L402.5 218.5L401.5 218L401.5 217L400.5 217.5L400.5 216.5L399.5 217L398.5 216L398 216.5L397 216.5L396.5 216L396 215.5L396 214.5L395 214L395.5 213.5L395 213L394.5 212.5L394 213L393.5 212.5L393 212L392 211.5L391 211L390.5 210.5L390 210L389.5 210.5L388.5 211L388 210.5L388 211.5L388 212.5L388.5 213L389 213.5L390 214L391 214L391.5 214.5L391.5 215.5L391 216L391.5 216.5L392 217Z","x":397.5,"y":241},{"name":"福建省","d":"M413.5 317.5L414 316.5L413.5 317L413 316.5L412.5 316L413.5 315.5L413 314.5L413.5 314L413.5 315L414 314.5L414 315.5L414.5 316L414.5 317L415 316.5L415 315.5L414.5 315L415 314.5L415.5 315L416 315.5L416.5 315L417 314.5L416.5 314L416 313.5L415.5 313L415 312.5L416 312L416.5 312.5L417 312L417 311L417.5 311.5L417.5 312.5L418 312L418.5 312.5L418 313L419 312.5L419 313.5L419.5 313L420 312L420.5 312.5L421 312L421 311L421.5 310.5L421 310L420 310L420 311L420 312L419 311.5L419.5 311L419 310.5L418.5 310L418 309.5L419 309.5L419.5 309L419.5 307.5L420 307L420 306L419.5 305.5L419.5 304.5L419 304L419.5 303.5L420 303L421 303L421.5 302.5L422.5 302L421.5 301L421 299.5L420.5 299L419 299.5L419.5 298.5L421 298.5L421.5 299L422 298.5L422 297.5L423 297L423.5 297.5L422.5 298L422.5 299L421.5 299.5L421 300L421.5 300.5L422.5 299.5L423.5 299L424 298L423.5 297.5L424 297L423 296.5L424 296L424.5 295.5L425 296L425 295L425.5 294.5L426.5 294L427 293L426.5 292.5L426 291L425 290.5L424 290L423.5 290.5L423 291L422 291L421.5 291.5L420.5 291.5L421 291L420.5 290.5L420 290L420 289L419.5 288.5L419.5 287.5L418.5 287.5L418 288L418 289L417 289L416.5 289.5L416 290L415 290L414.5 289.5L413.5 289.5L412.5 289L413 288.5L412.5 287.5L412.5 286.5L412 285.5L412 284.5L411 284L411 283L411.5 282.5L412 282L411.5 281.5L412 281L411 280.5L410 281L409 281L408.5 280.5L407.5 281.5L408 282L407 283L406 283L405.5 283.5L404.5 284L404 284.5L402.5 285L402 286L401.5 285.5L401 285L400.5 284L400 284.5L399 285L398.5 285.5L398 285L398 286.5L397.5 287L397 287.5L396.5 287L396.5 288L396 287.5L395.5 288L396 289L396.5 289.5L396.5 290.5L397 291L396.5 291.5L397 292L396 293L395 294L394.5 294.5L392.5 295L392 295.5L391.5 296.5L391.5 297.5L391 298L391.5 298.5L391.5 299.5L392 300L392 301L392 302L391.5 301.5L391 302L390.5 302.5L390 303.5L390.5 304L391 304.5L390 305.5L389.5 306L389 307L388 307L387.5 307.5L388 308.5L387.5 309L387 310L387 311L386.5 311.5L386.5 313L386.5 314L386 314.5L385 314.5L385.5 315.5L385.5 316.5L385 317L385.5 317.5L386.5 318L387 318.5L388 318.5L388.5 319L389.5 319L390 318.5L390 319.5L390.5 320L391 321L392 321L393.5 320.5L394 321L393.5 321.5L393.5 322.5L394 323L394.5 324L394.5 325L395 325.5L395.5 326L395 326.5L395 327.5L395.5 328L395.5 329L395.5 330.5L396 331L396.5 332L397 333L398 333L399 333L399.5 332.5L400 332L400.5 331.5L401.5 330.5L401.5 329.5L402.5 329.5L403 328.5L403.5 328L404 327.5L404.5 326.5L405 325.5L406 325L405.5 324L405 323.5L405.5 322.5L406 321.5L407 322.5L408 322L408.5 321.5L409.5 322L410 322.5L411 321.5L410.5 321L411 320.5L411.5 320L410.5 319L411 318.5L411.5 319L412 318.5L413 318.5L413.5 318L413 317.5L414 317.5ZM408.5 322.5L408 323L407.5 322.5L407.5 323.5L408.5 323.5L408.5 322.5ZM418 315L418.5 315.5L419 314.5L418.5 315L418 314.5L417.5 315ZM422.5 304L423 303.5L422.5 304ZM406.5 323.5L407 323L406.5 323.5ZM422 298.5L422.5 298L422 298.5ZM406.5 322.5L406 322L405 323L405.5 323.5L406.5 323ZM419.5 304.5L419 304L419.5 304.5ZM423 300.5L423.5 300L423 300.5ZM419.5 310L420 309.5L419.5 310ZM424 300L424.5 299.5L424 299L424 300ZM426 296L426.5 295.5L426 295L425.5 295.5L426 296ZM419.5 299L420.5 298.5L419.5 298.5Z","x":404.5,"y":305},{"name":"江西省","d":"M406.5 268L405.5 267.5L406 267L405.5 266.5L404.5 266L404 266.5L402.5 266.5L401.5 266L400.5 266L400 265.5L399.5 265L399 263.5L399.5 263L399 263.5L398.5 263L398 263.5L397.5 262.5L396.5 262.5L396 263.5L396.5 264L396 265L395 265.5L394.5 266L393.5 266.5L393 266L392.5 265.5L393.5 263.5L394.5 262.5L394 262L393.5 261.5L393 261L392.5 260.5L391.5 261L391.5 262.5L390.5 262.5L389.5 263.5L389 264L388.5 263.5L387.5 263.5L387 264L386 264.5L385 264.5L384 264L383.5 263.5L382 263.5L381.5 264.5L381 265L380.5 265.5L380 266L379.5 265.5L378.5 265L378.5 266L378.5 267L378 266.5L377 266.5L376.5 267L376 267.5L376.5 268L376.5 267L377 267.5L376.5 268L375.5 268.5L374.5 268L374 268.5L373 269L372 269L371 268.5L370.5 269L370.5 270L369.5 270L369 270.5L368.5 271L368 271.5L367.5 272L368 272.5L368 273.5L368.5 273L368 273.5L368.5 274L369 274.5L369.5 275L369.5 277L369 277.5L369.5 278L370 278.5L370 279.5L370.5 280L370 280.5L369.5 281L369 281.5L368.5 282L368.5 283L368 283.5L367.5 284L367 283.5L366.5 284L366 284.5L365.5 285L366 285.5L365.5 286.5L365 287.5L364.5 288L364.5 289L365 289.5L364.5 290L365 290.5L364.5 291L365.5 291L367 290.5L367 291.5L367 292.5L366 293.5L366.5 294.5L367 295L367.5 295.5L367 296L366.5 297L367 297.5L367 298.5L367.5 299L368.5 299.5L369 300.5L369 301.5L368.5 302L368.5 303L368 303.5L367.5 304L368 304.5L368.5 304L370 303.5L370.5 304L370 304.5L369 305L368.5 306L368.5 307L368 307.5L368 308.5L367.5 309L368 310L368 311L367.5 312L368 312.5L368.5 313L368.5 314L369.5 313.5L370.5 314L371 313.5L372 313L373 312.5L374 313.5L375 314L374.5 314.5L375 315.5L374 316L373 317L372.5 317.5L372 318.5L371.5 319L371.5 320L370.5 320.5L369.5 320.5L370 321L371 321.5L372 322L373 322L374 321.5L374.5 322.5L375 322L375.5 321.5L376 322L376.5 321.5L377.5 320.5L379 320L380 319.5L380.5 320L381 319.5L382 320.5L382.5 321L383.5 321.5L384 322L385 322L384.5 321L384 320L384.5 319.5L384.5 318.5L385 318L385.5 318.5L385.5 317.5L385 317L385.5 316.5L385.5 315.5L385 315L386 314.5L386.5 314L386.5 313L386.5 312L387 311L387 310L387 309L387.5 308.5L387.5 307.5L388 307L389 307L389.5 306.5L390 305.5L391 304.5L390.5 304L390 303.5L390 302.5L390.5 302L391 301.5L391.5 302L392 301L392 300L391.5 299.5L391.5 298.5L391 298L391.5 297.5L391.5 296.5L392 296L392.5 295L394 294.5L395 294.5L396 293.5L397 292L396.5 291.5L397 291L396.5 290.5L396.5 289.5L396 288.5L395.5 288L396 287.5L396.5 288L396.5 287L397 287.5L397.5 287L398 286.5L398 285.5L398.5 285L399.5 284.5L400 284L401 285L401.5 285.5L402 286L402.5 285.5L403.5 284.5L404 284L405.5 284L406 283L407 283L408 282.5L408 281.5L408.5 280.5L409 280L408.5 279.5L409 278.5L408.5 278L408.5 277L408.5 276L408 274.5L407 273.5L406 273L405.5 272.5L405 272L405 271L405 270L405.5 269.5L406 269L406.5 268Z","x":384,"y":288},{"name":"山东省","d":"M390 210L389.5 209L390 208.5L390 207.5L390.5 207L391.5 207L392 206.5L393.5 207L394 206.5L395 207L395 208L395.5 208.5L396 209L396 210L397 211L396.5 211.5L397 212.5L397.5 212L398 211.5L398.5 211L399 210.5L399.5 212L400.5 212L401 211.5L401.5 211L403 211.5L402.5 210.5L403.5 210L404 209.5L405 210L405.5 210.5L406.5 211L406 211.5L406 213L406.5 212.5L408 212.5L408.5 212L408.5 210.5L409 210L409.5 209.5L410 209L410.5 209.5L411.5 209.5L411 209L411.5 208.5L412 208L412.5 206.5L413 205.5L414 205.5L415 205L416 204.5L416.5 205L417.5 204.5L417.5 203.5L418 203L418.5 202.5L419 202L419.5 201L419.5 200L420 199L420.5 199.5L421 199L421.5 199.5L422 199L422.5 198L422 197.5L423 198L423 197L423.5 196.5L424 196L424.5 195.5L425.5 195.5L425.5 194.5L425 195L425 194L424 194L423.5 193.5L424 193L424.5 192.5L425 193L425.5 192.5L426 193L425.5 194.5L426.5 194.5L427 194L427.5 193.5L428 194L428.5 193.5L429 193L429 192L429.5 191.5L429 190.5L429.5 190L430.5 190L430.5 191L431 190.5L431.5 190L431.5 189L431 188.5L430.5 188L431.5 188.5L432.5 188L433.5 187.5L434.5 187L435.5 187L436 186.5L436.5 186L437 185.5L436.5 186L436.5 187L437 186.5L438 187L437.5 186L438.5 186L439 185.5L440.5 184.5L441.5 185.5L442 185L442.5 185.5L443.5 185.5L444.5 185.5L445 185L446 185L446 184L446 183L445.5 183.5L445.5 182.5L446 182L446.5 181.5L446 181L446.5 180L447 179.5L447.5 179L447 179.5L446 179.5L445.5 179L444.5 179L443.5 179L443 178.5L442.5 179L442 178.5L442.5 178L441.5 177.5L441 178L440 178.5L439 178.5L438 178.5L437 178.5L436 178.5L435.5 177.5L435 177L434.5 177.5L433.5 177L433 176.5L433.5 176L432 176L431.5 175L430.5 174.5L429.5 174.5L428.5 175L428 175.5L427 175.5L426 176L425 176L425 177L424.5 177.5L425 178L424 178.5L423.5 179L422.5 179L422 179.5L421.5 180L422 181L421 181.5L420.5 182.5L420 182L419 182.5L418 182.5L417 182.5L416.5 181.5L415.5 181.5L415.5 180.5L415 181.5L414.5 181L414 180.5L413 178.5L413.5 177L414 176.5L415 176.5L416 176.5L416.5 175L416.5 174L415.5 174.5L414.5 173.5L413.5 173L413.5 171.5L413 171L412 171L411 171L410 171.5L409.5 172L409 171.5L408 171.5L406.5 171L406 170.5L405 170.5L403.5 169.5L403 170L402.5 170.5L402.5 171.5L402 172L401 172L400 173L399.5 174.5L398.5 174.5L397 174.5L396 174.5L394.5 174.5L393.5 174.5L393 175L392.5 176L392 177L391 178L390.5 178.5L390 178L389.5 177.5L389 178L388.5 178.5L389 179.5L388.5 180L388 179.5L387 179.5L386.5 180L386 181L385.5 181.5L385.5 182.5L385 183L384.5 184L384 185L383.5 186L382 186.5L381.5 187L381 187.5L380.5 188L380.5 189L380 189.5L380 190.5L380.5 191L381 191.5L381.5 192L381.5 193.5L381.5 194.5L380.5 195.5L380.5 197L381.5 196.5L382 196L383 196L383.5 195.5L384.5 195L385.5 194.5L386.5 194.5L387 194L387.5 193.5L387 194.5L387 195.5L386 195L385.5 195.5L385 196L385.5 196.5L384.5 196.5L384 197L383.5 197.5L383 198L382 198L381 199.5L380.5 200L380 200.5L379.5 201.5L378.5 201.5L378 202L377 203L376.5 203.5L376 204L376 205L375.5 205.5L376 206L376.5 206.5L377 206L377.5 206.5L378 206L378.5 206.5L379.5 206.5L379 207L379.5 207.5L381 208L381.5 209L381.5 210L382 210.5L382.5 211L383.5 211L384.5 210.5L385 211L386 210.5L387.5 210.5L388 211L389 210.5L389.5 210ZM432 190.5L431.5 190L432 190.5ZM424 197.5L424.5 198L424 197.5ZM428.5 173.5L428 173L428.5 173.5ZM382 196L381.5 196.5L382 196Z","x":406.5,"y":191},{"name":"河南省","d":"M356.5 235.5L358 235L359 235L359.5 234.5L360 235L361 234.5L361.5 235L362 235.5L362.5 236L363 236.5L364 236L365 235.5L365.5 234.5L366 235L366 236L366 237L366 238L365.5 238.5L366.5 239L366 239.5L366.5 240L367 241L367.5 240.5L368 241L368 242L369 242L369.5 241.5L370 241L371 242L372 242L373 242L373.5 243L373 243.5L373.5 244L374.5 244.5L375.5 244.5L375.5 245.5L376 245L377 245L377.5 244.5L378 245L378.5 244.5L379 243.5L379 244.5L379 245.5L379.5 246L380.5 246L381 245.5L380.5 245L381 244.5L381.5 244L382 243L382.5 242.5L383.5 242L384.5 241.5L385.5 242L385.5 241L385.5 240L385.5 239L386 237.5L385.5 237L385.5 235L385 234L385.5 233.5L384.5 234L383.5 234L383.5 235L383 234.5L382 234.5L381 233L380 233L379.5 232.5L379 233L379 232L379 231L379 230L378.5 229.5L377.5 229.5L377 229L376.5 228.5L376.5 227.5L376.5 226.5L377 227L377.5 227.5L379 227.5L379.5 226.5L380 227L380 226L380.5 225.5L380.5 224.5L380 224L380 223L380.5 222.5L381 222L382 222L383 221.5L383 220.5L382.5 219.5L383 218.5L382.5 217.5L383 217L383.5 216.5L384.5 216.5L385 217L386 217L386.5 217.5L386 218L387 218.5L387 219.5L387.5 220L388 220.5L388.5 220L389.5 219.5L390.5 219.5L391 218.5L391.5 218L392 218.5L392 217.5L391.5 216.5L391 216L391.5 215.5L391.5 214.5L391 214L390 214L389.5 213.5L388.5 213L388 212.5L388 211.5L388 210.5L387.5 211L386.5 210.5L385 211L384.5 210.5L383.5 210.5L383 211L382 210.5L381.5 210L381 209L381 208L380 207.5L379.5 208L379.5 207L378.5 206.5L378 206L377.5 206.5L377 206L376.5 206.5L376 206L375.5 205.5L376 205L376 204L376.5 203.5L377 203L377.5 202L378 201.5L379 201.5L380 200.5L380.5 200L381 199.5L381.5 198L383 198L383.5 197.5L384 197L384.5 196.5L385.5 196.5L385 196L385.5 195.5L386 195L387 195.5L387 194.5L387.5 193.5L387 194L386.5 194.5L385.5 194.5L385 195L383.5 195.5L383 196L382 196L381.5 196.5L381 197L380.5 197.5L380.5 196L381.5 195L381.5 193.5L380.5 193.5L380 194L379.5 193L379 192.5L378 193L377.5 193.5L376.5 194.5L376.5 193.5L375 193.5L374 193.5L373 193L372.5 192.5L371.5 192.5L371 192L370 192L369 192L368.5 191.5L368 191L367.5 191.5L367 191L366 191L365.5 191.5L365.5 192.5L365 193L365.5 193.5L365.5 194.5L365 195L365 196.5L364.5 197L364.5 198L365 198.5L364.5 199L364 198.5L364 199.5L363.5 200L363 200.5L362.5 201L362 200.5L362 201.5L361.5 201L361 201.5L360.5 202L359.5 202L359 202.5L358.5 203L358 203.5L357.5 203L357 203.5L355.5 203L356 203.5L354.5 203.5L353.5 203.5L352.5 203.5L353 203L352 203.5L351.5 203L350.5 203L350.5 204L350.5 205L350 205.5L349.5 205L348.5 205.5L347.5 206L347 206.5L346.5 207L346 208L345 208L344 208L343 208L342 208.5L341 209L340.5 209.5L340 209L340 210L339.5 210.5L339 210L338.5 210.5L337.5 210.5L336.5 210.5L335.5 210.5L335 211L335.5 212.5L336 213L336.5 213.5L336 214L336.5 214.5L337 215L337.5 215.5L337 216L337 217L337.5 216.5L338 217.5L337.5 218L337 218.5L337.5 219L338.5 219L339 219.5L339.5 220L340 221L340.5 221.5L341 222L341 223L341 224L341 225.5L341.5 226L342 226.5L342.5 227L342.5 228L343.5 228L343 229L343.5 229.5L344.5 230L344.5 231L345 231.5L345.5 232L346 232.5L347 232.5L348.5 233.5L349 234L349.5 233.5L350 234L351 234.5L351.5 235L353 236L353.5 235.5L354.5 235L355.5 235L356.5 235.5Z","x":364.5,"y":218},{"name":"湖北省","d":"M341.5 226.5L341 225.5L340 226L339.5 226.5L338.5 226.5L338 227L337.5 226.5L337 225.5L336 226.5L335 226L334.5 226.5L333.5 226L332 226L331 225.5L330 225.5L329 225.5L328.5 225L327.5 225.5L326.5 226.5L327.5 226.5L328 227L329 227L330 227.5L330 228.5L329.5 229L330 229.5L330.5 229L331 229.5L332.5 230L333 230.5L333.5 231L333.5 232L333 232.5L332.5 233L332 233.5L331.5 233L330 233L329.5 232.5L328.5 232.5L328.5 233.5L327.5 234.5L327.5 235.5L327 236L327.5 236.5L328 237L328.5 238L328 239L328.5 240L328 240.5L328.5 241.5L328 242.5L329 242.5L329.5 243.5L329.5 244.5L330.5 244.5L331.5 245L332 245.5L332.5 246L333.5 247L333 247.5L333.5 248.5L333 249L333 250L333.5 250.5L333 251L332.5 252.5L332 251.5L331.5 252L331 251.5L330.5 252L329 253L328.5 253.5L328 254L327.5 254.5L326.5 255L326 256L325.5 255L324.5 255.5L323.5 255.5L324 254.5L323 254.5L322 255.5L321.5 256L320.5 256L320 255.5L319.5 255L319 256.5L318.5 256L317.5 256L317.5 257L318 257.5L318.5 258L319 258.5L318.5 259.5L319 260L318.5 260.5L318.5 261.5L318.5 263L317.5 263L317 263.5L317.5 264L318 264.5L318.5 264L319 263L320 263.5L320 264.5L320.5 265.5L321 265L321.5 265.5L322 266L321.5 266.5L321.5 267.5L322 268L322 269L322.5 268.5L323.5 268L324 268.5L323.5 269.5L324 271L325 271.5L325 270.5L325.5 270L326 269.5L326 268.5L326.5 267.5L326.5 266.5L327 267L327.5 265.5L328 266L328.5 265.5L329 266L329 265L329.5 264.5L330 264L331 264L332 264L333 264L333.5 264.5L334.5 265L335 265.5L336 265.5L336 264.5L336.5 265L337 264.5L337.5 264L337 263L336.5 262.5L337 261.5L336.5 261L337.5 261L338 260.5L338.5 261L339.5 260L340 260.5L340.5 261L343 261L343.5 261.5L344 262L344.5 262.5L345.5 262.5L347 263L347.5 262.5L348.5 262.5L349 263L349.5 263.5L350 264L350.5 264.5L351 265L351.5 265.5L352 266L353 266L352.5 266.5L353.5 266.5L354 266L354.5 265.5L355 266L356 266L356.5 265.5L357 265L358 264L358.5 265L359 264.5L359.5 264L359 265L358.5 265.5L358.5 267.5L359.5 267L360 268L360.5 267.5L361 267L361.5 266L362.5 265L364.5 263L364 264L364 265L365 265L365.5 265.5L366 266L365.5 266.5L365 267L366 267.5L366 268.5L365 268.5L364.5 270L365.5 270L365 271L365.5 271.5L366 272L366.5 271.5L367 272L367.5 272.5L368 271.5L368.5 271L369 270.5L369.5 270L370.5 270L370.5 269L371 268.5L371.5 269L372.5 269L373.5 268.5L374.5 268L375 268.5L376 268L377 267.5L376.5 267L376.5 268L376 267.5L376.5 267L377 266.5L378 266.5L378.5 267L378.5 266L378.5 265L379 265.5L380 266L380.5 265.5L381 265L381.5 264.5L381.5 263.5L383 263.5L383.5 263L384 264L385 264.5L386 264.5L387 264L387.5 263.5L387.5 262.5L387 262L387 261L387 259.5L386.5 258.5L385.5 258L385.5 257L385.5 256L385.5 255L384.5 255L384 254L384.5 253L385 252.5L386 251.5L386.5 251L387 250.5L386.5 250L386 249.5L385.5 249L384.5 249L383.5 248L383 248.5L382.5 249L382 248.5L382 247.5L381.5 246.5L380.5 246.5L381 246L380 246L379 245.5L379.5 244.5L379 243.5L378.5 244L378 245L377.5 244.5L377 245L376 245L375.5 245.5L375.5 244.5L374.5 244.5L374 244L373.5 244.5L373 243.5L373.5 243L373.5 242L372 242.5L371.5 242L370.5 241L369.5 241L369 242L368 242L368 241L367.5 240.5L367 241L366.5 240.5L366.5 239.5L365.5 238.5L366 238L366 237L366 236L366 235L365.5 234.5L365 235L364 236L363 236.5L362.5 236L362 235.5L361.5 235L361 234.5L360.5 235L359.5 234.5L359 235L358 235L357 235.5L356 235L355 235L354 235.5L353.5 235L353 236L352 235L351 234.5L350.5 234L350 234.5L349.5 233.5L349 234L348.5 233.5L347.5 232.5L346.5 232.5L345.5 232.5L345 231.5L344.5 231L344.5 230L343.5 230L343 229.5L343.5 228.5L343 228L342.5 227.5L342 226.5L341.5 226ZM341.5 226L341 226.5L341.5 226Z","x":352.5,"y":250.5},{"name":"湖南省","d":"M350 320L350.5 319.5L351 319L351.5 318.5L351 317.5L351.5 316.5L351.5 315L352.5 315L353 315.5L353.5 315L354 315.5L355 315.5L356 315.5L356.5 316L357 317L357 318L358 318L359 318L359 316.5L359 315.5L359.5 315L359 314.5L358.5 314L358 314.5L358 313.5L359 313L360 313L360.5 312.5L360 312L361 311.5L362 311.5L362.5 312.5L363 313L364 313L364.5 313.5L365.5 313.5L366 313L366.5 313.5L367 313L367 312L368 311L368 310L367.5 309L368 308.5L368 307.5L368.5 307L368.5 306L368.5 305L369.5 305L370 304.5L370.5 304L370 303.5L369 304L368 304.5L367.5 304L368 303.5L368.5 303L368.5 302L369 301.5L369 300.5L369 299.5L368 299L367 298.5L367 297.5L366.5 297L367 296.5L367.5 295.5L367 295L366.5 294.5L366.5 293.5L366 294L367 292.5L367 291.5L367 290.5L365.5 291L364.5 291L365 290.5L364.5 290L365 289.5L364.5 289L364.5 288L365 287.5L365.5 287L366 286L365.5 285L366 284.5L366.5 284L367 283.5L367.5 284L368 283.5L368.5 283L368 282L369 282L369.5 281L370 280.5L370.5 280L370 279.5L370 278.5L369.5 278L369 277.5L369.5 277L369.5 275.5L369.5 274.5L368.5 274L368 273.5L368.5 273L368 273.5L368 272.5L367.5 272L366.5 271.5L366 272L365.5 271.5L365 271L365.5 270.5L365 270L365 269L366 268.5L366 267.5L365.5 267L366 266L365.5 265.5L365 265L364 265L364 264L364.5 263.5L362.5 265L361.5 266L361 266.5L360.5 267.5L360 268L359.5 267L358.5 267.5L358.5 266L359 265L359.5 264L359 264.5L358.5 265L358.5 264L357 264.5L356.5 265.5L356 266L355 265.5L354 265.5L353.5 266.5L352.5 267L353 266L352 266L351.5 265.5L351 265L350.5 264.5L350 264L349.5 263.5L349 263L348.5 262.5L347.5 262.5L347 263L346 262.5L345 262.5L344.5 262L343.5 261.5L343 261L341 261L340 260.5L339.5 260L338.5 260.5L337.5 261L336.5 261L337 261.5L336.5 262L337 263L337.5 263.5L337 264.5L336.5 265L336 264.5L336 265.5L335 265.5L334.5 265L334 264.5L333 264L332 264L331 264L330 264L329.5 264.5L329 265L329.5 266L328.5 265.5L328 266L327.5 265.5L327 266.5L326.5 267L326 268L326.5 268.5L326 269.5L325.5 270L325 270.5L325 271.5L325.5 272L325.5 273L325 274L325 275L325.5 275.5L325 276L324.5 276.5L325 277L325.5 277.5L325 278L325 279.5L325 280.5L326 280.5L326.5 281L326 281.5L325.5 282.5L325.5 283.5L326 283L325.5 284L325.5 285L326 285.5L326 286.5L326.5 287L327 287.5L327 288.5L325.5 289.5L325 290L324 290L323.5 291L323 291.5L322.5 292L322 292.5L321.5 293.5L321 294L321.5 294.5L323 294L324 293.5L323.5 294L324.5 293.5L325 293L326 293.5L326.5 293L327 293.5L327.5 294L328 295.5L326.5 296L327 296.5L327.5 296L327.5 297L328 298L327.5 297.5L326.5 298L325.5 298L326 299L326.5 299.5L326 300L326 301L325.5 301.5L325 302.5L326 303L327 302.5L326.5 303.5L327 304.5L327.5 305L327 305.5L327.5 306L328 305.5L329.5 306L329 306.5L329 307.5L329.5 307L330 307.5L330.5 307L330 306L330.5 305.5L331 305L331.5 304L332.5 304L332.5 305.5L333.5 305.5L334 306L335 306L335 305L336 304L337 303.5L337 302.5L337.5 302L338 302.5L338.5 303L339.5 303L340.5 302.5L340.5 301.5L341 302L341.5 302.5L343 302.5L343.5 303L343.5 304L343.5 305L343 305.5L342.5 306.5L343 307L343.5 307.5L344 307L345 307L345.5 307.5L345 308.5L344.5 309L343.5 309L343.5 310L344 310.5L343.5 312.5L343 313L342 313.5L342 314.5L341 315L341 316L340.5 316.5L340.5 317.5L341 318L342 317.5L342 316.5L343 316L343.5 315.5L344 316L344.5 315.5L345 316L344.5 316.5L345 317L345 318L345.5 319.5L345 320L345.5 320.5L346 321L346.5 320.5L347 319.5L348 319.5L349 319.5L350 320Z","x":347.5,"y":288},{"name":"广东省","d":"M364 348L364.5 347L365 346.5L365 345.5L364.5 346L365 345L365.5 344.5L365.5 343L366 342L366 343L366.5 343.5L367 344.5L367 345.5L368 345L368.5 344.5L369.5 344.5L370 344L370.5 344.5L371 344L371.5 343.5L372 344L372.5 344.5L373 345.5L374 345L373.5 344L373.5 343L373.5 342L374.5 342L375 342.5L375 343.5L376 344L376.5 344.5L376.5 343.5L377 343L377.5 342.5L378 342L378.5 341.5L379 341L379.5 341.5L380.5 341.5L380.5 342.5L381.5 342.5L382.5 343L383 342L382 342L382.5 341.5L383 340.5L383.5 341L384.5 341.5L385 342L385.5 341.5L386.5 341L387.5 341.5L388.5 340L390 340L391 340L391.5 339.5L391.5 338.5L391.5 337.5L392.5 337.5L393 337L394 336.5L393.5 335.5L394.5 334.5L394.5 333.5L395.5 333.5L396 333L396.5 333.5L397 333L397 332L396 331.5L395.5 330.5L395.5 329.5L395 329L395.5 328L395 327.5L395 326.5L395.5 326L395 325.5L394.5 325L394.5 324L394 323L393.5 322.5L393.5 321.5L394 321L393.5 320.5L392.5 321L391.5 321L391 321.5L391 320L390 320L390 319L389.5 318.5L389 319L388.5 319.5L388 318.5L387 318.5L386.5 318L385.5 318L385 318.5L384 319.5L384.5 320.5L385 321.5L384.5 322L383.5 322L383 321L382.5 320.5L381.5 319.5L380.5 319.5L379.5 320L378 320.5L376.5 321L376 322L375.5 321.5L375 322L374.5 322.5L374 321.5L373.5 322L372 322.5L371.5 321.5L370.5 321L369.5 320.5L370.5 320.5L371 320L371.5 319L372 318.5L372 317.5L372.5 317L373.5 316L375 315.5L374.5 315L375 314.5L374.5 313.5L373.5 312.5L372.5 313L371.5 313.5L370.5 314L370 313.5L369 314L368.5 313.5L368 312.5L367.5 312L367 313L366.5 313.5L366 313L365.5 313.5L364.5 313.5L364 313L363 313L362.5 312.5L362 312L361.5 311.5L360.5 312L360 312.5L359 313L358.5 313.5L358 314.5L358.5 314L359 314.5L359.5 315L359 315.5L359 316.5L359 317.5L358.5 318L357 318L357 317L356.5 316.5L356 315.5L355 315.5L354 315.5L353.5 315L353 315.5L352.5 315L351.5 315L351.5 316L351 317L351.5 318L351.5 319L350.5 319.5L350 320L349.5 320.5L349.5 321.5L350 322L350 323L350.5 324L350.5 325L350 325.5L349.5 325L349 325.5L349 326.5L349.5 328L349 329L348.5 328.5L348.5 329.5L348.5 330.5L347.5 330L346.5 330.5L347 331L346.5 332L345.5 332.5L345.5 333.5L345 334L344.5 335L344 335.5L344.5 336L344 336.5L344.5 337L344.5 338.5L345 339L344.5 339.5L344 340.5L343 342L342 342L341.5 342.5L341 343.5L340 343.5L339 344L338.5 345L338.5 346L339 347L338.5 347.5L337.5 348L338 348.5L337 348L336.5 348.5L336 348L335.5 348.5L335 348L335 349L335 350L335.5 351L335 351.5L334.5 351L334 351.5L333 351.5L332.5 352L332 351.5L331.5 352L331.5 353L331 354L330.5 354.5L330 354L329.5 354.5L330 356L331 356.5L330.5 357.5L329.5 357.5L329.5 359L329 360L328.5 362L329 363L329 364L329.5 364.5L329.5 365.5L330 366L330.5 367L331 368L330.5 368.5L331 369L331 370L332 369.5L333 370L334 369.5L334.5 370L335 369.5L336 369L336.5 368.5L337 368L336.5 366L336 365L335.5 364.5L335.5 363.5L335 363L333.5 363L333.5 361.5L334 361L334.5 360.5L335.5 360L336 359.5L336.5 359L337.5 359L338.5 358L339 357.5L340 357.5L341 356.5L342 356.5L343.5 356L343 356.5L343.5 357L344 356.5L344.5 356L345 355.5L345.5 356L346.5 355.5L347 355L347.5 354.5L348.5 355L349.5 354.5L350.5 354.5L350 354L349.5 353.5L350.5 353L351.5 352.5L352 353L353 353.5L354 353.5L354 352.5L355 353L356 353L356.5 352.5L357 351L358 352L359 352L359.5 351L359.5 350L360 349L360.5 350L361 351.5L361.5 352L362 351.5L363 350L364 349.5L364 348.5ZM395.5 334.5L396 335L397 335L397 334L396 334L395.5 334.5ZM358 353L357 353L356.5 353.5L357 354L356.5 354.5L357 355L357.5 354.5L357.5 353ZM355 355L355.5 354.5L356 354L355.5 353.5L355 354L355 355ZM336 359.5L336.5 360L337 360.5L337.5 359L337 359.5L336.5 359L336 359.5ZM336.5 360.5L335.5 360.5L334.5 360.5L334 361.5L333.5 362L334.5 362L335 361.5L336 361.5L336.5 362.5L336.5 361.5L337 360.5ZM393.5 364L394.5 364.5L394 365.5L393 366L394 366L394.5 365.5L395 365L394.5 364L393.5 364ZM337.5 362L337 362.5L337.5 363L337.5 362ZM386 360.5L386.5 361L387 360L386 360ZM385.5 361.5L386 362L386.5 362.5L386 361.5Z","x":363,"y":335.5},{"name":"广西壮族自治区","d":"M327 305.5L326.5 306.5L326 307.5L325.5 308.5L326 309L324.5 309L324 308.5L323.5 308L323 308.5L322.5 309L322 309.5L323 309L323.5 309.5L323 310L323.5 311L323 311.5L322.5 311L321.5 311L321 310.5L320 310L319.5 310.5L320 311L319.5 311.5L319 312L319.5 313.5L319 313L318 312L317.5 311.5L317 311L316 311.5L316 312.5L315.5 312L315 312.5L315 313.5L314.5 314.5L313.5 315L313 315.5L312 315.5L311.5 315L311 314.5L310.5 314L309 314.5L309 313.5L308.5 314L308.5 313L308 312.5L307.5 312L307 311L306.5 310.5L305 311L304.5 311.5L304 312L304.5 313L304.5 314L303.5 314.5L303 315L302 315L301.5 315.5L301 316L300 316.5L299.5 317L298.5 317L298 317.5L297.5 317L297 317.5L297.5 318.5L297 319.5L296.5 320L296 320.5L295.5 321L295 320.5L294 320L293 319.5L292 319.5L291 319L290.5 318.5L289.5 317.5L289 318L288.5 317.5L288 317L287.5 317.5L287 318L286.5 318.5L286.5 319.5L285.5 320L285 320.5L284.5 321L284 321.5L283.5 321L282.5 320.5L282 320L281.5 321L282 322L282.5 322.5L282.5 323.5L283 324L283.5 324.5L283.5 323.5L284 323L285 323L285.5 323.5L287 323L287.5 323.5L288 324.5L288.5 325.5L288.5 326.5L288 327L288.5 327.5L289 327L290 327.5L291 328L291 326.5L292 326.5L292.5 328L293 327.5L293.5 328L294 327.5L294.5 327L295.5 327L296 327.5L296.5 328L297 329.5L296.5 330.5L297 331L297 332L296.5 332.5L297 333L296 333.5L295.5 334.5L295 333.5L294 333.5L293.5 334L292.5 335L292 334.5L292.5 335L292 336L291.5 336.5L291.5 337.5L291.5 338.5L292.5 338.5L293 339L293.5 339.5L294.5 340L295.5 340L296 339.5L297 339.5L298 340.5L299 341L300 340L301 340L301.5 340.5L302.5 341.5L303 342L302.5 342.5L302 344L301 343.5L301 344.5L300.5 345.5L301 346L300.5 346.5L301.5 346.5L301.5 347.5L302 348L301.5 348.5L302 349L302 350L301.5 350.5L302 351L302 350L302.5 350.5L303.5 350.5L304 351L305 351.5L304.5 352L305.5 352.5L306 353L306.5 353.5L307.5 353.5L308 354L308 355L308.5 354.5L309 354L309 355L310 354.5L311 354.5L312 354L312.5 354.5L313 355L313.5 355.5L314.5 356L315.5 355.5L316 355L315.5 356L316.5 355.5L317.5 355.5L319 354L319.5 354.5L320 354L320.5 354.5L321.5 354.5L322 355L323.5 355L324 355.5L323.5 356L323 356.5L323.5 357L324.5 357L325 356.5L326.5 356.5L327.5 356.5L328 356L328.5 355L328.5 356L329 356.5L330 356.5L329.5 355L330 354L330.5 354.5L331 354L331.5 353L331.5 352L332 351.5L332.5 352L333 351.5L334 351.5L334.5 351L335 351.5L335.5 351L335 350.5L335 349L335 348L335.5 348.5L336 348L336.5 348.5L337 348L337.5 348.5L338 347.5L338.5 347L338.5 346L338 345L339 344.5L338.5 344L340 344L340.5 343.5L341.5 343L341.5 342L342.5 342L344 340.5L344.5 340L344 339.5L344.5 339L345 338.5L344.5 337.5L344 336.5L344.5 336L344 335.5L344.5 335L344.5 334L345.5 333.5L345.5 332.5L346 332L347 331L346.5 330.5L347 330L348.5 330.5L348.5 329.5L348.5 328.5L349 329L349.5 328.5L349 327L349 326L349.5 325L350 325.5L350.5 325L350.5 324L350 323.5L350 322.5L350 321.5L349.5 321L349.5 320L349 319.5L348 319.5L347 319.5L346.5 320L347 320.5L346 321L345.5 320.5L345 320L345.5 319.5L345 318.5L345 317.5L344.5 316.5L345 316L344.5 315.5L344 316L343.5 315.5L343 316L342 316.5L342 317.5L341 318L340.5 317.5L340.5 316.5L341 316L341 315L342 314.5L342 313.5L342.5 313L343.5 312.5L344 311L343.5 310L343.5 309L344.5 309L345 308.5L345 307.5L344.5 307L343.5 307.5L343 307L342.5 306.5L343 305.5L343.5 305L343.5 304L343.5 303L343 302.5L341.5 302.5L341 302L340.5 301.5L340.5 302.5L339.5 303L338.5 303L338 302.5L337.5 302L337 302.5L337 303.5L336.5 304L335 305L335 306L334 306.5L333.5 305.5L332.5 305.5L332.5 304.5L332 304L331 304.5L330.5 305.5L330 306L330.5 307L330 307.5L329.5 307L329 307.5L329 306.5L329.5 306L328.5 305.5L327.5 306L327 305.5ZM323.5 361.5L324 361L323.5 361.5Z","x":321,"y":330},{"name":"海南省","d":"M333 372L332 372.5L331 372.5L330 372.5L329 372.5L328 372.5L327.5 373L327.5 374L326.5 373.5L325.5 373.5L325 374L324 375L324.5 375.5L324 376L323 376.5L322.5 377L322 378L321.5 378.5L320.5 379L320 379.5L319 380.5L319 382L319 383L319.5 383.5L319.5 384.5L319 385L319.5 386.5L319.5 388.5L319.5 389.5L320 390L321.5 390L322 390.5L323 391L324 391.5L324.5 392L325.5 392L326 392.5L327 392.5L327.5 393L329 393L329.5 392.5L330 391L331 390.5L332 390.5L333 389L334 388.5L335 387.5L336.5 387.5L336.5 386.5L337 386L337 385L337.5 382L338 380.5L338.5 380L339 379L339.5 378.5L340 378L341 377L341.5 376.5L341.5 375L341 374L340.5 372.5L339 372L338.5 371.5L338 370.5L337 371.5L335.5 371.5L334.5 371.5L333 371.5ZM352 551.5L352.5 551L352 551.5ZM361.5 504.5L362 503.5L361.5 504.5L362.5 504L362.5 503L362 504L361.5 504.5ZM350 552L350.5 551.5L350 552ZM345 405L346 404.5L345.5 405L346 404.5L345 405ZM402 426L402 427L403 427L402 426.5L402 425.5L402.5 426L403 426.5L402.5 426L402 425.5ZM347.5 414.5L348.5 414.5L348 414L347.5 414.5ZM347 414L346 414.5L346.5 415L347 414.5L346.5 415L347 414ZM367.5 510L368 511L369.5 510.5L371 510L371.5 509.5L372 509L372.5 508L373 507L373 506L372 506L370.5 507L370 508L369 509L368.5 509.5L367.5 509.5ZM368 496L368.5 496.5L368 496ZM368 496.5L368.5 497L368 496.5ZM350 413.5L350.5 413L350 413.5ZM347.5 412L348 411.5L347.5 412ZM370 497L370.5 497.5L370 497ZM374.5 479.5L375 480L374.5 479.5ZM385 486.5L385 487.5L385.5 487L385.5 486L385 486.5ZM374 484L374.5 484.5L374.5 483.5L374 484ZM366 509.5L366.5 510L366 509.5ZM327 513L327.5 513.5L328 512.5L328.5 511.5L329 511L330 511L331.5 511L331 510.5L330 510.5L328.5 510.5L327.5 512L327 513ZM389 496L389.5 495.5L389 496ZM354.5 417L355.5 416.5L354 416.5L354.5 417ZM355 496.5L356 496.5L355.5 496L355 496.5ZM372.5 474L373.5 474L373 473.5L372.5 474ZM353.5 413.5L354 414L354.5 413.5L353.5 413.5ZM391 479L390.5 479.5L391 480L392 480L391 479.5L391.5 479ZM353 407L353.5 406.5L353 406L353 407ZM382 484.5L382.5 485L382 484ZM373 504.5L374 504L373 504.5ZM379 501.5L379.5 502L380 501.5L379 501.5ZM367 505.5L367.5 506L368 506.5L367.5 505.5ZM381.5 490L381.5 491L381.5 490ZM390.5 492.5L391 493L390.5 492.5ZM365 495L366 494.5L365 494.5ZM374.5 472.5L375.5 471.5L375 471L374.5 472ZM374 467.5L374 466.5L374 467.5ZM376.5 474L377 473.5L376.5 474ZM346 411.5L346.5 412L346 411.5ZM331.5 507.5L332.5 507.5L332.5 506.5L331.5 507ZM393 467L393.5 467.5L393 466.5ZM354.5 411.5L355.5 411L354.5 411.5ZM348 416L348.5 416.5L348 416ZM367 483.5L367 482L367 483.5ZM374.5 415L375.5 414.5L374.5 414.5ZM386 491L386.5 491.5L386 491ZM365 492L365.5 492.5L365 492ZM374.5 510.5L375 510L374.5 510.5ZM372.5 475.5L373.5 475L373 474.5L372.5 475.5ZM402.5 475L403 474.5L402.5 475ZM370.5 481L371 480.5L370.5 481ZM374.5 467L375 467.5L374.5 467ZM392 478L393 478L392 478ZM336 504.5L337 504.5L337.5 504L336 504.5ZM345 500L345.5 499.5L345 500ZM379.5 500L380 500.5L379.5 500ZM361 505L361.5 504.5L361 505ZM370 416.5L371 416.5L370 416.5ZM382 500.5L382.5 500L382 500.5ZM346 511L346.5 510L346 511ZM347 498L347 499L347.5 498.5L347 498ZM353 495.5L353.5 495L353 495.5ZM390.5 485.5L391 486L390.5 485.5ZM349.5 505L350 504.5L349.5 505ZM398 476L399 476L399.5 475.5L398 475.5ZM376 514L375.5 514.5L376 514ZM357.5 495.5L358 496L357.5 495.5ZM347 509.5L347.5 509L347 509.5ZM373.5 496.5L374.5 496L373.5 496.5ZM376 506L376.5 506.5L376.5 505.5L376 506ZM364.5 517L365 517.5L364.5 517ZM392.5 413L393 413.5L392.5 413ZM398.5 482.5L399 483L398.5 482.5ZM359 378.5L359.5 378L359 378.5ZM366.5 382L367.5 381.5L367 381L366.5 381.5ZM346.5 506.5L347 507L347.5 506.5L346.5 506.5ZM358 507.5L358.5 507L358 507.5ZM355.5 533L355.5 534L356 533.5L355.5 532.5ZM380.5 439.5L381 440L381.5 439.5L380.5 439.5ZM355 538L355.5 537.5L355 538ZM352 420.5L352.5 420L352 420.5ZM355.5 535L356.5 534.5L355.5 534.5ZM377 511L377.5 511.5L377 511ZM346 508L346.5 507.5L346 508ZM367.5 418.5L368 419L367.5 418.5ZM354.5 488.5L355 489L354.5 488.5ZM369.5 490.5L370 491L369.5 490.5Z","x":329.5,"y":381.5},{"name":"重庆市","d":"M299 278L300 278L299.5 277L300 276.5L300.5 276L300 275.5L299.5 274.5L300.5 275.5L301 276L301.5 276.5L301 277L300.5 278L302 278.5L302 277.5L302.5 277L303.5 277L303.5 276L303 275.5L303.5 275L304 274.5L304.5 275L304.5 274L306 274L306.5 274.5L307 275.5L307.5 274.5L308.5 273.5L308 272.5L308 271.5L308.5 271L308 270.5L309 270.5L309.5 270L310 271L311 271L311.5 270.5L312 271L311.5 272L312 272.5L312.5 273L313 272.5L314 272L314.5 271.5L315 272L316 272L316.5 273L317 273.5L317 274.5L317 275.5L316.5 276L317.5 276.5L318 277L319 276.5L319.5 277L319 277.5L319 278.5L319 279.5L319.5 280L320 279.5L319.5 278.5L320 278L320.5 278.5L320.5 279.5L320.5 280.5L320.5 281.5L321 281L321.5 281.5L323 282L323.5 281.5L324 280.5L324 279L324.5 278.5L325 278L325.5 277.5L325 277L324.5 276.5L325 276L325.5 275.5L325 275L325 274L325 273L325.5 272.5L325 271.5L324.5 271L324 270.5L323.5 270L324 269.5L324 268.5L323.5 268L323 268.5L322.5 269L322 268L321.5 267.5L321.5 266.5L322 266L321.5 265.5L321 265L320.5 265.5L320 265L320 263.5L319.5 263L318.5 263.5L318.5 264.5L318 265L317.5 264.5L317.5 263.5L318 263L318.5 262L318.5 261L319 260L318.5 259.5L319 258.5L318.5 258L318 257.5L317.5 257L317.5 256L318.5 256L319 256.5L319.5 255.5L320 255L320.5 256L321.5 256L322 255.5L322.5 254.5L323.5 254.5L323.5 255.5L324.5 255.5L325 255L325.5 254.5L326 255.5L326.5 255L327.5 254L328 254.5L328.5 253.5L329 253L330 252L331 251.5L331.5 252L332 251.5L332 252.5L333 251.5L333.5 250.5L333 250L333 249L333.5 248.5L333 247.5L333.5 247L333 246L332 245.5L331.5 245L331 244.5L329.5 244.5L329.5 243.5L329.5 242.5L328.5 242.5L327.5 242.5L326 242.5L325.5 242L324.5 241.5L324 240.5L323.5 240L322.5 239.5L321.5 239L320.5 238.5L320 238L319 237.5L318.5 237L318 237.5L317.5 237L317 237.5L318 238.5L317 238.5L316.5 239L317 239.5L316 239.5L317 241L317.5 241.5L318 242L318.5 242.5L318 243.5L317 244L316.5 244.5L316 245L315.5 245.5L315 246.5L314.5 247.5L314 248L314 249L314 250L313.5 250.5L313 251.5L312.5 252.5L311.5 252.5L311.5 251.5L311 252L310.5 252.5L310 252L309 252L308.5 253L309 254L309.5 254.5L309 255L308.5 255.5L308 256.5L307.5 257L307 258L306.5 259L305.5 260.5L305 261L304.5 260.5L304 261L303 261L302.5 261.5L302 261L301.5 260L301 259.5L301.5 259L301 258.5L300.5 258L300 258.5L299.5 258L299 259L298 259.5L297 259L297 258L296 258L295 257.5L294.5 257L294 256.5L293.5 257L293 257.5L293 258.5L292 258.5L292.5 259L292 259.5L291 260L292 260L292.5 261L293 261.5L293 262.5L293 263.5L292 263.5L291.5 264.5L291 265L290 265L289.5 265.5L289 266.5L289.5 267.5L290 268L290 269L290.5 269.5L291.5 269.5L292.5 270L293 270.5L293 271.5L293.5 272L293.5 273L294 273.5L295 273L296 273L296.5 274L297 273.5L298 274.5L298 275.5L298 276.5L298.5 277.5L299 278Z","x":312.5,"y":261},{"name":"四川省","d":"M251.5 292.5L251.5 293.5L251 294.5L252 295L252.5 295.5L253 296L253.5 296.5L253.5 297.5L254 298L254 297L254.5 297.5L254 298L254.5 298.5L254 299L253.5 299.5L254 300L254.5 300.5L255 301L256 301.5L256 302.5L255.5 303L256.5 303L257 304L257.5 305L258 305.5L258.5 305L259.5 305L260.5 304.5L261.5 304L262.5 303L263 302.5L264 302L265 302L264.5 303L265 303.5L266 303L266.5 302.5L267 302L268 302L268 300.5L268.5 300L268.5 298.5L268 297.5L268 296.5L267 296L267 295L267.5 293.5L267.5 292.5L267 292L267.5 291.5L267.5 290.5L268.5 290.5L269.5 290L270 289L270.5 288.5L271 288L271.5 287.5L272 287L272.5 286L273 285.5L273 284.5L272.5 283.5L272 283L272.5 282.5L273 282L273.5 281L274.5 281L275.5 280.5L276 280L275.5 279L275.5 278L276 277L276.5 276.5L277 277L278 277L278.5 276.5L279.5 276.5L280 277L280.5 276.5L281 277L280.5 277.5L279.5 278L279.5 279.5L280 280L281 280L281.5 280.5L281.5 281.5L281 282L281.5 282.5L280.5 283L280 283.5L281 284.5L282 285L282.5 285.5L283.5 285L284.5 285L285.5 284.5L286 283.5L286.5 283L287 282.5L287.5 283L288 283.5L288.5 284L289 284.5L288.5 285L289 286L289 287L289.5 286.5L290.5 286L291 286.5L291.5 287L292 287.5L292.5 287L293.5 287L294.5 286.5L295.5 286.5L296 286L297 286.5L298.5 286L298.5 285L298 283.5L297.5 282L296.5 282L295 282.5L294 282L294.5 281L294 280.5L293.5 280L293 280.5L292 280L292.5 279.5L292 279L292 278L292.5 277L293.5 277L294.5 277L295 276L295.5 275.5L296 276L296.5 276.5L297 277L298 277.5L298.5 278.5L299 278L298.5 277.5L298 276.5L298 275.5L297.5 274.5L297.5 273.5L296.5 274L296 273.5L295.5 273L294.5 273.5L294 273L293.5 273.5L293.5 272.5L293 272L293 271L293 270L292.5 269.5L291.5 269.5L290.5 269.5L290 269L290.5 268L290 267.5L289 266.5L289.5 266L290 265.5L290.5 265L291 264.5L291.5 263.5L293 263.5L293 262.5L293 261.5L292.5 261L292 260.5L291.5 260L292 259.5L292.5 259L292 258.5L293 258.5L293 257.5L293.5 257L294 256.5L294.5 257L295 257.5L296 257.5L296.5 258L297 259L297.5 259.5L298 259L299 259L299.5 258.5L300.5 258L301 258.5L301.5 259L301 259.5L301.5 260L302 260.5L302.5 261.5L303 261L304 261L304.5 260.5L305 261L305.5 260.5L306.5 259L307 258.5L307.5 257L308 256.5L308.5 255.5L309 255L309.5 254.5L309 254L308.5 253.5L309 252.5L310 252L310.5 252.5L311 252L311.5 251.5L311.5 252.5L312.5 252.5L313.5 251.5L313 250.5L313.5 250L314 249.5L313.5 249L314.5 248L314 247.5L315.5 246.5L315.5 245.5L316 245L317 244.5L317.5 243.5L318.5 243L318 242.5L318.5 242L318 241.5L317 241L316 239.5L317 239.5L316.5 239L317 238.5L318 238.5L317.5 237.5L318.5 237L318 236.5L317 236.5L316.5 237L316 236.5L315.5 237L315 236.5L314 237L313.5 237.5L313 237L312 236.5L311.5 235.5L310.5 235L309.5 235L309 234.5L308.5 234L308 233.5L307.5 234L307 234.5L306.5 234L305.5 234L305.5 232.5L305 231.5L304 231.5L303 231.5L302.5 231L301.5 231.5L301 232L300 232L299.5 232.5L298.5 232L298 231.5L297 231.5L296 231L296.5 230L296 229.5L295.5 230L294.5 230L294 230.5L293.5 231L292.5 231.5L291.5 231L291 230.5L291 229.5L290.5 229L290 229.5L290.5 230.5L289.5 231.5L289 232L288.5 232.5L287.5 232.5L286.5 232L285.5 232.5L285 232L284 232.5L283.5 232L282.5 231.5L282 231L280.5 230L280 229.5L280.5 229L281 228.5L280.5 228L280.5 227L280.5 225.5L280 225L280.5 224.5L281 225L280.5 224.5L280 224L279.5 223.5L279 223L278.5 222L279 221.5L278 221L277.5 220.5L277 221L276 220.5L275.5 221L274.5 220.5L273.5 220.5L273 221L273 220L272.5 219.5L272 220L270.5 219.5L269.5 219.5L270 218L269.5 217.5L269.5 216.5L269.5 215.5L269 215L268 215L267.5 214L266.5 214L266 214.5L265.5 215L265 215.5L264.5 216L263.5 216.5L263 216L263 217L262.5 217.5L262 217L261.5 217.5L260.5 217.5L261.5 218.5L261.5 219.5L262 220L261.5 220.5L262 220L262 221L262.5 221.5L263 222L263.5 222.5L263 223L262.5 223.5L262 224L261.5 223.5L261 224.5L261 225.5L260.5 225L260 225.5L259.5 226L258.5 226L258 226.5L257.5 227L257.5 226L257 225.5L258 224.5L258.5 223.5L258 223L258.5 222L257.5 221.5L257 222L257 223L256.5 223.5L256 224L256 225L256.5 226L256 226.5L255 226.5L254.5 226L253.5 225.5L253.5 226.5L252.5 225.5L251.5 225L251 226L251.5 227L251.5 228L251 228.5L251.5 229.5L252 230L252 231.5L251.5 232L250.5 232L250 232.5L249 232.5L248.5 232L247 232L247.5 232.5L247 233.5L246.5 233L245.5 232.5L245 231.5L244.5 231L244 231.5L243.5 231L243 231.5L243 232.5L242 232L242 230.5L241.5 229.5L240.5 229L240 227.5L240 228.5L239.5 229L239 228.5L239 229.5L238.5 231L237.5 230.5L237 230L236 230L235 229.5L234 229L233.5 228L233 227.5L232 227L231 227L230.5 226.5L230 226L230 225L230 224L229.5 223.5L229.5 222.5L228.5 222L228.5 221L228 220L227.5 219.5L227 219L226.5 218.5L226.5 217.5L226.5 216.5L226 216L225 216L224 216L223 216L222.5 215L221 215L220.5 215.5L219.5 215.5L220 216.5L219.5 217L219.5 218L218.5 218L218 218.5L217 218.5L217.5 219L217.5 220L217.5 221.5L218.5 222L218.5 223L219.5 223L220 223.5L220 224.5L219 225.5L218.5 226L218 226.5L218.5 227L218.5 228L217.5 228.5L217 229.5L217 230.5L217.5 231.5L218 232L218.5 232.5L219 233L220 233.5L221 233.5L221.5 234L223.5 234.5L224 235L224.5 235.5L225 236.5L225.5 238L226 238.5L226.5 239L226.5 240L226.5 241L227 241.5L227.5 242L228 243L228.5 244L229 244.5L230.5 245.5L231 246.5L230 247L229 246.5L228.5 247L228 247.5L228.5 248L228 248.5L229 248.5L229 249.5L229.5 250L230 250.5L230 251.5L230.5 252L231 253L231.5 253.5L231 254L231 255L231.5 256.5L231.5 258L232 259L231.5 259.5L232 260.5L232.5 262L232 263L232 264L232 265L232 266L232.5 266.5L232 267L232.5 268L232.5 269L233 270L233 271L233 272L233 273L233 274L233 275L233 276L233.5 277L233.5 278L233.5 279L234 280L234.5 280.5L235 281.5L235.5 280.5L236 279.5L235.5 279L235.5 277.5L236.5 277L236.5 276L237.5 275.5L237.5 274.5L238.5 274.5L238.5 275.5L239 276L239.5 276.5L240 277L241 278L241.5 279L242 280L242.5 280.5L242.5 281.5L241.5 281.5L241 282L241.5 282.5L241.5 283.5L242.5 284.5L243 285L243.5 285.5L243.5 287L244 286.5L244.5 286L245 285L245.5 285.5L246 286L246.5 285.5L246.5 284.5L247.5 285.5L248 286.5L248.5 287.5L249 289L249 290L249.5 289.5L250 291L250 292L250.5 292.5L251.5 292.5Z","x":265.5,"y":254},{"name":"贵州省","d":"M325 278L324.5 278.5L324 279L324 280L323.5 281L323 281.5L322 281.5L321 281L320.5 281.5L320.5 280.5L321 279.5L320.5 279L320 278L319.5 278.5L320 279L319.5 279.5L319 280L319 279L319 278L319 277L318 276.5L316.5 276L317 275.5L317 274.5L317 273.5L316.5 273L316.5 272L316 271.5L315.5 272L314.5 271.5L314 272L313 272.5L312.5 273L312 272.5L311.5 272L312 271L311.5 270.5L311 271L310 271L309.5 270L309 270.5L308 270.5L308.5 271L308 271.5L308 272.5L308.5 273L308 274.5L307 275L306.5 274.5L306 274L304.5 274L304.5 275L304 274.5L303.5 275L303 275.5L303.5 276L303.5 277L302.5 277L302 277.5L302.5 278.5L301 278L300.5 278.5L301 277.5L301.5 277L301 276.5L300.5 275.5L300 274.5L299.5 275.5L300.5 276L300 276.5L299.5 277L300 277.5L299 277.5L299 278.5L298 278L297 277L296.5 276.5L296 276L295.5 275.5L295 276L294.5 276.5L293.5 277L292.5 277L292.5 278L292 279L292.5 279.5L292 280L292.5 280.5L293.5 280.5L294 281L294 282L294.5 282.5L295 282L296.5 282L297.5 282L298 283L297.5 283.5L298.5 284.5L298 285L298.5 285.5L297.5 286.5L296.5 286L295.5 286.5L294.5 286.5L294 287L293 287L292 287.5L291.5 287L291 286.5L290.5 286L289.5 286.5L289 287L289 288L288.5 288.5L288.5 289.5L288 291L287.5 290L286.5 290.5L285.5 291L285 291.5L284 291L283 291.5L282.5 291L282 290L280.5 289.5L280 290.5L279.5 291L279 291.5L278.5 291L277.5 290.5L277 290L276.5 290.5L276 291L275.5 292L275 292.5L274.5 293.5L274 294L274 295L274.5 294.5L275 295L275 296L274.5 297L275 297.5L275 298.5L275 299.5L275.5 300L277 300L278 300L278.5 299L279.5 299L280.5 299L281 298.5L281.5 299L282.5 299.5L283 300.5L283.5 301L283.5 302L282.5 302.5L282 303L282.5 303.5L282 304L282 305L281.5 306L281 307L281.5 307.5L281 308.5L280.5 309L280 310L280.5 310.5L281 311.5L282 311L282 312.5L283 313L283.5 313.5L284 314L285 314.5L284.5 315L284 314.5L283.5 315.5L283 316.5L284 317L283.5 317.5L283 318L282.5 318.5L282 319L282 320L282.5 320.5L283 321L284 321.5L284.5 321L285 320.5L285.5 320L286.5 319.5L286.5 318.5L287 318L287.5 317.5L288 317L288.5 317.5L289 318L289.5 317.5L290.5 318L291 319L291.5 319.5L292 319L293 319.5L293.5 320L294 320.5L295 320L295.5 321L296 320.5L296.5 320L297 319.5L297.5 318.5L297 317.5L297.5 317L298 317.5L298.5 317L299.5 317L300 316.5L300.5 316L301.5 315.5L302 315L303 315L303.5 314.5L304 314L304.5 314.5L304.5 313L304 312L304.5 311.5L305 311L306 310.5L306.5 311L307.5 312L308 312.5L308.5 313L308.5 314L309 313.5L309 314.5L310 314L310.5 313.5L311 314.5L311.5 315L312 315.5L313 315.5L313.5 315L314.5 315L315 314L315 312.5L315.5 312L316 312.5L316 311.5L316.5 311L317 311.5L317.5 312L319 313L319.5 313.5L319 312L319.5 311.5L320 311L319.5 310.5L320 310L321 310L321 311L322.5 311L323 311.5L323.5 311L323 310.5L323.5 309.5L323 309L322.5 309.5L322 309L322.5 308.5L323.5 308.5L324 308L324 309L324.5 308.5L325.5 309L326 308L326.5 307L327 306L327 305L327.5 304.5L326.5 303.5L327 302.5L326 303L325.5 302.5L325.5 301.5L326 301L326 300L326.5 299.5L326 298.5L325.5 298L326.5 298L327 297.5L327 296.5L326.5 296L328 295.5L327.5 294L327 293.5L326.5 293L326 293.5L325 293.5L324 294L323 293.5L322 294.5L321 294L321.5 293.5L322 293L322.5 292L323 291.5L323.5 291L324 290L325 290L325.5 289.5L326.5 288.5L327 288L326.5 287L326 286.5L326 285.5L325.5 285L325.5 284L326 283.5L325.5 282.5L326 282L326 281L325.5 280.5L325 280L325.5 279.5L325 278.5ZM327 296.5L327 297.5L327.5 297L327.5 296L327 296.5ZM327.5 297.5L328 298L327.5 297.5Z","x":303.5,"y":297},{"name":"云南省","d":"M289 287L289 286L288.5 285.5L289 284.5L288.5 283.5L288 284L288 283L287 282.5L286.5 283L286 283.5L285.5 284L285 285L284 285L283 285.5L282 285L281.5 284.5L280.5 283.5L280 283L281 282.5L281.5 282L281 281.5L281.5 281L281 280.5L280.5 280L280 280.5L279.5 279.5L279.5 278L280 277.5L280.5 277L280 276.5L279 276.5L278 277L277 277L276.5 276.5L276 277L275.5 277.5L275.5 278.5L276 279.5L275.5 280.5L275 281L274.5 281.5L274 281L273 282L272.5 282.5L272 283L272.5 283.5L273 284L273 285.5L272.5 286L272 287L271.5 287.5L271 288L270.5 288.5L270 289L269.5 290L269 290.5L268 290.5L267.5 291.5L267 292L267.5 292.5L267.5 293.5L267 294.5L267 296L267.5 296.5L268 297.5L268.5 298L268 298.5L268.5 300L268 300.5L268 301.5L267 302L266.5 302.5L266 303L265.5 303.5L264.5 303L265 302.5L264.5 302L263 302.5L262.5 303L261.5 303.5L260.5 304.5L260 305L258.5 305L258 305.5L257.5 305L257 304.5L257.5 304L256.5 303.5L255.5 303.5L255.5 302.5L256 302L255 301L254.5 300.5L254 300L253.5 299.5L254 299L254.5 298.5L254 298L254.5 297.5L254 297L254 298L253.5 297.5L253.5 296.5L253 296L252.5 295.5L252 295L251 294.5L251.5 294L251.5 293L251 292.5L250 292L250 291L249.5 290L249 289L248.5 288L248 287L247.5 286L247 284.5L246.5 285.5L246 286L245.5 285.5L245 285L244.5 286L244 286.5L243.5 287L243.5 286L243 285L242.5 284.5L242 283.5L241.5 282.5L241 282L241.5 281.5L242.5 281.5L242.5 280.5L242 280L241.5 279.5L241 278.5L240 277L239.5 276.5L239 276L238.5 275.5L238.5 274.5L237.5 274.5L237.5 275.5L237 276L236.5 277L236 277.5L235.5 278.5L236 279.5L235.5 280L235 281.5L234.5 281L234 280L233.5 279.5L233.5 278L233.5 277L233 276.5L233 275.5L233 274.5L233 273L233 272L233 271L233 270L232 270.5L231.5 271L232 272L231 273L231 274L231.5 274.5L231 275L230.5 274.5L230 273.5L230 272.5L229 273L228.5 273.5L229 274.5L229 275.5L228 276.5L228.5 277.5L228.5 278.5L229 279L229.5 280L229 280.5L228.5 281.5L227 282L226.5 282.5L226 281.5L226 280.5L225.5 280L224.5 280L225 281L224.5 281.5L224 282L224 284L224.5 284.5L224.5 285.5L225 287L225.5 287.5L225.5 288.5L226 289L226.5 288.5L226.5 287.5L227 288L228 287.5L228 288.5L229 288.5L229 289.5L229 290.5L229.5 291L229 292L229.5 292.5L229 293.5L229.5 294.5L229.5 296L229.5 297L229.5 298L230 299L229.5 299.5L229.5 300.5L229.5 302L229 302.5L229 303.5L229.5 304L228.5 305L228 304.5L228 305.5L228.5 306.5L229 307L229 308L228 307.5L227 308.5L227 309.5L226.5 310.5L225.5 310.5L224.5 310L224 311L224 312L224 313L223.5 312.5L223.5 313.5L223 314L222 314.5L221.5 314L221 315.5L220.5 316L220 317.5L220.5 318L221 318.5L220.5 319L219.5 319.5L218.5 320L219 320.5L219 321.5L218.5 322.5L219 323.5L219.5 323L220 323.5L219.5 324.5L220 325L220.5 325.5L220.5 326.5L220 327L219.5 327.5L219 328.5L218.5 329L219.5 329.5L220.5 329.5L221 328.5L222 328.5L222.5 328L223.5 327L224.5 327L226 327L227 327L227.5 326.5L228 327L229 327L229.5 326.5L230.5 326.5L231 327L230 328L229.5 328.5L229 329L229 330L230 330.5L230 331.5L230.5 332L231 332.5L230.5 333L230 334L231 334.5L230.5 335.5L231 336L231 337L232 337.5L232.5 338L233 338.5L233.5 338L234 338.5L234.5 338L235.5 338L236 338.5L236.5 339L237 340L236.5 340.5L236 340L236 341L235.5 342L234.5 342L235 342.5L235.5 344L235 344.5L235.5 345L234.5 346L234 347L233.5 347.5L233.5 348.5L234 349L235 349.5L235.5 349L236.5 349L237.5 349L238 349.5L239 349.5L239.5 350L240.5 349.5L241 350.5L240.5 351.5L240.5 352.5L241 353.5L241.5 354L242 353.5L242.5 354L242 355L242 356L242.5 355.5L243 356L244 355.5L245 355.5L245.5 356.5L247 356L247.5 355.5L248 355L248.5 354.5L249 354L249.5 353.5L251 353L251 354L251.5 355L252 356L251.5 357L252 358L252 359L252.5 359.5L253.5 359L255 358.5L255.5 359L256 359.5L256.5 360L257 359L257.5 358.5L257 358L256.5 357.5L257 357L256.5 356L257 355.5L257.5 355L257 354.5L257 353.5L257 352L256.5 351.5L256 351L255.5 350.5L255 349L255.5 348.5L255 347.5L255.5 347L256 346L256 345L257 344.5L257.5 345.5L258 346L258.5 345.5L259.5 345L260.5 345.5L261.5 345.5L262 344L263 343.5L262.5 343L263 342.5L263.5 342L264.5 342.5L265.5 342.5L266.5 343.5L267 344L267.5 345L268.5 345.5L269 345L270 344L270 343L271 343L271 342L271.5 341.5L272 342L272.5 343L273 343.5L273.5 343L274 341.5L275 342.5L275.5 343.5L276 344L277 345L277.5 344.5L277.5 343.5L277.5 342L278.5 341.5L279.5 341L280 342L280.5 342.5L281 342L282 341.5L282.5 341L283.5 341.5L284 341L284.5 340.5L285 340L284.5 339L284.5 338L285.5 337.5L286 337L287 336.5L288 336L288.5 336.5L288.5 335.5L289.5 335L290 335.5L290.5 336L291 337L291.5 336.5L292 336L292.5 335.5L292 334.5L292.5 335L293.5 334L294 333.5L295 333.5L295.5 334L296 333.5L297 333L296.5 332.5L297 332L297 331L296.5 330.5L297 330L296.5 328.5L296 327.5L295.5 327L294.5 327L294 327.5L293.5 328L293 327.5L292.5 328L292 326.5L291 326.5L291 328L290 327.5L289.5 327L289 327.5L288 327L288.5 326.5L288.5 325.5L288 325L287.5 324L287 323L286 323.5L285 323L284 323L283.5 323.5L284 324.5L283 324L282.5 323.5L282.5 322.5L282 322L281.5 321L282 320L282 319L282.5 318.5L283 318L283.5 317.5L284 317L283.5 316.5L283.5 315.5L284 315L285 315L284.5 314.5L284 314L283.5 313.5L283 313L282.5 312.5L282.5 311L281.5 311.5L281 312L281 310.5L280 310L280.5 308.5L281 307.5L281.5 306.5L281.5 305L282 304.5L282.5 303.5L282 303L282.5 302.5L283.5 302L283.5 301L283 300.5L282.5 300L281.5 299.5L281 298L280.5 299L279.5 299L278.5 299L278 299.5L277.5 300L276 300L275 299.5L275 298.5L275 297.5L274.5 297L275 296.5L275.5 296L275 295.5L275 294.5L274 295L273.5 294L274 293.5L275 292.5L275.5 292L276 291.5L276.5 291L276.5 290L277.5 290L278 291L279 292L279.5 291.5L280 290.5L280.5 289.5L281.5 290L282 291L283 291.5L284 291L284.5 291.5L285 291L286.5 290.5L287 290L288 290.5L288.5 290L288.5 289L289 288L289 287Z","x":254.5,"y":317},{"name":"西藏自治区","d":"M147.5 194L146.5 193.5L145.5 193.5L144.5 192.5L143.5 192.5L143 191.5L142.5 192L141.5 191.5L140.5 191.5L140 191L139 191L138 191L137.5 190.5L137 190L136 189.5L135 189.5L134 189.5L133.5 190L132.5 190L131.5 190L131 190.5L130 190.5L129.5 191L128.5 191L127 191L126.5 190L126 190.5L125.5 191L124.5 191L124 191.5L123 191.5L122 192L121.5 191.5L120.5 191.5L120 192L119 192.5L118 192.5L117 192.5L116 193L115.5 193.5L115.5 194.5L115 195L114.5 196L114 196.5L113 197.5L112 197.5L111 197.5L110.5 198L110 199L109.5 198.5L108 198.5L107.5 197.5L106 198L105 197.5L104.5 198L104 198.5L102.5 199L101 199.5L100 200L99.5 201L98.5 201.5L97.5 202L96.5 202L96 201.5L94.5 201.5L93.5 202L92.5 202L92 202.5L91.5 202L90.5 202L89.5 201.5L88.5 201.5L87.5 201.5L87 201L86.5 200.5L86 200L86 199L85.5 198.5L84.5 198.5L84 199L83 198.5L82 198L81 198L81 199L80.5 199.5L80 200L79.5 200.5L78 201L77.5 201.5L77.5 202.5L76.5 203L75.5 203L74.5 203.5L73 203.5L72 202.5L71.5 202L71 202.5L70 202.5L69.5 202L69 201.5L68.5 202L68 202.5L67 202.5L66 202.5L65.5 202L65 201.5L64 201.5L63 201.5L62 201.5L61.5 202L61.5 203L62.5 203.5L61.5 204L61 204.5L60 205.5L59.5 206L59.5 207L59 207.5L58.5 208L58 209L58 210L57.5 211L58 211.5L57.5 212L56.5 212L55.5 212L54.5 212L53.5 212.5L53 212L52.5 212.5L51.5 212.5L50.5 212.5L50.5 213.5L49.5 214.5L49.5 215.5L48.5 215.5L47.5 216L47 217L47.5 217.5L48 218L48 219L48 220L47 220.5L47.5 221.5L48.5 223L49 223.5L49.5 224L50 224.5L50.5 225.5L51 226L51.5 226.5L51.5 228L52 228.5L52.5 229L52 229.5L52 230.5L52.5 231L52.5 232L53 232.5L52.5 233L51.5 233.5L51 234L51 235L50 235L49.5 235.5L49 235L48.5 234.5L48 234L48 233L47.5 232L46.5 232.5L45.5 232.5L45 233L44.5 233.5L45 234L45 235L45.5 235.5L45 236.5L45 238L45.5 237.5L46.5 238.5L47.5 239.5L48 240L47.5 240.5L47 241L47.5 242L48 243L48.5 243.5L48 244.5L47.5 245L48 245.5L48 246.5L48.5 247L49 247.5L49.5 248L50 248.5L50 250L51 250.5L52 250.5L53 251L53 250L53.5 249.5L54 250L55 251L55.5 251.5L56 251L57 251L57.5 252L58.5 252.5L58.5 253.5L59 254L59.5 255L60.5 255.5L61 255L62 255.5L62.5 256L63.5 256L64 256.5L65 256.5L65.5 257L66.5 258L67.5 258L68 258.5L68.5 259L69 260L69 261L69.5 261.5L70.5 261.5L71 260.5L70.5 260L71.5 259.5L72 259L72 258L72 257L72.5 257.5L73.5 257L74 256.5L74.5 257L75 257.5L76 257.5L77 257.5L77.5 258L78 257.5L78.5 258L78.5 259L79 259.5L79 261L79.5 260.5L80 261L80.5 261.5L81.5 262L82.5 262L83 263L84 263.5L83.5 264L84.5 264.5L85 265L86 265L87 266L87.5 265.5L88 266L89 266.5L89.5 267L90 268L90.5 269L91 269.5L91.5 270.5L92.5 271L93 270L94 269.5L94.5 269L95.5 269L96 269.5L96.5 270L97.5 270L97 270.5L97.5 271.5L97 272L97.5 272.5L97.5 274L98.5 274L99 274.5L99.5 275L100 275.5L101 275.5L101.5 276L102 276.5L102.5 277L103 277.5L103.5 277L104.5 277L105 276L106 276.5L106.5 277L106 278.5L105.5 279.5L106 280L107 280.5L108 280.5L108.5 280L109.5 280L110 280.5L110.5 279.5L111.5 281L112.5 282L112.5 283L113.5 284L113 284.5L113.5 285L115 284.5L114.5 283.5L114.5 282.5L115 283L115.5 282L115.5 283L115.5 284L116.5 284.5L117.5 285L118 284.5L118.5 284L118.5 283L119 282.5L119.5 283L120 282.5L120.5 283L121 283.5L121.5 284L123 284.5L124 285.5L125 286L125.5 285.5L126.5 285.5L128 285.5L129 285.5L129.5 286L130 285.5L130 284.5L131 284.5L131.5 285L132.5 285L133 284.5L134 284L135 284L136 283.5L137 283.5L137.5 282.5L138 283L139 283L139.5 283.5L139.5 284.5L140 285.5L139.5 286L139.5 287L139 287.5L139 288.5L139 289.5L139 290.5L140 291L140 292L141 292.5L141.5 292L142.5 291.5L142.5 290.5L142 290L142 289L142.5 288.5L142 288L142.5 287.5L143 286L143.5 285.5L144.5 285L145 284L145.5 283L146 282.5L146.5 282L147.5 282L148 281.5L149 281.5L150 281.5L150.5 282L151 281.5L151.5 282L152.5 282L153.5 282.5L154 283L155 283L155.5 283.5L156.5 283L157.5 283.5L158 284L159 284.5L159.5 285.5L160.5 285L160.5 284L161.5 284L162 283L163.5 283.5L163.5 284.5L164 285L164.5 285.5L165 286.5L164.5 287L164 288L164.5 289L165.5 289.5L166.5 289.5L167.5 289.5L168.5 289.5L169 290.5L169.5 292L168.5 292.5L168.5 293.5L169 294.5L169.5 295.5L169 296.5L170 296.5L171 296L172 296L172.5 295.5L174 295.5L175.5 296L176.5 296L177.5 296L178.5 296L179.5 296L182.5 295.5L184 294.5L185 294.5L185 293L186 291.5L187 290.5L187.5 289.5L188.5 289L189 288.5L190 288.5L190.5 288L192.5 287.5L193 287L194 286.5L195 286L195.5 285.5L198 284.5L198.5 283.5L199 282.5L199.5 282L200.5 281.5L201.5 281L202 280.5L203 280.5L203.5 281L204.5 281.5L205.5 281.5L206.5 281.5L207 281L207.5 282L208 282.5L208.5 282L209 283L210 283.5L210.5 284L211 284.5L212 285L213 285L213.5 285.5L214 286L214.5 286.5L215 286L216 285L216.5 284.5L217 285L217 284L217.5 283.5L217 283L216.5 282.5L217 282L217 281L217.5 280.5L218 281L218.5 280L218 279.5L218.5 279L218.5 278L219 277.5L219.5 278L220.5 278.5L220.5 279.5L221 280L221.5 279.5L223 281L223.5 281.5L224 282L224.5 281.5L225 281L225 280L225.5 279.5L226 280.5L226 281.5L226.5 282L228 281.5L228.5 282L229 281L229.5 280L229 279L228.5 278.5L228.5 277.5L228 276.5L229 276L228.5 274.5L228.5 273.5L229 273L229.5 272.5L230 273.5L230.5 274.5L231 275L231.5 274.5L231 274L231 273L232 272L231.5 271.5L231.5 270.5L233 270L232.5 269L232.5 268L232 267L232.5 266.5L232 266L232 265L232 264L232 263L232.5 262.5L232 261L231.5 260L232 259L231.5 258.5L231.5 256.5L231 255.5L231.5 255L231 254L231.5 253.5L231 253L230.5 252L230 251.5L230 250.5L229.5 250L229 249.5L229 248.5L228 248.5L228.5 248L228 247.5L228.5 247L229 246.5L230 247.5L231 246.5L230.5 246L229 245L228.5 244L228 243L227.5 242.5L227 241.5L226.5 241L226.5 240L226.5 239L226 238.5L225.5 238L225 237L224.5 236.5L224.5 235.5L224 235L223.5 234.5L222 234L221 234L220.5 233.5L219.5 233.5L218.5 233.5L218 233L217 233.5L216.5 234.5L217.5 236L217 236.5L216.5 236L216 237.5L216.5 238L216 238.5L215.5 238L216 238.5L215.5 239L214 239L213.5 238.5L213 239L212.5 239.5L212 239L211 239L211.5 239.5L212 240.5L211.5 241L212 241.5L212 242.5L211.5 243L211 242.5L210 242.5L209.5 242L208.5 241.5L208 240L207 240L206.5 240.5L206 241L206 242L206.5 242.5L207 243L206.5 244L206 243.5L206 242.5L205 242.5L204.5 241.5L203.5 241.5L203 242.5L202.5 242L201 241.5L200.5 242L200 241.5L199 240.5L198.5 240L199 239.5L199.5 239L199.5 237.5L198.5 237.5L198 237L197.5 236L196.5 236.5L196 236L197 235.5L198 235.5L197.5 235L196 235L195.5 234.5L195 235L194.5 234.5L194 234L193.5 233.5L193 233L192 232L191 232.5L190.5 233L190 232.5L189.5 233.5L189 234L188.5 233.5L188 234.5L187 234L186.5 234.5L186 234L185 234L184.5 233L183 233L182 234L181.5 233.5L181 233L180 233L179.5 232.5L179 232L178 232.5L177.5 231.5L176.5 231.5L175.5 231L174.5 231L174 231.5L173.5 231L172.5 231L171.5 231L170.5 231.5L170 231L170 230L169.5 229.5L169 230L168 230L167 229.5L166.5 229L166 228.5L165 228L164 227.5L163.5 227L163 227.5L162.5 227L161.5 226.5L161 227L160.5 227.5L159.5 227L158.5 227L158 227.5L157.5 227L156.5 226.5L155.5 226L155 225.5L153.5 225.5L153 225L152 223.5L151 223L150 222L150 220.5L149 220L149.5 219.5L148.5 218.5L147.5 218L147 217.5L146.5 216.5L147 216L147.5 215.5L148.5 215.5L148.5 214L149 213.5L148.5 213L148 212.5L148.5 212L148.5 211L148 210L147.5 209L148.5 208.5L149 208L148.5 207.5L148 207L147 207.5L146 207L146.5 205.5L146 204.5L145 203.5L145.5 203L145.5 202L146.5 201.5L147.5 201L148 200.5L147.5 200L148 199.5L147.5 199L147.5 197.5L148 197L147.5 196.5L146.5 196.5L145.5 196L145 195L144.5 194.5L146.5 194.5L147 194Z","x":135.5,"y":244},{"name":"陕西省","d":"M335.5 210.5L334.5 210.5L334 209.5L334 208.5L334 207.5L334 206.5L334.5 206L335 204.5L335.5 203.5L335 203L336 202.5L336 201.5L336.5 200.5L337 200L337.5 199L337 198L337 197L336.5 196.5L336.5 195.5L336.5 194.5L336 194L336 193L336 192L336.5 190.5L336 190L336.5 189.5L336.5 188.5L336 188L335.5 187.5L336 187L335.5 186.5L335.5 185.5L335.5 184L336 183.5L336.5 183L337 182L338 181L338 180L337.5 179.5L338.5 179L339 178L339 177L338.5 176L338 175L337 173.5L336.5 173L336.5 171.5L336.5 170.5L337 169.5L338 169.5L338.5 168.5L339 168L340 167.5L339.5 167L340 166.5L340 165.5L340.5 164.5L341 163.5L341 162.5L340.5 162L341 161.5L342 161.5L342.5 160.5L343 159L342.5 158L342 157.5L341.5 157L342 156.5L342.5 155.5L342 155L341 155.5L340.5 156L339.5 156L339 157.5L338.5 158L338 158.5L337 158L336.5 157.5L335.5 158L334 157L333 156.5L333 157.5L334 158.5L333 159L332 159L331.5 159.5L331 158.5L330.5 159L331.5 159.5L331 160L330.5 160.5L330 161L329.5 161.5L329 162L328.5 163.5L327.5 164L326.5 164.5L326 165L325.5 165.5L326 166L324.5 166.5L324 167.5L323 168L323 169L322.5 170L322 170.5L322.5 171L323.5 171.5L323 172L323.5 172.5L323 173L322.5 173.5L322 173L321.5 172.5L321 172L321 173L321 174L321 175L321 176L320 176L319.5 176.5L318.5 176L318 176.5L316.5 176.5L315.5 176.5L315 177L314 176.5L313.5 175.5L312.5 175L312 174.5L311 174.5L310.5 174L310.5 175L309 175.5L308.5 176L308 176.5L307.5 177L308 177.5L307.5 178L307 178.5L307 180L307.5 181L307 181.5L307.5 182L307 182.5L307 183.5L307.5 185L309 185L309.5 185.5L310.5 186L311.5 186L312.5 186.5L313 187L313.5 187.5L314 188.5L314.5 188L315 188.5L315.5 188L316 188.5L317 189L317.5 190L318.5 190L319.5 190L319.5 191L319.5 192L320 193.5L320 194.5L319.5 195L319 195.5L318.5 196L318 196.5L318.5 197L318.5 198L318.5 199.5L319.5 200L319 200.5L319.5 201.5L319 202L319 203L318.5 202.5L318 203L317 203L316 203L315.5 202.5L314.5 203L313 203.5L313.5 203L312.5 203L311.5 202.5L310.5 203L311 203.5L311 204.5L311.5 205.5L312 206L311.5 206.5L310.5 206.5L309.5 206.5L308.5 207L307.5 207L307 207.5L306.5 207L306 206.5L305.5 206L304.5 205.5L303.5 205L302 205L301 205L300 205.5L300 206.5L300.5 207.5L300.5 208.5L300 209L299.5 209.5L298.5 210.5L298.5 211.5L299.5 211L300 211.5L301 212L301.5 213L302 214L301.5 214.5L301 214L300 214.5L301 215.5L300.5 216L300 216.5L300 217.5L299 218L299.5 218.5L300 219L299.5 219.5L300 220L300.5 220.5L300.5 222L299.5 222.5L299.5 221.5L298.5 221.5L297.5 222L296.5 222L296 221.5L295 221.5L294.5 222L294 223L294 224L293 224L293 225L293.5 225.5L294.5 225.5L295 226L294.5 226.5L295 227L294.5 227.5L295 228L294.5 228.5L294 229L293 229.5L292 229.5L291 229L291 230L291.5 230.5L291.5 231.5L292.5 231.5L293 231L294 231L294 230L295 230L296 229.5L296.5 230L296 231L296.5 231.5L298 231.5L298.5 232L299 232.5L299.5 232L301 231.5L302 231L302.5 231.5L303.5 231.5L304.5 231.5L305.5 232L305.5 233.5L306.5 234L307 235L307.5 234L308 233.5L308.5 234L309 234.5L309.5 235L310.5 234.5L311 235.5L312 236.5L312.5 237L313.5 237.5L314 237L314.5 236.5L315 237L316 236.5L316.5 237L317 236.5L318 236.5L318.5 237L319 237.5L320 238L320.5 238.5L321 239L322 239.5L323.5 240L324 240.5L324.5 241L325.5 241.5L325 242L325.5 242.5L327 242.5L328 242.5L328 241.5L328 240.5L328.5 240L328 239L328.5 238L328 237.5L327.5 237L327 236L327.5 235.5L327.5 234.5L328 233.5L328.5 233L329.5 232.5L330 233L331 233L332 233.5L332.5 233L333 232.5L333.5 232L333.5 231L333 230.5L332.5 230L331.5 229.5L330.5 229L330 229.5L329.5 229L330 228.5L330 227.5L329 227L328 227L327.5 226.5L326.5 226.5L327.5 226L328.5 225.5L329.5 225.5L330.5 225.5L331.5 226L333.5 226L334 226.5L335 226.5L336 226.5L337 225.5L337 226.5L338 226.5L339.5 226.5L340 226L340.5 225.5L341 224.5L341 223.5L341 222.5L340.5 221.5L340 221L339.5 220.5L339 219.5L338.5 219L337.5 219L337 218.5L337.5 218L338 217.5L337.5 216.5L337 217L337 216L337.5 215.5L337 215L336.5 214.5L335.5 214L336.5 213.5L336 213L335.5 212.5L335 211.5L335.5 211Z","x":321.5,"y":203},{"name":"甘肃省","d":"M300 198L299.5 198.5L300 199.5L299.5 200L300 200.5L300 201.5L300 202.5L299 203L297.5 202L297 201L296.5 201.5L296 201L294.5 201.5L296 200.5L294.5 200L294 200.5L294 199.5L293.5 200L293.5 199L293 198.5L293.5 198L292.5 197.5L292 198L291 198L290.5 197.5L290 197L289.5 196.5L289.5 195.5L289.5 194.5L290 194L291 194L290.5 192.5L290.5 191.5L290 191L290 190L289.5 189.5L289 189L289 188L288.5 187.5L288 187L289 186.5L289.5 186L289 185.5L288.5 185L288 184.5L287.5 184L287 183.5L286.5 184L286 183.5L285.5 183L285.5 182L285 181.5L284.5 181L284 181.5L283 181.5L282.5 181L283 180.5L284 180L283.5 179.5L282 179L280.5 179L279.5 179.5L278 178.5L276.5 177.5L276 177L274.5 175L272 174.5L271.5 172.5L273 171L273 169.5L272.5 169L272 168L276 165.5L277.5 163L279 162.5L279 161L279 160L277.5 158.5L278 157.5L277 156.5L276 156.5L275 157L273.5 157.5L272 157.5L271.5 158L270.5 158.5L270 159.5L268.5 160.5L267 160.5L264.5 159.5L263 159L261.5 159.5L259.5 160L258 160.5L258.5 161.5L259.5 162.5L260 163L258.5 164L258 164.5L257 165.5L256 165L255.5 165.5L255 165L254 164.5L253 164L252 163L252 161.5L251 162L249.5 162L249 161.5L248.5 161L249 160.5L248.5 159.5L248.5 157L247.5 157L246.5 157.5L245.5 157L245 156.5L244 156L243.5 155.5L244 155L243 154L242 154L241.5 153L240.5 153L239.5 152L238 152L236 152L236.5 151.5L238.5 151L239.5 150.5L240.5 150L240.5 149L241 148.5L242.5 147.5L242.5 144.5L243 143.5L243 142.5L242 141L241.5 140.5L238 140L237 141L233.5 141L233.5 142L233 142.5L232.5 143L231.5 142L230 142.5L230 144L229.5 143.5L229 143L229 142L228 142.5L228.5 143L226 144L226 140.5L225 140L224.5 139.5L222.5 138.5L222 137.5L219.5 134.5L219 134L221.5 132L219.5 128.5L218 125.5L217 123.5L215 119.5L213.5 120L211.5 120L208 120.5L206 121.5L205 122L204.5 123L205 123.5L205 124.5L206 126L205 126.5L206 127.5L205.5 128.5L205 129L204.5 129.5L203 130L201.5 130.5L200.5 130.5L199.5 131.5L198.5 132.5L198 133L197.5 132.5L197 131.5L196.5 131L195.5 131.5L194 132L193.5 132.5L193 133.5L191 134L188 136.5L186.5 138L185.5 139.5L184.5 141L184 143L182 143.5L176.5 144L176.5 146L176.5 147L175.5 149L175 152L174.5 154.5L174 156L173 157.5L171.5 159L171.5 160L171.5 161L172.5 161L173 160.5L174 160.5L175 160L176 160L177 160L178.5 159.5L178.5 160.5L179 161L179 162.5L180 163L181.5 162.5L184 162.5L185 163L185.5 163.5L184.5 163.5L184 164L184.5 164.5L185.5 164.5L186 165L189 164.5L191 168L191.5 169L192.5 168.5L194 168.5L194.5 168L196 168L196.5 168.5L197.5 169L198 169.5L198.5 169L199 169.5L200 169L201 169L201.5 168.5L202.5 169L203 169.5L204 170L204.5 170.5L205 171L205.5 170.5L206.5 171L207.5 171L207.5 170L208 169.5L209 169.5L210.5 170L210 169L211 168L210.5 167.5L211 167L212 167L211.5 166.5L212 166L212.5 166.5L213.5 166.5L214 166L213.5 165L214 164.5L213.5 164L213.5 163L213 162.5L213.5 161.5L213.5 160.5L213.5 159.5L215 159.5L216.5 160L217.5 160L218 160.5L219 161L220 161.5L221 162.5L221.5 163L223 163L223.5 163.5L224.5 163.5L225 163L225 162L225.5 161.5L226.5 161.5L227 162L228 162.5L228.5 162L229 161L229.5 160.5L230 161L231 161L231.5 162L232.5 162L232.5 163L233 163.5L234 164L235 165L235.5 165.5L236 166L236.5 166.5L237 167L237.5 167.5L238 168L239.5 168.5L240.5 169L241.5 169.5L242 170L242.5 170.5L242.5 169.5L242 169L242 168L241 168L241 167L241.5 167.5L242 167L242.5 167.5L243 168L243.5 168.5L244 169L244.5 169.5L245 170L245.5 169.5L246 170L247.5 170L248.5 171L249.5 171L249.5 172L249 172.5L250.5 173.5L251.5 174L252 174.5L253.5 175L254 174L255 174.5L256 175.5L257 176L257.5 176.5L258 176L259 176L259.5 176.5L260 177.5L260.5 178L260 178.5L261 179L262 179.5L262.5 180L263 180.5L263.5 181L264 181.5L264.5 182L265 182.5L263.5 183L263 184L263.5 184.5L264.5 185.5L265.5 186.5L265 187L264.5 186.5L265 187.5L265.5 188L266 188.5L266.5 189.5L266.5 191L267 191.5L268.5 192L269 192.5L268 193L267.5 193.5L267 194L267.5 194.5L268 195L267.5 196L268 196.5L267.5 197L266.5 196.5L266 197L265.5 197.5L266 198.5L266.5 200L265.5 200L266 200.5L265.5 200L264.5 200L264 199.5L263.5 200L263 201L262 201L261.5 202L262 202.5L262.5 203L263 204L262 204.5L261.5 205.5L260.5 205.5L260 206L259.5 207L258.5 207.5L258.5 209.5L258.5 210.5L259 211L260 211L260.5 211.5L261 212.5L261.5 213L260.5 214L259.5 214L259 214.5L259.5 215L259 215.5L258.5 216L258 215.5L257.5 216L257 215.5L256.5 216L255.5 215L254.5 215L254 214.5L253 214.5L252.5 214L252 213.5L251 213.5L250 213L249 213L248.5 213.5L248 214L248.5 214.5L248 215L248.5 216L249 216.5L249.5 217L250 218.5L251.5 219L251.5 220L251.5 221L252 220.5L253 221L254 221L254.5 220.5L255.5 221L255.5 222L256.5 222.5L257 222L257.5 221.5L258 222L258 223L258.5 223.5L258 224L257 225L257.5 226L257.5 227L258 226.5L258.5 226L259.5 226L260 225.5L260.5 225L261 226L261 224.5L261.5 223.5L262 224L262.5 223.5L263 223L263.5 222.5L263 222L262.5 221.5L262 221L262 220L261.5 220.5L262 220L261.5 219.5L261.5 218.5L260.5 217.5L261.5 217.5L262 217L262.5 217.5L263 217L263 216L263.5 216.5L264 216L265 216L264.5 215.5L265 215L265.5 214.5L266.5 214L267.5 213.5L268 214.5L268.5 215L269.5 215.5L270 216.5L269.5 217L269.5 218L269.5 219L270.5 219.5L271.5 220L272.5 219.5L273 220L273 221L273.5 220.5L274.5 220.5L275.5 221L276 220.5L277 221L277.5 220.5L278 221L279 221.5L278.5 222L279 223L279.5 223.5L280 224L280.5 224.5L281 225L280.5 224.5L280 225L280.5 225.5L280.5 226.5L280.5 228L281 228.5L280.5 229L280 229.5L280.5 230L281.5 231L282.5 231.5L283 232L284 232.5L284.5 232L285.5 232.5L286.5 232L287 232.5L288 232.5L288.5 232L289.5 232L290.5 231L290 230L290 229L291 229L291.5 229.5L292.5 229.5L294 229L294.5 228.5L295 228L294.5 227.5L295 227L294.5 226.5L295 226L294.5 225.5L293.5 225.5L293 225L293 224L294 224L294 223L294.5 222.5L295 222L296 221.5L296.5 222L297.5 222L298 221.5L299 221.5L299.5 222.5L300.5 222.5L300.5 221L300 220.5L299.5 219.5L300 219L299.5 218.5L299 218L300 217.5L300 216.5L300.5 216L301 215.5L300.5 214.5L301 214L301.5 214.5L302 214L301.5 213.5L302 213L301 212L300.5 211.5L299.5 211L298.5 211.5L298.5 210.5L299.5 210L300 209L300.5 208.5L300.5 207.5L300 206.5L300 205.5L300.5 205L302 205L303 205L304 205.5L305.5 206L306 206.5L306.5 207L307 207.5L307.5 207L308.5 207L309.5 207L310 206.5L310.5 207L311.5 206.5L312.5 206L311.5 205.5L311 204.5L311 203.5L310.5 203L311.5 203L312.5 203L313.5 203L313 203.5L314 203L315 202.5L316 203L317 202.5L318 203L318.5 202.5L319 203L319 202L319.5 201.5L319 200.5L319.5 200L318.5 199.5L318.5 198.5L318.5 197L318 196.5L318.5 196L319 195.5L319.5 195L320 194.5L320 193.5L319.5 192L319.5 191L319.5 190L318.5 189.5L318 190L317 189.5L316.5 188.5L316 189L315.5 188.5L314.5 188.5L313.5 188L314 187.5L313 187.5L313 186.5L311.5 186L310.5 185.5L309.5 185.5L309 185L308 185L307.5 184.5L307 184L307 183L306 182L305.5 182.5L304.5 182.5L303.5 182L304 182.5L303 182.5L302.5 182L302 182.5L301 182.5L301.5 183L301.5 184L301 184.5L300.5 184L301 184.5L301.5 185.5L301 186.5L301.5 187L301 186.5L300 187L300.5 187.5L300 188L299.5 188.5L299 189L299.5 189.5L300 190L300 191.5L300.5 192L301.5 192L302 192.5L303 192.5L303.5 193L304 193.5L304 195L303.5 195.5L303 196L304 197L303.5 197.5L303 198L302.5 198.5L301.5 198L300.5 198Z","x":275.5,"y":194.5},{"name":"青海省","d":"M266.5 191L266 189.5L266 188.5L265.5 188L265 187.5L264.5 187L265.5 186.5L265 185.5L264 184.5L263 184L263.5 183.5L264.5 182.5L264 181.5L263.5 181L263 180.5L262.5 180L262 179.5L261 179L260.5 178.5L260 177.5L259.5 177L259.5 176L258.5 176L258 176.5L257 176L256 175.5L255.5 174.5L254 174L253.5 174.5L252.5 174.5L251.5 174L251 173.5L249.5 172.5L249 172L249.5 171.5L249 171L248 170L246.5 170L245.5 169.5L245 170L244.5 169.5L244 169L243.5 168.5L243 168L242.5 167.5L242 167L241.5 167.5L241 167L241 168L242 168L242 169L242.5 169.5L242.5 170.5L242 170L241.5 169.5L241 169L239.5 168.5L238.5 168L237.5 167.5L237 167L236.5 166.5L236 166L235.5 165.5L235 165L234.5 164L233 163.5L232.5 163L233 162L231.5 162L231 161.5L230 161L229.5 160.5L229 161L228.5 161.5L228 162.5L227.5 162L226.5 162L226 161.5L225.5 161L225 162L225 163L224.5 163.5L223.5 164L223 163.5L221.5 163L221 162.5L220 162L219 161L218 161L217.5 160L216.5 160L215.5 159.5L214 159.5L213.5 160L213.5 161L213 162L213.5 163L213.5 164L214 164.5L213.5 165L214 165.5L213.5 166.5L212.5 166.5L212 166L211.5 166.5L212 167L211 167L210.5 167.5L211 168L210 169L210.5 169.5L209 169.5L208 169.5L207.5 170L207.5 171L206.5 171L205.5 170.5L205 171L204.5 170.5L204 170L203.5 169.5L203 169L202 168.5L201 169L200 169.5L199 169.5L198.5 169L198 169.5L197.5 169L197 168.5L196.5 168L196 168.5L195 168L194 168.5L192.5 168.5L191.5 168.5L191 168L189.5 164.5L186 164.5L184.5 164.5L184 164L184.5 163.5L185.5 163.5L185 163L184 162.5L181.5 162.5L180 163L179.5 162.5L179 161L178.5 160.5L178.5 159.5L177.5 160L176.5 160L175 160L174 160.5L173 160.5L172.5 161L172 161.5L170.5 161.5L170 162L169 162L168 162.5L167 163L165.5 163L163.5 163.5L162 164.5L161 164.5L159 165L158 165L156.5 165.5L155.5 165.5L155 166L154 166.5L154 167.5L153 167.5L151 167.5L151 168.5L152.5 170L153.5 169.5L155 169L154.5 170.5L154.5 175.5L155.5 176L157 176.5L157.5 177L158 177.5L158.5 178L159.5 178.5L160 179L160.5 180L161 181L161.5 182L162 183L161.5 183.5L160.5 183.5L160 184L159.5 184.5L159 185L158.5 184.5L158 185L157 186L156.5 186.5L157 187L156.5 187.5L156.5 188.5L157.5 188.5L159 189L159.5 189.5L159.5 191.5L159.5 192.5L160 193L160 194L159 194L158.5 194.5L157.5 195L157 194L156 193.5L155 193.5L154 193.5L153 193L152 193L151 192.5L150.5 192L150 192.5L149.5 193.5L149 194L148 194L147 194L146.5 194.5L145 194.5L144.5 195L145 196L146 196.5L147 196.5L148 196.5L148 197.5L147.5 198.5L148 199.5L147.5 200L148 200.5L147.5 201L147 201.5L146 202L145.5 202.5L145 203.5L145.5 204.5L146.5 205L146 206.5L147 207.5L147.5 207L148.5 207L149 208L148.5 208.5L148 209L147.5 210L148 211L148.5 212L148 212.5L148.5 213L149 213.5L148.5 214L148.5 215.5L147.5 215.5L147 216L146.5 216.5L147 217L147.5 217.5L148 218.5L149 219.5L150 220L150 221.5L151 222.5L152 223.5L153 225L153.5 225.5L154.5 225.5L155.5 226L156.5 226.5L157.5 227L158 227.5L158.5 227L159.5 227L160.5 227.5L161 227L161.5 226.5L162 227L163 227.5L163.5 227L164 227.5L164.5 228L165.5 228.5L166.5 229L167 229.5L168 230L169 230L169.5 229.5L170 230L170 231L170.5 231.5L171 231L172 231L173.5 231L174 231.5L174.5 231L175.5 231.5L176.5 231.5L177.5 231L178 232.5L178.5 232L179.5 232L180 232.5L180.5 233L181 233.5L181.5 233L182 233.5L183 233.5L184 233L185 233.5L185.5 234L186.5 234.5L187 234L187.5 234.5L188 233.5L189 234L189.5 233.5L190 232.5L190.5 233L191 232.5L191.5 232L193 233L193.5 233.5L194 234L194.5 234.5L195 235L195.5 234.5L196 235L197 235L197.5 235.5L196.5 236L197.5 236L198 237L198.5 237.5L199.5 237.5L199.5 238.5L199 239.5L198.5 240L199 240.5L199.5 241.5L200 242L201 241.5L202.5 242L203 243L203.5 241.5L204.5 241.5L205 242.5L206 242.5L206 243.5L206.5 244L206.5 243L207 242.5L206.5 242L206 241L206.5 240.5L207 240L208 240L208.5 241L209 242L209.5 242.5L210.5 242.5L211 243L211.5 242.5L212 241.5L211.5 241L212 240.5L211.5 240L211 239L212 239L212.5 239.5L213.5 239L215 239L215.5 238.5L216.5 238.5L216 238L216.5 236L217 236.5L217.5 236L217 234.5L216.5 233.5L217 233L218 233L218.5 233.5L219.5 233.5L220.5 233.5L219 233L218.5 232.5L218 232L217.5 231.5L217 230.5L217 229.5L217 228.5L218.5 228.5L218 228L218.5 227L218 226.5L218.5 226L219 225.5L219.5 224.5L220.5 223.5L219.5 223L218.5 223L218.5 222L217.5 222L217.5 220.5L217.5 219.5L217 219L218 218.5L218.5 218L219.5 218L219.5 217L220 216.5L219.5 215.5L220.5 215.5L221 215L222 215L223 216L224 216L225 216L226 216L226.5 216.5L226.5 217.5L226.5 218.5L227 219L227.5 219.5L228 220L228.5 220.5L228.5 221.5L229 222.5L229.5 223L230 224L229.5 225L230 226L230.5 226.5L231 227L232 227.5L233 227.5L233.5 228L234 228.5L234.5 229.5L236 230L237 230L237.5 230.5L238 231L239 230L239 229L240 228.5L240 227.5L240.5 228.5L241.5 229L241 229.5L242 230L242 231.5L241.5 232L242.5 232.5L243 232L243.5 231L244 231.5L244.5 231L245 231.5L245.5 232.5L246 233L247 233.5L247 232.5L247.5 232L248.5 232L249 232.5L250 232.5L250.5 232L251.5 232L252 231.5L252 230L251.5 229.5L251 229L251.5 228.5L251.5 227.5L251 226L251.5 225.5L252.5 225.5L253.5 226.5L253.5 225.5L254.5 225.5L255 226.5L256 227L256.5 226L256.5 225L256 224.5L256.5 223.5L257 223L256.5 222.5L255.5 222.5L255.5 221.5L254.5 220.5L254 221L253 221L252 220.5L251.5 221L251.5 220L251.5 219L250.5 218.5L249.5 217.5L249 216.5L248.5 216L248 215.5L248.5 214.5L248 214L248.5 213.5L249 213L250 213L250.5 213.5L251.5 213.5L252 214L253 214L253.5 214.5L254.5 214.5L255 215L256 216L257 216L257.5 215.5L258.5 216L259 215.5L259.5 215L259 214.5L259.5 214L260.5 214L261 213L261.5 213.5L261 212.5L260.5 212L260 211L259 211L258.5 210.5L258.5 209.5L258.5 208L259 207L259.5 207.5L260 206L260.5 205.5L261.5 205.5L262 205L262.5 204L262.5 203L261.5 202.5L262 202L262 201L263 201.5L263.5 200L264 199.5L264.5 200L265.5 200L266 200.5L265.5 200L266.5 200L266 199L265.5 198L265.5 197L266.5 196.5L267.5 196.5L268 195L267.5 194.5L267 194L267.5 193.5L268 193L268.5 192.5L267.5 191.5L266.5 191Z","x":205,"y":198},{"name":"宁夏回族自治区","d":"M307 182.5L307.5 182L307 181.5L307.5 181L307 180.5L307 179L307.5 178L308 177.5L307.5 177L308.5 176.5L308 176L309 176L310 175L310.5 174.5L309.5 174L309 173.5L308.5 173L308 172.5L307.5 172L306.5 171.5L306 171L305 171L304.5 171.5L303.5 171L302.5 171L302 170.5L301.5 170L300.5 170L300 169L301 168.5L301.5 167.5L301.5 166L302 165L302.5 164.5L303 163.5L304 162.5L304.5 161.5L304 161L303.5 160.5L303 159.5L302.5 159L303 158.5L302.5 157.5L301.5 157.5L300.5 158L300 158.5L299 158.5L298 158.5L298 160L297 160L296.5 160.5L296 161.5L295.5 162L295 162.5L295.5 163L294.5 164L294.5 165L294 165.5L294.5 166L294 166.5L294 167.5L294 168.5L294 169.5L293.5 170.5L293.5 171.5L294 172.5L293.5 173.5L293.5 174.5L292.5 175.5L292 175L292 176L290.5 176L289 176L288.5 176.5L287.5 177L286.5 177.5L285 177.5L284.5 178L283 178L281 178L280 179L281.5 179L283.5 179.5L284 180L283.5 180.5L282.5 181L283 181.5L284 181.5L284.5 181L285 181.5L285.5 182L285.5 183L286 183.5L286.5 184L287 183.5L287.5 184L288 184.5L288.5 185L289 185.5L289.5 186L289 186.5L288.5 187L288.5 188L289 188.5L288.5 189L289.5 189L289.5 190L290 191L290.5 191.5L290.5 192.5L291 193.5L290.5 194L289.5 194.5L289.5 195.5L289.5 196.5L290 197L290.5 197.5L291 198L292 198L292.5 197.5L293 198L292.5 198.5L293 199L293.5 199.5L294 200.5L294.5 200L295.5 200.5L296 201L296.5 202L297 201L297.5 201.5L298.5 203L299 203.5L300 202.5L300 201.5L300 200.5L299.5 200L300 199.5L299.5 199L300 198L301 198L302.5 198.5L303 198L303.5 197.5L304 197L303 196L304 195.5L304 194L303.5 193L303 192.5L302 192.5L301.5 192L300.5 191.5L300 192L299.5 191.5L300 190.5L300 189.5L299 189L299.5 188.5L300 188L300.5 187.5L300 187L301 186.5L301.5 187L301 186.5L301.5 186L301 185L300.5 184.5L301 184L301.5 184.5L301.5 183.5L301 182.5L302 182.5L302.5 182L303 182.5L304 182.5L303.5 182L304.5 182.5L305.5 182.5L306 182L306.5 183L307 182.5ZM296 200.5L294.5 201L295.5 201L296 200.5Z","x":297,"y":180.5},{"name":"新疆维吾尔自治区","d":"M208 120.5L208 118.5L204 114.5L203.5 114L203.5 112.5L202 110.5L201.5 108.5L201 107.5L200 106L199 106L198.5 105L199 103.5L199.5 103L197.5 103L196.5 103L195.5 103.5L195 103L194 102.5L193 102.5L192.5 101.5L192 101L190.5 100.5L189.5 100.5L189.5 99.5L188.5 99L187.5 98.5L187 98L184 96.5L183 96L182 95.5L181 95.5L180.5 95L180 95.5L179.5 95L178 95L176.5 95L176 94.5L174.5 95L173 95L172 95L171 94.5L170.5 95L169 94L167 94L165.5 94.5L164 94L163 93.5L162.5 94L162 93.5L161 93.5L160.5 93L159.5 92.5L158.5 93L158 92.5L157.5 91.5L157 90.5L156.5 90L156 89.5L156 88.5L156.5 87L157.5 86L158 85L159.5 83.5L159 83L159.5 82.5L159 82L158.5 81.5L158 80.5L159 80L159.5 79L159.5 78L160 77.5L159 77.5L159.5 76.5L159.5 75.5L159 75L158.5 74L158 73.5L157.5 73L156.5 72L156 71.5L155.5 70.5L154.5 69.5L155 68.5L154 68L154.5 67.5L153.5 67L153.5 66L153 65.5L152 65L151 65L150.5 64L151 63L149.5 63L149 63.5L148 63.5L147.5 63L147 62.5L146.5 62L146 61.5L144.5 61L144 61.5L143.5 62L142.5 62L141.5 62L141 61L140.5 60.5L139.5 60.5L138.5 60L138 59.5L137 59L137.5 58L137 57.5L136.5 57L136 57.5L135 57L134.5 56.5L134 56L133.5 56.5L133 56L132 55.5L131.5 55L132 54.5L132.5 54L132 53.5L131.5 53L130.5 53L130 52.5L129.5 52L130 51.5L130.5 51L131 50.5L130.5 50L130.5 49L130 48.5L129 48.5L128 49L127 49L127.5 49.5L126.5 50L125.5 49.5L124.5 49L123.5 49L122.5 49L121.5 49L121.5 50L120.5 50.5L120.5 52L121 52.5L120.5 53L120.5 54L120 54.5L119.5 55L119 55.5L117.5 56.5L116.5 56.5L115.5 57L114 57L113 57L111.5 57L111 58L110.5 59L110 59.5L109.5 60.5L109.5 61.5L110 66.5L110 67.5L111 68L110.5 69.5L110.5 70.5L110 71.5L109.5 72L108.5 72L107.5 72.5L107 72L106.5 72.5L106 73L105.5 73.5L104.5 74L104 74.5L103.5 73.5L102.5 73L102 72.5L101.5 73L100.5 73L99.5 72.5L99 73L98 73L97 73L96 73L95 73L93.5 72.5L92.5 72.5L91.5 72L90.5 71.5L89.5 71L88.5 71L88 70.5L86.5 70.5L86.5 72L86 72.5L85.5 73.5L85 75L84.5 76.5L84.5 77.5L84 78.5L83 80.5L82 82L81.5 84L81 84.5L80.5 85.5L80.5 86.5L80 87L80 88L80 89L81.5 90L82 90.5L82.5 91L82.5 92.5L81.5 93L80.5 92.5L79 92.5L78 92.5L77.5 92L77 92.5L76 92L75.5 91.5L74.5 91L73.5 91.5L73 92L72 92L71 92L70.5 92.5L69.5 92.5L69 93L68 93L67.5 93.5L66.5 93.5L65.5 93.5L64.5 94L63.5 93.5L63 94L62.5 94.5L61.5 94.5L60.5 94.5L59.5 95L59 95.5L58 96L59 96.5L59 97.5L60 97L61 97L60.5 97.5L61 98L62 98.5L62.5 99L63 99.5L62.5 101L62.5 102.5L63 103L62.5 104L63 104.5L63 105.5L63 106.5L63.5 107L64 108L66 112L66 113L65.5 113.5L66 114L66.5 115L66 115.5L65.5 116L65 115.5L64.5 116L63.5 116.5L62.5 117L63.5 118L64.5 118L63.5 118.5L63 119L62 119L61.5 119.5L61 120.5L60.5 121L60.5 122L61 122.5L61.5 123L61 123.5L61.5 124L61 124.5L61.5 125L61.5 126L60.5 126L60.5 127.5L60 128L58.5 128L57.5 128L58 128.5L57.5 129L57 129.5L56 129.5L55.5 130L54.5 130L53 130.5L52.5 131L52 131.5L51 131.5L50.5 132L49.5 132L49 133L47.5 133.5L47 134L46 134L45.5 134.5L45 135L44 135L43 135L42.5 135.5L42 136.5L40.5 137.5L39.5 137.5L39 138L39.5 139L38.5 139L38 139.5L37 139.5L36 139.5L35.5 139L34.5 139.5L34 139L33.5 139.5L33 139L32.5 138.5L32 139L31 139L30.5 139.5L29.5 140L29.5 141.5L29 142L28.5 142.5L29 143L28.5 143.5L28 144L27.5 145L27.5 146L26.5 146L25.5 146.5L25.5 145.5L24.5 146L23.5 146L23 146.5L22 147L21 147L20 147.5L20 146.5L20 145.5L19.5 145L19.5 144L19 143L18.5 143.5L18 144L17.5 144.5L16.5 145L16 145.5L15 145.5L14 145.5L12.5 145L12 145.5L13 147L12 146.5L11 146.5L10.5 147.5L9.5 148L9 148.5L8.5 149L8 149.5L7 149.5L5.5 149.5L4.5 149.5L4 150.5L3.5 151.5L3 152.5L3.5 153.5L4 155L3.5 155.5L3.5 156.5L2 156.5L1 156.5L0 157.5L0.5 158L0.5 159L1.5 160L2 160.5L2 161.5L3 161L3 162L2.5 162.5L2 163L2.5 164L2.5 165L3 165.5L2.5 166L3 166.5L4 167L5 166.5L5.5 166L6 165L6.5 165.5L7.5 165.5L8.5 165.5L9.5 166L10.5 166L11 166.5L11.5 167L12 167.5L12.5 168.5L11.5 169L12 169.5L12 170.5L12 171.5L12.5 172.5L13 173L13 174L13.5 175L13 176L12.5 176.5L13 177.5L13.5 178L14 178.5L14.5 178L15 178.5L15 179.5L15 180.5L14 180.5L13 181L12 181.5L11.5 180.5L10.5 181L10 181.5L9.5 181L9 181.5L9 182.5L9.5 183L10 183.5L10.5 183L11 183.5L12 183L12.5 184L13 184.5L13.5 184L14 183.5L15 183.5L16 184L17 184.5L17.5 185L17.5 186.5L18 187L18.5 186.5L19.5 186.5L21 187L21.5 187.5L22 188.5L22.5 189.5L23 190.5L22.5 191L23 192L23.5 192.5L23 193L22 193.5L22.5 194.5L23 195L23.5 194.5L24 195L24 196L24 197L25 196.5L26 197L26.5 196.5L27 196L27.5 196.5L28 196L28 197L29 197.5L29.5 199L30.5 198.5L31 199L31.5 199.5L32.5 199.5L33.5 200.5L34.5 200L35 200.5L35.5 201L36.5 200.5L37 201L38 200.5L38.5 201L39 200.5L40 201L40.5 200.5L41 201L41.5 200.5L42 201L41.5 202L41 202.5L41 203.5L41.5 204L41.5 205L42.5 205.5L42.5 206.5L43 207L43 208.5L43.5 209.5L44 210.5L45 210.5L46 211L47.5 211.5L48 212L48.5 212.5L49 213L50.5 213.5L50 212.5L51.5 212L52 212.5L53 212L53.5 212.5L54 212L55 212L56 212L57.5 212L58 211.5L57.5 211L58 210L58 209L58.5 208L59 207.5L59.5 207L59.5 206L60 205L61 204.5L61.5 204L62.5 203.5L61.5 203L61.5 202L62 201.5L63 201L64 201.5L65 201.5L65.5 202L66 202.5L67 202L67.5 202.5L68.5 202.5L68.5 201.5L69 202L70 202L70.5 202.5L71 202L71.5 202.5L73 203L74.5 203.5L75 203L76 203L77 202.5L77.5 202L77.5 201L79 200.5L79.5 200L80.5 199.5L81 199L81 198L82 198.5L83 198.5L84 199L84.5 198.5L85.5 198.5L86 199L86 200L86.5 200.5L87 201L87.5 201.5L88.5 201.5L89.5 201.5L90 202L91 202L92 202L93.5 202L94.5 202L95.5 201.5L96.5 202L97.5 202L98 201.5L99.5 201L100 200.5L99.5 200L100.5 199.5L102 199L104 198.5L104.5 198L105 197.5L106 198L107 197.5L108 198.5L109.5 198.5L110 199L110.5 198L111 197.5L112 197.5L113 197.5L114 196.5L114.5 196L115 195.5L115.5 194.5L115.5 193.5L116 193L117 193L118 192.5L119 192.5L120 192L120.5 191.5L121.5 191.5L122 192L122.5 191.5L123.5 191.5L124.5 191L125.5 191L126 190.5L126.5 190L127 190.5L128 191L129.5 190.5L130.5 190.5L131.5 190.5L132 190L133 190L134 190L134.5 189.5L135 190L135.5 189.5L136.5 190L137.5 190L138 191L139 191.5L139.5 191L140.5 191.5L141.5 191.5L142 192L143 191.5L143.5 192.5L144.5 192.5L145.5 193.5L146.5 193.5L147.5 194L148.5 194L149.5 194L150 193L150 192L151.5 192.5L152 193L153 193L154 193.5L155 193.5L156 193.5L157 194L157.5 194.5L158.5 194.5L159 194L160 194L160 193L159.5 192.5L159.5 191.5L159.5 190L159.5 189L158 188.5L156.5 188.5L156.5 187.5L157 187L156.5 186.5L157 186L158 185L158.5 184.5L159 185L159.5 184.5L160 184L160.5 183.5L162 183.5L161.5 182.5L161 181.5L160.5 180L160 179.5L160 178.5L158.5 178.5L158 178L158 177L157 176.5L156 176L154.5 175.5L154.5 170.5L155 169L153.5 169.5L153 170L151 169L151.5 168.5L151 168L152.5 167.5L153 167L154 167.5L154 166.5L155 166.5L155.5 166L156 165.5L158 165L159 165L161 164.5L162 164.5L163 163.5L165.5 163.5L166.5 163L168 162.5L169 162L170 162L170.5 161.5L171.5 161.5L172 161L171.5 160.5L171.5 159L173 157.5L174 156L174.5 154.5L175 152L175.5 149L176.5 147L176.5 146L176.5 144L182 143.5L184 143L184.5 141.5L185.5 139.5L186.5 138L188 136.5L191 134L193 133.5L193.5 132.5L194 132L195 131.5L196.5 131L197 131.5L197.5 132.5L198 133L198.5 132.5L199 131.5L200.5 130.5L201.5 130.5L202.5 130L204.5 129.5L205 129L205.5 128.5L206 128L205 126.5L206 126L205 124.5L205 123.5L204.5 123L205 122.5L205.5 121.5L208 120.5Z","x":107,"y":135.5},{"name":"台湾省","d":"M427 345.5L427.5 346L428 346.5L428.5 347.5L428.5 348.5L429 349.5L428.5 350L429 350.5L429.5 351.5L430 351L430.5 351.5L430.5 350.5L431 350L431 349L431 347L431.5 344.5L432 344L432 343L433.5 342.5L434 342L434 341L434.5 340.5L435 340L435 339L435.5 338L436 337.5L435.5 337L436 336L436.5 334.5L436.5 333L437 331L437.5 329L438 328L437.5 327.5L438 326.5L439 324.5L439.5 323.5L440 322L439.5 320.5L439.5 319L440.5 317.5L441 317L440.5 316.5L440 315.5L439 315L438 314.5L437.5 314L437 313.5L436 314L435.5 314.5L435 315.5L433.5 315.5L433 316L432 316.5L431.5 317.5L431 318.5L431 319.5L430 320.5L429.5 321L429 321.5L428.5 322.5L428 323.5L427.5 324L427 325.5L426.5 327L425.5 328.5L425 330L424.5 330.5L423.5 331.5L423.5 332.5L424 333.5L423.5 335.5L423 338.5L424 339L424 340.5L424.5 342.5L425 344L425.5 344.5L427 345.5ZM464 307L464.5 306.5L464 307ZM454 309L454.5 308.5L454 309ZM419.5 333L420 332.5L419 332.5L419 333.5L419.5 333ZM456 307L456.5 306.5L456 307ZM418.5 332.5L418 333L418.5 332.5ZM418 335L418.5 335.5L418 335ZM418.5 332L419 332.5L419.5 332L419 331.5L418.5 332ZM436 343L436.5 343.5L436 343ZM436.5 349.5L437 350.5L437.5 350L437 349.5Z","x":431.5,"y":331},{"name":"香港特别行政区","d":"M368.5 344.5L368 345L367.5 345.5L368 346.5L367.5 347L367 347.5L367.5 348L368.5 348L368 347.5L368.5 347L369 346.5L369.5 347L369.5 348L370 347.5L370.5 348L370.5 347L371 347.5L370.5 346.5L371 346L371.5 346.5L372 345.5L371 345L370.5 345.5L371.5 344.5L371 345L370.5 344.5L370 344L369.5 344.5L368.5 344.5Z","x":369.5,"y":346},{"name":"澳门特别行政区","d":"M364 349L364.5 348L364 348.5Z","x":364.5,"y":348.5},{"name":"南海诸岛","d":"M445.5 334L448 322L445.5 334ZM433.5 363.5L440 354L433.5 363.5ZM418 394.5L423 383.5L418 394.5ZM414.5 427.5L414.5 416.5L414 427.5L414.5 428ZM411 470.5L409.5 473.5L411 470.5L412.5 465.5L413.5 461.5L412.5 465.5L411 470.5ZM382 515L388.5 506L382 515ZM353 555.5L348 556.5L353 555.5L355 555L358 553L354.5 554.5L353 555.5ZM316 527L316.5 528L316 527L316 525.5L315.5 522L315.5 517.5L316 516L315.5 517.5L315.5 522L316 525.5L316 527ZM333 468.5L332.5 469.5L333 468.5L333.5 467L334 465.5L334.5 463.5L335 462L335 459.5L335 458.5L334.5 459.5L334.5 462L334.5 463.5L334 465.5L333.5 467L333 468.5ZM330.5 425.5L330.5 426.5L330.5 425.5L330 423L329 420.5L328 418.5L327.5 418L325.5 414.5L327.5 418L328 419L329 420.5L329.5 423L330.5 425.5Z","x":382,"y":439}]');
const CHINA = {
  w,
  h,
  provinces
};
const SVG = "http://www.w3.org/2000/svg";
function svg(tag, attrs2) {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs2)) e.setAttribute(k, String(v));
  return e;
}
function stopTravel() {
  if (!activity("trip")) return;
  stopTask();
  speak$1({ c: "state", s: "overTripUp", now: true }, "speak");
}
function finishTour() {
  windowView({
    title: "旅游~~",
    msg: "该操作将清除旅游数据，并且可重新做相关旅游任务，确认花费8888元宝进行完成旅游成就么？",
    ok: (close2) => {
      if (pay(8888)) {
        update("gameSaveDatas", { travel_china: [], travel_china_num: save.gameSaveDatas.travel_china_num + 1 });
        resetTour();
      }
      close2();
    }
  });
}
let open$1 = false;
function openTravel() {
  if (open$1) return;
  open$1 = true;
  const map = svg("svg", { viewBox: `0 0 ${CHINA.w} ${CHINA.h}` });
  const regions2 = CHINA.provinces.map((p) => {
    const path = svg("path", { d: p.d });
    const tooltip2 = new Text();
    path.appendChild(svg("title", {})).append(tooltip2);
    const label = svg("text", { x: p.x, y: p.y });
    label.textContent = p.name;
    map.append(path);
    return { name: p.name, path, tooltip: tooltip2, label };
  });
  map.append(...regions2.map((r) => r.label));
  const tipText = new Text();
  const badge = img("lvcjImg", "pet/achievement/travel.svg");
  const badgeBox = div("", badge);
  const tip = div("tip fc fText", tipText, badgeBox);
  const go = button("but_normal fcc mr8", travel, " 去旅行 ");
  const stop2 = button("but_normal fcc", stopTravel);
  const finish2 = button("but_normal fcc ml8", finishTour, " 完成旅游成就 ");
  const refresh = () => {
    const visited = save.gameSaveDatas.travel_china;
    for (const r of regions2) {
      const n = visited.find((t) => t.name === r.name)?.value ?? 0;
      r.path.setAttribute("fill", n ? "#ff5428" : "#eeeeee");
      r.tooltip.data = r.name + (n ? `：已点亮${n}次` : "：未点亮");
    }
    const times = save.gameSaveDatas.travel_china_num;
    badgeBox.className = times ? "lvcj" : "noneLvcj";
    badge.title = `旅行成就*${times || "未点亮"}`;
    tipText.data = ` 提示: 每次随机旅行，旅行时间为60分钟 --- 当前已点亮 ${visited.length} 个城市（共${PROVINCES.length}个） `;
    const city = activity("trip");
    go.classList.toggle("disable", Boolean(city));
    stop2.classList.toggle("disable", !city);
    stop2.textContent = (city ? `当前所在城市：${city} 已经旅行 ${elapsed() | 0}分钟` : "") + " 停止旅行 ";
    finish2.style.display = visited.length === PROVINCES.length ? "" : "none";
  };
  refresh();
  const timer2 = window.setInterval(refresh, 1e3);
  const mapPane = div("fC f1 h0", tip, div("travelMain f1 h0", map), div("toTarvelBut fcc w100", go, stop2, finish2));
  const albumPane = div("f1 h0");
  const tabs2 = ["旅行地图", "相簿"].map((t, i) => button("travelTab fcc", () => show2(i), t));
  const show2 = (i) => {
    tabs2.forEach((b, j) => b.classList.toggle("on", i === j));
    mapPane.style.display = i === 0 ? "" : "none";
    albumPane.style.display = i === 1 ? "" : "none";
    if (i === 1) albumPane.replaceChildren(albumView());
  };
  show2(0);
  const content = div("travel fC", div("travelTabs fc", ...tabs2), mapPane, albumPane);
  openBox(div("ui-travel", content), {
    onClose: () => {
      clearInterval(timer2);
      open$1 = false;
    }
  });
}
const ICONS = "pet/control/icons/";
const BAR_HEIGHT = 180;
const BAR_WIDTH = 314;
const EDGE = 10;
const HEAD = 0.4;
const FEET = 0.95;
const HIDE_MS = touch ? 5e3 : 1500;
const PAGE = 4;
const activeIcon = (n) => `${ICONS}active/${n}.svg`;
const inventory = (type, icon, stat) => () => openPanel({
  icon: activeIcon(icon),
  list: (page) => listGoods(type, page, PAGE),
  lines: (g) => [...describe(g), `数量：${g.num}`],
  use: (g) => {
    useItem(g);
    return false;
  },
  type,
  stat
});
const PANELS = {
  food: inventory("food", 18, "hunger"),
  clean: inventory("clean", 20, "clean"),
  medicine: inventory("medicine", 22, "health"),
  toy: inventory("toy", 28, "mood")
};
const MENU = [
  {
    name: "日常",
    icon: "richang.png",
    children: [
      { name: "食物", icon: "weishi.png", run: PANELS.food },
      { name: "清洁", icon: "qingjie.png", run: PANELS.clean },
      { name: "吃药", icon: "zhibing.png", run: PANELS.medicine },
      { name: "玩具", icon: "wanshua.png", run: PANELS.toy }
    ]
  },
  {
    name: "交互",
    icon: "chongwu.png",
    children: [
      {
        name: "打工",
        icon: "dagong.png",
        run: () => openPanel({ icon: activeIcon(26), list: (page) => pageOf(workGoods(), page, PAGE), lines: describeWork, use: work })
      },
      {
        name: "学习",
        icon: "xuexi.png",
        run: () => openPanel({ icon: activeIcon(24), list: (page) => pageOf(studyGoods(), page, PAGE), lines: describeStudy, use: study })
      },
      { name: "旅游", icon: "lvyou.png", run: openTravel },
      { name: "看病", icon: "zhibing.png", run: doctor }
    ]
  },
  {
    name: "工具",
    icon: "renwu.png",
    children: [
      { name: "邮箱", icon: "haoyou.png", run: openEmail },
      { name: "任务", icon: "renwu1.png", run: openTask },
      { name: "签到", icon: "juanzhou00.png", run: openSignIn },
      { name: "设置", icon: "guanli.png", run: openSetup }
    ]
  },
  {
    name: "活动",
    icon: "gonggao.png",
    children: [
      { name: "池塘", icon: "fish01.png", run: openFishing },
      { name: "农场", icon: "nongchang01.png", run: openFarm },
      { name: "游戏", icon: "game.svg", run: openGames },
      { name: "密室", icon: "mstx.png", run: openMstx },
      { name: "社区", icon: "shequ.png", run: openCommunity }
    ]
  },
  { name: "档案", icon: "dangan.png", run: openPetInfo }
];
const control = div("control");
control.dataset.hit = "";
document.body.appendChild(div("ui-control", control));
let shown = false;
let hideTimer = 0;
let introTimer = 0;
let open = null;
function place() {
  const size2 = petSize();
  const scale = toolbarScaleFor(size2, (innerWidth - 2 * EDGE) / BAR_WIDTH, touch, window.qqpet.deviceKind);
  const height = BAR_HEIGHT * scale;
  const half = BAR_WIDTH * scale / 2 + EDGE;
  const feet = info.lastY + size2 * FEET;
  const onTop = feet > innerHeight - EDGE - height;
  control.classList.toggle("up", onTop);
  control.style.left = `${Math.min(Math.max(info.lastX + size2 / 2, half), innerWidth - half)}px`;
  control.style.top = `${onTop ? info.lastY + size2 * HEAD : feet}px`;
  control.style.transform = `scale(${scale})`;
  setBubbleLift(shown && onTop ? Math.max(height - size2 * HEAD, 0) : 0);
}
function pick(run) {
  run();
  if (touch && !open) hide();
}
const icons = [];
const menus = div(
  "menus fcc",
  ...MENU.map((g) => {
    const icon = div("menuItemIconBox", img("menuItemIcon", ICONS + g.icon));
    icons.push(icon);
    const item = div(
      "menuItem fcc focusPress",
      div("menuTip", g.name),
      icon,
      ...g.children ? [div("childrenMenu", ...g.children.map((c) => button("childrenMenuItem fc", () => pick(c.run), img("childrenMenuItemIcon", ICONS + c.icon), ` ${c.name}`)))] : []
    );
    if (g.run) item.addEventListener("click", g.run);
    item.addEventListener("mouseenter", () => {
      clearTimeout(introTimer);
      highlight(-1);
      clearTimeout(hideTimer);
    });
    item.addEventListener("mouseleave", scheduleHide);
    return item;
  })
);
control.appendChild(menus);
const highlight = (n) => icons.forEach((icon, i) => icon.classList.toggle("hoverMenuItemIcon", i === n));
function intro(n = 0) {
  highlight(n);
  if (n < icons.length) introTimer = window.setTimeout(() => intro(n + 1), 150);
}
function showControl() {
  if (save.isBury) return;
  clearTimeout(hideTimer);
  if (shown) return;
  shown = true;
  control.classList.add("showControl");
  place();
  intro();
}
function openGoods(type) {
  showControl();
  PANELS[type]();
}
function scheduleHide() {
  clearTimeout(hideTimer);
  if (open) return;
  hideTimer = window.setTimeout(hide, HIDE_MS);
}
function hide() {
  shown = false;
  control.classList.remove("showControl");
  place();
}
let list = null;
function openPanel(p, page = 1) {
  open = { ...p, page };
  menus.style.display = "none";
  const { list: goods, totalPage } = p.list(page);
  const turn = (d) => () => {
    if (page + d >= 1 && page + d <= totalPage) openPanel(p, page + d);
  };
  let picked = null;
  const items2 = goods.map(
    (g) => div(
      "goodItem",
      div(
        "goodItemIconBox fcc",
        div("goodInfo", div("goodName", g.name), ...p.lines(g).map((l) => div("goodDatas", l))),
        Object.assign(img("goodItemIcon", g.url), {
          onclick: () => {
            if (touch && picked !== g) return void (picked = g);
            if (p.use(g)) closePanel();
          }
        })
      )
    )
  );
  const next2 = div(
    "goodList focusPress",
    img("goodTypeIcon", p.icon),
    ...p.stat ? [button("toShoppingMall", openShop, "去购物")] : [],
    button("goodClose", closePanel),
    div(
      "goodListMain fcc",
      button("toLeft", turn(-1)),
      div(
        "goods f1 fC h100",
        div("fc f1", ...items2.length ? items2 : [div("goodsNone tc w100", " 空空如也~~ ")]),
        ...p.stat ? [div("progress", progress(info[p.stat], save.petComputedlInfo[`${p.stat}Max`]))] : []
      ),
      button("toRight", turn(1))
    )
  );
  if (list) list.replaceWith(next2);
  else control.appendChild(next2);
  list = next2;
}
function closePanel() {
  open = null;
  list?.remove();
  list = null;
  menus.style.display = "";
  scheduleHide();
}
onInfoChange((key) => {
  if (key === "lastX" || key === "lastY" || key === "growth") place();
  if (open && key === open.stat) openPanel(open, open.page);
});
onGoodsChange((type) => {
  if (open?.type === type) openPanel(open, Math.min(open.page, Math.max(open.list(1).totalPage, 1)));
});
const petEl$1 = document.getElementById("pet");
function draw() {
  const bg = save.selfGoodUseOption.background;
  petEl$1.style.backgroundImage = bg && bg.left > 0 && bg.id !== "b0000000" ? `url("${goodOf("background", bg.id).url}")` : "";
}
draw();
onGoodsChange((type) => {
  if (type === "background") draw();
});
const HANDOFF_MS = 1e4;
const MAX_QUEUE = 20;
const queue = [];
let busy = false;
function next() {
  const m = queue.shift();
  if (!m) {
    busy = false;
    return;
  }
  busy = true;
  const text = m.title ? `【${m.title}】${m.text}` : m.text;
  const url = m.url;
  const open2 = () => window.qqpet.openUrl(url);
  void say$2(text, url ? ["打开链接", "知道了"] : ["知道了"], url ? [open2] : [], m.duration * 1e3);
  window.setTimeout(next, m.duration > 0 ? Math.min(m.duration * 1e3, HANDOFF_MS) : HANDOFF_MS);
}
function initWebhook() {
  window.qqpet.onWebhook?.((m) => {
    if (!save.havePet || save.settings.quiet || !save.settings.webhook) return;
    if (queue.length < MAX_QUEUE) queue.push(m);
    if (!busy) next();
  });
}
const RATE = 16e3;
const MIN_MS = 300;
const MAX_MS = 6e4;
let ctx = null;
let mic = null;
let node = null;
let chunks = [];
let samples = 0;
let partTimer = 0;
let hearing = "";
const tell = (s2) => speak$1({ s: s2, now: true, ai: false }, "speak");
function hear(text) {
  const next2 = text ? `在听~：${text}` : "在听~…";
  const prev = hearing;
  hearing = next2;
  if (prev) void retell(prev, next2);
  else void say$2(next2, ["在听"]);
}
function initVoice() {
  window.qqpet.onVoiceStart?.(() => void start());
  window.qqpet.onVoiceStop?.(() => stop());
  window.qqpet.onVoicePartial?.((text) => {
    const s2 = voiceSink();
    if (s2) return s2.partial?.(text);
    hear(text);
  });
  window.qqpet.onVoiceText?.((text) => {
    hearing = "";
    const s2 = voiceSink();
    if (s2) return s2.final(text);
    if (!text) return tell("没听清呢~");
    void talkToPet(text);
  });
  window.qqpet.onVoiceError?.((message) => {
    hearing = "";
    tell(`耳朵出故障了：${message}`);
  });
}
async function start() {
  if (mic) return;
  try {
    mic = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return tell("主人~ 我听不到麦克风的声音呢");
  }
  chunks = [];
  samples = 0;
  const c = new AudioContext();
  ctx = c;
  const source = c.createMediaStreamSource(mic);
  node = c.createScriptProcessor(4096, 1, 1);
  node.onaudioprocess = (e) => {
    if (samples > MAX_MS / 1e3 * c.sampleRate) return;
    const data = new Float32Array(e.inputBuffer.getChannelData(0));
    chunks.push(data);
    samples += data.length;
  };
  const mute = c.createGain();
  mute.gain.value = 0;
  source.connect(node);
  node.connect(mute);
  mute.connect(c.destination);
  hearing = "";
  hear("");
  partTimer = window.setInterval(() => {
    const total = chunks.reduce((n, f) => n + f.length, 0);
    if (!c || total < c.sampleRate * 0.4) return;
    window.qqpet.voicePart?.(resample(join(chunks, total), c.sampleRate, RATE));
  }, 600);
}
function stop() {
  const c = ctx;
  if (!c || !mic) return;
  clearInterval(partTimer);
  node?.disconnect();
  void c.close().catch(() => {
  });
  mic.getTracks().forEach((t) => t.stop());
  const rate = c.sampleRate;
  const heard = chunks;
  ctx = null;
  mic = null;
  node = null;
  chunks = [];
  const total = heard.reduce((n, f) => n + f.length, 0);
  if (total < MIN_MS / 1e3 * rate) return tell("没听清呢~");
  window.qqpet.voiceAudio?.(resample(join(heard, total), rate, RATE));
}
function join(parts, total) {
  const out2 = new Float32Array(total);
  let at = 0;
  for (const p of parts) {
    out2.set(p, at);
    at += p.length;
  }
  return out2;
}
function resample(input, from, to) {
  if (from === to) return input;
  const out2 = new Float32Array(Math.round(input.length * to / from));
  for (let i = 0; i < out2.length; i++) {
    const at = i * from / to;
    const lo = Math.floor(at);
    const hi = Math.min(lo + 1, input.length - 1);
    out2[i] = input[lo] + (input[hi] - input[lo]) * (at - lo);
  }
  return out2;
}
function visibleContent(el2) {
  const view = el2.ownerDocument.defaultView;
  if (!view) return false;
  const box2 = el2.getBoundingClientRect();
  if (!box2.width || !box2.height) return false;
  const own = view.getComputedStyle(el2);
  if (own.visibility === "hidden" || own.visibility === "collapse") return false;
  let ancestor = el2;
  while (ancestor) {
    const style = view.getComputedStyle(ancestor);
    if (style.display === "none" || Number(style.opacity) === 0) return false;
    const root2 = ancestor.getRootNode();
    ancestor = ancestor.parentElement ?? root2.host ?? null;
  }
  return true;
}
const getContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(type, attrs2) {
  return getContext.call(this, type, type.startsWith("webgl") ? { ...attrs2, preserveDrawingBuffer: true } : attrs2);
};
const SIDE = 64;
const ALPHA = 16;
const PAD = 0.03;
const LOOK_MS = 150;
const GAP_MS = 500;
const probe = document.createElement("canvas");
probe.width = probe.height = SIDE;
const pen = probe.getContext("2d");
const movies = /* @__PURE__ */ new Map();
let shows = /* @__PURE__ */ new WeakMap();
function union(a, b) {
  if (!a || !b) return a ?? b;
  return { left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) };
}
function look(canvas) {
  pen.clearRect(0, 0, SIDE, SIDE);
  pen.drawImage(canvas, 0, 0, SIDE, SIDE);
  const px = pen.getImageData(0, 0, SIDE, SIDE).data;
  let [l, t, r, b] = [SIDE, SIDE, -1, -1];
  for (let i = 3; i < px.length; i += 4) {
    if (px[i] <= ALPHA) continue;
    const x = (i - 3) / 4 % SIDE;
    const y = Math.floor((i - 3) / 4 / SIDE);
    [l, t, r, b] = [Math.min(l, x), Math.min(t, y), Math.max(r, x + 1), Math.max(b, y + 1)];
  }
  return r < 0 ? null : { left: l / SIDE - PAD, top: t / SIDE - PAD, right: r / SIDE + PAD, bottom: b / SIDE + PAD };
}
function learn(url, part, through) {
  let m = movies.get(url);
  if (!m) movies.set(url, m = { part: null, known: false });
  m.part = union(m.part, part);
  m.known ||= through;
  return m.known ? m.part : void 0;
}
function drawn(player2, box2, current2 = false) {
  const canvas = player2.shadowRoot?.querySelector("canvas");
  const url = player2.dataset.swf;
  const meta = player2.ruffle().metadata;
  if (!canvas || !url || !meta) return current2 ? null : box2;
  const now2 = performance.now();
  let s2 = shows.get(player2);
  if (!s2 || s2.url !== url || now2 - s2.seen > GAP_MS) shows.set(player2, s2 = { url, since: now2, seen: now2, at: 0, part: null });
  s2.seen = now2;
  if (now2 - s2.at > LOOK_MS) {
    s2.at = now2;
    try {
      s2.part = look(canvas);
      s2.hit = s2.part;
    } catch {
      s2.part = void 0;
    } finally {
      Math.round(Math.max(0, performance.now() - now2) * 100) / 100;
    }
  }
  let p = current2 ? s2.hit : s2.part;
  if (!current2 && p !== void 0 && meta.numFrames > 1) p = learn(url, p, now2 - s2.since >= meta.numFrames / meta.frameRate * 1e3);
  if (p === void 0) return current2 ? null : box2;
  if (!p) return null;
  const { left, top: top2, width: w2, height: h2 } = box2;
  return { left: left + p.left * w2, top: top2 + p.top * h2, right: left + p.right * w2, bottom: top2 + p.bottom * h2 };
}
function coverage(el2, current2) {
  const box2 = el2.getBoundingClientRect();
  if (!visibleContent(el2)) return null;
  if (el2.id === "pet" && el2.style.backgroundImage) return box2;
  if (!el2.closest("#pet") || el2.matches(".point")) return box2;
  return el2.tagName === "RUFFLE-PLAYER" ? drawn(el2, box2, current2) : null;
}
function hitCover(el2) {
  return coverage(el2, true);
}
let lastPlatformError = "";
let lastPlatformErrorAt = -Infinity;
window.addEventListener("qqpet-platform-error", (event) => {
  const detail = event.detail;
  if (!detail || typeof detail.message !== "string") return;
  const message = typeof detail.operation === "string" ? `${detail.operation}：${detail.message}` : detail.message;
  const now2 = performance.now();
  if (message === lastPlatformError && now2 - lastPlatformErrorAt < 1e4) return;
  lastPlatformError = message;
  lastPlatformErrorAt = now2;
  windowView({ title: "平台操作失败", msg: message });
});
const petEl = document.getElementById("pet");
const HOLD_MS = 500;
let dragging = false;
let dragLifted = false;
let desktopOffset = { x: 0, y: 0 };
let desktopSequence = 0;
let dragMove = null;
function clampOnScreen() {
  const s2 = petSize();
  const area = viewportSize();
  setInfo("lastX", Math.min(Math.max(info.lastX, 0), Math.max(0, area.width - s2)));
  setInfo("lastY", Math.min(Math.max(info.lastY, 0), Math.max(0, area.height - s2)));
}
function snapEdge() {
  const edge = applyEdge();
  if (!edge) clampOnScreen();
  return edge;
}
let size = petSize();
let previousViewport = { ...viewportSize(), size };
function layout() {
  const shift = dragging ? 0 : (petSize() - size) / 2;
  size = petSize();
  if (shift) {
    setInfo("lastX", info.lastX - shift);
    setInfo("lastY", info.lastY - shift);
    clampOnScreen();
  }
  petEl.style.width = petEl.style.height = `${size}px`;
  petEl.style.left = `${info.lastX}px`;
  petEl.style.top = `${info.lastY}px`;
  const area = viewportSize();
  if (area.width === previousViewport.width && area.height === previousViewport.height) previousViewport.size = size;
}
if (info.lastX === -1 && info.lastY === -1) {
  setInfo("lastX", (innerWidth - size) / 2);
  setInfo("lastY", (innerHeight - size) / 2);
}
clampOnScreen();
function resizeMobilePet() {
  const next2 = { ...viewportSize(), size: petSize() };
  if (next2.width === previousViewport.width && next2.height === previousViewport.height && next2.size === previousViewport.size) return;
  const pose = machine.pose.a;
  const edge = pose === "hideleft" || pose === "hideright" ? pose : null;
  const position = resizePetPosition({ x: info.lastX, y: info.lastY }, previousViewport, next2, edge);
  if (dragging) petInput.cancel();
  previousViewport = next2;
  size = next2.size;
  setInfo("lastX", position.x);
  setInfo("lastY", position.y);
  layout();
}
if (window.qqpet.setDragging) addEventListener("resize", () => {
  if (!dragging) clampOnScreen();
});
else {
  let resizeFrame = 0;
  const scheduleResize = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      resizeMobilePet();
    });
  };
  addEventListener("resize", scheduleResize);
  const viewportObserver = new ResizeObserver(scheduleResize);
  viewportObserver.observe(document.documentElement);
  addEventListener("pagehide", () => {
    viewportObserver.disconnect();
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    removeEventListener("resize", scheduleResize);
  });
}
layout();
onInfoChange((key) => {
  if (key === "lastX" || key === "lastY" || key === "growth") layout();
});
const cursor = { x: 0, y: 0 };
window.API = {
  GetCursorPosition: () => `${cursor.x},${cursor.y},0`,
  GetWindowRect: () => `${info.lastX},${info.lastY},${size},${size}`,
  // No PetEden.ini: every key reads as its default, as the Windows call does for a missing file.
  GetPrivateProfileString: (_section, _key, fallback) => fallback,
  // Release positioning and flings belong to the host. An outgoing movie may
  // still run its drop frames while the replacement loads.
  MoveBy: () => {
  }
};
window.DataCenter_ReadInt32 = (key) => key === "drag" && dragLifted ? 1 : 0;
let interactive = false;
let out = false;
const MENU_LEAVE_MS = 300;
let menuLeave = 0;
function petHitBoxes() {
  if (petEl.hidden || save.settings.hidden) return [];
  if (machine.pose.a !== "hideleft" && machine.pose.a !== "hideright") {
    return [{ left: info.lastX, top: info.lastY, right: info.lastX + size, bottom: info.lastY + size }];
  }
  return [petEl, ...petEl.querySelectorAll("ruffle-player")].map((el2) => hitCover(el2)).filter((box2) => box2 !== null);
}
const overPet = (x, y) => petHitBoxes().some((r) => x >= r.left && x < r.right && y >= r.top && y < r.bottom);
const syncDesktop = (p) => {
  const area = p.desktop;
  if (!area) return true;
  if (area.sequence <= desktopSequence) return false;
  desktopSequence = area.sequence;
  const k = (pageZoom() ?? area.zoom) / area.zoom;
  const dx = area.offset.x - desktopOffset.x * k;
  const dy = area.offset.y - desktopOffset.y * k;
  desktopOffset = area.offset;
  setDesktopSize(area);
  setInfo("lastX", info.lastX * k + dx);
  setInfo("lastY", info.lastY * k + dy);
  if (save.settings.petDisplayId !== area.id) update("settings", { petDisplayId: area.id });
  if (!dragging) clampOnScreen();
  layout();
  return true;
};
function updateCursor(p) {
  if (!syncDesktop(p)) return;
  dragMove?.(p);
  cursor.x = p.x;
  cursor.y = p.y;
  const { cropX = 0, cropY = 0 } = document.documentElement.dataset;
  const el2 = document.elementFromPoint(p.x - Number(cropX), p.y - Number(cropY));
  const root2 = el2?.getRootNode();
  const host2 = root2 instanceof ShadowRoot ? root2.host : el2;
  const panelHit = host2?.closest("[data-hit]") && (!host2.closest("#pet") || host2.closest(".point"));
  const hit = dragging || overPet(p.x, p.y) || !!panelHit;
  const inside = p.x >= 0 && p.y >= 0 && p.x < innerWidth && p.y < innerHeight;
  if (!hit && inside) {
    menuLeave ||= setTimeout(() => {
      menuLeave = 0;
      closeMenu();
    }, MENU_LEAVE_MS);
  } else if (menuLeave) {
    clearTimeout(menuLeave);
    menuLeave = 0;
  }
  if (out && !hit) {
    out = false;
    const edge = snapEdge();
    if (edge && machine.pose.a === "normal") machine.play({ a: edge });
  }
  if (hit === interactive) return;
  interactive = hit;
  window.qqpet.setClickThrough(!hit);
}
window.qqpet.onCursor(updateCursor);
const setHitShape = window.qqpet.setHitShape;
if (setHitShape || window.qqpet.setDragging) {
  let sent = "";
  setInterval(() => {
    if (!dragging) updateCursor(cursor);
    if (!setHitShape) return;
    const rects = [];
    if (dragging) rects.push({ x: 0, y: 0, width: innerWidth, height: innerHeight });
    else if (!save.settings.hidden) {
      for (const r of petHitBoxes()) rects.push({ x: r.left, y: r.top, width: r.right - r.left, height: r.bottom - r.top });
      for (const el2 of document.querySelectorAll("#pet, [data-hit], [data-hit] *")) {
        if (el2.closest("#pet") && !el2.matches(".point")) continue;
        if (!el2.checkVisibility({ visibilityProperty: true }) || getComputedStyle(el2).pointerEvents === "none") continue;
        const r = el2.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) rects.push({ x: r.x, y: r.y, width: r.width, height: r.height });
      }
    }
    const key = JSON.stringify(rects);
    if (key === sent) return;
    sent = key;
    setHitShape(rects);
  }, 50);
}
window.addEventListener("qqpet-hidden-change", () => {
  if (save.settings.hidden) petInput.cancel();
  updateCursor(cursor);
});
if (window.qqpet.setDragging) void window.qqpet.setDragging(false).then(syncDesktop);
petEl.addEventListener("contextmenu", (e) => {
  if (overPet(pageX(e), pageY(e))) openMenu({ x: pageX(e), y: pageY(e), pet: true }, adoptPet);
});
let lastTapAt = 0;
async function doubleTapBubble() {
  if (save.settings.quiet) return;
  if (aiOn()) {
    try {
      const line2 = await ask([{ role: "user", content: `主人双击了你，想和你互动。请结合当前时间、天气、你的心情状态和今天发生的事，对主人说一句亲近的话或提一个有趣的小问题，口语化、不超过30字，只输出这句话，不要解释。${frontHint()}` }]);
      if (line2) {
        speak$1({ s: line2, ai: false, opts: true, now: true }, "speak");
        return;
      }
    } catch (e) {
    }
  }
  speak$1({ c: "smallTalk", ai: IDLE$1, opts: true, now: true }, "speak", { ok: cheer });
}
let releaseDomInput = () => {
};
const petInput = createPetInput({
  clock: () => performance.now(),
  requestFrame: requestAnimationFrame,
  cancelFrame: cancelAnimationFrame,
  position: () => ({ x: info.lastX, y: info.lastY, size }),
  begin: () => {
    clearFacePoints();
    closeMenu();
    if (save.settings.petBar) showControl();
    catchDiudiule();
  },
  active: (on) => {
    dragging = on;
    if (!on) {
      dragLifted = false;
      releaseDomInput();
    }
  },
  hold: (x, y) => openMenu({ x, y, pet: true }, adoptPet),
  lift: (s2, align) => {
    dragLifted = true;
    if (stage$1() === "Adult") {
      machine.play({
        a: "drag",
        opt: { url: "pet/Action/drag.swf", opt: {} },
        s: () => align({ dx: s2 * 0.58, dy: s2 * 0.3, duration: 120 })
      });
      return null;
    }
    machine.play({ a: "drag" });
    return null;
  },
  move: (x, y, lifted) => {
    setInfo("lastX", x);
    setInfo("lastY", y);
    if (!lifted) clampOnScreen();
  },
  end: (lifted, vx2, vy2, cancelled) => {
    if (releaseDiudiule(cancelled ? false : lifted, vx2, vy2)) return scheduleHide();
    const edge = snapEdge();
    if (edge && !lifted && !cancelled && machine.pose.a === edge) {
      out = true;
      machine.play({ a: "normal" });
    } else if (edge) machine.play({ a: edge });
    else if (lifted || machine.pose.a === "hideleft" || machine.pose.a === "hideright") machine.play({ a: "normal" });
    scheduleHide();
    if (touch && !lifted && !cancelled) showFacePoints();
    if (!touch && !lifted && !cancelled) {
      const now2 = performance.now();
      if (now2 - lastTapAt < 380 && now2 - lastTapAt > 0) {
        lastTapAt = 0;
        void doubleTapBubble();
      } else lastTapAt = now2;
    }
  }
}, touch ? HOLD_MS : 0);
window.__qqpetInput = (input) => {
  if ((window.__qqpetHostPaused || save.settings.hidden) && input.phase !== "cancel") return;
  cursor.x = input.x;
  cursor.y = input.y;
  petInput.send({ ...input, source: "native" });
};
addEventListener("pagehide", () => petInput.cancel());
petEl.addEventListener("pointerdown", (e) => {
  if (save.settings.hidden || window.__qqpetNativePetInput || window.__qqpetHostPaused || e.button !== 0 || e.target.closest(".point")) return;
  if (!overPet(pageX(e), pageY(e))) return;
  if (petInput.active) return;
  const nativeDrag = window.qqpet.setDragging;
  let lastPoint = { x: pageX(e), y: pageY(e) };
  const sample = (phase, p) => ({
    phase,
    id: e.pointerId,
    x: p.x,
    y: p.y,
    source: "dom",
    ...nativeDrag ? { globalX: p.x - desktopOffset.x, globalY: p.y - desktopOffset.y, scaleGrab: true } : {}
  });
  petInput.send(sample("begin", lastPoint));
  if (!petInput.active) return;
  let ending = false;
  let disposed = false;
  const start2 = lastPoint;
  let shift = null;
  const fromDesktop = (p) => {
    shift ??= { id: p.desktop?.id, x: p.x - start2.x, y: p.y - start2.y };
    lastPoint = shift.id === p.desktop?.id ? { ...p, x: p.x - shift.x, y: p.y - shift.y } : p;
    petInput.send(sample("move", lastPoint));
  };
  const move = (m) => {
    if (nativeDrag || m.pointerId !== e.pointerId) return;
    lastPoint = { x: pageX(m), y: pageY(m) };
    petInput.send(sample("move", lastPoint));
  };
  const failed = (error) => {
    console.error("Native desktop drag failed:", error);
    if (!disposed) petInput.cancel();
  };
  const stopFollowing = () => {
    if (nativeDrag) void nativeDrag(false).then(syncDesktop).catch(failed);
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    petEl.removeEventListener("pointermove", move);
    petEl.removeEventListener("pointerup", end);
    petEl.removeEventListener("pointercancel", end);
    if (nativeDrag) {
      removeEventListener("pointerup", end);
      removeEventListener("pointercancel", end);
      if (dragMove === fromDesktop) dragMove = null;
      if (!ending) {
        ending = true;
        stopFollowing();
      }
    }
    if (petEl.hasPointerCapture(e.pointerId)) petEl.releasePointerCapture(e.pointerId);
    releaseDomInput = () => {
    };
  };
  const end = (m) => {
    if (m.pointerId !== e.pointerId || ending || disposed) return;
    ending = true;
    if (m.type === "pointercancel") {
      petInput.send(sample("cancel", lastPoint));
      stopFollowing();
      return;
    }
    if (nativeDrag) {
      void nativeDrag(false).then((p) => {
        if (disposed) return;
        if (syncDesktop(p)) fromDesktop(p);
        petInput.send(sample("end", lastPoint));
      }).catch(failed);
    } else {
      lastPoint = { x: pageX(m), y: pageY(m) };
      petInput.send(sample("end", lastPoint));
    }
  };
  releaseDomInput = dispose;
  if (nativeDrag) {
    dragMove = fromDesktop;
    void nativeDrag(true).then((p) => {
      if (!disposed && !ending && syncDesktop(p)) fromDesktop(p);
    }).catch(failed);
  }
  petEl.setPointerCapture(e.pointerId);
  petEl.addEventListener("pointermove", move);
  petEl.addEventListener("pointerup", end);
  petEl.addEventListener("pointercancel", end);
  if (nativeDrag) {
    addEventListener("pointerup", end);
    addEventListener("pointercancel", end);
  }
});
if (touch) {
  const tip = div("touchTip");
  const eat = (c) => c.stopPropagation();
  document.addEventListener(
    "pointerdown",
    (e) => {
      tip.remove();
      const text = e.target.closest("[title]")?.getAttribute("title");
      if (!text) return;
      const hold = setTimeout(() => {
        tip.textContent = text;
        tip.style.left = `${Math.min(Math.max(e.clientX, 110), innerWidth - 110)}px`;
        tip.style.top = `${e.clientY}px`;
        document.body.append(tip);
      }, HOLD_MS);
      const move = (m) => {
        if (Math.hypot(m.clientX - e.clientX, m.clientY - e.clientY) > 8) end();
      };
      const end = () => {
        clearTimeout(hold);
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointercancel", end);
        document.removeEventListener("pointerup", up);
      };
      const up = () => {
        end();
        if (!tip.isConnected) return;
        document.addEventListener("click", eat, true);
        setTimeout(() => document.removeEventListener("click", eat, true));
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointercancel", end);
      document.addEventListener("pointerup", up);
    },
    true
  );
}
const begin = () => {
  petEl.hidden = false;
  startPet();
};
const adoptPet = () => adopt(begin);
window.qqpet.onTrayClick((c) => {
  if (menuLeave) {
    clearTimeout(menuLeave);
    menuLeave = 0;
  }
  const x = c.x ?? innerWidth - 60;
  const y = c.y ?? 0;
  if (c.kind === "menu") {
    closeState();
    openMenu({ x, y, pet: false }, adoptPet);
  } else if (save.havePet) {
    closeMenu();
    openState(x, y, c.autoClose, c.focusTaken);
  } else adoptPet();
});
const CLIP_MAX = 60;
window.qqpet.onClipboard((text) => {
  if (!save.havePet) return;
  note("主人刚复制了一段文字");
  speak$1({ s: text.length > CLIP_MAX ? `${text.slice(0, CLIP_MAX)}…` : text, b: "当前复制的文字", now: true, ai: clipAsk(text) }, "speak");
});
initLanVisit();
initWebhook();
initMemory();
initVoice();
window.qqpet.onPresence((gone) => {
  if (!save.havePet) return;
  if (gone) {
    note("主人离开了一会儿");
    return;
  }
  note("主人回来了");
  speak$1({ s: "[host]，你回来啦~", now: true, ai: IDLE$1 }, "appear");
});
const DWELL = 10 * 60 * 1e3;
let front = "";
let frontSince = 0;
let frontNoted = "";
window.qqpet.onFront((name2) => {
  front = name2;
  frontSince = Date.now();
});
setInterval(() => {
  if (!save.settings.watchApp || !save.havePet || !front || front === frontNoted || Date.now() - frontSince < DWELL) return;
  frontNoted = front;
  note(/[A-Za-z]/.test(front) ? `主人在用「${front}」` : `主人在${front}`);
}, 15e3);
if (save.havePet) {
  resumeTask();
  begin();
} else adoptPet();
startAutoUpdate();
