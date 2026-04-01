const API_BASE = '/api/v1';
const TOKEN_STORAGE_KEY = 'matchpoint_token';

let token = localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
let currentConversationId = null;
let me = null;

const userBadge = document.getElementById('userBadge');
const toast = document.getElementById('toast');
const messagesEl = document.getElementById('messages');
const conversationListEl = document.getElementById('conversationList');
const seniorSelectEl = document.getElementById('seniorSelect');

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 1800);
}

async function api(path, options = {}) {
  const headers = options.headers ?? {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  return data;
}

function setAuthToken(value) {
  token = value;
  if (value) {
    localStorage.setItem(TOKEN_STORAGE_KEY, value);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function renderMessage(message) {
  const div = document.createElement('div');
  const roleClass = message.role === 'USER' ? 'user' : 'assistant';
  div.className = `message ${roleClass}`;
  div.textContent = message.content;

  if (message.role === 'ASSISTANT' && message.references && message.references.length) {
    const refs = document.createElement('div');
    refs.className = 'refs';
    refs.innerHTML = message.references
      .map((ref) => {
        const title = ref.entry?.title ?? `经验 ${ref.entryId}`;
        const senior = ref.entry?.seniorProfile?.name
          ? ` - ${ref.entry.seniorProfile.name}`
          : '';
        return `[E${ref.entryId}] ${title}${senior}`;
      })
      .join('<br/>');
    div.appendChild(refs);
  }

  messagesEl.appendChild(div);
}

function clearMessages() {
  messagesEl.innerHTML = '';
}

async function refreshMeAndProfile() {
  if (!token) {
    userBadge.textContent = '未登录';
    me = null;
    return;
  }

  try {
    me = await api('/auth/me');
    userBadge.textContent = `${me.username} (${me.email})`;
    const profileData = await api('/profile/me');
    fillProfileForm(profileData.profile ?? {});
  } catch (error) {
    console.error(error);
    setAuthToken('');
    userBadge.textContent = '未登录';
    me = null;
  }
}

function fillProfileForm(profile) {
  const form = document.getElementById('profileForm');
  form.school.value = profile.school ?? '';
  form.grade.value = profile.grade ?? '';
  form.major.value = profile.major ?? '';
  form.target.value = profile.target ?? '';
  form.tags.value = Array.isArray(profile.tags) ? profile.tags.join(',') : '';
  form.bio.value = profile.bio ?? '';
}

async function loadConversations() {
  if (!token) {
    conversationListEl.innerHTML = '';
    return;
  }
  const conversations = await api('/chat/conversations');
  conversationListEl.innerHTML = '';

  for (const convo of conversations) {
    const item = document.createElement('div');
    item.className = `list-item ${currentConversationId === convo.id ? 'active' : ''}`;
    item.textContent = `${convo.title || '未命名会话'} (${convo._count.messages})`;
    item.onclick = async () => {
      currentConversationId = convo.id;
      await loadConversationMessages();
      await loadConversations();
    };
    conversationListEl.appendChild(item);
  }
}

async function loadConversationMessages() {
  clearMessages();
  if (!currentConversationId || !token) return;
  const messages = await api(`/chat/conversations/${currentConversationId}/messages`);
  for (const message of messages) {
    renderMessage(message);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function createConversation(title = '') {
  const convo = await api('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  currentConversationId = convo.id;
  await loadConversations();
  await loadConversationMessages();
}

async function loadSeniors() {
  const seniors = await api('/knowledge/seniors');
  seniorSelectEl.innerHTML = '';
  if (!seniors.length) {
    const empty = document.createElement('option');
    empty.textContent = '请先新增师兄师姐画像';
    empty.value = '';
    seniorSelectEl.appendChild(empty);
    return;
  }

  for (const senior of seniors) {
    const option = document.createElement('option');
    option.value = String(senior.id);
    option.textContent = `${senior.name} - ${senior.school}${senior.direction ? ` (${senior.direction})` : ''}`;
    seniorSelectEl.appendChild(option);
  }
}

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email.value.trim(),
        username: form.username.value.trim(),
        password: form.password.value,
      }),
    });
    setAuthToken(data.accessToken);
    await refreshMeAndProfile();
    await loadConversations();
    showToast('注册成功');
    form.reset();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: form.identifier.value.trim(),
        password: form.password.value,
      }),
    });
    setAuthToken(data.accessToken);
    await refreshMeAndProfile();
    await loadConversations();
    showToast('登录成功');
    form.reset();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  setAuthToken('');
  currentConversationId = null;
  me = null;
  clearMessages();
  await refreshMeAndProfile();
  await loadConversations();
  showToast('已退出');
});

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');
  const form = event.target;
  try {
    await api('/profile/me', {
      method: 'PUT',
      body: JSON.stringify({
        school: form.school.value.trim(),
        grade: form.grade.value.trim(),
        major: form.major.value.trim(),
        target: form.target.value.trim(),
        tags: form.tags.value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        bio: form.bio.value.trim(),
      }),
    });
    showToast('主页已保存');
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById('newConversationBtn').addEventListener('click', async () => {
  if (!token) return showToast('请先登录');
  await createConversation();
});

document.getElementById('askForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');

  const questionInput = document.getElementById('questionInput');
  const question = questionInput.value.trim();
  if (!question) return;

  if (!currentConversationId) {
    await createConversation(question.slice(0, 20));
  }

  renderMessage({ role: 'USER', content: question, references: [] });
  questionInput.value = '';

  try {
    const message = await api(`/chat/conversations/${currentConversationId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
    renderMessage(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    await loadConversations();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById('seniorForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');
  const form = event.target;
  try {
    await api('/knowledge/seniors', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.value.trim(),
        school: form.school.value.trim(),
        major: form.major.value.trim(),
        graduationYear: form.graduationYear.value ? Number(form.graduationYear.value) : undefined,
        destination: form.destination.value.trim(),
        direction: form.direction.value.trim(),
        intro: form.intro.value.trim(),
      }),
    });
    showToast('画像已新增');
    form.reset();
    await loadSeniors();
  } catch (error) {
    showToast(error.message);
  }
});

document.getElementById('entryForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');
  const form = event.target;
  try {
    await api('/knowledge/entries', {
      method: 'POST',
      body: JSON.stringify({
        seniorProfileId: Number(form.seniorProfileId.value),
        title: form.title.value.trim(),
        category: form.category.value,
        content: form.content.value.trim(),
        applicableTo: form.applicableTo.value.trim(),
        outcome: form.outcome.value.trim(),
        sourceNote: form.sourceNote.value.trim(),
        tags: form.tags.value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    showToast('经验已入库');
    form.reset();
  } catch (error) {
    showToast(error.message);
  }
});

async function init() {
  await refreshMeAndProfile();
  await loadSeniors();
  await loadConversations();
  if (!currentConversationId && token) {
    const list = await api('/chat/conversations');
    if (list.length) {
      currentConversationId = list[0].id;
      await loadConversationMessages();
      await loadConversations();
    }
  }
}

init().catch((error) => {
  console.error(error);
  showToast('初始化失败，请检查后端是否运行');
});
