declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    email?: string | null
  }

  interface UserSession {
    loggedInAt?: Date
  }
}

export {}
