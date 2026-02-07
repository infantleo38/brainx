export const dashboardMetrics = [
    { title: "Total Courses", value: "6", icon: "menu_book", color: "blue", borderColor: "blue" },
    { title: "Assignments Due", value: "4", icon: "assignment_late", color: "orange", borderColor: "orange" },
    { title: "Attendance", value: "92%", icon: "person_check", color: "green", borderColor: "green" },
    { title: "Current GPA", value: "3.8", icon: "grade", color: "primary", borderColor: "primary", isPrimary: true }
];

export const courseProgressData = [
    {
        title: "Advanced Algorithms",
        instructor: "Prof. Davidson",
        progress: 75,
        icon: "code",
        color: "bg-primary"
    },
    {
        title: "Database Systems",
        instructor: "Dr. Emily Chen",
        progress: 42,
        icon: "database",
        color: "bg-orange-400"
    },
    {
        title: "UI/UX Design Principles",
        instructor: "Sarah Miller",
        progress: 88,
        icon: "design_services",
        color: "bg-green-500"
    }
];

export const deadlinesData = [
    {
        title: "Algorithm Analysis Paper",
        course: "Advanced Algorithms",
        time: "Today, 11:59 PM",
        color: "red"
    },
    {
        title: "SQL Quiz 3",
        course: "Database Systems",
        time: "Tomorrow, 10:00 AM",
        color: "orange"
    },
    {
        title: "Prototype Submission",
        course: "UI/UX Design",
        time: "Oct 24, 5:00 PM",
        color: "primary"
    }
];

export const scheduleData = [
    {
        time: "10:00",
        period: "AM",
        subject: "Web Development",
        room: "Lab 304"
    },
    {
        time: "01:30",
        period: "PM",
        subject: "Data Structures",
        room: "Hall B"
    }
];

export const announcementsData = [
    {
        color: "blue",
        time: "2 hours ago",
        text: "Campus library will be closed this Sunday for maintenance."
    },
    {
        color: "purple",
        time: "Yesterday",
        text: "Registration for next semester electives opens on Monday."
    },
    {
        color: "gray",
        time: "Oct 20",
        text: "New internship opportunities added to the career portal."
    }
];
