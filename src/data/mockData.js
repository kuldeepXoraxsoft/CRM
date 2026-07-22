// Mock data standing in for the Prisma/Express API responses.
// Swap these out for real fetches once the backend is wired up.

export const CURRENT_USER = {
  name: 'Alicia Reyes',
  email: 'alicia@yourcrm.com',
  role: 'Sales Manager',
}

export const STATS = [
  { id: 'contacts', label: 'Total Contacts', value: '2,341', change: '+8.2%', trend: 'up' },
  { id: 'deals', label: 'Open Deals', value: '186', change: '+3.1%', trend: 'up' },
  { id: 'revenue', label: 'Pipeline Value', value: '$482K', change: '+12.4%', trend: 'up' },
  { id: 'conversion', label: 'Conversion Rate', value: '24.6%', change: '-1.4%', trend: 'down' },
]

export const TEAM_MEMBERS = [
  { value: 'alicia', label: 'Alicia Reyes' },
  { value: 'daniel', label: 'Daniel Cho' },
  { value: 'priya', label: 'Priya Nair' },
  { value: 'marcus', label: 'Marcus Webb' },
]

const today = new Date()
function daysFromNow(n) {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const TASKS = [
  {
    id: 't1',
    title: 'Follow up with Northwind Traders on renewal',
    type: 'call',
    relatedTo: 'Northwind Traders',
    priority: 'high',
    dueDate: daysFromNow(-1),
    assignee: 'alicia',
    status: 'pending',
  },
  {
    id: 't2',
    title: 'Send proposal to Acme Corp',
    type: 'email',
    relatedTo: 'Acme Corp',
    priority: 'high',
    dueDate: daysFromNow(0),
    assignee: 'daniel',
    status: 'pending',
  },
  {
    id: 't3',
    title: 'Demo call with Bluewave Analytics',
    type: 'meeting',
    relatedTo: 'Bluewave Analytics',
    priority: 'medium',
    dueDate: daysFromNow(0),
    assignee: 'priya',
    status: 'pending',
  },
  {
    id: 't4',
    title: 'Prepare Q3 contract for Initech',
    type: 'follow-up',
    relatedTo: 'Initech',
    priority: 'medium',
    dueDate: daysFromNow(2),
    assignee: 'alicia',
    status: 'pending',
  },
  {
    id: 't5',
    title: 'Check in with Globex after onboarding',
    type: 'call',
    relatedTo: 'Globex Inc.',
    priority: 'low',
    dueDate: daysFromNow(4),
    assignee: 'marcus',
    status: 'pending',
  },
  {
    id: 't6',
    title: 'Update CRM notes for Stark Industries',
    type: 'follow-up',
    relatedTo: 'Stark Industries',
    priority: 'low',
    dueDate: daysFromNow(-3),
    assignee: 'daniel',
    status: 'completed',
  },
  {
    id: 't7',
    title: 'Renewal reminder email — Wayne Enterprises',
    type: 'email',
    relatedTo: 'Wayne Enterprises',
    priority: 'medium',
    dueDate: daysFromNow(1),
    assignee: 'priya',
    status: 'pending',
  },
]

export const RECENT_ACTIVITY = [
  { id: 'a1', text: 'Daniel Cho closed the deal with Umbrella Corp', time: '2h ago' },
  { id: 'a2', text: 'New lead captured: Wonka Industries', time: '4h ago' },
  { id: 'a3', text: 'Priya Nair logged a call with Hooli', time: '6h ago' },
  { id: 'a4', text: 'Contract sent to Soylent Corp for signature', time: '1d ago' },
]