"use client";

import * as React from "react";
import { Moon, Sun, Palette, Sparkles, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Växla tema (Nuvarande: {theme})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("indigo")} className="gap-2">
          <Zap className="h-4 w-4 text-indigo-500" />
          <span>Indigo (Mörkt)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("bright")} className="gap-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <span>Bright (Ljust)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("vibrant")} className="gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span>Vibrant (Färgglatt)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}