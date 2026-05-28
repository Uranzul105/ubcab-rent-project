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
import ReceiptIcon from "@mui/icons-material/Receipt";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getOrders, Order } from "@/app/lib/orderService";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  Company,
} from "@/app/lib/companyService";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Invoice helpers
// ─────────────────────────────────────────────
const padZ = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) =>
  `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())}`;

const addDays = (isoStr: string, days: number) => {
  const d = new Date(isoStr);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

const fmtDateSlash = (s: string) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${parseInt(m)}/${parseInt(d)}/${y}`;
};

const fmtNum = (n: number) =>
  Number(n).toLocaleString("mn-MN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const genInvNo = (isoDate: string) => {
  // e.g. 2026-05-09  →  I-20260509-01
  const compact = isoDate.replace(/-/g, "");
  return `I-${compact}-01`;
};

const toMongolianWords = (num: number): string => {
  const units = [
    "",
    "нэг",
    "хоёр",
    "гурав",
    "дөрөв",
    "тав",
    "зургаа",
    "долоо",
    "найм",
    "ес",
  ];
  const tens = [
    "",
    "арав",
    "хорь",
    "гуч",
    "дөч",
    "тавь",
    "жаран",
    "далан",
    "наян",
    "ер",
  ];
  if (!num || num === 0) return "Тэг төгрөг";
  const cvt = (n: number): string => {
    let c = "";
    if (n >= 100) {
      c += units[Math.floor(n / 100)] + " зуун ";
      n %= 100;
    }
    if (n >= 10) {
      c += tens[Math.floor(n / 10)];
      if (n % 10) c += " " + units[n % 10];
    } else if (n > 0) c += units[n];
    return c.trim();
  };
  const scales = ["", "мянган", "саяын", "тэрбумын"];
  const parts: string[] = [];
  let rem = Math.floor(num),
    si = 0;
  while (rem > 0) {
    const ch = rem % 1000;
    if (ch) parts.unshift(cvt(ch) + (si > 0 ? " " + scales[si] : ""));
    rem = Math.floor(rem / 1000);
    si++;
  }
  const r = parts.join(" ") + " төгрөг";
  return r.charAt(0).toUpperCase() + r.slice(1);
};

type InvoiceRow = {
  id: number;
  name: string;
  date: string;
  qty: number;
  price: number;
};

// ─────────────────────────────────────────────
// UbcabLogo — /public/logo.png
// ─────────────────────────────────────────────
function UbcabLogo({ height = 38 }: { height?: number }) {
  return (
    <img
      src="/logo.png"
      alt="ЮБИКАБ rent"
      style={{ height, width: "auto", objectFit: "contain" }}
    />
  );
}

// ─────────────────────────────────────────────
// InvoiceSheet — printable invoice component
// ─────────────────────────────────────────────
function InvoiceSheet({
  company,
  invNo,
  issueDate,
  payDue,
  periodStart,
  periodEnd,
  rows,
  setRows,
  manager,
  editable = false,
}: {
  company: Company | null;
  invNo: string;
  issueDate: string;
  payDue: string;
  periodStart: string;
  periodEnd: string;
  rows: InvoiceRow[];
  setRows: React.Dispatch<React.SetStateAction<InvoiceRow[]>>;
  manager: string;
  editable?: boolean;
}) {
  const total = rows.reduce((s, r) => s + Number(r.qty) * Number(r.price), 0);

  const updRow = (id: number, field: keyof InvoiceRow, val: string | number) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
    );

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  return (
    <Box
      sx={{
        background: "#fff",
        color: "#222",
        borderRadius: "12px",
        border: "0.5px solid #e0e0e0",
        padding: "28px 32px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        "@media print": {
          boxShadow: "none",
          border: "none",
          borderRadius: 0,
          padding: "0",
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2.5px solid #185FA5",
          paddingBottom: "16px",
          marginBottom: "20px",
          gap: 2,
        }}
      >
        {/* Left: logo + sender */}
        <Box>
          <UbcabLogo height={36} />
          <Typography
            sx={{ fontSize: "11px", color: "#555", mt: 1, lineHeight: 1.8 }}
          >
            Сүхбаатар дүүрэг, 1-р хороо, Нарны зам
            <br />
            ЮБИКАБ ТӨВ ОФФИС
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#555", mt: 0.5 }}>
            Төлбөр хүлээн авагчийн нэр:
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>
            ЮБИКАБ ХХК
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "#666", mt: 0.3 }}>
            РД:5751888 УТАС:7780-7780
          </Typography>
          <Box sx={{ mt: 1, fontSize: "11px" }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
              Төлбөр төлөх данс:
            </Typography>
            <Typography sx={{ fontSize: "11px" }}>
              Голомт банк: 1605147231
            </Typography>
            <Typography sx={{ fontSize: "11px" }}>
              IBAN: MN340015001605147231
            </Typography>
          </Box>
        </Box>

        {/* Center: НЭХЭМЖЛЭЛ */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "26px",
              fontWeight: 800,
              color: "#185FA5",
              letterSpacing: 2,
            }}
          >
            НЭХЭМЖЛЭЛ
          </Typography>
          <Typography sx={{ fontSize: "11px", color: "#888", mt: 0.5 }}>
            № {invNo}
          </Typography>
        </Box>

        {/* Right: meta */}
        <Box
          sx={{
            textAlign: "right",
            fontSize: "11px",
            lineHeight: 2.1,
            minWidth: 200,
          }}
        >
          <Typography sx={{ fontSize: "11px" }}>
            <span style={{ color: "#888" }}>Нэхэмжилсэн огноо: </span>
            <strong>{fmtDateSlash(issueDate)}</strong>
          </Typography>
          <Typography sx={{ fontSize: "11px" }}>
            <span style={{ color: "#888" }}>Төлөгчийн нэр: </span>
            <strong>{company?.name ?? ""}</strong>
          </Typography>
          <Typography sx={{ fontSize: "11px" }}>
            <span style={{ color: "#888" }}>Регистр дугаар </span>
            <strong>{company?.regno ?? ""}</strong>
          </Typography>

          <Typography sx={{ fontSize: "11px", mt: 0.5, fontStyle: "italic" }}>
            <span style={{ color: "#888" }}>Хамрах хугацаа: </span>
            <strong>
              {fmtDateSlash(periodStart)} - {fmtDateSlash(periodEnd)}
            </strong>
          </Typography>
          <Typography sx={{ fontSize: "11px" }}>
            <span style={{ color: "#888" }}>Төлбөр төлөх огноо </span>
            <strong>{fmtDateSlash(payDue)}</strong>
          </Typography>
        </Box>
      </Box>

      {/* ── Table ── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11.5px",
        }}
      >
        <thead>
          <tr>
            {[
              "№",
              "Ажлын нэр",
              "Огноо",
              "Нэгж",
              "Нэг бүрийн үнэ",
              "НИЙТ ҮНЭ",
            ].map((h, i) => (
              <th
                key={h}
                style={{
                  background: "#185FA5",
                  color: "#fff",
                  padding: "7px 10px",
                  fontWeight: 600,
                  fontSize: "11px",
                  textAlign: i === 0 ? "left" : i === 1 ? "left" : "right",
                  width:
                    i === 0
                      ? 28
                      : i === 2
                        ? 90
                        : i === 3
                          ? 50
                          : i >= 4
                            ? 108
                            : undefined,
                }}
              >
                {h}
              </th>
            ))}
            {editable && <th style={{ background: "#185FA5", width: 32 }} />}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id}
              style={{ background: i % 2 === 1 ? "#f8fafc" : "#fff" }}
            >
              <td
                style={{
                  padding: "6px 10px",
                  borderBottom: "0.5px solid #eee",
                }}
              >
                {i + 1}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  borderBottom: "0.5px solid #eee",
                }}
              >
                {editable ? (
                  <input
                    style={{
                      background: "transparent",
                      border: "0.5px solid #ddd",
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: 12,
                      width: "100%",
                    }}
                    type="text"
                    value={r.name}
                    onChange={(e) => updRow(r.id, "name", e.target.value)}
                  />
                ) : (
                  r.name
                )}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  borderBottom: "0.5px solid #eee",
                  textAlign: "center",
                }}
              >
                {editable ? (
                  <input
                    style={{
                      background: "transparent",
                      border: "0.5px solid #ddd",
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: 12,
                      width: "100%",
                    }}
                    type="date"
                    value={r.date}
                    onChange={(e) => updRow(r.id, "date", e.target.value)}
                  />
                ) : (
                  fmtDateSlash(r.date)
                )}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  borderBottom: "0.5px solid #eee",
                  textAlign: "right",
                }}
              >
                {editable ? (
                  <input
                    style={{
                      background: "transparent",
                      border: "0.5px solid #ddd",
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: 12,
                      width: "100%",
                      textAlign: "right",
                    }}
                    type="number"
                    min={1}
                    value={r.qty}
                    onChange={(e) =>
                      updRow(r.id, "qty", Number(e.target.value))
                    }
                  />
                ) : (
                  r.qty
                )}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  borderBottom: "0.5px solid #eee",
                  textAlign: "right",
                }}
              >
                {editable ? (
                  <input
                    style={{
                      background: "transparent",
                      border: "0.5px solid #ddd",
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: 12,
                      width: "100%",
                      textAlign: "right",
                    }}
                    type="number"
                    min={0}
                    value={r.price}
                    onChange={(e) =>
                      updRow(r.id, "price", Number(e.target.value))
                    }
                  />
                ) : (
                  fmtNum(r.price)
                )}
              </td>
              <td
                style={{
                  padding: "6px 10px",
                  borderBottom: "0.5px solid #eee",
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                {fmtNum(Number(r.qty) * Number(r.price))}
              </td>
              {editable && (
                <td style={{ padding: "4px" }}>
                  <button
                    onClick={() => removeRow(r.id)}
                    style={{
                      background: "transparent",
                      color: "#A32D2D",
                      border: "0.5px solid #F09595",
                      borderRadius: 4,
                      fontSize: 11,
                      padding: "3px 7px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
          <tr>
            <td
              colSpan={editable ? 6 : 5}
              style={{
                padding: "8px 16px 8px 10px",
                textAlign: "right",
                fontWeight: 700,
                background: "#E6F1FB",
                borderTop: "2px solid #185FA5",
              }}
            >
              НИЙТ
            </td>
            <td
              style={{
                padding: "8px 10px",
                textAlign: "right",
                fontWeight: 700,
                background: "#E6F1FB",
                borderTop: "2px solid #185FA5",
              }}
            >
              {fmtNum(total)}.0
            </td>
            {editable && (
              <td
                style={{
                  background: "#E6F1FB",
                  borderTop: "2px solid #185FA5",
                }}
              />
            )}
          </tr>
        </tbody>
      </table>

      {/* Add row button — only in edit mode */}
      {editable && (
        <Box sx={{ mt: 1, "@media print": { display: "none" } }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  name: "",
                  date: periodStart,
                  qty: 1,
                  price: 60000,
                },
              ])
            }
            sx={{ fontSize: "12px", borderRadius: "8px" }}
          >
            + Мөр нэмэх
          </Button>
        </Box>
      )}

      {/* ── Footer ── */}
      <Box sx={{ mt: 2.5, borderTop: "0.5px solid #ccc", pt: 1.5 }}>
        <Typography sx={{ fontSize: "12px", color: "#444", mb: 3.5 }}>
          {toMongolianWords(total)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#555" }}>
              ЮБИКАБ Байгууллага хариуцсан менежер
            </Typography>
            <Box sx={{ borderTop: "1px solid #888", width: 200, mt: 3.5 }} />
          </Box>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            /{manager}/
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────
// InvoiceView — full invoice creation flow
// ─────────────────────────────────────────────
function InvoiceView({
  company,
  orders,
  onBack,
  unpaid,
}: {
  company: Company;
  orders: Order[];
  onBack: () => void;
  unpaid: number;
}) {
  const now = new Date();
  const todayISO = toISO(now);

  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [invNo, setInvNo] = useState(genInvNo(todayISO));
  const [issueDate, setIssueDate] = useState(todayISO);
  const [payDue, setPayDue] = useState(addDays(todayISO, 14));
  const [periodStart, setPeriodStart] = useState(
    toISO(new Date(now.getFullYear(), now.getMonth(), 1)),
  );
  const [periodEnd, setPeriodEnd] = useState(
    toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  );
  const [manager, setManager] = useState("Б.Бэлгүүн");
  const [rows, setRows] = useState<InvoiceRow[]>([
    { id: 1, name: "Машин түрээс", date: todayISO, qty: 1, price: unpaid },
  ]);

  // issueDate өөрчлөгдөхөд payDue автоматаар +14 хоног
  const handleIssueDate = (val: string) => {
    setIssueDate(val);
    setPayDue(addDays(val, 14));
    setInvNo(genInvNo(val));
  };

  const total = rows.reduce((s, r) => s + Number(r.qty) * Number(r.price), 0);
  const SEL = { fontSize: "13px", height: 36 };

  return (
    <Box>
      {/* Top bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          "@media print": { display: "none" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="plain"
            color="neutral"
            startDecorator={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ fontSize: "13px" }}
          >
            Буцах
          </Button>
          <Typography sx={{ color: "#ccc" }}>|</Typography>
          <Typography
            sx={{ fontSize: "13px", fontWeight: 600, color: "#16181D" }}
          >
            {company.name}
          </Typography>
          {step === "preview" && (
            <>
              <Typography sx={{ color: "#ccc" }}>|</Typography>
              <Typography sx={{ fontSize: "12px", color: "#888" }}>
                Урьдчилж харах
              </Typography>
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {step === "preview" ? (
            <>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                onClick={() => setStep("edit")}
                sx={{ fontSize: "12px", borderRadius: "8px" }}
              >
                ← Засах
              </Button>
              <Button
                startDecorator={<PrintIcon />}
                size="sm"
                onClick={() => window.print()}
                sx={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#facc15",
                  color: "#000",
                  fontWeight: 700,
                  "&:hover": { backgroundColor: "#eab308" },
                }}
              >
                PDF татах / хэвлэх
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="neutral"
                size="sm"
                onClick={() => setStep("preview")}
                sx={{ fontSize: "12px", borderRadius: "8px" }}
              >
                👁 Урьдчилж харах
              </Button>
              <Button
                startDecorator={<PrintIcon />}
                size="sm"
                onClick={() => {
                  setStep("preview");
                  setTimeout(() => window.print(), 400);
                }}
                sx={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#facc15",
                  color: "#000",
                  fontWeight: 700,
                  "&:hover": { backgroundColor: "#eab308" },
                }}
              >
                PDF татах
              </Button>
            </>
          )}
        </Box>
      </Box>

      {step === "edit" ? (
        /* ── EDIT STEP ── */
        <Box
          sx={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "20px",
            padding: "24px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Settings grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 3,
            }}
          >
            {/* Left */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#999",
                  letterSpacing: "0.06em",
                }}
              >
                НЭХЭМЖЛЭХИЙН ТОХИРГОО
              </Typography>
              <Box>
                <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                  Нэхэмжлэхийн дугаар
                </Typography>
                <Input
                  value={invNo}
                  onChange={(e) => setInvNo(e.target.value)}
                  sx={{ ...SEL }}
                />
              </Box>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
              >
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                    Нэхэмжилсэн огноо
                  </Typography>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => handleIssueDate(e.target.value)}
                    sx={SEL}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                    Төлбөр төлөх огноо{" "}
                    <span style={{ color: "#185FA5" }}>(+14 хоног)</span>
                  </Typography>
                  <Input
                    type="date"
                    value={payDue}
                    onChange={(e) => setPayDue(e.target.value)}
                    sx={SEL}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                    Хугацаа эхлэх
                  </Typography>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    sx={SEL}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                    Хугацаа дуусах
                  </Typography>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    sx={SEL}
                  />
                </Box>
              </Box>
            </Box>

            {/* Right — auto-filled from company */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#999",
                  letterSpacing: "0.06em",
                }}
              >
                ЗАХИАЛАГЧИЙН МЭДЭЭЛЭЛ (АВТОМАТ)
              </Typography>
              <Box>
                <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                  Байгууллагын нэр
                </Typography>
                <Input
                  value={company.name}
                  readOnly
                  sx={{ ...SEL, opacity: 0.7 }}
                />
              </Box>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
              >
                <Box>
                  <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                    Регистр
                  </Typography>
                  <Input
                    value={company.regno ?? ""}
                    readOnly
                    sx={{ ...SEL, opacity: 0.7 }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "11px", color: "#999", mb: 0.5 }}>
                  Менежерийн нэр
                </Typography>
                <Input
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  sx={SEL}
                />
              </Box>
            </Box>
          </Box>

          {/* Rows table */}
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#999",
              letterSpacing: "0.06em",
              mb: 1.5,
            }}
          >
            АЖЛЫН МЭДЭЭЛЭЛ
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {[
                    "#",
                    "Ажлын нэр",
                    "Огноо",
                    "Нэгж",
                    "Нэг бүрийн үнэ",
                    "Нийт үнэ",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "7px 8px",
                        fontWeight: 600,
                        color: "#888",
                        textAlign: i === 0 || i === 1 ? "left" : "right",
                        width:
                          i === 0
                            ? 28
                            : i === 2
                              ? 120
                              : i === 3
                                ? 60
                                : i >= 4 && i <= 5
                                  ? 115
                                  : 32,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: "0.5px solid #eee" }}>
                    <td style={{ padding: "5px 8px", color: "#aaa" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "4px 8px" }}>
                      <input
                        style={{
                          background: "transparent",
                          border: "0.5px solid #ddd",
                          borderRadius: 4,
                          padding: "4px 6px",
                          fontSize: 12,
                          width: "100%",
                          minWidth: 160,
                        }}
                        type="text"
                        value={r.name}
                        onChange={(e) =>
                          setRows((p) =>
                            p.map((x) =>
                              x.id === r.id
                                ? { ...x, name: e.target.value }
                                : x,
                            ),
                          )
                        }
                        placeholder="Ажлын нэр..."
                      />
                    </td>
                    <td style={{ padding: "4px 8px" }}>
                      <input
                        style={{
                          background: "transparent",
                          border: "0.5px solid #ddd",
                          borderRadius: 4,
                          padding: "4px 6px",
                          fontSize: 12,
                          width: "100%",
                        }}
                        type="date"
                        value={r.date}
                        onChange={(e) =>
                          setRows((p) =>
                            p.map((x) =>
                              x.id === r.id
                                ? { ...x, date: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td style={{ padding: "4px 8px" }}>
                      <input
                        style={{
                          background: "transparent",
                          border: "0.5px solid #ddd",
                          borderRadius: 4,
                          padding: "4px 6px",
                          fontSize: 12,
                          width: "100%",
                          textAlign: "right",
                        }}
                        type="number"
                        min={1}
                        value={r.qty}
                        onChange={(e) =>
                          setRows((p) =>
                            p.map((x) =>
                              x.id === r.id
                                ? { ...x, qty: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td style={{ padding: "4px 8px" }}>
                      <input
                        style={{
                          background: "transparent",
                          border: "0.5px solid #ddd",
                          borderRadius: 4,
                          padding: "4px 6px",
                          fontSize: 12,
                          width: "100%",
                          textAlign: "right",
                        }}
                        type="number"
                        min={0}
                        value={r.price}
                        onChange={(e) =>
                          setRows((p) =>
                            p.map((x) =>
                              x.id === r.id
                                ? { ...x, price: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td
                      style={{
                        padding: "5px 8px",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {fmtNum(Number(r.qty) * Number(r.price))}
                    </td>
                    <td style={{ padding: "4px" }}>
                      <button
                        onClick={() =>
                          setRows((p) => p.filter((x) => x.id !== r.id))
                        }
                        style={{
                          background: "transparent",
                          color: "#A32D2D",
                          border: "0.5px solid #F09595",
                          borderRadius: 4,
                          fontSize: 11,
                          padding: "3px 7px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", mt: 1.5, gap: 1.5 }}
          >
            <Button
              variant="outlined"
              color="neutral"
              size="sm"
              onClick={() =>
                setRows((p) => [
                  ...p,
                  {
                    id: Date.now(),
                    name: "",
                    date: periodStart,
                    qty: 1,
                    price: 60000,
                  },
                ])
              }
              sx={{ fontSize: "12px", borderRadius: "8px" }}
            >
              + Мөр нэмэх
            </Button>
            <Typography sx={{ ml: "auto", fontSize: 13, fontWeight: 600 }}>
              Нийт:{" "}
              <span style={{ color: "#185FA5", fontSize: 15 }}>
                {fmtNum(total)} ₮
              </span>
            </Typography>
          </Box>
        </Box>
      ) : (
        /* ── PREVIEW STEP ── */
        <InvoiceSheet
          company={company}
          invNo={invNo}
          issueDate={issueDate}
          payDue={payDue}
          periodStart={periodStart}
          periodEnd={periodEnd}
          rows={rows}
          setRows={setRows}
          manager={manager}
          editable={false}
        />
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CompanyGroup = {
  company: Company;
  orders: Order[];
  total: number;
  paid: number;
  unpaid: number;
  totalFuel: number;
};

// "page" can be: "list" | "detail" | "invoice"
type PageView = "list" | "detail" | "invoice";

// ─────────────────────────────────────────────
// CompanyPage (main export)
// ─────────────────────────────────────────────
export default function CompanyPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [pageView, setPageView] = useState<PageView>("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", regno: "" });
  const [search, setSearch] = useState("");

  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");

  const [detailYear, setDetailYear] = useState(now.getFullYear());
  const [detailMonth, setDetailMonth] = useState<number | "all">("all");
  const [detailFrom, setDetailFrom] = useState("");
  const [detailTo, setDetailTo] = useState("");
  const [page, setPage] = useState(1);
  const PER = 10;

  useEffect(() => {
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
      return (
        d.getFullYear() === filterYear &&
        (filterMonth === "all" || d.getMonth() === filterMonth)
      );
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
        const totalFuel = cos.reduce(
          (s, o) =>
            s + (o.drivers ?? []).reduce((ss, d) => ss + (d.fuel ?? 0), 0),
          0,
        );
        return {
          company,
          orders: [...cos].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
          total,
          paid,
          unpaid: total - paid,
          totalFuel,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [companies, filteredOrders, search]);

  const footerTotal = companyGroups.reduce((s, g) => s + g.total, 0);
  const footerPaid = companyGroups.reduce((s, g) => s + g.paid, 0);
  const footerUnpaid = companyGroups.reduce((s, g) => s + g.unpaid, 0);
  const footerFuel = companyGroups.reduce((s, g) => s + g.totalFuel, 0);

  const selectedGroup =
    companyGroups.find((g) => g.company.name === selected) ?? null;

  const detailOrders = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.orders.filter((o) => {
      const d = new Date(o.date);
      return (
        d.getFullYear() === detailYear &&
        (detailMonth === "all" || d.getMonth() === detailMonth) &&
        (detailFrom ? o.date >= detailFrom : true) &&
        (detailTo ? o.date <= detailTo : true)
      );
    });
  }, [selectedGroup, detailYear, detailMonth, detailFrom, detailTo]);

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

  const totalPages = Math.ceil(companyGroups.length / PER);
  const pagedGroups = companyGroups.slice((page - 1) * PER, page * PER);

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
      {/* Hide header on print */}
      <div
        style={{ position: "relative", zIndex: 10 }}
        className="print:hidden"
      >
        <Header />
      </div>

      <Box sx={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
        {/* ══════════════════════════════════════
            INVOICE VIEW
        ══════════════════════════════════════ */}
        {pageView === "invoice" && selectedGroup && (
          <InvoiceView
            company={selectedGroup.company}
            orders={selectedGroup.orders}
            onBack={() => {
              setPageView("detail");
            }}
            unpaid={selectedGroup.unpaid}
          />
        )}

        {/* ══════════════════════════════════════
            DETAIL VIEW
        ══════════════════════════════════════ */}
        {pageView === "detail" && selectedGroup && (
          <Box>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => {
                setSelected(null);
                setPageView("list");
              }}
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
              {/* Title + Нэхэмжлэх button */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{ fontSize: "22px", fontWeight: 700, color: "#16181D" }}
                >
                  {selectedGroup.company.name}
                </Typography>
                <Button
                  startDecorator={<ReceiptIcon />}
                  onClick={() => setPageView("invoice")}
                  sx={{
                    backgroundColor: "#facc15",
                    color: "#000",
                    fontWeight: 700,
                    borderRadius: "40px",
                    fontSize: "13px",
                    "&:hover": { backgroundColor: "#eab308" },
                  }}
                >
                  Нэхэмжлэх үүсгэх
                </Button>
              </Box>

              {/* Detail filter */}
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

              {/* Stat cards */}
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

              {/* Order list */}
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
        )}

        {/* ══════════════════════════════════════
            LIST VIEW
        ══════════════════════════════════════ */}
        {pageView === "list" && (
          <Box
            sx={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
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

            {/* Filters */}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                startDecorator={
                  <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
                }
                sx={{ ...SEL, flex: 1, minWidth: 200 }}
              />
            </Box>

            {/* List */}
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
                  {pagedGroups.map((group) => (
                    <Box
                      key={String(group.company._id)}
                      onClick={() => {
                        setSelected(group.company.name);
                        setPageView("detail");
                      }}
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
                    </Box>
                  ))}
                </Box>

                {/* Footer totals */}
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

                {/* Pagination */}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
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
              </>
            )}
          </Box>
        )}
      </Box>

      {/* ── Modal: Байгууллага нэмэх ── */}
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
