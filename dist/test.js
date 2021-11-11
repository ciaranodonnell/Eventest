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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicTest = void 0;
const ASBTesting_1 = require("./ASBTesting");
const MessageEncoding_1 = require("./MessageEncoding");
const moment_1 = __importDefault(require("moment"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const { promisify } = require('util');
const delay = promisify(setTimeout);
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function BasicTest() {
    var _a;
    var test = new ASBTesting_1.ASBTest((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : "", new MessageEncoding_1.MassTransitMessageEncoder());
    var demoTopicSub = await test.subscribeToTopic("NewReservationReceived");
    var data = JSON.stringify({ RequestCorrelationId: test.testUniqueId,
        ReservationId: 1,
        StartDate: (0, moment_1.default)().format('YYYY-MM-DD HH:m:s'),
        EndDate: (0, moment_1.default)().format('YYYY-MM-DD HH:m:s'),
        GuestId: 123
    });
    console.log("About to call API");
    try {
        var httpResult = await (0, node_fetch_1.default)("http://localhost:7071/api/SubmitReservation", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        });
        console.log("API Called. Response");
        console.log(httpResult);
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    //test.sendMessageToTopic("NewReservationReceived", "this is the message", "messageType");
    console.log("waiting for message");
    var receivedMessage = await demoTopicSub.waitForMessage(2000);
    if (receivedMessage.didReceive) {
        console.log("Message received");
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
exports.BasicTest = BasicTest;
try {
    BasicTest();
}
catch (e) {
    console.log(e);
}
//# sourceMappingURL=test.js.map