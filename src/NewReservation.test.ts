import { ASBTest, Subscription } from "./ASBTesting";
import {postToService} from "./WebHelper";
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
        
        test = new ASBTest(
            process.env.SERVICEBUS_CONNECTION_STRING ?? "",
            new MassTransitMessageEncoder()
            );
        
        demoTopicSub = await test.subscribeToTopic("NewReservationReceived");

        

    });
    
    it('should get OK status', async () => {    
        console.log("About to call API");
        var svcResponse = await postToService("https://requestbin.io/rz1jx5rz", 
                { RequestCorrelationId : test.testUniqueId,
                    ReservationId:1,
                    StartDate : moment().format('YYYY-MM-DD HH:m:s'),
                    EndDate:  moment().format('YYYY-MM-DD HH:m:s'),
                    GuestId : 123
                } );
        console.log("API Response : " + svcResponse);

        expect(svcResponse).to.equal(true);
    });

    it('should publish NewReservationEvent', async () => {    
        var receivedMessage = await demoTopicSub.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
    });

    //CLEAN UP
    after(async ()=>{
        test.cleanup();

    });
});
