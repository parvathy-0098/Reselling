// frontend/js/messages.js

// Message management functions
let currentConversation = null;
let messageRefreshInterval = null;

// Initialize messaging system
function initializeMessaging() {
    if (!requireAuth()) return;
    
    loadConversations();
    setupMessageRefresh();
}

// Load user conversations
async function loadConversations() {
    try {
        const messages = await api.get('/users/messages');
        displayConversations(messages.data);
    } catch (error) {
        console.error('Error loading conversations:', error);
        showNotification('Failed to load messages', 'error');
    }
}

// Display conversations list
function displayConversations(messages) {
    const container = document.getElementById('conversationsList');
    if (!container) return;
    
    // Group messages by conversation
    const conversations = groupMessagesByConversation(messages);
    
    if (conversations.length === 0) {
        container.innerHTML = '<div class="no-messages">No messages yet</div>';
        return;
    }
    
    container.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${!conv.is_read ? 'unread' : ''}" 
             onclick="openConversation(${conv.other_user_id}, '${conv.other_user_name}')">
            <div class="conversation-avatar">
                ${conv.other_user_name.charAt(0).toUpperCase()}
            </div>
            <div class="conversation-content">
                <h4>${conv.other_user_name}</h4>
                <p class="last-message">${conv.last_message}</p>
                <span class="message-time">${formatRelativeTime(conv.last_message_time)}</span>
            </div>
            ${!conv.is_read ? '<span class="unread-indicator"></span>' : ''}
        </div>
    `).join('');
}

// Group messages by conversation
function groupMessagesByConversation(messages) {
    const conversations = {};
    const userId = getUser().id;
    
    messages.forEach(msg => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const otherUserName = msg.sender_id === userId ? msg.receiver_name : msg.sender_name;
        
        if (!conversations[otherUserId]) {
            conversations[otherUserId] = {
                other_user_id: otherUserId,
                other_user_name: otherUserName,
                messages: [],
                last_message: msg.message,
                last_message_time: msg.created_at,
                is_read: msg.is_read || msg.sender_id === userId
            };
        }
        
        conversations[otherUserId].messages.push(msg);
        
        // Update last message if this is more recent
        if (new Date(msg.created_at) > new Date(conversations[otherUserId].last_message_time)) {
            conversations[otherUserId].last_message = msg.message;
            conversations[otherUserId].last_message_time = msg.created_at;
        }
        
        // Mark as unread if any message is unread
        if (!msg.is_read && msg.receiver_id === userId) {
            conversations[otherUserId].is_read = false;
        }
    });
    
    // Convert to array and sort by last message time
    return Object.values(conversations)
        .sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
}

// Open conversation
async function openConversation(userId, userName) {
    currentConversation = { userId, userName };
    
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatWindow.style.display = 'block';
    }
    
    document.getElementById('chatUserName').textContent = userName;
    
    // Load messages for this conversation
    await loadConversationMessages(userId);
    
    // Mark messages as read
    await markConversationAsRead(userId);
}

// Load messages for specific conversation
async function loadConversationMessages(otherUserId) {
    try {
        const messages = await api.get('/users/messages');
        const currentUserId = getUser().id;
        
        // Filter messages for this conversation
        const conversationMessages = messages.data.filter(msg => 
            (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
        );
        
        displayConversationMessages(conversationMessages);
    } catch (error) {
        console.error('Error loading conversation:', error);
    }
}

// Display messages in conversation
function displayConversationMessages(messages) {
    const container = document.getElementById('messagesList');
    if (!container) return;
    
    const currentUserId = getUser().id;
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender_id === currentUserId ? 'sent' : 'received'}">
            <div class="message-content">
                ${msg.product_id ? `<p class="message-product">Re: Product #${msg.product_id}</p>` : ''}
                <p>${msg.message}</p>
                <span class="message-time">${formatRelativeTime(msg.created_at)}</span>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Send message
async function sendMessage(receiverId, message, productId = null, subject = null) {
    try {
        const data = {
            receiver_id: receiverId,
            message: message,
            product_id: productId,
            subject: subject
        };
        
        await api.post('/users/messages', data);
        
        // Refresh conversation if open
        if (currentConversation && currentConversation.userId === receiverId) {
            await loadConversationMessages(receiverId);
        }
        
        showNotification('Message sent successfully', 'success');
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message', 'error');
        return false;
    }
}

// Send message from form
async function sendMessageFromForm(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message || !currentConversation) return;
    
    const sent = await sendMessage(currentConversation.userId, message);
    if (sent) {
        messageInput.value = '';
    }
}

// Mark conversation as read
async function markConversationAsRead(otherUserId) {
    try {
        const messages = await api.get('/users/messages');
        const unreadMessages = messages.data.filter(msg => 
            msg.sender_id === otherUserId && 
            msg.receiver_id === getUser().id && 
            !msg.is_read
        );
        
        // Mark each unread message as read
        for (const msg of unreadMessages) {
            await api.put(`/users/messages/${msg.id}/read`);
        }
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

// Close chat window
function closeChatWindow() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatWindow.style.display = 'none';
    }
    currentConversation = null;
}

// Setup message refresh
function setupMessageRefresh() {
    // Refresh messages every 30 seconds
    messageRefreshInterval = setInterval(() => {
        if (currentConversation) {
            loadConversationMessages(currentConversation.userId);
        }
        loadConversations();
    }, 30000);
}

// Contact seller from product page
async function contactSeller(sellerId, sellerName, productId, productTitle) {
    const modal = `
        <div id="contactModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeContactModal()">&times;</span>
                <h2>Contact ${sellerName}</h2>
                <p>About: ${productTitle}</p>
                
                <form onsubmit="sendContactMessage(event, ${sellerId}, ${productId})">
                    <div class="form-group">
                        <label for="contactSubject">Subject</label>
                        <input type="text" id="contactSubject" value="Inquiry about: ${productTitle}" required>
                    </div>
                    <div class="form-group">
                        <label for="contactMessage">Message</label>
                        <textarea id="contactMessage" rows="5" required 
                                  placeholder="Hi, I'm interested in this product..."></textarea>
                    </div>
                    <button type="submit" class="btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    document.getElementById('contactModal').style.display = 'block';
}

// Send contact message
async function sendContactMessage(event, sellerId, productId) {
    event.preventDefault();
    
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    const sent = await sendMessage(sellerId, message, productId, subject);
    if (sent) {
        closeContactModal();
    }
}

// Close contact modal
function closeContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.remove();
    }
}

// Get unread message count
async function getUnreadMessageCount() {
    try {
        const messages = await api.get('/users/messages');
        const userId = getUser().id;
        
        const unreadCount = messages.data.filter(msg => 
            msg.receiver_id === userId && !msg.is_read
        ).length;
        
        updateUnreadBadge(unreadCount);
        return unreadCount;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}

// Update unread message badge
function updateUnreadBadge(count) {
    const badge = document.getElementById('messageBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
});

// Export functions
window.initializeMessaging = initializeMessaging;
window.openConversation = openConversation;
window.sendMessageFromForm = sendMessageFromForm;
window.closeChatWindow = closeChatWindow;
window.contactSeller = contactSeller;
window.sendContactMessage = sendContactMessage;
window.closeContactModal = closeContactModal;
window.getUnreadMessageCount = getUnreadMessageCount;