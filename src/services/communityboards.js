import { Briefcase, Rocket, Building2, Globe, Cpu, DollarSign } from 'lucide-react'
import { POST_TYPES } from './postType'

// ⚠️ PLACEHOLDER: These boards are hardcoded until your backend dev:
// 1. Adds COMMUNITY to the Post model type enum
// 2. Creates these 6 Category documents in the database
// 3. Provides a GET /api/categories?type=COMMUNITY endpoint
//
// Once that's ready, replace COMMUNITY_BOARDS with a fetch from that endpoint.
// The slug values below should match whatever the backend dev creates exactly.
export const COMMUNITY_POST_TYPES = [
  { value: 'ANNOUNCEMENT', label: POST_TYPES.ANNOUNCEMENT.label },
  { value: 'UPDATE', label: POST_TYPES.UPDATE.label },
  { value: 'OPPORTUNITY', label: POST_TYPES.OPPORTUNITY.label },
]

export const COMMUNITY_BOARDS = [
  {
    slug: 'general-business',
    label: 'General Business',
    icon: Briefcase,
    description: 'Broad business discussions, advice, and community updates.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    slug: 'startups',
    label: 'Startups',
    icon: Rocket,
    description: 'Ideas, launches, funding, and startup journeys.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    slug: 'real-estate',
    label: 'Real Estate',
    icon: Building2,
    description: 'Property investment, development, and market trends.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    slug: 'import-export',
    label: 'Import / Export',
    icon: Globe,
    description: 'Trade routes, customs, logistics, and sourcing.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    slug: 'tech-ai',
    label: 'Tech & AI',
    icon: Cpu,
    description: 'Technology trends, tools, and AI for business.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
  {
    slug: 'finance',
    label: 'Finance',
    icon: DollarSign,
    description: 'Business finance, investment strategies, and banking.',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
  },
]

export const getBoardBySlug = (slug) =>
  COMMUNITY_BOARDS.find((b) => b.slug === slug) || null