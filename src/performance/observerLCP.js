export function observerLCP() {
  const entryHandler = (list) => {
    if (observer) {
      observer.disconnect();
    }
    for (const entry of list.getEntries()) {
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
  };

  // LCP 指的是页面加载过程中，用户能够看到的 最大内容元素（如文本、图片或视频等） 完成渲染的时间。
  // 它反映了用户在加载页面时看到的 最大可视内容 完全呈现出来的时间点。这个时间点越早，用户就会觉得页面加载得越快，体验越好。

  const observer = new PerformanceObserver(entryHandler);

  observer.observe({ type: "largest-contentful-paint", buffered: true });
}
