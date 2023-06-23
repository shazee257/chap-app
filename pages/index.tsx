import { fetchApi } from '@/fetchApi';
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const [data, error] = await fetchApi({
      method: 'POST',
      endPoint: 'auth/login',
      data: { email, password },
    });

    if (error) {
      console.error(error.message);
      return;
    }

    console.log("data >>>> ", data);
    console.log("data.data.token >>>> ", data.data.token);

    localStorage.setItem('userId', data?.data?.user?._id);
    localStorage.setItem('fullName', data?.data?.user?.fullName);
    localStorage.setItem('email', data?.data?.user?.email);
    localStorage.setItem('image', data?.data?.user?.image);
    localStorage.setItem('role', data?.data?.user?.role);
    localStorage.setItem('token', data?.data?.token);

    router.push('/chat');
  };


  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      {/* Create Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full max-w-md space-y-8">
        <h1 className="text-4xl font-bold">Welcome to Chat-App</h1>
        <div className="flex flex-col space-y-4 w-full">

          {/* Email Input */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="email" className="text-lg font-semibold">Email</label>

            <input
              className="border border-gray-300 rounded-md p-2 text-neutral-950"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="password" className="text-lg font-semibold">Password</label>

            <input
              type="password"
              className="border border-gray-300 rounded-md p-2 text-neutral-950"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md p-2">
            Login
          </button>
        </div>
      </form>


















    </main>
  )
}
