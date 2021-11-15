using MassTransit;
using System;
using System.Threading.Tasks;

namespace TestEndpointContainer
{
    public class TakePaymentConsumer : IConsumer<TakePaymentCommand>
    {

        public TakePaymentConsumer()
        {
            
        }

        
        public async Task Consume(ConsumeContext<TakePaymentCommand> context)
        {
            try
            {
                var msg = context.Message;

                if (msg.Amount > 1000_00)
                {
                    await context.Publish(new PaymentRejectedEvent
                    {
                        PaymentId = Guid.NewGuid(),
                        ReservationId = msg.ReservationId,
                        Amount = msg.Amount,
                        Success = false,
                        Reason = "Payment too large"
                    },
                    //forward on the same correlation id
                    c => c.CorrelationId = context.CorrelationId) ;
                }
                else
                {

                    await context.Publish(new PaymentTakenEvent
                    {
                        PaymentId = Guid.NewGuid(),
                        ReservationId = msg.ReservationId,
                        Amount = msg.Amount,
                        Success = true
                    },
                        //forward on the same correlation id
                        c => c.CorrelationId = context.CorrelationId);
                }


            }catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
