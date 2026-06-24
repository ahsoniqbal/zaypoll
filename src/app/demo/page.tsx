"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  MessageSquare,
  Users,
  BarChart2,
  Settings,
  Search,
  Bell,
  MoreHorizontal,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  UserPlus,
  Hash,
  User,
  LogOut,
  Compass,
  Plus,
} from "lucide-react";

// Type definition for our Poll data
type PollOption = {
  id: number;
  label: string;
  votes: number;
};

export default function PolilyHome() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      
      {/* --- Navbar --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-8 gap-4">
          {/* Logo (Left) */}
          <div className="flex items-center gap-2 shrink-0 w-40">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">P</div>
            <span className="text-xl font-bold hidden sm:block">Polily</span>
          </div>

          {/* Search (Center) */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search polls, topics, users..." className="pl-9 w-full" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 shrink-0 justify-end w-40">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>TC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Travel Community</p>
                        <p className="text-xs text-muted-foreground">Your poll "Swiss Alps" is trending!</p>
                      </div>
                      <span className="text-xs text-muted-foreground">2m</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>DC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dev Community</p>
                        <p className="text-xs text-muted-foreground">Sarah commented on your post.</p>
                      </div>
                      <span className="text-xs text-muted-foreground">1h</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>UI</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">UI/UX Designers</p>
                        <p className="text-xs text-muted-foreground">New poll available: "Figma vs Sketch"</p>
                      </div>
                      <span className="text-xs text-muted-foreground">3h</span>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div> 
      </header>

      {/* --- Main Layout --- */}
      <div className="flex w-full justify-center p-4 md:p-6 lg:p-8">
        {/* Increased from max-w-6xl to max-w-7xl for more total width */}
        <div className="flex w-full max-w-7xl gap-8"> 
          
          {/* Left Sidebar — reduced from w-60 to w-48 */}
          <aside className="hidden md:flex w-48 flex-col space-y-6 shrink-0 mt-4">
            
            {/* Navigation Card */}
            <Card className="p-2">
              <CardContent className="p-0 flex flex-col gap-1">
                <Button variant="ghost" className="justify-start gap-3 font-medium w-full text-sm">
                  <Home className="w-4 h-4" /> Feed
                </Button>
                <Button variant="ghost" className="justify-start gap-3 font-medium w-full text-sm">
                  <Compass className="w-4 h-4" /> Explore
                </Button>
                <Button variant="ghost" className="justify-start gap-3 font-medium w-full text-sm">
                  <Users className="w-4 h-4" /> Profile
                </Button>
                <Button variant="ghost" className="justify-start gap-3 font-medium w-full text-sm">
                  <Plus className="w-4 h-4" /> Create Poll
                </Button>
              </CardContent>
            </Card>

            {/* Topics Card */}
            <Card>
              <CardHeader className="border-b px-4 py-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">Popular Topics</h3>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5 px-4 py-3">
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">NextJS</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">TailwindCSS</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">UIUX</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">WebDev</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">Design</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">Productivity</Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs">RemoteWork</Badge>
              </CardContent>
            </Card>

          
          </aside>

          {/* Main Content — increased max-width from max-w-2xl to max-w-3xl */}
          <main className="flex-1 max-w-3xl w-full mt-4 min-w-0">
          
            {/* Feed Content */}
            <div className="space-y-6">
              
              {/* Poll 1: Static representation of already voted state */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>OM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Travel Community</p>
                    <p className="text-xs text-muted-foreground">Posted 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent>
                  <h2 className="text-lg font-semibold mb-4">Which mountain destination would you visit this summer?</h2>
                  <div className="space-y-3">
                    {/* Static Swiss Alps Voted */}
                    <div className="group relative w-full overflow-hidden rounded-lg border border-primary p-3">
                      <div className="absolute inset-y-0 left-0 bg-primary/20 w-[42%] transition-all"></div>
                      <div className="relative flex justify-between items-center font-medium text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                          </span>
                          Swiss Alps
                        </span>
                        <span className="text-primary">42%</span>
                      </div>
                    </div>
                    {/* Static Dolomites Unvoted */}
                    <div className="group relative w-full overflow-hidden rounded-lg border p-3">
                      <div className="absolute inset-y-0 left-0 bg-muted w-[31%] transition-all"></div>
                      <div className="relative flex justify-between items-center font-medium text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></span>
                          Dolomitis, Italy
                        </span>
                        <span className="text-muted-foreground">31%</span>
                      </div>
                    </div>
                    {/* Static Banff Unvoted */}
                    <div className="group relative w-full overflow-hidden rounded-lg border p-3">
                      <div className="absolute inset-y-0 left-0 bg-muted w-[15%] transition-all"></div>
                      <div className="relative flex justify-between items-center font-medium text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></span>
                          Banff, Canada
                        </span>
                        <span className="text-muted-foreground">15%</span>
                      </div>
                    </div>
                    {/* Static Patagonia Unvoted */}
                    <div className="group relative w-full overflow-hidden rounded-lg border p-3">
                      <div className="absolute inset-y-0 left-0 bg-muted w-[12%] transition-all"></div>
                      <div className="relative flex justify-between items-center font-medium text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></span>
                          Patagonia
                        </span>
                        <span className="text-muted-foreground">12%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer"><MessageCircle className="w-4 h-4" /> 24 Comments</span>
                      <span className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer"><Heart className="w-4 h-4" /> 156</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Share2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>

              {/* Poll 2: Interactive Pollable State */}
              <InteractivePollCard />

            </div>
          </main>

          {/* Right Sidebar — reduced from w-72 to w-60 */}
          <aside className="hidden lg:flex w-60 flex-col space-y-6 shrink-0 mt-4">
            
            {/* Suggestions Card */}
            <Card>
              <CardHeader className="border-b px-4 py-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"><UserPlus className="w-4 h-4" /> Suggestions</h3>
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
                <h3 className="font-semibold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Active Polls</h3>
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
        </div>
      </div>
    </div>
  );
}

