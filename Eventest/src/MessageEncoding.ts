
/**
 * The general shape of a message encoder
 */
 export declare interface MessageEncoder {
    /**
     * Handler that takes a raw object and packs it into a message envelope.
     * This is used to make message sent from Eventest tests match the format of the sytem under test
     * e.g. This wraps the logic for making something look like a MassTransit or NServiceBus payload
     *
     * @param message - A message that needs to be encoded for delivery to Service Bus.
     */
     packageMessage(message: any, correlationId:string): any;

     /**
      * Unpacks a message from a message envelope format.
      * @param brokerMessage the original message from the message broker to unpack a message from
      */
     unpackMessage(brokerMessage: any) : any;
    
}
