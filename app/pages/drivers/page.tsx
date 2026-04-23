"use client";

import Header from "@/app/components/Header";
import OrderCard from "@/app/components/OrderCard";
import Box from "@mui/joy/Box";
import Drivers from "@/app/components/Drivers";

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
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "120px 100px 0 100px",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              width: "100%",
              maxWidth: 1200,
            }}
          >
            <Drivers />
          </Box>
        </div>
      </div>
    </div>
  );
}
