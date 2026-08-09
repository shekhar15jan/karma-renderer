"use strict";
/** Document builder - assembles a self-contained HTML page from a rendered scene.
 *  Delegates to the shared frame builder so /render stills and /video frames
 *  are pixel-identical.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.themeVarsCss = exports.renderGraphScene = exports.buildSceneFrame = exports.buildDocument = void 0;
var frame_1 = require("./frame");
Object.defineProperty(exports, "buildDocument", { enumerable: true, get: function () { return frame_1.buildDocument; } });
Object.defineProperty(exports, "buildSceneFrame", { enumerable: true, get: function () { return frame_1.buildSceneFrame; } });
Object.defineProperty(exports, "renderGraphScene", { enumerable: true, get: function () { return frame_1.renderGraphScene; } });
Object.defineProperty(exports, "themeVarsCss", { enumerable: true, get: function () { return frame_1.themeVarsCss; } });
