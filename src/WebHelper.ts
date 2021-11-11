

import fetch from "node-fetch";
export { Response } from "node-fetch";

export async function postToService(address:string, data:any) : Promise<boolean> {
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
        return httpResult.status >= 200 &&  httpResult.status < 300;
        
    }catch(e){
        console.log("Error called New Reservation API")
        console.log(e);
    }
    return false;
}
