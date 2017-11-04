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

        public int HashRate { get; private set; }

        public Miner()
        {
            Nimiq.LifeCheck += Nimiq_LifeCheck;

            Client.Socket.On("HashRateChanged", (jData) =>
            {
                JObject jObject = (JObject)jData;
                var deserialize = jObject.ToObject<HashRateChangedStruct>();
                if (HashRateChanged != null)
                    HashRateChanged.Invoke();
                HashRate = deserialize.hashrate;
            });
        }

        private void Nimiq_LifeCheck(LifeCheckStruct lifeCheckStruct)
        {

        }
    }

    class HashRateChangedStruct
    {
        public int hashrate;
    }
}
