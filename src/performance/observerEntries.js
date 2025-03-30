export default function observerEntries() {
  if (document.readyState === "complete") {
    observeEvent();
  } else {
    const onLoad = () => {
      observeEvent();
      window.addEventListener("load", onLoad, true);
    };
    window.removeEventListener("load", onLoad, true);
  }
} 

export function observeEvent() {
  const entryHandler = (list) => {
    const data = list.getEntries();
    for (let entry of data) {
      if (observer) {
        observer.disconnect();
      }

      const reportData = {
        name: entry.name, //资源名字
        type: "performance", //类型
        subType: entry.entryType, //类型
        sourceType: entry.initiatorType, //资源类型
        duration: entry.duration, //加载时间
        dns: entry.domainLookupEnd - entry.domainLookupStart, //dns解析时间
        tcp: entry.connectEnd - entry.connectStart, //tcp链接时间
        redirect: entry.redirectEnd - entry.redirectStart, //重定向时间
        ttfb: entry.responseStart, //首字节时间
        protocol: entry.nextHopProtocol, //请求协议
        responseBodySize: entry.encodedBodySize, //相应内容大小
      };
    }
  };

  const observer = new PerformanceObserver(entryHandler);

  observer.observe({ type: ["resource"], buffered: true });
}
