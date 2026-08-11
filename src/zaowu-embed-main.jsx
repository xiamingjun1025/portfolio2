import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "motion/react";
import {
  ArrowUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  Cube,
  DiceFive,
  FolderSimple,
  ImageSquare,
  MagnifyingGlass,
  NotePencil,
  Plus,
  SlidersHorizontal,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import {
  CategoryModel,
  CommunityCampaignBanner,
  CommunityInspirationCard,
  FlowingMeshBackground,
  categories,
  clamp,
  communityWall,
  getCategoryIndex,
} from "./zaowu-origin/App.jsx";
import { douyinSansReady } from "./zaowu-origin/douyinSansFont.js";
import "./zaowu-origin/styles-home.css";
import "./zaowu-origin/campaign-carousel-refinement.js";
import "./zaowu-origin/waterfall-protected.js";
import "./zaowu-origin/waterfall-remake-button.css";
import "./zaowu-embed-overrides.css";

const CAROUSEL_DELAY = 1750;
const CAROUSEL_DURATION = 720;
const INITIAL_CATEGORY_INDEX = Math.max(
  0,
  categories.findIndex((category) => category.id === "print3d"),
);
const TITLE_LINES = ["灵感造物", "以灵感诞生好物"];

const WORKBENCH_THEME_CARDS = [
  {
    id: "illustration",
    name: "插画风格团团",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-theme-illustration.png",
  },
  {
    id: "three-d",
    name: "3D风格团团",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-theme-3d.png",
  },
  {
    id: "watercolor",
    name: "国风水彩团团",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-theme-watercolor.png",
  },
  {
    id: "line-art",
    name: "Q版简笔插画",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-theme-line-art.png",
  },
  {
    id: "retro",
    name: "美式复古漫画",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-theme-american-retro.svg",
  },
  {
    id: "cute-pet",
    name: "可爱萌宠",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-theme-cute-pet.png",
  },
];

const WORKBENCH_PRODUCTS = [
  {
    id: "tshirt",
    name: "T恤",
    price: 59,
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-product-tshirt.png",
  },
  {
    id: "hoodie",
    name: "卫衣",
    price: 89,
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-product-hoodie.png",
  },
  {
    id: "tote",
    name: "帆布包",
    price: 19,
    caption: "厚实帆布，承重耐磨",
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-product-tote.png",
  },
  {
    id: "mug",
    name: "马克杯",
    price: 19,
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-product-mug.png",
  },
  {
    id: "fridge-magnet",
    name: "冰箱贴",
    price: 6.9,
    image: "https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-product-badge.png",
  },
];

function SplitTitleLine({ text, startIndex }) {
  return (
    <span className="hero-title-line" aria-hidden="true">
      {Array.from(text).map((character, index) => (
        <span
          className="hero-title-char"
          key={`${character}-${index}`}
          style={{ "--char-index": startIndex + index }}
        >
          {character}
        </span>
      ))}
    </span>
  );
}

function SplitOverviewLine({ text, startIndex = 0, className = "" }) {
  return (
    <span className={`platform-overview-line ${className}`} aria-hidden="true">
      {Array.from(text).map((character, index) => (
        <span
          className="platform-overview-char"
          key={`${character}-${index}`}
          style={{ "--overview-char-index": startIndex + index }}
        >
          {character === " " ? "\u00A0" : character}
        </span>
      ))}
    </span>
  );
}

function DraggableFloatingProduct({
  className,
  src,
  label,
  popDelay,
  floatDelay,
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  function releaseProduct(event) {
    if (!dragRef.current) return;
    if (event?.currentTarget?.hasPointerCapture?.(dragRef.current.pointerId)) {
      event.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }

  return (
    <div
      className={`platform-floating-product ${className} ${isDragging ? "is-dragging" : ""}`}
      style={{
        "--drag-x": `${dragOffset.x}px`,
        "--drag-y": `${dragOffset.y}px`,
        "--product-pop-delay": popDelay,
        "--product-float-delay": floatDelay,
      }}
      role="img"
      aria-label={`${label}，可拖动，松开后回到原位`}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: dragOffset.x,
          originY: dragOffset.y,
        };
        setIsDragging(true);
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        setDragOffset({
          x: drag.originX + event.clientX - drag.startX,
          y: drag.originY + event.clientY - drag.startY,
        });
      }}
      onPointerUp={releaseProduct}
      onPointerCancel={releaseProduct}
    >
      <div className="platform-floating-entry">
        <img
          className="platform-floating-visual"
          src={src}
          alt=""
          aria-hidden="true"
          draggable="false"
        />
      </div>
    </div>
  );
}

