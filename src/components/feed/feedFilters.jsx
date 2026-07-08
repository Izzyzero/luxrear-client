import { POST_TYPE_FILTERS } from '../../services/postType'

export const FeedFilters = ({ activeFilter, onChange }) => (
  <div className='flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-5 scrollbar-hide'>
    {POST_TYPE_FILTERS.map(({ value, label }) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
          activeFilter === value
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
)