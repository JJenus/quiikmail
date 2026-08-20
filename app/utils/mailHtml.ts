import DOMPurify from 'dompurify'

const URL_RE = /https?:\/\/[^\s<>"']+/g

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

let hooksRegistered = false

function registerHooks() {
  if (hooksRegistered) return
  hooksRegistered = true
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('style', 'max-width:100%;height:auto')
    }
  })
}

/** Sanitizes an HTML email body. Client-only: returns '' during SSR. */
export function sanitizeMailHtml(html: string): string {
  if (import.meta.server) return ''
  registerHooks()
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style'],
    ADD_ATTR: ['target', 'rel']
  })
}

/** Escapes a plain-text body and turns URLs into links that open in a new tab. */
export function linkifyMailText(text: string): string {
  return escapeHtml(text).replace(URL_RE, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
}
