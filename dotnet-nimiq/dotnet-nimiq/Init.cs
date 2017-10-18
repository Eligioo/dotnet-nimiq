using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace NimiqNetwork.Core
{
    public partial class Nimiq
    {
        public Consensus Concensus;
        public Blockchain Blockchain;
        public Miner Miner;
        public Network Network;
        public Accounts Accounts;
        public Mempool Mempool;
        public Wallet Wallet;

        /// <summary>
        /// Connect to a local server on port 6969.
        /// </summary>
        public void Init()
        {
            Client.Socket = IO.Socket("http://localhost:6969");
            InitializeInstance();
        }

        /// <summary>
        /// Connect to a server with a specific URI at port 6969.
        /// </summary>
        /// <param name="uri"></param>
        public void Init(string uri)
        {
            Client.Socket = IO.Socket(uri +":6969");
            InitializeInstance();
        }

        /// <summary>
        /// Connect to a server with specified URI and port.
        /// </summary>
        /// <param name="uri"></param>
        /// <param name="port"></param>
        public void Init(string uri, string port)
        {
            Client.Socket = IO.Socket(uri +":"+ port);
            InitializeInstance();
        }

        private void InitializeInstance()
        {
            Concensus = new Consensus();
            Blockchain = new Blockchain();
            Miner = new Miner();
            Network = new Network();
            Accounts = new Accounts();
            Mempool = new Mempool();
            Wallet = new Wallet();

            Client.Socket.On(Socket.EVENT_CONNECT, () => { Client.Connected = true; } );
            Client.Socket.On(Socket.EVENT_DISCONNECT, () => { Client.Connected = false; });
            Client.Socket.On("LifeCheck", (jData) =>
            {
                JObject jObject = (JObject)jData;
                var deserialize = jObject.ToObject<LifeCheckStruct>();
            });
        }
    }
}
