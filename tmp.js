// Line specification describing the following conveyor belt:
//
//   \i1/r0
//   |s0|s1|s2|
//         /o0\
//
//   \i0/    : 0th input chute
//   /o0\    : 0th output chute
//   r0      : 0th robot
//   s0,s1,s2: 0th, 1st, and 2nd conveyor segments
//
var conveyorLineSpec = {
  segments: [
    {
      id: 0,
      to: 1,
      from: null,
    },
    {
      id: 0,
      to: 1,
      from: null,
    },
    {
      id: 0,
      to: 1,
      from: null,
    },
  ],
  robots: [
    {
      id: 0,
      loc: 1,
    },
  ],
  input_method: {
    type: "chute",
    to: 0, // segment_id
  },
  output_method: {
    type: "chute",
    from: 2,
  },
};

var createRunLine = function (lineSpec) {
  var firstSegment = lineSpec.segments[0];
  var runLine = function (inputQueue) {
    var outputQueue = [];
    var duration = 0;
    return duration;
  };
  return runLine;
};

var runLine = createRunLine(conveyorLineSpec);
var testInputQueue = [];
var outputDuration = runLine(testInputQueue);

var result = {
  conveyorLineSpec: conveyorLineSpec,
  createRunLine: createRunLine,
  runLine: runLine,
  createRunLine: createRunLine,
};

result;
