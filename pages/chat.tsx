import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchApi } from '@/fetchApi';
import moment from 'moment';
import io from 'socket.io-client';
import Select from 'react-select'

// getServersideProps
export const getServerSideProps = async (context: any) => {
    const { req, res } = context;

    const token: string = req.cookies.token;
    const userId: string = req.cookies.userId;

    return {
        props: { token, userId },
    };
}

// make seperate component for showing User
const options = [
    { value: 'chocolate', label: <div><img src="https://www.diabetesfoodhub.org/system/user_files/Images/1837-diabetic-pecan-crusted-chicken-breast_JulAug20DF_clean-simple_061720.jpg" /></div> },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
]


const chat = ({ userId, token }: any) => {
    const [fullName, setFullName] = useState("");
    const [userImage, setUserImage] = useState("");
    const [messages, setMessages] = useState([] as any[]);

    const [text, setText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    type User = {
        _id: string;
        fullName: string;
        email: string;
        image: string;
        online: boolean;
    }

    const [users, setUsers] = useState([] as User[]);
    const router = useRouter();

    useEffect(() => {
        console.log("userId >>>> ", userId);


        const socket: any = io('http://localhost:5000', {
            transports: ['websocket'],
            auth: { user_id: userId },
        });

        // Listen for 'message' event
        socket.on('user-connected', (user: any) => {
            console.log('user joined chat :', user);

            // update users list
            setUsers((users) => {
                const userIndex = users.findIndex((u) => u?._id === user?._id);
                if (userIndex > -1) {
                    users[userIndex].online = true;
                }
                return [...users];
            });
        });

        // Listen for 'disconnect' event
        socket.on('user-disconnected', (user: any) => {
            console.log('user left chat :', user);

            // update users list
            setUsers((users) => {
                const userIndex = users.findIndex((u) => u?._id === user?._id);
                if (userIndex > -1) {
                    users[userIndex].online = false;
                }
                return [...users];
            });
        });

        // Listen for 'message' event
        socket.on(`send-message-${userId}`, (message: any) => {
            console.log('message :', message);

            // update messages list
            setMessages((messages) => [...messages, message]);

            // scroll to bottom
            const chatBox = document.getElementById('chat-box');
            setTimeout(() => {
                chatBox?.scrollTo(0, chatBox.scrollHeight);
            }, 0);
        });



        // Clean up the socket connection when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

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
        const [data, error] = await fetchApi({
            method: 'GET',
            token,
            endPoint: 'user/search',
        });

        if (error) {
            console.error(error.message);
            return;
        }

        console.log("getUsers -> data.data >>>> ", data.data);
        setUsers(data.data);
    }

    const getMessages = async (userId: string) => {
        setSelectedUserId(userId);

        const [data, error] = await fetchApi({
            method: 'GET',
            token,
            endPoint: `message/${userId}`,
        });

        if (error) {
            console.error(error.message);
            return;
        }

        // console.log("getMessages -> data?.data >>>> ", data?.data);
        setMessages(data?.data);

        // scroll to bottom
        const chatBox = document.getElementById('chat-box');
        setTimeout(() => {
            chatBox?.scrollTo(0, chatBox.scrollHeight);
        }, 0);
    }

    const sendMessage = async (e: any) => {
        e.preventDefault();

        // trim text
        const trimmedText = text.trim();
        if (!trimmedText) {
            return;
        }

        const [data, error] = await fetchApi({
            method: 'POST',
            token,
            endPoint: 'message/send',
            data: {
                text,
                receiver: selectedUserId,
            },
        });

        if (error) {
            return console.error(error.message);
        }

        setText("");
        console.log("data?.data >>>> ", data?.data);
        setMessages((messages) => [...messages, data?.data]);

        // scroll to bottom
        const chatBox = document.getElementById('chat-box');
        setTimeout(() => {
            chatBox?.scrollTo(0, chatBox.scrollHeight);
        }, 0);
    }

    useEffect(() => {
        getUsers();
        setFullName(localStorage.getItem('fullName') || "");
        setUserImage(localStorage.getItem('image') || "");
        getMessages(selectedUserId);
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

            <div className="flex justify-center w-full pt-20">
                {/* border in white */}
                <div className="flex flex-col w-3/12 border-r-2 border-white">
                    <Select options={options}
                        className='w-full py-2 pr-2 rounded-md text-black'
                    />
                    {/* <div className='flex items-center justify-between w-full py-2 pr-2 space-x-2 text-black'> */}
                    {/* <input type="text" placeholder="Search" className="w-full p-2 rounded-md" />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white cursor-pointer hover:text-gray-300
                        border-2 border-gray-100 rounded-full p-1
                        
                        " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a4 4 0 11-8 0 4 4 0 018 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
                        </svg> */}
                    {/* </div> */}
                    <h1 className="text-2xl font-semibold">Chat List</h1>
                    {users.map((user, index) => (
                        <div key={index} className="flex items-center space-x-4 my-4 cursor-pointer"
                            onClick={() => getMessages(user._id)}>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_BaseURL}/uploads/${user.image}`}
                                width={36}
                                height={36}
                                alt="user" className="w-8 h-8 rounded-full" />
                            <h1 className="text-2xl font-semibold">{user.fullName}</h1>
                            {/* online or offlines status */}
                            <div className={`w-3 h-3 rounded-full ${user.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    ))}
                </div>

                {/* chat section */}
                <div className="flex flex-col w-4/6 pl-8">
                    <h1 className="text-2xl font-semibold">Chat Section</h1>
                    <div className="flex flex-col w-full h-96 border-2 border-white rounded-md">
                        <div className="flex flex-col w-full h-full overflow-y-scroll" id='chat-box'>
                            <div className="flex flex-col w-full h-1/6 text-white p-4">
                                {messages?.map((message) => (
                                    <div key={message?._id}
                                        className={`flex flex-col items-${message?.receiver?._id == userId ? 'end' : 'start'} p-2 mb-2`}>
                                        <div className={`flex flex-col items-${message.sender ? 'end' : 'start'}`}>
                                            <div className={`flex space-x-4 py-1 ${message.sender ? 'justify-end' : 'justify-start'}`}>
                                                {message?.receiver?._id === userId ? (
                                                    <>
                                                        <div className="text-sm p-2 bg-blue-600 rounded-l-xl rounded-tr-xl">
                                                            {message.text}
                                                        </div>
                                                        <Image
                                                            src={`${process.env.NEXT_PUBLIC_BaseURL}/uploads/${message?.receiver?.image}`}
                                                            width={36}
                                                            height={36}
                                                            alt="user"
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={`${process.env.NEXT_PUBLIC_BaseURL}/uploads/${message?.sender?.image}`}
                                                            width={36}
                                                            height={36}
                                                            alt="user"
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                        <div className="text-sm p-2 bg-blue-600 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                                                            {message.text}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-right text-gray-400 text-xs w-full">
                                                {moment(message?.createdAt).format('h:mm:ss a')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={sendMessage}>
                        <div className="flex items-center justify-between w-full mt-4 space-x-2">
                            <input type="text" placeholder="Type a message" className="w-full h-12 rounded-md p-4 text-gray-500"
                                value={text} onChange={(e) => setText(e.target.value)} />
                            <button disabled={!text} type='submit' className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md p-2 w-20">
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    )
}

export default chat