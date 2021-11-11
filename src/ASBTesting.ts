import * as asb from "@azure/service-bus";
// import { ServiceBusAdministrationClient } from "@azure/service-bus";
// import { CreateSubscriptionOptions } from "@azure/service-bus";




// Load the .env file if it exists
import * as dotenv from "dotenv";
dotenv.config();

import { v4 as uuid } from 'uuid';

const HOSTNAME = require("os").hostname;
const PID = require("process").pid;

export class ASBTest{

    connectionString : string;
    correlationId : string;
    admin : asb.ServiceBusAdministrationClient;
    sbClient :  asb.ServiceBusClient;
    subsToCleanUp : Subscription[];

    constructor(connectionString : string){

        this.connectionString = connectionString;
        this.correlationId = uuid();

        this.subsToCleanUp = [];

        // You can also use AAD credentials from `@azure/identity` along with the host url
        // instead of the connection string for authentication.
        this.admin = new  asb.ServiceBusAdministrationClient(connectionString);

        this.sbClient = new  asb.ServiceBusClient(connectionString);

    }

    async subscribeToTopic(topic : string) : Promise<Subscription> {
        // const options = new asb.CreateSubscriptionOptions();
        // options.deadLetteringOnMessageExpiration = false;
        
        var createResult = await this.admin.createSubscription(topic, "testsub-" + this.correlationId , 
        {
            // allow auto delete on idle. this will help cleanup if automatic clean up fails. this can happen if tests complete too quickly
             autoDeleteOnIdle: "PT5M", 
             //create the rule for the correlation id filter
             defaultRuleOptions :  
            {
                name: "corrIdRule", 
                filter:
                {
                    correlationId:  this.correlationId 
                }
            }
        });
        
        var sub = new Subscription(this.sbClient, createResult);
        this.subsToCleanUp.push(sub);
        return sub;
    }

    async closeSubscription(topic:string){
          // const options = new asb.CreateSubscriptionOptions();
        // options.deadLetteringOnMessageExpiration = false;
        
        var deleteResponse = await this.admin.deleteSubscription(topic, "testsub-" + this.correlationId); //, options);
        
        for(var x=0;x< this.subsToCleanUp.length;x++){
            var sub = this.subsToCleanUp[x];
            if (sub.topic === topic)
            {
                this.subsToCleanUp.splice(x,1);
                x--;
            }
        }
    }

    async sendMessageToTopic(topicName:string, message:any, type:string){
        var sender = this.sbClient.createSender(topicName);

        await sender.sendMessages( 
            {
                correlationId:this.correlationId,
                contentType: "application/json",
                body: 
                {
                    conversationId : this.correlationId,
                    messageId : uuid(),
                    message : message, 
                    "messageType" : [
                        "urn:message:type"
                    ],
                    headers : {
                        "MT-Activity-Id" : "00-b8b6cf020495eb44b57c8eff14244671-937ecff1f3901d41-01"
                    },
                    "host": {
                        "machineName": HOSTNAME,
                        "processName": "TestingProcess",
                        "processId": PID,
                        "assembly": "ASBTesting",
                        "assemblyVersion": "1.0.0.0",
                        "frameworkVersion": "5.0.11",
                        "massTransitVersion": "7.2.4.0",
                        "operatingSystemVersion": "Microsoft Windows NT 10.0.19043.0"
                    }
                }
            });
    }

    async cleanup(){
           
        while( this.subsToCleanUp.length > 0)
        {
            var sub = this.subsToCleanUp.pop();
            if (sub ==null) break;
            var deleteResponse = await this.admin.deleteSubscription(sub.topic, "testsub-" + this.correlationId); //, options);
        }
      
    }
}


export class Subscription{
    private sub : asb.SubscriptionProperties;
    private client: asb.ServiceBusClient
    constructor( client: asb.ServiceBusClient, sub : asb.SubscriptionProperties){
        this.sub = sub;
        this.client = client;
    }

    get topic():string{
        return this.sub.topicName;
    }

    async waitForMessage(timeoutInMS:number) : Promise<ReceiveResult>{
        
        var receiver = this.client.createReceiver(this.sub.topicName, this.sub.subscriptionName, { receiveMode : 'receiveAndDelete'});
        var messageResult = await receiver.receiveMessages(1, {maxWaitTimeInMs: timeoutInMS});
        return new ReceiveResult(messageResult);
    }

}

export class ReceiveResult{

    readonly result : asb.ServiceBusReceivedMessage[]

    constructor(result : asb.ServiceBusReceivedMessage[]){
        this.result = result;
    }

    get didReceive ():boolean{
       //If it's not an array, return FALSE.
        if (!Array.isArray(this.result)) {
            return false;
        }
        //If it is an array, check its length property
        if (this.result.length == 0) {
            //if the array is empty then no
            return false;
        }
        //its a non empty array - therefore messages.
        return true;
    }

    get messagesReceived():number{

        if (!Array.isArray(this.result)) {
            return 0;
        }
        //If it is an array, check its length property
        return this.result.length;
    }

    getMessageBody( index : number ):any{
        
        if (this.messagesReceived > index){
            return this.result[0].body;
        }
        throw new Error("getMessageBody called with Index higher than the number of returned messages");
    }

}