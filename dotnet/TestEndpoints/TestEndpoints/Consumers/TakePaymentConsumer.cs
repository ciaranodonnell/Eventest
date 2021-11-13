﻿using MassTransit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestEndpoints
{
    internal class TakePaymentConsumer : IConsumer<TakePaymentCommand>
    {

        public TakePaymentConsumer()
        {
            
        }

        
        public async Task Consume(ConsumeContext<TakePaymentCommand> context)
        {
            try
            {
                await context.Publish(new PaymentTakenEvent
                {
                    PaymentId = Guid.NewGuid(),
                    ReservationId = context.Message.ReservationId,
                    Amount = context.Message.Amount,
                    Success = true
                },
                    //forward on the same correlation id
                    c => c.CorrelationId = context.CorrelationId);
            }catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}