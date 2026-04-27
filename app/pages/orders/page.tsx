"use client";

import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import IconButton from "@mui/joy/IconButton";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
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
import SearchIcon from "@mui/icons-material/Search";
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
      sx={{ fontWeight: 600, fontSize: "12px" }}
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
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser") || "null");
    setUser(u);
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  // Шүүлт
  const filteredOrders = orders.filter((o) => {
    const matchFrom = filterFrom ? o.date >= filterFrom : true;
    const matchTo = filterTo ? o.date <= filterTo : true;
    const matchName = filterName
      ? o.customerName.toLowerCase().includes(filterName.toLowerCase())
      : true;
    const matchDriver = filterDriver
      ? (o.drivers ?? []).some((d) =>
          d.name.toLowerCase().includes(filterDriver.toLowerCase()),
        )
      : true;
    return matchFrom && matchTo && matchName && matchDriver;
  });

  const openCreate = () => {
    setEditOrder(null);
    setModalOpen(true);
  };
  const openEdit = (order: Order) => {
    setEditOrder(order);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditOrder(null);
  };

  const handleAddOrder = async (order: any) => {
    const newOrder = await createOrder(order);
    setOrders((prev) => [newOrder, ...prev]);
    closeModal();
  };

  const handleUpdateOrder = async (order: any) => {
    if (!editOrder) return;
    const updated = await updateOrder(String(editOrder._id), order);
    setOrders((prev) =>
      prev.map((o) => (String(o._id) === String(editOrder._id) ? updated : o)),
    );
    closeModal();
  };

  const handleStatusChange = async (id: string, status: StatusKey) => {
    await updateOrder(id, { status });
    setOrders((prev) =>
      prev.map((o) => (String(o._id) === id ? { ...o, status } : o)),
    );
  };

  const handleTogglePaid = async (id: string) => {
    const order = orders.find((o) => String(o._id) === id);
    if (!order) return;
    await updateOrder(id, { paid: !order.paid });
    setOrders((prev) =>
      prev.map((o) => (String(o._id) === id ? { ...o, paid: !o.paid } : o)),
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => String(o._id) !== id));
  };

  // Нийт тооцоо
  const totalAmount = filteredOrders.reduce(
    (s, o) => s + (o.totalAmount ?? 0),
    0,
  );
  const totalSalary = filteredOrders.reduce(
    (s, o) =>
      s +
      (o.drivers ?? []).reduce(
        (ss, d) => ss + (d.salary ?? 0) + (d.fuel ?? 0),
        0,
      ),
    0,
  );
  const totalPaid = filteredOrders
    .filter((o) => o.paid)
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalUnpaid = totalAmount - totalPaid;

  const totalFuel = filteredOrders.reduce(
    (s, o) => s + (o.drivers ?? []).reduce((ss, d) => ss + (d.fuel ?? 0), 0),
    0,
  );

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
          {/* Гарчиг + Шинэ захиалга */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{ fontSize: "20px", fontWeight: 700, color: "#16181D" }}
            >
              Захиалгуудын жагсаалт
              <Typography
                component="span"
                sx={{ fontSize: "13px", fontWeight: 400, color: "#888", ml: 1 }}
              >
                ({filteredOrders.length} захиалга)
              </Typography>
            </Typography>
            {user?.role !== "admin" && (
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
            )}
          </Box>

          {/* Filter */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              sx={{ fontSize: "13px", height: 38, width: 160 }}
            />
            <Typography sx={{ fontSize: "13px", color: "#888" }}>—</Typography>
            <Input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              sx={{ fontSize: "13px", height: 38, width: 160 }}
            />
            <Input
              placeholder="Захиалагчийн нэр..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              startDecorator={
                <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
              }
              sx={{ fontSize: "13px", height: 38, flex: 1, minWidth: 160 }}
            />
            <Input
              placeholder="Жолоочийн нэр..."
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              startDecorator={
                <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
              }
              sx={{ fontSize: "13px", height: 38, flex: 1, minWidth: 160 }}
            />
            {(filterFrom || filterTo || filterName || filterDriver) && (
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                  setFilterName("");
                  setFilterDriver("");
                }}
                sx={{ height: 38, borderRadius: "10px", fontSize: "13px" }}
              >
                Цэвэрлэх
              </Button>
            )}
          </Box>

          {/* Жагсаалт */}
          {loading ? (
            <Box sx={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
              <Typography>Уншиж байна...</Typography>
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "48px", color: "#bbb" }}>
              <Typography sx={{ fontSize: "40px" }}>📋</Typography>
              <Typography>Захиалга байхгүй байна</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {filteredOrders.map((order, index) => {
                const totalSal = (order.drivers ?? []).reduce(
                  (s, d) => s + (d.salary ?? 0) + (d.fuel ?? 0),
                  0,
                );
                return (
                  <Box
                    key={String(order._id)}
                    sx={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0 1px 4px rgba(0,0,0,.03)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {/* Дэс дугаар */}
                    <Typography
                      sx={{ fontSize: "12px", color: "#bbb", minWidth: 20 }}
                    >
                      {index + 1}
                    </Typography>

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
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#16181D",
                          }}
                        >
                          {order.customerName}
                        </Typography>
                        <StatusBadge status={order.status} />
                        <Typography sx={{ fontSize: "12px", color: "#bbb" }}>
                          {order.date}
                        </Typography>
                      </Box>
                      {/* Жолоочийн нэр + цалин + шатахуун */}
                      <Box>
                        {(order.drivers ?? []).map((d, i) => (
                          <Typography
                            key={i}
                            sx={{ fontSize: "12px", color: "#999" }}
                          >
                            🚗 {d.name} — цалин:{" "}
                            {(d.salary ?? 0).toLocaleString()}₮
                            {(d.fuel ?? 0) > 0 && (
                              <span style={{ color: "#D97706" }}>
                                {` ⛽ ${(d.fuel ?? 0).toLocaleString()}₮`}
                              </span>
                            )}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Дүн */}
                    <Box sx={{ textAlign: "right", minWidth: 120 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "#16181D",
                        }}
                      >
                        {(order.totalAmount ?? 0).toLocaleString()}₮
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#16A34A",
                          fontWeight: 500,
                        }}
                      >
                        Цалин: {totalSal.toLocaleString()}₮
                      </Typography>
                    </Box>

                    {/* Admin: зөвхөн төлсөн/төлөөгүй */}
                    {user?.role === "admin" ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <div
                          onClick={() => handleTogglePaid(String(order._id))}
                          style={{
                            width: 36,
                            height: 20,
                            borderRadius: 10,
                            background: order.paid ? "#16A34A" : "#D1D5DB",
                            position: "relative",
                            transition: "background .2s",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 2,
                              left: order.paid ? 18 : 2,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "#fff",
                              transition: "left .2s",
                              boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                            }}
                          />
                        </div>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: order.paid ? "#16A34A" : "#9CA3AF",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.paid ? "Төлсөн" : "Төлөөгүй"}
                        </Typography>
                      </Box>
                    ) : (
                      // Менежер: төлөв + төлсөн/төлөөгүй + засах + устгах
                      <>
                        <Select
                          size="sm"
                          value={order.status}
                          onChange={(_, val) =>
                            val &&
                            handleStatusChange(
                              String(order._id),
                              val as StatusKey,
                            )
                          }
                          sx={{
                            minWidth: 150,
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          {STATUSES.map((s) => (
                            <Option key={s.key} value={s.key}>
                              {s.label}
                            </Option>
                          ))}
                        </Select>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <div
                            // onClick={() => handleTogglePaid(String(order._id))}
                            style={{
                              width: 36,
                              height: 20,
                              borderRadius: 10,
                              background: order.paid ? "#16A34A" : "#D1D5DB",
                              position: "relative",
                              transition: "background .2s",
                              cursor: "default",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 2,
                                left: order.paid ? 18 : 2,
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                background: "#fff",
                                transition: "left .2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                              }}
                            />
                          </div>
                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: order.paid ? "#16A34A" : "#9CA3AF",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {order.paid ? "Төлсөн" : "Төлөөгүй"}
                          </Typography>
                        </Box>
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
                            variant="plain"
                            color="neutral"
                            onClick={() => handleDelete(String(order._id))}
                            sx={{ borderRadius: "8px" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Нийт дүн */}
          {filteredOrders.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 3,
                mt: 1.5,
                pt: 1.5,
                borderTop: "1px solid #F0F0F0",
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ fontSize: "13px", color: "#888" }}>
                Нийт гүйлгээ:{" "}
                <b style={{ color: "#16181D" }}>
                  {totalAmount.toLocaleString()}₮
                </b>
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#888" }}>
                Нийт цалин:{" "}
                <b style={{ color: "#DC2626" }}>
                  {totalSalary.toLocaleString()}₮
                </b>
              </Typography>
              {totalFuel > 0 && (
                <Typography sx={{ fontSize: "13px", color: "#888" }}>
                  Нийт шатахуун:{" "}
                  <b style={{ color: "#D97706" }}>
                    {totalFuel.toLocaleString()}₮
                  </b>
                </Typography>
              )}
              <Typography sx={{ fontSize: "13px", color: "#888" }}>
                Төлөгдсөн:{" "}
                <b style={{ color: "#16A34A" }}>
                  {totalPaid.toLocaleString()}₮
                </b>
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#888" }}>
                Төлөгдөөгүй:{" "}
                <b style={{ color: "#DC2626" }}>
                  {totalUnpaid.toLocaleString()}₮
                </b>
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Modal */}
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
            <Typography sx={{ fontSize: "18px", fontWeight: 700, pl: 1 }}>
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
