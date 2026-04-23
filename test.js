import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/register', {
      username: 'TestUser_123',
      email: 'test@kanto.org',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
