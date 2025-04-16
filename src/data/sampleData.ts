
import { User, Post } from '@/types';

export const sampleArchitects: User[] = [
  {
    id: '1',
    username: 'SarahDesigns',
    email: 'sarah@example.com',
    role: 'architect',
    created_at: '2023-01-15T10:00:00.000Z',
    updated_at: '2023-01-15T10:00:00.000Z',
    avatar_url: 'https://randomuser.me/api/portraits/women/42.jpg',
    bio: 'Award-winning architect specializing in sustainable residential designs with over 10 years of experience.',
    contact: 'Contact me at sarah@example.com or +1 (555) 123-4567',
    experience: '10+ years designing modern and sustainable homes. Worked with major firms in New York and San Francisco.',
    education: 'Masters in Architecture, MIT, 2013',
    skills: 'Sustainable design, 3D modeling, AutoCAD, Revit',
    contact_email: 'sarah@example.com',
    social_links: 'linkedin.com/sarahdesigns\nbehance.net/sarahdesigns',
  },
  {
    id: '2',
    username: 'ModernSpaces',
    email: 'michael@example.com',
    role: 'architect',
    created_at: '2023-02-20T15:30:00.000Z',
    updated_at: '2023-02-20T15:30:00.000Z',
    avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Creating minimalist modern spaces that harmonize with their surroundings. Specializing in open-concept designs.',
    contact: 'For inquiries: michael@example.com or (555) 987-6543',
    experience: '8 years of experience in modern residential architecture. Led design for 30+ high-end homes.',
    education: 'Bachelor of Architecture, Cornell University, 2015',
    skills: 'Minimalist design, interior space optimization, BIM',
    contact_email: 'michael@example.com',
  },
  {
    id: '3',
    username: 'ClassicRevival',
    email: 'emma@example.com',
    role: 'architect',
    created_at: '2023-03-10T09:15:00.000Z',
    updated_at: '2023-03-10T09:15:00.000Z',
    avatar_url: 'https://randomuser.me/api/portraits/women/22.jpg',
    bio: 'Breathing new life into classic designs with modern functionality and sustainable materials.',
    contact: 'emma@example.com | (555) 765-4321',
    experience: '12 years working on historic renovations and revival designs.',
    education: 'Master of Architecture, Yale University, 2011',
    skills: 'Historic preservation, revival architecture, sustainable adaptations',
    contact_email: 'emma@example.com',
  },
];

export const samplePosts: Post[] = [
  {
    id: '101',
    title: 'Sustainable Mountain Retreat',
    description: 'A modern cabin nestled in the mountains, designed to be fully sustainable with solar power and rainwater collection.',
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
    user_id: '1',
    created_at: '2023-05-15T14:30:00.000Z',
    updated_at: '2023-05-15T14:30:00.000Z',
    user: sampleArchitects[0],
    hire_me: true,
    design_type: 'Residential',
    tags: ['sustainable', 'cabin', 'mountains'],
    likes_count: 42,
  },
  {
    id: '102',
    title: 'Urban Micro Apartment',
    description: 'A space-efficient 300 sq ft apartment design that maximizes every inch without sacrificing style or comfort.',
    image_url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc',
    user_id: '1',
    created_at: '2023-06-22T10:15:00.000Z',
    updated_at: '2023-06-22T10:15:00.000Z',
    user: sampleArchitects[0],
    hire_me: true,
    design_type: 'Residential',
    tags: ['urban', 'micro', 'apartment'],
    likes_count: 28,
  },
  {
    id: '103',
    title: 'Minimalist Beach House',
    description: 'Clean lines and open spaces define this minimalist beach house that blends seamlessly with its coastal surroundings.',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    user_id: '2',
    created_at: '2023-07-05T16:45:00.000Z',
    updated_at: '2023-07-05T16:45:00.000Z',
    user: sampleArchitects[1],
    hire_me: false,
    design_type: 'Residential',
    tags: ['beach', 'minimalist', 'coastal'],
    likes_count: 65,
  },
  {
    id: '104',
    title: 'Colonial Revival Renovation',
    description: 'A careful renovation of a 1920s colonial home, preserving historical details while adding modern amenities.',
    image_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1',
    user_id: '3',
    created_at: '2023-08-12T11:20:00.000Z',
    updated_at: '2023-08-12T11:20:00.000Z',
    user: sampleArchitects[2],
    hire_me: true,
    design_type: 'Renovation',
    tags: ['colonial', 'renovation', 'historic'],
    likes_count: 37,
  },
  {
    id: '105',
    title: 'Eco-friendly Office Complex',
    description: 'A commercial office space designed with sustainability at its core, featuring living walls and natural lighting.',
    image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    user_id: '1',
    created_at: '2023-09-08T09:10:00.000Z',
    updated_at: '2023-09-08T09:10:00.000Z',
    user: sampleArchitects[0],
    hire_me: true,
    design_type: 'Commercial',
    tags: ['office', 'eco-friendly', 'commercial'],
    likes_count: 51,
  },
];
