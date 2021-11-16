"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASBReceiveResult = exports.ASBSubscription = exports.AzureServiceBusTester = void 0;
const asb = __importStar(require("@azure/service-bus"));
const eventest_1 = require("eventest");
const uuid_1 = require("uuid");
class AzureServiceBusTester {
    constructor(connectionString, messageEncoder) {
        this.connectionString = connectionString;
        this.correlationId = (0, uuid_1.v4)();
        this.subsToCleanUp = [];
        // You can also use AAD credentials from `@azure/identity` along with the host url
        // instead of the connection string for authentication.
        this.admin = new asb.ServiceBusAdministrationClient(connectionString);
        this.sbClient = new asb.ServiceBusClient(connectionString);
        if (messageEncoder == undefined) {
            this.messageEncoder = new eventest_1.NoEncodingMessageEncoder();
        }
        else {
            this.messageEncoder = messageEncoder;
        }
    }
    async sendAMessage(message, topicOrQueueName) {
        const sender = this.sbClient.createSender(topicOrQueueName);
        await sender.sendMessages({
            correlationId: this.testUniqueId,
            body: this.messageEncoder.packageMessage(message, this.testUniqueId)
        });
    }
    get testUniqueId() {
        return this.correlationId;
    }
    /**
     * Creates a filtered Subscription to the topic. It generates the name of the subscription and adds
     * a subscription filter for the correlation Id, therefore ensuring you only get messages related
     * to this test.
     * @param topicName - The name of the topic to subscribe to.
     */
    async subscribeToTopic(topicName) {
        // const options = new asb.CreateSubscriptionOptions();
        // options.deadLetteringOnMessageExpiration = false;
        var createResult = await this.admin.createSubscription(topicName, "testsub-" + this.correlationId, {
            // allow auto delete on idle. this will help cleanup if automatic clean up fails. this can happen if tests complete too quickly
            autoDeleteOnIdle: "PT5M",
            //create the rule for the correlation id filter
            defaultRuleOptions: {
                name: "corrIdRule",
                filter: {
                    correlationId: this.correlationId
                }
            }
        });
        await this.admin.createRule(topicName, "testsub-" + this.correlationId, "correlationNoDashes", { correlationId: this.correlationId.replace(/-/g, "") });
        var sub = new ASBSubscription(this.sbClient, createResult, this.messageEncoder);
        this.subsToCleanUp.push(sub);
        return sub;
    }
    async closeSubscription(topic) {
        // const options = new asb.CreateSubscriptionOptions();
        // options.deadLetteringOnMessageExpiration = false;
        var deleteResponse = await this.admin.deleteSubscription(topic, "testsub-" + this.correlationId); //, options);
        for (var x = 0; x < this.subsToCleanUp.length; x++) {
            var sub = this.subsToCleanUp[x];
            if (sub.topicName === topic) {
                this.subsToCleanUp.splice(x, 1);
                x--;
            }
        }
    }
    async sendMessageToTopic(topicName, message, type) {
        var sender = this.sbClient.createSender(topicName);
        await sender.sendMessages({
            correlationId: this.correlationId,
            contentType: "application/json",
            body: this.messageEncoder.packageMessage(message, this.correlationId)
        });
    }
    async cleanup() {
        while (this.subsToCleanUp.length > 0) {
            var sub = this.subsToCleanUp.pop();
            if (sub == null)
                break;
            var deleteResponse = await this.admin.deleteSubscription(sub.topicName, "testsub-" + this.correlationId); //, options);
        }
    }
}
exports.AzureServiceBusTester = AzureServiceBusTester;
class ASBSubscription {
    constructor(client, sub, messageEncoder) {
        this.sub = sub;
        this.client = client;
        this.messageEncoder = messageEncoder;
    }
    get topicName() {
        return this.sub.topicName;
    }
    async waitForMessage(timeoutInMS) {
        var receiver = this.client.createReceiver(this.sub.topicName, this.sub.subscriptionName, { receiveMode: 'receiveAndDelete' });
        var messageResult = await receiver.receiveMessages(1, { maxWaitTimeInMs: timeoutInMS });
        return new ASBReceiveResult(messageResult, this.messageEncoder);
    }
}
exports.ASBSubscription = ASBSubscription;
class ASBReceiveResult {
    constructor(result, encoder) {
        this.result = result;
        this.encoder = encoder;
    }
    get didReceive() {
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
    get messagesReceivedCount() {
        if (!Array.isArray(this.result)) {
            return 0;
        }
        //If it is an array, check its length property
        return this.result.length;
    }
    getMessageBody() {
        if (this.messagesReceivedCount > 0) {
            var wholeMessage = this.result[0].body;
            return this.encoder.unpackMessage(wholeMessage);
        }
        throw new Error("getMessageBody when receive didnt get a message");
    }
}
exports.ASBReceiveResult = ASBReceiveResult;
//# sourceMappingURL=ASBTesting.js.map