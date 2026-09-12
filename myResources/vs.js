// The main difference is how they execute the function and how they accept arguments.
// call() executes the function immediately, and arguments are passed individually.
// apply() also executes the function immediately, but arguments are passed as an array.
// bind() does not execute the function immediately. It returns a new function with the this value fixed, which can be executed later.

//01: "Why do we need call, apply, and bind if we already have objects and functions?"
//"They are useful when we want to reuse a function with a different object as its this value. This is commonly called function borrowing. bind() is especially useful when we need to pass a function somewhere, such as an event handler, while preserving the desired this context."


// function greetings(city) {
//     console.log(this.name + " says hello from " + city);
// }
// const person = { name: "Alice" };

// greetings.call(person, "New York"); 
// greetings.apply(person, ["Los Angeles"]); 
// const boundGreetings = greetings.bind(person);
// boundGreetings("Chicago");




//02: map() is used when you have an array and want to create a new array by changing each element.