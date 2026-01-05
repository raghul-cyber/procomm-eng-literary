// src/data/eventsData.ts

export const eventsData = [
    {
        id: 1,
        title: "The Upside Down Hackathon",
        date: "Oct 28, 2024",
        location: "Hawkins Lab",
        description: "Code your way out of the alternate dimension. 24-hour survival coding challenge.",
        fullDescription: "Step into the Upside Down where logic is twisted. Participants must build a survival tool using open-source tech to escape the dimension. Expect power outages and flickering lights.",
        teamSize: "3-4 members",
        time: "9:00 AM - 9:00 AM (24 Hrs)",
        venue: "Hawkins National Lab, Level B2",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000",
        instructions: "Bring your own laptops and chargers. Sleep is optional. Coffee provided by Hopper.",
        eligibility: "Open to all departments. No telekinetic abilities required (but helpful).",
        rounds: [
            { name: "Round 1: The Gate", mode: "Online", date: "Oct 20", desc: "Algorithm sorting challenges to open the gate." },
            { name: "Round 2: Survival", mode: "Offline", date: "Oct 28", desc: "24-hour product build to close the rift." }
        ],
        coordinators: {
            student: ["Mike Wheeler - 9876543210", "Dustin Henderson - 9876543211"],
            staff: ["Mr. Clarke - 9998887776"]
        }
    },
    {
        id: 2,
        title: "Demogorgon Debugging",
        date: "Nov 02, 2024",
        location: "Arcade",
        description: "Hunt down bugs that are tearing through the firewall. Intro to cybersecurity.",
        fullDescription: "A capture-the-flag (CTF) style event. A Demogorgon virus has infected the school network. Trace the packets, decrypt the payloads, and kill the process.",
        teamSize: "2 members",
        time: "10:00 AM",
        venue: "Computer Lab 3",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000",
        instructions: "Knowledge of Linux CLI is mandatory. Do not execute live malware.",
        eligibility: "CS/IT Students only.",
        rounds: [
            { name: "Round 1: Trace", mode: "Online", date: "Oct 30", desc: "Packet analysis quiz." },
            { name: "Round 2: Exterminate", mode: "Offline", date: "Nov 02", desc: "Live CTF environment." }
        ],
        coordinators: {
            student: ["Nancy Wheeler - 8887776665"],
            staff: ["Dr. Owens - 5554443332"]
        }
    },
    {
        id: 3,
        title: "Mind Flayer AI Workshop",
        date: "Nov 10, 2024",
        location: "Starcourt Mall",
        description: "Understanding hive mind algorithms and neural networks. Don't let it control you.",
        fullDescription: "Dive deep into Neural Networks and Swarm Intelligence. Learn how the Mind Flayer controls its host and how to replicate that efficiency in Python.",
        teamSize: "Individual",
        time: "11:00 AM",
        venue: "Starcourt Mall Atrium (Seminar Hall)",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000",
        instructions: "Pre-install Python and TensorFlow. Do not connect to the hive mind.",
        eligibility: "Open to all.",
        rounds: [
            { name: "Workshop", mode: "Offline", date: "Nov 10", desc: "Hands-on session on Neural Networks." },
            { name: "Mini-Hack", mode: "Offline", date: "Nov 10", desc: "Build a mini-bot swarm simulation." }
        ],
        coordinators: {
            student: ["Will Byers - 7776665554"],
            staff: ["Bob Newby - 2223334445"]
        }
    },
    {
        id: 4,
        title: "Cerebro Radio Comms",
        date: "Nov 15, 2024",
        location: "Weathertop",
        description: "Building long-range HAM radios. Learn to communicate across the void.",
        fullDescription: "Build your own 'Cerebro' using Arduino and RF modules. Establish a communication link without using the internet.",
        teamSize: "3 members",
        time: "2:00 PM",
        venue: "Electronics Lab",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000",
        instructions: "Basic soldering skills required. Kits will be provided.",
        eligibility: "ECE/EEE/CS students.",
        rounds: [
            { name: "Round 1: Circuit Design", mode: "Online", date: "Nov 12", desc: "Submit schematic designs." },
            { name: "Round 2: Assembly", mode: "Offline", date: "Nov 15", desc: "Assemble and test the radio range." }
        ],
        coordinators: {
            student: ["Dustin Henderson - 9988776655"],
            staff: ["Mr. Clarke - 1122334455"]
        }
    },
    {
        id: 5,
        title: "Hellfire Club D&D Night",
        date: "Nov 22, 2024",
        location: "High School Cafe",
        description: "Strategic planning and role-playing game night. Join the campaign.",
        fullDescription: "The ultimate test of strategy, luck, and teamwork. The Hellfire Club invites you to a D&D campaign. Can you defeat Vecna?",
        teamSize: "4-5 members",
        time: "6:00 PM",
        venue: "Cafeteria",
        image: "https://images.unsplash.com/photo-1610890716271-e2fe9e9b0d6d?auto=format&fit=crop&q=80&w=1000",
        instructions: "Character sheets provided. Bring your own dice if you have them.",
        eligibility: "Open to everyone. No jocks allowed (just kidding).",
        rounds: [
            { name: "The Campaign", mode: "Offline", date: "Nov 22", desc: "A 4-hour one-shot campaign." }
        ],
        coordinators: {
            student: ["Eddie Munson - 6666666666"],
            staff: ["Unknown - 0000000000"]
        }
    },
    {
        id: 6,
        title: "Project Nina: UI/UX",
        date: "Dec 01, 2024",
        location: "Rainbow Room",
        description: "Designing interfaces that tap into human potential. Focus on user psychology.",
        fullDescription: "Design the interface for a psychic control panel. Focus on accessibility, color theory, and 80s aesthetics.",
        teamSize: "2 members",
        time: "10:00 AM",
        venue: "Design Studio",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?auto=format&fit=crop&q=80&w=1000",
        instructions: "Bring Figma/Adobe XD installed laptops.",
        eligibility: "Open to all.",
        rounds: [
            { name: "Round 1: Wireframe", mode: "Online", date: "Nov 28", desc: "Submit low-fidelity sketches." },
            { name: "Round 2: Prototype", mode: "Offline", date: "Dec 01", desc: "High-fidelity interactive prototype." }
        ],
        coordinators: {
            student: ["Eleven - 0110110111"],
            staff: ["Dr. Brenner - 1111111111"]
        }
    },
    {
        id: 7,
        title: "Palace Arcade Retro Dev",
        date: "Dec 05, 2024",
        location: "The Palace",
        description: "Game development workshop using 8-bit assets and synthwave aesthetics.",
        fullDescription: "Create a clone of Dig Dug or Pac-Man using Unity or Godot. Focus on retro mechanics and pixel art.",
        teamSize: "Individual or Pair",
        time: "9:00 AM",
        venue: "Computer Lab 1",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
        instructions: "Assets pack will be provided.",
        eligibility: "Open to all gamers.",
        rounds: [
            { name: "Game Jam", mode: "Offline", date: "Dec 05", desc: "6-hour game dev sprint." }
        ],
        coordinators: {
            student: ["Max Mayfield - 3334445556"],
            staff: ["Keith - 9999999999"]
        }
    },
    {
        id: 8,
        title: "Into the Void: VR Tech",
        date: "Dec 12, 2024",
        location: "Gymnasium",
        description: "Sensory deprivation and Virtual Reality exploration.",
        fullDescription: "Experience the latest in VR technology. Build a simple VR environment that mimics the sensory deprivation tank.",
        teamSize: "Individual",
        time: "1:00 PM",
        venue: "AV Room",
        image: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&q=80&w=1000",
        instructions: "No motion sickness history recommended.",
        eligibility: "Open to all.",
        rounds: [
            { name: "Demo Day", mode: "Offline", date: "Dec 12", desc: "Showcase of VR concepts." }
        ],
        coordinators: {
            student: ["Lucas Sinclair - 8888888888"],
            staff: ["Mr. Clarke - 1231231234"]
        }
    },
    {
        id: 9,
        title: "Snow Ball Gala",
        date: "Dec 20, 2024",
        location: "School Hall",
        description: "End of year networking event. Dress sharp, it's 1984.",
        fullDescription: "The tech symposium closing ceremony. Networking, food, and 80s music. Awards for all previous events will be distributed here.",
        teamSize: "N/A",
        time: "7:00 PM",
        venue: "Main Auditorium",
        image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&q=80&w=1000",
        instructions: "Formal attire mandatory.",
        eligibility: "Ticket required.",
        rounds: [
            { name: "The Dance", mode: "Offline", date: "Dec 20", desc: "Just have fun." }
        ],
        coordinators: {
            student: ["Steve Harrington - 1234567890"],
            staff: ["Principal Coleman - 0987654321"]
        }
    }
];