export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const getWebSocketUrl = (chatId) => {
    return API_BASE_URL.replace('http', 'ws').replace('https', 'wss') + `/chats/${chatId}/ws`;
};

const getAuthHeaders = (token = null) => {
    const accessToken = token || localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    };
};

const fetchWithAuth = async (url, options = {}, token = null) => {
    const headers = {
        ...getAuthHeaders(token),
        ...options.headers,
    };

    // If body is FormData, delete Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || (response.status === 403 && (errorData.detail === 'Could not validate credentials' || errorData.detail === 'Not authenticated'))) {
            // Handle unauthorized access (e.g., redirect to login)
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();

};

// ... (existing exports)

export const updateUserProfile = async (userData, token = null) => {
    const response = await fetchWithAuth('/users/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
    return response.data;
};

export const uploadProfileImage = async (file, token = null) => {
    const formData = new FormData();
    formData.append('file', file);

    // fetchWithAuth now handles FormData correctly by removing Content-Type header
    const response = await fetchWithAuth('/uploads/profile-image', {
        method: 'POST',
        body: formData,
    }, token);
    return response.data;
};



export const signup = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Signup failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await fetch(`${API_BASE_URL}/login/access-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Roles API

export const getRoles = async (skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/roles/?skip=${skip}&limit=${limit}`, {}, token);
};

export const createRole = async (roleData, token = null) => {
    return fetchWithAuth('/roles/', {
        method: 'POST',
        body: JSON.stringify(roleData),
    }, token);
};

export const updateRole = async (id, roleData, token = null) => {
    return fetchWithAuth(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
    }, token);
};

export const deleteRole = async (id, token = null) => {
    return fetchWithAuth(`/roles/${id}`, {
        method: 'DELETE',
    }, token);
};

export const updateRolePermissions = async (roleId, permissions, token = null) => {
    return fetchWithAuth(`/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissions),
    }, token);
};


let userCache = null;

export const getCachedUser = () => userCache;

export const getCurrentUser = async (token = null) => {
    const response = await fetchWithAuth('/users/me', {}, token);
    userCache = response.data;
    return response.data; // APIResponse wrapper returns data field
};

export const getCategories = async (skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/courses/categories/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getProviders = async (skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/providers/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getBadges = async (skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/course-badges/?skip=${skip}&limit=${limit}`, {}, token);
};

export const createProvider = async (providerData, token = null) => {
    return fetchWithAuth('/providers/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData),
    }, token);
};

export const createBadge = async (badgeData, token = null) => {
    return fetchWithAuth('/course-badges/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
    }, token);
};

export const createCourse = async (courseData, token = null) => {
    return fetchWithAuth('/courses/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
    }, token);
};

export const getCourses = async (skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/courses/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getCourse = async (id, token = null) => {
    return fetchWithAuth(`/courses/${id}`, {}, token);
};

export const getUsers = async (skip = 0, limit = 100, token = null) => {
    const response = await fetchWithAuth(`/users/?skip=${skip}&limit=${limit}`, {}, token);
    return response.data;
};

export const searchUsers = async (query, skip = 0, limit = 100, token = null) => {
    const response = await fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`, {}, token);
    return response.data;
};

export const updateUser = async (id, userData, token = null) => {
    const response = await fetchWithAuth(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
    return response.data;
};

export const deleteUser = async (id, token = null) => {
    const response = await fetchWithAuth(`/users/${id}`, {
        method: 'DELETE',
    }, token);
    return response.data;
};

// Batch API
export const createBatch = async (batchData, token = null) => {
    return fetchWithAuth('/classes/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
    }, token);
};

export const getBatches = async (skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/classes/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getBatch = async (id, token = null) => {
    return fetchWithAuth(`/classes/${id}`, {}, token);
};

export const updateBatch = async (id, batchData, token = null) => {
    return fetchWithAuth(`/classes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
    }, token);
};

export const deleteBatch = async (id, token = null) => {
    return fetchWithAuth(`/classes/${id}`, {
        method: 'DELETE',
    }, token);
};

