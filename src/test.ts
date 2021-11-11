import { ASBTest } from "./ASBTesting";


const { promisify } = require('util');

const delay = promisify(setTimeout);


async function main(){
    
    var test = new ASBTest("Endpoint=sb://ciaransyoutubedemos.servicebus.windows.net/;SharedAccessKeyName=SendDemo;SharedAccessKey=LJ2juCgL6hebPIoXyF3q9EVp17MswMMIj2eVVQ6LCis=");
    
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


