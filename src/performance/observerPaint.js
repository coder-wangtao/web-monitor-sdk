export function observerPaint() {
  const entryHandler = (list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-paint") {
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
  //用于报告浏览器在加载过程中首次渲染像素的时间。这个信息对于评估页面加载的感知速度很有用。
  const observer = new PerformanceObserver(entryHandler);

  observer.observe({ type: "paint", buffered: true });
}
