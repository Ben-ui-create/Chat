// // Global State Tracking
// let currentTargetId = null;
// let socket = null;
//
// // DOM Elements
// const membersList = document.getElementById('members-list');
// const messagesList = document.getElementById('messages-list');
// const chatForm = document.getElementById('chat-form');
// const msgInput = document.getElementById('msg-input');
// const chatHeader = document.querySelector('#chat-area .header');
//
// // 1. Fetch Auth Token from Cookies/Storage
// // Assumes your checkToken.js script stores the JWT inside localStorage under 'token'
// const token = localStorage.getItem('token');
//
// if (!token) {
//   alert('No token found. Please log in.');
//   window.location.href = '/login.html'; // Redirect to login if unauthenticated
// }
//
// // 2. Initialize Socket.IO with Auth Options
// function initSocket() {
//   socket = io({
//     auth: { token: `Bearer ${token}` }
//   });
//
//   socket.on('connect', () => {
//     console.log('Connected to real-time socket server.');
//   });
//
//   // Listen for incoming live chat messages
//   socket.on('new_message', (messageData) => {
//     Toastify({
//       text: "New message: " + messageData.message,
//       className: "info",
//       style: {
//         background: "linear-gradient(to right, #00b09b, #96c93d)",
//       }
//     }).showToast();
//
//     // If message belongs to the current open chat, append it visually
//     if (currentTargetId && (messageData.from === currentTargetId || messageData.to === currentTargetId)) {
//       appendMessage(messageData);
//     }
//   });
//
//   socket.on('error', (err) => {
//     console.error('Socket error:', err.message);
//   });
//
//   socket.on('disconnect', () => {
//     console.log('Disconnected from socket server.');
//   });
// }
//
// // 3. API Request Helper
// async function apiRequest(url, method = 'POST', body = null) {
//   try {
//     const headers = {
//       'Content-Type': 'application/json',
//       'Authorization': `${token}`
//     };
//
//     const options = { method, headers };
//
//     if (body) options.body = JSON.stringify(body);
//
//     const response = await fetch(url, options);
//     return await response.json();
//   } catch (error) {
//     console.error(`API Error on ${url}:`, error);
//   }
// }
//
// // 4. Fetch and Render Members Sidebar
// async function loadMembersList() {
//   const data = await apiRequest('/api/chat/users/list');
//   if (!data || !data.users) return;
//
//   membersList.innerHTML = ''; // Reset UI list
//
//   data.users.forEach(user => {
//     const li = document.createElement('li');
//     li.textContent = user.username || user.email || `User #${user.id}`;
//     li.dataset.userId = user.id;
//     li.classList.add('member-item');
//
//     // Handle User Selection Context Change
//     li.addEventListener('click', () => selectUserChat(user.id, li.textContent));
//     membersList.appendChild(li);
//   });
// }
//
// // 5. Change Active Chat Context
// async function selectUserChat(userId, displayName) {
//   currentTargetId = parseInt(userId);
//   chatHeader.textContent = `Chat with ${displayName}`;
//
//   // Highlight Active Selection in Sidebar
//   document.querySelectorAll('.member-item').forEach(item => item.classList.remove('active'));
//   const activeItem = document.querySelector(`[data-user-id="${userId}"]`);
//   if (activeItem) activeItem.classList.add('active');
//
//   // Fetch message historical data
//   loadChatMessages(userId);
// }
//
// // 6. Fetch and Render Historic Chat History
// async function loadChatMessages(userId) {
//   messagesList.innerHTML = ''; // Reset chat UI messages viewport
//
//   // Note: Your backend route is explicitly configured to parse req.params.fromId
//   const data = await apiRequest(`/api/chat/messages/${userId}`);
//   if (!data || !data.messages) return;
//
//   // Messages are fetched 'DESC' by date from backend; reverse them to display chronologically (oldest to newest)
//   const chronologicalMessages = data.messages.reverse();
//
//   chronologicalMessages.forEach(msg => appendMessage(msg));
// }
//
// // 7. Append Single Message to the Chat Window UI
// function appendMessage(msgData) {
//   const li = document.createElement('li');
//   li.classList.add('message');
//
//   // Check if the current authenticated client sent this message
//   // You can pull current userId from decoding the local JWT payload if required
//   if (msgData.to === currentTargetId) {
//     li.classList.add('sent');
//   } else {
//     li.classList.add('received');
//   }
//
//   li.innerHTML = `
//         <div class="msg-text">${escapeHTML(msgData.message)}</div>
//     `;
//   messagesList.appendChild(li);
//
//   // Auto Scroll viewport to the bottom of the conversation
//   messagesList.scrollTop = messagesList.scrollHeight;
// }
//
// // 8. Handle HTML Escaping to Prevent XSS
// function escapeHTML(str) {
//   return str.replace(/[&<>'"]/g,
//     tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
//   );
// }
//
// // 9. Process Client Form Message Dispatch
// chatForm.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const msgText = msgInput.value.trim();
//
//   if (!msgText || !currentTargetId) {
//     if (!currentTargetId) alert('Please select a member from the sidebar first.');
//     return;
//   }
//
//   // Deliver to HTTP REST endpoint architecture mapped in your controllers
//   const res = await apiRequest('/api/chat/send/message', 'POST', {
//     to: currentTargetId,
//     message: msgText
//   });
//
//   if (res && res.status === 'ok') {
//     msgInput.value = ''; // Clean field
//
//     // Optimistically show message to sender since standard direct sockets don't self-emit to source room
//     appendMessage({
//       to: currentTargetId,
//       from: 'me', // placeholder string to identify client-sent messages
//       message: msgText
//     });
//   }
// });
//
// // App Entry Points Execution
// initSocket();
// loadMembersList();