export const getBatchMembers = async (batchId, skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/classes/${batchId}/members/?skip=${skip}&limit=${limit}`, {}, token);
};


// Chat API
let chatsCache = null;

export const getCachedChats = () => chatsCache;

export const getChats = async (skip = 0, limit = 100, token = null) => {
    const data = await fetchWithAuth(`/chats/?skip=${skip}&limit=${limit}`, {}, token);
    chatsCache = data;
    chatsCache = data;
    return data;
};

export const createChat = async (chatData, token = null) => {
    return fetchWithAuth('/chats/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
    }, token);
};

export const uploadChatResource = async (chatId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth(`/chats/${chatId}/resources`, {
        method: 'POST',
        body: formData, // No Content-Type header needed, browser sets it for FormData
    });
};

export const getMessages = async (chatId, skip = 0, limit = 50, token = null) => {
    return fetchWithAuth(`/chats/${chatId}/messages?skip=${skip}&limit=${limit}`, {}, token);
};

export const sendMessage = async (chatId, messageData, token = null) => {
    return fetchWithAuth(`/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
    }, token);
};

export const markMessageRead = async (chatId, messageId, token = null) => {
    return fetchWithAuth(`/chats/${chatId}/messages/${messageId}/read`, {
        method: 'POST',
    }, token);
};

export const assignTeacherToCourse = async (teacherId, courseId, token = null) => {
    return fetchWithAuth('/teacher-courses/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId, course_id: courseId }),
    }, token);
};

export const removeTeacherFromCourse = async (id, token = null) => {
    return fetchWithAuth(`/teacher-courses/${id}`, {
        method: 'DELETE',
    }, token);
};

export const getTeacherCourses = async (teacherId, skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/teacher-courses/teacher/${teacherId}?skip=${skip}&limit=${limit}`, {}, token);
};

// Teacher Time Slots API
export const createBulkTimeSlots = async (slotData, token = null) => {
    return fetchWithAuth('/teacher-slots/bulk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
    }, token);
};

export const getTeachersByCourse = async (courseId, token = null) => {
    return fetchWithAuth(`/teacher-courses/course/${courseId}`, {}, token);
};

export const getTeacherTimeSlots = async (teacherId, token = null) => {
    let url = `/teacher-slots/?teacher_id=${teacherId}`;
    return fetchWithAuth(url, {}, token);
};

export const deleteTimeSlot = async (slotId, token = null) => {
    return fetchWithAuth(`/teacher-slots/${slotId}`, {
        method: 'DELETE',
    }, token);
};

// Enrollment API
export const enrollInCourse = async (enrollmentData, token = null) => {
    return fetchWithAuth('/enrollments/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
    }, token);
};

export const getMyEnrollments = async (token = null) => {
    return fetchWithAuth('/enrollments/', {}, token);
};

export const checkEnrollmentStatus = async (courseId, token = null) => {
    return fetchWithAuth(`/enrollments/${courseId}/status`, {}, token);
};

export const generateMeetingLink = async (meetingData, token = null) => {
    return fetchWithAuth('/meetings/generate-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
    }, token);
};

// Class Session API

export const createClassSession = async (sessionData, token = null) => {
    return fetchWithAuth('/class-sessions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
    }, token);
};

export const getClassSessionsByBatch = async (batchId, skip = 0, limit = 100, token = null) => {
    return fetchWithAuth(`/class-sessions/by-batch/${batchId}?skip=${skip}&limit=${limit}`, {}, token);
};

export const getBatchResources = async (batchId) => {
    const response = await api.get(`/classes/${batchId}/resources`);
    return response; // api.get already returns json body or response.data depending on implementation, but fetchWithAuth returns response.json()
    // Wait, let's double check api.get implementation above.
    // api.get calls fetchWithAuth. fetchWithAuth returns response.json().
    // So 'response' here IS the data (the array).
};

const api = {
    get: (url, options = {}, token = null) => fetchWithAuth(url, { ...options, method: 'GET' }, token),
    post: (url, data, options = {}, token = null) => fetchWithAuth(url, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: JSON.stringify(data)
    }, token),
    put: (url, data, options = {}, token = null) => fetchWithAuth(url, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: JSON.stringify(data)
    }, token),
    delete: (url, options = {}, token = null) => fetchWithAuth(url, { ...options, method: 'DELETE' }, token),
};

export default api;

