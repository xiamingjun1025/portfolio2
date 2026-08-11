const STYLE_ID = "prompt-card-hover-parity-styles";

const styles = `
.prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger,
.prompt-dock .prompt-dock-reference-zone.is-empty .prompt-dock-reference-tilt {
  transform-origin: center center;
  translate: 0 0;
  rotate: 0deg;
  scale: 1;
  backface-visibility: hidden;
  will-change: translate, rotate, scale;
  transition:
    translate 360ms cubic-bezier(0.22, 1, 0.36, 1),
    rotate 360ms cubic-bezier(0.22, 1, 0.36, 1),
    scale 360ms cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.prompt-dock-editor-category .is-category-selector.is-category-unselected,
.prompt-dock-editor-category .is-category-selector.is-category-unselected:hover,
.prompt-dock-editor-category .is-category-selector.is-category-unselected.is-open {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  filter: none !important;
}

.prompt-dock-select-menu.is-category-grid > button,
.prompt-dock-select-menu.is-category-grid > button:hover,
.prompt-dock-select-menu.is-category-grid > button:focus,
.prompt-dock-select-menu.is-category-grid > button:focus-visible,
.prompt-dock-select-menu.is-category-grid > button[aria-selected="true"] {
  background-color: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  filter: none !important;
}

.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector:hover,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector:focus,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector:focus-visible,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-open {
  border-color: transparent !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  filter: none !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector::before,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector::after {
  content: none !important;
  display: none !important;
  background: transparent !important;
  box-shadow: none !important;
  filter: none !important;
}

.prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger,
.prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger:hover,
.prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger:focus,
.prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger:focus-visible {
  box-shadow: none !important;
  filter: none !important;
}

.prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger::before,
.prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger:hover::before,
.prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger:focus-visible::before {
  box-shadow: none !important;
  filter: none !important;
  text-shadow: none !important;
}

.prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger::after {
  content: none !important;
  display: none !important;
  background: transparent !important;
  box-shadow: none !important;
  filter: none !important;
}

.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-category-unselected {
  transform-origin: center center;
  translate: 0 0;
  rotate: 0deg;
  scale: 1;
  will-change: translate, rotate, scale;
  transition:
    translate 360ms cubic-bezier(0.22, 1, 0.36, 1),
    rotate 360ms cubic-bezier(0.22, 1, 0.36, 1),
    scale 360ms cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger:hover,
.is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-category-unselected .prompt-dock-select-trigger:focus-visible {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  filter: none !important;
  transform: none !important;
  translate: 0 0 !important;
  rotate: 0deg !important;
  scale: 1 !important;
}

@media (hover: hover) and (pointer: fine) {
  .is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-category-unselected:hover,
  .is-workbench-prompt-dock .prompt-dock-editor-category .is-category-selector.is-category-unselected:focus-within {
    translate: 0 -3px;
    rotate: -8deg;
    scale: 1.04;
  }
}

.prompt-dock .prompt-dock-reference-zone.is-empty .prompt-dock-reference-tilt {
  transform: none !important;
}

@media (hover: hover) and (pointer: fine) {
  .prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger:hover,
  .prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger:focus-visible,
  .prompt-dock .prompt-dock-reference-zone.is-empty:hover .prompt-dock-reference-tilt,
  .prompt-dock .prompt-dock-reference-zone.is-empty:focus-within .prompt-dock-reference-tilt {
    translate: 0 -3px;
    rotate: -8deg;
    scale: 1.04;
  }

  .prompt-dock .prompt-dock-reference-zone.is-empty:hover .prompt-dock-reference-tilt,
  .prompt-dock .prompt-dock-reference-zone.is-empty:focus-within .prompt-dock-reference-tilt {
    box-shadow: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .prompt-dock-editor-category .is-category-selector .prompt-dock-select-trigger,
  .prompt-dock .prompt-dock-reference-zone.is-empty .prompt-dock-reference-tilt {
    transition-duration: 1ms !important;
  }
}
`;

const installStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = styles;
  document.head.append(style);
};

if (document.head) installStyles();
else window.addEventListener("DOMContentLoaded", installStyles, { once: true });
