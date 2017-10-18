module.exports = {};
const atob = require('atob');
const btoa = require('btoa');

global.Class = {
    register: clazz => {
        module.exports[clazz.prototype.constructor.name] = clazz;
    }
};

class LogNative {
    constructor() {
        this._global_level = Log.TRACE;
        this._tag_levels = {};
        this._chalk = require('chalk');
    }

    isLoggable(tag, level) {
        if (tag && this._tag_levels[tag]) {
            return this._tag_levels[tag] <= level;
        }
        return this._global_level <= level;
    }

    setLoggable(tag, level) {
        this._tag_levels[tag] = level;
    }

    msg(level, tag, args) {
        if (!this.isLoggable(tag, level)) return;
        if (tag && tag.name) tag = tag.name;
        if (tag) args.unshift(tag + ':');
        let prefix = `[${Log._level_tag(level)} ${new Date().toTimeString().substr(0, 8)}] `;
        const chalk = this._chalk;
        if (level >= Log.ERROR) {
            console.log(prefix + chalk.red(args.join(' ')));
        } else if (level >= Log.WARNING) {
            console.log(prefix + chalk.yellow(args.join(' ')));
        } else if (level >= Log.INFO) {
            console.log(prefix + chalk.cyan(args.join(' ')));
        } else if (level >= Log.DEBUG) {
            console.log(prefix + chalk.magenta(args.join(' ')));
        } else if (level <= Log.TRACE) {
            console.trace(prefix + args.join(' '));
        } else {
            console.log(prefix + args.join(' '));
        }
    }
}
Class.register(LogNative);

class Log {
    static _level_tag(level) {
        switch (level) {
            case Log.TRACE:
                return 'T';
            case Log.VERBOSE:
                return 'V';
            case Log.DEBUG:
                return 'D';
            case Log.INFO:
                return 'I';
            case Log.WARNING:
                return 'W';
            case Log.ERROR:
                return 'E';
            case Log.ASSERT:
                return 'A';
            default:
                return '*';
        }
    }

    static get instance() {
        if (!Log._instance) {
            Log._instance = new Log(new LogNative());
        }
        return Log._instance;
    }

    constructor(native) {
        this._native = native;
    }

    setLoggable(tag, level) {
        this._native.setLoggable(tag, level);
    }

    get level() {
        return this._native._global_level;
    }

    set level(l) {
        this._native._global_level = l;
    }

    msg(level, tag, args) {
        this._native.msg(level, tag, args);
    }

    static d() {
        let tag, args;
        if (arguments.length >= 2) {
            tag = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            tag = undefined;
            args = Array.prototype.slice.call(arguments, 0);
        }
        Log.instance.msg(Log.DEBUG, tag, args);
    }

    static e() {
        let tag, args;
        if (arguments.length >= 2) {
            tag = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            tag = undefined;
            args = Array.prototype.slice.call(arguments, 0);
        }
        Log.instance.msg(Log.ERROR, tag, args);
    }

    static i() {
        let tag, args;
        if (arguments.length >= 2) {
            tag = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            tag = undefined;
            args = Array.prototype.slice.call(arguments, 0);
        }
        Log.instance.msg(Log.INFO, tag, args);
    }

    static v() {
        let tag, args;
        if (arguments.length >= 2) {
            tag = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            tag = undefined;
            args = Array.prototype.slice.call(arguments, 0);
        }
        Log.instance.msg(Log.VERBOSE, tag, args);
    }

    static w() {
        let tag, args;
        if (arguments.length >= 2) {
            tag = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            tag = undefined;
            args = Array.prototype.slice.call(arguments, 0);
        }
        Log.instance.msg(Log.WARNING, tag, args);
    }

    static t() {
        let tag, args;
        if (arguments.length >= 2) {
            tag = arguments[0];
            args = Array.prototype.slice.call(arguments, 1);
        } else {
            tag = undefined;
            args = Array.prototype.slice.call(arguments, 0);
        }
        Log.instance.msg(Log.TRACE, tag, args);
    }
}
Log.TRACE = 1;
Log.VERBOSE = 2;
Log.DEBUG = 3;
Log.INFO = 4;
Log.WARNING = 5;
Log.ERROR = 6;
Log.ASSERT = 7;
Log._instance = null;
Class.register(Log);

class Observable {
    static get WILDCARD() {
        return '*';
    }

    constructor() {
        this._listeners = {};
    }

    on(type, callback) {
        this._listeners[type] = this._listeners[type] || [];
        this._listeners[type].push(callback);
    }

    fire() {
        if (!arguments.length) throw 'Observable.fire() needs type argument';

        // Notify listeners for this event type.
        const type = arguments[0];
        if (this._listeners[type]) {
            const args = Array.prototype.slice.call(arguments, 1);
            for (const listener of this._listeners[type]) {
                listener.apply(null, args);
            }
        }

        // Notify wildcard listeners. Pass event type as first argument
        if (this._listeners[Observable.WILDCARD]) {
            for (const listener of this._listeners[Observable.WILDCARD]) {
                listener.apply(null, arguments);
            }
        }
    }

    bubble() {
        if (arguments.length < 2) throw 'Observable.bubble() needs observable and at least 1 type argument';

        const observable = arguments[0];
        const types = Array.prototype.slice.call(arguments, 1);
        for (const type of types) {
            let callback;
            if (type == Observable.WILDCARD) {
                callback = function() {
                    this.fire.apply(this, arguments);
                };
            } else {
                callback = function() {
                    this.fire.apply(this, [type, ...arguments]);
                };
            }
            observable.on(type, callback.bind(this));
        }
    }
}
Class.register(Observable);

var levelup = require('levelup');

class TypedDB {
    constructor(tableName, type) {
        if (!type || !type.unserialize) throw 'NodeJS TypedDB requires type with .unserialize()';
        this._db = levelup('./database/' + tableName, {
            keyEncoding: 'ascii'
        });
        this._type = type;
    }

    getObject(key) {
        return new Promise((resolve, error) => {
            this._db.get(key, {valueEncoding: 'binary'}, (err, value) => {
                if (err) {
                    resolve(undefined);
                    return;
                }
                const buf = new SerialBuffer(value);
                resolve(this._type.unserialize(buf));
            });
        });
    }

    putObject(key, value) {
        return new Promise((resolve, error) => {
            if (!value.serialize) throw 'NodeJS TypedDB required objects with .serialize()';
            const buf = value.serialize();
            this._db.put(key, buf, {valueEncoding: 'binary'}, err => err ? error(err) : resolve());
        });
    }

    putString(key, value) {
        return new Promise((resolve, error) => {
            this._db.put(key, value, {valueEncoding: 'ascii'}, err => err ? error(err) : resolve());
        });
    }

    getString(key) {
        return new Promise((resolve, error) => {
            this._db.get(key, {valueEncoding: 'ascii'}, (err, value) => {
                if (err) {
                    resolve(undefined);
                    return;
                }
                resolve(value);
            });
        });
    }

    remove(key) {
        return new Promise((resolve, error) => {
            this._db.del(key, err => resolve());
        });
    }

    nativeTransaction() {
        return Promise.resolve(new NativeDBTransaction(this._db));
    }

    transaction() {
        return new TypedDBTransaction(this);
    }
}
Class.register(TypedDB);

class NativeDBTransaction extends Observable {
    constructor(db) {
        super();
        this._batch = db.batch();
    }

    open() {
        // Empty method needed for compatibility.
    }

    putObject(key, value) {
        if (!value.serialize) throw 'NodeJS TypedDB required objects with .serialize()';
        const buf = value.serialize();
        this._batch.put(key, buf, {valueEncoding: 'binary'});
    }

    putString(key, value) {
        this._batch.put(key, value, {valueEncoding: 'ascii'});
    }

    remove(key) {
        this._batch.del(key);
    }

    commit() {
        this._batch.write(err => {
            if (err) {
                this.fire('error', err);
            } else {
                this.fire('complete');
            }
        });
    }

}
Class.register(NativeDBTransaction);

const WebCrypto = require('node-webcrypto-ossl');
global.webcrypto = new WebCrypto({
    directory: 'database/keys'
});

class CryptoLib {
    static get instance() {
        return global.webcrypto.subtle;
    }
}
Class.register(CryptoLib);

// This is just a stub. It does nothing on NodeJS.
class WebRtcConnector extends Observable {
    connect(peerAddress) {
        return false;
    }

    signal(channel, msg) {
        // ignore
    }
}
Class.register(WebRtcConnector);

// XXX Should we do this here or in a higher-level script?
const WebSocket = require('ws');
Class.register(WebSocket);

const https = require('https');
const fs = require('fs');

class WebSocketConnector extends Observable {
    constructor() {
        super();
        const port = NetworkConfig.myPeerAddress().port;
        const sslConfig = NetworkConfig.getSSLConfig();

        const options = {
            key: fs.readFileSync(sslConfig.key),
            cert: fs.readFileSync(sslConfig.cert)
        };

        const httpsServer = https.createServer(options, (req, res) => {
            res.writeHead(200);
            res.end('Nimiq NodeJS Client\n');
        }).listen(port);

        this._wss = new WebSocket.Server({server: httpsServer});
        this._wss.on('connection', ws => this._onConnection(ws));

        this._timers = new Timers();

        Log.d(WebSocketConnector, `WebSocketConnector listening on port ${port}`);
    }

    connect(peerAddress) {
        if (peerAddress.protocol !== Protocol.WS) throw 'Malformed peerAddress';

        const timeoutKey = 'connect_' + peerAddress;
        if (this._timers.timeoutExists(timeoutKey)) {
            Log.w(WebSocketConnector, `Already connecting to ${peerAddress}`);
            return false;
        }

        const ws = new WebSocket(`wss://${peerAddress.host}:${peerAddress.port}`);
        ws.onopen = () => {
            this._timers.clearTimeout(timeoutKey);

            const netAddress = NetAddress.fromIP(ws._socket.remoteAddress);
            const conn = new PeerConnection(ws, Protocol.WS, netAddress, peerAddress);
            this.fire('connection', conn);
        };
        ws.onerror = e => {
            this._timers.clearTimeout(timeoutKey);
            this.fire('error', peerAddress, e);
        };

        this._timers.setTimeout(timeoutKey, () => {
            this._timers.clearTimeout(timeoutKey);

            // We don't want to fire the error event again if the websocket
            // connect fails at a later time.
            ws.onerror = null;

            // If the connection succeeds after we have fired the error event,
            // close it.
            ws.onopen = () => {
                Log.w(WebSocketConnector, `Connection to ${peerAddress} succeeded after timeout - closing it`);
                ws.close();
            };

            this.fire('error', peerAddress);
        }, WebSocketConnector.CONNECT_TIMEOUT);

        return true;
    }

    _onConnection(ws) {
        const netAddress = NetAddress.fromIP(ws._socket.remoteAddress);
        const conn = new PeerConnection(ws, Protocol.WS, netAddress, /*peerAddress*/ null);
        this.fire('connection', conn);
    }
}
WebSocketConnector.CONNECT_TIMEOUT = 1000 * 5; // 5 seconds
Class.register(WebSocketConnector);

class NetworkConfig {
    static myPeerAddress() {
        if (!NetworkConfig._myHost || !NetworkConfig._myPort) {
            throw 'PeerAddress is not configured.';
        }

        return new WsPeerAddress(
            Services.myServices(), Date.now(), NetAddress.UNSPECIFIED,
            NetworkConfig._myHost, NetworkConfig._myPort);
    }

    // Used for filtering peer addresses by protocols.
    static myProtocolMask() {
        return Protocol.WS;
    }

    static canConnect(protocol) {
        return protocol === Protocol.WS;
    }

    static configurePeerAddress(host, port) {
        NetworkConfig._myHost = host;
        NetworkConfig._myPort = port;
    }

    static configureSSL(key, cert) {
        NetworkConfig._myKey = key;
        NetworkConfig._myCert = cert;
    }

    static getSSLConfig() {
        return {
            key : NetworkConfig._myKey,
            cert: NetworkConfig._myCert
        };
    }
}
Class.register(NetworkConfig);

class WindowDetector {
    // Singleton
    static get() {
        if (!WindowDetector._instance) {
            WindowDetector._instance = new WindowDetector();
        }
        return WindowDetector._instance;
    }

    isSingleWindow() {
        return Promise.resolve(true);
    }

    waitForSingleWindow(fnReady, fnWait) {
        setTimeout(fnReady, 1);
    }
}
WindowDetector._instance = null;
Class.register(WindowDetector);

class Services {
    // XXX Temporary stub, needs to be configurable later on.
    static myServices() {
        // Needs to be != 0 in order to be discoverable by peers.
        return Services.DEFAULT;
    }

    // Used for filtering peer addresses by services.
    static myServiceMask() {
        return 0xffffffff;
    }
}
Services.DEFAULT = 1;
Class.register(Services);

class Synchronizer extends Observable {
    constructor() {
        super();
        this._queue = [];
        this._working = false;
    }

    push(fn, resolve, error) {
        this._queue.push({fn: fn, resolve: resolve, error: error});
        if (!this._working) {
            this._doWork();
        }
    }

    async _doWork() {
        this._working = true;
        this.fire('work-start', this);

        while (this._queue.length) {
            const job = this._queue.shift();
            try {
                const result = await job.fn();
                job.resolve(result);
            } catch (e) {
                if (job.error) job.error(e);
            }
        }

        this._working = false;
        this.fire('work-end', this);
    }

    get working() {
        return this._working;
    }
}
Class.register(Synchronizer);

class Timers {
    constructor() {
        this._timeouts = {};
        this._intervals = {};
    }

    setTimeout(key, fn, waitTime) {
        if (this._timeouts[key]) throw 'Duplicate timeout for key ' + key;
        this._timeouts[key] = setTimeout(fn, waitTime);
    }

    clearTimeout(key) {
        clearTimeout(this._timeouts[key]);
        delete this._timeouts[key];
    }

    resetTimeout(key, fn, waitTime) {
        clearTimeout(this._timeouts[key]);
        this._timeouts[key] = setTimeout(fn, waitTime);
    }

    timeoutExists(key) {
        return this._timeouts[key] !== undefined;
    }

    setInterval(key, fn, intervalTime) {
        if (this._intervals[key]) throw 'Duplicate interval for key ' + key;
        this._intervals[key] = setInterval(fn, intervalTime);
    }

    clearInterval(key) {
        clearInterval(this._intervals[key]);
        delete this._intervals[key];
    }

    resetInterval(key, fn, intervalTime) {
        clearInterval(this._intervals[key]);
        this._intervals[key] = setInterval(fn, intervalTime);
    }

    intervalExists(key) {
        return this._intervals[key] !== undefined;
    }

    clearAll() {
        for (const key in this._timeouts) {
            this.clearTimeout(key);
        }
        for (const key in this._intervals) {
            this.clearInterval(key);
        }
    }
}
Class.register(Timers);

class Version {
    static isCompatible(code) {
        return code === Version.CODE;
    }
}
Version.CODE = 1;
Class.register(Version);

class ArrayUtils {
    static randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static subarray(uintarr, begin, end) {
        function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }

        if (begin === undefined) { begin = 0; }
        if (end === undefined) { end = uintarr.byteLength; }

        begin = clamp(begin, 0, uintarr.byteLength);
        end = clamp(end, 0, uintarr.byteLength);

        let len = end - begin;
        if (len < 0) {
            len = 0;
        }

        return new Uint8Array(uintarr.buffer, uintarr.byteOffset + begin, len);
    }
}
Class.register(ArrayUtils);

class HashMap {
    constructor(fnHash) {
        this._map = {};
        this._fnHash = fnHash || HashMap._hash;
    }

    static _hash(o) {
        return o.hashCode ? o.hashCode() : o.toString();
    }

    get(key) {
        return this._map[this._fnHash(key)];
    }

    put(key, value) {
        this._map[this._fnHash(key)] = value;
    }

    remove(key) {
        delete this._map[this._fnHash(key)];
    }

    clear() {
        this._map = {};
    }

    contains(key) {
        return this.get(key) !== undefined;
    }

    keys() {
        return Object.keys(this._map);
    }

    values() {
        return Object.values(this._map);
    }

    get length() {
        // XXX inefficient
        return Object.keys(this._map).length;
    }
}
Class.register(HashMap);

class HashSet {
    constructor(fnHash) {
        this._map = {};
        this._fnHash = fnHash || HashSet._hash;
    }

    static _hash(o) {
        return o.hashCode ? o.hashCode() : o.toString();
    }

    add(value) {
        this._map[this._fnHash(value)] = value;
    }

    get(value) {
        return this._map[this._fnHash(value)];
    }

    remove(value) {
        delete this._map[this._fnHash(value)];
    }

    clear() {
        this._map = {};
    }

    contains(value) {
        return this._map[this._fnHash(value)] !== undefined;
    }

    values() {
        return Object.values(this._map);
    }

    get length() {
        // XXX inefficient
        return Object.keys(this._map).length;
    }
}
Class.register(HashSet);

class Queue {
    constructor(fnHash) {
        this._queue = [];
        this._fnHash = fnHash || Queue._hash;
    }

    static _hash(o) {
        return o.hashCode ? o.hashCode() : o.toString();
    }

    enqueue(value) {
        this._queue.push(value);
    }

    dequeue() {
        return this._queue.shift();
    }

    indexOf(value) {
        for (let i = 0; i <= this._queue.length; ++i) {
            if (this._fnHash(value) === this._fnHash(this._queue[i])) {
                return i;
            }
        }
        return -1;
    }

    remove(value) {
        const index = this.indexOf(value);
        if (index > -1) {
            this._queue.splice(index, 1);
        }
    }

    dequeueUntil(value) {
        const index = this.indexOf(value);
        if (index > -1) {
            return this._queue.splice(0, index + 1);
        }
        return [];
    }

    clear() {
        this._queue = [];
    }

    values() {
        return this._queue;
    }

    get length() {
        return this._queue.length;
    }
}
Class.register(Queue);

class IndexedArray {
    constructor(array, ignoreDuplicates) {
        this._array = array || new Array();
        this._ignoreDuplicates = ignoreDuplicates;

        this._index = {};
        this._buildIndex();

        return new Proxy(this._array, this);
    }

    _buildIndex() {
        for (let i = 0; i < this._array.length; ++i) {
            this._index[this._array[i]] = i;
        }
    }

    get(target, key) {
        if (typeof key == 'symbol') {
            return undefined;
        }

        // Forward index access (e.g. arr[5]) to underlying array.
        if (!isNaN(key)) {
            return target[key];
        }

        // Forward "public" properties of IndexedArray to 'this' (push(), pop() ...).
        if (this[key] && key[0] !== '_') {
            return this[key].bind ? this[key].bind(this) : this[key];
        }

        return undefined;
    }

    // TODO index access set, e.g. arr[5] = 42

    push(value) {
        if (this._index[value] !== undefined) {
            if (!this._ignoreDuplicates) throw 'IndexedArray.push() failed - value ' + value + ' already exists';
            return this._index[value];
        }

        const length = this._array.push(value);
        this._index[value] = length - 1;
        return length;
    }

    pop() {
        const value = this._array.pop();
        delete this._index[value];
        return value;
    }

    remove(value) {
        const index = this._index[value];
        if (index !== undefined) {
            delete this._array[this._index[value]];
            delete this._index[value];
            return index;
        }
        return -1;
    }

    indexOf(value) {
        return this._index[value] >= 0 ? this._index[value] : -1;
    }

    isEmpty() {
        return Object.keys(this._index).length == 0;
    }

    slice(start, end) {
        const arr = this._array.slice(start, end);
        return new IndexedArray(arr, this._ignoreDuplicates);
    }

    get length() {
        return this._array.length;
    }

    get array() {
        return this._array;
    }
}
Class.register(IndexedArray);

class BufferUtils {
    static toAscii(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }

    static fromAscii(string) {
        var buf = new Uint8Array(string.length);
        for (let i = 0; i < string.length; ++i) {
            buf[i] = string.charCodeAt(i);
        }
        return buf;
    }

