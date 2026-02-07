export const courses = [
    {
        id: 1,
        title: "Generative AI Fundamentals",
        description: "Understand LLMs, prompt engineering, and the future of AI.",
        image: "https://brainx.b-cdn.net/php-programming-html-coding-cyberspace-concept.jpg",
        badge: { 
            text: 'Hot', 
            icon: 'local_fire_department', 
            className: 'bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1' 
        },
        rating: "4.9",
        metaText: "2.5k enrolled",
        metaClassName: "font-sans",
        provider: { name: 'Brainx Institude', className: 'font-sans' },
        price: "$199"
    },
    {
        id: 2,
        title: "Personal Finance 101",
        description: "Budgeting, investing, and tax strategies for beginners.",
        image: "https://brainx.b-cdn.net/Hands%20holding%20symbols%20of%20different%20programming%20languages.jpg",
        badge: { 
            text: 'Popular', 
            className: 'bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.7",
        metaText: "1.8k enrolled",
        metaClassName: "font-sans",
        provider: { name: 'MoneyWise', className: 'font-sans' },
        price: "$39"
    },
    {
        id: 3,
        title: "Agile Project Management",
        description: "Scrum, Kanban, and leading teams in dynamic environments.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        badge: { 
            text: 'New', 
            className: 'bg-blue-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.8",
        metaText: "1.2k enrolled",
        metaClassName: "font-sans",
        provider: { name: 'PMI Cert', className: 'font-sans' },
        price: "$89"
    },
    {
        id: 4,
        title: "Executive Leadership",
        description: "Communication, strategy, and decision making for executives.",
        image: "https://brainx.b-cdn.net/php-programming-html-coding-cyberspace-concept.jpg",
        badge: { 
            text: 'Leadership', 
            className: 'bg-purple-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.9",
        metaText: "3k enrolled",
        metaClassName: "font-sans",
        provider: { name: 'ExecEd', className: 'font-sans' },
        price: "$299"
    },
    {
        id: 5,
        title: "Modern European History",
        description: "An in-depth analysis of political and social movements from 1789.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        badge: { 
            text: 'Humanities', 
            className: 'bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' 
        },
        rating: "4.8",
        metaText: "History Dept.",
        provider: { 
            name: 'Oxford Univ.', 
            logo: 'https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg' 
        },
        price: "$499"
    },
    {
        id: 6,
        title: "Advanced Calculus",
        description: "Understanding limits, derivatives, integrals, and infinite series.",
        image: "https://brainx.b-cdn.net/php-programming-html-coding-cyberspace-concept.jpg",
        badge: { 
            text: 'Math', 
            className: 'bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' 
        },
        rating: "4.7",
        metaText: "Math Dept.",
        provider: { name: 'MIT OpenWare', shorthand: 'MIT', shorthandBg: 'bg-red-800' },
        price: "Free"
    },
    {
        id: 7,
        title: "Ethics & Society",
        description: "Exploring moral dilemmas in the modern technological landscape.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        imageFilter: "hue-rotate(45deg)",
        badge: { 
            text: 'Philosophy', 
            className: 'bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' 
        },
        rating: "4.9",
        metaText: "Philosophy Dept.",
        provider: { name: 'Yale Univ.', shorthand: 'YALE', shorthandBg: 'bg-blue-900' },
        price: "$449"
    },
    {
        id: 8,
        title: "Quantum Mechanics",
        description: "A fundamental introduction to quantum physics and wave theory.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        badge: { 
            text: 'Physics', 
            className: 'bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' 
        },
        rating: "4.6",
        metaText: "Science Dept.",
        provider: { name: 'Princeton', shorthand: 'PU', shorthandBg: 'bg-orange-700' },
        price: "$650"
    },
    {
        id: 9,
        title: "Full-Stack React",
        description: "Master modern web development with React, Node, and cloud deployment.",
        image: "https://brainx.b-cdn.net/php-programming-html-coding-cyberspace-concept.jpg",
        badge: { 
            text: 'Dev', 
            className: 'bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.9",
        metaText: "Tech Track",
        provider: { name: 'DevAcademy', shorthand: 'DEV', shorthandBg: 'bg-black' },
        price: "$89"
    },
    {
        id: 10,
        title: "Python for Data Science",
        description: "Learn to analyze data, create visualizations, and build ML models.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        badge: { 
            text: 'Data', 
            className: 'bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.7",
        metaText: "Data Science",
        provider: { name: 'PyInstitute', shorthand: 'PY', shorthandBg: 'bg-blue-600' },
        price: "$49/mo"
    },
    {
        id: 11,
        title: "Digital Growth Strategies",
        description: "SEO, SEM, and content marketing strategies for 2024.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        badge: { 
            text: 'Marketing', 
            className: 'bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.5",
        metaText: "Marketing",
        provider: { name: 'GrowthLabs', shorthand: 'MK', shorthandBg: 'bg-orange-500' },
        price: "$59"
    },
    {
        id: 12,
        title: "UI/UX Masterclass",
        description: "From wireframing to high-fidelity prototyping with Figma.",
        image: "https://brainx.b-cdn.net/php-programming-html-coding-cyberspace-concept.jpg",
        badge: { 
            text: 'Design', 
            className: 'bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "4.8",
        metaText: "Design",
        provider: { name: 'DesignCo', shorthand: 'UX', shorthandBg: 'bg-pink-500' },
        price: "$79"
    },
    {
        id: 13,
        title: "Product Design Master",
        description: "Build beautiful interfaces and seamless user experiences from scratch.",
        image: "https://brainx.b-cdn.net/Set_of_programmers_02_02.jpg",
        badge: { 
            text: 'Skilled', 
            className: 'bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' 
        },
        rating: "5.0",
        tag: { text: 'UI/UX', className: 'text-pink-600 font-mono bg-pink-50' },
        provider: { name: 'Figma Academy', shorthand: 'Fi', shorthandBg: 'bg-pink-500' },
        price: "$120"
    }
];
