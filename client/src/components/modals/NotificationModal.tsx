import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const notifications = [
  {
    id: 1,
    type: "appointment",
    title: "New appointment booked",
    message: "Sarah Johnson scheduled for 2:30 PM today",
    time: "5 minutes ago",
    color: "bg-blue-500",
  },
  {
    id: 2,
    type: "inventory",
    title: "Low stock alert",
    message: "Ray-Ban Aviator Classic needs reordering",
    time: "1 hour ago",
    color: "bg-amber-500",
  },
  {
    id: 3,
    type: "payment",
    title: "Payment received",
    message: "$450 payment for order #INV-2024-0156",
    time: "2 hours ago",
    color: "bg-emerald-500",
  },
];

export default function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg">
              <div className={`w-2 h-2 ${notification.color} rounded-full mt-2`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                <p className="text-xs text-slate-600">{notification.message}</p>
                <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No new notifications
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