    static toBase64(buffer) {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    static fromBase64(base64) {
        return new SerialBuffer(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
    }

    static toBase64Url(buffer) {
        return BufferUtils.toBase64(buffer).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '.');
    }

    static fromBase64Url(base64) {
        return new SerialBuffer(Uint8Array.from(atob(base64.replace(/_/g, '/').replace(/-/g, '+').replace(/\./g, '=')), c => c.charCodeAt(0)));
    }

    static toHex(buffer) {
        return Array.prototype.map.call(buffer, x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    static fromHex(hex) {
        if (hex.length % 2 !== 0) return null;
        return new SerialBuffer(Uint8Array.from(hex.match(/.{2}/g), byte => parseInt(byte, 16)));
    }

    static concatTypedArrays(a, b) {
        const c = new (a.constructor)(a.length + b.length);
        c.set(a, 0);
        c.set(b, a.length);
        return c;
    }

    static equals(a, b) {
        if (a.length !== b.length) return false;
        const viewA = new Uint8Array(a);
        const viewB = new Uint8Array(b);
        for (let i = 0; i < a.length; i++) {
            if (viewA[i] !== viewB[i]) return false;
        }
        return true;
    }
}
Class.register(BufferUtils);

class SerialBuffer extends Uint8Array {
    constructor(arg) {
        super(arg);
        this._view = new DataView(this.buffer);
        this._readPos = 0;
        this._writePos = 0;
    }

    subarray(start, end) {
        return ArrayUtils.subarray(this, start, end);
    }

    get readPos() {
        return this._readPos;
    }
    set readPos(value) {
        if (value < 0 || value > this.byteLength) throw `Invalid readPos ${value}`;
        this._readPos = value;
    }

    get writePos() {
        return this._writePos;
    }
    set writePos(value) {
        if (value < 0 || value > this.byteLength) throw `Invalid writePos ${value}`;
        this._writePos = value;
    }

    read(length) {
        const value = this.subarray(this._readPos, this._readPos + length);
        this._readPos += length;
        return value;
    }
    write(array) {
        this.set(array, this._writePos);
        this._writePos += array.byteLength;
    }

    readUint8() {
        return this._view.getUint8(this._readPos++);
    }
    writeUint8(value) {
        this._view.setUint8(this._writePos++, value);
    }

    readUint16() {
        const value = this._view.getUint16(this._readPos);
        this._readPos += 2;
        return value;
    }
    writeUint16(value) {
        this._view.setUint16(this._writePos, value);
        this._writePos += 2;
    }

    readUint32() {
        const value = this._view.getUint32(this._readPos);
        this._readPos += 4;
        return value;
    }
    writeUint32(value) {
        this._view.setUint32(this._writePos, value);
        this._writePos += 4;
    }

    readUint64() {
        const value = this._view.getFloat64(this._readPos);
        if (!NumberUtils.isUint64(value)) throw 'Malformed value';
        this._readPos += 8;
        return value;
    }
    writeUint64(value) {
        if (!NumberUtils.isUint64(value)) throw 'Malformed value';
        this._view.setFloat64(this._writePos, value);
        this._writePos += 8;
    }

    readFloat64() {
        const value = this._view.getFloat64(this._readPos);
        this._readPos += 8;
        return value;

    }
    writeFloat64(value) {
        this._view.setFloat64(this._writePos, value);
        this._writePos += 8;
    }

    readString(length) {
        const bytes = this.read(length);
        return BufferUtils.toAscii(bytes);
    }
    writeString(value, length) {
        if (StringUtils.isMultibyte(value) || value.length !== length) throw 'Malformed value/length';
        const bytes = BufferUtils.fromAscii(value);
        this.write(bytes);
    }

    readPaddedString(length) {
        const bytes = this.read(length);
        let i = 0;
        while (i < length && bytes[i] !== 0x0) i++;
        const view = new Uint8Array(bytes.buffer, bytes.byteOffset, i);
        return BufferUtils.toAscii(view);
    }
    writePaddedString(value, length) {
        if (StringUtils.isMultibyte(value) || value.length > length) throw 'Malformed value/length';
        const bytes = BufferUtils.fromAscii(value);
        this.write(bytes);
        const padding = length - bytes.byteLength;
        this.write(new Uint8Array(padding));
    }

    readVarLengthString() {
        const length = this.readUint8();
        if (this._readPos + length > this.length) throw 'Malformed length';
        const bytes = this.read(length);
        return BufferUtils.toAscii(bytes);
    }
    writeVarLengthString(value) {
        if (StringUtils.isMultibyte(value) || !NumberUtils.isUint8(value.length)) throw 'Malformed value';
        const bytes = BufferUtils.fromAscii(value);
        this.writeUint8(bytes.byteLength);
        this.write(bytes);
    }
}
Class.register(SerialBuffer);

class Crypto {
    static get lib() { return CryptoLib.instance; }

    // Signature implementation using Ed25519 via tweetnacl
    // tweetnacl is rather slow, so not using this for now
    //
    // static get curve() { return require('tweetnacl'); }
    //
    // static get publicKeySize() {
    //     return Crypto.curve.sign.publicKeyLength;
    // }
    //
    // static get publicKeyType() {
    //     return Uint8Array;
    // }
    //
    // static publicKeySerialize(obj) {
    //     return obj;
    // }
    //
    // static publicKeyUnserialize(arr) {
    //     return arr;
    // }
    //
    // static publicKeyDerive(privateKey) {
    //     return Crypto.keyPairPublic(Crypto.keyPairDerive(privateKey));
    // }
    //
    // static get privateKeySize() {
    //     return Crypto.curve.sign.secretKeyLength;
    // }
    //
    // static get privateKeyType() {
    //     return Uint8Array;
    // }
    //
    // static privateKeySerialize(obj) {
    //     return obj;
    // }
    //
    // static privateKeyUnserialize(arr) {
    //     return arr;
    // }
    //
    // static privateKeyGenerate() {
    //     return Crypto.keyPairPrivate(Crypto.keyPairGenerate());
    // }
    //
    // static get keyPairType() {
    //     return Object;
    // }
    //
    // static keyPairGenerate() {
    //     return Crypto.curve.sign.keyPair();
    // }
    //
    // static keyPairDerive(privateKey) {
    //     return Crypto.curve.sign.keyPair.fromSecretKey(privateKey);
    // }
    //
    // static keyPairPrivate(obj) {
    //     return obj.secretKey;
    // }
    //
    // static keyPairPublic(obj) {
    //     return obj.publicKey;
    // }
    //
    // static signatureCreate(privateKey, data) {
    //     return Crypto.curve.sign.detached(data, privateKey);
    // }
    //
    // static signatureVerify(publicKey, data, signature) {
    //     return Crypto.curve.sign.detached.verify(data, signature, publicKey);
    // }
    //
    // static signatureSerialize(obj) {
    //     return obj;
    // }
    //
    // static signatureUnserialize(arr) {
    //     return arr;
    // }
    //
    // static get signatureSize() {
    //     return Crypto.curve.sign.signatureLength;
    // }
    //
    // static get signatureType() {
    //     return Uint8Array;
    // }

    // Signature implementation using P-256/SHA-256 with WebCrypto API
    static get _keyConfig() {
        return {name: 'ECDSA', namedCurve: 'P-256'};
    }

    static get _signConfig() {
        return {name: 'ECDSA', hash: 'SHA-256'};
    }

    static get publicKeySize() {
        return 64;
    }

    static get publicKeyType() {
        return Object;
    }

    static publicKeySerialize(obj) {
        if (obj.raw.length === 64) {
            return obj.raw;
        }  else {
            return obj.raw.slice(1);
        }
    }

    static publicKeyUnserialize(arr) {
        return {raw: arr};
    }

    static async _publicKeyNative(obj) {
        if (!obj._native) {
            let arr;
            if (obj.raw.length === 64) {
                arr = new Uint8Array(65);
                arr[0] = 4;
                arr.set(obj.raw, 1);
            } else {
                arr = obj.raw;
            }
            obj._native = await Crypto.lib.importKey('raw', arr, Crypto._keyConfig, true, ['verify']);
        }
        return obj._native;
    }

    static async publicKeyDerive(privateKey) {
        return Crypto.keyPairPublic(await Crypto.keyPairDerive(privateKey));
    }

    static get privateKeySize() {
        return 96;
    }

    static get privateKeyType() {
        return Object;
    }

    static _jwk_serialize(jwk) {
        const fromUri64 = function (u64) {
            return Array.from(atob(u64.replace(/-/g, '+').replace(/_/g, '/') + '='), c => c.charCodeAt(0));
        };
        return new Uint8Array(fromUri64(jwk.d).concat(fromUri64(jwk.x)).concat(fromUri64(jwk.y)));
    }

    static _jwk_unserialize(arr) {
        const toUri64 = function (arr) {
            return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        };

        return {
            crv: 'P-256',
            d: toUri64(Array.prototype.slice.call(arr, 0, 32)),
            ext: true,
            key_ops: ['sign'],
            kty: 'EC',
            x: toUri64(Array.prototype.slice.call(arr, 32, 64)),
            y: toUri64(Array.prototype.slice.call(arr, 64)),
        };
    }

    static privateKeySerialize(obj) {
        return Crypto._jwk_serialize(obj.jwk);
    }

    static privateKeyUnserialize(arr) {
        return {jwk: Crypto._jwk_unserialize(arr)};
    }

    static async _privateKeyNative(obj) {
        if (!obj._native) {
            obj._native = await Crypto.lib.importKey('jwk', obj.jwk, Crypto._keyConfig, true, ['sign']);
        }
        return obj._native;
    }

    static async privateKeyGenerate() {
        return Crypto.keyPairPrivate(await Crypto.keyPairGenerate());
    }

    static get keyPairType() {
        return Object;
    }

    static async keyPairGenerate() {
        let key = await Crypto.lib.generateKey(Crypto._keyConfig, true, ['sign', 'verify']);
        return {
            secretKey: {
                _native: key.privateKey,
                jwk: await Crypto.lib.exportKey('jwk', key.privateKey)
            },
            publicKey: {
                _native: key.publicKey,
                raw: new Uint8Array(await Crypto.lib.exportKey('raw', key.publicKey)).subarray(1)
            }
        };
    }

    static keyPairDerive(privateKey) {
        return {
            secretKey: privateKey,
            publicKey: Crypto.publicKeyUnserialize(new Uint8Array(Array.prototype.slice.call(Crypto.privateKeySerialize(privateKey), 32)))
        };
    }

    static keyPairPrivate(obj) {
        return obj.secretKey;
    }

    static keyPairPublic(obj) {
        return obj.publicKey;
    }

    static async signatureCreate(privateKey, data) {
        return new Uint8Array(await Crypto.lib.sign(Crypto._signConfig, await Crypto._privateKeyNative(privateKey), data));
    }

    static async signatureVerify(publicKey, data, signature) {
        return Crypto.lib.verify(Crypto._signConfig, await Crypto._publicKeyNative(publicKey), signature, data);
    }

    static signatureSerialize(obj) {
        return obj;
    }

    static signatureUnserialize(arr) {
        return arr;
    }

    static get signatureSize() {
        return 64;
    }

    static get signatureType() {
        return Uint8Array;
    }

    // Light hash implementation using SHA-256 with WebCrypto API and fast-sha256 fallback
    //
    // static get sha256() { return require('fast-sha256'); }
    //
    // static async hashLight(arr) {
    //     if (Crypto.lib) {
    //         return new Uint8Array(await Crypto.lib.digest('SHA-256', arr));
    //     } else {
    //         return new Promise((res) => {
    //             // Performs badly, but better than a dead UI
    //             setTimeout(() => {
    //                 res(new Crypto.sha256.Hash().update(arr).digest());
    //             });
    //         });
    //     }
    // }

    // Light hash implementation using SHA-256 with WebCrypto API
    static async hashLight(arr) {
        return new Uint8Array(await Crypto.lib.digest('SHA-256', arr));
    }

    // Hard hash implementation using double light hash
    //static async hashHard(arr) {
    //    return Crypto.hashLight(await Crypto.hashLight(arr));
    //}

    // Hard hash implementation using light hash
    static async hashHard(arr) {
        if (Crypto.lib._nimiq_callDigestDelayedWhenMining) {
            return await new Promise((resolve, error) => {
                window.setTimeout(() => {
                    Crypto.hashLight(arr).then(resolve);
                });
            });
        } else {
            return Crypto.hashLight(arr);
        }
    }

    static get hashSize() {
        return 32;
    }

    static get hashType() {
        return Uint8Array;
    }
}
Class.register(Crypto);

class CRC32 {
    static _createTable () {
        let b;
        const table = [];

        for (let j = 0; j < 256; ++j) {
            b = j;
            for (let k = 0; k < 8; ++k) {
                b = b & 1 ? CRC32._POLYNOMIAL ^ (b >>> 1) : b >>> 1;
            }
            table[j] = b >>> 0;
        }
        return table;
    }

    static compute(buf) {
        if (!CRC32._table) CRC32._table = CRC32._createTable();
        if (!CRC32._hex_chars) CRC32._hex_chars = '0123456789abcdef'.split('');

        const message = new Uint8Array(buf);
        const initialValue = -1;

        let crc = initialValue;
        let hex = '';

        for (let i = 0; i < message.length; ++i) {
            crc = CRC32._table[(crc ^ message[i]) & 0xFF] ^ (crc >>> 8);
        }
        crc ^= initialValue;

        hex += CRC32._hex_chars[(crc >> 28) & 0x0F] + CRC32._hex_chars[(crc >> 24) & 0x0F] +
            CRC32._hex_chars[(crc >> 20) & 0x0F] + CRC32._hex_chars[(crc >> 16) & 0x0F] +
            CRC32._hex_chars[(crc >> 12) & 0x0F] + CRC32._hex_chars[(crc >> 8) & 0x0F] +
            CRC32._hex_chars[(crc >> 4) & 0x0F] + CRC32._hex_chars[crc & 0x0F];

        return parseInt(hex, 16);
    }
}
CRC32._table = null;
CRC32._hex_chars = null;
CRC32._POLYNOMIAL = 0xEDB88320;
Class.register(CRC32);

class ObjectDB extends TypedDB {
    constructor(tableName, type) {
        super(tableName, type);
    }

    async key(obj) {
        if (obj.hash) return (await obj.hash()).toBase64();
        if (obj.hashCode) return obj.hashCode();
        throw 'ObjectDB requires objects with a .hash() or .hashCode() method';
    }

    async get(key) {
        return await TypedDB.prototype.getObject.call(this, key);
    }

    async put(obj) {
        const key = await this.key(obj);
        await TypedDB.prototype.putObject.call(this, key, obj);
        return key;
    }

    async remove(obj) {
        const key = await this.key(obj);
        await TypedDB.prototype.remove.call(this, key);
        return key;
    }

    async transaction() {
        const tx = await TypedDB.prototype.transaction.call(this);
        const that = this;

        tx.get = key => tx.getObject(key);
        tx.put = async function(obj) {
            const key = await that.key(obj);
            await tx.putObject(key, obj);
            return key;
        };
        const superRemove = tx.remove.bind(tx);
        tx.remove = async function(obj) {
            const key = await that.key(obj);
            await superRemove(key);
            return key;
        };

        return tx;
    }
}
Class.register(ObjectDB);

class TypedDBTransaction {
    constructor(db) {
        this._db = db;
        this._objects = {};
        this._strings = {};
        this._deletions = {};
    }

    commit() {
        return this._db.nativeTransaction().then( tx => new Promise( (resolve, reject) => {
            tx.open();
            tx.on('complete', () => {
                if (this._db.updateCache && this._db.flushCache) {
                    this._db.updateCache(this._objects);
                    this._db.updateCache(this._strings);
                    this._db.flushCache(Object.keys(this._deletions));
                }

                resolve(true);
            });
            tx.on('error', e => reject(e));

            for (const key in this._objects) {
                // FIXME Firefox seems to hang here!!!
                tx.putObject(key, this._objects[key]);
            }

            for (const key in this._strings) {
                tx.putString(key, this._strings[key]);
            }

            for (const key in this._deletions) {
                tx.remove(key);
            }

            tx.commit();
        }));
    }

    async getObject(key) {
        if (this._deletions[key]) return undefined;
        if (this._objects[key] !== undefined) return this._objects[key];
        return this._db.getObject(key);
    }

    putObject(key, value) {
        this._objects[key] = value;
        delete this._deletions[key];
    }

    async getString(key) {
        if (this._deletions[key]) return undefined;
        if (this._strings[key] !== undefined) return this._strings[key];
        return this._db.getString(key);
    }

    putString(key, value) {
        this._strings[key] = value;
        delete this._deletions[key];
    }

    remove(key) {
        this._deletions[key] = true;
        delete this._objects[key];
        delete this._strings[key];
    }
}
Class.register(TypedDBTransaction);

class NumberUtils {
    static isUint8(val) {
        return Number.isInteger(val)
            && val >= 0 && val <= NumberUtils.UINT8_MAX;
    }

    static isUint16(val) {
        return Number.isInteger(val)
            && val >= 0 && val <= NumberUtils.UINT16_MAX;
    }

    static isUint32(val) {
        return Number.isInteger(val)
            && val >= 0 && val <= NumberUtils.UINT32_MAX;
    }

    static isUint64(val) {
        return Number.isInteger(val)
            && val >= 0 && val <= NumberUtils.UINT64_MAX;
    }

    static randomUint32() {
        return Math.floor(Math.random() * (NumberUtils.UINT32_MAX + 1));
    }

    static randomUint64() {
        return Math.floor(Math.random() * (NumberUtils.UINT64_MAX + 1));
    }
}

NumberUtils.UINT8_MAX = 255;
NumberUtils.UINT16_MAX = 65535;
NumberUtils.UINT32_MAX = 4294967295;
NumberUtils.UINT64_MAX = Number.MAX_SAFE_INTEGER;
//Object.freeze(NumberUtils);
Class.register(NumberUtils);

class PlatformUtils {
    static isBrowser() {
        return typeof window !== "undefined";
    }

    static supportsWebRTC() {
        return PlatformUtils.isBrowser() && !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);
    }
}
Class.register(PlatformUtils);

class StringUtils {
    static isMultibyte(str) {
        return /[\uD800-\uDFFF]/.test(str);
    }
}
Class.register(StringUtils);

class Policy {
    static get SATOSHIS_PER_COIN() {
        return 1e8;
    }

    static get BLOCK_TIME() {
        return 60; // Seconds
    }

    static get BLOCK_REWARD() {
        return Policy.coinsToSatoshis(50);
    }

    static get BLOCK_SIZE_MAX() {
        return 1e6; // 1 MB
    }

    static get BLOCK_TARGET_MAX() {
        return BlockUtils.compactToTarget(0x1f00ffff); // 16 zero bits, bitcoin uses 32 (0x1d00ffff)
    }

    static get DIFFICULTY_ADJUSTMENT_BLOCKS() {
        return 10; // Blocks
    }

    static coinsToSatoshis(coins) {
        return Math.round(coins * Policy.SATOSHIS_PER_COIN);
    }

    static satoshisToCoins(satoshis) {
        return satoshis / Policy.SATOSHIS_PER_COIN;
    }
}
Class.register(Policy);

class Primitive {
    constructor(arg, type, length) {
        if (type && !(arg instanceof type)) throw 'Primitive: Invalid type';
        if (length && arg.length && arg.length !== length) throw 'Primitive: Invalid length';
        this._obj = arg;
    }

    equals(o) {
        return o instanceof Primitive && BufferUtils.equals(this.serialize(), o.serialize());
    }

    serialize() {
        throw 'Primitive: serialize() not implemented';
    }

    toString() {
        return this.toBase64();
    }

    toBase64() {
        return BufferUtils.toBase64(this.serialize());
    }

    toHex() {
        return BufferUtils.toHex(this.serialize());
    }
}
Class.register(Primitive);

class Hash extends Primitive {
    constructor(arg) {
        if (arg === null) {
            arg = new Uint8Array(Crypto.hashSize);
        }
        super(arg, Crypto.hashType, Crypto.hashSize);
    }

    static async light(arr) {
        return new Hash(await Crypto.hashLight(arr));
    }

    static async hard(arr) {
        return new Hash(await Crypto.hashHard(arr));
    }

    static unserialize(buf) {
        return new Hash(buf.read(Crypto.hashSize));
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.write(this._obj);
        return buf;
    }

    subarray(begin, end) {
        return this._obj.subarray(begin, end);
    }

    get serializedSize() {
        return Crypto.hashSize;
    }

    equals(o) {
        return o instanceof Hash && super.equals(o);
    }

    static fromBase64(base64) {
        return new Hash(BufferUtils.fromBase64(base64));
    }

    static fromHex(hex) {
        return new Hash(BufferUtils.fromHex(hex));
    }

    static isHash(o) {
        return o instanceof Hash;
    }
}
Class.register(Hash);

class PrivateKey extends Primitive {
    constructor(arg) {
        super(arg, Crypto.privateKeyType, Crypto.privateKeySize);
    }

    static async generate() {
        return new PrivateKey(await Crypto.privateKeyGenerate());
    }

    static unserialize(buf) {
        return new PrivateKey(Crypto.privateKeyUnserialize(buf.read(Crypto.privateKeySize)));
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.write(Crypto.privateKeySerialize(this._obj));
        return buf;
    }

    get serializedSize() {
        return Crypto.privateKeySize;
    }

    equals(o) {
        return o instanceof PrivateKey && super.equals(o);
    }
}

Class.register(PrivateKey);

class PublicKey extends Primitive {
    constructor(arg) {
        super(arg, Crypto.publicKeyType, Crypto.publicKeySize);
    }

    static async derive(privateKey) {
        return new PublicKey(await Crypto.publicKeyDerive(privateKey._obj));
    }

    static unserialize(buf) {
        return new PublicKey(Crypto.publicKeyUnserialize(buf.read(Crypto.publicKeySize)));
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.write(Crypto.publicKeySerialize(this._obj));
        return buf;
    }

    get serializedSize() {
        return Crypto.publicKeySize;
    }

    equals(o) {
        return o instanceof PublicKey && super.equals(o);
    }

    async toAddress() {
        return new Address((await Hash.light(this.serialize())).subarray(0, 20));
    }
}
Class.register(PublicKey);

class KeyPair extends Primitive {
    constructor(arg) {
        super(arg, Crypto.keyPairType);
    }

    static async generate() {
        return new KeyPair(await Crypto.keyPairGenerate());
    }

    static async derive(privateKey) {
        return new KeyPair(await Crypto.keyPairDerive(privateKey._obj));
    }

    static unserialize(buf) {
        return new KeyPair(Crypto.keyPairDerive(Crypto.privateKeyUnserialize(buf.read(Crypto.privateKeySize))));
    }

    static fromHex(hexBuf) {
        return this.unserialize(BufferUtils.fromHex(hexBuf));
    }

    serialize(buf) {
        return this.privateKey.serialize(buf);
    }

    get privateKey() {
        return this._privateKey || (this._privateKey = new PrivateKey(Crypto.keyPairPrivate(this._obj)));
    }

    get publicKey() {
        return this._publicKey || (this._publicKey = new PublicKey(Crypto.keyPairPublic(this._obj)));
    }

    get serializedSize() {
        return this.privateKey.serializedSize;
    }

    equals(o) {
        return o instanceof KeyPair && super.equals(o);
    }
}

Class.register(KeyPair);

class Signature extends Primitive {
    constructor(arg) {
        super(arg, Crypto.signatureType, Crypto.signatureSize);
    }

    static async create(privateKey, data) {
        return new Signature(await Crypto.signatureCreate(privateKey._obj, data));
    }

    static unserialize(buf) {
        return new Signature(Crypto.signatureUnserialize(buf.read(Crypto.signatureSize)));
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.write(Crypto.signatureSerialize(this._obj));
        return buf;
    }

    get serializedSize() {
        return Crypto.signatureSize;
    }

    verify(publicKey, data) {
        return Crypto.signatureVerify(publicKey._obj, data, this._obj);
    }

    equals(o) {
        return o instanceof Signature && super.equals(o);
    }
}
Class.register(Signature);

class Address extends Primitive {
    static get SERIALIZED_SIZE() {
        return 20;
    }

    constructor(arg) {
        super(arg, Uint8Array, Address.SERIALIZED_SIZE);
    }

    static unserialize(buf) {
        return new Address(buf.read(Address.SERIALIZED_SIZE));
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.write(this._obj);
        return buf;
    }

    subarray(begin, end) {
        return this._obj.subarray(begin, end);
    }

    get serializedSize() {
        return Address.SERIALIZED_SIZE;
    }

    equals(o) {
        return o instanceof Address
            && super.equals(o);
    }

    static fromBase64(base64) {
        return new Address(BufferUtils.fromBase64(base64));
    }

    static fromHex(hex) {
        return new Address(BufferUtils.fromHex(hex));
    }
}
Class.register(Address);

class Balance {
    constructor(value = 0, nonce = 0) {
        if (!NumberUtils.isUint64(value)) throw 'Malformed value';
        if (!NumberUtils.isUint32(nonce)) throw 'Malformed nonce';

        this._value = value;
        this._nonce = nonce;
    }

    static unserialize(buf) {
        let value = buf.readUint64();
        let nonce = buf.readUint32();
        return new Balance(value, nonce);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeUint64(this._value);
        buf.writeUint32(this._nonce);
        return buf;
    }

    get serializedSize() {
        return /*value*/ 8
            + /*nonce*/ 4;
    }

    get value() {
        return this._value;
    }

    get nonce() {
        return this._nonce;
    }

    equals(o) {
        return o instanceof Balance
            && this._value === o.value
            && this._nonce === o.nonce;
    }
}
Balance.INITIAL = new Balance();
Class.register(Balance);

class Account {
    constructor(balance) {
        if (!balance || !(balance instanceof Balance)) throw 'Malformed balance';
        this._balance = balance;
    }

    static unserialize(buf) {
        // We currently only support one account type: Basic.
        const type = buf.readUint8();
        if (type !== Account.Type.BASIC) throw 'Malformed account type';

        const balance = Balance.unserialize(buf);
        return new Account(balance);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeUint8(Account.Type.BASIC);
        this._balance.serialize(buf);
        return buf;
    }

    get serializedSize() {
        return /*type*/ 1
            + this._balance.serializedSize;
    }

    equals(o) {
        return o instanceof Account
            && this._balance.equals(o.balance);
    }

    toString() {
        return `BasicAccount{value=${this._balance.value}, nonce=${this._balance.nonce}}`;
    }

    get balance() {
        return this._balance;
    }
}
Account.INITIAL = new Account(Balance.INITIAL);
Account.Type = {};
Account.Type.BASIC = 0;
Class.register(Account);

class AccountsTreeNode {
    static terminalNode(prefix, account) {
        return new AccountsTreeNode(AccountsTreeNode.TERMINAL, prefix, account);
    }

    static branchNode(prefix, children) {
        return new AccountsTreeNode(AccountsTreeNode.BRANCH, prefix, children);
    }

    constructor(type, prefix = '', arg) {
        this._type = type;
        this._prefix = prefix;
        if (this.isBranch()) {
            this._children = arg;
        } else if (this.isTerminal()){
            this._account = arg;
        } else {
            throw `Invalid AccountsTreeNode type: ${type}`;
        }
    }

    static isTerminalType(type) {
        return type === AccountsTreeNode.TERMINAL;
    }

    static isBranchType(type) {
        return type === AccountsTreeNode.BRANCH;
    }


    static unserialize(buf) {
        const type = buf.readUint8();
        const prefix = buf.readVarLengthString();

        if (AccountsTreeNode.isTerminalType(type)) {
            // Terminal node
            const account = Account.unserialize(buf);
            return AccountsTreeNode.terminalNode(prefix, account);
        } else if (AccountsTreeNode.isBranchType(type)) {
            // Branch node
            const children = [];
            const childCount = buf.readUint8();
            for (let i = 0; i < childCount; ++i) {
                const childIndex = buf.readUint8();
                const child = BufferUtils.toBase64(buf.read(/*keySize*/ 32));
                children[childIndex] = child;
            }
            return AccountsTreeNode.branchNode(prefix, children);
        } else {
            throw `Invalid AccountsTreeNode type: ${type}`;
        }
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeUint8(this._type);
        buf.writeVarLengthString(this._prefix);

        if (this.isTerminal()) {
            // Terminal node
            this._account.serialize(buf);
        } else {
            // Branch node
            const childCount = this._children.reduce((count, val) => count + !!val, 0);
            buf.writeUint8(childCount);
            for (let i = 0; i < this._children.length; ++i) {
                if (this._children[i]) {
                    buf.writeUint8(i);
                    buf.write(BufferUtils.fromBase64(this._children[i]));
                }
            }
        }
        return buf;
    }

    get serializedSize() {
        let payloadSize;
        if (this.isTerminal()) {
            payloadSize = this._account.serializedSize;
        } else {
            // The children array contains undefined values for non existing children.
            // Only count existing ones.
            const childrenSize = this._children.reduce((count, val) => count + !!val, 0)
                * (/*keySize*/ 32 + /*childIndex*/ 1);
            payloadSize = /*childCount*/ 1 + childrenSize;
        }

        return /*type*/ 1
            + /*extra byte varLengthString prefix*/ 1
            + this._prefix.length
            + payloadSize;
    }

    getChild(prefix) {
        return this._children && this._children[this._getChildIndex(prefix)];
    }

    withChild(prefix, child) {
        let children = this._children.slice() || [];
        children[this._getChildIndex(prefix)] = child;
        return AccountsTreeNode.branchNode(this._prefix, children);
    }

    withoutChild(prefix) {
        let children = this._children.slice() || [];
        delete children[this._getChildIndex(prefix)];
        return AccountsTreeNode.branchNode(this._prefix, children);
    }

    hasChildren() {
        return this._children && this._children.some(child => !!child);
    }

    hasSingleChild() {
        return this._children && this._children.reduce((count, val) => count + !!val, 0) === 1;
    }

    getFirstChild() {
        if (!this._children) {
            return undefined;
        }
        return this._children.find(child => !!child);
    }

    getChildren() {
        if (!this._children) {
            return undefined;
        }
        return this._children.filter(child => !!child);
    }

    get account() {
        return this._account;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
        this._hash = undefined;
    }

    withAccount(account) {
        return AccountsTreeNode.terminalNode(this._prefix, account);
    }

    async hash() {
        if (!this._hash) {
            this._hash = await Hash.light(this.serialize());
        }
        return this._hash;
    }

    isTerminal() {
        return AccountsTreeNode.isTerminalType(this._type);
    }

    isBranch() {
        return AccountsTreeNode.isBranchType(this._type);
    }

    _getChildIndex(prefix) {
        return parseInt(prefix[0], 16);
    }

    equals(o) {
        if (!(o instanceof AccountsTreeNode)) return false;
        if (!Object.is(this.prefix, o.prefix)) return false;
        if (this.isTerminal()) {
            return o.isTerminal() && o._account.equals(this._account);
        } else {
            if (!o.isBranch()) return false;
            for (let i = 0; i < this._children.length; ++i) {
                // hashes of child nodes
                const ourChild = this._children[i];
                const otherChild = o._children[i];
                if (ourChild) {
                    if (!otherChild || !Object.is(ourChild, otherChild)) return false;
                } else {
                    if (otherChild) return false;
                }
            }
        }
        return true;
    }
}
AccountsTreeNode.BRANCH = 0x00;
AccountsTreeNode.TERMINAL = 0xff;
Class.register(AccountsTreeNode);

class AccountsTreeStore {
    static getPersistent() {
        return new PersistentAccountsTreeStore();
    }

    static createVolatile() {
        return new VolatileAccountsTreeStore();
    }

    static createTemporary(backend, transaction = false) {
        return new TemporaryAccountsTreeStore(backend, transaction);
    }
}
Class.register(AccountsTreeStore);

class PersistentAccountsTreeStore extends ObjectDB {
    constructor() {
        super('accounts', AccountsTreeNode);
    }

    async getRootKey() {
        return await ObjectDB.prototype.getString.call(this, 'root');
    }

    async setRootKey(rootKey) {
        return await ObjectDB.prototype.putString.call(this, 'root', rootKey);
    }

    async transaction() {
        const tx = await ObjectDB.prototype.transaction.call(this);
        tx.getRootKey = function (rootKey) {
            return tx.getString('root');
        };
        tx.setRootKey = function (rootKey) {
            return tx.putString('root', rootKey);
        };
        return tx;
    }
}

class VolatileAccountsTreeStore {
    constructor() {
        this._store = {};
        this._rootKey = undefined;
    }

    async key(node) {
        return (await node.hash()).toBase64();
    }

    get(key) {
        return this._store[key];
    }

    async put(node) {
        const key = await this.key(node);
        this._store[key] = node;
        return key;
    }

    async remove(node) {
        const key = await this.key(node);
        delete this._store[key];
        return key;
    }

    transaction() {
        return new TemporaryAccountsTreeStore(this, true);
    }

    getRootKey() {
        return this._rootKey;
    }

    setRootKey(rootKey) {
        this._rootKey = rootKey;
    }
}

class TemporaryAccountsTreeStore {
    constructor(backend, transaction = false) {
        this._backend = backend;
        this._store = {};
        this._removed = {};
        this._transaction = transaction;
    }

    async key(node) {
        return (await node.hash()).toBase64();
    }

    async get(key) {
        // First try to find the key in our local store.
        if (this._store[key] === undefined) {
            // If it is not in there, get it from our backend.
            const node = await this._backend.get(key);
            // Undefined values in the backend are cached by null.
            // However to be consistent with the other implementations,
            // we return undefined.
            if (!node) {
                this._store[key] = null;
                return undefined;
            }
            // Assignment is intended! Cache value.
            // unserialize(serialize) copies node.
            return this._store[key] = AccountsTreeNode.unserialize(node.serialize());
        }
        return this._store[key] === null ? undefined : this._store[key];
    }

    async put(node) {
        const key = await this.key(node);
        this._store[key] = node;
        return key;
    }

    async remove(node) {
        const key = await this.key(node);
        this._removed[key] = node;
        this._store[key] = null;
        return key;
    }

    async commit() {
        if (!this._transaction) return;
        // Update backend with all our changes.
        // We also update cached values to ensure a consistent state with our view.
        let tx = this._backend;
        if (tx.transaction) {
            let txx = await tx.transaction();
            if (!(txx instanceof TemporaryAccountsTreeStore)) {
                tx = txx;
            }
        }
        for (let key of Object.keys(this._store)) {
            if (this._store[key] === null) {
                await tx.remove(this._removed[key]); // eslint-disable-line no-await-in-loop
            } else {
                await tx.put(this._store[key]); // eslint-disable-line no-await-in-loop
            }
        }
        if (this._rootKey !== undefined) {
            await tx.setRootKey(this._rootKey);
        }
        if (tx.commit) await tx.commit();
        this._rootKey = null;
        this._removed = {};
        this._store = {};
    }

    transaction() {
        return new TemporaryAccountsTreeStore(this, true);
    }

    async getRootKey() {
        if (this._rootKey === undefined) {
            this._rootKey = (await this._backend.getRootKey()) || null;
        }
        return this._rootKey === null ? undefined : this._rootKey;
    }

    setRootKey(rootKey) {
        this._rootKey = rootKey;
    }
}

class AccountsTree extends Observable {
    static getPersistent() {
        const store = AccountsTreeStore.getPersistent();
        return new AccountsTree(store);
    }

    static createVolatile() {
        const store = AccountsTreeStore.createVolatile();
        return new AccountsTree(store);
    }

    static createTemporary(backend) {
        const store = AccountsTreeStore.createTemporary(backend._store);
        return new AccountsTree(store);
    }

    constructor(treeStore) {
        super();
        this._store = treeStore;
        this._synchronizer = new Synchronizer();

        // Initialize root node.
        return this._initRoot();
    }

    async _initRoot() {
        let rootKey = await this._store.getRootKey();
        if (!rootKey) {
            const rootNode = AccountsTreeNode.branchNode(/*prefix*/ '', /*children*/ []);
            rootKey = await this._store.put(rootNode);
            await this._store.setRootKey(rootKey);
        }
        return this;
    }

    put(address, account, transaction) {
        return new Promise((resolve, error) => {
            this._synchronizer.push(() => {
                return this._put(address, account, transaction);
            }, resolve, error);
        });
    }

    async _put(address, account, transaction) {
        transaction = transaction || this._store;

        if (!(await this.get(address, transaction)) && Account.INITIAL.equals(account)) {
            return;
        }

        // Fetch the root node. This should never fail.
        const rootKey = await transaction.getRootKey();
        const rootNode = await transaction.get(rootKey);

        // Insert account into the tree at address.
        const prefix = address.toHex();
        await this._insert(transaction, rootNode, prefix, account, []);

        // Tell listeners that the account at address has changed.
        this.fire(address, account, address);
    }

    async _insert(transaction, node, prefix, account, rootPath) {
        // Find common prefix between node and new address.
        const commonPrefix = AccountsTree._commonPrefix(node.prefix, prefix);

        // Cut common prefix off the new address.
        prefix = prefix.substr(commonPrefix.length);

        // If the node prefix does not fully match the new address, split the node.
        if (commonPrefix.length !== node.prefix.length) {
            // Cut the common prefix off the existing node.
            await transaction.remove(node);
            node.prefix = node.prefix.substr(commonPrefix.length);
            const nodeKey = await transaction.put(node);

            // Insert the new account node.
            const newChild = AccountsTreeNode.terminalNode(prefix, account);
            const newChildKey = await transaction.put(newChild);

            // Insert the new parent node.
            const newParent = AccountsTreeNode.branchNode(commonPrefix, [])
                .withChild(node.prefix, nodeKey)
                .withChild(newChild.prefix, newChildKey);
            const newParentKey = await transaction.put(newParent);

            return this._updateKeys(transaction, newParent.prefix, newParentKey, rootPath);
        }

        // If the remaining address is empty, we have found an (existing) node
        // with the given address. Update the account.
        if (!prefix.length) {
            // Delete the existing node.
            await transaction.remove(node);

            // XXX How does this generalize to more than one account type?
            // Special case: If the new balance is the initial balance
            // (i.e. balance=0, nonce=0), it is like the account never existed
            // in the first place. Delete the node in this case.
            if (Account.INITIAL.equals(account)) {
                // We have already deleted the node, remove the subtree it was on.
                return this._prune(transaction, node.prefix, rootPath);
            }

            // Update the account.
            node = node.withAccount(account);
            const nodeKey = await transaction.put(node);

            return this._updateKeys(transaction, node.prefix, nodeKey, rootPath);
        }

        // If the node prefix matches and there are address bytes left, descend into
        // the matching child node if one exists.
        const childKey = node.getChild(prefix);
        if (childKey) {
            const childNode = await transaction.get(childKey);
            rootPath.push(node);
            return this._insert(transaction, childNode, prefix, account, rootPath);
        }

        // If no matching child exists, add a new child account node to the current node.
        const newChild = AccountsTreeNode.terminalNode(prefix, account);
        const newChildKey = await transaction.put(newChild);

        await transaction.remove(node);
        node = node.withChild(newChild.prefix, newChildKey);
        const nodeKey = await transaction.put(node);

        return this._updateKeys(transaction, node.prefix, nodeKey, rootPath);
    }

    async _prune(transaction, prefix, rootPath) {
        const rootKey = await transaction.getRootKey();

        // Walk along the rootPath towards the root node starting with the
        // immediate predecessor of the node specified by 'prefix'.
        let i = rootPath.length - 1;
        for (; i >= 0; --i) {
            let node = rootPath[i];
            let nodeKey = await transaction.remove(node); // eslint-disable-line no-await-in-loop

            node = node.withoutChild(prefix);

            // If the node has only a single child, merge it with the next node.
            if (node.hasSingleChild() && nodeKey !== rootKey) {
                const childKey = node.getFirstChild();
                const childNode = await transaction.get(childKey); // eslint-disable-line no-await-in-loop

                // Remove the current child node.
                await transaction.remove(childNode); // eslint-disable-line no-await-in-loop

                // Merge prefixes.
                childNode.prefix = node.prefix + childNode.prefix;

                nodeKey = await transaction.put(childNode); // eslint-disable-line no-await-in-loop
                return this._updateKeys(transaction, childNode.prefix, nodeKey, rootPath.slice(0, i));
            }
            // Otherwise, if the node has children left, update it and all keys on the
            // remaining root path. Pruning finished.
            // XXX Special case: We start with an empty root node. Don't delete it.
            else if (node.hasChildren() || nodeKey === rootKey) {
                nodeKey = await transaction.put(node); // eslint-disable-line no-await-in-loop
                return this._updateKeys(transaction, node.prefix, nodeKey, rootPath.slice(0, i));
            }

            // The node has no children left, continue pruning.
            prefix = node.prefix;
        }

        // XXX This should never be reached.
        return undefined;
    }

    async _updateKeys(transaction, prefix, nodeKey, rootPath) {
        // Walk along the rootPath towards the root node starting with the
        // immediate predecessor of the node specified by 'prefix'.
        let i = rootPath.length - 1;
        for (; i >= 0; --i) {
            let node = rootPath[i];
            await transaction.remove(node); // eslint-disable-line no-await-in-loop

            node = node.withChild(prefix, nodeKey);

            nodeKey = await transaction.put(node); // eslint-disable-line no-await-in-loop
            prefix = node.prefix;
        }

        await transaction.setRootKey(nodeKey);
        return nodeKey;
    }

    async get(address, transaction) {
        transaction = transaction || this._store;

        // Fetch the root node. This should never fail.
        const rootKey = await transaction.getRootKey();
        const rootNode = await transaction.get(rootKey);

        const prefix = address.toHex();
        return this._retrieve(transaction, rootNode, prefix);
    }

    async _retrieve(transaction, node, prefix) {
        // Find common prefix between node and requested address.
        const commonPrefix = AccountsTree._commonPrefix(node.prefix, prefix);

        // If the prefix does not fully match, the requested address is not part
        // of this node.
        if (commonPrefix.length !== node.prefix.length) return false;

        // Cut common prefix off the new address.
        prefix = prefix.substr(commonPrefix.length);

        // If the remaining address is empty, we have found the requested node.
        if (!prefix.length) return node.account;

        // Descend into the matching child node if one exists.
        const childKey = node.getChild(prefix);
        if (childKey) {
            const childNode = await transaction.get(childKey);
            return this._retrieve(transaction, childNode, prefix);
        }

        // No matching child exists, the requested address is not part of this node.
        return false;
    }

    async populate(nodes, transaction) {
        transaction = transaction || this._store;

        const rootNode = nodes[0];
        const rootKey = (await rootNode.hash()).toBase64();

        for (const node of nodes) {
            await transaction.put(node);
        }

        await transaction.setRootKey(rootKey);
    }

    async verify(transaction) {
        transaction = transaction || this._store;

        // Fetch the root node. This should never fail.
        const rootKey = await transaction.getRootKey();
        const rootNode = await transaction.get(rootKey);
        return this._verify(rootNode, transaction);
    }

    async _verify(node, transaction) {
        if (!node) return true;
        transaction = transaction || this._store;

        // well-formed node type
        if (!node.isBranch() && !node.isTerminal()) {
            Log.e(`Unrecognized node type ${node._type}`);
            return false;
        }

        if (node.hasChildren()) {
            for (let i = 0; i < 16; i++) {
                const nibble = i.toString(16);
                const subhash = node.getChild(nibble);
                if (!subhash) continue;
                const subnode = await transaction.get(subhash);

                // no dangling references
                if (!subnode) {
                    Log.e(`No subnode for hash ${subhash}`);
                    return false;
                }

                // no verification fails in the subnode
                if (!(await this._verify(subnode, transaction))) {
                    Log.e(`Verification of child ${i} failed`);
                    return false;
                }

                // position in children list is correct
                if (!subnode.prefix[0] === nibble) {
                    Log.e(`First nibble of child node does not match its position in the parent branch node: 
                    ${subnode.prefix[0]} vs ${nibble}`);
                    return false;
                }
            }
        }
        return true;
    }

    async clear() {
        const rootKey = await this._store.getRootKey();
        return this._clear(rootKey);
    }

    async _clear(nodeKey) {
        const node = await this._store.get(nodeKey);
        if (!node) return;
        await this._store.remove(node);

        if (node.hasChildren()) {
            for (const childNodeKey of node.getChildren()) {
                await this._clear(childNodeKey);
            }
        }
    }

    async export() {
        const rootKey = await this._store.getRootKey();

        const nodes = [];
        await this._export(rootKey, nodes);
        return nodes;
    }

    async _export(nodeKey, arr) {
        const node = await this._store.get(nodeKey);

        arr.push(BufferUtils.toBase64(node.serialize()));

        if (node.hasChildren()) {
            for (const childNodeKey of node.getChildren()) {
                await this._export(childNodeKey, arr);
            }
        }
    }

    async transaction() {
        // FIXME Firefox apparently has problems with transactions!
        // const tx = await this._store.transaction();
        const tx = await AccountsTreeStore.createTemporary(this._store, true);
        const that = this;
        return {
            get: function (address) {
                return that.get(address, tx);
            },

            put: function (address, account) {
                return that.put(address, account, tx);
            },

            commit: function () {
                return tx.commit();
            },

            root: async function () {
                return Hash.fromBase64(await tx.getRootKey());
            }
        };
    }

    static _commonPrefix(prefix1, prefix2) {
        let i = 0;
        for (; i < prefix1.length; ++i) {
            if (prefix1[i] !== prefix2[i]) break;
        }
        return prefix1.substr(0, i);
    }

    async root() {
        const rootKey = await this._store.getRootKey();
        return Hash.fromBase64(rootKey);
    }
}
Class.register(AccountsTree);



class Accounts extends Observable {
    static async getPersistent() {
        const tree = await AccountsTree.getPersistent();
        return new Accounts(tree);
    }

    static async createVolatile() {
        const tree = await AccountsTree.createVolatile();
        return new Accounts(tree);
    }

    static async createTemporary(backend) {
        const tree = await AccountsTree.createTemporary(backend._tree);
        return new Accounts(tree);
    }

    constructor(accountsTree) {
        super();
        this._tree = accountsTree;

        // Forward balance change events to listeners registered on this Observable.
        this.bubble(this._tree, '*');
    }

    async populate(nodes) {
        // To make sure we have a single transaction, we use a Temporary Tree during populate and commit that.
        const treeTx = await AccountsTreeStore.createTemporary(this._tree._store, true);
        await this._tree.populate(nodes, treeTx);
        if (await this._tree.verify(treeTx)) {
            await treeTx.commit();
            this.fire('populated');
            return true;
        } else {
            return false;
        }
    }

    clear() {
        return this._tree.clear();
    }

    async commitBlock(block) {
        // TODO we should validate if the block is going to be applied correctly.

        const treeTx = await this._tree.transaction();
        await this._execute(treeTx, block.body, (a, b) => a + b);

        const hash = await treeTx.root();
        if (!block.accountsHash.equals(hash)) throw 'AccountsHash mismatch';
        return treeTx.commit();
    }

    async commitBlockBody(body) {
        const treeTx = await this._tree.transaction();
        await this._execute(treeTx, body, (a, b) => a + b);
        return treeTx.commit();
    }

    async revertBlock(block) {
        return this.revertBlockBody(block.body);
    }

    async revertBlockBody(body) {
        const treeTx = await this._tree.transaction();
        await this._execute(treeTx, body, (a, b) => a - b);
        return treeTx.commit();
    }

    // We only support basic accounts at this time.
    async getBalance(address, treeTx = this._tree) {
        const account = await treeTx.get(address);
        if (account) {
            return account.balance;
        } else {
            return Account.INITIAL.balance;
        }
    }

    async _execute(treeTx, body, operator) {
        await this._executeTransactions(treeTx, body, operator);
        await this._rewardMiner(treeTx, body, operator);
    }

    async _rewardMiner(treeTx, body, op) {
        // Sum up transaction fees.
        const txFees = body.transactions.reduce((sum, tx) => sum + tx.fee, 0);
        await this._updateBalance(treeTx, body.minerAddr, txFees + Policy.BLOCK_REWARD, op);
    }

    async _executeTransactions(treeTx, body, op) {
        for (const tx of body.transactions) {
            await this._executeTransaction(treeTx, tx, op); // eslint-disable-line no-await-in-loop
        }
    }

    async _executeTransaction(treeTx, tx, op) {
        await this._updateSender(treeTx, tx, op);
        await this._updateRecipient(treeTx, tx, op);
    }

    async _updateSender(treeTx, tx, op) {
        const addr = await tx.getSenderAddr();
        await this._updateBalance(treeTx, addr, -tx.value - tx.fee, op);
    }

    async _updateRecipient(treeTx, tx, op) {
        await this._updateBalance(treeTx, tx.recipientAddr, tx.value, op);
    }

    async _updateBalance(treeTx, address, value, operator) {
        const balance = await this.getBalance(address, treeTx);

        const newValue = operator(balance.value, value);
        if (newValue < 0) {
            throw 'Balance Error!';
        }

        const newNonce = value < 0 ? operator(balance.nonce, 1) : balance.nonce;
        if (newNonce < 0) {
            throw 'Nonce Error!';
        }

        const newBalance = new Balance(newValue, newNonce);
        const newAccount = new Account(newBalance);
        await treeTx.put(address, newAccount);
    }

    export() {
        return this._tree.export();
    }

    hash() {
        return this._tree.root();
    }
}
Accounts.EMPTY_TREE_HASH = Hash.fromBase64('cJ6AyISHokEeHuTfufIqhhSS0gxHZRUMDHlKvXD4FHw=');
Class.register(Accounts);

class BlockHeader {
    constructor(prevHash, bodyHash, accountsHash, nBits, height, timestamp, nonce, version = BlockHeader.CURRENT_VERSION) {
        if (!NumberUtils.isUint16(version)) throw 'Malformed version';
        if (!Hash.isHash(prevHash)) throw 'Malformed prevHash';
        if (!Hash.isHash(bodyHash)) throw 'Malformed bodyHash';
        if (!Hash.isHash(accountsHash)) throw 'Malformed accountsHash';
        if (!NumberUtils.isUint32(nBits) || !BlockUtils.isValidCompact(nBits)) throw 'Malformed nBits';
        if (!NumberUtils.isUint32(height)) throw 'Invalid height';
        if (!NumberUtils.isUint32(timestamp)) throw 'Malformed timestamp';
        if (!NumberUtils.isUint64(nonce)) throw 'Malformed nonce';

        this._version = version;
        this._prevHash = prevHash;
        this._bodyHash = bodyHash;
        this._accountsHash = accountsHash;
        this._nBits = nBits;
        this._height = height;
        this._timestamp = timestamp;
        this._nonce = nonce;
    }

    static unserialize(buf) {
        const version = buf.readUint16();
        if (!BlockHeader.SUPPORTED_VERSIONS.includes(version)) throw 'Block version unsupported';
        const prevHash = Hash.unserialize(buf);
        const bodyHash = Hash.unserialize(buf);
        const accountsHash = Hash.unserialize(buf);
        const nBits = buf.readUint32();
        const height = buf.readUint32();
        const timestamp = buf.readUint32();
        const nonce = buf.readUint64();
        return new BlockHeader(prevHash, bodyHash, accountsHash, nBits, height, timestamp, nonce, version);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeUint16(this._version);
        this._prevHash.serialize(buf);
        this._bodyHash.serialize(buf);
        this._accountsHash.serialize(buf);
        buf.writeUint32(this._nBits);
        buf.writeUint32(this._height);
        buf.writeUint32(this._timestamp);
        buf.writeUint64(this._nonce);
        return buf;
    }

    get serializedSize() {
        return /*version*/ 2
            + this._prevHash.serializedSize
            + this._bodyHash.serializedSize
            + this._accountsHash.serializedSize
            + /*nBits*/ 4
            + /*height*/ 4
            + /*timestamp*/ 4
            + /*nonce*/ 8;
    }

    async verifyProofOfWork(buf) {
        const pow = await this.pow(buf);
        return BlockUtils.isProofOfWork(pow, this.target);
    }

    async hash(buf) {
        this._hash = this._hash || await Hash.light(this.serialize(buf));
        return this._hash;
    }

    async pow(buf) {
        this._pow = this._pow || await Hash.hard(this.serialize(buf));
        return this._pow;
    }

    equals(o) {
        return o instanceof BlockHeader
            && this._prevHash.equals(o.prevHash)
            && this._bodyHash.equals(o.bodyHash)
            && this._accountsHash.equals(o.accountsHash)
            && this._nBits === o.nBits
            && this._height === o.height
            && this._timestamp === o.timestamp
            && this._nonce === o.nonce;
    }

    toString() {
        return `BlockHeader{`
            + `prevHash=${this._prevHash}, `
            + `bodyHash=${this._bodyHash}, `
            + `accountsHash=${this._accountsHash}, `
            + `nBits=${this._nBits.toString(16)}, `
            + `height=${this._height}, `
            + `timestamp=${this._timestamp}, `
            + `nonce=${this._nonce}`
            + `}`;
    }

    get prevHash() {
        return this._prevHash;
    }

    get bodyHash() {
        return this._bodyHash;
    }

    get accountsHash() {
        return this._accountsHash;
    }

    get nBits() {
        return this._nBits;
    }

    get target() {
        return BlockUtils.compactToTarget(this._nBits);
    }

    get difficulty() {
        return BlockUtils.compactToDifficulty(this._nBits);
    }

    get height() {
        return this._height;
    }

    get timestamp() {
        return this._timestamp;
    }

    get nonce() {
        return this._nonce;
    }

    // XXX The miner changes the nonce of an existing BlockHeader during the
    // mining process.
    set nonce(n) {
        this._nonce = n;
        this._hash = null;
        this._pow = null;
    }
}
BlockHeader.CURRENT_VERSION = 1;
BlockHeader.SUPPORTED_VERSIONS = [1];
Class.register(BlockHeader);

class BlockBody {

    constructor(minerAddr, transactions) {
        if (!(minerAddr instanceof Address)) throw 'Malformed minerAddr';
        if (!transactions || transactions.some(it => !(it instanceof Transaction))) throw 'Malformed transactions';
        this._minerAddr = minerAddr;
        this._transactions = transactions;
    }

    static unserialize(buf) {
        const minerAddr = Address.unserialize(buf);
        const numTransactions = buf.readUint16();
        const transactions = new Array(numTransactions);
        for (let i = 0; i < numTransactions; i++) {
            transactions[i] = Transaction.unserialize(buf);
        }
        return new BlockBody(minerAddr, transactions);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        this._minerAddr.serialize(buf);
        buf.writeUint16(this._transactions.length);
        for (let tx of this._transactions) {
            tx.serialize(buf);
        }
        return buf;
    }

    get serializedSize() {
        let size = this._minerAddr.serializedSize
            + /*transactionsLength*/ 2;
        for (let tx of this._transactions) {
            size += tx.serializedSize;
        }
        return size;
    }

    hash() {
        return BlockBody._computeRoot([this._minerAddr, ...this._transactions]);
    }

    static _computeRoot(values) {
        // values may contain:
        // - transactions (Transaction)
        // - miner address (Uint8Array)
        const len = values.length;
        if (len == 1) {
            const value = values[0];
            return value.hash ? /*transaction*/ value.hash() : /*miner address*/ Hash.light(value.serialize());
        }

        const mid = Math.round(len / 2);
        const left = values.slice(0, mid);
        const right = values.slice(mid);
        return Promise.all([
            BlockBody._computeRoot(left),
            BlockBody._computeRoot(right)
        ]).then(hashes => Hash.light(BufferUtils.concatTypedArrays(hashes[0].serialize(), hashes[1].serialize())));
    }

    equals(o) {
        return o instanceof BlockBody
            && this._minerAddr.equals(o.minerAddr)
            && this._transactions.every((tx, i) => tx.equals(o.transactions[i]));
    }

    get minerAddr() {
        return this._minerAddr;
    }

    get transactions() {
        return this._transactions;
    }

    get transactionCount() {
        return this._transactions.length;
    }
}
Class.register(BlockBody);

class BlockUtils {
    static compactToTarget(compact) {
        return (compact & 0xffffff) * Math.pow(2, (8 * ((compact >> 24) - 3)));
    }

    static targetToCompact(target) {
        // Convert the target into base 16 with zero-padding.
        let base16 = target.toString(16);
        if (base16.length % 2 != 0) {
            base16 = "0" + base16;
        }

        // If the first (most significant) byte is greater than 127 (0x7f),
        // prepend a zero byte.
        if (parseInt(base16.substr(0, 2), 16) > 0x7f) {
            base16 = "00" + base16;
        }

        // The first byte of the 'compact' format is the number of bytes,
        // including the prepended zero if it's present.
        let size = base16.length / 2;
        let compact = size << 24;

        // The following three bytes are the first three bytes of the above
        // representation. If less than three bytes are present, then one or
        // more of the last bytes of the compact representation will be zero.
        const numBytes = Math.min(size, 3);
        for (let i = 0; i < numBytes; ++i) {
            compact |= parseInt(base16.substr(i * 2, 2), 16) << ((2 - i) * 8);
        }

        return compact;
    }

    static compactToDifficulty(compact) {
        return Policy.BLOCK_TARGET_MAX / BlockUtils.compactToTarget(compact);
    }

    static difficultyToCompact(difficulty) {
        return BlockUtils.targetToCompact(Policy.BLOCK_TARGET_MAX / difficulty);
    }

    static difficultyToTarget(difficulty) {
        return Policy.BLOCK_TARGET_MAX / difficulty;
    }

    static targetToDifficulty(target) {
        return Policy.BLOCK_TARGET_MAX / target;
    }

    static isProofOfWork(hash, target) {
        return parseInt(hash.toHex(), 16) <= target;
    }

    static isValidCompact(compact) {
        return BlockUtils.isValidTarget(BlockUtils.compactToTarget(compact));
    }

    static isValidTarget(target) {
        return target >= 1 && target <= Policy.BLOCK_TARGET_MAX;
    }
}
Class.register(BlockUtils);

// TODO V2: Transactions may contain a payment reference such that the chain can prove existence of data
// TODO V2: Copy 'serialized' to detach all outer references
class Transaction {
    constructor(senderPubKey, recipientAddr, value, fee, nonce, signature, version = Transaction.CURRENT_VERSION) {
        if (!NumberUtils.isUint16(version)) throw 'Malformed version';
        if (!(senderPubKey instanceof PublicKey)) throw 'Malformed senderPubKey';
        if (!(recipientAddr instanceof Address)) throw 'Malformed recipientAddr';
        if (!NumberUtils.isUint64(value) || value == 0) throw 'Malformed value';
        if (!NumberUtils.isUint64(fee)) throw 'Malformed fee';
        if (!NumberUtils.isUint32(nonce)) throw 'Malformed nonce';
        // Signature may be initially empty and can be set later.
        if (signature !== undefined && !(signature instanceof Signature)) throw 'Malformed signature';

        // Note that the signature is NOT verified here.
        // Callers must explicitly invoke verifySignature() to check it.

        this._version = version;
        this._senderPubKey = senderPubKey;
        this._recipientAddr = recipientAddr;
        this._value = value;
        this._fee = fee;
        this._nonce = nonce;
        this._signature = signature;
    }

    static unserialize(buf) {
        // We currently only support one transaction type: Basic.
        const version = buf.readUint16();
        if (!Transaction.SUPPORTED_VERSIONS.includes(version)) throw 'Transaction version unsupported';
        const type = buf.readUint8();
        if (type !== Transaction.Type.BASIC) throw 'Malformed transaction type';
        const senderPubKey = PublicKey.unserialize(buf);
        const recipientAddr = Address.unserialize(buf);
        const value = buf.readUint64();
        const fee = buf.readUint64();
        const nonce = buf.readUint32();
        const signature = Signature.unserialize(buf);
        return new Transaction(senderPubKey, recipientAddr, value, fee, nonce, signature, version);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        this.serializeContent(buf);
        this._signature.serialize(buf);
        return buf;
    }

    get serializedSize() {
        return this.serializedContentSize
            + this._signature.serializedSize;
    }

    serializeContent(buf) {
        buf = buf || new SerialBuffer(this.serializedContentSize);
        buf.writeUint16(this._version);
        buf.writeUint8(Transaction.Type.BASIC);
        this._senderPubKey.serialize(buf);
        this._recipientAddr.serialize(buf);
        buf.writeUint64(this._value);
        buf.writeUint64(this._fee);
        buf.writeUint32(this._nonce);
        return buf;
    }

    get serializedContentSize() {
        return /*version*/ 2
            + /*type*/ 1
            + this._senderPubKey.serializedSize
            + this._recipientAddr.serializedSize
            + /*value*/ 8
            + /*fee*/ 8
            + /*nonce*/ 4;
    }

    async verifySignature() {
        return this._signature.verify(this._senderPubKey, this.serializeContent());
    }

    hash() {
        // Exclude the signature, we don't want transactions to be malleable.
        // TODO Think about this! This means that the signatures will not be
        // captured by the proof of work!
        return Hash.light(this.serializeContent());
    }

    equals(o) {
        return o instanceof Transaction
            && this._senderPubKey.equals(o.senderPubKey)
            && this._recipientAddr.equals(o.recipientAddr)
            && this._value === o.value
            && this._fee === o.fee
            && this._nonce === o.nonce
            && this._signature.equals(o.signature);
    }

    toString() {
        return `Transaction{`
            + `senderPubKey=${this._senderPubKey.toBase64()}, `
            + `recipientAddr=${this._recipientAddr.toBase64()}, `
            + `value=${this._value}, `
            + `fee=${this._fee}, `
            + `nonce=${this._nonce}, `
            + `signature=${this._signature.toBase64()}`
            + `}`;
    }

    get senderPubKey() {
        return this._senderPubKey;
    }

    getSenderAddr() {
        return this._senderPubKey.toAddress();
    }

    get recipientAddr() {
        return this._recipientAddr;
    }

    get value() {
        return this._value;
    }

    get fee() {
        return this._fee;
    }

    get nonce() {
        return this._nonce;
    }

    get signature() {
        return this._signature;
    }

    // Signature is set by the Wallet after signing a transaction.
    set signature(sig) {
        this._signature = sig;
    }
}
Transaction.CURRENT_VERSION = 1;
Transaction.SUPPORTED_VERSIONS = [1];
Transaction.Type = {};
Transaction.Type.BASIC = 0;

Class.register(Transaction);

class Block {
    constructor(header, body) {
        if (!(header instanceof BlockHeader)) throw 'Malformed header';
        if (!(body instanceof BlockBody)) throw 'Malformed body';
        this._header = header;
        this._body = body;
    }

    static unserialize(buf) {
        const header = BlockHeader.unserialize(buf);
        const body = BlockBody.unserialize(buf);
        return new Block(header, body);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        this._header.serialize(buf);
        this._body.serialize(buf);
        return buf;
    }

    get serializedSize() {
        return this._header.serializedSize
            + this._body.serializedSize;
    }

    get header() {
        return this._header;
    }

    get body() {
        return this._body;
    }

    get prevHash() {
        return this._header.prevHash;
    }

    get bodyHash() {
        return this._header.bodyHash;
    }

    get accountsHash() {
        return this._header.accountsHash;
    }

    get nBits() {
        return this._header.nBits;
    }

    get target() {
        return this._header.target;
    }

    get difficulty() {
        return this._header.difficulty;
    }

    get height() {
        return this._header.height;
    }

    get timestamp() {
        return this._header.timestamp;
    }

    get nonce() {
        return this._header.nonce;
    }

    get minerAddr() {
        return this._body.minerAddr;
    }

    get transactions() {
        return this._body.transactions;
    }

    get transactionCount() {
        return this._body.transactionCount;
    }

    hash() {
        return this._header.hash();
    }
}

/* Genesis Block */
Block.GENESIS = new Block(
    new BlockHeader(
        new Hash(null),
        new Hash(BufferUtils.fromBase64('Xmju8G32zjPl4m6U/ULB3Nyozs2BkVgX2k9fy5/HeEg=')),
        new Hash(BufferUtils.fromBase64('3OXA29ZLjMiwzb52dseSuRH4Reha9lAh4qfPLm6SF28=')),
        BlockUtils.difficultyToCompact(1),
        1,
        0,
        38760),
    new BlockBody(new Address(BufferUtils.fromBase64('kekkD0FSI5gu3DRVMmMHEOlKf1I')), [])
);
// Store hash for synchronous access
Block.GENESIS.HASH = Hash.fromBase64('AACIm7qoV7ybhlwQMvJrqjzSt5RJtq5++xi8jg91jfU=');
Block.GENESIS.hash().then(hash => {
    Block.GENESIS.HASH = hash;
    //Object.freeze(Block.GENESIS);
});

/* Checkpoint Block */
Block.CHECKPOINT = new Block(
    new BlockHeader(
        /*prevHash*/ new Hash(BufferUtils.fromBase64('AAAABu9kraY76NSuSH5WWtQJCsNTwSLaZABC7ffbsaY=')),
        /*bodyHash*/ new Hash(BufferUtils.fromBase64('zN8a1d0XIevSkE6Jg4tkyEOwu2J/7Gg4yJB2eGZVO3M=')),
        /*accountsHash*/ new Hash(BufferUtils.fromBase64('uh8MJMb0wFcRB+VrDIUdxrEbemNVboT9h+u4pucKtxo=')),
        /*nBits*/ 487246280,
        /*height*/ 139271,
        /*timestamp*/ 1506985604,
        /*nonce*/ 575143,
        /*version*/ 1),
    new BlockBody(new Address(BufferUtils.fromBase64('FcJ8wuHATIz6B5i5l/t+98zBPu4=')), [])
);
Block.CHECKPOINT.hash().then(hash => {
    Block.CHECKPOINT.HASH = hash;
    //Object.freeze(Block.GENESIS);
});
Block.CHECKPOINT.TOTAL_WORK = 1416908172.0870397;
Block.OLD_CHECKPOINTS = new IndexedArray([
    new Hash(BufferUtils.fromBase64('AAAACxKJIIfQb99dTIuiRyY6VkRlzBfbyknKo/515Ho=')),
    new Hash(BufferUtils.fromBase64('AAAAJHtA0SSxZb+sk2T9Qtzz4bWZdfz8pqbf5PNjywI=')),
    new Hash(BufferUtils.fromBase64('AAAALktDkTyMegm9e/CJG9NpkvF/7uPxp9q+zErQnl8=')),
    new Hash(BufferUtils.fromBase64('AAAABmq1g68uEMzKWLDBUa6810XEE9Vk/ifONRCUkUk=')),
    new Hash(BufferUtils.fromBase64('AAAAHpEZUIClGOSOrqjKJ+THcp8xyN4+5U2rvHlEkvw=')),
    new Hash(BufferUtils.fromBase64('AAAAFenBDl6b49lyL33tpV8eLzWf1dYIM8+9pxEGRfY=')),
    new Hash(BufferUtils.fromBase64('AAAABePxtVLWdRrzjxUmRGVPym7zuImTZEGMvZaRNEs=')),
    new Hash(BufferUtils.fromBase64('AAAAH4mCyHqdb+rcy0VDptF0CfLugU+gKYDA7oPuhWI=')),
    new Hash(BufferUtils.fromBase64('AAAAABu3j9L0ol18IHG25YMi4lHVyGwa5QJGrQJy4Qw=')),
    new Hash(BufferUtils.fromBase64('AAAAARX1b4n0Y1+dzdEU4cZW7GNvxKUEalDtH1vSsx8=')),
    new Hash(BufferUtils.fromBase64('AAAABH7wDY5FwWZho3QllcGRNveaOSoSwvybunpXoAc=')),
    new Hash(BufferUtils.fromBase64('AAAAFqUCFCnUYyybeKyAJuTBhtB29dOUHlo9W31TxPA=')),
    new Hash(BufferUtils.fromBase64('AAAAA+mSyp2Q3JsT5W5PbCLVHzGd3EsLMzkqSFt4AwM=')),
    new Hash(BufferUtils.fromBase64('AAAAAjFm8OCWhfzH2acJntnz921z15yxb5E+bh1N7k4=')),
    new Hash(BufferUtils.fromBase64('AAAAAIVQSMwa5TcuGg6t28wSQyijwBEhEMddTiNFNfw=')),
    new Hash(BufferUtils.fromBase64('AAAACfynhTg1AE83lWY0Il009MauEBohEWvpuJq9JjM=')),
    new Hash(BufferUtils.fromBase64('AAAADiUfwIOxDrscPaQKWXnt8JOQZ4igiJ08mMLB83k=')),
    new Hash(BufferUtils.fromBase64('AAAAAaviQ4P5/8HjNtl1Ixf2YQrqK2cBuGo1eM4gEvQ=')),
    new Hash(BufferUtils.fromBase64('AAAABs5JgeROyc2m8Q5ipp8zZ43VooArfOdXC4PBEl8=')),
    new Hash(BufferUtils.fromBase64('AAAAAMPvFcUV8nPAB2ggkJeFvP73SAPwNHoC1I1I+sA=')),
    new Hash(BufferUtils.fromBase64('AAAACOVTDF5/5y8bsaIbhJidyEzQEYfsh4cMFZ1TAew=')),
    new Hash(BufferUtils.fromBase64('AAAADrTB/DfobRJSPRwG4XKArX0Na3J03OvVJWhunJI=')),
    new Hash(BufferUtils.fromBase64('AAAABomr61e4IFqwoAh8s8yUXbYNedG/WLW7aHDZzco=')),
    new Hash(BufferUtils.fromBase64('AAAAB8zYJ87usp2Av9+q0TN786BOhri3PS0M8aEvwIQ=')),
    new Hash(BufferUtils.fromBase64('AAAAAngMt24MYmSe2tfgfj1NV4Fv10BZXDPcDTZHuQM=')),
    new Hash(BufferUtils.fromBase64('AAAAA2trckpN5D7NlSQGJEDmx/1uQR3lRSlXmsKY2wE=')),
    new Hash(BufferUtils.fromBase64('AAAACmdt5K8AjlabxT0SOqNgCaA3b+B43q0MF7ppN7Q=')),
    new Hash(BufferUtils.fromBase64('AAAADEVHAPy+L7Mvy9YfiIYoWnLNd+uWUnVitoX0/tA=')),
    new Hash(BufferUtils.fromBase64('AAAABYQ5353h3Lv7juIk1FrjU1q0wZoZVnq7Ocuw8IA=')),
    new Hash(BufferUtils.fromBase64('AAAAFVMaIN3bMR/bqcr/G8AXExIbg41bd/iZaLTyhWY=')),
    new Hash(BufferUtils.fromBase64('AAAAAqBBrvzSgRg8shTLLUXYw6W/8Je0H276xGYJ5wU=')),
    new Hash(BufferUtils.fromBase64('AAAACThS7/pP1Cm3q2/yFDcDqSwx8O1kK7cwc2tuzAA=')),
    new Hash(BufferUtils.fromBase64('AAAADhidwr1dh+1mGY2FmZq6rWDs0amAQL1C7axonY0=')),
    new Hash(BufferUtils.fromBase64('AAAAAWQrgmCog7PJiXtpC6dvzPEHxuN8bOFbB1PZXwU=')),
    new Hash(BufferUtils.fromBase64('AAAAAOzbgj12KNWbd0YBCLLJVKoKpyWqiKqIeb0cWYY=')),
    new Hash(BufferUtils.fromBase64('AAAAA9Eri8IFB/UxwAyp5H/KjWUaCfkfsX6hOWGr4XI=')),
    new Hash(BufferUtils.fromBase64('AAAAANv1CnELj09i1h9GQS++H0dlDsmSpZlxRJnx+e0=')),
    new Hash(BufferUtils.fromBase64('AAAAAHNe8IMHwSAD1bexfg+oxitFhmv0ikCl+/cyqjI=')),
    new Hash(BufferUtils.fromBase64('AAAABZqZPBproHHkEJ3psSlaZKlhkIiI9UKnuPn/vwc=')),
    new Hash(BufferUtils.fromBase64('AAAADQAyeZGspliFv2mqWhQQbfSRvIIPLiNsoMErqm8=')),
    new Hash(BufferUtils.fromBase64('AAAAALIJBnwqoH7gmxNM3GvSyw8dFpxtSmEg6sV4uAo=')),
    new Hash(BufferUtils.fromBase64('AAAAAMd+Wq1c3jt5keQOLfjezQ5AxpOpnjsl8xcLUDc=')),
    new Hash(BufferUtils.fromBase64('AAAAAGGrX3d0WLyhpOt7Nbmq37giIRuLm3FCvzb1XfU=')),
    new Hash(BufferUtils.fromBase64('AAAACkPKnKTWruYASvz76oMoiC/C0+iRsWFssNwr7eM=')),
    new Hash(BufferUtils.fromBase64('AAAACO/TfaCyO6Q8GGRJpwFl+sJfLAEdcgUVUgxc5aA=')),
    new Hash(BufferUtils.fromBase64('AAAAA0sGWmpmF5366NiAkePliru5Bjjm+7o07LZofio=')),
    new Hash(BufferUtils.fromBase64('AAAAB57+m4HhiEux0jUzm7UHfWaEKSJsqoBK2zqac7s=')),
    new Hash(BufferUtils.fromBase64('AAAAEkX1csDA2AprHqnHtxcGBehVZUhi1WwSzfyaSuk=')),
    new Hash(BufferUtils.fromBase64('AAAABPaGCcb/6KiSv8W+g+zjolv8ELY+9XsM5Pn1GUo=')),
    new Hash(BufferUtils.fromBase64('AAAACABkAoWDigZfOa+7qz2KBop+JKz6s0DnIOClZ1k=')),
    new Hash(BufferUtils.fromBase64('AAAAAZmDPyRu6oE3qFa81RyQxmhLb9skxjwjHTCpHY8=')),
    new Hash(BufferUtils.fromBase64('AAAABXe0Cr/vEstwitvRkHaOskdPS7fuwh+2iCdOOLc=')),
    new Hash(BufferUtils.fromBase64('AAAAAfRwy+Lv2JXTZqBoFFv30beUeskND2uL/ZCmHSk='))
]);
Class.register(Block);

class Blockchain extends Observable {
    static getPersistent(accounts) {
        const store = BlockchainStore.getPersistent();
        return new Blockchain(store, accounts);
    }

    static createVolatile(accounts, allowCheckpoint=false) {
        const store = BlockchainStore.createVolatile();
        return new Blockchain(store, accounts, allowCheckpoint);
    }

    constructor(store, accounts, allowCheckpoint=true) {
        super();
        this._store = store;
        this._accounts = accounts;

        this._mainChain = null;
        this._mainPath = null;
        this._headHash = null;

        this._checkpointLoaded = false;

        // Blocks arriving fast over the network will create a backlog of blocks
        // in the synchronizer queue. Tell listeners when the blockchain is
        // ready to accept blocks again.
        this._synchronizer = new Synchronizer();
        this._synchronizer.on('work-end', () => this.fire('ready', this));

        return this._init(allowCheckpoint);
    }

    async _init(allowCheckpoint) {
        // Load the main chain from storage.
        this._mainChain = await this._store.getMainChain();

        // If we don't know any chains, start with the genesis chain.
        if (!this._mainChain) {
            this._mainChain = new Chain(Block.GENESIS);
            await this._store.put(this._mainChain);
            await this._store.setMainChain(this._mainChain);
            // Allow to load checkpoint if it exists and can be applied.
            if (allowCheckpoint && Block.CHECKPOINT && (await this.loadCheckpoint())) {
                this._mainChain = new Chain(Block.CHECKPOINT, Block.CHECKPOINT.TOTAL_WORK, Block.CHECKPOINT.height);
                await this._store.put(this._mainChain);
                await this._store.setMainChain(this._mainChain);
            }
        } else {
            // Fast-forward to CHECKPOINT if necessary.
            if (allowCheckpoint && Block.CHECKPOINT && this._mainChain.height < Block.CHECKPOINT.height && (await this.loadCheckpoint())) {
                this._mainChain = new Chain(Block.CHECKPOINT, Block.CHECKPOINT.TOTAL_WORK, Block.CHECKPOINT.height);
                await this._store.put(this._mainChain);
                await this._store.setMainChain(this._mainChain);
            }
        }

        // Cache the hash of the head of the current main chain.
        this._headHash = await this._mainChain.hash();

        // Fetch the path along the main chain.
        // XXX optimize this!
        this._mainPath = await this._fetchPath(this.head);

        // Always set checkpointLoaded to true, if our first block in the path is a checkpoint.
        if (this._mainPath.length > 0 && (this._mainPath[0].equals(Block.CHECKPOINT.HASH) || Block.OLD_CHECKPOINTS.indexOf(this._mainPath[0]))) {
            this._checkpointLoaded = true;
        }

        // Automatically commit the chain head if the accountsHash matches.
        // Needed to bootstrap the empty accounts tree.
        const accountsHash = await this.accountsHash();
        if (accountsHash.equals(Accounts.EMPTY_TREE_HASH)) {
            await this._accounts.commitBlock(this._mainChain.head);
        } else if (!accountsHash.equals(this._mainChain.head.accountsHash)) {
            // TODO what to do if the accounts hashes mismatch?
            throw 'AccountsHash mismatch in blockchain initialization';
        }

        return this;
    }

    async loadCheckpoint() {
        const accounts = await Accounts.createVolatile();

        // Load accountsTree at checkpoint.
        if (!AccountsTree.CHECKPOINT_NODES) {
            return false;
        }
        const nodes = AccountsTree.CHECKPOINT_NODES;
        // Read nodes.
        for (let i = 0; i < nodes.length; ++i) {
            nodes[i] = AccountsTreeNode.unserialize(BufferUtils.fromBase64(nodes[i]));
        }

        if (nodes.length === 0) {
            Log.d(Blockchain, 'Loading checkpoint failed, no nodes in AccountsTree.');
            return false;
        }

        // Check accountsHash.
        if (!(await nodes[0].hash()).equals(await Block.CHECKPOINT.accountsHash)) {
            Log.d(Blockchain, 'Loading checkpoint failed, accountsHash mismatch.');
            return false;
        }

        // Try populating the tree.
        if (!(await accounts.populate(nodes))) {
            Log.d(Blockchain, 'Loading checkpoint failed, tree could not be populated.');
            return false;

        }

        await this._accounts.clear();
        await this._accounts.populate(nodes);

        this._checkpointLoaded = true;
        return true;
    }

    // Retrieves up to maxBlocks predecessors of the given block.
    // Returns an array of max (maxBlocks + 1) block hashes with the given hash
    // as the last element.
    async _fetchPath(block, maxBlocks = 1000000) {
        let hash = await block.hash();
        const path = [hash];

        if (Block.GENESIS.HASH.equals(hash) || (this._checkpointLoaded && Block.CHECKPOINT.HASH.equals(hash))) {
            return new IndexedArray(path);
        }

        do {
            const prevChain = await this._store.get(block.prevHash.toBase64()); // eslint-disable-line no-await-in-loop
            if (!prevChain && Block.CHECKPOINT.HASH.equals(hash)) break;
            if (!prevChain && Block.OLD_CHECKPOINTS.indexOf(hash) >= 0) break; // we also need to stop if we encountered an old checkpoint
            if (!prevChain) throw `Failed to find predecessor block ${block.prevHash.toBase64()}`;

            // TODO unshift() is inefficient. We should build the array with push()
            // instead and iterate over it in reverse order.
            path.unshift(block.prevHash);

            // Advance to the predecessor block.
            hash = block.prevHash;
            block = prevChain.head;
        } while (--maxBlocks > 0 && !Block.GENESIS.HASH.equals(hash));

        return new IndexedArray(path);
    }

    pushBlock(block) {
        return new Promise((resolve, error) => {
            this._synchronizer.push(() => {
                return this._pushBlock(block);
            }, resolve, error);
        });
    }

    createTemporaryAccounts() {
        return Accounts.createTemporary(this._accounts);
    }

    async _pushBlock(block) {
        // Check if we already know this block. If so, ignore it.
        const hash = await block.hash();
        const knownChain = await this._store.get(hash.toBase64());
        if (knownChain && !this._isHarderChain(knownChain, hash)) {
            Log.v(Blockchain, `Ignoring known block ${hash.toBase64()}`);
            return Blockchain.PUSH_ERR_KNOWN_BLOCK;
        }

        // Retrieve the previous block. Fail if we don't know it.
        const prevChain = await this._store.get(block.prevHash.toBase64());
        if (!prevChain) {
            Log.v(Blockchain, `Discarding block ${hash.toBase64()} - previous block ${block.prevHash.toBase64()} unknown`);
            return Blockchain.PUSH_ERR_ORPHAN_BLOCK;
        }

        // Check all intrinsic block invariants.
        if (!(await this._verifyBlock(block))) {
            return Blockchain.PUSH_ERR_INVALID_BLOCK;
        }

        // Check that the block is a valid extension of its previous block.
        if (!(await this._isValidExtension(prevChain, block))) {
            return Blockchain.PUSH_ERR_INVALID_BLOCK;
        }

        // Block looks good, compute the new total work & height.
        const totalWork = prevChain.totalWork + block.difficulty;
        const height = prevChain.height + 1;

        // Store the new block.
        let newChain = knownChain;
        if (!knownChain) {
            newChain = new Chain(block, totalWork, height);
            await this._store.put(newChain);
        }

        // Check if the new block extends our current main chain.
        if (block.prevHash.equals(this._headHash)) {
            // Append new block to the main chain.
            if (!(await this._extend(newChain, hash))) {
                return Blockchain.PUSH_ERR_INVALID_BLOCK;
            }

            // Tell listeners that the head of the chain has changed.
            this.fire('head-changed', this.head);

            return Blockchain.PUSH_OK;
        }

        // Otherwise, check if the new chain is harder than our current main chain:
        if (this._isHarderChain(newChain, hash)) {
            // A fork has become the hardest chain, rebranch to it.
            await this._rebranch(newChain, hash);

            // Tell listeners that the head of the chain has changed.
            this.fire('head-changed', this.head);

            return Blockchain.PUSH_OK;
        }

        // Otherwise, we are creating/extending a fork. We have stored the block,
        // the head didn't change, nothing else to do.
        Log.v(Blockchain, `Creating/extending fork with block ${hash.toBase64()}, height=${newChain.height}, totalWork=${newChain.totalWork}`);

        return Blockchain.PUSH_OK;
    }

    _isHarderChain(newChain, headHash) {
        // - Pick chain with higher total work.
        // - If identical, pick chain with higher timestamp.
        // - If identical as well, pick chain with lower PoW hash.
        let isHarderChain = false;
        if (newChain.totalWork > this.totalWork) {
            isHarderChain = true;
        } else if (newChain.totalWork === this.totalWork) {
            if (newChain.head.timestamp > this.head.timestamp) {
                isHarderChain = true;
            } else if (newChain.head.timestamp === this.head.timestamp
                && parseInt(headHash.toHex(), 16) < parseInt(this.headHash.toHex(), 16)) {
                isHarderChain = true;
            }
        }
        return isHarderChain;
    }

    async _verifyBlock(block) {
        // Check that the maximum block size is not exceeded.
        if (block.serializedSize > Policy.BLOCK_SIZE_MAX) {
            Log.w(Blockchain, 'Rejected block - max block size exceeded');
            return false;
        }

        // XXX Check that there is only one transaction per sender per block.
        const senderPubKeys = {};
        for (const tx of block.body.transactions) {
            if (senderPubKeys[tx.senderPubKey]) {
                Log.w(Blockchain, 'Rejected block - more than one transaction per sender');
                return false;
            }
            if (tx.recipientAddr.equals(await tx.getSenderAddr())) {  // eslint-disable-line no-await-in-loop
                Log.w(Blockchain, 'Rejected block - sender and recipient coincide');
                return false;
            }
            senderPubKeys[tx.senderPubKey] = true;
        }

        // Verify that the block's timestamp is not too far in the future.
        // TODO Use network-adjusted time (see https://en.bitcoin.it/wiki/Block_timestamp).
        const maxTimestamp = Math.floor((Date.now() + Blockchain.BLOCK_TIMESTAMP_DRIFT_MAX) / 1000);
        if (block.header.timestamp > maxTimestamp) {
            Log.w(Blockchain, 'Rejected block - timestamp too far in the future');
            return false;
        }

        // Check that the headerHash matches the difficulty.
        if (!(await block.header.verifyProofOfWork())) {
            Log.w(Blockchain, 'Rejected block - PoW verification failed');
            return false;
        }

        // Check that header bodyHash matches the actual bodyHash.
        const bodyHash = await block.body.hash();
        if (!block.header.bodyHash.equals(bodyHash)) {
            Log.w(Blockchain, 'Rejecting block - body hash mismatch');
            return false;
        }
        // Check that all transaction signatures are valid.
        for (const tx of block.body.transactions) {
            if (!(await tx.verifySignature())) { // eslint-disable-line no-await-in-loop
                Log.w(Blockchain, 'Rejected block - invalid transaction signature');
                return false;
            }
        }

        // Everything checks out.
        return true;
    }

    async _isValidExtension(chain, block) {
        // Check that the height is one higher than previous
        if (chain.height !== block.header.height - 1) {
            Log.w(Blockchain, 'Rejecting block - not next in height');
            return false;
        }

        // Check that the difficulty matches.
        const nextCompactTarget = await this.getNextCompactTarget(chain);
        if (nextCompactTarget !== block.nBits) {
            Log.w(Blockchain, 'Rejecting block - difficulty mismatch');
            return false;
        }

        // Check that the timestamp is after (or equal) the previous block's timestamp.
        if (chain.head.timestamp > block.timestamp) {
            Log.w(Blockchain, 'Rejecting block - timestamp mismatch');
            return false;
        }

        // Everything checks out.
        return true;
    }

    async _extend(newChain, headHash) {
        // Validate that the block matches the current account state.
        try {
            await this._accounts.commitBlock(newChain.head);
        } catch (e) {
            // AccountsHash mismatch. This can happen if someone gives us an
            // invalid block. TODO error handling
            Log.w(Blockchain, `Rejecting block, AccountsHash mismatch: bodyHash=${newChain.head.bodyHash}, accountsHash=${newChain.head.accountsHash}`);
            return false;
        }

        // Update main chain.
        this._mainChain = newChain;
        this._mainPath.push(headHash);
        this._headHash = headHash;
        await this._store.setMainChain(this._mainChain);

        return true;
    }

    async _revert() {
        // Load the predecessor chain.
        const prevHash = this.head.prevHash;
        const prevChain = await this._store.get(prevHash.toBase64());
        if (!prevChain) throw `Failed to find predecessor block ${prevHash.toBase64()} while reverting`;

        // Test first
        const tmpAccounts = await this.createTemporaryAccounts();
        await tmpAccounts.revertBlock(this.head);
        const tmpHash = await tmpAccounts.hash();
        Log.d(Blockchain, `AccountsHash after revert: ${tmpHash}`);
        if (!tmpHash.equals(prevChain.head.accountsHash)) {
            throw 'Failed to revert main chain - inconsistent state';
        }

        // Revert the head block of the main chain.
        await this._accounts.revertBlock(this.head);

        // Update main chain.
        this._mainChain = prevChain;
        this._mainPath.pop();
        this._headHash = prevHash;
        await this._store.setMainChain(this._mainChain);

        // XXX Sanity check: Assert that the accountsHash now matches the
        // accountsHash of the current head.
        const accountsHash = await this.accountsHash();
        Log.d(Blockchain, `AccountsHash after revert: ${accountsHash}`);

        if (!accountsHash.equals(this.head.accountsHash)) {
            throw 'Failed to revert main chain - inconsistent state';
        }
    }

    async _rebranch(newChain, headHash) {
        Log.v(Blockchain, `Rebranching to fork ${headHash}, height=${newChain.height}, totalWork=${newChain.totalWork}`);

        // Find the common ancestor between our current main chain and the fork chain.
        // Walk up the fork chain until we find a block that is part of the main chain.
        // Store the chain along the way. In the worst case, this walks all the way
        // up to the genesis block.
        let forkHead = newChain.head;
        const forkChain = [newChain];
        while (this._mainPath.indexOf(forkHead.prevHash) < 0) {
            const prevChain = await this._store.get(forkHead.prevHash.toBase64()); // eslint-disable-line no-await-in-loop
            if (!prevChain) throw `Failed to find predecessor block ${forkHead.prevHash.toBase64()} while rebranching`;

            forkHead = prevChain.head;
            forkChain.unshift(prevChain);
        }

        // The predecessor of forkHead is the desired common ancestor.
        const commonAncestor = forkHead.prevHash;

        Log.v(Blockchain, `Found common ancestor ${commonAncestor.toBase64()} ${forkChain.length} blocks up`);

        // Revert all blocks on the current main chain until the common ancestor.
        while (!this.headHash.equals(commonAncestor)) {
            await this._revert(); // eslint-disable-line no-await-in-loop
        }

        // We have reverted to the common ancestor state. Apply all blocks on
        // the fork chain until we reach the new head.
        for (const chain of forkChain) {
            // XXX optimize!
            const hash = await chain.hash(); // eslint-disable-line no-await-in-loop
            await this._extend(chain, hash); // eslint-disable-line no-await-in-loop
        }
    }

    async getBlock(hash) {
        const chain = await this._store.get(hash.toBase64());
        return chain ? chain.head : null;
    }

    async getNextCompactTarget(chain) {
        chain = chain || this._mainChain;

        // The difficulty is adjusted every DIFFICULTY_ADJUSTMENT_BLOCKS blocks.
        if (chain.height % Policy.DIFFICULTY_ADJUSTMENT_BLOCKS === 0) {
            // If the given chain is the main chain, get the last DIFFICULTY_ADJUSTMENT_BLOCKS
            // blocks via this._mainChain, otherwise fetch the path.
            let startHash;
            if (chain === this._mainChain) {
                const startHeight = Math.max(this._mainPath.length - Policy.DIFFICULTY_ADJUSTMENT_BLOCKS, 0);
                startHash = this._mainPath[startHeight];
            } else {
                const path = await this._fetchPath(chain.head, Policy.DIFFICULTY_ADJUSTMENT_BLOCKS - 1);
                startHash = path[0];
            }

            // Compute the actual time it took to mine the last DIFFICULTY_ADJUSTMENT_BLOCKS blocks.
            const startChain = await this._store.get(startHash.toBase64());
            const actualTime = chain.head.timestamp - startChain.head.timestamp;

            // Compute the target adjustment factor.
            const expectedTime = Policy.DIFFICULTY_ADJUSTMENT_BLOCKS * Policy.BLOCK_TIME;
            let adjustment = actualTime / expectedTime;

            // Clamp the adjustment factor to [0.25, 4].
            adjustment = Math.max(adjustment, 0.25);
            adjustment = Math.min(adjustment, 4);

            // Compute the next target.
            const currentTarget = chain.head.target;
            let nextTarget = currentTarget * adjustment;

            // Make sure the target is below or equal the maximum allowed target (difficulty 1).
            // Also enforce a minimum target of 1.
            nextTarget = Math.min(nextTarget, Policy.BLOCK_TARGET_MAX);
            nextTarget = Math.max(nextTarget, 1);

            return BlockUtils.targetToCompact(nextTarget);
        }

        // If the difficulty is not adjusted at this height, the next difficulty
        // is the current difficulty.
        return chain.head.nBits;
    }

    get head() {
        return this._mainChain.head;
    }

    get totalWork() {
        return this._mainChain.totalWork;
    }

    get height() {
        return this._mainChain.height;
    }

    get headHash() {
        return this._headHash;
    }

    get path() {
        return this._mainPath;
    }

    get busy() {
        return this._synchronizer.working;
    }

    get checkpointLoaded() {
        return this._checkpointLoaded;
    }

    accountsHash() {
        return this._accounts.hash();
    }

    async exportMainPath(height) {
        height = height || this.head.height;
        const blocks = {};
        const path = [];

        for (let i = 0; i < this._mainPath.length; ++i) {
            const blockHash = this._mainPath[i];
            const block = await this.getBlock(blockHash);
            if (block.height > height) break;
            path.push(blockHash.toBase64());
            blocks[blockHash] = BufferUtils.toBase64(block.serialize());
        }

        return {
            'path': path,
            'blocks': blocks
        };
    }

    async exportAccounts(height) {
        height = height || this.head.height;
        const accounts = await Accounts.createTemporary(this._accounts);

        let currentBlock = this.head;
        // Do not revert the block with the desired height!
        while (currentBlock.height > height) {
            await accounts.revertBlock(currentBlock);
            currentBlock = await this.getBlock(currentBlock.prevHash);
        }

        if (!currentBlock.accountsHash.equals(await accounts.hash())) {
            throw 'AccountsHash mismatch while exporting';
        }

        if (!(await accounts._tree.verify())) {
            throw 'AccountsTree verification failed';
        }

        return accounts.export();
    }
}
Blockchain.BLOCK_TIMESTAMP_DRIFT_MAX = 1000 * 60 * 15; // 15 minutes
Blockchain.PUSH_OK = 0;
Blockchain.PUSH_ERR_KNOWN_BLOCK = 1;
Blockchain.PUSH_ERR_INVALID_BLOCK = -1;
Blockchain.PUSH_ERR_ORPHAN_BLOCK = -2;
Class.register(Blockchain);

class Chain {
    constructor(head, totalWork, height = 1) {
        this._head = head;
        this._totalWork = totalWork ? totalWork : head.difficulty;
        this._height = height;
    }

    static unserialize(buf) {
        const head = Block.unserialize(buf);
        const totalWork = buf.readFloat64();
        const height = buf.readUint32();
        return new Chain(head, totalWork, height);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        this._head.serialize(buf);
        buf.writeFloat64(this._totalWork);
        buf.writeUint32(this._height);
        return buf;
    }

    get serializedSize() {
        return this._head.serializedSize
            + /*totalWork*/ 8
            + /*height*/ 4;
    }

    get head() {
        return this._head;
    }

    get totalWork() {
        return this._totalWork;
    }

    get height() {
        return this._height;
    }

    hash() {
        return this._head.hash();
    }
}
Class.register(Chain);

class BlockchainStore {
    static getPersistent() {
        return new PersistentBlockchainStore();
    }

    static createVolatile() {
        return new VolatileBlockchainStore();
    }
}

class PersistentBlockchainStore extends ObjectDB {
    constructor() {
        super('blocks', Chain);
    }

    async getMainChain() {
        const key = await ObjectDB.prototype.getString.call(this, 'main');
        if (!key) return undefined;
        return ObjectDB.prototype.getObject.call(this, key);
    }

    async setMainChain(mainChain) {
        const key = await this.key(mainChain);
        return await ObjectDB.prototype.putString.call(this, 'main', key);
    }
}

class VolatileBlockchainStore {
    constructor() {
        this._store = {};
        this._mainChain = null;
    }

    async key(value) {
        return (await value.hash()).toBase64();
    }

    get(key) {
        return this._store[key];
    }

    async put(value) {
        const key = await this.key(value);
        this._store[key] = value;
        return key;
    }

    async remove(value) {
        const key = await this.key(value);
        delete this._store[key];
    }

    getMainChain() {
        return this._mainChain;
    }

    setMainChain(chain) {
        this._mainChain = chain;
    }
}
Class.register(BlockchainStore);

class Mempool extends Observable {
    constructor(blockchain, accounts) {
        super();
        this._blockchain = blockchain;
        this._accounts = accounts;

        // Our pool of transactions.
        this._transactions = {};

        // All public keys of transaction senders currently in the pool.
        this._senderPubKeys = {};

        // Listen for changes in the blockchain head to evict transactions that
        // have become invalid.
        blockchain.on('head-changed', () => this._evictTransactions());
    }

    async pushTransaction(transaction) {
        // Check if we already know this transaction.
        const hash = await transaction.hash();
        if (this._transactions[hash]) {
            Log.v(Mempool, `Ignoring known transaction ${hash.toBase64()}`);
            return false;
        }

        // Fully verify the transaction against the current accounts state.
        if (!(await this._verifyTransaction(transaction))) {
            return false;
        }

        // Only allow one transaction per senderPubKey at a time.
        // TODO This is a major limitation!
        if (this._senderPubKeys[transaction.senderPubKey]) {
            Log.w(Mempool, 'Rejecting transaction - duplicate sender public key');
            return false;
        }
        this._senderPubKeys[transaction.senderPubKey] = true;

        // Transaction is valid, add it to the mempool.
        this._transactions[hash] = transaction;

        // Tell listeners about the new valid transaction we received.
        this.fire('transaction-added', transaction);

        return true;
    }

    // Currently not asynchronous, but might be in the future.
    getTransaction(hash) {
        return this._transactions[hash];
    }

    // Currently not asynchronous, but might be in the future.
    getTransactions(maxCount = 5000) {
        // TODO Add logic here to pick the "best" transactions.
        const transactions = [];
        for (const hash in this._transactions) {
            if (transactions.length >= maxCount) break;
            transactions.push(this._transactions[hash]);
        }
        return transactions;
    }

    async _verifyTransaction(transaction) {
        // Verify transaction signature.
        if (!(await transaction.verifySignature())) {
            Log.w(Mempool, 'Rejected transaction - invalid signature', transaction);
            return false;
        }

        // Do not allow transactions where sender and recipient coincide.
        if (transaction.recipientAddr.equals(await transaction.getSenderAddr())) {
            Log.w(Mempool, 'Rejecting transaction - sender and recipient coincide');
            return false;
        }

        // Verify transaction balance.
        return this._verifyTransactionBalance(transaction);
    }

    async _verifyTransactionBalance(transaction, quiet) {
        // Verify balance and nonce:
        // - sender account balance must be greater or equal the transaction value + fee.
        // - sender account nonce must match the transaction nonce.
        const senderAddr = await transaction.getSenderAddr();
        const senderBalance = await this._accounts.getBalance(senderAddr);
        if (senderBalance.value < (transaction.value + transaction.fee)) {
            if (!quiet) Log.w(Mempool, 'Rejected transaction - insufficient funds', transaction);
            return false;
        }

        if (senderBalance.nonce !== transaction.nonce) {
            if (!quiet) Log.w(Mempool, 'Rejected transaction - invalid nonce', transaction);
            return false;
        }

        // Everything checks out.
        return true;
    }

    async _evictTransactions() {
        // Evict all transactions from the pool that have become invalid due
        // to changes in the account state (i.e. typically because the were included
        // in a newly mined block). No need to re-check signatures.
        const promises = [];
        for (const hash in this._transactions) {
            const transaction = this._transactions[hash];
            promises.push(this._verifyTransactionBalance(transaction, true).then(isValid => {
                if (!isValid) {
                    delete this._transactions[hash];
                    delete this._senderPubKeys[transaction.senderPubKey];
                }
            }));
        }
        await Promise.all(promises);

        // Tell listeners that the pool has updated after a blockchain head change.
        this.fire('transactions-ready');
    }
}
Class.register(Mempool);

class ConsensusAgent extends Observable {
    constructor(blockchain, mempool, peer) {
        super();
        this._blockchain = blockchain;
        this._mempool = mempool;
        this._peer = peer;

        // Flag indicating that we are currently syncing our blockchain with the peer's.
        this._syncing = false;

        // Flag indicating that have synced our blockchain with the peer's.
        this._synced = false;

        // The height of our blockchain when we last attempted to sync the chain.
        this._lastChainHeight = 0;

        // The number of failed blockchain sync attempts.
        this._failedSyncs = 0;

        // Set of all objects (InvVectors) that we think the remote peer knows.
        this._knownObjects = new HashSet();

        // InvVectors we want to request via getdata are collected here and
        // periodically requested.
        this._objectsToRequest = new IndexedArray([], true);

        // Objects that are currently being requested from the peer.
        this._objectsInFlight = null;

        // Helper object to keep track of timeouts & intervals.
        this._timers = new Timers();

        // Listen to consensus messages from the peer.
        peer.channel.on('inv',          msg => this._onInv(msg));
        peer.channel.on('getdata',      msg => this._onGetData(msg));
        peer.channel.on('notfound',     msg => this._onNotFound(msg));
        peer.channel.on('block',        msg => this._onBlock(msg));
        peer.channel.on('tx',           msg => this._onTx(msg));
        peer.channel.on('getblocks',    msg => this._onGetBlocks(msg));
        peer.channel.on('mempool',      msg => this._onMempool(msg));

        // Clean up when the peer disconnects.
        peer.channel.on('close', () => this._onClose());

        // Wait for the blockchain to processes queued blocks before requesting more.
        this._blockchain.on('ready', () => {
            if (this._syncing) this.syncBlockchain();
        });
    }

    /* Public API */

    async relayBlock(block) {
        // Don't relay if no consensus established yet.
        if (!this._synced) {
            return;
        }

        // Create InvVector.
        const hash = await block.hash();
        const vector = new InvVector(InvVector.Type.BLOCK, hash);

        // Don't relay block to this peer if it already knows it.
        if (this._knownObjects.contains(vector)) {
            return;
        }

        // Relay block to peer.
        this._peer.channel.inv([vector]);

        // Assume that the peer knows this block now.
        this._knownObjects.add(vector);
    }

    async relayTransaction(transaction) {
        // TODO Don't relay if no consensus established yet ???

        // Create InvVector.
        const hash = await transaction.hash();
        const vector = new InvVector(InvVector.Type.TRANSACTION, hash);

        // Don't relay transaction to this peer if it already knows it.
        if (this._knownObjects.contains(vector)) {
            return;
        }

        // Relay transaction to peer.
        this._peer.channel.inv([vector]);

        // Assume that the peer knows this transaction now.
        this._knownObjects.add(vector);
    }

    syncBlockchain() {
        this._syncing = true;

        // If the blockchain is still busy processing blocks, wait for it to catch up.
        if (this._blockchain.busy) {
            Log.v(ConsensusAgent, 'Blockchain busy, waiting ...');
        }
        // If we already requested blocks from the peer but it didn't give us any
        // good ones, retry or drop the peer.
        else if (this._lastChainHeight === this._blockchain.height) {
            this._failedSyncs++;
            if (this._failedSyncs < ConsensusAgent.MAX_SYNC_ATTEMPTS) {
                this._requestBlocks();
            } else {
                this._peer.channel.ban('blockchain sync failed');
            }
        }
        // If the peer has a longer chain than us, request blocks from it.
        else if (this._blockchain.height < this._peer.startHeight) {
            this._lastChainHeight = this._blockchain.height;
            this._requestBlocks();
        }
        // The peer has a shorter chain than us.
        // TODO what do we do here?
        else if (this._blockchain.height > this._peer.startHeight) {
            Log.v(ConsensusAgent, `Peer ${this._peer.peerAddress} has a shorter chain (${this._peer.startHeight}) than us`);

            // XXX assume consensus state?
            this._syncing = false;
            this._synced = true;
            this.fire('sync');
        }
        // We have the same chain height as the peer.
        // TODO Do we need to check that we have the same head???
        else {
            // Consensus established.
            this._syncing = false;
            this._synced = true;
            this.fire('sync');
        }
    }

    _requestBlocks() {
        // XXX Only one getblocks request at a time.
        if (this._timers.timeoutExists('getblocks')) {
            Log.e(ConsensusAgent, `Duplicate _requestBlocks()`);
            return;
        }

        // Request blocks starting from our hardest chain head going back to
        // the genesis block. Space out blocks more when getting closer to the
        // genesis block.
        const hashes = [];
        let step = 1;
        for (let i = this._blockchain.path.length - 1; i >= 0; i -= step) {
            // Push top 10 hashes first, then back off exponentially.
            if (hashes.length >= 10) {
                step *= 2;
            }
            hashes.push(this._blockchain.path[i]);
        }

        // Push the genesis block hash.
        if (hashes.length === 0 || !hashes[hashes.length-1].equals(Block.GENESIS.HASH)) {
            hashes.push(Block.GENESIS.HASH);
        }

        // Request blocks from peer.
        this._peer.channel.getblocks(hashes);

        // Drop the peer if it doesn't start sending InvVectors for its chain within the timeout.
        // TODO should we ban here instead?
        this._timers.setTimeout('getblocks', () => {
            this._timers.clearTimeout('getblocks');
            this._peer.channel.close('getblocks timeout');
        }, ConsensusAgent.REQUEST_TIMEOUT);
    }

    async _onInv(msg) {
        // Clear the getblocks timeout.
        this._timers.clearTimeout('getblocks');

        // Keep track of the objects the peer knows.
        for (const vector of msg.vectors) {
            this._knownObjects.add(vector);
        }

        // Check which of the advertised objects we know
        // Request unknown objects, ignore known ones.
        const unknownObjects = [];
        for (const vector of msg.vectors) {
            switch (vector.type) {
                case InvVector.Type.BLOCK: {
                    const block = await this._blockchain.getBlock(vector.hash);
                    if (!block) {
                        unknownObjects.push(vector);
                    }
                    break;
                }
                case InvVector.Type.TRANSACTION: {
                    const tx = await this._mempool.getTransaction(vector.hash);
                    if (!tx) {
                        unknownObjects.push(vector);
                    }
                    break;
                }
                default:
                    throw `Invalid inventory type: ${vector.type}`;
            }
        }

        Log.v(ConsensusAgent, `[INV] ${msg.vectors.length} vectors (${unknownObjects.length} new) received from ${this._peer.peerAddress}`);

        if (unknownObjects.length > 0) {
            // Store unknown vectors in objectsToRequest array.
            for (const obj of unknownObjects) {
                this._objectsToRequest.push(obj);
            }

            // Clear the request throttle timeout.
            this._timers.clearTimeout('inv');

            // If there are enough objects queued up, send out a getdata request.
            if (this._objectsToRequest.length >= ConsensusAgent.REQUEST_THRESHOLD) {
                this._requestData();
            }
            // Otherwise, wait a short time for more inv messages to arrive, then request.
            else {
                this._timers.setTimeout('inv', () => this._requestData(), ConsensusAgent.REQUEST_THROTTLE);
            }
        } else {
            // XXX The peer is weird. Give him another chance.
            this._noMoreData();
        }
    }

    _requestData() {
        // Only one request at a time.
        if (this._objectsInFlight) return;

        // Don't do anything if there are no objects queued to request.
        if (this._objectsToRequest.isEmpty()) return;

        // Mark the requested objects as in-flight.
        this._objectsInFlight = this._objectsToRequest;

        // Request all queued objects from the peer.
        // TODO depending in the REQUEST_THRESHOLD, we might need to split up
        // the getdata request into multiple ones.
        this._peer.channel.getdata(this._objectsToRequest.array);

        // Reset the queue.
        this._objectsToRequest = new IndexedArray([], true);

        // Set timer to detect end of request / missing objects
        this._timers.setTimeout('getdata', () => this._noMoreData(), ConsensusAgent.REQUEST_TIMEOUT);
    }

    _noMoreData() {
        // Cancel the request timeout timer.
        this._timers.clearTimeout('getdata');

        // Reset objects in flight.
        this._objectsInFlight = null;

        // If there are more objects to request, request them.
        if (!this._objectsToRequest.isEmpty()) {
            this._requestData();
        }
        // Otherwise, request more blocks if we are still syncing the blockchain.
        else if (this._syncing) {
            this.syncBlockchain();
        }
    }

    async _onBlock(msg) {
        const hash = await msg.block.hash();

        // Check if we have requested this block.
        const vector = new InvVector(InvVector.Type.BLOCK, hash);
        if (!this._objectsInFlight || this._objectsInFlight.indexOf(vector) < 0) {
            Log.w(ConsensusAgent, `Unsolicited block ${hash} received from ${this._peer.peerAddress}, discarding`);
            // TODO What should happen here? ban? drop connection?
            // Might not be unsolicited but just arrive after our timeout has triggered.
            return;
        }

        // Mark object as received.
        this._onObjectReceived(vector);

        // Put block into blockchain.
        const status = await this._blockchain.pushBlock(msg.block);

        // TODO send reject message if we don't like the block
        if (status === Blockchain.PUSH_ERR_INVALID_BLOCK) {
            this._peer.channel.ban('received invalid block');
        }
    }

    async _onTx(msg) {
        const hash = await msg.transaction.hash();
        Log.i(ConsensusAgent, `[TX] Received transaction ${hash} from ${this._peer.peerAddress}`);

        // Check if we have requested this transaction.
        const vector = new InvVector(InvVector.Type.TRANSACTION, hash);
        if (!this._objectsInFlight || this._objectsInFlight.indexOf(vector) < 0) {
            Log.w(ConsensusAgent, `Unsolicited transaction ${hash} received from ${this._peer.peerAddress}, discarding`);
            return;
        }

        // Mark object as received.
        this._onObjectReceived(vector);

        // Put transaction into mempool.
        this._mempool.pushTransaction(msg.transaction);

        // TODO send reject message if we don't like the transaction
        // TODO what to do if the peer keeps sending invalid transactions?
    }

    _onNotFound(msg) {
        Log.d(ConsensusAgent, `[NOTFOUND] ${msg.vectors.length} unknown objects received from ${this._peer.peerAddress}`);

        // Remove unknown objects from in-flight list.
        for (const vector of msg.vectors) {
            if (!this._objectsInFlight || this._objectsInFlight.indexOf(vector) < 0) {
                Log.w(ConsensusAgent, `Unsolicited notfound vector received from ${this._peer.peerAddress}, discarding`);
                continue;
            }

            this._onObjectReceived(vector);
        }
    }

    _onObjectReceived(vector) {
        if (!this._objectsInFlight) return;

        // Remove the vector from the objectsInFlight.
        this._objectsInFlight.remove(vector);

        // Reset the request timeout if we expect more objects to come.
        if (!this._objectsInFlight.isEmpty()) {
            this._timers.resetTimeout('getdata', () => this._noMoreData(), ConsensusAgent.REQUEST_TIMEOUT);
        } else {
            this._noMoreData();
        }
    }


    /* Request endpoints */

    async _onGetData(msg) {
        // Keep track of the objects the peer knows.
        for (const vector of msg.vectors) {
            this._knownObjects.add(vector);
        }

        // Check which of the requested objects we know.
        // Send back all known objects.
        // Send notfound for unknown objects.
        const unknownObjects = [];
        for (const vector of msg.vectors) {
            switch (vector.type) {
                case InvVector.Type.BLOCK: {
                    const block = await this._blockchain.getBlock(vector.hash);
                    if (block) {
                        // We have found a requested block, send it back to the sender.
                        this._peer.channel.block(block);
                    } else {
                        // Requested block is unknown.
                        unknownObjects.push(vector);
                    }
                    break;
                }
                case InvVector.Type.TRANSACTION: {
                    const tx = await this._mempool.getTransaction(vector.hash);
                    if (tx) {
                        // We have found a requested transaction, send it back to the sender.
                        this._peer.channel.tx(tx);
                    } else {
                        // Requested transaction is unknown.
                        unknownObjects.push(vector);
                    }
                    break;
                }
                default:
                    throw `Invalid inventory type: ${vector.type}`;
            }
        }

        // Report any unknown objects back to the sender.
        if (unknownObjects.length) {
            this._peer.channel.notfound(unknownObjects);
        }
    }

    async _onGetBlocks(msg) {
        Log.v(ConsensusAgent, `[GETBLOCKS] ${msg.hashes.length} block locators received from ${this._peer.peerAddress}`);

        // A peer has requested blocks. Check all requested block locator hashes
        // in the given order and pick the first hash that is found on our main
        // chain, ignore the rest. If none of the requested hashes is found,
        // pick the genesis block hash. Send the main chain starting from the
        // picked hash back to the peer.
        // TODO honor hashStop argument
        const mainPath = this._blockchain.path;
        let startIndex = -1;

        for (const hash of msg.hashes) {
            // Shortcut for genesis block which will be the only block sent by
            // fresh peers.
            if (Block.GENESIS.HASH.equals(hash)) {
                startIndex = 0;
                break;
            }

            // Check if we know the requested block.
            const block = await this._blockchain.getBlock(hash);

            // If we don't know the block, try the next one.
            if (!block) continue;

            // If the block is not on our main chain, try the next one.
            // mainPath is an IndexedArray with constant-time .indexOf()
            startIndex = mainPath.indexOf(hash);
            if (startIndex < 0) continue;

            // We found a block, ignore remaining block locator hashes.
            break;
        }

        // If we found none of the requested blocks on our main chain,
        // start with the genesis block.
        if (startIndex < 0) {
            // XXX Assert that the full path back to genesis is available in
            // blockchain.path. When the chain grows very long, it makes no
            // sense to keep the full path in memory.
            // We relax this assumption for clients that have a checkpoint loaded.
            if (this._blockchain.path.length !== this._blockchain.height
                    && !(this._blockchain.path.length > 0 && this._blockchain.checkPointLoaded && this._blockchain.path[0].equals(Block.CHECKPOINT.HASH))) {
                throw 'Blockchain.path.length != Blockchain.height';
            }

            startIndex = 0;
        }

        // Collect up to GETBLOCKS_VECTORS_MAX inventory vectors for the blocks starting right
        // after the identified block on the main chain.
        const stopIndex = Math.min(mainPath.length - 1, startIndex + ConsensusAgent.GETBLOCKS_VECTORS_MAX);
        const vectors = [];
        for (let i = startIndex + 1; i <= stopIndex; ++i) {
            vectors.push(new InvVector(InvVector.Type.BLOCK, mainPath[i]));
        }

        // Send the vectors back to the requesting peer.
        this._peer.channel.inv(vectors);
    }

    async _onMempool(msg) {
        // Query mempool for transactions
        const transactions = await this._mempool.getTransactions();

        // Send transactions back to sender.
        for (const tx of transactions) {
            this._peer.channel.tx(tx);
        }
    }

    _onClose() {
        // Clear all timers and intervals when the peer disconnects.
        this._timers.clearAll();

        this.fire('close', this);
    }

    get peer() {
        return this._peer;
    }

    get synced() {
        return this._synced;
    }
}
// Number of InvVectors in invToRequest pool to automatically trigger a getdata request.
ConsensusAgent.REQUEST_THRESHOLD = 50;
// Time to wait after the last received inv message before sending getdata.
ConsensusAgent.REQUEST_THROTTLE = 500; // ms
// Maximum time to wait after sending out getdata or receiving the last object for this request.
ConsensusAgent.REQUEST_TIMEOUT = 5000; // ms
// Maximum number of blockchain sync retries before closing the connection.
// XXX If the peer is on a long fork, it will count as a failed sync attempt
// if our blockchain doesn't switch to the fork within 500 (max InvVectors returned by getblocks)
// blocks.
ConsensusAgent.MAX_SYNC_ATTEMPTS = 5;
// Maximum number of inventory vectors to sent in the response for onGetBlocks.
ConsensusAgent.GETBLOCKS_VECTORS_MAX = 500;
Class.register(ConsensusAgent);

class Consensus extends Observable {
    constructor(blockchain, mempool, network) {
        super();
        this._blockchain = blockchain;
        this._mempool = mempool;

        this._agents = new HashMap();
        this._timers = new Timers();
        this._syncing = false;
        this._established = false;

        network.on('peer-joined', peer => this._onPeerJoined(peer));
        network.on('peer-left', peer => this._onPeerLeft(peer));

        // Notify peers when our blockchain head changes.
        blockchain.on('head-changed', head => {
            // Don't announce head changes if we are not synced yet.
            if (!this._established) return;

            for (const agent of this._agents.values()) {
                agent.relayBlock(head);
            }
        });

        // Relay new (verified) transactions to peers.
        mempool.on('transaction-added', tx => {
            // Don't relay transactions if we are not synced yet.
            if (!this._established) return;

            for (const agent of this._agents.values()) {
                agent.relayTransaction(tx);
            }
        });
    }

    _onPeerJoined(peer) {
        // Create a ConsensusAgent for each peer that connects.
        const agent = new ConsensusAgent(this._blockchain, this._mempool, peer);
        this._agents.put(peer.id, agent);

        // If no more peers connect within the specified timeout, start syncing.
        this._timers.resetTimeout('sync', this._syncBlockchain.bind(this), Consensus.SYNC_THROTTLE);
    }

    _onPeerLeft(peer) {
        this._agents.remove(peer.id);
    }

    _syncBlockchain() {
        // Wait for ongoing sync to finish.
        if (this._syncing) {
            return;
        }

        // Find the peers with the hardest chain that aren't sync'd yet.
        let bestTotalWork = -1;
        let bestAgents = [];
        for (const agent of this._agents.values()) {
            if (!agent.synced && agent.peer.totalWork > bestTotalWork) {
                bestTotalWork = agent.peer.totalWork;
                bestAgents = [agent];
            } else if (!agent.synced && agent.peer.totalWork === bestTotalWork) {
                bestAgents.push(agent);
            }
        }
        // Choose a random peer from those.
        let bestAgent = null;
        if (bestAgents.length > 0) {
            bestAgent = bestAgents[Math.floor(Math.random() * bestAgents.length)];
        }

        if (!bestAgent) {
            // We are synced with all connected peers.
            this._syncing = false;

            if (this._agents.length > 0) {
                // Report consensus-established if we have at least one connected peer.
                Log.d(Consensus, `Synced with all connected peers (${this._agents.length}), consensus established.`);
                Log.d(Consensus, `Blockchain: height=${this._blockchain.height}, totalWork=${this._blockchain.totalWork}, headHash=${this._blockchain.headHash}`);

                this._established = true;
                this.fire('established');
            } else {
                // We are not connected to any peers anymore. Report consensus-lost.
                this._established = false;
                this.fire('lost');
            }

            return;
        }

        Log.v(Consensus, `Syncing blockchain with peer ${bestAgent.peer.peerAddress}`);

        this._syncing = true;

        // If we expect this sync to change our blockchain height, tell listeners about it.
        if (bestAgent.peer.startHeight > this._blockchain.height) {
            this.fire('syncing', bestAgent.peer.startHeight);
        }

        bestAgent.on('sync', () => this._onPeerSynced());
        bestAgent.on('close', () => {
            this._onPeerLeft(bestAgent.peer);
            this._onPeerSynced();
        });
        bestAgent.syncBlockchain();
    }

    _onPeerSynced() {
        this._syncing = false;
        this._syncBlockchain();
    }

    get established() {
        return this._established;
    }

    // TODO confidence level?
}
Consensus.SYNC_THROTTLE = 1500; // 1.5 seconds
Class.register(Consensus);

class Protocol {
}
Protocol.DUMB = 0;
Protocol.WS = 1;
Protocol.RTC = 2;
Class.register(Protocol);

class NetAddress {
    static fromIP(ip) {
        const saneIp = NetUtils.sanitizeIP(ip);
        return new NetAddress(saneIp);
    }

    constructor(ip) {
        this._ip = ip;
    }

    static unserialize(buf) {
        const ip = buf.readVarLengthString();

        // Allow empty NetAddresses.
        if (!ip) {
            return NetAddress.UNSPECIFIED;
        }

        return NetAddress.fromIP(ip);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeVarLengthString(this._ip);
        return buf;
    }

    get serializedSize() {
        return /*extraByte VarLengthString ip*/ 1
            + /*ip*/ this._ip.length;
    }

    equals(o) {
        return o instanceof NetAddress
            && this._ip === o.ip;
    }

    hashCode() {
        return this.toString();
    }

    toString() {
        return `${this._ip}`;
    }

    get ip() {
        return this._ip;
    }

    isPseudo() {
        return !this._ip || NetAddress.UNKNOWN.equals(this);
    }

    isPrivate() {
        return this.isPseudo() || NetUtils.isPrivateIP(this._ip);
    }
}
NetAddress.UNSPECIFIED = new NetAddress('');
NetAddress.UNKNOWN = new NetAddress('<unknown>');
Class.register(NetAddress);

class PeerAddress {
    constructor(protocol, services, timestamp, netAddress) {
        this._protocol = protocol;
        this._services = services;
        this._timestamp = timestamp;
        this._netAddress = netAddress || NetAddress.UNSPECIFIED;
    }

    static unserialize(buf) {
        const protocol = buf.readUint8();
        switch (protocol) {
            case Protocol.WS:
                return WsPeerAddress.unserialize(buf);

            case Protocol.RTC:
                return RtcPeerAddress.unserialize(buf);

            case Protocol.DUMB:
                return DumbPeerAddress.unserialize(buf);

            default:
                throw `Malformed PeerAddress protocol ${protocol}`;
        }
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeUint8(this._protocol);
        buf.writeUint32(this._services);
        buf.writeUint64(this._timestamp);

        // Never serialize private netAddresses.
        if (this._netAddress.isPrivate()) {
            NetAddress.UNSPECIFIED.serialize(buf);
        } else {
            this._netAddress.serialize(buf);
        }

        return buf;
    }

    get serializedSize() {
        return /*protocol*/ 1
            + /*services*/ 4
            + /*timestamp*/ 8
            + this._netAddress.serializedSize;
    }

    equals(o) {
        return o instanceof PeerAddress
            && this._protocol === o.protocol;
            /* services is ignored */
            /* timestamp is ignored */
            /* netAddress is ignored */
    }

    get protocol() {
        return this._protocol;
    }

    get services() {
        return this._services;
    }

    get timestamp() {
        return this._timestamp;
    }

    set timestamp(value) {
        // Never change the timestamp of a seed address.
        if (this.isSeed()) {
            return;
        }
        this._timestamp = value;
    }

    get netAddress() {
        return this._netAddress.isPseudo() ? null : this._netAddress;
    }

    set netAddress(value) {
        this._netAddress = value || NetAddress.UNSPECIFIED;
    }

    isSeed() {
        return this._timestamp === 0;
    }
}
Class.register(PeerAddress);

class WsPeerAddress extends PeerAddress {
    static seed(host, port) {
        return new WsPeerAddress(Services.DEFAULT, /*timestamp*/ 0, NetAddress.UNSPECIFIED, host, port);
    }

    constructor(services, timestamp, netAddress, host, port) {
        super(Protocol.WS, services, timestamp, netAddress);
        if (!host) throw 'Malformed host';
        if (!NumberUtils.isUint16(port)) throw 'Malformed port';
        this._host = host;
        this._port = port;
    }

    static unserialize(buf) {
        const services = buf.readUint32();
        const timestamp = buf.readUint64();
        const netAddress = NetAddress.unserialize(buf);
        const host = buf.readVarLengthString();
        const port = buf.readUint16();
        return new WsPeerAddress(services, timestamp, netAddress, host, port);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeVarLengthString(this._host);
        buf.writeUint16(this._port);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*extra byte VarLengthString host*/ 1
            + this._host.length
            + /*port*/ 2;
    }

    equals(o) {
        return super.equals(o)
            && o instanceof WsPeerAddress
            && this._host === o.host
            && this._port === o.port;
    }

    hashCode() {
        return this.toString();
    }

    toString() {
        return `wss://${this._host}:${this._port}`;
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}
Class.register(WsPeerAddress);

class RtcPeerAddress extends PeerAddress {
    constructor(services, timestamp, netAddress, signalId, distance) {
        super(Protocol.RTC, services, timestamp, netAddress);
        if (!RtcPeerAddress.isSignalId(signalId)) throw 'Malformed signalId';
        if (!NumberUtils.isUint8(distance)) throw 'Malformed distance';
        this._signalId = signalId;
        this._distance = distance;
    }

    static isSignalId(arg) {
        return /[a-z0-9]{32}/i.test(arg);
    }

    static unserialize(buf) {
        const services = buf.readUint32();
        const timestamp = buf.readUint64();
        const netAddress = NetAddress.unserialize(buf);
        const signalId = buf.readString(32);
        const distance = buf.readUint8();
        return new RtcPeerAddress(services, timestamp, netAddress, signalId, distance);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeString(this._signalId, 32);
        buf.writeUint8(this._distance);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*signalId*/ 32
            + /*distance*/ 1;
    }

    equals(o) {
        return super.equals(o)
            && o instanceof RtcPeerAddress
            && this._signalId === o.signalId;
    }

    hashCode() {
        return this.toString();
    }

    toString() {
        return `rtc://${this._signalId}`;
    }

    get signalId() {
        return this._signalId;
    }

    get distance() {
        return this._distance;
    }

    // Changed when passed on to other peers.
    set distance(value) {
        this._distance = value;
    }
}
Class.register(RtcPeerAddress);

class DumbPeerAddress extends PeerAddress {
    constructor(services, timestamp, netAddress, id) {
        super(Protocol.DUMB, services, timestamp, netAddress);
        this._id = id;
    }

    static unserialize(buf) {
        const services = buf.readUint32();
        const timestamp = buf.readUint64();
        const netAddress = NetAddress.unserialize(buf);
        const id = buf.readUint64();
        return new DumbPeerAddress(services, timestamp, netAddress, id);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint64(this._id);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*id*/ 8;
    }

    equals(o) {
        return super.equals(o)
            && o instanceof DumbPeerAddress
            && this._id === o.id;
    }

    hashCode() {
        return this.toString();
    }

    toString() {
        return `${this._id}`;
    }

    get id() {
        return this._id;
    }
}
Class.register(DumbPeerAddress);

// TODO Limit the number of addresses we store.
class PeerAddresses extends Observable {
    constructor() {
        super();

        // Set of PeerAddressStates of all peerAddresses we know.
        this._store = new HashSet();

        // Map from signalIds to RTC peerAddresses.
        this._signalIds = new HashMap();

        // Number of WebSocket/WebRTC peers.
        this._peerCountWs = 0;
        this._peerCountRtc = 0;
        this._peerCountDumb = 0;

        // Init seed peers.
        this.add(/*channel*/ null, PeerAddresses.SEED_PEERS);

        // Setup housekeeping interval.
        setInterval(() => this._housekeeping(), PeerAddresses.HOUSEKEEPING_INTERVAL);
    }

    pickAddress() {
        const addresses = this._store.values();
        const numAddresses = addresses.length;

        // Pick a random start index.
        const index = Math.floor(Math.random() * numAddresses);

        // Score up to 1000 addresses starting from the start index and pick the
        // one with the highest score. Never pick addresses with score < 0.
        const minCandidates = Math.min(numAddresses, 1000);
        const candidates = new HashMap();
        for (let i = 0; i < numAddresses; i++) {
            const idx = (index + i) % numAddresses;
            const address = addresses[idx];
            const score = this._scoreAddress(address);
            if (score >= 0) {
                candidates.put(score, address);
                if (candidates.length >= minCandidates) {
                    break;
                }
            }
        }

        if (candidates.length === 0) {
            return null;
        }

        // Return the candidate with the highest score.
        const scores = candidates.keys().sort((a, b) => b - a);
        const winner = candidates.get(scores[0]);
        return winner.peerAddress;
    }

    _scoreAddress(peerAddressState) {
        const peerAddress = peerAddressState.peerAddress;

        // Filter addresses that we cannot connect to.
        if (!NetworkConfig.canConnect(peerAddress.protocol)) {
            return -1;
        }

        // Filter addresses that are too old.
        if (this._exceedsAge(peerAddress)) {
            return -1;
        }

        const score = this._scoreProtocol(peerAddress)
            * ((peerAddress.timestamp / 1000) + 1);

        switch (peerAddressState.state) {
            case PeerAddressState.CONNECTING:
            case PeerAddressState.CONNECTED:
            case PeerAddressState.BANNED:
                return -1;

            case PeerAddressState.NEW:
            case PeerAddressState.TRIED:
                return score;

            case PeerAddressState.FAILED:
                return (1 - (peerAddressState.failedAttempts / peerAddressState.maxFailedAttempts)) * score;

            default:
                return -1;
        }
    }

    _scoreProtocol(peerAddress) {
        let score = 1;

        // We want at least two websocket connection
        if (this._peerCountWs < 2) {
            score *= peerAddress.protocol === Protocol.WS ? 3 : 1;
        } else {
            score *= peerAddress.protocol === Protocol.RTC ? 3 : 1;
        }

        // Prefer WebRTC addresses with lower distance:
        //  distance = 0: self
        //  distance = 1: direct connection
        //  distance = 2: 1 hop
        //  ...
        // We only expect distance >= 2 here.
        if (peerAddress.protocol === Protocol.RTC) {
            score *= 1 + ((PeerAddresses.MAX_DISTANCE - peerAddress.distance) / 2);
        }

        return score;
    }

    get peerCount() {
        return this._peerCountWs + this._peerCountRtc + this._peerCountDumb;
    }

    get(peerAddress) {
        return this._store.get(peerAddress);
    }

    getChannelBySignalId(signalId) {
        const peerAddressState = this._signalIds.get(signalId);
        if (peerAddressState && peerAddressState.bestRoute) {
            return peerAddressState.bestRoute.signalChannel;
        }
        return null;
    }

    // TODO improve this by returning the best addresses first.
    query(protocolMask, serviceMask, maxAddresses = 1000) {
        // XXX inefficient linear scan
        const now = Date.now();
        const addresses = [];
        for (const peerAddressState of this._store.values()) {
            // Never return banned or failed addresses.
            if (peerAddressState.state === PeerAddressState.BANNED
                    || peerAddressState.state === PeerAddressState.FAILED) {
                continue;
            }

            // Never return seed peers.
            const address = peerAddressState.peerAddress;
            if (address.isSeed()) {
                continue;
            }

            // Only return addresses matching the protocol mask.
            if ((address.protocol & protocolMask) === 0) {
                continue;
            }

            // Only return addresses matching the service mask.
            if ((address.services & serviceMask) === 0) {
                continue;
            }

            // Update timestamp for connected peers.
            if (peerAddressState.state === PeerAddressState.CONNECTED) {
                address.timestamp = now;
                // Also update timestamp for RTC connections
                if (peerAddressState.bestRoute) {
                    peerAddressState.bestRoute.timestamp = now;
                }
            }

            // Never return addresses that are too old.
            if (this._exceedsAge(address)) {
                continue;
            }

            // Return this address.
            addresses.push(address);

            // Stop if we have collected maxAddresses.
            if (addresses.length >= maxAddresses) {
                break;
            }
        }
        return addresses;
    }

    add(channel, arg) {
        const peerAddresses = arg.length !== undefined ? arg : [arg];
        const newAddresses = [];

        for (const addr of peerAddresses) {
            if (this._add(channel, addr)) {
                newAddresses.push(addr);
            }
        }

        // Tell listeners that we learned new addresses.
        if (newAddresses.length) {
            this.fire('added', newAddresses, this);
        }
    }

    _add(channel, peerAddress) {
        // Ignore our own address.
        if (NetworkConfig.myPeerAddress().equals(peerAddress)) {
            return false;
        }

        // Ignore address if it is too old.
        // Special case: allow seed addresses (timestamp == 0) via null channel.
        if (channel && this._exceedsAge(peerAddress)) {
            Log.d(PeerAddresses, `Ignoring address ${peerAddress} - too old (${new Date(peerAddress.timestamp)})`);
            return false;
        }

        // Ignore address if its timestamp is too far in the future.
        if (peerAddress.timestamp > Date.now() + PeerAddresses.MAX_TIMESTAMP_DRIFT) {
            Log.d(PeerAddresses, `Ignoring addresses ${peerAddress} - timestamp in the future`);
            return false;
        }

        // Increment distance values of RTC addresses.
        if (peerAddress.protocol === Protocol.RTC) {
            peerAddress.distance++;

            // Ignore address if it exceeds max distance.
            if (peerAddress.distance > PeerAddresses.MAX_DISTANCE) {
                Log.d(PeerAddresses, `Ignoring address ${peerAddress} - max distance exceeded`);
                // Drop any route to this peer over the current channel. This may prevent loops.
                const peerAddressState = this._store.get(peerAddress);
                if (peerAddressState) {
                    peerAddressState.deleteRoute(channel);
                }
                return false;
            }
        }

        // Check if we already know this address.
        let peerAddressState = this._store.get(peerAddress);
        if (peerAddressState) {
            const knownAddress = peerAddressState.peerAddress;

            // Ignore address if it is banned.
            if (peerAddressState.state === PeerAddressState.BANNED) {
                return false;
            }

            // Never update the timestamp of seed peers.
            if (knownAddress.isSeed()) {
                peerAddress.timestamp = 0;
            }

            // Never erase NetAddresses.
            if (knownAddress.netAddress && !peerAddress.netAddress) {
                peerAddress.netAddress = knownAddress.netAddress;
            }

            // Ignore address if it is a websocket address and we already know this address with a more recent timestamp.
            if (peerAddress.protocol === Protocol.WS && knownAddress.timestamp >= peerAddress.timestamp) {
                return false;
            }
        } else {
            // Add new peerAddressState.
            peerAddressState = new PeerAddressState(peerAddress);
            this._store.add(peerAddressState);
            if (peerAddress.protocol === Protocol.RTC) {
                // Index by signalId.
                this._signalIds.put(peerAddress.signalId, peerAddressState);
            }
        }

        // Add route.
        if (peerAddress.protocol === Protocol.RTC) {
            peerAddressState.addRoute(channel, peerAddress.distance, peerAddress.timestamp);
        }

        // If we are currently connected, allow only updates to the netAddress and only if we don't know it yet.
        if (peerAddressState.state === PeerAddressState.CONNECTED) {
            if (!peerAddressState.peerAddress.netAddress && peerAddress.netAddress) {
                peerAddressState.peerAddress.netAddress = peerAddress.netAddress;
            }

            return false;
        }

        // Update the address.
        peerAddressState.peerAddress = peerAddress;

        return true;
    }

    // Called when a connection to this peerAddress is being established.
    connecting(peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            return;
        }
        if (peerAddressState.state === PeerAddressState.BANNED) {
            throw 'Connecting to banned address';
        }
        if (peerAddressState.state === PeerAddressState.CONNECTED) {
            throw `Duplicate connection to ${peerAddress}`;
        }

        peerAddressState.state = PeerAddressState.CONNECTING;
    }

    // Called when a connection to this peerAddress has been established.
    // The connection might have been initiated by the other peer, so address
    // may not be known previously.
    // If it is already known, it has been updated by a previous version message.
    connected(channel, peerAddress) {
        let peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            peerAddressState = new PeerAddressState(peerAddress);

            if (peerAddress.protocol === Protocol.RTC) {
                this._signalIds.put(peerAddress.signalId, peerAddressState);
            }

            this._store.add(peerAddressState);
        } else {
            // Never update the timestamp of seed peers.
            if (peerAddressState.peerAddress.isSeed()) {
                peerAddress.timestamp = 0;
            }
        }

        if (peerAddressState.state === PeerAddressState.BANNED
            // Allow recovering seed peer's inbound connection to succeed.
            && !peerAddressState.peerAddress.isSeed()) {

            throw 'Connected to banned address';
        }

        if (peerAddressState.state !== PeerAddressState.CONNECTED) {
            this._updateConnectedPeerCount(peerAddress, 1);
        }

        peerAddressState.state = PeerAddressState.CONNECTED;
        peerAddressState.lastConnected = Date.now();
        peerAddressState.failedAttempts = 0;

        peerAddressState.peerAddress = peerAddress;
        peerAddressState.peerAddress.timestamp = Date.now();

        // Add route.
        if (peerAddress.protocol === Protocol.RTC) {
            peerAddressState.addRoute(channel, peerAddress.distance, peerAddress.timestamp);
        }
    }

    // Called when a connection to this peerAddress is closed.
    disconnected(channel, closedByRemote) {
        const peerAddress = channel.peerAddress;
        const peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            return;
        }
        if (peerAddressState.state !== PeerAddressState.CONNECTING
            && peerAddressState.state !== PeerAddressState.CONNECTED) {
            throw `disconnected() called in unexpected state ${peerAddressState.state}`;
        }

        // Delete all addresses that were signalable over the disconnected peer.
        this._removeBySignalChannel(channel);

        if (peerAddressState.state === PeerAddressState.CONNECTED) {
            this._updateConnectedPeerCount(peerAddress, -1);
        }

        // Always set state to tried, even when deciding to delete this address.
        // In the latter case, this will not influence the deletion,
        // but it will prevent decrementing the peer count twice when banning seed nodes.
        peerAddressState.state = PeerAddressState.TRIED;

        // XXX Immediately delete address if the remote host closed the connection.
        // Also immediately delete dumb clients, since we cannot connect to those anyway.
        if (closedByRemote || peerAddress.protocol === Protocol.DUMB) {
            this._remove(peerAddress);
        }
    }

