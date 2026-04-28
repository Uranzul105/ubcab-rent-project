"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Header from "@/app/components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  Driver,
} from "@/app/lib/driverService";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({ phone: "", name: "", regno: "" });
  const [page, setPage] = useState(1);
  const PER = 15;

  useEffect(() => {
    getDrivers()
      .then(setDrivers)
      .finally(() => setLoading(false));
  }, []);

  // Хайлт
  const filtered = useMemo(
    () =>
      drivers.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.phone.includes(search),
      ),
    [drivers, search],
  );

  const pages = Math.ceil(filtered.length / PER);
  const shown = filtered.slice((page - 1) * PER, page * PER);

  // Modal нээх — шинэ
  const openCreate = () => {
    setEditDriver(null);
    setForm({ phone: "", name: "", regno: "" });
    setModalOpen(true);
  };

  // Modal нээх — засах
  const openEdit = (driver: Driver) => {
    setEditDriver(driver);
    setForm({
      phone: driver.phone,
      name: driver.name,
      regno: driver.regno ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditDriver(null);
    setForm({ phone: "", name: "", regno: "" });
  };

  // Хадгалах
  const handleSave = async () => {
    if (!form.phone || !form.name) {
      alert("Утас болон нэрийг бөглөнө үү");
      return;
    }
    if (editDriver) {
      const updated = await updateDriver(String(editDriver._id), form);
      setDrivers((prev) =>
        prev.map((d) =>
          String(d._id) === String(editDriver._id) ? updated : d,
        ),
      );
    } else {
      const newDriver = await createDriver(form);
      setDrivers((prev) => [newDriver, ...prev]);
    }
    closeModal();
  };

  // Устгах
  const handleDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await deleteDriver(id);
    setDrivers((prev) => prev.filter((d) => String(d._id) !== id));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div style={{ position: "relative", zIndex: 10 }}>
        <Header />
      </div>

      <Box sx={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
        <Box
          sx={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Гарчиг + Нэмэх товч */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <Typography
              sx={{ fontSize: "20px", fontWeight: 800, color: "#16181D" }}
            >
              Жолооч
              <Typography
                component="span"
                sx={{ fontSize: "14px", fontWeight: 500, color: "#888", ml: 1 }}
              >
                ({drivers.length} жолооч)
              </Typography>
            </Typography>
            <Button
              onClick={openCreate}
              startDecorator={<AddIcon />}
              sx={{
                backgroundColor: "#facc15",
                color: "#000",
                fontWeight: 700,
                borderRadius: "40px",
                "&:hover": { backgroundColor: "#eab308" },
              }}
            >
              Жолооч нэмэх
            </Button>
          </Box>

          {/* Хайлт */}
          <Input
            startDecorator={<SearchIcon sx={{ color: "#aaa" }} />}
            placeholder="Нэр эсвэл утасны дугаараар хайх..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            sx={{ mb: 2, fontSize: "14px" }}
          />

          {/* Хүснэгт */}
          {loading ? (
            <Box sx={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
              <Typography>Уншиж байна...</Typography>
            </Box>
          ) : (
            <Box>
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr 1fr 100px",
                  gap: 2,
                  px: 2,
                  py: 1,
                  background: "#F8FAFC",
                  borderRadius: "10px",
                  mb: 1,
                }}
              >
                {["#", "Утасны дугаар", "Нэр", "Регистр", "Үйлдэл"].map((h) => (
                  <Typography
                    key={h}
                    sx={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#999",
                      letterSpacing: 0.8,
                    }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              {/* Мөрүүд */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {shown.map((d, i) => (
                  <Box
                    key={String(d._id)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 1fr 1fr 100px",
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      borderRadius: "10px",
                      border: "1px solid #F0F0F0",
                      background: "#fff",
                      alignItems: "center",
                      "&:hover": { background: "#FAFAFA" },
                    }}
                  >
                    <Typography sx={{ color: "#ccc", fontSize: "13px" }}>
                      {(page - 1) * PER + i + 1}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#2563EB",
                        fontSize: "14px",
                      }}
                    >
                      {d.phone}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#16181D" }}>
                      {d.name}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#888" }}>
                      {d.regno || "—"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        onClick={() => openEdit(d)}
                        sx={{ borderRadius: "8px" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={() => handleDelete(String(d._id))}
                        sx={{ borderRadius: "8px" }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                {shown.length === 0 && (
                  <Box
                    sx={{ textAlign: "center", padding: "40px", color: "#bbb" }}
                  >
                    <Typography sx={{ fontSize: "36px" }}>👨‍✈️</Typography>
                    <Typography>Жолооч олдсонгүй</Typography>
                  </Box>
                )}
              </Box>

              {/* Хуудаслалт */}
              {pages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    mt: 2,
                    justifyContent: "center",
                  }}
                >
                  {Array.from({ length: pages }, (_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={page === i + 1 ? "solid" : "outlined"}
                      color="neutral"
                      onClick={() => setPage(i + 1)}
                      sx={{
                        minWidth: 36,
                        height: 36,
                        borderRadius: "8px",
                        fontWeight: 700,
                        ...(page === i + 1 && {
                          backgroundColor: "#facc15",
                          color: "#000",
                          border: "none",
                        }),
                      }}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal — Нэмэх / Засах */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Sheet sx={{ borderRadius: "20px", p: 3, width: 400, outline: "none" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: 800 }}>
              {editDriver ? "Жолооч засах" : "Жолооч нэмэх"}
            </Typography>
            <ModalClose onClick={closeModal} />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#999",
                  mb: 0.5,
                }}
              >
                УТАСНЫ ДУГААР
              </Typography>
              <Input
                placeholder="99XXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                sx={{ fontSize: "14px" }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#999",
                  mb: 0.5,
                }}
              >
                НЭР
              </Typography>

              <Input
                placeholder="Бүтэн нэр"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                sx={{ fontSize: "14px" }}
              />
            </Box>
            <Box>
              <Typography
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#999",
                  mb: 0.5,
                }}
              >
                РЕГИСТРИЙН ДУГААР
              </Typography>
              <Input
                placeholder="АА00000000"
                value={(form as any).regno ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, regno: e.target.value }))
                }
                sx={{ fontSize: "14px" }}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={closeModal}
              sx={{ flex: 1, borderRadius: "40px" }}
            >
              Болих
            </Button>
            <Button
              onClick={handleSave}
              sx={{
                flex: 2,
                borderRadius: "40px",
                backgroundColor: "#facc15",
                color: "#000",
                "&:hover": { backgroundColor: "#eab308" },
              }}
            >
              Хадгалах
            </Button>
          </Box>
        </Sheet>
      </Modal>
    </div>
  );
}
