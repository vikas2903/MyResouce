
import fs from "fs";
import readline from "readline";

export default function prectice() {

    // 1. --- Streaming Example ---
    // let lineCount = 0;
    // const stream = fs.createReadStream('./products_export_1.csv');
    // const rl = readline.createInterface({ input: stream });

    // rl.on('line', (line) => {
    //     lineCount++;
    //     console.log(`Line ${lineCount}: ${line}`);
    // })

    // rl.on('close', () => {
    //     console.log(`Total number of lines: ${lineCount}`);
    // });


    // Buffer example
    // const buffer = Buffer.from("VikasPrasad");
    // console.log("buffer", buffer);
    // console.log("buffer to string", buffer.toString());
    // console.log("buffer length", buffer.length);

    //     let thatgetSieofBuffer = (buffer) => {
    //         return buffer.length;
    //     };

    //    let bufferLength = thatgetSieofBuffer(buffer);
    //    console.log("Size of buffer in bytes:", bufferLength);




    // const writeStream = fs.createWriteStream('output.txt');
    // writeStream.write('Hello, this is a tccest.\n');
    // writeStream.write('This is the secoccnd line.\n');
    // writeStream.end('This is the lascct line.');
    // writeStream.on('finish', () => {
    //     console.log('All data has been written to output.txt');
    // }); 




    // const readStream = fs.createReadStream('output.txt');
    // readStream.on('data', (chunk) => {
    //     console.log('Received chunk:', chunk.toString());
    // });

    // readStream.on('end', () => {
    //     console.log('Finished reading output.txt');
    // }); 



    // const readStream = fs.createReadStream('output.txt');
    // const writeStream = fs.createWriteStream('output_copy.txt');
    // readStream.pipe(writeStream);


    // const readStream2 = fs.createReadStream('output_copy.txt');
    // readStream2.on('data', (chunk) => {
    //     console.log('Received chunk from output_copy.txt:', chunk.toString());
    // });

    // readStream2.on('end', () => {
    //     console.log('Finished reading output_copy.txt');
    // });


    // const logStream = fs.createWriteStream('log.txt', { flags: 'a' });

    // logStream.write('User accessed the application at ' + new Date().toISOString() + '\n');

    // logStream.end(() => {
    //     console.log('Log entry has been written to log.txt');
    // });


    const readStream3 = fs.createReadStream('log.txt');
    readStream3.on('data', (chunk) => {
        console.log('Received chunk from log.txt:', chunk.toString());
    }
    );


    readStream3.on('end', () => {
        console.log('Finished reading log.txt');
    });

    // Multi-Threading with Worker Threads


    
}


