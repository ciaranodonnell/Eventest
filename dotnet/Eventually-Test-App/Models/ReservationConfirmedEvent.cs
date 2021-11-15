using System;

namespace TestEndpointContainer
{
    public class ReservationConfirmedEvent
    {
        public int ReservationId { get; set; }
        public Reservation Reservation { get; set; }
    }
}