// Placeholder categories grouped by the exact POST_TYPES enum values
// from the real Post model. Swap getCategoriesForType() for a real
// GET /api/categories fetch once that endpoint exists.
const PLACEHOLDER_CATEGORIES = [
  // OPPORTUNITY
  { id: 'cat1',  name: 'Investment',          slug: 'investment',          type: 'OPPORTUNITY' },
  { id: 'cat2',  name: 'Job Opening',          slug: 'job-opening',         type: 'OPPORTUNITY' },
  { id: 'cat3',  name: 'Partnership',          slug: 'partnership',         type: 'OPPORTUNITY' },
  { id: 'cat4',  name: 'Supplier Request',     slug: 'supplier-request',    type: 'OPPORTUNITY' },
  // UPDATE
  { id: 'cat5',  name: 'Milestone',            slug: 'milestone',           type: 'UPDATE' },
  { id: 'cat6',  name: 'Product Launch',       slug: 'product-launch',      type: 'UPDATE' },
  { id: 'cat7',  name: 'Achievement',          slug: 'achievement',         type: 'UPDATE' },
  // DEAL
  { id: 'cat8',  name: 'Service Promotion',    slug: 'service-promotion',   type: 'DEAL' },
  { id: 'cat9',  name: 'Discount Offer',       slug: 'discount-offer',      type: 'DEAL' },
  // ANNOUNCEMENT
  { id: 'cat10', name: 'Community',            slug: 'community',           type: 'ANNOUNCEMENT' },
  { id: 'cat11', name: 'Event',                slug: 'event',               type: 'ANNOUNCEMENT' },
  { id: 'cat12', name: 'System',               slug: 'system',              type: 'ANNOUNCEMENT' },
  // LEARNING
  { id: 'cat13', name: 'Business Tip',         slug: 'business-tip',        type: 'LEARNING' },
  { id: 'cat14', name: 'Financial Advice',     slug: 'financial-advice',    type: 'LEARNING' },
  { id: 'cat15', name: 'Marketing Insight',    slug: 'marketing-insight',   type: 'LEARNING' },
]

export const getCategoriesForType = (type) =>
  PLACEHOLDER_CATEGORIES.filter((cat) => cat.type === type)