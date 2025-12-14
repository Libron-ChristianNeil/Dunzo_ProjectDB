import React, { useState } from 'react'
import LogoutModal from '../components/settings-components/LogoutModal';
function Settings() {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleEditToggle = (e) => {
        e.preventDefault(); 
        setIsEditing(!isEditing);
    };

    const handleChangePasswordToggle = (e) => {
        e.preventDefault();
        setIsChangingPassword(!isChangingPassword);
    };

    return (
        <div className='flex flex-col h-screen mx-4'>
            {showLogoutModal && <LogoutModal onClose={()=>setShowLogoutModal(false)}/>}
            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-col bg-none'>
                    <h1 className='m-0 p-0'>Settings.</h1>
                    <p className='font-medium text-gray-600 text-sm'>Edit and update your personal account details easily and securely.</p>
                </div>

                <div className='flex flex-row mt-10 ml-10'>
                    {/* user profile/icon */}
                    <div className='flex flex-col'>
                        <div className='flex flex-row items-center justify-center w-[120px] h-[120px] bg-red-500 rounded-full'>
                            <p className='text-white font-bold text-4xl'>JV</p>
                        </div>

                        <button className='my-5 font-semibold text-red-600 hover:underline cursor-pointer'
                            onClick={()=>setShowLogoutModal(true)}>
                            <span className='mr-2'>Logout</span>
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                    {/* user details form */}
                    <div className='flex flex-col'> 
                        <form className='ml-6 flex flex-col gap-4'>
                            <div className='flex flex-row justify-between items-center my-4'>
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    disabled={!isEditing}
                                    className={`px-4 py-2 text-3xl font-bold tracking-tight rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full ${!isEditing ? 'bg-transparent border-none' : 'bg-white'}`} 
                                    defaultValue="Josephs Victors"
                                />

                                <button 
                                    onClick={handleEditToggle}
                                    type="button" 
                                    className={`rounded-full text-white font-medium px-4 py-1 transition duration-200 cursor-pointer whitespace-nowrap ml-4 ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                >
                                    {isEditing ? 'Save Profile' : 'Edit Profile'}
                                </button>
                            </div>

                            {/* username */}
                            <div className='flex flex-col'>
                                <p className='font-semibold text-gray-800 ml-4'>Username</p>
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    readOnly
                                    className={`ml-3 pl-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-1 ${!isEditing ? 'bg-transparent' : 'bg-white border border-gray-300'}`}
                                    value="josephsvictors" //pls pa change ani HAHAHAHAHAHA
                                />
                            </div>
                            
                            {/* email */}
                            <div className='flex flex-col'>
                                <p className='font-semibold text-gray-800 ml-4'>Email</p>
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    disabled={!isEditing}
                                    className={`ml-3 pl-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-1 ${!isEditing ? 'bg-transparent' : 'bg-white border border-gray-300'}`}
                                    defaultValue="example@email.com"
                                />
                            </div>
                            
                            {/* Password Button */}
                            <button 
                                onClick={handleChangePasswordToggle}
                                className='bg-red-500 ml-4 w-fit text-white font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition duration-200 cursor-pointer mt-4'
                            >
                                {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
                            </button>
                            {isChangingPassword && (
                                <div className='flex flex-col gap-4 mt-2 transition-all duration-300 ease-in-out'>
                                    <div className='flex flex-col'>
                                        <p className='font-semibold text-gray-800 ml-4'>Old Password</p>
                                        <input 
                                            type="password" 
                                            placeholder="Enter old password" 
                                            className='ml-3 pl-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-1 bg-white border border-gray-300'
                                        />
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='font-semibold text-gray-800 ml-4'>New Password</p>
                                        <input 
                                            type="password" 
                                            placeholder="Enter new password" 
                                            className='ml-3 pl-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-1 bg-white border border-gray-300'
                                        />
                                    </div>
                                    <button className='bg-green-500 ml-4 w-fit text-white font-semibold py-2 px-4 rounded-full hover:bg-green-600 transition duration-200 cursor-pointer'>
                                        Confirm New Password
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings