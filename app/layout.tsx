import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/provider";
// import { AuthProvider } from "@/components/auth";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/app/utility/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Utility Dashboard",
  description: "Utility Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class" 
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Provider>
            {/* <AuthProvider> */}
            {children}
            <Toaster />
            {/* </AuthProvider> */}
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
