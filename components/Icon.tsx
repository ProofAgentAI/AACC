import {
  Globe,
  Handshake,
  Briefcase,
  Mic,
  Calendar,
  Building2,
  Plane,
  Users,
  BarChart3,
  Shield,
  Flame,
  Wheat,
  Cpu,
  Sun,
  HeartPulse,
  Truck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  globe: Globe,
  handshake: Handshake,
  briefcase: Briefcase,
  mic: Mic,
  calendar: Calendar,
  building: Building2,
  plane: Plane,
  users: Users,
  chart: BarChart3,
  shield: Shield,
  flame: Flame,
  wheat: Wheat,
  cpu: Cpu,
  sun: Sun,
  heartpulse: HeartPulse,
  truck: Truck,
};

export default function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: string;
  className?: string;
}) {
  const LucideComponent = iconMap[name] ?? Globe;
  return <LucideComponent className={className} aria-hidden="true" />;
}
