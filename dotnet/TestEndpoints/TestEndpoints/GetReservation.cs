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

        public Function1(ILogger<Function1> log)
        {
            _logger = log;
        }

        [FunctionName("GetReservation")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]
            HttpRequest request)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            var resIdString = request.Query["reservationId"];
            if (int.TryParse(resIdString, out var id))
            {
                if (id == 123)
                {
                    return new OkObjectResult(JsonConvert.SerializeObject(new Reservation { ReservationId = 123, StartDate = DateTime.Now, EndDate = DateTime.Now.AddDays(1), Status="Confirmed" }));
                }
            }

            return new NotFoundResult();
            
        }
    }
}

