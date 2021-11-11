import { ASBTest } from "./ASBTesting";
import {postToService} from "./WebHelper";
import { MassTransitMessageEncoder } from "./MessageEncoding";

import moment from 'moment';

const { promisify } = require('util');

const delay = promisify(setTimeout);



// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

export async function BasicTest(){
    
    var test = new ASBTest(
        process.env.SERVICEBUS_CONNECTION_STRING ?? "",
        new MassTransitMessageEncoder()
        );
    
    var demoTopicSub = await test.subscribeToTopic("NewReservationReceived");

    
    console.log("About to call API");
    var svcResponse = await postToService("http://localhost:7071/api/SubmitReservation", 
            { RequestCorrelationId : test.testUniqueId,
                ReservationId:1,
                StartDate : moment().format('YYYY-MM-DD HH:m:s'),
                EndDate:  moment().format('YYYY-MM-DD HH:m:s'),
                GuestId : 123
            } );

    console.log("Web request succeeded: " + svcResponse);
    

    console.log("waiting for message");
    var receivedMessage = await demoTopicSub.waitForMessage(2000);

    if (receivedMessage.didReceive){
        console.log("Message received");
        console.log(receivedMessage.getMessageBody(0));
    }else{
        console.log("no message received");
    }

    //CLEAN UP

   await delay(5000);
   
   test.cleanup();

   process.exit(0);
}

try{
    BasicTest();

}catch(e){
    console.log(e);
}
