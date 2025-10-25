import { Link2 } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center">
          <Link2 className="h-6 w-6 text-primary" />
          <h1 className="ml-2 text-2xl font-bold tracking-tight text-foreground font-headline">
            Liinkedin
          </h1>
        </Link>
      </div>
    </header>
  );
}
