import React, { useState, useRef, useEffect } from 'react';
import { updateProjectMemberRole, removeProjectMember, getProjectDetails } from '../../https';
import { getInitials } from '../../utils/getInitials';

const ROLE_COLORS = {
    Leader: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Manager: 'bg-blue-100 text-blue-700 border-blue-300',
    Member: 'bg-gray-100 text-gray-700 border-gray-300'
};

function MemberManagementModal({ projectId, members: initialMembers, currentUserRole: initialRole, onClose, onMemberUpdated }) {
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [members, setMembers] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState(initialRole);
    const modalRef = useRef(null);

    // Fetch project details on mount to get accurate member roles
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getProjectDetails(projectId);
                if (res.success && res.data) {
                    // Transform members to expected format
                    const transformedMembers = (res.data.members || []).map(m => ({
                        id: m.user_id,
                        name: m.first_name && m.last_name
                            ? `${m.first_name} ${m.last_name}`.trim()
                            : m.username,
                        role: m.role,
                        avatarColor: m.role === 'Leader' ? '#EAB308' : m.role === 'Manager' ? '#3B82F6' : '#6B7280'
                    }));
                    setMembers(transformedMembers);
                    setCurrentUserRole(res.data.user_role || initialRole);
                } else {
                    // Fallback to initial members
                    setMembers(initialMembers || []);
                }
            } catch (error) {
                console.error('Error fetching project details:', error);
                setMembers(initialMembers || []);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [projectId]);

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

    const handleRoleChange = async (memberId, newRole) => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await updateProjectMemberRole({
                project_id: projectId,
                user_id: memberId,
                role: newRole
            });

            if (res.success) {
                setMessage({ text: res.message || 'Role updated successfully!', type: 'success' });
                setTimeout(() => {
                    onMemberUpdated?.();
                }, 1000);
            } else {
                setMessage({ text: res.error || 'Failed to update role', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Failed to update role', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await removeProjectMember({
                project_id: projectId,
                user_id: memberId
            });

            if (res.success) {
                setMessage({ text: 'Member removed successfully!', type: 'success' });
                setTimeout(() => {
                    onMemberUpdated?.();
                }, 1000);
            } else {
                setMessage({ text: res.error || 'Failed to remove member', type: 'error' });
            }
        } catch (e) {
            setMessage({ text: 'Failed to remove member', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isLeader = currentUserRole === 'Leader';

    return (
        <div className='fixed inset-0 z-1100 flex items-center justify-center bg-black/30'>
            <div ref={modalRef} className='bg-white rounded-xl shadow-xl w-[450px] max-h-[80vh] flex flex-col overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
                    <span className='font-semibold text-gray-800'>Manage Members</span>
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

                {/* Member List */}
                <div className='p-4 flex flex-col gap-2 overflow-y-auto'>
                    {loading ? (
                        <p className='text-center text-gray-500 py-4'>Loading members...</p>
                    ) : (!members || members.length === 0) ? (
                        <p className='text-center text-gray-500 py-4'>No members in this project</p>
                    ) : (
                        members.map(member => (
                            <div
                                key={member.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${selectedMember === member.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <div className='flex items-center gap-3'>
                                    {/* Avatar */}
                                    <div
                                        style={{ backgroundColor: member.avatarColor || '#3b82f6' }}
                                        className='w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm'
                                    >
                                        {getInitials(member.name)}
                                    </div>

                                    {/* Info */}
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-gray-800'>{member.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded border w-fit ${ROLE_COLORS[member.role] || ROLE_COLORS.Member}`}>
                                            {member.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions (only for Leaders) */}
                                {isLeader && (
                                    <div className='flex items-center gap-2'>
                                        {/* Role Dropdown */}
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            disabled={loading}
                                            className='text-sm px-2 py-1 border rounded bg-white cursor-pointer focus:outline-none focus:border-blue-500'
                                        >
                                            <option value="Leader">Leader</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Member">Member</option>
                                        </select>

                                        {/* Remove Button (can't remove Leader) */}
                                        {member.role !== 'Leader' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id, member.name)}
                                                disabled={loading}
                                                className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer'
                                                title="Remove member"
                                            >
                                                <i className="fa-solid fa-user-minus"></i>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* View only for non-Leaders */}
                                {!isLeader && (
                                    <span className='text-xs text-gray-400'>View only</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className='flex justify-between items-center px-4 py-3 border-t bg-gray-50'>
                    <span className='text-xs text-gray-500'>
                        {isLeader ? 'You can change roles and remove members' : 'Only Leaders can manage members'}
                    </span>
                    <button
                        onClick={onClose}
                        className='px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors cursor-pointer'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MemberManagementModal;
