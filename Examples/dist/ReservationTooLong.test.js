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
const util_1 = require("util");
const delay = (0, util_1.promisify)(setTimeout);
// Load the .env file if it exists
const dotenv = __importStar(require("dotenv"));
const chai_1 = require("chai");
dotenv.config();
describe('Submitting Expensive Reservation', async () => {
    let test;
    let newReservationReceivedSubscription;
    let takePaymentSubscription;
    let paymentTakenSubscription;
    let paymentFailedSubscription;
    let reservationRejectedSubscription;
    const testReservationId = 123;
    before(async () => {
        // runs once before the first test in this block
        var _a;
        // Create a Service Bus connection for this test
        test = new eventest_servicebus_1.AzureServiceBusTester((_a = process.env.SERVICEBUS_CONNECTION_STRING) !== null && _a !== void 0 ? _a : '', new eventest_1.MassTransitMessageEncoder());
        // Subscribe to the topic first so we dont miss the messages
        newReservationReceivedSubscription = await test.subscribeToTopic('newreservationreceived');
        takePaymentSubscription = await test.subscribeToTopic('takepayment');
        paymentTakenSubscription = await test.subscribeToTopic('paymenttaken');
        paymentFailedSubscription = await test.subscribeToTopic('paymentrejected');
        reservationRejectedSubscription = await test.subscribeToTopic('reservationrejected');
        // give it a couple of seconds to make sure the subscriptions are active
        delay(2000);
    });
    it('should get OK status', async () => {
        var _a;
        const svcResponse = await eventest_1.http.postToService((_a = process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : '', 
        // This is the payload to send to the service:
        {
            RequestCorrelationId: test.testUniqueId,
            ReservationId: testReservationId,
            StartDate: (0, moment_1.default)().format('YYYY-MM-DDTHH:mm:ss'),
            // Making the reservation last 100 days makes it too expensive
            EndDate: (0, moment_1.default)().add('100', 'days').format('YYYY-MM-DDTHH:mm:ss'),
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
        const result = await eventest_1.http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : '')
            + '?reservationId=' + testReservationId);
        (0, chai_1.expect)(result.success).equal(true);
    });
    it('should publish Take Payment Command', async () => {
        const receivedMessage = await takePaymentSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should publish Payment Rejected Event', async () => {
        const receivedMessage = await paymentFailedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).to.equal(true);
    });
    it('should publish Reservation Rejected event', async () => {
        const receivedMessage = await reservationRejectedSubscription.waitForMessage(2000);
        (0, chai_1.expect)(receivedMessage.didReceive).equal(true);
    });
    it('should return the Reservation as State=Confirmed', async () => {
        var _a;
        const result = await eventest_1.http.getFromService(((_a = process.env.GET_RESERVATION_SERVICE_ENDPOINT) !== null && _a !== void 0 ? _a : '')
            + '?reservationId=' + testReservationId);
        // test we got a 200 level response
        (0, chai_1.expect)(result.success).equal(true);
        // test that the object in the body had a field called status with a value = 'Failed'
        (0, chai_1.expect)(result.body.Status).equal('Failed');
    });
    // Clean up after all the tests
    after(async () => {
        // this removes all the subscriptions we made
        test.cleanup();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzZXJ2YXRpb25Ub29Mb25nLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUmVzZXJ2YXRpb25Ub29Mb25nLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQStHO0FBQy9HLDZEQUEyRDtBQUUzRCxvREFBNEI7QUFDNUIsaUJBQWU7QUFDZiwrQkFBZ0M7QUFFaEMsTUFBTSxLQUFLLEdBQUcsSUFBQSxnQkFBUyxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRXBDLGtDQUFrQztBQUNsQywrQ0FBaUM7QUFDakMsK0JBQThCO0FBRTlCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixRQUFRLENBQUMsa0NBQWtDLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFFcEQsSUFBSSxJQUFZLENBQUM7SUFFakIsSUFBSSxrQ0FBZ0QsQ0FBQztJQUNyRCxJQUFJLHVCQUFxQyxDQUFDO0lBQzFDLElBQUksd0JBQXNDLENBQUM7SUFDM0MsSUFBSSx5QkFBdUMsQ0FBQztJQUM1QyxJQUFJLCtCQUE4QyxDQUFDO0lBRW5ELE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBRTlCLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNkLGdEQUFnRDs7UUFFaEQsZ0RBQWdEO1FBQ2hELElBQUksR0FBRyxJQUFJLDJDQUFxQixDQUM1QixNQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLG1DQUFJLEVBQUUsRUFDOUMsSUFBSSxvQ0FBeUIsRUFBRSxDQUNsQyxDQUFDO1FBRUYsNERBQTREO1FBQzVELGtDQUFrQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDM0YsdUJBQXVCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckUsd0JBQXdCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENB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