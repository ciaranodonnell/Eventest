import { ASBTest } from "./ASBTesting";
import { MassTransitMessageEncoder } from "./MessageEncoding";


const { promisify } = require('util');

const delay = promisify(setTimeout);



// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();


async function main(){
    
    var test = new ASBTest(
        process.env.SERVICEBUS_CONNECTION_STRING ?? "",
        new MassTransitMessageEncoder()
        );
    
    var demoTopicSub = await test.subscribeToTopic("demotopic");

    test.sendMessageToTopic("demotopic", "this is the message", "messageType");

    var receivedMessage = await demoTopicSub.waitForMessage(2000);

    if (receivedMessage.didReceive){
        console.log(receivedMessage.getMessageBody(0));
    }else{
        console.log("no message received");
        
    }



    //CLEAN UP

   await delay(5000);
   
   test.cleanup();

   process.exit(0);
}

main();