    // Called when a connection attempt to this peerAddress has failed.
    unreachable(peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            return;
        }
        if (peerAddressState.state === PeerAddressState.BANNED) {
            return;
        }

        peerAddressState.state = PeerAddressState.FAILED;
        peerAddressState.failedAttempts++;

        if (peerAddressState.failedAttempts >= peerAddressState.maxFailedAttempts) {
            this._remove(peerAddress);
        }
    }

    // Called when a message has been returned as unroutable.
    unroutable(channel, peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            return;
        }

        if (!peerAddressState.bestRoute || !peerAddressState.bestRoute.signalChannel.equals(channel)) {
            Log.w(PeerAddresses, `Got unroutable for ${peerAddress} on a channel other than the best route.`);
            return;
        }

        peerAddressState.deleteBestRoute();
        if (!peerAddressState.hasRoute()) {
            this._remove(peerAddressState.peerAddress);
        }
    }

    ban(peerAddress, duration = 10 /*minutes*/) {
        let peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            peerAddressState = new PeerAddressState(peerAddress);
            this._store.add(peerAddressState);
        }
        if (peerAddressState.state === PeerAddressState.CONNECTED) {
            this._updateConnectedPeerCount(peerAddress, -1);
        }

        peerAddressState.state = PeerAddressState.BANNED;
        peerAddressState.bannedUntil = Date.now() + duration * 60 * 1000;

        // Drop all routes to this peer.
        peerAddressState.deleteAllRoutes();
    }

    isConnecting(peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        return peerAddressState && peerAddressState.state === PeerAddressState.CONNECTING;
    }

    isConnected(peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        return peerAddressState && peerAddressState.state === PeerAddressState.CONNECTED;
    }

    isBanned(peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        return peerAddressState
            && peerAddressState.state === PeerAddressState.BANNED
            // XXX Never consider seed peers to be banned. This allows us to use
            // the banning mechanism to prevent seed peers from being picked when
            // they are down, but still allows recovering seed peers' inbound
            // connections to succeed.
            && !peerAddressState.peerAddress.isSeed();
    }

    _remove(peerAddress) {
        const peerAddressState = this._store.get(peerAddress);
        if (!peerAddressState) {
            return;
        }

        // Never delete seed addresses, ban them instead for 5 minutes.
        if (peerAddressState.peerAddress.isSeed()) {
            this.ban(peerAddress, 5);
            return;
        }

        // Delete from signalId index.
        if (peerAddress.protocol === Protocol.RTC) {
            this._signalIds.remove(peerAddress.signalId);
        }

        // Don't delete bans.
        if (peerAddressState.state === PeerAddressState.BANNED) {
            return;
        }

        // Delete the address.
        this._store.remove(peerAddress);
    }

    // Delete all RTC-only routes that are signalable over the given peer.
    _removeBySignalChannel(channel) {
        // XXX inefficient linear scan
        for (const peerAddressState of this._store.values()) {
            if (peerAddressState.peerAddress.protocol === Protocol.RTC) {
                peerAddressState.deleteRoute(channel);
                if (!peerAddressState.hasRoute()) {
                    this._remove(peerAddressState.peerAddress);
                }
            }
        }
    }

    _updateConnectedPeerCount(peerAddress, delta) {
        switch (peerAddress.protocol) {
            case Protocol.WS:
                this._peerCountWs += delta;
                break;
            case Protocol.RTC:
                this._peerCountRtc += delta;
                break;
            case Protocol.DUMB:
                this._peerCountDumb += delta;
                break;
            default:
                Log.w(PeerAddresses, `Unknown protocol ${peerAddress.protocol}`);
        }
    }

    _housekeeping() {
        const now = Date.now();
        const unbannedAddresses = [];

        for (const peerAddressState of this._store.values()) {
            const addr = peerAddressState.peerAddress;

            switch (peerAddressState) {
                case PeerAddressState.NEW:
                case PeerAddressState.TRIED:
                case PeerAddressState.FAILED:
                    // Delete all new peer addresses that are older than MAX_AGE.
                    if (this._exceedsAge(addr)) {
                        Log.d(PeerAddresses, `Deleting old peer address ${addr}`);
                        this._remove(addr);
                    }
                    break;

                case PeerAddressState.BANNED:
                    if (peerAddressState.bannedUntil <= now) {
                        if (addr.isSeed()) {
                            // Restore banned seed addresses to the NEW state.
                            peerAddressState.state = PeerAddressState.NEW;
                            peerAddressState.failedAttempts = 0;
                            peerAddressState.bannedUntil = -1;
                            unbannedAddresses.push(addr);
                        } else {
                            // Delete expires bans.
                            this._store.remove(addr);
                        }
                    }
                    break;

                case PeerAddressState.CONNECTED:
                    // Keep timestamp up-to-date while we are connected.
                    addr.timestamp = now;
                    // Also update timestamp for RTC connections
                    if (peerAddressState.bestRoute) {
                        peerAddressState.bestRoute.timestamp = now;
                    }
                    break;

                default:
                    // TODO What about peers who are stuck connecting? Can this happen?
                    // Do nothing for CONNECTING peers.
            }
        }

        if (unbannedAddresses.length) {
            this.fire('added', unbannedAddresses, this);
        }
    }

    _exceedsAge(peerAddress) {
        // Seed addresses are never too old.
        if (peerAddress.isSeed()) {
            return false;
        }

        const age = Date.now() - peerAddress.timestamp;
        switch (peerAddress.protocol) {
            case Protocol.WS:
                return age > PeerAddresses.MAX_AGE_WEBSOCKET;

            case Protocol.RTC:
                return age > PeerAddresses.MAX_AGE_WEBRTC;

            case Protocol.DUMB:
                return age > PeerAddresses.MAX_AGE_DUMB;
        }
        return false;
    }

    get peerCountWs() {
        return this._peerCountWs;
    }

    get peerCountRtc() {
        return this._peerCountRtc;
    }

    get peerCountDumb() {
        return this._peerCountDumb;
    }
}
PeerAddresses.MAX_AGE_WEBSOCKET = 1000 * 60 * 15; // 15 minutes
PeerAddresses.MAX_AGE_WEBRTC = 1000 * 45; // 45 seconds
PeerAddresses.MAX_AGE_DUMB = 1000 * 45; // 45 seconds
PeerAddresses.MAX_DISTANCE = 4;
PeerAddresses.MAX_FAILED_ATTEMPTS_WS = 3;
PeerAddresses.MAX_FAILED_ATTEMPTS_RTC = 2;
PeerAddresses.MAX_TIMESTAMP_DRIFT = 1000 * 60 * 10; // 10 minutes
PeerAddresses.HOUSEKEEPING_INTERVAL = 1000 * 60 * 3; // 3 minutes
PeerAddresses.SEED_PEERS = [
    WsPeerAddress.seed('alpacash.com', 8080),
    WsPeerAddress.seed('nimiq1.styp-rekowsky.de', 8080),
    WsPeerAddress.seed('nimiq2.styp-rekowsky.de', 8080),
    WsPeerAddress.seed('seed1.nimiq-network.com', 8080),
    WsPeerAddress.seed('seed2.nimiq-network.com', 8080),
    WsPeerAddress.seed('seed3.nimiq-network.com', 8080),
    WsPeerAddress.seed('seed4.nimiq-network.com', 8080),
    WsPeerAddress.seed('emily.nimiq-network.com', 443)
];
Class.register(PeerAddresses);

