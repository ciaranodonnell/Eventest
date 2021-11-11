using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestEndpoints
{
    public class NewReservationReceivedEvent
    {
        public DateTime StartDate { get; internal set; }
        public int ReservationId { get; internal set; }
        public DateTime EndDate { get; internal set; }
        public int GuestId { get; internal set; }
        public string RequestCorrelationId { get; internal set; }
        public string State { get; internal set; }
    }
}
