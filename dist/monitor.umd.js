(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.monitor = {}));
})(this, (function (exports) { 'use strict';

  function getUUID() {
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  function deepClone(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    const clone = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone(obj[key]);
      }
    }
    return clone;
  }

  const cache = [];

  function clearCache() {
    cache.length = 0;
  }

  function addCache(data) {
    cache.push(data);
  }

  function getCache() {
    return deepClone(cache);
  }

  const config = {
    url: "http://127.0.0.1:8080/api",
    project: "webEyesSDK",
    version: "0.0.1",
    appID: "1234567890",
    userID: "1234567890",
    isImageUpload: false,
    batchSize: 5,
  };

  function setConfig(options) {
    for (const key in config) {
      if (options[key] !== undefined) {
        config[key] = options[key];
      }
    }
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  function report(data) {
    if (!config.url) {
      console.error("webEyesSDK: 请先配置上报地址");
      return;
    }
    const reportData = JSON.stringify({
      id: getUUID(),
      data,
    });
    // 上报数据，使用图片的方式
    if (config.isImageUpload) {
      imgRequest(reportData);
    } else {
      // 优先使用 sendBeacon 上报
      if (
        window.navigator.sendBeacon &&
        typeof window.navigator.sendBeacon === "function"
      ) {
        return beaconRequest(reportData);
      } else {
        xhrRequest(reportData);
      }
    }
  }

  // 批量上报数据
  function lazyReportBatch(data) {
    addCache(data);
    const dataCache = getCache();
    console.error(data);
    if (dataCache.length && dataCache.length >= config.batchSize) {
      report(dataCache);
      clearCache();
    }
  }

  function imgRequest(data) {
    const img = new Image();
    img.src = `${config.url}?data=${encodeURIComponent(JSON.stringify(data))}`;
  }

  function xhrRequest(data) {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(
        () => {
          const xhr = new XMLHttpRequest();
          originalOpen.call(xhr, "post", config.url);
          originalSend.call(xhr, data);
        },
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => {
        const xhr = new XMLHttpRequest();
        originalOpen.call(xhr, "post", config.url);
        originalSend.call(xhr, data);
      }, 0);
    }
  }

  function beaconRequest(data) {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(
        () => {
          window.navigator.sendBeacon(config.url, data);
        },
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => {
        window.navigator.sendBeacon(config.url, data);
      }, 0);
    }
  }

  const originalFetch = window.fetch;

  function fetch() {
    originalFetch();
  }

  function observerEntries() {
    if (document.readyState === "complete") {
      observeEvent();
    } else {
      const onLoad = () => {
        observeEvent();
        window.removeEventListener("load", onLoad, true);
      };
      window.addEventListener("load", onLoad, true);
    }
  }

  function observeEvent() {
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
        lazyReportBatch(reportData);
      }
    };

    const observer = new PerformanceObserver(entryHandler);

    observer.observe({ type: ["resource"], buffered: true });
  }

  function observerPaint$1() {
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
          lazyReportBatch(reportData);
        }
      }
    };
    //first-contentful-paint 是 Paint Timing API 中的一项关键指标，它表示页面中第一个有意义的内容（如文本或图像）被渲染的时间。
    const observer = new PerformanceObserver(entryHandler);

    observer.observe({ type: "paint", buffered: true });
  }

  function observerLCP() {
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
        lazyReportBatch(reportData);
      }
    };

    // LCP 指的是页面加载过程中，用户能够看到的 最大内容元素（如文本、图片或视频等） 完成渲染的时间。
    // 它反映了用户在加载页面时看到的 最大可视内容 完全呈现出来的时间点。这个时间点越早，用户就会觉得页面加载得越快，体验越好。

    const observer = new PerformanceObserver(entryHandler);

    observer.observe({ type: "largest-contentful-paint", buffered: true });
  }

  function observerLoad() {
    window.addEventListener("pageShow", function (event) {
      requestAnimationFrame(() => {
        ["load"].forEach((type) => {
          const reportData = {
            type: "performance",
            subType: type,
            pageUrl: window.location.href,
            startTime: performance.now(),
          };
          lazyReportBatch(reportData);
        });
      }, true);
    });
  }

  function observerPaint() {
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
          lazyReportBatch(reportData);
        }
      }
    };
    //用于报告浏览器在加载过程中首次渲染像素的时间。这个信息对于评估页面加载的感知速度很有用。
    const observer = new PerformanceObserver(entryHandler);

    observer.observe({ type: "paint", buffered: true });
  }

  function performance$1() {
    fetch();
    observerEntries();
    observerPaint$1();
    observerLCP();
    observerLoad();
    observerPaint();
  }

  function error() {
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
          lazyReportBatch(reportData);
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
      lazyReportBatch(reportData);
    };

    window.addEventListener(
      "unhandledrejection",
      function (e) {
        const reportData = {
          type: "error",
          subType: "promise",
          msg: e.reason?.stack,
          pageUrl: window.location.href,
          startTime: e.timeStamp,
        };
        lazyReportBatch(reportData);
      },
      true
    );
  }

  function pv() {
    const reportData = {
      type: "behavior",
      subType: "pv",
      pageUrl: window.location.href,
      startTime: performance.now(),
      referrer: document.referrer,
      uuid: getUUID(),
    };
    lazyReportBatch(reportData);
  }

  function onClick() {
    ["mousedown", "touchstart"].forEach((type) => {
      window.addEventListener(type, (e) => {
        const target = e.target;
        if (target.tagName) {
          const reportData = {
            type: "behavior",
            subType: type,
            tagName: target.tagName,
            startTime: e.timeStamp,
            innerHTML: target.innerHTML,
            outerHTML: target.outerHTML,
            width: target.offsetWidth,
            height: target.offsetHeight,
            eventType: e.type,
            //   path: e.path,
            uuid: getUUID(),
          };
          lazyReportBatch(reportData);
        }
      });
    });
  }

  function pageChange() {
    // hash histroy
    let oldUrl = "";
    window.addEventListener(
      "hashchange",
      function (event) {
        console.error("hashchange", event);
        const newUrl = event.newURL;
        const reportData = {
          form: oldUrl,
          to: newUrl,
          type: "behavior",
          subType: "hashchange",
          startTime: performance.now(),
          uuid: getUUID(),
        };
        lazyReportBatch(reportData);
        oldUrl = newUrl;
      },
      true
    );

    let from = "";
    window.addEventListener(
      "popstate",
      function (event) {
        console.error("popstate", event);
        const to = window.location.href;
        const reportData = {
          form: from,
          to: to,
          type: "behavior",
          subType: "popstate",
          startTime: performance.now(),
          uuid: getUUID(),
        };
        lazyReportBatch(reportData);
        from = to;
      },
      true
    );
  }

  function behavior() {
    pv();
    onClick();
    pageChange();
  }

  window.__webEyesSDK__ = {
    version: "0.0.1",
  };
  // 针对Vue项目的错误捕获
  function install(Vue, options) {
    if (__webEyesSDK__.vue) return;
    __webEyesSDK__.vue = true;
    setConfig(options);
    const handler = Vue.config.errorHandler;
    Vue.config.errorHandler = function (err, vm, info) {
      if (handler) {
        handler(err, vm, info);
      }
      const reportData = {
        type: "error",
        subType: "vue",
        info,
        error: err?.stack,
        startTime: window.performance.now(),
        pageURL: window.location.href,
      };
      console.log("vue error", reportData);
      lazyReportBatch(reportData);
    };
  }

  // 针对 react 项目的错误捕获
  function errorBoundary(err, info) {
    if (__webEyesSDK__.react) return;
    __webEyesSDK__.react = true;
    const reportData = {
      type: "error",
      subType: "react",
      error: err?.stack,
      info,
      startTime: window.performance.now(),
      pageURL: window.location.href,
    };
    lazyReportBatch(reportData);
  }

  function init(options) {
    setConfig(options);
    error();
    behavior();
    performance$1();
  }
  var webEyeSDK = {
    install,
    errorBoundary,
    init,
    performance: performance$1,
    behavior,
    error,
  };

  exports.default = webEyeSDK;
  exports.errorBoundary = errorBoundary;
  exports.init = init;
  exports.install = install;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=monitor.umd.js.map
