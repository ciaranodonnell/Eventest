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

[assembly: FunctionsStartup(typeof(TestEndpoints.Startup))]

namespace TestEndpoints
{
    [ExcludeFromCodeCoverage]
    public class Startup : FunctionsStartup
    {
        private IConfigurationRoot Config { get; set; }

        public override void Configure(IFunctionsHostBuilder builder)
        {
            try
            {
                // Get the azure function application directory. 'C:\whatever' for local and 'd:\home\whatever' for Azure
                var executionContextOptions = builder.Services.BuildServiceProvider()
                    .GetService<IOptions<ExecutionContextOptions>>().Value;

                var currentDirectory = executionContextOptions.AppDirectory;
                //
                // Get the original configuration provider from the Azure Function
                var configuration = builder.Services.BuildServiceProvider().GetService<IConfiguration>();


                // Create a new IConfigurationRoot and add our configuration along with Azure's original configuration 
                this.Config = new ConfigurationBuilder()
                    .SetBasePath(currentDirectory)
                    .AddConfiguration(configuration) // Add the original function configuration 
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                builder.Services.AddSingleton<ReservationCache>();

                builder.Services.AddSingleton(Options.Create(new ServiceBusOptions { ConnectionString = Config.GetConnectionString("ServiceBus") }));

                builder.Services
                    .AddScoped<PaymentTrigger>()
                    .AddMassTransitForAzureFunctions(x =>
                    {
                        x.AddConsumer<TakePaymentConsumer>();
                        x.AddConsumer<PaymentTakenConsumer>();
                    },
                    (br, x) =>
                    {
                        x.Message<NewReservationReceivedEvent>(t => t.SetEntityName("NewReservationReceived"));
                        x.Message<TakePaymentCommand>(t => t.SetEntityName("TakePayment"));
                        x.Message<PaymentTakenEvent>(t => t.SetEntityName("PaymentTaken"));
                        x.Message<ReservationConfirmedEvent>(t => t.SetEntityName("ReservationConfirmed"));
                    });

            }
            catch (Exception ex)
            {
                _ = ex.ToString();
            }
        }
    }
}
