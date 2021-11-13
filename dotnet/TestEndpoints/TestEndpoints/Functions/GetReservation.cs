using System.Threading.Tasks;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace TestEndpoints
{
    public class GetReservationFunction
    {
        private readonly ILogger<GetReservationFunction> _logger;
        private readonly ReservationCache reservationRepo;
        private readonly IPublishEndpoint injectedPublisher;

        public GetReservationFunction(ILogger<GetReservationFunction> log, ReservationCache reservationRepo)
        {
            _logger = log;
            this.reservationRepo = reservationRepo;
        }

        [FunctionName("GetReservation")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]
            HttpRequest request)
        {
            IActionResult result = null;
            await Task.Run(() =>
           {
               _logger.LogInformation("C# HTTP trigger function processed a request.");
               var resIdString = request.Query["reservationId"];
               if (int.TryParse(resIdString, out var id))
               {
                   var res = reservationRepo.GetReservation(id);
                   if (id == res.ReservationId)
                   {
                       result = new OkObjectResult(JsonConvert.SerializeObject(res));
                       
                   }
               }
               if (result is null)
               result = new NotFoundResult();
           });
            return result;
        }
    }
}

