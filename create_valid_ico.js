const fs = require('fs');

const pngBuffer = fs.readFileSync('icon.png');

// Create 22-byte ICO header for PNG embedded icon
const icoHeader = Buffer.alloc(22);

// ICONDIR:
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // Type 1 = Icon
icoHeader.writeUInt16LE(1, 4); // Count 1 image

// ICONDIRENTRY:
icoHeader.writeUInt8(0, 6);              // Width (0 = 256px)
icoHeader.writeUInt8(0, 7);              // Height (0 = 256px)
icoHeader.writeUInt8(0, 8);              // Color count
icoHeader.writeUInt8(0, 9);              // Reserved
icoHeader.writeUInt16LE(1, 10);          // Color planes
icoHeader.writeUInt16LE(32, 12);         // Bits per pixel
icoHeader.writeUInt32LE(pngBuffer.length, 14); // Image size in bytes
icoHeader.writeUInt32LE(22, 18);         // Image offset (22 bytes)

const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);
fs.writeFileSync('icon.ico', icoBuffer);
console.log('Valid icon.ico created successfully, size:', icoBuffer.length);
