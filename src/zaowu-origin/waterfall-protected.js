import { waterfallAssetsLTY } from "./waterfall-assets-l-y.js";
import { waterfallAssets1To13 } from "./waterfall-assets-1-13.js";

const existingProtectedIds = "ABCDEFGHIJK".split("");
const cardSelector = ".community-masonry-column .community-card";
const addedSelector = '[data-waterfall-protected-added="true"]';
const remakeButtonClass = "waterfall-remake-cta";
const remakeStyleId = "waterfall-remake-cta-runtime-styles";
const remakeEventName = "ai-zaowu:waterfall-remake";
const openEventName = "ai-zaowu:waterfall-open";
let applying = false;
let scheduled = false;
let lastSyncedColumnCount = 0;

function ensureRemakeStyles() {
  if (document.getElementById(remakeStyleId)) return;

  const style = document.createElement("style");
  style.id = remakeStyleId;
  style.textContent = `
    .community-card[data-waterfall-remake-host="true"] {
      position: relative !important;
      overflow: hidden !important;
      isolation: isolate;
    }

    .community-card[data-waterfall-remake-host="true"] > img {
      display: block;
    }

    .community-card[data-waterfall-remake-host="true"] .community-body {
      display: none !important;
    }

    .community-card[data-waterfall-remake-host="true"]::before {
      content: none !important;
    }

    .community-card[data-waterfall-remake-host="true"] > .waterfall-remake-cta {
      position: absolute !important;
      inset: auto 12px 12px 12px !important;
      z-index: 20 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: auto !important;
      height: 44px !important;
      min-height: 44px !important;
      margin: 0 !important;
      padding: 0 16px !important;
      box-sizing: border-box;
      color: #181818;
      font-family: inherit;
      font-size: 15px;
      font-weight: 500;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      background: rgba(255, 255, 255, 0.85);
      border: 0;
      border-radius: 14px;
      box-shadow: none;
      opacity: 0;
      visibility: hidden;
      transform: translate3d(0, 8px, 0);
      transition:
        opacity 180ms ease,
        transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
        visibility 0s linear 220ms;
      pointer-events: none;
      cursor: pointer;
      backdrop-filter: blur(12px) saturate(110%);
      -webkit-backdrop-filter: blur(12px) saturate(110%);
    }

    .community-card[data-waterfall-remake-host="true"]:hover > .waterfall-remake-cta,
    .community-card[data-waterfall-remake-host="true"]:focus-visible > .waterfall-remake-cta,
    .community-card[data-waterfall-remake-host="true"]:focus-within > .waterfall-remake-cta {
      opacity: 1;
      visibility: visible;
      transform: translate3d(0, 0, 0);
      transition-delay: 0s;
      pointer-events: auto;
    }

    @media (max-width: 720px) {
      .community-card[data-waterfall-remake-host="true"] > .waterfall-remake-cta {
        inset: auto 10px 10px 10px !important;
        height: 40px !important;
        min-height: 40px !important;
        border-radius: 13px;
        font-size: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .community-card[data-waterfall-remake-host="true"] > .waterfall-remake-cta {
        transform: none;
        transition: opacity 120ms ease;
      }
    }
  `;
  document.head.append(style);
}

function primaryImage(card) {
  return card.querySelector(":scope > img");
}

function ensureRemakeButton(card) {
  card.dataset.waterfallRemakeHost = "true";

  const image = primaryImage(card);
  let button = card.querySelector(":scope > ." + remakeButtonClass);

  if (!button) {
    button = document.createElement("button");
    button.className = remakeButtonClass;
    button.type = "button";
    button.textContent = "做同款";
    button.setAttribute("aria-label", "使用这张作品的提示词和生成参数做同款");
  }

  if (image && image.nextElementSibling !== button) {
    image.insertAdjacentElement("afterend", button);
  } else if (!button.parentElement) {
    card.append(button);
  }

  return button;
}

