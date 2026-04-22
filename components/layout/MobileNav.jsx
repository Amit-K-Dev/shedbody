"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Calculator, ClipboardList, PlusCircle } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const items = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "BMI", href: "/calculators/bmi", icon: Calculator },
    { name: "My Plan", href: "/plans", icon: ClipboardList },
    { name: "New Plan", href: "/start", icon: PlusCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center px-2 py-3 pb-safe md:hidden z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full gap-1.5 transition-all ${
              active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <item.icon
              size={22}
              className={
                active
                  ? "scale-110 transition-transform"
                  : "transition-transform"
              }
            />
            <span className="text-[10px] font-semibold tracking-wide">
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
