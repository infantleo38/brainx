import { useState, useEffect } from 'react';
import { getUsers, linkParentStudent, unlinkParentStudent, getStudentsByParent } from '../services/api';

interface User {
    id: number | string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    status?: boolean;
    [key: string]: any;
}

const Parents = () => {
    const [parents, setParents] = useState<User[]>([]);
    const [allStudents, setAllStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Manage Students Modal State
    const [selectedParent, setSelectedParent] = useState<User | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [linkedStudents, setLinkedStudents] = useState<User[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [managing, setManaging] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getUsers(0, 500); // Fetch enough users
            setParents(data.filter((u: User) => u.role === 'parent'));
            setAllStudents(data.filter((u: User) => u.role === 'student'));
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleManage = async (parent: User) => {
        setSelectedParent(parent);
        setIsManageModalOpen(true);
        setLinkedStudents([]); // Clear prev
        setManaging(true);
        try {
            const students = await getStudentsByParent(parent.id);
            setLinkedStudents(students);
        } catch (error) {
            console.error("Failed to fetch linked students", error);
        } finally {
            setManaging(false);
        }
    };

    const handleLinkStudent = async () => {
        if (!selectedStudentId || !selectedParent) return;
        setManaging(true);
        try {
            await linkParentStudent({
                parent_id: selectedParent.id,
                student_id: selectedStudentId
            });
            // Refresh linked list
            const students = await getStudentsByParent(selectedParent.id);
            setLinkedStudents(students);
            alert("Student linked successfully!");
            setSelectedStudentId('');
        } catch (error) {
            console.error("Failed to link student", error);
            alert("Failed to link student: " + (error.message || "Unknown error"));
        } finally {
            setManaging(false);
        }
    };

    const handleUnlink = async (studentId: string | number) => {
        if (!selectedParent) return;
        if (!window.confirm("Are you sure you want to remove this student from the parent?")) return;
        setManaging(true);
        try {
            await unlinkParentStudent(selectedParent.id, studentId);
            // Refresh linked list
            const students = await getStudentsByParent(selectedParent.id);
            setLinkedStudents(students);
        } catch (error: any) {
            console.error("Failed to unlink student", error);
            alert("Failed to unlink student.");
        } finally {
            setManaging(false);
        }
    };

    const filteredParents = parents.filter(p =>
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light">
            {/* Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <nav className="flex items-center text-sm">
                        <h1 className="text-base font-bold text-gray-900">Parent Management</h1>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => {
                            setSelectedParent(null);
                            setIsManageModalOpen(true);
                            setLinkedStudents([]);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-[20px]">link</span>
                        Link Parent-Student
                    </button>
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400"
                            placeholder="Search parents..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Parent Directory */}
                    <div className="bg-white rounded-[16px] shadow-deep-purple border border-gray-50 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Registered Parents</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                        <th className="px-6 py-4">Parent</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading parents...</td></tr>
                                    ) : filteredParents.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-8 text-gray-500">No parents found.</td></tr>
                                    ) : (
                                        filteredParents.map(parent => (
                                            <tr key={parent.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                                                            {parent.full_name?.charAt(0) || 'P'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{parent.full_name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600">{parent.email}</p>
                                                    <p className="text-xs text-gray-400">{parent.phone}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parent.status ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {parent.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleManage(parent)}
                                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Assign Student
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manage Students Modal */}
            {isManageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-[#120f1a]">Manage Parent-Student Links</h3>
                                {selectedParent && <p className="text-xs text-gray-500">For {selectedParent.full_name}</p>}
                            </div>
                            <button
                                onClick={() => setIsManageModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-full p-2 hover:bg-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">

                            {/* Parent Selection (if not pre-selected) */}
                            {!selectedParent && (
                                <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <label className="block text-xs font-bold text-amber-800 mb-2">Select Parent First</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                        onChange={(e) => {
                                            const parent = parents.find(p => p.id.toString() === e.target.value);
                                            if (parent) handleManage(parent);
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Choose a parent...</option>
                                        {parents.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedParent && (
                                <>
                                    {/* Link New Student */}
                                    <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <label className="block text-xs font-bold text-slate-600 mb-2">Link New Student</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={selectedStudentId}
                                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                            >
                                                <option value="">Select a student...</option>
                                                {allStudents.map(student => (
                                                    <option key={student.id} value={student.id}>{student.full_name} ({student.email})</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleLinkStudent}
                                                disabled={!selectedStudentId || managing}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                            >
                                                {managing ? '...' : 'Link'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Linked Students List */}
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 mb-3">Linked Students ({linkedStudents.length})</h4>
                                        {linkedStudents.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-4">No students linked yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {linkedStudents.map(student => (
                                                    <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                                {student.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-900">{student.full_name}</p>
                                                                <p className="text-xs text-gray-500">{student.email}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnlink(student.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Unlink"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">link_off</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Parents;
