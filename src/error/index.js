export default function error() {
  //捕获资源加载失败的错误：js css img
  window.addEventListener(
    "error",
    function (e) {
      const target = e.target;
      if (!target) {
        return;
      }
      if (target.src || target.href) {
        const url = target.src || target.href;
        const reportData = {
          type: "error",
          subType: "resource",
          url,
          html: target.outerHTML,
          pageUrl: window.location.href,
          paths: e.path,
        };
      }
    },
    true
  );

  //捕获js错误
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    const reportData = {
      type: "error",
      subType: "js",
      msg,
      url,
      lineNo,
      columnNo,
      stack: error.stack,
      pageUrl: window.location.href,
      startTime: performance.now(),
    };
  };

  window.addEventListener("unhandledrejection", function (e) {
    const reportData = {
      type: "error",
      subType: "promise",
      msg: e.reason?.stack,
      pageUrl: window.location.href,
      startTime: e.timeStamp,
    };
  });
}
