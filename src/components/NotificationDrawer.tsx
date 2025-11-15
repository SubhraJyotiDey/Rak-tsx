import { Notification } from "@/types/bloodRequest";
import { Card } from "./ui/card";
import { X } from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
}

export const NotificationDrawer = ({
  isOpen,
  notifications,
  onClose,
}: NotificationDrawerProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <Card className="fixed top-[68px] right-4 w-80 max-h-[80vh] overflow-y-auto z-50 transition-all duration-300 ease-out">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                <p className="text-sm mb-1">{notif.message}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
};
