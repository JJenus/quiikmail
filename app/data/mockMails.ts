import type { Mail } from '~/types/mail'

export const mockMails: Mail[] = [
  {
    id: '1',
    from: { name: 'Sarah Chen', email: 'sarah.chen@acme.com', avatar: '' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: 'Q3 Design Review — Final Slides Attached',
    preview: 'Hi! I\'ve attached the final version of the Q3 design review slides. Please take a look before tomorrow\'s meeting and let me know if anything needs adjusting.',
    body: `Hi,\n\nI've attached the final version of the Q3 design review slides. Please take a look before tomorrow's meeting and let me know if anything needs adjusting.\n\nThe deck covers:\n- User research findings\n- Updated component library\n- Mobile redesign proposals\n\nLooking forward to your feedback!\n\nBest,\nSarah`,
    date: '2026-08-17T09:32:00Z',
    folder: 'inbox',
    read: false,
    starred: true,
    attachments: [
      { id: 'a1', name: 'Q3_Design_Review.pdf', size: 2400000, type: 'application/pdf' },
      { id: 'a2', name: 'Mockups_v3.fig', size: 8100000, type: 'application/octet-stream' }
    ],
    labels: ['design', 'meeting']
  },
  {
    id: '2',
    from: { name: 'Marcus Webb', email: 'm.webb@startupxyz.io' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: 'Partnership Opportunity — Let\'s Connect',
    preview: 'Hope this finds you well. I came across your work and think there\'s a real opportunity for our teams to collaborate on the upcoming product launch.',
    body: `Hi there,\n\nHope this finds you well. I came across your work and think there's a real opportunity for our teams to collaborate on the upcoming product launch.\n\nWould you have 20 minutes this week for a quick call?\n\nBest,\nMarcus`,
    date: '2026-08-17T08:14:00Z',
    folder: 'inbox',
    read: false,
    starred: false,
    labels: ['business']
  },
  {
    id: '3',
    from: { name: 'Lena Okafor', email: 'lena@devtools.co' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: 'Your invoice #INV-2026-084 is ready',
    preview: 'Your invoice for August services has been generated. Total: $3,200.00. Payment due: September 1, 2026.',
    body: `Hello,\n\nYour invoice for August services has been generated.\n\nInvoice #INV-2026-084\nTotal: $3,200.00\nDue: September 1, 2026\n\nYou can view and download your invoice from your account portal.\n\nThank you for your business!\n\nLena\nDevTools Billing`,
    date: '2026-08-16T16:45:00Z',
    folder: 'inbox',
    read: true,
    starred: false,
    attachments: [
      { id: 'a3', name: 'Invoice_INV-2026-084.pdf', size: 156000, type: 'application/pdf' }
    ]
  },
  {
    id: '4',
    from: { name: 'GitHub', email: 'noreply@github.com' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: '[quiikmail] PR #42 merged: Add dark mode support',
    preview: 'Pull request #42 "Add dark mode support" was merged into main by jjenus.',
    body: `PR #42 was merged into main.\n\nTitle: Add dark mode support\nMerged by: jjenus\nBranch: feat/dark-mode → main\n\nView the pull request on GitHub.`,
    date: '2026-08-16T14:22:00Z',
    folder: 'inbox',
    read: true,
    starred: false,
    labels: ['dev']
  },
  {
    id: '5',
    from: { name: 'Amara Diallo', email: 'amara@design.studio' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: 'Re: Logo concepts — round 2',
    preview: 'I\'ve incorporated all your feedback from last week. The new direction feels much stronger. See attached for three revised concepts.',
    body: `Hey,\n\nI've incorporated all your feedback from last week. The new direction feels much stronger.\n\nSee attached for three revised concepts — I'm partial to option B but curious what you think.\n\nHappy to jump on a quick call if you'd like to walk through them.\n\nAmara`,
    date: '2026-08-15T11:08:00Z',
    folder: 'inbox',
    read: true,
    starred: true,
    attachments: [
      { id: 'a4', name: 'Logo_Round2_A.png', size: 890000, type: 'image/png' },
      { id: 'a5', name: 'Logo_Round2_B.png', size: 920000, type: 'image/png' },
      { id: 'a6', name: 'Logo_Round2_C.png', size: 875000, type: 'image/png' }
    ]
  },
  {
    id: '6',
    from: { name: 'Me', email: 'me@quiikmail.com' },
    to: [{ name: 'Jordan Kim', email: 'jordan@techcorp.com' }],
    subject: 'Follow-up: Proposal for Q4 collaboration',
    preview: 'Hi Jordan, just wanted to follow up on the proposal I sent last week. Let me know if you have any questions.',
    body: `Hi Jordan,\n\nJust wanted to follow up on the proposal I sent last week.\n\nLet me know if you have any questions or if there's anything I can clarify.\n\nLooking forward to hearing from you!\n\nBest`,
    date: '2026-08-14T10:00:00Z',
    folder: 'sent',
    read: true,
    starred: false
  },
  {
    id: '7',
    from: { name: 'Me', email: 'me@quiikmail.com' },
    to: [{ name: 'Team', email: 'team@quiikmail.com' }],
    subject: 'Weekly sync notes — Aug 12',
    preview: 'Here are the notes from today\'s weekly sync. Key decisions: shipping v2.1 on Sept 3, new onboarding flow approved.',
    body: `Hi team,\n\nHere are the notes from today's weekly sync.\n\nKey decisions:\n- Shipping v2.1 on September 3\n- New onboarding flow approved\n- Design tokens migration starts next sprint\n\nFull notes in Notion.\n\nThanks everyone!`,
    date: '2026-08-12T17:30:00Z',
    folder: 'sent',
    read: true,
    starred: false
  },
  {
    id: '8',
    from: { name: 'Me', email: 'me@quiikmail.com' },
    to: [{ name: 'Client', email: 'client@bigco.com' }],
    subject: 'Draft: Project scope for Phase 2',
    preview: 'This is a work in progress. Still need to add timeline and budget section.',
    body: `Hi,\n\nI'm putting together the scope for Phase 2.\n\nStill need to add:\n- Timeline\n- Budget breakdown\n- Resource allocation\n\n[DRAFT — DO NOT SEND]`,
    date: '2026-08-17T07:15:00Z',
    folder: 'drafts',
    read: true,
    starred: false
  },
  {
    id: '9',
    from: { name: 'Promo Deals', email: 'deals@shopnow.com' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: '🔥 Flash Sale: 70% off everything — today only!',
    preview: 'Don\'t miss out on our biggest sale of the year. Shop now and save up to 70% across all categories.',
    body: `FLASH SALE — TODAY ONLY!\n\n70% off everything.\n\nUse code: FLASH70\n\nShop now at shopnow.com`,
    date: '2026-08-17T06:00:00Z',
    folder: 'spam',
    read: false,
    starred: false
  },
  {
    id: '10',
    from: { name: 'Old Newsletter', email: 'news@oldsite.com' },
    to: [{ name: 'Me', email: 'me@quiikmail.com' }],
    subject: 'Your monthly digest is here',
    preview: 'Here\'s what\'s been happening this month in the world of tech.',
    body: `Monthly Digest\n\nHere's what happened in tech this month...\n\n[Full digest content here]`,
    date: '2026-08-01T08:00:00Z',
    folder: 'archive',
    read: true,
    starred: false
  }
]
