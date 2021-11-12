import { ASBTest, Subscription } from "./ASBTesting";
import * as http from "./WebHelper";
import { MassTransitMessageEncoder } from "./MessageEncoding";

import moment from 'moment';
import "mocha";
const { promisify } = require('util');

const delay = promisify(setTimeout);

// Load the .env file if it exists
import * as dotenv from "dotenv";
import { expect } from "chai";
import { assert } from "console";
dotenv.config();

 describe('Submitting NewReservationRequest', async () => {
    
    var test : ASBTest;
    
    var NewReservationReceivedSubscription : Subscription;
    var TakePaymentSubscription : Subscription;
    var PaymentTakenSubscription : Subscription;
    var ReservationConfirmedSubscription : Subscription;

    var testReservationId = 123;

    before(async () => {
        // runs once before the first test in this block
        
        //Create a Service Bus connection for this test
        test = new ASBTest(
            process.env.SERVICEBUS_CONNECTION_STRING ?? "",
            new MassTransitMessageEncoder()
            );
        
        //Subscribe to the topic first so we dont miss the messages
        NewReservationReceivedSubscription = await test.subscribeToTopic("NewReservationReceived");
        TakePaymentSubscription = await test.subscribeToTopic("TakePayment");
        PaymentTakenSubscription = await test.subscribeToTopic("PaymentTaken");
        ReservationConfirmedSubscription = await test.subscribeToTopic("ReservationConfirmed");
    });
    
    it('should get OK status', async () => {    

        var svcResponse = await http.postToService(process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT ?? "", 
                { RequestCorrelationId : test.testUniqueId,
                    ReservationId:testReservationId,
                    StartDate : moment().format('YYYY-MM-DD HH:m:s'),
                    EndDate:  moment().format('YYYY-MM-DD HH:m:s'),
                    GuestId : 123
                } );

        expect(svcResponse.success).to.equal(true);
    });

    it('should publish NewReservationEvent', async () => {    
        var receivedMessage = await NewReservationReceivedSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
    });

    it('should return the Reservation', async () => {    
        var svcResponse = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=" + testReservationId);
        expect(svcResponse.success).to.equal(true);
    });
  
    it('should publish Take Payment Command', async () => {    
        var receivedMessage = await TakePaymentSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
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
        expect(svcResponse.success).to.equal(true);
        expect(responseBody.State).equal("Confirmed");
    });
  
  //CLEAN UP
    after(async ()=>{
        test.cleanup();

    });
});
