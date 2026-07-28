"use client";

import { useState } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";

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
  const unitsJoined = [
    "",
    "нэгэн",
    "хоёр",
    "гурван",
    "дөрвөн",
    "таван",
    "зургаан",
    "долоон",
    "найман",
    "есөн",
  ];
  if (!num || num === 0) return "Тэг төгрөг";
  const cvt = (n: number, joined = false): string => {
    if (n === 0) return "";
    let c = "";
    if (n >= 100) {
      c += unitsJoined[Math.floor(n / 100)] + " зуун";
      n %= 100;
      if (n > 0) c += " ";
    }
    if (n >= 10) {
      const t = Math.floor(n / 10),
        u = n % 10;
      if (u === 0) {
        const te = [
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
        c += te[t];
      } else {
        const tm = [
          "",
          "арван",
          "хорин",
          "гучин",
          "дөчин",
          "тавин",
          "жаран",
          "далан",
          "наян",
          "ерэн",
        ];
        c += tm[t] + " " + (joined ? unitsJoined[u] : units[u]);
      }
    } else if (n > 0) c += joined ? unitsJoined[n] : units[n];
    return c.trim();
  };
  let rem = Math.floor(num);
  const terbum = Math.floor(rem / 1_000_000_000);
  rem %= 1_000_000_000;
  const saya = Math.floor(rem / 1_000_000);
  rem %= 1_000_000;
  const myanga = Math.floor(rem / 1_000);
  rem %= 1_000;
  const last = rem;
  const parts: string[] = [];
  if (terbum) parts.push(cvt(terbum, true) + " тэрбум");
  if (saya) parts.push(cvt(saya, true) + " сая");
  if (myanga) parts.push(cvt(myanga, true) + " мянга");
  if (last) parts.push(cvt(last, true));
  const r = parts.join(" ") + " төгрөг";
  return r.charAt(0).toUpperCase() + r.slice(1);
};

type Props = {
  totalAmount: number;
  userName: string;
  onClose: () => void;
  onConfirm: (paymentRef: string) => void;
};

export default function PaymentApprovalModal({
  totalAmount,
  userName,
  onClose,
  onConfirm,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [y, m, d] = today.split("-");
  const [seqNum] = useState(1);
  const todayCompact = today.replace(/-/g, "");
  const paymentRef = `ТЗ${todayCompact}${String(seqNum).padStart(2, "0")}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "32px 40px",
          width: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* Товчнууд — хэвлэхэд харагдахгүй */}
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
          className="no-print"
        >
          <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>
            Төлбөр зөвшөөрөх баримт
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={onClose}
            >
              Хаах
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              sx={{
                backgroundColor: "#2563EB",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#1D4ED8" },
              }}
            >
              🖨️ Хэвлэх
            </Button>
            <Button
              size="sm"
              onClick={() => onConfirm(paymentRef)}
              sx={{
                backgroundColor: "#16A34A",
                color: "#fff",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#15803D" },
              }}
            >
              ✓ Баталгаажуулах
            </Button>
          </Box>
        </Box>

        {/* Баримт — хэвлэгдэх хэсэг */}
        <div id="payment-print-area">
          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 800,
              textAlign: "center",
              mb: 0.5,
            }}
          >
            Төлбөр зөвшөөрөх хуудас
          </Typography>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 700,
              textAlign: "center",
              color: "#2563EB",
              mb: 2,
            }}
          >
            № {paymentRef}
          </Typography>

          <Typography sx={{ fontSize: "13px", mb: 2 }}>
            {parseInt(y)} оны {parseInt(m)} сарын {parseInt(d)} өдөр
          </Typography>

          {[
            {
              label: "Төлбөр хүлээн авах компаний нэр",
              value: "Жагсаалтын дагуу",
            },
            { label: "Дансны дугаар, банкны нэр", value: "Хэтэвч цэнэглэлт" },
            { label: "Төлбөр хүссэн албан тушаал, нэр", value: userName },
            { label: "Төлбөрийн зориулалт", value: "Машин түрээс" },
            {
              label: "Үнийн дүн: тоогоор",
              value: `${totalAmount.toLocaleString()}₮`,
            },
            {
              label: "Үнийн дүн: үсгээр",
              value: toMongolianWords(totalAmount),
            },
          ].map((row) => (
            <Box key={row.label} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: "12px", color: "#888" }}>
                {row.label}:
              </Typography>
              <Box sx={{ borderBottom: "1px solid #333", pb: 0.3, mt: 0.3 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                  {row.value}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Гарын үсэг хүснэгт */}
          <Box sx={{ mt: 3, overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Албан тушаалтан", "Гарын үсэг", "Огноо", "Тайлбар"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          border: "1px solid #ddd",
                          padding: "6px 8px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#555",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  "Гүйцэтгэх захирал",
                  "Санхүү эрхэлсэн захирал",
                  "Ерөнхий нягтлан бодогч",
                  "Алба/хэлтэс хариуцсан захирал",
                  "Нягтлан бодогч",
                ].map((role) => (
                  <tr key={role}>
                    <td
                      style={{ border: "1px solid #ddd", padding: "10px 8px" }}
                    >
                      {role}
                    </td>
                    <td
                      style={{ border: "1px solid #ddd", padding: "10px 8px" }}
                    ></td>
                    <td
                      style={{ border: "1px solid #ddd", padding: "10px 8px" }}
                    ></td>
                    <td
                      style={{ border: "1px solid #ddd", padding: "10px 8px" }}
                    ></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: "12px" }}>
              Төлбөрийн хүсэлт гаргасан: _________________________ / {userName}{" "}
              /
            </Typography>
          </Box>
        </div>
      </div>
    </div>
  );
}
