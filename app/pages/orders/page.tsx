"use client";

import { useEffect, useState, useMemo } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  Order,
  DriverRow,
} from "@/app/lib/orderService";
import { createLog } from "@/app/lib/logService";
import * as XLSX from "xlsx";

const STATUSES = [
  { key: "new", label: "Шинэ", color: "primary" },
  { key: "active", label: "Хийгдэж байна", color: "warning" },
  { key: "done", label: "Дууссан", color: "success" },
  { key: "cancelled", label: "Цуцалсан", color: "danger" },
] as const;

type StatusKey = (typeof STATUSES)[number]["key"];
const PER_PAGE = 15;

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
  const [page, setPage] = useState(1);
  const [filterPaid, setFilterPaid] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [filterManager, setFilterManager] = useState("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "active" | "done" | "cancelled"
  >("all");

  // Custom confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmVariant, setConfirmVariant] = useState<"danger" | "success">(
    "danger",
  );

  const showConfirm = (
    message: string,
    action: () => void,
    variant: "danger" | "success" = "danger",
  ) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVariant(variant);
    setConfirmOpen(true);
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser") || "null");
    setUser(u);
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const managers = useMemo(() => {
    const names = [
      ...new Set(orders.map((o) => o.managerName).filter(Boolean)),
    ];
    return names;
  }, [orders]);

  const filteredOrders = orders
    .filter((o) => {
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
      const matchPaid =
        filterPaid === "all" ? true : filterPaid === "paid" ? o.paid : !o.paid;
      const matchManager =
        filterManager === "all" ? true : o.managerName === filterManager;
      const matchStatus =
        filterStatus === "all" ? true : o.status === filterStatus;
      return (
        matchFrom &&
        matchTo &&
        matchName &&
        matchDriver &&
        matchPaid &&
        matchManager &&
        matchStatus
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredOrders.length / PER_PAGE);
  const pagedOrders = filteredOrders.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );
  const resetPage = () => setPage(1);

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
    await createLog({
      action: "update",
      targetType: "order",
      targetId: String(editOrder._id),
      targetName: editOrder.customerName,
      userId: user?.id ?? 0,
      userName: user?.name ?? "",
      userRole: user?.role ?? "",
      changes: `Захиалга засагдлаа — ${editOrder.customerName} — ${(editOrder.totalAmount ?? 0).toLocaleString()}₮`,
    });
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
    showConfirm(
      "Захиалгыг устгах уу?",
      async () => {
        const order = orders.find((o) => String(o._id) === id);
        await deleteOrder(id);
        setOrders((prev) => prev.filter((o) => String(o._id) !== id));
        await createLog({
          action: "delete",
          targetType: "order",
          targetId: id,
          targetName: order?.customerName ?? "",
          userId: user?.id ?? 0,
          userName: user?.name ?? "",
          userRole: user?.role ?? "",
          changes: `Захиалга устгагдлаа — ${order?.customerName} — ${(order?.totalAmount ?? 0).toLocaleString()}₮`,
        });
      },
      "danger",
    );
  };

  const handleSendToFinance = (orderId: string) => {
    showConfirm(
      "Санхүү рүү шилжүүлэх үү?",
      () => {
        window.location.href = `/pages/report?ids=${orderId}`;
      },
      "success",
    );
  };

  const handleExport = () => {
    const rows = [
      [
        "#",
        "Огноо",
        "Захиалагч",
        "Менежер",
        "Жолооч",
        "Цалин",
        "Шатахуун",
        "Нийт дүн",
        "Төлөв",
        "Төлбөр",
      ],
      ...filteredOrders.map((o, i) => {
        const sal = (o.drivers ?? []).reduce(
          (s, d: DriverRow) => s + (d.salary ?? 0),
          0,
        );
        const fuel = (o.drivers ?? []).reduce(
          (s, d: DriverRow) => s + (d.fuel ?? 0),
          0,
        );
        return [
          i + 1,
          o.date,
          o.customerName,
          o.managerName,
          (o.drivers ?? []).map((d: DriverRow) => d.name).join(", "),
          sal,
          fuel,
          o.totalAmount,
          o.status === "done"
            ? "Дууссан"
            : o.status === "active"
              ? "Хийгдэж байна"
              : o.status === "cancelled"
                ? "Цуцалсан"
                : "Шинэ",
          o.paid ? "Төлсөн" : "Төлөөгүй",
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [4, 12, 20, 16, 24, 12, 12, 14, 14, 12].map((w) => ({
      wch: w,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Захиалгууд");
    XLSX.writeFile(
      wb,
      `UBCab_Захиалга_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const filteredOrdersActive = filteredOrders.filter(
    (o) => o.status !== "cancelled",
  );
  const totalAmount = filteredOrdersActive.reduce(
    (s, o) => s + (o.totalAmount ?? 0),
    0,
  );
  const totalSalarySum = filteredOrdersActive.reduce(
    (s, o) =>
      s +
      (o.drivers ?? []).reduce((ss, d: DriverRow) => ss + (d.salary ?? 0), 0),
    0,
  );
  const totalFuel = filteredOrdersActive.reduce(
    (s, o) =>
      s + (o.drivers ?? []).reduce((ss, d: DriverRow) => ss + (d.fuel ?? 0), 0),
    0,
  );
  const totalPaid = filteredOrdersActive
    .filter((o) => o.paid)
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalUnpaid = totalAmount - totalPaid;

  const canSend = (status: string) => status === "active" || status === "done";

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

      <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        <Box
          sx={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* 1-р мөр: Гарчиг + товч */}
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={handleExport}
                variant="outlined"
                color="neutral"
                sx={{ borderRadius: "40px", fontWeight: 700, fontSize: "13px" }}
              >
                Excel
              </Button>
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
          </Box>

          {/* 2-р мөр: Төлбөр + Төлөв + Менежер — баруун тийш */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 1.5,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Select
              value={filterPaid}
              onChange={(_, v) => {
                if (v) {
                  setFilterPaid(v as any);
                  resetPage();
                }
              }}
              sx={{ fontSize: "13px", height: 36, width: 120, flexShrink: 0 }}
            >
              <Option value="all">Бүгд</Option>
              <Option value="paid">Төлсөн</Option>
              <Option value="unpaid">Төлөөгүй</Option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(_, v) => {
                if (v) {
                  setFilterStatus(v as any);
                  resetPage();
                }
              }}
              sx={{ fontSize: "13px", height: 36, width: 150, flexShrink: 0 }}
            >
              <Option value="all">Бүх төлөв</Option>
              <Option value="new">Шинэ</Option>
              <Option value="active">Хийгдэж байна</Option>
              <Option value="done">Дууссан</Option>
              <Option value="cancelled">Цуцалсан</Option>
            </Select>
            <Select
              value={filterManager}
              onChange={(_, v) => {
                if (v) {
                  setFilterManager(v as string);
                  resetPage();
                }
              }}
              sx={{ fontSize: "13px", height: 36, width: 160, flexShrink: 0 }}
            >
              <Option value="all">Бүх менежер</Option>
              {managers.map((m) => (
                <Option key={m} value={m}>
                  {m}
                </Option>
              ))}
            </Select>
          </Box>

          {/* 3-р мөр: Огноо + Нэр хайлт */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 2,
              flexWrap: "nowrap",
              alignItems: "center",
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Input
              type="date"
              value={filterFrom}
              onChange={(e) => {
                setFilterFrom(e.target.value);
                resetPage();
              }}
              sx={{ fontSize: "13px", height: 36, width: 180, flexShrink: 0 }}
            />
            <Typography sx={{ fontSize: "13px", color: "#888", flexShrink: 0 }}>
              -
            </Typography>
            <Input
              type="date"
              value={filterTo}
              onChange={(e) => {
                setFilterTo(e.target.value);
                resetPage();
              }}
              sx={{ fontSize: "13px", height: 36, width: 180, flexShrink: 0 }}
            />
            <Input
              placeholder="Захиалагчийн нэр..."
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                resetPage();
              }}
              startDecorator={
                <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
              }
              sx={{ fontSize: "13px", height: 36, flex: 1, minWidth: 160 }}
            />
            <Input
              placeholder="Жолоочийн нэр..."
              value={filterDriver}
              onChange={(e) => {
                setFilterDriver(e.target.value);
                resetPage();
              }}
              startDecorator={
                <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
              }
              sx={{ fontSize: "13px", height: 36, flex: 1, minWidth: 160 }}
            />
            {(filterFrom ||
              filterTo ||
              filterName ||
              filterDriver ||
              filterPaid !== "all" ||
              filterManager !== "all" ||
              filterStatus !== "all") && (
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setFilterFrom("");
                  setFilterTo("");
                  setFilterName("");
                  setFilterDriver("");
                  setFilterPaid("all");
                  setFilterManager("all");
                  setFilterStatus("all");
                  resetPage();
                }}
                sx={{
                  height: 36,
                  borderRadius: "10px",
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                Цэвэрлэх
              </Button>
            )}
          </Box>

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
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {pagedOrders.map((order, index) => {
                  const totalSal = (order.drivers ?? []).reduce(
                    (s, d) => s + (d.salary ?? 0) + (d.fuel ?? 0),
                    0,
                  );
                  const allTransferred =
                    (order.drivers ?? []).length > 0 &&
                    (order.drivers ?? []).every((d) => d.transferred);
                  const isFullyDone =
                    order.status === "done" && order.paid && allTransferred;
                  const isCancelled = order.status === "cancelled";

                  return (
                    <Box
                      key={String(order._id)}
                      sx={{
                        background: isCancelled
                          ? "#FFF5F5"
                          : isFullyDone
                            ? "#F0FDF4"
                            : "#fff",
                        border: `1px solid ${isCancelled ? "#FECACA" : isFullyDone ? "#BBF7D0" : "#F0F0F0"}`,
                        borderRadius: "12px",
                        padding: "12px 16px",
                        boxShadow: "0 1px 4px rgba(0,0,0,.03)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#bbb",
                          minWidth: 20,
                          mt: 0.3,
                        }}
                      >
                        {(page - 1) * PER_PAGE + index + 1}
                      </Typography>

                      <Box sx={{ flex: 1 }}>
                        {/* 1-р мөр: Огноо + Менежер */}
                        <Typography
                          sx={{ fontSize: "12px", color: "#bbb", mb: 0.3 }}
                        >
                          {order.date} · 👤 {order.managerName}
                        </Typography>
                        {/* 2-р мөр: Нэр + Төлөв */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
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
                        </Box>
                        {/* 3-р мөр: Жолооч */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.3,
                          }}
                        >
                          {(order.drivers ?? []).map((d, i) => (
                            <Box
                              key={i}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <Typography
                                sx={{ fontSize: "12px", color: "#999" }}
                              >
                                🚗 {d.name} — цалин:{" "}
                                {(d.salary ?? 0).toLocaleString()}₮
                                {(d.fuel ?? 0) > 0 && (
                                  <span
                                    style={{ color: "#D97706" }}
                                  >{` ⛽ ${(d.fuel ?? 0).toLocaleString()}₮`}</span>
                                )}
                              </Typography>
                              {d.transferred && (
                                <Typography
                                  sx={{
                                    fontSize: "11px",
                                    color: "#16A34A",
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓ Шилжүүлсэн
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>

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
                              flexShrink: 0,
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
                              minWidth: 60,
                            }}
                          >
                            {order.paid ? "Төлсөн" : "Төлөөгүй"}
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Box
                            sx={{ width: 150, flexShrink: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Select
                              size="sm"
                              value={order.status}
                              onChange={(_, val) => {
                                if (val)
                                  handleStatusChange(
                                    String(order._id),
                                    val as StatusKey,
                                  );
                              }}
                              sx={{
                                fontSize: "13px",
                                fontWeight: 500,
                                width: "100%",
                              }}
                            >
                              {STATUSES.map((s) => (
                                <Option key={s.key} value={s.key}>
                                  {s.label}
                                </Option>
                              ))}
                            </Select>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: order.paid ? "#16A34A" : "#9CA3AF",
                              minWidth: 60,
                              mt: 0.3,
                            }}
                          >
                            {order.paid ? "Төлсөн" : "Төлөөгүй"}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              alignItems: "center",
                            }}
                          >
                            <IconButton
                              size="sm"
                              variant="outlined"
                              color="neutral"
                              disabled={allTransferred}
                              onClick={() => !allTransferred && openEdit(order)}
                              sx={{
                                borderRadius: "8px",
                                opacity: allTransferred ? 0.3 : 1,
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <Button
                              size="sm"
                              disabled={!canSend(order.status)}
                              onClick={() =>
                                canSend(order.status) &&
                                handleSendToFinance(String(order._id))
                              }
                              sx={{
                                fontSize: "11px",
                                borderRadius: "8px",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                                backgroundColor: canSend(order.status)
                                  ? "#16A34A"
                                  : "#F1F5F9",
                                color: canSend(order.status)
                                  ? "#fff"
                                  : "#9CA3AF",
                                "&:hover": {
                                  backgroundColor: canSend(order.status)
                                    ? "#15803D"
                                    : "#F1F5F9",
                                },
                              }}
                            >
                              Шилжүүлэг
                            </Button>
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 0.5,
                    mt: 2,
                  }}
                >
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    sx={{ minWidth: 36, borderRadius: "8px" }}
                  >
                    ‹
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 2,
                    )
                    .reduce((acc: number[], p, i, arr) => {
                      if (i > 0 && arr[i - 1] !== p - 1) acc.push(-1);
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === -1 ? (
                        <Typography
                          key={`dot-${i}`}
                          sx={{ alignSelf: "center", color: "#bbb", px: 0.5 }}
                        >
                          ...
                        </Typography>
                      ) : (
                        <Button
                          key={p}
                          size="sm"
                          variant={page === p ? "solid" : "outlined"}
                          color="neutral"
                          onClick={() => setPage(p)}
                          sx={{
                            minWidth: 36,
                            borderRadius: "8px",
                            ...(page === p && {
                              backgroundColor: "#facc15",
                              color: "#000",
                              border: "none",
                            }),
                          }}
                        >
                          {p}
                        </Button>
                      ),
                    )}
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    sx={{ minWidth: 36, borderRadius: "8px" }}
                  >
                    ›
                  </Button>
                </Box>
              )}

              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#bbb",
                  mt: 1,
                }}
              >
                {(page - 1) * PER_PAGE + 1}-
                {Math.min(page * PER_PAGE, filteredOrders.length)} /{" "}
                {filteredOrders.length}
              </Typography>

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
                  <b style={{ color: "#16A34A" }}>
                    {totalSalarySum.toLocaleString()}₮
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
            </>
          )}
        </Box>
      </Box>

      {/* Order Modal */}
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
            currentUser={user}
          />
        </Sheet>
      </Modal>

      {/* Custom Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Sheet
          sx={{
            borderRadius: "16px",
            p: 3,
            maxWidth: 360,
            width: "90%",
            outline: "none",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <Typography
            sx={{ fontSize: "16px", fontWeight: 700, color: "#16181D", mb: 1 }}
          >
            Анхааруулга
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#555", mb: 3 }}>
            {confirmMessage}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setConfirmOpen(false)}
              sx={{ borderRadius: "10px", fontSize: "13px" }}
            >
              Цуцлах
            </Button>
            <Button
              onClick={() => {
                confirmAction();
                setConfirmOpen(false);
              }}
              sx={{
                borderRadius: "10px",
                fontSize: "13px",
                backgroundColor:
                  confirmVariant === "danger" ? "#DC2626" : "#16A34A",
                color: "#fff",
                "&:hover": {
                  backgroundColor:
                    confirmVariant === "danger" ? "#B91C1C" : "#15803D",
                },
              }}
            >
              {confirmVariant === "danger" ? "Устгах" : "Тийм"}
            </Button>
          </Box>
        </Sheet>
      </Modal>
    </div>
  );
}
