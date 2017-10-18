require=function t(e,r,n){function o(c,s){if(!r[c]){if(!e[c]){var a="function"==typeof require&&require;if(!s&&a)return a(c,!0);if(i)return i(c,!0);var u=new Error("Cannot find module '"+c+"'");throw u.code="MODULE_NOT_FOUND",u}var f=r[c]={exports:{}};e[c][0].call(f.exports,function(t){var r=e[c][1][t];return o(r||t)},f,f.exports,t,e,r,n)}return r[c].exports}for(var i="function"==typeof require&&require,c=0;c<n.length;c++)o(n[c]);return o}({1:[function(t,e,r){e.exports={default:t("core-js/library/fn/object/define-property"),__esModule:!0}},{"core-js/library/fn/object/define-property":3}],2:[function(t,e,r){e.exports={default:t("core-js/library/fn/promise"),__esModule:!0}},{"core-js/library/fn/promise":4}],3:[function(t,e,r){t("../../modules/es6.object.define-property");var n=t("../../modules/_core").Object;e.exports=function(t,e,r){return n.defineProperty(t,e,r)}},{"../../modules/_core":12,"../../modules/es6.object.define-property":67}],4:[function(t,e,r){t("../modules/es6.object.to-string"),t("../modules/es6.string.iterator"),t("../modules/web.dom.iterable"),t("../modules/es6.promise"),t("../modules/es7.promise.finally"),t("../modules/es7.promise.try"),e.exports=t("../modules/_core").Promise},{"../modules/_core":12,"../modules/es6.object.to-string":68,"../modules/es6.promise":69,"../modules/es6.string.iterator":70,"../modules/es7.promise.finally":71,"../modules/es7.promise.try":72,"../modules/web.dom.iterable":73}],5:[function(t,e,r){e.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},{}],6:[function(t,e,r){e.exports=function(){}},{}],7:[function(t,e,r){e.exports=function(t,e,r,n){if(!(t instanceof e)||void 0!==n&&n in t)throw TypeError(r+": incorrect invocation!");return t}},{}],8:[function(t,e,r){var n=t("./_is-object");e.exports=function(t){if(!n(t))throw TypeError(t+" is not an object!");return t}},{"./_is-object":29}],9:[function(t,e,r){var n=t("./_to-iobject"),o=t("./_to-length"),i=t("./_to-absolute-index");e.exports=function(t){return function(e,r,c){var s,a=n(e),u=o(a.length),f=i(c,u);if(t&&r!=r){for(;u>f;)if((s=a[f++])!=s)return!0}else for(;u>f;f++)if((t||f in a)&&a[f]===r)return t||f||0;return!t&&-1}}},{"./_to-absolute-index":57,"./_to-iobject":59,"./_to-length":60}],10:[function(t,e,r){var n=t("./_cof"),o=t("./_wks")("toStringTag"),i="Arguments"==n(function(){return arguments}()),c=function(t,e){try{return t[e]}catch(t){}};e.exports=function(t){var e,r,s;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=c(e=Object(t),o))?r:i?n(e):"Object"==(s=n(e))&&"function"==typeof e.callee?"Arguments":s}},{"./_cof":11,"./_wks":64}],11:[function(t,e,r){var n={}.toString;e.exports=function(t){return n.call(t).slice(8,-1)}},{}],12:[function(t,e,r){var n=e.exports={version:"2.5.1"};"number"==typeof __e&&(__e=n)},{}],13:[function(t,e,r){var n=t("./_a-function");e.exports=function(t,e,r){if(n(t),void 0===e)return t;switch(r){case 1:return function(r){return t.call(e,r)};case 2:return function(r,n){return t.call(e,r,n)};case 3:return function(r,n,o){return t.call(e,r,n,o)}}return function(){return t.apply(e,arguments)}}},{"./_a-function":5}],14:[function(t,e,r){e.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},{}],15:[function(t,e,r){e.exports=!t("./_fails")(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},{"./_fails":19}],16:[function(t,e,r){var n=t("./_is-object"),o=t("./_global").document,i=n(o)&&n(o.createElement);e.exports=function(t){return i?o.createElement(t):{}}},{"./_global":21,"./_is-object":29}],17:[function(t,e,r){e.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},{}],18:[function(t,e,r){var n=t("./_global"),o=t("./_core"),i=t("./_ctx"),c=t("./_hide"),s=function(t,e,r){var a,u,f,l=t&s.F,_=t&s.G,p=t&s.S,h=t&s.P,d=t&s.B,v=t&s.W,y=_?o:o[e]||(o[e]={}),m=y.prototype,g=_?n:p?n[e]:(n[e]||{}).prototype;_&&(r=e);for(a in r)(u=!l&&g&&void 0!==g[a])&&a in y||(f=u?g[a]:r[a],y[a]=_&&"function"!=typeof g[a]?r[a]:d&&u?i(f,n):v&&g[a]==f?function(t){var e=function(e,r,n){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,r)}return new t(e,r,n)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(f):h&&"function"==typeof f?i(Function.call,f):f,h&&((y.virtual||(y.virtual={}))[a]=f,t&s.R&&m&&!m[a]&&c(m,a,f)))};s.F=1,s.G=2,s.S=4,s.P=8,s.B=16,s.W=32,s.U=64,s.R=128,e.exports=s},{"./_core":12,"./_ctx":13,"./_global":21,"./_hide":23}],19:[function(t,e,r){e.exports=function(t){try{return!!t()}catch(t){return!0}}},{}],20:[function(t,e,r){var n=t("./_ctx"),o=t("./_iter-call"),i=t("./_is-array-iter"),c=t("./_an-object"),s=t("./_to-length"),a=t("./core.get-iterator-method"),u={},f={};(r=e.exports=function(t,e,r,l,_){var p,h,d,v,y=_?function(){return t}:a(t),m=n(r,l,e?2:1),g=0;if("function"!=typeof y)throw TypeError(t+" is not iterable!");if(i(y)){for(p=s(t.length);p>g;g++)if((v=e?m(c(h=t[g])[0],h[1]):m(t[g]))===u||v===f)return v}else for(d=y.call(t);!(h=d.next()).done;)if((v=o(d,m,h.value,e))===u||v===f)return v}).BREAK=u,r.RETURN=f},{"./_an-object":8,"./_ctx":13,"./_is-array-iter":28,"./_iter-call":30,"./_to-length":60,"./core.get-iterator-method":65}],21:[function(t,e,r){var n=e.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},{}],22:[function(t,e,r){var n={}.hasOwnProperty;e.exports=function(t,e){return n.call(t,e)}},{}],23:[function(t,e,r){var n=t("./_object-dp"),o=t("./_property-desc");e.exports=t("./_descriptors")?function(t,e,r){return n.f(t,e,o(1,r))}:function(t,e,r){return t[e]=r,t}},{"./_descriptors":15,"./_object-dp":40,"./_property-desc":47}],24:[function(t,e,r){var n=t("./_global").document;e.exports=n&&n.documentElement},{"./_global":21}],25:[function(t,e,r){e.exports=!t("./_descriptors")&&!t("./_fails")(function(){return 7!=Object.defineProperty(t("./_dom-create")("div"),"a",{get:function(){return 7}}).a})},{"./_descriptors":15,"./_dom-create":16,"./_fails":19}],26:[function(t,e,r){e.exports=function(t,e,r){var n=void 0===r;switch(e.length){case 0:return n?t():t.call(r);case 1:return n?t(e[0]):t.call(r,e[0]);case 2:return n?t(e[0],e[1]):t.call(r,e[0],e[1]);case 3:return n?t(e[0],e[1],e[2]):t.call(r,e[0],e[1],e[2]);case 4:return n?t(e[0],e[1],e[2],e[3]):t.call(r,e[0],e[1],e[2],e[3])}return t.apply(r,e)}},{}],27:[function(t,e,r){var n=t("./_cof");e.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==n(t)?t.split(""):Object(t)}},{"./_cof":11}],28:[function(t,e,r){var n=t("./_iterators"),o=t("./_wks")("iterator"),i=Array.prototype;e.exports=function(t){return void 0!==t&&(n.Array===t||i[o]===t)}},{"./_iterators":35,"./_wks":64}],29:[function(t,e,r){e.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},{}],30:[function(t,e,r){var n=t("./_an-object");e.exports=function(t,e,r,o){try{return o?e(n(r)[0],r[1]):e(r)}catch(e){var i=t.return;throw void 0!==i&&n(i.call(t)),e}}},{"./_an-object":8}],31:[function(t,e,r){"use strict";var n=t("./_object-create"),o=t("./_property-desc"),i=t("./_set-to-string-tag"),c={};t("./_hide")(c,t("./_wks")("iterator"),function(){return this}),e.exports=function(t,e,r){t.prototype=n(c,{next:o(1,r)}),i(t,e+" Iterator")}},{"./_hide":23,"./_object-create":39,"./_property-desc":47,"./_set-to-string-tag":51,"./_wks":64}],32:[function(t,e,r){"use strict";var n=t("./_library"),o=t("./_export"),i=t("./_redefine"),c=t("./_hide"),s=t("./_has"),a=t("./_iterators"),u=t("./_iter-create"),f=t("./_set-to-string-tag"),l=t("./_object-gpo"),_=t("./_wks")("iterator"),p=!([].keys&&"next"in[].keys()),h=function(){return this};e.exports=function(t,e,r,d,v,y,m){u(r,e,d);var g,b,x,w=function(t){if(!p&&t in O)return O[t];switch(t){case"keys":case"values":return function(){return new r(this,t)}}return function(){return new r(this,t)}},j=e+" Iterator",k="values"==v,L=!1,O=t.prototype,P=O[_]||O["@@iterator"]||v&&O[v],S=P||w(v),E=v?k?w("entries"):S:void 0,T="Array"==e?O.entries||P:P;if(T&&(x=l(T.call(new t)))!==Object.prototype&&x.next&&(f(x,j,!0),n||s(x,_)||c(x,_,h)),k&&P&&"values"!==P.name&&(L=!0,S=function(){return P.call(this)}),n&&!m||!p&&!L&&O[_]||c(O,_,S),a[e]=S,a[j]=h,v)if(g={values:k?S:w("values"),keys:y?S:w("keys"),entries:E},m)for(b in g)b in O||i(O,b,g[b]);else o(o.P+o.F*(p||L),e,g);return g}},{"./_export":18,"./_has":22,"./_hide":23,"./_iter-create":31,"./_iterators":35,"./_library":36,"./_object-gpo":42,"./_redefine":49,"./_set-to-string-tag":51,"./_wks":64}],33:[function(t,e,r){var n=t("./_wks")("iterator"),o=!1;try{var i=[7][n]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}e.exports=function(t,e){if(!e&&!o)return!1;var r=!1;try{var i=[7],c=i[n]();c.next=function(){return{done:r=!0}},i[n]=function(){return c},t(i)}catch(t){}return r}},{"./_wks":64}],34:[function(t,e,r){e.exports=function(t,e){return{value:e,done:!!t}}},{}],35:[function(t,e,r){e.exports={}},{}],36:[function(t,e,r){e.exports=!0},{}],37:[function(t,e,r){var n=t("./_global"),o=t("./_task").set,i=n.MutationObserver||n.WebKitMutationObserver,c=n.process,s=n.Promise,a="process"==t("./_cof")(c);e.exports=function(){var t,e,r,u=function(){var n,o;for(a&&(n=c.domain)&&n.exit();t;){o=t.fn,t=t.next;try{o()}catch(n){throw t?r():e=void 0,n}}e=void 0,n&&n.enter()};if(a)r=function(){c.nextTick(u)};else if(i){var f=!0,l=document.createTextNode("");new i(u).observe(l,{characterData:!0}),r=function(){l.data=f=!f}}else if(s&&s.resolve){var _=s.resolve();r=function(){_.then(u)}}else r=function(){o.call(n,u)};return function(n){var o={fn:n,next:void 0};e&&(e.next=o),t||(t=o,r()),e=o}}},{"./_cof":11,"./_global":21,"./_task":56}],38:[function(t,e,r){"use strict";function n(t){var e,r;this.promise=new t(function(t,n){if(void 0!==e||void 0!==r)throw TypeError("Bad Promise constructor");e=t,r=n}),this.resolve=o(e),this.reject=o(r)}var o=t("./_a-function");e.exports.f=function(t){return new n(t)}},{"./_a-function":5}],39:[function(t,e,r){var n=t("./_an-object"),o=t("./_object-dps"),i=t("./_enum-bug-keys"),c=t("./_shared-key")("IE_PROTO"),s=function(){},a=function(){var e,r=t("./_dom-create")("iframe"),n=i.length;for(r.style.display="none",t("./_html").appendChild(r),r.src="javascript:",(e=r.contentWindow.document).open(),e.write("<script>document.F=Object<\/script>"),e.close(),a=e.F;n--;)delete a.prototype[i[n]];return a()};e.exports=Object.create||function(t,e){var r;return null!==t?(s.prototype=n(t),r=new s,s.prototype=null,r[c]=t):r=a(),void 0===e?r:o(r,e)}},{"./_an-object":8,"./_dom-create":16,"./_enum-bug-keys":17,"./_html":24,"./_object-dps":41,"./_shared-key":52}],40:[function(t,e,r){var n=t("./_an-object"),o=t("./_ie8-dom-define"),i=t("./_to-primitive"),c=Object.defineProperty;r.f=t("./_descriptors")?Object.defineProperty:function(t,e,r){if(n(t),e=i(e,!0),n(r),o)try{return c(t,e,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[e]=r.value),t}},{"./_an-object":8,"./_descriptors":15,"./_ie8-dom-define":25,"./_to-primitive":62}],41:[function(t,e,r){var n=t("./_object-dp"),o=t("./_an-object"),i=t("./_object-keys");e.exports=t("./_descriptors")?Object.defineProperties:function(t,e){o(t);for(var r,c=i(e),s=c.length,a=0;s>a;)n.f(t,r=c[a++],e[r]);return t}},{"./_an-object":8,"./_descriptors":15,"./_object-dp":40,"./_object-keys":44}],42:[function(t,e,r){var n=t("./_has"),o=t("./_to-object"),i=t("./_shared-key")("IE_PROTO"),c=Object.prototype;e.exports=Object.getPrototypeOf||function(t){return t=o(t),n(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?c:null}},{"./_has":22,"./_shared-key":52,"./_to-object":61}],43:[function(t,e,r){var n=t("./_has"),o=t("./_to-iobject"),i=t("./_array-includes")(!1),c=t("./_shared-key")("IE_PROTO");e.exports=function(t,e){var r,s=o(t),a=0,u=[];for(r in s)r!=c&&n(s,r)&&u.push(r);for(;e.length>a;)n(s,r=e[a++])&&(~i(u,r)||u.push(r));return u}},{"./_array-includes":9,"./_has":22,"./_shared-key":52,"./_to-iobject":59}],44:[function(t,e,r){var n=t("./_object-keys-internal"),o=t("./_enum-bug-keys");e.exports=Object.keys||function(t){return n(t,o)}},{"./_enum-bug-keys":17,"./_object-keys-internal":43}],45:[function(t,e,r){e.exports=function(t){try{return{e:!1,v:t()}}catch(t){return{e:!0,v:t}}}},{}],46:[function(t,e,r){var n=t("./_an-object"),o=t("./_is-object"),i=t("./_new-promise-capability");e.exports=function(t,e){if(n(t),o(e)&&e.constructor===t)return e;var r=i.f(t);return(0,r.resolve)(e),r.promise}},{"./_an-object":8,"./_is-object":29,"./_new-promise-capability":38}],47:[function(t,e,r){e.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},{}],48:[function(t,e,r){var n=t("./_hide");e.exports=function(t,e,r){for(var o in e)r&&t[o]?t[o]=e[o]:n(t,o,e[o]);return t}},{"./_hide":23}],49:[function(t,e,r){e.exports=t("./_hide")},{"./_hide":23}],50:[function(t,e,r){"use strict";var n=t("./_global"),o=t("./_core"),i=t("./_object-dp"),c=t("./_descriptors"),s=t("./_wks")("species");e.exports=function(t){var e="function"==typeof o[t]?o[t]:n[t];c&&e&&!e[s]&&i.f(e,s,{configurable:!0,get:function(){return this}})}},{"./_core":12,"./_descriptors":15,"./_global":21,"./_object-dp":40,"./_wks":64}],51:[function(t,e,r){var n=t("./_object-dp").f,o=t("./_has"),i=t("./_wks")("toStringTag");e.exports=function(t,e,r){t&&!o(t=r?t:t.prototype,i)&&n(t,i,{configurable:!0,value:e})}},{"./_has":22,"./_object-dp":40,"./_wks":64}],52:[function(t,e,r){var n=t("./_shared")("keys"),o=t("./_uid");e.exports=function(t){return n[t]||(n[t]=o(t))}},{"./_shared":53,"./_uid":63}],53:[function(t,e,r){var n=t("./_global"),o=n["__core-js_shared__"]||(n["__core-js_shared__"]={});e.exports=function(t){return o[t]||(o[t]={})}},{"./_global":21}],54:[function(t,e,r){var n=t("./_an-object"),o=t("./_a-function"),i=t("./_wks")("species");e.exports=function(t,e){var r,c=n(t).constructor;return void 0===c||void 0==(r=n(c)[i])?e:o(r)}},{"./_a-function":5,"./_an-object":8,"./_wks":64}],55:[function(t,e,r){var n=t("./_to-integer"),o=t("./_defined");e.exports=function(t){return function(e,r){var i,c,s=String(o(e)),a=n(r),u=s.length;return a<0||a>=u?t?"":void 0:(i=s.charCodeAt(a))<55296||i>56319||a+1===u||(c=s.charCodeAt(a+1))<56320||c>57343?t?s.charAt(a):i:t?s.slice(a,a+2):c-56320+(i-55296<<10)+65536}}},{"./_defined":14,"./_to-integer":58}],56:[function(t,e,r){var n,o,i,c=t("./_ctx"),s=t("./_invoke"),a=t("./_html"),u=t("./_dom-create"),f=t("./_global"),l=f.process,_=f.setImmediate,p=f.clearImmediate,h=f.MessageChannel,d=f.Dispatch,v=0,y={},m=function(){var t=+this;if(y.hasOwnProperty(t)){var e=y[t];delete y[t],e()}},g=function(t){m.call(t.data)};_&&p||(_=function(t){for(var e=[],r=1;arguments.length>r;)e.push(arguments[r++]);return y[++v]=function(){s("function"==typeof t?t:Function(t),e)},n(v),v},p=function(t){delete y[t]},"process"==t("./_cof")(l)?n=function(t){l.nextTick(c(m,t,1))}:d&&d.now?n=function(t){d.now(c(m,t,1))}:h?(i=(o=new h).port2,o.port1.onmessage=g,n=c(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(n=function(t){f.postMessage(t+"","*")},f.addEventListener("message",g,!1)):n="onreadystatechange"in u("script")?function(t){a.appendChild(u("script")).onreadystatechange=function(){a.removeChild(this),m.call(t)}}:function(t){setTimeout(c(m,t,1),0)}),e.exports={set:_,clear:p}},{"./_cof":11,"./_ctx":13,"./_dom-create":16,"./_global":21,"./_html":24,"./_invoke":26}],57:[function(t,e,r){var n=t("./_to-integer"),o=Math.max,i=Math.min;e.exports=function(t,e){return(t=n(t))<0?o(t+e,0):i(t,e)}},{"./_to-integer":58}],58:[function(t,e,r){var n=Math.ceil,o=Math.floor;e.exports=function(t){return isNaN(t=+t)?0:(t>0?o:n)(t)}},{}],59:[function(t,e,r){var n=t("./_iobject"),o=t("./_defined");e.exports=function(t){return n(o(t))}},{"./_defined":14,"./_iobject":27}],60:[function(t,e,r){var n=t("./_to-integer"),o=Math.min;e.exports=function(t){return t>0?o(n(t),9007199254740991):0}},{"./_to-integer":58}],61:[function(t,e,r){var n=t("./_defined");e.exports=function(t){return Object(n(t))}},{"./_defined":14}],62:[function(t,e,r){var n=t("./_is-object");e.exports=function(t,e){if(!n(t))return t;var r,o;if(e&&"function"==typeof(r=t.toString)&&!n(o=r.call(t)))return o;if("function"==typeof(r=t.valueOf)&&!n(o=r.call(t)))return o;if(!e&&"function"==typeof(r=t.toString)&&!n(o=r.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},{"./_is-object":29}],63:[function(t,e,r){var n=0,o=Math.random();e.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+o).toString(36))}},{}],64:[function(t,e,r){var n=t("./_shared")("wks"),o=t("./_uid"),i=t("./_global").Symbol,c="function"==typeof i;(e.exports=function(t){return n[t]||(n[t]=c&&i[t]||(c?i:o)("Symbol."+t))}).store=n},{"./_global":21,"./_shared":53,"./_uid":63}],65:[function(t,e,r){var n=t("./_classof"),o=t("./_wks")("iterator"),i=t("./_iterators");e.exports=t("./_core").getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[n(t)]}},{"./_classof":10,"./_core":12,"./_iterators":35,"./_wks":64}],66:[function(t,e,r){"use strict";var n=t("./_add-to-unscopables"),o=t("./_iter-step"),i=t("./_iterators"),c=t("./_to-iobject");e.exports=t("./_iter-define")(Array,"Array",function(t,e){this._t=c(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,r=this._i++;return!t||r>=t.length?(this._t=void 0,o(1)):"keys"==e?o(0,r):"values"==e?o(0,t[r]):o(0,[r,t[r]])},"values"),i.Arguments=i.Array,n("keys"),n("values"),n("entries")},{"./_add-to-unscopables":6,"./_iter-define":32,"./_iter-step":34,"./_iterators":35,"./_to-iobject":59}],67:[function(t,e,r){var n=t("./_export");n(n.S+n.F*!t("./_descriptors"),"Object",{defineProperty:t("./_object-dp").f})},{"./_descriptors":15,"./_export":18,"./_object-dp":40}],68:[function(t,e,r){},{}],69:[function(t,e,r){"use strict";var n,o,i,c,s=t("./_library"),a=t("./_global"),u=t("./_ctx"),f=t("./_classof"),l=t("./_export"),_=t("./_is-object"),p=t("./_a-function"),h=t("./_an-instance"),d=t("./_for-of"),v=t("./_species-constructor"),y=t("./_task").set,m=t("./_microtask")(),g=t("./_new-promise-capability"),b=t("./_perform"),x=t("./_promise-resolve"),w=a.TypeError,j=a.process,k=a.Promise,L="process"==f(j),O=function(){},P=o=g.f,S=!!function(){try{var e=k.resolve(1),r=(e.constructor={})[t("./_wks")("species")]=function(t){t(O,O)};return(L||"function"==typeof PromiseRejectionEvent)&&e.then(O)instanceof r}catch(t){}}(),E=function(t){var e;return!(!_(t)||"function"!=typeof(e=t.then))&&e},T=function(t,e){if(!t._n){t._n=!0;var r=t._c;m(function(){for(var n=t._v,o=1==t._s,i=0;r.length>i;)!function(e){var r,i,c=o?e.ok:e.fail,s=e.resolve,a=e.reject,u=e.domain;try{c?(o||(2==t._h&&F(t),t._h=1),!0===c?r=n:(u&&u.enter(),r=c(n),u&&u.exit()),r===e.promise?a(w("Promise-chain cycle")):(i=E(r))?i.call(r,s,a):s(r)):a(n)}catch(t){a(t)}}(r[i++]);t._c=[],t._n=!1,e&&!t._h&&M(t)})}},M=function(t){y.call(a,function(){var e,r,n,o=t._v,i=R(t);if(i&&(e=b(function(){L?j.emit("unhandledRejection",o,t):(r=a.onunhandledrejection)?r({promise:t,reason:o}):(n=a.console)&&n.error&&n.error("Unhandled promise rejection",o)}),t._h=L||R(t)?2:1),t._a=void 0,i&&e.e)throw e.v})},R=function(t){if(1==t._h)return!1;for(var e,r=t._a||t._c,n=0;r.length>n;)if((e=r[n++]).fail||!R(e.promise))return!1;return!0},F=function(t){y.call(a,function(){var e;L?j.emit("rejectionHandled",t):(e=a.onrejectionhandled)&&e({promise:t,reason:t._v})})},A=function(t){var e=this;e._d||(e._d=!0,(e=e._w||e)._v=t,e._s=2,e._a||(e._a=e._c.slice()),T(e,!0))},C=function(t){var e,r=this;if(!r._d){r._d=!0,r=r._w||r;try{if(r===t)throw w("Promise can't be resolved itself");(e=E(t))?m(function(){var n={_w:r,_d:!1};try{e.call(t,u(C,n,1),u(A,n,1))}catch(t){A.call(n,t)}}):(r._v=t,r._s=1,T(r,!1))}catch(t){A.call({_w:r,_d:!1},t)}}};S||(k=function(t){h(this,k,"Promise","_h"),p(t),n.call(this);try{t(u(C,this,1),u(A,this,1))}catch(t){A.call(this,t)}},(n=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1}).prototype=t("./_redefine-all")(k.prototype,{then:function(t,e){var r=P(v(this,k));return r.ok="function"!=typeof t||t,r.fail="function"==typeof e&&e,r.domain=L?j.domain:void 0,this._c.push(r),this._a&&this._a.push(r),this._s&&T(this,!1),r.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new n;this.promise=t,this.resolve=u(C,t,1),this.reject=u(A,t,1)},g.f=P=function(t){return t===k||t===c?new i(t):o(t)}),l(l.G+l.W+l.F*!S,{Promise:k}),t("./_set-to-string-tag")(k,"Promise"),t("./_set-species")("Promise"),c=t("./_core").Promise,l(l.S+l.F*!S,"Promise",{reject:function(t){var e=P(this);return(0,e.reject)(t),e.promise}}),l(l.S+l.F*(s||!S),"Promise",{resolve:function(t){return x(s&&this===c?k:this,t)}}),l(l.S+l.F*!(S&&t("./_iter-detect")(function(t){k.all(t).catch(O)})),"Promise",{all:function(t){var e=this,r=P(e),n=r.resolve,o=r.reject,i=b(function(){var r=[],i=0,c=1;d(t,!1,function(t){var s=i++,a=!1;r.push(void 0),c++,e.resolve(t).then(function(t){a||(a=!0,r[s]=t,--c||n(r))},o)}),--c||n(r)});return i.e&&o(i.v),r.promise},race:function(t){var e=this,r=P(e),n=r.reject,o=b(function(){d(t,!1,function(t){e.resolve(t).then(r.resolve,n)})});return o.e&&n(o.v),r.promise}})},{"./_a-function":5,"./_an-instance":7,"./_classof":10,"./_core":12,"./_ctx":13,"./_export":18,"./_for-of":20,"./_global":21,"./_is-object":29,"./_iter-detect":33,"./_library":36,"./_microtask":37,"./_new-promise-capability":38,"./_perform":45,"./_promise-resolve":46,"./_redefine-all":48,"./_set-species":50,"./_set-to-string-tag":51,"./_species-constructor":54,"./_task":56,"./_wks":64}],70:[function(t,e,r){"use strict";var n=t("./_string-at")(!0);t("./_iter-define")(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,e=this._t,r=this._i;return r>=e.length?{value:void 0,done:!0}:(t=n(e,r),this._i+=t.length,{value:t,done:!1})})},{"./_iter-define":32,"./_string-at":55}],71:[function(t,e,r){"use strict";var n=t("./_export"),o=t("./_core"),i=t("./_global"),c=t("./_species-constructor"),s=t("./_promise-resolve");n(n.P+n.R,"Promise",{finally:function(t){var e=c(this,o.Promise||i.Promise),r="function"==typeof t;return this.then(r?function(r){return s(e,t()).then(function(){return r})}:t,r?function(r){return s(e,t()).then(function(){throw r})}:t)}})},{"./_core":12,"./_export":18,"./_global":21,"./_promise-resolve":46,"./_species-constructor":54}],72:[function(t,e,r){"use strict";var n=t("./_export"),o=t("./_new-promise-capability"),i=t("./_perform");n(n.S,"Promise",{try:function(t){var e=o.f(this),r=i(t);return(r.e?e.reject:e.resolve)(r.v),e.promise}})},{"./_export":18,"./_new-promise-capability":38,"./_perform":45}],73:[function(t,e,r){t("./es6.array.iterator");for(var n=t("./_global"),o=t("./_hide"),i=t("./_iterators"),c=t("./_wks")("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),a=0;a<s.length;a++){var u=s[a],f=n[u],l=f&&f.prototype;l&&!l[c]&&o(l,c,u),i[u]=i.Array}},{"./_global":21,"./_hide":23,"./_iterators":35,"./_wks":64,"./es6.array.iterator":66}],74:[function(t,e,r){var n=function(){return this}()||Function("return this")(),o=n.regeneratorRuntime&&Object.getOwnPropertyNames(n).indexOf("regeneratorRuntime")>=0,i=o&&n.regeneratorRuntime;if(n.regeneratorRuntime=void 0,e.exports=t("./runtime"),o)n.regeneratorRuntime=i;else try{delete n.regeneratorRuntime}catch(t){n.regeneratorRuntime=void 0}},{"./runtime":75}],75:[function(t,e,r){!function(t){"use strict";function r(t,e,r,n){var i=e&&e.prototype instanceof o?e:o,c=Object.create(i.prototype),s=new p(n||[]);return c._invoke=u(t,r,s),c}function n(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}function o(){}function i(){}function c(){}function s(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function a(t){function e(r,o,i,c){var s=n(t[r],t,o);if("throw"!==s.type){var a=s.arg,u=a.value;return u&&"object"==typeof u&&m.call(u,"__await")?Promise.resolve(u.__await).then(function(t){e("next",t,i,c)},function(t){e("throw",t,i,c)}):Promise.resolve(u).then(function(t){a.value=t,i(a)},c)}c(s.arg)}var r;this._invoke=function(t,n){function o(){return new Promise(function(r,o){e(t,n,r,o)})}return r=r?r.then(o,o):o()}}function u(t,e,r){var o=L;return function(i,c){if(o===P)throw new Error("Generator is already running");if(o===S){if("throw"===i)throw c;return d()}for(r.method=i,r.arg=c;;){var s=r.delegate;if(s){var a=f(s,r);if(a){if(a===E)continue;return a}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(o===L)throw o=S,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);o=P;var u=n(t,e,r);if("normal"===u.type){if(o=r.done?S:O,u.arg===E)continue;return{value:u.arg,done:r.done}}"throw"===u.type&&(o=S,r.method="throw",r.arg=u.arg)}}}function f(t,e){var r=t.iterator[e.method];if(r===v){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=v,f(t,e),"throw"===e.method))return E;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return E}var o=n(r,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,E;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=v),e.delegate=null,E):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,E)}function l(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function _(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function p(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(l,this),this.reset(!0)}function h(t){if(t){var e=t[b];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,n=function e(){for(;++r<t.length;)if(m.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=v,e.done=!0,e};return n.next=n}}return{next:d}}function d(){return{value:v,done:!0}}var v,y=Object.prototype,m=y.hasOwnProperty,g="function"==typeof Symbol?Symbol:{},b=g.iterator||"@@iterator",x=g.asyncIterator||"@@asyncIterator",w=g.toStringTag||"@@toStringTag",j="object"==typeof e,k=t.regeneratorRuntime;if(k)j&&(e.exports=k);else{(k=t.regeneratorRuntime=j?e.exports:{}).wrap=r;var L="suspendedStart",O="suspendedYield",P="executing",S="completed",E={},T={};T[b]=function(){return this};var M=Object.getPrototypeOf,R=M&&M(M(h([])));R&&R!==y&&m.call(R,b)&&(T=R);var F=c.prototype=o.prototype=Object.create(T);i.prototype=F.constructor=c,c.constructor=i,c[w]=i.displayName="GeneratorFunction",k.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===i||"GeneratorFunction"===(e.displayName||e.name))},k.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,c):(t.__proto__=c,w in t||(t[w]="GeneratorFunction")),t.prototype=Object.create(F),t},k.awrap=function(t){return{__await:t}},s(a.prototype),a.prototype[x]=function(){return this},k.AsyncIterator=a,k.async=function(t,e,n,o){var i=new a(r(t,e,n,o));return k.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},s(F),F[w]="Generator",F[b]=function(){return this},F.toString=function(){return"[object Generator]"},k.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},k.values=h,p.prototype={constructor:p,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=v,this.done=!1,this.delegate=null,this.method="next",this.arg=v,this.tryEntries.forEach(_),!t)for(var e in this)"t"===e.charAt(0)&&m.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=v)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){function e(e,n){return i.type="throw",i.arg=t,r.next=e,n&&(r.method="next",r.arg=v),!!n}if(this.done)throw t;for(var r=this,n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n],i=o.completion;if("root"===o.tryLoc)return e("end");if(o.tryLoc<=this.prev){var c=m.call(o,"catchLoc"),s=m.call(o,"finallyLoc");if(c&&s){if(this.prev<o.catchLoc)return e(o.catchLoc,!0);if(this.prev<o.finallyLoc)return e(o.finallyLoc)}else if(c){if(this.prev<o.catchLoc)return e(o.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return e(o.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&m.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=e,o?(this.method="next",this.next=o.finallyLoc,E):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),E},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),_(r),E}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;_(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:h(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=v),E}}}}(function(){return this}()||Function("return this")())},{}],"babel-runtime/helpers/asyncToGenerator":[function(t,e,r){"use strict";r.__esModule=!0;var n=function(t){return t&&t.__esModule?t:{default:t}}(t("../core-js/promise"));r.default=function(t){return function(){var e=t.apply(this,arguments);return new n.default(function(t,r){function o(i,c){try{var s=e[i](c),a=s.value}catch(t){return void r(t)}if(!s.done)return n.default.resolve(a).then(function(t){o("next",t)},function(t){o("throw",t)});t(a)}return o("next")})}}},{"../core-js/promise":2}],"babel-runtime/helpers/classCallCheck":[function(t,e,r){"use strict";r.__esModule=!0,r.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},{}],"babel-runtime/helpers/createClass":[function(t,e,r){"use strict";r.__esModule=!0;var n=function(t){return t&&t.__esModule?t:{default:t}}(t("../core-js/object/define-property"));r.default=function(){function t(t,e){for(var r=0;r<e.length;r++){var o=e[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),(0,n.default)(t,o.key,o)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}()},{"../core-js/object/define-property":1}],"babel-runtime/regenerator":[function(t,e,r){e.exports=t("regenerator-runtime")},{"regenerator-runtime":74}]},{},[]);
'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WindowDetector = function () {
    (0, _createClass3.default)(WindowDetector, null, [{
        key: 'get',


        // Singleton
        value: function get() {
            if (!WindowDetector._instance) {
                WindowDetector._instance = new WindowDetector();
            }
            return WindowDetector._instance;
        }
    }, {
        key: 'KEY_PING',
        get: function get() {
            return 'WindowDetector.PING';
        }
    }, {
        key: 'KEY_PONG',
        get: function get() {
            return 'WindowDetector.PONG';
        }
    }, {
        key: 'KEY_BYE',
        get: function get() {
            return 'WindowDetector.BYE';
        }
    }]);

    function WindowDetector() {
        var _this = this;

        (0, _classCallCheck3.default)(this, WindowDetector);

        window.addEventListener('storage', function (e) {
            if (e.key === WindowDetector.KEY_PING) {
                _this._pong(e.newValue);
            }
        });
        window.addEventListener('unload', function () {
            _this._bye();
        });
    }

    (0, _createClass3.default)(WindowDetector, [{
        key: 'isSingleWindow',
        value: function isSingleWindow() {
            var _this2 = this;

            return new Promise(function (resolve) {
                var nonce = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
                var timeout = setTimeout(function () {
                    window.removeEventListener('storage', listener);
                    resolve(true);
                }, 500);

                var listener = function listener(e) {
                    if (e.key === WindowDetector.KEY_PONG && e.newValue == nonce) {
                        clearTimeout(timeout);

                        window.removeEventListener('storage', listener);
                        resolve(false);
                    }
                };
                window.addEventListener('storage', listener);

                _this2._ping(nonce);
            });
        }
    }, {
        key: 'waitForSingleWindow',
        value: function waitForSingleWindow(fnReady, fnWait) {
            var _this3 = this;

            this.isSingleWindow().then(function (singleWindow) {
                if (singleWindow) {
                    fnReady();
                } else {
                    if (fnWait) fnWait();

                    var _listener = function _listener(e) {
                        if (e.key === WindowDetector.KEY_BYE) {
                            window.removeEventListener('storage', _listener);
                            // Don't pass fnWait, we only want it to be called once.
                            _this3.waitForSingleWindow(fnReady, /*fnWait*/undefined);
                        }
                    };
                    window.addEventListener('storage', _listener);
                }
            });
        }
    }, {
        key: '_ping',
        value: function _ping(nonce) {
            localStorage.setItem(WindowDetector.KEY_PING, nonce);
        }
    }, {
        key: '_pong',
        value: function _pong(nonce) {
            localStorage.setItem(WindowDetector.KEY_PONG, nonce);
        }
    }, {
        key: '_bye',
        value: function _bye() {
            localStorage.setItem(WindowDetector.KEY_BYE, Date.now());
        }
    }]);
    return WindowDetector;
}();

WindowDetector._instance = null;
'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base entry point to the Nimiq library.
 */
var Nimiq = function () {
    function Nimiq() {
        (0, _classCallCheck3.default)(this, Nimiq);
    }

    (0, _createClass3.default)(Nimiq, null, [{
        key: 'get',

        /**
         * Get the loaded instance of the Nimiq {@link Core}. {@link Nimiq.init} must be invoked before.
         * @returns {Core}
         */
        value: function get() {
            if (!Nimiq._core) throw 'Nimiq.get() failed - not initialized yet. Call Nimiq.init() first.';
            return Nimiq._core;
        }
    }, {
        key: '_loadScript',
        value: function _loadScript(url, resolve) {
            // Adding the script tag to the head as suggested before
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;

            // Then bind the event to the callback function.
            // There are several events for cross browser compatibility.
            // These events might occur before processing, so delay them a bit.
            var ret = function ret() {
                return window.setTimeout(resolve, 1000);
            };
            script.onreadystatechange = ret;
            script.onload = ret;

            // Fire the loading
            head.appendChild(script);
        }

        /**
         * Load the Nimiq library.
         * @param {string|undefined} path Path that contains the required files to load the library.
         * @returns {Promise} Promise that resolves once the library was loaded.
         */

    }, {
        key: 'load',
        value: function load(path) {
            var _this = this;

            if (!Nimiq._hasNativePromise()) return Nimiq._unsupportedPromise();
            Nimiq._loadPromise = Nimiq._loadPromise || new Promise(function () {
                var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(resolve, error) {
                    var script;
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    script = 'web.js';

                                    if (!(!Nimiq._hasNativeClassSupport() || !Nimiq._hasProperScoping())) {
                                        _context.next = 7;
                                        break;
                                    }

                                    console.error('Unsupported browser');
                                    error(Nimiq.ERR_UNSUPPORTED);
                                    return _context.abrupt('return');

                                case 7:
                                    if (!Nimiq._hasAsyncAwaitSupport()) {
                                        script = 'web-babel.js';
                                        console.warn('Client lacks native support for async');
                                    } else if (!Nimiq._hasProperCryptoApi() || !Nimiq._hasProperWebRTCOrNone()) {
                                        script = 'web-crypto.js';
                                        console.warn('Client lacks native support for crypto routines');
                                    }

                                case 8:
                                    if (!path) {
                                        if (Nimiq._currentScript && Nimiq._currentScript.src.indexOf('/') !== -1) {
                                            path = Nimiq._currentScript.src.substring(0, Nimiq._currentScript.src.lastIndexOf('/') + 1);
                                        } else {
                                            // Fallback
                                            path = './';
                                        }
                                    }

                                    Nimiq._onload = function () {
                                        if (!Nimiq._loaded) {
                                            error(Nimiq.ERR_UNKNOWN);
                                        } else {
                                            resolve();
                                        }
                                    };
                                    Nimiq._loadScript(path + script, Nimiq._onload);

                                case 11:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this);
                }));

                return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                };
            }());
            return Nimiq._loadPromise;
        }
    }, {
        key: '_hasNativeClassSupport',
        value: function _hasNativeClassSupport() {
            try {
                eval('"use strict"; class A{}'); // eslint-disable-line no-eval
                return true;
            } catch (err) {
                return false;
            }
        }
    }, {
        key: '_hasAsyncAwaitSupport',
        value: function _hasAsyncAwaitSupport() {
            try {
                eval('"use strict"; (async function() { await {}; })()'); // eslint-disable-line no-eval
                return true;
            } catch (err) {
                return false;
            }
        }
    }, {
        key: '_hasProperCryptoApi',
        value: function _hasProperCryptoApi() {
            return window.crypto && window.crypto.subtle;
        }
    }, {
        key: '_hasProperWebRTCOrNone',
        value: function _hasProperWebRTCOrNone() {
            window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
            return !window.RTCPeerConnection || window.RTCPeerConnection.generateCertificate;
        }
    }, {
        key: '_hasProperScoping',
        value: function _hasProperScoping() {
            try {
                eval('"use strict"; class a{ a() { const a = 0; } }'); // eslint-disable-line no-eval
                return true;
            } catch (err) {
                return false;
            }
        }
    }, {
        key: '_hasNativePromise',
        value: function _hasNativePromise() {
            return window.Promise;
        }
    }, {
        key: '_unsupportedPromise',
        value: function _unsupportedPromise() {
            return {
                'catch': function _catch(handler) {
                    handler(Nimiq.ERR_UNSUPPORTED);
                },
                'then': function then() {}
            };
        }
    }, {
        key: '_hasNativeGoodies',
        value: function _hasNativeGoodies() {
            return window.Number && window.Number.isInteger;
        }

        /**
         * Load the Nimiq library, initialize and provide a {@link Core} instance.
         * @param {function(Core)} ready Function that is invoked once the Core was initialized.
         * @param {function(number)} error Function that is invoked if the call failed.
         * @param {object} options Options for the {@link Core} constructor.
         */

    }, {
        key: 'init',
        value: function init(ready, error) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            // Don't initialize core twice.
            if (Nimiq._core) {
                console.warn('Nimiq.init() called more than once.');
                if (ready) ready(Nimiq._core);
                return;
            }

            if (!Nimiq._hasNativePromise() || !Nimiq._hasNativeGoodies()) {
                if (error) error(Nimiq.ERR_UNSUPPORTED);
                return;
            }

            // Wait until there is only a single browser window open for this origin.
            WindowDetector.get().waitForSingleWindow((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.prev = 0;
                                _context2.next = 3;
                                return Nimiq.load();

                            case 3:
                                console.log('Nimiq engine loaded.');
                                _context2.next = 6;
                                return new Nimiq.Core(options);

                            case 6:
                                Nimiq._core = _context2.sent;

                                if (ready) ready(Nimiq._core);
                                _context2.next = 13;
                                break;

                            case 10:
                                _context2.prev = 10;
                                _context2.t0 = _context2['catch'](0);

                                if (Number.isInteger(_context2.t0)) {
                                    if (error) error(_context2.t0);
                                } else {
                                    console.error('Error while initializing the core', _context2.t0);
                                    if (error) error(Nimiq.ERR_UNKNOWN);
                                }

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[0, 10]]);
            })), function () {
                return error && error(Nimiq.ERR_WAIT);
            });
        }
    }]);
    return Nimiq;
}();

Nimiq._currentScript = document.currentScript;
if (!Nimiq._currentScript) {
    // Heuristic
    var scripts = document.getElementsByTagName('script');
    Nimiq._currentScript = scripts[scripts.length - 1];
}
Nimiq.ERR_WAIT = -1;
Nimiq.ERR_UNSUPPORTED = -2;
Nimiq.ERR_UNKNOWN = -3;
Nimiq._core = null;
Nimiq._onload = null;
Nimiq._loaded = false;
Nimiq._loadPromise = null;
//# sourceMappingURL=nimiq.js.map
