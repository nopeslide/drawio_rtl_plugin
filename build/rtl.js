(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
'use strict';

var tspan = require('tspan');

var colors = {
    2: 0,
    3: 80,
    4: 170,
    5: 45,
    6: 126,
    7: 215
};

function typeStyle (t) {
    var color = colors[t];
    return (color !== undefined) ? ';fill:hsl(' + color + ',100%,50%)' : '';
}

function t (x, y) {
    return 'translate(' + x + ',' + y + ')';
}

function text (body, x, y) {
    var attr = {};
    if (x) { attr.x = x; }
    if (y) { attr.y = y; }
    return ['text', attr].concat(tspan.parse(body));
}

function isIntGTorDefault(val, min, def) {
    return (typeof val === 'number' && val > min) ? (val |0) : def;
}

function getSVG (w, h) {
    return ['svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: w,
        height: h,
        viewBox: [0, 0, w, h].join(' ')
    }];
}

function hline (len, x, y) {
    var opt = {};
    if (x) {
        opt.x1 = x;
        opt.x2 = x + len;
    } else {
        opt.x2 = len;
    }
    if (y) {
        opt.y1 = y;
        opt.y2 = y;
    }
    return ['line', opt];
}

function vline (len, x, y) {
    var opt = {};
    if (x) {
        opt.x1 = x;
        opt.x2 = x;
    }
    if (y) {
        opt.y1 = y;
        opt.y2 = y + len;
    } else {
        opt.y2 = len;
    }
    return ['line', opt];
}

function getLabel (val, x, y, step, len) {
    var i, res = ['g', {}];
    if (typeof val === 'number') {
        for (i = 0; i < len; i++) {
            res.push(text(
                (val >> i) & 1,
                x + step * (len / 2 - i - 0.5),
                y
            ));
        }
        return res;
    }
    return text(val, x, y);
}

function getAttr (e, opt, step, lsbm, msbm) {
    var x = step * (opt.mod - ((msbm + lsbm) / 2) - 1);
    if (Array.isArray(e.attr)) {
        return e.attr.reduce(function (prev, a, i) {
            if (a === undefined || a === null) {
                return prev;
            }
            return prev.concat([getLabel(a, x, 16 * i, step, e.bits)]);
        }, ['g', {}]);
    }
    return getLabel(e.attr, x, 0, step, e.bits);
}

function labelArr (desc, opt) {
    var step = opt.hspace / opt.mod;
    var bits  = ['g', {transform: t(step / 2, opt.vspace / 5)}];
    var names = ['g', {transform: t(step / 2, opt.vspace / 2 + 4)}];
    var attrs = ['g', {transform: t(step / 2, opt.vspace)}];
    var blanks = ['g', {transform: t(0, opt.vspace / 4)}];
    desc.forEach(function (e) {
        var lsbm, msbm, lsb, msb;
        lsbm = 0;
        msbm = opt.mod - 1;
        lsb = opt.index * opt.mod;
        msb = (opt.index + 1) * opt.mod - 1;
        if (((e.lsb / opt.mod) >> 0) === opt.index) {
            lsbm = e.lsbm;
            lsb = e.lsb;
            if (((e.msb / opt.mod) >> 0) === opt.index) {
                msb = e.msb;
                msbm = e.msbm;
            }
        } else {
            if (((e.msb / opt.mod) >> 0) === opt.index) {
                msb = e.msb;
                msbm = e.msbm;
            } else if (!(lsb > e.lsb && msb < e.msb)) {
                return;
            }
        }
        if (!opt.compact) {
            bits.push(text(lsb, step * (opt.mod - lsbm - 1)));
            if (lsbm !== msbm) {
                bits.push(text(msb, step * (opt.mod - msbm - 1)));
            }
        }
        if (e.name) {
            names.push(getLabel(
                e.name,
                step * (opt.mod - ((msbm + lsbm) / 2) - 1),
                0,
                step,
                e.bits
            ));
        }

        if ((e.name === undefined) || (e.type !== undefined)) {
            blanks.push(['rect', {
                style: 'fill-opacity:0.1' + typeStyle(e.type),
                x: step * (opt.mod - msbm - 1),
                y: 0,
                width: step * (msbm - lsbm + 1),
                height: opt.vspace / 2
            }]);
        }
        if (e.attr !== undefined) {
            attrs.push(getAttr(e, opt, step, lsbm, msbm));
        }
    });
    return ['g', blanks, bits, names, attrs];
}

function compactLabels(desc, opt) {
    var step = opt.hspace / opt.mod;
    var tx = 4.5 + opt.compact*20 + step/2;
    var labels = ['g', {
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    }];
    for (var i = 0; i < opt.mod; i++) {
        labels.push(text(opt.mod - 1 - i, tx+ step*i, opt.fontsize));
    }
    return labels;
}

function cage (desc, opt) {
    var hspace = opt.hspace;
    var vspace = opt.vspace;
    var mod = opt.mod;
    var res = ['g', {
        transform: t(0, vspace / 4),
        stroke: 'black',
        'stroke-width': 1,
        'stroke-linecap': 'round'
    }];

    res.push(hline(hspace));
    res.push(vline(vspace / 2));
    res.push(hline(hspace, 0, vspace / 2));

    var i = opt.index * opt.mod, j = opt.mod;
    do {
        if ((j === opt.mod) || desc.some(function (e) { return (e.lsb === i); })) {
            res.push(vline((vspace / 2), j * (hspace / mod)));
        } else {
            res.push(vline((vspace / 16), j * (hspace / mod)));
            res.push(vline((vspace / 16), j * (hspace / mod), vspace * 7 / 16));
        }
        i++; j--;
    } while (j);
    return res;
}


function lane (desc, opt) {
    var ty = (opt.lanes - opt.index - 1) * opt.vspace + 0.5;
    var tx = 4.5;
    if (opt.compact) {
        ty = (opt.lanes - opt.index - 1) * opt.vspace / 2 + opt.fontsize/2;
        tx += 20;
    }
    var lane = ['g', {
        transform: t(tx, ty),
        'text-anchor': 'middle',
        'font-size': opt.fontsize,
        'font-family': opt.fontfamily || 'sans-serif',
        'font-weight': opt.fontweight || 'normal'
    },
    cage(desc, opt),
    labelArr(desc, opt)
    ];
    if (opt.compact) {
        lane.push(['g', text(opt.index, -10, opt.vspace/2 + 4)]);
    }
    return lane;
}

function render (desc, opt) {
    opt = (typeof opt === 'object') ? opt : {};

    opt.vspace = isIntGTorDefault(opt.vspace, 19, 80);
    opt.hspace = isIntGTorDefault(opt.hspace, 39, 800);
    opt.lanes = isIntGTorDefault(opt.lanes, 0, 1);
    opt.bits = isIntGTorDefault(opt.bits, 4, 32);
    opt.fontsize = isIntGTorDefault(opt.fontsize, 5, 14);

    opt.compact = opt.compact || false;
    opt.bigendian = opt.bigendian || false;

    var attributes = desc.reduce(function (prev, cur) {
        return Math.max(prev, (Array.isArray(cur.attr)) ? cur.attr.length : 0);
    }, 0) * 16;

    var width = opt.hspace + 9;
    var height = (opt.vspace + attributes) * opt.lanes + 5;
    if (opt.compact) {
        width += 20;
        height = (opt.vspace + attributes) * (opt.lanes + 1)/2 + opt.fontsize;
    }
    var res = getSVG(width, height);

    var lsb = 0;
    var mod = opt.bits / opt.lanes;
    opt.mod = mod |0;

    desc.forEach(function (e) {
        e.lsb = lsb;
        e.lsbm = lsb % mod;
        lsb += e.bits;
        e.msb = lsb - 1;
        e.msbm = e.msb % mod;
    });

    var i;
    for (i = 0; i < opt.lanes; i++) {
        opt.index = i;
        res.push(lane(desc, opt));
    }
    if (opt.compact) {
        res.push(compactLabels(desc, opt));
    }
    return res;
}

module.exports = render;

},{"tspan":38}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":4,"ieee754":8}],5:[function(require,module,exports){
"use strict";
function createDummyElement(text, options) {
    var element = document.createElement('div');
    var textNode = document.createTextNode(text);
    element.appendChild(textNode);
    element.style.fontFamily = options.font;
    element.style.fontSize = options.fontSize;
    element.style.fontWeight = options.fontWeight;
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.left = '-999px';
    element.style.top = '-999px';
    element.style.width = options.width;
    element.style.height = 'auto';
    document.body.appendChild(element);
    return element;
}
function destroyElement(element) {
    element.parentNode.removeChild(element);
}
var cache = {};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function (text, options) {
    if (options === void 0) { options = {}; }
    var cacheKey = JSON.stringify({ text: text, options: options });
    if (cache[cacheKey]) {
        return cache[cacheKey];
    }
    options.font = options.font || 'Times';
    options.fontSize = options.fontSize || '16px';
    options.fontWeight = options.fontWeight || 'normal';
    options.width = options.width || 'auto';
    var element = createDummyElement(text, options);
    var size = {
        width: element.offsetWidth,
        height: element.offsetHeight,
    };
    destroyElement(element);
    cache[cacheKey] = size;
    return size;
};

},{}],6:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":10}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],8:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],9:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],10:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],11:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],12:[function(require,module,exports){
'use strict';

var parse = require('./parse'),
    stringify = require('./stringify'),
    traverse = require('./traverse');

