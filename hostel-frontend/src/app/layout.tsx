import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'Smart Hostel Management',
  description: 'Comprehensive hostel management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}