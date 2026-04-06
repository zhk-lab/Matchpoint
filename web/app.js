const API_BASE = '/api/v1';
const TOKEN_STORAGE_KEY = 'matchpoint_token';

let token = localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
let currentConversationId = null;
let me = null;

const byId = (id) => document.getElementById(id);
const userBadge = byId('userBadge');
const toast = byId('toast');
const messagesEl = byId('messages');
const conversationListEl = byId('conversationList');
const seniorSelectEl = byId('seniorSelect');
const CATEGORY_LABEL = {
  INTERNSHIP: '实习',
  GRADUATE_RECOMMENDATION: '保研',
  CAREER_PLANNING: '职业规划',
  COURSE_SELECTION: '选课',
  RESEARCH: '科研',
  JOB_HUNT: '求职',
  OTHER: '其他',
};

function normalizeRole(role) {
  return role === 'SENIOR' ? 'SENIOR' : 'USER';
}

function stripThinkBlocks(content) {
  if (typeof content !== 'string') return '';
  return content
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/^<\/?think>\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function showToast(message) {
  if (!toast) return;
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

function createChip(text) {
  const chip = document.createElement('span');
  chip.className = 'mentor-chip';
  chip.textContent = text;
  return chip;
}

function renderMentorCards(references) {
  const validRefs = (references ?? []).filter((ref) => ref?.entry?.seniorProfile);
  if (!validRefs.length) return null;

  const grouped = new Map();
  for (const ref of validRefs) {
    const senior = ref.entry.seniorProfile;
    const key = senior.id ? `senior-${senior.id}` : `${senior.name}-${senior.school}`;
    if (!grouped.has(key)) {
      grouped.set(key, { senior, refs: [] });
    }
    grouped.get(key).refs.push(ref);
  }

  const cards = document.createElement('div');
  cards.className = 'mentor-cards';

  for (const group of grouped.values()) {
    const card = document.createElement('article');
    card.className = 'mentor-card';

    const header = document.createElement('div');
    header.className = 'mentor-header';
    const nameEl = document.createElement('h5');
    nameEl.textContent = group.senior.name || '未命名学长学姐';
    const schoolEl = document.createElement('p');
    schoolEl.textContent = group.senior.school || '学校未知';
    header.appendChild(nameEl);
    header.appendChild(schoolEl);

    const meta = document.createElement('div');
    meta.className = 'mentor-meta';
    if (group.senior.direction) meta.appendChild(createChip(group.senior.direction));
    if (group.senior.destination) meta.appendChild(createChip(group.senior.destination));
    if (group.senior.major) meta.appendChild(createChip(group.senior.major));
    if (group.senior.graduationYear) meta.appendChild(createChip(`${group.senior.graduationYear} 届`));

    const titles = [
      ...new Set(group.refs.map((ref) => ref.entry?.title).filter((title) => typeof title === 'string')),
    ].slice(0, 3);
    const categories = [
      ...new Set(
        group.refs
          .map((ref) => {
            const code = ref.entry?.category;
            return code ? CATEGORY_LABEL[code] || code : '';
          })
          .filter(Boolean),
      ),
    ];
    const firstOutcome = group.refs
      .map((ref) => ref.entry?.outcome?.trim())
      .find((value) => typeof value === 'string' && value.length > 0);
    const firstApplicable = group.refs
      .map((ref) => ref.entry?.applicableTo?.trim())
      .find((value) => typeof value === 'string' && value.length > 0);

    const whyParts = [];
    if (categories.length) whyParts.push(`在${categories.join('、')}方向有直接经验`);
    if (titles.length) whyParts.push(`代表经历包括「${titles.join('」、「')}」`);
    if (group.senior.destination) whyParts.push(`当前去向是${group.senior.destination}`);
    if (firstOutcome) whyParts.push(`已验证结果：${firstOutcome}`);
    if (firstApplicable) whyParts.push(`更适合：${firstApplicable}`);

    const why = document.createElement('p');
    why.className = 'mentor-why';
    why.textContent = whyParts.length
      ? `为什么可能帮到你：${whyParts.join('；')}。`
      : '为什么可能帮到你：该学长学姐在相关主题下有可引用经验。';

    const refsLine = document.createElement('p');
    refsLine.className = 'mentor-refs-line';
    const refText = [
      ...new Set(group.refs.map((ref) => `[E${ref.entryId}] ${ref.entry?.title ?? '经验条目'}`)),
    ].join(' | ');
    refsLine.textContent = `关联资料：${refText}`;

    card.appendChild(header);
    if (meta.childNodes.length) card.appendChild(meta);
    card.appendChild(why);
    card.appendChild(refsLine);
    cards.appendChild(card);
  }

  return cards;
}

function renderMessage(message) {
  if (!messagesEl) return;
  const div = document.createElement('div');
  const roleClass = message.role === 'USER' ? 'user' : 'assistant';
  div.className = `message ${roleClass}`;
  const safeContent = stripThinkBlocks(message.content);
  div.textContent = safeContent || '（无可展示内容）';

  if (message.role === 'ASSISTANT' && message.references && message.references.length) {
    const refs = document.createElement('div');
    refs.className = 'refs';

    const title = document.createElement('h6');
    title.className = 'mentor-title';
    title.textContent = '匹配到的学长学姐明信片';
    refs.appendChild(title);

    const mentorCards = renderMentorCards(message.references);
    if (mentorCards) {
      refs.appendChild(mentorCards);
    } else {
      const fallback = document.createElement('p');
      fallback.className = 'mentor-refs-line';
      fallback.textContent = message.references
        .map((ref) => `[E${ref.entryId}] ${ref.entry?.title ?? '经验条目'}`)
        .join(' | ');
      refs.appendChild(fallback);
    }
    div.appendChild(refs);
  }

  messagesEl.appendChild(div);
}

function clearMessages() {
  if (!messagesEl) return;
  messagesEl.innerHTML = '';
}

async function refreshMeAndProfile() {
  if (!token) {
    if (userBadge) userBadge.textContent = '未登录';
    me = null;
    applyProfilePageState();
    return;
  }

  try {
    me = await api('/auth/me');
    me.role = normalizeRole(me.role);
    if (userBadge) userBadge.textContent = `${me.username} (${me.email})`;
    applyProfilePageState();
    if (byId('profileForm')) {
      const profileData = await api('/profile/me');
      fillProfileForm(profileData.profile ?? {});
    }
  } catch (error) {
    console.error(error);
    setAuthToken('');
    if (userBadge) userBadge.textContent = '未登录';
    me = null;
    applyProfilePageState();
  }
}

function fillProfileForm(profile) {
  const form = byId('profileForm');
  if (!form) return;
  form.school.value = profile.school ?? '';
  form.grade.value = profile.grade ?? '';
  form.major.value = profile.major ?? '';
  form.target.value = profile.target ?? '';
  form.tags.value = Array.isArray(profile.tags) ? profile.tags.join(',') : '';
  form.bio.value = profile.bio ?? '';
}

async function loadConversations() {
  if (!conversationListEl) return;
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
  if (!messagesEl) return;
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
  if (!seniorSelectEl) return;
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

const registerForm = byId('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email.value.trim(),
        username: form.username.value.trim(),
        password: form.password.value,
        role: normalizeRole(form.role?.value),
      }),
    });
    setAuthToken(data.accessToken);
    await refreshMeAndProfile();
    await loadConversations();
    showToast('注册成功');
    form.reset();
    window.location.href = '/profile.html';
  } catch (error) {
    showToast(error.message);
  }
  });
}

