using MassTransit;
using System.Threading.Tasks;

namespace TestEndpoints
{
    public struct ConsumerNamespace
    {

    }

    public class PaymentTakenConsumer : IConsumer<PaymentTakenEvent>
    {

        public PaymentTakenConsumer( ReservationCache reservationRepo)
        {
            
            ReservationRepo = reservationRepo;
        }

        public ReservationCache ReservationRepo { get; }

        public async Task Consume(ConsumeContext<PaymentTakenEvent> context)
        {
            var res = ReservationRepo.GetReservation(context.Message.ReservationId);
            if (res is null)
            {
                res.ReservationId = context.Message.ReservationId;
                res.Status = "Error - Reservation paid for but not found";
            }
            else
            {
                res.Status = "Confirmed";
                res.PaymentId = context.Message.PaymentId;
            }
            ReservationRepo.SaveReservation(res);

            await context.Publish(new ReservationConfirmedEvent { ReservationId = context.Message.ReservationId, Reservation = res}, 
                //forward on the same correlation id
                c => c.CorrelationId = context.CorrelationId);
        }
    }
}
