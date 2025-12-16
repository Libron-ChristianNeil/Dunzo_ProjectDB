import React, { useState } from 'react'
import login_illustration from '../assets/login_illustration.jpg';
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../https';

function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Call the backend
        const data = await loginUser(identifier, password);

        if (data.success) {
            console.log("Login Success!", data);
            // Minimal compatibility fix: ProtectedRoute checks localStorage for 'authToken'.
            // Store a simple token/flag so the existing guard will allow access.
            try {
                localStorage.setItem('authToken', data.username || 'true');
            } catch (e) {
                console.warn('Failed to write authToken to localStorage', e);
            }
            navigate('/user/dashboard');
        } else {
            setErrorMsg(data.error || "Login failed. Please check your credentials.");
        }
    };
    return (
        <div className='flex fixed items-center justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-200'>
            <div className='flex felx-row'>
                <div className='bg-white shadow flex flex-col min-w-100 pt-3 pb-7 px-5 rounded-tl-2xl rounded-bl-2xl'>

                    <div className='flex flex-row justify-between items-center mt-2'>
                        <span className='font-black text-red-500 text-2xl tracking-tighter'>dunzo.</span>
                        <button className='px-3 py-2 cursor-pointer -mr-1'
                            onClick={() => navigate('/')}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </button>

                    </div>

                    <div className='flex flex-row gap-3 items-center'>
                        <span className='font-bold text-gray-900 text-2xl'>Welcome Back</span>
                        <i className="fa-regular fa-hand text-red-500 text-2xl"></i>
                    </div>

                    <span className='text-gray-600 font-medium text-md'>Log in to manage your tasks.</span>

                    {/* --- ERROR MESSAGE DISPLAY --- */}
                    {errorMsg && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                            {errorMsg}
                        </div>
                    )}

                    {/* --- FORM START ---
                        Wrapping inputs in a form allows "Enter" key to submit
                    */}
                    <form onSubmit={handleSubmit} className='mt-5'>

                        <div className='flex flex-col font-medium text-gray-900 gap-1'>
                            <p>Username/Email</p>
                            <input
                                type='text'
                                placeholder='Enter your username/email'
                                className='w-100 py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                // 1. BIND VALUE AND ONCHANGE
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>

                        <div className='flex flex-col mt-4 pb-3 font-medium text-gray-900 gap-1'>
                            <p>Password</p>
                            <div className="relative"> {/* Added relative for positioning if needed */}
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Password'
                                    className='w-100 py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                    // 2. BIND VALUE AND ONCHANGE
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {/* Toggle password visibility */}
                                <button type="button" className='absolute right-2 top-2 cursor-pointer text-gray-500'
                                    onClick={() => setShowPassword(!showPassword)}>
                                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-row justify-between'>
                            <div className='flex flex-row items-center gap-2'>
                                <input type='checkbox' className='w-3 h-3 ml-0.5' />
                                <p>Remember me</p>
                            </div>

                            <button type="button" className='text-red-500 font-medium text-sm hover:underline cursor-pointer mr-1'>
                                Forgot Password
                            </button>
                        </div>

                        {/* 3. SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className='w-full bg-red-500 text-md py-2 my-4 rounded-xl font-semibold text-white cursor-pointer transition duration-300 hover:-translate-y-1'
                        >
                            Login
                        </button>

                    </form>
                    {/* --- FORM END --- */}

                    <div className='flex flex-row gap-1 justify-center'>
                        <p className='text-sm font-medium text-gray-700'>Don't have an account?</p>
                        <button className='text-red-500 font-semibold text-sm'
                            onClick={() => navigate('/register')}>
                            Register
                        </button>
                    </div>

                </div>

                <div>
                    <img src={login_illustration} className='h-160 rounded-tr-2xl rounded-br-2xl' />
                </div>
            </div>
        </div>
    )
}

export default Login;