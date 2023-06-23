import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchApi } from '@/fetchApi';

const chat = () => {
    const [fullName, setFullName] = useState("");
    const [userImage, setUserImage] = useState("");

    type User = {
        _id: string;
        fullName: string;
        email: string;
        image: string;
    }

    const [users, setUsers] = useState([] as User[]);
    const router = useRouter();

    const getToken = () => {
        return localStorage.getItem('token');
    }

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('fullName');
        localStorage.removeItem('email');
        localStorage.removeItem('image');
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        router.push('/');
    }

    const getUsers = async () => {
        const token = getToken();

        const [data, error] = await fetchApi({
            method: 'GET',
            token,
            endPoint: 'user/search',
        });

        if (error) {
            console.error(error.message);
            return;
        }

        // console.log("data.data >>>> ", data.data);
        setUsers(data.data);
    }

    useEffect(() => {
        getUsers();
        setFullName(localStorage.getItem('fullName') || "");
        setUserImage(localStorage.getItem('image') || "");
    }, [])

    return (
        <div className="flex flex-col items-center justify-center w-full space-y-8 p-12">
            <div className="flex items-center justify-around w-full">
                <h1 className="text-4xl font-bold">Welcome to Chat-App</h1>
                <div className="flex flex-col items-center justify-center w-full max-w-md space-y-8">
                    <div className="flex items-center w-full space-x-4">
                        <div className="flex items-center space-x-4">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_BaseURL}/uploads/${userImage}`}
                                width={48}
                                height={48}
                                alt="user" className="w-12 h-12 rounded-full" />
                            <h1 className="text-2xl font-semibold">{fullName}</h1>
                        </div>
                        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md p-2">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-center w-1/2 pt-20">
                {/* border in white */}
                <div className="flex flex-col w-3/12 border-r-2 border-white">
                    <h1 className="text-2xl font-semibold">Users List</h1>
                    {users.map((user, index) => (
                        <div key={index} className="flex items-center space-x-4 my-4 cursor-pointer">
                            <Image
                                src={`${process.env.NEXT_PUBLIC_BaseURL}/uploads/${user.image}`}
                                width={48}
                                height={48}
                                alt="user" className="w-12 h-12 rounded-full" />
                            <h1 className="text-2xl font-semibold">{user.fullName}</h1>
                        </div>
                    ))}
                </div>

                {/* chat section */}
                <div className="flex flex-col w-4/6 pl-8">
                    <h1 className="text-2xl font-semibold">Chat Section</h1>
                    <div className="flex flex-col w-full h-96 border-2 border-white rounded-md">
                        <div className="flex flex-col w-full h-5/6 overflow-y-scroll">
                            <div className="flex flex-col w-full h-1/6">
                                <h1 className="text-white">Hello</h1>

                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full mt-4">
                        <input type="text" placeholder="Type a message" className="w-5/6 h-12 rounded-md p-4 text-gray-500" />
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md p-2">
                            Send
                        </button>

                    </div>



                </div>

            </div>
        </div >
    )
}

export default chat