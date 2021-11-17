import axios from "axios";
export async function postToService(address, bodyData, headers) {
    try {
        var payload = JSON.stringify(bodyData);
        if (headers == undefined)
            headers = {};
        headers['Accept'] = 'application/json';
        headers['Content-Type'] = 'application/json';
        var httpResult = await axios.post(address, bodyData, { headers: headers });
        return new Response(httpResult, await httpResult.data);
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return new Response(undefined, undefined);
}
export async function getFromService(address, headers) {
    try {
        if (headers == undefined)
            headers = {};
        headers['Accept'] = 'application/json';
        var httpResult = await axios.get(address, {
            headers: headers
        });
        let theResponse = new Response(httpResult, JSON.parse(await httpResult.data.toString()));
        return theResponse;
    }
    catch (e) {
        console.log("Error called New Reservation API");
        console.log(e);
    }
    return new Response(undefined, undefined);
}
export class Response {
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
//# sourceMappingURL=WebHelper.js.map