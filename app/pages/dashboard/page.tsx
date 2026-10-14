"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Header from "@/app/components/Header";
import { getOrders, Order, DriverRow } from "@/app/lib/orderService";
import { getDrivers, Driver } from "@/app/lib/driverService";
import SearchIcon from "@mui/icons-material/Search";

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

const AITO_MONTHLY = 32_560_000;
const AITO_START_YEAR = 2026;
const AITO_START_MONTH = 5;
const AITO_END_YEAR = 2026;
const AITO_END_MONTH = 9; // 9-р сар хүртэл

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");

  useEffect(() => {
    Promise.all([getOrders(), getDrivers()])
      .then(([o, d]) => {
        setOrders(o);
        setDrivers(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "cancelled") return false;
      const d = new Date(o.date);
      const matchYear = d.getFullYear() === filterYear;
      const matchMonth =
        filterMonth === "all" ? true : d.getMonth() + 1 === filterMonth;
      return matchYear && matchMonth;
    });
  }, [orders, filterYear, filterMonth]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
    [filteredOrders],
  );

  const marketingRevenue = useMemo(
    () =>
      filteredOrders
        .filter((o) => (o as any).orderType === "operations")
        .reduce((s, o) => s + (o.totalAmount ?? 0), 0),
    [filteredOrders],
  );

  const aitoAmount = useMemo(() => {
    if (filterMonth === "all") {
      let total = 0;
      for (let m = 1; m <= 12; m++) {
        const afterStart =
          filterYear > AITO_START_YEAR ||
          (filterYear === AITO_START_YEAR && m >= AITO_START_MONTH);
        const beforeEnd =
          filterYear < AITO_END_YEAR ||
          (filterYear === AITO_END_YEAR && m <= AITO_END_MONTH);
        if (afterStart && beforeEnd) {
          total += AITO_MONTHLY;
        }
      }
      return total;
    } else {
      const afterStart =
        filterYear > AITO_START_YEAR ||
        (filterYear === AITO_START_YEAR && filterMonth >= AITO_START_MONTH);
      const beforeEnd =
        filterYear < AITO_END_YEAR ||
        (filterYear === AITO_END_YEAR && filterMonth <= AITO_END_MONTH);
      if (afterStart && beforeEnd) {
        return AITO_MONTHLY;
      }
      return 0;
    }
  }, [filterYear, filterMonth]);

  const rentRevenue = totalRevenue - marketingRevenue - aitoAmount;

  const totalSalary = useMemo(
    () =>
      filteredOrders.reduce(
        (s, o) =>
          s +
          (o.drivers ?? []).reduce(
            (ss, d: DriverRow) => ss + (d.salary ?? 0) + (d.fuel ?? 0),
            0,
          ),
        0,
      ),
    [filteredOrders],
  );

  const marketingSalary = useMemo(
    () =>
      filteredOrders
        .filter((o) => (o as any).orderType === "operations")
        .reduce(
          (s, o) =>
            s +
            (o.drivers ?? []).reduce(
              (ss, d: DriverRow) => ss + (d.salary ?? 0) + (d.fuel ?? 0),
              0,
            ),
          0,
        ),
    [filteredOrders],
  );

  const rentSalary = totalSalary - marketingSalary;
  const profit = rentRevenue - rentSalary;
  const profitRate = rentRevenue > 0 ? (profit / rentRevenue) * 100 : 0;

  const totalPaid = filteredOrders
    .filter((o) => o.paid)
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalUnpaid = totalRevenue - totalPaid;

  const transferred = filteredOrders
    .flatMap((o) => o.drivers ?? [])
    .filter((d) => d.transferred)
    .reduce((s, d: DriverRow) => s + (d.salary ?? 0) + (d.fuel ?? 0), 0);
  const pending = filteredOrders
    .flatMap((o) => o.drivers ?? [])
    .filter((d) => !d.transferred)
    .reduce((s, d: DriverRow) => s + (d.salary ?? 0) + (d.fuel ?? 0), 0);

  const activePhones = useMemo(() => {
    const phones = new Set<string>();
    orders.forEach((o) =>
      (o.drivers ?? []).forEach((d) => {
        if (d.phone) phones.add(d.phone.replace(/\D/g, ""));
      }),
    );
    return phones;
  }, [orders]);

  const inactiveDrivers = useMemo(
    () => drivers.filter((d) => !activePhones.has(d.phone.replace(/\D/g, ""))),
    [drivers, activePhones],
  );

  const driverStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; phone: string; count: number; totalSalary: number }
    > = {};
    orders.forEach((o) => {
      (o.drivers ?? []).forEach((d: DriverRow) => {
        const key = d.phone?.replace(/\D/g, "") || d.name;
        if (!map[key])
          map[key] = { name: d.name, phone: d.phone, count: 0, totalSalary: 0 };
        map[key].count += 1;
        map[key].totalSalary += d.salary ?? 0;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [orders]);

  const filteredInactive = inactiveDrivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search),
  );

  const SEL = { fontSize: "13px", height: 36 };

  const card = (label: string, value: string, color: string, bg: string) => (
    <Box
      key={label}
      sx={{ background: bg, borderRadius: "12px", padding: "14px 16px" }}
    >
      <Typography sx={{ fontSize: "18px", fontWeight: 700, color }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "11px", color: "#888", mt: 0.3 }}>
        {label}
      </Typography>
    </Box>
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

      <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {/* Filter */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
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
            sx={{ ...SEL, minWidth: 120 }}
          >
            <Option value="all">Бүх сар</Option>
            {MONTHS.map((m, i) => (
              <Option key={i} value={i + 1}>
                {m}
              </Option>
            ))}
          </Select>
        </Box>

        {/* Борлуулалтын задаргаа */}
        <Box
          sx={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            mb: 3,
          }}
        >
          <Typography
            sx={{ fontSize: "18px", fontWeight: 700, color: "#16181D", mb: 2 }}
          >
            Нийт борлуулалт
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
              mb: 2,
            }}
          >
            {card(
              "Нийт борлуулалт",
              totalRevenue.toLocaleString() + "₮",
              "#16181D",
              "#F8FAFC",
            )}
            {card(
              "Маркетинг, үйл ажиллагаа",
              marketingRevenue.toLocaleString() + "₮",
              "#D97706",
              "#FEF3C7",
            )}
            {card(
              "Aito M9 түрээс",
              aitoAmount.toLocaleString() + "₮",
              "#7C3AED",
              "#F5F3FF",
            )}
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
            }}
          >
            {card(
              "Рент борлуулалт",
              rentRevenue.toLocaleString() + "₮",
              "#2563EB",
              "#EFF6FF",
            )}
            {card(
              "Рент цалин",
              rentSalary.toLocaleString() + "₮",
              "#16A34A",
              "#F0FDF4",
            )}
            {card(
              "Ашиг / Ашгийн хувь",
              `${profit.toLocaleString()}₮ (${profitRate.toFixed(1)}%)`,
              profit >= 0 ? "#16A34A" : "#DC2626",
              profit >= 0 ? "#DCFCE7" : "#FEE2E2",
            )}
          </Box>
        </Box>

        {/* Орлого зардлын мэдээлэл */}
        <Box
          sx={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            mb: 3,
          }}
        >
          <Typography
            sx={{ fontSize: "18px", fontWeight: 700, color: "#16181D", mb: 2 }}
          >
            Орлого зардлын мэдээлэл
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.5,
            }}
          >
            {card(
              "Нийт цалин",
              totalSalary.toLocaleString() + "₮",
              "#16181D",
              "#F8FAFC",
            )}
            {card(
              "Маркетинг цалин",
              marketingSalary.toLocaleString() + "₮",
              "#D97706",
              "#FEF3C7",
            )}
            {card(
              "Төлөгдсөн",
              totalPaid.toLocaleString() + "₮",
              "#16A34A",
              "#DCFCE7",
            )}
            {card(
              "Төлөгдөөгүй",
              totalUnpaid.toLocaleString() + "₮",
              "#DC2626",
              "#FEE2E2",
            )}
            {card(
              "Шилжүүлсэн цалин",
              transferred.toLocaleString() + "₮",
              "#16A34A",
              "#F0FDF4",
            )}
            {card(
              "Шилжүүлэх цалин",
              pending.toLocaleString() + "₮",
              "#DC2626",
              "#FEE2E2",
            )}
          </Box>
        </Box>

        {/* Дебиторийн тайлан */}
        {(() => {
          const today = new Date();
          // Байгууллага бүрийн нэгтгэсэн мэдээлэл
          const companyMap: Record<
            string,
            {
              name: string;
              total: number;
              paid: boolean;
              lastDate: string;
              noteDate: string;
              unpaid: number;
            }
          > = {};

          filteredOrders.forEach((o) => {
            const name = o.customerName;
            if (!companyMap[name]) {
              companyMap[name] = {
                name,
                total: 0,
                paid: true,
                lastDate: "",
                noteDate: "",
                unpaid: 0,
              };
            }
            companyMap[name].total += o.totalAmount ?? 0;
            if (!o.paid) {
              companyMap[name].paid = false;
              companyMap[name].unpaid += o.totalAmount ?? 0;
            }
            if (
              !companyMap[name].lastDate ||
              o.date > companyMap[name].lastDate
            ) {
              companyMap[name].lastDate = o.date;
            }
            if (
              (o as any).noteDate &&
              (o as any).noteDate > companyMap[name].noteDate
            ) {
              companyMap[name].noteDate = (o as any).noteDate;
            }
          });

          const companies = Object.values(companyMap)
            .filter((c) => c.total > 0)
            .sort((a, b) => b.unpaid - a.unpaid);

          const getDays = (fromDate: string, toDate: string) => {
            const from = new Date(fromDate);
            const to = toDate ? new Date(toDate) : today;
            return Math.floor(
              (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
            );
          };

          const getColor = (days: number, paid: boolean) => {
            if (paid) return { bg: "#F8FAFC", border: "#E2E8F0", text: "#888" };
            if (days <= 14)
              return { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A" };
            if (days <= 90)
              return { bg: "#FEF3C7", border: "#FDE68A", text: "#D97706" };
            return { bg: "#FEE2E2", border: "#FECACA", text: "#DC2626" };
          };

          return (
            <Box
              sx={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#16181D",
                  mb: 2,
                }}
              >
                Төлбөрийн хугацааны тайлан
                <Typography
                  component="span"
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#888",
                    ml: 1,
                  }}
                >
                  (байгууллагаар)
                </Typography>
              </Typography>

              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 120px 110px 110px 100px 80px",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  background: "#F8FAFC",
                  borderRadius: "8px",
                  mb: 0.5,
                }}
              >
                {[
                  "Байгууллага",
                  "Нийт дүн",
                  "Захиалгын огноо",
                  "Мөнгө орсон",
                  "Хоног",
                  "Төлөв",
                ].map((h) => (
                  <Typography
                    key={h}
                    sx={{ fontSize: "10px", fontWeight: 800, color: "#999" }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {companies.map((c) => {
                  const days = getDays(c.lastDate, c.noteDate || "");
                  const col = getColor(days, c.paid || c.unpaid === 0);
                  return (
                    <Box
                      key={c.name}
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "1.5fr 120px 110px 110px 100px 80px",
                        gap: 1,
                        px: 1.5,
                        py: 1.2,
                        borderRadius: "8px",
                        border: `1px solid ${col.border}`,
                        background: col.bg,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#16181D",
                        }}
                      >
                        {c.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#16181D",
                        }}
                      >
                        {c.total.toLocaleString()}₮
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "#888" }}>
                        {c.lastDate || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: "#888" }}>
                        {c.noteDate || "—"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: col.text,
                        }}
                      >
                        {c.lastDate ? `${days} хоног` : "—"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: col.text,
                        }}
                      >
                        {c.paid || c.unpaid === 0
                          ? "✓ Төлсөн"
                          : `${c.unpaid.toLocaleString()}₮`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })()}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          {/* Топ 10 жолооч */}
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
                fontSize: "18px",
                fontWeight: 700,
                color: "#16181D",
                mb: 2,
              }}
            >
              Байнга давтагддаг жолоочид
              <Typography
                component="span"
                sx={{ fontSize: "13px", fontWeight: 400, color: "#888", ml: 1 }}
              >
                (Топ 10)
              </Typography>
            </Typography>
            {loading ? (
              <Typography sx={{ color: "#aaa", textAlign: "center", py: 3 }}>
                Уншиж байна...
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr 60px 100px",
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    background: "#F8FAFC",
                    borderRadius: "8px",
                    mb: 0.5,
                  }}
                >
                  {["#", "Нэр", "Захиалга", "Нийт цалин"].map((h) => (
                    <Typography
                      key={h}
                      sx={{ fontSize: "10px", fontWeight: 800, color: "#999" }}
                    >
                      {h}
                    </Typography>
                  ))}
                </Box>
                {driverStats.map((d, i) => (
                  <Box
                    key={d.phone}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr 60px 100px",
                      gap: 1,
                      px: 1,
                      py: 1,
                      borderRadius: "8px",
                      border: "1px solid #F0F0F0",
                      background: i < 3 ? "#FFFBEB" : "#fff",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: i < 3 ? "#D97706" : "#bbb",
                        fontWeight: i < 3 ? 700 : 400,
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#16181D",
                        }}
                      >
                        {d.name}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#888" }}>
                        {d.phone}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#2563EB",
                        textAlign: "center",
                      }}
                    >
                      {d.count}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#16A34A",
                        textAlign: "right",
                      }}
                    >
                      {d.totalSalary.toLocaleString()}₮
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Идэвхгүй жолоочид */}
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
                fontSize: "18px",
                fontWeight: 700,
                color: "#16181D",
                mb: 2,
              }}
            >
              Захиалга огт хийгээгүй жолоочид
              <Typography
                component="span"
                sx={{
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#DC2626",
                  ml: 1,
                }}
              >
                ({inactiveDrivers.length} жолооч)
              </Typography>
            </Typography>
            <Input
              startDecorator={
                <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
              }
              placeholder="Нэр эсвэл утасаар хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ fontSize: "13px", mb: 1.5 }}
            />
            {loading ? (
              <Typography sx={{ color: "#aaa", textAlign: "center", py: 3 }}>
                Уншиж байна...
              </Typography>
            ) : filteredInactive.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4, color: "#bbb" }}>
                <Typography sx={{ fontSize: "32px" }}>🎉</Typography>
                <Typography>Бүх жолооч захиалга хийсэн байна</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px 110px",
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    background: "#F8FAFC",
                    borderRadius: "8px",
                    mb: 0.5,
                  }}
                >
                  {["Нэр", "Утас", "Регистр"].map((h) => (
                    <Typography
                      key={h}
                      sx={{ fontSize: "10px", fontWeight: 800, color: "#999" }}
                    >
                      {h}
                    </Typography>
                  ))}
                </Box>
                {filteredInactive.map((d) => (
                  <Box
                    key={String(d._id)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 110px 110px",
                      gap: 1,
                      px: 1,
                      py: 1,
                      borderRadius: "8px",
                      border: "1px solid #FEE2E2",
                      background: "#FFF5F5",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#16181D",
                      }}
                    >
                      {d.name}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#2563EB" }}>
                      {d.phone}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#888" }}>
                      {d.regno || "—"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </div>
  );
}
