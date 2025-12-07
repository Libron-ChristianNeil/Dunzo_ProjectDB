export const projectSampleData = [
{
    //general no team
    id: 0,
    name: "General",
    // Hex Color: Dark Orange
    color: "#FF8C00", 
    startDate: "",
    endDate: "",
    desc: "For your general projects and unassigned tasks.",
    numTask: 45,
    numComplete: 32,
    numMembers: 0,
    percentage: 71, 
    status: "Active",
    members: [
    ]
},
{
    id: 1,
    name: "Mobile App Redesign",
    // Hex Color: Royal Purple
    color: "#5D3FD3", 
    startDate: "Jan 10, 2024",
    endDate: "Mar 15, 2024",
    desc: "Revamping the UX/UI for the main iOS and Android application.",
    numTask: 45,
    numComplete: 32,
    numMembers: 8,
    percentage: 71, 
    status: "Active",
    members: [
    { id: 101, name: "Alice Johnson", avatarColor: "#10B981" }, // Emerald 500
    { id: 102, name: "Bob Smith", avatarColor: "#EF4444" }, // Red 500
    { id: 103, name: "Charlie Davis", avatarColor: "#F97316" }, // Orange 500
    { id: 104, name: "Dana Scully", avatarColor: "#8B5CF6" }, // Purple 500
    { id: 105, name: "Edgar Vance", avatarColor: "#06B6D4" }, // Cyan 500
    ]
},
{
    id: 2,
    name: "Marketing Website",
    // Hex Color: Dark Turquoise
    color: "#00CED1",
    startDate: "Nov 01, 2023",
    endDate: "Jan 20, 2024",
    desc: "SEO optimization and landing page overhaul for Q1 campaign.",
    numTask: 20,
    numComplete: 20,
    numMembers: 4,
    percentage: 100,
    status: "Completed",
    members: [
    { id: 201, name: "David Wilson", avatarColor: "#06B6D4" }, // Cyan 500
    { id: 202, name: "Eva Green", avatarColor: "#F59E0B" }, // Amber 500
    { id: 203, name: "Finley Reese", avatarColor: "#84CC16" }, // Lime 500
    ]
},
{
    id: 3,
    name: "Internal Dashboard",
    // Hex Color: Hot Pink
    color: "#FF69B4",
    startDate: "Feb 01, 2024",
    endDate: "Aug 30, 2024",
    desc: "Building analytics tools for the admin team to track sales.",
    numTask: 150,
    numComplete: 15,
    numMembers: 12,
    percentage: 10,
    status: "Active",
    members: [
    { id: 301, name: "Frank Miller", avatarColor: "#3B82F6" }, // Blue 500
    { id: 302, name: "Grace Lee", avatarColor: "#EF4444"}, // Red 500
    { id: 303, name: "Henry Ford", avatarColor: "#22C55E" }, // Green 500
    { id: 304, name: "Ivy Thomas", avatarColor: "#6B7280" }, // Gray 500
    { id: 305, name: "Jasmine Kaur", avatarColor: "#EC4899" }, // Pink 500
    { id: 306, name: "Kyle Owens", avatarColor: "#FBBF24" }, // Yellow 500
    ]
},
{
    id: 4,
    name: "Legacy Migration",
    // Hex Color: Dim Gray
    color: "#696969",
    startDate: "Jun 15, 2022",
    endDate: "Dec 10, 2022",
    desc: "Migrating old SQL databases to the new cloud infrastructure.",
    numTask: 80,
    numComplete: 80,
    numMembers: 3,
    percentage: 100,
    status: "Archived",
    members: [
    { id: 401, name: "Jack Ryan", avatarColor: "#F97316" }, // Orange 500
    { id: 402, name: "Kelly Clark", avatarColor: "#8B5CF6" }, // Purple 500
    ]
},
{
    id: 5,
    name: "Q3 Product Launch",
    // Hex Color: Forest Green
    color: "#228B22",
    startDate: "July 01, 2024",
    endDate: "Sep 30, 2024",
    desc: "Coordination of marketing, sales, and development for the new flagship product feature.",
    numTask: 60,
    numComplete: 5,
    numMembers: 10,
    percentage: 8,
    status: "Active",
    members: [
    { id: 501, name: "Liam Ness", avatarColor: "#10B981" }, // Emerald 500
    { id: 502, name: "Mia Hall", avatarColor: "#E879F9" }, // Fuchsia 400
    { id: 503, name: "Noah King", avatarColor: "#3B82F6" }, // Blue 500
    { id: 504, name: "Olivia Bell", avatarColor: "#EF4444" }, // Red 500
    { id: 505, name: "Peter Vance", avatarColor: "#22C55E" }, // Green 500
    ]
},
{
    id: 6,
    name: "HR Onboarding Portal",
    // Hex Color: Dodger Blue
    color: "#1E90FF",
    startDate: "May 10, 2024",
    endDate: "Oct 25, 2024",
    desc: "Developing a self-service portal for new employee documentation and training.",
    numTask: 35,
    numComplete: 35,
    numMembers: 6,
    percentage: 100,
    status: "Completed",
    members: [
    { id: 601, name: "Quinn Adams", avatarColor: "#F97316" }, // Orange 500
    { id: 602, name: "Ryan Stone", avatarColor: "#6366F1" }, // Indigo 500
    { id: 603, name: "Sara Trent", avatarColor: "#FBBF24" }, // Yellow 500
    ]
},
{
    id: 7,
    name: "Server Maintenance",
    // Hex Color: Brown
    color: "#A52A2A",
    startDate: "Mar 01, 2023",
    endDate: "Mar 30, 2023",
    desc: "Scheduled upgrade and patching of all production servers.",
    numTask: 12,
    numComplete: 12,
    numMembers: 2,
    percentage: 100,
    status: "Archived",
    members: [
    { id: 701, name: "Tom Hardy", avatarColor: "#6B7280" }, // Gray 500
    { id: 702, name: "Uma Thurman", avatarColor: "#84CC16" }, // Lime 500
    ]
},
{
    id: 8,
    name: "Customer Feedback System",
    // Hex Color: Gold
    color: "#FFD700",
    startDate: "April 05, 2024",
    endDate: "June 20, 2024",
    desc: "Integrating a new tool for collecting and analyzing user feedback across all platforms.",
    numTask: 90,
    numComplete: 45,
    numMembers: 7,
    percentage: 50,
    status: "On Hold",
    members: [
    { id: 801, name: "Victor Chen", avatarColor: "#3B82F6" }, // Blue 500
    { id: 802, name: "Wendy Zhao", avatarColor: "#EC4899" }, // Pink 500
    { id: 803, name: "Xavier Moon", avatarColor: "#8B5CF6" }, // Purple 500
    { id: 804, name: "Yara Lopez", avatarColor: "#EF4444" }, // Red 500
    ]
},
{
    id: 9,
    name: "API Documentation",
    // Hex Color: Teal
    color: "#008080",
    startDate: "Jan 01, 2024",
    endDate: "Dec 31, 2024",
    desc: "Writing comprehensive documentation and examples for the public-facing API.",
    numTask: 200,
    numComplete: 50,
    numMembers: 4,
    percentage: 25,
    status: "Active",
    members: [
    { id: 901, name: "Zane White", avatarColor: "#22C55E" }, // Green 500
    { id: 902, name: "Anna Smith", avatarColor: "#06B6D4" }, // Cyan 500
    ]
},

{
    id: 10,
    name: "Tuntun Dopamine Surge Project",
    color: "#000080",
    startDate: "Oct 27, 2025",
    endDate: "Nov 01, 2025",
    desc: "Deployment of the core algorithm. Must achieve hyper-virality. Focus on the core beat and simple transitions. No complex thought processes allowed. Simply: TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG TUNG.",
    numTask: 42,
    numComplete: 39,
    numMembers: 10,
    percentage: 93,
    status: "Active",
    members: [
        { id: 1001, name: "Tung Tung Tung Sahur", avatarColor: "#FF4500" },
        { id: 1002, name: "Brr Brr Patapim", avatarColor: "#00FF00" },
        { id: 1003, name: "Tralalero Tralala", avatarColor: "#4B0082" },
        { id: 1004, name: "Sahu Sahu Boom", avatarColor: "#FFFF00" },
        { id: 1005, name: "Lirilarila Pop", avatarColor: "#FF1493" },
        { id: 1006, name: "Grrrblop Blip", avatarColor: "#00FFFF" },
        { id: 1007, name: "Zing Zang Zong", avatarColor: "#800000" },
        { id: 1008, name: "Wap Wap Wop", avatarColor: "#D3D3D3" },
        { id: 1009, name: "Pum Pum Pumplin", avatarColor: "#808000" },
        { id: 1010, name: "Tee Tee Tee Tun", avatarColor: "#B0E0E6" },
    ],
}

];