"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Header from "@/app/components/Header";
import { getOrders, Order } from "@/app/lib/orderService";

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

type CompanyGroup = {
  name: string;
  orders: Order[];
  total: number;
  paid: number;
  unpaid: number;
  totalFuel: number;
};

export default function CompanyPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.date);
      const matchYear = d.getFullYear() === filterYear;
      const matchMonth =
        filterMonth === "all" ? true : d.getMonth() === filterMonth;
      return matchYear && matchMonth;
    });
  }, [orders, filterYear, filterMonth]);

  const companyGroups: CompanyGroup[] = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    filteredOrders.forEach((o) => {
      if (!groups[o.customerName]) groups[o.customerName] = [];
      groups[o.customerName].push(o);
    });
    return Object.entries(groups)
      .filter(([, os]) => os.length >= 2)
      .map(([name, os]) => {
        const sortedOrders = [...os].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        const total = os.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
        const paid = os
          .filter((o) => o.paid)
          .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
        const unpaid = total - paid;
        const totalFuel = os.reduce(
          (s, o) =>
            s + (o.drivers ?? []).reduce((ss, d) => ss + (d.fuel ?? 0), 0),
          0,
        );
        return { name, orders: sortedOrders, total, paid, unpaid, totalFuel };
      })
      .sort(
        (a, b) =>
          new Date(b.orders[0]?.date ?? 0).getTime() -
          new Date(a.orders[0]?.date ?? 0).getTime(),
      );
  }, [filteredOrders]);

  const selectedGroup = companyGroups.find((g) => g.name === selected) ?? null;
  const SEL = { fontSize: "13px", height: 38 };

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
        {selectedGroup ? (
          <Box>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setSelected(null)}
              sx={{ mb: 2, fontSize: "13px" }}
            >
              ← Буцах
            </Button>
            <Box
              sx={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#16181D",
                  mb: 2,
                }}
              >
                {selectedGroup.name}
              </Typography>

              {/* Статистик — 4 card + шатахуун */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 1.5,
                  mb: selectedGroup.totalFuel > 0 ? 1.5 : 3,
                }}
              >
                <Box
                  sx={{
                    background: "#DBEAFE",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, color: "#2563EB" }}
                  >
                    {selectedGroup.orders.length} ш
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                    Нийт захиалга
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background: "#F8FAFC",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, color: "#16181D" }}
                  >
                    {selectedGroup.total.toLocaleString()}₮
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                    Нийт дүн
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background: "#DCFCE7",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "20px", fontWeight: 700, color: "#16A34A" }}
                  >
                    {selectedGroup.paid.toLocaleString()}₮
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                    Төлөгдсөн
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background:
                      selectedGroup.unpaid > 0 ? "#FEE2E2" : "#DCFCE7",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: selectedGroup.unpaid > 0 ? "#DC2626" : "#16A34A",
                    }}
                  >
                    {selectedGroup.unpaid > 0
                      ? selectedGroup.unpaid.toLocaleString() + "₮"
                      : "✓ Бүгд төлсөн"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                    Үлдэгдэл
                  </Typography>
                </Box>
              </Box>

              {/* Нийт шатахуун */}
              {selectedGroup.totalFuel > 0 && (
                <Box
                  sx={{
                    background: "#FEF3C7",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    mb: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "15px", fontWeight: 700, color: "#D97706" }}
                  >
                    ⛽ Нийт шатахуун: {selectedGroup.totalFuel.toLocaleString()}
                    ₮
                  </Typography>
                </Box>
              )}

              {/* Захиалгуудын жагсаалт */}
              <Typography
                sx={{
                  fontSize: "15px",
                  fontWeight: 700,
                  mb: 1.5,
                  color: "#16181D",
                }}
              >
                Захиалгуудын жагсаалт
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {selectedGroup.orders.map((o) => {
                  const sal = (o.drivers ?? []).reduce(
                    (s, d) => s + (d.salary ?? 0),
                    0,
                  );
                  const fuel = (o.drivers ?? []).reduce(
                    (s, d) => s + (d.fuel ?? 0),
                    0,
                  );
                  return (
                    <Box
                      key={String(o._id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        background: "#fff",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        border: "1px solid #F0F0F0",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 600, fontSize: "13px" }}
                          >
                            {o.date}
                          </Typography>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={
                              o.status === "done"
                                ? "success"
                                : o.status === "cancelled"
                                  ? "danger"
                                  : o.status === "active"
                                    ? "warning"
                                    : "primary"
                            }
                            sx={{ fontSize: "11px" }}
                          >
                            {o.status === "done"
                              ? "Дууссан"
                              : o.status === "cancelled"
                                ? "Цуцалсан"
                                : o.status === "active"
                                  ? "Хийгдэж байна"
                                  : "Шинэ"}
                          </Chip>
                        </Box>
                        <Box>
                          {(o.drivers ?? []).map((d, i) => (
                            <Typography
                              key={i}
                              sx={{ fontSize: "12px", color: "#888" }}
                            >
                              🚗 {d.name} — цалин:{" "}
                              {(d.salary ?? 0).toLocaleString()}₮
                              {(d.fuel ?? 0) > 0 && (
                                <span
                                  style={{ color: "#D97706" }}
                                >{` ⛽ ${(d.fuel ?? 0).toLocaleString()}₮`}</span>
                              )}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "14px" }}>
                          {(o.totalAmount ?? 0).toLocaleString()}₮
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#16A34A" }}>
                          Цалин: {sal.toLocaleString()}₮
                          {fuel > 0 && ` + ⛽ ${fuel.toLocaleString()}₮`}
                        </Typography>
                      </Box>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={o.paid ? "success" : "danger"}
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          minWidth: 90,
                          justifyContent: "center",
                        }}
                      >
                        {o.paid ? "✓ Төлсөн" : "✗ Төлөөгүй"}
                      </Chip>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography
                sx={{ fontSize: "20px", fontWeight: 700, color: "#16181D" }}
              >
                Байгууллага
                <Typography
                  component="span"
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#888",
                    ml: 1,
                  }}
                >
                  ({companyGroups.length} байгууллага)
                </Typography>
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
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
                <Select
                  value={filterMonth}
                  onChange={(_, v) =>
                    v !== null && setFilterMonth(v as number | "all")
                  }
                  sx={{ ...SEL, minWidth: 120 }}
                >
                  <Option value="all">Бүх сар</Option>
                  {MONTHS.map((m, i) => (
                    <Option key={i} value={i}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                <Typography>Уншиж байна...</Typography>
              </Box>
            ) : companyGroups.length === 0 ? (
              <Box sx={{ textAlign: "center", padding: "48px", color: "#bbb" }}>
                <Typography sx={{ fontSize: "40px" }}>🏢</Typography>
                <Typography>Байгууллага байхгүй байна</Typography>
                <Typography sx={{ fontSize: "13px", mt: 1 }}>
                  Нэг захиалагч 2+ захиалга өгсөн үед энд харагдана
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {companyGroups.map((company) => (
                  <Box
                    key={company.name}
                    onClick={() => setSelected(company.name)}
                    sx={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      border: "1px solid #F0F0F0",
                      boxShadow: "0 1px 4px rgba(0,0,0,.03)",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                      "&:hover": { background: "#FAFAFA" },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "15px",
                          color: "#16181D",
                        }}
                      >
                        {company.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "12px", color: "#888", mt: 0.3 }}
                      >
                        {company.orders.length} захиалга · Сүүлд:{" "}
                        {company.orders[0]?.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          sx={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#16181D",
                          }}
                        >
                          {company.total.toLocaleString()}₮
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#888" }}>
                          нийт дүн
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          sx={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#16A34A",
                          }}
                        >
                          {company.paid.toLocaleString()}₮
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#888" }}>
                          төлөгдсөн
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          sx={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: company.unpaid > 0 ? "#DC2626" : "#16A34A",
                          }}
                        >
                          {company.unpaid > 0
                            ? company.unpaid.toLocaleString() + "₮"
                            : "✓"}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#888" }}>
                          үлдэгдэл
                        </Typography>
                      </Box>
                      {company.totalFuel > 0 && (
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "#D97706",
                            }}
                          >
                            ⛽ {company.totalFuel.toLocaleString()}₮
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#888" }}>
                            шатахуун
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: "18px", color: "#bbb" }}>
                      ›
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </div>
  );
}
