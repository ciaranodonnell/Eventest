
/**
 * The general shape of a message encoder
 */
 export declare interface MessageEncoder {
    /**
     * Handler that takes a raw object and makes it look like a message send from the system
     * e.g. This wraps the logic for making something look like a MassTransit or NServiceBus payload
     *
     * @param message - A message that needs to be encoded for delivery to Service Bus.
     */
     packageMessage(message: any, correlationId:string): any;
     unpackMessage(brokerMessage: any) : any;
    
}


import { v4 as uuid } from 'uuid';

const HOSTNAME = require("os").hostname;
const PID = require("process").pid;

export class NoEncodingMessageEncoder implements MessageEncoder{
    
    public packageMessage(message:any, correlationId:string):any
    {
        return message;
    }
    public unpackMessage(brokerMessage:any):any
    {
        return brokerMessage;
    }
}
export class MassTransitMessageEncoder implements MessageEncoder{
    
    public packageMessage(message:any, correlationId:string):any
    {
        var result = 
        {
            conversationId : correlationId,
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
        };
        return result;
    }

    public unpackMessage(brokerMessage:any):any
    {
        return brokerMessage.message;
    }
}