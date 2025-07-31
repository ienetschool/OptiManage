import QuickSale from "@/pages/QuickSale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QuickSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickSaleModal({ open, onOpenChange }: QuickSaleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Sale - Point of Sale</DialogTitle>
          <DialogDescription>Process sales transactions quickly and efficiently</DialogDescription>
        </DialogHeader>
        <QuickSale onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}