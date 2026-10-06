import { Fredoka } from 'next/font/google';
import './globals.css';

// Configure the kid-friendly Fredoka font
const fredoka = Fredoka({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'] 
});

export const metadata = {
  title: 'Funny - Kids AI Chat Friend',
  description: 'A fun and safe chat friend for kids!',
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
