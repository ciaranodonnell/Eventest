using System;
using System.Collections.Generic;

namespace TestEndpoints
{
    public class ReservationCache
    {
        Dictionary<int, Reservation> cache = new Dictionary<int, Reservation>();

        public Reservation GetReservation(int id) => cache.ContainsKey(id) ? cache[id] : new Reservation();
        public void SaveReservation(Reservation res) => cache[res.ReservationId] = res;
    }
}