class PeerAddressState {
    constructor(peerAddress) {
        this.peerAddress = peerAddress;

        this.state = PeerAddressState.NEW;
        this.lastConnected = -1;
        this.bannedUntil = -1;

        this._bestRoute = null;
        this._routes = new HashSet();

        this._failedAttempts = 0;
    }

    get maxFailedAttempts() {
        switch (this.peerAddress.protocol) {
            case Protocol.RTC:
                return PeerAddresses.MAX_FAILED_ATTEMPTS_RTC;
            case Protocol.WS:
                return PeerAddresses.MAX_FAILED_ATTEMPTS_WS;
            default:
                return 0;
        }
    }

    get failedAttempts() {
        if (this._bestRoute) {
            return this._bestRoute.failedAttempts;
        } else {
            return this._failedAttempts;
        }
    }

    set failedAttempts(value) {
        if (this._bestRoute) {
            this._bestRoute.failedAttempts = value;
            this._updateBestRoute(); // scores may have changed
        } else {
            this._failedAttempts = value;
        }
    }

    get bestRoute() {
        return this._bestRoute;
    }

    addRoute(signalChannel, distance, timestamp) {
        const oldRoute = this._routes.get(signalChannel);
        const newRoute = new SignalRoute(signalChannel, distance, timestamp);

        if (oldRoute) {
            // Do not reset failed attempts.
            newRoute.failedAttempts = oldRoute.failedAttempts;
        }
        this._routes.add(newRoute);

        if (!this._bestRoute || newRoute.score > this._bestRoute.score
            || (newRoute.score === this._bestRoute.score && timestamp > this._bestRoute.timestamp)) {

            this._bestRoute = newRoute;
            this.peerAddress.distance = this._bestRoute.distance;
        }
    }

