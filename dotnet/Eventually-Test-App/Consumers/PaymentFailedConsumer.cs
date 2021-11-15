using MassTransit;
using System.Threading.Tasks;

namespace TestEndpointContainer
{

    public class PaymentFailedConsumer : IConsumer<PaymentRejectedEvent>
    {

        public PaymentFailedConsumer( ReservationCache reservationRepo)
        {
            
            ReservationRepo = reservationRepo;
        }

        public ReservationCache ReservationRepo { get; }

        public async Task Consume(ConsumeContext<PaymentRejectedEvent> context)
        {
            var res = ReservationRepo.GetReservation(context.Message.ReservationId);
            if (res is null)
            {
                res.ReservationId = context.Message.ReservationId;
                res.Status = "Error - Reservation paid for but not found";
            }
            else
            {
                res.Status = "Failed";
                res.PaymentId = context.Message.PaymentId;
            }
            ReservationRepo.SaveReservation(res);

            await context.Publish(new ReservationRejectedEvent { ReservationId = context.Message.ReservationId, Reservation = res, Reason = context.Message.Reason}, 
                //forward on the same correlation id
                c => c.CorrelationId = context.CorrelationId);
        }
    }
}
