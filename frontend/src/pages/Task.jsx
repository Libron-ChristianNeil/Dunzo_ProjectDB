import React, { useState, useEffect } from 'react';
import SelectOptions from '../components/SelectOptions';
import TaskCard from '../components/task-app-components/TaskCard';
import ModalExpandTask from '../components/task-app-components/ModalExpandTask';
import ModalAddTask from '../components/task-app-components/ModalAddTask';
import { getTasks, getProjects } from '../https';

function Task() {

    const taskStatus = [
        { id: 'All', name: 'All Statuses' },
        { id: 'To Do', name: 'To Do' },
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Done', name: 'Done' },
        { id: 'Archived', name: 'Archived' }
    ];

    const sortList = [
        { id: 'All', name: 'Default' },
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
    const [selectedProject, setSelectedProject] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [sortFilter, setSortFilter] = useState('All');

    // Fetch projects on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects('Active');
                console.log('Projects API response:', response);
                if (response.success) {
                    setProjects(response.projects || []);
                    console.log('Projects loaded:', response.projects);
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
            console.log('fetchTasks called, selectedProject:', selectedProject);

            // If "All Projects" is selected, fetch tasks from all projects
            if (selectedProject === 'All') {
                console.log('Fetching tasks from ALL projects');
                setLoading(true);
                setError(null);

                if (projects.length === 0) {
                    setTasks([]);
                    setLoading(false);
                    return;
                }

                try {
                    // Fetch tasks from each project in parallel
                    const allTaskPromises = projects.map(async (project) => {
                        try {
                            const response = await getTasks(
                                (project.project_id || project.id)?.toString(),
                                statusFilter === 'All' ? null : statusFilter,
                                filterType
                            );
                            if (response.success) {
                                // Inject project_id into each task
                                const tasksWithProjectId = (response.tasks || response.data || []).map(t => ({
                                    ...t,
                                    project_id: project.project_id || project.id
                                }));
                                return { success: true, tasks: tasksWithProjectId };
                            }
                            return { success: false, data: [] };
                        } catch (err) {
                            return { success: false, data: [] };
                        }
                    });

                    const results = await Promise.all(allTaskPromises);

                    // Combine all tasks from all projects
                    const allTasks = results.flatMap(response =>
                        response.success ? (response.tasks || []) : []
                    );

                    console.log('All projects tasks loaded:', allTasks.length, 'tasks');
                    setTasks(allTasks);
                } catch (err) {
                    console.error('Error fetching all project tasks:', err);
                    setError('Network error loading tasks');
                    setTasks([]);
                } finally {
                    setLoading(false);
                }
                return;
            }

            console.log('Fetching tasks for project:', selectedProject);
            setLoading(true);
            try {
                const response = await getTasks(
                    selectedProject,
                    statusFilter === 'All' ? null : statusFilter,
                    filterType
                );
                console.log('Tasks API response:', response);

                if (response.success) {
                    // Inject project_id into tasks
                    const tasksWithProjectId = (response.tasks || response.data || []).map(t => ({
                        ...t,
                        project_id: selectedProject
                    }));
                    setTasks(tasksWithProjectId);
                    console.log('Tasks loaded:', tasksWithProjectId);
                } else {
                    setError('Failed to load tasks');
                    setTasks([]);
                }
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setError('Network error loading tasks');
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [selectedProject, statusFilter, filterType, projects]);

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleProjectFilter = (value) => {
        console.log('Project filter changed to:', value);
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
            return (a.title || '').localeCompare(b.title || '');
        }
        if (sortFilter === 'Due Date') {
            return new Date(a.due_date) - new Date(b.due_date);
        }
        return 0; // Default order
    });

    // Build project options - use project_id from backend
    const projectOptions = [
        { id: 'All', name: 'All Projects' },
        ...projects.map(project => ({
            id: (project.project_id || project.id)?.toString(),
            name: project.title
        }))
    ];

    console.log('projectOptions:', projectOptions);

    const refreshTasks = async () => {
        if (selectedProject === 'All') {
            // Refresh all projects
            try {
                const allTaskPromises = projects.map(async (project) => {
                    try {
                        const response = await getTasks(
                            (project.project_id || project.id)?.toString(),
                            statusFilter === 'All' ? null : statusFilter,
                            filterType
                        );
                        if (response.success) {
                            const tasksWithProjectId = (response.tasks || response.data || []).map(t => ({
                                ...t,
                                project_id: project.project_id || project.id
                            }));
                            return { success: true, tasks: tasksWithProjectId };
                        }
                        return { success: false, data: [] };
                    } catch (err) {
                        return { success: false, data: [] };
                    }
                });

                const results = await Promise.all(allTaskPromises);
                const allTasks = results.flatMap(response =>
                    response.success ? (response.tasks || []) : []
                );
                setTasks(allTasks);
            } catch (err) {
                console.error('Error refreshing all tasks:', err);
            }
            return;
        }
        try {
            const response = await getTasks(
                selectedProject,
                statusFilter === 'All' ? null : statusFilter,
                filterType
            );
            if (response.success) {
                const tasksWithProjectId = (response.tasks || response.data || []).map(t => ({
                    ...t,
                    project_id: selectedProject
                }));
                setTasks(tasksWithProjectId);
            }
        } catch (err) {
            console.error('Error refreshing tasks:', err);
        }
    };

    return (
        <div className='flex flex-col h-screen mx-4'>
            {view && <ModalExpandTask
                item={taskItem}
                onClose={() => setView(false)}
                refreshTasks={refreshTasks}
            />}
            {openAddTask && <ModalAddTask
                onClose={() => setOpenAddTask(false)}
                projects={projects}
                refreshTasks={refreshTasks}
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
                        No tasks found
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