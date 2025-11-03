function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
}

function displayError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

function clearError() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = '';
}

function toggleImageSource() {
    const source = document.querySelector('input[name="imageSource"]:checked').value;
    const generateFields = document.getElementById('generateFields');
    const uploadFields = document.getElementById('uploadFields');
    
    if (source === 'generate') {
        uploadFields.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            uploadFields.classList.add('hidden');
            generateFields.classList.remove('hidden');
            generateFields.style.animation = 'fadeInUp 0.5s ease';
        }, 300);
    } else {
        generateFields.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            generateFields.classList.add('hidden');
            uploadFields.classList.remove('hidden');
            uploadFields.style.animation = 'fadeInUp 0.5s ease';
        }, 300);
    }
}

function previewUploadedImage() {
    const fileInput = document.getElementById('uploadImageInput');
    const preview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('uploadPreviewImg');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        preview.classList.add('hidden');
    }
}

function switchTab(tab) {
    // Update tab appearance with animation
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
    });
    
    // Smooth transition for content
    const encodeContent = document.getElementById('encodeContent');
    const decodeContent = document.getElementById('decodeContent');
    const resultContainer = document.getElementById('result-container');
    const loading = document.getElementById('loading');
    
    if (tab === 'encode') {
        document.querySelector('.tab:first-child').classList.add('active');
        decodeContent.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(() => {
            decodeContent.classList.add('hidden');
            encodeContent.classList.remove('hidden');
            encodeContent.style.animation = 'fadeInUp 0.5s ease';
        }, 200);
    } else {
        document.querySelector('.tab:last-child').classList.add('active');
        encodeContent.style.animation = 'fadeOut 0.2s ease forwards';
        // Hide the encoded image result when switching to decode tab
        if (resultContainer) {
            resultContainer.classList.add('hidden');
        }
        if (loading) {
            loading.classList.add('hidden');
        }
        setTimeout(() => {
            encodeContent.classList.add('hidden');
            decodeContent.classList.remove('hidden');
            decodeContent.style.animation = 'fadeInUp 0.5s ease';
        }, 200);
    }
}

function handleEncode() {
    const source = document.querySelector('input[name="imageSource"]:checked').value;
    
    if (source === 'generate') {
        generateImage();
    } else {
        uploadAndEncode();
    }
}

async function generateImage() {
    const promptInput = document.getElementById('prompt');
    const complaintDescriptionInput = document.getElementById('complaintDescription');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const resultImg = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');

    clearError();

    const prompt = promptInput.value.trim();
    const complaintDescription = complaintDescriptionInput.value.trim();
    let secretMessage = '';

    // Only create a secret message if a description is provided
    if (complaintDescription) {
        const complaintData = {
            description: complaintDescription,
            timestamp: new Date().toISOString()
        };
        secretMessage = JSON.stringify(complaintData);
    }

    if (!prompt) {
        displayError('Please enter an image prompt.');
        return;
    }

    // Show loading, hide previous result
    loading.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    try {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || 'Failed to generate image');
        }

        let finalImageUrl = data.url;

        if (secretMessage) {
            try {
                finalImageUrl = await encodeMessage(data.url, secretMessage);
                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.href = finalImageUrl;
                    link.download = 'encoded-image.png';
                    link.click();
                };
            } catch (encodingError) {
                displayError(`Warning: ${encodingError.message}. Displaying original image without hidden message.`);
            }
        }

        // Display the final image
        resultImg.src = finalImageUrl;
        resultContainer.classList.remove('hidden');

    } catch (error) {
        console.error('Frontend error:', error);
        displayError(`Error: ${error.message}`);
    } finally {
        loading.classList.add('hidden');
    }
}

// Helper function to wrap steg.encode in a Promise
async function encodeMessage(imageUrl, secretMessage) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(objectUrl);

            const safeDataUrl = canvas.toDataURL('image/png');
            
            steg.encode(safeDataUrl, secretMessage, (encodedDataUrl) => {
                if (encodedDataUrl) {
                    resolve(encodedDataUrl);
                } else {
                    reject(new Error("Steganography encoding failed."));
                }
            });
        };
        img.onerror = function() {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load the generated image for encoding.'));
        };
        img.src = objectUrl;
    });
}

