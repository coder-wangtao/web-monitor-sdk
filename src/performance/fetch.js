const originalFetch = window.fetch;

function overwriteFetch() {
  window.fetch = function newFetch(url, config) {
    const startTime = Date.now();
    const reportData = {
      type: "performance",
      subType: "fetch",
      url,
      startTime,
      method: config.method,
    };
    return originalFetch(url, config)
      .then((res) => {
        const endTime = Date.now();
        reportData.endTime = endTime;
        reportData.duration = endTime - startTime;
        const data = res.clone();
        reportData.status = res.status;
        reportData.success = res.ok;
        //todo
        return res;
      })
      .catch((err) => {
        const endTime = Date.now();
        reportData.endTime = endTime;
        reportData.duration = endTime - startTime;
        reportData.status = 0;
        reportData.success = false;
        //todo
      });
  };
}

export default function fetch() {
  originalFetch();
}
