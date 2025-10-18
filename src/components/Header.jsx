import { Bell, MessageCircle, User, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import logo from 'figma:asset/ebe8de786eb7061b5d2d3426d7c9c5742fd1e627.png';

export function Header({ userName = "Guest", notificationCount = 0, messageCount = 0 }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logo}
            alt="Table & Plate logo" 
            className="h-10 w-auto"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Messages */}
          <Button variant="ghost" size="sm" className="relative rounded-2xl">
            <MessageCircle className="w-5 h-5" />
            {messageCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-white text-black">
                {messageCount > 9 ? '9+' : messageCount}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative rounded-2xl">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-white text-black">
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="rounded-2xl">
            <Settings className="w-5 h-5" />
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="sm" className="rounded-2xl flex items-center gap-2 px-3">
            <User className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">{userName}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}