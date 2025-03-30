export function observerPaint() {
  const entryHandler = (list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") {
        observer.disconnect();
        const json = entry.toJSON();
        console.log(json);
        const reportData = {
          ...json,
          type: "performance",
          subType: entry.name,
          pageUrl: window.location.href,
        };
        //发送数据
      }
    }
  };
  //first-contentful-paint 是 Paint Timing API 中的一项关键指标，它表示页面中第一个有意义的内容（如文本或图像）被渲染的时间。
  const observer = new PerformanceObserver(entryHandler);

  observer.observe({ type: "paint", buffered: true });
}
