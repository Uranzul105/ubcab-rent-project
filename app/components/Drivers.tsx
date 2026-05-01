"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../pages/lib/supabase";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import Input from "@mui/joy/Input";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";

type Driver = {
  id: string;
  name: string;
  phone: string;
  car_number: string;
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Жолооч дуудах алдаа:", error.message);
      return;
    }

    setDrivers(data || []);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setCarNumber("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      alert("Нэр, утсаа бөглөнө үү.");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("drivers")
        .update({
          name,
          phone,
          car_number: carNumber,
        })
        .eq("id", editingId);

      if (error) {
        console.error("Засах алдаа:", error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("drivers").insert([
        {
          name,
          phone,
          car_number: carNumber,
        },
      ]);

      if (error) {
        console.error("Нэмэх алдаа:", error.message);
        return;
      }
    }

    resetForm();
    fetchDrivers();
  };

  const handleEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setName(driver.name);
    setPhone(driver.phone);
    setCarNumber(driver.car_number || "");
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Энэ жолоочийг устгах уу?");
    if (!ok) return;

    const { error } = await supabase.from("drivers").delete().eq("id", id);

    if (error) {
      console.error("Устгах алдаа:", error.message);
      return;
    }

    fetchDrivers();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 8,
        pb: 8,
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "100%",
          p: 4,
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography level="h2" sx={{ fontSize: "30px", fontWeight: "bold" }}>
            Жолоочийн мэдээлэл
          </Typography>

          <Image src="/globe.svg" alt="logo" width={24} height={24} />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Жолоочийн нэр"
            variant="outlined"
            color="neutral"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Утасны дугаар"
            variant="outlined"
            color="neutral"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            placeholder="Машины марк"
            variant="outlined"
            color="neutral"
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value)}
          />

          <Button
            onClick={handleSave}
            sx={{
              minWidth: 140,
              borderRadius: "40px",
              backgroundColor: "#facc15",
              color: "#000",
              "&:hover": {
                backgroundColor: "#eab308",
              },
            }}
          >
            {editingId ? "Хадгалах" : "Нэмэх"}
          </Button>

          <Button
            variant="plain"
            color="neutral"
            onClick={resetForm}
            sx={{ textDecoration: "underline" }}
          >
            Цэвэрлэх
          </Button>
        </Box>

        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "18px",
            overflow: "auto",
            mt: 1,
          }}
        >
          <Table hoverRow>
            <thead>
              <tr>
                <th style={{ width: 60 }}>№</th>
                <th>Нэр</th>
                <th>Утас</th>
                <th>Машины марк</th>
                <th style={{ width: 180 }}>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map((driver, index) => (
                  <tr key={driver.id}>
                    <td>{index + 1}</td>
                    <td>{driver.name}</td>
                    <td>{driver.phone}</td>
                    <td>{driver.car_number}</td>
                    <td>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => handleEdit(driver)}
                        >
                          Засах
                        </Button>

                        <Button
                          size="sm"
                          color="danger"
                          variant="soft"
                          onClick={() => handleDelete(driver.id)}
                        >
                          Устгах
                        </Button>
                      </Box>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    Жолоочийн мэдээлэл алга байна.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Sheet>
      </Card>
    </Box>
  );
}
