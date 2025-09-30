import { animationDefaultOption } from "@/lib/utils"
import Lottie from "react-lottie"

// src/pages/chat/components/empty-chat-contact/index.jsx
const EmptyChatContainer = () => {
    return (
        <div className="flex-1 bg-[#1c1d25] flex-col justify-center items-center hidden md:flex duration-1000 transition-all">
            <Lottie
                isClickToPauseDisabled={true}
                height={200}
                width={200}
                options={animationDefaultOption}
            />
            <div className="text-opacity-80 text-white flex flex-col gap-5 items mt-10 lg:text-4xl text:3xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                    Hi ! Welcome to Bubble Chat App
                </h3>
            </div>
        </div>
    )
}

export default EmptyChatContainer



