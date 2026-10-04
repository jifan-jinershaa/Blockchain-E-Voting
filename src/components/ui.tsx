import { motion, type HTMLMotionProps } from "motion/react"
import type { ReactNode } from "react"
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react"

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost"
}) {
  return (
    <motion.button
      whileHover={props.disabled ? undefined : { y: -1 }}
      whileTap={props.disabled ? undefined : { scale: 0.98 }}
      className={`button button-${variant} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function Page({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.main
      id="main-content"
      className={`page ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.main>
  )
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`card ${className}`}>{children}</div>
}

export function Alert({
  children,
  tone = "error",
}: {
  children: ReactNode
  tone?: "error" | "info" | "success"
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle
  return (
    <div
      className={`alert alert-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={20} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>
}
