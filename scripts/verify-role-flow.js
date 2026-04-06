const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3000/api/v1';

async function main() {
  const suffix = Math.random().toString(36).slice(2, 10);
  const username = `senior_${suffix}`;
  const email = `${username}@example.com`;
  const password = 'pass12345';

  const reg = await axios.post(`${API_BASE}/auth/register`, {
    email,
    username,
    password,
    role: 'SENIOR',
  });

  const token = reg.data.accessToken;
  const me = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(`register_user_role=${reg.data?.user?.role ?? 'missing'}`);
  console.log(`me_role=${me.data?.role ?? 'missing'}`);
}

main().catch((error) => {
  const message = error?.response?.data ?? error.message;
  console.error('verify role flow failed:', message);
  process.exitCode = 1;
});
