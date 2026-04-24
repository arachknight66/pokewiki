import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('https://pokewiki-red.vercel.app/api/auth/register', {
      username: "TestVercelUser",
      email: "testvercel@kanto.org",
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
