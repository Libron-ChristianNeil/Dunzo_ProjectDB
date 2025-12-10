const BASE_URL = "http://127.0.0.1:8000/"

//***********************
//* dunzomanagement
//***********************
export const loginUser = async (identifier, password) => {
    try {
        const response = await fetch(`${BASE_URL}/login/`, {
            method: 'POST',
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
        return { success: false, error: 'Network Error' };
    }
}