import React, { useState, useRef, useEffect } from 'react';
import { assignTask, unassignTask, getTaskAssignees, getProjectDetails } from '../../https';
import { getInitials } from '../../utils/getInitials';

const ROLE_COLORS = {
    Leader: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Manager: 'bg-blue-100 text-blue-700 border-blue-300',
    Assignee: 'bg-green-100 text-green-700 border-green-300'
};

function TaskAssigneeModal({ taskId, projectId, currentUserRole, onClose, onAssigneeUpdated }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [assignees, setAssignees] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const modalRef = useRef(null);
    const addMenuRef = useRef(null);

    const canEdit = currentUserRole === 'Leader' || currentUserRole === 'Manager';

    // Fetch task assignees and project members on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch task assignees using dedicated endpoint
                const assigneeRes = await getTaskAssignees(taskId);
                console.log('Task assignees response:', assigneeRes);
                if (assigneeRes.success) {
                    // Normalize assignee data
                    const assigneeList = (assigneeRes.assignees || []).map(a => ({
                        user_id: a.user_id || a.id,
                        username: a.username || a.name || 'User',
                        name: a.name || a.username,
                        role: a.role || 'Assignee'
                    }));
                    console.log('Parsed assignees:', assigneeList);
                    setAssignees(assigneeList);
                }

                // Fetch project details for available members
                const projectRes = await getProjectDetails(projectId);
                console.log('Project details response:', projectRes);

                // Handle different response structures
                let members = [];
                if (projectRes.success) {
                    // Try different paths to find members
                    members = projectRes.data?.members || projectRes.members || [];
                }
                console.log('Parsed members:', members);
                setProjectMembers(members);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [taskId, projectId]);

    // Close modal on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close add menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
                setShowAddMenu(false);
                setSearchQuery('');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddAssignee = async (member) => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await assignTask({
                task_id: taskId,
                user_id: member.user_id || member.id
            });

            if (res.success) {
                setMessage({ text: 'Assignee added successfully!', type: 'success' });
                // Add to local state
                setAssignees([...assignees, {
                    user_id: member.user_id || member.id,
                    username: member.name || member.username,
                    role: 'Assignee'
                }]);
                setShowAddMenu(false);
                setSearchQuery('');
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                // Check if already assigned error - add to local state to update filter
                const errorMsg = res.error || 'Failed to add assignee';
                if (errorMsg.toLowerCase().includes('already assigned')) {
                    // User is already assigned, add to local state so they're filtered
                    setAssignees([...assignees, {
                        user_id: member.user_id || member.id,
                        username: member.name || member.username,
                        role: 'Assignee'
                    }]);
                    setMessage({ text: 'User is already assigned to this task.', type: 'error' });
                } else {
                    setMessage({ text: errorMsg, type: 'error' });
                }
            }
        } catch (e) {
            setMessage({ text: 'Failed to add assignee', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAssignee = async (userId, username) => {
        if (!confirm(`Are you sure you want to remove ${username} from this task?`)) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await unassignTask({
                task_id: taskId,
                user_id: userId
            });

            if (res.success) {
                setMessage({ text: 'Assignee removed successfully!', type: 'success' });
                // Remove from local state
                setAssignees(assignees.filter(a => a.user_id !== userId));
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: res.error || 'Failed to remove assignee', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Failed to remove assignee', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Get members who are not already assigned
    const assignedIds = assignees.map(a => a.user_id);
    const availableMembers = projectMembers.filter(m => {
        const memberId = m.user_id || m.id;
        const memberName = (m.name || m.username || '').toLowerCase();
        return !assignedIds.includes(memberId) && memberName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className='fixed inset-0 z-1100 flex items-center justify-center bg-black/30'>
            <div ref={modalRef} className='bg-white rounded-xl shadow-xl w-[450px] max-h-[80vh] flex flex-col overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
                    <span className='font-semibold text-gray-800'>Manage Assignees</span>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600 cursor-pointer'>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mx-4 mt-3 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                {/* Add Assignee Button */}
                {canEdit && (
                    <div className='px-4 pt-3 relative'>
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className='flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors'>
                            <i className="fa-solid fa-plus"></i>
                            Add Assignee
                        </button>

                        {/* Add Member Dropdown */}
                        {showAddMenu && (
                            <div ref={addMenuRef} className='absolute top-full left-4 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg w-80 z-50'>
                                <div className='p-2 border-b'>
                                    <input
                                        type="text"
                                        placeholder="Search project members..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded outline-none focus:border-blue-500"
                                        autoFocus
                                    />
                                </div>
                                <div className='max-h-48 overflow-y-auto'>
                                    {availableMembers.length === 0 ? (
                                        <div className='p-4 text-center text-sm text-gray-500'>
                                            {searchQuery ? 'No members found' : 'All members are already assigned'}
                                        </div>
                                    ) : (
                                        availableMembers.map(member => (
                                            <div
                                                key={member.user_id || member.id}
                                                onClick={() => handleAddAssignee(member)}
                                                className='flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer'>
                                                <div
                                                    style={{ backgroundColor: `hsl(${((member.user_id || member.id || 0)) * 137.508 % 360}, 70%, 60%)` }}
                                                    className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
                                                    {getInitials(member.name || member.username || 'U')}
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-sm font-medium'>{member.name || member.username}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded w-fit ${ROLE_COLORS[member.role] || ROLE_COLORS.Assignee}`}>
                                                        {member.role}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Assignee List */}
                <div className='p-4 flex flex-col gap-2 overflow-y-auto'>
                    {loading ? (
                        <p className='text-center text-gray-500 py-4'>Loading assignees...</p>
                    ) : assignees.length === 0 ? (
                        <p className='text-center text-gray-500 py-4'>No assignees yet</p>
                    ) : (
                        assignees.map(assignee => (
                            <div
                                key={assignee.user_id}
                                className='flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors'
                            >
                                <div className='flex items-center gap-3'>
                                    {/* Avatar */}
                                    <div
                                        style={{ backgroundColor: `hsl(${(assignee.user_id || 0) * 137.508 % 360}, 70%, 60%)` }}
                                        className='w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm'
                                    >
                                        {getInitials(assignee.username || assignee.name || 'U')}
                                    </div>

                                    {/* Info */}
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-gray-800'>{assignee.username || assignee.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded border w-fit ${ROLE_COLORS[assignee.role] || ROLE_COLORS.Assignee}`}>
                                            {assignee.role || 'Assignee'}
                                        </span>
                                    </div>
                                </div>

                                {/* Remove Button (only for Leaders/Managers) */}
                                {canEdit && (
                                    <button
                                        onClick={() => handleRemoveAssignee(assignee.user_id, assignee.username || assignee.name)}
                                        disabled={loading}
                                        className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer'
                                        title="Remove assignee"
                                    >
                                        <i className="fa-solid fa-user-minus"></i>
                                    </button>
                                )}

                                {/* View only for non-Leaders/Managers */}
                                {!canEdit && (
                                    <span className='text-xs text-gray-400'>View only</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className='flex justify-between items-center px-4 py-3 border-t bg-gray-50'>
                    <span className='text-xs text-gray-500'>
                        {canEdit ? 'You can add and remove assignees' : 'Only Leaders and Managers can manage assignees'}
                    </span>
                    <button
                        onClick={() => { onAssigneeUpdated?.(); onClose(); }}
                        className='px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskAssigneeModal;
