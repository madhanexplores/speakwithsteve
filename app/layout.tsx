import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider, ErrorBoundary } from '@/components/FirebaseProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpeakWithSteve | Your AI English Tutor',
  description: 'Practice English by talking with Steve, your AI speaking partner. Improve pronunciation, fix grammar, and build confidence.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
