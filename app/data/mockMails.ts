import type { Mail } from '~/types/mail'

export const mockMails: Mail[] = [
  {
    id: '1',
    from: { name: 'Binford Ltd.', email: 'binford.mitc@example.com', avatar: '' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'Your Package Has Arrived!!! 🎉',
    preview: 'Your package from Binford Ltd. is scheduled for delivery on 05 Sep at 5:40 PM. Please ensure someone is available to receive it.',
    body: `Hi Courtney Henry,\n\nWe're excited to inform you that your package from Binford Ltd. has arrived at our 292 Westheimer Rd. Santa Ana, Illinois facility. It's ready for pickup at your convenience.\n\nThank you for choosing Binford Ltd.! If you have any questions or require assistance, please don't hesitate to contact our customer support team at (225) 555-0118 or support.binford@example.com.\n\nBest regards,\nThe Binford Ltd. Team`,
    date: '2024-09-13T17:40:00Z',
    folder: 'inbox',
    read: false,
    starred: true,
    attachments: [
      { id: 'a1', name: 'Receipt.pdf', size: 204800, type: 'application/pdf' },
      { id: 'a2', name: 'Instructions.doc', size: 512000, type: 'application/msword' },
      { id: 'a3', name: 'Return Policy.pdf', size: 153600, type: 'application/pdf' }
    ],
    labels: ['Social']
  },
  {
    id: '2',
    from: { name: 'Bank of America', email: 'statements@bankofamerica.com', avatar: '' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'Your Monthly Statement',
    preview: 'Your monthly statement for August is now available for viewing. Please review it for any discrepancies.',
    body: `Dear Valued Customer,\n\nYour monthly statement for August is now available for viewing in your online account.\n\nPlease review it carefully for any discrepancies or unauthorized transactions. If you notice anything unusual, contact us immediately.\n\nThank you for banking with Bank of America.\n\nBest regards,\nBank of America Team`,
    date: '2024-09-13T17:40:00Z',
    folder: 'inbox',
    read: false,
    starred: false,
    attachments: [
      { id: 'a4', name: 'Statement_Aug.pdf', size: 340000, type: 'application/pdf' }
    ],
    labels: ['Social'],
    threadCount: 2,
    extraAvatars: 1
  },
  {
    id: '3',
    from: { name: 'Marvin McKinney', email: 'marvin.mckinney@example.com', avatar: '' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'New Message from Friend',
    preview: 'How are you doing? I wanted to catch up and see if you\'re free to grab coffee sometime this week. Let me know if you\'re available!',
    body: `Hey!\n\nHow are you doing? I wanted to catch up and see if you're free to grab coffee sometime this week. It's been too long!\n\nLet me know if you're available — I'm pretty flexible with timing.\n\nCheers,\nMarvin`,
    date: '2024-09-10T13:57:00Z',
    folder: 'inbox',
    read: true,
    starred: false,
    labels: ['Personal'],
    threadCount: 4
  },
  {
    id: '4',
    from: { name: 'MasterCard', email: 'security@mastercard.com', avatar: '' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'Password Reset Request',
    preview: 'A password reset request has been made for your account. If you did not initiate this request, please ignore this email. To reset your password...',
    body: `Dear Cardholder,\n\nA password reset request has been made for your MasterCard online account.\n\nIf you did not initiate this request, please ignore this email — your account remains secure.\n\nTo reset your password, click the link below within the next 24 hours:\n[Reset Password Link]\n\nFor security concerns, call 1-800-555-0100.\n\nRegards,\nMasterCard Security Team`,
    date: '2024-09-10T13:57:00Z',
    folder: 'inbox',
    read: true,
    starred: false,
    labels: []
  },
  {
    id: '5',
    from: { name: 'Nikulas', email: 'nikulas@newsletter.com', avatar: '' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'Newsletter Subscription',
    preview: 'Thank you for subscribing to our newsletter. You will receive weekly updates on the latest news and offers.',
    body: `Hi there!\n\nThank you for subscribing to our newsletter. You'll receive weekly updates on the latest news, tips, and exclusive offers.\n\nStay tuned!\n\nThe Newsletter Team`,
    date: '2024-09-07T13:57:00Z',
    folder: 'inbox',
    read: true,
    starred: false,
    labels: []
  },
  {
    id: '6',
    from: { name: 'Me', email: 'edwards.ralph@example.com' },
    to: [{ name: 'Jordan Kim', email: 'jordan@techcorp.com' }],
    subject: 'Follow-up: Q4 Collaboration Proposal',
    preview: 'Hi Jordan, just following up on the proposal I sent last week.',
    body: `Hi Jordan,\n\nJust following up on the proposal I sent last week. Let me know if you have any questions.\n\nBest`,
    date: '2024-09-06T10:00:00Z',
    folder: 'sent',
    read: true,
    starred: false
  },
  {
    id: '7',
    from: { name: 'Me', email: 'edwards.ralph@example.com' },
    to: [{ name: 'Team', email: 'team@quiikmail.com' }],
    subject: 'Weekly sync notes — Aug 12',
    preview: 'Here are the notes from today\'s weekly sync. Key decisions inside.',
    body: `Hi team,\n\nHere are the notes from today's weekly sync.\n\nKey decisions:\n- Shipping v2.1 on September 3\n- New onboarding flow approved\n\nThanks everyone!`,
    date: '2024-08-12T17:30:00Z',
    folder: 'sent',
    read: true,
    starred: false
  },
  {
    id: '8',
    from: { name: 'Me', email: 'edwards.ralph@example.com' },
    to: [{ name: 'Client', email: 'client@bigco.com' }],
    subject: 'Draft: Project scope for Phase 2',
    preview: 'Work in progress — need to add timeline and budget.',
    body: `Hi,\n\nI'm putting together the scope for Phase 2.\n\n[DRAFT — DO NOT SEND]`,
    date: '2024-09-17T07:15:00Z',
    folder: 'drafts',
    read: true,
    starred: false
  },
  {
    id: '9',
    from: { name: 'Promo Deals', email: 'deals@shopnow.com' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: '🔥 Flash Sale: 70% off today only!',
    preview: 'Don\'t miss our biggest sale of the year.',
    body: `FLASH SALE — TODAY ONLY!\n\n70% off everything. Use code: FLASH70`,
    date: '2024-09-17T06:00:00Z',
    folder: 'spam',
    read: false,
    starred: false
  },
  {
    id: '10',
    from: { name: 'Old Newsletter', email: 'news@oldsite.com' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'Your monthly digest is here',
    preview: 'Here\'s what\'s been happening this month in tech.',
    body: `Monthly Digest\n\nHere's what happened in tech this month...`,
    date: '2024-08-01T08:00:00Z',
    folder: 'archive',
    read: true,
    starred: false
  },
  {
    id: '11',
    from: { name: 'GitHub', email: 'noreply@github.com' },
    to: [{ name: 'Me', email: 'edwards.ralph@example.com' }],
    subject: 'Important: deleted item',
    preview: 'A repository you had access to has been deleted.',
    body: `A repository you had access to has been deleted.`,
    date: '2024-09-01T08:00:00Z',
    folder: 'trash',
    read: true,
    starred: false
  }
]
