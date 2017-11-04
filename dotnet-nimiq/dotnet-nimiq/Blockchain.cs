using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace NimiqNetwork.Core
{
    public delegate void HeadChangedEventHandler();

    public class Blockchain
    {
        public static event HeadChangedEventHandler HeadChanged;

        //public head { get; private set; }
        public HeadHash HeadHash { get; private set; }
        public double TotalWork { get; private set; }
        public int Height { get; private set; }
        //public path { get; private set; }
        public bool Busy { get; private set; }

        public Blockchain()
        {
            Nimiq.LifeCheck += Nimiq_LifeCheck;

            Client.Socket.On("HeadChanged", (jData) =>
            {
                JObject jObject = (JObject)jData;
                var deserialize = jObject.ToObject<HeadChangedStruct>();
                if (HeadChanged != null)
                    HeadChanged.Invoke();
                Height = deserialize.height;
            });
        }

        private void Nimiq_LifeCheck(LifeCheckStruct lifeCheckStruct)
        {
            HeadHash = lifeCheckStruct.headHash;
            TotalWork = lifeCheckStruct.totalWork;
            Height = lifeCheckStruct.height;
            Busy = lifeCheckStruct.busy;
        }
    }

    class HeadChangedStruct
    {
        public int height;
    }
}
