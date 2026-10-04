import { CircleX, Diamond, Hand, Leaf, Sun } from "lucide-react"
import type { Candidate } from "../types"

const icons = { leaf: Leaf, sun: Sun, hand: Hand, kite: Diamond, nota: CircleX }

export default function SymbolIcon({
  code,
  size = 28,
}: {
  code: Candidate["symbolCode"]
  size?: number
}) {
  const Icon = icons[code] || CircleX
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
