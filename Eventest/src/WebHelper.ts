
import axios, { Axios } from "axios";
import {AxiosResponse} from "axios";

export async function postToService(address: string, bodyData: any, headers?: any): Promise<Response> {
    try {
        var payload = JSON.stringify(bodyData);

        if (headers == undefined) headers = {};
        headers['Accept'] = 'application/json';
        headers['Content-Type'] = 'application/json';

        var httpResult = await axios.post(address, bodyData, { headers:headers })
        return new Response(httpResult, await httpResult.data);

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

        var httpResult = await axios.get(address,
            {
                headers: headers
            });
            
        let theResponse = new Response(httpResult, JSON.parse(await httpResult.data.toString()));
        return theResponse;

    } catch (e) {
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(undefined, undefined);
}

export class Response {
    private didSuceed: boolean
    private theResult: AxiosResponse | undefined
    private bodyObject: any

    constructor(result: AxiosResponse | undefined, body: any) {
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
    get result(): AxiosResponse | undefined {
        return this.theResult;
    }
    get statusCode(): number {
        return this.theResult?.status ?? 0;
    }


}