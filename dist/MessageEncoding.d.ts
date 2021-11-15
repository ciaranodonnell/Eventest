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
    packageMessage(message: any, correlationId: string): any;
    unpackMessage(brokerMessage: any): any;
}
export declare class NoEncodingMessageEncoder implements MessageEncoder {
    packageMessage(message: any, correlationId: string): any;
    unpackMessage(brokerMessage: any): any;
}
export declare class MassTransitMessageEncoder implements MessageEncoder {
    packageMessage(message: any, correlationId: string): any;
    unpackMessage(brokerMessage: any): any;
}
