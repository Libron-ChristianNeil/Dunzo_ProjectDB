import React, {useState} from 'react'
import register_illustration from '../assets/register_illustration.jpg';
import { useNavigate } from 'react-router-dom'
import { registerUser} from '../https';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
        const data = await registerUser(username, password);

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
                        <span className='font-bold text-gray-900 text-2xl'>Join Us</span>
                        <i className="fa-regular fa-hand-point-up text-red-500 text-2xl"></i>
                    </div>

                    <span className='text-gray-600 font-medium text-md'>Create your account to manage projects<br/> and stay on track.</span>

                    {/* ERROR MESSAGE BOX */}
                    {errorMsg && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
                            {errorMsg}
                        </div>
                    )}

                    {/* FORM START */}
                    <form onSubmit={handleSubmit} className='flex flex-col my-5 font-medium text-gray-900 gap-3'>

                        {/* USERNAME */}
                        <div className='flex flex-col gap-1'>
                            <p>Username</p>
                            <input
                                type='text'
                                placeholder='Create a username'
                                className='w-100 py-2 pl-2 border border-gray-400 rounded-sm'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className='flex flex-col gap-1'>
                            <p>Password</p>
                            <div className="relative">
                                <input
                                    type='password'
                                    placeholder='Create a strong password'
                                    className='w-100 py-2 pl-2 border border-gray-400 rounded-sm'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className='absolute right-2 top-2 text-gray-500 cursor-pointer'>
                                    <i className="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className='flex flex-col gap-1'>
                            <p>Confirm Password</p>
                            <div className="relative">
                                <input
                                    type='password'
                                    placeholder='Confirm your password'
                                    className='w-100 py-2 pl-2 border border-gray-400 rounded-sm'
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className='absolute right-2 top-2 text-gray-500 cursor-pointer'>
                                    <i className="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className='bg-red-500 text-md py-2 my-4 rounded-xl font-semibold text-white cursor-pointer transition duration-300 hover:-translate-y-1'
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
                    <img src={register_illustration} className='h-160 rounded-tr-2xl rounded-br-2xl'/>
                </div>
            </div>
        </div>
    )
}

export default Register;