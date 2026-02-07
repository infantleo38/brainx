export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const getWebSocketUrl = (chatId: string | number) => {
    return API_BASE_URL.replace('http', 'ws').replace('https', 'wss') + `/chats/${chatId}/ws`;
};

const getAuthHeaders = (token: string | null = null) => {
    const accessToken = token || localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    };
};

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
    params?: Record<string, any>;
}

const fetchWithAuth = async (url: string, options: FetchOptions = {}, token: string | null = null) => {
    const headers: Record<string, string> = {
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

export const updateUserProfile = async (userData: any, token: string | null = null) => {
    const response = await fetchWithAuth('/users/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
    return response.data; // Assuming API follows a standard response structure
};

export const uploadProfileImage = async (file: File, token: string | null = null) => {
    const formData = new FormData();
    formData.append('file', file);

    // fetchWithAuth now handles FormData correctly by removing Content-Type header
    const response = await fetchWithAuth('/uploads/profile-image', {
        method: 'POST',
        body: formData,
    }, token);
    return response.data;
};



export const signup = async (userData: any) => {
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

export const login = async (credentials: any) => {
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

export const getRoles = async (skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/roles/?skip=${skip}&limit=${limit}`, {}, token);
};

export const createRole = async (roleData: any, token: string | null = null) => {
    return fetchWithAuth('/roles/', {
        method: 'POST',
        body: JSON.stringify(roleData),
    }, token);
};

export const updateRole = async (id: string | number, roleData: any, token: string | null = null) => {
    return fetchWithAuth(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
    }, token);
};

export const deleteRole = async (id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/roles/${id}`, {
        method: 'DELETE',
    }, token);
};

export const updateRolePermissions = async (roleId: string | number, permissions: any, token: string | null = null) => {
    return fetchWithAuth(`/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissions),
    }, token);
};


let userCache: any = null;

export const getCachedUser = () => userCache;

export const getCurrentUser = async (token: string | null = null) => {
    const response = await fetchWithAuth('/users/me', {}, token);
    userCache = response.data;
    return response.data; // APIResponse wrapper returns data field
};

export const getCategories = async (skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/courses/categories/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getProviders = async (skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/providers/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getBadges = async (skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/course-badges/?skip=${skip}&limit=${limit}`, {}, token);
};

export const createProvider = async (providerData: any, token: string | null = null) => {
    return fetchWithAuth('/providers/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData),
    }, token);
};

export const createBadge = async (badgeData: any, token: string | null = null) => {
    return fetchWithAuth('/course-badges/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
    }, token);
};

export const createCourse = async (courseData: any, token: string | null = null) => {
    return fetchWithAuth('/courses/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
    }, token);
};

export const getCourses = async (skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/courses/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getCourse = async (id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/courses/${id}`, {}, token);
};

export const getUsers = async (skip = 0, limit = 100, token: string | null = null) => {
    const response = await fetchWithAuth(`/users/?skip=${skip}&limit=${limit}`, {}, token);
    return response.data;
};

export const searchUsers = async (query: string, skip = 0, limit = 100, token: string | null = null) => {
    const response = await fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`, {}, token);
    return response.data;
};

export const updateUser = async (id: string | number, userData: any, token: string | null = null) => {
    const response = await fetchWithAuth(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
    return response.data;
};

export const deleteUser = async (id: string | number, token: string | null = null) => {
    const response = await fetchWithAuth(`/users/${id}`, {
        method: 'DELETE',
    }, token);
    return response.data;
};

// Batch API
export const createBatch = async (batchData: any, token: string | null = null) => {
    return fetchWithAuth('/classes/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
    }, token);
};

export const getBatches = async (skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/classes/?skip=${skip}&limit=${limit}`, {}, token);
};

export const getBatch = async (id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/classes/${id}`, {}, token);
};

export const updateBatch = async (id: string | number, batchData: any, token: string | null = null) => {
    return fetchWithAuth(`/classes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
    }, token);
};

export const deleteBatch = async (id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/classes/${id}`, {
        method: 'DELETE',
    }, token);
};

export const getBatchMembers = async (batchId: string | number, skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/classes/${batchId}/members/?skip=${skip}&limit=${limit}`, {}, token);
};


// Chat API
let chatsCache: any = null;

export const getCachedChats = () => chatsCache;

export const getChats = async (skip = 0, limit = 100, token: string | null = null) => {
    const data = await fetchWithAuth(`/chats/?skip=${skip}&limit=${limit}`, {}, token);
    chatsCache = data;
    return data;
};

export const createChat = async (chatData: any, token: string | null = null) => {
    return fetchWithAuth('/chats/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
    }, token);
};

export const uploadChatResource = async (chatId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth(`/chats/${chatId}/resources`, {
        method: 'POST',
        body: formData, // No Content-Type header needed, browser sets it for FormData
    });
};

export const getMessages = async (chatId: string | number, skip = 0, limit = 50, token: string | null = null) => {
    return fetchWithAuth(`/chats/${chatId}/messages?skip=${skip}&limit=${limit}`, {}, token);
};

export const sendMessage = async (chatId: string | number, messageData: any, token: string | null = null) => {
    return fetchWithAuth(`/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
    }, token);
};

