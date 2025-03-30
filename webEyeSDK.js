window.__webEyeSDK__ = {
  version: "0.0.1",
};

export function install(Vue, options) {
  if (__webEyeSDK__.vue) return;
  __webEyeSDK__.vue = true;
  const handler = Vue.config.errorHandler;
  Vue.config.errorHandler = function (err, vm, info) {
    if (handler) {
      handler.call(this, err, vm, info);
    }
  };
}

function errorBoundary(err){
  if (__webEyeSDK__.react) return;
  __webEyeSDK__.react = true;
}

export default {
  install,
  errorBoundary
};
