import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, CheckCircle, LogOut, Plus, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import api from '../api';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '' });

    // Assignment states
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);

    // Grading states
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        if (activeTab === 'courses') fetchCourses();
        if (activeTab === 'assignments' && selectedCourseId) fetchAssignments(selectedCourseId);
        if (activeTab === 'grading' && selectedAssignmentId) fetchSubmissions(selectedAssignmentId);
    }, [activeTab, selectedCourseId, selectedAssignmentId]);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/teacher/courses');
            setCourses(res.data);
            if (res.data.length > 0 && !selectedCourseId) {
                setSelectedCourseId(res.data[0].id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchAssignments = async (courseId) => {
        try {
            const res = await api.get(`/teacher/courses/${courseId}/assignments`);
            setAssignments(res.data);
            if (res.data.length > 0 && !selectedAssignmentId) {
                setSelectedAssignmentId(res.data[0].id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const res = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
            setSubmissions(res.data);
        } catch (err) { console.error(err); }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/courses', newCourse);
            setIsCreateCourseModalOpen(false);
            setNewCourse({ title: '', description: '' });
            fetchCourses();
        } catch (err) { console.error(err); }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await api.post(`/teacher/courses/${selectedCourseId}/assignments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsCreateAssignmentModalOpen(false);
            fetchAssignments(selectedCourseId);
        } catch (err) { console.error(err); }
    };

    const handleGradeSubmission = async (submissionId, e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            marksReceived: parseInt(formData.get('marksReceived')),
            totalMarks: parseInt(formData.get('totalMarks')),
            feedback: formData.get('feedback')
        };
        try {
            await api.post(`/teacher/submissions/${submissionId}/grade`, payload);
            fetchSubmissions(selectedAssignmentId);
        } catch (err) { console.error(err); }
    };

    const handleAddStudent = async (e, courseId) => {
        e.preventDefault();
        const studentUsername = new FormData(e.target).get('studentUsername');
        try {
            await api.post(`/teacher/courses/${courseId}/students`, { studentUsername });
            alert('Student added successfully!');
        } catch (err) {
            alert(err.response?.data || 'Failed to add student');
        }
    }

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
                        <BookOpen size={20} /> Courses
                    </button>
                    <button
                        className={`nav-link w-full text-left bg-transparent border-none cursor-pointer ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        <FileText size={20} /> Assignments
                    </button>
                    <button
                        className={`nav-link w-full text-left bg-transparent border-none cursor-pointer ${activeTab === 'grading' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grading')}
                    >
                        <CheckCircle size={20} /> Grading Hub
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
                        {activeTab === 'courses' && 'My Courses'}
                        {activeTab === 'assignments' && 'Assignment Management'}
                        {activeTab === 'grading' && 'Grading Hub'}
                    </h1>
                    <div className="user-profile">
                        <span className="text-muted">Welcome, {user?.name}</span>
                        <div className="avatar">{user?.name.charAt(0).toUpperCase()}</div>
                    </div>
                </header>

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div>
                        <button className="btn-primary mb-6 max-w-xs" onClick={() => setIsCreateCourseModalOpen(true)}>
                            <Plus size={20} /> Create New Course
                        </button>

                        <div className="card-grid">
                            {courses.map(course => (
                                <div key={course.id} className="card">
                                    <h3 className="card-title">{course.title}</h3>
                                    <p className="card-desc">{course.description}</p>

                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <h4 className="text-sm font-semibold mb-2">Add Student</h4>
                                        <form onSubmit={(e) => handleAddStudent(e, course.id)} className="flex gap-2">
                                            <input name="studentUsername" placeholder="Student Username" className="input-field py-1 px-2 text-sm flex-1" required />
                                            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">+</button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && <p className="text-muted">You haven't created any courses yet.</p>}
                        </div>
                    </div>
                )}

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                    <div>
                        <div className="mb-6 flex gap-4 items-end">
                            <div className="flex-1 max-w-xs">
                                <label className="block text-sm text-gray-400 mb-2">Select Course</label>
                                <select
                                    className="input-field select-field"
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="" disabled>Select a course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <button
                                className="btn-primary flex-none w-auto px-6 h-12"
                                onClick={() => setIsCreateAssignmentModalOpen(true)}
                                disabled={!selectedCourseId}
                            >
                                <Plus size={20} /> Create Assignment
                            </button>
                        </div>

                        {selectedCourseId ? (
                            <div className="card-grid">
                                {assignments.map(assign => (
                                    <div key={assign.id} className="card">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="card-title mb-0">{assign.title}</h3>
                                            <span className="badge badge-warning">Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <p className="card-desc mt-2">{assign.description}</p>
                                        {assign.fileUrl && (
                                            <a href={`http://localhost:8080${assign.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                                                <FileText size={16} /> View Attached PDF
                                            </a>
                                        )}
                                    </div>
                                ))}
                                {assignments.length === 0 && <div className="text-muted flex items-center gap-2"><AlertCircle size={20} /> No assignments found for this course.</div>}
                            </div>
                        ) : (
                            <p className="text-muted">Please select a course to view assignments.</p>
                        )}
                    </div>
                )}

                {/* Grading Tab */}
                {activeTab === 'grading' && (
                    <div>
                        <div className="mb-6 max-w-md">
                            <label className="block text-sm text-gray-400 mb-2">Select Assignment to Grade</label>
                            <select
                                className="input-field select-field"
                                value={selectedAssignmentId}
                                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                            >
                                <option value="" disabled>Select an assignment</option>
                                {assignments.map(a => <option key={a.id} value={a.id}>{a.title} ({new Date(a.dueDate).toLocaleDateString()})</option>)}
                            </select>
                        </div>

                        {selectedAssignmentId && submissions.length > 0 ? (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Submission Date</th>
                                            <th>File</th>
                                            <th>Status</th>
                                            <th>Action/Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map(sub => (
                                            <tr key={sub.id}>
                                                <td>{sub.student.name}</td>
                                                <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                                                <td>
                                                    <a href={`http://localhost:8080${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                                        <FileText size={16} /> View PDF
                                                    </a>
                                                </td>
                                                <td>
                                                    {sub.graded ?
                                                        <span className="badge badge-success">Graded ({sub.marksReceived}/{sub.totalMarks})</span> :
                                                        <span className="badge badge-warning">Pending</span>
                                                    }
                                                </td>
                                                <td>
                                                    {!sub.graded ? (
                                                        <form onSubmit={(e) => handleGradeSubmission(sub.id, e)} className="flex items-center gap-2">
                                                            <input type="number" name="marksReceived" placeholder="Marks" className="input-field py-1 px-2 w-20 text-sm" required min="0" />
                                                            <span className="text-muted">/</span>
                                                            <input type="number" name="totalMarks" placeholder="Total" className="input-field py-1 px-2 w-20 text-sm" required min="1" defaultValue="100" />
                                                            <input type="text" name="feedback" placeholder="Feedback (Optional)" className="input-field py-1 px-2 flex-1 text-sm" />
                                                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors text-sm">Submit</button>
                                                        </form>
                                                    ) : (
                                                        <span className="text-muted text-sm">{sub.feedback || "No feedback provided."}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : selectedAssignmentId ? (
                            <div className="text-muted flex items-center gap-2 bg-slate-800 p-4 rounded-xl max-w-md"><AlertCircle size={20} /> No submissions yet.</div>
                        ) : (
                            <p className="text-muted">Select an assignment to view submissions.</p>
                        )}
                    </div>
                )}
            </main>

            {/* Create Course Modal */}
            {isCreateCourseModalOpen && (
                <div className="modal-overlay animate-fade-in" onClick={() => setIsCreateCourseModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create New Course</h2>
                            <button className="close-btn" onClick={() => setIsCreateCourseModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateCourse}>
                            <div className="input-group">
                                <label>Course Title</label>
                                <input
                                    className="input-field"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    className="input-field min-h-[100px]"
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" className="btn-secondary px-6 py-2 rounded-lg" onClick={() => setIsCreateCourseModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-auto px-6 py-2">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {isCreateAssignmentModalOpen && (
                <div className="modal-overlay animate-fade-in" onClick={() => setIsCreateAssignmentModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Assignment</h2>
                            <button className="close-btn" onClick={() => setIsCreateAssignmentModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateAssignment}>
                            <div className="input-group">
                                <label>Assignment Title</label>
                                <input name="title" className="input-field" required />
                            </div>
                            <div className="input-group">
                                <label>Description / Instructions</label>
                                <textarea name="description" className="input-field min-h-[80px]" required />
                            </div>
                            <div className="flex gap-4">
                                <div className="input-group flex-1">
                                    <label>Start Date</label>
                                    <input type="datetime-local" name="startDate" className="input-field" required />
                                </div>
                                <div className="input-group flex-1">
                                    <label>Due Date</label>
                                    <input type="datetime-local" name="dueDate" className="input-field" required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Attachment (PDF optional)</label>
                                <input type="file" name="file" className="input-field" accept="application/pdf,image/*" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" className="btn-secondary px-6 py-2 rounded-lg" onClick={() => setIsCreateAssignmentModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary w-auto px-6 py-2">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
