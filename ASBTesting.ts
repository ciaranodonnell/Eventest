import { ServiceBusClient } from "@azure/service-bus";


const uuid = require('uuid')





class ASBTest{

    connectionString : string;
    correlationId : string;

    constructor(connectionString : string){

        this.connectionString = connectionString;
        this.correlationId = uuid();

        this.serviceBusClient = new ServiceBusClient("Endpoint=sb://ciaransyoutubedemos.servicebus.windows.net/;SharedAccessKeyName=SendDemo;SharedAccessKey=LJ2juCgL6hebPIoXyF3q9EVp17MswMMIj2eVVQ6LCis=");

        const sender = serviceBusClient.createSender("demoqueue");
        

    }

    subscribeToTopic(topic : string){

    }


    sendMessageToTopic(messageBody:string, type:string){

    }

}


export default { ASBTest };
