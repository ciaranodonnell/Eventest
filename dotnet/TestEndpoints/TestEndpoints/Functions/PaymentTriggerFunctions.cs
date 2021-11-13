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
    public class PaymentTriggerFunctions
    {
        readonly IMessageReceiver _receiver;

        public PaymentTriggerFunctions(IMessageReceiver receiver)
        {
            _receiver = receiver;
        }

        const string TakePaymentTopicName = "takepayment";
        const string PaymentTakenTopicName = "paymenttaken";
        const string SubName = "functionsub";


        [FunctionName("TakePayment")]
        public async Task TakePayment([ServiceBusTrigger(TakePaymentTopicName, SubName)] Message message, CancellationToken cancellationToken)
        {
            
            await _receiver.Handle(TakePaymentTopicName,SubName, message, cancellationToken);
        }
        
        

        [FunctionName("PaymentTaken")]
        public async Task PaymentTaken([ServiceBusTrigger(PaymentTakenTopicName, SubName)] Message message, CancellationToken cancellationToken)
        {
            await _receiver.Handle(PaymentTakenTopicName, SubName, message, cancellationToken);
        }
    }
}
