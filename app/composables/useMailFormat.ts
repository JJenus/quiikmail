export function useMailFormat() {
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })
  }

  function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString([], {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  function getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  // Deterministic color from name — matches design avatars
  function getAvatarBg(name: string): string {
    const colors = [
      '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B',
      '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]!
  }

  function getFileIcon(type: string): { icon: string; color: string } {
    if (type === 'application/pdf') return { icon: 'i-lucide-file-text', color: '#EF4444' }
    if (type.includes('word') || type.includes('msword') || type.includes('doc'))
      return { icon: 'i-lucide-file-text', color: '#3B82F6' }
    if (type.startsWith('image/')) return { icon: 'i-lucide-image', color: '#10B981' }
    if (type.includes('spreadsheet') || type.includes('excel')) return { icon: 'i-lucide-table', color: '#10B981' }
    return { icon: 'i-lucide-paperclip', color: '#6B7280' }
  }

  return { formatDate, formatFullDate, formatFileSize, getInitials, getAvatarBg, getFileIcon }
}