    deleteBestRoute() {
        if (this._bestRoute) {
            this.deleteRoute(this._bestRoute.signalChannel);
        }
    }

    deleteRoute(signalChannel) {
        this._routes.remove(signalChannel); // maps to same hashCode
        if (this._bestRoute && this._bestRoute.signalChannel.equals(signalChannel)) {
            this._updateBestRoute();
        }
    }

    deleteAllRoutes() {
        this._bestRoute = null;
        this._routes = new HashSet();
    }

    hasRoute() {
        return this._routes.length > 0;
    }

    _updateBestRoute() {
        let bestRoute = null;
        // Choose the route with minimal distance and maximal timestamp.
        for (const route of this._routes.values()) {
            if (bestRoute === null || route.score > bestRoute.score
                || (route.score === bestRoute.score && route.timestamp > bestRoute.timestamp)) {

                bestRoute = route;
            }
        }
        this._bestRoute = bestRoute;
        if (this._bestRoute) {
            this.peerAddress.distance = this._bestRoute.distance;
        } else {
            this.peerAddress.distance = PeerAddresses.MAX_DISTANCE + 1;
        }
    }

    equals(o) {
        return o instanceof PeerAddressState
            && this.peerAddress.equals(o.peerAddress);
    }

    hashCode() {
        return this.peerAddress.hashCode();
    }

