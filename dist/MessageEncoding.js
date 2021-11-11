"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MassTransitMessageEncoder = exports.NoEncodingMessageEncoder = void 0;
const uuid_1 = require("uuid");
const HOSTNAME = require("os").hostname;
const PID = require("process").pid;
class NoEncodingMessageEncoder {
    processMessage(message, correlationId) {
        return message;
    }
}
exports.NoEncodingMessageEncoder = NoEncodingMessageEncoder;
class MassTransitMessageEncoder {
    processMessage(message, correlationId) {
        var result = {
            conversationId: correlationId,
            messageId: (0, uuid_1.v4)(),
            message: message,
            "messageType": [
                "urn:message:type"
            ],
            headers: {
                "MT-Activity-Id": "00-b8b6cf020495eb44b57c8eff14244671-937ecff1f3901d41-01"
            },
            "host": {
                "machineName": HOSTNAME,
                "processName": "TestingProcess",
                "processId": PID,
                "assembly": "ASBTesting",
                "assemblyVersion": "1.0.0.0",
                "frameworkVersion": "5.0.11",
                "massTransitVersion": "7.2.4.0",
                "operatingSystemVersion": "Microsoft Windows NT 10.0.19043.0"
            }
        };
        return result;
    }
}
exports.MassTransitMessageEncoder = MassTransitMessageEncoder;
//# sourceMappingURL=MessageEncoding.js.map