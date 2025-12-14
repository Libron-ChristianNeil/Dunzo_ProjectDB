import React, { useState, useEffect, useRef } from 'react'
import { formatToDateInput } from '../../utils/formatToDateInput';
import { getInitials } from '../../utils/getInitials'
import { useNavigate } from 'react-router-dom';
import { getProjectTags, createTag, updateTag, deleteTag } from '../../https';

function ModalExpandProject({ item, onClose }) {
    const navigate = useNavigate();

    // Guard against null item
    if (!item) {
        return null;
    }

    // Local state for editing, initialized with current value
    const [desc, setDesc] = useState(item?.desc || "");
    const [dates, setDates] = useState({
        start: formatToDateInput(item?.startDate),
        end: formatToDateInput(item?.endDate),
    });

    // Tag Management State
    const [projectTags, setProjectTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [tagNameInput, setTagNameInput] = useState('');
    const [tagColorInput, setTagColorInput] = useState('#3b82f6');
    const [editingTagId, setEditingTagId] = useState(null);
    const tagMenuRef = useRef(null);

    // Fetch tags on mount
    useEffect(() => {
        if (item.id) {
            fetchProjectTags();
        }
    }, [item.id]);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (tagMenuRef.current && !tagMenuRef.current.contains(event.target)) {
                setShowTagMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [tagMenuRef]);

    const fetchProjectTags = async () => {
        setLoadingTags(true);
        try {
            const res = await getProjectTags(item.id);
            if (res.success) {
                setProjectTags(res.tags);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleCreateTag = async () => {
        if (!tagNameInput.trim()) return;

        try {
            const res = await createTag({
                project_id: item.id,
                name: tagNameInput,
                hex_color: tagColorInput
            });

            if (res.success) {
                fetchProjectTags();
                setTagNameInput('');
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTagId || !tagNameInput.trim()) return;

        try {
            const res = await updateTag({
                tag_id: editingTagId,
                name: tagNameInput,
                hex_color: tagColorInput
            });

            if (res.success) {
                fetchProjectTags();
                setEditingTagId(null);
                setTagNameInput('');
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTag = async (tagId) => {
        if (!confirm("Are you sure you want to delete this tag? It will be removed from all tasks.")) return;

        try {
            const res = await deleteTag(tagId);
            if (res.success) {
                fetchProjectTags();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const startEditing = (tag) => {
        setEditingTagId(tag.tag_id);
        setTagNameInput(tag.name);
        setTagColorInput(tag.hex_color);
    };

    const cancelEditing = () => {
        setEditingTagId(null);
        setTagNameInput('');
        setTagColorInput('#3b82f6');
    };

    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            {/* Item */}
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col bg-white p-6 min-w-150 gap-3 relative'>
                    {/* project icon */}
                    <div className='flex flex-row justify-between'>
                        <div style={{ backgroundColor: item.color }}
                            className='flex items-center justify-center bg-linear-to-br h-12 w-12 rounded-xl'>
                            <span className='font-bold text-white text-xl'>{item.name?.[0] || '?'}</span>
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
                                } />
                        </div>

                        <div className='flex flex-row gap-2'>
                            <p>End Date</p>
                            <input
                                type="date"
                                value={dates.end}
                                onChange={(e) =>
                                    setDates({ ...dates, end: e.target.value })
                                } />
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

                    {/* Tags Section */}
                    <div className='flex flex-col gap-2 relative'>
                        <span className='text-sm font-semibold text-gray-900'>Tags</span>
                        <div className='flex flex-wrap gap-2 items-center'>
                            {projectTags.map(tag => (
                                <div key={tag.tag_id}
                                    className='group flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-medium'
                                    style={{ backgroundColor: tag.hex_color }}>
                                    {tag.name}
                                </div>
                            ))}
                            <button
                                onClick={() => setShowTagMenu(!showTagMenu)}
                                className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors'>
                                <i className={`fa-solid ${showTagMenu ? 'fa-minus' : 'fa-plus'} text-xs`}></i>
                            </button>
                        </div>

                        {/* Tag Manager Popover */}
                        {showTagMenu && (
                            <div ref={tagMenuRef} className='absolute top-8 left-0 bg-white border border-gray-200 shadow-xl rounded-lg p-3 w-72 z-50 flex flex-col gap-3'>
                                <p className='text-sm font-semibold text-gray-700 border-b pb-1'>Manage Project Tags</p>

                                {/* Create/Edit Form */}
                                <div className='flex flex-col gap-2 bg-gray-50 p-2 rounded border border-blue-100'>
                                    <p className='text-xs font-bold text-blue-600'>{editingTagId ? 'Edit Tag' : 'Create New Tag'}</p>
                                    <input
                                        type="text"
                                        placeholder="Tag Name"
                                        value={tagNameInput}
                                        onChange={(e) => setTagNameInput(e.target.value)}
                                        className="border rounded px-2 py-1 text-sm outline-none bg-white w-full"
                                    />
                                    <div className='flex gap-2 items-center'>
                                        <input
                                            type="color"
                                            value={tagColorInput}
                                            onChange={(e) => setTagColorInput(e.target.value)}
                                            className="h-7 w-10 border rounded cursor-pointer"
                                        />
                                        <div className='flex gap-1 flex-1 justify-end'>
                                            {editingTagId && (
                                                <button onClick={cancelEditing} className='text-xs text-gray-500 hover:text-gray-700 px-2'>Cancel</button>
                                            )}
                                            <button
                                                onClick={editingTagId ? handleUpdateTag : handleCreateTag}
                                                className='text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700'>
                                                {editingTagId ? 'Save' : 'Create'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* List of Tags to Edit/Delete */}
                                <div className='flex flex-col gap-1 max-h-[150px] overflow-y-auto'>
                                    {projectTags.length === 0 ? (
                                        <p className='text-xs text-gray-400 text-center py-2'>No tags yet.</p>
                                    ) : (
                                        projectTags.map(tag => (
                                            <div key={tag.tag_id} className='flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded group'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='w-3 h-3 rounded-full' style={{ backgroundColor: tag.hex_color }}></span>
                                                    <span className='text-sm text-gray-700'>{tag.name}</span>
                                                </div>
                                                <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                    <button onClick={() => startEditing(tag)} className='text-gray-400 hover:text-blue-600'>
                                                        <i className="fa-solid fa-pen text-xs"></i>
                                                    </button>
                                                    <button onClick={() => handleDeleteTag(tag.tag_id)} className='text-gray-400 hover:text-red-600'>
                                                        <i className="fa-solid fa-trash text-xs"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
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
                        onClick={() => navigate("/user/task")}>
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

                            {(item.members || []).map((mem) => (
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
                        <button className='cursor-pointer' onClick={onClose}>
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