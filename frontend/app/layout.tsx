import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, EB_Garamond } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner"

const ebGaramondHeading = EB_Garamond({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Picto | A little more imagination for your photos",
    template: "%s | Picto",
  },
  description:
    "A thoughtful home for your photos, with AI-powered tools to reimagine the moments you already love.",
  keywords: [
    "photo storage",
    "organize photos",
    "photo albums",
    "photo library",
    "AI photo editing",
  ],
  applicationName: "Picto",
  openGraph: {
    type: "website",
    siteName: "Picto",
    title: "Picto | A little more imagination for your photos",
    description:
      "A thoughtful home for your photos, with AI-powered tools to reimagine the moments you already love.",
  },
  twitter: {
    card: "summary",
    title: "Picto | A little more imagination for your photos",
    description:
      "A thoughtful home for your photos, with AI-powered tools to reimagine the moments you already love.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", notoSans.variable, ebGaramondHeading.variable)}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
            </QueryProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
