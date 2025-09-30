// src/pages/chat/components/contacts-container/index.jsx
import { useEffect } from "react";
import NewDm from "../chat-container/components/my-new-dm";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/api-client";
import { GET_DM_CONTACT_ROUTES } from "@/utills/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/ContactList";

const Logo = () => {
    const { theme } = useAppStore();
    return (
        <div className="flex p-5 justify-start items-center gap-3">
            <svg
                width="48"
                height="32"
                viewBox="0 0 48 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="12" cy="16" r="10" fill="#A5D8FF" fillOpacity="0.7" />
                <circle cx="9" cy="12" r="2" fill="white" fillOpacity="0.9" />
                <circle cx="24" cy="10" r="8" fill="#74C0FC" fillOpacity="0.6" />
                <circle cx="22" cy="8" r="1.5" fill="white" fillOpacity="0.8" />
                <circle cx="36" cy="16" r="6" fill="#4DABF7" fillOpacity="0.5" />
                <circle cx="34" cy="14" r="1" fill="white" fillOpacity="0.7" />
            </svg>
            <span className={`text-3xl font-semibold ${theme === 'dark' ? 'text-blue-100' : 'text-blue-800'}`}>Bubble</span>
        </div>
    );
};

const Title = ({ text }) => {
    return (
        <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
            {text}
        </h6>
    );
};

const ContactsContainer = () => {
    const { setDirectMessagesContacts, directMessagesContacts, theme } = useAppStore();

    useEffect(() => {
        const getContacts = async () => {
            try {
                const response = await apiClient.get(GET_DM_CONTACT_ROUTES, {
                    withCredentials: true
                });
                if (response.status === 200 && response.data.contacts) {
                    setDirectMessagesContacts(response.data.contacts);
                }
            } catch (error) {
                console.error("Failed to fetch contacts:", error);
            }
        };
        getContacts();
    }, [setDirectMessagesContacts]);

    return (
        <div className={`w-full md:w-60 ${theme === 'dark' ? 'bg-[#1b1c24]' : 'bg-gray-100'} flex flex-col h-screen`}>
            {/* TOP SECTION */}
            <div className="flex-1">
                <Logo />

                <div className="my-5">
                    <div className="flex items-center justify-between pr-10">
                        <Title text="Direct Messages"/>
                        <NewDm/>
                    </div>
                    <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
                        <ContactList contacts={directMessagesContacts}/>
                    </div>

                    <div className="my-5">
                        <div className="flex items-center justify-between pr-10">
                            <Title text="Channels"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION */}
            <ProfileInfo />
        </div>
    );
};

export default ContactsContainer;