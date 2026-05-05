import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);

    const scrollEnd = useRef(null);
    const [input, setInput] = useState("");

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return;
        await sendMessage({ text: input.trim() });
        setInput("");
    }

    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
            e.target.value = ""
        }
        reader.readAsDataURL(file);
    }

    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser?._id, getMessages]);

    // OPTIMIZED SCROLL LOGIC
   useEffect(() => {
    const chatContainer = scrollEnd.current?.parentNode;

    if (chatContainer) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        
        // Check if the user is "near" the bottom (within 100px)
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        // Only auto-scroll if it's the very first load OR if the user is already at the bottom
        if (messages.length > 0 && (messages.length <= 1 || isNearBottom)) {
            const scrollToBottom = () => {
                scrollEnd.current?.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "end" 
                });
            };

            scrollToBottom();
            const timer = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timer);
        }
    }
}, [messages]);
    return selectedUser ? (
        // 1. h-full flex flex-col ensures the container fills its parent without growing beyond it
        <div className="h-full flex flex-col overflow-hidden relative backdrop-blur-lg">
            
            {/* ------- Header: flex-none prevents it from shrinking or moving ------- */}
            <div className='flex-none flex items-center gap-3 py-3 mx-4 border-b border-stone-500 bg-transparent z-10'>
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover" />
                <p className="flex-1 text-lg text-white flex items-center gap-2">
                    {selectedUser.fullName}
                    {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                </p>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7 cursor-pointer" />
            </div>

            {/* ----- Chat Area: flex-1 + overflow-y-auto is the key to independent scrolling ----- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col scroll-smooth custom-scrollbar">
                {messages.map((message, idx) => {
                    const isMe = message.senderId === authUser._id;

                    return (
                        <div 
                            key={message._id || idx} 
                            className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                                
                                <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <img
                                        src={isMe ? authUser.profilePic || assets.avatar_icon : selectedUser.profilePic || assets.avatar_icon}
                                        alt="profile"
                                        className="w-6 h-6 rounded-full border border-gray-600 object-cover"
                                    />
                                    <span className="text-[10px] text-gray-400">
                                        {formatMessageTime(message.createdAt)}
                                    </span>
                                </div>

                                <div className={`p-3 rounded-2xl shadow-sm ${
                                    isMe 
                                    ? "bg-violet-600 text-white rounded-tr-none" 
                                    : "bg-gray-800 text-white rounded-tl-none"
                                }`}>
                                    {message.image && (
                                        <img 
                                            src={message.image} 
                                            alt="Attachment" 
                                            // onLoad triggers scroll again once the image height is known
                                            onLoad={() => scrollEnd.current?.scrollIntoView({ behavior: "smooth" })}
                                            className="max-w-full rounded-lg mb-2 block border border-white/10" 
                                        />
                                    )}
                                    {message.text && <p className="text-sm wrap-break-words whitespace-pre-wrap">{message.text}</p>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {/* Scroll Anchor: Empty div with height ensures the scroll target is visible */}
                <div ref={scrollEnd} className="h-2 flex-none" />
            </div>

            {/* ------ Bottom Area: flex-none ensures it stays locked at the bottom ------ */}
            <div className='flex-none p-3 bg-transparent'>
                <div className='flex items-center bg-gray-100/10 px-3 rounded-full border border-white/10'>
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
                        type="text"
                        placeholder="Type a message..."
                        className='flex-1 text-sm p-3 bg-transparent border-none outline-none text-white'
                    />
                    <input onChange={handleSendImage} type="file" id='image' accept='image/*' hidden />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer opacity-70 hover:opacity-100" />
                    </label>
                    <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer hover:scale-110 transition-transform" />
                </div>
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 bg-white/5 max-md:hidden">
            <img src={assets.logo_icon} className="max-w-16 opacity-20" alt="" />
            <p className='text-lg font-medium text-white/50'>Select a user to start chatting</p>
        </div>
    )
}

export default ChatContainer;