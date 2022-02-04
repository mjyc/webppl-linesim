/**
 * webppl-linesim
 * --------------
 *
 * How to run this code:
 * 1. Install nodejs v15.5.1, e.g., using [nvm](https://github.com/nvm-sh/nvm)
 * 2. Run `npm install`
 * 3. Run `./node_modules/.bin/webppl main.js`
 *
 * For gentle introduction to probabilistic programming, check out
 * http://adriansampson.net/doc/ppl.html
 *
 */

// Let's say we are interested in the expected throughput of a line. In this demo, I
// demonstrate how to use a probabilistic programming language to (1) build a
// statistical model of a line and (2) use the model to infer the throughput
// distribution.

// Here is a apecification describing the following line:
//
//   \  /
//   |s0|s1|s2|
//         /  \
//
//   s0, s1, s2 means 0th, 1st, and 2nd segments and one can place an items at s0 and
//   the line eject the item at s2
//
var lineSpec = {
  segments: [
    {
      id: 0,
      to: 1, // segment_id
      from: null, // segment_id
    },
    {
      id: 1,
      to: 2,
      from: 0,
    },
    {
      id: 2,
      to: null,
      from: 1,
    },
  ],
  placer: {
    to: 0, // segment_id
  },
  ejector: {
    from: 2, // segment_id
  },
};

// This helper function converts a specification into a data structure that is easier to
// work with. The output data structure represents the "given" variables (e.g., Y in
// P(X|Y) where X is a random variable representing the throughput)
var createLine = function (lineSpec) {
  var createSegments = function (segment) {
    if (segment === null) {
      return null;
    } else {
      var nextSegment =
        find(function (seg) {
          return seg.id === segment.to;
        }, lineSpec.segments) || null;
      return {
        id: segment.id,
        next: createSegments(nextSegment),
        item: null,
        duration: null,
      };
    }
  };
  var line = {
    // assume "lineSpec.segments[0]" is the first segment
    firstSegment: createSegments(lineSpec.segments[0]),
  };
  return line;
};