function closestCardVariant(ratio) {
  const variants = [
    ["square", 1],
    ["standard", 0.9],
    ["product", 0.86],
    ["tall", 0.76],
  ];
  return variants.reduce((best, current) =>
    Math.abs(current[1] - ratio) < Math.abs(best[1] - ratio)
      ? current
      : best,
  )[0];
}

function setCardAsset(card, asset) {
  const image = primaryImage(card);
  if (!image) return;

  const title = `灵感作品 ${asset.id}`;
  const variant = closestCardVariant(asset.ratio);
  const nextClassName = `community-card ${variant}`;

  if (image.getAttribute("src") !== asset.src) image.setAttribute("src", asset.src);
  if (image.alt !== title) image.alt = title;
  if (card.className !== nextClassName) card.className = nextClassName;
  if (card.getAttribute("aria-label") !== `查看灵感作品：${title}`) {
    card.setAttribute("aria-label", `查看灵感作品：${title}`);
  }
  if (card.dataset.waterfallProtectedId !== asset.id) {
    card.dataset.waterfallProtectedId = asset.id;
  }
}

function markOriginalProtectedCards(cards) {
  let protectedIndex = 0;
  let replacementIndex = 0;

  for (const card of cards) {
    if (card.dataset.waterfallProtectedId) continue;

    const image = primaryImage(card);
    if (!image) continue;

    if (image.src.startsWith("data:")) {
      const id = existingProtectedIds[protectedIndex];
      if (id) card.dataset.waterfallProtectedId = id;
      protectedIndex += 1;
      continue;
    }

    const asset = waterfallAssetsLTY[replacementIndex];
    if (asset) setCardAsset(card, asset);
    replacementIndex += 1;
  }
}

function makeAddedCard(template, asset) {
  const card = template.cloneNode(true);
  delete card.dataset.waterfallProtectedId;
  card.dataset.waterfallProtectedAdded = "true";
  setCardAsset(card, asset);

  const footer = card.querySelector(".community-footer");
  const author = footer?.children?.[1];
  if (author && author.textContent !== "AI造物社区") {
    author.textContent = "AI造物社区";
  }
  return card;
}

function syncAddedCards(columns, baseCards) {
  const existingAdded = Array.from(
    document.querySelectorAll(`${cardSelector}${addedSelector}`),
  );
  const expectedIds = new Set(
    waterfallAssets1To13.map((asset) => asset.id),
  );
  const existingIds = existingAdded.map(
    (card) => card.dataset.waterfallProtectedId,
  );
  const isComplete =
    existingAdded.length === expectedIds.size &&
    existingIds.every((id) => expectedIds.has(id)) &&
    new Set(existingIds).size === expectedIds.size;

  // The story first renders its three core columns, then mounts two more for
  // the expanded five-column waterfall. A complete asset set may therefore
  // still be stranded in the original three columns. Rebalance whenever the
  // live column count changes so the newly visible left side receives cards.
  const columnSetChanged = lastSyncedColumnCount !== columns.length;
  if ((isComplete && !columnSetChanged) || columns.length === 0 || baseCards.length === 0) return;
  existingAdded.forEach((card) => card.remove());

  const estimatedCardHeight = (card) => {
    if (card.classList.contains("tall")) return 1 / 0.76;
    if (card.classList.contains("product")) return 1 / 0.86;
    if (card.classList.contains("wide")) return 1 / 1.12;
    if (card.classList.contains("square")) return 1;
    return 1 / 0.9;
  };
  const columnVisualWeight = (column) => Array.from(
    column.querySelectorAll(".community-card"),
  ).reduce((total, card) => total + estimatedCardHeight(card) + 0.08, 0);

  waterfallAssets1To13.forEach((asset, index) => {
    const template = baseCards[index % baseCards.length];
    const column = columns.reduce((shortest, candidate) =>
      columnVisualWeight(candidate) < columnVisualWeight(shortest)
        ? candidate
        : shortest,
    );
    column.append(makeAddedCard(template, asset));
  });
  lastSyncedColumnCount = columns.length;
}

function titleForCard(card) {
  const image = primaryImage(card);
  const rawTitle = image?.alt?.trim();
  return rawTitle || `灵感作品 ${card.dataset.waterfallProtectedId || ""}`.trim();
}

