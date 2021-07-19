export function ease(
  startCoord = { lat: 0, lng: 0 },
  endCoord = { lat: 1, lng: 1 },
  durationMs = 200,
  onStep = console.log,
  onComplete = function () {}
) {
  var raf =
      window.requestAnimationFrame ||
      function (f) {
        window.setTimeout(f, 16);
      },
    stepCount = durationMs / 16,
    valueIncrementLat = (endCoord.lat - startCoord.lat) / stepCount,
    valueIncrementLng = (endCoord.lng - startCoord.lng) / stepCount,
    sinValueIncrement = Math.PI / stepCount,
    currentValueLat = startCoord.lat,
    currentValueLng = startCoord.lng,
    currentSinValue = 0;

  function step() {
    currentSinValue += sinValueIncrement;
    currentValueLat += valueIncrementLat * Math.sin(currentSinValue) ** 2 * 2;
    currentValueLng += valueIncrementLng * Math.sin(currentSinValue) ** 2 * 2;

    if (currentSinValue < Math.PI) {
      onStep({ lat: currentValueLat, lng: currentValueLng });
      raf(step);
    } else {
      onStep(endCoord);
      onComplete();
    }
  }

  raf(step);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomGeo(center, radius){
  var y0 = center.lat;
  var x0 = center.lng;
  var rd = radius / 111300;

  var u = Math.random();
  var v = Math.random();

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);


  return {
      'lat': y + y0,
      'lng': x + x0
  };
};