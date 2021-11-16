"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoEncodingMessageEncoder = void 0;
class NoEncodingMessageEncoder {
    packageMessage(message, correlationId) {
        return message;
    }
    unpackMessage(brokerMessage) {
        return brokerMessage;
    }
}
exports.NoEncodingMessageEncoder = NoEncodingMessageEncoder;
//# sourceMappingURL=MessageEncoding%20copy.js.map