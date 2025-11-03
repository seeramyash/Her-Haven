// Initialize Socket.IO with explicit configuration
const socket = io({
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');
const imageUpload = document.getElementById('image-upload');

let currentUser = null;

// Connection status handling
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    addSystemMessage('Connected to chat room');
});

socket.on('user assigned', (user) => {
    currentUser = user;
    console.log('Assigned user:', user);
    // Don't show username in system message
    addSystemMessage('Connected successfully');
});

socket.on('user joined', (user) => {
    if (user.userId !== currentUser?.userId) {
        addSystemMessage('Someone joined the chat');
    }
});

socket.on('user left', () => {
    addSystemMessage('Someone left the chat');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    addSystemMessage('Disconnected from chat room');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    addSystemMessage('Connection error. Please refresh the page.');
});

// Handle form submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        const messageData = {
            type: 'text',
            content: message,
            timestamp: new Date().toISOString()
        };
        socket.emit('chat message', messageData);
        messageInput.value = '';
    }
});

// Handle image upload
imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                const messageData = {
                    type: 'image',
                    content: data.file.path,
                    timestamp: new Date().toISOString()
                };
                socket.emit('chat message', messageData);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            addSystemMessage('Error uploading image. Please try again.');
        }
    }
});

// Handle incoming messages
socket.on('chat message', (msg) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.socketId === socket.id ? 'sent' : 'received'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    if (msg.type === 'text') {
        // Convert URLs to clickable links
        const textWithLinks = msg.content.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );
        messageContent.innerHTML = textWithLinks;
    } else if (msg.type === 'image') {
        const img = document.createElement('img');
        img.src = msg.content;
        img.alt = 'Uploaded image';
        messageContent.appendChild(img);
    }

    messageDiv.appendChild(messageContent);
    messagesDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Helper function to add system messages
function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
} 