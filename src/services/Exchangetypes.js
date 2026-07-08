import {
  HelpCircle,
  TrendingUp,
  Handshake,
  Package,
  Briefcase,
  GraduationCap,
} from 'lucide-react'

// Exchange post types — exact enum values from the real Post model.
// These are separate from the Home Feed types (OPPORTUNITY, UPDATE, DEAL, etc.)
export const EXCHANGE_POST_TYPES = {
  NEED_HELP: {
    label: 'Need Help',
    icon: HelpCircle,
    textClass: 'text-orange-600',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Ask the community for advice, resources, or expertise.',
  },
  INVESTMENT: {
    label: 'Investment Opportunity',
    icon: TrendingUp,
    textClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Share investment opportunities or seek funding.',
  },
  PARTNERSHIP: {
    label: 'Partnership Request',
    icon: Handshake,
    textClass: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Find business partners or collaborators.',
  },
  SUPPLIER_REQUEST: {
    label: 'Supplier Request',
    icon: Package,
    textClass: 'text-purple-600',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Source reliable suppliers or vendors.',
  },
  BUSINESS_OFFER: {
    label: 'Business Offer',
    icon: Briefcase,
    textClass: 'text-primary-600',
    badgeClass: 'bg-primary-50 text-primary-700 border-primary-200',
    description: 'Promote your products, services, or business.',
  },
  JOB: {
    label: 'Job / Internship',
    icon: GraduationCap,
    textClass: 'text-cyan-600',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Post job openings or internship opportunities.',
  },
}

export const EXCHANGE_TYPE_LIST = Object.entries(EXCHANGE_POST_TYPES).map(
  ([value, config]) => ({ value, ...config })
)