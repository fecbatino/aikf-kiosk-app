import { ArrowLeft, ArrowRight, BadgeInfo, BookOpen, Check, ChevronRight, CreditCard, Globe2, HandHeart, Heart, HeartHandshake, Landmark, Languages, LockKeyhole, Moon, MoonStar, RotateCcw, Settings2, ShieldCheck, Smartphone, Sun, UsersRound, X, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  heart: Heart, mosque: HeartHandshake, hand: HandHeart, card: CreditCard,
  bank: Landmark, phone: Smartphone, book: BookOpen, moon: MoonStar,
  night: Moon, sun: Sun, lock: LockKeyhole, shield: ShieldCheck, check: Check,
  arrow: ArrowRight, back: ArrowLeft, chevron: ChevronRight, close: X,
  globe: Globe2, languages: Languages, users: UsersRound, settings: Settings2, info: BadgeInfo, reset: RotateCcw,
};
export default function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const Symbol = icons[name] || Heart;
  return <Symbol aria-hidden="true" size={size} strokeWidth={1.8} absoluteStrokeWidth />;
}