exports.parse = parse;
exports.stringify = stringify;
exports.traverse = traverse;
exports.p = parse;
exports.s = stringify;
exports.t = traverse;

},{"./parse":13,"./stringify":14,"./traverse":15}],13:[function(require,module,exports){
'use strict';

var parser = require('sax').parser;

function parse(data, config) {
    var res = [],
        stack = [],
        pointer = res,
        trim = true,
        p;

    if (config !== undefined) {
        if (config.trim !== undefined) {
            trim = config.trim;
        }
    }

    p = parser(true);

    p.ontext = function (e) {
        if ((trim === false) || (e.trim() !== '')) {
            pointer.push(e);
        }
    };

    p.onopentag = function (e) {
        var leaf;
        leaf = [e.name, e.attributes];
        stack.push(pointer);
        pointer.push(leaf);
        pointer = leaf;

    };

    p.onclosetag = function () {
        pointer = stack.pop();
    };

    p.oncdata = function (e) {
        if ((trim === false) || (e.trim() !== '')) {
            pointer.push('<![CDATA[' + e + ']]>');
        }
    };

    p.write(data).close();
    return res[0];
}

module.exports = parse;

},{"sax":34}],14:[function(require,module,exports){
'use strict';

function isObject (o) {
    return o && Object.prototype.toString.call(o) === '[object Object]';
}

function indent (txt) {
    var arr, res = [];

    if (typeof txt !== 'string') {
        return txt;
    }

    arr = txt.split('\n');

    if (arr.length === 1) {
        return '  ' + txt;
    }

    arr.forEach(function (e) {
        if (e.trim() === '') {
            res.push(e);
            return;
        }
        res.push('  ' + e);
    });

    return res.join('\n');
}

function clean (txt) {
    var arr = txt.split('\n');
    var res = [];
    arr.forEach(function (e) {
        if (e.trim() === '') {
            return;
        }
        res.push(e);
    });
    return res.join('\n');
}

function stringify (a) {
    var res, body, isEmpty, isFlat;

    body = '';
    isFlat = true;
    isEmpty = a.some(function (e, i, arr) {
        if (i === 0) {
            res = '<' + e;
            if (arr.length === 1) {
                return true;
            }
            return;
        }

        if (i === 1) {
            if (isObject(e)) {
                Object.keys(e).forEach(function (key) {
                    res += ' ' + key + '="' + e[key] + '"';
                });
                if (arr.length === 2) {
                    return true;
                }
                res += '>';
                return;
            } else {
                res += '>';
            }
        }

        switch (typeof e) {
        case 'string':
        case 'number':
        case 'boolean':
            body += e + '\n';
            return;
        }

        isFlat = false;
        body += stringify(e);
    });

    if (isEmpty) {
        return res + '/>\n'; // short form
    } else {
        if (isFlat) {
            return res + clean(body) + '</' + a[0] + '>\n';
        } else {
            return res + '\n' + indent(body) + '</' + a[0] + '>\n';
        }
    }
}

module.exports = stringify;

},{}],15:[function(require,module,exports){
'use strict';

function traverse(origin, callbacks) {
    var empty = function () {};
    var enter = empty;
    var leave = empty;

    function skipFn() {
        this._skip = true;
    }

    function removeFn() {
        this._remove = true;
    }

    function nameFn(name) {
        this._name = name;
    }

    function replaceFn(node) {
        this._replace = node;
    }

    function rec(tree, parent) {
        var type,
            node = { attr: {}, full: tree },
            cxt = {
                name: nameFn,
                skip: skipFn,
                // break: breakFn,
                remove: removeFn,
                replace: replaceFn,

                _name: undefined,
                _skip: false,
                // _break: false,
                _remove: false,
                _replace: undefined
            },
            e1IsNotAnObject = true,
            index,
            ilen,
            returnRes;

        if (tree === undefined) return;
        if (tree === null) return;
        if (tree === true) return;
        if (tree === false) return;

        type = Object.prototype.toString.call(tree);

        switch (type) {
        case '[object String]':
        case '[object Number]':
            return;

        case '[object Array]':
            tree.some(function (e, i) {
                if (i === 0) {
                    node.name = e;
                    return false;
                }
                if (i === 1) {
                    if (
                        Object.prototype.toString.call(e) === '[object Object]'
                    ) {
                        e1IsNotAnObject = false;
                        node.attr = e;
                    }
                    return true;
                }
            });

            enter.call(cxt, node, parent);
            if (cxt._name) {
                tree[0] = cxt._name;
            }

            if (cxt._replace) {
                return cxt._replace;
            } else
            if (cxt._remove) {
                return null;
            } else
            if (!cxt._skip) {

                index = 0;
                ilen = tree.length;
                while (index < ilen) {
                    if ((index > 1) || ((index === 1) && e1IsNotAnObject)) {
                        returnRes = rec(tree[index], node);
                        if (returnRes === null) {
                            tree.splice(index, 1);
                            ilen -= 1;
                            continue;
                        }
                        if (returnRes) {
                            tree[index] = returnRes;
                        }
                    }
                    index += 1;
                }

                leave.call(cxt, node, parent);
                if (cxt._name) {
                    tree[0] = cxt._name;
                }
                if (cxt._replace) {
                    return cxt._replace;
                } else
                if (cxt._remove) {
                    return null;
                }
            }
        }
    }

    if (callbacks) {
        if (callbacks.enter) {
            enter = callbacks.enter;
        }
        if (callbacks.leave) {
            leave = callbacks.leave;
        }
    }

    rec(origin, undefined);
}

module.exports = traverse;

},{}],16:[function(require,module,exports){
(function (process){
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":17}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],18:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":19}],19:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":21,"./_stream_writable":23,"core-util-is":6,"inherits":9,"process-nextick-args":16}],20:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":22,"core-util-is":6,"inherits":9}],21:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":19,"./internal/streams/BufferList":24,"./internal/streams/destroy":25,"./internal/streams/stream":26,"_process":17,"core-util-is":6,"events":7,"inherits":9,"isarray":11,"process-nextick-args":16,"safe-buffer":27,"string_decoder/":28,"util":3}],22:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":19,"core-util-is":6,"inherits":9}],23:[function(require,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = Object.create(require('core-util-is'));
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"./_stream_duplex":19,"./internal/streams/destroy":25,"./internal/streams/stream":26,"_process":17,"core-util-is":6,"inherits":9,"process-nextick-args":16,"safe-buffer":27,"timers":37,"util-deprecate":41}],24:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":27,"util":3}],25:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":16}],26:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":7}],27:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":4}],28:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":27}],29:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":30}],30:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":19,"./lib/_stream_passthrough.js":20,"./lib/_stream_readable.js":21,"./lib/_stream_transform.js":22,"./lib/_stream_writable.js":23}],31:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":30}],32:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":23}],33:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":4}],34:[function(require,module,exports){
(function (Buffer){
;(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

}).call(this,require("buffer").Buffer)
},{"buffer":4,"stream":35,"string_decoder":36}],35:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":7,"inherits":9,"readable-stream/duplex.js":18,"readable-stream/passthrough.js":29,"readable-stream/readable.js":30,"readable-stream/transform.js":31,"readable-stream/writable.js":32}],36:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"dup":28,"safe-buffer":33}],37:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":17,"timers":37}],38:[function(require,module,exports){
'use strict';

var parse = require('./parse'),
    reparse = require('./reparse');

exports.parse = parse;
exports.reparse = reparse;

},{"./parse":39,"./reparse":40}],39:[function(require,module,exports){
'use strict';

var token = /<o>|<ins>|<s>|<sub>|<sup>|<b>|<i>|<tt>|<\/o>|<\/ins>|<\/s>|<\/sub>|<\/sup>|<\/b>|<\/i>|<\/tt>/;

function update (s, cmd) {
    if (cmd.add) {
        cmd.add.split(';').forEach(function (e) {
            var arr = e.split(' ');
            s[arr[0]][arr[1]] = true;
        });
    }
    if (cmd.del) {
        cmd.del.split(';').forEach(function (e) {
            var arr = e.split(' ');
            delete s[arr[0]][arr[1]];
        });
    }
}

var trans = {
    '<o>'    : { add: 'text-decoration overline' },
    '</o>'   : { del: 'text-decoration overline' },

    '<ins>'  : { add: 'text-decoration underline' },
    '</ins>' : { del: 'text-decoration underline' },

    '<s>'    : { add: 'text-decoration line-through' },
    '</s>'   : { del: 'text-decoration line-through' },

    '<b>'    : { add: 'font-weight bold' },
    '</b>'   : { del: 'font-weight bold' },

    '<i>'    : { add: 'font-style italic' },
    '</i>'   : { del: 'font-style italic' },

    '<sub>'  : { add: 'baseline-shift sub;font-size .7em' },
    '</sub>' : { del: 'baseline-shift sub;font-size .7em' },

    '<sup>'  : { add: 'baseline-shift super;font-size .7em' },
    '</sup>' : { del: 'baseline-shift super;font-size .7em' },

    '<tt>'   : { add: 'font-family monospace' },
    '</tt>'  : { del: 'font-family monospace' }
};

function dump (s) {
    return Object.keys(s).reduce(function (pre, cur) {
        var keys = Object.keys(s[cur]);
        if (keys.length > 0) {
            pre[cur] = keys.join(' ');
        }
        return pre;
    }, {});
}

function parse (str) {
    var state, res, i, m, a;

    if (str === undefined) {
        return [];
    }

    if (typeof str === 'number') {
        return [str + ''];
    }

    if (typeof str !== 'string') {
        return [str];
    }

    res = [];

    state = {
        'text-decoration': {},
        'font-weight': {},
        'font-style': {},
        'baseline-shift': {},
        'font-size': {},
        'font-family': {}
    };

    while (true) {
        i = str.search(token);

        if (i === -1) {
            res.push(['tspan', dump(state), str]);
            return res;
        }

        if (i > 0) {
            a = str.slice(0, i);
            res.push(['tspan', dump(state), a]);
        }

        m = str.match(token)[0];

        update(state, trans[m]);

        str = str.slice(i + m.length);

        if (str.length === 0) {
            return res;
        }
    }
}

module.exports = parse;
/* eslint no-constant-condition: 0 */

},{}],40:[function(require,module,exports){
'use strict';

var parse = require('./parse');

function deDash (str) {
    var m = str.match(/(\w+)-(\w)(\w+)/);
    if (m === null) {
        return str;
    }
    var newStr = m[1] + m[2].toUpperCase() + m[3];
    return newStr;
}

function reparse (React) {

    var $ = React.createElement;

    function reTspan (e, i) {
        var tag = e[0];
        var attr = e[1];

        var newAttr = Object.keys(attr).reduce(function (res, key) {
            var newKey = deDash(key);
            res[newKey] = attr[key];
            return res;
        }, {});

        var body = e[2];
        newAttr.key = i;
        return $(tag, newAttr, body);
    }

    return function (str) {
        return parse(str).map(reTspan);
    };
}

module.exports = reparse;

},{"./parse":39}],41:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],42:[function(require,module,exports){
'use strict';

function appendSaveAsDialog (index, output) {
    var div;
    var menu;

    function closeMenu(e) {
        var left = parseInt(menu.style.left, 10);
        var top = parseInt(menu.style.top, 10);
        if (
            e.x < left ||
            e.x > (left + menu.offsetWidth) ||
            e.y < top ||
            e.y > (top + menu.offsetHeight)
        ) {
            menu.parentNode.removeChild(menu);
            document.body.removeEventListener('mousedown', closeMenu, false);
        }
    }

    div = document.getElementById(output + index);

    div.childNodes[0].addEventListener('contextmenu',
        function (e) {
            var list, savePng, saveSvg;

            menu = document.createElement('div');

            menu.className = 'wavedromMenu';
            menu.style.top = e.y + 'px';
            menu.style.left = e.x + 'px';

            list = document.createElement('ul');
            savePng = document.createElement('li');
            savePng.innerHTML = 'Save as PNG';
            list.appendChild(savePng);

            saveSvg = document.createElement('li');
            saveSvg.innerHTML = 'Save as SVG';
            list.appendChild(saveSvg);

            //var saveJson = document.createElement('li');
            //saveJson.innerHTML = 'Save as JSON';
            //list.appendChild(saveJson);

            menu.appendChild(list);

            document.body.appendChild(menu);

            savePng.addEventListener('click',
                function () {
                    var html, firstDiv, svgdata, img, canvas, context, pngdata, a;

                    html = '';
                    if (index !== 0) {
                        firstDiv = document.getElementById(output + 0);
                        html += firstDiv.innerHTML.substring(166, firstDiv.innerHTML.indexOf('<g id="waves_0">'));
                    }
                    html = [div.innerHTML.slice(0, 166), html, div.innerHTML.slice(166)].join('');
                    svgdata = 'data:image/svg+xml;base64,' + btoa(html);
                    img = new Image();
                    img.src = svgdata;
                    canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context = canvas.getContext('2d');
                    context.drawImage(img, 0, 0);

                    pngdata = canvas.toDataURL('image/png');

                    a = document.createElement('a');
                    a.href = pngdata;
                    a.download = 'wavedrom.png';
                    a.click();

                    menu.parentNode.removeChild(menu);
                    document.body.removeEventListener('mousedown', closeMenu, false);
                },
                false
            );

            saveSvg.addEventListener('click',
                function () {
                    var html,
                        firstDiv,
                        svgdata,
                        a;

                    html = '';
                    if (index !== 0) {
                        firstDiv = document.getElementById(output + 0);
                        html += firstDiv.innerHTML.substring(166, firstDiv.innerHTML.indexOf('<g id="waves_0">'));
                    }
                    html = [div.innerHTML.slice(0, 166), html, div.innerHTML.slice(166)].join('');
                    svgdata = 'data:image/svg+xml;base64,' + btoa(html);

                    a = document.createElement('a');
                    a.href = svgdata;
                    a.download = 'wavedrom.svg';
                    a.click();

                    menu.parentNode.removeChild(menu);
                    document.body.removeEventListener('mousedown', closeMenu, false);
                },
                false
            );

            menu.addEventListener('contextmenu',
                function (ee) {
                    ee.preventDefault();
                },
                false
            );

            document.body.addEventListener('mousedown', closeMenu, false);

            e.preventDefault();
        },
        false
    );
}

module.exports = appendSaveAsDialog;

/* eslint-env browser */

},{}],43:[function(require,module,exports){
'use strict';

function arcShape (Edge, from, to) { /* eslint complexity: [warn, 30] */
    var dx = to.x - from.x;
    var dy = to.y - from.y;
    var lx = ((from.x + to.x) / 2);
    var ly = ((from.y + to.y) / 2);
    var d;
    var style;
    switch (Edge.shape) {
    case '-'  : {
        break;
    }
    case '~'  : {
        d = ('M ' + from.x + ',' + from.y + ' c ' + (0.7 * dx) + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        break;
    }
    case '-~' : {
        d = ('M ' + from.x + ',' + from.y + ' c ' + (0.7 * dx) + ', 0 ' +         dx + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
        break;
    }
    case '~-' : {
        d = ('M ' + from.x + ',' + from.y + ' c ' + 0          + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.25); }
        break;
    }
    case '-|' : {
        d = ('m ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
        if (Edge.label) { lx = to.x; }
        break;
    }
    case '|-' : {
        d = ('m ' + from.x + ',' + from.y + ' 0,' + dy + ' ' + dx + ',0');
        if (Edge.label) { lx = from.x; }
        break;
    }
    case '-|-': {
        d = ('m ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
        break;
    }
    case '->' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        break;
    }
    case '~>' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' + 0.3 * dx + ', ' + dy + ' ' + dx + ', ' + dy);
        break;
    }
    case '-~>': {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' +     dx + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
        break;
    }
    case '~->': {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + 0      + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.25); }
        break;
    }
    case '-|>' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
        if (Edge.label) { lx = to.x; }
        break;
    }
    case '|->' : {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' 0,' + dy + ' ' + dx + ',0');
        if (Edge.label) { lx = from.x; }
        break;
    }
    case '-|->': {
        style = ('marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
        break;
    }
    case '<->' : {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        break;
    }
    case '<~>' : {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
        break;
    }
    case '<-~>': {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' +     dx + ', ' + dy + ' ' + dx + ', ' + dy);
        if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
        break;
    }
    case '<-|>' : {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
        if (Edge.label) { lx = to.x; }
        break;
    }
    case '<-|->': {
        style = ('marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
        d = ('m ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
        break;
    }
    default   : { style = ('fill:none;stroke:#F00;stroke-width:1'); }
    }
    return {
        lx: lx,
        ly: ly,
        d: d,
        style: style
    };
}

module.exports = arcShape;

},{}],44:[function(require,module,exports){
module.exports={"chars":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,47,74,74,118,89,25,44,44,52,78,37,44,37,37,74,74,74,74,74,74,74,74,74,74,37,37,78,78,78,74,135,89,89,96,96,89,81,103,96,37,67,89,74,109,96,103,89,103,96,89,81,96,89,127,89,87,81,37,37,37,61,74,44,74,74,67,74,74,37,74,74,30,30,67,30,112,74,74,74,74,44,67,37,74,67,95,66,65,67,44,34,44,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,43,74,74,74,74,34,74,44,98,49,74,78,0,98,73,53,73,44,44,44,77,71,37,44,44,49,74,111,111,111,81,89,89,89,89,89,89,133,96,89,89,89,89,37,37,37,37,96,96,103,103,103,103,103,78,103,96,96,96,96,87,89,81,74,74,74,74,74,74,118,67,74,74,74,74,36,36,36,36,74,74,74,74,74,74,74,73,81,74,74,74,74,65,74,65,89,74,89,74,89,74,96,67,96,67,96,67,96,67,96,82,96,74,89,74,89,74,89,74,89,74,89,74,103,74,103,74,103,74,103,74,96,74,96,74,37,36,37,36,37,36,37,30,37,36,98,59,67,30,89,67,67,74,30,74,30,74,39,74,44,74,30,96,74,96,74,96,74,80,96,74,103,74,103,74,103,74,133,126,96,44,96,44,96,44,89,67,89,67,89,67,89,67,81,38,81,50,81,37,96,74,96,74,96,74,96,74,96,74,96,74,127,95,87,65,87,81,67,81,67,81,67,30,84,97,91,84,91,84,94,92,73,104,109,91,84,81,84,100,82,76,74,103,91,131,47,40,99,77,37,79,130,100,84,104,114,87,126,101,87,84,93,84,69,84,46,52,82,52,82,114,89,102,96,100,98,91,70,88,88,77,70,85,89,77,67,84,39,65,61,39,189,173,153,111,105,61,123,123,106,89,74,37,30,103,74,96,74,96,74,96,74,96,74,96,74,81,91,81,91,81,130,131,102,84,103,84,87,78,104,81,104,81,88,76,37,189,173,153,103,84,148,90,100,84,89,74,133,118,103,81],"other":114}

},{}],45:[function(require,module,exports){
'use strict';

var onmlStringify = require('onml/lib/stringify.js');
var w3 = require('./w3.js');

function jsonmlParse (arr) {
    arr[1].xmlns = w3.svg;
    arr[1]['xmlns:xlink'] = w3.xlink;
    var s1 = onmlStringify(arr);
    var s2 = s1.replace(/&/g, '&amp;');
    var parser = new DOMParser();
    var doc = parser.parseFromString(s2, 'image/svg+xml');
    return doc.firstChild;
}

module.exports = jsonmlParse;
// module.exports = createElement;

/* eslint-env browser */

},{"./w3.js":75,"onml/lib/stringify.js":76}],46:[function(require,module,exports){
'use strict';

var eva = require('./eva'),
    renderWaveForm = require('./render-wave-form');

function editorRefresh () {
    // var svg,
    // ser,
    // ssvg,
    // asvg,
    // sjson,
    // ajson;

    renderWaveForm(0, eva('InputJSON_0'), 'WaveDrom_Display_');

    /*
    svg = document.getElementById('svgcontent_0');
    ser = new XMLSerializer();
    ssvg = '<?xml version='1.0' standalone='no'?>\n' +
    '<!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>\n' +
    '<!-- Created with WaveDrom -->\n' +
    ser.serializeToString(svg);

    asvg = document.getElementById('download_svg');
    asvg.href = 'data:image/svg+xml;base64,' + window.btoa(ssvg);

    sjson = localStorage.waveform;
    ajson = document.getElementById('download_json');
    ajson.href = 'data:text/json;base64,' + window.btoa(sjson);
    */
}

module.exports = editorRefresh;

},{"./eva":47,"./render-wave-form":72}],47:[function(require,module,exports){
'use strict';

function eva (id) {
    var TheTextBox, source;

    function erra (e) {
        return { signal: [{ name: ['tspan', ['tspan', {class:'error h5'}, 'Error: '], e.message] }]};
    }

    TheTextBox = document.getElementById(id);

    /* eslint-disable no-eval */
    if (TheTextBox.type && TheTextBox.type === 'textarea') {
        try { source = eval('(' + TheTextBox.value + ')'); } catch (e) { return erra(e); }
    } else {
        try { source = eval('(' + TheTextBox.innerHTML + ')'); } catch (e) { return erra(e); }
    }
    /* eslint-enable  no-eval */

    if (Object.prototype.toString.call(source) !== '[object Object]') {
        return erra({ message: '[Semantic]: The root has to be an Object: "{signal:[...]}"'});
    }
    if (source.signal) {
        if (Object.prototype.toString.call(source.signal) !== '[object Array]') {
            return erra({ message: '[Semantic]: "signal" object has to be an Array "signal:[]"'});
        }
    } else if (source.assign) {
        if (Object.prototype.toString.call(source.assign) !== '[object Array]') {
            return erra({ message: '[Semantic]: "assign" object hasto be an Array "assign:[]"'});
        }
    } else if (source.reg) {
        // test register
    } else {
        return erra({ message: '[Semantic]: "signal:[...]" or "assign:[...]" property is missing inside the root Object'});
    }
    return source;
}

module.exports = eva;

/* eslint-env browser */

},{}],48:[function(require,module,exports){
'use strict';

function findLaneMarkers (lanetext) {
    var gcount = 0,
        lcount = 0,
        ret = [];

    lanetext.forEach(function (e) {
        if (
            (e === 'vvv-2') ||
            (e === 'vvv-3') ||
            (e === 'vvv-4') ||
            (e === 'vvv-5') ||
            (e === 'vvv-6') ||
            (e === 'vvv-7') ||
            (e === 'vvv-8') ||
            (e === 'vvv-9')
        ) {
            lcount += 1;
        } else {
            if (lcount !== 0) {
                ret.push(gcount - ((lcount + 1) / 2));
                lcount = 0;
            }
        }
        gcount += 1;

    });

    if (lcount !== 0) {
        ret.push(gcount - ((lcount + 1) / 2));
    }

    return ret;
}

module.exports = findLaneMarkers;

},{}],49:[function(require,module,exports){
'use strict';

function genBrick (texts, extra, times) {
    var i, j, R = [];

    if (texts.length === 4) {
        for (j = 0; j < times; j += 1) {
            R.push(texts[0]);
            for (i = 0; i < extra; i += 1) {
                R.push(texts[1]);
            }
            R.push(texts[2]);
            for (i = 0; i < extra; i += 1) {
                R.push(texts[3]);
            }
        }
        return R;
    }
    if (texts.length === 1) {
        texts.push(texts[0]);
    }
    R.push(texts[0]);
    for (i = 0; i < (times * (2 * (extra + 1)) - 1); i += 1) {
        R.push(texts[1]);
    }
    return R;
}

module.exports = genBrick;

},{}],50:[function(require,module,exports){
'use strict';

var genBrick = require('./gen-brick');

function genFirstWaveBrick (text, extra, times) {
    var tmp;

    tmp = [];
    switch (text) {
    case 'p': tmp = genBrick(['pclk', '111', 'nclk', '000'], extra, times); break;
    case 'n': tmp = genBrick(['nclk', '000', 'pclk', '111'], extra, times); break;
    case 'P': tmp = genBrick(['Pclk', '111', 'nclk', '000'], extra, times); break;
    case 'N': tmp = genBrick(['Nclk', '000', 'pclk', '111'], extra, times); break;
    case 'l':
    case 'L':
    case '0': tmp = genBrick(['000'], extra, times); break;
    case 'h':
    case 'H':
    case '1': tmp = genBrick(['111'], extra, times); break;
    case '=': tmp = genBrick(['vvv-2'], extra, times); break;
    case '2': tmp = genBrick(['vvv-2'], extra, times); break;
    case '3': tmp = genBrick(['vvv-3'], extra, times); break;
    case '4': tmp = genBrick(['vvv-4'], extra, times); break;
    case '5': tmp = genBrick(['vvv-5'], extra, times); break;
    case '6': tmp = genBrick(['vvv-6'], extra, times); break;
    case '7': tmp = genBrick(['vvv-7'], extra, times); break;
    case '8': tmp = genBrick(['vvv-8'], extra, times); break;
    case '9': tmp = genBrick(['vvv-9'], extra, times); break;
    case 'd': tmp = genBrick(['ddd'], extra, times); break;
    case 'u': tmp = genBrick(['uuu'], extra, times); break;
    case 'z': tmp = genBrick(['zzz'], extra, times); break;
    default:  tmp = genBrick(['xxx'], extra, times); break;
    }
    return tmp;
}

module.exports = genFirstWaveBrick;

},{"./gen-brick":49}],51:[function(require,module,exports){
'use strict';

var genBrick = require('./gen-brick');

function genWaveBrick (text, extra, times) {
    var x1, x2, x3, y1, y2, x4, x5, x6, xclude, atext, tmp0, tmp1, tmp2, tmp3, tmp4;

    x1 = {p:'pclk', n:'nclk', P:'Pclk', N:'Nclk', h:'pclk', l:'nclk', H:'Pclk', L:'Nclk'};

    x2 = {
        '0':'0', '1':'1',
        'x':'x',
        'd':'d',
        'u':'u',
        'z':'z',
        '=':'v',  '2':'v',  '3':'v',  '4':'v', '5':'v', '6':'v', '7':'v', '8':'v', '9':'v'
    };

    x3 = {
        '0': '', '1': '',
        'x': '',
        'd': '',
        'u': '',
        'z': '',
        '=':'-2', '2':'-2', '3':'-3', '4':'-4', '5':'-5', '6':'-6', '7':'-7', '8':'-8', '9':'-9'
    };

    y1 = {
        'p':'0', 'n':'1',
        'P':'0', 'N':'1',
        'h':'1', 'l':'0',
        'H':'1', 'L':'0',
        '0':'0', '1':'1',
        'x':'x',
        'd':'d',
        'u':'u',
        'z':'z',
        '=':'v', '2':'v', '3':'v', '4':'v', '5':'v', '6':'v', '7':'v', '8':'v', '9':'v'
    };

    y2 = {
        'p': '', 'n': '',
        'P': '', 'N': '',
        'h': '', 'l': '',
        'H': '', 'L': '',
        '0': '', '1': '',
        'x': '',
        'd': '',
        'u': '',
        'z': '',
        '=':'-2', '2':'-2', '3':'-3', '4':'-4', '5':'-5', '6':'-6', '7':'-7', '8':'-8', '9':'-9'
    };

    x4 = {
        'p': '111', 'n': '000',
        'P': '111', 'N': '000',
        'h': '111', 'l': '000',
        'H': '111', 'L': '000',
        '0': '000', '1': '111',
        'x': 'xxx',
        'd': 'ddd',
        'u': 'uuu',
        'z': 'zzz',
        '=': 'vvv-2', '2': 'vvv-2', '3': 'vvv-3', '4': 'vvv-4', '5': 'vvv-5', '6':'vvv-6', '7':'vvv-7', '8':'vvv-8', '9':'vvv-9'
    };

    x5 = {
        p:'nclk', n:'pclk', P:'nclk', N:'pclk'
    };

    x6 = {
        p: '000', n: '111', P: '000', N: '111'
    };

    xclude = {
        'hp':'111', 'Hp':'111', 'ln': '000', 'Ln': '000', 'nh':'111', 'Nh':'111', 'pl': '000', 'Pl':'000'
    };

    atext = text.split('');
    //if (atext.length !== 2) { return genBrick(['xxx'], extra, times); }

    tmp0 = x4[atext[1]];
    tmp1 = x1[atext[1]];
    if (tmp1 === undefined) {
        tmp2 = x2[atext[1]];
        if (tmp2 === undefined) {
            // unknown
            return genBrick(['xxx'], extra, times);
        } else {
            tmp3 = y1[atext[0]];
            if (tmp3 === undefined) {
                // unknown
                return genBrick(['xxx'], extra, times);
            }
            // soft curves
            return genBrick([tmp3 + 'm' + tmp2 + y2[atext[0]] + x3[atext[1]], tmp0], extra, times);
        }
    } else {
        tmp4 = xclude[text];
        if (tmp4 !== undefined) {
            tmp1 = tmp4;
        }
        // sharp curves
        tmp2 = x5[atext[1]];
        if (tmp2 === undefined) {
            // hlHL
            return genBrick([tmp1, tmp0], extra, times);
        } else {
            // pnPN
            return genBrick([tmp1, tmp0, tmp2, x6[atext[1]]], extra, times);
        }
    }
}

module.exports = genWaveBrick;

},{"./gen-brick":49}],52:[function(require,module,exports){
'use strict';

var pkg = require('../package.json');
var processAll = require('./process-all');
var eva = require('./eva');
var renderWaveForm = require('./render-wave-form');
var renderWaveElement = require('./render-wave-element');
var renderAny = require('./render-any.js');
var editorRefresh = require('./editor-refresh');
var def = require('../skins/default.js');
var onmlStringify = require('onml/lib/stringify.js');

exports.version = pkg.version;
exports.processAll = processAll;
exports.eva = eva;
exports.renderAny = renderAny;
exports.renderWaveForm = renderWaveForm;
exports.renderWaveElement = renderWaveElement;
exports.editorRefresh = editorRefresh;
exports.waveSkin = def;
exports.onml = {
    stringify: onmlStringify
};

},{"../package.json":77,"../skins/default.js":78,"./editor-refresh":46,"./eva":47,"./process-all":59,"./render-any.js":61,"./render-wave-element":71,"./render-wave-form":72,"onml/lib/stringify.js":76}],53:[function(require,module,exports){
'use strict';

function insertSVGTemplateAssign () {
    return ['style', '.pinname {font-size:12px; font-style:normal; font-variant:normal; font-weight:500; font-stretch:normal; text-align:center; text-anchor:end; font-family:Helvetica} .wirename {font-size:12px; font-style:normal; font-variant:normal; font-weight:500; font-stretch:normal; text-align:center; text-anchor:start; font-family:Helvetica} .wirename:hover {fill:blue} .gate {color:#000; fill:#ffc; fill-opacity: 1;stroke:#000; stroke-width:1; stroke-opacity:1} .gate:hover {fill:red !important; } .wire {fill:none; stroke:#000; stroke-width:1; stroke-opacity:1} .grid {fill:#fff; fill-opacity:1; stroke:none}'];
}

module.exports = insertSVGTemplateAssign;

},{}],54:[function(require,module,exports){
'use strict';

var w3 = require('./w3');

function insertSVGTemplate (index, source, lane, waveSkin, content, lanes, groups, notFirstSignal) {
    var first, skin, e;

    for (first in waveSkin) { break; }

    skin = waveSkin.default || waveSkin[first];

    if (source && source.config && source.config.skin && waveSkin[source.config.skin]) {
        skin = waveSkin[source.config.skin];
    }

    if (notFirstSignal) {
        e = ['svg', {id: 'svg', xmlns: w3.svg, 'xmlns:xlink': w3.xlink}, ['g']];
    } else {
        e = skin;
    }

    var width = (lane.xg + (lane.xs * (lane.xmax + 1)));
    var height = (content.length * lane.yo + lane.yh0 + lane.yh1 + lane.yf0 + lane.yf1);

    var body = e[e.length - 1];

    body[1] = {id: 'waves_'  + index};

    body[2] = ['g', {
        id: 'lanes_'  + index,
        transform: 'translate(' + (lane.xg + 0.5) + ', ' + ((lane.yh0 + lane.yh1) + 0.5) + ')'
    }].concat(lanes);

    body[3] = ['g', {
        id: 'groups_' + index
    }, groups];

    var head = e[1];

    head.id = 'svgcontent_' + index;
    head.height = height;
    head.width = width;
    head.viewBox = '0 0 ' + width + ' ' + height;
    head.overflow = 'hidden';

    return e;
}

module.exports = insertSVGTemplate;

},{"./w3":75}],55:[function(require,module,exports){
'use strict';

var lane = {
    xs     : 20,    // tmpgraphlane0.width
    ys     : 20,    // tmpgraphlane0.height
    xg     : 120,   // tmpgraphlane0.x
    // yg     : 0,     // head gap
    yh0    : 0,     // head gap title
    yh1    : 0,     // head gap
    yf0    : 0,     // foot gap
    yf1    : 0,     // foot gap
    y0     : 5,     // tmpgraphlane0.y
    yo     : 30,    // tmpgraphlane1.y - y0;
    tgo    : -10,   // tmptextlane0.x - xg;
    ym     : 15,    // tmptextlane0.y - y0
    xlabel : 6,     // tmptextlabel.x - xg;
    xmax   : 1,
    scale  : 1,
    head   : {},
    foot   : {}
};

module.exports = lane;

},{}],56:[function(require,module,exports){
'use strict';

function parseConfig (source, lane) {
    var hscale;

    function tonumber (x) {
        return x > 0 ? Math.round(x) : 1;
    }

    lane.hscale = 1;

    if (lane.hscale0) {
        lane.hscale = lane.hscale0;
    }
    if (source && source.config && source.config.hscale) {
        hscale = Math.round(tonumber(source.config.hscale));
        if (hscale > 0) {
            if (hscale > 100) {
                hscale = 100;
            }
            lane.hscale = hscale;
        }
    }
    lane.yh0 = 0;
    lane.yh1 = 0;
    lane.head = source.head;

    lane.xmin_cfg = 0;
    lane.xmax_cfg = 1e12; // essentially infinity
    if (source && source.config && source.config.hbounds && source.config.hbounds.length==2) {
        source.config.hbounds[0] = Math.floor(source.config.hbounds[0]);
        source.config.hbounds[1] = Math.ceil(source.config.hbounds[1]);
        if (  source.config.hbounds[0] < source.config.hbounds[1] ) {
            // convert hbounds ticks min, max to bricks min, max
            // TODO: do we want to base this on ticks or tocks in
            //  head or foot?  All 4 can be different... or just 0 reference?
            lane.xmin_cfg = 2 * Math.floor(source.config.hbounds[0]);
            lane.xmax_cfg = 2 * Math.floor(source.config.hbounds[1]);
        }
    }

    if (source && source.head) {
        if (
            source.head.tick || source.head.tick === 0 ||
            source.head.tock || source.head.tock === 0
        ) {
            lane.yh0 = 20;
        }
        // if tick defined, modify start tick by lane.xmin_cfg
        if ( source.head.tick || source.head.tick === 0 ) {
            source.head.tick = source.head.tick + lane.xmin_cfg/2;
        }
        // if tock defined, modify start tick by lane.xmin_cfg
        if ( source.head.tock || source.head.tock === 0 ) {
            source.head.tock = source.head.tock + lane.xmin_cfg/2;
        }

        if (source.head.text) {
            lane.yh1 = 46;
            lane.head.text = source.head.text;
        }
    }

    lane.yf0 = 0;
    lane.yf1 = 0;
    lane.foot = source.foot;
    if (source && source.foot) {
        if (
            source.foot.tick || source.foot.tick === 0 ||
            source.foot.tock || source.foot.tock === 0
        ) {
            lane.yf0 = 20;
        }
        // if tick defined, modify start tick by lane.xmin_cfg
        if ( source.foot.tick || source.foot.tick === 0 ) {
            source.foot.tick = source.foot.tick + lane.xmin_cfg/2;
        }
        // if tock defined, modify start tick by lane.xmin_cfg
        if ( source.foot.tock || source.foot.tock === 0 ) {
            source.foot.tock = source.foot.tock + lane.xmin_cfg/2;
        }

        if (source.foot.text) {
            lane.yf1 = 46;
            lane.foot.text = source.foot.text;
        }
    }
}

module.exports = parseConfig;

},{}],57:[function(require,module,exports){
'use strict';

var genFirstWaveBrick = require('./gen-first-wave-brick'),
    genWaveBrick = require('./gen-wave-brick'),
    findLaneMarkers = require('./find-lane-markers');

// text is the wave member of the signal object
// extra = hscale-1 ( padding )
// lane is an object containing all properties for this waveform
function parseWaveLane (text, extra, lane) {
    var Repeats, Top, Next, Stack = [], R = [], i, subCycle;
    var unseen_bricks = [], num_unseen_markers;

    Stack = text.split('');
    Next  = Stack.shift();
    subCycle = false;

    Repeats = 1;
    while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
        Stack.shift();
        Repeats += 1;
    }
    R = R.concat(genFirstWaveBrick(Next, extra, Repeats));

    while (Stack.length) {
        Top = Next;
        Next = Stack.shift();
        if (Next === '<') { // sub-cycles on
            subCycle = true;
            Next = Stack.shift();
        }
        if (Next === '>') { // sub-cycles off
            subCycle = false;
            Next = Stack.shift();
        }
        Repeats = 1;
        while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
            Stack.shift();
            Repeats += 1;
        }
        if (subCycle) {
            R = R.concat(genWaveBrick((Top + Next), 0, Repeats - lane.period));
        } else {
            R = R.concat(genWaveBrick((Top + Next), extra, Repeats));
        }
    }
    // shift out unseen bricks due to phase shift, and save them in
    //  unseen_bricks array
    for (i = 0; i < lane.phase; i += 1) {
        unseen_bricks.push(R.shift());
    }
    if (unseen_bricks.length > 0) {
        num_unseen_markers = findLaneMarkers( unseen_bricks ).length;
        // if end of unseen_bricks and start of R both have a marker,
        //  then one less unseen marker
        if ( findLaneMarkers( [unseen_bricks[unseen_bricks.length-1]] ).length == 1 &&
             findLaneMarkers( [R[0]] ).length == 1 ) {
            num_unseen_markers -= 1;
        }
    } else {
        num_unseen_markers = 0;
    }

    // R is array of half brick types, each is item is string
    // num_unseen_markers is how many markers are now unseen due to phase
    return [R, num_unseen_markers];
}

