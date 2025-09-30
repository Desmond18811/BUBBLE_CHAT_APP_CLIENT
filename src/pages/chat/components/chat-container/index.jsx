// src/pages/chat/components/chat-container/index.jsx
import ChatHeader from "./components/chat-header"
import MessageBar from "./components/message-bar"
import MessageContainer from "./components/message-container"
import { useAppStore } from "@/store";

const ChatContainer = () => {
    const { theme } = useAppStore();
    return (
        <div className={`w-full h-[100vh] ${theme === 'dark' ? 'bg-[#1c1d25]' : 'bg-gray-50'} flex flex-col`}>
            <ChatHeader/>
            <MessageContainer/>
            <MessageBar/>
        </div>
    )
}

export default ChatContainer