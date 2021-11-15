using MassTransit;
using MassTransit.Azure.ServiceBus.Core.Configurators;
using Microsoft.OpenApi.Models;

namespace TestEndpointContainer;

public class Program
{
    public static async Task Main(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .Build();

        await CreateHostBuilder(args).RunConsoleAsync();
    }

    public static IHostBuilder CreateHostBuilder(string[] args)
    {

        IServiceCollection Services = null;
        IConfigurationRoot Config = null;

        return new HostBuilder()
               .ConfigureAppConfiguration((hostingContext, config) =>
               {
                   config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
                   config.AddEnvironmentVariables();
                   config.AddUserSecrets<Program>();
                   config.AddCommandLine(args);
                   Config = config.Build();
               })
               .ConfigureLogging(logging =>
              {
                  logging.ClearProviders();
                  logging.AddConsole();
                  logging.AddDebug();
                  logging.SetMinimumLevel(LogLevel.Trace);
              })
             .ConfigureServices((hostContext, services) =>
             {
                 services.AddLogging();
                 services.AddOptions();

                 services.AddSingleton<ReservationCache>();
                 services.AddSingleton(new ConfigData { RedisConnectionString = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING")! });

                 Services = services;

                 services.AddHttpClient();
                 services.AddHttpContextAccessor();

                 services.AddSwaggerGen();
                 services.AddMassTransit(x =>
                 {
                     x.AddConsumer<TakePaymentConsumer>();
                     x.AddConsumer<PaymentTakenConsumer>();

                     x.UsingAzureServiceBus((context, cfg) =>
                     {
                         var connectionString = Environment.GetEnvironmentVariable("SERVICEBUS_CONNECTION_STRING");
                         cfg.Host(connectionString);


                         const string TakePaymentTopicName = "takepayment";
                         const string PaymentTakenTopicName = "paymenttaken";
                         const string SubName = "functionsub";


                         cfg.SubscriptionEndpoint(SubName, TakePaymentTopicName, e =>
                         {
                             e.PrefetchCount = 1;
                             e.ConfigureConsumer<TakePaymentConsumer>(context);
                         }
                         );
                         cfg.SubscriptionEndpoint(SubName, PaymentTakenTopicName, e =>
                         {
                             e.PrefetchCount = 1;
                             e.ConfigureConsumer<PaymentTakenConsumer>(context);
                         }
                         );
                         cfg.ConfigureEndpoints(context);

                         cfg.Message<TakePaymentCommand>(t => t.SetEntityName("takepayment"));
                         cfg.Message<PaymentTakenEvent>(t => t.SetEntityName("paymenttaken"));
                         cfg.Message<NewReservationReceivedEvent>(t => t.SetEntityName("newreservationreceived"));
                         cfg.Message<ReservationConfirmedEvent>(t => t.SetEntityName("reservationconfirmed"));
                     });

                 });

                 services.AddMassTransitHostedService(true);
             })
             .ConfigureWebHostDefaults(webBuilder =>
                 {
                     webBuilder.UseStartup<Startup>();
                 });
        ;
    }

}