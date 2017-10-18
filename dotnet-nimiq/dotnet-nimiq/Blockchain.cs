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

        public int height { get; private set; }

        public Blockchain()
        {
            Client.Socket.On("HeadChanged", (jData) =>
            {
                JObject jObject = (JObject)jData;
                var deserialize = jObject.ToObject<HeadChangedStruct>();
                if (HeadChanged != null)
                    HeadChanged.Invoke();
                height = deserialize.height;
            });
        }
    }

    class HeadChangedStruct
    {
        public int height;
    }
}