// This is factory function returns "run", a function that simulates processing the line
// for "maxNumSteps" "step"s and returns "duration" taken to process all "inputItems".
// Evaluating "run" is equivalent to sampling from P(X|Y).
var createRun = function (lineSpec) {
  var line = createLine(lineSpec);

  // A helper function for taking a "step"; This function is the most important piece in
  // this demo. It shows how to simulate the single discrete step line activity using a
  // single recursive function.
  var step = function (segment, newItem) {
    if (segment.next === null) {
      if (newItem !== null) {
        return [true, segment, newItem];
      } else {
        return [false, segment, null];
      }
    }

    if (newItem !== null) {
      // need to place "newItem" on "segment"
      if (segment.item !== null) {
        // "segment" has "segment.item"
        if (segment.duration === 0) {
          // "segment.item" is ready to be moved to "segment.next"
          // let's see if we can place "segment.item" on "segment.next"
          var stepResult = step(segment.next, segment.item);
          var itemMoved = stepResult[0];
          var nextSegment = stepResult[1];
          var outItem = stepResult[2];
          if (itemMoved) {
            // "segment.item" is placed on "nextSegment"
            // placing "newItem" on "segment"
            return [
              true,
              Object.assign({}, segment, {
                next: nextSegment,
                item: newItem,
                duration: sample(Poisson({ mu: 2 })),
              }),
              outItem,
            ];
          } else {
            // "segment.item" is not placed on "nextSegment"
            // making no change
            return [
              false,
              Object.assign({}, segment, { next: nextSegment }),
              outItem,
            ];
          }
        } else {
          // "segment.item" is not ready to be moved to "segment.next"; it needs to stay
          // in "segment" for remaining "segment.duration"
          var stepResult = step(segment.next, null);
          var itemMoved = stepResult[0];
          var nextSegment = stepResult[1];
          var outItem = stepResult[2];
          // reducing duration by 1
          return [
            false,
            Object.assign({}, segment, {
              next: nextSegment,
              duration: segment.duration - 1,
            }),
            outItem,
          ];
        }
      } else {
        // placing "newItem" on "segment"
        var stepResult = step(segment.next, null);
        var itemMoved = stepResult[0];
        var nextSegment = stepResult[1];
        var outItem = stepResult[2];
        return [
          true,
          Object.assign({}, segment, {
            next: nextSegment,
            item: newItem,
            duration: sample(Poisson({ mu: 2 })),
          }),
          outItem,
        ];
      }
    } else {
      // no need to place "newItem" on "segment"
      if (segment.item !== null) {
        // "segment" has "segment.item"
        if (segment.duration === 0) {
          // "segment.item" is ready to be moved to "segment.next"
          // let's see if we can place "segment.item" on "segment.next"
          var stepResult = step(segment.next, segment.item);
          var itemMoved = stepResult[0];
          var nextSegment = stepResult[1];
          var outItem = stepResult[2];
          if (itemMoved) {
            // "segment.item" is placed on "nextSegment"
            return [
              false,
              Object.assign({}, segment, {
                next: nextSegment,
                item: null,
                duration: null,
              }),
              outItem,
            ];
          } else {
            // "segment.item" is not placed on "nextSegment"
            // making no change
            return [
              false,
              Object.assign({}, segment, { next: nextSegment }),
              outItem,
            ];
          }
        } else {
          // "segment.item" is not ready to be moved to "segment.next"; it needs to stay
          // in "segment" for remaining "segment.duration"
          var stepResult = step(segment.next, null);
          var itemMoved = stepResult[0];
          var nextSegment = stepResult[1];
          var outItem = stepResult[2];
          // reducing duration by 1
          return [
            false,
            Object.assign({}, segment, {
              next: nextSegment,
              duration: segment.duration - 1,
            }),
            outItem,
          ];
        }
      } else {
        // making no change
        var stepResult = step(segment.next, null);
        var itemMoved = stepResult[0];
        var nextSegment = stepResult[1];
        var outItem = stepResult[2];
        return [
          false,
          Object.assign({}, segment, { next: nextSegment }),
          outItem,
        ];
      }
    }
  };

  var run = function (inputItems, maxNumSteps) {
    // webppl does not allow for/while, so using reduce instead
    var initState = {
      line: line,
      inputItems: inputItems,
      outputItems: [],
      finished: false,
      duration: 0,
    };
    var ticks = repeat(maxNumSteps, function () {
      return 1;
    });
    var finalState = reduce(
      function (tick, state) {
        var stepResult = step(
          state.line.firstSegment,
          state.inputItems.length > 0 ? state.inputItems[0] : null
        );
        var curInputItems = stepResult[0]
          ? mapN(function (idx) {
              // poor man's "state.inputItems.slice(0)"
              return state.inputItems[idx + 1];
            }, state.inputItems.length - 1)
          : state.inputItems;
        var curOutputItems =
          stepResult[2] !== null
            ? mapN(function (idx) {
                // poor man's "state.outputItems.concat(stepResult[2])"
                return idx < state.outputItems.length
                  ? state.outputItems[idx]
                  : stepResult[2];
              }, state.outputItems.length + 1)
            : state.outputItems;
        var newLine = Object.assign({}, state.line, {
          firstSegment: stepResult[1],
        });
        var finished = // poor man's deep equality
          curOutputItems.length === inputItems.length &&
          all(
            function (a) {
              return a;
            },
            map2(
              function (a, b) {
                return a === b;
              },
              curOutputItems,
              inputItems
            )
          );
        return Object.assign({}, state, {
          line: newLine,
          inputItems: curInputItems,
          outputItems: curOutputItems,
          duration: state.duration + (!finished ? tick : 0), // don't advance the clock once it's done
        });
      },
      initState,
      ticks
    );

    return finalState.duration;
  };
  return run;
};

// Let's sample possible "duration"s
var run = createRun(lineSpec);
var inputItems = ["a", "b"];
var maxNumSteps = 20;
var marginal = Infer(function () {
  return run(inputItems, maxNumSteps);
});
// and print distribution over possible durations of running the line
marginal.getDist();

// The output usually looks something like:
// {
//   '3': { val: 3, prob: 0.001 },
//   '4': { val: 4, prob: 0.002 },
//   '5': { val: 5, prob: 0.02 },
//   '6': { val: 6, prob: 0.048 },
//   '7': { val: 7, prob: 0.09 },
//   '8': { val: 8, prob: 0.163 },
//   '9': { val: 9, prob: 0.174 },
//   '10': { val: 10, prob: 0.164 },
//   '11': { val: 11, prob: 0.128 },
//   '12': { val: 12, prob: 0.09 },
//   '13': { val: 13, prob: 0.058 },
//   '14': { val: 14, prob: 0.035 },
//   '15': { val: 15, prob: 0.012 },
//   '16': { val: 16, prob: 0.007 },
//   '17': { val: 17, prob: 0.005 },
//   '18': { val: 18, prob: 0.003 }
// }
