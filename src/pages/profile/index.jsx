// src/pages/Profile.jsx
import { useAppStore } from "@/store";
import { IoArrowBack } from 'react-icons/io5';
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { UPDATE_PROFILE_ROUTE, ADD_PROFILE_IMAGE_ROUTE, REMOVE_PROFILE_IMAGE_ROUTE } from "@/utills/constants";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utills/imageUtils";
import { Moon, Sun, Camera } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useAppStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [hovered, setHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(0);
    const fileInputRef = useRef(null);
    const [localImage, setLocalImage] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    // Check for saved theme preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    useEffect(() => {
        if (userInfo) {
            setFirstName(userInfo.firstName || "");
            setLastName(userInfo.lastName || "");
            setSelectedColor(userInfo.color || 0);
        }
    }, [userInfo]);

    const validateProfile = () => {
        if (!firstName) {
            toast.error("First name is required");
            return false;
        }
        if (!lastName) {
            toast.error("Last name is required");
            return false;
        }
        return true;
    };

    const saveChanges = async () => {
        if (validateProfile()) {
            try {
                const response = await apiClient.post(
                    UPDATE_PROFILE_ROUTE,
                    {
                        firstName,
                        lastName,
                        color: selectedColor,
                        profileSetup: true
                    },
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    setUserInfo({
                        ...userInfo,
                        firstName,
                        lastName,
                        color: selectedColor,
                        profileSetup: true,
                        image: userInfo.image
                    });
                    toast.success("Profile successfully updated");
                    navigate("/chat");
                }
            } catch (error) {
                console.error("Update error:", error);
                toast.error(error.response?.data?.message || "Failed to update profile");
            }
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setLocalImage(previewUrl);

        try {
            const formData = new FormData();
            formData.append("profile-image", file);

            const response = await apiClient.post(
                ADD_PROFILE_IMAGE_ROUTE,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (response.data?.image) {
                setUserInfo(prev => ({
                    ...prev,
                    image: response.data.image,
                    color: selectedColor
                }));
                setLocalImage(null);
                toast.success("Profile image updated successfully");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload image");
            setLocalImage(null);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async () => {
        try {
            const response = await apiClient.post(
                REMOVE_PROFILE_IMAGE_ROUTE,
                {},
                { withCredentials: true }
            );

            if (response.status === 200) {
                setUserInfo(prev => ({ ...prev, image: null }));
                toast.success("Profile image removed successfully");
            }
        } catch (error) {
            console.error("Image delete error:", error);
            toast.error(error.response?.data?.message || "Failed to remove image");
        }
    };

    const currentImageUrl = localImage || getImageUrl(userInfo?.image);

    if (!userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Loading user data...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleDarkMode}
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                    <Moon className="w-5 h-5 text-blue-600" />
                )}
            </button>

            <div className="w-full max-w-5xl mx-auto">
                {/* Back Button */}
                <div className="mb-4 sm:mb-6 lg:mb-8 px-2">
                    <button
                        onClick={() => userInfo.profileSetup ? navigate("/chat") : toast.error("Please set up your profile")}
                        className="group flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                    >
                        <IoArrowBack className="text-2xl sm:text-3xl lg:text-5xl transition-transform duration-300 group-hover:-translate-x-1"/>
                        <span className="text-sm sm:text-base lg:text-lg font-medium">Back to Chat</span>
                    </button>
                </div>

                {/* Main Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-12 border border-gray-100 dark:border-gray-700 transition-colors duration-300 mx-2 sm:mx-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
                        Profile Setup
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center order-1 lg:order-1">
                            <div
                                className="relative group"
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                onTouchStart={() => setHovered(true)}
                            >
                                <Avatar className="h-32 w-32 xs:h-36 xs:w-36 sm:h-44 sm:w-44 lg:h-56 lg:w-56 rounded-full overflow-hidden shadow-xl ring-4 ring-blue-100 dark:ring-blue-900 transition-all duration-300">
                                    {currentImageUrl ? (
                                        <AvatarImage
                                            src={currentImageUrl}
                                            alt="profile"
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className={`
                      uppercase h-full w-full 
                      text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold
                      flex items-center justify-center 
                      ${getColor(selectedColor)}
                    `}>
                                            {firstName ? firstName.charAt(0) : userInfo.email.charAt(0)}
                                        </div>
                                    )}
                                    {hovered && (
                                        <div
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer transition-all duration-300"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                userInfo.image ? handleDeleteImage() : fileInputRef.current?.click();
                                            }}
                                        >
                                            {userInfo.image ? (
                                                <>
                                                    <FaTrash className="text-white text-2xl sm:text-3xl lg:text-4xl mb-2" />
                                                    <span className="text-white text-xs sm:text-sm font-medium">Remove</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="text-white w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-2" />
                                                    <span className="text-white text-xs sm:text-sm font-medium">Upload Photo</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleImageChange}
                                    accept=".png,.jpg,.jpeg,.webp"
                                />
                            </div>

                            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs px-4">
                                Tap the avatar to {userInfo.image ? 'remove or change' : 'upload'} your profile picture
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="flex flex-col gap-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        disabled
                                        value={userInfo.email}
                                        className="w-full rounded-xl px-4 py-6 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors duration-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        First Name *
                                    </label>
                                    <Input
                                        placeholder="Enter your first name"
                                        type="text"
                                        onChange={(e) => setFirstName(e.target.value)}
                                        value={firstName}
                                        className="w-full rounded-xl px-4 py-6 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all duration-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Last Name *
                                    </label>
                                    <Input
                                        placeholder="Enter your last name"
                                        type="text"
                                        onChange={(e) => setLastName(e.target.value)}
                                        value={lastName}
                                        className="w-full rounded-xl px-4 py-6 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all duration-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Choose Profile Color
                                    </label>
                                    <div className="flex flex-wrap gap-3 sm:gap-4">
                                        {colors.map((color, index) => (
                                            <div
                                                key={index}
                                                className={`${color} h-10 w-10 sm:h-12 sm:w-12 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg
                          ${selectedColor === index ? 'ring-4 ring-blue-500 dark:ring-blue-400 scale-110' : ''}`}
                                                onClick={() => setSelectedColor(index)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 mt-4 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={saveChanges}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl p-4 text-center transition-colors duration-300">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        💡 <span className="font-medium">Tip:</span> Complete your profile to unlock all features and personalize your experience
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;