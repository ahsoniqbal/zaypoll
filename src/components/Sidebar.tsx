"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Compass, User, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { AppButton } from "./AppButton";

export default function Sidebar({
    isLoggedIn,
    username,
}: {
    isLoggedIn: boolean;
    username: string | null;
}) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { open } = useAuthModal();

    const navItems = [
        { name: "Feed", href: "/", icon: Home },
        { name: "Explore", href: "/explore", icon: Compass },
        {
            name: "Profile",
            href: `/user/${username}`,
            icon: User,
            authRequired: true,
        },
    ];

    const handleCreatePollClick = () => {
        if (!isLoggedIn) {
            open();
            return;
        }
        router.push("/polls/create");
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="md:hidden fixed top-16 left-4 z-50 bg-primary text-white px-3 py-2 rounded-md shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            {/* ✅ Sidebar */}
            <aside className="hidden md:flex w-48 flex-col space-y-6 shrink-0 mt-4"
            //         className={`
            //   fixed md:sticky top-0 left-0 h-screen w-64 bg-background border-r
            //   flex flex-col justify-between p-4
            //   transform transition-transform duration-300 z-40
            //   ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            // `}
            >
                {/* Top */}
                <Card className="p-2">
                    <CardContent className="p-0 flex flex-col gap-1">

                        {navItems.map((item) => {
                            if (item.authRequired && !isLoggedIn) return null;

                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>


                            );
                        })}

                        {/* ✅ Create Poll Button */}
                        <AppButton
                            onClick={handleCreatePollClick}
                            className="mt-6 w-full gap-2"
                            size="sm"
                        >
                            <PlusCircle size={16} />
                            Create Poll
                        </AppButton>
                    </CardContent>
                </Card>
                {/* Topics Card */}
                <Card>
                    <CardHeader className="border-b">
                        <h3 className="font-semibold flex items-center gap-2">Popular Topics</h3>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">NextJS</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">TailwindCSS</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">UIUX</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">WebDev</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Design</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Productivity</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">RemoteWork</Badge>
                    </CardContent>
                </Card>
                {/* ✅ Footer */}
                <div className="text-xs text-muted-foreground text-center">
                    © {new Date().getFullYear()} Zaypoll
                </div>
            </aside>

            {/* ✅ Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 md:hidden z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}