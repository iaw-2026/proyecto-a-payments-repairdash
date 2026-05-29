import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#070A12",
          color: "#F8FAFC",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#22D3EE",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Repairdash Payments
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 960,
            }}
          >
            Pagos, balances y retiros para reparaciones.
          </div>
          <div
            style={{
              color: "#CBD5E1",
              fontSize: 32,
              lineHeight: 1.35,
              maxWidth: 880,
            }}
          >
            Una plataforma segura para riders, drivers y administradores.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
