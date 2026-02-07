
export const teacherStats = [
    {
        title: "Active Students",
        value: "142",
        icon: "groups",
        change: "+12%",
        trend: "up",
        color: "primary"
    },
    {
        title: "Total Classes",
        value: "4",
        icon: "class",
        color: "primary"
    },
    {
        title: "Assignments to Grade",
        value: "28",
        icon: "assignment_turned_in",
        status: "Needs Action",
        statusColor: "amber",
        color: "primary"
    },
    {
        title: "Avg. Class Performance",
        value: "88%",
        icon: "bar_chart",
        change: "3.2%",
        trend: "up",
        color: "primary"
    }
];

export const classSchedule = [
    {
        time: "10:00",
        period: "AM",
        title: "Advanced Algorithms",
        type: "Lecture 4: Dynamic Programming",
        meta: "45 Students Present",
        status: "Live",
        isNow: true
    },
    {
        time: "02:00",
        period: "PM",
        title: "Data Structures",
        type: "Lecture 2: Binary Search Trees",
        meta: "Lab Room 302"
    },
    {
        time: "04:30",
        period: "PM",
        title: "Office Hours",
        type: "Open Session",
        meta: "Zoom Meeting ID: 492-291-001"
    }
];

export const quickActions = [
    {
        title: "Create Assignment",
        subtitle: "Set due date & rubric",
        icon: "add_circle",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        title: "Post Announcement",
        subtitle: "Notify all students",
        icon: "campaign",
        color: "text-primary",
        bgColor: "bg-purple-50"
    },
    {
        title: "Generate Report",
        subtitle: "Performance insights",
        icon: "assessment",
        color: "text-green-600",
        bgColor: "bg-green-50"
    }
];

export const performanceData = [
    { label: "A (90+)", percentage: "15%", height: "40%", color: "bg-emerald-400" },
    { label: "B (80-89)", percentage: "35%", height: "65%", color: "bg-primary" },
    { label: "C (70-79)", percentage: "25%", height: "45%", color: "bg-indigo-400" },
    { label: "D (60-69)", percentage: "15%", height: "25%", color: "bg-amber-400" },
    { label: "F (<60)", percentage: "10%", height: "15%", color: "bg-red-400" }
];

export const recentSubmissions = [
    {
        name: "Emily Chen",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwzCdEGbiSgzb6mkQY8JzP3lonBXqNXoXLJDsaPmigfu9poHengqidG76ZmnH4b-Hgkm_4wktSyp-52tEviF7t1b2Ab0MV5wONdH3e84D21ZgkMbmVJUlld33TiD57LjfYRAn9KTe4D00p2ThtjyOjVWSX_ujnGsT3w-J0H3pq0qLXaXL7kzB0u2biQLoyXlpvRssP78axJ_mN299GYmwbuC9ZB7NTxGoa77LZJdhBXabKUKvw-eH09wpcb2xhJhYLyrUQdja01Cg",
        assignment: "React Components Lab",
        timeAgo: "2h ago"
    },
    {
        name: "James Smith",
        initials: "JS",
        initialsColor: "bg-purple-100 text-primary",
        assignment: "Algorithm Efficiency Report",
        timeAgo: "4h ago"
    },
    {
        name: "Michael Ross",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6LtHevqr913uhOdNb0ilta-ZIo0SUiold6DL4-UO1Eh5mIxHdfg7Rk5-dV04G6nLHR4Hl5c8HjQJHq4CtTqBoYte5eijy7lusf20zxjsy2CCf_YlDzazeHyu_d9FbUOh4EdH2c-3xkCmEe2GbXPZe5fvMl4Q6G22XTmyBtY8Xh9xb8Pk08jkQsVcGHmlrVd3gvoJhnXZsEt-8OBowp4XdH7hHM3RRJNRDjGjMu-NMdMVIEwbsFPdPPWeoOqD-14oYugvvfqyVQgU",
        assignment: "Database Schema Design",
        timeAgo: "1d ago"
    },
    {
        name: "Alicia Keys",
        initials: "AK",
        initialsColor: "bg-blue-100 text-blue-600",
        assignment: "UX Case Study",
        timeAgo: "1d ago"
    }
];
