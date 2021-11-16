import { MessageEncoder } from ".";
export declare class NoEncodingMessageEncoder implements MessageEncoder {
    packageMessage(message: any, correlationId: string): any;
    unpackMessage(brokerMessage: any): any;
}
