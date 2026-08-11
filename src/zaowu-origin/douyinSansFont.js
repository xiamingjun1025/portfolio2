// 首页大标题与品类名使用的「抖音美好体」（Douyin Sans Bold）。
// 原外链字体 CDN（ik.imagekit.io/fonts120）因流量超限返回 429 失效，
// 改为自托管：官方 TTF（github.com/bytedance/fonts，SIL OFL 协议）
// 按页面实际用字子集化为 14KB woff2，base64 拆成 douyin-sans-font/
// 下五个分块存放，拼接解码后通过 FontFace API 注册为 "Douyin Sans"
// （与 styles.css 中 font-family: "Douyin Sans" 的引用一致）；
// 加载完成前由系统字体兜底，完成后自动替换。
import { douyinSansPart1 } from "./douyin-sans-font/part-1.js";
import { douyinSansPart2 } from "./douyin-sans-font/part-2.js";
import { douyinSansPart3 } from "./douyin-sans-font/part-3.js";
import { douyinSansPart4 } from "./douyin-sans-font/part-4.js";
import { douyinSansPart5 } from "./douyin-sans-font/part-5.js";

const base64 = (
  douyinSansPart1 +
  douyinSansPart2 +
  douyinSansPart3 +
  douyinSansPart4 +
  douyinSansPart5
).replace(/\s/g, "");

const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
const douyinSans = new FontFace("Douyin Sans", bytes.buffer, {
  style: "normal",
  weight: "700",
  display: "swap",
});

export const douyinSansReady = douyinSans
  .load()
  .then((face) => {
    document.fonts.add(face);
    return document.fonts.load('700 1em "Douyin Sans"', "灵感造物以诞生好");
  })
  .catch(() => {
    /* 字体注册失败时保持系统字体兜底 */
    return false;
  });
