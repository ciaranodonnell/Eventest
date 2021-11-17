import { AxiosResponse } from "axios";
export declare function postToService(address: string, bodyData: any, headers?: any): Promise<Response>;
export declare function getFromService(address: string, headers?: any): Promise<Response>;
export declare class Response {
    private didSuceed;
    private theResult;
    private bodyObject;
    constructor(result: AxiosResponse | undefined, body: any);
    get success(): boolean;
    get body(): any;
    get result(): AxiosResponse | undefined;
    get statusCode(): number;
}
