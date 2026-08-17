export function useMailFormat() {
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })
  }

  function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  function getAvatarColor(name: string): string {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
      'bg-amber-500', 'bg-teal-500', 'bg-indigo-500',
      'bg-cyan-500', 'bg-pink-500', 'bg-orange-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]!
  }

  function getFileIcon(type: string): string {
    if (type.startsWith('image/')) return 'i-lucide-image'
    if (type === 'application/pdf') return 'i-lucide-file-text'
    if (type.includes('spreadsheet') || type.includes('excel')) return 'i-lucide-table'
    if (type.includes('word') || type.includes('document')) return 'i-lucide-file-text'
    if (type.includes('zip') || type.includes('compressed')) return 'i-lucide-archive'
    return 'i-lucide-paperclip'
  }

  return { formatDate, formatFullDate, formatFileSize, getInitials, getAvatarColor, getFileIcon }
}
