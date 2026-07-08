import { Inbox } from 'lucide-react'

export const FeedEmptyState = ({ title, body }) => (
  <div className='bg-white rounded-2xl border border-slate-200 border-dashed p-10 text-center'>
    <div className='h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3'>
      <Inbox size={20} className='text-slate-400' />
    </div>
    <h3 className='text-sm font-semibold text-slate-900 mb-1'>{title}</h3>
    <p className='text-sm text-slate-500'>{body}</p>
  </div>
)