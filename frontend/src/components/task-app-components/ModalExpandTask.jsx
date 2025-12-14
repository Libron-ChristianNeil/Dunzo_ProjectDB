import React, { useState, useEffect, useRef } from 'react'
import { getInitials } from '../../utils/getInitials';
import { createTag, updateTag, deleteTag, getProjectTags, updateTask } from '../../https';

function ModalExpandTask({ item, onClose, refreshTasks }) {
    // Safely handle tags and assignees arrays
    const [tags, setTags] = useState(Array.isArray(item?.tags) ? item.tags : []);
    const assigneesArray = Array.isArray(item?.assignees) ? item.assignees : [];

    // Tag Management State
    const [projectTags, setProjectTags] = useState([]);
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [tagMenuTab, setTagMenuTab] = useState('select'); // 'select', 'create', 'manage'
    const [loadingTags, setLoadingTags] = useState(false);

    // Create/Edit State
    const [tagNameInput, setTagNameInput] = useState('');
    const [tagColorInput, setTagColorInput] = useState('#3b82f6');
    const [editingTagId, setEditingTagId] = useState(null);

    const tagMenuRef = useRef(null);

    // Guard against null item
    if (!item) {
        return null;
    }

    // Fetch project tags when menu opens
    useEffect(() => {
        if (showTagMenu && item.project_id) {
            fetchProjectTags();
        }
    }, [showTagMenu, item.project_id]);

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
            const res = await getProjectTags(item.project_id);
            if (res.success) {
                setProjectTags(res.tags);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoadingTags(false);
        }
    };

    const handleAssignTag = async (tag) => {
        // Add to local tags
        const newTags = [...tags, tag];
        setTags(newTags); // Optimistic update

        // Update task
        const tagIds = newTags.map(t => t.id || t.tag_id);
        await updateTask({
            task_id: item.task_id,
            title: item.title,
            status: item.status,
            due_date: item.due_date,
            tag_ids: tagIds
        });
        refreshTasks?.();
    };

    const handleUnassignTag = async (tagId) => {
        const newTags = tags.filter(t => (t.id || t.tag_id) !== tagId);
        setTags(newTags); // Optimistic update

        const tagIds = newTags.map(t => t.id || t.tag_id);
        await updateTask({
            task_id: item.task_id,
            title: item.title,
            status: item.status,
            due_date: item.due_date,
            tag_ids: tagIds
        });
        refreshTasks?.();
    };

    const handleCreateTag = async () => {
        if (!tagNameInput.trim()) return;

        try {
            const res = await createTag({
                project_id: item.project_id,
                name: tagNameInput,
                hex_color: tagColorInput
            });

            if (res.success) {
                // Refresh project tags
                fetchProjectTags();
                // Optionally auto-assign
                handleAssignTag(res.tag);
                // Reset input
                setTagNameInput('');
                setTagMenuTab('select');
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
                // Also update local assigned tags if they were edited
                setTags(prev => prev.map(t => {
                    if ((t.id || t.tag_id) === editingTagId) {
                        return { ...t, name: tagNameInput, hex_color: tagColorInput, color: tagColorInput };
                    }
                    return t;
                }));
                setEditingTagId(null);
                setTagNameInput('');
                refreshTasks?.();
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
                // Remove from local assigned tags if present
                setTags(prev => prev.filter(t => (t.id || t.tag_id) !== tagId));
                refreshTasks?.();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const startEditing = (tag) => {
        setEditingTagId(tag.tag_id || tag.id);
        setTagNameInput(tag.name);
        setTagColorInput(tag.hex_color || tag.color);
    };

    const cancelEditing = () => {
        setEditingTagId(null);
        setTagNameInput('');
        setTagColorInput('#3b82f6');
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

    // Filter available tags (not assigned)
    const assignedTagIds = new Set(tags.map(t => t.id || t.tag_id));
    const availableTags = projectTags.filter(t => !assignedTagIds.has(t.tag_id));

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

                    {/* tags */}
                    <div className='flex flex-col gap-2 relative'>
                        <div className='flex flex-row gap-1 flex-wrap items-center'>
                            <button
                                onClick={() => setShowTagMenu(!showTagMenu)}
                                className='flex flex-row items-center border-2 w-7 h-7 border-gray-300 bg-gray-100 text-gray-600 justify-center text-sm font-medium rounded-full cursor-pointer hover:bg-gray-200 transition-colors'>
                                <i className={`fa-solid ${showTagMenu ? 'fa-minus' : 'fa-plus'}`}></i>
                            </button>
                            {tags.map((tag) => (
                                <div key={tag.id || tag.tag_id}
                                    className='group flex flex-row items-center justify-center py-1 px-3 text-sm font-medium rounded-full text-white gap-2 transition-all hover:pr-2'
                                    style={{ backgroundColor: tag.hex_color || tag.color }}>
                                    {tag.name}
                                    <button
                                        onClick={() => handleUnassignTag(tag.id || tag.tag_id)}
                                        className='hidden group-hover:block text-white/80 hover:text-white cursor-pointer'>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Tag Manager Menu */}
                        {showTagMenu && (
                            <div ref={tagMenuRef} className='absolute top-10 left-0 bg-white border border-gray-200 shadow-xl rounded-lg p-3 w-72 z-50 flex flex-col gap-3'>
                                {/* Tabs */}
                                <div className='flex flex-row border-b border-gray-200 pb-2 gap-4 text-sm font-medium text-gray-500'>
                                    <button
                                        className={`hover:text-blue-600 ${tagMenuTab === 'select' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                                        onClick={() => setTagMenuTab('select')}>
                                        Select
                                    </button>
                                    <button
                                        className={`hover:text-blue-600 ${tagMenuTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                                        onClick={() => setTagMenuTab('create')}>
                                        Create
                                    </button>
                                    <button
                                        className={`hover:text-blue-600 ${tagMenuTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
                                        onClick={() => setTagMenuTab('manage')}>
                                        Manage
                                    </button>
                                </div>

                                {/* Content */}
                                <div className='min-h-[150px] max-h-[250px] overflow-y-auto'>
                                    {loadingTags ? (
                                        <div className='text-center text-gray-400 py-4'>Loading tags...</div>
                                    ) : (
                                        <>
                                            {/* SELECT TAB */}
                                            {tagMenuTab === 'select' && (
                                                <div className='flex flex-col gap-1'>
                                                    {availableTags.length === 0 ? (
                                                        <p className='text-xs text-gray-400 text-center py-2'>No available tags. Create one!</p>
                                                    ) : (
                                                        availableTags.map(tag => (
                                                            <button
                                                                key={tag.tag_id}
                                                                onClick={() => handleAssignTag(tag)}
                                                                className='flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded text-left w-full group'>
                                                                <span className='w-3 h-3 rounded-full' style={{ backgroundColor: tag.hex_color }}></span>
                                                                <span className='text-sm text-gray-700 flex-1'>{tag.name}</span>
                                                                <i className="fa-solid fa-plus text-gray-300 group-hover:text-blue-500 text-xs"></i>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {/* CREATE TAB */}
                                            {tagMenuTab === 'create' && (
                                                <div className='flex flex-col gap-3 pt-1'>
                                                    <input
                                                        type="text"
                                                        placeholder="Tag Name"
                                                        value={tagNameInput}
                                                        onChange={(e) => setTagNameInput(e.target.value)}
                                                        className="border rounded px-2 py-1.5 text-sm outline-none w-full focus:border-blue-500"
                                                    />
                                                    <div className='flex items-center gap-2'>
                                                        <span className='text-xs text-gray-500'>Color:</span>
                                                        <input
                                                            type="color"
                                                            value={tagColorInput}
                                                            onChange={(e) => setTagColorInput(e.target.value)}
                                                            className="h-8 w-full border rounded cursor-pointer"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleCreateTag}
                                                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 mt-2 w-full font-medium">
                                                        Create Tag
                                                    </button>
                                                </div>
                                            )}

                                            {/* MANAGE TAB */}
                                            {tagMenuTab === 'manage' && (
                                                <div className='flex flex-col gap-1'>
                                                    {editingTagId ? (
                                                        <div className='flex flex-col gap-2 bg-gray-50 p-2 rounded border border-blue-100'>
                                                            <p className='text-xs font-bold text-blue-600'>Editing Tag</p>
                                                            <input
                                                                type="text"
                                                                value={tagNameInput}
                                                                onChange={(e) => setTagNameInput(e.target.value)}
                                                                className="border rounded px-2 py-1 text-sm outline-none bg-white"
                                                            />
                                                            <div className='flex gap-2'>
                                                                <input
                                                                    type="color"
                                                                    value={tagColorInput}
                                                                    onChange={(e) => setTagColorInput(e.target.value)}
                                                                    className="h-7 w-10 border rounded cursor-pointer"
                                                                />
                                                                <div className='flex gap-1 flex-1 justify-end'>
                                                                    <button onClick={cancelEditing} className='text-xs text-gray-500 hover:text-gray-700 px-2'>Cancel</button>
                                                                    <button onClick={handleUpdateTag} className='text-xs bg-blue-600 text-white px-2 rounded hover:bg-blue-700'>Save</button>
                                                                </div>
                                                            </div>
                                                        </div>
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
                                            )}
                                        </>
                                    )}
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