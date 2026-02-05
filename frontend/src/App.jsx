import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import RolesAccess from './pages/RolesAccess';
import LandingPage from './pages/LandingPage';
import CourseList from './pages/CourseList';
import CourseDetails from './pages/CourseDetails';

import Courses from './pages/Courses';
import Assessment from './pages/Assessment';
import AssessmentDetails from './pages/AssessmentDetails';
import CreateAssessment from './pages/CreateAssessment';

import Layout from './components/Layout';
import CreateCourse from './pages/CreateCourse';
import CreateClass from './pages/CreateClass';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourseDetails from './pages/student/StudentCourseDetails';
import StudentMyCourses from './pages/student/StudentMyCourses';
import StudentAssignments from './pages/student/StudentAssignments';
import AssessmentAttempt from './pages/student/AssessmentAttempt';
import SubmissionView from './pages/student/SubmissionView';
import StudentExam from './pages/student/StudentExam';
import StudentAttendance from './pages/student/StudentAttendance';
import Teachers from './pages/Teachers';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import MeetingManagement from './pages/teacher/MeetingManagement';
import TeacherClassDetails from './pages/teacher/TeacherClassDetails';

function App() {
  return (
    <Router>
      <div className="font-display bg-background-light text-[#120f1a] antialiased">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/course-list" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Assessment Attempt - No Sidebar (Fullscreen Mode) */}
          <Route path="/student/assignments/:assignmentId/attempt" element={<AssessmentAttempt />} />
          <Route path="/student/submission/:assessmentId" element={<SubmissionView />} />

          {/* Protected Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClasses />} />
            <Route path="/teacher/classes/:courseId/details" element={<TeacherClassDetails />} />
            <Route path="/teacher/classes/:courseId/meeting" element={<MeetingManagement />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/my-courses" element={<StudentMyCourses />} />
            <Route path="/student/my-courses/:courseId" element={<StudentCourseDetails />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/exam" element={<StudentExam />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/roles" element={<RolesAccess />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/assessment/:id" element={<AssessmentDetails />} />
            <Route path="/assessment/create" element={<CreateAssessment />} />
            <Route path="/courses/create" element={<CreateCourse />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes/create" element={<CreateClass />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
