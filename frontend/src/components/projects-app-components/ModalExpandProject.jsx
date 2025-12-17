import React, { useState, useEffect, useRef } from 'react'
import { formatToDateInput } from '../../utils/formatToDateInput';
import { getInitials } from '../../utils/getInitials'
import { useNavigate } from 'react-router-dom';
import { getProjectTags, createTag, updateTag, deleteTag, updateProject, removeProjectMember } from '../../https';
import AddMemberModal from './AddMemberModal';
import MemberManagementModal from './MemberManagementModal';

// Preset colors for the color picker
const PRESET_COLORS = [
    '#bbf7d0', '#fef08a', '#fed7aa', '#fca5a5', '#d8b4fe', '#93c5fd', '#67e8f9', '#bef264',
    '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#3b82f6', '#06b6d4', '#86efac',
    '#1e40af', '#1e293b', '#b91c1c', '#a16207', '#4d7c0f', '#15803d', '#0e7490', '#7e22ce'
];

function ModalExpandProject({ item, onClose, onUpdate }) {
    const navigate = useNavigate();

    // Guard against null item
    if (!item) {
        return null;
    }

    // Local state for editing, initialized with current value
    const [desc, setDesc] = useState(item?.desc || "");
    const [title, setTitle] = useState(item?.name || "");
    const [status, setStatus] = useState(item?.status || "Active");
    const [dates, setDates] = useState({
        start: formatToDateInput(item?.startDate),
        end: formatToDateInput(item?.endDate),
    });

    // This effect syncs the local state with the `item` prop.
    // This is crucial for refreshing the modal's content when the parent data updates.
    useEffect(() => {
        if (item) {
            setDesc(item.desc || "");
            setTitle(item.name || "");
            setStatus(item.status || "Active");
            setDates({
                start: formatToDateInput(item.startDate),
                end: formatToDateInput(item.endDate),
            });
        }
    }, [item]);

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

    // Add Member Modal State
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    // Member Management Modal State
    const [showMemberManagement, setShowMemberManagement] = useState(false);

    // Permission check: Only Leader and Manager can edit dates/desc, only Leader can edit title
    const canEdit = item.currentUserRole === 'Leader' || item.currentUserRole === 'Manager';
    const isLeader = item.currentUserRole === 'Leader';
    const isMember = item.currentUserRole === 'Member';

    // Saving state
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    // Check if there are unsaved changes
    useEffect(() => {
        const hasChanged =
            dates.start !== formatToDateInput(item?.startDate) ||
            dates.end !== formatToDateInput(item?.endDate) ||
            desc !== (item?.desc || "") ||
            title !== (item?.name || "") ||
            status !== (item?.status || "Active");
        setIsDirty(hasChanged);
    }, [dates, desc, title, status, item]);

    // Save handler
    const handleSave = async () => {
        if (!canEdit || !isDirty) return;

        setIsSaving(true);
        setSaveMessage('');

        try {
            const res = await updateProject({
                project_id: item.id,
                title: title, // Use editable title
                start_date: dates.start || null,
                end_date: dates.end || null,
                description: desc,
                status: status // Use editable status
            });

            if (res.success) {
                setSaveMessage('Saved successfully!');
                setIsDirty(false); // Hide buttons on success
                setTimeout(() => setSaveMessage(''), 2000);
                onUpdate?.(item.id); // Refresh project list and this item
            } else {
                setSaveMessage('Failed to save');
            }
        } catch (error) {
            console.error('Failed to save project:', error);
            setSaveMessage('Error saving');
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel handler - reset to original values
    const handleCancel = () => {
        setDesc(item?.desc || "");
        setTitle(item?.name || "");
        setStatus(item?.status || "Active");
        setDates({
            start: formatToDateInput(item?.startDate),
            end: formatToDateInput(item?.endDate),
        });
        setSaveMessage('');
        setIsDirty(false); // Also hide buttons on cancel
    };

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
            {/* Add Member Modal */}
            {showAddMemberModal && (
                <AddMemberModal
                    projectId={item.id}
                    onClose={() => setShowAddMemberModal(false)}
                    onMemberAdded={() => {
                        setShowAddMemberModal(false);
                        onUpdate?.(item.id); // Refresh project data
                    }}
                />
            )}
            {/* Member Management Modal */}
            {showMemberManagement && (
                <MemberManagementModal
                    projectId={item.id}
                    members={item.members || []}
                    currentUserRole={item.currentUserRole || 'Member'}
                    onClose={() => setShowMemberManagement(false)}
                    onMemberUpdated={() => {
                        setShowMemberManagement(false);
                        onUpdate?.(item.id); // Refresh project data
                    }}
                />
            )}
            {/* Item */}
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col bg-white p-6 min-w-150 gap-3 relative'>
                    {/* Permission Alert for Members */}
                    {isMember && (
                        <div className='bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-2'>
                            <i className="fa-solid fa-lock"></i>
                            <span>You have view-only access to this project.</span>
                        </div>
                    )}
                    {/* project icon */}
                    <div className='flex flex-row justify-between'>
                        <div style={{ backgroundColor: item.color }}
                            className='flex items-center justify-center bg-linear-to-br h-12 w-12 rounded-xl'>
                            <span className='font-bold text-white text-xl'>{item.name?.[0] || '?'}</span>
                        </div>

                        <i className='fas fa-ellipsis-v'></i>
                    </div>


                    {/* project name */}
                    {isLeader ? (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className='font-semibold text-gray-900 text-md border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent w-full'
                            placeholder='Project name'
                        />
                    ) : (
                        <span className='font-semibold text-gray-900 text-md'>{item.name}</span>
                    )}
                    {/* dates */}
                    <div className='text-sm text-gray-700'>

                        <div className='flex flex-row gap-2'>
                            <p>Start Date</p>
                            <input
                                type="date"
                                value={dates.start}
                                onChange={(e) =>
                                    setDates({ ...dates, start: e.target.value })
                                }
                                disabled={!canEdit}
                                className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                            />
                        </div>

                        <div className='flex flex-row gap-2'>
                            <p>End Date</p>
                            <input
                                type="date"
                                value={dates.end}
                                onChange={(e) =>
                                    setDates({ ...dates, end: e.target.value })
                                }
                                disabled={!canEdit}
                                className={!canEdit ? 'cursor-not-allowed opacity-60' : ''}
                            />
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
                                                    className="w-full px-3 py-2 text-sm border rounded hover:border-red-400 focus:border-red-500 outline-none transition-colors"
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
                                                        className='px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors'>
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
                                <div
                                    onClick={() => setShowAddMemberModal(true)}
                                    className='flex items-center justify-center rounded-full h-9 w-9 bg-gray-100 text-gray-600 text-sm font-semibold border-gray-300 border-2 cursor-pointer hover:bg-gray-200 transition-colors'>
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                            ) : null}

                            {(item.members || []).map((mem) => (
                                <div
                                    key={mem.id}
                                    onClick={() => setShowMemberManagement(true)}
                                    className='bg-red-500 flex items-center justify-center rounded-full h-9 w-9 text-white text-sm font-semibold border-white border-2 transition duration-300 hover:-translate-y-1 cursor-pointer'
                                    title={`${mem.name} (${mem.role || 'Member'})`}
                                >
                                    {getInitials(mem.name)}
                                </div>
                            ))}
                        </div>

                        {/* status */}
                        {isLeader ? (
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`flex flex-row items-center justify-center font-semibold py-1 px-4 rounded-full cursor-pointer
                                    ${status === 'Active' && 'bg-blue-100 text-blue-500'}
                                    ${status === 'Complete' && 'bg-green-100 text-green-500'}
                                    ${status === 'Archived' && 'bg-gray-200 text-gray-700'}`}
                            >
                                <option value="Active">Active</option>
                                <option value="Complete">Complete</option>
                                <option value="Archived">Archived</option>
                            </select>
                        ) : (
                            <div className={`flex flex-row items-center justify-center font-semibold py-1 px-4 rounded-full
                                    ${item.status === 'Active' && 'bg-blue-100 text-blue-500'}
                                    ${item.status === 'Complete' && 'bg-green-100 text-green-500'}
                                    ${item.status === 'Archived' && 'bg-gray-200 text-gray-700'}`}>
                                {item.status}
                            </div>
                        )}
                    </div>

                    {/* Save/Cancel Buttons (only show if user can edit and has changes) */}
                    {canEdit && (
                        <div className='flex flex-row items-center gap-2 mt-4 pt-4 border-t'>
                            {isDirty && (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer text-sm font-medium'
                                    >
                                        {isSaving && <i className="fas fa-spinner fa-spin"></i>}
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer text-sm font-medium'
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                            {saveMessage && (
                                <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {saveMessage}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Leave Project Button (only for Members and Managers) */}
                    {!isLeader && (
                        <div className='flex flex-row items-center gap-2 mt-4 pt-4 border-t'>
                            <button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to leave this project? This action cannot be undone.')) return;

                                    try {
                                        const res = await removeProjectMember({
                                            project_id: item.id,
                                            user_id: 'self' // Backend should handle 'self' as current user
                                        });

                                        if (res.success) {
                                            alert('You have left the project.');
                                            onUpdate?.();
                                            onClose();
                                        } else {
                                            alert(res.error || 'Failed to leave project');
                                        }
                                    } catch (error) {
                                        console.error('Error leaving project:', error);
                                        alert('Error leaving project');
                                    }
                                }}
                                className='px-4 py-2 bg-red-100 text-red-600 border border-red-200 rounded-lg hover:bg-red-200 cursor-pointer text-sm font-medium flex items-center gap-2'
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                Leave Project
                            </button>
                            <span className='text-xs text-gray-500'>You will no longer have access to this project</span>
                        </div>
                    )}
                </div>

                {/* Close button */}
                <div className='flex flex-col py-5 px-3 bg-gray-100'>
                    <button className='cursor-pointer' onClick={onClose}>
                        <i className="fa-regular fa-circle-xmark text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalExpandProject;

