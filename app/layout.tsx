import { QueryProvider } from "@/src/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminProvider } from "@/src/providers/admin-provider";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="indigo"
          themes={["indigo", "bright", "vibrant"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <Suspense fallback={null}>
              <AdminProvider>
                {children}
                <Toaster />
              </AdminProvider>
            </Suspense>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
