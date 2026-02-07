export const calendarData = {
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dates: [
        { day: 29, currentMonth: false },
        { day: 30, currentMonth: false },
        { day: 1, currentMonth: true, status: 'present' },
        { day: 2, currentMonth: true, status: 'no-class' },
        { day: 3, currentMonth: true, status: 'present' },
        { day: 4, currentMonth: true, status: 'present' },
        { day: 5, currentMonth: true, status: 'no-class' },
        { day: 6, currentMonth: true, status: 'no-class' },
        { day: 7, currentMonth: true, status: 'absent' },
        { day: 8, currentMonth: true, status: 'present' },
        { day: 9, currentMonth: true, status: 'present' },
        { day: 10, currentMonth: true, status: 'present' },
        { day: 11, currentMonth: true, status: 'absent' },
        { day: 12, currentMonth: true, status: 'no-class' },
        { day: 13, currentMonth: true, status: 'no-class' },
        { day: 14, currentMonth: true, status: 'present' },
        { day: 15, currentMonth: true, status: 'present', today: true },
        { day: 16, currentMonth: true, status: 'present' },
        { day: 17, currentMonth: true, status: 'present' },
        { day: 18, currentMonth: true, status: 'present' },
        { day: 19, currentMonth: true, status: 'no-class' },
    ]
};

export const courseBreakdownData = [
    { name: 'Advanced Algorithms', percentage: 94, color: 'bg-primary', next: 'Wed, 10:00 AM • Room 402', text: 'text-primary' },
    { name: 'Database Systems', percentage: 82, color: 'bg-orange-400', next: 'Thu, 01:30 PM • Lab B', text: 'text-orange-500' },
    { name: 'UI/UX Design', percentage: 98, color: 'bg-green-500', next: 'Fri, 09:00 AM • Design Studio', text: 'text-green-500' },
    { name: 'Web Development', percentage: 88, color: 'bg-primary', next: 'Mon, 11:30 AM • Hall C', text: 'text-primary' }
];

export const attendanceHistoryData = [
    { status: 'Present', color: 'green', course: 'Advanced Algorithms', date: 'Oct 14, 2024', duration: '1h 30m', remarks: '—' },
    { status: 'Absent', color: 'red', course: 'Database Systems', date: 'Oct 11, 2024', duration: '2h 00m', remarks: 'Medical Leave' },
    { status: 'Present', color: 'green', course: 'UI/UX Design', date: 'Oct 10, 2024', duration: '1h 30m', remarks: '—' },
    { status: 'Present', color: 'green', course: 'Web Development', date: 'Oct 09, 2024', duration: '1h 00m', remarks: '—' },
];
