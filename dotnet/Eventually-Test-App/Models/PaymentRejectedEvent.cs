using System;

namespace TestEndpointContainer
{
    public class PaymentRejectedEvent
    {
        
        public int ReservationId { get; set; }
        public int Amount { get; set; }
        public bool Success { get; set; }=false;
        public string Reason { get; internal set; }
        public Guid PaymentId { get; internal set; }
    }
}