    toString() {
        return `PeerAddressState{peerAddress=${this.peerAddress}, state=${this.state}, `
            + `lastConnected=${this.lastConnected}, failedAttempts=${this.failedAttempts}, `
            + `bannedUntil=${this.bannedUntil}}`;
    }
}
PeerAddressState.NEW = 1;
PeerAddressState.CONNECTING = 2;
PeerAddressState.CONNECTED = 3;
PeerAddressState.TRIED = 4;
PeerAddressState.FAILED = 5;
PeerAddressState.BANNED = 6;
Class.register(PeerAddressState);

class SignalRoute {
    constructor(signalChannel, distance, timestamp) {
        this.failedAttempts = 0;
        this.timestamp = timestamp;
        this._signalChannel = signalChannel;
        this._distance = distance;
    }

    get signalChannel() {
        return this._signalChannel;
    }

    get distance() {
        return this._distance;
    }

    get score() {
        return ((PeerAddresses.MAX_DISTANCE - this._distance) / 2) * (1 - (this.failedAttempts / PeerAddresses.MAX_FAILED_ATTEMPTS_RTC));
    }

    equals(o) {
        return o instanceof SignalRoute
            && this._signalChannel.equals(o._signalChannel);
    }

    hashCode() {
        return this._signalChannel.hashCode();
    }

    toString() {
        return `SignalRoute{signalChannel=${this._signalChannel}, distance=${this._distance}, timestamp=${this.timestamp}, failedAttempts=${this.failedAttempts}}`;
    }
}
Class.register(SignalRoute);

class Message {
    constructor(type) {
        if (!type || !type.length || StringUtils.isMultibyte(type) || type.length > 12) throw 'Malformed type';
        this._type = type;
    }

    static peekType(buf) {
        // Store current read position.
        const pos = buf.readPos;

        // Set read position past the magic to the beginning of the type string.
        buf.readPos = 4;

        // Read the type string.
        const type = buf.readPaddedString(12);

        // Reset the read position to original.
        buf.readPos = pos;

        return type;
    }

    static _writeChecksum(buf, value) {
        // Store current write position.
        const pos = buf.writePos;

        // Set write position past the magic, type, and length fields to the
        // beginning of the checksum value.
        buf.writePos = 4 + 12 + 4;

        // Write the checksum value.
        buf.writeUint32(value);

        // Reset the write position to original.
        buf.writePos = pos;
    }

    static unserialize(buf) {
        // XXX Direct buffer manipulation currently requires this.
        if (buf.readPos !== 0) {
            throw 'Message.unserialize() requires buf.readPos == 0';
        }

        const magic = buf.readUint32();
        const type = buf.readPaddedString(12);
        buf.readUint32(); // length is ignored
        const checksum = buf.readUint32();

        // Validate magic.
        if (magic !== Message.MAGIC) throw 'Malformed magic';

        // Validate checksum.
        Message._writeChecksum(buf, 0);
        const calculatedChecksum = CRC32.compute(buf);
        if (checksum !== calculatedChecksum) throw 'Invalid checksum';

        return new Message(type);
    }

    _setChecksum(buf) {
        const checksum = CRC32.compute(buf);
        Message._writeChecksum(buf, checksum);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        // XXX Direct buffer manipulation currently requires this.
        if (buf.writePos !== 0) {
            throw 'Message.serialize() requires buf.writePos == 0';
        }

        buf.writeUint32(Message.MAGIC);
        buf.writePaddedString(this._type, 12);
        buf.writeUint32(this.serializedSize);
        buf.writeUint32(0); // written later by _setChecksum()

        return buf;
    }

    get serializedSize() {
        return /*magic*/ 4
            + /*type*/ 12
            + /*length*/ 4
            + /*checksum*/ 4;
    }

    get type() {
        return this._type;
    }
}
Message.MAGIC = 0x42042042;
Message.Type = {
    VERSION: 'version',
    INV: 'inv',
    GETDATA: 'getdata',
    NOTFOUND: 'notfound',
    GETBLOCKS: 'getblocks',
    GETHEADERS: 'getheaders',
    TX: 'tx',
    BLOCK: 'block',
    HEADERS: 'headers',
    MEMPOOL: 'mempool',
    REJECT: 'reject',

    ADDR: 'addr',
    GETADDR: 'getaddr',
    PING: 'ping',
    PONG: 'pong',

    SIGNAL: 'signal',

    SENDHEADERS: 'sendheaders',

    // Nimiq
    GETBALANCES: 'getbalances',
    BALANCES: 'balances'
};
Class.register(Message);

class AddrMessage extends Message {
    constructor(addresses) {
        super(Message.Type.ADDR);
        if (!addresses || !NumberUtils.isUint16(addresses.length)
            || addresses.some(it => !(it instanceof PeerAddress))) throw 'Malformed addresses';
        this._addresses = addresses;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const count = buf.readUint16();
        const addresses = [];
        for (let i = 0; i < count; ++i) {
            addresses.push(PeerAddress.unserialize(buf));
        }
        return new AddrMessage(addresses);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint16(this._addresses.length);
        for (const addr of this._addresses) {
            addr.serialize(buf);
        }
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        let size = super.serializedSize
            + /*count*/ 2;
        for (const addr of this._addresses) {
            size += addr.serializedSize;
        }
        return size;
    }

    get addresses() {
        return this._addresses;
    }
}
Class.register(AddrMessage);

class BlockMessage extends Message {
    constructor(block) {
        super(Message.Type.BLOCK);
        // TODO Bitcoin block messages start with a block version
        this._block = block;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const block = Block.unserialize(buf);
        return new BlockMessage(block);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        this._block.serialize(buf);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + this._block.serializedSize;
    }

    get block() {
        return this._block;
    }
}
Class.register(BlockMessage);

class GetAddrMessage extends Message {
    constructor(protocolMask, serviceMask) {
        super(Message.Type.GETADDR);
        if (!NumberUtils.isUint8(protocolMask)) throw 'Malformed protocolMask';
        if (!NumberUtils.isUint32(serviceMask)) throw 'Malformed serviceMask';
        this._protocolMask = protocolMask;
        this._serviceMask = serviceMask;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const protocolMask = buf.readUint8();
        const serviceMask = buf.readUint32();
        return new GetAddrMessage(protocolMask, serviceMask);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint8(this._protocolMask);
        buf.writeUint32(this._serviceMask);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*protocolMask*/ 1
            + /*serviceMask*/ 4;
    }

    get protocolMask() {
        return this._protocolMask;
    }

    get serviceMask() {
        return this._serviceMask;
    }
}
Class.register(GetAddrMessage);

class GetBlocksMessage extends Message {
    constructor(hashes, hashStop) {
        super(Message.Type.GETBLOCKS);
        if (!hashes || !NumberUtils.isUint16(hashes.length)
            || hashes.some(it => !(it instanceof Hash))) throw 'Malformed hashes';
        this._hashes = hashes;
        this._hashStop = hashStop;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const count = buf.readUint16();
        const hashes = [];
        for (let i = 0; i < count; i++) {
            hashes.push(Hash.unserialize(buf));
        }
        const hashStop = Hash.unserialize(buf);
        return new GetBlocksMessage(hashes, hashStop);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint16(this._hashes.length);
        for (const hash of this._hashes) {
            hash.serialize(buf);
        }
        this._hashStop.serialize(buf);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        let size = super.serializedSize
            + /*count*/ 2
            + this._hashStop.serializedSize;
        for (const hash of this._hashes) {
            size += hash.serializedSize;
        }
        return size;
    }

    get hashes() {
        return this._hashes;
    }

    get hashStop() {
        return this._hashStop;
    }
}
Class.register(GetBlocksMessage);

class InvVector {
    static async fromBlock(block) {
        const hash = await block.hash();
        return new InvVector(InvVector.Type.BLOCK, hash);
    }

    static async fromTransaction(tx) {
        const hash = await tx.hash();
        return new InvVector(InvVector.Type.TRANSACTION, hash);
    }

    constructor(type, hash) {
        // TODO validate type
        if (!Hash.isHash(hash)) throw 'Malformed hash';
        this._type = type;
        this._hash = hash;
    }

    static unserialize(buf) {
        const type = buf.readUint32();
        const hash = Hash.unserialize(buf);
        return new InvVector(type, hash);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.writeUint32(this._type);
        this._hash.serialize(buf);
        return buf;
    }

    equals(o) {
        return o instanceof InvVector
            && this._type === o.type
            && this._hash.equals(o.hash);
    }

    hashCode() {
        return `${this._type}|${this._hash}`;
    }

    toString() {
        return `InvVector{type=${this._type}, hash=${this._hash}}`;
    }

    get serializedSize() {
        return /*invType*/ 4
            + this._hash.serializedSize;
    }

    get type() {
        return this._type;
    }

    get hash() {
        return this._hash;
    }
}
InvVector.Type = {
    ERROR: 0,
    TRANSACTION: 1,
    BLOCK: 2
};
Class.register(InvVector);

class BaseInventoryMessage extends Message {
    constructor(type, vectors) {
        super(type);
        if (!vectors || !NumberUtils.isUint16(vectors.length)
            || vectors.some(it => !(it instanceof InvVector))
            || vectors.length > BaseInventoryMessage.LENGTH_MAX) throw 'Malformed vectors';
        this._vectors = vectors;
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint16(this._vectors.length);
        for (const vector of this._vectors) {
            vector.serialize(buf);
        }
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        let size = super.serializedSize
            + /*count*/ 2;
        for (const vector of this._vectors) {
            size += vector.serializedSize;
        }
        return size;
    }

    get vectors() {
        return this._vectors;
    }
}
BaseInventoryMessage.LENGTH_MAX = 1000;
Class.register(BaseInventoryMessage);

class InvMessage extends BaseInventoryMessage {
    constructor(vectors) {
        super(Message.Type.INV, vectors);
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const count = buf.readUint16();
        const vectors = [];
        for (let i = 0; i < count; ++i) {
            vectors.push(InvVector.unserialize(buf));
        }
        return new InvMessage(vectors);
    }
}
Class.register(InvMessage);

class GetDataMessage extends BaseInventoryMessage {
    constructor(vectors) {
        super(Message.Type.GETDATA, vectors);
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const count = buf.readUint16();
        const vectors = [];
        for (let i = 0; i < count; ++i) {
            vectors.push(InvVector.unserialize(buf));
        }
        return new GetDataMessage(vectors);
    }
}

Class.register(GetDataMessage);

class NotFoundMessage extends BaseInventoryMessage {
    constructor(vectors) {
        super(Message.Type.NOTFOUND, vectors);
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const count = buf.readUint16();
        const vectors = [];
        for (let i = 0; i < count; ++i) {
            vectors.push(InvVector.unserialize(buf));
        }
        return new NotFoundMessage(vectors);
    }
}
Class.register(NotFoundMessage);

class MempoolMessage extends Message {
    constructor() {
        super(Message.Type.MEMPOOL);
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        return new MempoolMessage();
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize;
    }

}
Class.register(MempoolMessage);

class PingMessage extends Message {
    constructor(nonce) {
        super(Message.Type.PING);
        this._nonce = nonce;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const nonce = buf.readUint32();
        return new PingMessage(nonce);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint32(this._nonce);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*nonce*/ 4;
    }

    get nonce() {
        return this._nonce;
    }
}
Class.register(PingMessage);

class PongMessage extends Message {
    constructor(nonce) {
        super(Message.Type.PONG);
        this._nonce = nonce;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const nonce = buf.readUint32();
        return new PongMessage(nonce);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint32(this._nonce);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*nonce*/ 4;
    }

    get nonce() {
        return this._nonce;
    }
}
Class.register(PongMessage);

class RejectMessage extends Message {
    constructor(messageType, code, reason, extraData) {
        super(Message.Type.REJECT);
        if (StringUtils.isMultibyte(messageType) || messageType.length > 12) throw 'Malformed type';
        if (!NumberUtils.isUint8(code)) throw 'Malformed code';
        if (StringUtils.isMultibyte(reason) || reason.length > 255) throw 'Malformed reason';
        if (!extraData || !(extraData instanceof Uint8Array) || !NumberUtils.isUint16(extraData.byteLength)) throw 'Malformed extraData';

        this._messageType = messageType;
        this._code = code;
        this._reason = reason;
        this._extraData = extraData;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const messageType = buf.readVarLengthString();
        const code = buf.readUint8();
        const reason = buf.readVarLengthString();
        const length = buf.readUint16();
        const extraData = buf.read(length);
        return new RejectMessage(messageType, code, reason, extraData);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeVarLengthString(this._messageType);
        buf.writeUint8(this._code);
        buf.writeVarLengthString(this._reason);
        buf.writeUint16(this._extraData.byteLength);
        buf.write(this._extraData);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*messageType VarLengthString extra byte*/ 1
            + this._messageType.length
            + /*code*/ 1
            + /*reason VarLengthString extra byte*/ 1
            + this._reason.length
            + /*extraDataLength*/ 2
            + this._extraData.byteLength;
    }

    get messageType() {
        return this._messageType;
    }

    get code() {
        return this._code;
    }

    get reason() {
        return this._reason;
    }

    get extraData() {
        return this._extraData;
    }
}
RejectMessage.Code = {};
RejectMessage.Code.DUPLICATE = 0x12;
Class.register(RejectMessage);

class SignalMessage extends Message {
    constructor(senderId, recipientId, nonce, ttl, flags = 0, payload = new Uint8Array()) {
        super(Message.Type.SIGNAL);
        if (!senderId || !RtcPeerAddress.isSignalId(senderId)) throw 'Malformed senderId';
        if (!recipientId || !RtcPeerAddress.isSignalId(recipientId)) throw 'Malformed recipientId';
        if (!NumberUtils.isUint32(nonce)) throw 'Malformed nonce';
        if (!NumberUtils.isUint8(ttl)) throw 'Malformed ttl';
        if (!NumberUtils.isUint8(flags)) throw 'Malformed flags';
        if (!payload || !(payload instanceof Uint8Array) || !NumberUtils.isUint16(payload.byteLength)) throw 'Malformed payload';
        this._senderId = senderId;
        this._recipientId = recipientId;
        this._nonce = nonce;
        this._ttl = ttl;
        this._flags = flags;
        this._payload = payload;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const senderId = buf.readString(32);
        const recipientId = buf.readString(32);
        const nonce = buf.readUint32();
        const ttl = buf.readUint8();
        const flags = buf.readUint8();
        const length = buf.readUint16();
        const payload = buf.read(length);
        return new SignalMessage(senderId, recipientId, nonce, ttl, flags, payload);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeString(this._senderId, 32);
        buf.writeString(this._recipientId, 32);
        buf.writeUint32(this._nonce);
        buf.writeUint8(this._ttl);
        buf.writeUint8(this._flags);
        buf.writeUint16(this._payload.byteLength);
        buf.write(this._payload);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*senderId*/ 32
            + /*recipientId*/ 32
            + /*nonce*/ 4
            + /*ttl*/ 1
            + /*flags*/ 1
            + /*payloadLength*/ 2
            + this._payload.byteLength;
    }

