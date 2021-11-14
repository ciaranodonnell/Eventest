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
const http = __importStar(require("./WebHelper"));
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
    var NewReservationReceivedSubscription;
    var TakePaymentSubscription;
    var PaymentTakenSubscription;
    var ReservationConfirmedSubscription;
    var testReservationId = 123;
    before(async () => {
        // runs once before the first test in this block
        var _a;
        //Create a Service Bus connection for this test
        test = new ASBTesting_1.AzureServiceBusTester((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : "", new MessageEncoding_1.MassTransitMessageEncoder());
        //Subscribe to the topic first so we dont miss the messages
        NewReservationReceivedSubscription = await test.subscribeToTopic("newreservationreceived");
        TakePaymentSubscription = await test.subscribeToTopic("takepayment");
        PaymentTakenSubscription = await test.subscribeToTopic("paymenttaken");
        ReservationConfirmedSubscription = await test.subscribeToTopic("reservationconfirmed");
        delay(2000);
    });
    it('should get OK status', async () => {
        var _a;
        var svcResponse = await http.postToService((_a = process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : "", {
            RequestCorrelationId: test.testUniqueId,
            ReservationId: testReservationId,
            StartDate: (0, moment_1.default)().format('YYYY-MM-DD HH:m:s'),
            EndDate: (0, moment_1.default)().format('YYYY-MM-DD HH:m:s'),
            GuestId: 123
        });
        (0, chai_1.expect)(svcResponse.statusCode).equal(200);
    });
    it('should publish NewReservationEvent', async () => {
        var receivedMessage = await NewReservationReceivedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
        // console.log(receivedMessage.getMessageBody(0).message);
        //test the reservation Id matches
        //expect(receivedMessage.getMessageBody(0).message.reservationId).equal(testReservationId);
        //check it has the right status
        //expect(receivedMessage.getMessageBody(0).message.reservation.state).equal("Received");
    });
    it('should return the Reservation', async () => {
        var _a, _b;
        var svcResponse = await http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : "") + "?reservationId=" + testReservationId);
        //  console.log(svcResponse.result);
        var responseBody = await ((_b = svcResponse.result) === null || _b === void 0 ? void 0 : _b.json());
        (0, chai_1.expect)(svcResponse.success).equal(true);
    });
    it('should publish Take Payment Command', async () => {
        var receivedMessage = await TakePaymentSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
        /*
{
  "messageId": "9bc20000-5d2a-2cf0-0312-08d9a6c0dab2",
  "correlationId": "b95971b1-4f53-42e0-962e-cf39882653df",
  "conversationId": "864c0000-5d1f-0015-1926-08d9a6c0d469",
  "initiatorId": "b95971b1-4f53-42e0-962e-cf39882653df",
  "sourceAddress": "sb://ciaransyoutubedemos.servicebus.windows.net/takepayment/Subscriptions/functionsub",
  "destinationAddress": "sb://ciaransyoutubedemos.servicebus.windows.net/paymenttaken",
  "messageType": [
    "urn:message:TestEndpoints:PaymentTakenEvent"
  ],
  "message": {
    "amount": 50000,
    "success": true,
    "paymentId": "bca4a9d7-ddb8-4a7e-bc1a-ef51604f0a2f",
    "reservationId": 123
  },
  "sentTime": "2021-11-13T16:15:48.266677Z",
  "headers": {
    "MT-Activity-Id": "00-d55a2ac2c2623bdb397363a8361a6282-5b0cf3e328751ab4-00"
  },
  "host": {
    "machineName": "SPARKY",
    "processName": "func",
    "processId": 28124,
    "assembly": "func",
    "assemblyVersion": "4.0.3971.0",
    "frameworkVersion": "6.0.0",
    "massTransitVersion": "7.2.4.0",
    "operatingSystemVersion": "Microsoft Windows NT 10.0.22000.0"
  }
}
        */
    });
    it('should publish Payment Taken Event', async () => {
        var receivedMessage = await PaymentTakenSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).to.equal(true);
    });
    it('should publish ReservationConfirmed event', async () => {
        var receivedMessage = await ReservationConfirmedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should return the Reservation as State=Confirmed', async () => {
        var _a, _b;
        var svcResponse = await http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : "") + "?reservationId=" + testReservationId);
        var responseBody = await ((_b = svcResponse.result) === null || _b === void 0 ? void 0 : _b.json());
        (0, chai_1.expect)(svcResponse.success).equal(true);
        console.log(responseBody);
        (0, chai_1.expect)(responseBody.Status).equal("Confirmed");
    });
    //CLEAN UP
    after(async () => {
        // test.cleanup();
    });
});
//# sourceMappingURL=NewReservation.test.js.map