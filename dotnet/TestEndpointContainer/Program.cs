using MassTransit;
using MassTransit.Azure.ServiceBus.Core.Configurators;

namespace TestEndpointContainer;

public class Program
{
    public static void Main(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .Build();

        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args)
    {
        return Host.CreateDefaultBuilder(args)
             .ConfigureLogging(logging =>
             {
                 logging.ClearProviders();
                 logging.AddConsole();
             })
             .ConfigureAppConfiguration((hostBuilder, configBuilder) =>
             {
                 configBuilder
                     .SetBasePath(hostBuilder.HostingEnvironment.ContentRootPath)
                     .AddJsonFile("appsettings.json")
                     .AddJsonFile($"appsettings.{hostBuilder.HostingEnvironment.EnvironmentName}.json",
                         optional: true)
                     .AddEnvironmentVariables();
             })
             .ConfigureServices((hostContext, services) =>
             {
                 // Add services to the container.

                 //services.AddApplicationInsightsTelemetry();

                 services.AddHttpClient();

                 services.AddControllers();
                 
                 services.AddMassTransit(x =>
                 {
                     x.AddConsumer<TakePaymentConsumer>();
                     x.AddConsumer<PaymentTakenConsumer>();

                     x.UsingAzureServiceBus((context, cfg) =>
                     {
                         var connectionString = $"Endpoint=sb://{config.Namespace}.servicebus.windows.net/;SharedAccessKeyName={config.SharedAccessKeyName};SharedAccessKey={config.SharedAccessKey}";
                         cfg.Host(connectionString);

                         //Configure fault topic for BenefitCrmSubscriber
                         cfg.Message<Fault<CrmBenefitEventSubscriber>>(configTopology =>
                         {
                             configTopology.SetEntityName($"{crmBenefitSubscriber.TopicName}-fault");
                         });

                         const string TakePaymentTopicName = "takepayment";
                         const string PaymentTakenTopicName = "paymenttaken";
                         const string SubName = "functionsub";


                         cfg.SubscriptionEndpoint(
                            SubName,
                            TakePaymentTopicName,
                            e =>
                            {
                                e.PrefetchCount = 1;
                                e.UseMessageRetry(retryConfig =>
                                {
                                    //Three retries, each retry after 2 seconds
                                    retryConfig.Interval(config.RetryCount, new TimeSpan(0, 0, config.RetryInterval));
                                    //Retry only in below cases, we can add more to this list
                                    retryConfig.Handle<DbUpdateConcurrencyException>();
                                    retryConfig.Handle<SqlException>(x => x.Message.Contains("connection"));

                                });
                                e.ConfigureConsumer<TakePaymentConsumer>(context);
                            }
                         );
                         cfg.ConfigureEndpoints(context);
                     });

                 });
                 services.AddMassTransitHostedService(true);
             });
    }
}