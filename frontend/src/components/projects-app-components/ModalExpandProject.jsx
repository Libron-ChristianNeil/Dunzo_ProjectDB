import React, { useState, useEffect, useRef } from 'react'
import { formatToDateInput } from '../../utils/formatToDateInput';
import { getInitials } from '../../utils/getInitials'
import { useNavigate } from 'react-router-dom';
import { getProjectTags, createTag, updateTag, deleteTag } from '../../https';

// Preset colors for the color picker
const PRESET_COLORS = [
    '#bbf7d0', '#fef08a', '#fed7aa', '#fca5a5', '#d8b4fe', '#93c5fd', '#67e8f9', '#bef264',
    '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#3b82f6', '#06b6d4', '#86efac',
    '#1e40af', '#1e293b', '#b91c1c', '#a16207', '#4d7c0f', '#15803d', '#0e7490', '#7e22ce'
];

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
    const [showTagMenu, setShowTagMenu] = useState(false);

    // Tag Manager View State: 'list' | 'create' | 'edit'
    const [tagViewMode, setTagViewMode] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');

    // Form inputs
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
                resetTagForm(); // Reset on close
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [tagMenuRef]);

    const resetTagForm = () => {
        setTagViewMode('list');
        setTagNameInput('');
        setTagColorInput('#3b82f6');
        setEditingTagId(null);
        setSearchQuery('');
    };

    const fetchProjectTags = async () => {
        try {
            const res = await getProjectTags(item.id);
            if (res.success) {
                setProjectTags(res.tags);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
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
                resetTagForm();
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
                resetTagForm();
            } else {
                alert(res.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTag = async (tagId) => {
        if (!confirm("Are you sure you want to delete this label?")) return;

        try {
            const res = await deleteTag(tagId);
            if (res.success) {
                fetchProjectTags();
                if (tagViewMode === 'edit') resetTagForm();
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
        setTagViewMode('edit');
    };

    // Filter tags for display in list view
    const filteredTags = projectTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <span className='text-sm font-semibold text-gray-900'>Labels</span>

                        <div className='flex flex-wrap gap-2 items-center'>
                            {projectTags.map(tag => (
                                <div key={tag.tag_id}
                                    className='flex items-center justify-center px-3 py-1.5 rounded-md text-white text-xs font-bold shadow-sm'
                                    style={{ backgroundColor: tag.hex_color, minWidth: '40px' }}>
                                    {tag.name}
                                </div>
                            ))}
                            <button
                                onClick={() => setShowTagMenu(!showTagMenu)}
                                className='flex items-center justify-center w-8 h-7 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors'>
                                <i className="fa-solid fa-plus text-xs"></i>
                            </button>
                        </div>

                        {/* Tag Manager Popover */}
                        {showTagMenu && (
                            <div ref={tagMenuRef} className='absolute -top-40 left-0 bg-white border border-gray-200 shadow-xl rounded-lg w-80 z-50 flex flex-col'>
                                {tagViewMode === 'list' && (
                                    <>
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
                                            {filteredTags.map(tag => (
                                                <div key={tag.tag_id} className='flex items-center justify-between px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 group'>
                                                    <div className='flex items-center gap-3'>
                                                        <input type="checkbox" checked readOnly className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                        <div className='h-4 w-15 rounded-md' style={{ backgroundColor: tag.hex_color }}></div>
                                                        <span className='text-sm text-gray-700'>{tag.name}</span>
                                                    </div>
                                                    <button onClick={() => startEditing(tag)} className='text-gray-400 hover:text-gray-600 p-1'>
                                                        <i className="fa-solid fa-pencil text-xs"></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {filteredTags.length === 0 && (
                                                <div className='p-4 text-center text-sm text-gray-500'>No labels found.</div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className='p-2 border-t bg-gray-50'>
                                            <button
                                                onClick={() => {
                                                    setTagViewMode('create');
                                                    setTagNameInput('');
                                                    setTagColorInput('#3b82f6');
                                                    setEditingTagId(null);
                                                }}
                                                className='w-full py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors'>
                                                Create a new label
                                            </button>

                                        </div>
                                    </>
                                )}

                                {(tagViewMode === 'create' || tagViewMode === 'edit') && (
                                    <>
                                        {/* Header */}
                                        <div className='flex items-center justify-between px-3 py-2 border-b'>
                                            <button onClick={() => setTagViewMode('list')} className='text-gray-400 hover:text-gray-600'>
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>
                                            <span className='font-semibold text-sm'>{tagViewMode === 'create' ? 'Create label' : 'Edit label'}</span>
                                            <button onClick={() => setShowTagMenu(false)} className='text-gray-400 hover:text-gray-600'>
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>

                                        {/* Preview */}
                                        <div className='p-4 bg-gray-50 flex justify-center border-b'>
                                            <span
                                                className='px-3 py-1.5 rounded-md text-white font-semibold text-sm shadow-sm'
                                                style={{ backgroundColor: tagColorInput }}>
                                                {tagNameInput || 'Label Preview'}
                                            </span>
                                        </div>

                                        {/* Form */}
                                        <div className='p-3 flex flex-col gap-3'>
                                            <div>
                                                <label className='block text-xs font-semibold text-gray-600 mb-1'>Title</label>
                                                <input
                                                    type="text"
                                                    value={tagNameInput}
                                                    onChange={(e) => setTagNameInput(e.target.value)}
                                                    placeholder="Label name"
                                                    className="w-full px-3 py-2 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-xs font-semibold text-gray-600 mb-1'>Select a color</label>
                                                <div className='grid grid-cols-8 gap-2'>
                                                    {PRESET_COLORS.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setTagColorInput(color)}
                                                            className={`h-6 w-8 rounded transition-transform hover:scale-110 focus:outline-none ${tagColorInput === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setTagColorInput('#3b82f6')}
                                                className='w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded transition-colors flex items-center justify-center gap-2'>
                                                <i className="fa-solid fa-xmark"></i> Remove color
                                            </button>

                                            <div className='flex flex-row justify-between items-center pt-2 mt-2 border-t'>
                                                {tagViewMode === 'edit' && (
                                                    <button
                                                        onClick={() => handleDeleteTag(editingTagId)}
                                                        className='px-3 py-1.5 text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded transition-colors'>
                                                        Delete
                                                    </button>
                                                )}

                                                <div className='flex gap-2 w-full justify-end'>
                                                    {tagViewMode === 'edit' && <button onClick={() => setTagViewMode('list')} className='px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded'>Cancel</button>}
                                                    <button
                                                        onClick={tagViewMode === 'create' ? handleCreateTag : handleUpdateTag}
                                                        className='px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors'>
                                                        {tagViewMode === 'create' ? 'Create' : 'Save changes'}
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </>
                                )}
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