const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    
    try {
        const saved = localStorage.getItem("diva_user");
        if (saved) {
            const user = JSON.parse(saved);
            if (user && user.access_token) {
                headers["Authorization"] = `Bearer ${user.access_token}`;
            }
        }
    } catch (e) {
        console.error("Error reading token from localStorage:", e);
    }

    const res = await fetch(`${API_URL}${path}`, {
        headers: headers,
        ...options,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        let errorMsg = `Request to ${path} failed`;
        if (body.detail) {
            errorMsg = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
        }
        throw new Error(errorMsg);
    }
    return res.json();
}

export const api = {
    signup: (name, email, password) =>
        request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) }),

    login: (email, password) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    chooseCharacter: (user_id, character) =>
        request("/user/character", { method: "POST", body: JSON.stringify({ user_id, character }) }),

    createTask: (user_id, title) =>
        request("/tasks", { method: "POST", body: JSON.stringify({ user_id, title }) }),

    listTasks: (user_id) =>
        request(`/tasks?user_id=${encodeURIComponent(user_id)}`),

    getTask: (task_id) => request(`/tasks/${task_id}`),

    completeSubtask: (task_id, subtask_index) =>
        request("/tasks/complete_subtask", {
            method: "POST",
            body: JSON.stringify({ task_id, subtask_index }),
        }),
};
