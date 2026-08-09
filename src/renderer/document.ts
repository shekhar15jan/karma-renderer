/** Document builder - assembles a self-contained HTML page from a rendered scene.
 *  Delegates to the shared frame builder so /render stills and /video frames
 *  are pixel-identical.
 */

export { buildDocument, buildSceneFrame, renderGraphScene, themeVarsCss } from "./frame";
