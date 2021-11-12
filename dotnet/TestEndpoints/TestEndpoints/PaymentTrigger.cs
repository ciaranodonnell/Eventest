using MassTransit.WebJobs.ServiceBusIntegration;
using Microsoft.Azure.ServiceBus;
using Microsoft.Azure.WebJobs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace TestEndpoints
{
    public class PaymentTrigger
    {
        readonly IMessageReceiver _provider;

        public PaymentTrigger(IMessageReceiver provider)
        {
            _provider = provider;
        }

        const string TakePaymentTopicName = "takepayment";
        const string PaymentTakenTopicName = "paymenttaken";
        const string SubName = "functionsub";


        [FunctionName("TakePayment")]
        public async Task TakePayment([ServiceBusTrigger(TakePaymentTopicName, SubName)] Message message, CancellationToken cancellationToken)
        {
            await _provider.Handle(TakePaymentTopicName, message, cancellationToken);
        }
        
        

        [FunctionName("PaymentTaken")]
        public async Task PaymentTaken([ServiceBusTrigger(PaymentTakenTopicName, SubName)] Message message, CancellationToken cancellationToken)
        {
            await _provider.Handle(PaymentTakenTopicName, message, cancellationToken);
        }
    }
}
