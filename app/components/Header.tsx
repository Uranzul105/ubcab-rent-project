"use client";

import Image from "next/image";
// import Language from "./Language";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

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
      {/* Logo — /logo.png болгов */}
      <Image src="/logo.png" alt="logo" width={120} height={40} />

      {/* Menu */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          fontSize: "15px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <span className="menu">Бидний тухай</span>
        <span className="menu">Захиалгууд</span>
        <span className="menu" onClick={() => router.push("/pages/drivers")}>
          Жолооч
        </span>
        <span className="menu" onClick={() => router.push("/pages/company")}>
          Байгууллага
        </span>
        <span className="menu" onClick={() => router.push("/pages/report")}>
          Тайлан
        </span>
      </div>

      <div>{/* <Language /> */}</div>
    </div>
  );
}
