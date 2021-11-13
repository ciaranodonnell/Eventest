using System;
using System.IO;
using System.Net;
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
    public class SubmitReservation
    {
        private readonly ReservationCache reservationRepo;
        private readonly ILogger<SubmitReservation> _logger;
        private readonly IPublishEndpoint injectedPublisher;

        public SubmitReservation(ILogger<SubmitReservation> log, IPublishEndpoint injectedPublisher, ReservationCache reservationRepo)
        {
            this.reservationRepo = reservationRepo;
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

            var reservation = reservationRepo.GetReservation(req.ReservationId);
            reservation.ReservationId = req.ReservationId;
            reservation.StartDate = req.StartDate;
            reservation.EndDate = req.EndDate;
            reservation.GuestId = req.GuestId;
            reservation.Status = "Received";
            reservationRepo.SaveReservation(reservation);

            var evnt = new NewReservationReceivedEvent
            {
                ReservationId = req.ReservationId,
                Reservation = reservation,
                RequestCorrelationId = req.RequestCorrelationId
            };

            var correlationId = Guid.Parse(req.RequestCorrelationId);
            await injectedPublisher.Publish(evnt, 
                context => context.CorrelationId = correlationId);


            await injectedPublisher.Publish(new TakePaymentCommand { Amount=500*100, ReservationId = req.ReservationId},
                context => context.CorrelationId = correlationId);


            return new OkObjectResult("{\"success\":true, \"output\":\"Message Sent\"}");
        }


    }
}

