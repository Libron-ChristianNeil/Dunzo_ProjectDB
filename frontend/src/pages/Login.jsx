import React from 'react'
import login_illustration from '../assets/login_illustration.jpg';
import { useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate();
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

                    <div className='flex flex-col mt-5 font-medium text-gray-900 gap-1'>
                        <p>Email</p>

                        <input type='email'
                            placeholder='Enter your email'
                            className='w-100 py-2 pl-2 border border-gray-400 rounded-sm'/>
                    </div>

                    <div className='flex flex-col mt-4 pb-3 font-medium text-gray-900 gap-1'>
                        <p>Password</p>
                        <div>
                            <input type='Password'
                                placeholder='Password'
                                className='w-100 py-2 pl-2 border border-gray-400 rounded-sm'/>
                            <button className='-ml-10 cursor-pointer p-2'>
                                <i className="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-row items-center gap-2'>
                            <input type='checkbox'
                                    className='w-3 h-3 ml-0.5'/>
                            <p>Remember me</p>
                        </div>

                        <button className='text-red-500 font-medium text-sm hover:underline cursor-pointer mr-1'>
                            Forgot Password
                        </button>
                    </div>

                    <button className='bg-red-500 text-md py-2 my-4 rounded-xl font-semibold text-white cursor-pointer transition duration-300 hover:-translate-y-1'
                        onClick={() => navigate('/user/dashboard')}>
                        Login
                    </button>

                    <div className='flex flex-row gap-1 justify-center'>
                        <p className='text-sm font-medium text-gray-700'>Don't have an account?</p>
                        <button className='text-red-500 font-semibold text-sm'
                            onClick={() => navigate('/register')}>
                            Register
                        </button>
                    </div>
                    
                </div>

                <div>
                    <img src={login_illustration} className='h-160 rounded-tr-2xl rounded-br-2xl'/>
                </div>
            </div>
        </div>
    )
}

export default Login