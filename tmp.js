// var eval = function(inputItems, outputItems, line_desc) {

//     //

//     // var state = {
//     //     item: null,
//     //     duration: 0,
//     // }

//     // var duration = 1;

//     while (inputItems.length() > 0) {
//         if (state.item !== null && duration === 0) {
//             outputItems.push_back(state.item);
//         }
//     }

//     return 1;
// }

var state = {
    item: null,
    duration: 0,
}

var duration = sample(Poisson({mu: 1}));

console.log(duration)