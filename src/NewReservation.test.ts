import * as Bus from "./BusTester";
import { AzureServiceBusTester } from "./ASBTesting";
import * as http from "./WebHelper";
import { MassTransitMessageEncoder } from "./MessageEncoding";

import moment from 'moment';
import "mocha";
const { promisify } = require('util');

const delay = promisify(setTimeout);

// Load the .env file if it exists
import * as dotenv from "dotenv";
import { expect } from "chai";

dotenv.config();

describe('Submitting NewReservationRequest', async () => {

    var test: Bus.BusTester;

    var NewReservationReceivedSubscription: Bus.Subscription;
    var TakePaymentSubscription: Bus.Subscription;
    var PaymentTakenSubscription: Bus.Subscription;
    var ReservationConfirmedSubscription: Bus.Subscription;

    var testReservationId = 123;

    before(async () => {
        // runs once before the first test in this block

        //Create a Service Bus connection for this test
        test = new AzureServiceBusTester(
            process.env.SERVICEBUS_CONNECTION_STRING ?? "",
            new MassTransitMessageEncoder()
        );

        //Subscribe to the topic first so we dont miss the messages
        NewReservationReceivedSubscription = await test.subscribeToTopic("newreservationreceived");
        TakePaymentSubscription = await test.subscribeToTopic("takepayment");
        PaymentTakenSubscription = await test.subscribeToTopic("paymenttaken");
        ReservationConfirmedSubscription = await test.subscribeToTopic("reservationconfirmed");
        delay(2000);
    });

    it('should get OK status', async () => {

        console.log(moment().format('YYYY-MM-DDTHH:mm:ss'));
        var svcResponse = await http.postToService(process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT ?? "",
            {
                RequestCorrelationId: test.testUniqueId,
                ReservationId: testReservationId,
                StartDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                EndDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                GuestId: 123
            });

        expect(svcResponse.statusCode).equal(200);
    });

    it('should publish NewReservationEvent', async () => {
        var receivedMessage = await NewReservationReceivedSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);

       // console.log(receivedMessage.getMessageBody(0).message);
        //test the reservation Id matches
        //expect(receivedMessage.getMessageBody(0).message.reservationId).equal(testReservationId);

        //check it has the right status
        //expect(receivedMessage.getMessageBody(0).message.reservation.state).equal("Received");

    });

    it('should return the Reservation', async () => {
        var svcResponse = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=" + testReservationId);
      //  console.log(svcResponse.result);
        var responseBody = await svcResponse.result?.json();
        expect(svcResponse.success).equal(true);
    });

    it('should publish Take Payment Command', async () => {
        var receivedMessage = await TakePaymentSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);

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
        expect(receivedMessage.didReceive).to.equal(true);
    });


    it('should publish ReservationConfirmed event', async () => {
        var receivedMessage = await ReservationConfirmedSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);
    });

    it('should return the Reservation as State=Confirmed', async () => {
        var svcResponse = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=" + testReservationId);
        var responseBody = await svcResponse.result?.json();
        expect(svcResponse.success).equal(true);
        expect(responseBody.Status).equal("Confirmed");
    });

    //CLEAN UP
    after(async () => {
       // test.cleanup();

    });
});
