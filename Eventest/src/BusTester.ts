
/**
 * A standard interface abstraction of a message broker. To test your system
 * you will need to create an instance concrete implementation of this interface
 */
export declare interface Broker {

    get testUniqueId(): string;

    /**
     * Subscribes to a topic on the Bus. This subscription will be filtered based on a correlation Id generated for this test
     *
     * @param topicName - The Topic you want to subscribe to
     */
    subscribeToTopic(topicName: string): Promise<Subscription>;

    /**
     * Sends a message to the Topic / Queue. Uses a configured MessageEncoder to format the message into an envelope
     * @param message The message that you want to send
     * @param topicOrQueueName The name of the topic or queue you want to send it to.
     */
    sendAMessage(message:any, topicOrQueueName:string) : Promise<void>;

    /**
     * Cleans up the subscriptions made by this test.
     */
    cleanup(): Promise<void>;
}

/**
 * A standard interface abstraction of a subscription to a message broker topic or queue. 
 * These are returned from Broker.subscribeToTopic.
 */
export declare interface Subscription {

    /**
     * The name of the topic this subscription is connected to
     */
    get topicName(): string;

    /**
     * Attempts to receive a single message from the subscription. 
     * Typically these will be destructive reads so calling this 
     * repeatedly should return different messages
     * @param timeoutInMS - How long to wait for a message to arrive on the subscription
     */
    waitForMessage(timeoutInMS: number): Promise<ReceiveResult>;

}

/**
 * The result of a waitForMessage operation on a subscription
 */
export declare interface ReceiveResult {

    /**
     * returns true if the read operation got a message. false if it returned because it timed out
     */
    get didReceive(): boolean;

    /**
     * Gets the unpacked body of the message that was received
     */
    getMessageBody(): any;
}