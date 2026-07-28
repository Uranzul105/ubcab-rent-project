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
    <Box
      sx={{
        background: "#fff",
        borderRadius: "12px",
        border: "0.5px solid #e0e0e0",
        padding: "28px 32px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        "@media print": {
          boxShadow: "none",
          border: "none",
          borderRadius: 0,
          padding: 0,
        },
      }}
    >
      <Typography
        sx={{ fontSize: "16px", fontWeight: 800, textAlign: "center", mb: 0.5 }}
      >
        Төлбөр зөвшөөрөх хуудас
      </Typography>
      <Typography
        sx={{
          fontSize: "13px",
          fontWeight: 700,
          textAlign: "center",
          color: "#2563EB",
          mb: 3,
        }}
      >
        № {paymentRef}
      </Typography>
      <Typography sx={{ fontSize: "13px", mb: 3 }}>
        {parseInt(y)} оны {parseInt(m)} сарын {parseInt(d)} өдөр
      </Typography>

      {[
        { label: "Төлбөр хүлээн авах компаний нэр", value: "Жагсаалтын дагуу" },
        { label: "Дансны дугаар, банкны нэр", value: "Хэтэвч цэнэглэлт" },
        { label: "Төлбөр хүссэн албан тушаал, нэр", value: userName },
        { label: "Төлбөрийн зориулалт", value: "Машин түрээс" },
        {
          label: "Үнийн дүн: тоогоор",
          value: `${totalAmount.toLocaleString()}₮`,
        },
        { label: "Үнийн дүн: үсгээр", value: toMongolianWords(totalAmount) },
      ].map((row) => (
        <Box key={row.label} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: "12px", color: "#888" }}>
            {row.label}:
          </Typography>
          <Box sx={{ borderBottom: "1px solid #333", pb: 0.5, mt: 0.3 }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
              {row.value}
            </Typography>
          </Box>
        </Box>
      ))}

      <Box sx={{ mt: 4, overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
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
                <td style={{ border: "1px solid #ddd", padding: "16px 8px" }}>
                  {role}
                </td>
                <td
                  style={{ border: "1px solid #ddd", padding: "16px 8px" }}
                ></td>
                <td
                  style={{ border: "1px solid #ddd", padding: "16px 8px" }}
                ></td>
                <td
                  style={{ border: "1px solid #ddd", padding: "16px 8px" }}
                ></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontSize: "12px" }}>
          Төлбөрийн хүсэлт гаргасан: _________________________ / {userName} /
        </Typography>
      </Box>
    </Box>
  );
}
