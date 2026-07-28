"use client";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

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

const FIELD_ROWS = (userName: string, totalAmount: number) => [
  {
    label: "Төлбөр хүлээн авах компани/хувь хүн/ нэр",
    value: "Жагсаалтын дагуу",
  },
  { label: "Дансны дугаар, банкны нэр", value: "Хэтэвч цэнэглэлт" },
  { label: "Төлбөр хүссэн албан тушаал, нэр", value: userName },
  { label: "Төлбөрийн зориулалт", value: "Машин түрээс" },
  { label: "Үнийн дүн: тоогоор", value: `${totalAmount.toLocaleString()}₮` },
  { label: "Үнийн дүн: үсгээр", value: toMongolianWords(totalAmount) },
];

const APPROVAL_ROLES = [
  "Гүйцэтгэх захирал",
  "Санхүү эрхэлсэн захирал",
  "Алба/ хэлтэс хариуцсан захирал",
  "Нягтлан бодогч",
];

export default function PaymentPrintContent({
  totalAmount,
  userName,
  paymentRef,
}: {
  totalAmount: number;
  userName: string;
  paymentRef: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [y, m, d] = today.split("-");

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 15mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #payment-print-area,
          #payment-print-area * {
            visibility: visible;
          }
          #payment-print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>

      <Box
        id="payment-print-area"
        sx={{
          background: "#fff",
          width: "100%",
          maxWidth: "180mm",
          margin: "0 auto",
          padding: "0",
          fontFamily: "inherit",
        }}
      >
        {/* Толгой мөр — лого зүүн дээд буланд */}
        <Box sx={{ mb: 2 }}>
          <img
            src="/logo.png"
            alt="ubcab"
            style={{ height: "56px", width: "auto" }}
          />
        </Box>

        {/* Гарчиг — голлуулж, том фонттой */}
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: 800,
            textAlign: "center",
            mb: 0.5,
          }}
        >
          Төлбөр зөвшөөрөх хуудас
        </Typography>
        <Typography
          sx={{ fontSize: "14px", fontWeight: 600, textAlign: "center", mb: 3 }}
        >
          № {paymentRef}
        </Typography>

        <Typography sx={{ fontSize: "13px", mb: 2 }}>
          {parseInt(y)} оны {parseInt(m)} сарын {parseInt(d)} өдөр
        </Typography>

        {/* Талбарууд — шошго зүүн, утга нэг мөрөнд баруун талд, доогуур зураастай */}
        {FIELD_ROWS(userName, totalAmount).map((row) => (
          <Box
            key={row.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "12.5px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {row.label}:
            </Typography>
            <Box
              sx={{
                flex: 1,
                borderBottom: "1px solid #333",
                display: "flex",
                alignItems: "center",
                pl: 1,
                minHeight: "22px",
              }}
            >
              <Typography
                sx={{ fontSize: "13px", fontWeight: 600, lineHeight: 1 }}
              >
                {row.value}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Гарын үсгийн хүснэгт */}
        <Box sx={{ mt: 3 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr>
                {[
                  "Албан тушаалтан",
                  "Гарын үсэг",
                  "Огноо",
                  "Тайлбар, зардлын данс, өртгийн төв",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      border: "1px solid #000",
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {APPROVAL_ROLES.map((role) => (
                <tr key={role}>
                  <td style={{ border: "1px solid #000", padding: "8px 8px" }}>
                    {role}
                  </td>
                  <td
                    style={{ border: "1px solid #000", padding: "8px 8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #000", padding: "8px 8px" }}
                  ></td>
                  <td
                    style={{ border: "1px solid #000", padding: "8px 8px" }}
                  ></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: "12px" }}>
            Төлбөрийн хүсэлт гаргасан : .......................................
            / {userName} /
          </Typography>
        </Box>
      </Box>
    </>
  );
}
