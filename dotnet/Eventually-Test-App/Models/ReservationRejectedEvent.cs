namespace TestEndpointContainer
{
    internal class ReservationRejectedEvent
    {
        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; }
        public string Reason { get; set; }
    }
}