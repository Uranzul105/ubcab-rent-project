"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import Image from "next/image";
import { Input } from "@mui/joy";
import { useRouter } from "next/navigation";

export default function LoginCard() {
  const router = useRouter();

  return (
    <Card
      data-resizable
      sx={{
        textAlign: "center",
        alignItems: "center",
        width: 400,
        overflow: "auto",
        resize: "horizontal",
        "--icon-size": "420px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "70%",
          fontSize: "30px",
          fontWeight: "bold",
        }}
      >
        Нэвтрэх
        <div>
          {" "}
          <Image src="/globe.svg" alt="logo" width={20} height={20} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "40px",
        }}
      >
        <Input
          placeholder="Утасны дугаар болон имэйл хаяг"
          variant="outlined"
          color="neutral"
          sx={{
            width: "253px",
            fontSize: "13px",
          }}
        />
        <Input
          placeholder="Нууц үг"
          variant="outlined"
          color="neutral"
          sx={{
            width: "253px",
            fontSize: "13px",
            mt: "20px",
          }}
        />
        <Button
          variant="plain"
          color="neutral"
          sx={{
            textDecoration: "underline",
            display: "flex",
            fontSize: "12px",
            justifyContent: "flex-end",
          }}
        >
          Нууц үгээ мартсан уу?
        </Button>
      </div>

      <CardActions
        orientation="vertical"
        buttonFlex={1}
        sx={{
          "--Button-radius": "40px",
          width: "clamp(min(100%, 160px), 50%, min(100%, 200px))",
        }}
      >
        <Button
          onClick={() => router.push("/pages/orders")}
          variant="solid"
          sx={{
            backgroundColor: "#facc15",
            color: "#000",
            "&:hover": {
              backgroundColor: "#eab308",
            },
          }}
        >
          Нэвтрэх
        </Button>
        <Button
          variant="plain"
          color="neutral"
          sx={{ textDecoration: "underline" }}
        >
          Бүртгүүлэх
        </Button>
      </CardActions>
    </Card>
  );
}
