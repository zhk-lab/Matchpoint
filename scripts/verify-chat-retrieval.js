const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000/api/v1';

async function main() {
  const suffix = Math.random().toString(36).slice(2, 10);
  const username = `verify_${suffix}`;
  const email = `${username}@example.com`;
  const password = 'pass12345';

  const register = await axios.post(`${API_BASE}/auth/register`, {
    email,
    username,
    password,
  });

  const token = register.data.accessToken;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const conversation = await axios.post(
    `${API_BASE}/chat/conversations`,
    { title: 'retrieval-check' },
    { headers },
  );

  const ask = await axios.post(
    `${API_BASE}/chat/conversations/${conversation.data.id}/ask`,
    { question: '我想冲中金暑期实习，接下来八周如何安排？' },
    { headers },
  );

  const references = Array.isArray(ask.data.references) ? ask.data.references : [];
  console.log(`model=${ask.data.model ?? 'unknown'}`);
  console.log(`references=${references.length}`);
  if (references.length > 0) {
    console.log(`first_entry_id=${references[0].entryId}`);
  }
}

main().catch((error) => {
  const message = error?.response?.data ?? error.message;
  console.error('verify failed:', message);
  process.exitCode = 1;
});
