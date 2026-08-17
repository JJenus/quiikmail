# QuiikMail

A fast, clean email client built with **Nuxt 4**, **Nuxt UI 4**, and **Tailwind CSS 4**.

## Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 4 |
| UI Components | Nuxt UI 4 (Radix + Tailwind) |
| Styling | Tailwind CSS 4 + custom violet palette |
| State | `useMailStore` composable (reactive singleton) |
| Icons | Lucide (via `@iconify-json/lucide`) |

## Project structure

```
app/
├── assets/css/main.css          # Custom color palette + global styles
├── components/
│   ├── base/                    # Fully reusable primitives
│   │   ├── EmptyState.vue
│   │   ├── IconBtn.vue
│   │   ├── MailAvatar.vue
│   │   └── MailLabel.vue
│   └── mail/                    # Mail-specific components
│       ├── AttachmentItem.vue
│       ├── MailCompose.vue
│       ├── MailDetail.vue
│       ├── MailList.vue
│       ├── MailListItem.vue
│       ├── MailSidebar.vue
│       ├── MailTopBar.vue
│       └── SidebarItem.vue
├── composables/
│   ├── useMailStore.ts          # Central reactive state + all actions
│   └── useMailFormat.ts         # Date, file size, avatar colour helpers
├── data/
│   └── mockMails.ts             # Mock data — remove when API is ready
├── pages/
│   └── index.vue                # App shell (sidebar + list + detail)
├── plugins/
│   └── mailService.ts           # Nuxt plugin — provides $mail service
├── services/
│   └── mailService.ts           # ← YOUR API INTEGRATION GOES HERE
└── types/
    └── mail.ts                  # All TypeScript interfaces
```

## Connecting your API

1. Open `app/services/mailService.ts`
2. Replace each stub method with real HTTP calls (axios, fetch, $fetch, etc.)
3. In `app/composables/useMailStore.ts`, replace the mock data imports with calls to `useNuxtApp().$mail`

```ts
// Example — replace mock in setFolder():
async function setFolder(folder: MailFolder) {
  state.activeFolder = folder
  state.loading = true
  const { $mail } = useNuxtApp()
  state.mails = await $mail.fetchMails({ folder })
  state.loading = false
}
```

## Dev

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run preview
```

## Color palette

Primary: violet (`#7C3AED` / Tailwind `violet-600`)  
Page background: `#EEE9FF` (lavender)  
Custom CSS vars: `--color-qm-50` → `--color-qm-900`
