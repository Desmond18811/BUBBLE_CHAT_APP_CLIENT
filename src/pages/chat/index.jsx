// src/pages/chat/index.jsx
import { useAppStore } from "@/store"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import ContactsContainer from "./components/contacts-container"
import EmptyChatContainer from "./components/empty-chat-contact"
import ChatContainer from "./components/chat-container"

const Chat = () => {
    const {userInfo, selectedChatType, theme} = useAppStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (!userInfo?.profileSetup) {
            toast("Please set up profile to continue");
            navigate("/profile");
        }
    }, [userInfo, navigate]);

    return (
        <div className={`flex h-[100vh] ${theme === 'dark' ? 'text-white bg-[#1b1c24]' : 'text-black bg-gray-100'} overflow-hidden`}>
            {/* Hide contacts on mobile when chat is selected */}
            <div className={`${selectedChatType !== undefined ? 'hidden md:flex' : 'flex'} md:border-r ${theme === 'dark' ? 'md:border-[#2f303b]' : 'md:border-gray-200'}`}>
                <ContactsContainer/>
            </div>

            {/* Show chat container on mobile when selected, always show on desktop */}
            <div className={`flex-1 ${selectedChatType === undefined ? 'hidden md:flex' : 'flex'}`}>
                {selectedChatType === undefined ? <EmptyChatContainer/> : <ChatContainer/>}
            </div>
        </div>
    )
}

export default Chat