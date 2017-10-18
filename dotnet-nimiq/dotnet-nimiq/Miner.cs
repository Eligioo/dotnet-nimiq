using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace NimiqNetwork.Core
{
    public delegate void HashRateChangedEventHandler();

    public class Miner
    {
        public static event HashRateChangedEventHandler HashRateChanged;

        public int hashrate { get; private set; }

        public Miner()
        {
            Client.Socket.On("HashRateChanged", (jData) =>
            {
                JObject jObject = (JObject)jData;
                var deserialize = jObject.ToObject<HashRateChangedStruct>();
                if (HashRateChanged != null)
                    HashRateChanged.Invoke();
                hashrate = deserialize.hashrate;
            });
        }

    }

    class HashRateChangedStruct
    {
        public int hashrate;
    }
}
