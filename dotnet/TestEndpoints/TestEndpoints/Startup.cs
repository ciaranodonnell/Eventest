using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Hosting;
using System;
using MassTransit;
using MassTransit.Azure.ServiceBus.Core.Configurators;
using MassTransit.ConsumeConfigurators;
using MassTransit.Definition;
using MassTransit.Serialization;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics.CodeAnalysis;
using Microsoft.Azure.WebJobs.ServiceBus;
using MassTransit.Azure.ServiceBus.Core;

[assembly: FunctionsStartup(typeof(TestEndpoints.Startup))]

namespace TestEndpoints
{
    [ExcludeFromCodeCoverage]
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            try
            {

                builder.Services.AddSingleton(new ConfigData { RedisConnectionString = Environment.GetEnvironmentVariable("RedisConnectionStrings") });

                builder.Services.AddSingleton<ReservationCache>();
                builder.Services
                    .AddScoped<PaymentTriggerFunctions>()
                    .AddMassTransitForAzureFunctions(cfg => { cfg.AddConsumersFromNamespaceContaining<ConsumerNamespace>(); });

                AzureBusFactory.MessageTopology.GetMessageTopology<NewReservationReceivedEvent>().SetEntityName("newreservationreceived");
                AzureBusFactory.MessageTopology.GetMessageTopology<TakePaymentCommand>().SetEntityName("takepayment");
                AzureBusFactory.MessageTopology.GetMessageTopology<PaymentTakenEvent>().SetEntityName("paymenttaken");
                AzureBusFactory.MessageTopology.GetMessageTopology<ReservationConfirmedEvent>().SetEntityName("reservationconfirmed");
            }
            catch (Exception ex)
            {
                _ = ex.ToString();
            }
        }
    }
}
