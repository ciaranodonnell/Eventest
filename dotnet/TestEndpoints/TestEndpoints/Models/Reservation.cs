using System;

namespace TestEndpoints
{
    public class Reservation
    {
        public Reservation()
        {
        }

        public string Status { get; internal set; }
        public DateTime EndDate { get; internal set; }
        public DateTime StartDate { get; internal set; }
        public int ReservationId { get; internal set; }
        public int GuestId { get; internal set; }
        

        public Guid? PaymentId { get; set; }
    }
}