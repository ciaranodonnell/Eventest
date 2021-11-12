"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.getFromService = exports.postToService = exports.FetchResponse = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
var node_fetch_2 = require("node-fetch");
Object.defineProperty(exports, "FetchResponse", { enumerable: true, get: function () { return node_fetch_2.Response; } });
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
        return new Response(httpResult.status >= 200 && httpResult.status < 300, httpResult);
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return new Response(false, undefined);
}
exports.postToService = postToService;
async function getFromService(address) {
    try {
        var httpResult = await (0, node_fetch_1.default)(address, {
            method: "GET",
        });
        return new Response(httpResult.status >= 200 && httpResult.status < 300, httpResult);
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return new Response(false, undefined);
}
exports.getFromService = getFromService;
class Response {
    constructor(success, result) {
        this.didSuceed = success;
        this.theResult = result;
    }
    get success() {
        return this.didSuceed;
    }
    get result() {
        return this.theResult;
    }
}
exports.Response = Response;
//# sourceMappingURL=WebHelper.js.map