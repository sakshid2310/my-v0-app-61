"use client"

interface ClientLogoProps {
  client: {
    name: string
    logo?: string
  }
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ClientLogo({ client, size = "md", className = "" }: ClientLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg"
  }

  if (client.logo) {
    return (
      <img 
        src={client.logo || "/placeholder.svg"} 
        alt={`${client.name} logo`}
        className={`${sizeClasses[size]} rounded-lg object-cover border border-gray-200 shadow-sm ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm ${className}`}>
      {client.name.charAt(0).toUpperCase()}
    </div>
  )
}
