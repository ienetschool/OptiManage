import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuickSale from "@/pages/QuickSale";

interface QuickSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickSaleModal({ open, onOpenChange }: QuickSaleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Quick Sale</DialogTitle>
          <DialogDescription>
            Process a quick sale transaction
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0 h-full overflow-auto">
          <QuickSale onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}