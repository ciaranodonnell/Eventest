using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace TestEndpointContainer.Controllers;

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

        var reservation = new Reservation();
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


        await injectedPublisher.Publish(new TakePaymentCommand { Amount = 500 * 100, ReservationId = req.ReservationId },
            context => context.CorrelationId = correlationId);


        return new OkObjectResult("{\"success\":true, \"output\":\"Message Sent\"}");
    }
}

