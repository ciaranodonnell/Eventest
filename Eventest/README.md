# Evenest

The purpose of this library is to enable a simple route to run end to end tests for Event Driven Systems.

The name is a portmanteau of Event and Test.

When creating web applications that have asynchronous backend systems it can be very challenging to test those backends.
In an e-commerce example: It would be useful to test that putting a new Order into the Order Service causes:
   
1. Website sends a NewReservationRequest through a POST to the Reservation Service
2. Reservation Service generates a ```NewReservationReceived``` event.
3. Reservation Service issues ```TakePayment``` command to the Payment Service
4. Payment Service issues ```Payment Taken Event```
5. Reservation Service issues a ```ReservationConfirmed``` event

Eventest contains a set of components to make testing for these conditions as simple as writing a Unit Test.

# Components

There are 2 different sections to the library at the moment:

## Broker

The Broker abstraction is the core part of the abstraction that allows you listen for, or publish, events and commands in your tests.
The Broker interface is the common abstraction, which concrete implementations given in dependent libraries that allows you to run against
real brokers, e.g. ```eventest.servicebus``` which wraps Azure Service Bus with this instance.

Each test group should create a Broker instance. The Broker then creates a unique Id for the test run, which is used when subscribing to messages.
This test Id will be used as the CorrelationId for all messages that the Broker sends, and all subscriptions that are issued against the broker will be filtered to only raise messages that have that Correlation Id.
This means your tests will run independently in terms of messaging and wont get false postivites/negatives because they received unrelated messages.

You can send messages, Commands or Events, to the system through the ``` sendAMessage(message:any, topicOrQueueName:string) : Promise<void>;``` method.

### Subscriptions

To subscribe to a messaging topics, the Broker has a ```subscribeToTopic(topicName:string) : Promise<Subscription>``` method.
This Subscription will be filtered to only receive messages from this test. 

Once you have a ```Subscription``` object you can wait for messages to be delivered to that subscription.
The method ```waitForMessage(timeoutInMS: number): Promise<ReceiveResult>``` will wait up to the timeout for a message to arrive.
The method definitely returns a ```ReceivedResult``` object which enables you to determine whether a message arrived. 

### ReceiveResult

The ```ReceiveResult``` is returned by the ```waitForMessage(timeoutInMS: number): Promise<ReceiveResult>``` on a ```Subscription```.
You should check the ```didReceive``` property to check if a message was actually received.
If that property returns true you can call the ```getMessageBody(): any``` to get the contents of the message.

## Http Abstraction

There is an ```http``` abstraction too. 

## Example of use of this library:

This library uses Mocha to run these tests like unit tests. Example code:
``` typescript
 describe('Submitting NewReservationRequest', async () => {

    var test: Bus.Broker;

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
![Screenshot of Passing Tests run in Powershell](/Eventest/docs/PassingTests.png)

It's also possible to run these as a CI/CD pipeline, perhaps after you've done an automated deployment of your application.
This is a screen shot of run summary from Azure Devops:
![Screenshot of Test Run summary from Azure DevOps](/Eventest/docs/PassingTestsInAzDo.png)

and a list of tests:
![Screenshot of test list in Azure DevOps](/Eventest/docs/PassingTestsListInAzDo.png)
### Failing Test

![Screenshot of Passing Tests](/Eventest/docs/FailingTest.png)
