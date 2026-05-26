"use client";

import { toast, Toaster, ToastBar } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#3E1A55",
          color: "#FFFFFF",
          border: "1px solid rgba(245, 0, 241, 0.4)",
          borderRadius: "16px",
          padding: "20px 52px 20px 28px",
          fontSize: "16px",
          maxWidth: "500px",
          position: "relative",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(245, 0, 241, 0.1)",
        },
      }}
    >
      {(currentToast) => (
        <ToastBar toast={currentToast}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              <button
                type="button"
                aria-label="Cerrar notificacion"
                onClick={() => toast.dismiss(currentToast.id)}
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold leading-none text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
              >
                x
              </button>
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
