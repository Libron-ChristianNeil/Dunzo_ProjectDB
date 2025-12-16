import React, { useState, useEffect, useRef } from 'react'
import { getInitials } from '../../utils/getInitials';
import TaskAssigneeModal from './TaskAssigneeModal';
import {
    getProjectTags,
    updateTask,
    getProjectDetails,
    getTaskAssignees,
    getTaskComments,
    postComment,
    updateComment,
    deleteComment
} from '../../https';

function ModalExpandTask({ item, onClose, refreshTasks }) {
    // Editable fields state
    const [title, setTitle] = useState(item?.title || '');
    const [dueDate, setDueDate] = useState(item?.due_date ? item.due_date.slice(0, 16) : '');
    const [status, setStatus] = useState(item?.status || 'To Do');
    const [description, setDescription] = useState(item?.description || '');

    // Tags and assignees
    const [tags, setTags] = useState(Array.isArray(item?.tags) ? item.tags : []);
    const [assignees, setAssignees] = useState(Array.isArray(item?.assignees) ? item.assignees : []);

    // Tag Management State
    const [projectTags, setProjectTags] = useState([]);
    const [showTagMenu, setShowTagMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Assignee Management State
    const [showAssigneeModal, setShowAssigneeModal] = useState(false);

    // Comments State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);

    // Reply State
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    // User info
    const [userRole, setUserRole] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);

    // Saving state
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const tagMenuRef = useRef(null);

    // Permission checks
    const canEdit = userRole === 'Leader' || userRole === 'Manager';
    const canEditTags = userRole === 'Leader' || userRole === 'Manager';

    // Debug logging for permissions
    // console.log('Permission Check:', { currentUserId, userRole, assignees });

    const isAssignee = assignees.some(a => String(a.user_id) === String(currentUserId));
    const canComment = canEdit || isAssignee;

    // Check for unsaved changes
    const hasChanges = title !== (item?.title || '') ||
        dueDate !== (item?.due_date ? item.due_date.slice(0, 16) : '') ||
        status !== (item?.status || 'To Do') ||
        description !== (item?.description || '');

    // Guard against null item
    if (!item) {
        return null;
    }

    // Fetch user role and project details on mount
    useEffect(() => {
        const fetchProjectData = async () => {
            if (!item.project_id) {
                setLoadingRole(false);
                return;
            }
            try {
                const res = await getProjectDetails(item.project_id);
                if (res.success && res.data) {
                    setUserRole(res.data.user_role);
                    setCurrentUserId(res.data.current_user_id);
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
            } finally {
                setLoadingRole(false);
            }
        };
        fetchProjectData();
    }, [item.project_id]);

    // Fetch task details (for comments and assignees)
    useEffect(() => {
        const fetchTaskData = async () => {
            if (!item.task_id) return;

            // Fetch comments using dedicated endpoint
            try {
                const commentRes = await getTaskComments(item.task_id);
                if (commentRes.success) {
                    setComments(commentRes.comments || []);
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoadingComments(false);
            }

            // Fetch assignees using dedicated endpoint (separate try/catch)
            try {
                const assigneeRes = await getTaskAssignees(item.task_id);
                if (assigneeRes.success) {
                    const assigneeList = (assigneeRes.assignees || []).map(a => ({
                        user_id: a.user_id || a.id,
                        username: a.username || a.name || 'User',
                        name: a.name || a.username,
                        role: a.role || 'Assignee'
                    }));
                    setAssignees(assigneeList);
                }
            } catch (error) {
                console.error("Error fetching assignees:", error);
            }
        };
        fetchTaskData();
    }, [item.task_id]);

    // Fetch project tags on mount
    useEffect(() => {
        if (item.project_id) {
            fetchProjectTags();
        }
    }, [item.project_id]);

    // Update local state when item changes
    useEffect(() => {
        setTags(Array.isArray(item?.tags) ? item.tags : []);
        setTitle(item?.title || '');
        setDueDate(item?.due_date ? item.due_date.slice(0, 16) : '');
        setStatus(item?.status || 'To Do');
        setDescription(item?.description || '');
    }, [item]);

    // Close menus on click outside
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

    // --- Save/Cancel Handlers ---
    const handleSave = async () => {
        if (!canEdit) {
            alert('Only Leaders and Managers can edit task details.');
            return;
        }

        setIsSaving(true);
        setSaveMessage('');

        try {
            const res = await updateTask({
                task_id: item.task_id,
                title: title,
                status: status,
                due_date: dueDate,
                description: description,
                tag_ids: tags.map(t => t.id || t.tag_id)
            });

            if (res.success) {
                setSaveMessage('Changes saved successfully!');
                refreshTasks?.();
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                setSaveMessage(res.error || 'Failed to save changes');
            }
        } catch (error) {
            console.error("Error saving task:", error);
            setSaveMessage('Error saving changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTitle(item?.title || '');
        setDueDate(item?.due_date ? item.due_date.slice(0, 16) : '');
        setStatus(item?.status || 'To Do');
        setDescription(item?.description || '');
        setSaveMessage('');
    };

    // --- Status Change (available to all users) ---
    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);

        // Auto-save status changes
        try {
            const res = await updateTask({
                task_id: item.task_id,
                title: item.title,
                status: newStatus,
                due_date: item.due_date,
                tag_ids: tags.map(t => t.id || t.tag_id)
            });
            if (res.success) {
                refreshTasks?.();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            setStatus(item?.status || 'To Do');
        }
    };

    // --- Tag Assignment Logic ---
    const isTagAssigned = (tagId) => {
        return tags.some(t => (t.id || t.tag_id) === tagId);
    };

    const toggleTagAssignment = async (tag) => {
        if (!canEditTags) {
            alert('Only Leaders and Managers can assign or unassign labels.');
            return;
        }

        const tagId = tag.tag_id || tag.id;
        let newTags;

        if (isTagAssigned(tagId)) {
            newTags = tags.filter(t => (t.id || t.tag_id) !== tagId);
        } else {
            newTags = [...tags, tag];
        }

        setTags(newTags);
        const tagIds = newTags.map(t => t.id || t.tag_id);

        try {
            const res = await updateTask({
                task_id: item.task_id,
                title: item.title,
                status: item.status,
                due_date: item.due_date,
                tag_ids: tagIds
            });
            if (res.success) {
                refreshTasks?.();
            } else {
                setTags(Array.isArray(item?.tags) ? item.tags : []);
                alert(res.error || 'Failed to update labels');
            }
        } catch (error) {
            console.error("Error updating task tags:", error);
            setTags(Array.isArray(item?.tags) ? item.tags : []);
        }
    };

    // --- Assignee Management ---
    const handleSearchUsers = async (query) => {
        setUserSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await searchUsers(query, item.project_id);
            if (res.success) {
                // Filter out already assigned users
                const assignedIds = assignees.map(a => a.user_id);
                setSearchResults(res.users.filter(u => !assignedIds.includes(u.user_id)));
            }
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    const handleAddAssignee = async (user) => {
        if (!canEdit) {
            alert('Only Leaders and Managers can assign members.');
            return;
        }

        try {
            const res = await assignTask({
                task_id: item.task_id,
                user_id: user.user_id
            });
            if (res.success) {
                setAssignees([...assignees, { ...user, role: 'Assignee' }]);
                setShowAddAssignee(false);
                setUserSearchQuery('');
                refreshTasks?.();
            } else {
                alert(res.error || 'Failed to assign member');
            }
        } catch (error) {
            console.error("Error assigning member:", error);
        }
    };

    const handleRemoveAssignee = async (userId) => {
        if (!canEdit) {
            alert('Only Leaders and Managers can remove assignees.');
            return;
        }

        if (!confirm('Remove this member from the task?')) return;

        try {
            const res = await unassignTask({
                task_id: item.task_id,
                user_id: userId
            });
            if (res.success) {
                setAssignees(assignees.filter(a => a.user_id !== userId));
                refreshTasks?.();
            } else {
                alert(res.error || 'Failed to remove assignee');
            }
        } catch (error) {
            console.error("Error removing assignee:", error);
        }
    };

    // --- Comment Management ---
    const handlePostComment = async () => {
        if (!canComment) {
            alert('Only assignees, Leaders, and Managers can comment.');
            return;
        }
        if (!newComment.trim()) return;

        try {
            const res = await postComment({
                task_id: item.task_id,
                content: newComment
            });
            if (res.success) {
                // Refresh comments using dedicated endpoint
                const taskRes = await getTaskComments(item.task_id);
                if (taskRes.success) {
                    setComments(taskRes.comments || []);
                }
                setNewComment('');
            } else {
                alert(res.error || 'Failed to post comment');
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const handlePostReply = async (parentId) => {
        if (!replyText.trim()) return;

        try {
            const res = await postComment({
                task_id: item.task_id,
                content: replyText,
                parent_id: parentId
            });
            if (res.success) {
                const taskRes = await getTaskComments(item.task_id);
                if (taskRes.success) {
                    setComments(taskRes.comments || []);
                }
                setReplyingTo(null);
                setReplyText('');
            } else {
                alert(res.error || 'Failed to post reply');
            }
        } catch (error) {
            console.error("Error posting reply:", error);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editCommentText.trim()) return;

        try {
            const res = await updateComment({
                comment_id: commentId,
                content: editCommentText
            });
            if (res.success) {
                setComments(comments.map(c =>
                    c.comment_id === commentId ? { ...c, content: editCommentText } : c
                ));
                setEditingCommentId(null);
                setEditCommentText('');
            } else {
                alert(res.error || 'Failed to edit comment');
            }
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Delete this comment?')) return;

        try {
            const res = await deleteComment({ comment_id: commentId });
            if (res.success) {
                setComments(comments.filter(c => c.comment_id !== commentId));
            } else {
                alert(res.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
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

    const formatCommentDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Filter tags for display
    const filteredTags = projectTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='flex fixed justify-center overflow-y-scroll inset-0 z-1000 bg-zinc-300/80'>
            <div className='flex flex-row my-auto min-h-100 h-fit rounded-2xl shadow'>
                <div className='flex flex-col w-160 py-5 px-5 bg-white gap-1 transition duration-300 relative'>

                    {/* Member Permission Alert */}
                    {!canEdit && !loadingRole && (
                        <div className='bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-2'>
                            <i className="fa-solid fa-lock"></i>
                            <span>You have view-only access. Only Leaders and Managers can edit.</span>
                        </div>
                    )}

                    {/* Title Row */}
                    <div className='flex flex-row justify-between items-start'>
                        <div className='flex flex-row gap-2 items-center flex-1'>
                            <input
                                type='checkbox'
                                checked={status === 'Done'}
                                onChange={() => handleStatusChange(status === 'Done' ? 'To Do' : 'Done')}
                                className='cursor-pointer'
                            />
                            {canEdit ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className='text-xl text-gray-900 font-semibold flex-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none py-1'
                                    placeholder="Task title"
                                />
                            ) : (
                                <span className='text-xl text-gray-900 font-semibold'>{title}</span>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className='flex flex-col gap-1 mt-2'>
                        <span className='text-[12px] text-gray-600 font-medium'>
                            Date Created: {formatDate(item.created_at)}
                        </span>
                        <div className='flex items-center gap-2'>
                            <span className='text-[12px] text-gray-600 font-medium'>Due Date:</span>
                            {canEdit ? (
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className='text-[12px] text-gray-700 border border-gray-300 rounded px-2 py-1'
                                />
                            ) : (
                                <span className='text-[12px] text-gray-700'>{formatDate(dueDate)}</span>
                            )}
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className='flex flex-col gap-2 relative mt-2'>
                        <span className='text-sm font-medium text-gray-700'>Labels</span>
                        <div className='flex flex-wrap gap-2 items-center'>
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
                            <div ref={tagMenuRef} className='absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg w-80 z-50 flex flex-col'>
                                <div className='flex items-center justify-between px-3 py-2 border-b'>
                                    <span className='font-semibold text-sm'>Labels</span>
                                    <button onClick={() => setShowTagMenu(false)} className='text-gray-400 hover:text-gray-600'>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                                <div className='p-2 border-b'>
                                    <input
                                        type="text"
                                        placeholder="Search labels..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border rounded outline-none"
                                    />
                                </div>
                                <div className='max-h-60 overflow-y-auto'>
                                    {filteredTags.map(tag => {
                                        const isAssigned = isTagAssigned(tag.tag_id);
                                        return (
                                            <div key={tag.tag_id}
                                                onClick={() => toggleTagAssignment(tag)}
                                                className={`flex items-center gap-3 px-3 py-2 border-b hover:bg-gray-50 ${canEditTags ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                                                <input type="checkbox" checked={isAssigned} readOnly className="pointer-events-none" />
                                                <div className='h-4 w-15 rounded-md' style={{ backgroundColor: tag.hex_color }}></div>
                                                <span className='text-sm text-gray-700'>{tag.name}</span>
                                            </div>
                                        );
                                    })}
                                    {filteredTags.length === 0 && (
                                        <div className='p-4 text-center text-sm text-gray-500'>No labels found.</div>
                                    )}
                                </div>
                                {!canEditTags && (
                                    <div className='p-2 border-t bg-amber-50 text-xs text-center text-amber-600'>
                                        <i className="fa-solid fa-lock mr-1"></i>
                                        Only Leaders and Managers can assign labels
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Project */}
                    <div className='flex flex-row text-medium text-gray-700 my-1 gap-2 items-center'>
                        <i className="fa-regular fa-folder"></i>
                        <span>{item.project_name || item.project || 'General'}</span>
                    </div>

                    {/* Status Dropdown */}
                    <div className='flex flex-row gap-2 items-center'>
                        <span className='text-sm font-medium text-gray-700'>Status:</span>
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`py-1 px-3 rounded-md text-sm font-medium cursor-pointer border-0 outline-none
                                ${status === 'To Do' && 'bg-blue-100 text-blue-600'}
                                ${status === 'In Progress' && 'bg-amber-100 text-amber-600'}
                                ${status === 'Done' && 'bg-green-100 text-green-600'}
                                ${status === 'Archived' && 'bg-gray-200 text-gray-600'}
                            `}
                        >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>

                    {/* Assignees */}
                    <div className='mt-3'>
                        <span className='text-sm font-medium text-gray-700'>Assignees</span>
                        <div className='flex flex-row gap-1 mt-2 flex-wrap items-center'>
                            {/* Add Assignee Button */}
                            <button
                                onClick={() => setShowAssigneeModal(true)}
                                className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer'>
                                <i className="fa-solid fa-plus text-xs"></i>
                            </button>
                            {assignees.map((mem) => (
                                <div
                                    key={mem.user_id}
                                    style={{ backgroundColor: `hsl(${(mem.user_id || 0) * 137.508 % 360}, 70%, 60%)` }}
                                    className='flex items-center justify-center rounded-full h-8 w-8 text-white text-sm font-semibold border-white border-2 cursor-pointer'
                                    title={`${mem.username || mem.name} (${mem.role || 'Assignee'})`}
                                >
                                    {getInitials(mem.username || mem.name || 'User')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Assignee Management Modal */}
                    {showAssigneeModal && (
                        <TaskAssigneeModal
                            taskId={item.task_id}
                            projectId={item.project_id}
                            currentUserRole={userRole}
                            onClose={() => setShowAssigneeModal(false)}
                            onAssigneeUpdated={() => {
                                // Refresh assignees
                                const fetchAssignees = async () => {
                                    const res = await getTaskDetails(item.task_id);
                                    if (res.success && res.data) {
                                        setAssignees(res.data.assignees || []);
                                    }
                                };
                                fetchAssignees();
                                refreshTasks?.();
                            }}
                        />
                    )}

                    {/* Description */}
                    <div className='flex flex-col mt-3'>
                        <span className='text-sm font-medium text-gray-700'>Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            readOnly={!canEdit}
                            placeholder={canEdit ? "Add a description..." : "No description"}
                            className={`w-full p-2 border rounded resize-none overflow-hidden mt-1 ${!canEdit && 'bg-gray-50 cursor-not-allowed'}`}
                            rows={3}
                        />
                    </div>

                    {/* Save/Cancel Buttons */}
                    {canEdit && hasChanges && (
                        <div className='flex flex-row items-center gap-2 mt-4 pt-3 border-t'>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium'>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium'>
                                Cancel
                            </button>
                            {saveMessage && (
                                <span className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {saveMessage}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className='flex flex-col w-100 py-5 px-5 bg-gray-100 rounded-r-2xl'>
                    <div className='flex flex-row justify-between gap-2'>
                        <div className='flex flex-row items-center gap-2 text-md font-medium text-gray-900'>
                            <i className="fa-regular fa-message"></i>
                            <span>Comments</span>
                        </div>
                        <button className='cursor-pointer hover:text-gray-600' onClick={onClose}>
                            <i className="fa-regular fa-circle-xmark text-xl"></i>
                        </button>
                    </div>


                    {/* Post Comment */}
                    {canComment ? (
                        <div className='mt-3'>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full p-2 border rounded resize-none text-sm min-h-[60px]"
                            />
                            <button
                                onClick={handlePostComment}
                                disabled={!newComment.trim()}
                                className='mt-2 px-3 py-1.5 bg-blue-500 text-white rounded text-sm disabled:opacity-50'>
                                Post Comment
                            </button>
                        </div>
                    ) : (
                        <div className='mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm'>
                            <i className="fa-solid fa-lock mr-1"></i>
                            Only assignees, Leaders, and Managers can comment.
                        </div>
                    )}

                    {/* Comments List */}
                    <div className='flex flex-col gap-3 mt-4 overflow-y-auto max-h-80 custom-scrollbar pr-2'>
                        {loadingComments ? (
                            <div className='text-center text-gray-500 text-sm'>Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className='text-center text-gray-500 text-sm'>No comments yet</div>
                        ) : (
                            (() => {
                                // Build Comment Tree Helper
                                const buildCommentTree = (flatComments) => {
                                    const commentMap = {};
                                    const tree = [];
                                    flatComments.forEach(c => commentMap[c.comment_id] = { ...c, replies: [] });
                                    flatComments.forEach(c => {
                                        if (c.parent_id && commentMap[c.parent_id]) {
                                            commentMap[c.parent_id].replies.push(commentMap[c.comment_id]);
                                        } else {
                                            tree.push(commentMap[c.comment_id]);
                                        }
                                    });
                                    return tree;
                                };

                                // Render Recursive Comment Helper
                                const renderComment = (comment, depth = 0) => (
                                    <div key={comment.comment_id} className={`bg-white rounded-lg p-3 shadow-sm mb-3 ${depth > 0 ? 'ml-6 border-l-2 border-gray-100' : ''}`}>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    style={{ backgroundColor: `hsl(${(comment.user_id || 0) * 137.508 % 360}, 70%, 60%)` }}
                                                    className='w-6 h-6 rounded-full flex items-center justify-center text-white text-xs'>
                                                    {getInitials(comment.username || 'U')}
                                                </div>
                                                <span className='text-sm font-medium'>{comment.username}</span>
                                                <span className='text-xs text-gray-400'>{formatCommentDate(comment.created_at)}</span>
                                            </div>
                                            <div className='flex gap-2 items-center'>
                                                {canComment && depth < 3 && (
                                                    <button
                                                        onClick={() => setReplyingTo(replyingTo === comment.comment_id ? null : comment.comment_id)}
                                                        className='text-gray-400 hover:text-blue-500 text-xs font-medium'>
                                                        Reply
                                                    </button>
                                                )}
                                                {(comment.user_id === currentUserId || userRole === 'Leader') && (
                                                    <>
                                                        {comment.user_id === currentUserId && (
                                                            <button
                                                                onClick={() => { setEditingCommentId(comment.comment_id); setEditCommentText(comment.content); }}
                                                                className='text-gray-400 hover:text-blue-500 text-xs'>
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.comment_id)}
                                                            className='text-gray-400 hover:text-red-500 text-xs'>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comment Content */}
                                        {editingCommentId === comment.comment_id ? (
                                            <div className='mt-2'>
                                                <textarea
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className='w-full p-2 border rounded text-sm'
                                                    rows={2}
                                                />
                                                <div className='flex gap-2 mt-1'>
                                                    <button
                                                        onClick={() => handleEditComment(comment.comment_id)}
                                                        className='px-2 py-1 bg-blue-500 text-white rounded text-xs'>
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingCommentId(null); setEditCommentText(''); }}
                                                        className='px-2 py-1 bg-gray-200 rounded text-xs'>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className='text-sm text-gray-700 mt-2'>{comment.content}</p>
                                        )}

                                        {/* Reply Input */}
                                        {replyingTo === comment.comment_id && (
                                            <div className='mt-3 pl-2 border-l-2 border-blue-200'>
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className='w-full p-2 border rounded text-sm mb-2'
                                                    rows={2}
                                                    autoFocus
                                                />
                                                <div className='flex gap-2'>
                                                    <button
                                                        onClick={() => handlePostReply(comment.comment_id)}
                                                        disabled={!replyText.trim()}
                                                        className='px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50'>
                                                        Post Reply
                                                    </button>
                                                    <button
                                                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                        className='px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs'>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Recursive Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className='mt-2'>
                                                {comment.replies.map(reply => renderComment(reply, depth + 1))}
                                            </div>
                                        )}
                                    </div>
                                );

                                const commentTree = buildCommentTree(comments);
                                return commentTree.map(c => renderComment(c));
                            })()
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalExpandTask