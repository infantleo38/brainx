export const courseInfo = {
    title: "Full-Stack React Masterclass",
    description: "Master modern web development by building production-ready applications. Deep dive into the React ecosystem, Node backend patterns, and cloud deployment strategies. Perfect for developers ready to level up their career.",
    rating: 4.9,
    ratingCount: "2,403 ratings",
    tags: [
        { text: "Skilled", className: "bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-primary/30" },
        { text: "WEB.DEV", className: "text-xs text-primary font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10" }
    ]
};

export const instructors = [
    {
        id: "sarah",
        name: "Sarah Jenkins",
        title: "Senior Dev at Google",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHhuR4lFdadMsiIw2cBCRbJIL35Moj5CMS2Wipx-oYBFKquKQTjF0FfH9lzp1Xu0ugE7h2tbWxxugWGXjree0l2b_Dt2nZEsyOecDtRQNseMM29Xb3yZdw0HSXBKTgLJ9ROy6eUZ8PjbFe2pyHr0H20s6tVwmkLn6lJWY05eDe5kgxXNPDiOhHRuU1S-Doiq6DlUCs1UdYU3vyY5U2s3sUfnw6cs4mfYA-lxGJUyhGalaRyfUIhJngNjZBX41h6yp18xWA6c3Ftp4",
        skills: ["React Core", "Systems"],
        initials: null,
        initialsColor: null
    },
    {
        id: "david",
        name: "David Chen",
        title: "Ex-Meta Tech Lead",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAYRXsEzU_benZPAY0bGUlXt4RRwJloK6uUVnbtvmNqp9sVYi-rtCi3OpTCdVog6-wIVgvTSXeTKUfqDWgMTL2QNM5ytPdOi3yDM1y1BGUv1wnb-0jI8x31AGbYasfqsjIRys4AGjwvyQC7aEsBoj2WEwlDahS-Yo0evb7On8KIvIPvt_V0EWdT7Ey2TuP278_nZrJySRHs8JJQgfDGwVjUrvb0rpkXw2rcGtUOtL2Vo1-2HO_tgJQilOZQMu_ebXvoJbtDvDoWo0",
        skills: ["Testing", "OSS"],
        initials: null,
        initialsColor: null
    },
    {
        id: "elena",
        name: "Elena Martinez",
        title: "UI/UX Specialist",
        image: null,
        skills: ["Design", "CSS"],
        initials: "EM",
        initialsColor: "bg-indigo-50 text-primary"
    },
    {
        id: "michael",
        name: "Michael Park",
        title: "Cloud Architect",
        image: null,
        skills: ["AWS", "DevOps"],
        initials: "MP",
        initialsColor: "bg-indigo-50 text-primary"
    }
];

export const batches = [
    {
        id: "evening",
        name: "Evening Batch",
        title: "Mon/Wed Evenings",
        time: "6:00 PM - 8:00 PM EST",
        startDate: "Oct 15, 2024",
        icon: "dark_mode",
        iconColor: "bg-indigo-50 text-primary",
        availability: { text: "3 Left", color: "orange", icon: "local_fire_department" }
    },
    {
        id: "weekend",
        name: "Weekend Batch",
        title: "Weekend Intensive",
        time: "Sat/Sun 10:00 AM - 2:00 PM EST",
        startDate: "Oct 20, 2024",
        icon: "wb_sunny",
        iconColor: "bg-orange-50 text-orange-600",
        availability: { text: "Available", color: "green", icon: "check_circle" }
    },
    {
        id: "morning",
        name: "Morning Batch",
        title: "Early Bird (Tue/Thu)",
        time: "7:00 AM - 9:00 AM EST",
        startDate: "Nov 01, 2024",
        icon: "free_breakfast",
        iconColor: "bg-blue-50 text-blue-600",
        availability: { text: "Available", color: "green", icon: "check_circle" }
    },
    {
        id: "afternoon",
        name: "Afternoon Batch",
        title: "Afternoon Session",
        time: "Mon/Wed 2:00 PM - 4:00 PM EST",
        startDate: "Nov 15, 2024",
        icon: "wb_twilight",
        iconColor: "bg-yellow-50 text-yellow-600",
        availability: { text: "Available", color: "green", icon: "check_circle" }
    }
];

export const features = [
    "24 hours of Live Instruction",
    "Industry-recognized Certificate",
    "2x 1-on-1 Mentorship Sessions",
    "Lifetime Access to Recordings"
];
