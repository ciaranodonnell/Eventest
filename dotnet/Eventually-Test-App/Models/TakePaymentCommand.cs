namespace TestEndpointContainer
{
    public class TakePaymentCommand
    {
        public int Amount { get; internal set; }
        public int ReservationId { get; internal set; }
    }
}