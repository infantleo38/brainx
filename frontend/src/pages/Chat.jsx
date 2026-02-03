import React, { useState, useEffect, useRef } from 'react';
import { getChats, getMessages, sendMessage, markMessageRead, getCurrentUser, getCachedChats, getCachedUser, getWebSocketUrl, createChat, uploadChatResource, API_BASE_URL } from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';

export default function Chat() {

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingFile, setPendingFile] = useState(null); // File waitng for confirmation
    const [isUploading, setIsUploading] = useState(false); // Track upload state
    const [readMessageIds, setReadMessageIds] = useState(new Set());

    // Ref for auto-scrolling to bottom
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPendingFile(file);
        e.target.value = ''; // Reset input so same file can be selected again if cancelled
    };

    const handleConfirmSend = async (message) => {
        if (!pendingFile || !activeChat) return;

        const file = pendingFile;
        setIsUploading(true);

        try {
            // 1. Upload the file
            const resource = await uploadChatResource(activeChat.id, file);

            // 2. Prepare message content
            // 2. Prepare message content
            let messageContent = message || "";

            if (resource.file_url) {
                if (file.type.startsWith('image/')) {
                    messageContent += `\n\n![${file.name}](${resource.file_url})`;
                } else {
                    messageContent += `\n\n[${file.name}](${resource.file_url})`;
                }
            }
            messageContent = messageContent.trim();

            // 3. Send message
            const messagePayload = {
                message: messageContent,
                chat_id: activeChat.id,
                batch_id: activeChat.batch_id
            };
            await sendMessage(activeChat.id, messagePayload);

        } catch (error) {
            console.error("File upload failed", error);
            alert("Failed to upload file");
        } finally {
            setIsUploading(false);
            setPendingFile(null);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Optimistic Load from Cache
                const cachedUser = getCachedUser();
                const cachedChats = getCachedChats();

                if (cachedChats) {
                    console.log("Cached Chats:", cachedChats);
                    setChats(cachedChats);
                }
                // ...

                // If we have both, we can stop loading immediately
                if (cachedUser && cachedChats) {
                    setLoading(false);
                }

                // 2. Network Fetch (User)
                const user = await getCurrentUser();
                setCurrentUser(user);

                // 3. Network Fetch (Chats)
                const chatsData = await getChats();
                console.log("Network Chats Data:", chatsData);
                setChats(chatsData);

                if (chatsData.length > 0 && !activeChat) {
                    if (!activeChat) {
                        setActiveChat(chatsData[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat data", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // WebSocket Ref
    const socketRef = useRef(null);

    useEffect(() => {
        if (activeChat) {
            const fetchMessages = async () => {
                try {
                    const msgs = await getMessages(activeChat.id);
                    setMessages(msgs.reverse());
                } catch (error) {
                    console.error("Failed to load messages", error);
                }
            };
            fetchMessages();

            // Connect WebSocket
            const wsUrl = getWebSocketUrl(activeChat.id);
            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log("Connected to Chat WS");
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                // Append new message if it belongs to this chat (redundant check but safe)
                if (message.chat_id === activeChat.id) {
                    setMessages(prev => {
                        // Prevent duplicates if REST + WS collide (though unique ID check usually best)
                        if (prev.some(m => m.id === message.id)) return prev;
                        return [...prev, message];
                    });
                }
            };

            ws.onerror = (error) => {
                console.error("WS Error", error);
            };

            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        }
    }, [activeChat]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Mark messages as read
    useEffect(() => {
        if (!activeChat || !currentUser || messages.length === 0) return;

        const unreadMessages = messages.filter(msg =>
            msg.sender_id !== currentUser.id && !readMessageIds.has(msg.id)
        );

        if (unreadMessages.length > 0) {
            // Update local state first to prevent loops/duplicates
            setReadMessageIds(prev => {
                const newSet = new Set(prev);
                unreadMessages.forEach(msg => newSet.add(msg.id));
                return newSet;
            });

            unreadMessages.forEach(msg => {
                markMessageRead(activeChat.id, msg.id).catch(err => {
                    console.error("Failed to mark read", err);
                });
            });
        }
    }, [messages, activeChat, currentUser]);

    const [showGroupInfo, setShowGroupInfo] = useState(false);

    // Handlers
    const handleMemberClick = async (member) => {
        if (!currentUser || member.user_id === currentUser.id) return;

        // 1. Check if we already have a direct chat with this person
        const existingChat = chats.find(c =>
            c.chat_type === 'direct' &&
            c.members.some(m => m.user_id === member.user_id)
        );

        if (existingChat) {
            setActiveChat(existingChat);
        } else {
            // 2. Create new chat
            try {
                const newChatData = {
                    chat_type: 'direct',
                    initial_members: [
                        { user_id: member.user_id, role: 'student' }
                    ]
                };
                const createdChat = await createChat(newChatData);
                setChats(prev => [createdChat, ...prev]);
                setActiveChat(createdChat);
            } catch (error) {
                console.error("Failed to create chat", error);
                // Optionally show error to user
            }
        }
    };

    // ... (keep existing effects and handlers)

    const handleDownload = (e, url, filename) => {
        e.preventDefault();
        const proxyUrl = `${API_BASE_URL}/chats/proxy-download?url=${encodeURIComponent(url)}`;
        // Use a hidden link to trigger download naturally
        const link = document.createElement('a');
        link.href = proxyUrl;
        // The backend sets Content-Disposition, so we don't strict need 'download' attr here, 
        // but it doesn't hurt.
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper to render message content (Text, Image, File)
    const renderMessageContent = (msg) => {
        const isMe = msg.sender_id === currentUser?.id;
        const content = msg.message;

        // 1. Image: ![alt](url)
        const imageRegex = /!\[(.*?)\]\((.*?)\)/;
        if (imageRegex.test(content)) {
            const match = content.match(imageRegex);
            return (
                <div className="rounded-lg overflow-hidden my-1">
                    <img src={match[2]} alt={match[1]} className="max-w-full max-h-[300px] object-cover" />
                </div>
            );
        }

        // 2. File: [name](url)
        const fileRegex = /\[(.*?)\]\((.*?)\)/;
        if (fileRegex.test(content)) {
            const match = content.match(fileRegex);
            const fileName = match[1];
            const url = match[2];
            const ext = fileName.split('.').pop().toUpperCase();
            // Remove the file link markdown from the content to show any caption text
            const caption = content.replace(match[0], '').trim();

            return (
                <div>
                    {caption && <p className={`text-sm mb-2 ${isMe ? 'text-white/95' : 'text-gray-800'}`}>{caption}</p>}
                    <div className={`flex items-center gap-3 p-3 rounded-xl min-w-[240px] ${isMe ? 'bg-white/10' : 'bg-black/5'}`}>
                        <div className="bg-white p-2.5 rounded-lg shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[24px]">description</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className={`text-sm font-semibold truncate leading-tight ${isMe ? 'text-white' : 'text-gray-800'}`}>{fileName}</p>
                            <p className={`text-[11px] ${isMe ? 'text-white/70' : 'text-gray-500'}`}>{ext} • File</p>
                        </div>
                        <a
                            href={url}
                            onClick={(e) => handleDownload(e, url, fileName)}
                            className={`p-2 rounded-full transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                            title="Download"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                        </a>
                    </div>
                </div>
            );
        }

        // 3. Plain Text
        return <p className={`text-sm leading-relaxed pb-1 ${isMe ? 'text-white/95' : ''}`}>{content}</p>;
    };

    // Handlers
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        const messagePayload = {
            message: newMessage,
            sender_id: currentUser.id, // In real secure app, backend gets this from token
            batch_id: activeChat.batch_id,
            chat_id: activeChat.id
        };

        try {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(messagePayload));
                setNewMessage('');
                // Optimistic update? No, let's wait for socket echo for consistency for now,
                // or optimistic append with 'sending' status if we wanted to be fancy.
                // Waiting for echo is simpler for this task.
            } else {
                console.error("WebSocket not connected");
                // Fallback to REST if needed, or show error
                alert("Connection lost. Reconnecting...");
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const getChatName = (chat) => {
        if (chat.name) return chat.name;
        if (chat.chat_type === 'group') {
            return chat.batch ? chat.batch.batch_name : `Group Chat ${chat.id}`;
        }
        // For direct chats, find the other member
        if (chat.chat_type === 'direct' && chat.members && currentUser) {
            const otherMember = chat.members.find(m => m.user_id !== currentUser.id);
            if (otherMember) {
                return otherMember.user?.full_name || otherMember.user_name || 'Unknown User';
            }
        }
        return `Chat ${chat.id}`;
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading chats...</div>;

    return (
        <div className="flex-1 flex h-full overflow-hidden bg-background-alt relative">
            {/* Contact List Sidebar */}
            <section className="w-[400px] flex flex-col bg-white border-r border-gray-100 z-20 shrink-0">
                <div className="h-16 px-4 py-3 bg-white border-b border-gray-50 flex items-center flex-shrink-0">
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                            placeholder="Search or start new chat"
                            type="text"
                        />
                    </div>
                    <button className="ml-2 p-2 rounded-full text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => {
                        const isActive = activeChat?.id === chat.id;
                        return (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors group border-l-4 ${isActive ? 'border-primary bg-primary-light/30 hover:bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {chat.group_icon ? (
                                            <img src={chat.group_icon} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            getChatName(chat).charAt(0)
                                        )}
                                    </div>
                                    {isActive && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>{getChatName(chat)}</h4>
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            {chat.created_at ? formatTime(chat.created_at) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-600 truncate group-hover:text-gray-900">
                                            {chat.chat_type} {chat.is_official ? '• Official' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Chat Area */}
            {activeChat ? (
                <main className="flex-1 flex overflow-hidden">
                    <section className="flex-1 flex flex-col bg-[#f0f2f5] relative min-w-0">
                        <header className="h-16 px-6 py-2 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowGroupInfo(true)}>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                        {activeChat.group_icon ? (
                                            <img src={activeChat.group_icon} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            getChatName(activeChat).charAt(0)
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{getChatName(activeChat)}</h3>
                                    <span className="text-xs text-green-600 font-medium">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors" title="Voice Call">
                                    <span className="material-symbols-outlined text-[22px]">call</span>
                                </button>
                                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors" title="Video Call">
                                    <span className="material-symbols-outlined text-[22px]">videocam</span>
                                </button>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors" title="Search in chat">
                                    <span className="material-symbols-outlined text-[22px]">search</span>
                                </button>
                                <button
                                    className={`p-2 rounded-full transition-colors ${showGroupInfo ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'}`}
                                    title="View Members"
                                    onClick={() => setShowGroupInfo(!showGroupInfo)}
                                >
                                    <span className="material-symbols-outlined text-[22px]">group</span>
                                </button>
                                <button
                                    className={`p-2 rounded-full transition-colors ${showGroupInfo ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-50'}`}
                                    title="Group info"
                                    onClick={() => setShowGroupInfo(!showGroupInfo)}
                                >
                                    <span className="material-symbols-outlined text-[22px]">more_vert</span>
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-chat-pattern bg-repeat scroll-smooth">
                            <div className="flex justify-center my-4">
                                <span className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-[11px] font-medium text-gray-500 shadow-sm border border-gray-100">
                                    Today
                                </span>
                            </div>

                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === currentUser?.id;
                                return (
                                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[65%] min-w-[120px] rounded-2xl shadow-card p-3 relative group ${isMe ? 'bg-primary rounded-tr-none text-white shadow-primary/20' : 'bg-white rounded-tl-none text-gray-800'}`}>
                                            {renderMessageContent(msg)}
                                            <div className="flex justify-end items-center gap-1 mt-1">
                                                <span className={`text-[10px] font-medium ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                    {formatTime(msg.created_at)}
                                                </span>
                                                {isMe && (
                                                    <span className={`material-symbols-outlined text-[14px] ${isMe ? 'text-white/70' : 'text-primary'}`}>
                                                        {msg.status === 'read' ? 'done_all' : 'check'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <footer className="p-4 bg-white border-t border-gray-100 flex-shrink-0 z-20">
                            <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
                                <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                                    <span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span>
                                </button>

                                {/* File Upload Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Add attachment"
                                    disabled={!activeChat}
                                >
                                    <span className="material-symbols-outlined text-[24px]">add</span>
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        className="w-full pl-5 pr-12 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        placeholder="Type a message"
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">mic</span>
                                    </button>
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    className="p-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg shadow-primary/30 transition-all transform active:scale-95 flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </div>
                        </footer>
                    </section>

                    {/* Group Info Sidebar */}
                    {showGroupInfo && (
                        <aside className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-full bg-[#f0f2f5] animate-slideInRight">
                            {/* Header */}
                            <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center gap-6 shrink-0">
                                <button onClick={() => setShowGroupInfo(false)} className="text-gray-500 hover:text-gray-800">
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                                <span className="text-base font-medium text-gray-900">Group info</span>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {/* Profile Info */}
                                <div className="bg-white px-8 py-8 mb-3 shadow-sm flex flex-col items-center">
                                    <div className="w-48 h-48 rounded-full bg-gray-200 mb-4 overflow-hidden relative group cursor-pointer">
                                        {activeChat.group_icon ? (
                                            <img src={activeChat.group_icon} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-6xl text-gray-400 font-bold">
                                                {getChatName(activeChat).charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                            <span className="material-symbols-outlined text-3xl mb-1">camera_alt</span>
                                            <span className="text-xs uppercase font-medium">Change Profile Photo</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full justify-center mb-1">
                                        <h2 className="text-2xl font-normal text-gray-900">{getChatName(activeChat)}</h2>
                                        <button className="text-gray-400 hover:text-gray-800"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                    </div>
                                    <p className="text-gray-500 text-sm">Group · 3 members</p>
                                </div>

                                {/* Actions */}
                                <div className="bg-white px-4 py-4 mb-3 shadow-sm flex items-center gap-4">
                                    <button className="flex-1 flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                            <span className="material-symbols-outlined">person_add</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">Add</span>
                                    </button>
                                    <button className="flex-1 flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                            <span className="material-symbols-outlined">search</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">Search</span>
                                    </button>
                                </div>

                                {/* Description */}
                                <div className="bg-white px-6 py-5 mb-3 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm text-green-600 font-medium">Add group description</span>
                                        <button className="text-gray-400 hover:text-gray-800"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">Group created by you, on 5/12/2025 at 5:19 pm</p>
                                </div>

                                {/* Members List */}
                                <div className="bg-white px-6 py-5 mb-3 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {activeChat.members ? `${activeChat.members.length} Members` : 'Members'}
                                        </span>
                                        <button className="text-gray-400 hover:text-gray-800">
                                            <span className="material-symbols-outlined text-[20px]">search</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {activeChat.members && activeChat.members.map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => handleMemberClick(member)}
                                                className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold overflow-hidden relative">
                                                    {member.user?.profile_image ? (
                                                        <img src={member.user.profile_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        (member.user?.full_name || member.user_name || '?').charAt(0)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {member.user?.full_name || member.user_name || 'Unknown User'}
                                                        </h4>
                                                        {member.role === 'admin' && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                                                                Group Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Contact Info Privacy Logic */}
                                                    {(() => {
                                                        const isCurrentUserStudent = currentUser?.role === 'student';
                                                        const isMemberStudent = member.role === 'student';

                                                        // Hide contact if BOTH current user AND member are students
                                                        const showContact = !(isCurrentUserStudent && isMemberStudent);

                                                        if (!showContact) return null;

                                                        return (
                                                            <div className="text-xs text-gray-500 truncate flex flex-col">
                                                                <span>{member.user?.email || member.user_email || ''}</span>
                                                                {member.user?.phone && (
                                                                    <span>{member.user.phone}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="bg-white shadow-sm mb-3">
                                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-gray-400">image</span>
                                            <span className="text-sm text-gray-800">Media, links and docs</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span className="text-xs">1</span>
                                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100"></div>
                                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-gray-400">star</span>
                                            <span className="text-sm text-gray-800">Starred messages</span>
                                        </div>
                                        <span className="material-symbols-outlined text-[18px] text-gray-400">chevron_right</span>
                                    </div>
                                    <div className="border-t border-gray-100"></div>
                                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-gray-400">notifications</span>
                                            <span className="text-sm text-gray-800">Mute notifications</span>
                                        </div>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id="toggle_mute" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 transition-all duration-300 checked:right-0 checked:border-primary" />
                                            <label htmlFor="toggle_mute" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-primary"></label>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white shadow-sm mb-8">
                                    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                                        <span className="material-symbols-outlined text-gray-400">lock</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800">Encryption</p>
                                            <p className="text-xs text-gray-500">Messages are end-to-end encrypted. Click to learn more.</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
                                        <span className="material-symbols-outlined text-gray-400">timer</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800">Disappearing messages</p>
                                            <p className="text-xs text-gray-500">Off</p>
                                        </div>
                                        <span className="material-symbols-outlined text-[18px] text-gray-400">chevron_right</span>
                                    </div>
                                </div>

                                <div className="bg-white shadow-sm mb-4">
                                    <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 text-red-500 transition-colors">
                                        <span className="material-symbols-outlined">logout</span>
                                        <span className="text-sm font-medium">Exit group</span>
                                    </button>
                                    <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 text-red-500 transition-colors border-t border-gray-100">
                                        <span className="material-symbols-outlined">thumb_down</span>
                                        <span className="text-sm font-medium">Report group</span>
                                    </button>
                                </div>

                            </div>
                        </aside>
                    )}
                </main>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] text-gray-400">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">chat_bubble_outline</span>
                        <p>Select a chat to start messaging</p>
                    </div>
                </div>
            )
            }
            {/* File Preview Modal */}
            <FilePreviewModal
                file={pendingFile}
                onClose={() => setPendingFile(null)}
                onSend={handleConfirmSend}
            />
        </div>
    );

}
