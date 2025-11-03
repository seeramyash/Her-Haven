/*
 * Steganography library implementation
 */
(function(name, context, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})('steg', this, function() {
    var Message = {
        blackPixelLimit: 5,
        whitePixelLimit: 250,
        initBitIndex: 7,
        encode: function(data, message, callback) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixelData = imageData.data;

                // Convert message to binary
                const binaryMessage = message.split('').map(char => 
                    char.charCodeAt(0).toString(2).padStart(8, '0')
                ).join('');

                const messageLength = binaryMessage.length;
                let bitIndex = Message.initBitIndex;
                let charIndex = 0;

                // Encode message length first (32 bits)
                const binaryLength = messageLength.toString(2).padStart(32, '0');
                for (let i = 0; i < 32; i++) {
                    const pixelIndex = i * 4;
                    pixelData[pixelIndex] = (pixelData[pixelIndex] & 254) | parseInt(binaryLength[i]);
                }

                // Encode the actual message
                for (let i = 32 * 4; i < pixelData.length && charIndex < messageLength; i += 4) {
                    const r = pixelData[i];
                    if (r <= Message.blackPixelLimit || r >= Message.whitePixelLimit) continue;

                    pixelData[i] = (r & 254) | parseInt(binaryMessage[charIndex]);
                    charIndex++;
                }

                ctx.putImageData(imageData, 0, 0);
                callback(canvas.toDataURL());
            };
            img.src = data;
        },

        decode: function(data, callback) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixelData = imageData.data;

                // Read message length first (32 bits)
                let binaryLength = '';
                for (let i = 0; i < 32; i++) {
                    const pixelIndex = i * 4;
                    binaryLength += (pixelData[pixelIndex] & 1);
                }
                const messageLength = parseInt(binaryLength, 2);

                // Read the message
                let binaryMessage = '';
                let charCount = 0;
                for (let i = 32 * 4; i < pixelData.length && charCount < messageLength; i += 4) {
                    const r = pixelData[i];
                    if (r <= Message.blackPixelLimit || r >= Message.whitePixelLimit) continue;

                    binaryMessage += (r & 1);
                    charCount++;
                }

                // Convert binary message to text
                let message = '';
                for (let i = 0; i < binaryMessage.length; i += 8) {
                    const byte = binaryMessage.substr(i, 8);
                    message += String.fromCharCode(parseInt(byte, 2));
                }

                callback(message);
            };
            img.src = data;
        }
    };

    return {
        encode: Message.encode,
        decode: Message.decode
    };
});
