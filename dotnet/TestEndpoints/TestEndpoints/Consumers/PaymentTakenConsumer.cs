using MassTransit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestEndpoints
{
    internal class PaymentTakenConsumer : IConsumer<PaymentTakenEvent>
    {

        public PaymentTakenConsumer( ReservationCache reservationRepo)
        {
            
            ReservationRepo = reservationRepo;
        }

        public ReservationCache ReservationRepo { get; }

        public async Task Consume(ConsumeContext<PaymentTakenEvent> context)
        {
            var res = ReservationRepo.GetReservation(context.Message.ReservationId);
            res.Status = "Confirmed";
            res.PaymentId = context.Message.PaymentId;
            ReservationRepo.SaveReservation(res);

            await context.Publish(new ReservationConfirmedEvent { ReservationId = context.Message.ReservationId, Reservation = res}, 
                //forward on the same correlation id
                c => c.CorrelationId = context.CorrelationId);
        }
    }
}
