using System;
using System.Collections.Generic;
using System.Text;

namespace NimiqNetwork.Core
{
    public class Network
    {

        public int peerCount { get; private set; }
        public int peerCountWebSocket { get; private set; }
        public int peerCountWebRtc { get; private set; }
        public float bytesReceived { get; private set; }
        public float bytesSent { get; private set; }
    }
}
