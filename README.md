# Event To End Event Testing

The purpose of this library is to serve as a demonstration of how to run end to end tests for Event Driven Systems.

When creating web applications that have asynchronous backend systems it can be very challenging to test those backends.
In an e-commerce example: It would be useful to test that putting a new Order into the Order Service causes:
   
1. Website sends a NewReservationRequest through a POST to the Reservation Service
2. Reservation Service generates a ```NewReservationReceived``` event.
3. Reservation Service issues ```TakePayment``` command to the Payment Service
4. Payment Service issues ```Payment Taken Event```
5. Reservation Service issues a ```ReservationConfirmed``` event


## Example of use of this library:

This library uses Mocha to run these tests like unit tests. Example code:
``` typescript
 describe('Submitting NewReservationRequest', async () => {
    var test : ASBTest;
    var demoTopicSub : Subscription;
    var testReservationId = 123;
    before(async () => {
        // runs once before the first test in this block
        
        //Create a Service Bus connection for this test
        test = new ASBTest(
            process.env.SERVICEBUS_CONNECTION_STRING ?? "",
            new MassTransitMessageEncoder()
            );
        
        //Subscribe to the topic first so we dont miss the messages
        demoTopicSub = await test.subscribeToTopic("NewReservationReceived");
    });
    
    it('should get OK status', async () => {    

        var svcResponse = await http.postToService(process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT ?? "", 
                { RequestCorrelationId : test.testUniqueId,
                    ReservationId:testReservationId,
                    StartDate : moment().format('YYYY-MM-DD HH:m:s'),
                    EndDate:  moment().format('YYYY-MM-DD HH:m:s'),
                    GuestId : 123
                } );

        expect(svcResponse.success).to.equal(true);
    });

    it('should publish NewReservationEvent', async () => {    
        var receivedMessage = await demoTopicSub.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
    });

    it('should return the Reservation', async () => {    
        var svcResponse = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=" + testReservationId);
        expect(svcResponse.success).to.equal(true);
    });
    //CLEAN UP
    after(async ()=>{
        test.cleanup();

    });
});
```

## Example output:


### Passing Tests:
![Screenshot of Passing Tests](./docs/PassingTests.png)


### Failing Test

![Screenshot of Passing Tests](./docs/FailingTest.png)
