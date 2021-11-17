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
const Eventest_1 = require("Eventest");
const Eventest_ServiceBus_1 = require("Eventest.ServiceBus");
const moment_1 = __importDefault(require("moment"));
require("mocha");
const util_1 = require("util");
const delay = (0, util_1.promisify)(setTimeout);
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
const chai_1 = require("chai");
dotenv.config();
describe('Submitting NewReservationRequest', async () => {
    let test;
    let newReservationReceivedSubscription;
    let takePaymentSubscription;
    let paymentTakenSubscription;
    let reservationConfirmedSubscription;
    const testReservationId = 123;
    before(async () => {
        // runs once before the first test in this block
        var _a;
        // Create a Service Bus connection for this test
        test = new Eventest_ServiceBus_1.AzureServiceBusTester((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : '', new Eventest_1.MassTransitMessageEncoder());
        // Subscribe to the topic first so we dont miss the messages
        newReservationReceivedSubscription = await test.subscribeToTopic('newreservationreceived');
        takePaymentSubscription = await test.subscribeToTopic('takepayment');
        paymentTakenSubscription = await test.subscribeToTopic('paymenttaken');
        reservationConfirmedSubscription = await test.subscribeToTopic('reservationconfirmed');
        // give it a couple of seconds to make sure the subscriptions are active
        delay(2000);
    });
    it('should get OK status', async () => {
        var _a;
        const svcResponse = await Eventest_1.http.postToService((_a = process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : '', 
        // This is the payload to send to the service:
        {
            RequestCorrelationId: test.testUniqueId,
            ReservationId: testReservationId,
            StartDate: (0, moment_1.default)().format('YYYY-MM-DDTHH:mm:ss'),
            EndDate: (0, moment_1.default)().add('2', 'days').format('YYYY-MM-DDTHH:mm:ss'),
            GuestId: 123
        });
        // test that we got a 200 success
        (0, chai_1.expect)(svcResponse.statusCode).equal(200);
    });
    it('should publish NewReservationEvent', async () => {
        // wait up to 2 seconds to receive a message on our subscription
        const receivedMessage = await newReservationReceivedSubscription.waitForMessage(2000);
        // test we got a message
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
        // test the reservation Id matches
        (0, chai_1.expect)(receivedMessage.getMessageBody().reservationId).equal(testReservationId);
    });
    it('should return the Reservation', async () => {
        var _a;
        const result = await Eventest_1.http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : '')
            + '?reservationId=' + testReservationId);
        (0, chai_1.expect)(result.success).equal(true);
    });
    it('should publish Take Payment Command', async () => {
        const receivedMessage = await takePaymentSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should publish Payment Taken Event', async () => {
        const receivedMessage = await paymentTakenSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).to.equal(true);
    });
    it('should publish ReservationConfirmed event', async () => {
        const receivedMessage = await reservationConfirmedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should return the Reservation as State=Confirmed', async () => {
        var _a;
        const result = await Eventest_1.http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : '')
            + '?reservationId=' + testReservationId);
        // test we got a 200 level response
        (0, chai_1.expect)(result.success).equal(true);
        // test that the object in the body had a field called status with a value = 'Confirmed'
        (0, chai_1.expect)(result.body.Status).equal('Confirmed');
    });
    // Clean up after all the tests
    after(async () => {
        // this removes all the subscriptions we made
        test.cleanup();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3TmV3UmVzZXJ2YXRpb24uaWdub3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1Jhd05ld1Jlc2VydmF0aW9uLmlnbm9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBZ0g7QUFDaEgsNkRBQTJEO0FBRTNELG9EQUE0QjtBQUM1QixpQkFBZTtBQUNmLCtCQUFpQztBQUVqQyxNQUFNLEtBQUssR0FBRyxJQUFBLGdCQUFTLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFFcEMsa0NBQWtDO0FBQ2xDLCtDQUFpQztBQUNqQywrQkFBOEI7QUFHOUIsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBS2hCLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLElBQUksRUFBRTtJQUVwRCxJQUFJLElBQVksQ0FBQztJQUVqQixJQUFJLGtDQUFnRCxDQUFDO0lBQ3JELElBQUksdUJBQXFDLENBQUM7SUFDMUMsSUFBSSx3QkFBc0MsQ0FBQztJQUMzQyxJQUFJLGdDQUE4QyxDQUFDO0lBRW5ELE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBRTlCLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNkLGdEQUFnRDs7UUFFaEQsZ0RBQWdEO1FBQ2hELElBQUksR0FBRyxJQUFJLDJDQUFxQixDQUM1QixNQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLG1DQUFJLEVBQUUsRUFDOUMsSUFBSSxvQ0FBeUIsRUFBRSxDQUNsQyxDQUFDO1FBRUYsNERBQTREO1FBQzVELGtDQUFrQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDM0YsdUJBQXVCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckUsd0JBQXdCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFD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