import { MessageEncoder } from ".";

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