    get senderId() {
        return this._senderId;
    }

    get recipientId() {
        return this._recipientId;
    }

    get nonce() {
        return this._nonce;
    }

    get ttl() {
        return this._ttl;
    }

    get flags() {
        return this._flags;
    }

    get payload() {
        return this._payload;
    }

    isUnroutable() {
        return (this._flags & SignalMessage.Flags.UNROUTABLE) !== 0;
    }

    isTtlExceeded() {
        return (this._flags & SignalMessage.Flags.TTL_EXCEEDED) !== 0;
    }
}
SignalMessage.Flags = {};
SignalMessage.Flags.UNROUTABLE = 0x1;
SignalMessage.Flags.TTL_EXCEEDED = 0x2;
Class.register(SignalMessage);

class TxMessage extends Message {
    constructor(transaction) {
        super(Message.Type.TX);
        this._transaction = transaction;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const transaction = Transaction.unserialize(buf);
        return new TxMessage(transaction);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        this._transaction.serialize(buf);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + this._transaction.serializedSize;
    }

    get transaction() {
        return this._transaction;
    }
}
Class.register(TxMessage);

class VersionMessage extends Message {
    constructor(version, peerAddress, genesisHash, startHeight, totalWork) {
        super(Message.Type.VERSION);
        if (!NumberUtils.isUint32(version)) throw 'Malformed version';
        if (!peerAddress || !(peerAddress instanceof PeerAddress)) throw 'Malformed peerAddress';
        if (!Hash.isHash(genesisHash)) throw 'Malformed genesisHash';
        if (!NumberUtils.isUint32(startHeight)) throw 'Malformed startHeight';
        // TODO Validate that totalWork is a valid double.

        this._version = version;
        this._peerAddress = peerAddress;
        this._genesisHash = genesisHash;
        this._startHeight = startHeight;
        this._totalWork = totalWork;
    }

    static unserialize(buf) {
        Message.unserialize(buf);
        const version = buf.readUint32();
        const peerAddress = PeerAddress.unserialize(buf);
        const genesisHash = Hash.unserialize(buf);
        const startHeight = buf.readUint32();
        const totalWork = buf.readFloat64();
        return new VersionMessage(version, peerAddress, genesisHash, startHeight, totalWork);
    }

    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        super.serialize(buf);
        buf.writeUint32(this._version);
        this._peerAddress.serialize(buf);
        this._genesisHash.serialize(buf);
        buf.writeUint32(this._startHeight);
        buf.writeFloat64(this._totalWork);
        super._setChecksum(buf);
        return buf;
    }

    get serializedSize() {
        return super.serializedSize
            + /*version*/ 4
            + this._peerAddress.serializedSize
            + this._genesisHash.serializedSize
            + /*startHeight*/ 4
            + /*totalWork*/ 8;
    }

    get version() {
        return this._version;
    }

    get peerAddress() {
        return this._peerAddress;
    }

    get genesisHash() {
        return this._genesisHash;
    }

    get startHeight() {
        return this._startHeight;
    }

    get totalWork() {
        return this._totalWork;
    }
}
Class.register(VersionMessage);

class MessageFactory {
    static parse(buffer) {
        const buf = new SerialBuffer(buffer);
        const type = Message.peekType(buf);
        const clazz = MessageFactory.CLASSES[type];
        if (!clazz || !clazz.unserialize) throw `Invalid message type: ${type}`;
        return clazz.unserialize(buf);
    }
}
MessageFactory.CLASSES = {};
MessageFactory.CLASSES[Message.Type.VERSION] = VersionMessage;
MessageFactory.CLASSES[Message.Type.INV] = InvMessage;
MessageFactory.CLASSES[Message.Type.GETDATA] = GetDataMessage;
MessageFactory.CLASSES[Message.Type.NOTFOUND] = NotFoundMessage;
MessageFactory.CLASSES[Message.Type.BLOCK] = BlockMessage;
MessageFactory.CLASSES[Message.Type.TX] = TxMessage;
MessageFactory.CLASSES[Message.Type.GETBLOCKS] = GetBlocksMessage;
MessageFactory.CLASSES[Message.Type.MEMPOOL] = MempoolMessage;
MessageFactory.CLASSES[Message.Type.REJECT] = RejectMessage;
MessageFactory.CLASSES[Message.Type.ADDR] = AddrMessage;
MessageFactory.CLASSES[Message.Type.GETADDR] = GetAddrMessage;
MessageFactory.CLASSES[Message.Type.PING] = PingMessage;
MessageFactory.CLASSES[Message.Type.PONG] = PongMessage;
MessageFactory.CLASSES[Message.Type.SIGNAL] = SignalMessage;
Class.register(MessageFactory);

class NetworkAgent extends Observable {
    constructor(blockchain, addresses, channel) {
        super();
        this._blockchain = blockchain;
        this._addresses = addresses;
        this._channel = channel;

        // The peer object we create after the handshake completes.
        this._peer = null;

        // All peerAddresses that we think the remote peer knows.
        this._knownAddresses = new HashSet();

        // Helper object to keep track of timeouts & intervals.
        this._timers = new Timers();

        // True if we have received the peer's version message.
        this._versionReceived = false;

        // True if we have successfully sent our version message.
        this._versionSent = false;

        // Number of times we have tried to send out the version message.
        this._versionAttempts = 0;

        // Listen to network/control messages from the peer.
        channel.on('version',   msg => this._onVersion(msg));
        channel.on('verack',    msg => this._onVerAck(msg));
        channel.on('addr',      msg => this._onAddr(msg));
        channel.on('getaddr',   msg => this._onGetAddr(msg));
        channel.on('ping',      msg => this._onPing(msg));
        channel.on('pong',      msg => this._onPong(msg));

        // Clean up when the peer disconnects.
        channel.on('close', closedByRemote => this._onClose(closedByRemote));
    }

    relayAddresses(addresses) {
        // Don't relay if the handshake hasn't finished yet.
        if (!this._versionReceived || !this._versionSent) {
            return;
        }

        // Only relay addresses that the peer doesn't know yet. If the address
        // the peer knows is older than RELAY_THROTTLE, relay the address again.
        const filteredAddresses = addresses.filter(addr => {
            // Exclude RTC addresses that are already at MAX_DISTANCE.
            if (addr.protocol === Protocol.RTC && addr.distance >= PeerAddresses.MAX_DISTANCE) {
                return false;
            }

            // Exclude DumbPeerAddresses.
            if (addr.protocol === Protocol.DUMB) {
                return false;
            }

            const knownAddress = this._knownAddresses.get(addr);
            return !addr.isSeed() // Never relay seed addresses.
                && (!knownAddress || knownAddress.timestamp < Date.now() - NetworkAgent.RELAY_THROTTLE);
        });

        if (filteredAddresses.length) {
            this._channel.addr(filteredAddresses);

            // We assume that the peer knows these addresses now.
            for (const address of filteredAddresses) {
                this._knownAddresses.add(address);
            }
        }
    }


    /* Handshake */

    handshake() {
        // Kick off the handshake by telling the peer our version, network address & blockchain height.
        // Firefox sends the data-channel-open event too early, so sending the version message might fail.
        // Try again in this case.
        if (!this._channel.version(NetworkConfig.myPeerAddress(), this._blockchain.height, this._blockchain.totalWork)) {
            this._versionAttempts++;
            if (this._versionAttempts >= NetworkAgent.VERSION_ATTEMPTS_MAX) {
                this._channel.close('sending of version message failed');
                return;
            }

            setTimeout(this.handshake.bind(this), NetworkAgent.VERSION_RETRY_DELAY);
            return;
        }

        this._versionSent = true;

        // Drop the peer if it doesn't send us a version message.
        // Only do this if we haven't received the peer's version message already.
        if (!this._versionReceived) {
            // TODO Should we ban instead?
            this._timers.setTimeout('version', () => {
                this._timers.clearTimeout('version');
                this._channel.close('version timeout');
            }, NetworkAgent.HANDSHAKE_TIMEOUT);
        } else {
            // The peer has sent us his version message already.
            this._finishHandshake();
        }
    }

    _onVersion(msg) {
        // Make sure this is a valid message in our current state.
        if (!this._canAcceptMessage(msg)) {
            return;
        }

        // Clear the version timeout.
        this._timers.clearTimeout('version');

        // Check if the peer is running a compatible version.
        if (!Version.isCompatible(msg.version)) {
            this._channel.close(`incompatible version (ours=${Version.CODE}, theirs=${msg.version})`);
            return;
        }

        // Check if the peer is working on the same genesis block.
        if (!Block.GENESIS.HASH.equals(msg.genesisHash)) {
            this._channel.close(`different genesis block (${msg.genesisHash})`);
            return;
        }

        // TODO check services?

        // Check that the given peerAddress matches the one we expect.
        // In case of inbound WebSocket connections, this is the first time we
        // see the remote peer's peerAddress.
        // TODO We should validate that the given peerAddress actually resolves
        // to the peer's netAddress!
        if (this._channel.peerAddress) {
            if (!this._channel.peerAddress.equals(msg.peerAddress)) {
                this._channel.close('unexpected peerAddress in version message');
                return;
            }
        }

        // The client might not send its netAddress. Set it from our address database if we have it.
        const peerAddress = msg.peerAddress;
        if (!peerAddress.netAddress) {
            const storedAddress = this._addresses.get(peerAddress);
            if (storedAddress && storedAddress.netAddress) {
                peerAddress.netAddress = storedAddress.netAddress;
            }
        }
        this._channel.peerAddress = peerAddress;

        // Create peer object.
        this._peer = new Peer(
            this._channel,
            msg.version,
            msg.startHeight,
            msg.totalWork
        );

        // Remember that the peer has sent us this address.
        this._knownAddresses.add(peerAddress);

        this._versionReceived = true;

        if (this._versionSent) {
            this._finishHandshake();
        }
    }

    _finishHandshake() {
        // Setup regular connectivity check.
        // TODO randomize interval?
        this._timers.setInterval('connectivity',
            () => this._checkConnectivity(),
            NetworkAgent.CONNECTIVITY_CHECK_INTERVAL);

        // Regularly announce our address.
        this._timers.setInterval('announce-addr',
            () => this._channel.addr([NetworkConfig.myPeerAddress()]),
            NetworkAgent.ANNOUNCE_ADDR_INTERVAL);

        // Tell listeners about the new peer that connected.
        this.fire('handshake', this._peer, this);

        // Request new network addresses from the peer.
        this._requestAddresses();
    }


    /* Addresses */

    _requestAddresses() {
        // Request addresses from peer.
        this._channel.getaddr(NetworkConfig.myProtocolMask(), Services.myServiceMask());

        // We don't use a timeout here. The peer will not respond with an addr message if
        // it doesn't have any new addresses.
    }

    async _onAddr(msg) {
        // Make sure this is a valid message in our current state.
        if (!this._canAcceptMessage(msg)) {
            return;
        }

        // Reject messages that contain more than 1000 addresses, ban peer (bitcoin).
        if (msg.addresses.length > 1000) {
            Log.w(NetworkAgent, 'Rejecting addr message - too many addresses');
            this._channel.ban('addr message too large');
            return;
        }

        // Remember that the peer has sent us these addresses.
        for (const addr of msg.addresses) {
            this._knownAddresses.add(addr);
        }

        // Put the new addresses in the address pool.
        await this._addresses.add(this._channel, msg.addresses);

        // Tell listeners that we have received new addresses.
        this.fire('addr', msg.addresses, this);
    }

    _onGetAddr(msg) {
        // Make sure this is a valid message in our current state.
        if (!this._canAcceptMessage(msg)) {
            return;
        }

        // Find addresses that match the given serviceMask.
        const addresses = this._addresses.query(msg.protocolMask, msg.serviceMask);

        const filteredAddresses = addresses.filter(addr => {
            // Exclude RTC addresses that are already at MAX_DISTANCE.
            if (addr.protocol === Protocol.RTC && addr.distance >= PeerAddresses.MAX_DISTANCE) {
                return false;
            }

            // Exclude known addresses from the response unless they are older than RELAY_THROTTLE.
            const knownAddress = this._knownAddresses.get(addr);
            return !knownAddress || knownAddress.timestamp < Date.now() - NetworkAgent.RELAY_THROTTLE;
        });

        // Send the addresses back to the peer.
        // If we don't have any new addresses, don't send the message at all.
        if (filteredAddresses.length) {
            this._channel.addr(filteredAddresses);
        }
    }


    /* Connectivity Check */

    _checkConnectivity() {
        // Generate random nonce.
        const nonce = NumberUtils.randomUint32();

        // Send ping message to peer.
        // If sending the ping message fails, assume the connection has died.
        if (!this._channel.ping(nonce)) {
            this._channel.close('sending ping message failed');
            return;
        }

        // Drop peer if it doesn't answer with a matching pong message within the timeout.
        this._timers.setTimeout(`ping_${nonce}`, () => {
            this._timers.clearTimeout(`ping_${nonce}`);
            this._channel.close('ping timeout');
        }, NetworkAgent.PING_TIMEOUT);
    }

    _onPing(msg) {
        // Make sure this is a valid message in our current state.
        if (!this._canAcceptMessage(msg)) {
            return;
        }

        // Respond with a pong message
        this._channel.pong(msg.nonce);
    }

    _onPong(msg) {
        // Clear the ping timeout for this nonce.
        this._timers.clearTimeout(`ping_${msg.nonce}`);
    }

    _onClose(closedByRemote) {
        // Clear all timers and intervals when the peer disconnects.
        this._timers.clearAll();

        // Tell listeners that the peer has disconnected.
        this.fire('close', this._peer, this._channel, closedByRemote, this);
    }

    _canAcceptMessage(msg) {
        // The first message must be the version message.
        if (!this._versionReceived && msg.type !== Message.Type.VERSION) {
            Log.w(NetworkAgent, `Discarding ${msg.type} message from ${this._channel}`
                + ' - no version message received previously');
            return false;
        }
        return true;
    }

    get channel() {
        return this._channel;
    }

    get peer() {
        return this._peer;
    }
}
NetworkAgent.HANDSHAKE_TIMEOUT = 1000 * 3; // 3 seconds
NetworkAgent.PING_TIMEOUT = 1000 * 10; // 10 seconds
NetworkAgent.CONNECTIVITY_CHECK_INTERVAL = 1000 * 60; // 1 minute
NetworkAgent.ANNOUNCE_ADDR_INTERVAL = 1000 * 60 * 10; // 10 minutes
NetworkAgent.RELAY_THROTTLE = 1000 * 60 * 5; // 5 minutes
NetworkAgent.VERSION_ATTEMPTS_MAX = 10;
NetworkAgent.VERSION_RETRY_DELAY = 500; // 500 ms
Class.register(NetworkAgent);

class Network extends Observable {
    static get PEER_COUNT_MAX() {
        return PlatformUtils.isBrowser() ? 15 : 50000;
    }

    static get PEER_COUNT_PER_IP_WS_MAX() {
        return PlatformUtils.isBrowser() ? 1 : 25;
    }

    static get PEER_COUNT_PER_IP_RTC_MAX() {
        return 2;
    }

    constructor(blockchain) {
        super();
        this._blockchain = blockchain;
        return this._init();
    }

    async _init() {
        // Flag indicating whether we should actively connect to other peers
        // if our peer count is below PEER_COUNT_DESIRED.
        this._autoConnect = false;
        // Save the old state when going offline, to restore it when going online again.
        this._savedAutoConnect = false;

        // Number of ongoing outbound connection attempts.
        this._connectingCount = 0;

        // Map of agents indexed by connection ids.
        this._agents = new HashMap();

        // Map from netAddress.host -> number of connections to this host.
        this._connectionCounts = new HashMap();

        // Total bytes sent/received on past connections.
        this._bytesSent = 0;
        this._bytesReceived = 0;

        this._wsConnector = new WebSocketConnector();
        this._wsConnector.on('connection', conn => this._onConnection(conn));
        this._wsConnector.on('error', peerAddr => this._onError(peerAddr));

        this._rtcConnector = await new WebRtcConnector();
        this._rtcConnector.on('connection', conn => this._onConnection(conn));
        this._rtcConnector.on('error', (peerAddr, reason) => this._onError(peerAddr, reason));

        // Helper objects to manage PeerAddresses.
        // Must be initialized AFTER the WebSocket/WebRtcConnector.
        this._addresses = new PeerAddresses();

        // Relay new addresses to peers.
        this._addresses.on('added', addresses => {
            this._relayAddresses(addresses);
            this._checkPeerCount();
        });

        // If in browser, add event listener for online/offline detection.
        if (PlatformUtils.isBrowser()) {
            window.addEventListener('online', _ => this._onOnline());
            window.addEventListener('offline', _ => this._onOffline());
        }

        this._forwards = new SignalStore();

        return this;
    }

    connect() {
        this._autoConnect = true;
        this._savedAutoConnect = true;

        // Start connecting to peers.
        this._checkPeerCount();
    }

    disconnect(reason) {
        this._autoConnect = false;
        this._savedAutoConnect = false;

        // Close all active connections.
        for (const agent of this._agents.values()) {
            agent.channel.close(reason || 'manual network disconnect');
        }
    }

    isOnline() {
        // If in doubt, return true.
        return (!PlatformUtils.isBrowser() || window.navigator.onLine === undefined) || window.navigator.onLine;
    }

    _onOnline() {
        this._autoConnect = this._savedAutoConnect;

        if (this._autoConnect) {
            this._checkPeerCount();
        }
    }

    _onOffline() {
        this._savedAutoConnect = this._autoConnect;
        this.disconnect('network disconnect');
    }

    // XXX For testing
    disconnectWebSocket() {
        this._autoConnect = false;

        // Close all websocket connections.
        for (const agent of this._agents.values()) {
            if (agent.peer.peerAddress.protocol === Protocol.WS) {
                agent.channel.close('manual websocket disconnect');
            }
        }
    }

    _relayAddresses(addresses) {
        // Pick PEER_COUNT_RELAY random peers and relay addresses to them if:
        // - number of addresses <= 10
        // TODO more restrictions, see Bitcoin
        if (addresses.length > 10) {
            return;
        }

        // XXX We don't protect against picking the same peer more than once.
        // The NetworkAgent will take care of not sending the addresses twice.
        // In that case, the address will simply be relayed to less peers. Also,
        // the peer that we pick might already know the address.
        const agents = this._agents.values();
        for (let i = 0; i < Network.PEER_COUNT_RELAY; ++i) {
            const agent = ArrayUtils.randomElement(agents);
            if (agent) {
                agent.relayAddresses(addresses);
            }
        }
    }

    _checkPeerCount() {
        if (this._autoConnect // && this.isOnline() Do we need this? Not really if _onOnline/_onOffline is working.
            && this.peerCount + this._connectingCount < Network.PEER_COUNT_DESIRED
            && this._connectingCount < Network.CONNECTING_COUNT_MAX) {

            // Pick a peer address that we are not connected to yet.
            const peerAddress = this._addresses.pickAddress();

            // We can't connect if we don't know any more addresses.
            if (!peerAddress) {
                return;
            }

            // Connect to this address.
            this._connect(peerAddress);
        }
    }

    _connect(peerAddress) {
        switch (peerAddress.protocol) {
            case Protocol.WS:
                Log.d(Network, `Connecting to ${peerAddress} ...`);
                if (this._wsConnector.connect(peerAddress)) {
                    this._addresses.connecting(peerAddress);
                    this._connectingCount++;
                }
                break;

            case Protocol.RTC: {
                const signalChannel = this._addresses.getChannelBySignalId(peerAddress.signalId);
                Log.d(Network, `Connecting to ${peerAddress} via ${signalChannel.peerAddress}...`);
                if (this._rtcConnector.connect(peerAddress, signalChannel)) {
                    this._addresses.connecting(peerAddress);
                    this._connectingCount++;
                }
                break;
            }

            default:
                Log.e(Network, `Cannot connect to ${peerAddress} - unsupported protocol`);
                this._onError(peerAddress);
        }
    }

    _onConnection(conn) {
        // Decrement connectingCount if we have initiated this connection.
        if (conn.outbound && this._addresses.isConnecting(conn.peerAddress)) {
            this._connectingCount--;
        }

        // If the connector was able to determine the peer's netAddress,
        // enforce the max connections per IP limit here.
        if (conn.netAddress && !this._incrementConnectionCount(conn)) {
            return;
        }

        // Reject connection if we are already connected to this peer address.
        // This can happen if the peer connects (inbound) while we are
        // initiating a (outbound) connection to it.
        if (conn.outbound && this._addresses.isConnected(conn.peerAddress)) {
            conn.close('duplicate connection (outbound, pre handshake)');
            return;
        }

        // Reject peer if we have reached max peer count.
        if (this.peerCount >= Network.PEER_COUNT_MAX) {
            conn.close(`max peer count reached (${Network.PEER_COUNT_MAX})`);
            return;
        }

        // Connection accepted.
        const connType = conn.inbound ? 'inbound' : 'outbound';
        Log.d(Network, `Connection established (${connType}) #${conn.id} ${conn.netAddress || conn.peerAddress || '<pending>'}`);

        // Create peer channel.
        const channel = new PeerChannel(conn);
        channel.on('signal', msg => this._onSignal(channel, msg));
        channel.on('ban', reason => this._onBan(channel, reason));

        // Create network agent.
        const agent = new NetworkAgent(this._blockchain, this._addresses, channel);
        agent.on('handshake', peer => this._onHandshake(peer, agent));
        agent.on('close', (peer, channel, closedByRemote) => this._onClose(peer, channel, closedByRemote));

        // Store the agent.
        this._agents.put(conn.id, agent);

        // Initiate handshake with the peer.
        agent.handshake();

        // Call _checkPeerCount() here in case the peer doesn't send us any (new)
        // addresses to keep on connecting.
        // Add a delay before calling it to allow RTC peer addresses to be sent to us.
        setTimeout(() => this._checkPeerCount(), Network.ADDRESS_UPDATE_DELAY);
    }


    // Handshake with this peer was successful.
    _onHandshake(peer, agent) {
        // If the connector was able the determine the peer's netAddress, update the peer's advertised netAddress.
        if (peer.channel.netAddress) {
            // TODO What to do if it doesn't match the currently advertised one?
            if (peer.peerAddress.netAddress && !peer.peerAddress.netAddress.equals(peer.channel.netAddress)) {
                Log.w(Network, `Got different netAddress ${peer.channel.netAddress} for peer ${peer.peerAddress} `
                    + `- advertised was ${peer.peerAddress.netAddress}`);
            }

            // Only set the advertised netAddress if we have the public IP of the peer.
            // WebRTC connectors might return local IP addresses for peers on the same LAN.
            if (!peer.channel.netAddress.isPrivate()) {
                peer.peerAddress.netAddress = peer.channel.netAddress;
            }
        }
        // Otherwise, use the netAddress advertised for this peer if available.
        else if (peer.channel.peerAddress.netAddress) {
            peer.channel.netAddress = peer.channel.peerAddress.netAddress;

            // Enforce the max connection limit per IP here.
            if (!this._incrementConnectionCount(peer.channel.connection)) {
                return;
            }
        }
        // Otherwise, we don't know the netAddress of this peer. Use a pseudo netAddress.
        else {
            peer.channel.netAddress = NetAddress.UNKNOWN;
        }

        // Close connection if we are already connected to this peer.
        if (this._addresses.isConnected(peer.peerAddress)) {
            agent.channel.close('duplicate connection (post handshake)');
            return;
        }

        // Close connection if this peer is banned.
        if (this._addresses.isBanned(peer.peerAddress)) {
            agent.channel.close('peer is banned');
            return;
        }

        // Mark the peer's address as connected.
        this._addresses.connected(agent.channel, peer.peerAddress);

        // Tell others about the address that we just connected to.
        this._relayAddresses([peer.peerAddress]);

        // Let listeners know about this peer.
        this.fire('peer-joined', peer);

        // Let listeners know that the peers changed.
        this.fire('peers-changed');

        Log.d(Network, `[PEER-JOINED] ${peer.peerAddress} ${peer.netAddress} (version=${peer.version}, startHeight=${peer.startHeight}, totalWork=${peer.totalWork})`);
    }

    // Connection to this peer address failed.
    _onError(peerAddress, reason) {
        Log.w(Network, `Connection to ${peerAddress} failed` + (reason ? ` - ${reason}` : ''));

        if (this._addresses.isConnecting(peerAddress)) {
            this._connectingCount--;
        }

        this._addresses.unreachable(peerAddress);

        this._checkPeerCount();
    }

    // This peer channel was closed.
    _onClose(peer, channel, closedByRemote) {
        // Delete agent.
        this._agents.remove(channel.id);

        // Decrement connection count per IP if we already know the peer's netAddress.
        if (channel.netAddress && !channel.netAddress.isPseudo()) {
            this._decrementConnectionCount(channel.netAddress);
        }

        // Update total bytes sent/received.
        this._bytesSent += channel.connection.bytesSent;
        this._bytesReceived += channel.connection.bytesReceived;

        // peerAddress is undefined for incoming connections pre-handshake.
        if (channel.peerAddress) {
            // Check if the handshake with this peer has completed.
            if (this._addresses.isConnected(channel.peerAddress)) {
                // Mark peer as disconnected.
                this._addresses.disconnected(channel, closedByRemote);

                // Tell listeners that this peer has gone away.
                this.fire('peer-left', peer);

                // Let listeners know that the peers changed.
                this.fire('peers-changed');

                const kbTransferred = ((channel.connection.bytesSent
                    + channel.connection.bytesReceived) / 1000).toFixed(2);
                Log.d(Network, `[PEER-LEFT] ${peer.peerAddress} ${peer.netAddress} `
                    + `(version=${peer.version}, startHeight=${peer.startHeight}, `
                    + `transferred=${kbTransferred} kB)`);
            } else {
                // Treat connections closed pre-handshake as failed attempts.
                Log.w(Network, `Connection to ${channel.peerAddress} closed pre-handshake (by ${closedByRemote ? 'remote' : 'us'})`);
                this._addresses.unreachable(channel.peerAddress);
            }
        }

        this._checkPeerCount();
    }

    // This peer channel was banned.
    _onBan(channel, reason) {
        // TODO If this is an inbound connection, the peerAddres might not be set yet.
        // Ban the netAddress in this case.
        // XXX We should probably always ban the netAddress as well.
        if (channel.peerAddress) {
            this._addresses.ban(channel.peerAddress);
        } else {
            // TODO ban netAddress
        }
    }

    _incrementConnectionCount(conn) {
        let numConnections = this._connectionCounts.get(conn.netAddress) || 0;
        numConnections++;
        this._connectionCounts.put(conn.netAddress, numConnections);

        // Enforce max connections per IP limit.
        const maxConnections = conn.protocol === Protocol.WS ?
            Network.PEER_COUNT_PER_IP_WS_MAX : Network.PEER_COUNT_PER_IP_RTC_MAX;
        if (numConnections > maxConnections) {
            conn.close(`connection limit per ip (${maxConnections}) reached`);
            return false;
        }
        return true;
    }

    _decrementConnectionCount(netAddress) {
        let numConnections = this._connectionCounts.get(netAddress) || 1;
        numConnections = Math.max(numConnections - 1, 0);
        this._connectionCounts.put(netAddress, numConnections);
    }


    /* Signaling */

    _onSignal(channel, msg) {
        // Discard signals with invalid TTL.
        if (msg.ttl > Network.SIGNAL_TTL_INITIAL) {
            channel.ban('invalid signal ttl');
            return;
        }

        // Can be undefined for non-rtc nodes.
        const mySignalId = NetworkConfig.myPeerAddress().signalId;

        // Discard signals from myself.
        if (msg.senderId === mySignalId) {
            Log.w(Network, `Received signal from myself to ${msg.recipientId} from ${channel.peerAddress} (myId: ${mySignalId})`);
            return;
        }

        // If the signal has the unroutable flag set and we previously forwarded a matching signal,
        // mark the route as unusable.
        if (msg.isUnroutable() && this._forwards.signalForwarded(/*senderId*/ msg.recipientId, /*recipientId*/ msg.senderId, /*nonce*/ msg.nonce)) {
            this._addresses.unroutable(channel, msg.senderId);
        }

        // If the signal is intended for us, pass it on to our WebRTC connector.
        if (msg.recipientId === mySignalId) {
            // If we sent out a signal that did not reach the recipient because of TTL
            // or it was unroutable, delete this route.
            if (this._rtcConnector.isValidSignal(msg) && (msg.isUnroutable() || msg.isTtlExceeded())) {
                this._addresses.unroutable(channel, msg.senderId);
            }
            this._rtcConnector.onSignal(channel, msg);
            return;
        }

        // Discard signals that have reached their TTL.
        if (msg.ttl <= 0) {
            Log.w(Network, `Discarding signal from ${msg.senderId} to ${msg.recipientId} - TTL reached`);
            // Send signal containing TTL_EXCEEDED flag back in reverse direction.
            if (msg.flags === 0) {
                channel.signal(/*senderId*/ msg.recipientId, /*recipientId*/ msg.senderId, msg.nonce, Network.SIGNAL_TTL_INITIAL, SignalMessage.Flags.TTL_EXCEEDED);
            }
            return;
        }

        // Otherwise, try to forward the signal to the intended recipient.
        const signalChannel = this._addresses.getChannelBySignalId(msg.recipientId);
        if (!signalChannel) {
            Log.w(Network, `Failed to forward signal from ${msg.senderId} to ${msg.recipientId} - no route found`);
            // If we don't know a route to the intended recipient, return signal to sender with unroutable flag set and payload removed.
            // Only do this if the signal is not already a unroutable response.
            if (msg.flags === 0) {
                channel.signal(/*senderId*/ msg.recipientId, /*recipientId*/ msg.senderId, msg.nonce, Network.SIGNAL_TTL_INITIAL, SignalMessage.Flags.UNROUTABLE);
            }
            return;
        }

        // Discard signal if our shortest route to the target is via the sending peer.
        // XXX Why does this happen?
        if (signalChannel.peerAddress.equals(channel.peerAddress)) {
            Log.e(Network, `Discarding signal from ${msg.senderId} to ${msg.recipientId} - shortest route via sending peer`);
            return;
        }

        // Decrement ttl and forward signal.
        signalChannel.signal(msg.senderId, msg.recipientId, msg.nonce, msg.ttl - 1, msg.flags, msg.payload);

        // We store forwarded messages if there are no special flags set.
        if (msg.flags === 0) {
            this._forwards.add(msg.senderId, msg.recipientId, msg.nonce);
        }

        // XXX This is very spammy!!!
        Log.v(Network, `Forwarding signal (ttl=${msg.ttl}) from ${msg.senderId} `
            + `(received from ${channel.peerAddress}) to ${msg.recipientId} `
            + `(via ${signalChannel.peerAddress})`);
    }

