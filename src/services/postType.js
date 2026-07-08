import { Briefcase, UserCircle2, Tag, Megaphone, GraduationCap } from 'lucide-react'

// Home Feed post types — these are the 4 types shown in the main feed,
// using the EXACT enum values from the real Post model.
// The remaining types (NEED_HELP, INVESTMENT, PARTNERSHIP, etc.) belong
// to Exchange, Support Board, and Diaspora Hub sections respectively.
export const POST_TYPES = {
  OPPORTUNITY: {
    label: 'Opportunity',
    icon: Briefcase,
    textClass: 'text-emerald-600',
  },
  UPDATE: {
    label: 'Member Update',
    icon: UserCircle2,
    textClass: 'text-blue-600',
  },
  DEAL: {
    label: 'Deal',
    icon: Tag,
    textClass: 'text-amber-600',
  },
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: Megaphone,
    textClass: 'text-red-600',
  },
  LEARNING: {
    label: 'Learning Post',
    icon: GraduationCap,
    textClass: 'text-cyan-600',
  },
}

// Filter pills for the feed — "All" shows everything, rest filter by type
export const POST_TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  ...Object.entries(POST_TYPES).map(([value, { label }]) => ({ value, label })),
]