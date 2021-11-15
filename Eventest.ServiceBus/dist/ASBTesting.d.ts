import * as asb from "@azure/service-bus";
import { BusTester, Subscription, ReceiveResult, MessageEncoder } from "eventest";
export declare class AzureServiceBusTester implements BusTester {
    private connectionString;
    private readonly correlationId;
    private readonly admin;
    private readonly sbClient;
    private subsToCleanUp;
    private readonly messageEncoder;
    constructor(connectionString: string, messageEncoder: MessageEncoder | undefined);
    get testUniqueId(): string;
    /**
     * Creates a filtered Subscription to the topic. It generates the name of the subscription and adds
     * a subscription filter for the correlation Id, therefore ensuring you only get messages related
     * to this test.
     * @param topicName - The name of the topic to subscribe to.
     */
    subscribeToTopic(topicName: string): Promise<Subscription>;
    closeSubscription(topic: string): Promise<void>;
    sendMessageToTopic(topicName: string, message: any, type: string): Promise<void>;
    cleanup(): Promise<void>;
}
export declare class ASBSubscription implements Subscription {
    private readonly sub;
    private readonly client;
    private readonly messageEncoder;
    constructor(client: asb.ServiceBusClient, sub: asb.SubscriptionProperties, messageEncoder: MessageEncoder);
    get topic(): string;
    waitForMessage(timeoutInMS: number): Promise<ReceiveResult>;
}
export declare class ASBReceiveResult implements ReceiveResult {
    private readonly result;
    private readonly encoder;
    constructor(result: asb.ServiceBusReceivedMessage[], encoder: MessageEncoder);
    get didReceive(): boolean;
    get messagesReceivedCount(): number;
    getMessageBody(): any;
}