module.exports = parseWaveLane;

},{"./find-lane-markers":48,"./gen-first-wave-brick":50,"./gen-wave-brick":51}],58:[function(require,module,exports){
'use strict';

var parseWaveLane = require('./parse-wave-lane');

function data_extract (e, num_unseen_markers) {
    var ret_data;

    ret_data = e.data;
    if (ret_data === undefined) { return null; }
    if (typeof (ret_data) === 'string') {
        ret_data = ret_data.trim().split(/\s+/);
    }
    // slice data array after unseen markers
    ret_data = ret_data.slice( num_unseen_markers );
    return ret_data;
}

function parseWaveLanes (sig, lane) {
    var x,
        sigx,
        content = [],
        content_wave,
        parsed_wave_lane,
        num_unseen_markers,
        tmp0 = [];

    for (x in sig) {
        // sigx is each signal in the array of signals being iterated over
        sigx = sig[x];
        lane.period = sigx.period ? sigx.period    : 1;
        // xmin_cfg is min. brick of hbounds, add to lane.phase of all signals
        lane.phase  = (sigx.phase  ? sigx.phase * 2 : 0) + lane.xmin_cfg;
        content.push([]);
        tmp0[0] = sigx.name  || ' ';
        // xmin_cfg is min. brick of hbounds, add 1/2 to sigx.phase of all sigs
        tmp0[1] = (sigx.phase || 0) + lane.xmin_cfg/2;
        if ( sigx.wave ) {
            parsed_wave_lane = parseWaveLane(sigx.wave, lane.period * lane.hscale - 1, lane);
            content_wave = parsed_wave_lane[0] ;
            num_unseen_markers = parsed_wave_lane[1];
        } else {
            content_wave = null;
        }
        content[content.length - 1][0] = tmp0.slice(0);
        content[content.length - 1][1] = content_wave;
        content[content.length - 1][2] = data_extract(sigx, num_unseen_markers);
    }
    // content is an array of arrays, representing the list of signals using
    //  the same order:
    // content[0] = [ [name,phase], parsedwavelaneobj, dataextracted ]
    return content;
}

module.exports = parseWaveLanes;

},{"./parse-wave-lane":57}],59:[function(require,module,exports){
'use strict';

var eva = require('./eva'),
    appendSaveAsDialog = require('./append-save-as-dialog'),
    renderWaveForm = require('./render-wave-form');

function processAll () {
    var points,
        i,
        index,
        notFirstSignal,
        obj,
        node0;
        // node1;

    // first pass
    index = 0; // actual number of valid anchor
    points = document.querySelectorAll('*');
    for (i = 0; i < points.length; i++) {
        if (points.item(i).type && points.item(i).type === 'WaveDrom') {
            points.item(i).setAttribute('id', 'InputJSON_' + index);

            node0 = document.createElement('div');
            // node0.className += 'WaveDrom_Display_' + index;
            node0.id = 'WaveDrom_Display_' + index;
            points.item(i).parentNode.insertBefore(node0, points.item(i));
            // WaveDrom.InsertSVGTemplate(i, node0);
            index += 1;
        }
    }
    // second pass
    for (i = 0; i < index; i += 1) {
        obj = eva('InputJSON_' + i);
        renderWaveForm(i, obj, 'WaveDrom_Display_', notFirstSignal);
        if (obj && obj.signal && !notFirstSignal) {
            notFirstSignal = true;
        }
        appendSaveAsDialog(i, 'WaveDrom_Display_');
    }
    // add styles
    document.head.innerHTML += '<style type="text/css">div.wavedromMenu{position:fixed;border:solid 1pt#CCCCCC;background-color:white;box-shadow:0px 10px 20px #808080;cursor:default;margin:0px;padding:0px;}div.wavedromMenu>ul{margin:0px;padding:0px;}div.wavedromMenu>ul>li{padding:2px 10px;list-style:none;}div.wavedromMenu>ul>li:hover{background-color:#b5d5ff;}</style>';
}

module.exports = processAll;

/* eslint-env browser */

},{"./append-save-as-dialog":42,"./eva":47,"./render-wave-form":72}],60:[function(require,module,exports){
'use strict';

function rec (tmp, state) {
    var i, name, old = {}, delta = {'x':10};
    if (typeof tmp[0] === 'string' || typeof tmp[0] === 'number') {
        name = tmp[0];
        delta.x = 25;
    }
    state.x += delta.x;
    for (i = 0; i < tmp.length; i++) {
        if (typeof tmp[i] === 'object') {
            if (Object.prototype.toString.call(tmp[i]) === '[object Array]') {
                old.y = state.y;
                state = rec(tmp[i], state);
                state.groups.push({'x':state.xx, 'y':old.y, 'height':(state.y - old.y), 'name':state.name});
            } else {
                state.lanes.push(tmp[i]);
                state.width.push(state.x);
                state.y += 1;
            }
        }
    }
    state.xx = state.x;
    state.x -= delta.x;
    state.name = name;
    return state;
}

module.exports = rec;

},{}],61:[function(require,module,exports){
'use strict';

var renderAssign = require('./render-assign.js');
var renderReg = require('./render-reg.js');
var renderSignal = require('./render-signal.js');

function renderAny (index, source, waveSkin, notFirstSignal) {
    var res = source.signal ?
        renderSignal(index, source, waveSkin, notFirstSignal) :
        source.assign ?
            renderAssign(index, source) :
            source.reg ?
                renderReg(index, source) :
                ['div', {}];

    res[1].class = 'WaveDrom';
    return res;
}

module.exports = renderAny;

},{"./render-assign.js":63,"./render-reg.js":69,"./render-signal.js":70}],62:[function(require,module,exports){
'use strict';

var arcShape = require('./arc-shape.js');
var renderLabel = require('./render-label.js');

function renderArc (Edge, from, to, shapeProps) {
    return ['path', {
        id: 'gmark_' + Edge.from + '_' + Edge.to,
        d: shapeProps.d || 'M ' + from.x + ',' + from.y + ' ' + to.x + ',' + to.y,
        style: shapeProps.style || 'fill:none;stroke:#00F;stroke-width:1'
    }];
}

function renderArcs (source, index, top, lane) {
    var res = ['g', {id: 'wavearcs_' + index}];
    var Events = {};

    function labeler (element, i) {
        var pos, eventname, stack;
        var text = element.node;
        lane.period = element.period ? element.period : 1;
        lane.phase  = (element.phase ? element.phase * 2 : 0) + lane.xmin_cfg;
        if (text) {
            stack = text.split('');
            pos = 0;
            while (stack.length) {
                eventname = stack.shift();
                if (eventname !== '.') {
                    Events[eventname] = {
                        x: lane.xs *
                          (2 * pos * lane.period * lane.hscale - lane.phase) +
                          lane.xlabel,
                        y: i * lane.yo + lane.y0 + lane.ys * 0.5
                    };
                }
                pos += 1;
            }
        }
    }

    function archer (element) {
        var words = element.trim().split(/\s+/);
        var Edge = {
            words: words,
            label: element.substring(words[0].length).substring(1),
            from:  words[0].substr(0, 1),
            to:    words[0].substr(-1, 1),
            shape: words[0].slice(1, -1)
        };
        var from = Events[Edge.from];
        var to = Events[Edge.to];

        var shapeProps, lx, ly;
        if (from && to) {
            shapeProps = arcShape(Edge, from, to);
            lx = shapeProps.lx;
            ly = shapeProps.ly;
            res = res.concat([renderArc(Edge, from, to, shapeProps)]);

            if (Edge.label) {
                res = res.concat([renderLabel({x: lx, y: ly}, Edge.label)]);
            }
        }
    }

    if (Array.isArray(source)) {
        source.map(labeler);
        if (Array.isArray(top.edge)) {
            top.edge.map(archer);
        }
        Object.keys(Events).map(function (k) {
            if (k === k.toLowerCase()) {
                if (Events[k].x > 0) {
                    res = res.concat([renderLabel({
                        x: Events[k].x,
                        y: Events[k].y
                    }, k + '')]);
                }
            }
        });
    }
    return res;
}

module.exports = renderArcs;

},{"./arc-shape.js":43,"./render-label.js":66}],63:[function(require,module,exports){
'use strict';

var insertSVGTemplateAssign = require('./insert-svg-template-assign');

function render (tree, state) {
    var y, i, ilen;

    state.xmax = Math.max(state.xmax, state.x);
    y = state.y;
    ilen = tree.length;
    for (i = 1; i < ilen; i++) {
        if (Object.prototype.toString.call(tree[i]) === '[object Array]') {
            state = render(tree[i], {x: (state.x + 1), y: state.y, xmax: state.xmax});
        } else {
            tree[i] = {name:tree[i], x: (state.x + 1), y: state.y};
            state.y += 2;
        }
    }
    tree[0] = {name: tree[0], x: state.x, y: Math.round((y + (state.y - 2)) / 2)};
    state.x--;
    return state;
}

function draw_body (type, ymin, ymax) {
    var e,
        iecs,
        circle = ' M 4,0 C 4,1.1 3.1,2 2,2 0.9,2 0,1.1 0,0 c 0,-1.1 0.9,-2 2,-2 1.1,0 2,0.9 2,2 z',
        gates = {
            '~':  'M -11,-6 -11,6 0,0 z m -5,6 5,0' + circle,
            '=':  'M -11,-6 -11,6 0,0 z m -5,6 5,0',
            '&':  'm -16,-10 5,0 c 6,0 11,4 11,10 0,6 -5,10 -11,10 l -5,0 z',
            '~&': 'm -16,-10 5,0 c 6,0 11,4 11,10 0,6 -5,10 -11,10 l -5,0 z' + circle,
            '|':  'm -18,-10 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 2.5,-5 2.5,-15 0,-20 z',
            '~|': 'm -18,-10 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 2.5,-5 2.5,-15 0,-20 z' + circle,
            '^':  'm -21,-10 c 1,3 2,6 2,10 m 0,0 c 0,4 -1,7 -2,10 m 3,-20 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 1,-3 2,-6 2,-10 0,-4 -1,-7 -2,-10 z',
            '~^': 'm -21,-10 c 1,3 2,6 2,10 m 0,0 c 0,4 -1,7 -2,10 m 3,-20 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 1,-3 2,-6 2,-10 0,-4 -1,-7 -2,-10 z' + circle,
            '+':  'm -8,5 0,-10 m -5,5 10,0 m 3,0 c 0,4.418278 -3.581722,8 -8,8 -4.418278,0 -8,-3.581722 -8,-8 0,-4.418278 3.581722,-8 8,-8 4.418278,0 8,3.581722 8,8 z',
            '*':  'm -4,4 -8,-8 m 0,8 8,-8 m 4,4 c 0,4.418278 -3.581722,8 -8,8 -4.418278,0 -8,-3.581722 -8,-8 0,-4.418278 3.581722,-8 8,-8 4.418278,0 8,3.581722 8,8 z'
        },
        iec = {
            BUF: 1, INV: 1, AND: '&',  NAND: '&',
            OR: '\u22651', NOR: '\u22651', XOR: '=1', XNOR: '=1', box: ''
        },
        circled = { INV: 1, NAND: 1, NOR: 1, XNOR: 1 };

    if (ymax === ymin) {
        ymax = 4; ymin = -4;
    }
    e = gates[type];
    iecs = iec[type];
    if (e) {
        return ['path', {class:'gate', d: e}];
    } else {
        if (iecs) {
            return [
                'g', [
                    'path', {
                        class:'gate',
                        d: 'm -16,' + (ymin - 3) + ' 16,0 0,' + (ymax - ymin + 6) + ' -16,0 z' + (circled[type] ? circle : '')
                    }], [
                    'text', [
                        'tspan', {x: '-14', y: '4', class: 'wirename'}, iecs + ''
                    ]
                ]
            ];
        } else {
            return ['text', ['tspan', {x: '-14', y: '4', class: 'wirename'}, type + '']];
        }
    }
}

function draw_gate (spec) { // ['type', [x,y], [x,y] ... ]
    var i,
        ret = ['g'],
        ys = [],
        ymin,
        ymax,
        ilen = spec.length;

    for (i = 2; i < ilen; i++) {
        ys.push(spec[i][1]);
    }

    ymin = Math.min.apply(null, ys);
    ymax = Math.max.apply(null, ys);

    ret.push(
        ['g',
            {transform:'translate(16,0)'},
            ['path', {
                d: 'M  ' + spec[2][0] + ',' + ymin + ' ' + spec[2][0] + ',' + ymax,
                class: 'wire'
            }]
        ]
    );

    for (i = 2; i < ilen; i++) {
        ret.push(
            ['g',
                ['path',
                    {
                        d: 'm  ' + spec[i][0] + ',' + spec[i][1] + ' 16,0',
                        class: 'wire'
                    }
                ]
            ]
        );
    }
    ret.push(
        ['g', { transform: 'translate(' + spec[1][0] + ',' + spec[1][1] + ')' },
            ['title', spec[0]],
            draw_body(spec[0], ymin - spec[1][1], ymax - spec[1][1])
        ]
    );
    return ret;
}

function draw_boxes (tree, xmax) {
    var ret = ['g'], i, ilen, fx, fy, fname, spec = [];
    if (Object.prototype.toString.call(tree) === '[object Array]') {
        ilen = tree.length;
        spec.push(tree[0].name);
        spec.push([32 * (xmax - tree[0].x), 8 * tree[0].y]);
        for (i = 1; i < ilen; i++) {
            if (Object.prototype.toString.call(tree[i]) === '[object Array]') {
                spec.push([32 * (xmax - tree[i][0].x), 8 * tree[i][0].y]);
            } else {
                spec.push([32 * (xmax - tree[i].x), 8 * tree[i].y]);
            }
        }
        ret.push(draw_gate(spec));
        for (i = 1; i < ilen; i++) {
            ret.push(draw_boxes(tree[i], xmax));
        }
    } else {
        fname = tree.name;
        fx = 32 * (xmax - tree.x);
        fy = 8 * tree.y;
        ret.push(
            ['g', { transform: 'translate(' + fx + ',' + fy + ')'},
                ['title', fname],
                ['path', {d:'M 2,0 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z'}],
                ['text',
                    ['tspan', {
                        x:'-4', y:'4',
                        class:'pinname'},
                    fname
                    ]
                ]
            ]
        );
    }
    return ret;
}

function renderAssign (index, source) {
    var tree,
        state,
        xmax,
        svg = ['g'],
        grid = ['g'],
        // svgcontent,
        width,
        height,
        i,
        ilen,
        j,
        jlen;

    ilen = source.assign.length;
    state = { x: 0, y: 2, xmax: 0 };
    tree = source.assign;
    for (i = 0; i < ilen; i++) {
        state = render(tree[i], state);
        state.x++;
    }
    xmax = state.xmax + 3;

    for (i = 0; i < ilen; i++) {
        svg.push(draw_boxes(tree[i], xmax));
    }
    width  = 32 * (xmax + 1) + 1;
    height = 8 * (state.y + 1) - 7;
    ilen = 4 * (xmax + 1);
    jlen = state.y + 1;
    for (i = 0; i <= ilen; i++) {
        for (j = 0; j <= jlen; j++) {
            grid.push(['rect', {
                height: 1,
                width: 1,
                x: (i * 8 - 0.5),
                y: (j * 8 - 0.5),
                class: 'grid'
            }]);
        }
    }
    return ['svg', {
        id: 'svgcontent_' + index,
        viewBox: '0 0 ' + width + ' ' + height,
        width: width,
        height: height
    },
    insertSVGTemplateAssign(),
    ['g', {transform:'translate(0.5, 0.5)'}, grid, svg]
    ];
}

module.exports = renderAssign;

},{"./insert-svg-template-assign":53}],64:[function(require,module,exports){
'use strict';

function renderGapUses (text, lane) {
    var res = [];
    var Stack = (text || '').split('');
    var pos = 0;
    var next;
    var subCycle = false;
    while (Stack.length) {
        next = Stack.shift();
        if (next === '<') { // sub-cycles on
            subCycle = true;
            next = Stack.shift();
        }
        if (next === '>') { // sub-cycles off
            subCycle = false;
            next = Stack.shift();
        }
        if (subCycle) {
            pos += 1;
        } else {
            pos += (2 * lane.period);
        }
        if (next === '|') {
            res.push(['use', {
                'xlink:href': '#gap',
                transform: 'translate(' + (lane.xs * ((pos - (subCycle ? 0 : lane.period)) * lane.hscale - lane.phase)) + ')'
            }]);
        }
    }
    return res;
}

function renderGaps (source, index, lane) {
    var i, gaps;

    var res = [];
    if (source) {
        for (i in source) {
            lane.period = source[i].period ? source[i].period : 1;
            lane.phase  = (source[i].phase  ? source[i].phase * 2 : 0) + lane.xmin_cfg;

            gaps = renderGapUses(source[i].wave, lane);
            res = res.concat([['g', {
                id: 'wavegap_' + i + '_' + index,
                transform: 'translate(0,' + (lane.y0 + i * lane.yo) + ')'
            }].concat(gaps)]);
        }
    }
    return ['g', {id: 'wavegaps_' + index}].concat(res);
}

module.exports = renderGaps;

},{}],65:[function(require,module,exports){
'use strict';

var tspan = require('tspan');

function renderGroups (groups, index, lane) {
    var x, y, res = ['g'], ts;

    groups.forEach(function (e, i) {
        res.push(['path',
            {
                id: 'group_' + i + '_' + index,
                d: ('m ' + (e.x + 0.5) + ',' + (e.y * lane.yo + 3.5 + lane.yh0 + lane.yh1)
                    + ' c -3,0 -5,2 -5,5 l 0,' + (e.height * lane.yo - 16)
                    + ' c 0,3 2,5 5,5'),
                style: 'stroke:#0041c4;stroke-width:1;fill:none'
            }
        ]);

        if (e.name === undefined) { return; }

        x = (e.x - 10);
        y = (lane.yo * (e.y + (e.height / 2)) + lane.yh0 + lane.yh1);
        ts = tspan.parse(e.name);
        ts.unshift(
            'text',
            {
                'text-anchor': 'middle',
                class: 'info',
                'xml:space': 'preserve'
            }
        );
        res.push(['g', {transform: 'translate(' + x + ',' + y + ')'}, ['g', {transform: 'rotate(270)'}, ts]]);
    });
    return res;
}

module.exports = renderGroups;

},{"tspan":38}],66:[function(require,module,exports){
'use strict';

var tspan = require('tspan');
var textWidth = require('./text-width.js');

function renderLabel (p, text) {
    var w = textWidth(text, 8) + 2;
    return ['g', {
        transform:'translate(' + p.x + ',' + p.y + ')'
    },
    ['rect', {
        x: -(w >> 1),
        y: -5,
        width: w,
        height: 10,
        style: 'fill:#FFF;'
    }],
    ['text', {
        'text-anchor': 'middle',
        y: 3,
        style: 'font-size:8px;'
    }].concat(tspan.parse(text))
    ];
}

module.exports = renderLabel;

},{"./text-width.js":74,"tspan":38}],67:[function(require,module,exports){
'use strict';

var renderMarks = require('./render-marks');
var renderArcs = require('./render-arcs');
var renderGaps = require('./render-gaps');

function renderLanes (index, content, waveLanes, ret, source, lane) {
    return [renderMarks(content, index, lane, source)]
        .concat(waveLanes.res)
        .concat([renderArcs(ret.lanes, index, source, lane)])
        .concat([renderGaps(ret.lanes, index, lane)]);
}

module.exports = renderLanes;

},{"./render-arcs":62,"./render-gaps":64,"./render-marks":68}],68:[function(require,module,exports){
'use strict';

var tspan = require('tspan');

function captext (cxt, anchor, y) {
    if (cxt[anchor] && cxt[anchor].text) {
        return [
            ['text', {
                x: cxt.xmax * cxt.xs / 2,
                y: y,
                fill: '#000',
                'text-anchor': 'middle',
                'xml:space': 'preserve'
            }].concat(tspan.parse(cxt[anchor].text))
        ];
    }
    return [];
}

function ticktock (cxt, ref1, ref2, x, dx, y, len) {
    var step = 1;
    var offset;
    var dp = 0;
    var val;
    var L = [];
    var tmp;
    var i;

    if (cxt[ref1] === undefined || cxt[ref1][ref2] === undefined) { return []; }
    val = cxt[ref1][ref2];
    if (typeof val === 'string') {
        val = val.trim().split(/\s+/);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
        offset = Number(val);
        val = [];
        for (i = 0; i < len; i += 1) {
            val.push(i + offset);
        }
    }
    if (Object.prototype.toString.call(val) === '[object Array]') {
        if (val.length === 0) {
            return [];
        } else if (val.length === 1) {
            offset = Number(val[0]);
            if (isNaN(offset)) {
                L = val;
            } else {
                for (i = 0; i < len; i += 1) {
                    L[i] = i + offset;
                }
            }
        } else if (val.length === 2) {
            offset = Number(val[0]);
            step   = Number(val[1]);
            tmp = val[1].split('.');
            if ( tmp.length === 2 ) {
                dp = tmp[1].length;
            }
            if (isNaN(offset) || isNaN(step)) {
                L = val;
            } else {
                offset = step * offset;
                for (i = 0; i < len; i += 1) {
                    L[i] = (step * i + offset).toFixed(dp);
                }
            }
        } else {
            L = val;
        }
    } else {
        return [];
    }

    var res = ['g', {
        class: 'muted',
        'text-anchor': 'middle',
        'xml:space': 'preserve'
    }];

    for (i = 0; i < len; i += 1) {
        res.push(['text', {x: i * dx + x, y: y}].concat(tspan.parse(L[i])));
    }
    return [res];
}

function renderMarks (content, index, lane, source) {
    var mstep  = 2 * (lane.hscale);
    var mmstep = mstep * lane.xs;
    var marks  = lane.xmax / mstep;
    var gy     = content.length * lane.yo;

    var i;
    var res = ['g', {id: ('gmarks_' + index)}];
    var gmarkLines = ['g', {style: 'stroke:#888;stroke-width:0.5;stroke-dasharray:1,3'}];
    if (!(source && source.config && source.config.marks === false)) {
        for (i = 0; i < (marks + 1); i += 1) {
            gmarkLines.push(['line', {
                id: 'gmark_' + i + '_' + index,
                x1: i * mmstep, y1: 0,
                x2: i * mmstep, y2: gy
            }]);
        }
        res = res.concat([gmarkLines]);
    }
    return res
        .concat(captext(lane, 'head', (lane.yh0 ? -33 : -13)))
        .concat(captext(lane, 'foot', gy + (lane.yf0 ? 45 : 25)))
        .concat(ticktock(lane, 'head', 'tick',          0, mmstep,      -5, marks + 1))
        .concat(ticktock(lane, 'head', 'tock', mmstep / 2, mmstep,      -5, marks))
        .concat(ticktock(lane, 'foot', 'tick',          0, mmstep, gy + 15, marks + 1))
        .concat(ticktock(lane, 'foot', 'tock', mmstep / 2, mmstep, gy + 15, marks));
}

module.exports = renderMarks;

},{"tspan":38}],69:[function(require,module,exports){
'use strict';

var render = require('bit-field/lib/render');

function renderReg (index, source) {
    return render(source.reg, source.config);
}

module.exports = renderReg;

},{"bit-field/lib/render":2}],70:[function(require,module,exports){
'use strict';

var rec = require('./rec');
var lane = require('./lane');
var parseConfig = require('./parse-config');
var parseWaveLanes = require('./parse-wave-lanes');
var renderGroups = require('./render-groups');
var renderLanes = require('./render-lanes');
var renderWaveLane = require('./render-wave-lane');

var insertSVGTemplate = require('./insert-svg-template');

function laneParamsFromSkin (index, source, lane, waveSkin) {

    if (index !== 0) { return; }

    var first, skin, socket;

    for (first in waveSkin) { break; }

    skin = waveSkin.default || waveSkin[first];

    if (source && source.config && source.config.skin && waveSkin[source.config.skin]) {
        skin = waveSkin[source.config.skin];
    }

    socket = skin[3][1][2][1];

    lane.xs     = Number(socket.width);
    lane.ys     = Number(socket.height);
    lane.xlabel = Number(socket.x);
    lane.ym     = Number(socket.y);
}

function renderSignal (index, source, waveSkin, notFirstSignal) {

    laneParamsFromSkin (index, source, lane, waveSkin);

    parseConfig(source, lane);
    var ret = rec(source.signal, {'x':0, 'y':0, 'xmax':0, 'width':[], 'lanes':[], 'groups':[]});
    var content = parseWaveLanes(ret.lanes, lane);

    var waveLanes = renderWaveLane(content, index, lane);
    var waveGroups = renderGroups(ret.groups, index, lane);

    var xmax = waveLanes.glengths.reduce(function (res, len, i) {
        return Math.max(res, len + ret.width[i]);
    }, 0);

    lane.xg = Math.ceil((xmax - lane.tgo) / lane.xs) * lane.xs;

    return insertSVGTemplate(
        index, source, lane, waveSkin, content,
        renderLanes(index, content, waveLanes, ret, source, lane),
        waveGroups,
        notFirstSignal
    );

}

module.exports = renderSignal;

},{"./insert-svg-template":54,"./lane":55,"./parse-config":56,"./parse-wave-lanes":58,"./rec":60,"./render-groups":65,"./render-lanes":67,"./render-wave-lane":73}],71:[function(require,module,exports){
'use strict';

var renderAny = require('./render-any.js');
var jsonmlParse = require('./create-element');

function renderWaveElement (index, source, outputElement, waveSkin, notFirstSignal) {

    // cleanup
    while (outputElement.childNodes.length) {
        outputElement.removeChild(outputElement.childNodes[0]);
    }

    outputElement.insertBefore(jsonmlParse(
        renderAny(index, source, waveSkin, notFirstSignal)
    ), null);
}

module.exports = renderWaveElement;

},{"./create-element":45,"./render-any.js":61}],72:[function(require,module,exports){
'use strict';

var renderWaveElement = require('./render-wave-element');

function renderWaveForm (index, source, output, notFirstSignal) {
    renderWaveElement(index, source, document.getElementById(output + index), window.WaveSkin, notFirstSignal);
}

module.exports = renderWaveForm;

/* eslint-env browser */

},{"./render-wave-element":71}],73:[function(require,module,exports){
'use strict';

var tspan = require('tspan');
var textWidth = require('./text-width.js');
var findLaneMarkers = require('./find-lane-markers');

function renderLaneUses (cont, lane) {
    var i, k;
    var res = [];
    var labels = [];
    if (cont[1]) {
        for (i = 0; i < cont[1].length; i += 1) {
            res.push(['use', {
                'xlink:href': '#' + cont[1][i],
                transform: 'translate(' + (i * lane.xs) + ')'
            }]);
        }
        if (cont[2] && cont[2].length) {
            labels = findLaneMarkers(cont[1]);
            if (labels.length) {
                for (k in labels) {
                    if (cont[2] && (cont[2][k] !== undefined)) {
                        res.push(['text', {
                            x: labels[k] * lane.xs + lane.xlabel,
                            y: lane.ym,
                            'text-anchor': 'middle',
                            'xml:space': 'preserve'
                        }].concat(tspan.parse(cont[2][k])));
                    }
                }
            }
        }
    }
    return res;
}

function renderWaveLane (content, index, lane) {
    var // i,
        j,
        name,
        xoffset,
        xmax     = 0,
        xgmax    = 0,
        glengths = [];

    var res = [];

    for (j = 0; j < content.length; j += 1) {
        name = content[j][0][0];
        if (name) { // check name

            xoffset = content[j][0][1];
            xoffset = (xoffset > 0)
                ? (Math.ceil(2 * xoffset) - 2 * xoffset)
                : (-2 * xoffset);

            res.push(['g', {
                id: 'wavelane_' + j + '_' + index,
                transform: 'translate(0,' + ((lane.y0) + j * lane.yo) + ')'
            },
            ['text', {
                x: lane.tgo,
                y: lane.ym,
                class: 'info',
                'text-anchor': 'end',
                'xml:space': 'preserve'
            }].concat(tspan.parse(name)),
            ['g', {
                id: 'wavelane_draw_' + j + '_' + index,
                transform: 'translate(' + (xoffset * lane.xs) + ', 0)'
            }].concat(renderLaneUses(content[j], lane))
            ]);

            xmax = Math.max(xmax, (content[j][1] || []).length);
            glengths.push(textWidth(name, 11));
        }
    }
    // xmax if no xmax_cfg,xmin_cfg, else set to config
    lane.xmax = Math.min(xmax, lane.xmax_cfg - lane.xmin_cfg);
    lane.xg = xgmax + 20;
    return {glengths: glengths, res: res};
}

module.exports = renderWaveLane;

},{"./find-lane-markers":48,"./text-width.js":74,"tspan":38}],74:[function(require,module,exports){
'use strict';

var charWidth = require('./char-width.json');

/**
    Calculates text string width in pixels.

    @param {String} str text string to be measured
    @param {Number} size font size used
    @return {Number} text string width
*/

module.exports = function (str, size) {
    var i, len, c, w, width;
    size = size || 11; // default size 11pt
    len = str.length;
    width = 0;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        w = charWidth.chars[c];
        if (w === undefined) {
            w = charWidth.other;
        }
        width += w;
    }
    return (width * size) / 100; // normalize
};

},{"./char-width.json":44}],75:[function(require,module,exports){
'use strict';

module.exports = {
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
    xmlns: 'http://www.w3.org/XML/1998/namespace'
};

},{}],76:[function(require,module,exports){
'use strict';

function isObject (o) {
    return o && Object.prototype.toString.call(o) === '[object Object]';
}

function indenter (indentation) {
    var space = ' '.repeat(indentation);
    return function (txt) {
        var arr, res = [];

        if (typeof txt !== 'string') {
            return txt;
        }

        arr = txt.split('\n');

        if (arr.length === 1) {
            return space + txt;
        }

        arr.forEach(function (e) {
            if (e.trim() === '') {
                res.push(e);
                return;
            }
            res.push(space + e);
        });

        return res.join('\n');
    };
}

function clean (txt) {
    var arr = txt.split('\n');
    var res = [];
    arr.forEach(function (e) {
        if (e.trim() === '') {
            return;
        }
        res.push(e);
    });
    return res.join('\n');
}

function stringify (a, indentation) {

    var cr = '';
    var indent = function (t) { return t; };

    if (indentation > 0) {
        cr = '\n';
        indent = indenter(indentation);
    }

    function rec (a) {
        var res, body, isEmpty, isFlat;

        body = '';
        isFlat = true;
        isEmpty = a.some(function (e, i, arr) {
            if (i === 0) {
                res = '<' + e;
                if (arr.length === 1) {
                    return true;
                }
                return;
            }

            if (i === 1) {
                if (isObject(e)) {
                    Object.keys(e).forEach(function (key) {
                        res += ' ' + key + '="' + e[key] + '"';
                    });
                    if (arr.length === 2) {
                        return true;
                    }
                    res += '>';
                    return;
                } else {
                    res += '>';
                }
            }

            switch (typeof e) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'undefined':
                body += e + cr;
                return;
            }

            isFlat = false;
            body += rec(e);
        });

        if (isEmpty) {
            return res + '/>' + cr; // short form
        } else {
            if (isFlat) {
                return res + clean(body) + '</' + a[0] + '>' + cr;
            } else {
                return res + cr + indent(body) + '</' + a[0] + '>' + cr;
            }
        }
    }

    return rec(a);
}

module.exports = stringify;

},{}],77:[function(require,module,exports){
module.exports={
  "_from": "wavedrom@^2.1.6",
  "_id": "wavedrom@2.3.2",
  "_inBundle": false,
  "_integrity": "sha512-QarFXQnE52zyZeKVUWgDaAx9bxwiF+fTlTpNWxdWnBVYmIfC9vKQWqKqq9sKsp9dgeWp7f5fw0fQ01MgCeWgCw==",
  "_location": "/wavedrom",
  "_phantomChildren": {
    "camelcase": "5.3.1",
    "cliui": "5.0.0",
    "decamelize": "1.2.0",
    "find-up": "3.0.0",
    "get-caller-file": "2.0.5",
    "graceful-fs": "4.2.3",
    "jsonfile": "4.0.0",
    "require-directory": "2.1.1",
    "require-main-filename": "2.0.0",
    "sax": "1.2.4",
    "set-blocking": "2.0.0",
    "string-width": "3.1.0",
    "universalify": "0.1.2",
    "which-module": "2.0.0",
    "y18n": "4.0.0"
  },
  "_requested": {
    "type": "range",
    "registry": true,
    "raw": "wavedrom@^2.1.6",
    "name": "wavedrom",
    "escapedName": "wavedrom",
    "rawSpec": "^2.1.6",
    "saveSpec": null,
    "fetchSpec": "^2.1.6"
  },
  "_requiredBy": [
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/wavedrom/-/wavedrom-2.3.2.tgz",
  "_shasum": "dd49724efb1d6e3d9d2b1882faf3a2a712396025",
  "_spec": "wavedrom@^2.1.6",
  "_where": "/home/drechsler/git/drawio_rtl_plugin",
  "author": {
    "name": "alex.drom@gmail.com"
  },
  "bin": {
    "wavedrom": "bin/cli.js"
  },
  "bugs": {
    "url": "https://github.com/wavedrom/wavedrom/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "bit-field": "^1.2.1",
    "fs-extra": "^8.0.1",
    "json5": "^2.1.1",
    "onml": "^1.2.0",
    "tspan": "^0.3.6",
    "yargs": "^14.2.0"
  },
  "deprecated": false,
  "description": "Digital timing diagram in your browser",
  "devDependencies": {
    "@drom/eslint-config": "^0.10.0",
    "browserify": "^16.5.0",
    "chai": "^4.2.0",
    "eslint": "^5.16.0",
    "grunt": "^1.0.4",
    "grunt-browserify": "^5.0.0",
    "grunt-cli": "^1.2.0",
    "grunt-contrib-clean": "^2.0.0",
    "grunt-contrib-concat": "^1.0.1",
    "grunt-contrib-uglify": "^4.0.1",
    "grunt-eslint": "^21.0.0",
    "js-beautify": "^1.10.2",
    "jsof": "^0.3.2",
    "mocha": "^6.2.1",
    "nyc": "^14.0.0"
  },
  "eslintConfig": {
    "extends": "@drom/eslint-config/eslint4/node4",
    "rules": {
      "camelcase": 0
    }
  },
  "files": [
    "bin/cli.js",
    "wavedrom.js",
    "wavedrom.min.js",
    "wavedrom.unpkg.js",
    "LICENSE",
    "lib/**",
    "skins/**"
  ],
  "homepage": "http://wavedrom.com",
  "keywords": [
    "waveform",
    "verilog",
    "RTL"
  ],
  "license": "MIT",
  "main": "./lib",
  "name": "wavedrom",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/wavedrom/wavedrom.git"
  },
  "scripts": {
    "cli": "{ echo '#!/usr/bin/env node' ; browserify --node bin/cli.js ; } > bin/wavedrom.js ; chmod +x bin/wavedrom.js",
    "cover": "nyc -r=text -r=lcov mocha",
    "eslint": "eslint lib/*.js",
    "prepare": "npm run test && npm run unpkg",
    "test": "grunt",
    "unpkg": "browserify --standalone wavedrom lib/index.js > wavedrom.unpkg.js"
  },
  "unpkg": "wavedrom.unpkg.js",
  "version": "2.3.2"
}

},{}],78:[function(require,module,exports){
var WaveSkin=WaveSkin||{};WaveSkin.default=["svg",{"id":"svg","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","height":"0"},["style",{"type":"text/css"},"text{font-size:11pt;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:center;fill-opacity:1;font-family:Helvetica}.muted{fill:#aaa}.warning{fill:#f6b900}.error{fill:#f60000}.info{fill:#0041c4}.success{fill:#00ab00}.h1{font-size:33pt;font-weight:bold}.h2{font-size:27pt;font-weight:bold}.h3{font-size:20pt;font-weight:bold}.h4{font-size:14pt;font-weight:bold}.h5{font-size:11pt;font-weight:bold}.h6{font-size:8pt;font-weight:bold}.s1{fill:none;stroke:#000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s2{fill:none;stroke:#000;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s3{color:#000;fill:none;stroke:#000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:1, 3;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s4{color:#000;fill:none;stroke:#000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible}.s5{fill:#fff;stroke:none}.s6{fill:#000;fill-opacity:1;stroke:none}.s7{color:#000;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s8{color:#000;fill:#ffffb4;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s9{color:#000;fill:#ffe0b9;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s10{color:#000;fill:#b9e0ff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s11{color:#000;fill:#ccfdfe;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s12{color:#000;fill:#cdfdc5;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s13{color:#000;fill:#f0c1fb;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s14{color:#000;fill:#f5c2c0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s15{fill:#0041c4;fill-opacity:1;stroke:none}.s16{fill:none;stroke:#0041c4;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}"],["defs",["g",{"id":"socket"},["rect",{"y":"15","x":"6","height":"20","width":"20"}]],["g",{"id":"pclk"},["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"nclk"},["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"000"},["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0m0"},["path",{"d":"m0,20 3,0 3,-10 3,10 11,0","class":"s1"}]],["g",{"id":"0m1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"0mx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0md"},["path",{"d":"m8,20 10,0","class":"s3"}],["path",{"d":"m0,20 5,0","class":"s1"}]],["g",{"id":"0mu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"0mz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"111"},["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"1m0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"1m1"},["path",{"d":"M0,0 3,0 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"1mx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"1md"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"1mu"},["path",{"d":"M0,0 5,0","class":"s1"}],["path",{"d":"M8,0 18,0","class":"s3"}]],["g",{"id":"1mz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}]],["g",{"id":"xxx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xm0"},["path",{"d":"M0,0 4,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5,5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 7,13","class":"s2"}],["path",{"d":"M5,20 8,17","class":"s2"}]],["g",{"id":"xm1"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 4,20 9,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 9,1","class":"s2"}],["path",{"d":"M0,15 7,8","class":"s2"}],["path",{"d":"M0,20 5,15","class":"s2"}]],["g",{"id":"xmx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xmd"},["path",{"d":"m0,0 4,0 c 3,10 6,20 16,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5.5,4.5","class":"s2"}],["path",{"d":"M0,15 6.5,8.5","class":"s2"}],["path",{"d":"M0,20 8,12","class":"s2"}],["path",{"d":"m5,20 5,-5","class":"s2"}],["path",{"d":"m10,20 2.5,-2.5","class":"s2"}]],["g",{"id":"xmu"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m0,20 4,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 10,5","class":"s2"}],["path",{"d":"M0,20 6,14","class":"s2"}]],["g",{"id":"xmz"},["path",{"d":"m0,0 4,0 c 6,10 11,10 16,10","class":"s1"}],["path",{"d":"m0,20 4,0 C 10,10 15,10 20,10","class":"s1"}],["path",{"d":"M0,5 4.5,0.5","class":"s2"}],["path",{"d":"M0,10 6.5,3.5","class":"s2"}],["path",{"d":"M0,15 8.5,6.5","class":"s2"}],["path",{"d":"M0,20 11.5,8.5","class":"s2"}]],["g",{"id":"ddd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dm0"},["path",{"d":"m0,20 10,0","class":"s3"}],["path",{"d":"m12,20 8,0","class":"s1"}]],["g",{"id":"dm1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"dmx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"dmd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dmu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"dmz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"uuu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"um0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"um1"},["path",{"d":"M0,0 10,0","class":"s3"}],["path",{"d":"m12,0 8,0","class":"s1"}]],["g",{"id":"umx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"umd"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"umu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"umz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s4"}]],["g",{"id":"zzz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"zm0"},["path",{"d":"m0,10 6,0 3,10 11,0","class":"s1"}]],["g",{"id":"zm1"},["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"zmx"},["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6.5,8.5","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"zmd"},["path",{"d":"m0,10 7,0 c 3,5 8,10 13,10","class":"s1"}]],["g",{"id":"zmu"},["path",{"d":"m0,10 7,0 C 10,5 15,0 20,0","class":"s1"}]],["g",{"id":"zmz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"gap"},["path",{"d":"m7,-2 -4,0 c -5,0 -5,24 -10,24 l 4,0 C 2,22 2,-2 7,-2 z","class":"s5"}],["path",{"d":"M-7,22 C -2,22 -2,-2 3,-2","class":"s1"}],["path",{"d":"M-3,22 C 2,22 2,-2 7,-2","class":"s1"}]],["g",{"id":"Pclk"},["path",{"d":"M-3,12 0,3 3,12 C 1,11 -1,11 -3,12 z","class":"s6"}],["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"Nclk"},["path",{"d":"M-3,8 0,17 3,8 C 1,9 -1,9 -3,8 z","class":"s6"}],["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"0mv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-2"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-2"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-2"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s7"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-2"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s7"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-2"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s7"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-2"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-2"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-2"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s7"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-2"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s7"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-3"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-3"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-3"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s8"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-3"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s8"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-3"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s8"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-3"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-3"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-3"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s8"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-3"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s8"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-4"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-4"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-4"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s9"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-4"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s9"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-4"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s9"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-4"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-4"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-4"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s9"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-4"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s9"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-5"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-5"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-5"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s10"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-5"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s10"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-5"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s10"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-5"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-5"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-5"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s10"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-5"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s10"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-6"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-6"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-6"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s11"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-6"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s11"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-6"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s11"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-6"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-6"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-6"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s11"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-6"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s11"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-7"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-7"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-7"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s12"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-7"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s12"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-7"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s12"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-7"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-7"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-7"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s12"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-7"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s12"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-8"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-8"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-8"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s13"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-8"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s13"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-8"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s13"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-8"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-8"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-8"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s13"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-8"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s13"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-9"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-9"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-9"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s14"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-9"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s14"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-9"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s14"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-9"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-9"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-9"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s14"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-9"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s14"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"vmv-2-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"arrow0"},["path",{"d":"m-12,-3 9,3 -9,3 c 1,-2 1,-4 0,-6 z","class":"s15"}],["path",{"d":"M0,0 -15,0","class":"s16"}]],["marker",{"id":"arrowhead","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"0 -4 11 8","refX":"15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 11 0 0 4z"}]],["marker",{"id":"arrowtail","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"-11 -4 11 8","refX":"-15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 -11 0 0 4z"}]]],["g",{"id":"waves"},["g",{"id":"lanes"}],["g",{"id":"groups"}]]];
try { module.exports = WaveSkin; } catch(err) {}


},{}],79:[function(require,module,exports){
var WaveSkin=WaveSkin||{};WaveSkin.lowkey=["svg",{"id":"svg","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","height":"0"},["style",{"type":"text/css"},"text{font-size:11pt;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:center;fill-opacity:1;font-family:Helvetica}.muted{fill:#aaa}.warning{fill:#f6b900}.error{fill:#f60000}.info{fill:#0041c4}.success{fill:#00ab00}.h1{font-size:33pt;font-weight:bold}.h2{font-size:27pt;font-weight:bold}.h3{font-size:20pt;font-weight:bold}.h4{font-size:14pt;font-weight:bold}.h5{font-size:11pt;font-weight:bold}.h6{font-size:8pt;font-weight:bold}.s1{fill:none;stroke:#606060;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s2{fill:none;stroke:#606060;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s3{color:#000;fill:none;stroke:#606060;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:1, 3;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s4{color:#000;fill:none;stroke:#606060;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible}.s5{fill:#ffffff;stroke:none}.s6{fill:#606060;fill-opacity:1;stroke:none}.s7{color:#000;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s8{color:#000;fill:#eaeaea;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s9{color:#000;fill:#d7d7d7;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s10{color:#000;fill:#c0c0c0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s11{color:#000;fill:#b0b0b0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s12{color:#000;fill:#a0a0a0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s13{color:#000;fill:#909090;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s14{color:#000;fill:#808080;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.25px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s15{fill:#0041c4;fill-opacity:1;stroke:none}.s16{fill:none;stroke:#0041c4;stroke-width:0.75px;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}"],["defs",["g",{"id":"socket"},["rect",{"y":"15","x":"6","height":"20","width":"20","style":"fill:#606060;stroke:#606060;stroke-width:0.5"}]],["g",{"id":"pclk"},["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"nclk"},["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"000"},["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0m0"},["path",{"d":"m0,20 3,0 3,-10 3,10 11,0","class":"s1"}]],["g",{"id":"0m1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"0mx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"0md"},["path",{"d":"m8,20 10,0","class":"s3"}],["path",{"d":"m0,20 5,0","class":"s1"}]],["g",{"id":"0mu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"0mz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"111"},["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"1m0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"1m1"},["path",{"d":"M0,0 3,0 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"1mx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"1md"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"1mu"},["path",{"d":"M0,0 5,0","class":"s1"}],["path",{"d":"M8,0 18,0","class":"s3"}]],["g",{"id":"1mz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}]],["g",{"id":"xxx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xm0"},["path",{"d":"M0,0 4,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5,5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 7,13","class":"s2"}],["path",{"d":"M5,20 8,17","class":"s2"}]],["g",{"id":"xm1"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 4,20 9,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 9,1","class":"s2"}],["path",{"d":"M0,15 7,8","class":"s2"}],["path",{"d":"M0,20 5,15","class":"s2"}]],["g",{"id":"xmx"},["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 15,0","class":"s2"}],["path",{"d":"M0,20 20,0","class":"s2"}],["path",{"d":"M5,20 20,5","class":"s2"}],["path",{"d":"M10,20 20,10","class":"s2"}],["path",{"d":"m15,20 5,-5","class":"s2"}]],["g",{"id":"xmd"},["path",{"d":"m0,0 4,0 c 3,10 6,20 16,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,5 4,1","class":"s2"}],["path",{"d":"M0,10 5.5,4.5","class":"s2"}],["path",{"d":"M0,15 6.5,8.5","class":"s2"}],["path",{"d":"M0,20 8,12","class":"s2"}],["path",{"d":"m5,20 5,-5","class":"s2"}],["path",{"d":"m10,20 2.5,-2.5","class":"s2"}]],["g",{"id":"xmu"},["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m0,20 4,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,5 5,0","class":"s2"}],["path",{"d":"M0,10 10,0","class":"s2"}],["path",{"d":"M0,15 10,5","class":"s2"}],["path",{"d":"M0,20 6,14","class":"s2"}]],["g",{"id":"xmz"},["path",{"d":"m0,0 4,0 c 6,10 11,10 16,10","class":"s1"}],["path",{"d":"m0,20 4,0 C 10,10 15,10 20,10","class":"s1"}],["path",{"d":"M0,5 4.5,0.5","class":"s2"}],["path",{"d":"M0,10 6.5,3.5","class":"s2"}],["path",{"d":"M0,15 8.5,6.5","class":"s2"}],["path",{"d":"M0,20 11.5,8.5","class":"s2"}]],["g",{"id":"ddd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dm0"},["path",{"d":"m0,20 10,0","class":"s3"}],["path",{"d":"m12,20 8,0","class":"s1"}]],["g",{"id":"dm1"},["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"dmx"},["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 5,20","class":"s2"}],["path",{"d":"M20,0 4,16","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"dmd"},["path",{"d":"m0,20 20,0","class":"s3"}]],["g",{"id":"dmu"},["path",{"d":"m0,20 3,0 C 7,10 10.107603,0 20,0","class":"s1"}]],["g",{"id":"dmz"},["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"uuu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"um0"},["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}]],["g",{"id":"um1"},["path",{"d":"M0,0 10,0","class":"s3"}],["path",{"d":"m12,0 8,0","class":"s1"}]],["g",{"id":"umx"},["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6,9","class":"s2"}],["path",{"d":"M10,0 5,5","class":"s2"}],["path",{"d":"M3.5,1.5 5,0","class":"s2"}]],["g",{"id":"umd"},["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}]],["g",{"id":"umu"},["path",{"d":"M0,0 20,0","class":"s3"}]],["g",{"id":"umz"},["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s4"}]],["g",{"id":"zzz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"zm0"},["path",{"d":"m0,10 6,0 3,10 11,0","class":"s1"}]],["g",{"id":"zm1"},["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"zmx"},["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 6.5,8.5","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"zmd"},["path",{"d":"m0,10 7,0 c 3,5 8,10 13,10","class":"s1"}]],["g",{"id":"zmu"},["path",{"d":"m0,10 7,0 C 10,5 15,0 20,0","class":"s1"}]],["g",{"id":"zmz"},["path",{"d":"m0,10 20,0","class":"s1"}]],["g",{"id":"gap"},["path",{"d":"m7,-2 -4,0 c -5,0 -5,24 -10,24 l 4,0 C 2,22 2,-2 7,-2 z","class":"s5"}],["path",{"d":"M-7,22 C -2,22 -2,-2 3,-2","class":"s1"}],["path",{"d":"M-3,22 C 2,22 2,-2 7,-2","class":"s1"}]],["g",{"id":"Pclk"},["path",{"d":"M-3,12 0,3 3,12 C 1,11 -1,11 -3,12 z","class":"s6"}],["path",{"d":"M0,20 0,0 20,0","class":"s1"}]],["g",{"id":"Nclk"},["path",{"d":"M-3,8 0,17 3,8 C 1,9 -1,9 -3,8 z","class":"s6"}],["path",{"d":"m0,0 0,20 20,0","class":"s1"}]],["g",{"id":"0mv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-2"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-2"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s7"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-2"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s7"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-2"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s7"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-2"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s7"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-2"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s7"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-2"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-2"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s7"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-2"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s7"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-2"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s7"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-3"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-3"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s8"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-3"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s8"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-3"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s8"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-3"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s8"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-3"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s8"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-3"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-3"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s8"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-3"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s8"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-3"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s8"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-4"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-4"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s9"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-4"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s9"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-4"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s9"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-4"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s9"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-4"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s9"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-4"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-4"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s9"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-4"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s9"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-4"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s9"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-5"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-5"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s10"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-5"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s10"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-5"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s10"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-5"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s10"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-5"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s10"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-5"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-5"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s10"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-5"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s10"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-5"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s10"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-6"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-6"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s11"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-6"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s11"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-6"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s11"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-6"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s11"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-6"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s11"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-6"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-6"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s11"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-6"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s11"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-6"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s11"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-7"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-7"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s12"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-7"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s12"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-7"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s12"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-7"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s12"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-7"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s12"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-7"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-7"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s12"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-7"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s12"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-7"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s12"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-8"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-8"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s13"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-8"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s13"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-8"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s13"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-8"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s13"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-8"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s13"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-8"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-8"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s13"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-8"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s13"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-8"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s13"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"0mv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"1mv-9"},["path",{"d":"M2.875,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"xmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,5 3.5,1.5","class":"s2"}],["path",{"d":"M0,10 4.5,5.5","class":"s2"}],["path",{"d":"M0,15 6,9","class":"s2"}],["path",{"d":"M0,20 4,16","class":"s2"}]],["g",{"id":"dmv-9"},["path",{"d":"M9,0 20,0 20,20 3,20 z","class":"s14"}],["path",{"d":"M3,20 9,0 20,0","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"umv-9"},["path",{"d":"M3,0 20,0 20,20 9,20 z","class":"s14"}],["path",{"d":"m3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"zmv-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"m6,10 3,10 11,0","class":"s1"}],["path",{"d":"M0,10 6,10 9,0 20,0","class":"s1"}]],["g",{"id":"vvv-9"},["path",{"d":"M20,20 0,20 0,0 20,0","class":"s14"}],["path",{"d":"m0,20 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vm0-9"},["path",{"d":"M0,20 0,0 3,0 9,20","class":"s14"}],["path",{"d":"M0,0 3,0 9,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vm1-9"},["path",{"d":"M0,0 0,20 3,20 9,0","class":"s14"}],["path",{"d":"M0,0 20,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0","class":"s1"}]],["g",{"id":"vmx-9"},["path",{"d":"M0,0 0,20 3,20 6,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}],["path",{"d":"m20,15 -5,5","class":"s2"}],["path",{"d":"M20,10 10,20","class":"s2"}],["path",{"d":"M20,5 8,17","class":"s2"}],["path",{"d":"M20,0 7,13","class":"s2"}],["path",{"d":"M15,0 7,8","class":"s2"}],["path",{"d":"M10,0 9,1","class":"s2"}]],["g",{"id":"vmd-9"},["path",{"d":"m0,0 0,20 20,0 C 10,20 7,10 3,0","class":"s14"}],["path",{"d":"m0,0 3,0 c 4,10 7,20 17,20","class":"s1"}],["path",{"d":"m0,20 20,0","class":"s1"}]],["g",{"id":"vmu-9"},["path",{"d":"m0,0 0,20 3,0 C 7,10 10,0 20,0","class":"s14"}],["path",{"d":"m0,20 3,0 C 7,10 10,0 20,0","class":"s1"}],["path",{"d":"M0,0 20,0","class":"s1"}]],["g",{"id":"vmz-9"},["path",{"d":"M0,0 3,0 C 10,10 15,10 20,10 15,10 10,10 3,20 L 0,20","class":"s14"}],["path",{"d":"m0,0 3,0 c 7,10 12,10 17,10","class":"s1"}],["path",{"d":"m0,20 3,0 C 10,10 15,10 20,10","class":"s1"}]],["g",{"id":"vmv-2-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-2"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s7"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-3"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s8"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-4"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s9"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-5"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s10"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-6"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s11"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-7"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s12"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-8"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s13"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-2-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s7"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-3-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s8"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-4-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s9"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-5-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s10"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-6-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s11"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-7-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s12"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-8-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s13"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"vmv-9-9"},["path",{"d":"M9,0 20,0 20,20 9,20 6,10 z","class":"s14"}],["path",{"d":"M3,0 0,0 0,20 3,20 6,10 z","class":"s14"}],["path",{"d":"m0,0 3,0 6,20 11,0","class":"s1"}],["path",{"d":"M0,20 3,20 9,0 20,0","class":"s1"}]],["g",{"id":"arrow0"},["path",{"d":"m-12,-3 9,3 -9,3 c 1,-2 1,-4 0,-6 z","class":"s15"}],["path",{"d":"M0,0 -15,0","class":"s16"}]],["marker",{"id":"arrowhead","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"0 -4 11 8","refX":"15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 11 0 0 4z"}]],["marker",{"id":"arrowtail","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"-11 -4 11 8","refX":"-15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 -11 0 0 4z"}]]],["g",{"id":"waves"},["g",{"id":"lanes"}],["g",{"id":"groups"}]]];
try { module.exports = WaveSkin; } catch(err) {}


},{}],80:[function(require,module,exports){
var WaveSkin=WaveSkin||{};WaveSkin.narrow=["svg",{"id":"svg","xmlns":"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink","height":"0"},["style",{"type":"text/css"},"text{font-size:11pt;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;text-align:center;fill-opacity:1;font-family:Helvetica}.muted{fill:#aaa}.warning{fill:#f6b900}.error{fill:#f60000}.info{fill:#0041c4}.success{fill:#00ab00}.h1{font-size:33pt;font-weight:bold}.h2{font-size:27pt;font-weight:bold}.h3{font-size:20pt;font-weight:bold}.h4{font-size:14pt;font-weight:bold}.h5{font-size:11pt;font-weight:bold}.h6{font-size:8pt;font-weight:bold}.s1{fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s2{fill:none;stroke:#000000;stroke-width:0.5;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none}.s3{color:#000000;fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:1, 3;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s4{color:#000000;fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible}.s5{fill:#ffffff;stroke:none}.s6{fill:#000000;fill-opacity:1;stroke:none}.s7{color:#000000;fill:#fff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s8{color:#000000;fill:#ffffb4;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s9{color:#000000;fill:#ffe0b9;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s10{color:#000000;fill:#b9e0ff;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s11{color:#000000;fill:#ccfdfe;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s12{color:#000000;fill:#cdfdc5;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s13{color:#000000;fill:#f0c1fb;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}.s14{color:#000000;fill:#f5c2c0;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1px;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate}"],["defs",["g",{"id":"socket"},["rect",{"y":"15","x":"4","height":"20","width":"10"}]],["g",{"id":"pclk"},["path",{"d":"M 0,20 0,0 10,0","class":"s1"}]],["g",{"id":"nclk"},["path",{"d":"m 0,0 0,20 10,0","class":"s1"}]],["g",{"id":"000"},["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"0m0"},["path",{"d":"m 0,20 1,0 3,-10 3,10 3,0","class":"s1"}]],["g",{"id":"0m1"},["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"0mx"},["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 5,20","class":"s2"}],["path",{"d":"M 10,10 2,18","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"0md"},["path",{"d":"m 1,20 9,0","class":"s3"}],["path",{"d":"m 0,20 1,0","class":"s1"}]],["g",{"id":"0mu"},["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}]],["g",{"id":"0mz"},["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"111"},["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"1m0"},["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}]],["g",{"id":"1m1"},["path",{"d":"M 0,0 1,0 4,10 7,0 10,0","class":"s1"}]],["g",{"id":"1mx"},["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4.5,10.5","class":"s2"}],["path",{"d":"M 10,0 3,7","class":"s2"}],["path",{"d":"M 2,3 5,0","class":"s2"}]],["g",{"id":"1md"},["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}]],["g",{"id":"1mu"},["path",{"d":"M 0,0 1,0","class":"s1"}],["path",{"d":"m 1,0 9,0","class":"s3"}]],["g",{"id":"1mz"},["path",{"d":"m 0,0 1,0 c 2,4 6,10 9,10","class":"s1"}]],["g",{"id":"xxx"},["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 10,0","class":"s2"}],["path",{"d":"M 0,15 10,5","class":"s2"}],["path",{"d":"M 0,20 10,10","class":"s2"}],["path",{"d":"m 5,20 5,-5","class":"s2"}]],["g",{"id":"xm0"},["path",{"d":"M 0,0 1,0 7,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 4,11","class":"s2"}],["path",{"d":"M 0,20 5,15","class":"s2"}],["path",{"d":"M 5,20 6,19","class":"s2"}]],["g",{"id":"xm1"},["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 6,4","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"xmx"},["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 10,0","class":"s2"}],["path",{"d":"M 0,15 10,5","class":"s2"}],["path",{"d":"M 0,20 10,10","class":"s2"}],["path",{"d":"m 5,20 5,-5","class":"s2"}]],["g",{"id":"xmd"},["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,5 1.5,3.5","class":"s2"}],["path",{"d":"M 0,10 2.5,7.5","class":"s2"}],["path",{"d":"M 0,15 3.5,11.5","class":"s2"}],["path",{"d":"M 0,20 5,15","class":"s2"}],["path",{"d":"M 5,20 7,18","class":"s2"}]],["g",{"id":"xmu"},["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,5 5,0","class":"s2"}],["path",{"d":"M 0,10 5,5","class":"s2"}],["path",{"d":"M 0,15 2,13","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"xmz"},["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 4,6","class":"s2"}],["path",{"d":"m 0,15.5 6,-7","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"ddd"},["path",{"d":"m 0,20 10,0","class":"s3"}]],["g",{"id":"dm0"},["path",{"d":"m 0,20 7,0","class":"s3"}],["path",{"d":"m 7,20 3,0","class":"s1"}]],["g",{"id":"dm1"},["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"dmx"},["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 5,20","class":"s2"}],["path",{"d":"M 10,10 1.5,18.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"dmd"},["path",{"d":"m 0,20 10,0","class":"s3"}]],["g",{"id":"dmu"},["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}]],["g",{"id":"dmz"},["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"uuu"},["path",{"d":"M 0,0 10,0","class":"s3"}]],["g",{"id":"um0"},["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}]],["g",{"id":"um1"},["path",{"d":"M 0,0 7,0","class":"s3"}],["path",{"d":"m 7,0 3,0","class":"s1"}]],["g",{"id":"umx"},["path",{"d":"M 1.4771574,0 7,20 l 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4.5,10.5","class":"s2"}],["path",{"d":"M 10,0 3.5,6.5","class":"s2"}],["path",{"d":"M 2.463621,2.536379 5,0","class":"s2"}]],["g",{"id":"umd"},["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}]],["g",{"id":"umu"},["path",{"d":"M 0,0 10,0","class":"s3"}]],["g",{"id":"umz"},["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s4"}]],["g",{"id":"zzz"},["path",{"d":"m 0,10 10,0","class":"s1"}]],["g",{"id":"zm0"},["path",{"d":"m 0,10 1,0 4,10 5,0","class":"s1"}]],["g",{"id":"zm1"},["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"zmx"},["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}],["path",{"d":"M 10,15 5,20","class":"s2"}],["path",{"d":"M 10,10 4,16","class":"s2"}],["path",{"d":"M 10,5 2.5,12.5","class":"s2"}],["path",{"d":"M 10,0 2,8","class":"s2"}]],["g",{"id":"zmd"},["path",{"d":"m 0,10 1,0 c 2,6 6,10 9,10","class":"s1"}]],["g",{"id":"zmu"},["path",{"d":"m 0,10 1,0 C 3,4 7,0 10,0","class":"s1"}]],["g",{"id":"zmz"},["path",{"d":"m 0,10 10,0","class":"s1"}]],["g",{"id":"gap"},["path",{"d":"m 7,-2 -4,0 c -5,0 -5,24 -10,24 l 4,0 C 2,22 2,-2 7,-2 z","class":"s5"}],["path",{"d":"M -7,22 C -2,22 -2,-2 3,-2","class":"s1"}],["path",{"d":"M -3,22 C 2,22 2,-2 7,-2","class":"s1"}]],["g",{"id":"Pclk"},["path",{"d":"M -3,12 0,3 3,12 C 1,11 -1,11 -3,12 z","class":"s6"}],["path",{"d":"M 0,20 0,0 10,0","class":"s1"}]],["g",{"id":"Nclk"},["path",{"d":"M -3,8 0,17 3,8 C 1,9 -1,9 -3,8 z","class":"s6"}],["path",{"d":"m 0,0 0,20 10,0","class":"s1"}]],["g",{"id":"0mv-2"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s7"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-2"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s7"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-2"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s7"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-2"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s7"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-2"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s7"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-2"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s7"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-2"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s7"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-2"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s7"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-2"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-2"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s7"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-2"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s7"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-2"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s7"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-3"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s8"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-3"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s8"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-3"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s8"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-3"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s8"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-3"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s8"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-3"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s8"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-3"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s8"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-3"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s8"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-3"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-3"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s8"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-3"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s8"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-3"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s8"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-4"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s9"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-4"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s9"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-4"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s9"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-4"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s9"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-4"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s9"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-4"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s9"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-4"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s9"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-4"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s9"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-4"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-4"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s9"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-4"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s9"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-4"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s9"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-5"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s10"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-5"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s10"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-5"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s10"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-5"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s10"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-5"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s10"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-5"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s10"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-5"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s10"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-5"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s10"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-5"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-5"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s10"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-5"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s10"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-5"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s10"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-6"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s11"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-6"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s11"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-6"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s11"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-6"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s11"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-6"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s11"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-6"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s11"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-6"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s11"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-6"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s11"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-6"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-6"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s11"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-6"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s11"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-6"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s11"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-7"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s12"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-7"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s12"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-7"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s12"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-7"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s12"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-7"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s12"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-7"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s12"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-7"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s12"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-7"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s12"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-7"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-7"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s12"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-7"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s12"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-7"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s12"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-8"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s13"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-8"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s13"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-8"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s13"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-8"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s13"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-8"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s13"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-8"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s13"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-8"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s13"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-8"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s13"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-8"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-8"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s13"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-8"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s13"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-8"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s13"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"0mv-9"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s14"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"1mv-9"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s14"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"xmv-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,5 2,3","class":"s2"}],["path",{"d":"M 0,10 3,7","class":"s2"}],["path",{"d":"M 0,15 3,12","class":"s2"}],["path",{"d":"M 0,20 1,19","class":"s2"}]],["g",{"id":"dmv-9"},["path",{"d":"m 7,0 3,0 0,20 -9,0 z","class":"s14"}],["path",{"d":"M 1,20 7,0 10,0","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"umv-9"},["path",{"d":"m 1,0 9,0 0,20 -3,0 z","class":"s14"}],["path",{"d":"m 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"zmv-9"},["path",{"d":"M 5,0 10,0 10,20 5,20 1,10 z","class":"s14"}],["path",{"d":"m 1,10 4,10 5,0","class":"s1"}],["path",{"d":"M 0,10 1,10 5,0 10,0","class":"s1"}]],["g",{"id":"vvv-9"},["path",{"d":"M 10,20 0,20 0,0 10,0","class":"s14"}],["path",{"d":"m 0,20 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vm0-9"},["path",{"d":"m 0,20 0,-20 1.000687,-0.00391 6,20","class":"s14"}],["path",{"d":"m 0,0 1.000687,-0.00391 6,20","class":"s1"}],["path",{"d":"m 0,20 10.000687,-0.0039","class":"s1"}]],["g",{"id":"vm1-9"},["path",{"d":"M 0,0 0,20 1,20 7,0","class":"s14"}],["path",{"d":"M 0,0 10,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0","class":"s1"}]],["g",{"id":"vmx-9"},["path",{"d":"M 0,0 0,20 1,20 4,10 1,0","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}],["path",{"d":"M 10,15 6.5,18.5","class":"s2"}],["path",{"d":"M 10,10 5.5,14.5","class":"s2"}],["path",{"d":"M 10,5 4,11","class":"s2"}],["path",{"d":"M 10,0 6,4","class":"s2"}]],["g",{"id":"vmd-9"},["path",{"d":"m 0,0 0,20 10,0 C 5,20 2,7 1,0","class":"s14"}],["path",{"d":"m 0,0 1,0 c 1,7 4,20 9,20","class":"s1"}],["path",{"d":"m 0,20 10,0","class":"s1"}]],["g",{"id":"vmu-9"},["path",{"d":"m 0,0 0,20 1,0 C 2,13 5,0 10,0","class":"s14"}],["path",{"d":"m 0,20 1,0 C 2,13 5,0 10,0","class":"s1"}],["path",{"d":"M 0,0 10,0","class":"s1"}]],["g",{"id":"vmz-9"},["path",{"d":"M 0,0 1,0 C 3,6 7,10 10,10 7,10 3,14 1,20 L 0,20","class":"s14"}],["path",{"d":"m 0,0 1,0 c 2,6 6,10 9,10","class":"s1"}],["path",{"d":"m 0,20 1,0 C 3,14 7,10 10,10","class":"s1"}]],["g",{"id":"vmv-2-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-2"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s7"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-3"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s8"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-4"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s9"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-5"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s10"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-6"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s11"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-7"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s12"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-8"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s13"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-2-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s7"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-3-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s8"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-4-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s9"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-5-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s10"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-6-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s11"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-7-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s12"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-8-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s13"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["g",{"id":"vmv-9-9"},["path",{"d":"M 7,0 10,0 10,20 7,20 4,10 z","class":"s14"}],["path",{"d":"M 1,0 0,0 0,20 1,20 4,10 z","class":"s14"}],["path",{"d":"m 0,0 1,0 6,20 3,0","class":"s1"}],["path",{"d":"M 0,20 1,20 7,0 10,0","class":"s1"}]],["marker",{"id":"arrowhead","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"0 -4 11 8","refX":"15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 11 0 0 4z"}]],["marker",{"id":"arrowtail","style":"fill:#0041c4","markerHeight":"7","markerWidth":"10","markerUnits":"strokeWidth","viewBox":"-11 -4 11 8","refX":"-15","refY":"0","orient":"auto"},["path",{"d":"M0 -4 -11 0 0 4z"}]]],["g",{"id":"waves"},["g",{"id":"lanes"}],["g",{"id":"groups"}]]];
try { module.exports = WaveSkin; } catch(err) {}


},{}],81:[function(require,module,exports){

var bitfield = require("./shapes/bitfield.js")
var wavedrom = require("./shapes/wavedrom.js")
var entity = require("./shapes/entity.js")
var bus = require("./shapes/bus.js")

// export ui for debugging
Draw.loadPlugin(function(ui){window.ui=ui;});



Sidebar.prototype.addRTLPalette = function() {
  var BitfieldTxt = `[
{ "name": "D", "bits": 1, "attr": "", "type":6 },
{ "name": "L", "bits": 1, "attr": "", "type":5 },
{ "name": "E", "bits": 1, "attr": "", "type":4 },
{ "name": "I", "bits": 1, "attr": "", "type":3 },
{ "name": "F", "bits": 1, "attr": "", "type":2 },
{ "name": "T", "bits": 1, "attr": "", "type":1 },
{ "name": "I", "bits": 1, "attr": "", "type":0 },
{ "name": "B", "bits": 1, "attr": "" }
]`;
	var WavedromTxt = `{ "signal": [{ "name": "Alfa", "wave": "01.zx=ud.23.456789" }] }`
  this.addPaletteFunctions('rtl','RTL', true, [
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=left;strokeWidth=1;shape=mxgraph.rtl.abstract.bitfield;labelBackgroundColor=#ffffff;noLabel=1;',  300, 75, BitfieldTxt, 'Bitfield', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'bitfield', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=left;strokeWidth=1;shape=mxgraph.rtl.abstract.wavedrom;labelBackgroundColor=#ffffff;noLabel=1;',  800, 40, WavedromTxt, 'Wavedrom', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'wavedrom', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;strokeColor=none;noLabel=1;snapToPoint=1;perimeter=none;resizable=0;rotatable=0;',  5, 5, '', 'Junction point', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'junction', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;container=1;collapsible=0;kind=mux;drawPins=0;left=4;right=1;bottom=0;',  30, 100, '', 'Mux', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'entity', 'mux ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;container=1;collapsible=0;kind=demux;drawPins=0;left=1;right=4;bottom=0;',  30, 100, '', 'DeMux', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'entity', 'demux ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;container=1;collapsible=0;kind=crossbar;drawPins=0;left=4;right=4;bottom=0;',  60, 100, '', 'Crossbar', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'entity', 'crossbar ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;container=1;collapsible=0;kind=combinational;drawPins=0;left=2;right=1;bottom=0;top=0;',  60, 100, '', 'Combinational Logic', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'entity', 'combinational ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;container=1;collapsible=0;',  80, 120, 'Entity', 'Entity', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'entity', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;left=,:clk;right=,:np;top=0;bottom=0;drawPins=0;snapToPoint=1;resizable=0;editable=1;',  40, 60, '', 'Register', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'reg', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=1;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '1', 'NOT', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'not', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=1;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '&', 'AND', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'and', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '&', 'NAND', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'nand', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=1;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '≥1', 'OR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'or', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '≥1', 'NOR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'nor', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=1;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '=1', 'XOR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'xor', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '=1', 'XNOR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'xnor', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=2;shape=mxgraph.rtl.abstract.bus;labelPosition=center;verticalLabelPosition=top;verticalAlign=bottom;',  10, 80, 'Bus', 'Bus', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'bus', 'rtl ').join(' '))
  ]);
}
  
Draw.loadPlugin(function(ui) {
  // Adds custom sidebar entry
  ui.sidebar.addRTLPalette();
});

},{"./shapes/bitfield.js":82,"./shapes/bus.js":83,"./shapes/entity.js":84,"./shapes/wavedrom.js":85}],82:[function(require,module,exports){
var render = require('bit-field/lib/render');
var onml = require('onml');
/**
* Extends mxShape.
*/
function mxShapeRTLBitfield(bounds, fill, stroke, strokewidth) {
	mxShape.call(this);
	this.bounds = bounds;
	this.image = '';
	this.error = '';
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.shadow = false;
};
/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLBitfield, mxImageShape);

mxShapeRTLBitfield.prototype.cst = {
	SHAPE_BITFIELD: 'mxgraph.rtl.abstract.bitfield'
};

mxShapeRTLBitfield.prototype.customProperties = [
	{ name: 'vspace', dispName: 'Vertical Space', type: 'int', min: 1, max: 2000, defVal: 80 },
	{ name: 'hspace', dispName: 'Horizontal Space', type: 'int', min: 1, max: 2000, defVal: 320 },
	{ name: 'lanes', dispName: 'Number of Lanes', type: 'int', min:1, max:1024, defVal: 1 },
	{ name: 'bits', dispName: 'Number of Fields', type: 'int', min:1, max:1024, defVal: 8 },
	{ name: 'compact', dispName: 'Compact', type: 'boolean', defVal: false },
	{ name: 'bigendian', dispName: 'Big Endian', type: 'boolean', defVal: false },
];

mxShapeRTLBitfield.prototype.updateImage = function () {
	var vspace = parseInt(mxUtils.getValue(this.style, 'vspace', '80'));
	var hspace = parseInt(mxUtils.getValue(this.style, 'hspace', '320'));
	var lanes  = parseInt(mxUtils.getValue(this.style, 'lanes', '1'));
	var bits   = parseInt(mxUtils.getValue(this.style, 'bits', '8'));
	var compact = mxUtils.getValue(this.style, 'compact', false);
	var bigendian = mxUtils.getValue(this.style, 'bigendian', false);

	var options = {
		vspace:vspace,
		hspace:hspace,
		lanes:lanes,
		bits:bits,
		compact:compact,
		bigendian:bigendian,
		fontsize:this.style.fontSize,
		fontfamily:this.style.fontFamily,
	}
	
	try {
		var jsonml = render(JSON.parse(this.state.cell.value),options);
		this.image = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(onml.stringify(jsonml))));
		this.error = '';
	} catch (err) {
		this.error = err.message;
	}
}

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/
mxShapeRTLBitfield.prototype.paintVertexShape = function (c, x, y, w, h) {
	if (!this.image) {
		this.updateImage();
	}
	try {
		if (!this.error) {
			c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
		}
	} catch (err) {
		this.error = err.message;
	}
	if (this.error) {
		c.text(x, y, w, h, this.error, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, true, 'html', 0, 0, 0);
		c.stroke();
	}
	window.c = c;
	this.state.cell.valueChanged = (value) => { var lastValue = mxCell.prototype.valueChanged.call(this.state.cell, value); this.updateImage(); this.redraw(); return lastValue; }
}

mxCellRenderer.registerShape(mxShapeRTLBitfield.prototype.cst.SHAPE_BITFIELD, mxShapeRTLBitfield);

mxShapeRTLBitfield.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	return constr;
}

},{"bit-field/lib/render":2,"onml":12}],83:[function(require,module,exports){

	// PartialRectangleShape
function mxShapeRTLBus(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxShapeRTLBus, mxShape);

mxShapeRTLBus.prototype.cst = {
	SHAPE_BUS : 'mxgraph.rtl.abstract.bus'
};
mxCellRenderer.registerShape(mxShapeRTLBus.prototype.cst.SHAPE_BUS, mxShapeRTLBus);

mxShapeRTLBus.prototype.customProperties = [
	{name: 'left', dispName: 'Ports left', type: 'int', min:1, max:8, defVal:2},
	{name: 'right', dispName: 'Ports right', type: 'int', min:1, max:8, defVal:2}
];


mxShapeRTLBus.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x,y);
	c.begin();
	c.moveTo(0,0);
	c.lineTo(0,h);
	c.moveTo(w,0);
	c.lineTo(w,h);
	c.end();
	c.stroke();
};

