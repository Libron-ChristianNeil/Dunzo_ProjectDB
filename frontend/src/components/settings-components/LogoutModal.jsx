import React from 'react'
import logout_illustration from '../../assets/logout_illustration.jpg'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../https'

function LogoutModal({ onClose }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            // Clear localStorage
            localStorage.removeItem('authToken');
            // Navigate to home
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still navigate even if backend call fails
            localStorage.removeItem('authToken');
            navigate('/');
        }
    };

    return (
        <div className='flex fixed justify-center items-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='mt-[0%] gap-2 flex flex-col min-w-100 px-5 py-6 bg-white rounded-2xl shadow-md font-medium'>
                <span className=' text-gray-900 font-semibold text-2xl'>Confirm Logout</span>
                <p className='text-gray-700'>Are you sure you want to logout from your account?</p>
                <div className='flex flex-row gap-2'>
                    <button className=' grow bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md cursor-pointer'
                        onClick={handleLogout}>
                        Logout
                    </button>
                    <button className=' grow bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-md cursor-pointer'
                        onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>

        </div>
    )
}

export default LogoutModal