import("./zaowu-embed-main.jsx").catch((error) => {
  console.error("灵感造物展示加载失败", error);
  const root = document.getElementById("root");
  if (root) {
    root.dataset.loadError = error?.message || String(error);
  }
});