function decodeImage() {
    const fileInput = document.getElementById('decodeImageInput');
    const decodedMessageContainer = document.getElementById('decodedMessageContainer');
    const decodedMessageEl = document.getElementById('decodedMessage');

    clearError();
    
    if (!fileInput.files || fileInput.files.length === 0) {
        displayError('Please select an image file to decode.');
        decodedMessageContainer.classList.add('hidden');
        return;
    }
    
    decodedMessageContainer.classList.remove('hidden');
    decodedMessageEl.innerHTML = '<em>Decoding...</em>';

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const imageDataUrl = event.target.result;

        steg.decode(imageDataUrl, function(message) {
            if (!message) {
                decodedMessageEl.innerHTML = 'No hidden message found in this image.';
                return;
            }

            try {
                const complaintData = JSON.parse(message);
                if (complaintData && complaintData.description && complaintData.timestamp) {
                    decodedMessageEl.innerHTML = `<p><strong>Timestamp:</strong> ${escapeHTML(new Date(complaintData.timestamp).toLocaleString())}</p><p><strong>Description:</strong></p><pre>${escapeHTML(complaintData.description)}</pre>`;
                } else {
                    decodedMessageEl.innerHTML = `<pre>${escapeHTML(message)}</pre>`; // It's JSON, but not our format
                }
            } catch (e) {
                // It's not JSON, just display the raw message (legacy support)
                decodedMessageEl.innerHTML = `<pre>${escapeHTML(message)}</pre>`;
            }
        });
    };

    reader.onerror = function() {
        displayError('Error reading file.');
        decodedMessageEl.innerHTML = 'Could not read the file.';
    };

    reader.readAsDataURL(file);
}

async function uploadAndEncode() {
    const fileInput = document.getElementById('uploadImageInput');
    const complaintDescriptionInput = document.getElementById('complaintDescription');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const resultImg = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');

    clearError();

    // Validate uploaded file
    if (!fileInput.files || !fileInput.files[0]) {
        displayError('Please upload an image file.');
        return;
    }

    const complaintDescription = complaintDescriptionInput.value.trim();
    let secretMessage = '';

    // Only create a secret message if a description is provided
    if (complaintDescription) {
        const complaintData = {
            description: complaintDescription,
            timestamp: new Date().toISOString()
        };
        secretMessage = JSON.stringify(complaintData);
    }

    if (!secretMessage) {
        displayError('Please provide a complaint description to encode.');
        return;
    }

    // Show loading, hide previous result
    loading.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    try {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async function(event) {
            try {
                const imageDataUrl = event.target.result;
                let finalImageUrl = imageDataUrl;

                // Encode the message into the uploaded image
                finalImageUrl = await encodeMessageFromDataUrl(imageDataUrl, secretMessage);
                
                // Display the encoded image
                resultImg.src = finalImageUrl;
                resultContainer.classList.remove('hidden');
                
                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.href = finalImageUrl;
                    link.download = 'encoded-image.png';
                    link.click();
                };
            } catch (encodingError) {
                console.error('Encoding error:', encodingError);
                displayError(`Error encoding message: ${encodingError.message}`);
            } finally {
                loading.classList.add('hidden');
            }
        };

        reader.onerror = function() {
            displayError('Error reading the uploaded file.');
            loading.classList.add('hidden');
        };

        reader.readAsDataURL(file);

    } catch (error) {
        console.error('Upload error:', error);
        displayError(`Error: ${error.message}`);
        loading.classList.add('hidden');
    }
}

// Helper function to encode message from a data URL (for uploaded images)
async function encodeMessageFromDataUrl(imageDataUrl, secretMessage) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const safeDataUrl = canvas.toDataURL('image/png');
            
            steg.encode(safeDataUrl, secretMessage, (encodedDataUrl) => {
                if (encodedDataUrl) {
                    resolve(encodedDataUrl);
                } else {
                    reject(new Error("Steganography encoding failed."));
                }
            });
        };
        img.onerror = function() {
            reject(new Error('Failed to load the uploaded image for encoding.'));
        };
        img.src = imageDataUrl;
    });
}