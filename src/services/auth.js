import axios from 'axios';

const strapiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function signIn({ email, password }) {
  const res = await axios.post(
    `${strapiUrl}/api/auth/local`,
    {
      identifier: email,
      password,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
}

export default function Home1() {
  return <></>;
}
