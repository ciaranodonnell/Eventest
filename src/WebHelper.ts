

import fetch, * as f from "node-fetch";

export { Response as FetchResponse } from "node-fetch";

export async function postToService(address:string, data:any) : Promise<Response> {
    try{
        var payload =  JSON.stringify( data);
    
        var httpResult = await fetch(address,
        {
            method:"POST", 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: payload 
        });
        return new Response(httpResult.status >= 200 &&  httpResult.status < 300, httpResult,await httpResult.json());
        
    }catch(e){
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(false,undefined, undefined);
}


export async function getFromService(address:string) : Promise<Response> {
    try{
    
        var httpResult = await fetch(address,
        {
            method:"GET", 
        });
        let theResponse = new Response(httpResult.status >= 200 &&  httpResult.status < 300, httpResult, await httpResult.json());
        return theResponse;
        
    }catch(e){
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(false,undefined, undefined);
}

export class Response {
    private didSuceed : boolean
    private theResult : f.Response | undefined
    private bodyObject : any

    constructor(success : boolean,result : f.Response | undefined, body : any){
        this.didSuceed = success;
        this.theResult = result;
        this.bodyObject = body;
    }

    get success() : boolean{
        return this.didSuceed;
    }
    get  body() : any {
        if (this.success){
            return this.bodyObject;
        }else {
            return undefined;
        }
    }
    get result() : f.Response | undefined {
        return this.theResult;
    }
    get statusCode() : number  {
        return this.theResult?.status ?? 0;
    }


}