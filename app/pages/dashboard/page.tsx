"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Header from "@/app/components/Header";
import { getOrders, Order, DriverRow } from "@/app/lib/orderService";
import { getDrivers, Driver } from "@/app/lib/driverService";
import SearchIcon from "@mui/icons-material/Search";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([getOrders(), getDrivers()])
      .then(([o, d]) => {
        setOrders(o);
        setDrivers(d);
      })
      .finally(() => setLoading(false));
  }, []);

  // Захиалга хийсэн жолоочийн утасны дугаарууд
  const activePhones = useMemo(() => {
    const phones = new Set<string>();
    orders.forEach((o) =>
      (o.drivers ?? []).forEach((d) => {
        if (d.phone) phones.add(d.phone.replace(/\D/g, ""));
      }),
    );
    return phones;
  }, [orders]);

  // Нийтдээ захиалга байгаагүй жолоочид
  const inactiveDrivers = useMemo(() => {
    return drivers.filter((d) => !activePhones.has(d.phone.replace(/\D/g, "")));
  }, [drivers, activePhones]);

  // Хамгийн олон захиалга хийсэн жолоочид
  const driverStats = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        phone: string;
        regno: string;
        count: number;
        totalSalary: number;
      }
    > = {};
    orders.forEach((o) => {
      (o.drivers ?? []).forEach((d: DriverRow) => {
        const key = d.phone?.replace(/\D/g, "") || d.name;
        if (!map[key]) {
          map[key] = {
            name: d.name,
            phone: d.phone,
            regno: (d as any).regno ?? "",
            count: 0,
            totalSalary: 0,
          };
        }
        map[key].count += 1;
        map[key].totalSalary += d.salary ?? 0;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [orders]);

  // Орлого зардлын мэдээлэл
  const financials = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = activeOrders.reduce(
      (s, o) => s + (o.totalAmount ?? 0),
      0,
    );
    const totalSalary = activeOrders.reduce(
      (s, o) =>
        s +
        (o.drivers ?? []).reduce((ss, d: DriverRow) => ss + (d.salary ?? 0), 0),
      0,
    );
    const totalFuel = activeOrders.reduce(
      (s, o) =>
        s +
        (o.drivers ?? []).reduce((ss, d: DriverRow) => ss + (d.fuel ?? 0), 0),
      0,
    );
    const totalPaid = activeOrders
      .filter((o) => o.paid)
      .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
    const totalUnpaid = totalRevenue - totalPaid;
    const profit = totalRevenue - totalSalary - totalFuel;
    const transferred = orders
      .flatMap((o) => o.drivers ?? [])
      .filter((d) => d.transferred)
      .reduce((s, d: DriverRow) => s + (d.salary ?? 0) + (d.fuel ?? 0), 0);
    const pending = orders
      .flatMap((o) => o.drivers ?? [])
      .filter((d) => !d.transferred)
      .reduce((s, d: DriverRow) => s + (d.salary ?? 0) + (d.fuel ?? 0), 0);
    return {
      totalRevenue,
      totalSalary,
      totalFuel,
      totalPaid,
      totalUnpaid,
      profit,
      transferred,
      pending,
    };
  }, [orders]);

  const filteredInactive = inactiveDrivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search),
  );

  const cards = [
    {
      label: "Нийт гүйлгээ",
      value: financials.totalRevenue,
      color: "#16181D",
      bg: "#F8FAFC",
    },
    {
      label: "Нийт цалин",
      value: financials.totalSalary,
      color: "#16A34A",
      bg: "#F0FDF4",
    },
    {
      label: "Нийт шатахуун",
      value: financials.totalFuel,
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      label: "Ашиг (20%)",
      value: financials.profit,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      label: "Төлөгдсөн",
      value: financials.totalPaid,
      color: "#16A34A",
      bg: "#DCFCE7",
    },
    {
      label: "Төлөгдөөгүй",
      value: financials.totalUnpaid,
      color: "#DC2626",
      bg: "#FEE2E2",
    },
    {
      label: "Шилжүүлсэн цалин",
      value: financials.transferred,
      color: "#16A34A",
      bg: "#F0FDF4",
    },
    {
      label: "Шилжүүлэх цалин",
      value: financials.pending,
      color: "#DC2626",
      bg: "#FEE2E2",
    },
  ];

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
        {/* Орлого зардлын карт */}
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
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1.5,
            }}
          >
            {cards.map((c) => (
              <Box
                key={c.label}
                sx={{
                  background: c.bg,
                  borderRadius: "12px",
                  padding: "14px 16px",
                }}
              >
                <Typography
                  sx={{ fontSize: "18px", fontWeight: 700, color: c.color }}
                >
                  {c.value.toLocaleString()}₮
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#888", mt: 0.3 }}>
                  {c.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          {/* Байнга давтагддаг жолоочид */}
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
                {/* Header */}
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
                {/* Header */}
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
