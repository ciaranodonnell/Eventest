"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
const uuid_1 = require("uuid");
class Test {
    constructor(bus) {
        this.uniqueTestId = (0, uuid_1.v4)();
        this.bus = bus;
    }
}
exports.Test = Test;
//# sourceMappingURL=Eventest.ServiceBus.js.map