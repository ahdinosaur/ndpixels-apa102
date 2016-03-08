var test = require('tape')
var Ndarray = require('ndarray')
var repeat = require('repeat-array')
var equal = require('buffer-equal')

var apa102 = require('./')

// For example, to update all 30 LEDs on a 1-meter strip, you should send a 32-bit start frame, thirty 32-bit LED frames, and a 16-bit end frame, for a total of 1008 bits (126 bytes).
test('30 white pixels', function (t) {
  var pixel = [0xFF, 0xFF, 0xFF]
  var pixels = Ndarray(repeat(pixel, 30), [30, 3])
  var result = apa102(pixels).slice()
  t.ok(equal(result.slice(0, 4), Buffer([0x00, 0x00, 0x00, 0x00])), '32-bit start frame')
  for (var i = 0; i < 30; i++) {
    t.ok(equal(result.slice(i*4+4,(i+1)*4+4), Buffer([0xFF, 0xFF, 0xFF, 0xFF])), '32-bit LED frame #' + i)
  }
  t.ok(equal(result.slice(result.length - 2), Buffer([0x00, 0x00])), '16-bit end frame')
  t.equal(result.length, 126)
  t.end()
})

