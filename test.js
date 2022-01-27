//    \i0/r0
//    |s0|s1|s2|
//          /i0\

// Conveyor
var conveyor = {
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

console.log("hello world!");

// var createRunLine = function (lineDesc) {

//   findOutputSegment

//   var runLine = function (inputQueue) {
//     var outputQueue = [];

//     while outputQueue !=

//     var duration = 0;
//     return duration;
//   };
//   return runLine;
// };

// var runLine = createRunLine(null);
// runLine(1);
