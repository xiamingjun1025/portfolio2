// 卫衣品类卡的透明抠图（用户提供的 素材/提示词岛台/卡片位/卫衣.png，
// 已重排到 170x105 统一画布：左缘齐平、底边贴齐、帽领破出玻璃卡上沿，
// 与T恤/帆布包同一构图规范，无损 WebP）。
// base64 拆成 hoodie-art/ 下三个分块存放，拼接后去除空白即可还原。
import { hoodieArtworkPart1 } from "./hoodie-art/part-1.js";
import { hoodieArtworkPart2 } from "./hoodie-art/part-2.js";
import { hoodieArtworkPart3 } from "./hoodie-art/part-3.js";

export const promptHoodieArtwork =
  "data:image/webp;base64," +
  (hoodieArtworkPart1 + hoodieArtworkPart2 + hoodieArtworkPart3).replace(/\s/g, "");
