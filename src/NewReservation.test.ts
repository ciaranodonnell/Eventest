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
    var demoTopicSub : Subscription;
    
    before(async () => {
        // runs once before the first test in this block
        
        //Create a Service Bus connection for this test
        test = new ASBTest(
            process.env.SERVICEBUS_CONNECTION_STRING ?? "",
            new MassTransitMessageEncoder()
            );
        
        //Subscribe to the topic first so we dont miss the messages
        demoTopicSub = await test.subscribeToTopic("NewReservationReceived");
    });
    
    it('should get OK status', async () => {    

        var svcResponse = await http.postToService(process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT ?? "", 
                { RequestCorrelationId : test.testUniqueId,
                    ReservationId:123,
                    StartDate : moment().format('YYYY-MM-DD HH:m:s'),
                    EndDate:  moment().format('YYYY-MM-DD HH:m:s'),
                    GuestId : 123
                } );

        expect(svcResponse.success).to.equal(true);
    });

    it('should publish NewReservationEvent', async () => {    
        var receivedMessage = await demoTopicSub.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
    });

    it('should return the Reservation', async () => {    
        var svcResponse = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=123");
        expect(svcResponse.success).to.equal(true);
    });
    //CLEAN UP
    after(async ()=>{
        test.cleanup();

    });
});
