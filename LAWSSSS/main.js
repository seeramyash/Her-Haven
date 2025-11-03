// LegalAI Assistant - Main JavaScript File
// Comprehensive functionality for AI-powered legal assistance

// Global variables and configuration
// Session history variables removed
let legalDatabase = [];
let isTyping = false;

// Gemini API Configuration
const GEMINI_API_KEY = (typeof window !== 'undefined' && window?.env?.GEMINI_API_KEY) ? window.env.GEMINI_API_KEY : '';
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
// Note: 'gemini-pro' is a commonly used model. 'gemini-2.5-flash' might also be valid.

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadLegalDatabase();
    initializeAnimations();
});

// Initialize core application functionality
function initializeApp() {
    // Session history loading removed
    
    // Initialize scroll reveal animations
    setupScrollReveal();
    
    // Setup statistics counters
    setupCounters();
    
    // Session initialization removed
    
    console.log('LegalAI Assistant initialized successfully');
}

// Setup event listeners for interactive elements
function setupEventListeners() {
    // Chat input handling
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Search functionality
    // Removed as Legal Resources feature is removed.

    // History search removed
    // Category filters
    // Removed as Legal Resources feature is removed.
}

// Initialize scroll reveal animations
function setupScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Setup animated counters for statistics
function setupCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        // Start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Chat functionality
function startChat() {
    const chatSection = document.querySelector('.legal-pattern');
    if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus on input field
        const userInput = document.getElementById('user-input');
        if (userInput) {
            setTimeout(() => {
                userInput.focus();
            }, 1000);
        }
    }
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message || isTyping) return;
    
    addChatMessage(message, 'user');
    userInput.value = '';
    
    showTypingIndicator();
    
    // Now directly await the AI response
    await generateAIResponse(message);
    hideTypingIndicator(); // Hide indicator after response is generated and added
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start space-x-3 message-sent-animation ${sender === 'user' ? 'justify-end' : ''}`;
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="chat-bubble rounded-lg p-5 md:p-6 bg-[var(--rose-2)] text-[var(--charcoal)] whitespace-pre-wrap break-words leading-relaxed">
                <p class="text-[15px] md:text-base">${message}</p>
            </div>
            <div class="w-8 h-8 bg-[var(--navy)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-[var(--rose-2)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
            </div>
        `;
    } else {
        // Parse Markdown content for AI responses
        const htmlMessage = marked.parse(message);
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-[var(--navy)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-[var(--rose-2)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <div class="chat-bubble rounded-lg p-5 md:p-6 whitespace-pre-wrap break-words leading-relaxed text-[15px] md:text-base">
                ${htmlMessage}
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Session history storage removed
}

function showTypingIndicator() {
    isTyping = true;
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex items-start space-x-3';
    typingDiv.innerHTML = `
        <div class="w-8 h-8 bg-[var(--navy)] rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-[var(--rose-2)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>
        <div class="chat-bubble rounded-lg p-5 md:p-6">
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-indicator"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-indicator" style="animation-delay: 0.2s;"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-indicator" style="animation-delay: 0.4s;"></div>
            </div>
        </div>
    `;
    
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function generateAIResponse(userMessage) {
    try {
        const response = await analyzeLegalQuery(userMessage);
        addChatMessage(response, 'ai');
    } catch (error) {
        console.error("Error generating AI response:", error);
        addChatMessage("I'm sorry, but I encountered an error when trying to fetch a response. Please try again later.", 'ai');
    }
    // Session saving removed
}

async function analyzeLegalQuery(message) {
    const prompt = `You are a legal assistant specializing in Indian women's legal rights and Indian laws. First, ask 2-3 most relevant clarifying questions to understand the user's situation. Once you have enough information, immediately provide helpful, informative, and actionable advice based on the Indian legal framework, including relevant laws, rights, and tips to follow. Respond concisely and use bullet points for all information, including questions and advice. Do not ask more than 3 questions.

User query: "${message}"

Your response:`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(GEMINI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        if (data && data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0 && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "I'm sorry, I couldn't get a clear response from the AI. Please try rephrasing your question.";
        }
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return "I'm experiencing technical difficulties and cannot provide a response right now. Please try again later.";
    }
}

// Quick action buttons
function quickAction(category) {
    const userInput = document.getElementById('user-input');
    if (!userInput) return;
    
    const prompts = {
        employment: "I'm experiencing workplace discrimination. Can you explain my rights under employment law?",
        family: "I need information about domestic violence protection and family law rights.",
        maternity: "I'm pregnant and want to understand my rights regarding maternity leave and workplace accommodations.",
        housing: "I'm facing housing discrimination. What are my rights under the Fair Housing Act?"
    };
    
    userInput.value = prompts[category] || "";
    userInput.focus();
    
    // Scroll to chat
    const chatSection = document.querySelector('.legal-pattern');
    if (chatSection) {
        chatSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Legal resources functionality
// Removed as Legal Resources feature is removed.

// Session management and history page functionality removed
// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Removed scrollToFeatures as the button is removed
// Animation and visual effects
function initializeAnimations() {
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
    
    // Setup floating elements animation
    setupFloatingElements();
    
    // Initialize any other visual effects
    setupVisualEffects();
}

function setupFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach((element, index) => {
        anime({
            targets: element,
            translateY: [-10, 10],
            duration: 3000 + (index * 500),
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true
        });
    });
}

function setupVisualEffects() {
    // Add any additional visual effects here
    // This could include particle effects, background animations, etc.
}

// Placeholder functions for various features
// Session history related functions removed
// Removed as the "New Consultation" feature is removed.

function managePrivacy() {
    alert('Privacy settings would allow you to:\n\n• Configure data retention periods\n• Enable/disable session logging\n• Set up automatic data deletion\n• Manage encryption preferences\n• Export/delete your data');
}

// Download functionality removed with session history
// Load legal database
function loadLegalDatabase() {
    // This would typically load from an external source
    // For now, we'll use the embedded data in the HTML
    console.log('Legal database loaded successfully');
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('LegalAI Assistant Error:', e.error);
});

// Service worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker would be registered here for offline capabilities
        console.log('LegalAI Assistant ready for offline use');
    });
}

// Export functions for global access
window.LegalAI = {
    startChat,
    sendMessage,
    quickAction,
    // searchLaws, // Removed
    // filterCategory, // Removed
    // Session history related functions removed
    managePrivacy
};