    get peerCount() {
        return this._addresses.peerCount;
    }

    get peerCountWebSocket() {
        return this._addresses.peerCountWs;
    }

    get peerCountWebRtc() {
        return this._addresses.peerCountRtc;
    }

    get peerCountDumb() {
        return this._addresses.peerCountDumb;
    }

    get bytesSent() {
        return this._bytesSent
            + this._agents.values().reduce((n, agent) => n + agent.channel.connection.bytesSent, 0);
    }

    get bytesReceived() {
        return this._bytesReceived
            + this._agents.values().reduce((n, agent) => n + agent.channel.connection.bytesReceived, 0);
    }
}
Network.PEER_COUNT_DESIRED = 6;
Network.PEER_COUNT_RELAY = 4;
Network.CONNECTING_COUNT_MAX = 2;
Network.SIGNAL_TTL_INITIAL = 3;
Network.ADDRESS_UPDATE_DELAY = 1000; // 1 second
Class.register(Network);

class SignalStore {
    constructor(maxSize = 1000 /*maximum number of entries*/) {
        this._maxSize = maxSize;
        this._queue = new Queue();
        this._store = new HashMap();
    }

    get length() {
        return this._queue.length;
    }

    add(senderId, recipientId, nonce) {
        // If we already forwarded such a message, just update timestamp.
        if (this.contains(senderId, recipientId, nonce)) {
            const signal = new ForwardedSignal(senderId, recipientId, nonce);
            this._store.put(signal, Date.now());
            this._queue.remove(signal);
            this._queue.enqueue(signal);
            return;
        }

        // Delete oldest if needed.
        if (this.length >= this._maxSize) {
            const oldest = this._queue.dequeue();
            this._store.remove(oldest);
        }
        const signal = new ForwardedSignal(senderId, recipientId, nonce);
        this._queue.enqueue(signal);
        this._store.put(signal, Date.now());
    }

    contains(senderId, recipientId, nonce) {
        const signal = new ForwardedSignal(senderId, recipientId, nonce);
        return this._store.contains(signal);
    }

    signalForwarded(senderId, recipientId, nonce) {
        const signal = new ForwardedSignal(senderId, recipientId, nonce);
        const lastSeen = this._store.get(signal);
        if (!lastSeen) {
            return false;
        }
        const valid = lastSeen + ForwardedSignal.SIGNAL_MAX_AGE > Date.now();
        if (!valid) {
            // Because of the ordering, we know that everything after that is invalid too.
            const toDelete = this._queue.dequeueUntil(signal);
            for (const dSignal of toDelete) {
                this._store.remove(dSignal);
            }
        }
        return valid;
    }
}
SignalStore.SIGNAL_MAX_AGE = 10 /* seconds */;
Class.register(SignalStore);

class ForwardedSignal {
    constructor(senderId, recipientId, nonce) {
        this._senderId = senderId;
        this._recipientId = recipientId;
        this._nonce = nonce;
    }

    equals(o) {
        return o instanceof ForwardedSignal
            && this._senderId === o._senderId
            && this._recipientId === o._recipientId
            && this._nonce === o._nonce;
    }

    hashCode() {
        return this.toString();
    }

    toString() {
        return `ForwardedSignal{senderId=${this._senderId}, recipientId=${this._recipientId}, nonce=${this._nonce}}`;
    }
}
Class.register(ForwardedSignal);

class NetUtils {
    static isPrivateIP(ip) {
        if (NetUtils.isIPv4Address(ip)) {
            for (const subnet of NetUtils.IPv4_PRIVATE_NETWORK) {
                if (NetUtils.isIPv4inSubnet(ip, subnet)) {
                    return true;
                }
            }
            return false;
        }

        if (NetUtils.isIPv6Address(ip)) {
            const parts = ip.toLowerCase().split(':');
            const isEmbeddedIPv4 = NetUtils.isIPv4Address(parts[parts.length - 1]);
            if (isEmbeddedIPv4) {
                return NetUtils.isPrivateIP(parts[parts.length - 1]);
            }

            // Private subnet is fc00::/7.
            // So, we only check the first 7 bits of the address to be equal fc00.
            // The mask shifts by 16-7=9 bits (one part - mask size).
            if ((parseInt(parts[0], 16) & (-1<<9)) === 0xfc00) {
                return true;
            }

            // Link-local addresses are fe80::/10.
            // Shifting has to be carried out by 16-10=6 bits.
            if ((parseInt(parts[0], 16) & (-1<<6)) === 0xfe80) {
                return true;
            }

            // Does not seem to be a private IP.
            return false;
        }

        throw `Malformed IP address ${ip}`;
    }

    static isIPv4inSubnet(ip, subnet) {
        let [subIp, mask] = subnet.split('/');
        mask = -1<<(32-parseInt(mask));
        return (NetUtils._IPv4toLong(ip) & mask) === NetUtils._IPv4toLong(subIp);
    }

    static isIPv4Address(ip) {
        const match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
        return !!match && parseInt(match[1]) <= 255 && parseInt(match[2]) <= 255
            && parseInt(match[3]) <= 255 && parseInt(match[4]) <= 255;
    }

    static isIPv6Address(ip) {
        const parts = ip.toLowerCase().split(':');
        // An IPv6 address consists of at most 8 parts and at least 3.
        if (parts.length > 8 || parts.length < 3) {
            return false;
        }

        const isEmbeddedIPv4 = NetUtils.isIPv4Address(parts[parts.length - 1]);

        let innerEmpty = false;
        for (let i = 0; i < parts.length; ++i) {
            // Check whether each part is valid.
            // Note: the last part may be a IPv4 address!
            // They can be embedded in the last part. Remember that they take 32bit.
            if (!(/^[a-f0-9]{0,4}$/.test(parts[i])
                    || (i === parts.length - 1
                        && isEmbeddedIPv4
                        && parts.length < 8))) {
                return false;
            }
            // Inside the parts, there has to be at most one empty part.
            if (parts[i].length === 0 && i > 0 && i < parts.length - 1) {
                if (innerEmpty) {
                    return false; // at least two empty parts
                }
                innerEmpty = true;
            }
        }

        // In the special case of embedded IPv4 addresses, everything but the last 48 bit must be 0.
        if (isEmbeddedIPv4) {
            // Exclude the last two parts.
            for (let i=0; i<parts.length-2; ++i) {
                if (!/^0{0,4}$/.test(parts[i])) {
                    return false;
                }
            }
        }

        // If the first part is empty, the second has to be empty as well (e.g., ::1).
        if (parts[0].length === 0) {
            return parts[1].length === 0;
        }

        // If the last part is empty, the second last has to be empty as well (e.g., 1::).
        if (parts[parts.length - 1].length === 0) {
            return parts[parts.length - 2].length === 0;
        }

        // If the length is less than 7 and an IPv4 address is embedded, there has to be an empty part.
        if (isEmbeddedIPv4 && parts.length < 7) {
            return innerEmpty;
        }

        // Otherwise if the length is less than 8, there has to be an empty part.
        if (parts.length < 8) {
            return innerEmpty;
        }

        return true;
    }

    static sanitizeIP(ip) {
        const saneIp = NetUtils._normalizeIP(ip);
        if (NetUtils.IP_BLACKLIST.indexOf(saneIp) >= 0) {
            throw `Malformed IP address ${ip}`;
        }
        // TODO reject IPv6 broadcast addresses
        return saneIp;
    }

    static _normalizeIP(ip) {
        if (NetUtils.isIPv4Address(ip)) {
            // Re-create IPv4 address to strip possible leading zeros.
            // Embed into IPv6 format.
            const match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
            return `${parseInt(match[1])}.${parseInt(match[2])}.${parseInt(match[3])}.${parseInt(match[4])}`;
        }

        if (NetUtils.isIPv6Address(ip)) {
            // Shorten IPv6 address according to RFC 5952.

            // Only use lower-case letters.
            ip = ip.toLowerCase();

            // Split into parts.
            const parts = ip.split(':');

            // Return normalized IPv4 address if embedded.
            if (NetUtils.isIPv4Address(parts[parts.length - 1])) {
                return NetUtils._normalizeIP(parts[parts.length - 1]);
            }

            // If it is already shortened at one point, blow it up again.
            // It may be the case, that the current shortening is not as described in the RFC.
            const emptyIndex = parts.indexOf('');
            if (emptyIndex >= 0) {
                parts[emptyIndex] = '0';
                // Also check parts before and after emptyIndex and fill them up if necessary.
                if (emptyIndex > 0 && parts[emptyIndex-1] === '') {
                    parts[emptyIndex-1] = '0';
                }
                if (emptyIndex < parts.length - 1 && parts[emptyIndex+1] === '') {
                    parts[emptyIndex+1] = '0';
                }

                // Add 0s until we have a normal IPv6 length.
                const necessaryAddition = 8-parts.length;
                for (let i=0; i<necessaryAddition; ++i) {
                    parts.splice(emptyIndex, 0, '0');
                }
            }

            let maxZeroSeqStart = -1;
            let maxZeroSeqLength = 0;
            let curZeroSeqStart = -1;
            let curZeroSeqLength = 1;
            for (let i = 0; i < parts.length; ++i) {
                // Remove leading zeros from each part, but keep at least one number.
                parts[i] = parts[i].replace(/^0+([a-f0-9])/, '$1');

                // We look for the longest, leftmost consecutive sequence of zero parts.
                if (parts[i] === '0') {
                    // Freshly started sequence.
                    if (curZeroSeqStart < 0) {
                        curZeroSeqStart = i;
                    } else {
                        // Known sequence, so increment length.
                        curZeroSeqLength++;
                    }
                } else {
                    // A sequence just ended, check if it is of better length.
                    if (curZeroSeqStart >= 0 && curZeroSeqLength > maxZeroSeqLength) {
                        maxZeroSeqStart = curZeroSeqStart;
                        maxZeroSeqLength = curZeroSeqLength;
                        curZeroSeqStart = -1;
                        curZeroSeqLength = 1;
                    }
                }
            }

            if (curZeroSeqStart >= 0 && curZeroSeqLength > maxZeroSeqLength) {
                maxZeroSeqStart = curZeroSeqStart;
                maxZeroSeqLength = curZeroSeqLength;
            }

            // Remove consecutive zeros.
            if (maxZeroSeqStart >= 0 && maxZeroSeqLength > 1) {
                if (maxZeroSeqLength === parts.length) {
                    return '::';
                } else if (maxZeroSeqStart === 0 || maxZeroSeqStart + maxZeroSeqLength === parts.length) {
                    parts.splice(maxZeroSeqStart, maxZeroSeqLength, ':');
                } else {
                    parts.splice(maxZeroSeqStart, maxZeroSeqLength, '');
                }
            }

            return parts.join(':');
        }

        throw `Malformed IP address ${ip}`;
    }

    static _IPv4toLong(ip) {
        const match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
        return (parseInt(match[1])<<24) + (parseInt(match[2])<<16) + (parseInt(match[3])<<8) + (parseInt(match[4]));
    }
}
NetUtils.IP_BLACKLIST = [
    '0.0.0.0',
    '127.0.0.1',
    '255.255.255.255',
    '::',
    '::1'
];
NetUtils.IPv4_PRIVATE_NETWORK = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '100.64.0.0/10', // link-local

    // Actually, the following one is only an approximation,
    // the first and the last /24 subnets in the range should be excluded.
    '169.254.0.0/16'
];
Class.register(NetUtils);

class PeerChannel extends Observable {
    constructor(connection) {
        super();
        this._conn = connection;
        this._conn.on('message', msg => this._onMessage(msg));

        // Forward specified events on the connection to listeners of this Observable.
        this.bubble(this._conn, 'close', 'error', 'ban');
    }

    _onMessage(rawMsg) {
        let msg;
        try {
            msg = MessageFactory.parse(rawMsg);
        } catch(e) {
            Log.w(PeerChannel, `Failed to parse message from ${this.peerAddress || this.netAddress}: ${e}`);

            // Ban client if it sends junk.
            // TODO We should probably be more lenient here. Bitcoin sends a
            // reject message if the message can't be decoded.
            // From the Bitcoin Reference:
            //  "Be careful of reject message feedback loops where two peers
            //   each don’t understand each other’s reject messages and so keep
            //   sending them back and forth forever."
            this.ban('junk received');
        }

        if (!msg) return;

        try {
            this.fire(msg.type, msg, this);
        } catch (e) {
            Log.w(PeerChannel, `Error while processing ${msg.type} message from ${this.peerAddress || this.netAddress}: ${e}`);
        }
    }

    _send(msg) {
        return this._conn.send(msg.serialize());
    }

    close(reason) {
        this._conn.close(reason);
    }

    ban(reason) {
        this._conn.ban(reason);
    }

    version(peerAddress, startHeight, totalWork) {
        return this._send(new VersionMessage(Version.CODE, peerAddress, Block.GENESIS.HASH, startHeight, totalWork));
    }

    verack() {
        return this._send(new VerAckMessage());
    }

    inv(vectors) {
        return this._send(new InvMessage(vectors));
    }

    notfound(vectors) {
        return this._send(new NotFoundMessage(vectors));
    }

    getdata(vectors) {
        return this._send(new GetDataMessage(vectors));
    }

    block(block) {
        return this._send(new BlockMessage(block));
    }

    tx(transaction) {
        return this._send(new TxMessage(transaction));
    }

    getblocks(hashes, hashStop = new Hash(null)) {
        return this._send(new GetBlocksMessage(hashes, hashStop));
    }

    mempool() {
        return this._send(new MempoolMessage());
    }

    reject(messageType, code, reason, extraData) {
        return this._send(new RejectMessage(messageType, code, reason, extraData));
    }

    addr(addresses) {
        return this._send(new AddrMessage(addresses));
    }

    getaddr(protocolMask, serviceMask) {
        return this._send(new GetAddrMessage(protocolMask, serviceMask));
    }

    ping(nonce) {
        return this._send(new PingMessage(nonce));
    }

    pong(nonce) {
        return this._send(new PongMessage(nonce));
    }

    signal(senderId, recipientId, nonce, ttl, flags, payload) {
        return this._send(new SignalMessage(senderId, recipientId, nonce, ttl, flags, payload));
    }

    equals(o) {
        return o instanceof PeerChannel
            && this._conn.equals(o.connection);
    }

    hashCode() {
        return this._conn.hashCode();
    }

    toString() {
        return 'PeerChannel{conn=' + this._conn + '}';
    }

    get connection() {
        return this._conn;
    }

    get id() {
        return this._conn.id;
    }

    get protocol() {
        return this._conn.protocol;
    }

    get peerAddress() {
        return this._conn.peerAddress;
    }

    set peerAddress(value) {
        this._conn.peerAddress = value;
    }

    get netAddress() {
        return this._conn.netAddress;
    }

    set netAddress(value) {
        this._conn.netAddress = value;
    }

    get closed() {
        return this._conn.closed;
    }
}
Class.register(PeerChannel);

class PeerConnection extends Observable {
    constructor(nativeChannel, protocol, netAddress, peerAddress) {
        super();
        this._channel = nativeChannel;

        this._protocol = protocol;
        this._netAddress = netAddress;
        this._peerAddress = peerAddress;

        this._bytesSent = 0;
        this._bytesReceived = 0;

        this._inbound = !peerAddress;
        this._closedByUs = false;
        this._closed = false;

        // Unique id for this connection.
        this._id = PeerConnection._instanceCount++;

        if (this._channel.on) {
            this._channel.on('message', msg => this._onMessage(msg.data || msg));
            this._channel.on('close', () => this._onClose());
            this._channel.on('error', e => this.fire('error', e, this));
        } else {
            this._channel.onmessage = msg => this._onMessage(msg.data || msg);
            this._channel.onclose = () => this._onClose();
            this._channel.onerror = e => this.fire('error', e, this);
        }
    }

    _onMessage(msg) {
        // Don't emit messages if this channel is closed.
        if (this._closed) {
            return;
        }

        // XXX Cleanup!
        if (!PlatformUtils.isBrowser() || !(msg instanceof Blob)) {
            this._bytesReceived += msg.byteLength || msg.length;
            this.fire('message', msg, this);
        } else {
            // Browser only
            // TODO FileReader is slow and this is ugly anyways. Improve!
            const reader = new FileReader();
            reader.onloadend = () => this._onMessage(new Uint8Array(reader.result));
            reader.readAsArrayBuffer(msg);
        }
    }

    _onClose() {
        // Don't fire close event again when already closed.
        if (this._closed) {
            return;
        }

        // Mark this connection as closed.
        this._closed = true;

        // Tell listeners that this connection has closed.
        this.fire('close', !this._closedByUs, this);
    }

    _close() {
        this._closedByUs = true;

        // Don't wait for the native close event to fire.
        this._onClose();

        // Close the native channel.
        this._channel.close();
    }

    _isChannelOpen() {
        return this._channel.readyState === WebSocket.OPEN
            || this._channel.readyState === 'open';
    }

    _isChannelClosing() {
        return this._channel.readyState === WebSocket.CLOSING
            || this._channel.readyState === 'closing';
    }

    _isChannelClosed() {
        return this._channel.readyState === WebSocket.CLOSED
            || this._channel.readyState === 'closed';
    }

    send(msg) {
        const logAddress = this._peerAddress || this._netAddress;
        if (this._closed) {
            // XXX Debug, spammy!!!
            Log.e(PeerConnection, `Tried to send data over closed connection to ${logAddress}`, MessageFactory.parse(msg));
            return false;
        }

        // Fire close event (early) if channel is closing/closed.
        if (this._isChannelClosing() || this._isChannelClosed()) {
            Log.w(PeerConnection, `Not sending data to ${logAddress} - channel closing/closed (${this._channel.readyState})`);
            this._onClose();
            return false;
        }

        // Don't attempt to send if channel is not (yet) open.
        if (!this._isChannelOpen()) {
            Log.w(PeerConnection, `Not sending data to ${logAddress} - channel not open (${this._channel.readyState})`);
            return false;
        }

        try {
            this._channel.send(msg);
            this._bytesSent += msg.byteLength || msg.length;
            return true;
        } catch (e) {
            Log.e(PeerConnection, `Failed to send data to ${logAddress}: ${e.message || e}`);
            return false;
        }
    }

    close(reason) {
        const connType = this._inbound ? 'inbound' : 'outbound';
        Log.d(PeerConnection, `Closing ${connType} connection #${this._id} ${this._peerAddress || this._netAddress}` + (reason ? ` - ${reason}` : ''));
        this._close();
    }

    ban(reason) {
        Log.w(PeerConnection, `Banning peer ${this._peerAddress || this._netAddress}` + (reason ? ` - ${reason}` : ''));
        this._close();
        this.fire('ban', reason, this);
    }

    equals(o) {
        return o instanceof PeerConnection
            && this._id === o.id;
    }

    hashCode() {
        return this._id;
    }

    toString() {
        return `PeerConnection{id=${this._id}, protocol=${this._protocol}, peerAddress=${this._peerAddress}, netAddress=${this._netAddress}}`;
    }

    get id() {
        return this._id;
    }

    get protocol() {
        return this._protocol;
    }

    get peerAddress() {
        return this._peerAddress;
    }

    set peerAddress(value) {
        this._peerAddress = value;
    }

    get netAddress() {
        return this._netAddress;
    }

    set netAddress(value) {
        this._netAddress = value;
    }

    get bytesSent() {
        return this._bytesSent;
    }

    get bytesReceived() {
        return this._bytesReceived;
    }

    get inbound() {
        return this._inbound;
    }

    get outbound() {
        return !this._inbound;
    }

    get closed() {
        return this._closed;
    }
}
// Used to generate unique PeerConnection ids.
PeerConnection._instanceCount = 0;
Class.register(PeerConnection);

class Peer {
    constructor(channel, version, startHeight, totalWork) {
        this._channel = channel;
        this._version = version;
        this._startHeight = startHeight;
        this._totalWork = totalWork;
    }

    get channel() {
        return this._channel;
    }

    get version() {
        return this._version;
    }

    get startHeight() {
        return this._startHeight;
    }

    get totalWork() {
        return this._totalWork;
    }

    get id() {
        return this._channel.id;
    }

    get peerAddress() {
        return this._channel.peerAddress;
    }

    get netAddress() {
        return this._channel.netAddress;
    }

    equals(o) {
        return o instanceof Peer
            && this._channel.equals(o.channel);
    }

    hashCode() {
        return this._channel.hashCode();
    }

    toString() {
        return `Peer{version=${this._version}, startHeight=${this._startHeight}, `
            + `peerAddress=${this.peerAddress}, netAddress=${this.netAddress}}`;
    }
}
Class.register(Peer);

class Miner extends Observable {
    constructor(blockchain, mempool, minerAddress) {
        super();
        this._blockchain = blockchain;
        this._mempool = mempool;
        this._address = minerAddress;

        // Number of hashes computed since the last hashrate update.
        this._hashCount = 0;

        // Timestamp of the last hashrate update.
        this._lastHashrate = 0;

        // Hashrate computation interval handle.
        this._hashrateWorker = null;

        // The current hashrate of this miner.
        this._hashrate = 0;

        // The last hash counts used in the moving average.
        this._lastHashCounts = [];

        // The total hashCount used in the current moving average.
        this._totalHashCount = 0;

        // The time elapsed for the last measurements used in the moving average.
        this._lastElapsed = [];

        // The total time elapsed used in the current moving average.
        this._totalElapsed = 0;

        // Flag indicating that the mempool has changed since we started mining the current block.
        this._mempoolChanged = false;

        // Listen to changes in the mempool which evicts invalid transactions
        // after every blockchain head change and then fires 'transactions-ready'
        // when the eviction process finishes. Restart work on the next block
        // with fresh transactions when this fires.
        this._mempool.on('transactions-ready', () => this._startWork());

        // Immediately start processing transactions when they come in.
        this._mempool.on('transaction-added', () => this._mempoolChanged = true);
    }

    startWork() {
        if (this.working) {
            return;
        }

        // Initialize hashrate computation.
        this._hashCount = 0;
        this._lastElapsed = [];
        this._lastHashCounts = [];
        this._totalHashCount = 0;
        this._totalElapsed = 0;
        this._lastHashrate = Date.now();
        this._hashrateWorker = setInterval(() => this._updateHashrate(), 1000);

        // Tell listeners that we've started working.
        this.fire('start', this);

        // Kick off the mining process.
        this._startWork();
    }

    async _startWork() {
        // XXX Needed as long as we cannot unregister from transactions-ready events.
        if (!this.working) {
            return;
        }

        // Construct next block.
        const block = await this._getNextBlock();
        const buffer = block.header.serialize();
        this._mempoolChanged = false;

        Log.i(Miner, `Starting work on ${block.header}, transactionCount=${block.transactionCount}, hashrate=${this._hashrate} H/s`);

        // Start hashing.
        this._mine(block, buffer);
    }


    async _mine(block, buffer) {
        // If the mempool has changed, restart work with the changed transactions.
        if (this._mempoolChanged) {
            this._startWork();
            return;
        }

        // Abort mining if the blockchain head changed.
        if (!this._blockchain.headHash.equals(block.prevHash)) {
            return;
        }

        // Abort mining if the user stopped the miner.
        if (!this.working) {
            return;
        }

        // Reset the write position of the buffer before re-using it.
        buffer.writePos = 0;

        // Compute hash and check if it meets the proof of work condition.
        const isPoW = await block.header.verifyProofOfWork(buffer);

        // Keep track of how many hashes we have computed.
        this._hashCount++;

        // Check if we have found a block.
        if (isPoW) {
            // Tell listeners that we've mined a block.
            this.fire('block-mined', block, this);

            // Push block into blockchain.
            this._blockchain.pushBlock(block);
        } else {
            // Increment nonce.
            block.header.nonce++;

            // Continue mining.
            this._mine(block, buffer);
        }
    }

    async _getNextBlock() {
        const body = await this._getNextBody();
        const header = await this._getNextHeader(body);
        return new Block(header, body);
    }

    async _getNextHeader(body) {
        const prevHash = await this._blockchain.headHash;
        const accounts = await this._blockchain.createTemporaryAccounts();
        await accounts.commitBlockBody(body);
        const accountsHash = await accounts.hash();
        const bodyHash = await body.hash();
        const height = this._blockchain.height + 1;
        const timestamp = this._getNextTimestamp();
        const nBits = await this._blockchain.getNextCompactTarget();
        const nonce = Math.round(Math.random() * 100000);
        return new BlockHeader(prevHash, bodyHash, accountsHash, nBits, height, timestamp, nonce);
    }

    async _getNextBody() {
        // Get transactions from mempool (default is maxCount=5000).
        // TODO Completely fill up the block with transactions until the size limit is reached.
        const transactions = await this._mempool.getTransactions();
        return new BlockBody(this._address, transactions);
    }

    _getNextTimestamp() {
        const now = Math.floor(Date.now() / 1000);
        return Math.max(now, this._blockchain.head.timestamp + 1);
    }

    stopWork() {
        // TODO unregister from blockchain head-changed events.
        if (!this.working) {
            return;
        }

        clearInterval(this._hashrateWorker);
        this._hashrateWorker = null;
        this._hashrate = 0;
        this._lastElapsed = [];
        this._lastHashCounts = [];
        this._totalHashCount = 0;
        this._totalElapsed = 0;

        // Tell listeners that we've stopped working.
        this.fire('stop', this);

        Log.i(Miner, 'Stopped work');
    }

    _updateHashrate() {
        const elapsed = (Date.now() - this._lastHashrate) / 1000;
        const hashCount = this._hashCount;
        // Enable next measurement.
        this._hashCount = 0;
        this._lastHashrate = Date.now();

        // Update stored information on moving average.
        this._lastElapsed.push(elapsed);
        this._lastHashCounts.push(hashCount);
        this._totalElapsed += elapsed;
        this._totalHashCount += hashCount;

        if (this._lastElapsed.length > Miner.MOVING_AVERAGE_MAX_SIZE) {
            const oldestElapsed = this._lastElapsed.shift();
            const oldestHashCount = this._lastHashCounts.shift();
            this._totalElapsed -= oldestElapsed;
            this._totalHashCount -= oldestHashCount;
        }

        this._hashrate = Math.round(this._totalHashCount / this._totalElapsed);

        // Tell listeners about our new hashrate.
        this.fire('hashrate-changed', this._hashrate, this);
    }

    get address() {
        return this._address;
    }

    get working() {
        return !!this._hashrateWorker;
    }

    get hashrate() {
        return this._hashrate;
    }
}
Miner.MOVING_AVERAGE_MAX_SIZE = 10;
Class.register(Miner);

class WalletStore extends TypedDB {
    constructor() {
        super('wallet', KeyPair);
    }

    async get(key) {
        return this.getObject(key);
    }

    async put(key, value) {
        return this.putObject(key, value);
    }
}
Class.register(WalletStore);

// TODO V2: Store private key encrypted
class Wallet {
    static async getPersistent() {
        const db = new WalletStore();
        let keys = await db.get('keys');
        if (!keys) {
            keys = await KeyPair.generate();
            await db.put('keys', keys);
        }
        return new Wallet(keys);
    }

    static async createVolatile() {
        return new Wallet(await KeyPair.generate());
    }

    static load(hexBuf) {
        const hexMatch = hexBuf.match(/[0-9A-Fa-f]*/);
        if (hexBuf.length / 2 !== Crypto.privateKeySize || hexMatch[0] !== hexBuf) {
            throw Wallet.ERR_INVALID_WALLET_SEED;
        }

        return new Wallet(KeyPair.fromHex(hexBuf));
    }

    constructor(keyPair) {
        this._keyPair = keyPair;
        return this._init();
    }

    async _init() {
        this._address = await this._keyPair.publicKey.toAddress();
        return this;
    }

    createTransaction(recipientAddr, value, fee, nonce) {
        const transaction = new Transaction(this._keyPair.publicKey, recipientAddr, value, fee, nonce);
        return this._signTransaction(transaction);
    }

    async _signTransaction(transaction) {
        transaction.signature = await Signature.create(this._keyPair.privateKey, transaction.serializeContent());
        return transaction;
    }

    get address() {
        return this._address;
    }

    get publicKey() {
        return this._keyPair.publicKey;
    }

    get keyPair() {
        return this._keyPair;
    }

    dump() {
        return this._keyPair.toHex();
    }
}

Wallet.ERR_INVALID_WALLET_SEED = -100;

Class.register(Wallet);

class Core {
    constructor(options) {
        return this._init(options);
    }

    async _init({ walletSeed }) {
        // Model
        this.accounts = await Accounts.getPersistent();
        this.blockchain = await Blockchain.getPersistent(this.accounts);
        this.mempool = new Mempool(this.blockchain, this.accounts);

        // Network
        this.network = await new Network(this.blockchain);

        // Consensus
        this.consensus = new Consensus(this.blockchain, this.mempool, this.network);

        // Wallet
        if (walletSeed) {
            this.wallet = await Wallet.load(walletSeed);
        } else {
            this.wallet = await Wallet.getPersistent();
        }

        // Miner
        this.miner = new Miner(this.blockchain, this.mempool, this.wallet.address);

        Object.freeze(this);
        return this;
    }
}
Class.register(Core);

// Print stack traces to the console.
Error.prototype.toString = function () {
    return this.stack;
};

// Don't exit on uncaught exceptions.
process.on('uncaughtException', (err) => {
    // Blacklist unsupressable WebSocket errors.
    const message = err.message;
    if (message
        && (
            message.startsWith('connect E')
            || message === "Cannot read property 'aborted' of null")
        ) {
        return;
    }

    console.error(`Uncaught exception: ${err.message || err}`);
});

//# sourceMappingURL=node.js.map