const API = "http://127.0.0.1:5000/api";

// =============================
// AUTH STORAGE (localStorage)
// =============================
function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    try {
        const u = localStorage.getItem("user");
        if (!u || u === "undefined" || u === "null") return null;
        return JSON.parse(u);
    } catch (err) {
        console.error("Invalid user in localStorage");
        return null;
    }
}

function setSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// =============================
// SECURITY HELPER (xss library via CDN)
// Falls back to manual escape if library unavailable
// =============================
function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    // Use xss library if loaded (via CDN script tag in each page)
    if (typeof filterXSS === "function") {
        return filterXSS(String(text));
    }
    // Fallback manual escape
    return String(text).replace(/[&<>"']/g, function (m) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[m];
    });
}

// =============================
// BASE FETCH HELPERS
// =============================
async function apiRequest(path, method = "GET", body = null) {
    try {
        const headers = { "Content-Type": "application/json" };
        const token = getToken();
        if (token) headers["Authorization"] = "Bearer " + token;

        const options = { method, headers, credentials: "include" };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(API + path, options);
        return await res.json();
    } catch (err) {
        return { success: false, message: "Network error: " + err.message };
    }
}

function apiGet(path)         { return apiRequest(path, "GET"); }
function apiPost(path, body)  { return apiRequest(path, "POST", body); }
function apiPut(path, body)   { return apiRequest(path, "PUT", body); }
function apiDelete(path)      { return apiRequest(path, "DELETE"); }
