export const sampleTaskData = [
{
    id: 1,
    title: "Design Home Page UI",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet efficitur diam. Aliquam dui ipsum, molestie id auctor sed, ultrices vitae ante.",
    created_at: "Dec 9, 2025",
    due_date: "Dec 12, 2025",
    priority: "High",
    status: "In Progress",
    project: 'Project DB',
    tags: [
    { id: "t1", color: "#EF4444", name: "Backend" },
    { id: "t2", color: "#3B82F6", name: "API" },
    ],
    users: [
    { id: 1, name: "Ryan Dev", color: "#F59E0B" },
    { id: 2, name: "John Doe", color: "#10B981" },
    { id: 3, name: "Alice Smith", color: "#6366F1" },
    ],
},
{
    id: 2,
    title: "Setup MongoDB Database",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet efficitur diam. Aliquam dui ipsum, molestie id auctor sed, ultrices vitae ante.",
    created_at: "Dec 9, 2025",
    due_date: "Dec 15, 2025",
    priority: "Medium",
    status: "To Do",
    project: 'Dunzo',
    tags: [
    { id: "t3", color: "#8B5CF6", name: "Design" },
    { id: "t6", color: "#EC4899", name: "Mobile" }, // Green (e.g., Backend)
    ],
    users: [
    { id: 1, name: "Ryan Dev", color: "#F59E0B" },
    { id: 4, name: "Sarah Connor", color: "#EC4899" },
    ],
},
{
    id: 3,
    title: "Fix Authentication Bug",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet efficitur diam. Aliquam dui ipsum, molestie id auctor sed, ultrices vitae ante.",
    created_at: "Dec 9, 2025",
    due_date: "Dec 10, 2025",
    priority: "High",
    status: "Done",
    project: 'NavCIT',
    tags: [
    { id: "t4", color: "#F97316", name: "Bug" },
    ],
    users: [
    { id: 2, name: "John Doe", color: "#10B981" },
    ],
},
{
    id: 4,
    title: "Weekly Team Meeting",
    created_at: "Dec 9, 2025",
    due_date: "Dec 20, 2025",
    priority: "Low",
    status: "Archived",
    project: 'General',
    tags: [
    { id: "t5", color: "#6B7280", name: "Meeting" },
    ],
    // Adding many users to test your "+N" logic
    users: [
    { id: 1, name: "Ryan Dev", color: "#F59E0B" },
    { id: 2, name: "John Doe", color: "#10B981" },
    { id: 3, name: "Alice Smith", color: "#6366F1" },
    { id: 4, name: "Sarah Connor", color: "#EC4899" },
    { id: 5, name: "Mike Ross", color: "#EF4444" },
    { id: 6, name: "Harvey Specter", color: "#3B82F6" },
    { id: 7, name: "Louis Litt", color: "#8B5CF6" },
    ],
},
];