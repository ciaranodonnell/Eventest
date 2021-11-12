

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
        return new Response(httpResult.status >= 200 &&  httpResult.status < 300, httpResult);
        
    }catch(e){
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(false,undefined);
}


export async function getFromService(address:string) : Promise<Response> {
    try{
    
        var httpResult = await fetch(address,
        {
            method:"GET", 
        });
        return new Response(httpResult.status >= 200 &&  httpResult.status < 300, httpResult);
        
    }catch(e){
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return new Response(false,undefined);
}

export class Response {
    private didSuceed : boolean
    private theResult : f.Response | undefined

    constructor(success : boolean,result : f.Response | undefined){
        this.didSuceed = success;
        this.theResult = result;
    }

    get success() : boolean{
        return this.didSuceed;
    }

    get result() : f.Response | undefined {
        return this.theResult;
    }


}