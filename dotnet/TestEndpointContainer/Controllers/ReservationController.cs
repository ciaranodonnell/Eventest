using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace TestEndpointContainer.Controllers;

[ApiController]
[Route("[controller]")]
public class ReservationController : ControllerBase
{


    private readonly ILogger<ReservationController> _logger;
    private readonly ReservationCache reservationRepo;

    public ReservationController(ILogger<ReservationController> logger, ReservationCache reservationRepo)
    {
        _logger = logger;
        this.reservationRepo = reservationRepo;
    }

    [HttpGet(Name = "GetReservation")]
    public IActionResult Get([FromQuery] int reservationId)
    {
        var res = reservationRepo.GetReservation(reservationId);
        if (res is object)
        {
            return new OkObjectResult(JsonConvert.SerializeObject(res));
        }

        return new NotFoundResult();
    }
}

