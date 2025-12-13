const BASE_URL = "http://127.0.0.1:8000"

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
//***********************
//* user_app
//***********************
export const registerUser = async (username, password) => {
    try {
        const response = await fetch(`${BASE_URL}/register/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        return await response.json(); // This returns the object { success: true, ... } from Django

    } catch (error) {
        console.error('Error connecting to backend:', error);
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
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
        return {success: false, error: 'Network Error'};
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await fetch(`${BASE_URL}/project/`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project_id: projectId })
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting project:', error);
        return {success: false, error: 'Network Error'};
    }
};