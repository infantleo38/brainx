import api from '../services/api';

const assessmentsService = {
    // Create a new assessment
    createAssessment: async (data) => {
        try {
            const response = await api.post('/assessments/', data);
            return response;
        } catch (error) {
            console.error('Error creating assessment:', error);
            throw error;
        }
    },

    // Get all assessments
    getAssessments: async (params = {}) => {
        try {
            const response = await api.get('/assessments/', { params });
            return response;
        } catch (error) {
            console.error('Error fetching assessments:', error);
            throw error;
        }
    },

    // Get assessment details by ID
    getAssessmentById: async (id) => {
        try {
            const response = await api.get(`/assessments/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching assessment:', error);
            throw error;
        }
    },

    // Get assessment with full questions data
    getAssessmentWithQuestions: async (id) => {
        try {
            const response = await api.get(`/assessments/${id}/full`);
            return response;
        } catch (error) {
            console.error('Error fetching assessment with questions:', error);
            throw error;
        }
    },

    // Get assessments assigned to current student
    getStudentAssessments: async () => {
        try {
            const response = await api.get('/assessments/student/assigned');
            return response;
        } catch (error) {
            console.error('Error fetching student assessments:', error);
            throw error;
        }
    },

    // Submit assessment answers
    submitAssessment: async (id, answers) => {
        try {
            const response = await api.post(`/assessments/${id}/submit`, {
                assessment_id: id,
                answers: answers
            });
            return response;
        } catch (error) {
            console.error('Error submitting assessment:', error);
            throw error;
        }
    },

    // Get student's own submission for an assessment
    getMySubmission: async (id) => {
        try {
            const response = await api.get(`/assessments/${id}/my-submission`);
            return response;
        } catch (error) {
            console.error('Error fetching submission:', error);
            throw error;
        }
    },

    // Get all submissions for an assessment (for teachers)
    getAssessmentSubmissions: async (id) => {
        try {
            const response = await api.get(`/assessments/${id}/submissions`);
            return response;
        } catch (error) {
            console.error('Error fetching assessment submissions:', error);
            throw error;
        }
    }
};

export default assessmentsService;
