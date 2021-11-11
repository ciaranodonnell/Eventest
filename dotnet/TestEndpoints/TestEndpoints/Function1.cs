using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;

namespace TestEndpoints
{
    public class Function1
    {
        private readonly ILogger<Function1> _logger;
        private readonly IPublishEndpoint injectedPublisher;

        public Function1(ILogger<Function1> log, IPublishEndpoint injectedPublisher)
        {
            _logger = log;
            this.injectedPublisher = injectedPublisher;
        }

        [FunctionName("SubmitReservation")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]
            HttpRequest request)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            StreamReader reader = new StreamReader(request.Body);
            var body = reader.ReadToEnd();
            NewReservationRequest req = JsonConvert.DeserializeObject<NewReservationRequest>(body);

            await injectedPublisher.Publish<NewReservationReceivedEvent>(new NewReservationReceivedEvent
            {
                ReservationId = req.ReservationId,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                GuestId = req.GuestId,
                RequestCorrelationId = req.RequestCorrelationId,
                State = "Recevied"
            }, context => context.CorrelationId = Guid.Parse(req.RequestCorrelationId));


            return new OkObjectResult("{\"success\":true, \"output\":\"Message Sent\"}");
        }
    }
}

