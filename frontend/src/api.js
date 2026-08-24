const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, option = {}) {
    const res = await fetch (`${API_URL}${path}`,{
        headers: { "Content-Type": "application/json"},
        ...options,
    });
    if(!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Request to ${path} failed');
    }
    return res.json();
}

export const api = {
    signup: (name, email, password) =>
        request("/auth/signup", {method: "POST", body: JSON.stringify({ name, email, password}) }),

    login: (email, password) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({email, password }) }),

    chooseCharacter: (user_id, character) => 
        request("/user/character", { method: "POST", body: JSON.stringify({ user_id, character })}),

    createTask: (user_id, title ) =>
        request("/tasks", { method: "POST", body: JSON.stringify({ user_id, title})}),

    listTasks: (user_id) => 
        request('/tasks?user_id=${user_id}'),

    completeSubtask: (task_id, subtask_index) =>
        request("/tasks/complete_subtask", { method: "POST", body: JSON.stringify({ task_id, subtask_index})}),

    getProgress: (user_id) => request('/user/${user_id}/progress'),
};