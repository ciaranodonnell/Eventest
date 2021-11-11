"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ASBTesting_1 = require("./ASBTesting");
const { promisify } = require('util');
const delay = promisify(setTimeout);
async function main() {
    var test = new ASBTesting_1.ASBTest("Endpoint=sb://ciaransyoutubedemos.servicebus.windows.net/;SharedAccessKeyName=SendDemo;SharedAccessKey=LJ2juCgL6hebPIoXyF3q9EVp17MswMMIj2eVVQ6LCis=");
    var demoTopicSub = await test.subscribeToTopic("demotopic");
    test.sendMessageToTopic("demotopic", "this is the message", "messageType");
    var receivedMessage = await demoTopicSub.waitForMessage(2000);
    if (receivedMessage.didReceive) {
        console.log(receivedMessage.getMessageBody(0));
    }
    else {
        console.log("no message received");
    }
    //CLEAN UP
    await delay(5000);
    test.cleanup();
    process.exit(0);
}
main();
//# sourceMappingURL=test.js.map