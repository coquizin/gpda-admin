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