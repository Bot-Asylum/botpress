"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _api = _interopRequireDefault(require("./api"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is called when server is started, usually to set up the database
const onServerStarted = async bp => {}; // At this point, you would likely setup the API route of your module.


const onServerReady = async bp => {
  await (0, _api.default)(bp);
}; // Every time a bot is created (or enabled), this method will be called with the bot id


const onBotMount = async (bp, botId) => {}; // This is called every time a bot is deleted (or disabled)
//const onBotUnmount = async (botId: string) => {}
// When anything is changed using the flow editor, this is called with the new flow, so you can rename nodes if you reference them


const onFlowChanged = async (bp, botId, flow) => {};
/**
 * This is where you would include your 'demo-bot' definitions.
 * You can copy the content of any existing bot and mark them as "templates", so you can create multiple bots from the same template.
 */


const botTemplates = [{
  id: 'my_bot_demo',
  name: 'Bot Demo',
  desc: `Some description`
}];
/**
 * Skills allows you to create custom logic and use them easily on the flow editor
 * Check this link for more information: https://botpress.com/docs/developers/create-module/#skill-creation
 */

const skills = [];
const entryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  //  onBotUnmount,
  onFlowChanged,
  botTemplates,
  skills,
  definition: {
    // This must match the name of your module's folder, and the name in package.json
    name: 'complete-module',

    /**
     * When menuIcon is set to `custom`, you need to provide an icon. It must be at that location: `/assets/icon.png`
     * Otherwise, use Material icons name: https://material.io/tools/icons/?style=baseline
     */
    menuIcon: 'flag',
    // This is the name of your module which will be displayed in the sidebar
    menuText: 'Complete Module',
    // When set to `true`, the name and icon of your module won't be displayed in the sidebar
    noInterface: false,
    // The full name is used in other places, for example when displaying bot templates
    fullName: 'Complete Module',
    // Not used anywhere, but should be a link to your website or module repository
    homepage: 'https://botpress.com'
  }
};
var _default = entryPoint;
exports.default = _default;
//# sourceMappingURL=index.js.map