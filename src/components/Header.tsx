import { Bell, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface HeaderProps {
  hospitalName: string;
  notificationCount: number;
  onNotificationClick: () => void;
  onLogout: () => void;
}

export const Header = ({
  hospitalName,
  notificationCount,
  onNotificationClick,
  onLogout,
}: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground py-4 shadow-raktsetu relative z-50">
      <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl text-primary">
            RS
          </div>
          <div>
            <div className="text-xl font-bold">RaktSetu Hospital Panel</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onNotificationClick}
            className="relative p-2 hover:bg-white/10 rounded-full transition"
          >
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-warn text-xs">
                {notificationCount}
              </Badge>
            )}
          </button>
          <Button
            onClick={onLogout}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