// Global State Tracking
let currentTargetId = null;
let socket = null;

// DOM Elements
const membersList = document.getElementById('members-list');
const messagesList = document.getElementById('messages-list');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const chatHeader = document.querySelector('#chat-area .header');

// 1. Initialize Socket.IO with Session Cookies
function initSocket() {
  // Для express-session важно указать withCredentials, чтобы куки передавались при WebSocket-соединении
  socket = io({
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('Connected to real-time socket server via Session.');
  });

  // Listen for incoming live chat messages
  socket.on('new_message', (messageData) => {
    Toastify({
      text: "New message: " + messageData.message,
      className: "info",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
    }).showToast();

    // If message belongs to the current open chat, append it visually
    if (currentTargetId && (messageData.from === currentTargetId || messageData.to === currentTargetId)) {
      appendMessage(messageData);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error (unauthorized?):', err.message);
    // Если сервер сессий возвращает ошибку авторизации, редиректим на логин
    if (err.message === 'xhr poll error' || err.message.includes('auth')) {
      window.location.href = '/login.html';
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server.');
  });
}

// 2. API Request Helper (Сессионная кука отправляется автоматически)
async function apiRequest(url, method = 'POST', body = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
      // Заголовок 'Authorization' больше не нужен, браузер сам прикрепит Cookie
    };

    const options = { method, headers };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    // Если сервер ответил 401 (Unauthorized), отправляем пользователя логиниться
    if (response.status === 401) {
      window.location.href = '/login.html';
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
  }
}

// 3. Fetch and Render Members Sidebar
async function loadMembersList() {
  const data = await apiRequest('/api/chat/users/list', 'POST'); // Изменено на GET для получения данных
  if (!data || !data.users) return;

  membersList.innerHTML = ''; // Reset UI list

  data.users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.username || user.email || `User #${user.id}`;
    li.dataset.userId = user.id;
    li.classList.add('member-item');

    // Handle User Selection Context Change
    li.addEventListener('click', () => selectUserChat(user.id, li.textContent));
    membersList.appendChild(li);
  });
}

// 4. Change Active Chat Context
async function selectUserChat(userId, displayName) {
  currentTargetId = parseInt(userId);
  chatHeader.textContent = `Chat with ${displayName}`;

  // Highlight Active Selection in Sidebar
  document.querySelectorAll('.member-item').forEach(item => item.classList.remove('active'));
  const activeItem = document.querySelector(`[data-user-id="${userId}"]`);
  if (activeItem) activeItem.classList.add('active');

  // Fetch message historical data
  loadChatMessages(userId);
}

// 5. Fetch and Render Historic Chat History
async function loadChatMessages(userId) {
  messagesList.innerHTML = ''; // Reset chat UI messages viewport

  const data = await apiRequest(`/api/chat/messages/${userId}`, 'POST'); // Изменено на GET
  if (!data || !data.messages) return;

  // Messages are fetched 'DESC' by date from backend; reverse them to display chronologically
  const chronologicalMessages = data.messages.reverse();

  chronologicalMessages.forEach(msg => appendMessage(msg));
}

// 6. Append Single Message to the Chat Window UI
function appendMessage(msgData) {
  const li = document.createElement('li');
  li.classList.add('message');

  if (msgData.to === currentTargetId) {
    li.classList.add('sent');
  } else {
    li.classList.add('received');
  }

  li.innerHTML = `
        <div class="msg-text">${escapeHTML(msgData.message)}</div>
    `;
  messagesList.appendChild(li);

  // Auto Scroll viewport to the bottom of the conversation
  messagesList.scrollTop = messagesList.scrollHeight;
}

// 7. Handle HTML Escaping to Prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// 8. Process Client Form Message Dispatch
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgText = msgInput.value.trim();

  if (!msgText || !currentTargetId) {
    if (!currentTargetId) alert('Please select a member from the sidebar first.');
    return;
  }

  const res = await apiRequest('/api/chat/send/message', 'POST', {
    to: currentTargetId,
    message: msgText
  });

  if (res && res.status === 'ok') {
    msgInput.value = ''; // Clean field

    // Optimistically show message to sender
    // appendMessage({
    //   to: currentTargetId,
    //   from: 'me',
    //   message: msgText
    // });
  }
});

// App Entry Points Execution
initSocket();
loadMembersList();