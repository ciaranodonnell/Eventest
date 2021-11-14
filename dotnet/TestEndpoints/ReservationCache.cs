using System;
using System.Collections.Generic;
using StackExchange.Redis;
using Newtonsoft.Json;

namespace TestEndpoints
{
    public class ReservationCache
    {

        public ReservationCache(ConfigData data)
        {
            var connString = data.RedisConnectionString;
            var redis = ConnectionMultiplexer.Connect(connString);


            this.db = redis.GetDatabase();

        }

        Dictionary<int, Reservation> cache = new Dictionary<int, Reservation>();
        private IDatabase db;

        public Reservation GetReservation(int id)  {
            var cached = db.StringGet(new RedisKey(id.ToString()));
            if (cached.HasValue)
            {
                var str = cached.ToString();
                return JsonConvert.DeserializeObject<Reservation>(str);
            }
            return null;
        }
        public void SaveReservation(Reservation res)
        {
            var str = JsonConvert.SerializeObject(res);
            var cached = db.StringSet(new RedisKey(res.ReservationId.ToString()), new RedisValue(str), new TimeSpan(24,0,0), When.Always);
        }
    }
}