import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/auth/register', {
      username: "TestUser234",
      email: "test2@kanto.org",
      password: "Password123!",
      confirmPassword: "Password123!"
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("ERROR DATA:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("ERROR MESSAGE:", err.message);
    }
  }
}

test();
