import React, { useState } from 'react'
import register_illustration from '../assets/register_illustration.jpg';
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../https';

function Register() {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Client-side Validation
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        // Call the backend
        const data = await registerUser(username, firstName, lastName, email, password);

        if (data.success) {
            console.log("Register Success!", data);
            // Minimal compatibility fix: ProtectedRoute checks localStorage for 'authToken'.
            // Store a simple token/flag so the existing guard will allow access.
            try {
                localStorage.setItem('authToken', data.username || 'true');
            } catch (e) {
                console.warn('Failed to write authToken to localStorage', e);
            }
            navigate('/user/dashboard');
        } else {
            setErrorMsg(data.error || "Register failed.");
        }
    };
    return (
        <div className='flex fixed items-center justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-200'>

            <div className='flex flex-row'>
                <div className='bg-white shadow flex flex-col min-w-100 h-160 pt-3 pb-7 px-5 rounded-tl-2xl rounded-bl-2xl justify-between'>

                    <div className='flex flex-row justify-between items-center mt-2'>
                        <span className='font-black text-red-500 text-2xl tracking-tighter'>dunzo.</span>
                        <button className='px-3 py-2 cursor-pointer -mr-1'
                            onClick={() => navigate('/')}>
                            <i className="fa-regular fa-circle-xmark"></i>
                        </button>

                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <span className='font-bold text-gray-900 text-2xl'>Join Us</span>
                        <i className="fa-regular fa-hand-point-up text-red-500 text-xl"></i>
                    </div>

                    <span className='text-gray-600 font-medium text-md'>Create your account to manage projects<br /> and stay on track.</span>

                    {/* ERROR MESSAGE BOX */}
                    {errorMsg && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                            {errorMsg}
                        </div>
                    )}

                    {/* FORM START */}
                    <form onSubmit={handleSubmit} className='flex flex-col my-2 font-medium text-gray-900 gap-2 text-sm'>

                        {/* USERNAME */}
                        <div className='flex flex-col gap-1'>
                            <p>Username</p>
                            <input
                                type='text'
                                placeholder='Create a username'
                                className='w-100 py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* FIRST NAME & LAST NAME */}
                        <div className='flex flex-row gap-3 w-100'>
                            <div className='flex flex-col gap-1 flex-1 min-w-0'>
                                <p>First Name</p>
                                <input
                                    type='text'
                                    placeholder='Enter your first name'
                                    className='w-full py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='flex flex-col gap-1 flex-1 min-w-0'>
                                <p>Last Name</p>
                                <input
                                    type='text'
                                    placeholder='Enter your last name'
                                    className='w-full py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className='flex flex-col gap-1'>
                            <p>Email</p>
                            <input
                                type='email'
                                placeholder='Enter your email'
                                className='w-100 py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className='flex flex-col gap-1'>
                            <p>Password</p>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Create a strong password'
                                    className='w-100 py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className='absolute right-2 top-2 text-gray-500 cursor-pointer'
                                    onClick={() => setShowPassword(!showPassword)}>
                                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className='flex flex-col gap-1'>
                            <p>Confirm Password</p>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder='Confirm your password'
                                    className='w-100 py-2 pl-2 border border-gray-400 rounded-sm placeholder:text-gray-500'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className='absolute right-2 top-2 text-gray-500 cursor-pointer'
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <i className={showConfirmPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className='bg-red-500 text-sm py-2 my-2 rounded-xl font-semibold text-white cursor-pointer transition duration-300 hover:-translate-y-1'
                        >
                            Register
                        </button>
                    </form>
                    {/* FORM END */}

                    <div className='flex flex-row gap-1 justify-center'>
                        <p className='text-sm font-medium text-gray-700'>Already have an account?</p>
                        <button className='text-red-500 font-semibold text-sm'
                            onClick={() => navigate('/login')}>
                            Login
                        </button>
                    </div>

                </div>

                <div>
                    <img src={register_illustration} className='h-160 rounded-tr-2xl rounded-br-2xl' />
                </div>
            </div>
        </div>
    )
}

export default Register;