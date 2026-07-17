import { TrendingUp, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";

export default function RightSidebar() {
    return (
        <aside className="hidden lg:flex w-60 flex-col space-y-6 shrink-0 mt-4">

            {/* Suggestions Card */}
            <Card>
                <CardHeader className="border-b px-4 py-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Suggestions</h3>
                </CardHeader>
                <CardContent className="space-y-3 px-4 py-3">
                    {[ 
                        { name: "Tech Daily", desc: "Technology & Gadgets" },
                        { name: "Design Hub", desc: "UI/UX Inspiration" },
                        { name: "Travel Bugs", desc: "Explore the world" }
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarFallback className="text-xs">{item.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{item.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0 text-xs h-7 px-2.5">Follow</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Active Polls Card */}
            <Card>
                <CardHeader className="border-b px-4 py-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Active Polls</h3>
                </CardHeader>
                <CardContent className="space-y-3 px-4 py-3">
                    <div className="space-y-1 pb-3 border-b last:border-0 last:pb-0">
                        <p className="text-xs font-medium leading-tight">Best programming language for beginners in 2024?</p>
                        <div className="flex justify-between items-center mt-1.5">
                            <span className="text-[11px] text-muted-foreground">2,430 votes</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Trending</Badge>
                        </div>
                    </div>
                    <div className="space-y-1 pb-3 border-b last:border-0 last:pb-0">
                        <p className="text-xs font-medium leading-tight">Should remote work become the new standard?</p>
                        <div className="flex justify-between items-center mt-1.5">
                            <span className="text-[11px] text-muted-foreground">1,890 votes</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Hot</Badge>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium leading-tight">Which OS do you prefer for development?</p>
                        <div className="flex justify-between items-center mt-1.5">
                            <span className="text-[11px] text-muted-foreground">1,120 votes</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">New</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </aside>
    );
}