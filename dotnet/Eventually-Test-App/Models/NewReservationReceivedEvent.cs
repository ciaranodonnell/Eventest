using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestEndpointContainer
{
    public class NewReservationReceivedEvent
    {
        public int ReservationId { get; set; }
        public string RequestCorrelationId { get; set; }
        public Reservation Reservation { get; set; }
        public int ReservationLengthInDays { get; set; }
    }
}
