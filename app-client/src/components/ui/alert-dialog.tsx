"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onAction: () => void;
  variant?: "default" | "destructive";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = "Anuluj",
  actionText = "Potwierdź",
  onAction,
  variant = "default",
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg animate-in zoom-in-95 fade-in">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={() => {
                onAction();
                onOpenChange(false);
              }}
            >
              {actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
