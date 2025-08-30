import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic, Image as ImageIcon, File, Video, Download } from "lucide-react";
import apiClient from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTE, HOST } from "@/utills/constants";

const MessageContainer = () => {
    const scrollRef = useRef();
    const { selectedChatMessages, selectedChatData, userInfo, selectedChatType, setSelectedChatMessages } = useAppStore();

    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = await apiClient.post(
                    GET_ALL_MESSAGES_ROUTE,
                    { userId: selectedChatData._id },
                    { withCredentials: true }
                );
                if (response.data.messages) {
                    setSelectedChatMessages(response.data.messages);
                }
            } catch (error) {
                console.log("Error fetching messages:", error);
            }
        };

        if (selectedChatData?._id && selectedChatType === "contact") {
            getMessages();
        }
    }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    const [currentAudio, setCurrentAudio] = useState(null);

    const handlePlayPause = (fileUrl) => {
        if (currentAudio && !currentAudio.paused && currentAudio.src === fileUrl) {
            currentAudio.pause();
            setCurrentAudio(null);
        } else {
            if (currentAudio) currentAudio.pause();
            const audio = new Audio(fileUrl);
            audio.play().catch((err) => console.error("Audio playback error:", err));
            setCurrentAudio(audio);
            audio.onended = () => setCurrentAudio(null);
        }
    };

    const normalizeFileUrl = (fileUrl) => {
        if (!fileUrl) return '';

        // If it's already a Cloudinary URL or external URL, return as is
        if (fileUrl.includes('cloudinary.com') || fileUrl.startsWith('https://')) {
            return fileUrl;
        }

        // If it's a localhost URL, replace with current server URL
        if (fileUrl.includes('localhost:3000')) {
            return fileUrl.replace('http://localhost:3000', HOST);
        }

        // If it's a local path (starts with /uploads), convert to full URL
        if (fileUrl.startsWith('/uploads')) {
            return `${HOST}${fileUrl}`;
        }

        return fileUrl;
    };

    const renderDMMessage = (message) => {
        const isSender = message.sender === userInfo?.id;

        // Safe handling of fileType to prevent the error
        const fileExtension = message.fileType ? message.fileType.split('/')[1] : '';
        const messageType = message.messageType || "text";

        // Normalize mediaUrl for both old and new files
        const mediaUrl = normalizeFileUrl(message.fileUrl);

        return (
            <div
                key={message._id}
                className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
            >
                <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                        isSender
                            ? "bg-[#4169E1]/5 text-[#4169E1]/90 border border-[#4169E1]/50"
                            : "bg-[#2a2b33]/5 text-white/90 border border-[#ffff]/20 break-words"
                    }`}
                >
                    {messageType === "text" ? (
                        <span>{message.content || ""}</span>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {messageType === "image" ? <ImageIcon className="h-5 w-5 text-[#4169E1]" /> :
                                    messageType === "video" ? <Video className="h-5 w-5 text-[#4169E1]" /> :
                                        messageType === "audio" ? <Mic className="h-5 w-5 text-[#4169E1]" /> :
                                            <File className="h-5 w-5 text-[#4169E1]" />}
                                <span className="font-medium capitalize">{messageType}</span>
                            </div>

                            {messageType === "image" && (
                                <img
                                    src={mediaUrl}
                                    alt={message.fileName || "Image"}
                                    className="max-w-full max-h-64 rounded-lg object-contain"
                                    onError={(e) => {
                                        console.error(`Failed to load image. Original: ${message.fileUrl}, Tried: ${mediaUrl}`);
                                        e.target.src = "/fallback-image.png";
                                    }}
                                />
                            )}
                            {messageType === "video" && (
                                <video
                                    src={mediaUrl}
                                    controls
                                    className="max-w-full max-h-64 rounded-lg"
                                    onError={(e) => {
                                        console.error(`Failed to load video. Original: ${message.fileUrl}, Tried: ${mediaUrl}`);
                                        e.target.parentElement.innerHTML = `
                                            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                                <p>Video failed to load</p>
                                                <a href="${mediaUrl}" 
                                                   class="text-blue-600 underline" 
                                                   download="${message.fileName || 'video'}">
                                                  Download video instead
                                                </a>
                                            </div>
                                        `;
                                    }}
                                />
                            )}
                            {messageType === "audio" && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePlayPause(mediaUrl)}
                                        className="p-2 rounded-full bg-[#4169E1]/10 hover:bg-[#4169E1]/20 transition"
                                    >
                                        {currentAudio && currentAudio.src === mediaUrl && !currentAudio.paused ? (
                                            <Pause className="h-5 w-5 text-[#4169E1]" />
                                        ) : (
                                            <Play className="h-5 w-5 text-[#4169E1]" />
                                        )}
                                    </button>
                                    <span className="text-xs text-gray-400">
                                        {message.duration ? moment.duration(message.duration, "seconds").humanize() : "Audio"}
                                    </span>
                                </div>
                            )}
                            {messageType === "file" && (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span className="truncate max-w-[150px]">{message.fileName || "Unknown file"}</span>
                                    <span>{(message.fileSize / 1024).toFixed(1)} KB</span>
                                </div>
                            )}

                            <a
                                href={mediaUrl}
                                download={message.fileName || `${messageType}.${fileExtension}`}
                                className="flex items-center gap-1 text-sm text-[#4169E1] hover:underline mt-1"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </a>
                        </div>
                    )}

                    <div
                        className={`text-xs mt-1 ${
                            isSender ? "text-[#4169E1]/70" : "text-gray-500"
                        }`}
                    >
                        {moment(message.timestamp).format("LT")}
                    </div>
                </div>
            </div>
        );
    };

    const renderMessages = () => {
        let lastDate = null;

        return selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;

            return (
                <div key={index}>
                    {showDate && (
                        <div className="text-center text-gray-500 my-2">
                            {moment(message.timestamp).format("LL")}
                        </div>
                    )}
                    {renderDMMessage(message)}
                </div>
            );
        });
    };

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
            {renderMessages()}
            <div ref={scrollRef} />
        </div>
    );
};

export default MessageContainer;










// import { useAppStore } from "@/store";
// import moment from "moment";
// import { useEffect, useRef, useState } from "react";
// import { Play, Pause, Mic, Image as ImageIcon, File, Video, Download } from "lucide-react";
// import apiClient from "@/lib/api-client";
// import { GET_ALL_MESSAGES_ROUTE, HOST } from "@/utills/constants";
//
// const MessageContainer = () => {
//     const scrollRef = useRef();
//     const { selectedChatMessages, selectedChatData, userInfo, selectedChatType, setSelectedChatMessages } = useAppStore();
//
//     useEffect(() => {
//         const getMessages = async () => {
//             try {
//                 const response = await apiClient.post(
//                     GET_ALL_MESSAGES_ROUTE,
//                     { userId: selectedChatData._id },
//                     { withCredentials: true }
//                 );
//                 if (response.data.messages) {
//                     setSelectedChatMessages(response.data.messages);
//                 }
//             } catch (error) {
//                 console.log("Error fetching messages:", error);
//             }
//         };
//
//         if (selectedChatData?._id && selectedChatType === "contact") {
//             getMessages();
//         }
//     }, [selectedChatData, selectedChatType, setSelectedChatMessages]);
//
//     useEffect(() => {
//         if (scrollRef.current) {
//             scrollRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//     }, [selectedChatMessages]);
//
//     const [currentAudio, setCurrentAudio] = useState(null);
//
//     const handlePlayPause = (fileUrl) => {
//         if (currentAudio && !currentAudio.paused && currentAudio.src === fileUrl) {
//             currentAudio.pause();
//             setCurrentAudio(null);
//         } else {
//             if (currentAudio) currentAudio.pause();
//             const audio = new Audio(fileUrl);
//             audio.play().catch((err) => console.error("Audio playback error:", err));
//             setCurrentAudio(audio);
//             audio.onended = () => setCurrentAudio(null);
//         }
//     };
//
//     const normalizeFileUrl = (fileUrl) => {
//         if (!fileUrl) return '';
//
//         // If it's already a Cloudinary URL or external URL, return as is
//         if (fileUrl.includes('cloudinary.com') || fileUrl.startsWith('http')) {
//             return fileUrl;
//         }
//
//         // If it's a local path (starts with /uploads), convert to full URL
//         if (fileUrl.startsWith('/uploads')) {
//             // For local development or if you want to serve old files from your server
//             return `${HOST}${fileUrl}`;
//         }
//
//         return fileUrl;
//     };
//
//     const renderDMMessage = (message) => {
//         const isSender = message.sender === userInfo?.id;
//
//         // Safe handling of fileType to prevent the error
//         const fileExtension = message.fileType ? message.fileType.split('/')[1] : '';
//         const messageType = message.messageType || "text";
//
//         // Normalize mediaUrl for both old and new files
//         const mediaUrl = normalizeFileUrl(message.fileUrl);
//
//         return (
//             <div
//                 key={message._id}
//                 className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
//             >
//                 <div
//                     className={`max-w-[70%] rounded-lg p-3 ${
//                         isSender
//                             ? "bg-[#4169E1]/5 text-[#4169E1]/90 border border-[#4169E1]/50"
//                             : "bg-[#2a2b33]/5 text-white/90 border border-[#ffff]/20 break-words"
//                     }`}
//                 >
//                     {messageType === "text" ? (
//                         <span>{message.content || ""}</span>
//                     ) : (
//                         <div className="space-y-2">
//                             <div className="flex items-center gap-2">
//                                 {messageType === "image" ? <ImageIcon className="h-5 w-5 text-[#4169E1]" /> :
//                                     messageType === "video" ? <Video className="h-5 w-5 text-[#4169E1]" /> :
//                                         messageType === "audio" ? <Mic className="h-5 w-5 text-[#4169E1]" /> :
//                                             <File className="h-5 w-5 text-[#4169E1]" />}
//                                 <span className="font-medium capitalize">{messageType}</span>
//                             </div>
//
//                             {messageType === "image" && (
//                                 <img
//                                     src={mediaUrl}
//                                     alt={message.fileName || "Image"}
//                                     className="max-w-full max-h-64 rounded-lg object-contain"
//                                     onError={(e) => {
//                                         console.error(`Failed to load image. Original: ${message.fileUrl}, Tried: ${mediaUrl}`);
//                                         e.target.src = "/fallback-image.png";
//                                     }}
//                                 />
//                             )}
//                             {messageType === "video" && (
//                                 <video
//                                     src={mediaUrl}
//                                     controls
//                                     className="max-w-full max-h-64 rounded-lg"
//                                     onError={(e) => {
//                                         console.error(`Failed to load video. Original: ${message.fileUrl}, Tried: ${mediaUrl}`);
//                                         e.target.parentElement.innerHTML = `
//                                             <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                                                 <p>Video failed to load</p>
//                                                 <a href="${mediaUrl}"
//                                                    class="text-blue-600 underline"
//                                                    download="${message.fileName || 'video'}">
//                                                   Download video instead
//                                                 </a>
//                                             </div>
//                                         `;
//                                     }}
//                                 />
//                             )}
//                             {messageType === "audio" && (
//                                 <div className="flex items-center gap-2">
//                                     <button
//                                         onClick={() => handlePlayPause(mediaUrl)}
//                                         className="p-2 rounded-full bg-[#4169E1]/10 hover:bg-[#4169E1]/20 transition"
//                                     >
//                                         {currentAudio && currentAudio.src === mediaUrl && !currentAudio.paused ? (
//                                             <Pause className="h-5 w-5 text-[#4169E1]" />
//                                         ) : (
//                                             <Play className="h-5 w-5 text-[#4169E1]" />
//                                         )}
//                                     </button>
//                                     <span className="text-xs text-gray-400">
//                                         {message.duration ? moment.duration(message.duration, "seconds").humanize() : "Audio"}
//                                     </span>
//                                 </div>
//                             )}
//                             {messageType === "file" && (
//                                 <div className="flex items-center gap-2 text-sm text-gray-400">
//                                     <span className="truncate max-w-[150px]">{message.fileName || "Unknown file"}</span>
//                                     <span>{(message.fileSize / 1024).toFixed(1)} KB</span>
//                                 </div>
//                             )}
//
//                             <a
//                                 href={mediaUrl}
//                                 download={message.fileName || `${messageType}.${fileExtension}`}
//                                 className="flex items-center gap-1 text-sm text-[#4169E1] hover:underline mt-1"
//                             >
//                                 <Download className="h-4 w-4" />
//                                 Download
//                             </a>
//                         </div>
//                     )}
//
//                     <div
//                         className={`text-xs mt-1 ${
//                             isSender ? "text-[#4169E1]/70" : "text-gray-500"
//                         }`}
//                     >
//                         {moment(message.timestamp).format("LT")}
//                     </div>
//                 </div>
//             </div>
//         );
//     };
//
//     const renderMessages = () => {
//         let lastDate = null;
//
//         return selectedChatMessages.map((message, index) => {
//             const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
//             const showDate = messageDate !== lastDate;
//             lastDate = messageDate;
//
//             return (
//                 <div key={index}>
//                     {showDate && (
//                         <div className="text-center text-gray-500 my-2">
//                             {moment(message.timestamp).format("LL")}
//                         </div>
//                     )}
//                     {renderDMMessage(message)}
//                 </div>
//             );
//         });
//     };
//
//     return (
//         <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
//             {renderMessages()}
//             <div ref={scrollRef} />
//         </div>
//     );
// };
//
// export default MessageContainer;
