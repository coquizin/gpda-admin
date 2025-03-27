  // Get initials for avatar
export const getInitials = (name: string | null | undefined) => {
  if (!name) return ""

  return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
}


export const getFirstLastName = (name: string) => {
    if (!name) {
        return ""
    }

    const parts = name.split(" ")
    if (parts.length < 2) {
        return name
    }
    const firstName = parts[0]
    const lastName = parts[parts.length - 1]
    return firstName + " " + lastName
}