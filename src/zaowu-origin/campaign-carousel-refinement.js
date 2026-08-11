import { campaignCarouselSlides } from "./campaign-carousel-assets.js";

const styleId = "campaign-carousel-refinement-styles";
const enhancedAttribute = "data-campaign-carousel-refined";
const bannerStates = new WeakMap();

function installStyles() {
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .community-campaign-banner .campaign-banner-media::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
      animation: none !important;
      background:
        linear-gradient(180deg, rgba(12, 15, 22, 0) 46%, rgba(12, 15, 22, 0.08) 62%, rgba(12, 15, 22, 0.58) 100%) !important;
    }

    .community-campaign-banner .campaign-banner-content {
      display: none !important;
    }

    .community-campaign-banner .campaign-banner-media img {
      opacity: 0;
      transform: translate3d(100%, 0, 0);
      transition: none !important;
      will-change: transform;
    }

    .community-campaign-banner .campaign-banner-media img.is-active {
      z-index: 1;
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .community-campaign-banner .campaign-banner-media img.is-entering-from-right {
      z-index: 2;
      animation: campaign-slide-enter-from-right 620ms cubic-bezier(0.22, 0.75, 0.24, 1) both;
    }

    .community-campaign-banner .campaign-banner-media img.is-entering-from-left {
      z-index: 2;
      animation: campaign-slide-enter-from-left 620ms cubic-bezier(0.22, 0.75, 0.24, 1) both;
    }

    .community-campaign-banner .campaign-banner-media img.is-exiting-to-left {
      z-index: 1;
      opacity: 1;
      animation: campaign-slide-exit-to-left 620ms cubic-bezier(0.22, 0.75, 0.24, 1) both;
    }

    .community-campaign-banner .campaign-banner-media img.is-exiting-to-right {
      z-index: 1;
      opacity: 1;
      animation: campaign-slide-exit-to-right 620ms cubic-bezier(0.22, 0.75, 0.24, 1) both;
    }

    @keyframes campaign-slide-enter-from-right {
      from { opacity: 1; transform: translate3d(100%, 0, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }

    @keyframes campaign-slide-enter-from-left {
      from { opacity: 1; transform: translate3d(-100%, 0, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }

    @keyframes campaign-slide-exit-to-left {
      from { opacity: 1; transform: translate3d(0, 0, 0); }
      to { opacity: 1; transform: translate3d(-100%, 0, 0); }
    }

    @keyframes campaign-slide-exit-to-right {
      from { opacity: 1; transform: translate3d(0, 0, 0); }
      to { opacity: 1; transform: translate3d(100%, 0, 0); }
    }

    .community-campaign-banner .campaign-system-label {
      position: absolute;
      z-index: 4;
      left: 18px;
      bottom: 23px;
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      max-width: calc(100% - 36px);
      color: #fff;
      font-family: inherit;
      font-size: clamp(18px, 1.6vw, 26px);
      font-weight: 650;
      line-height: 1.15;
      letter-spacing: -0.02em;
      text-align: left;
      text-shadow: 0 2px 12px rgba(8, 11, 18, 0.42);
      pointer-events: none;
    }

    .community-campaign-banner .campaign-system-label-arrow {
      display: grid;
      flex: 0 0 32px;
      width: 32px;
      height: 32px;
      place-items: center;
      border: 1.7px solid currentColor;
      border-radius: 50%;
      background: transparent;
      color: #fff;
      box-shadow: none;
    }

    .community-campaign-banner .campaign-system-label-arrow svg {
      width: 16px;
      height: 16px;
      overflow: visible;
    }

    .community-campaign-banner .campaign-banner-dots {
      right: 20px;
      bottom: 12px;
    }

    @media (max-width: 760px) {
      .community-campaign-banner .campaign-system-label {
        left: 14px;
        bottom: 19px;
        gap: 8px;
        max-width: calc(100% - 28px);
        font-size: clamp(14px, 4vw, 18px);
      }

      .community-campaign-banner .campaign-system-label-arrow {
        flex-basis: 28px;
        width: 28px;
        height: 28px;
      }

      .community-campaign-banner .campaign-system-label-arrow svg {
        width: 14px;
        height: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .community-campaign-banner .campaign-banner-media img {
        animation-duration: 1ms !important;
      }
    }
  `;
  document.head.append(style);
}

function makeSystemLabel() {
  const label = document.createElement("div");
  label.className = "campaign-system-label";
  label.setAttribute("aria-live", "polite");
  label.innerHTML = `
    <span class="campaign-system-label-text"></span>
    <span class="campaign-system-label-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  `;
  return label;
}

function clearMotionClasses(image) {
  image.classList.remove(
    "is-entering-from-right",
    "is-entering-from-left",
    "is-exiting-to-left",
    "is-exiting-to-right",
  );
}

function getDotDirection(currentIndex, targetIndex, slideCount) {
  const forwardDistance = (targetIndex - currentIndex + slideCount) % slideCount;
  const backwardDistance = (currentIndex - targetIndex + slideCount) % slideCount;
  return forwardDistance <= backwardDistance ? "next" : "previous";
}

function setPendingDirection(banner, direction) {
  const state = bannerStates.get(banner);
  if (state) state.pendingDirection = direction;
}

function installDirectionControls(banner, images) {
  const previousButton = banner.querySelector(".campaign-banner-arrow.is-previous");
  const nextButton = banner.querySelector(".campaign-banner-arrow.is-next");
  const dotButtons = Array.from(banner.querySelectorAll(".campaign-banner-dots button"));

  previousButton?.addEventListener("click", () => {
    setPendingDirection(banner, "previous");
  }, true);

  nextButton?.addEventListener("click", () => {
    setPendingDirection(banner, "next");
  }, true);

  dotButtons.forEach((button, targetIndex) => {
    button.addEventListener("click", () => {
      const state = bannerStates.get(banner);
      const currentIndex = state?.activeIndex ?? images.findIndex((image) => image.classList.contains("is-active"));
      setPendingDirection(
        banner,
        getDotDirection(Math.max(0, currentIndex), targetIndex, images.length),
      );
    }, true);
  });
}

function animateSlideChange(images, previousIndex, activeIndex, direction) {
  images.forEach(clearMotionClasses);

  const previousImage = images[previousIndex];
  const activeImage = images[activeIndex];
  if (!previousImage || !activeImage || previousImage === activeImage) return;

  const enteringClass = direction === "previous"
    ? "is-entering-from-left"
    : "is-entering-from-right";
  const exitingClass = direction === "previous"
    ? "is-exiting-to-right"
    : "is-exiting-to-left";

  previousImage.classList.add(exitingClass);
  activeImage.classList.add(enteringClass);

  window.setTimeout(() => {
    clearMotionClasses(previousImage);
    clearMotionClasses(activeImage);
  }, 680);
}

function refineBanner(banner) {
  const images = Array.from(banner.querySelectorAll(".campaign-banner-media img"));
  if (images.length < campaignCarouselSlides.length) return;

  campaignCarouselSlides.forEach((slide, index) => {
    const image = images[index];
    if (image.getAttribute("src") !== slide.image) image.src = slide.image;
    if (image.alt !== slide.title) image.alt = slide.title;
  });

  let label = banner.querySelector(".campaign-system-label");
  if (!label) {
    label = makeSystemLabel();
    banner.append(label);
  }

  if (!bannerStates.has(banner)) {
    bannerStates.set(banner, {
      activeIndex: Math.max(0, images.findIndex((image) => image.classList.contains("is-active"))),
      pendingDirection: null,
      syncing: false,
    });
  }

  const sync = () => {
    const state = bannerStates.get(banner);
    if (!state || state.syncing) return;
    state.syncing = true;

    campaignCarouselSlides.forEach((slide, index) => {
      const image = images[index];
      if (image.getAttribute("src") !== slide.image) image.src = slide.image;
      if (image.alt !== slide.title) image.alt = slide.title;
    });

    const activeIndex = Math.max(
      0,
      images.findIndex((image) => image.classList.contains("is-active")),
    );

    if (activeIndex !== state.activeIndex) {
      animateSlideChange(
        images,
        state.activeIndex,
        activeIndex,
        state.pendingDirection ?? "next",
      );
      state.activeIndex = activeIndex;
      state.pendingDirection = null;
    }

    const text = label.querySelector(".campaign-system-label-text");
    const nextTitle = campaignCarouselSlides[activeIndex]?.title ?? campaignCarouselSlides[0].title;
    if (text && text.textContent !== nextTitle) text.textContent = nextTitle;

    state.syncing = false;
  };

  if (!banner.hasAttribute(enhancedAttribute)) {
    banner.setAttribute(enhancedAttribute, "true");
    installDirectionControls(banner, images);
    new MutationObserver(sync).observe(banner, {
      attributes: true,
      attributeFilter: ["class", "src"],
      childList: true,
      subtree: true,
    });
  }

  sync();
}

let scheduled = false;

function scheduleRefinement() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    document.querySelectorAll(".community-campaign-banner").forEach(refineBanner);
  });
}

installStyles();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleRefinement, { once: true });
} else {
  scheduleRefinement();
}

new MutationObserver(scheduleRefinement).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
