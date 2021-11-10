import * as asb from "@azure/service-bus";
// import { ServiceBusAdministrationClient } from "@azure/service-bus";
// import { CreateSubscriptionOptions } from "@azure/service-bus";




// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

const uuid = require('uuid')





class ASBTest{

    connectionString : string;
    correlationId : string;
    admin : asb.ServiceBusAdministrationClient;
    sbClient :  asb.ServiceBusClient;

    constructor(connectionString : string){

        this.connectionString = connectionString;
        this.correlationId = uuid();


        // You can also use AAD credentials from `@azure/identity` along with the host url
        // instead of the connection string for authentication.
        this.admin = new  asb.ServiceBusAdministrationClient(connectionString);

        const sbClient = new  asb.ServiceBusClient(connectionString);

        
        

    }

    async subscribeToTopic(topic : string){
        const options = new  asb.CreateSubscriptionOptions();
        options.deadLetteringOnMessageExpiration = false;
        
        await this.admin.createSubscription(topic, "testsub-" + this.correlationId, options);


    }


    sendMessageToTopic(messageBody:string, type:string){

    }

}


export default { ASBTest };
