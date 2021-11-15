
/**
 * The general shape of a message encoder
 */
 export declare interface BusTester {
    /**
     * Subscribes to a topic on the Bus. This subscription will be filtered based on a correlation Id generated for this test
     *
     * @param topicName - The Topic you want to subscribe to
     */
     subscribeToTopic(topicName : string) : Promise<Subscription>;
    
     get testUniqueId():string;

     closeSubscription(topic:string) : Promise<void>;

     cleanup():Promise<void>;
}

export declare interface Subscription{
    get topic():string;

    waitForMessage(timeoutInMS:number) : Promise<ReceiveResult>;

}

export declare interface ReceiveResult{

    get didReceive ():boolean;

    get messagesReceivedCount():number;

    getMessageBody():any;
}