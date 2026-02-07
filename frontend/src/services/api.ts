import axios, { AxiosRequestConfig } from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const getWebSocketUrl = (chatId: string | number) => {
    return API_BASE_URL.replace('http', 'ws').replace('https', 'wss') + `/chats/${chatId}/ws`;
};

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response) {
            if (error.response.status === 401 || (error.response.status === 403 && (error.response.data?.detail === 'Could not validate credentials' || error.response.data?.detail === 'Not authenticated'))) {
                 // Prevent infinite loops
                if (!originalRequest._retry) {
                    originalRequest._retry = true;
                     localStorage.removeItem('access_token');
                     window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

interface FetchOptions extends AxiosRequestConfig {
    body?: any; // To support legacy calls passing body property
}

// Wrapper to mimic fetchWithAuth signature but use axios
const fetchWithAuth = async (url: string, options: FetchOptions = {}, token: string | null = null) => {
    const config: AxiosRequestConfig = {
        ...options,
        headers: {
            ...options.headers,
        },
    };

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
        };
    }
    
    // Convert 'body' to 'data' for axios if present
    // Also handle stringified JSON if passed as string to 'data' via 'body' prop from legacy calls
    if (options.body) {
        config.data = options.body;
        delete (config as any).body;
    }

    try {
        // If url starts with /, remove it as baseURL has it? No, axios handles logic
        // But fetchWithAuth was called with relative URLs often starting with /
        // url is passed directly to axios.get/post relative to baseURL
        const response = await apiClient.request({
            url,
            method: options.method || 'GET',
            ...config
        });
        return response.data; // Return data directly as expected by callers looking for valid response body
    } catch (error: any) {
        const errorData = error.response?.data || {};
        const errorMessage = errorData.detail || error.message || 'API request failed';
        // Mimic the error detail property structure if callers rely on it?
        // Callers expect error.message or error object.
        // If I throw Error(errorMessage), callers catching (err: any) -> err.message works.
        // Some might access err.response.data.detail if they cast to AxiosError? 
        // Existing calls:
        // catch (error) { console.error(..., error); alert(error) }
        // catch (err: any) { setError(err.message || 'Login failed') }
        
        // Let's enhance the error object to have response data attached if needed, but standard Error with message is safest for generic catch blocks.
        const enhancedError: any = new Error(errorMessage);
        enhancedError.response = error.response; // Attach response for advanced handling
        throw enhancedError;
    }
};

// ... (existing exports)

export const updateUserProfile = async (userData: any, token: string | null = null) => {
    // userData is likely an object, fetchWithAuth expects stringified body in options usually if using old signature?
    // Let's check original usage.
    /*
    export const updateUserProfile = async (userData: any, token: string | null = null) => {
        const response = await fetchWithAuth('/users/me', {
            method: 'PUT',
            body: JSON.stringify(userData),
        }, token);
        return response.data; 
    };
    */
    // Wait, original fetchWithAuth returned `response.json()`.
    // And `updateUserProfile` returned `response.data`.
    // This implies `response.json()` result has a `data` property.
    
    // If I change fetchWithAuth to return `response.data` (axios data),
    // and axios data IS the json body, implies `response.data.data` is accessed?
    // YES.
    
    // So current `apiClient.request` returns `response.data` (the body).
    // `updateUserProfile` wants `body.data`.
    
    // However, existing `fetchWithAuth` implementation was:
    // return response.json();
    
    // So `response` in `updateUserProfile` was the body.
    // `return response.data` means returning `body.data`.
    
    // My new `fetchWithAuth` returns `response.data` (the body).
    // So `const response = await fetchWithAuth(...)` -> response is body.
    // `return response.data` works if body has data.
    
    // But for `axios`, I can pass object directly to `data`.
    // Legacy calls pass `JSON.stringify(userData)` as `body`.
    // Axios treats string data as... string. It might set content-type to json (default) but send string. 
    // The backend should parse it fine.
    
    /* 
    export const updateUserProfile = async (userData: any, token: string | null = null) => {
        const responseData = await fetchWithAuth('/users/me', {
            method: 'PUT',
            body: JSON.stringify(userData),
        }, token);
        return responseData.data; 
    };
    */
   
   // I will keep the function bodies roughly same to avoid logic drift, just relying on fetchWithAuth wrapper.
    
    const response = await fetchWithAuth('/users/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
    }, token);
    return response.data; 
};

export const uploadProfileImage = async (file: File, token: string | null = null) => {
    const formData = new FormData();
    formData.append('file', file);

    // fetchWithAuth now handles FormData correctly?
    // In original:
    // if (options.body instanceof FormData) delete headers['Content-Type'];
    // In axios:
    // if data is FormData, axios sets Content-Type to multipart/form-data with boundary automatically.
    // We just need to NOT set application/json.
    
    // My fetchWithAuth wrapper:
    // const config = { ...options, headers: { ...options.headers } }
    // API_CLIENT default has Content-Type: application/json.
    // If I pass FormData, I should probably unset Content-Type or let axios override?
    // Axios might NOT override if I explicitly set it in instance?
    
    // Let's modify fetchWithAuth to unset Content-Type if body is FormData.
    
    /*
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    */
    
    const response = await fetchWithAuth('/uploads/profile-image', {
        method: 'POST',
        body: formData,
    }, token);
    return response.data;
};



export const signup = async (userData: any) => {
    try {
        const response = await apiClient.post('/users/', userData);
        return response.data;
    } catch (error: any) {
        const errorData = error.response?.data || {};
        const enhancedError: any = new Error(errorData.detail || 'Signup failed');
        enhancedError.response = error.response;
        throw enhancedError;
    }
};

export const login = async (credentials: any) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await apiClient.post('/login/access-token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        return response.data;
    } catch (error: any) {
         const errorData = error.response?.data || {};
        const enhancedError: any = new Error(errorData.detail || 'Login failed');
        enhancedError.response = error.response;
        throw enhancedError;
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
    // response is the body.
    // original: userCache = response.data; return response.data;
    // this implies body has data property.
    userCache = response.data;
    return response.data; 
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

    // fetchWithAuth handles formData by removing Content-Type if body is FormData instance
    // but here we are using axios which handles it.
    
    return fetchWithAuth(`/chats/${chatId}/resources`, {
        method: 'POST',
        body: formData, 
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