export const markMessageRead = async (chatId: string | number, messageId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/chats/${chatId}/messages/${messageId}/read`, {
        method: 'POST',
    }, token);
};

export const assignTeacherToCourse = async (teacherId: string | number, courseId: string | number, token: string | null = null) => {
    return fetchWithAuth('/teacher-courses/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId, course_id: courseId }),
    }, token);
};

export const removeTeacherFromCourse = async (id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/teacher-courses/${id}`, {
        method: 'DELETE',
    }, token);
};

export const getTeacherCourses = async (teacherId: string | number, skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/teacher-courses/teacher/${teacherId}?skip=${skip}&limit=${limit}`, {}, token);
};

// Teacher Time Slots API
export const createBulkTimeSlots = async (slotData: any, token: string | null = null) => {
    return fetchWithAuth('/teacher-slots/bulk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
    }, token);
};

export const getTeachersByCourse = async (courseId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/teacher-courses/course/${courseId}`, {}, token);
};

export const getTeacherTimeSlots = async (teacherId: string | number, token: string | null = null) => {
    const url = `/teacher-slots/?teacher_id=${teacherId}`;
    return fetchWithAuth(url, {}, token);
};

export const deleteTimeSlot = async (slotId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/teacher-slots/${slotId}`, {
        method: 'DELETE',
    }, token);
};

// Enrollment API
export const enrollInCourse = async (enrollmentData: any, token: string | null = null) => {
    return fetchWithAuth('/enrollments/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData),
    }, token);
};

export const getMyEnrollments = async (token: string | null = null) => {
    return fetchWithAuth('/enrollments/', {}, token);
};

export const checkEnrollmentStatus = async (courseId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/enrollments/${courseId}/status`, {}, token);
};

export const generateMeetingLink = async (meetingData: any, token: string | null = null) => {
    return fetchWithAuth('/meetings/generate-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
    }, token);
};

// Class Session API

export const createClassSession = async (sessionData: any, token: string | null = null) => {
    return fetchWithAuth('/class-sessions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
    }, token);
};

export const getClassSessionsByBatch = async (batchId: string | number, skip = 0, limit = 100, token: string | null = null) => {
    return fetchWithAuth(`/class-sessions/by-batch/${batchId}?skip=${skip}&limit=${limit}`, {}, token);
};

export const getBatchResources = async (batchId: string | number) => {
    const response = await api.get(`/classes/${batchId}/resources`);
    return response;
};

const api = {
    get: async (url: string, options: FetchOptions = {}, token: string | null = null) => {
        console.log('API GET called:', url);
        let fullUrl = url;
        if (options.params) {
            const queryParams = new URLSearchParams(options.params).toString();
            fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
            // We don't delete options.params because options is passed by reference potentially or reused, 
            // but fetchWithAuth ignores extra properties in options anyway as it spreads them into fetch options, 
            // and fetch ignores unknown options. However, to be clean:
            const { params, ...fetchOptions } = options;
            const result = await fetchWithAuth(fullUrl, { ...fetchOptions, method: 'GET' }, token);
            console.log('API GET result:', result);
            return result;
        }
        const result = await fetchWithAuth(url, { ...options, method: 'GET' }, token);
        console.log('API GET result:', result);
        return result;
    },
    post: (url: string, data: any, options: FetchOptions = {}, token: string | null = null) => fetchWithAuth(url, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: JSON.stringify(data)
    }, token),
    put: (url: string, data: any, options: FetchOptions = {}, token: string | null = null) => fetchWithAuth(url, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: JSON.stringify(data)
    }, token),
    delete: (url: string, options: FetchOptions = {}, token: string | null = null) => fetchWithAuth(url, { ...options, method: 'DELETE' }, token),
};

export const submitAttendance = async (payload: any, token: string | null = null) => {
    // payload should contain: { session_id, batch_id, date, records }
    // For session-based: session_id required
    // For date-based: batch_id and date required, session_id can be null
    return fetchWithAuth('/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }, token);
};

export const getSessionAttendance = async (session_id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/attendance/session/${session_id}`, {}, token);
};

export const getStudentAttendance = async (student_id: string | number, token: string | null = null) => {
    return fetchWithAuth(`/attendance/student/${student_id}`, {}, token);
};

export const linkParentStudent = async (data: any, token: string | null = null) => {
    return fetchWithAuth('/parent-student/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }, token);
};

export const unlinkParentStudent = async (parentId: string | number, studentId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/parent-student/?parent_id=${parentId}&student_id=${studentId}`, {
        method: 'DELETE',
    }, token);
};

export const getStudentsByParent = async (parentId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/parent-student/students/${parentId}`, {}, token);
};

export const getParentsByStudent = async (studentId: string | number, token: string | null = null) => {
    return fetchWithAuth(`/parent-student/parents/${studentId}`, {}, token);
};

export default api;
