"use client";

import Image from "next/image";
// import Language from "./Language";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = JSON.parse(localStorage.getItem("currentUser") || "null");
    setUser(u);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        width: "88%",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "25px 60px",
        background: "rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        borderBottomLeftRadius: "20px",
        borderBottomRightRadius: "20px",
        border: "1px solid rgba(255,255,255,0.25)",
      }}
    >
      <Image src="/logo.png" alt="logo" width={120} height={40} />

      {/* Нэвтэрсэн үед бүх цэс */}
      {user ? (
        <div
          style={{
            display: "flex",
            gap: "50px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span
            className="menu"
            onClick={() => window.open("https://ubcab.mn", "_blank")}
          >
            Бидний тухай
          </span>
          <span className="menu" onClick={() => router.push("/pages/orders")}>
            Захиалгууд
          </span>
          <span className="menu" onClick={() => router.push("/pages/drivers")}>
            Жолооч
          </span>
          <span className="menu" onClick={() => router.push("/pages/company")}>
            Байгууллага
          </span>
          {user.role === "admin" && (
            <span className="menu" onClick={() => router.push("/pages/report")}>
              Тайлан
            </span>
          )}
        </div>
      ) : (
        /* Нэвтрээгүй үед зөвхөн Бидний тухай */
        <div
          style={{
            display: "flex",
            gap: "50px",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <span
            className="menu"
            onClick={() => window.open("https://ubcab.mn", "_blank")}
          >
            Бидний тухай
          </span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* <Language /> */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 20px",
              borderRadius: "20px",
              border: "1.5px solid rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Гарах
          </button>
        )}
      </div>
    </div>
  );
}
