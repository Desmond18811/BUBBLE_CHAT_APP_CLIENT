// src/components/ChatHeader.jsx
import { useAppStore } from "@/store";
import { RiCloseFill, RiArrowLeftLine } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { getImageUrl } from "@/utills/imageUtils";

const ChatHeader = () => {
    const { closeChat, selectedChatData, theme } = useAppStore();

    if (!selectedChatData) return null;

    return (
        <div className={`h-[10vh] border-b ${theme === 'dark' ? 'border-[#2f303b]' : 'border-gray-200'} flex items-center justify-between px-3 sm:px-4 md:px-5`}>
            <div className="flex gap-3 items-center flex-1">
                {/* Back button for mobile */}
                <button
                    className="md:hidden text-neutral-400 hover:text-white transition-colors p-2"
                    onClick={closeChat}
                >
                    <RiArrowLeftLine className="text-2xl" />
                </button>

                <div className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
                        {selectedChatData.image ? (
                            <AvatarImage
                                src={getImageUrl(selectedChatData.image)}
                                alt="profile"
                                className="object-cover w-full h-full bg-black"
                            />
                        ) : (
                            <div
                                className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
                                    selectedChatData.color ?? 0
                                )}`}
                            >
                                {selectedChatData.firstName?.charAt(0) || selectedChatData.email?.charAt(0)}
                            </div>
                        )}
                    </Avatar>
                    <div className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                            {selectedChatData.firstName
                                ? `${selectedChatData.firstName} ${selectedChatData.lastName || ''}`
                                : selectedChatData.email}
                        </p>
                        <p className="text-xs text-gray-400">
                            {selectedChatData.status || "Online"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Close button for desktop */}
            <div className="hidden md:flex items-center justify-center">
                <button
                    className={`${theme === 'dark' ? 'text-neutral-500 hover:text-white' : 'text-gray-500 hover:text-gray-800'} duration-300 transition-all focus:outline-none`}
                    onClick={closeChat}
                >
                    <RiCloseFill className="text-2xl" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;