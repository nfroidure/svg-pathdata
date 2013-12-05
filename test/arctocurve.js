var assert = chai.assert;

// Sample pathes from MDN
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths

describe("Converting eliptical arc commands to curves", function() {

  it("should work sweepFlag on 0 and largeArcFlag on 0", function() {
      assert.equal(
        new SVGPathData('M80 80 A 45 45, 0, 0, 0, 125 125 L 125 80 Z').aToC().encode(),
        'M80 80C80 104.8528137423857 100.1471862576143 125 125 125L125 80z'
      );
  });

  it("should work sweepFlag on 1 and largeArcFlag on 0", function() {
      assert.equal(
        new SVGPathData('M230 80 A 45 45, 0, 1, 0, 275 125 L 275 80 Z').aToC().encode(),
        'M230 80C195.35898384862247 80 173.7083487540115 117.5 191.02885682970026 147.5C208.34936490538902 177.5 251.65063509461095 177.5 268.97114317029974 147.5C272.9207180979216 140.65913555705873 275 132.89914985524376 275 125L275 80z'
      );
  });

  it("should work sweepFlag on 0 and largeArcFlag on 1", function() {
      assert.equal(
        new SVGPathData('M80 230 A 45 45, 0, 0, 1, 125 275 L 125 230 Z').aToC().encode(),
        'M80 230C104.8528137423857 230 125 250.1471862576143 125 275L125 230z'
      );
  });

  it("should work sweepFlag on 1 and largeArcFlag on 1", function() {
      assert.equal(
        new SVGPathData('M230 230 A 45 45, 0, 1, 1, 275 275 L 275 230 Z').aToC().encode(),
        'M230 230C230 195.35898384862247 267.5 173.7083487540115 297.5 191.02885682970026C327.5 208.34936490538902 327.5 251.65063509461095 297.5 268.97114317029974C290.65913555705873 272.9207180979216 282.89914985524376 275 275 275L275 230z'
      );
  });

});