// --- Interactive Poll Component ---
function InteractivePollCard() {
  // 1. Define initial state for the options
  const [options, setOptions] = useState<PollOption[]>([
    { id: 1, label: "Next.js / React", votes: 145 },
    { id: 2, label: "Vue.js / Nuxt", votes: 68 },
    { id: 3, label: "Svelte / SvelteKit", votes: 42 },
    { id: 4, label: "Angular", votes: 35 },
  ]);
  
  // 2. Track whether the user has voted, and which option they chose
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  // 3. Calculate total votes dynamically
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

  // 4. Handle click event to cast a vote
  const handleVote = (optionId: number) => {
    if (selectedOptionId !== null) return; // Prevent voting twice

    setSelectedOptionId(optionId);
    setOptions((prevOptions) =>
      prevOptions.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar>
          <AvatarImage src="https://github.com/vercel.png" alt="Vercel" />
          <AvatarFallback>UI</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">Dev Community</p>
          <p className="text-xs text-muted-foreground">Posted just now</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
      </CardHeader>
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">Which framework do you use most for web development?</h2>
        
        <div className="space-y-3">
          {options.map((option) => {
            // Calculate percentage based on current state
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isSelected = selectedOptionId === option.id;
            const hasVoted = selectedOptionId !== null;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`group relative w-full overflow-hidden rounded-lg border p-3 text-left transition-all
                  ${isSelected ? "border-primary" : "border-border"} 
                  ${!hasVoted ? "hover:border-primary/50 hover:bg-accent cursor-pointer" : "cursor-default"}`}
              >
                {/* Progress Bar Background */}
                <div 
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out
                    ${isSelected ? "bg-primary/20" : "bg-muted"} 
                    ${hasVoted ? "w-[var(--width)]" : "w-0 group-hover:w-2"}`}
                  style={{ "--width": `${percentage}%` } as React.CSSProperties}
                />
                
                {/* Content Layer */}
                <div className="relative flex justify-between items-center font-medium text-sm">
                  <span className="flex items-center gap-2">
                    {/* Custom Radio Button UI */}
                    <span 
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                        ${isSelected ? "border-primary" : "border-muted-foreground/30"}`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                    </span>
                    {option.label}
                  </span>
                  
                  {/* Show Percentage only after voting */}
                  {hasVoted && (
                    <span className={`${isSelected ? "text-primary" : "text-muted-foreground"} transition-opacity`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="flex gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer"><MessageCircle className="w-4 h-4" /> 12 Comments</span>
            <span className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer"><Heart className="w-4 h-4" /> 89</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {totalVotes} votes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}