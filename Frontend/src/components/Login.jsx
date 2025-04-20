import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import checkValidData from "../utils/validateData";

const USER_API_BASE = import.meta.env.VITE_USER_SERVICE_URL;

const Login = () => {
    const [isSignInForm, setIsSignInForm] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const refs = {
        name: useRef(null),
        email: useRef(null),
        password: useRef(null),
    };

    const navigate = useNavigate();

    const toggleSignInForm = () => setIsSignInForm((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailVal = refs.email.current.value;
        const passwordVal = refs.password.current.value;
        const nameVal = refs.name.current?.value;

        const error = checkValidData(emailVal, passwordVal);
        if (error) return setErrorMessage(error);

        try {
            if (isSignInForm) {
                const res = await axios.post(
                    `${USER_API_BASE}/login`,
                    { email: emailVal, password: passwordVal },
                    { withCredentials: true }
                );
                localStorage.setItem("token", res?.data?.data?.token);
                navigate("/home");
            } else {
                await axios.post(
                    `${USER_API_BASE}/signup`,
                    { name: nameVal, email: emailVal, password: passwordVal },
                    { headers: { "Content-Type": "application/json" } }
                );
                setIsSignInForm(true);
            }
        } catch (err) {
            console.error("Auth error:", err?.response?.data || err.message);
            setErrorMessage(err?.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-black bg-opacity-75 rounded-lg absolute w-full max-w-md mt-36 mx-auto right-0 left-0 text-white"
            >
                <h1 className="font-bold text-3xl py-4">
                    {isSignInForm ? "Sign In" : "Sign Up"}
                </h1>

                <div className="space-y-4">
                    {!isSignInForm && (
                        <input
                            ref={refs.name}
                            type="text"
                            placeholder="Name"
                            className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    )}
                    <input
                        ref={refs.email}
                        type="text"
                        placeholder="Email or phone number"
                        className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        ref={refs.password}
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 p-3 mt-6 rounded-lg font-semibold"
                >
                    {isSignInForm ? "Login" : "Sign Up"}
                </button>

                {errorMessage && (
                    <p className="text-bold text-l text-red-500 p-2 mt-2">
                        {errorMessage}
                    </p>
                )}

                <p
                    className="mt-3 text-sm text-gray-400 cursor-pointer"
                    onClick={toggleSignInForm}
                >
                    {isSignInForm
                        ? "New? Sign up now."
                        : "Already an existing user? Sign in now."}
                </p>
            </form>
        </div>
    );
};

export default Login;
