import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">ChefConnect</span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/discover" className="text-gray-700 hover:text-primary">
              Find a Chef
            </Link>
            <Link href="/how-it-works" className="text-gray-700 hover:text-primary">
              How it Works
            </Link>
            <Link href="/become-a-chef" className="text-gray-700 hover:text-primary">
              Become a Chef
            </Link>
            <Button variant="default">Sign In</Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
