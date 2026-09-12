import { parentPort } from 'worker_threads';

console.log("Worker thread is running");
let sum = 0;

for(let i = 0; i < 100000000000; i++) {
    sum += i;
}

parentPort.postMessage(`Sum is ${sum}`);
console.log("Worker thread has sent the message to the main thread");