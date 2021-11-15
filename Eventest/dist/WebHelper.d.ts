import * as f from "node-fetch";
export { Response as FetchResponse } from "node-fetch";
export declare function postToService(address: string, bodyData: any, headers?: any): Promise<Response>;
export declare function getFromService(address: string, headers?: any): Promise<Response>;
export declare class Response {
    private didSuceed;
    private theResult;
    private bodyObject;
    constructor(result: f.Response | undefined, body: any);
    get success(): boolean;
    get body(): any;
    get result(): f.Response | undefined;
    get statusCode(): number;
}
