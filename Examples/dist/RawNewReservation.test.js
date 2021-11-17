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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF3TmV3UmVzZXJ2YXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9SYXdOZXdSZXNlcnZhdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUFnSDtBQUNoSCw2REFBMkQ7QUFFM0Qsb0RBQTRCO0FBQzVCLGlCQUFlO0FBQ2YsK0JBQWlDO0FBRWpDLE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVMsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUVwQyxrQ0FBa0M7QUFDbEMsK0NBQWlDO0FBQ2pDLCtCQUE4QjtBQUc5QixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFLaEIsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLEtBQUssSUFBSSxFQUFFO0lBRXBELElBQUksSUFBWSxDQUFDO0lBRWpCLElBQUksa0NBQWdELENBQUM7SUFDckQsSUFBSSx1QkFBcUMsQ0FBQztJQUMxQyxJQUFJLHdCQUFzQyxDQUFDO0lBQzNDLElBQUksZ0NBQThDLENBQUM7SUFFbkQsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUM7SUFFOUIsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2QsZ0RBQWdEOztRQUVoRCxnREFBZ0Q7UUFDaEQsSUFBSSxHQUFHLElBQUksMkNBQXFCLENBQzVCLE1BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsbUNBQUksRUFBRSxFQUM5QyxJQUFJLG9DQUF5QixFQUFFLENBQ2xDLENBQUM7UUFFRiw0REFBNEQ7UUFDNUQsa0NBQWtDLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUMzRix1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRSx3QkFBd0IsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN2RSxn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