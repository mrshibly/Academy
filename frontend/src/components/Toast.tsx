"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((text: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Automatically remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast Stack Overlay */}
      <div style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "24rem",
        width: "100%"
      }}>
        {toasts.map((toast) => {
          let bgColor = "white";
          let borderColor = "var(--border-color)";
          let textColor = "var(--text-primary)";
          let Icon = Info;

          if (toast.type === "success") {
            bgColor = "#ecfdf5";
            borderColor = "#a7f3d0";
            textColor = "#065f46";
            Icon = CheckCircle;
          } else if (toast.type === "error") {
            bgColor = "#fef2f2";
            borderColor = "#fecaca";
            textColor = "#991b1b";
            Icon = AlertCircle;
          } else if (toast.type === "warning") {
            bgColor = "#fffbpb";
            borderColor = "#fde68a";
            textColor = "#92400e";
            Icon = AlertCircle;
          }

          return (
            <div key={toast.id} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              background: bgColor,
              border: `1px solid ${borderColor}`,
              color: textColor,
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
              animation: "slideIn 0.2s ease-out"
            }}>
              <Icon size={18} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
              <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 500, lineHeight: 1.4 }}>
                {toast.text}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  opacity: 0.7,
                  display: "flex",
                  padding: "0.1rem",
                  borderRadius: "4px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
