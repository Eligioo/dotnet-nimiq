using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using NimiqNetwork.Core;

namespace TestApplication
{
    public partial class Form1 : Form
    {
        Nimiq nimiq;

        public Form1()
        {
            Consensus.Established += Consensus_Established;
            Blockchain.HeadChanged += Blockchain_HeadChanged;
            Miner.HashRateChanged += Miner_HashRateChanged;

            InitializeComponent();
            nimiq = new Nimiq();
            nimiq.Init();
        }

        private void Miner_HashRateChanged()
        {
            if (label4.InvokeRequired)
                label4.BeginInvoke((MethodInvoker)delegate () { label4.Text = "Mining at "+ nimiq.Miner.HashRate +" H/s on Testnet.";});
            else
                label4.Text = "Mining at " + nimiq.Miner.HashRate + " H/s on Testnet.";
        }

        private void Consensus_Established()
        {
            if (label1.InvokeRequired)
                label1.BeginInvoke((MethodInvoker)delegate () { label1.Text = "Consensus established"; });
            else
                label1.Text = "Consensus established";

            if (label2.InvokeRequired)
                label2.BeginInvoke((MethodInvoker)delegate () { label2.Text = nimiq.Blockchain.Height.ToString(); });
            else
                label2.Text = nimiq.Blockchain.Height.ToString();
        }

        private void Blockchain_HeadChanged()
        {
            if (label2.InvokeRequired)
                label2.BeginInvoke((MethodInvoker)delegate () { label2.Text = nimiq.Blockchain.Height.ToString(); });
            else
                label2.Text = nimiq.Blockchain.Height.ToString();
        }
    }
}
