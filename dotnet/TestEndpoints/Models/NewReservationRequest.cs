using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestEndpoints
{
    public class NewReservationRequest
    {

        public string RequestCorrelationId { get; set; }

        public int ReservationId { get; set; }
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
        public int GuestId { get; set; }


    }
}
