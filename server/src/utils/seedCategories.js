import Category from '../models/Category.js';

const categories = [
  // Community boards
  { name: 'General Business', slug: 'general-business', type: 'community', description: 'General business discussions' },
  { name: 'Startups', slug: 'startups', type: 'community', description: 'Startup founders and ideas' },
  { name: 'Real Estate', slug: 'real-estate', type: 'community', description: 'Real estate investment and development' },
  { name: 'Import/Export', slug: 'import-export', type: 'community', description: 'Trade, import & export' },
  { name: 'Tech & AI', slug: 'tech-ai', type: 'community', description: 'Technology and artificial intelligence' },
  { name: 'Finance', slug: 'finance', type: 'community', description: 'Finance, banking, and investments' },
  // Learning categories
  { name: 'Business Growth', slug: 'business-growth', type: 'learning', description: 'Strategies and tips for growing your business' },
  { name: 'Sales & Marketing', slug: 'sales-marketing', type: 'learning', description: 'Sales techniques and marketing strategies' },
  { name: 'Financial Literacy', slug: 'financial-literacy', type: 'learning', description: 'Finance and money management' },
  { name: 'Export & Trade', slug: 'export-trade', type: 'learning', description: 'International trade and export guides' },
  // Exchange categories
  { name: 'Need Help', slug: 'need-help', type: 'exchange', description: 'Request assistance or support for your business' },
  { name: 'Investment Opportunity', slug: 'investment', type: 'exchange', description: 'Investment opportunities and co-investor requests' },
  { name: 'Partnership Request', slug: 'partnership', type: 'exchange', description: 'Find business partners and collaborators' },
  { name: 'Supplier Request', slug: 'supplier-request', type: 'exchange', description: 'Find suppliers and vendors' },
  { name: 'Business Offer', slug: 'business-offer', type: 'exchange', description: 'Business deals and offers' },
  { name: 'Job / Internship', slug: 'job', type: 'exchange', description: 'Job openings and internship opportunities' },
];

export const seedCategories = async () => {
  const count = await Category.countDocuments();
  if (count > 0) {
    console.log('ℹ️  Categories already seeded — skipping.');
    return;
  }
  await Category.insertMany(categories);
  console.log(`✅ Seeded ${categories.length} categories.`);
};
