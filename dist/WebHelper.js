"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToService = exports.Response = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
var node_fetch_2 = require("node-fetch");
Object.defineProperty(exports, "Response", { enumerable: true, get: function () { return node_fetch_2.Response; } });
async function postToService(address, data) {
    try {
        var payload = JSON.stringify(data);
        var httpResult = await (0, node_fetch_1.default)(address, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: payload
        });
        return httpResult.status >= 200 && httpResult.status < 300;
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return false;
}
exports.postToService = postToService;
//# sourceMappingURL=WebHelper.js.map