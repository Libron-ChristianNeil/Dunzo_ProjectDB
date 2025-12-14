import React from 'react'
// import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { menuItems } from '../data/menuItems';
import { getInitials } from '../utils/getInitials'; // helper function to get initials from fullname

function Sidebar({ fullname = 'Josephs Victors', position = 'Product Manager' }) {
    // const [activeTab, setActiveTab] = useState('Dashboard');
    const navigate = useNavigate();
    const location = useLocation();
    // const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');

    return (
        <div className='flex flex-col w-[260px] h-screen fixed top-0 left-0 bg-white overflow-hidden box-border shadow-custom z-100'>
            <div className='flex flex-row  items-center my-[25px]'>
                {/* <button className='border-none bg-transparent cursor-pointer ml-[22px]'>
                    <i className='fa-solid fa-bars-progress text-[1.8rem]' style={{ color: 'red' }}> </i>
                </button> */}
                <p className='text-[1.65rem] ml-7 font-black text-red-500'>
                    dunzo.
                </p>
            </div>

            <ul className='flex flex-col list-none my-[15px] p-0'>
                {menuItems.map((item) => (
                    <li
                        key={item.name}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)} // Navigate on click
                    >
                        <i className={`fa-solid ${item.icon}`}></i>
                        {item.name}
                    </li>
                ))}
            </ul>


            <div className='flex flex-row gap-2 items-center px-6 py-3 cursor-pointer mt-auto mb-2 bg-gray-100 rounded-lg'
                onClick={() => navigate('/user/settings')}>
                <div className='flex flex-row items-center justify-center h-10 w-10 text-white font-bold bg-red-500 rounded-full'>
                    {getInitials(fullname)}
                </div>
                <div className='flex flex-col'>
                    <p className='font-semibold mb-0'>{fullname}</p>
                    <p className='text-[0.9rem] text-gray-600 mt-0'>{position}</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar