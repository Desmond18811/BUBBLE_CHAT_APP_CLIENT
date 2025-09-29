import Background from '@/assets/login2.png';
import Victory from '@/assets/victory.svg';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiClient from "@/lib/api-client"
import { LOGIN, SIGNUP } from '@/utills/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Moon, Sun } from 'lucide-react';

const Auth = () => {
    const navigate = useNavigate()
    const { setUserInfo } = useAppStore()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [darkMode, setDarkMode] = useState(false);

    // Check for saved theme preference or default to light mode
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

    const validateSignUp = () => {
        if (!email.length) {
            toast.error("Email is required")
            return false
        }
        if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            toast.error("Invalid email format")
            return false
        }
        if (!password.length) {
            toast.error("Password is required")
            return false
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return false
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return false
        }
        return true
    }

    const validateLogin = () => {
        if (!email.length) {
            toast.error("Email is required")
            return false
        }
        if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
            toast.error("Invalid email format")
            return false
        }
        if (!password.length) {
            toast.error("Password is required")
            return false
        }
        return true
    }

    const handleLogin = async () => {
        if (validateLogin()) {
            try {
                const response = await apiClient.post(LOGIN, { email, password }, { withCredentials: true });
                console.log({ response });

                if (response.data.user.id) {
                    setUserInfo(response.data.user)
                    if (response.data.user.profileSetup) navigate('/chat')
                    else
                        navigate("/profile")
                }
            } catch (error) {
                toast.error(error.response?.data?.error || "Login failed");
            }
        }
    };

    const handleSignUp = async () => {
        if (validateSignUp()) {
            try {
                const response = await apiClient.post(
                    SIGNUP,
                    { email, password },
                    { withCredentials: true }
                );
                console.log({ response });

                if (response.status === 201) {
                    setUserInfo(response.data.user)
                    navigate("/profile");
                }
            } catch (error) {
                toast.error(error.response?.data?.error || "Signup failed");
            }
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 transition-colors duration-300">
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

            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300 border border-gray-100 dark:border-gray-700">
                <div className="grid lg:grid-cols-2 min-h-[600px]">
                    {/* Left Column - Form */}
                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
                        <div className="w-full max-w-md">
                            {/* Header */}
                            <div className="flex items-center justify-center mb-4">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mr-2 transition-colors duration-300">
                                    Welcome
                                </h1>
                                <img
                                    src={Victory}
                                    alt="Victory Emoji"
                                    className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24"
                                />
                            </div>

                            <p className="font-medium text-center mb-8 text-gray-600 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">
                                Fill in the details to get started with the best chat app!
                            </p>

                            {/* Tabs */}
                            <Tabs className="w-full" defaultValue='login'>
                                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300">
                                    <TabsTrigger
                                        value="login"
                                        className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 transition-all duration-300 py-2.5 text-sm sm:text-base font-medium"
                                    >
                                        Login
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="signup"
                                        className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 transition-all duration-300 py-2.5 text-sm sm:text-base font-medium"
                                    >
                                        Sign Up
                                    </TabsTrigger>
                                </TabsList>

                                {/* Login Form */}
                                <TabsContent className="flex flex-col gap-5 w-full mt-0" value="login">
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Email"
                                            type="email"
                                            className="rounded-full px-6 py-6 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-300"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Password"
                                            type="password"
                                            className="rounded-full px-6 py-6 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-300"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="rounded-full py-6 mt-2 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={handleLogin}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-full py-6 mt-2 text-base font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                        onClick={handleGoogleAuth}
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.033s2.701-6.033,6.033-6.033c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.326,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.972L12.545,10.239z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </Button>
                                </TabsContent>

                                {/* Sign Up Form */}
                                <TabsContent className="flex flex-col gap-5 w-full mt-0" value="signup">
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Email"
                                            type="email"
                                            className="rounded-full px-6 py-6 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-300"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Password"
                                            type="password"
                                            className="rounded-full px-6 py-6 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-300"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Confirm Password"
                                            type="password"
                                            className="rounded-full px-6 py-6 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 transition-all duration-300"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="rounded-full py-6 mt-2 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={handleSignUp}
                                    >
                                        Sign Up
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-full py-6 mt-2 text-base font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                        onClick={handleGoogleAuth}
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.033s2.701-6.033,6.033-6.033c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.326,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.972L12.545,10.239z"
                                            />
                                        </svg>
                                        Sign up with Google
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right Column - Background Image */}
                    <div className="hidden lg:flex justify-center items-center bg-gradient-to-br from-blue-100 to-blue-100 dark:from-gray-700 dark:to-gray-800 transition-colors duration-300 p-8">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full"></div>
                            <img
                                src={Background}
                                alt="background-login"
                                className="relative h-full w-auto object-cover drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;