import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this record? This action cannot be undone.",
  confirmLabel = "Delete Record",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`p-3 rounded-full flex-shrink-0 ${isDestructive
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-600"
              }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-base font-semibold text-[#16264a]">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-1 leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-row justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className={isDestructive ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isLoading && <Spinner className="mr-2 h-4 w-4 text-white" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

