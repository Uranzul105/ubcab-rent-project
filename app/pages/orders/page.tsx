"use client";

import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import IconButton from "@mui/joy/IconButton";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Header from "@/app/components/Header";
import OrderCard from "@/app/components/OrderCard";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  Order,
} from "@/app/lib/orderService";

const STATUSES = [
  { key: "new", label: "Шинэ", color: "primary" },
  { key: "active", label: "Хийгдэж байна", color: "warning" },
  { key: "done", label: "Дууссан", color: "success" },
  { key: "cancelled", label: "Цуцалсан", color: "danger" },
] as const;

type StatusKey = (typeof STATUSES)[number]["key"];

function StatusBadge({ status }: { status: StatusKey }) {
  const s = STATUSES.find((x) => x.key === status) ?? STATUSES[0];
  return (
    <Chip
      size="sm"
      variant="soft"
      color={s.color as any}
      sx={{ fontWeight: 700, fontSize: "12px" }}
    >
      {s.label}
    </Chip>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  // Modal нээх — шинэ захиалга
  const openCreate = () => {
    setEditOrder(null);
    setModalOpen(true);
  };

  // Modal нээх — засах
  const openEdit = (order: Order) => {
    setEditOrder(order);
    setModalOpen(true);
  };

  // Modal хаах
  const closeModal = () => {
    setModalOpen(false);
    setEditOrder(null);
  };

  // Шинэ захиалга үүсгэх
  const handleAddOrder = async (order: any) => {
    const newOrder = await createOrder(order);
    setOrders((prev) => [newOrder, ...prev]);
    closeModal();
  };

  // Захиалга засах
  const handleUpdateOrder = async (order: any) => {
    if (!editOrder) return;
    const updated = await updateOrder(String(editOrder._id), order);
    setOrders((prev) =>
      prev.map((o) => (String(o._id) === String(editOrder._id) ? updated : o)),
    );
    closeModal();
  };

  // Төлөв солих
  const handleStatusChange = async (id: string, status: StatusKey) => {
    await updateOrder(id, { status });
    setOrders((prev) =>
      prev.map((o) => (String(o._id) === id ? { ...o, status } : o)),
    );
  };

  // Устгах
  const handleDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => String(o._id) !== id));
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
      {/* Header */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Header />
      </div>

      {/* Агуулга */}
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
          {/* Гарчиг + Шинэ захиалга товч */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <Typography
              sx={{ fontSize: "24px", fontWeight: "bold", color: "#16181D" }}
            >
              Захиалгуудын жагсаалт
              <Typography
                component="span"
                sx={{ fontSize: "14px", fontWeight: 500, color: "#888", ml: 1 }}
              >
                ({orders.length} захиалга)
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
              Шинэ захиалга
            </Button>
          </Box>

          {/* Жагсаалт */}
          {loading ? (
            <Box sx={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
              <Typography>Уншиж байна...</Typography>
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "48px", color: "#bbb" }}>
              <Typography sx={{ fontSize: "40px" }}>📋</Typography>
              <Typography>Захиалга байхгүй байна</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {orders.map((order) => {
                const totalSalary = (order.drivers ?? []).reduce(
                  (s, d) => s + d.salary,
                  0,
                );
                return (
                  <Box
                    key={String(order._id)}
                    sx={{
                      background: "#fff",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0 2px 6px rgba(0,0,0,.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* Мэдээлэл */}
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: "15px" }}>
                          {order.customerName}
                        </Typography>
                        <StatusBadge status={order.status} />
                        <Typography sx={{ fontSize: "12px", color: "#bbb" }}>
                          {order.date}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "13px", color: "#888" }}>
                        {(order.drivers ?? [])
                          .map((d) => `🚗 ${d.name}`)
                          .join("  ")}
                      </Typography>
                    </Box>

                    {/* Дүн */}
                    <Box sx={{ textAlign: "right", minWidth: 140 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: "17px" }}>
                        {(order.totalAmount ?? 0).toLocaleString()}₮
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#16A34A",
                          fontWeight: 700,
                        }}
                      >
                        Цалин: {totalSalary.toLocaleString()}₮
                      </Typography>
                    </Box>

                    {/* Төлөв солих */}
                    <Select
                      size="sm"
                      value={order.status}
                      onChange={(_, val) =>
                        val &&
                        handleStatusChange(String(order._id), val as StatusKey)
                      }
                      sx={{ minWidth: 160, fontSize: "13px", fontWeight: 700 }}
                    >
                      {STATUSES.map((s) => (
                        <Option key={s.key} value={s.key}>
                          {s.label}
                        </Option>
                      ))}
                    </Select>

                    {/* Засах / Устгах */}
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        onClick={() => openEdit(order)}
                        sx={{ borderRadius: "8px" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        color="danger"
                        onClick={() => handleDelete(String(order._id))}
                        sx={{ borderRadius: "8px" }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal — Шинэ / Засах */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Sheet
          sx={{
            borderRadius: "20px",
            p: 0,
            maxWidth: 960,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto",
            outline: "none",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "24px", fontWeight: "bold", pl: 1 }}>
              {editOrder ? "Захиалга засах" : "Шинэ захиалга үүсгэх"}
            </Typography>
            <ModalClose onClick={closeModal} />
          </Box>
          <OrderCard
            onSubmit={editOrder ? handleUpdateOrder : handleAddOrder}
            defaultValues={editOrder ?? undefined}
          />
        </Sheet>
      </Modal>
    </div>
  );
}
