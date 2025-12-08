import React from 'react'
import { useState } from 'react';
import { formatToDateInput } from '../../utils/formatToDateInput';
import { getInitials } from '../../utils/getInitials'
import { useNavigate} from 'react-router-dom';

function ModalExpandProject({item, onClose}) {
    const navigate = useNavigate();
     // Local state for editing, initialized with current value
    const [desc, setDesc] = useState(item?.desc || "");
    const [dates, setDates] = useState(
        {
            start: formatToDateInput(item?.startDate),
            end: formatToDateInput(item?.endDate),
        }
    );
    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            {/* Item */}
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col bg-white p-6 min-w-150 gap-3'>
                    {/* project icon */}
                    <div className='flex flex-row justify-between'>
                        <div style={{ backgroundColor: item.color }} 
                            className='flex items-center justify-center bg-linear-to-br h-12 w-12 rounded-xl'>
                            <span className='font-bold text-white text-xl'>{item.name[0]}</span>
                        </div>

                        <i className='fas fa-ellipsis-v'></i>
                    </div>
                    

                    {/* project name */}
                    <span className='font-semibold text-gray-900 text-md'>{item.name}</span>
                    {/* dates */}
                    <div className='text-sm text-gray-700'>

                        <div className='flex flex-row gap-2'>
                            <p>Start Date</p>
                            <input
                                type="date"
                                value={dates.start}
                                onChange={(e) =>
                                    setDates({ ...dates, start: e.target.value })
                            }/>
                        </div>

                        <div className='flex flex-row gap-2'>
                            <p>End Date</p>
                            <input
                                type="date"
                                value={dates.end}
                                onChange={(e) =>
                                    setDates({ ...dates, end: e.target.value })
                            }/>
                        </div>
                    </div>

                    {/* Description */}
                    <div className='text-gray-700 text-sm my-1 '>
                            <textarea
                            value={desc}                     
                            onChange={(e) => setDesc(e.target.value)}  // local changes
                            className="w-full p-2 border rounded resize-none overflow-hidden"
                            onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            placeholder="Write a short description..."
                        />
                    </div>

                    {/* stats */}
                    <div className='flex flex-row justify-around bg-gray-50 py-4 rounded-xl shadow-2xs'>
                        <div className='flex flex-col items-center justify-center'>
                            <p className='font-bold text-xl text-gray-800 m-0 p-0'>{item.numTask}</p>
                            <p className='m-0 p-0 text-sm text-gray-600'>Task</p>
                        </div>

                        <div className='flex flex-col items-center justify-center'>
                            <p className='font-bold text-xl text-gray-800 m-0 p-0'>{item.numComplete}</p>
                            <p className='m-0 p-0 text-sm text-gray-600'>Done</p>
                        </div>

                        <div className='flex flex-col items-center justify-center'>
                            <p className='font-bold text-xl text-gray-800 m-0 p-0'>{item.numMembers}</p>
                            <p className='m-0 p-0 text-sm text-gray-600'>Team</p>
                        </div>
                    </div>
                    {/* View tasks button */}
                    <span className='font-medium text-sm text-green-500 hover:underline cursor-pointer'
                            onClick={() => navigate("/task")}>
                        View Tasks
                    </span>
                    {/* Progress Bar */}
                    <div className='flex flex-col'>
                        <span className='text-gray-600 text-sm mb-1'>Overall Progress</span>
                        <div className='bg-gray-300 w-full h-2 rounded-full shadow-2xl'>
                            <div className={` h-2 rounded-full
                                            ${item.percentage == '100' ? 'bg-green-500' : 'bg-red-500'}`} 
                                style={{ width: `${item.percentage}%` }}>
                            </div>
                        </div>
                    </div>
                            
                    <div className='flex flex-row mt-3 justify-between align-middle'>
                            {/* members */}
                            
                        <div className='flex flex-row gap-1'>

                            {item.name !== 'General' ? (
                                <div className='flex items-center justify-center rounded-full h-9 w-9 bg-gray-100 text-gray-600 text-sm font-semibold border-gray-300 border-2 cursor-pointer'>
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                            ) : null}
                            
                            {item.members.map((mem) => (
                                <div
                                key={mem.id}
                                style={{ backgroundColor: mem.avatarColor }}
                                className='flex items-center justify-center rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'
                                >
                                {getInitials(mem.name)}
                                </div>
                            ))}
                        </div>
                        
                        {/* status */}
                        <div className={`flex flex-row items-center justify-center font-semibold py-1 px-4 rounded-full
                                ${item.status === 'Active' && 'bg-blue-100 text-blue-500'}
                                ${item.status === 'Completed' && 'bg-green-100 text-green-500'}
                                ${item.status === 'Archived' && 'bg-gray-200 text-gray-700'}`}>
                            {item.status}
                        </div>
                    </div>
                </div>

                {/* Comment section */}
                <div className='flex flex-col w-120 py-5 px-5 bg-gray-100'>
                    <div className='flex flex-row justify-between gap-2 '>
                        <div className='flex flex-row items-center gap-2 text-md font-medium text-gray-900'>
                            <i className="fa-regular fa-message"></i>
                            <span>Comments</span>
                        </div>
                        <button className='cursor-pointer'onClick={onClose}>
                            <i className="fa-regular fa-circle-xmark text-xl"></i>
                        </button>
                    </div>
                    
                    <textarea
                        placeholder="Write a short description..."
                        className="w-full mt-2 p-2 border rounded resize-none overflow-hidden text-sm min-h-[60px]"
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default ModalExpandProject