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
const eventest_1 = require("eventest");
const eventest_servicebus_1 = require("eventest.servicebus");
const moment_1 = __importDefault(require("moment"));
require("mocha");
const { promisify } = require('util');
const delay = promisify(setTimeout);
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
const chai_1 = require("chai");
dotenv.config();
describe('Submitting Expensive Reservation', async () => {
    var test;
    var NewReservationReceivedSubscription;
    var TakePaymentSubscription;
    var PaymentTakenSubscription;
    var PaymentFailedSubscription;
    var ReservationConfirmedSubscription;
    var ReservationRejectedSubscription;
    var testReservationId = 123;
    before(async () => {
        // runs once before the first test in this block
        var _a;
        //Create a Service Bus connection for this test
        test = new eventest_servicebus_1.AzureServiceBusTester((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : "", new eventest_1.MassTransitMessageEncoder());
        //Subscribe to the topic first so we dont miss the messages
        NewReservationReceivedSubscription = await test.subscribeToTopic("newreservationreceived");
        TakePaymentSubscription = await test.subscribeToTopic("takepayment");
        PaymentTakenSubscription = await test.subscribeToTopic("paymenttaken");
        PaymentFailedSubscription = await test.subscribeToTopic("paymentrejected");
        ReservationRejectedSubscription = await test.subscribeToTopic("reservationrejected");
        //give it a couple of seconds to make sure the subscriptions are active
        delay(2000);
    });
    it('should get OK status', async () => {
        var _a;
        var svcResponse = await eventest_1.http.postToService((_a = process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : "", 
        //This is the payload to send to the service:
        {
            RequestCorrelationId: test.testUniqueId,
            ReservationId: testReservationId,
            StartDate: (0, moment_1.default)().format('YYYY-MM-DDTHH:mm:ss'),
            //Making the reservation last 100 days makes it too expensive
            EndDate: (0, moment_1.default)().add("100", "days").format('YYYY-MM-DDTHH:mm:ss'),
            GuestId: 123
        });
        // test that we got a 200 success
        (0, chai_1.expect)(svcResponse.statusCode).equal(200);
    });
    it('should publish NewReservationEvent', async () => {
        //wait up to 2 seconds to receive a message on our subscription
        var receivedMessage = await NewReservationReceivedSubscription.waitForMessage(2000);
        //test we got a message
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
        //test the reservation Id matches
        (0, chai_1.expect)(receivedMessage.getMessageBody().reservationId).equal(testReservationId);
    });
    it('should return the Reservation', async () => {
        var _a;
        var result = await eventest_1.http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : "") + "?reservationId=" + testReservationId);
        (0, chai_1.expect)(result.success).equal(true);
    });
    it('should publish Take Payment Command', async () => {
        var receivedMessage = await TakePaymentSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should publish Payment Rejected Event', async () => {
        var receivedMessage = await PaymentFailedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).to.equal(true);
    });
    it('should publish Reservation Rejected event', async () => {
        var receivedMessage = await ReservationRejectedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should return the Reservation as State=Confirmed', async () => {
        var _a;
        var result = await eventest_1.http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : "") + "?reservationId=" + testReservationId);
        //test we got a 200 level response
        (0, chai_1.expect)(result.success).equal(true);
        //test that the object in the body had a field called status with a value = 'Failed'
        (0, chai_1.expect)(result.body.Status).equal("Failed");
    });
    //Clean up after all the tests
    after(async () => {
        //this removes all the subscriptions we made
        test.cleanup();
    });
});
//# sourceMappingURL=MalformedTakePaymentCommand.test.js.map