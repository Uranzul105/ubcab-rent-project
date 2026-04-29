"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Button from "@mui/joy/Button";
import Header from "@/app/components/Header";
import { getOrders, updateOrder, Order } from "@/app/lib/orderService";
import * as XLSX from "xlsx";

const MONTHS = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

const PER_PAGE = 20;

type DriverEntry = {
  orderId: string;
  orderDate: string;
  customerName: string;
  driverIndex: number;
  phone: string;
  name: string;
  salary: number;
  fuel: number;
  transferred: boolean;
  regno: string;
};

export default function ReportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterTransferred, setFilterTransferred] = useState<
    "all" | "transferred" | "pending"
  >("all");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const allEntries: DriverEntry[] = useMemo(() => {
    return orders
      .filter((o) => {
        if (o.status !== "done") return false;
        const d = new Date(o.date);
        const matchYear = d.getFullYear() === filterYear;
        const matchMonth =
          filterMonth === "all" ? true : d.getMonth() === filterMonth;
        const matchFrom = filterFrom ? o.date >= filterFrom : true;
        const matchTo = filterTo ? o.date <= filterTo : true;
        return matchYear && matchMonth && matchFrom && matchTo;
      })
      .flatMap((o) =>
        (o.drivers ?? []).map((d, i) => ({
          orderId: String(o._id),
          orderDate: o.date,
          customerName: o.customerName,
          driverIndex: i,
          phone: d.phone,
          name: d.name,
          salary: d.salary ?? 0,
          fuel: d.fuel ?? 0,
          transferred: d.transferred ?? false,
          regno: d.regno ?? "",
        })),
      )
      .filter((d) => {
        const matchSearch = search
          ? d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.phone.includes(search)
          : true;
        const matchTransferred =
          filterTransferred === "all"
            ? true
            : filterTransferred === "transferred"
              ? d.transferred
              : !d.transferred;
        return matchSearch && matchTransferred;
      })
      .sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );
  }, [
    orders,
    filterYear,
    filterMonth,
    filterFrom,
    filterTo,
    search,
    filterTransferred,
  ]);

  // Filter өөрчлөгдөхөд хуудас reset
  useMemo(() => {
    setPage(1);
  }, [filterYear, filterMonth, filterFrom, filterTo, search]);

  const totalPages = Math.ceil(allEntries.length / PER_PAGE);
  const driverEntries = allEntries.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  const handleTransfer = async (entry: DriverEntry) => {
    const order = orders.find((o) => String(o._id) === entry.orderId);
    if (!order) return;
    const updatedDrivers = (order.drivers ?? []).map((d, i) =>
      i === entry.driverIndex ? { ...d, transferred: !d.transferred } : d,
    );
    await updateOrder(entry.orderId, { drivers: updatedDrivers } as any);
    setOrders((prev) =>
      prev.map((o) =>
        String(o._id) === entry.orderId ? { ...o, drivers: updatedDrivers } : o,
      ),
    );
  };

  const totalSalary = allEntries.reduce((s, d) => s + d.salary, 0);
  const totalFuel = allEntries.reduce((s, d) => s + d.fuel, 0);
  const totalTransferred = allEntries
    .filter((d) => d.transferred)
    .reduce((s, d) => s + d.salary + d.fuel, 0);
  const totalPending = allEntries
    .filter((d) => !d.transferred)
    .reduce((s, d) => s + d.salary + d.fuel, 0);

  const SEL = { fontSize: "13px", height: 36 };

  const handleExport = () => {
    const rows = [
      [
        "#",
        "Огноо",
        "Утас",
        "Жолоочийн нэр",
        "Захиалагч",
        "Цалин",
        "Шатахуун",
        "Нийт",
        "Шилжүүлсэн",
      ],
      ...allEntries.map((d, i) => [
        i + 1,
        d.orderDate,
        d.phone,
        d.name,
        d.customerName,
        d.salary,
        d.fuel,
        d.salary + d.fuel,
        d.transferred ? "Тийм" : "Үгүй",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [4, 12, 12, 18, 18, 12, 12, 12, 12].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Тайлан");
    XLSX.writeFile(
      wb,
      `UBCab_Тайлан_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
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

      <Box sx={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <Box
          sx={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Гарчиг */}
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
              Тайлан — Жолоочийн цалин
              <Typography
                component="span"
                sx={{ fontSize: "13px", fontWeight: 400, color: "#888", ml: 1 }}
              >
                ({allEntries.length} бичлэг)
              </Typography>
            </Typography>
            <Button
              onClick={handleExport}
              sx={{
                backgroundColor: "#16A34A",
                color: "#fff",
                borderRadius: "40px",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#15803D" },
              }}
            >
              ⬇ Excel татах
            </Button>
          </Box>

          {/* Статистик */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 1.5,
              mb: 2,
            }}
          >
            {[
              {
                label: "Нийт цалин",
                value: totalSalary.toLocaleString() + "₮",
                color: "#16181D",
                bg: "#F8FAFC",
              },
              {
                label: "Нийт шатахуун",
                value: totalFuel > 0 ? totalFuel.toLocaleString() + "₮" : "—",
                color: "#D97706",
                bg: "#FEF3C7",
              },
              {
                label: "Шилжүүлсэн",
                value: totalTransferred.toLocaleString() + "₮",
                color: "#16A34A",
                bg: "#DCFCE7",
              },
              {
                label: "Шилжүүлэх",
                value: totalPending.toLocaleString() + "₮",
                color: "#DC2626",
                bg: "#FEE2E2",
              },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  background: s.bg,
                  borderRadius: "12px",
                  padding: "12px 16px",
                }}
              >
                <Typography
                  sx={{ fontSize: "17px", fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.3 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
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
            <Select
              value={filterYear}
              onChange={(_, v) => v && setFilterYear(v)}
              sx={SEL}
            >
              {[2024, 2025, 2026].map((y) => (
                <Option key={y} value={y}>
                  {y} он
                </Option>
              ))}
            </Select>
            <Select<number | "all">
              value={filterMonth}
              onChange={(_, v) =>
                v !== null && setFilterMonth(v as number | "all")
              }
              sx={{ ...SEL, minWidth: 110 }}
            >
              <Option value="all">Бүх сар</Option>
              {MONTHS.map((m, i) => (
                <Option key={i} value={i}>
                  {m}
                </Option>
              ))}
            </Select>
            <Input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              sx={{ ...SEL, width: 145 }}
            />
            <Typography sx={{ fontSize: "13px", color: "#888" }}>—</Typography>
            <Input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              sx={{ ...SEL, width: 145 }}
            />
            <Input
              placeholder="Нэр эсвэл утас..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...SEL, flex: 1, minWidth: 150 }}
            />
            <Select
              value={filterTransferred}
              onChange={(_, v) => v && setFilterTransferred(v as any)}
              sx={{ fontSize: "13px", height: 36, minWidth: 150 }}
            >
              <Option value="all">Бүгд</Option>
              <Option value="transferred">Шилжүүлсэн</Option>
              <Option value="pending">Шилжүүлээгүй</Option>
            </Select>
          </Box>

          {/* Хүснэгт */}
          {loading ? (
            <Box sx={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
              <Typography>Уншиж байна...</Typography>
            </Box>
          ) : allEntries.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: "48px", color: "#bbb" }}>
              <Typography sx={{ fontSize: "36px" }}>📋</Typography>
              <Typography>Дууссан захиалга байхгүй байна</Typography>
            </Box>
          ) : (
            <>
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "30px 100px 110px 100px 150px 130px 100px 100px 90px",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  background: "#F8FAFC",
                  borderRadius: "10px",
                  mb: 0.5,
                }}
              >
                {[
                  "#",
                  "Огноо",
                  "Утас",
                  "Регистр",
                  "Жолоочийн нэр",
                  "Захиалагч",
                  "Цалин",
                  "Шатахуун",
                  "Шилжүүлсэн",
                ].map((h) => (
                  <Typography
                    key={h}
                    sx={{ fontSize: "11px", fontWeight: 800, color: "#999" }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              {/* Мөрүүд */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                {driverEntries.map((entry, idx) => (
                  <Box
                    key={`${entry.orderId}-${entry.driverIndex}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "30px 100px 110px 100px 150px 130px 100px 100px 90px",
                      gap: 1,
                      px: 1.5,
                      py: 1.2,
                      borderRadius: "8px",
                      border: "1px solid #F0F0F0",
                      background: entry.transferred ? "#F0FDF4" : "#fff",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "11px", color: "#bbb" }}>
                      {(page - 1) * PER_PAGE + idx + 1}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#888" }}>
                      {entry.orderDate}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#2563EB",
                      }}
                    >
                      {entry.phone}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#888" }}>
                      {entry.regno || "—"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#16181D",
                      }}
                    >
                      {entry.name}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#888" }}>
                      {entry.customerName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#16181D",
                      }}
                    >
                      {entry.salary.toLocaleString()}₮
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: entry.fuel > 0 ? "#D97706" : "#ddd",
                        fontWeight: entry.fuel > 0 ? 600 : 400,
                      }}
                    >
                      {entry.fuel > 0
                        ? `⛽ ${entry.fuel.toLocaleString()}₮`
                        : "—"}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <div
                        onClick={() => handleTransfer(entry)}
                        style={{
                          width: 34,
                          height: 18,
                          borderRadius: 9,
                          background: entry.transferred ? "#16A34A" : "#D1D5DB",
                          position: "relative",
                          transition: "background .2s",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 1,
                            left: entry.transferred ? 17 : 1,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#fff",
                            transition: "left .2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }}
                        />
                      </div>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: entry.transferred ? "#16A34A" : "#9CA3AF",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.transferred ? "✓" : ""}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Хуудаслалт */}
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
                    .map((p, i, arr) => (
                      <>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <Typography
                            key={`dot-${p}`}
                            sx={{ alignSelf: "center", color: "#bbb" }}
                          >
                            ...
                          </Typography>
                        )}
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
                      </>
                    ))}
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

              {/* Хуудасны мэдээлэл */}
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#bbb",
                  mt: 1,
                }}
              >
                {(page - 1) * PER_PAGE + 1}–
                {Math.min(page * PER_PAGE, allEntries.length)} /{" "}
                {allEntries.length} бичлэг
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
