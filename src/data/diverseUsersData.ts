
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
  // Female Professionals (25)
  {
    firstName: "Alexandra",
    lastName: "Morrison",
    email: "alexandra.morrison@example.com",
    password: generateSecurePassword(),
    bio: "Marketing Director with a passion for sustainable brands and authentic connections. I believe in work-life balance and meaningful conversations over coffee.",
    values: "Authenticity, Growth, Balance",
    lifeGoals: "Build a purpose-driven marketing agency, travel to 50 countries, and create lasting relationships that inspire personal growth.",
    greenFlags: "Asks thoughtful questions, remembers small details, and always follows through on commitments. Values deep conversations and genuine connection.",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Victoria",
    lastName: "Chang",
    email: "victoria.chang@example.com",
    password: generateSecurePassword(),
    bio: "Senior Software Architect who loves solving complex problems by day and exploring local art galleries by evening. Seeking someone who appreciates both innovation and culture.",
    values: "Innovation, Culture, Excellence",
    lifeGoals: "Lead a tech team that changes lives, mentor young professionals, and build a home filled with art and laughter.",
    greenFlags: "Excellent communicator, emotionally intelligent, and passionate about continuous learning. Makes everyone feel heard and valued.",
    photos: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFzaWFuJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1544005313-943cb025c0e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Sophia",
    lastName: "Williams",
    email: "sophia.williams@example.com",
    password: generateSecurePassword(),
    bio: "Healthcare Executive passionate about improving patient outcomes. I find joy in cooking elaborate dinners and weekend hiking adventures.",
    values: "Compassion, Integrity, Adventure",
    lifeGoals: "Transform healthcare accessibility, run a marathon on every continent, and create a loving family that values service to others.",
    greenFlags: "Naturally nurturing, great listener, and always sees the best in people. Brings thoughtful solutions to every challenge.",
    photos: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJsYWNrJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJsYWNrJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1595152772835-219674b268a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Isabella",
    lastName: "Martinez",
    email: "isabella.martinez@example.com",
    password: generateSecurePassword(),
    bio: "Financial Advisor who believes money should serve your dreams, not define them. I love wine tastings, book clubs, and spontaneous weekend getaways.",
    values: "Freedom, Wisdom, Joy",
    lifeGoals: "Help 1000 families achieve financial independence, write a book about money mindset, and travel the world with my future partner.",
    greenFlags: "Financially responsible, great at planning surprises, and has an infectious laugh. Makes everyone feel comfortable talking about their goals.",
    photos: [
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhdGluYSUyMHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Rachel",
    lastName: "Thompson",
    email: "rachel.thompson@example.com",
    password: generateSecurePassword(),
    bio: "Creative Director at a design agency with an eye for beauty in everyday moments. I enjoy yoga, photography workshops, and discovering hidden coffee gems.",
    values: "Creativity, Mindfulness, Beauty",
    lifeGoals: "Launch my own sustainable design studio, teach creativity workshops to children, and capture the world through my lens with someone special.",
    greenFlags: "Incredibly creative, sees potential in everything, and has a calming presence. Always finds unique ways to make ordinary moments special.",
    photos: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Catherine",
    lastName: "Davis",
    email: "catherine.davis@example.com",
    password: generateSecurePassword(),
    bio: "Legal Counsel specializing in environmental law. I'm driven by justice and sustainability. My weekends involve farmers markets, rock climbing, and good books.",
    values: "Justice, Sustainability, Growth",
    lifeGoals: "Argue a case before the Supreme Court, establish a scholarship for underprivileged law students, and build a sustainable home with solar panels.",
    greenFlags: "Strong moral compass, excellent problem solver, and fiercely loyal. Stands up for what's right and supports others' dreams wholeheartedly.",
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFzaWFuJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Amanda",
    lastName: "Foster",
    email: "amanda.foster@example.com",
    password: generateSecurePassword(),
    bio: "Operations Manager who thrives on bringing order to chaos and teams together. I love cooking classes, trivia nights, and planning amazing vacations.",
    values: "Efficiency, Teamwork, Fun",
    lifeGoals: "Run my own consulting firm, visit all 7 wonders of the world, and create a home where friends and family love to gather.",
    greenFlags: "Exceptional organizer, brings people together naturally, and has great follow-through. Makes everything feel effortless and enjoyable.",
    photos: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Jennifer",
    lastName: "Park",
    email: "jennifer.park@example.com",
    password: generateSecurePassword(),
    bio: "Data Scientist turning numbers into insights that make a difference. I find patterns in everything, from spreadsheets to the perfect coffee-to-cream ratio.",
    values: "Precision, Impact, Curiosity",
    lifeGoals: "Use data science to solve climate change, teach statistics to make it accessible, and find someone who appreciates both my spreadsheets and spontaneity.",
    greenFlags: "Incredibly analytical yet warm, explains complex things simply, and remembers everyone's preferences. Brings both logic and heart to decisions.",
    photos: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFzaWFuJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Nicole",
    lastName: "Anderson",
    email: "nicole.anderson@example.com",
    password: generateSecurePassword(),
    bio: "Human Resources Director passionate about creating workplaces where people thrive. I enjoy meditation retreats, cooking fusion cuisine, and hosting dinner parties.",
    values: "Empathy, Growth, Connection",
    lifeGoals: "Transform corporate culture to be more human-centered, write a book on workplace wellness, and create a loving partnership built on mutual respect.",
    greenFlags: "Amazing listener, natural mediator, and genuinely cares about others' wellbeing. Creates safe spaces where people can be their authentic selves.",
    photos: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Megan",
    lastName: "Roberts",
    email: "megan.roberts@example.com",
    password: generateSecurePassword(),
    bio: "Brand Strategy Consultant who helps businesses find their authentic voice. I love pilates, antique shopping, and exploring new neighborhoods on foot.",
    values: "Authenticity, Strategy, Discovery",
    lifeGoals: "Build a consultancy that helps ethical brands thrive, restore a historic home, and find a partner who loves Sunday morning adventures.",
    greenFlags: "Strategic thinker with creative flair, excellent at reading people, and brings calm energy to stressful situations. Always has the best restaurant recommendations.",
    photos: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Lauren",
    lastName: "Johnson",
    email: "lauren.johnson@example.com",
    password: generateSecurePassword(),
    bio: "Investment Banker who believes in both financial and emotional returns. I unwind with spin classes, art museum visits, and perfectly crafted cocktails.",
    values: "Excellence, Balance, Sophistication",
    lifeGoals: "Start an impact investing fund, collect contemporary art, and build a relationship based on mutual ambition and deep respect.",
    greenFlags: "Driven yet grounded, excellent communicator, and brings out the best in others. Knows how to celebrate wins and support through challenges.",
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Emily",
    lastName: "Chen",
    email: "emily.chen@example.com",
    password: generateSecurePassword(),
    bio: "Product Manager who turns user needs into beautiful experiences. I'm passionate about design thinking, weekend farmers markets, and finding the perfect work-life flow.",
    values: "User-Centricity, Design, Flow",
    lifeGoals: "Launch a product that improves millions of lives, mentor women in tech, and create a home workspace that inspires creativity every day.",
    greenFlags: "User-focused mindset, collaborative leader, and brings calm energy to complex projects. Always thinks about the human impact of decisions.",
    photos: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFzaWFuJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Sarah",
    lastName: "Miller",
    email: "sarah.miller@example.com",
    password: generateSecurePassword(),
    bio: "Environmental Engineer working to make cities more sustainable. I love urban gardening, indie films, and conversations that make you think differently.",
    values: "Sustainability, Innovation, Impact",
    lifeGoals: "Design green infrastructure for major cities, patent an environmental technology, and raise children who care about the planet's future.",
    greenFlags: "Forward-thinking problem solver, passionate about making a difference, and has an infectious enthusiasm for learning. Makes complex topics accessible and interesting.",
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Jessica",
    lastName: "Taylor",
    email: "jessica.taylor@example.com",
    password: generateSecurePassword(),
    bio: "Communications Director crafting stories that connect and inspire. I enjoy pottery classes, jazz clubs, and exploring hidden gems in the city.",
    values: "Storytelling, Connection, Artistry",
    lifeGoals: "Lead communications for a nonprofit that changes lives, publish a collection of essays, and build a relationship founded on shared values and laughter.",
    greenFlags: "Gifted storyteller, makes everyone feel interesting, and brings warmth to every interaction. Has a talent for finding the perfect words in any situation.",
    photos: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Danielle",
    lastName: "White",
    email: "danielle.white@example.com",
    password: generateSecurePassword(),
    bio: "Business Development Manager connecting companies with opportunities that matter. I love tennis, wine country weekends, and deep conversations over dinner.",
    values: "Connection, Growth, Quality",
    lifeGoals: "Build strategic partnerships that create positive change, travel to wine regions worldwide, and find someone who shares my love for both adventure and quiet moments.",
    greenFlags: "Natural connector, excellent judge of character, and brings enthusiasm to everything she does. Always remembers what matters most to the people she cares about.",
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Michelle",
    lastName: "Garcia",
    email: "michelle.garcia@example.com",
    password: generateSecurePassword(),
    bio: "Supply Chain Director optimizing how the world moves. I find balance through salsa dancing, cooking family recipes, and planning elaborate surprise parties.",
    values: "Efficiency, Tradition, Celebration",
    lifeGoals: "Revolutionize sustainable supply chains, preserve family traditions through food, and create a home where celebration and culture thrive together.",
    greenFlags: "Incredibly organized yet spontaneous, brings people together through food and celebration, and always finds creative solutions to complex problems.",
    photos: [
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhdGluYSUyMHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Stephanie",
    lastName: "Lee",
    email: "stephanie.lee@example.com",
    password: generateSecurePassword(),
    bio: "Research Scientist discovering tomorrow's medical breakthroughs today. I enjoy rock climbing, Korean cooking, and philosophical discussions about science and ethics.",
    values: "Discovery, Precision, Ethics",
    lifeGoals: "Contribute to a medical breakthrough that saves lives, mentor young scientists, and build a relationship based on intellectual curiosity and deep respect.",
    greenFlags: "Brilliant yet humble, asks great questions, and brings scientific thinking to everyday decisions. Always supportive of others' learning and growth.",
    photos: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFzaWFuJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Ashley",
    lastName: "Brown",
    email: "ashley.brown@example.com",
    password: generateSecurePassword(),
    bio: "Sales Director who believes relationships drive everything. I love CrossFit, book clubs, and finding the perfect gift that shows I really listen.",
    values: "Relationships, Achievement, Thoughtfulness",
    lifeGoals: "Lead a sales team that changes the industry, write a book about authentic relationship building, and find a partner who appreciates both ambition and intimacy.",
    greenFlags: "Exceptional listener, remembers every detail about people she cares about, and brings out the best in everyone. Always follows through and exceeds expectations.",
    photos: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJsYWNrJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGJsYWNrJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Kimberly",
    lastName: "Wilson",
    email: "kimberly.wilson@example.com",
    password: generateSecurePassword(),
    bio: "Management Consultant helping organizations thrive through change. I find peace in yoga, energy in dance classes, and joy in planning perfect dinner parties.",
    values: "Transformation, Balance, Hospitality",
    lifeGoals: "Start a consulting firm focused on ethical business practices, perfect my grandmother's recipes, and create a partnership built on mutual growth and respect.",
    greenFlags: "Change catalyst who makes transitions feel safe, amazing host, and brings calm wisdom to stressful situations. Always finds the positive in challenges.",
    photos: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Lisa",
    lastName: "Rodriguez",
    email: "lisa.rodriguez@example.com",
    password: generateSecurePassword(),
    bio: "Digital Marketing Manager creating campaigns that connect hearts and minds. I love pottery classes, street art tours, and discovering hole-in-the-wall restaurants.",
    values: "Creativity, Connection, Discovery",
    lifeGoals: "Launch a creative agency that tells authentic stories, travel to every art capital in the world, and find someone who shares my love for both culture and adventure.",
    greenFlags: "Creative visionary with strategic mind, naturally curious about everyone she meets, and has an eye for finding beauty in unexpected places.",
    photos: [
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhdGluYSUyMHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Karen",
    lastName: "Thomas",
    email: "karen.thomas@example.com",
    password: generateSecurePassword(),
    bio: "Corporate Training Director empowering professionals to reach their potential. I enjoy hiking, wine tastings, and meaningful conversations that last until midnight.",
    values: "Empowerment, Growth, Depth",
    lifeGoals: "Create training programs that transform careers, hike the Appalachian Trail, and build a relationship where we both become the best versions of ourselves.",
    greenFlags: "Natural teacher and mentor, sees potential in everyone, and brings out hidden strengths in others. Creates safe spaces for growth and vulnerability.",
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Samantha",
    lastName: "Jackson",
    email: "samantha.jackson@example.com",
    password: generateSecurePassword(),
    bio: "Quality Assurance Director ensuring excellence in everything we deliver. I unwind with yoga retreats, farmers market visits, and cooking elaborate Sunday brunches.",
    values: "Excellence, Mindfulness, Nourishment",
    lifeGoals: "Lead quality initiatives that set industry standards, open a farm-to-table restaurant, and create a home where quality time and quality food bring people together.",
    greenFlags: "Detail-oriented perfectionist who never makes others feel criticized, brings calm presence to chaotic situations, and always makes everything feel special.",
    photos: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Diana",
    lastName: "Moore",
    email: "diana.moore@example.com",
    password: generateSecurePassword(),
    bio: "Risk Management Specialist protecting what matters most. I find adventure in rock climbing, serenity in meditation, and joy in hosting game nights with friends.",
    values: "Security, Adventure, Community",
    lifeGoals: "Develop risk frameworks that protect entire industries, climb mountains on every continent, and find a partner who appreciates both security and spontaneity.",
    greenFlags: "Thoughtful risk-taker, protective of those she loves, and brings both adventure and stability to relationships. Always has a backup plan and an open heart.",
    photos: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },

  // Male Professionals (25)
  {
    firstName: "Michael",
    lastName: "Richardson",
    email: "michael.richardson@example.com",
    password: generateSecurePassword(),
    bio: "Technology Executive passionate about using innovation to solve real-world problems. I enjoy craft brewing, jazz festivals, and weekend woodworking projects.",
    values: "Innovation, Craftsmanship, Purpose",
    lifeGoals: "Lead a tech company that makes healthcare accessible globally, master the art of furniture making, and build a partnership based on shared values and adventure.",
    greenFlags: "Visionary leader with hands-on approach, excellent problem solver, and brings calm confidence to challenging situations. Always makes time for the people he cares about.",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@example.com",
    password: generateSecurePassword(),
    bio: "Investment Portfolio Manager who believes in both financial growth and personal development. I love sailing, wine collecting, and mentoring young professionals.",
    values: "Growth, Mentorship, Sophistication",
    lifeGoals: "Manage a fund that invests in sustainable companies, sail across the Atlantic, and find someone who shares my appreciation for life's finer experiences.",
    greenFlags: "Strategic thinker with generous heart, excellent mentor, and brings both stability and excitement to relationships. Always invested in others' success.",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Christopher",
    lastName: "Davis",
    email: "christopher.davis@example.com",
    password: generateSecurePassword(),
    bio: "Biomedical Engineer developing medical devices that save lives. I unwind through marathon training, photography walks, and cooking elaborate meals for friends.",
    values: "Impact, Precision, Connection",
    lifeGoals: "Invent a medical device that becomes standard care, complete an Ironman triathlon, and create a home where friends become family.",
    greenFlags: "Detail-oriented innovator, incredibly loyal friend, and brings both analytical thinking and emotional intelligence to relationships. Always follows through on commitments.",
    photos: [
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Andrew",
    lastName: "Wilson",
    email: "andrew.wilson@example.com",
    password: generateSecurePassword(),
    bio: "Management Consultant helping organizations navigate complex transformations. I enjoy craft cocktail making, skiing, and deep conversations about philosophy and business.",
    values: "Transformation, Excellence, Depth",
    lifeGoals: "Start a consultancy focused on ethical business transformation, ski the Alps every winter, and build a relationship where we challenge each other to grow.",
    greenFlags: "Change catalyst with steady presence, excellent listener, and brings both strategic thinking and emotional support to partnerships. Always sees the bigger picture.",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "James",
    lastName: "Anderson",
    email: "james.anderson@example.com",
    password: generateSecurePassword(),
    bio: "Corporate Attorney specializing in mergers and acquisitions. I find balance through rock climbing, classical music concerts, and exploring new restaurants with good company.",
    values: "Justice, Precision, Culture",
    lifeGoals: "Lead landmark cases that shape business ethics, learn to play piano at concert level, and find a partner who appreciates both ambition and artistry.",
    greenFlags: "Sharp legal mind with warm heart, protective of those he loves, and brings both intellectual rigor and emotional depth to relationships. Always fights for what's right.",
    photos: [
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Robert",
    lastName: "Miller",
    email: "robert.miller@example.com",
    password: generateSecurePassword(),
    bio: "Operations Director who thrives on building efficient systems that empower teams. I love cycling, beer brewing, and hosting backyard BBQs that bring people together.",
    values: "Efficiency, Community, Craftsmanship",
    lifeGoals: "Optimize operations for a company that changes the world, perfect my signature beer recipe, and create a home where hospitality and warmth are always on tap.",
    greenFlags: "Systems thinker who never loses sight of people, natural host, and brings both organization and fun to every situation. Always makes everyone feel included.",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Kevin",
    lastName: "Garcia",
    email: "kevin.garcia@example.com",
    password: generateSecurePassword(),
    bio: "Marketing Director crafting brands that resonate with hearts and minds. I enjoy salsa dancing, travel photography, and discovering authentic cultural experiences.",
    values: "Authenticity, Culture, Connection",
    lifeGoals: "Build a marketing agency that celebrates diverse voices, document cultures through photography worldwide, and find love that transcends boundaries and languages.",
    greenFlags: "Cultural bridge-builder, amazing storyteller, and brings passion and authenticity to everything he does. Makes everyone feel seen and valued for who they are.",
    photos: [
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Steven",
    lastName: "Lee",
    email: "steven.lee@example.com",
    password: generateSecurePassword(),
    bio: "Data Science Director turning complex data into actionable insights. I find clarity through meditation, challenge through tennis, and joy through Korean cooking.",
    values: "Clarity, Challenge, Heritage",
    lifeGoals: "Lead data initiatives that improve millions of lives, compete in tennis tournaments, and preserve family recipes while creating new traditions with someone special.",
    greenFlags: "Analytical mind with intuitive heart, patient teacher, and brings both logic and creativity to problem-solving. Always finds the story hidden in the numbers.",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Daniel",
    lastName: "Brown",
    email: "daniel.brown@example.com",
    password: generateSecurePassword(),
    bio: "Healthcare Administrator working to make quality care accessible to everyone. I recharge through hiking, cooking, and volunteering at community health clinics.",
    values: "Service, Accessibility, Community",
    lifeGoals: "Transform healthcare delivery systems, hike the Camino de Santiago, and build a family committed to service and social justice.",
    greenFlags: "Service-oriented leader, naturally compassionate, and brings both systemic thinking and personal care to relationships. Always puts others' wellbeing first.",
    photos: [
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Matthew",
    lastName: "Rodriguez",
    email: "matthew.rodriguez@example.com",
    password: generateSecurePassword(),
    bio: "Product Development Manager bringing innovative solutions to market. I love surfing, craft beer tastings, and experimenting with fusion cooking that bridges cultures.",
    values: "Innovation, Adventure, Fusion",
    lifeGoals: "Launch a product that revolutionizes daily life, surf perfect waves on every continent, and create a relationship that blends the best of different worlds.",
    greenFlags: "Creative problem solver, adventure enthusiast, and brings both innovation and stability to partnerships. Always ready to try something new together.",
    photos: [
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Thomas",
    lastName: "Johnson",
    email: "thomas.johnson@example.com",
    password: generateSecurePassword(),
    bio: "Financial Planning Director helping individuals and families secure their futures. I enjoy golf, wine education, and hosting investment strategy dinner parties.",
    values: "Security, Education, Legacy",
    lifeGoals: "Help 1000 families achieve financial independence, become a sommelier, and create generational wealth that supports both ambition and philanthropy.",
    greenFlags: "Future-focused planner, generous with knowledge, and brings both financial wisdom and emotional intelligence to relationships. Always thinks about legacy and impact.",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Ryan",
    lastName: "Williams",
    email: "ryan.williams@example.com",
    password: generateSecurePassword(),
    bio: "Software Development Manager building platforms that connect people meaningfully. I love basketball, jazz piano, and conversations about technology's role in human connection.",
    values: "Connection, Innovation, Purpose",
    lifeGoals: "Lead development of technology that brings people together, record a jazz album, and find someone who appreciates both digital innovation and analog warmth.",
    greenFlags: "Tech visionary with human focus, natural collaborator, and brings both analytical skills and emotional intelligence to partnerships. Always considers the human impact.",
    photos: [
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Benjamin",
    lastName: "Davis",
    email: "benjamin.davis@example.com",
    password: generateSecurePassword(),
    bio: "Supply Chain Director optimizing global networks for sustainability and efficiency. I find balance through yoga, urban farming, and cooking meals that tell stories.",
    values: "Sustainability, Efficiency, Storytelling",
    lifeGoals: "Create supply chains that support fair trade and environmental healing, grow most of my own food, and find a partner who shares my vision for sustainable living.",
    greenFlags: "Systems thinker with environmental conscience, naturally nurturing, and brings both strategic planning and mindful presence to relationships. Always considers long-term impact.",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Jonathan",
    lastName: "Martinez",
    email: "jonathan.martinez@example.com",
    password: generateSecurePassword(),
    bio: "Business Strategy Consultant helping companies navigate disruption with integrity. I love mountain biking, live music, and exploring how business can be a force for good.",
    values: "Integrity, Disruption, Good",
    lifeGoals: "Advise companies on ethical growth strategies, bike across the country for charity, and build a relationship where we challenge each other to be better humans.",
    greenFlags: "Ethical strategic thinker, natural optimist, and brings both business acumen and moral compass to partnerships. Always finds the win-win solution.",
    photos: [
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Nicholas",
    lastName: "Wilson",
    email: "nicholas.wilson@example.com",
    password: generateSecurePassword(),
    bio: "Research & Development Director pioneering solutions for tomorrow's challenges. I enjoy chess, classical concerts, and philosophical discussions about science and society.",
    values: "Innovation, Intellect, Society",
    lifeGoals: "Lead R&D that addresses climate change, achieve chess master rating, and find someone who enjoys both intellectual debates and quiet contemplation.",
    greenFlags: "Brilliant researcher with practical focus, patient teacher, and brings both intellectual curiosity and emotional depth to relationships. Always thinks about societal impact.",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Anthony",
    lastName: "Taylor",
    email: "anthony.taylor@example.com",
    password: generateSecurePassword(),
    bio: "Sales Director who believes authentic relationships are the foundation of all success. I love CrossFit, wine country trips, and hosting dinner parties that turn into lifelong friendships.",
    values: "Authenticity, Success, Friendship",
    lifeGoals: "Build a sales organization known for integrity and results, compete in CrossFit competitions, and create a home where great wine and great conversations flow freely.",
    greenFlags: "Authentic relationship builder, natural motivator, and brings both competitive drive and genuine care to partnerships. Always celebrates others' wins as much as his own.",
    photos: [
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Mark",
    lastName: "Anderson",
    email: "mark.anderson@example.com",
    password: generateSecurePassword(),
    bio: "Human Resources Director creating workplaces where people thrive. I find inspiration through photography, rejuvenation through hiking, and connection through community volunteering.",
    values: "Empowerment, Nature, Community",
    lifeGoals: "Transform workplace culture to prioritize human flourishing, capture the world's beauty through photography, and build a partnership rooted in mutual growth and service.",
    greenFlags: "People-centered leader, artistic eye, and brings both empathy and strength to relationships. Always sees the potential in others and helps them reach it.",
    photos: [
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Richard",
    lastName: "Moore",
    email: "richard.moore@example.com",
    password: generateSecurePassword(),
    bio: "Project Management Director turning complex visions into reality. I love sailing, craft brewing, and bringing people together around shared goals and good food.",
    values: "Vision, Collaboration, Craft",
    lifeGoals: "Lead projects that make cities more livable, sail the Mediterranean, and create a home workshop where friends gather to build, brew, and dream together.",
    greenFlags: "Visionary project leader, master collaborator, and brings both organizational skills and creative spirit to partnerships. Always makes big dreams feel achievable.",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Jason",
    lastName: "Jackson",
    email: "jason.jackson@example.com",
    password: generateSecurePassword(),
    bio: "Quality Assurance Director ensuring excellence in every detail. I find precision in golf, adventure in travel, and joy in cooking elaborate meals that create lasting memories.",
    values: "Excellence, Adventure, Memory",
    lifeGoals: "Establish quality standards that become industry benchmarks, play golf at St. Andrews, and create traditions that make ordinary moments extraordinary.",
    greenFlags: "Detail-oriented perfectionist who never makes others feel criticized, adventurous spirit, and brings both high standards and warm hospitality to relationships.",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Brian",
    lastName: "White",
    email: "brian.white@example.com",
    password: generateSecurePassword(),
    bio: "Strategic Planning Director helping organizations navigate uncertainty with confidence. I love rock climbing, craft coffee, and deep conversations about leadership and life.",
    values: "Strategy, Confidence, Leadership",
    lifeGoals: "Guide companies through transformational growth, climb El Capitan, and find a partner who shares my love for both calculated risks and quiet reflection.",
    greenFlags: "Strategic visionary with steady presence, natural teacher, and brings both long-term thinking and present-moment awareness to relationships. Always helps others see their path forward.",
    photos: [
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Charles",
    lastName: "Thomas",
    email: "charles.thomas@example.com",
    password: generateSecurePassword(),
    bio: "Business Intelligence Director transforming data into strategic advantage. I enjoy vintage cars, fine dining, and conversations that blend analytical thinking with creative insight.",
    values: "Intelligence, Strategy, Refinement",
    lifeGoals: "Lead data initiatives that drive ethical business transformation, restore a classic car to perfection, and find someone who appreciates both intellectual depth and life's finer pleasures.",
    greenFlags: "Analytical thinker with sophisticated taste, patient problem solver, and brings both data-driven insights and intuitive wisdom to partnerships. Always finds the elegant solution.",
    photos: [
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Paul",
    lastName: "Harris",
    email: "paul.harris@example.com",
    password: generateSecurePassword(),
    bio: "Training & Development Director empowering professionals to unlock their potential. I love marathon running, book collecting, and mentoring the next generation of leaders.",
    values: "Empowerment, Endurance, Mentorship",
    lifeGoals: "Create learning programs that transform careers and lives, run the Boston Marathon, and build a relationship where we both become better versions of ourselves.",
    greenFlags: "Natural mentor and coach, incredible persistence, and brings both motivational energy and patient support to partnerships. Always believes in others' potential.",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Gregory",
    lastName: "Clark",
    email: "gregory.clark@example.com",
    password: generateSecurePassword(),
    bio: "Risk Management Director protecting organizations while enabling growth. I find balance through yoga, creativity through pottery, and community through coaching youth sports.",
    values: "Protection, Growth, Community",
    lifeGoals: "Develop risk frameworks that enable ethical innovation, master the pottery wheel, and create a family legacy built on service and strong values.",
    greenFlags: "Protective yet growth-oriented, naturally teaching, and brings both security and adventure to relationships. Always considers how decisions affect the community.",
    photos: [
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Eric",
    lastName: "Lewis",
    email: "eric.lewis@example.com",
    password: generateSecurePassword(),
    bio: "Corporate Development Director identifying partnerships that create mutual value. I love skiing, craft distillery tours, and building bridges between different worlds and perspectives.",
    values: "Partnership, Value, Bridge-Building",
    lifeGoals: "Structure deals that create positive social impact, ski the Swiss Alps annually, and find a partner who shares my passion for bringing people and ideas together.",
    greenFlags: "Natural bridge-builder, excellent negotiator, and brings both deal-making acumen and relationship-focused approach to partnerships. Always finds the win-win solution.",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-78329514c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a679e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
    ]
  },
  {
    firstName: "Scott",
    lastName: "Robinson",
    email: "scott.robinson@example.com",
    password: generateSecurePassword(),
    bio: "Innovation Director fostering breakthrough thinking across organizations. I energize through CrossFit, inspire through travel photography, and connect through hosting international dinner parties.",
    values: "Innovation, Energy, Global Connection",
    lifeGoals: "Lead innovation labs that solve global challenges, document cultural celebrations worldwide through photography, and create a home where diverse perspectives gather and flourish.",
    greenFlags: "Innovation catalyst with global mindset, energetic motivator, and brings both creative thinking and cultural sensitivity to relationships. Always curious about different perspectives.",
    photos: [
      "https://images.unsplash.com/photo-1587613754459-3e9b53b1ea54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1599566150163-29194dca953c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=400&q=60"
    ]
  }
];
