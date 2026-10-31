import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Heart,
  Flame,
  Sparkles,
  Baby,
  ChevronRight,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

const CORE_CATEGORIES = [
  {
    id: 'moral-stories',
    slug: 'Moral Stories',
    name: 'Moral Stories (நீதிக்கதைகள்)',
    tamilName: 'பஞ்சதந்திர கதைகள் & நன்னெறி',
    description: 'Timeless animal fables of wit, wisdom, and virtue from Vishnu Sharma and Aesop.',
    cover: '/images/story-panchatantra.jpg',
    count: '18 Stories',
    icon: <BookOpen className="w-6 h-6 text-[#A7F3D0]" />,
  },
  {
    id: 'culture-tradition',
    slug: 'Culture & Tradition',
    name: 'Culture & Tradition (பாரம்பரியம்)',
    tamilName: 'தமிழ் கிராமிய நாடோடிக் கதைகள்',
    description: 'Heritage legends, oral traditions, and heartwarming village folklore told by grandmothers.',
    cover: '/images/story-tamil-folk.jpg',
    count: '24 Stories',
    icon: <Sparkles className="w-6 h-6 text-[#A7F3D0]" />,
  },
  {
    id: 'for-kids',
    slug: 'For Kids',
    name: 'For Kids (குழந்தைகளுக்கு)',
    tamilName: 'தூங்க வைக்கும் தாலாட்டுக் கதைகள்',
    description: 'Gentle, soothing stories designed to help young dreamers fall asleep happily.',
    cover: '/images/story-bedtime.jpg',
    count: '32 Stories',
    icon: <Baby className="w-6 h-6 text-[#A7F3D0]" />,
  },
  {
    id: 'tamil-history',
    slug: 'Tamil History',
    name: 'Tamil History (சோழர் வரலாறு)',
    tamilName: 'சேர, சோழ, பாண்டியர் வரலாற்றுப் புதினங்கள்',
    description: 'Heroic sagas of the Chola, Pandya, and Chera dynasties, kings, and grand stone temples.',
    cover: '/images/story-historical.jpg',
    count: '15 Epics',
    icon: <Compass className="w-6 h-6 text-[#A7F3D0]" />,
  },
  {
    id: 'life-lessons',
    slug: 'Life Lessons',
    name: 'Life Lessons (வாழ்வியல் நெறி)',
    tamilName: 'திருவள்ளுவர் தன்னம்பிக்கைக் கதைகள்',
    description: 'Inspiring life lessons from Thiruvalluvar, ancient sages, and modern thinkers.',
    cover: '/images/story-motivational.jpg',
    count: '20 Stories',
    icon: <Flame className="w-6 h-6 text-[#A7F3D0]" />,
  },
];

export const CategoriesPage: React.FC = () => {
  const { api } = useAuth();

  const { data: categories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => api.catalog.getCategories(),
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#083325] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0] uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 fill-current" />
          <span>Curated Categories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
          கதை வகைப்பாடுகள் (Story Categories)
        </h1>
        <p className="text-sm text-[#173D2E]/75 dark:text-stone-300 max-w-xl">
          உங்களுக்குப் பிடித்த கதை உலகத்தை தேர்ந்தெடுத்து உடனடியாக வாசிக்கவும் அல்லது கேட்கவும் தொடங்குங்கள்.
        </p>
      </div>

      {/* Core Botanical Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CORE_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/explore?category=${encodeURIComponent(cat.slug)}`}
            className="group rounded-3xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-900">
              <img
                src={cat.cover}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#064E3B]/90 backdrop-blur-md flex items-center justify-center border border-white/20">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-bold font-serif text-lg leading-tight">{cat.name}</h3>
                    <span className="text-xs font-tamil text-[#A7F3D0]">{cat.count}</span>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-[#064E3B] transition-colors">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="text-xs font-semibold font-tamil text-[#166534] dark:text-[#A7F3D0]">
                {cat.tamilName}
              </div>
              <p className="text-xs text-[#173D2E]/75 dark:text-stone-300 leading-relaxed">
                {cat.description}
              </p>
              <div className="pt-3 border-t border-[#E3DCBA]/60 dark:border-[#124835] flex items-center justify-between text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                <span>Explore Stories</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
