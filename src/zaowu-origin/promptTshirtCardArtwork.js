// T恤品类卡的透明抠图（用户提供的 素材/提示词岛台/卡片位/T恤.png，
// 已重排到 170x105 统一画布：左缘齐平、底边贴齐、领口破出玻璃卡上沿，
// 与卫衣/帆布包同一构图规范，无损 WebP）。
// base64 拆成 tshirt-art/ 下三个分块存放，拼接后去除空白即可还原。
import { tshirtArtworkPart1 } from "./tshirt-art/part-1.js";
import { tshirtArtworkPart2 } from "./tshirt-art/part-2.js";
import { tshirtArtworkPart3 } from "./tshirt-art/part-3.js";

export const promptTshirtCardArtwork =
  "data:image/webp;base64," +
  (tshirtArtworkPart1 + tshirtArtworkPart2 + tshirtArtworkPart3).replace(/\s/g, "");
