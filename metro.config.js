const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// `expo-sqlite` on web uses a wa-sqlite WebAssembly module and a web worker.
// Metro needs `.wasm` recognized as an asset so the worker bundle can resolve it.
config.resolver.assetExts.push('wasm');

// Web Workers + SharedArrayBuffer require cross-origin isolation headers.
// Without these, `expo-sqlite` throws "SharedArrayBuffer is not defined" on web.
config.server = config.server ?? {};
const previousEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const middleware = previousEnhanceMiddleware
    ? previousEnhanceMiddleware(metroMiddleware, metroServer)
    : metroMiddleware;

  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;
