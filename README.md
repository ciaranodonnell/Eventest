# Eventest

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

    var test: Bus.BusTester;

    var NewReservationReceivedSubscription: Bus.Subscription;
    var TakePaymentSubscription: Bus.Subscription;
    var PaymentTakenSubscription: Bus.Subscription;
    var ReservationConfirmedSubscription: Bus.Subscription;

    var testReservationId = 123;

    before(async () => {
        // runs once before the first test in this block

        //Create a Service Bus connection for this test
        test = new AzureServiceBusTester(
            process.env.SERVICEBUS_CONNECTION_STRING ?? "",
            new MassTransitMessageEncoder()
        );

        //Subscribe to the topic first so we dont miss the messages
        NewReservationReceivedSubscription = await test.subscribeToTopic("newreservationreceived");
        TakePaymentSubscription = await test.subscribeToTopic("takepayment");
        PaymentTakenSubscription = await test.subscribeToTopic("paymenttaken");
        ReservationConfirmedSubscription = await test.subscribeToTopic("reservationconfirmed");

        //give it a couple of seconds to make sure the subscriptions are active
        delay(2000);
    });

    it('should get OK status', async () => {
        var svcResponse = await http.postToService(process.env.SUBMIT_RESERVATION_SERVICE_ENDPOINT ?? "",
        //This is the payload to send to the service:
            {
                RequestCorrelationId: test.testUniqueId,
                ReservationId: testReservationId,
                StartDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                EndDate: moment().add("2","days").format('YYYY-MM-DDTHH:mm:ss'),
                GuestId: 123
            });
        // test that we got a 200 success
        expect(svcResponse.statusCode).equal(200);
    });

    it('should publish NewReservationEvent', async () => {
        //wait up to 2 seconds to receive a message on our subscription
        var receivedMessage = await NewReservationReceivedSubscription.waitForMessage(2000);
        //test we got a message
        expect(receivedMessage.didReceive).equal(true);
        //test the reservation Id matches
        expect(receivedMessage.getMessageBody().reservationId).equal(testReservationId);
    });

    it('should return the Reservation', async () => {
        var result = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=" + testReservationId);
        expect(result.success).equal(true);
    });

    it('should publish Take Payment Command', async () => {
        var receivedMessage = await TakePaymentSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);
    });

    it('should publish Payment Taken Event', async () => {
        var receivedMessage = await PaymentTakenSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).to.equal(true);
    });

    it('should publish ReservationConfirmed event', async () => {
        var receivedMessage = await ReservationConfirmedSubscription.waitForMessage(2000);
        expect(receivedMessage.didReceive).equal(true);
    });

    it('should return the Reservation as State=Confirmed', async () => {
        var result = await http.getFromService((process.env.GET_RESERVATION_SERVICE_ENDPOINT ?? "") + "?reservationId=" + testReservationId);
        //test we got a 200 level response
        expect(result.success).equal(true);
        //test that the object in the body had a field called status with a value = 'Confirmed'
        expect(result.body.Status).equal("Confirmed");

    });

    //Clean up after all the tests
    after(async () => {
      //this removes all the subscriptions we made
      test.cleanup();
    });
});

```

## Example output:


### Passing Tests:
When running locally on a console window (shown here in powershell):
![Screenshot of Passing Tests run in Powershell](eventest/docs/PassingTests.png)

It's also possible to run these as a CI/CD pipeline, perhaps after you've done an automated deployment of your application.
This is a screen shot of run summary from Azure Devops:
![Screenshot of Test Run summary from Azure DevOps](/eventest/docs/PassingTestsInAzDo.png)

and a list of tests:
![Screenshot of test list in Azure DevOps](eventest/docs/PassingTestsListInAzDo.png)
### Failing Test

![Screenshot of Passing Tests](eventest/docs/FailingTest.png)
