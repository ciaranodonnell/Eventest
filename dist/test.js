"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ASBTesting_1 = require("./ASBTesting");
const MessageEncoding_1 = require("./MessageEncoding");
const { promisify } = require('util');
const delay = promisify(setTimeout);
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function main() {
    var _a;
    var test = new ASBTesting_1.ASBTest((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : "", new MessageEncoding_1.MassTransitMessageEncoder());
    var demoTopicSub = await test.subscribeToTopic("demotopic");
    test.sendMessageToTopic("demotopic", "this is the message", "messageType");
    var receivedMessage = await demoTopicSub.waitForMessage(2000);
    if (receivedMessage.didReceive) {
        console.log(receivedMessage.getMessageBody(0));
    }
    else {
        console.log("no message received");
    }
    //CLEAN UP
    await delay(5000);
    test.cleanup();
    process.exit(0);
}
main();
//# sourceMappingURL=test.js.map