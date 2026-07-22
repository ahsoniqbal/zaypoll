import Link from "next/link";
import { ArrowRight, Compass, PlusCircle } from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";

export default function RightSidebar() {
  return (
    <aside className="sticky top-20 mt-4 hidden h-fit w-60 shrink-0 flex-col space-y-4 lg:flex">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-3">
          <h2 className="text-sm font-semibold">Discover</h2>
        </CardHeader>
        <CardContent className="p-2">
          <Link
            href="/explore"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
          >
            <Compass className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Explore topics</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            href="/polls/create"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
          >
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">Create a poll</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <p className="px-2 text-xs leading-5 text-muted-foreground">
        Ask clearly. Vote thoughtfully. Explain your perspective.
      </p>
    </aside>
  );
}
