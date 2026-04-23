"use client";

import Header from "./components/Header";
import LoginCard from "./components/LoginCard";

export default function Page() {
  return (
    <div>
      <div
        style={{
          position: "relative",
          backgroundImage: "url('/Hero2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "740px",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            zIndex: 10,
          }}
        >
          <Header />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "80px 100px 0px 130px",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <LoginCard />
        </div>
      </div>
    </div>
  );
}
