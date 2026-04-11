"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const items = [
    { name: "Home", href: "/" },
    { name: "BMI Calculator", href: "/calculators/bmi" },
    { name: "My Plan", href: "/plans" },
    { name: "New Plan", href: "/start" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex justify-around p-3 pb-20 mt-3 md:pb-6 md:hidden">
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`text-sm ${
            pathname === item.href ? "text-zinc-50" : "text-zinc-400"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