mxShapeRTLBus.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var left = parseInt(mxUtils.getValue(this.style, 'left', '2'));
	var right = parseInt(mxUtils.getValue(this.style, 'right', '2'));
	
	spacing = h / (left+1);	
	for (var i = 1; i <= left; i++)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, i*spacing/h), false, null, 0, 0));
	}
	spacing = h / (right+1);	
	for (var i = 1; i <= right; i++)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(1, i*spacing/h), false, null, 0, 0));
	}

	return (constr);
}

},{}],84:[function(require,module,exports){
var calculateSize = require("calculate-size");

//**********************************************************************************************************************************************************
//Entity
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeRTLEntity(bounds, fill, stroke, strokewidth) {
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};
/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLEntity, mxShape);

mxShapeRTLEntity.prototype.cst = {
	SHAPE_ENTITY: 'mxgraph.rtl.abstract.entity'
};

mxShapeRTLEntity.prototype.customProperties = [
	{
		name: 'kind', dispName: 'Type', type: 'enum', defVal: 'sequential',
		enumList: [
			{ val: 'sequential', dispName: 'Seq. Logic' },
			{ val: 'combinational', dispName: 'Comb. Logic' },
			{ val: 'mux', dispName: 'Mux' },
			{ val: 'demux', dispName: 'Demux' },
			{ val: 'crossbar', dispName: 'Crossbar' }
		]
	},
	{
		name: 'type', dispName: 'Type Symbol', type: 'enum', defVal: 'none',
		enumList: [
			{ val: 'none', dispName: 'None' },
			{ val: 'shiftReg', dispName: 'Shift Register' },
			{ val: 'fifo', dispName: 'Fifo / Queue' },
			{ val: 'ram', dispName: 'RAM' },
			{ val: 'stack', dispName: 'Stack' },
			{ val: 'ringbuffer', dispName: 'Ringbuffer' },
			{ val: 'tree', dispName: 'Tree' },
			{ val: 'fsm', dispName: 'FSM' }
		]
	},
	{
		name: 'type_loc', dispName: 'Type Symbol Location', type: 'enum', defVal: 'topLeft',
		enumList: [
			{ val: 'topLeft', dispName: 'Top Left' },
			{ val: 'top', dispName: 'Top Center' },
			{ val: 'topRight', dispName: 'Top Right' },
			{ val: 'center', dispName: 'Center' },
			{ val: 'bottomLeft', dispName: 'Bottom Left' },
			{ val: 'bottom', dispName: 'Bottom Center' },
			{ val: 'bottomRight', dispName: 'Bottom Right' }
		]
	},
	{ name: 'type_size', dispName: 'Symbol size', type: 'int', min: 1, max: 1000, defVal: 30 },
	{ name: 'left', dispName: 'Ports left', type: 'string', defVal: "3" },
	{ name: 'right', dispName: 'Ports right', type: 'string', defVal: "2" },
	{ name: 'top', dispName: 'Ports top', type: 'string', defVal: "1" },
	{ name: 'bottom', dispName: 'Ports bottom', type: 'string', defVal: "1" },
	{ name: 'drawPins', dispName: 'Draw Pins', type: 'bool', defVal: false },
	{ name: 'pinFontSize', dispName: 'Pin Fontsize', type: 'int', min: 1, max: 1000, defVal: 12 }
];

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/

function parsePinString(string) {
	var res = [];
	if (String(string).indexOf(",") != -1 || isNaN(parseInt(string))) {
		string.split(",").forEach(function (kv) {
			var tmp = kv.split(":");
			var pin = { name: tmp[0]};
			pin.draw  = true;
			pin.clock = false;
			pin.neg   = false;
			pin.in    = false;
			pin.out   = false;
			pin.inout = false;
			pin.notConnected = false;
			for( var i = 1; i < tmp.length; i++) {
				switch(tmp[i]) {
					case "no":
					case "np":
					case "nopin":
						pin.draw = false;
						break;
					case "nc":
						pin.notConnected = true;
						break;
					case "n":
					case "neg":
					case "not":
						pin.neg = true;
						break;
					case "c":
					case "clk":
					case "clock":
						pin.clock = true;
						break;
					case "nclk":
					case "nclock":
						pin.clock = true;
						pin.neg = true;
						break;
					case "i":
					case "in":
						pin.in  = true;
						pin.out = false;
						break;
					case "o":
					case "out":
						pin.in  = false;
						pin.out = true;
						break;
					case "io":
					case "inout":
						pin.in  = false;
						pin.out = false;
						pin.inout = true;
						break;
				}
			}
			res.push(pin);
		});
	} else {
		for (var i = 0; i < parseInt(string); i++) {
			res.push({ name: "", draw:true });
		}
	}
	return res;
}

mxShapeRTLEntity.prototype.calcTopY = function (x) { return padding; }
mxShapeRTLEntity.prototype.calcBottomY = function (x) { return h - padding; }
mxShapeRTLEntity.prototype.calcLeftX = function (y) { return padding; }
mxShapeRTLEntity.prototype.calcRightX = function (y) { return w - padding; }

mxShapeRTLEntity.prototype.paintBackground = function (c, x, y, w, h) {
	window.c = c;
	window.t = this;
	c.translate(x, y);
	var leftPins = parsePinString(mxUtils.getValue(this.style, 'left', '3'));
	var rightPins = parsePinString(mxUtils.getValue(this.style, 'right', '2'));
	var topPins = parsePinString(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPins = parsePinString(mxUtils.getValue(this.style, 'bottom', '1'));
	var type = mxUtils.getValue(this.style, 'type', 'none');
	var kind = mxUtils.getValue(this.style, 'kind', 'sequential');
	var type_loc = mxUtils.getValue(this.style, 'type_loc', 'topLeft');
	var type_size = mxUtils.getValue(this.style, 'type_size', '30');
	var drawPins = mxUtils.getValue(this.style, 'drawPins', false);
	var padding = drawPins * 10;
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	var pinFontSize = parseFloat(mxUtils.getValue(this.style, 'pinFontSize', '12'));
	//c.setFontSize(fontSize * 0.5);
	var fontColor = mxUtils.getValue(this.style, 'fontColor', '#000000');
	c.setFontColor(fontColor);
	var dir = mxUtils.getValue(this.style, 'direction', 'east');
	var txtRot = 0;

	var selectorPins = 1;
	var operation = 'mux';

	switch (dir) {
		case 'south':
			txtRot = 270;
			break;
		case 'west':
			txtRot = 180;
			break;
		case 'north':
			txtRot = 90;
			break;
	}

	this.calcTopY = function (x) { return padding; }
	this.calcBottomY = function (x) { return h - padding; }
	this.calcLeftX = function (y) { return padding; }
	this.calcRightX = function (y) { return w - padding; }

	switch (kind) {
		case 'mux':
			this.calcTopY = function (x) { return (x - padding)*0.75 + padding }
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'combinational':
			this.calcTopY = function (x) { return h / 2 - ((h - 2 * padding) / 2) / ((w - 2 * padding) / 2) * Math.sqrt(Math.pow((w - 2 * padding) / 2, 2) - Math.pow(x - w / 2, 2)); }
			this.calcBottomY = function (x) { return h - this.calcTopY(x); }
			this.calcLeftX = function (y) { return w / 2 - ((w - 2 * padding) / 2) / ((h - 2 * padding) / 2) * Math.sqrt(Math.pow((h - 2 * padding) / 2, 2) - Math.pow(y - h / 2, 2)); }
			this.calcRightX = function (y) { return w - this.calcLeftX(y); }
			break;
		case 'demux':
			this.calcTopY = function (x) { return (x - padding) * (-(0.2 * h - padding) / (w - 2 * padding)) + 0.2 * h }
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'crossbar':
			this.calcTopY = function (x) {
				if (x < w / 2) {
					return (x - padding) * (0.4 * h - padding) / (w - 2 * padding) + padding
				} else {
					return (x - padding) * (-(0.4 * h - padding) / (w - 2 * padding)) + 0.4 * h
				}
			}
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'sequential':
		default:
			break;
	}

	switch (kind) {
		case 'mux':
			c.begin();
			c.moveTo(padding, this.calcTopY(padding));
			c.lineTo(w - padding, this.calcTopY(w - padding));
			c.lineTo(w - padding, this.calcBottomY(w - padding));
			c.lineTo(padding, this.calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			break;
		case 'combinational':
			c.ellipse(padding, padding, w - 2 * padding, h - 2 * padding);
			c.fillAndStroke();
			break;
		case 'demux':
			c.begin();
			c.moveTo(padding, this.calcTopY(padding));
			c.lineTo(w - padding, this.calcTopY(w - padding));
			c.lineTo(w - padding, this.calcBottomY(w - padding));
			c.lineTo(padding, this.calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			break;
		case 'crossbar':
			c.begin();
			c.moveTo(padding, this.calcTopY(padding));
			c.lineTo(w / 2, this.calcTopY(w / 2));
			c.lineTo(w - padding, this.calcTopY(w - padding));
			c.lineTo(w - padding, this.calcBottomY(w - padding));
			c.lineTo(w / 2, this.calcBottomY(w / 2));
			c.lineTo(padding, this.calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			c.begin();
			c.moveTo(w / 2, this.calcTopY(w / 2));
			c.lineTo(w / 2, this.calcBottomY(w / 2));
			c.end();
			c.stroke()
			break;
		case 'sequential':
		default:
			c.begin();
			c.rect(padding, padding, w - 2 * padding, h - 2 * padding);
			c.fillAndStroke();
			break;
	}

	const fontFamily = this.style.fontFamily;
	const fillColor  = this.style.fillColor;
	spacing = h / (leftPins.length + 1);
	pinY = spacing;
	leftPins.forEach((p) => {
		drawPin(p, 0, pinY, 0, this.calcLeftX(pinY), type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinY += spacing;
	});

	spacing = h / (rightPins.length + 1);
	pinY = spacing;
	rightPins.forEach((p) => {
		drawPin(p, w, pinY, 180, w - this.calcRightX(pinY), type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinY += spacing;
	});

	spacing = w / (topPins.length + 1);
	pinX = spacing;
	topPins.forEach((p) => {
		drawPin(p, pinX, 0, 90, this.calcTopY(pinX), type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinX += spacing;
	});

	spacing = w / (bottomPins.length + 1);
	pinX = spacing;
	bottomPins.forEach((p) => {
		drawPin(p, pinX, h, 270, h - this.calcBottomY(pinX), type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinX += spacing;
	});

	var offsetX = 0;
	var offsetY = 0;
	switch (type_loc) {
		case 'top':
			offsetX = w / 2;
			offsetY = 5 + type_size / 2 + padding;
			break;
		case 'topLeft':
			offsetX = 5 + type_size / 2 + padding;
			offsetY = 5 + type_size / 2 + padding;
			break;
		case 'topRight':
			offsetX = w - 5 - type_size / 2 - padding;
			offsetY = 5 + type_size / 2 + padding;
			break;
		case 'center':
			offsetX = w / 2;
			offsetY = h / 2;
			break;
		case 'bottomLeft':
			offsetX = 5 + type_size / 2 + padding;
			offsetY = h - 5 - type_size / 2 - padding;
			break;
		case 'bottom':
			offsetX = w / 2;
			offsetY = h - 5 - type_size / 2 - padding;
			break;
		case 'bottomRight':
			offsetX = w - 5 - type_size / 2 - padding;
			offsetY = h - 5 - type_size / 2 - padding;
			break;
		default:
			break;
	};

	switch (type) {
		case 'shiftReg': symbolRTLShiftReg(c, offsetX, offsetY, type_size); break;
		case 'fifo': symbolRTLFifo(c, offsetX, offsetY, type_size); break;
		case 'ram': symbolRTLRAM(c, offsetX, offsetY, type_size); break;
		case 'stack': symbolRTLStack(c, offsetX, offsetY, type_size); break;
		case 'ringbuffer': symbolRTLRingBuffer(c, offsetX, offsetY, type_size); break;
		case 'tree': symbolRTLTree(c, offsetX, offsetY, type_size); break;
		case 'fsm': symbolRTLFSM(c, offsetX, offsetY, type_size); break;
		case 'none':
		default:
			break;
	};
};

function drawPin(pin, x, y, rot, padding, size, drawPins, fontFamily, fontSize, fillColor) {
	c.translate(x, y);
	c.rotate(rot, 0, 0, 0, 0);
	var txtOffset = 0;
	if (pin.draw && drawPins) {
		c.begin();
		c.moveTo(0, 0);
		if (pin.neg) {
			c.lineTo(padding - size/6, 0);
		} else {
			c.lineTo(padding, 0);
		}
		c.stroke();
	}
	if (pin.clock) {
		c.begin();
		c.moveTo(padding, 0 - size / 4);
		c.lineTo(padding + size / 4, 0);
		c.lineTo(padding, 0 + size / 4);
		c.stroke();
		txtOffset += size/4;
	}
	if (pin.neg && pin.draw && drawPins) {
		c.ellipse(padding - size / 6, -size / 12, size / 6, size / 6);
		c.fillAndStroke();
	}
	if (pin.out && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding-8,0);
		c.lineTo(padding-3,2);
		c.lineTo(padding-3,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.in && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding-8, 2);
		c.lineTo(padding-3,0);
		c.lineTo(padding-8,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.inout && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding-9, 0);
		c.lineTo(padding-6,2);
		c.lineTo(padding-6,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.begin();
		c.moveTo(padding-4, 2);
		c.lineTo(padding-1, 0);
		c.lineTo(padding-4,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.notConnected && pin.draw) {
		c.begin();
		c.moveTo(0 - size / 8, 0 - size / 8);
		c.lineTo(0 + size / 8, 0 + size / 8);
		c.moveTo(0 - size / 8, 0 + size / 8);
		c.lineTo(0 + size / 8, 0 - size / 8);
		c.stroke();
	}
	c.setFontFamily(fontFamily);
	c.setFontSize(fontSize);
	switch (rot) {
		case 0:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
		case 180:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 180);
			break;
		case 90:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
		case 270:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
	}
	c.rotate(-rot, 0, 0, 0, 0);
	c.translate(-x, -y);
	c.end();
}

function symbolRTLShiftReg(c, x, y, size) {
	var height = 3 * size / 5;
	var width = height / 2;
	x -= width / 2;
	y -= height / 2;
	c.begin()
	c.rect(x + width / 2, y - height / 4, width, height);
	c.fillAndStroke();
	c.rect(x, y, width, height);
	c.fillAndStroke();
	c.rect(x - width / 2, y + height / 4, width, height);
	c.fillAndStroke();
	c.end();
}

function symbolRTLFifo(c, x, y, size) {
	var height = 3 * size / 4;
	var width = height / 5;
	c.begin()
	c.moveTo(x - size / 2, y - size / 4);
	c.lineTo(x - size / 2, y - size / 2);
	c.lineTo(x + size / 2, y - size / 2);
	c.lineTo(x + size / 2, y - size / 4);

	c.moveTo(x - size / 2, y + size / 4);
	c.lineTo(x - size / 2, y + size / 2);
	c.lineTo(x + size / 2, y + size / 2);
	c.lineTo(x + size / 2, y + size / 4);
	c.stroke();

	c.rect(x + size / 2 - width / 4 - 3 * width / 2, y - height / 2, width, height);
	c.stroke();
	c.rect(x + size / 2 - width / 4 - 6 * width / 2, y - height / 2, width, height);
	c.stroke();
	c.rect(x + size / 2 - width / 4 - 9 * width / 2, y - height / 2, width, height);
	c.stroke();
	c.end()
}

function symbolRTLStack(c, x, y, size) {
	var width = 3 * size / 4;
	var height = width / 5;
	c.begin()
	c.moveTo(x - size / 4, y - size / 2);
	c.lineTo(x - size / 2, y - size / 2);
	c.lineTo(x - size / 2, y + size / 2);
	c.lineTo(x + size / 2, y + size / 2);
	c.lineTo(x + size / 2, y - size / 2);
	c.lineTo(x + size / 4, y - size / 2);
	c.stroke();

	c.rect(x - width / 2, y + size / 2 - height / 4 - 3 * height / 2, width, height);
	c.stroke();
	c.rect(x - width / 2, y + size / 2 - height / 4 - 6 * height / 2, width, height);
	c.stroke();
	c.rect(x - width / 2, y + size / 2 - height / 4 - 9 * height / 2, width, height);
	c.stroke();
	c.end()
}

function symbolRTLRAM(c, x, y, size) {
	var width = size;
	var height = width / 5;
	c.begin()
	c.rect(x - width / 2, y - size / 2, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + height, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + 2 * height, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + 3 * height, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + 4 * height, width, height);
	c.stroke();
	c.end()
	c.begin();
	c.moveTo(x - size / 4, y - size / 2);
	c.lineTo(x - size / 4, y + size / 2);
	c.stroke();
	c.end()
}

function symbolRTLRingBuffer(c, x, y, size) {
	var height = 3 * size / 5;
	var width = height / 2;
	x -= width / 2;
	y -= size / 2;
	c.begin()
	c.rect(x, y, width, height);
	c.fillAndStroke();
	c.rect(x - 7 * width / 8, y + 1 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x + 7 * width / 8, y + 1 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x - 11 * width / 8, y + 2 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x + 11 * width / 8, y + 2 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x - 7 * width / 8, y + 4 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x + 7 * width / 8, y + 4 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x, y + 5 * size / 16, width, height);
	c.fillAndStroke();
	c.end();
}

function symbolRTLTree(c, x, y, size) {
	var r = size / 8;
	var d = size / 5;
	y -= 1.5 * d;
	x += r / 2;
	y += r / 2;
	c.begin()
	c.moveTo(x, y);
	c.lineTo(x + d, y + d);
	c.moveTo(x, y);
	c.lineTo(x - d, y + d);
	c.moveTo(x - d, y + d);
	c.lineTo(x - 2 * d, y + 2 * d);
	c.moveTo(x - d, y + d);
	c.lineTo(x, y + 2 * d);
	c.moveTo(x, y + 2 * d);
	c.lineTo(x - d, y + 3 * d);
	c.moveTo(x, y + 2 * d);
	c.lineTo(x + d, y + 3 * d);
	c.stroke()
	x -= r / 2;
	y -= r / 2;
	c.ellipse(x, y, r, r);
	c.fillAndStroke();
	c.ellipse(x + d, y + d, r, r);
	c.fillAndStroke();
	c.ellipse(x - d, y + d, r, r);
	c.fillAndStroke();
	c.ellipse(x - 2 * d, y + 2 * d, r, r);
	c.fillAndStroke();
	c.ellipse(x, y + 2 * d, r, r);
	c.fillAndStroke();
	c.ellipse(x - d, y + 3 * d, r, r);
	c.fillAndStroke();
	c.ellipse(x + d, y + 3 * d, r, r);
	c.fillAndStroke();
	c.end();
}

function symbolRTLFSM(c, x, y, size) {
	var r = size / 6;
	var d = size / 2.5;
	y -= d / 2;
	x += r / 2;
	y += r / 2;
	c.begin()
	c.moveTo(x - d, y);
	c.lineTo(x + d, y);
	c.end();
	c.stroke();
	c.begin();
	c.moveTo(x + d - r / 2, y);
	c.lineTo(x + d - r, y - r / 2);
	c.lineTo(x + d - r, y + r / 2);
	c.close()
	c.end();
	c.fillAndStroke();
	c.begin();
	c.moveTo(x + d, y);
	c.lineTo(x, y + d);
	c.end();
	c.stroke();
	c.begin();
	c.moveTo(x + r / 2 / 1.4, y + d - r / 2 / 1.4);
	c.lineTo(x + r / 2 / 1.4, y + d - r / 2 / 1.4 - r / 2 * 1.4);
	c.lineTo(x + r / 2 / 1.4 + r / 2 * 1.4, y + d - r / 2 / 1.4);
	c.close()
	c.fillAndStroke();
	c.begin()
	c.moveTo(x, y + d);
	c.lineTo(x - d, y);
	c.end();
	c.stroke()
	c.begin();
	c.moveTo(x - d + r / 2 / 1.4, y + r / 2 / 1.4);
	c.lineTo(x - d + r / 2 / 1.4, y + r / 2 / 1.4 + r / 2 * 1.4);
	c.lineTo(x - d + r / 2 / 1.4 + r / 2 * 1.4, y + r / 2 / 1.4);
	c.close()
	c.fillAndStroke();
	x -= r / 2;
	y -= r / 2;
	c.ellipse(x + d, y, r, r);
	c.fillAndStroke();
	c.ellipse(x - d, y, r, r);
	c.fillAndStroke();
	c.ellipse(x, y + d, r, r);
	c.fillAndStroke();
	c.end();
}

mxCellRenderer.registerShape(mxShapeRTLEntity.prototype.cst.SHAPE_ENTITY, mxShapeRTLEntity);

mxShapeRTLEntity.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	var leftPins = parsePinString(mxUtils.getValue(this.style, 'left', '3'));
	var rightPins = parsePinString(mxUtils.getValue(this.style, 'right', '2'));
	var topPins = parsePinString(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPins = parsePinString(mxUtils.getValue(this.style, 'bottom', '1'));
	var pinFontSize = parseFloat(mxUtils.getValue(this.style, 'pinFontSize', '12'));
	var dir = mxUtils.getValue(this.style, 'direction', 'east');
	var type_size = mxUtils.getValue(this.style, 'type_size', '30');
	var drawPins = mxUtils.getValue(this.style, 'drawPins', false);
	var padding = 10 + (!drawPins)*10;

	
	spacing = h / (leftPins.length + 1)
	pinY = spacing;
	leftPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(0, pinY / h), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(0, pinY / h), false, "", this.calcLeftX(pinY), 0));
		if (p.name) {
			var txtLength = padding;
			if (p.clock) {
				txtLength += type_size/4;
			}
			txtLength += calculateSize.default(p.name, {font: this.style.fontFamily, fontSize: pinFontSize+"px"}).width;
			constr.push(new mxConnectionConstraint(new mxPoint(0, pinY / h), false, "", this.calcLeftX(pinY)+txtLength, 0));
		}
		pinY += spacing;
	});
	spacing = h / (rightPins.length + 1)
	pinY = spacing;
	rightPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(1, pinY / h), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(1, pinY / h), false, "", this.calcRightX(pinY)-w, 0));
		if (p.name) {
			var txtLength = padding;
			if (p.clock) {
				txtLength += type_size/4;
			}
			txtLength += calculateSize.default(p.name, {font: this.style.fontFamily, fontSize: pinFontSize+"px"}).width;
			constr.push(new mxConnectionConstraint(new mxPoint(1, pinY / h), false, "", this.calcRightX(pinY)-txtLength-w, 0));
		}
		pinY += spacing;
	});
	spacing = w / (topPins.length + 1)
	pinX = spacing;
	topPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 0), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 0), false, "", 0, this.calcTopY(pinX)));
		if (p.name) {
			var txtLength = padding;
			if (p.clock) {
				txtLength += type_size/4;
			}
			txtLength += calculateSize.default(p.name, {font: this.style.fontFamily, fontSize: pinFontSize+"px"}).width;
			constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 0), false, "", 0, this.calcTopY(pinX)+txtLength));
		}
		pinX += spacing;
	});
	spacing = w / (bottomPins.length + 1)
	pinX = spacing;
	bottomPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 1), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 1), false, "", 0, this.calcBottomY(pinX)-h));
		if (p.name) {
			var txtLength = padding;
			if (p.clock) {
				txtLength += type_size/4;
			}
			txtLength += calculateSize.default(p.name, {font: this.style.fontFamily, fontSize: pinFontSize+"px"}).width;
			constr.push(new mxConnectionConstraint(new mxPoint(pinX / w,1), false, "", 0, this.calcBottomY(pinX)-txtLength-h));
		}
		pinX += spacing;
	});
	return (constr);
}

},{"calculate-size":5}],85:[function(require,module,exports){
var onml = require('onml');
var render = require('wavedrom/lib');
var def = require('wavedrom/skins/default.js');
var narrow = require('wavedrom/skins/narrow.js');
var lowkey = require('wavedrom/skins/lowkey.js');

/**
* Extends mxShape.
*/
function mxShapeRTLWavedrom(bounds, fill, stroke, strokewidth) {
	mxShape.call(this);
	this.bounds = bounds;
	this.image = '';
	this.error = '';
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.shadow = false;
};
/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLWavedrom, mxImageShape);

mxShapeRTLWavedrom.prototype.cst = {
	SHAPE_WAVEDROM: 'mxgraph.rtl.abstract.wavedrom'
};

mxShapeRTLWavedrom.prototype.customProperties = [
];

mxShapeRTLWavedrom.prototype.updateImage = function () {
	try {
		var skins = Object.assign({}, def, narrow, lowkey);
		var jsonml = render.renderAny(0,JSON.parse(this.state.cell.value),skins);
		jsonml[1].viewBox = "-30 0 "+ jsonml[1].width + " " + jsonml[1].height;
		this.image = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(onml.stringify(jsonml))));
		this.error = '';
	} catch (err) {
		this.error = err.message;
	}
}

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/
mxShapeRTLWavedrom.prototype.paintVertexShape = function (c, x, y, w, h) {
	if (!this.image) {
		this.updateImage();
	}
	try {
		if (!this.error) {
			c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
		}
	} catch (err) {
		this.error = err.message;
	}
	if (this.error) {
		c.text(x, y, w, h, this.error, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, true, 'html', 0, 0, 0);
		c.stroke();
	}
	this.state.cell.valueChanged = (value) => { var lastValue = mxCell.prototype.valueChanged.call(this.state.cell, value); this.updateImage(); this.redraw(); return lastValue;}
}

mxCellRenderer.registerShape(mxShapeRTLWavedrom.prototype.cst.SHAPE_WAVEDROM, mxShapeRTLWavedrom);

mxShapeRTLWavedrom.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	return constr;
}

},{"onml":12,"wavedrom/lib":52,"wavedrom/skins/default.js":78,"wavedrom/skins/lowkey.js":79,"wavedrom/skins/narrow.js":80}]},{},[81]);
