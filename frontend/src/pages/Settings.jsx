import React, { useState, useEffect } from 'react'
import LogoutModal from '../components/settings-components/LogoutModal';
import { getUserSettings, updateUserSettings } from '../https';

function Settings() {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // User data state
    const [userData, setUserData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
    });

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUserSettings();
                if (data.user_id) {
                    setUserData({
                        username: data.username || '',
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setMessage({ text: 'Failed to load user data', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const handleEditToggle = async (e) => {
        e.preventDefault();

        if (isEditing) {
            // Save profile
            setSaving(true);
            setMessage({ text: '', type: '' });

            try {
                const result = await updateUserSettings({
                    username: userData.username,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                });

                if (result.success) {
                    setMessage({ text: 'Profile updated successfully!', type: 'success' });
                    setIsEditing(false);
                } else {
                    setMessage({ text: result.error || 'Failed to update profile', type: 'error' });
                }
            } catch (error) {
                setMessage({ text: 'Failed to update profile', type: 'error' });
            } finally {
                setSaving(false);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleChangePasswordToggle = (e) => {
        e.preventDefault();
        setIsChangingPassword(!isChangingPassword);
        setOldPassword('');
        setNewPassword('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!oldPassword) {
            setMessage({ text: 'Please enter your old password', type: 'error' });
            return;
        }
        if (!newPassword) {
            setMessage({ text: 'Please enter a new password', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            const result = await updateUserSettings({
                old_password: oldPassword,
                password: newPassword
            });
            if (result.success) {
                setMessage({ text: 'Password updated successfully!', type: 'success' });
                setIsChangingPassword(false);
                setOldPassword('');
                setNewPassword('');
            } else {
                setMessage({ text: result.error || 'Failed to update password', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to update password', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Get initials for avatar
    const getInitials = () => {
        const first = userData.first_name?.[0] || '';
        const last = userData.last_name?.[0] || '';
        return (first + last).toUpperCase() || userData.username?.[0]?.toUpperCase() || '?';
    };

    if (loading) {
        return (
            <div className='flex flex-col h-screen mx-4 items-center justify-center'>
                <p className='text-gray-500'>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-screen mx-4'>
            {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-col bg-none'>
                    <h1 className='m-0 p-0'>Settings.</h1>
                    <p className='font-medium text-gray-600 text-sm'>Edit and update your personal account details easily and securely.</p>
                </div>

                {/* Success/Error Message */}
                {message.text && (
                    <div className={`mt-2 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className='flex flex-row mt-10 ml-10'>
                    {/* user profile/icon */}
                    <div className='flex flex-col'>
                        <div className='flex flex-row items-center justify-center w-[120px] h-[120px] bg-red-500 rounded-full'>
                            <p className='text-white font-bold text-4xl'>{getInitials()}</p>
                        </div>

                        <button className='my-5 font-semibold text-red-600 hover:underline cursor-pointer'
                            onClick={() => setShowLogoutModal(true)}>
                            <span className='mr-2'>Logout</span>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                    {/* user details form */}
                    <div className='flex flex-col'>
                        <form className='ml-6 flex flex-col gap-4'>
                            {/* Full Name (First + Last) */}
                            <div className='flex flex-row justify-between items-center my-4'>
                                <div className='flex flex-row gap-2'>
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        disabled={!isEditing}
                                        className={`px-4 py-2 text-3xl font-bold tracking-tight rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${!isEditing ? 'bg-transparent border-none' : 'bg-white border border-gray-300'}`}
                                        value={userData.first_name}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        disabled={!isEditing}
                                        className={`px-4 py-2 text-3xl font-bold tracking-tight rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${!isEditing ? 'bg-transparent border-none' : 'bg-white border border-gray-300'}`}
                                        value={userData.last_name}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={handleEditToggle}
                                    type="button"
                                    disabled={saving}
                                    className={`rounded-full text-white font-medium px-4 py-1 transition duration-200 cursor-pointer whitespace-nowrap ml-4 ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {saving ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
                                </button>
                            </div>

                            {/* username */}
                            <div className='flex flex-col'>
                                <p className='font-semibold text-gray-800 ml-4'>Username</p>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    disabled={!isEditing}
                                    className={`ml-3 pl-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-1 ${!isEditing ? 'bg-transparent' : 'bg-white border border-gray-300'}`}
                                    value={userData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
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
                                    value={userData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>

                            {/* Password Button */}
                            <button
                                onClick={handleChangePasswordToggle}
                                type="button"
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
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='font-semibold text-gray-800 ml-4'>New Password</p>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            className='ml-3 pl-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-1 bg-white border border-gray-300'
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handlePasswordSubmit}
                                        disabled={saving}
                                        className={`bg-green-500 ml-4 w-fit text-white font-semibold py-2 px-4 rounded-full hover:bg-green-600 transition duration-200 cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {saving ? 'Saving...' : 'Confirm New Password'}
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