function OriginalCommunityWaterfall() {
  const sectionRef = useRef(null);
  const waterfallStackRef = useRef(null);
  const storyStageRef = useRef(0);
  const isStoryActiveRef = useRef(false);
  const [pinProgress, setPinProgress] = useState(0);
  const [storyStage, setStoryStage] = useState(0);
  const [typedCharacterCount, setTypedCharacterCount] = useState(0);

  useEffect(() => {
    let parentArea = null;
    let parentDocument = null;
    let frame = null;
    let measureFrame = 0;
    let lastWheelEventAt = 0;
    let lastObservedWheelAt = 0;
    let transitionLockedUntil = 0;
    let gestureResetTimer = 0;
    let storyLockScrollTop = null;
    let freeScrollAnimationFrame = 0;
    let freeScrollTarget = null;

    function isPlatformViewActive() {
      const parentModal = parentDocument?.getElementById("modal-content");
      return parentModal?.classList.contains("is-zaowu-platform-view") === true;
    }

    function cancelFreeScroll() {
      window.cancelAnimationFrame(freeScrollAnimationFrame);
      freeScrollAnimationFrame = 0;
      freeScrollTarget = null;
    }

    function animateFreeScroll() {
      if (!parentArea || freeScrollTarget === null || !isPlatformViewActive()) {
        cancelFreeScroll();
        return;
      }

      const distance = freeScrollTarget - parentArea.scrollTop;
      if (Math.abs(distance) < 0.55) {
        parentArea.scrollTop = freeScrollTarget;
        freeScrollAnimationFrame = 0;
        freeScrollTarget = null;
        return;
      }

      // Accumulated wheel deltas form the acceleration phase; this eased
      // approach supplies a soft deceleration tail without fighting the
      // user's direction or introducing a fixed-duration scroll animation.
      parentArea.scrollTop += distance * 0.2;
      freeScrollAnimationFrame = window.requestAnimationFrame(animateFreeScroll);
    }

    function queueFreeScroll(event, maxParentScroll, sensitivity = 1) {
      if (!parentArea) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const pixelDelta = event.deltaY * unit;
      const forwardedDelta = Math.sign(pixelDelta)
        * Math.min(Math.abs(pixelDelta) * sensitivity, 240);
      const currentTarget = freeScrollTarget ?? parentArea.scrollTop;
      const unconstrainedTarget = clamp(currentTarget + forwardedDelta, 0, maxParentScroll);

      // Bound the pending distance so fast wheels stay responsive and never
      // leave a long, floaty tail after the user has stopped scrolling.
      freeScrollTarget = clamp(
        unconstrainedTarget,
        Math.max(0, parentArea.scrollTop - 680),
        Math.min(maxParentScroll, parentArea.scrollTop + 680),
      );
      if (!freeScrollAnimationFrame) {
        freeScrollAnimationFrame = window.requestAnimationFrame(animateFreeScroll);
      }
    }

    function releaseStoryScrollLock() {
      cancelFreeScroll();
      storyLockScrollTop = null;
      isStoryActiveRef.current = false;
      transitionLockedUntil = 0;
      lastWheelEventAt = 0;
      lastObservedWheelAt = 0;
      window.clearTimeout(gestureResetTimer);
    }

    function setStage(nextStage) {
      const clampedStage = clamp(nextStage, 0, 5);
      storyStageRef.current = clampedStage;
      setStoryStage(clampedStage);
      const syncVisibleCheckpoint = () => {
        if (
          !parentArea
          || clampedStage === 0
          || storyStageRef.current !== clampedStage
          || storyLockScrollTop === null
          || !isPlatformViewActive()
        ) return;
        const maxParentScroll = Math.max(1, parentArea.scrollHeight - parentArea.clientHeight);
        storyLockScrollTop = maxParentScroll * 0.56;
        cancelFreeScroll();
        cancelQueuedParentScroll();
        parentArea.scrollTop = storyLockScrollTop;
        queueStoryUpdate();
      };
      window.requestAnimationFrame(() => window.requestAnimationFrame(syncVisibleCheckpoint));
      window.setTimeout(() => {
        if (
          clampedStage === 5
          && storyStageRef.current === 5
          && isPlatformViewActive()
        ) {
          // Stage 5 is the finished gallery, not another pinned checkpoint.
          // Release as soon as its transition settles so the user's next wheel
          // event is ordinary browsing from its very first pixel.
          cancelQueuedParentScroll();
          cancelFreeScroll();
          storyLockScrollTop = null;
          isStoryActiveRef.current = false;
          transitionLockedUntil = 0;
          lastWheelEventAt = 0;
          lastObservedWheelAt = 0;
          queueStoryUpdate();
          return;
        }
        syncVisibleCheckpoint();
      }, 960);
    }

    function cancelQueuedParentScroll() {
      window.dispatchEvent(new Event("zaowu:cancel-parent-scroll"));
      window.postMessage(
        { type: "zaowu:cancel-parent-scroll" },
        window.location.origin,
      );
    }

    function updatePinProgress() {
      measureFrame = 0;
      const section = sectionRef.current;
      if (!section) return;

      if (parentArea && frame) {
        if (!isPlatformViewActive()) {
          releaseStoryScrollLock();
          return;
        }

        const areaRect = parentArea.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const frameScale = frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
        const parentViewportHeightInFrame = areaRect.height / Math.max(frameScale, 0.001);
        const responsiveViewportLift = Math.max(
          0,
          (parentViewportHeightInFrame - 1050) * 0.32,
        );
        section.style.setProperty(
          "--community-story-viewport-lift",
          `${-Math.round(responsiveViewportLift)}px`,
        );
        const sectionTop = frameRect.top + sectionRect.top * frameScale;
        const sectionHeight = sectionRect.height * frameScale;
        const startLine = areaRect.top + areaRect.height * 0.72;
        const travel = Math.max(areaRect.height * 1.8, sectionHeight - areaRect.height * 0.24);
        let nextPinProgress = clamp((startLine - sectionTop) / travel, 0, 1);
        const currentStage = storyStageRef.current;
        const maxParentScroll = Math.max(1, parentArea.scrollHeight - parentArea.clientHeight);
        const parentProgress = parentArea.scrollTop / maxParentScroll;
        const checkpointProgress = 0.56;
        const checkpointScrollTop = checkpointProgress * maxParentScroll;
        const hasReachedCheckpoint = parentProgress >= checkpointProgress - 0.004;

        // The story owns a discrete viewport checkpoint. Fast wheel gestures
        // may overshoot it, so pull the modal back to this same visible frame
        // and hold it there until every tab state has completed.
        if ((currentStage < 5 && hasReachedCheckpoint) || storyLockScrollTop !== null) {
          cancelFreeScroll();
          cancelQueuedParentScroll();
          // The docked gallery and its five-column expansion can increase the
          // modal's scrollHeight. Recalculate the lock against the new height
          // so the viewport stays on the same 56% story frame.
          // Keep the checkpoint attached to the current scroll range even at
          // stage 0. Late-loading media can change scrollHeight after the
          // first lock; retaining the old pixel value would leave the story
          // a few pixels before the activation threshold and make the next
          // wheel gesture appear unresponsive.
          storyLockScrollTop = checkpointScrollTop;
          if (Math.abs(parentArea.scrollTop - storyLockScrollTop) > 1) {
            parentArea.scrollTop = storyLockScrollTop;
          }
        }

        isStoryActiveRef.current = (
          (storyStageRef.current > 0 && storyStageRef.current < 5)
          || (storyStageRef.current === 0 && hasReachedCheckpoint)
          || (
            storyStageRef.current === 5
            && storyLockScrollTop !== null
          )
        );
        // Stage 5 has left the pinned narrative and is now ordinary document
        // scrolling. Keep the pin at its checkpoint offset; continuing to
        // recompute this transform counteracts part of the parent's movement,
        // so the waterfall appears to hitch even though scrollTop advances.
        if (currentStage !== 5 || storyLockScrollTop !== null) {
          setPinProgress(nextPinProgress);
        }
        return;
      }

      const rect = section.getBoundingClientRect();
      const startLine = window.innerHeight * 0.72;
      const travel = Math.max(window.innerHeight * 1.8, rect.height - window.innerHeight * 0.24);
      const nextPinProgress = clamp((startLine - rect.top) / travel, 0, 1);
      isStoryActiveRef.current = nextPinProgress > 0.015 && nextPinProgress < 0.985;
      setPinProgress(nextPinProgress);
    }

    function queueStoryUpdate() {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(updatePinProgress);
    }

    function applyParentWheelDelta(
      event,
      maxParentScroll,
      minimumMagnitude = 0,
      sensitivity = 1.1,
    ) {
      if (!parentArea) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const pixelDelta = event.deltaY * unit;
      const forwardedDelta = Math.sign(pixelDelta)
        * Math.min(
          Math.max(Math.abs(pixelDelta) * sensitivity, minimumMagnitude),
          260,
        );
      parentArea.scrollTop = clamp(
        parentArea.scrollTop + forwardedDelta,
        0,
        maxParentScroll,
      );
    }

    function handleStoryWheel(event) {
      if (!isPlatformViewActive()) {
        releaseStoryScrollLock();
        return;
      }
      const currentStage = storyStageRef.current;
      // Preserve tiny trackpad deltas in the free waterfall. Dropping them
      // here lets the generic eased bridge handle part of a slow gesture,
      // producing a different feel on the two sides of the 56% checkpoint.
      const minimumHandledDelta = currentStage === 5 ? 0.01 : 2;
      if (Math.abs(event.deltaY) < minimumHandledDelta) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const now = window.performance.now();
      const beginsNewWheelGesture = (
        !lastObservedWheelAt
        || now - lastObservedWheelAt > 120
      );
      lastObservedWheelAt = now;
      const maxParentScroll = parentArea
        ? Math.max(1, parentArea.scrollHeight - parentArea.clientHeight)
        : 1;
      const checkpointScrollTop = maxParentScroll * 0.56;

      // While the five-column entrance is still settling, keep its inertial
      // tail from moving the parent. setStage(5) releases this lock
      // automatically with the end of the 920ms layout transition, so the
      // finished waterfall never requires a separate "unlock" gesture.
      if (currentStage === 5 && storyLockScrollTop !== null && direction > 0) {
        cancelQueuedParentScroll();
        event.preventDefault();
        event.stopImmediatePropagation();

        if (now < transitionLockedUntil || !beginsNewWheelGesture) {
          return;
        }

        storyLockScrollTop = null;
        isStoryActiveRef.current = false;
        transitionLockedUntil = 0;
        lastWheelEventAt = 0;

        queueFreeScroll(event, maxParentScroll);
        return;
      }

      // Mirror the final-stage release at the beginning of the story. Once
      // Stage 0 has been restored, the same upward gesture should immediately
      // continue into the preceding modal content instead of being consumed
      // solely to clear the checkpoint lock.
      if (
        currentStage === 0
        && direction < 0
        && parentArea
      ) {
        cancelQueuedParentScroll();
        storyLockScrollTop = null;
        isStoryActiveRef.current = false;
        transitionLockedUntil = 0;
        lastWheelEventAt = 0;
        applyParentWheelDelta(event, maxParentScroll, 96);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      // Free scrolling owns the long waterfall after the final endpoint.
      // When an upward gesture reaches its top checkpoint, hand control back
      // to the story and make that same gesture visibly restore the compact
      // three-column state. This is deliberately checked before the general
      // active-story guard because the free gallery has marked itself inactive.
      if (currentStage === 5 && storyLockScrollTop === null && direction < 0 && parentArea) {
        const reentryBuffer = Math.max(
          32,
          Math.min(Math.abs(event.deltaY) * 1.5, 220),
        );
        if (parentArea.scrollTop <= checkpointScrollTop + reentryBuffer) {
          cancelFreeScroll();
          cancelQueuedParentScroll();
          storyLockScrollTop = checkpointScrollTop;
          isStoryActiveRef.current = true;
          parentArea.scrollTop = checkpointScrollTop;
          event.preventDefault();
          event.stopImmediatePropagation();
          setStage(2);
          transitionLockedUntil = now + 860;
          lastWheelEventAt = now;
          return;
        }
      }

      // The final waterfall is ordinary browsing content, but its wheel
      // deltas still pass through a short inertial target so cards accelerate
      // and settle naturally instead of jumping by a fixed amount per tick.
      if (currentStage === 5 && storyLockScrollTop === null && parentArea) {
        cancelQueuedParentScroll();
        queueFreeScroll(event, maxParentScroll);
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (!isStoryActiveRef.current) return;

      cancelQueuedParentScroll();

      const isTransitionLocked = now < transitionLockedUntil;

      if (isTransitionLocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      // Do not let the inertial tail emitted while a transition is locked
      // extend the gesture debounce. Once the motion settles, the very next
      // deliberate wheel input should be able to advance the story.
      const isNewGesture = !lastWheelEventAt || now - lastWheelEventAt > 120;
      lastWheelEventAt = now;
      window.clearTimeout(gestureResetTimer);
      gestureResetTimer = window.setTimeout(() => {
        lastWheelEventAt = 0;
      }, 140);

      event.preventDefault();
      event.stopImmediatePropagation();

      if (!isNewGesture) return;

      // The five-column layout is the finished gallery. Enter Stage 5 on the
      // same gesture that expands the columns so there is no visually empty
      // Stage 4 -> 5 wheel step before ordinary document scrolling begins.
      const nextStage = direction > 0
        ? (currentStage === 2 || currentStage === 3 ? 5 : currentStage + 1)
        : (currentStage === 4 || currentStage === 3 ? 2 : currentStage - 1);
      setStage(nextStage);
      transitionLockedUntil = now + 860;
    }

    function resetStorySequence(event) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "zaowu:play-title-intro") return;
      releaseStoryScrollLock();
      setStage(0);
    }

    function handleStoryControlMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;
      if (event.data?.type === "zaowu:cancel-parent-scroll") releaseStoryScrollLock();
    }

    try {
      parentDocument = window.parent.document;
      parentArea = parentDocument.getElementById("modal-scroll-area");
      frame = parentDocument.getElementById("zaowu-showcase-frame");
    } catch {
      parentDocument = null;
      parentArea = null;
      frame = null;
    }

    (parentArea ?? window).addEventListener("scroll", queueStoryUpdate, { passive: true });
    parentDocument?.addEventListener("scroll", queueStoryUpdate, true);
    parentArea?.addEventListener("wheel", handleStoryWheel, { passive: false, capture: true });
    window.addEventListener("wheel", handleStoryWheel, { passive: false, capture: true });
    window.addEventListener("resize", queueStoryUpdate, { passive: true });
    window.addEventListener("message", resetStorySequence);
    window.addEventListener("message", handleStoryControlMessage);
    queueStoryUpdate();

    return () => {
      (parentArea ?? window).removeEventListener("scroll", queueStoryUpdate);
      parentDocument?.removeEventListener("scroll", queueStoryUpdate, true);
      parentArea?.removeEventListener("wheel", handleStoryWheel, true);
      window.removeEventListener("wheel", handleStoryWheel, true);
      window.removeEventListener("resize", queueStoryUpdate);
      window.removeEventListener("message", resetStorySequence);
      window.removeEventListener("message", handleStoryControlMessage);
      window.cancelAnimationFrame(measureFrame);
      cancelFreeScroll();
      window.clearTimeout(gestureResetTimer);
    };
  }, []);

  useEffect(() => {
    const stack = waterfallStackRef.current;
    if (!stack) return undefined;
    let measureTailFrame = 0;

    function syncWaterfallTailMask() {
      measureTailFrame = 0;
      const columns = Array.from(stack.querySelectorAll(".community-masonry-column"));
      if (columns.length === 0) return;
      const waterfallEnd = Math.max(
        ...columns.map((column) => column.offsetTop + column.scrollHeight),
      );
      // Let the final cards dissolve across a long runway before the ending copy.
      stack.style.setProperty(
        "--community-waterfall-tail-top",
        `${Math.max(0, waterfallEnd - 520)}px`,
      );
    }

    function queueTailMeasurement() {
      if (!measureTailFrame) {
        measureTailFrame = window.requestAnimationFrame(syncWaterfallTailMask);
      }
    }

    const resizeObserver = new ResizeObserver(queueTailMeasurement);
    const mutationObserver = new MutationObserver(() => {
      stack.querySelectorAll(".community-masonry-column").forEach((column) => {
        resizeObserver.observe(column);
      });
      queueTailMeasurement();
    });

    stack.querySelectorAll(".community-masonry-column").forEach((column) => {
      resizeObserver.observe(column);
    });
    mutationObserver.observe(stack, { childList: true, subtree: true });
    window.addEventListener("resize", queueTailMeasurement, { passive: true });
    queueTailMeasurement();

    return () => {
      window.cancelAnimationFrame(measureTailFrame);
      window.removeEventListener("resize", queueTailMeasurement);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const typingTimers = [];

    if (storyStage === 1) {
      setTypedCharacterCount(0);
      for (let characterCount = 1; characterCount <= 4; characterCount += 1) {
        typingTimers.push(window.setTimeout(
          () => setTypedCharacterCount(characterCount),
          90 + characterCount * 92,
        ));
      }
    } else if (storyStage < 1) {
      setTypedCharacterCount(0);
    } else {
      setTypedCharacterCount(4);
    }

    return () => typingTimers.forEach((timer) => window.clearTimeout(timer));
  }, [storyStage]);

  const searchOpen = storyStage === 1;
  const searchTerm = "艺术文创".slice(0, typedCharacterCount);
  const dockProgress = storyStage >= 2 ? 1 : 0;
  const contentProgress = storyStage >= 2 ? 1 : 0;
  const columnExpansionProgress = storyStage >= 4 ? 1 : 0;
  const communityTab = "featured";

  const visibleCommunityLayouts = useMemo(() => {
    const items = [...communityWall].reverse();
    const buildColumns = (sourceItems, columnCount) => {
      const columns = Array.from({ length: columnCount }, () => []);
      sourceItems.forEach((item, index) => {
        columns[index % columnCount].push({ item, index });
      });
      return columns;
    };

    return {
      core: buildColumns(items.slice(0, 15), 3),
      additions: buildColumns(items.slice(15, 25), 2),
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="community-section inspiration-community-section community-story-section"
      aria-label="灵感造物作品瀑布流"
      data-story-stage={storyStage}
      style={{
        "--community-pin-progress": pinProgress,
        "--community-story-dock": dockProgress,
        "--community-story-content": contentProgress,
        "--community-story-columns": columnExpansionProgress,
        "--community-story-rise": `${(1 - contentProgress) * 46}px`,
      }}
    >
      <div className="community-story-pin">
        <div className="community-story-exit-layer">
          <div className="community-story-stage">
          <div
            className={`community-story-copy ${contentProgress > 0.1 && storyStage < 4 ? "is-ready" : ""}`}
            aria-hidden={contentProgress < 0.1 || storyStage >= 4}
          >
            <h2 aria-label="「灵感瀑布」与社区活动">
              <SplitOverviewLine text="「灵感瀑布」与社区活动" />
            </h2>
            <p aria-label="用户可以从作品和主题活动中获得灵感，并快速复用创作方向与视觉元素，让一件完成的作品继续成为下一件作品的起点。">
              <SplitOverviewLine
                className="community-story-copy-body-line"
                text="用户可以从作品和主题活动中获得灵感，并快速复用"
              />
              <SplitOverviewLine
                className="community-story-copy-body-line"
                startIndex={25}
                text="创作方向与视觉元素，让一件完成的作品继续成为下"
              />
              <SplitOverviewLine
                className="community-story-copy-body-line"
                startIndex={50}
                text="一件作品的起点。"
              />
            </p>
          </div>

          <div
            className="community-story-gallery"
            aria-hidden={contentProgress < 0.1}
          >
            <CommunityCampaignBanner onSelect={() => {}} />
            <div ref={waterfallStackRef} className="community-story-waterfall-stack">
              <div className="community-story-waterfall is-compact">
                {visibleCommunityLayouts.core.map((column, columnIndex) => (
                  <div
                    className="community-masonry-column"
                    key={`core-story-column-${columnIndex}`}
                  >
                    {column.map(({ item, index }) => (
                      <div
                        className="community-story-card-slot"
                        key={`core-${item.title}-${index}`}
                      >
                        <CommunityInspirationCard
                          item={item}
                          onOpen={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <motion.div
                className="community-story-waterfall is-additions"
                initial={false}
                animate={columnExpansionProgress >= 0.5
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 220, filter: "blur(8px)" }}
                transition={{ duration: 0.92, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden={columnExpansionProgress < 0.5}
                style={{ pointerEvents: columnExpansionProgress >= 0.5 ? "auto" : "none" }}
              >
                {visibleCommunityLayouts.additions.map(
                  (column, columnIndex) => (
                    <div
                      className="community-masonry-column"
                      key={`addition-story-column-${columnIndex}`}
                    >
                      {column.map(({ item, index }) => (
                        <div
                          className="community-story-card-slot"
                          key={`addition-${item.title}-${index}`}
                        >
                          <CommunityInspirationCard
                            item={item}
                            onOpen={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </motion.div>
              <div className="community-story-tail-mask" aria-hidden="true" />
              <p className="community-story-end-note">
                更多信息还在更新整理中 : )
              </p>
            </div>
          </div>
          </div>

          <div
            className={`community-head community-story-control ${dockProgress > 0.02 ? "is-docking" : ""}`}
            style={{
              "--community-control-left": `${50 + dockProgress * 30}%`,
              "--community-control-width": `${780 - dockProgress * 260}px`,
              opacity: 1,
            }}
          >
          <div
            className={`community-discovery-control ${searchOpen ? "is-searching" : ""}`}
          >
          <div className="community-discovery-default" aria-hidden={searchOpen}>
            <button
              type="button"
              className={`community-search-trigger ${searchOpen ? "is-active" : ""}`}
              tabIndex={-1}
              aria-label="搜索作品或用户"
            >
              <MagnifyingGlass size={17} weight="bold" />
              <span>搜索</span>
            </button>
            <div className="community-filter-tabs" role="tablist" aria-label="灵感内容筛选">
              <span className={`community-tab-indicator is-${communityTab}`} />
              {[
                ["featured", "精选"],
                ["latest", "最新"],
                ["events", "活动"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={communityTab === value}
                  className={`community-filter-tab ${communityTab === value ? "is-active" : ""}`}
                  tabIndex={-1}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="community-search-panel" aria-hidden={!searchOpen}>
            <span className="community-search-chip">
              <MagnifyingGlass size={17} />
              搜索
            </span>
            <input
              aria-label="搜索作品、用户或风格"
              value={searchTerm}
              readOnly
              placeholder="搜索作品、用户或风格"
              tabIndex={-1}
            />
            <button
              type="button"
              className="community-search-close"
              tabIndex={-1}
              aria-label="关闭搜索"
            >
              <X size={17} />
            </button>
          </label>
          </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function WorkbenchShowcaseSection() {
  return (
    <section
      className="workbench-showcase-section is-source-embedded"
      aria-labelledby="workbench-showcase-title"
    >
      <h2 id="workbench-showcase-title">
        直观的「工作台」布局，所见即所得
      </h2>
      <div className="workbench-source-frame-shell">
        <video
          className="workbench-source-frame"
          src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-layout-demo.mp4"
          aria-label="灵感造物工作台布局演示"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
    </section>
  );

  const [selectedTheme, setSelectedTheme] = useState("");
  const [activeProductIndex, setActiveProductIndex] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [prompt, setPrompt] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const activeProduct = WORKBENCH_PRODUCTS[activeProductIndex];

  function getProductOffset(index) {
    let offset = index - activeProductIndex;
    const half = Math.floor(WORKBENCH_PRODUCTS.length / 2);
    if (offset > half) offset -= WORKBENCH_PRODUCTS.length;
    if (offset < -half) offset += WORKBENCH_PRODUCTS.length;
    return offset;
  }

  function chooseTheme(theme) {
    setSelectedTheme(theme.id);
    setPrompt(`以${theme.name}创作一款适合文创产品印制的图案`);
  }

  function simulateGeneration() {
    if ((!prompt.trim() && !selectedTheme && !referenceName) || isGenerating) return;
    setIsGenerating(true);
    window.setTimeout(() => setIsGenerating(false), 900);
  }

  return (
    <section
      className="workbench-showcase-section"
      aria-labelledby="workbench-showcase-title"
    >
      <h2 id="workbench-showcase-title">
        直观的「工作台」布局，所见即所得
      </h2>
      <div
        className="workbench-showcase-stage"
        aria-label="灵感造物工作台展示区域"
      >
        <aside className="workbench-demo-agent" aria-label="Agent 创意面板">
          <header className="workbench-demo-agent-header">
            <span className="workbench-demo-file-name">
              <NotePencil size={17} weight="regular" />
              <strong>白色落肩T恤_20260810_2027</strong>
              <CaretDown size={12} weight="bold" />
            </span>
            <button type="button" aria-label="打开创意文件夹">
              <FolderSimple size={18} weight="regular" />
            </button>
          </header>

          <div className="workbench-demo-welcome">
            <div className="workbench-demo-welcome-copy">
              <img
                className="workbench-demo-mascot"
                src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-platform-logo.svg"
                alt=""
                aria-hidden="true"
              />
              <h3>Hello！今天想搞点什么创作？</h3>
              <p>我可以给你推荐一些热门的风格玩法 🥳</p>
            </div>

            <div className="workbench-demo-theme-grid" aria-label="风格玩法推荐">
              {WORKBENCH_THEME_CARDS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={selectedTheme === theme.id ? "is-selected" : ""}
                  aria-pressed={selectedTheme === theme.id}
                  onClick={() => chooseTheme(theme)}
                >
                  <span className="workbench-demo-theme-thumb">
                    <img src={theme.image} alt="" />
                  </span>
                  <span className="workbench-demo-theme-footer">
                    <strong>{theme.name}</strong>
                    <img
                      src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/workbench-style-add.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="workbench-demo-composer">
            <div className="workbench-demo-guidance" role="status">
              <Sparkle size={13} weight="fill" />
              {selectedCategory
                ? `已选择${selectedCategory}，继续描述你想要的图案`
                : "请先选择想要定制的文创品类哦~"}
            </div>
            <div className="workbench-demo-editor">
              <button
                className={`workbench-demo-attachment ${selectedCategory ? "is-selected" : ""}`}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory ? "" : activeProduct.name)}
                aria-pressed={Boolean(selectedCategory)}
              >
                <span><Plus size={18} weight="regular" /></span>
                <strong>{selectedCategory || "品类"}</strong>
              </button>
              <label className={`workbench-demo-attachment ${referenceName ? "is-selected" : ""}`}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setReferenceName(event.target.files?.[0]?.name ?? "")}
                />
                <span>{referenceName ? <ImageSquare size={18} /> : <Plus size={18} />}</span>
                <strong>{referenceName ? "已上传" : "图片"}</strong>
              </label>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="先选择品类，然后可直接文字生图，或上传图片进行参考生图"
                aria-label="创意提示词"
              />
            </div>
            <div className="workbench-demo-toolbar">
              <button type="button"><Cube size={13} /> 全能创意V2 <CaretDown size={10} /></button>
              <button type="button"><SlidersHorizontal size={13} /> 2K 高清 · 1:1 <CaretDown size={10} /></button>
              <button type="button"><Sparkle size={13} /> 风格 <CaretDown size={10} /></button>
              <button className="workbench-demo-random" type="button" onClick={() => setPrompt("一只袋鼠在花园里浇花，明快治愈的商业插画风格")}>
                <DiceFive size={14} weight="fill" /> 随机灵感
              </button>
              <button
                className="workbench-demo-generate"
                type="button"
                disabled={!prompt.trim() && !selectedTheme && !referenceName}
                onClick={simulateGeneration}
                aria-label="生成图案"
              >
                <ArrowUp size={17} weight="bold" />
              </button>
            </div>
          </div>
        </aside>

        <section className="workbench-demo-preview" aria-label="品类预览区">
          <nav className="workbench-demo-journey" aria-label="当前定制流程">
            {["创作", "效果预览", "确认下单"].map((step, index) => (
              <React.Fragment key={step}>
                <span className={index === 0 ? "is-active" : ""}>
                  <i>{index + 1}</i>
                  <strong>{step}</strong>
                </span>
                {index < 2 && <b aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <div className="workbench-demo-carousel" aria-label="文创品类轮播">
            {WORKBENCH_PRODUCTS.map((product, index) => {
              const offset = getProductOffset(index);
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`workbench-demo-product-card ${offset === 0 ? "is-active" : ""}`}
                  style={{
                    "--workbench-slot": offset,
                    "--workbench-depth": Math.abs(offset),
                    "--workbench-card-opacity": offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.72 : 0.42,
                    "--workbench-card-scale": offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.78 : 0.62,
                    "--workbench-card-z": 5 - Math.abs(offset),
                  }}
                  onClick={() => setActiveProductIndex(index)}
                  aria-label={`预览${product.name}`}
                  aria-pressed={offset === 0}
                >
                  <span className="workbench-demo-product-visual">
                    <img src={product.image} alt="" draggable="false" />
                  </span>
                  <span className="workbench-demo-product-title">
                    <strong>{product.name}</strong>
                    <em>¥{product.price}</em>
                  </span>
                  {product.caption && <small>{product.caption}</small>}
                </button>
              );
            })}
          </div>

          {isGenerating && (
            <div className="workbench-demo-generating" role="status">
              正在生成创意图案…
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function WhyZaowuSection() {
  const sectionRef = useRef(null);
  const hasRevealedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let parentArea = null;
    let frame = null;
    let observer = null;
    let replayRevealTimer = 0;

    function revealWhenVisible() {
      if (hasRevealedRef.current) return;

      if (parentArea && frame) {
        const areaRect = parentArea.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const frameScale = frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
        const sectionTop = frameRect.top + sectionRect.top * frameScale;
        const sectionBottom = frameRect.top + sectionRect.bottom * frameScale;
        const revealTop = areaRect.top + Math.min(72, areaRect.height * 0.1);
        // Start only after the section heading reaches the lower-middle part of
        // the modal viewport. The previous bottom-edge test fired while the
        // section was still mostly off-screen, so its stagger finished early.
        const revealLine = areaRect.top + areaRect.height * 0.58;

        if (sectionTop <= revealLine && sectionBottom > revealTop) {
          hasRevealedRef.current = true;
          setIsVisible(true);
        }
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            hasRevealedRef.current = true;
            setIsVisible(true);
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(section);
    }

    try {
      parentArea = window.parent.document.getElementById("modal-scroll-area");
      frame = window.parent.document.getElementById("zaowu-showcase-frame");
    } catch {
      parentArea = null;
      frame = null;
    }

    if (parentArea && frame) {
      parentArea.addEventListener("scroll", revealWhenVisible, { passive: true });
    } else {
      revealWhenVisible();
    }

    function resetRevealOnProjectEntry(event) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "zaowu:play-title-intro") return;
      window.clearTimeout(replayRevealTimer);
      hasRevealedRef.current = false;
      setIsVisible(false);
      replayRevealTimer = window.setTimeout(revealWhenVisible, 360);
    }

    window.addEventListener("message", resetRevealOnProjectEntry);

    return () => {
      parentArea?.removeEventListener("scroll", revealWhenVisible);
      window.removeEventListener("message", resetRevealOnProjectEntry);
      window.clearTimeout(replayRevealTimer);
      observer?.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`why-zaowu-section ${isVisible ? "is-visible" : ""}`}
      aria-labelledby="why-zaowu-title"
    >
      <h2 id="why-zaowu-title">为什么要做「灵感造物」？</h2>

      <div className="why-zaowu-grid">
        <article className="why-zaowu-card why-zaowu-card-efficiency">
          <div className="why-zaowu-visual why-zaowu-efficiency-visual" aria-hidden="true">
            <img
              className="why-zaowu-asset why-efficiency-art"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-efficiency-art.png"
              alt=""
            />
            <img
              className="why-zaowu-asset why-efficiency-hoodie"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-efficiency-hoodie.png"
              alt=""
            />
            <img
              className="why-zaowu-asset why-efficiency-tshirt"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-efficiency-tshirt.png"
              alt=""
            />
          </div>
          <div className="why-zaowu-copy">
            <h3>让定制更高效</h3>
            <p>帮助业务方降低流程成本，实现标准化、自助化定制。</p>
          </div>
        </article>

        <article className="why-zaowu-card why-zaowu-card-creation">
          <div className="why-zaowu-visual why-zaowu-creation-visual" aria-hidden="true">
            <img
              className="why-zaowu-asset why-creative-dog"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-creative-dog.png"
              alt=""
            />
            <img
              className="why-zaowu-asset why-creative-girl"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-creative-girl.png"
              alt=""
            />
            <img
              className="why-zaowu-asset why-creative-main"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-creative-main.png"
              alt=""
            />
          </div>
          <div className="why-zaowu-copy">
            <h3>让创造更简单</h3>
            <p>降低设计门槛，让每个人都能参与好物创造。</p>
          </div>
        </article>

        <article className="why-zaowu-card why-zaowu-card-ai">
          <div className="why-zaowu-visual why-zaowu-ai-visual" aria-hidden="true">
            <img
              className="why-zaowu-asset why-ai-ip"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-ai-ip.png"
              alt=""
            />
            <img
              className="why-zaowu-asset why-ai-bulb"
              src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/why-ai-bulb.png"
              alt=""
            />
          </div>
          <div className="why-zaowu-copy">
            <h3>探索AI协同的生产形式</h3>
            <p>AI 从生产工具转变为创意伙伴，推动产品定制流程的重新构建。</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function InspirationShowcase() {
  const [activeIndex, setActiveIndex] = useState(INITIAL_CATEGORY_INDEX);
  const [carouselMotion, setCarouselMotion] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categoryInteracting, setCategoryInteracting] = useState(false);
  const [titleIntroKey, setTitleIntroKey] = useState(0);
  const [titleFontsReady, setTitleFontsReady] = useState(false);
  const [creativeDotCount, setCreativeDotCount] = useState(1);
  const carouselTimerRef = useRef(0);
  const prepareTimerRef = useRef(0);
  const wheelLockedRef = useRef(false);

  const motionDirection = carouselMotion?.phase === "moving" ? carouselMotion.direction : 0;
  const focusIndex = hoveredCategory ?? getCategoryIndex(activeIndex + motionDirection);
  const dotIndex = getCategoryIndex(hoveredCategory ?? activeIndex + motionDirection);
  const visibleCategorySlots = carouselMotion
    ? carouselMotion.direction > 0
      ? [-2, -1, 0, 1, 2, 3]
      : [-3, -2, -1, 0, 1, 2]
    : [-2, -1, 0, 1, 2];

  useEffect(() => {
    if (carouselMotion || categoryInteracting || hoveredCategory !== null) return undefined;
    const timer = window.setTimeout(() => rotate(1), CAROUSEL_DELAY);
    return () => window.clearTimeout(timer);
  }, [activeIndex, carouselMotion, categoryInteracting, hoveredCategory]);

  useEffect(() => () => {
    window.clearTimeout(carouselTimerRef.current);
    window.clearTimeout(prepareTimerRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    douyinSansReady.then(() => {
      if (!cancelled) setTitleFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function replayTitleIntro(event) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "zaowu:play-title-intro") return;
      window.clearTimeout(carouselTimerRef.current);
      window.clearTimeout(prepareTimerRef.current);
      wheelLockedRef.current = false;
      setActiveIndex(INITIAL_CATEGORY_INDEX);
      setCarouselMotion(null);
      setHoveredCategory(null);
      setCategoryInteracting(false);
      setTitleIntroKey((key) => key + 1);
    }
    window.addEventListener("message", replayTitleIntro);
    return () => window.removeEventListener("message", replayTitleIntro);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCreativeDotCount((count) => (count % 3) + 1);
    }, 520);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let scrollAnimationFrame = 0;
    let scrollTarget = null;
    let scrollArea = null;

    function cancelParentScroll() {
      window.cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = 0;
      scrollTarget = null;
      scrollArea = null;
    }

    function animateParentScroll() {
      if (!scrollArea || scrollTarget === null) {
        scrollAnimationFrame = 0;
        return;
      }

      const parentModal = scrollArea.ownerDocument?.getElementById("modal-content");
      if (!parentModal?.classList.contains("is-zaowu-platform-view")) {
        cancelParentScroll();
        return;
      }

      const distance = scrollTarget - scrollArea.scrollTop;
      if (Math.abs(distance) < 0.5) {
        scrollArea.scrollTop = scrollTarget;
        scrollAnimationFrame = 0;
        scrollTarget = null;
        scrollArea = null;
        return;
      }

      scrollArea.scrollTop += distance * 0.2;
      scrollAnimationFrame = window.requestAnimationFrame(animateParentScroll);
    }

    function queueParentScroll(parentArea, deltaY) {
      const maxScroll = Math.max(0, parentArea.scrollHeight - parentArea.clientHeight);
      if (scrollArea !== parentArea || scrollTarget === null) {
        window.cancelAnimationFrame(scrollAnimationFrame);
        scrollAnimationFrame = 0;
        scrollArea = parentArea;
        scrollTarget = parentArea.scrollTop;
      }

      const unconstrainedTarget = clamp(scrollTarget + deltaY, 0, maxScroll);
      scrollTarget = clamp(
        unconstrainedTarget,
        Math.max(0, parentArea.scrollTop - 680),
        Math.min(maxScroll, parentArea.scrollTop + 680),
      );
      if (!scrollAnimationFrame) {
        scrollAnimationFrame = window.requestAnimationFrame(animateParentScroll);
      }
    }

    function forwardVerticalWheel(event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (window.parent === window) return;
      // OriginalCommunityWaterfall owns every Stage 5 wheel event, including
      // the lock release and ordinary gallery browsing. This listener is
      // registered earlier in React's effect order, so queueing here cannot be
      // reliably cancelled later: its stale target can pull the modal from the
      // 56% checkpoint back toward the pre-story 50% position.
      const communityStoryStage = Number.parseInt(
        document.querySelector(".community-story-section")?.dataset.storyStage ?? "0",
        10,
      );
      let communityStoryOwnsWheel = communityStoryStage > 0;
      if (!communityStoryOwnsWheel) {
        try {
          const parentArea = window.parent.document.getElementById("modal-scroll-area");
          const maxParentScroll = parentArea
            ? Math.max(1, parentArea.scrollHeight - parentArea.clientHeight)
            : 1;
          communityStoryOwnsWheel = Boolean(
            parentArea
            && parentArea.scrollTop / maxParentScroll >= 0.556,
          );
        } catch {
          // Cross-origin embeds fall through to the existing message bridge.
        }
      }
      if (communityStoryOwnsWheel) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const pixelDelta = event.deltaY * unit;
      const magnitude = Math.abs(pixelDelta);
      const sensitivity = magnitude >= 40 ? 1.1 : 1;
      const adjustedDelta = Math.sign(pixelDelta) * Math.min(magnitude * sensitivity, 220);
      let handledDirectly = false;

      try {
        const parentArea = window.parent.document.getElementById("modal-scroll-area");
        const parentModal = window.parent.document.getElementById("modal-content");
        if (parentArea && parentModal?.classList.contains("is-zaowu-platform-view")) {
          queueParentScroll(parentArea, adjustedDelta);
          handledDirectly = true;
        }
      } catch {
        // Fall back to postMessage if the showcase is hosted across origins.
      }

      if (!handledDirectly) {
        window.parent.postMessage(
          { type: "zaowu:scroll-parent", deltaY: adjustedDelta },
          window.location.origin,
        );
      }
      event.preventDefault();
    }

    function handleParentScrollMessage(event) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "zaowu:cancel-parent-scroll") cancelParentScroll();
    }

    window.addEventListener("wheel", forwardVerticalWheel, { passive: false, capture: true });
    window.addEventListener("zaowu:cancel-parent-scroll", cancelParentScroll);
    window.addEventListener("message", handleParentScrollMessage);
    return () => {
      window.removeEventListener("wheel", forwardVerticalWheel, { capture: true });
      window.removeEventListener("zaowu:cancel-parent-scroll", cancelParentScroll);
      window.removeEventListener("message", handleParentScrollMessage);
      cancelParentScroll();
    };
  }, []);

  function rotate(direction) {
    if (carouselMotion) return;
    window.clearTimeout(carouselTimerRef.current);
    window.clearTimeout(prepareTimerRef.current);
    setCategoryInteracting(false);
    setHoveredCategory(null);
    const id = Date.now();
    setCarouselMotion({ direction, phase: "prepare", id });
    prepareTimerRef.current = window.setTimeout(() => {
      setCarouselMotion((motion) => (
        motion?.id === id ? { ...motion, phase: "moving" } : motion
      ));
    }, 32);
    carouselTimerRef.current = window.setTimeout(() => {
      setActiveIndex((index) => index + direction);
      setCarouselMotion(null);
    }, CAROUSEL_DURATION);
  }

  function leaveCategoryStage() {
    setCategoryInteracting(false);
    setHoveredCategory(null);
  }

  function focusCategory(index) {
    setCategoryInteracting(true);
    setHoveredCategory((current) => (current === index ? current : index));
  }

  function moveWithinCategoryStage(event) {
    setCategoryInteracting(true);
    const stageRect = event.currentTarget.getBoundingClientRect();
    const pointerX = clamp(((event.clientX - stageRect.left) / stageRect.width) * 100, 0, 100);
    const pointerY = clamp(((event.clientY - stageRect.top) / stageRect.height) * 100, 0, 100);
    event.currentTarget.style.setProperty("--dot-cursor-x", `${pointerX}%`);
    event.currentTarget.style.setProperty("--dot-cursor-y", `${pointerY}%`);
    const categoryButton = event.target.closest?.("[data-category-index]");
    if (!categoryButton || !event.currentTarget.contains(categoryButton)) return;
    const index = Number(categoryButton.dataset.categoryIndex);
    if (Number.isInteger(index)) focusCategory(index);
  }

  function handleCategoryWheel(event) {
    // Keep the large carousel from trapping the page's normal vertical wheel
    // gesture. Only a deliberate horizontal trackpad gesture controls cards.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    const rawDelta = event.deltaX;
    if (Math.abs(rawDelta) < 18 || wheelLockedRef.current || carouselMotion) return;
    event.preventDefault();
    wheelLockedRef.current = true;
    rotate(rawDelta > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLockedRef.current = false;
    }, 760);
  }

  return (
    <main className="app-shell zaowu-embed-shell">
      <div className="view-panel home-view is-active">
        <FlowingMeshBackground />
        <section className="hero-section">
          <div
            key={titleIntroKey}
            className={`hero-copy ${titleFontsReady ? "is-ready" : ""}`}
          >
            <div className="hero-primary">
              <div className="hero-brand-lockup">
                <img
                  className="hero-lockup-icon hero-intro-element hero-intro-icon"
                  src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/inspiration-brand-icon.png"
                  alt=""
                  aria-hidden="true"
                />
                <h1
                  className="hero-title hero-title-split"
                  aria-label={TITLE_LINES[0]}
                >
                  <SplitTitleLine text={TITLE_LINES[0]} startIndex={0} />
                </h1>
              </div>

              <p className="hero-subtitle">
                <span className="hero-intro-element hero-intro-copy-line hero-intro-copy-line-one">
                  活动文创、周边礼品，AI自助定制，一件即可起订
                </span>
              </p>

              <div className="hero-tags" aria-label="项目标签">
                <span className="hero-tag hero-tag-primary hero-intro-element hero-intro-tag-one">
                  AI Native
                </span>
                <span className="hero-tag hero-tag-outline hero-intro-element hero-intro-tag-two">
                  文创创意定制平台产品设计
                </span>
              </div>
            </div>

            <div className="hero-secondary">
              <img
                className="hero-spark-icon hero-intro-element hero-intro-spark"
                src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/hero-spark.png"
                alt=""
                aria-hidden="true"
              />
              <p className="hero-slogan hero-intro-element hero-intro-slogan">
                以灵感诞生好物
              </p>
            </div>
          </div>

          <div
            className={`category-stage ${categoryInteracting ? "is-interacting" : ""}`}
            aria-label="品类轮播"
            aria-roledescription="carousel"
            onMouseEnter={() => setCategoryInteracting(true)}
            onMouseMove={moveWithinCategoryStage}
            onMouseLeave={leaveCategoryStage}
            onWheel={handleCategoryWheel}
          >
            <button
              className="carousel-button left"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                rotate(-1);
              }}
              onMouseMove={(event) => event.stopPropagation()}
              aria-label="上一个品类"
            >
              <CaretLeft size={24} />
            </button>

            <div className={`category-track ${carouselMotion?.phase === "moving" && carouselMotion.direction > 0 ? "is-moving-next" : ""} ${carouselMotion?.phase === "moving" && carouselMotion.direction < 0 ? "is-moving-prev" : ""}`}>
              {visibleCategorySlots.map((slot) => {
                const itemIndex = getCategoryIndex(activeIndex + slot);
                const item = categories[itemIndex];
                const targetSlot = slot - motionDirection;
                const depth = Math.min(3, Math.abs(targetSlot));
                const isFocused = focusIndex === itemIndex && depth <= 2;
                const isOuterRight = targetSlot === 2;
                const isOuterLeft = targetSlot === -2;
                const itemOpacity = depth === 0 ? 1 : depth === 1 ? 0.86 : depth === 2 ? 0.42 : 0;
                const itemScale = depth === 0 ? 1 : depth === 1 ? 0.94 : depth === 2 ? 0.82 : 0.74;
                const tiltAmount = depth === 1 ? 18 : depth === 2 ? 30 : 0;
                const depthOffset = depth === 1 ? -34 : depth === 2 ? -82 : 0;
                const verticalOffset = depth === 1 ? 10 : depth === 2 ? 22 : 0;
                const itemTilt = isFocused || targetSlot === 0 ? 0 : targetSlot < 0 ? -tiltAmount : tiltAmount;
                const itemDepth = isFocused || targetSlot === 0 ? 0 : depthOffset;
                const itemVerticalOffset = isFocused || targetSlot === 0 ? 0 : verticalOffset;
                const outerSpacingAdjustment = depth === 2 ? (targetSlot < 0 ? 42 : -42) : 0;
                const outerMobileSpacingAdjustment = depth === 2 ? (targetSlot < 0 ? 18 : -18) : 0;

                return (
                  <div
                    key={`${activeIndex + slot}-${item.id}`}
                    className={`category-float-item category-${item.id} ${isFocused ? "is-active" : ""} ${depth === 3 ? "is-edge" : ""} ${isOuterLeft ? "is-outer-left" : ""} ${isOuterRight ? "is-outer-right" : ""}`}
                    style={{
                      "--slot": slot,
                      "--item-opacity": itemOpacity,
                      "--item-scale": itemScale,
                      "--item-tilt": `${itemTilt}deg`,
                      "--item-depth": `${itemDepth}px`,
                      "--item-y": `${itemVerticalOffset}px`,
                      "--item-x-adjust": `${outerSpacingAdjustment}px`,
                      "--item-mobile-x-adjust": `${outerMobileSpacingAdjustment}px`,
                      "--item-origin": targetSlot < 0 ? "right center" : targetSlot > 0 ? "left center" : "center center",
                      "--item-mobile-tilt": `${itemTilt * 0.68}deg`,
                      "--item-mobile-depth": `${itemDepth * 0.58}px`,
                      "--item-mobile-y": `${itemVerticalOffset * 0.7}px`,
                      zIndex: 20 - depth,
                    }}
                    data-testid={`category-${item.id}`}
                    data-category-index={itemIndex}
                    onFocus={() => focusCategory(itemIndex)}
                    onMouseEnter={() => focusCategory(itemIndex)}
                  >
                    <span className="category-dot-texture" aria-hidden="true" />
                    <div className="model-stage">
                      <span className="model-ground-shadow" aria-hidden="true" />
                      <CategoryModel product={item} isActive={isFocused} snapActive={false} />
                    </div>
                    <div className="category-title-row">
                      <span className="category-name">{item.name}</span>
                      <span className="category-price">
                        <span className="category-currency-symbol">¥</span>
                        <span className="category-price-number">{item.basePrice}</span>
                        {item.id === "print3d" && <span className="category-price-suffix">起</span>}
                      </span>
                    </div>
                    <span className="category-caption">{item.highlight}</span>
                  </div>
                );
              })}
            </div>

            <button
              className="carousel-button right"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                rotate(1);
              }}
              onMouseMove={(event) => event.stopPropagation()}
              aria-label="下一个品类"
            >
              <CaretRight size={24} />
            </button>

            <div className="carousel-dots" aria-label="轮播分页">
              {categories.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={dotIndex === index ? "is-active" : ""}
                  onClick={() => {
                    window.clearTimeout(carouselTimerRef.current);
                    window.clearTimeout(prepareTimerRef.current);
                    leaveCategoryStage();
                    setCarouselMotion(null);
                    setActiveIndex(index);
                  }}
                  aria-label={`切换到${item.name}`}
                />
              ))}
            </div>
          </div>

          <div
            key={`platform-lower-content-${titleIntroKey}`}
            className="platform-lower-content"
          >
            <section
              className={`platform-overview ${titleFontsReady ? "is-ready" : ""}`}
              aria-labelledby="platform-overview-title"
            >
              <h2
                id="platform-overview-title"
                aria-label="AI Native文创定制平台"
              >
                <SplitOverviewLine text="AI Native文创定制平台" />
              </h2>
              <p aria-label="探索 AI 时代下新的创造方式，让用户从一个模糊想法出发，通过 AI 共创，将灵感转化为可视化设计，并最终落地为真实商品。">
                <SplitOverviewLine
                  className="platform-overview-body-line"
                  text="探索 AI 时代下新的创造方式，让用户从一个模糊想法"
                />
                <SplitOverviewLine
                  className="platform-overview-body-line"
                  startIndex={28}
                  text="出发，通过 AI 共创，将灵感转化为可视化设计，并最"
                />
                <SplitOverviewLine
                  className="platform-overview-body-line"
                  startIndex={56}
                  text="终落地为真实商品。"
                />
              </p>
            </section>

            <aside
              className={`platform-chat-demo ${titleFontsReady ? "is-ready" : ""}`}
              aria-label="AI 共创对话示例"
            >
              <DraggableFloatingProduct
                className="platform-checker-product-figure"
                src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/figure-checker-preview.png"
                label="3D 打印摆件"
                popDelay="1680ms"
                floatDelay="2460ms"
              />
              <DraggableFloatingProduct
                className="platform-checker-product-mug"
                src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/mug-checker-preview.png"
                label="马克杯"
                popDelay="1890ms"
                floatDelay="2670ms"
              />
              <DraggableFloatingProduct
                className="platform-checker-product-tote"
                src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/tote-checker-preview.png"
                label="帆布袋"
                popDelay="2100ms"
                floatDelay="2880ms"
              />
              <DraggableFloatingProduct
                className="platform-checker-product-hoodie"
                src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/hoodie-checker-preview.png"
                label="卫衣"
                popDelay="2310ms"
                floatDelay="3090ms"
              />
              <div className="platform-chat-message platform-chat-message-user">
                我想要一件袋鼠浇花图案的可爱卫衣
              </div>
              <div className="platform-chat-message platform-chat-message-received">
                收到！
              </div>
              <div className="platform-chat-message platform-chat-message-thinking">
                <video
                  className="platform-chat-video"
                  src="https://xiamingjun-project.oss-cn-hangzhou.aliyuncs.com/%E7%81%B5%E6%84%9F%E9%80%A0%E7%89%A9/assets/zaowu/crazy-creating.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
                <span>
                  正在疯狂创意中
                  <span className="platform-chat-dots" aria-hidden="true">
                    {".".repeat(creativeDotCount)}
                  </span>
                  <span className="platform-visually-hidden">...</span>
                </span>
              </div>
            </aside>
          </div>

          <WhyZaowuSection />

          <WorkbenchShowcaseSection />

          <OriginalCommunityWaterfall />
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<InspirationShowcase />);
