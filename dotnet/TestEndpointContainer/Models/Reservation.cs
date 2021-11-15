using System;

namespace TestEndpointContainer
{
    public class Reservation
    {
        public Reservation()
        {
        }

        public string Status { get;  set; }
        public DateTime EndDate { get;  set; }
        public DateTime StartDate { get;  set; }
        public int ReservationId { get;  set; }
        public int GuestId { get;  set; }
        

        public Guid? PaymentId { get; set; }
    }
}