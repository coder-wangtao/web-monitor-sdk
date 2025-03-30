export default function observerLoad() {
  window.addEventListener("pageShow", function (event) {
    requestAnimationFrame(() => {
      ["load"].forEach((type) => {
        const reportData = {
          type: "performance",
          subType: type,
          pageUrl: window.location.href,
          startTime: performance.now(),
        };
      });
    }, true);
  });
}
