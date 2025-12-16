import React, { useState, useRef, useEffect } from 'react';
import { searchUsers, addProjectMember } from '../../https';
import { getInitials } from '../../utils/getInitials';

function AddMemberModal({ projectId, onClose, onMemberAdded }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('Member');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const searchTimeout = useRef(null);
    const modalRef = useRef(null);

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

    // Debounced search
    const handleSearch = (value) => {
        setQuery(value);
        setError('');
        setSelectedUser(null);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (value.length < 2) {
            setResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await searchUsers(value, projectId);
                if (res.success) {
                    setResults(res.users);
                } else {
                    setError(res.error || 'Search failed');
                }
            } catch (e) {
                setError('Search failed');
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setQuery(user.username);
        setResults([]);
    };

    const handleAddMember = async () => {
        if (!selectedUser) {
            setError('Please select a user first');
            return;
        }

        setAdding(true);
        setError('');
        setSuccess('');

        try {
            const res = await addProjectMember({
                project_id: projectId,
                identifier: selectedUser.username,
                role: selectedRole
            });

            if (res.success) {
                setSuccess('Member added successfully!');
                setTimeout(() => {
                    onMemberAdded?.();
                    onClose();
                }, 1000);
            } else {
                setError(res.error || 'Failed to add member');
            }
        } catch (e) {
            setError('Failed to add member');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className='fixed inset-0 z-1100 flex items-center justify-center bg-black/30'>
            <div ref={modalRef} className='bg-white rounded-xl shadow-xl w-96 max-h-[80vh] flex flex-col overflow-hidden'>
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
                    <span className='font-semibold text-gray-800'>Add Member</span>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600 cursor-pointer'>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Content */}
                <div className='p-4 flex flex-col gap-4'>
                    {/* Search Input */}
                    <div className='relative'>
                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Search User</label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by username or email..."
                            className='w-full px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none text-sm'
                        />

                        {/* Search Results Dropdown */}
                        {results.length > 0 && !selectedUser && (
                            <div className='absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto z-10'>
                                {results.map(user => (
                                    <div
                                        key={user.user_id}
                                        onClick={() => handleSelectUser(user)}
                                        className='flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
                                    >
                                        <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold'>
                                            {getInitials(user.full_name)}
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-sm font-medium text-gray-800'>{user.full_name}</span>
                                            <span className='text-xs text-gray-500'>@{user.username}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className='absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 p-3 text-center text-sm text-gray-500'>
                                Searching...
                            </div>
                        )}

                        {query.length >= 2 && !loading && results.length === 0 && !selectedUser && (
                            <div className='absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 p-3 text-center text-sm text-gray-500'>
                                No users found
                            </div>
                        )}
                    </div>

                    {/* Selected User Preview */}
                    {selectedUser && (
                        <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                            <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold'>
                                {getInitials(selectedUser.full_name)}
                            </div>
                            <div className='flex-1'>
                                <p className='font-medium text-gray-800'>{selectedUser.full_name}</p>
                                <p className='text-xs text-gray-500'>@{selectedUser.username}</p>
                            </div>
                            <button
                                onClick={() => { setSelectedUser(null); setQuery(''); }}
                                className='text-gray-400 hover:text-gray-600 cursor-pointer'
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    )}

                    {/* Role Selection */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className='w-full px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none text-sm bg-white cursor-pointer'
                        >
                            <option value="Member">Member</option>
                            <option value="Manager">Manager</option>
                        </select>
                        <p className='text-xs text-gray-500 mt-1'>
                            {selectedRole === 'Manager' ? 'Can create/edit tags and manage tasks' : 'Can view and work on assigned tasks'}
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className='p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200'>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className='p-2 bg-green-50 text-green-600 text-sm rounded border border-green-200'>
                            {success}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-2 px-4 py-3 border-t bg-gray-50'>
                    <button
                        onClick={onClose}
                        className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddMember}
                        disabled={!selectedUser || adding}
                        className={`px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer ${(!selectedUser || adding) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {adding ? 'Adding...' : 'Add Member'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddMemberModal;
