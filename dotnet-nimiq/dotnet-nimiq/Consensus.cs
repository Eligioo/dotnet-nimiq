using System;
using System.Collections.Generic;
using System.Text;

namespace NimiqNetwork.Core
{
    public delegate void EstablishedEventHandler();
    public delegate void LostEventHandler();

    public class Consensus
    {
        public static event EstablishedEventHandler Established;
        public static event LostEventHandler Lost;

        public bool established { get { return established; } private set { } }

        public Consensus()
        {
            Client.Socket.On("Established", () =>
            {
                if(Established != null)
                    Established.Invoke();
                established = true;
            });

            Client.Socket.On("Lost", () =>
            {
                if (Lost != null)
                    Lost.Invoke();
                established = false;
            });
        }
    }
}
