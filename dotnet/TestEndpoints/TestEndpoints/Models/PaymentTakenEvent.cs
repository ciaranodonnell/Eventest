using System;

namespace TestEndpoints
{
    internal class PaymentTakenEvent
    {
        public int Amount { get; internal set; }
        public bool Success { get; internal set; }
        public Guid PaymentId { get; internal set; }
        public int ReservationId { get; internal set; }
    }
}