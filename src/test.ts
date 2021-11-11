import { ASBTest } from "./ASBTesting";
import { MassTransitMessageEncoder } from "./MessageEncoding";

import moment from 'moment';
import fetch from "node-fetch";

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

    var data = JSON.stringify( { RequestCorrelationId : test.testUniqueId,
        ReservationId:1,
        StartDate : moment().format('YYYY-MM-DD HH:m:s'),
        EndDate:  moment().format('YYYY-MM-DD HH:m:s'),
        GuestId : 123
    } );
    console.log("About to call API");
    try{
    var httpResult = await fetch("http://localhost:7071/api/SubmitReservation",
    {
        method:"POST", 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: data 
    });

    console.log("API Called. Response");
    console.log(httpResult );
    
    }catch(e){
        console.log("Error called New Reservation API")
        console.log(e);
    }
    
    //test.sendMessageToTopic("NewReservationReceived", "this is the message", "messageType");

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
