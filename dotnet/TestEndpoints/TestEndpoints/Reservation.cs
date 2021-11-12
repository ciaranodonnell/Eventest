using System;

namespace TestEndpoints
{
    internal class Reservation
    {
        public Reservation()
        {
        }

        public string Status { get; internal set; }
        public DateTime EndDate { get; internal set; }
        public DateTime StartDate { get; internal set; }
        public int ReservationId { get; internal set; }
    }
}