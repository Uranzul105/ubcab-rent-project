"use client";

import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import IconButton from "@mui/joy/IconButton";
import Header from "@/app/components/Header";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { getOrders, Order } from "@/app/lib/orderService";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  Company,
} from "@/app/lib/companyService";

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
  company: Company;
  orders: Order[];
  total: number;
  paid: number;
  unpaid: number;
  totalFuel: number;
};

export default function CompanyPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", regno: "" });
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  // Жагсаалтын filter
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");

  // Дэлгэрэнгүй дотор filter
  const [detailYear, setDetailYear] = useState(now.getFullYear());
  const [detailMonth, setDetailMonth] = useState<number | "all">("all");
  const [detailFrom, setDetailFrom] = useState("");
  const [detailTo, setDetailTo] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser") || "null");
    setUser(u);
    Promise.all([getOrders(), getCompanies()])
      .then(([o, c]) => {
        setOrders(o);
        setCompanies(c);
      })
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
    return companies
      .filter((c) =>
        search ? c.name.toLowerCase().includes(search.toLowerCase()) : true,
      )
      .map((company) => {
        const cos = filteredOrders.filter(
          (o) => o.customerName === company.name,
        );
        const total = cos.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
        const paid = cos
          .filter((o) => o.paid)
          .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
        const unpaid = total - paid;
        const totalFuel = cos.reduce(
          (s, o) =>
            s + (o.drivers ?? []).reduce((ss, d) => ss + (d.fuel ?? 0), 0),
          0,
        );
        const sortedOrders = [...cos].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        return {
          company,
          orders: sortedOrders,
          total,
          paid,
          unpaid,
          totalFuel,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.orders[0]?.date ?? 0).getTime() -
          new Date(a.orders[0]?.date ?? 0).getTime(),
      );
  }, [companies, filteredOrders, search]);

  // Хөл дүн
  const footerTotal = companyGroups.reduce((s, g) => s + g.total, 0);
  const footerPaid = companyGroups.reduce((s, g) => s + g.paid, 0);
  const footerUnpaid = companyGroups.reduce((s, g) => s + g.unpaid, 0);
  const footerFuel = companyGroups.reduce((s, g) => s + g.totalFuel, 0);

  const selectedGroup =
    companyGroups.find((g) => g.company.name === selected) ?? null;

  // Дэлгэрэнгүй дотор шүүсэн захиалгууд
  const detailOrders = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.orders.filter((o) => {
      const d = new Date(o.date);
      const matchYear = d.getFullYear() === detailYear;
      const matchMonth =
        detailMonth === "all" ? true : d.getMonth() === detailMonth;
      const matchFrom = detailFrom ? o.date >= detailFrom : true;
      const matchTo = detailTo ? o.date <= detailTo : true;
      return matchYear && matchMonth && matchFrom && matchTo;
    });
  }, [selectedGroup, detailYear, detailMonth, detailFrom, detailTo]);

  // Дэлгэрэнгүй статистик
  const detailTotal = detailOrders.reduce(
    (s, o) => s + (o.totalAmount ?? 0),
    0,
  );
  const detailPaid = detailOrders
    .filter((o) => o.paid)
    .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const detailUnpaid = detailTotal - detailPaid;
  const detailFuel = detailOrders.reduce(
    (s, o) => s + (o.drivers ?? []).reduce((ss, d) => ss + (d.fuel ?? 0), 0),
    0,
  );

  const handleAddCompany = async () => {
    if (!form.name) {
      alert("Байгууллагын нэр оруулна уу");
      return;
    }
    const newCompany = await createCompany({
      name: form.name,
      regno: form.regno,
    });
    setCompanies((prev) => [...prev, newCompany]);
    setForm({ name: "", regno: "" });
    setModalOpen(false);
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await deleteCompany(id);
    setCompanies((prev) => prev.filter((c) => String(c._id) !== id));
  };

  const SEL = { fontSize: "13px", height: 36 };

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
          // Дэлгэрэнгүй
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
                {selectedGroup.company.name}
              </Typography>

              {/* Дэлгэрэнгүй filter */}
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
                  value={detailYear}
                  onChange={(_, v) => v && setDetailYear(v)}
                  sx={SEL}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <Option key={y} value={y}>
                      {y} он
                    </Option>
                  ))}
                </Select>
                <Select<number | "all">
                  value={detailMonth}
                  onChange={(_, v) =>
                    v !== null && setDetailMonth(v as number | "all")
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
                  value={detailFrom}
                  onChange={(e) => setDetailFrom(e.target.value)}
                  sx={{ ...SEL, width: 145 }}
                />
                <Typography sx={{ fontSize: "13px", color: "#888" }}>
                  -
                </Typography>
                <Input
                  type="date"
                  value={detailTo}
                  onChange={(e) => setDetailTo(e.target.value)}
                  sx={{ ...SEL, width: 145 }}
                />
                {(detailFrom || detailTo || detailMonth !== "all") && (
                  <Button
                    variant="outlined"
                    color="neutral"
                    size="sm"
                    onClick={() => {
                      setDetailFrom("");
                      setDetailTo("");
                      setDetailMonth("all");
                    }}
                    sx={{ borderRadius: "8px", fontSize: "12px" }}
                  >
                    Цэвэрлэх
                  </Button>
                )}
              </Box>

              {/* Статистик */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 1.5,
                  mb: detailFuel > 0 ? 1.5 : 2.5,
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
                    {detailOrders.length} ш
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
                    {detailTotal.toLocaleString()}₮
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
                    {detailPaid.toLocaleString()}₮
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                    Төлөгдсөн
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background: detailUnpaid > 0 ? "#FEE2E2" : "#DCFCE7",
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: detailUnpaid > 0 ? "#DC2626" : "#16A34A",
                    }}
                  >
                    {detailUnpaid > 0
                      ? detailUnpaid.toLocaleString() + "₮"
                      : "Бүгд төлсөн"}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.5 }}>
                    Үлдэгдэл
                  </Typography>
                </Box>
              </Box>

              {/* Шатахуун */}
              {detailFuel > 0 && (
                <Box
                  sx={{
                    background: "#FEF3C7",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    mb: 2.5,
                  }}
                >
                  <Typography
                    sx={{ fontSize: "15px", fontWeight: 700, color: "#D97706" }}
                  >
                    Нийт шатахуун: {detailFuel.toLocaleString()}₮
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
                <Typography
                  component="span"
                  sx={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#888",
                    ml: 1,
                  }}
                >
                  ({detailOrders.length} захиалга)
                </Typography>
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {detailOrders.length === 0 ? (
                  <Box
                    sx={{ textAlign: "center", padding: "32px", color: "#bbb" }}
                  >
                    <Typography>Захиалга байхгүй байна</Typography>
                  </Box>
                ) : (
                  detailOrders.map((o) => {
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
                          <Typography
                            sx={{ fontWeight: 700, fontSize: "14px" }}
                          >
                            {(o.totalAmount ?? 0).toLocaleString()}₮
                          </Typography>
                          <Typography
                            sx={{ fontSize: "12px", color: "#16A34A" }}
                          >
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
                          {o.paid ? "Төлсөн" : "Төлөөгүй"}
                        </Chip>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          // Жагсаалт
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
              <Button
                onClick={() => setModalOpen(true)}
                startDecorator={<AddIcon />}
                sx={{
                  backgroundColor: "#facc15",
                  color: "#000",
                  fontWeight: 700,
                  borderRadius: "40px",
                  "&:hover": { backgroundColor: "#eab308" },
                }}
              >
                Байгууллага нэмэх
              </Button>
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
                placeholder="Байгууллагын нэрээр хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startDecorator={
                  <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
                }
                sx={{ ...SEL, flex: 1, minWidth: 200 }}
              />
            </Box>

            {/* Жагсаалт */}
            {loading ? (
              <Box sx={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                <Typography>Уншиж байна...</Typography>
              </Box>
            ) : companyGroups.length === 0 ? (
              <Box sx={{ textAlign: "center", padding: "48px", color: "#bbb" }}>
                <Typography sx={{ fontSize: "40px" }}>🏢</Typography>
                <Typography>Байгууллага байхгүй байна</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {companyGroups.map((group) => (
                    <Box
                      key={String(group.company._id)}
                      onClick={() => setSelected(group.company.name)}
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
                          {group.company.name}
                          {group.company.regno && (
                            <Typography
                              component="span"
                              sx={{ fontSize: "12px", color: "#888", ml: 1 }}
                            >
                              РД: {group.company.regno}
                            </Typography>
                          )}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "12px", color: "#888", mt: 0.3 }}
                        >
                          {group.orders.length} захиалга
                          {group.orders[0]?.date
                            ? ` · Сүүлд: ${group.orders[0].date}`
                            : ""}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 3 }}>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#16181D",
                            }}
                          >
                            {group.total.toLocaleString()}₮
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#888" }}>
                            нийт дүн
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#16A34A",
                            }}
                          >
                            {group.paid.toLocaleString()}₮
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#888" }}>
                            төлөгдсөн
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: group.unpaid > 0 ? "#DC2626" : "#16A34A",
                            }}
                          >
                            {group.unpaid > 0
                              ? group.unpaid.toLocaleString() + "₮"
                              : "✓"}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: "#888" }}>
                            үлдэгдэл
                          </Typography>
                        </Box>
                        {group.totalFuel > 0 && (
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#D97706",
                              }}
                            >
                              ⛽ {group.totalFuel.toLocaleString()}₮
                            </Typography>
                            <Typography
                              sx={{ fontSize: "11px", color: "#888" }}
                            >
                              шатахуун
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {/* <Box
                        sx={{ display: "flex", gap: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          onClick={() =>
                            handleDeleteCompany(String(group.company._id))
                          }
                          sx={{ borderRadius: "8px" }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box> */}
                      {/* <Typography sx={{ fontSize: "18px", color: "#bbb" }}>
                        ›
                      </Typography> */}
                    </Box>
                  ))}
                </Box>

                {/* Хөл дүн */}
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
                    Нийт дүн:{" "}
                    <b style={{ color: "#16181D" }}>
                      {footerTotal.toLocaleString()}₮
                    </b>
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#888" }}>
                    Төлөгдсөн:{" "}
                    <b style={{ color: "#16A34A" }}>
                      {footerPaid.toLocaleString()}₮
                    </b>
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#888" }}>
                    Үлдэгдэл:{" "}
                    <b style={{ color: "#DC2626" }}>
                      {footerUnpaid.toLocaleString()}₮
                    </b>
                  </Typography>
                  {footerFuel > 0 && (
                    <Typography sx={{ fontSize: "13px", color: "#888" }}>
                      Шатахуун:{" "}
                      <b style={{ color: "#D97706" }}>
                        {footerFuel.toLocaleString()}₮
                      </b>
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Modal — Байгууллага нэмэх */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Sheet sx={{ borderRadius: "20px", p: 3, width: 420, outline: "none" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
              Байгууллага нэмэх
            </Typography>
            <ModalClose onClick={() => setModalOpen(false)} />
          </Box>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#999",
                  mb: 0.5,
                }}
              >
                БАЙГУУЛЛ. НЭР
              </Typography>
              <Input
                placeholder="Нэр оруулах..."
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                sx={{ fontSize: "13px", height: 40 }}
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
                РЕГИСТР ДУГААР
              </Typography>
              <Input
                placeholder="РД оруулах..."
                value={form.regno}
                onChange={(e) =>
                  setForm((f) => ({ ...f, regno: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleAddCompany()}
                sx={{ fontSize: "13px", height: 40 }}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setModalOpen(false)}
              sx={{ flex: 1, borderRadius: "40px" }}
            >
              Болих
            </Button>
            <Button
              onClick={handleAddCompany}
              sx={{
                flex: 2,
                borderRadius: "40px",
                backgroundColor: "#facc15",
                color: "#000",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#eab308" },
              }}
            >
              Нэмэх
            </Button>
          </Box>
        </Sheet>
      </Modal>
    </div>
  );
}
