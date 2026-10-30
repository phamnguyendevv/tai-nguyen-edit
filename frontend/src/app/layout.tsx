import type { Metadata } from 'next';
import { PlayerProvider } from '@/lib/audio/player-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { LanguageProvider } from '@/lib/i18n/language-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Magnific Sound Effects | Audio Library',
  description:
    'Discover, audition, and download high-quality sound effects for film, games, and creative content.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-[#0d0d0d] text-white">
      <body className="min-h-screen bg-[#0d0d0d] text-white antialiased">
        <LanguageProvider>
          <AuthProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
