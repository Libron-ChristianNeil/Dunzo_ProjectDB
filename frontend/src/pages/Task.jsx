import React, { useState, useEffect } from 'react';
import SelectOptions from '../components/SelectOptions';
import TaskCard from '../components/task-app-components/TaskCard';
import ModalExpandTask from '../components/task-app-components/ModalExpandTask';
import ModalAddTask from '../components/task-app-components/ModalAddTask';
import { getTasks } from '../utils/https';
import { getProjects } from '../utils/https';

function Task() {

    const taskStatus = [
        { id: 'all', name: 'All Statuses' },
        { id: 'To Do', name: 'To Do' },
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Done', name: 'Done' },
        { id: 'Archived', name: 'Archived' }
    ];

    const sortList = [
        { id: 'all', name: 'Default' },
        { id: 'Name', name: 'Name' },
        { id: 'Due Date', name: 'Due Date' }
    ]

    const filterTypeList = [
        { id: 'All', name: 'All Tasks' },
        { id: 'Assigned', name: 'Assigned to Me' },
        { id: 'Unassigned', name: 'Unassigned' }
    ]

    const [view, setView] = useState(false)
    const [taskItem, setTaskItem] = useState(null)
    const [openAddTask, setOpenAddTask] = useState(false)
    const [projects, setProjects] = useState([])
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filters State
    const [selectedProject, setSelectedProject] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filterType, setFilterType] = useState('All');
    const [sortFilter, setSortFilter] = useState('all');

    // Fetch projects on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects('Active');
                if (response.success) {
                    setProjects(response.data || []);
                } else {
                    setError('Failed to load projects');
                }
            } catch (err) {
                setError('Network error loading projects');
            }
        };
        fetchProjects();
    }, []);

    // Fetch tasks when filters change
    useEffect(() => {
        const fetchTasks = async () => {
            if (selectedProject === 'all') {
                setTasks([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await getTasks(
                    selectedProject,
                    statusFilter === 'all' ? null : statusFilter,
                    filterType
                );

                if (response.success) {
                    setTasks(response.data || []);
                } else {
                    setError('Failed to load tasks');
                    setTasks([]);
                }
            } catch (err) {
                setError('Network error loading tasks');
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [selectedProject, statusFilter, filterType]);

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleProjectFilter = (value) => {
        setSelectedProject(value);
    };

    const handleSortFilter = (value) => {
        setSortFilter(value);
    };

    const handleFilterType = (value) => {
        setFilterType(value);
    };

    // Sort logic
    const displayedTasks = [...tasks].sort((a, b) => {
        if (sortFilter === 'Name') {
            return a.title.localeCompare(b.title);
        }
        if (sortFilter === 'Due Date') {
            return new Date(a.due_date) - new Date(b.due_date);
        }
        return 0; // Default order
    });

    const projectOptions = [
        { id: 'all', name: 'All Projects' },
        ...projects.map(project => ({
            id: project.id.toString(),
            name: project.title
        }))
    ];

    return (
        <div className='flex flex-col h-screen mx-4'>
            {view && <ModalExpandTask
                item={taskItem}
                onClose={() => setView(false)}
                refreshTasks={() => {
                    // Refresh tasks when task is updated
                    const fetchTasks = async () => {
                        if (selectedProject === 'all') return;
                        const response = await getTasks(
                            selectedProject,
                            statusFilter === 'all' ? null : statusFilter,
                            filterType
                        );
                        if (response.success) {
                            setTasks(response.data || []);
                        }
                    };
                    fetchTasks();
                }}
            />}
            {openAddTask && <ModalAddTask
                onClose={() => setOpenAddTask(false)}
                projects={projects}
                refreshTasks={() => {
                    // Refresh tasks when new task is added
                    const fetchTasks = async () => {
                        if (selectedProject === 'all') return;
                        const response = await getTasks(
                            selectedProject,
                            statusFilter === 'all' ? null : statusFilter,
                            filterType
                        );
                        if (response.success) {
                            setTasks(response.data || []);
                        }
                    };
                    fetchTasks();
                }}
            />}

            <div className='sticky top-0 z-100 bg-gray-100 py-3'>
                <div className='flex flex-row justify-between items-center bg-none'>
                    <h1 className='m-0 p-0'>Tasks.</h1>
                    <button className='bg-red-500 mr-4 py-1.5 px-4 text-white font-medium rounded-full cursor-pointer'
                            onClick={() => setOpenAddTask(true)}
                        >
                        <span className='mr-2'><i className="fa-solid fa-plus"></i></span>
                        New Task
                    </button>
                </div>

                {/* Filter Section */}
                <div className='flex flex-row gap-3 my-2'>
                    <SelectOptions
                        context={'Project'}
                        items={projectOptions}
                        onValueChange={handleProjectFilter}
                    />

                    <SelectOptions
                        context={'Status'}
                        items={taskStatus}
                        onValueChange={handleStatusFilter}
                    />

                    <SelectOptions
                        context={'Filter'}
                        items={filterTypeList}
                        onValueChange={handleFilterType}
                    />

                    <SelectOptions
                        context={'Sort by'}
                        items={sortList}
                        onValueChange={handleSortFilter}
                    />
                </div>
            </div>

            <div className='mt-4 gap-3 grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))]'>
                {loading ? (
                    <p className="text-gray-500 mt-10 text-center col-span-full">Loading tasks...</p>
                ) : error ? (
                    <p className="text-red-500 mt-10 text-center col-span-full">{error}</p>
                ) : displayedTasks.length === 0 ? (
                    <p className="text-gray-500 mt-10 text-center col-span-full">
                        {selectedProject === 'all'
                            ? 'Select a project to view tasks'
                            : 'No tasks found'}
                    </p>
                ) : (
                    displayedTasks.map((task) => (
                        <TaskCard
                            key={task.task_id}
                            setTaskItem={setTaskItem}
                            setView={setView}
                            item={task}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default Task