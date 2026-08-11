// 帆布包品类卡的透明抠图（用户提供的 素材/提示词岛台/卡片位/帆布包.png，
// 已重排到 170x105 统一画布：包体左对齐、底边贴齐、提手破出玻璃卡上沿，
// 与T恤/卫衣同一构图规范，无损 WebP）。
// base64 拆成 tote-art/ 下两个分块存放，拼接后去除空白即可还原。
import { toteArtworkPart1 } from "./tote-art/part-1.js";
import { toteArtworkPart2 } from "./tote-art/part-2.js";

export const promptToteArtwork =
  "data:image/webp;base64," +
  (toteArtworkPart1 + toteArtworkPart2).replace(/\s/g, "");
