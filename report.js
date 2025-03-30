import config from "./config";
export const originalProto = XMLHttpRequest.prototype;
export const originalSend = originalProto.send;
export const originalOpen = originalProto.open;

export default function generateUniqueId() {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
}

export function report(data) {
  if (!config.url) {
    console.error("请设置上传的 url 地址");
  }

  const reportData = JSON.stringify({
    id: generateUniqueId(),
    data,
  });

  const value = beaconRequest(config.url, reportData);
  if (!value) {
    config.isImageUpload ? imgRequest(reportData) : xhrRequest(reportData);
  }
}

export function imgRequest(data) {
  const img = new Image();
  img.src = `${config.url}?data=${encodeURIComponent(JSON.stringify(data))}`;
}

export function xhrRequest(data) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(
      () => {
        const xhr = new XMLHttpRequest();
        originalOpen.call(xhr, "post", data.url);
        originalSend.call(xhr, JSON.stringify(data));
      },
      { timeout: 3000 }
    );
  } else {
    setTimeout(() => {
      const xhr = new XMLHttpRequest();
      originalOpen.call(xhr, "post", data.url);
      originalSend.call(xhr, JSON.stringify(data));
    });
  }
}

export function isSupportSendBeacon() {
  return "sendBeacon" in navigator;
}

const sendBeacon = isSupportSendBeacon() ? navigator.sendBeacon : beaconRequest;
export function beaconRequest(data) {
  let flag = true;
  if (window.requestIdleCallback) {
    window.requestIdleCallback(
      () => {
        return (flag = sendBeacon(config.url, data));
      },
      { timeout: 3000 }
    );
  } else {
    setTimeout(() => {
      return (flag = sendBeacon(config.url, data));
    });
  }
}
