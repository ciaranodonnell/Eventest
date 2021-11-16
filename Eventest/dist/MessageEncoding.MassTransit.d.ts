import { MessageEncoder } from ".";
export declare class MassTransitMessageEncoder implements MessageEncoder {
    packageMessage(message: any, correlationId: string): any;
    unpackMessage(brokerMessage: any): any;
}
