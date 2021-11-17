export class NoEncodingMessageEncoder {
    packageMessage(message, correlationId) {
        return message;
    }
    unpackMessage(brokerMessage) {
        return brokerMessage;
    }
}
//# sourceMappingURL=MessageEncoding.NoEncoding.js.map