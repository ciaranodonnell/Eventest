
import fetch, * as f from "node-fetch";

export { Response as FetchResponse } from "node-fetch";

export async function postToService(address: string, bodyData: any, headers?: any): Promise<Response> {
    try {
        var payload = JSON.stringify(bodyData);

        if (headers == undefined) headers = {};

        headers['Accept'] = 'application/json';
        headers['Content-Type'] = 'application/json';

        var httpResult = await fetch(address,
            {
                method: "POST",
                headers: headers,
                body: payload
            });
        return new Response(httpResult, await httpResult.json());

    } catch (e) {
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(undefined, undefined);
}


export async function getFromService(address: string, headers?: any): Promise<Response> {
    try {
        if (headers == undefined) headers = {};

        headers['Accept'] = 'application/json';

        var httpResult = await fetch(address,
            {
                method: "GET", headers: headers
            });
        let theResponse = new Response(httpResult, JSON.parse(await httpResult.blob.toString()));
        return theResponse;

    } catch (e) {
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(undefined, undefined);
}

export class Response {
    private didSuceed: boolean
    private theResult: f.Response | undefined
    private bodyObject: any

    constructor(result: f.Response | undefined, body: any) {
        if (result == undefined) {
            this.didSuceed = false;
        }else{
            this.theResult = result;
            this.bodyObject = body;

            //Is it a 200 range response
            this.didSuceed = this.statusCode > 199 && this.statusCode < 300 ;
        }
    }

    get success(): boolean {
        return this.didSuceed;
    }
    get body(): any {
        if (this.success) {
            return this.bodyObject;
        } else {
            return undefined;
        }
    }
    get result(): f.Response | undefined {
        return this.theResult;
    }
    get statusCode(): number {
        return this.theResult?.status ?? 0;
    }


}