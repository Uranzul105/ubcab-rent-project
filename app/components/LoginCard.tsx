"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import Image from "next/image";
import { Input } from "@mui/joy";
import { useRouter } from "next/navigation";
import { useState } from "react";

const USERS = [
  {
    id: 1,
    name: "Золбоо Менежер",
    role: "manager",
    username: "manager1",
    password: "1234",
  },
  {
    id: 2,
    name: "Бэлгүүн Менежер",
    role: "manager",
    username: "manager2",
    password: "1234",
  },
  {
    id: 3,
    name: "Энхзул Менежер",
    role: "manager",
    username: "manager3",
    password: "1234",
  },
  {
    id: 4,
    name: "Санхүү",
    role: "admin",
    username: "admin",
    password: "admin",
  },
];

export default function LoginCard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = USERS.find(
      (u) => u.username === username && u.password === password,
    );

    if (!user) {
      setError("Нэвтрэх мэдээлэл буруу байна");
      return;
    }

    // User-ийг localStorage-д хадгална
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Role-оос хамааран чиглүүлнэ
    if (user.role === "admin") {
      router.push("/pages/orders");
    } else {
      router.push("/pages/orders");
    }
  };

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
      {/* Лого */}
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
          <Image src="/globe.svg" alt="logo" width={20} height={20} />
        </div>
      </div>

      {/* Алдааны мэдэгдэл */}
      {error && (
        <div
          style={{
            width: "70%",
            padding: "8px 12px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            color: "#DC2626",
            fontSize: "13px",
            textAlign: "left",
          }}
        >
          {error}
        </div>
      )}

      {/* Оруулах талбарууд */}
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
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          sx={{
            width: "253px",
            fontSize: "13px",
          }}
        />
        <Input
          type="password"
          placeholder="Нууц үг"
          variant="outlined"
          color="neutral"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
          onClick={handleLogin}
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
