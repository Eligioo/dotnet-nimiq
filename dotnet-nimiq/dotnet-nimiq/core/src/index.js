const Nimiq = require('../dist/node.js');
const argv = require('minimist')(process.argv.slice(2));

var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var io = require('socket.io').listen(server);

if (!argv.host || !argv.port || !argv.key || !argv.cert) {
    console.log('Usage: node index.js --host=<hostname> --port=<port> --key=<ssl-key> --cert=<ssl-cert> [--wallet-seed=<wallet-seed>] [--miner] [--passive] [--log=LEVEL] [--log-tag=TAG[:LEVEL]]');
    //process.exit();
}

const host = "nimiq.ddns.net";
const port = parseInt(8080);
const miner = argv.miner;
const minerSpeed = argv['miner-speed'] || 75;
const passive = argv.passive;
const key = "C:/Users/stefa/Desktop/nimiq socket & wrapper/certificates/privkey.pem";
const cert = "C:/Users/stefa/Desktop/nimiq socket & wrapper/certificates/cert.pem";
const walletSeed = "a31896cdf481f4b267652c64bdd64c1fe74ea419c242e888a2327b94357c6d9639b70138fefb4d91d94900878f7f1c27044fa9619d673a455985d03e80aad4b495c2d4446e18dfb78b14856473c0604355530ad79e19e021aed0233127e7b4b8" || null;

/*const host = argv.host;
const port = parseInt(argv.port);
const miner = argv.miner;
const minerSpeed = argv['miner-speed'] || 75;
const passive = argv.passive;
const key = argv.key;
const cert = argv.cert;
const walletSeed = argv['wallet-seed'] || null;*/

if (argv['log']) {
    Nimiq.Log.instance.level = argv['log'] === true ? Log.VERBOSE : argv['log'];
}
if (argv['log-tag']) {
    if (!Array.isArray(argv['log-tag'])) {
        argv['log-tag'] = [argv['log-tag']];
    }
    argv['log-tag'].forEach((lt) => {
        const s = lt.split(':');
        Nimiq.Log.instance.setLoggable(s[0], s.length == 1 ? 2 : s[1]);
    });
}

console.log(`Nimiq NodeJS Client starting (host=${host}, port=${port}, miner=${!!miner}, passive=${!!passive})`);

function _balanceChanged(balance) {
    if (!balance) balance = Nimiq.Balance.INITIAL;
    console.log('Balance: ' + Nimiq.Policy.satoshisToCoins(balance.value));
}

// XXX Configure Core.
// TODO Create config/options object and pass to Core.get()/init().
Nimiq.NetworkConfig.configurePeerAddress(host, port);
Nimiq.NetworkConfig.configureSSL(key, cert);

const options = {
    'walletSeed': walletSeed
};

try {
    (new Nimiq.Core(options)).then($ => {
        io.sockets.on('connection', function (socket) {      
            console.log(`Blockchain: height=${$.blockchain.height}, totalWork=${$.blockchain.totalWork}, headHash=${$.blockchain.headHash.toBase64()}`);

            $.blockchain.on('head-changed', (head) => {
                console.log(`Now at block: ${head.height}`);
                io.sockets.emit("HeadChanged", {"height" : head.height});
            })

            if (!passive) {
                $.network.connect();
            }

            if (miner) {
                $.consensus.on('established', () => $.miner.startWork());
                $.consensus.on('lost', () => $.miner.stopWork());
            }

            $.miner.on('hashrate-changed', () => {
                io.sockets.emit("HashRateChanged", {"hashrate" : $.miner.hashrate})
            });

            $.consensus.on('established', () => {
                console.log('Blockchain consensus established');
                $.accounts.getBalance($.wallet.address)
                .then(_balanceChanged)
                .then(io.sockets.emit("Established"))
            });

            $.miner.on('block-mined', (block) => {
                console.log(`Block mined: ${block.header}`);
            });

            $.accounts.on($.wallet.address, (account) => _balanceChanged(account._balance));

            setInterval(function(){
                io.sockets.emit("LifeCheck",
                {
                    "peerCount"             : $.network.peerCount,
                    "peerCountWebSocket"    : $.network.peerCountWebSocket,
                    "peerCountWebRtc"       : $.network.peerCountWebRtc,
                    "bytesReceived"         : $.network.bytesReceived,
                    "bytesSent"             : $.network.bytesSent,
                    "established"           : $.consensus.established,
                    //"head"                  : $.blockchain.head,
                    "headHash"              : $.blockchain.headHash,
                    "totalWork"             : $.blockchain.totalWork,
                    "height"                : $.blockchain.height,
                    //"path"                  : $.blockchain.path,
                    "busy"                  : $.blockchain.busy,
                    "address"               : $.wallet.address,
                    "publicKey"             : $.wallet.publicKey,
                    "working"               : $.miner.working,
                    "addressMiner"          : $.miner.address,
                    "hashrate"              : $.miner.hashrate,
                })
            }, 1000)

        });
    });
} catch (code) {
    switch (code) {
        case Nimiq.Wallet.ERR_INVALID_WALLET_SEED:
            console.log('Invalid wallet seed');
            break;
        default:
            console.log('Nimiq initialization error');
            break;
    }
}

server.listen(6969);
//console.log("Listen at port 6969");