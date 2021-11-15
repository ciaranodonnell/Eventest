"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.getFromService = exports.postToService = exports.FetchResponse = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
var node_fetch_2 = require("node-fetch");
Object.defineProperty(exports, "FetchResponse", { enumerable: true, get: function () { return node_fetch_2.Response; } });
async function postToService(address, bodyData, headers) {
    try {
        var payload = JSON.stringify(bodyData);
        if (headers == undefined)
            headers = {};
        headers['Accept'] = 'application/json';
        headers['Content-Type'] = 'application/json';
        var httpResult = await (0, node_fetch_1.default)(address, {
            method: "POST",
            headers: headers,
            body: payload
        });
        return new Response(httpResult, await httpResult.json());
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return new Response(undefined, undefined);
}
exports.postToService = postToService;
async function getFromService(address, headers) {
    try {
        if (headers == undefined)
            headers = {};
        headers['Accept'] = 'application/json';
        var httpResult = await (0, node_fetch_1.default)(address, {
            method: "GET", headers: headers
        });
        let theResponse = new Response(httpResult, JSON.parse(await httpResult.blob.toString()));
        return theResponse;
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return new Response(undefined, undefined);
}
exports.getFromService = getFromService;
class Response {
    constructor(result, body) {
        if (result == undefined) {
            this.didSuceed = false;
        }
        else {
            this.theResult = result;
            this.bodyObject = body;
            //Is it a 200 range response
            this.didSuceed = this.statusCode > 199 && this.statusCode < 300;
        }
    }
    get success() {
        return this.didSuceed;
    }
    get body() {
        if (this.success) {
            return this.bodyObject;
        }
        else {
            return undefined;
        }
    }
    get result() {
        return this.theResult;
    }
    get statusCode() {
        var _a, _b;
        return (_b = (_a = this.theResult) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : 0;
    }
}
exports.Response = Response;
//# sourceMappingURL=WebHelper.js.map