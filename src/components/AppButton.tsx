import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode } from "react"

type AppButtonProps = {
  children: ReactNode
  icon?: ReactNode
  href?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "icon" | "lg"
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit"
  isLoading?: boolean
  loadingText?: string
}

export function AppButton({
  children,
  icon,
  href,
  variant = "secondary",
  size = "lg",
  className,
  disabled,
  onClick,
  type = "button",
  isLoading,
  loadingText,
}: AppButtonProps) {

  
  const content = (
    <>
      {icon && <span className="w-4 h-4 mr-1">{icon}</span>}
      {isLoading ? loadingText || "Loading..." : children}
    </>
  )

  // const baseStyles = "rounded-full text-sm font-semibold transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

const baseStyles = "rounded-full font-medium transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  
  if (href) {
    return (
      <Button asChild variant={variant} size={size} className={cn(baseStyles, className)}>
        <Link href={href}>{content}</Link>
      </Button>
    )
  }

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(baseStyles, className)}
    >
      {content}
    </Button>
  )
}
