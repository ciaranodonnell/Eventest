import {Broker, Subscription, ReceiveResult, http, MassTransitMessageEncoder, MessageEncoder}  from 'Eventest';
import { AzureServiceBusTester } from 'Eventest.ServiceBus'

import 'mocha';
import { expect } from 'chai';

// This is a cool library to work with dates and times
import moment from 'moment';

// This allows us to await timeouts
import {promisify } from 'util';
const delay = promisify(setTimeout);

// simple setup of environment variables for the tests
import * as dotenv from 'dotenv';
// Load the .env file if it exists
dotenv.config();

describe('Submitting NewReservationRequest', async () => {

    let test: Broker;

    let newReservationReceivedSubscription: Subscription;
    let takePaymentSubscription: Subscription;
    let paymentTakenSubscription: Subscription;
    let reservationConfirmedSubscription: Subscription;

    const testReservationId = 123;

    before(async () => {
        // runs once before the first test in this block

        // Create a Service Bus connection for this test
        test = new AzureServiceBusTester(
            process.env.SERVICEBUS_CONNECTION_STRING ?? '',
            new MassTransitMessageEncoder()
        );

        // Subscribe to the topic first so we dont miss the messages
        newReservationReceivedSubscription = await test.subscribeToTopic('newreservationreceived');
        takePaymentSubscription = await test.subscribeToTopic('takepayment');
        paymentTakenSubscription = await test.subscribeToTopic('paymenttaken');
        reservationConfirmedSubscription = await test.subscribeToTopic('reservationconfirmed');

        // give it a couple of seconds to make sure the subscriptions are active
        await delay(2000);
    });

    it('should get OK status', async () => {
        const svcResponse = await http.postToService(
            process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT ?? '',
         // This is the payload to send to the service:
            {
                RequestCorrelationId: test.testUniqueId,
                ReservationId: testReservationId,
                StartDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                EndDate: moment().add('2','days').format('YYYY-MM-DDTHH:mm:ss'),
                GuestId: 123
            });

        // test that we got a 200 success
        expect(svcResponse.statusCode).equal(200);
    });

    it('should publish NewReservationEvent', async () => {
        // wait up to 2 seconds to receive a message on our subscription
        const receivedMessage = await newReservationReceivedSubscription.waitForMessage(2000);
        // test we got a message
        expect(receivedMessage.didReceive).equal(true);
        // test the reservation Id matches
        expect(receivedMessage.getMessageBody().reservationId).equal(testReservationId);
    });

    it('should return the Reservation', async () => {
        const result = await http.getFromService(
            (process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? '')
        + '?reservationId=' + testReservationId);
        expect(result.success).equal(true);
    });

    it('should publish Take Payment Command', async () => {
        const receivedMessage = await takePaymentSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);
    });

    it('should publish Payment Taken Event', async () => {
        const receivedMessage = await paymentTakenSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
    });

    it('should publish ReservationConfirmed event', async () => {
        const receivedMessage = await reservationConfirmedSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);
    });

    it('should return the Reservation as State=Confirmed', async () => {
        const result = await http.getFromService(
            (process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? '')
            + '?reservationId=' + testReservationId);
        // test we got a 200 level response
        expect(result.success).equal(true);
        // test that the object in the body had a field called status with a value = 'Confirmed'
        expect(result.body.Status).equal('Confirmed');

    });

    // Clean up after all the tests
    after(async () => {
      // this removes all the subscriptions we made
      test.cleanup();
    });
});
