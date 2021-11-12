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
const ASBTesting_1 = require("./ASBTesting");
const WebHelper_1 = require("./WebHelper");
const MessageEncoding_1 = require("./MessageEncoding");
const moment_1 = __importDefault(require("moment"));
require("mocha");
const { promisify } = require('util');
const delay = promisify(setTimeout);
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
const chai_1 = require("chai");
dotenv.config();
describe('Submitting NewReservationRequest', async () => {
    var test;
    var demoTopicSub;
    before(async () => {
        // runs once before the first test in this block
        var _a;
        //Create a Service Bus connection for this test
        test = new ASBTesting_1.ASBTest((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : "", new MessageEncoding_1.MassTransitMessageEncoder());
        //Subscribe to the topic first so we dont miss the messages
        demoTopicSub = await test.subscribeToTopic("NewReservationReceived");
    });
    it('should get OK status', async () => {
        var svcResponse = await (0, WebHelper_1.postToService)("http://localhost:7071/api/SubmitReservation", { RequestCorrelationId: test.testUniqueId,
            ReservationId: 1,
            StartDate: (0, moment_1.default)().format('YYYY-MM-DD HH:m:s'),
            EndDate: (0, moment_1.default)().format('YYYY-MM-DD HH:m:s'),
            GuestId: 123
        });
        (0, chai_1.expect)(svcResponse).to.equal(true);
    });
    it('should publish NewReservationEvent', async () => {
        var receivedMessage = await demoTopicSub.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).to.equal(true);
    });
    //CLEAN UP
    after(async () => {
        test.cleanup();
    });
});
//# sourceMappingURL=NewReservation.test.js.map