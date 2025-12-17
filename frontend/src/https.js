const BASE_URL = "/api"  // Vite proxy handles routing to backend

//***********************
//* dunzomanagement
//***********************
export const loginUser = async (identifier, password) => {
    try {
        const response = await fetch(`${BASE_URL}/login/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: identifier,
                password: password
            })
        });

        return await response.json(); // This returns the object { success: true, ... } from Django

    } catch (error) {
        console.error('Error connecting to backend:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const logoutUser = async () => {
    try {
        const response = await fetch(`${BASE_URL}/logout/`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error logging out:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const getDashboard = async () => {
    try {
        const response = await fetch(`${BASE_URL}/dashboard/`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const getUserSettings = async () => {
    try {
        const response = await fetch(`${BASE_URL}/settings/`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateUserSettings = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/settings/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating user settings:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const searchUsers = async (query, projectId = null) => {
    try {
        let url = `${BASE_URL}/user/search/?q=${encodeURIComponent(query)}`;
        if (projectId) {
            url += `&project_id=${projectId}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error searching users:', error);
        return { success: false, error: 'Network Error', users: [] };
    }
};
//***********************
//* user_app
//***********************
export const registerUser = async (username, firstName, lastName, email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/register/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password
            })
        });
        return await response.json(); // This returns the object { success: true, ... } from Django

    } catch (error) {
        console.error('Error connecting to backend:', error);
        return { success: false, error: 'Network Error' };
    }
};

//***********************
//* project_app
//***********************
export const getProjects = async (filter = 'Active') => {
    try {
        const response = await fetch(`${BASE_URL}/project/?filter=${filter}`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const getProjectDetails = async (projectId) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/?project_id=${projectId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching project details:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const createProject = async (projectData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateProject = async (projectData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating project:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const addProjectMember = async (memberData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/members/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding project member:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const removeProjectMember = async (memberData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/members/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error removing project member:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateProjectMemberRole = async (roleData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/members/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roleData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating member role:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const getProjectTags = async (projectId) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/tags/?project_id=${projectId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching tags:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const createTag = async (tagData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/tags/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tagData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating tag:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateTag = async (tagData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/tags/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tagData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating tag:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const deleteTag = async (tagData) => {
    try {
        const response = await fetch(`${BASE_URL}/project/details/tags/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tagData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting tag:', error);
        return { success: false, error: 'Network Error' };
    }
};



//***********************
//* task_app
//***********************

export const getTasks = async (projectId, status, filterType) => {
    try {
        const url = `${BASE_URL}/task/?project_id=${projectId}${status ? '&status=' + status : ''}${filterType ? '&filter_type=' + filterType : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const createTask = async (taskData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const deleteTask = async (taskId) => {
    try {
        const response = await fetch(`${BASE_URL}/task/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_id: taskId })
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const getTaskDetails = async (taskId) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/?task_id=${taskId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching task details:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateTask = async (taskData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const assignTask = async (assignmentData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/assignees/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignmentData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error assigning task:', error);
        return { success: false, error: 'Network Error' };
    }
};

// Get task assignees
export const getTaskAssignees = async (taskId) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/assignees/?task_id=${taskId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching task assignees:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const unassignTask = async (assignmentData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/assignees/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignmentData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error unassigning task:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateAssignmentRole = async (roleData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/assignees/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roleData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating assignment role:', error);
        return { success: false, error: 'Network Error' };
    }
};

// Get task comments
export const getTaskComments = async (taskId) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/comments/?task_id=${taskId}`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching task comments:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const postComment = async (commentData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/comments/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error posting comment:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const deleteComment = async (commentData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/comments/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: 'Network Error' };
    }
};

export const updateComment = async (commentData) => {
    try {
        const response = await fetch(`${BASE_URL}/task/details/comments/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating comment:', error);
        return { success: false, error: 'Network Error' };
    }
};

//***********************
//* timeline_app
//***********************
export const getTimeline = async (projectId) => {
    try {
        const response = await fetch(`${BASE_URL}/timeline/?project_id=${projectId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error connecting to backend:', error);
        return { success: false, error: 'Network Error' };
    }
};

//***********************
//* calendarevent_app
//***********************

// Get all calendar events for the current user
export const getCalendarEvents = async () => {
    try {
        const response = await fetch(`${BASE_URL}/calendar/`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return { success: false, error: 'Network Error' };
    }
};

// Create a new calendar event (Meeting or Event only)
export const createCalendarEvent = async (eventData) => {
    try {
        const response = await fetch(`${BASE_URL}/calendar/event/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return { success: false, error: 'Network Error' };
    }
};

// Update an existing calendar event
export const updateCalendarEvent = async (eventData) => {
    try {
        const response = await fetch(`${BASE_URL}/calendar/event/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating calendar event:', error);
        return { success: false, error: 'Network Error' };
    }
};

// Delete a calendar event (Meeting or Event only)
export const deleteCalendarEvent = async (eventId) => {
    try {
        const response = await fetch(`${BASE_URL}/calendar/event/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ event_id: eventId })
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        return { success: false, error: 'Network Error' };
    }
};

// Get projects where user is Manager or Leader (for Meeting creation)
export const getUserManagedProjects = async () => {
    try {
        // Uses existing getProjects but we'll filter by role on frontend
        // or we can add a filter parameter
        const response = await fetch(`${BASE_URL}/project/?filter=Active&role=manager_leader`, {
            method: 'GET',
            credentials: 'include',
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching managed projects:', error);
        return { success: false, error: 'Network Error' };
    }
};