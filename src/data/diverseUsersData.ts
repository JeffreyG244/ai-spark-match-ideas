import type { User } from '@supabase/supabase-js';

export interface DiverseUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  bio: string;
  values: string;
  lifeGoals: string;
  greenFlags: string;
  photos: string[];
}

// Generate secure random passwords for seeding
const generateSecurePassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
};

export const diverseUsersData: DiverseUser[] = [
  {
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@example.com",
    password: generateSecurePassword(), // Use secure random password
    bio: "Passionate about sustainable living and urban gardening. Let's grow together!",
    values: "Sustainability, Community, Creativity",
    lifeGoals: "Create a self-sustaining urban farm, mentor young environmentalists, and travel to eco-villages around the world.",
    greenFlags: "Volunteers regularly, upcycles creatively, and is always learning about new ways to reduce their carbon footprint.",
    photos: [
      "https://images.unsplash.com/photo-1560786499-b5f9eb989a17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1544005313-943cb025c0e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Marcus",
    lastName: "Johnson",
    email: "marcus.johnson@example.com",
    password: generateSecurePassword(), // Use secure random password
    bio: "Avid reader, hiker, and lover of all things tech. Looking for someone to explore new trails and coding challenges with.",
    values: "Intellectual Curiosity, Adventure, Honesty",
    lifeGoals: "Summit the highest peak on each continent, publish a novel, and develop an app that helps people connect in meaningful ways.",
    greenFlags: "Always has a book recommendation, enjoys deep conversations, and is passionate about lifelong learning.",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Elena",
    lastName: "Rodriguez",
    email: "elena.rodriguez@example.com",
    password: generateSecurePassword(), // Use secure random password
    bio: "A culinary artist with a passion for global flavors and creating memorable dining experiences.",
    values: "Creativity, Passion, Connection",
    lifeGoals: "Open a restaurant that celebrates diverse cultures, write a cookbook, and host culinary workshops for underprivileged youth.",
    greenFlags: "Loves to cook for others, appreciates fine arts, and is always experimenting with new recipes.",
    photos: [
      "https://images.unsplash.com/photo-1595152772835-219674b268a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@example.com",
    password: generateSecurePassword(), // Use secure random password
    bio: "Software engineer by day, astronomy enthusiast by night. Seeking someone to stargaze and debug life with.",
    values: "Innovation, Precision, Wonder",
    lifeGoals: "Contribute to open-source projects, build a personal observatory, and witness a total solar eclipse.",
    greenFlags: "Enjoys problem-solving, is fascinated by the universe, and has a knack for fixing things.",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Amara",
    lastName: "Okafor",
    email: "amara.okafor@example.com",
    password: generateSecurePassword(), // Use secure random password
    bio: "A travel photographer capturing the beauty of the world, one frame at a time. Let's explore together!",
    values: "Adventure, Empathy, Artistry",
    lifeGoals: "Visit every country, publish a photography book, and start a foundation that supports local artists in developing countries.",
    greenFlags: "Has a keen eye for detail, is passionate about cultural exchange, and always seeks out new experiences.",
    photos: [
      "https://images.unsplash.com/photo-1618043590779-c595c96949a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1639149888905-789474ca4a5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1503185918268-64b62900ca9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  }
];
