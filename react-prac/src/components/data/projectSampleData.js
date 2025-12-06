export const projectSampleData = [
{
    id: 1,
    name: "Mobile App Redesign",
    // Using standard Tailwind gradient classes
    color: "from-purple-500 to-indigo-600", 
    startDate: "Jan 10, 2024",
    endDate: "Mar 15, 2024",
    desc: "Revamping the UX/UI for the main iOS and Android application.",
    numTask: 45,
    numComplete: 32,
    numMembers: 8,
    percentage: 71, // 71%
    status: "Active",
    members: [
    { id: 101, name: "Alice Johnson", avatarColor: "bg-emerald-500" },
    { id: 102, name: "Bob Smith", avatarColor: "bg-red-500" },
    { id: 103, name: "Charlie Davis", avatarColor: "bg-orange-500" },
    ]
},
{
    id: 2,
    name: "Marketing Website",
    color: "from-blue-400 to-cyan-500",
    startDate: "Nov 01, 2023",
    endDate: "Jan 20, 2024",
    desc: "SEO optimization and landing page overhaul for Q1 campaign.",
    numTask: 20,
    numComplete: 20,
    numMembers: 4,
    percentage: 100,
    status: "Completed",
    members: [
    { id: 201, name: "David Wilson", avatarColor: "bg-cyan-500" },
    { id: 202, name: "Eva Green", avatarColor: "bg-amber-500" },
    ]
},
{
    id: 3,
    name: "Internal Dashboard",
    color: "from-orange-400 to-pink-500",
    startDate: "Feb 01, 2024",
    endDate: "Aug 30, 2024",
    desc: "Building analytics tools for the admin team to track sales.",
    numTask: 150,
    numComplete: 15,
    numMembers: 12,
    percentage: 10,
    status: "Active",
    members: [
    { id: 301, name: "Frank Miller", avatarColor: "bg-blue-500" },
    { id: 302, name: "Grace Lee", avatarColor: "bg-red-500"},
    { id: 303, name: "Henry Ford", avatarColor: "bg-green-500" },
    { id: 304, name: "Ivy Thomas", avatarColor: "bg-gray-500" },
    ]
},
{
    id: 4,
    name: "Legacy Migration",
    color: "from-gray-500 to-gray-700",
    startDate: "Jun 15, 2022",
    endDate: "Dec 10, 2022",
    desc: "Migrating old SQL databases to the new cloud infrastructure.",
    numTask: 80,
    numComplete: 80,
    numMembers: 3,
    percentage: 100,
    status: "Archived",
    members: [
    { id: 401, name: "Jack Ryan", avatarColor: "bg-orange-500" },
    { id: 402, name: "Kelly Clark", avatarColor: "bg-purple-500" },
    ]
}
];