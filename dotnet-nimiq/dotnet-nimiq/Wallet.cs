using System;
using System.Collections.Generic;
using System.Text;

namespace NimiqNetwork.Core
{
    public class Wallet
    {
        public Address Address { get; private set; }
        public PublicKey PublicKey { get; private set; }

        public Wallet()
        {
            Nimiq.LifeCheck += Nimiq_LifeCheck;
        }

        private void Nimiq_LifeCheck(LifeCheckStruct lifeCheckStruct)
        {
            Address = lifeCheckStruct.address;
            PublicKey = lifeCheckStruct.publicKey;
        }
    }
}