const loginForm = byId('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
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
    window.location.href = '/profile.html';
  } catch (error) {
    showToast(error.message);
  }
  });
}

const logoutBtn = byId('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    setAuthToken('');
    currentConversationId = null;
    me = null;
    clearMessages();
    await refreshMeAndProfile();
    await loadConversations();
    showToast('已退出');
  });
}

const profileForm = byId('profileForm');
if (profileForm) {
  profileForm.addEventListener('submit', async (event) => {
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
}

const newConversationBtn = byId('newConversationBtn');
if (newConversationBtn) {
  newConversationBtn.addEventListener('click', async () => {
    if (!token) return showToast('请先登录');
    await createConversation();
  });
}

const askForm = byId('askForm');
if (askForm) {
  askForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');

  const questionInput = byId('questionInput');
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
}

const seniorForm = byId('seniorForm');
if (seniorForm) {
  seniorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');
  if (normalizeRole(me?.role) !== 'SENIOR') return showToast('仅 Senior 可新增画像');
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
}

const entryForm = byId('entryForm');
if (entryForm) {
  entryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!token) return showToast('请先登录');
  if (normalizeRole(me?.role) !== 'SENIOR') return showToast('仅 Senior 可新增经验');
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
}

function setActiveNav() {
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  if (!navLinks.length) return;

  const path = window.location.pathname === '/' ? '/index.html' : window.location.pathname;
  for (const nav of navLinks) {
    const href = nav.getAttribute('href') || '';
    const normalizedHref = href === '/' ? '/index.html' : href;
    if (normalizedHref === path) nav.classList.add('active');
  }
}

function getAuthRoleFromUrl() {
  const role = new URLSearchParams(window.location.search).get('role');
  if (!role) return 'USER';
  return normalizeRole(String(role).toUpperCase());
}

function initAuthRouteHint() {
  const registerFormEl = byId('registerForm');
  if (!registerFormEl) return;

  const role = getAuthRoleFromUrl();
  const roleInput = byId('registerRoleInput');
  const registerTitle = byId('registerTitle');
  const registerBtn = byId('registerBtn');
  const profileStateHint = byId('profileStateHint');
  const seniorPathBtn = byId('seniorPathBtn');
  const userPathBtn = byId('userPathBtn');

  if (roleInput) roleInput.value = role;
  if (registerTitle) {
    registerTitle.textContent = role === 'SENIOR' ? '学长学姐注册（Senior）' : '学生咨询者注册（User）';
  }
  if (registerBtn) {
    registerBtn.textContent = role === 'SENIOR' ? '注册为 Senior' : '注册为 User';
  }
  if (profileStateHint && !token) {
    profileStateHint.textContent =
      role === 'SENIOR'
        ? '未登录状态：当前选择 Senior 注册路径，登录后可维护经验库。'
        : '未登录状态：当前选择 User 注册路径，登录后可维护个人主页并发起咨询。';
  }
  if (seniorPathBtn) seniorPathBtn.classList.toggle('active', role === 'SENIOR');
  if (userPathBtn) userPathBtn.classList.toggle('active', role === 'USER');
}

function renderIdentityCapabilities(items) {
  const container = byId('identityCapability');
  if (!container) return;
  container.innerHTML = '';
  for (const item of items) {
    const pill = document.createElement('span');
    pill.className = 'identity-pill';
    pill.textContent = item;
    container.appendChild(pill);
  }
}

function updateFloatingActions(role, isLoggedIn) {
  const floatingActions = byId('floatingActions');
  const quickPrimary = byId('quickPrimary');
  const quickSecondary = byId('quickSecondary');
  if (!floatingActions || !quickPrimary || !quickSecondary) return;

  floatingActions.classList.toggle('hidden', !isLoggedIn);
  if (!isLoggedIn) return;

  quickPrimary.textContent = '去聊天提问';
  quickPrimary.href = '/chat.html';

  if (role === 'SENIOR') {
    quickSecondary.textContent = '去 Senior 履历区';
    quickSecondary.href = '#seniorOnlyBlock';
  } else {
    quickSecondary.textContent = '编辑个人主页';
    quickSecondary.href = '#profileForm';
  }
}

function applyProfilePageState() {
  const profileGuestBlock = byId('profileGuestBlock');
  const profileMemberBlock = byId('profileMemberBlock');
  const seniorOnlyBlock = byId('seniorOnlyBlock');
  const userOnlyBlock = byId('userOnlyBlock');
  const memberRoleBadge = byId('memberRoleBadge');
  const memberRoleDesc = byId('memberRoleDesc');
  const profileStateHint = byId('profileStateHint');
  const basicProfileTitle = byId('basicProfileTitle');
  const basicProfileHint = byId('basicProfileHint');
  const identityCard = byId('identityCard');
  const identityAvatar = byId('identityAvatar');
  const identityTitle = byId('identityTitle');

  const hasProfilePage = Boolean(profileGuestBlock || profileMemberBlock);
  if (!hasProfilePage) return;

  const isLoggedIn = Boolean(token && me);
  updateFloatingActions('USER', isLoggedIn);
  if (profileGuestBlock) profileGuestBlock.classList.toggle('hidden', isLoggedIn);
  if (profileMemberBlock) profileMemberBlock.classList.toggle('hidden', !isLoggedIn);
  if (!isLoggedIn) return;

  const role = normalizeRole(me.role);
  updateFloatingActions(role, isLoggedIn);
  if (memberRoleBadge) memberRoleBadge.textContent = role;
  if (seniorOnlyBlock) seniorOnlyBlock.classList.toggle('hidden', role !== 'SENIOR');
  if (userOnlyBlock) userOnlyBlock.classList.toggle('hidden', role !== 'USER');

  if (identityCard) {
    identityCard.classList.toggle('identity-card-senior', role === 'SENIOR');
    identityCard.classList.toggle('identity-card-user', role !== 'SENIOR');
  }
  if (identityAvatar) {
    identityAvatar.textContent = role === 'SENIOR' ? 'S' : 'U';
  }
  if (identityTitle) {
    identityTitle.textContent = role === 'SENIOR' ? 'Senior 个人主页' : 'User 个人主页';
  }
  if (memberRoleBadge) {
    memberRoleBadge.classList.toggle('senior', role === 'SENIOR');
    memberRoleBadge.classList.toggle('user', role !== 'SENIOR');
  }

  if (memberRoleDesc) {
    memberRoleDesc.textContent =
      role === 'SENIOR'
        ? 'Senior 身份可维护个人主页（基础信息 + 履历 + 经验条目）。'
        : 'User 身份可维护个人主页并前往聊天咨询。';
  }
  if (profileStateHint) {
    profileStateHint.textContent =
      role === 'SENIOR'
        ? '已登录（Senior）：你当前看到的是 Senior 个人主页。'
        : '已登录（User）：你当前看到的是 User 个人主页。';
  }
  if (basicProfileTitle) {
    basicProfileTitle.textContent =
      role === 'SENIOR' ? '个人主页（Senior 基础信息）' : '个人主页（User 基础信息）';
  }
  if (basicProfileHint) {
    basicProfileHint.textContent =
      role === 'SENIOR'
        ? '先填写基础信息，再补充履历和经验条目，这些内容会用于对外展示和回答引用。'
        : '填写你的背景与目标，聊天建议会更精准。';
  }
  renderIdentityCapabilities(
    role === 'SENIOR'
      ? ['基础信息', 'Senior 履历', '经验条目入库', '可被聊天引用']
      : ['基础信息', '目标方向梳理', '一键去聊天提问'],
  );
}

async function init() {
  setActiveNav();
  initAuthRouteHint();
  await refreshMeAndProfile();
  if (me?.role === 'SENIOR') {
    await loadSeniors();
  }
  await loadConversations();
  if (!currentConversationId && token && conversationListEl) {
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
