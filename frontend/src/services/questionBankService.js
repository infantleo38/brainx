import api from './api';

const questionBankService = {
    /**
     * Get all questions from question bank with optional filters
     * @param {Object} filters - Filter parameters
     * @param {string} filters.category - Filter by category
     * @param {string} filters.difficulty - Filter by difficulty (Easy, Medium, Hard)
     * @param {string} filters.question_type - Filter by question type
     * @param {number} filters.course_id - Filter by course ID
     * @param {string} filters.search - Search in question text
     */
    getAllQuestions: async (filters = {}) => {
        try {
            console.log('questionBankService.getAllQuestions called with filters:', filters);

            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.question_type) params.append('question_type', filters.question_type);
            if (filters.course_id) params.append('course_id', filters.course_id);
            if (filters.search) params.append('search', filters.search);

            const url = `/question-bank/?${params.toString()}`;
            console.log('Calling API with URL:', url);

            const response = await api.get(url);
            console.log('questionBankService received response:', response);
            console.log('Response type:', typeof response);
            console.log('Response is null?', response === null);
            console.log('Response is undefined?', response === undefined);

            return response;
        } catch (error) {
            console.error('Error in questionBankService.getAllQuestions:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    },

    /**
     * Get a specific question by ID
     * @param {string} questionId - Question ID
     * @param {number} assessmentId - Assessment ID where question belongs
     */
    getQuestionById: async (questionId, assessmentId) => {
        try {
            const response = await api.get(`/question-bank/${questionId}?assessment_id=${assessmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching question:', error);
            throw error;
        }
    }
};

export default questionBankService;
