// references:
// - https://github.com/tinue/APA102_Pi/blob/master/apa102.py
// - http://hackaday.com/2014/12/09/digging-into-the-apa102-serial-led-protocol/
// - https://www.pololu.com/product/2554
//
// TODO gamma correction
// - https://github.com/ManiacalLabs/BiblioPixel/blob/master/bibliopixel/gamma.py#L3

var BufferList = require('bl')

module.exports = pixelsToApa102Buffer

function pixelsToApa102Buffer (pixels) {
  // assemble start, body, and end frames
  var bl = BufferList()

  // start frame
  bl.append(Buffer([0x00, 0x00, 0x00, 0x00]))

  // body frames
  var length = pixels.shape[0]
  for (var i = 0; i < length; i++) {
    bl.append(bodyFrame(pixels.pick(i)))
  }

  // end frames
  for (i = 0; i < numEndBytes(length); i++) {
    bl.append(Buffer([0x00]))
  }

  return bl
}

function bodyFrame (channels) {
  // LED startframe is three "1" bits, followed by 5 brightness bits
  // https://github.com/tinue/APA102_Pi/blob/master/apa102.py#L56
  // or
  // https://github.com/pololu/apa102-arduino/blob/30d336dacec08d2f16f654f236a2a7044e6d2168/APA102.h#L123-L132
  var brightness = 31
  // TODO implement per-pixel brightness
  // - https://github.com/FastLED/FastLED/issues/91
  // - https://github.com/pololu/apa102-arduino/commit/9a77cdeaddfc3eb2c7bb7b2d91a22f16a2120773
  // - http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color#596243
  // 0b11100000 = 0340 = 0xE0 = 224
  var prefix = brightness | 0xE0
  var red = channels.get(0)
  var green = channels.get(1)
  var blue = channels.get(2)
  return Buffer([prefix, blue, green, red])
}

function numEndBytes (length) {
  // round up numLEDs/2 bits (or numLEDs/16 bytes)
  // https://github.com/tinue/APA102_Pi/blob/master/apa102.py#L94
  // or
  // https://github.com/pololu/apa102-arduino/blob/30d336dacec08d2f16f654f236a2a7044e6d2168/APA102.h#L82-L121
  return Math.ceil((length - 1) / 16)
}
