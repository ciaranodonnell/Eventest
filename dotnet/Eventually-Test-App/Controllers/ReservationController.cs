using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace TestEndpointContainer.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class ReservationController : ControllerBase
    {


        private readonly ILogger<ReservationController> _logger;
        private readonly IPublishEndpoint injectedPublisher;
        private readonly ReservationCache reservationRepo;

        public ReservationController(ILogger<ReservationController> logger, IPublishEndpoint injectedPublisher, ReservationCache reservationRepo)
        {
            _logger = logger;
            this.injectedPublisher = injectedPublisher;
            this.reservationRepo = reservationRepo;
        }

        [HttpGet]
        public IActionResult GetReservation([FromQuery] int reservationId)
        {
            var res = reservationRepo.GetReservation(reservationId);
            if (res is object)
            {
                return new OkObjectResult(JsonConvert.SerializeObject(res));
            }

            return new UnauthorizedResult();
        }

        [HttpPost]
        public async Task<IActionResult> SubmitReservation([FromBody] NewReservationRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            //StreamReader reader = new StreamReader(request.Body);
            //var body = reader.ReadToEnd();
            //NewReservationRequest req = JsonConvert.DeserializeObject<NewReservationRequest>(body);

            Guid? correlationId = null;
            if (HttpContext.Request.Headers.TryGetValue("CorrelationId", out var corrIdString))
            {
                if (Guid.TryParse(corrIdString, out var parsedCorrId)) correlationId = parsedCorrId;
            }

            var reservation = new Reservation();
            reservation.ReservationId = req.ReservationId;
            reservation.StartDate = req.StartDate;
            reservation.EndDate = req.EndDate;
            reservation.GuestId = req.GuestId;
            reservation.Status = "Received";
            reservationRepo.SaveReservation(reservation);

            int reservationLengthInDays = Convert.ToInt32(reservation.EndDate.Date.Subtract(reservation.StartDate.Date).TotalDays);


            var evnt = new NewReservationReceivedEvent
            {
                ReservationId = req.ReservationId,
                Reservation = reservation,
                ReservationLengthInDays = reservationLengthInDays,
                RequestCorrelationId = req.RequestCorrelationId
            };

            if (correlationId is null)
            {
                correlationId = Guid.Parse(req.RequestCorrelationId);
            }

            await injectedPublisher.Publish(evnt,
                context => context.CorrelationId = correlationId);

            
            await injectedPublisher.Publish(new TakePaymentCommand { Amount = 50000 * reservationLengthInDays, ReservationId = req.ReservationId },
                context => context.CorrelationId = correlationId);


            return new OkObjectResult("{\"success\":true, \"output\":\"Message Sent\"}");
        }
    }

}