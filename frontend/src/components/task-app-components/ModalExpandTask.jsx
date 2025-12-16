import React, { useState, useEffect, useRef } from 'react'
import { getInitials } from '../../utils/getInitials';
import { getProjectTags, updateTask } from '../../https';

function ModalExpandTask({ item, onClose, refreshTasks }) {
    // Safely handle tags and assignees arrays
    const [tags, setTags] = useState(Array.isArray(item?.tags) ? item.tags : []);
    const assigneesArray = Array.isArray(item?.assignees) ? item.assignees : [];

    // Tag Management State
    const [projectTags, setProjectTags] = useState([]);
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const tagMenuRef = useRef(null);

    // Guard against null item
    if (!item) {
        return null;
    }

    // Fetch project tags on mount
    useEffect(() => {
        if (item.project_id) {
            fetchProjectTags();
        }
    }, [item.project_id]);

    // Update local tags when item changes
    useEffect(() => {
        setTags(Array.isArray(item?.tags) ? item.tags : []);
    }, [item]);


    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (tagMenuRef.current && !tagMenuRef.current.contains(event.target)) {
                setShowTagMenu(false);
                setSearchQuery('');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [tagMenuRef]);

    const fetchProjectTags = async () => {
        try {
            const res = await getProjectTags(item.project_id);
            if (res.success) {
                setProjectTags(res.tags);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };

    // --- Assignment Logic ---
    const isTagAssigned = (tagId) => {
        return tags.some(t => (t.id || t.tag_id) === tagId);
    };

    const toggleTagAssignment = async (tag) => {
        const tagId = tag.tag_id || tag.id;
        let newTags;

        if (isTagAssigned(tagId)) {
            // Unassign
            newTags = tags.filter(t => (t.id || t.tag_id) !== tagId);
        } else {
            // Assign
            newTags = [...tags, tag];
        }

        setTags(newTags); // Optimistic update

        const tagIds = newTags.map(t => t.id || t.tag_id);

        try {
            await updateTask({
                task_id: item.task_id,
                title: item.title,
                status: item.status,
                due_date: item.due_date,
                tag_ids: tagIds
            });
            refreshTasks?.();
        } catch (error) {
            console.error("Error updating task tags:", error);
            // Revert on error could go here
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Filter tags for display in list view
    const filteredTags = projectTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col w-160 py-5 px-5 bg-white gap-1 transition duration-300 relative'>
                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-row gap-2'>
                            <input type='checkbox' checked={item.status === 'Done'} readOnly />
                            <span className='text-xl text-gray-900 font-semibold'>{item.title}</span>
                        </div>
                        <button>
                            <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                    </div>
                    <span className='text-[12px] text-gray-600 font-medium'>Date Created: {formatDate(item.created_at)}</span>
                    <span className='text-[12px] text-gray-600 font-medium'>Due Date: {formatDate(item.due_date)}</span>

                    {/* Tags Section */}
                    <div className='flex flex-col gap-2 relative mt-2'>
                        <div className='flex flex-wrap gap-2 items-center'>
                            {/* Trigger Button - Inline */}
                            <button
                                onClick={() => setShowTagMenu(!showTagMenu)}
                                className='flex items-center justify-center w-8 h-7 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors'>
                                <i className="fa-solid fa-plus text-xs"></i>
                            </button>

                            {tags.map((tag) => (
                                <div key={tag.id || tag.tag_id}
                                    className='flex items-center justify-center px-3 py-1.5 rounded-md text-white text-xs font-bold shadow-sm'
                                    style={{ backgroundColor: tag.hex_color || tag.color, minWidth: '40px' }}>
                                    {tag.name}
                                </div>
                            ))}
                        </div>

                        {/* Tag Manager Popover */}
                        {showTagMenu && (
                            <div ref={tagMenuRef} className='absolute -top-40 left-0 bg-white border border-gray-200 shadow-xl rounded-lg w-80 z-50 flex flex-col'>

                                {/* Header */}
                                <div className='flex items-center justify-between px-3 py-2 border-b'>
                                    <span className='font-semibold text-sm'>Labels</span>
                                    <button onClick={() => setShowTagMenu(false)} className='text-gray-400 hover:text-gray-600'>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>

                                {/* Search */}
                                <div className='p-2 border-b'>
                                    <input
                                        type="text"
                                        placeholder="Search labels..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>

                                {/* Tags List */}
                                <div className='max-h-60 overflow-y-auto'>
                                    {filteredTags.map(tag => {
                                        const isAssigned = isTagAssigned(tag.tag_id);
                                        return (
                                            <div key={tag.tag_id}
                                                onClick={() => toggleTagAssignment(tag)}
                                                className='flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer group'>
                                                <div className='flex items-center gap-3'>
                                                    <input
                                                        type="checkbox"
                                                        checked={isAssigned}
                                                        readOnly
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                                    />
                                                    <div className='h-4 w-15 rounded-md' style={{ backgroundColor: tag.hex_color }}></div>
                                                    <span className='text-sm text-gray-700'>{tag.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredTags.length === 0 && (
                                        <div className='p-4 text-center text-sm text-gray-500'>No labels found.</div>
                                    )}
                                </div>
                                <div className='p-2 border-t bg-gray-50/50 text-xs text-center text-gray-400 italic'>
                                    Manage labels in Project Settings
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='flex flex-row text-medium text-gray-700 my-1 gap-2 items-center'>
                        <i className="fa-regular fa-folder"></i>
                        <span>{item.project_name || item.project || 'General'}</span>
                    </div>

                    {/* Status */}
                    <div className='flex flex-row gap-1 font-medium text-sm'>
                        <div className={`py-1 px-4 rounded-md
                                        ${item.status === 'To Do' && 'bg-blue-100 text-blue-500'}
                                        ${item.status === 'In Progress' && 'bg-amber-100 text-amber-500'}
                                        ${item.status === 'Done' && 'bg-green-100 text-green-500'}
                                        ${item.status === 'Archived' && 'bg-gray-200 text-gray-500'}
                        `}>
                            {item.status}
                        </div>
                    </div>

                    <span className='text-md mt-2 font-medium text-gray-900'>Members</span>
                    {/* Assignee */}
                    <div className='flex flex-row gap-1'>
                        <div className='flex items-center justify-center rounded-full h-9 w-9 bg-gray-100 text-gray-600 text-sm font-semibold border-gray-300 border-2 cursor-pointer'>
                            <i className="fa-solid fa-plus"></i>
                        </div>
                        {assigneesArray.map((mem) => (
                            <div
                                key={mem.user_id}
                                style={{ backgroundColor: `hsl(${mem.user_id * 137.508 % 360}, 70%, 60%)` }}
                                className='flex items-center justify-center rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'
                                title={`${mem.username} (${mem.role})`}
                            >
                                {getInitials(mem.username || 'User')}
                            </div>
                        ))}
                    </div>

                    <div className='flex flex-col mt-4'>
                        <span className='text-md font-medium text-gray-900'>Description</span>
                        <textarea
                            value={item.description || ''}
                            readOnly
                            className="w-full p-2 border rounded resize-none overflow-hidden"
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                        />

                    </div>

                </div>
                {/* comment section */}
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
                        placeholder="Write a comment..."
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

export default ModalExpandTask