function sizeForCard(card) {
  const image = primaryImage(card);
  const width = image?.naturalWidth || 0;
  const height = image?.naturalHeight || 0;
  const ratio = width > 0 && height > 0
    ? width / height
    : card.classList.contains("square")
      ? 1
      : card.classList.contains("tall")
        ? 0.75
        : card.classList.contains("product")
          ? 0.78
          : 0.9;
  const sizeOptions = [
    ["1024x1536", 2 / 3],
    ["1024x1365", 3 / 4],
    ["1024x1024", 1],
    ["1365x1024", 4 / 3],
    ["1536x1024", 3 / 2],
  ];
  return sizeOptions.reduce((best, option) =>
    Math.abs(option[1] - ratio) < Math.abs(best[1] - ratio) ? option : best,
  )[0];
}

function remakePresetForCard(card) {
  const image = primaryImage(card);
  const title = titleForCard(card);
  const prompt = `以“${title}”为核心视觉，保留原作的主体特征、配色关系与构图节奏，转化为适合文创印刷的干净图案；主体清晰、层次自然、背景简洁、无水印与无关文字。`;
  return {
    id: card.dataset.waterfallProtectedId || `waterfall-${Date.now()}`,
    title,
    image: image?.currentSrc || image?.src || "",
    author: "AI造物社区",
    likes: "精选",
    prompt,
    model: "creative-v2",
    size: sizeForCard(card),
    quality: "high",
  };
}

function remakeParametersForCard(card) {
  const preset = remakePresetForCard(card);
  return {
    id: preset.id,
    title: preset.title,
    prompt: preset.prompt,
    model: preset.model,
    size: preset.size,
    quality: preset.quality,
  };
}

function dispatchRemake(card) {
  window.dispatchEvent(new CustomEvent(remakeEventName, {
    detail: remakeParametersForCard(card),
  }));
}

function dispatchOpen(card) {
  window.dispatchEvent(new CustomEvent(openEventName, {
    detail: { item: remakePresetForCard(card) },
  }));
}

function handleAddedCardClick(event) {
  if (event.target.closest?.(`.${remakeButtonClass}`)) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  dispatchOpen(event.currentTarget);
}

function handleAddedCardKeyDown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest?.(`.${remakeButtonClass}`)) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  dispatchOpen(event.currentTarget);
}

function ensureAddedCardInteractions(card) {
  card.setAttribute("role", "button");
  card.tabIndex = 0;
  if (card.dataset.waterfallInteractionBound === "true") return;
  card.dataset.waterfallInteractionBound = "true";
  card.addEventListener("click", handleAddedCardClick);
  card.addEventListener("keydown", handleAddedCardKeyDown);
}

function handleWaterfallClick(event) {
  const remakeButton = event.target.closest?.(`.${remakeButtonClass}`);
  if (!remakeButton) return;
  const card = remakeButton.closest(cardSelector);
  if (!card) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  dispatchRemake(card);
}

function installWaterfallInteractions() {
  document.addEventListener("click", handleWaterfallClick, true);
}

function applyProtectedWaterfall() {
  if (applying) return;
  applying = true;
  try {
    ensureRemakeStyles();

    const columns = Array.from(
      document.querySelectorAll(".community-masonry-column"),
    );
    const baseCards = Array.from(document.querySelectorAll(cardSelector)).filter(
      (card) => card.dataset.waterfallProtectedAdded !== "true",
    );
    if (columns.length === 0 || baseCards.length === 0) return;

    markOriginalProtectedCards(baseCards);
    syncAddedCards(columns, baseCards);
    document
      .querySelectorAll(`${cardSelector}${addedSelector}`)
      .forEach(ensureAddedCardInteractions);
    document.querySelectorAll(cardSelector).forEach(ensureRemakeButton);
  } finally {
    applying = false;
  }
}

function scheduleApply() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    applyProtectedWaterfall();
  });
}

installWaterfallInteractions();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
} else {
  scheduleApply();
}

new MutationObserver(scheduleApply).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
