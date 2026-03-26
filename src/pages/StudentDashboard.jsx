import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, FileText, UploadCloud, CheckCircle, LogOut, AlertCircle, Clock } from 'lucide-react';
import api, { API_BASE_URL } from '../api';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);

    // Assignment states
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    // Upload state
    const [uploadingAssignmentId, setUploadingAssignmentId] = useState(null);

    useEffect(() => {
        if (activeTab === 'courses') fetchCourses();
        if (activeTab === 'assignments' && selectedCourseId) fetchAssignments(selectedCourseId);
        if (activeTab === 'grades') fetchMySubmissions();
    }, [activeTab, selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/student/courses');
            setCourses(res.data);
            if (res.data.length > 0 && !selectedCourseId) {
                setSelectedCourseId(res.data[0].id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const res = await api.get(`/student/courses/${courseId}/assignments`);
            setAssignments(res.data);
            fetchMySubmissions(); // Need this to know which ones are already submitted
        } catch (err) { console.error(err); }
    };

    const fetchMySubmissions = async () => {
        try {
            const res = await api.get('/student/submissions');
            setSubmissions(res.data);
        } catch (err) { console.error(err); }
    };

    const handleFileUpload = async (e, assignmentId) => {
        e.preventDefault();
        const file = e.target.file.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadingAssignmentId(assignmentId);
        try {
            await api.post(`/student/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Assignment submitted successfully!');
            fetchMySubmissions();
        } catch (err) {
            alert(err.response?.data || 'Failed to submit assignment');
        } finally {
            setUploadingAssignmentId(null);
            e.target.reset();
        }
    };

    const getSubmissionForAssignment = (assignmentId) => {
        return submissions.find(sub => sub.assignment.id === assignmentId);
    };

    return (
        <div className="dashboard-layout animate-fade-in">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">AssignFlow</div>

                <nav>
                    <button
                        className={`nav-link w-full text-left bg-transparent border-none cursor-pointer ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        <BookOpen size={20} /> My Courses
                    </button>
                    <button
                        className={`nav-link w-full text-left bg-transparent border-none cursor-pointer ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        <FileText size={20} /> Assignments
                    </button>
                    <button
                        className={`nav-link w-full text-left bg-transparent border-none cursor-pointer ${activeTab === 'grades' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grades')}
                    >
                        <CheckCircle size={20} /> My Grades
                    </button>
                </nav>

                <button onClick={logout} className="logout-btn">
                    <LogOut size={20} /> Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="page-header">
                    <h1 className="page-title">
                        {activeTab === 'courses' && 'Enrolled Courses'}
                        {activeTab === 'assignments' && 'Pending Assignments'}
                        {activeTab === 'grades' && 'My Grades'}
                    </h1>
                    <div className="user-profile">
                        <span className="text-muted">Student: {user?.name}</span>
                        <div className="avatar bg-emerald-500">{user?.name.charAt(0).toUpperCase()}</div>
                    </div>
                </header>

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div className="card-grid">
                        {courses.map(course => (
                            <div key={course.id} className="card">
                                <h3 className="card-title">{course.title}</h3>
                                <p className="card-desc mb-0">{course.description}</p>
                                <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
                                    Teacher/Instructor ID: {course.teacherId || 'Assigned'}
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && <p className="text-muted">You are not enrolled in any courses yet.</p>}
                    </div>
                )}

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                    <div>
                        <div className="mb-6 max-w-xs">
                            <label className="block text-sm text-gray-400 mb-2">Filter by Course</label>
                            <select
                                className="input-field select-field"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="" disabled>Select a course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        {selectedCourseId ? (
                            <div className="card-grid">
                                {assignments.map(assign => {
                                    const submission = getSubmissionForAssignment(assign.id);
                                    const isPastDue = new Date(assign.dueDate) < new Date();

                                    return (
                                        <div key={assign.id} className="card relative overflow-hidden">
                                            {submission && <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1"><CheckCircle size={12} /> Submitted</div>}

                                            <h3 className="card-title pr-20">{assign.title}</h3>
                                            <div className="card-meta">
                                                <Clock size={16} className={isPastDue ? 'text-red-400' : 'text-emerald-400'} />
                                                <span className={isPastDue ? 'text-red-400' : ''}>Due: {new Date(assign.dueDate).toLocaleString()}</span>
                                            </div>
                                            <p className="card-desc">{assign.description}</p>

                                            {assign.fileUrl && (
                                                <a href={`${API_BASE_URL}${assign.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 mb-4">
                                                    <FileText size={16} /> View Instruction PDF
                                                </a>
                                            )}

                                            {!submission ? (
                                                <form onSubmit={(e) => handleFileUpload(e, assign.id)} className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-3">
                                                    <input type="file" name="file" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                                                    <button
                                                        type="submit"
                                                        className="btn-primary py-2 text-sm"
                                                        disabled={uploadingAssignmentId === assign.id}
                                                    >
                                                        <UploadCloud size={16} />
                                                        {uploadingAssignmentId === assign.id ? 'Uploading...' : 'Submit Assignment'}
                                                    </button>
                                                </form>
                                            ) : (
                                                <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
                                                    Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {assignments.length === 0 && <div className="text-muted flex items-center gap-2"><AlertCircle size={20} /> No assignments found for this course.</div>}
                            </div>
                        ) : (
                            <p className="text-muted">Please select a course to view assignments.</p>
                        )}
                    </div>
                )}

                {/* Grades Tab */}
                {activeTab === 'grades' && (
                    <div className="table-wrapper">
                        {submissions.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Assignment</th>
                                        <th>Status</th>
                                        <th>Grade</th>
                                        <th>Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.id}>
                                            <td>{sub.assignment.course.title}</td>
                                            <td>{sub.assignment.title}</td>
                                            <td>
                                                {sub.graded ?
                                                    <span className="badge badge-success">Graded</span> :
                                                    <span className="badge badge-warning">Under Review</span>
                                                }
                                            </td>
                                            <td>
                                                {sub.graded ?
                                                    <span className="font-semibold">{sub.marksReceived} / {sub.totalMarks}</span> :
                                                    <span className="text-muted">-</span>
                                                }
                                            </td>
                                            <td className="max-w-xs truncate" title={sub.feedback}>
                                                {sub.feedback || <span className="text-muted italic">No feedback</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-6 text-muted text-center flex items-center justify-center gap-2"><AlertCircle size={20} /> You have no submissions yet.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
