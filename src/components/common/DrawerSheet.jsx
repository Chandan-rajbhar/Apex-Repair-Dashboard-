import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DrawerSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  widthClass = "sm:max-w-xl md:max-w-2xl",
}) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={`w-full ${widthClass} p-0 flex flex-col h-full bg-white z-50`}
      >
        <SheetHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <SheetTitle className="text-xl font-bold text-[#16264a]">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-xs text-slate-500 mt-1">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {children}
        </div>

        {footer !== undefined ? (
          footer
        ) : (
          <SheetFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex flex-row justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="bg-[#223f6b] hover:bg-[#16264a] text-white"
              >
                {isSubmitting && (
                  <Spinner className="mr-2 h-4 w-4 text-white" />
                )}
                {submitLabel}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

