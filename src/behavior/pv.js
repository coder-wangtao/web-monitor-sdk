import { lazyReportBatch } from "../report.js";
import { getUUID } from "../utils.js";

export default function pv() {
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
