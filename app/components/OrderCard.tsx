// "use client";

// import Button from "@mui/joy/Button";
// import Card from "@mui/joy/Card";
// import IconButton from "@mui/joy/IconButton";
// import { Input } from "@mui/joy";
// import Box from "@mui/joy/Box";
// import Typography from "@mui/joy/Typography";
// import FormHelperText from "@mui/joy/FormHelperText";
// import Image from "next/image";
// import { useEffect, useMemo, useState } from "react";
// import { NumericFormat } from "react-number-format";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import Calendar from "./Calendar";

// const drivers = [
//   { phone: "99112233", name: "Бат" },
//   { phone: "88114455", name: "Сараа" },
//   { phone: "99110000", name: "Тэмүүжин" },
// ];

// type DriverRow = {
//   phone: string;
//   name: string;
//   salary?: number;
// };

// export default function OrderCard() {
//   const [customerName, setCustomerName] = useState("");
//   const [original, setOriginal] = useState<number | undefined>(undefined);
//   const [salaryError, setSalaryError] = useState("");

//   const [driverRows, setDriverRows] = useState<DriverRow[]>([
//     { phone: "", name: "", salary: undefined },
//   ]);

//   const normalizePhone = (value: string) => value.replace(/\D/g, "");

//   const maxTotalSalary =
//     original !== undefined ? Number((original * 0.8).toFixed(2)) : undefined;

//   const totalDriverSalary = useMemo(() => {
//     return driverRows.reduce((sum, row) => sum + (row.salary || 0), 0);
//   }, [driverRows]);

//   const validateSalary = (rows: DriverRow[]) => {
//     if (maxTotalSalary === undefined) {
//       setSalaryError("");
//       return;
//     }

//     if (rows.length === 1) {
//       const firstSalary = rows[0]?.salary;

//       if (firstSalary !== undefined && firstSalary > maxTotalSalary) {
//         setSalaryError("БО-с 20%-иас бага хассан дүнгээс дээш байж болохгүй");
//         return;
//       }

//       setSalaryError("");
//       return;
//     }

//     const totalSalary = rows.reduce((sum, row) => sum + (row.salary || 0), 0);

//     if (totalSalary > maxTotalSalary) {
//       setSalaryError(
//         "Нийт жолоочийн цалингийн нийлбэр БО-с 20%-иас бага байж болохгүй",
//       );
//       return;
//     }

//     setSalaryError("");
//   };

//   const handleDriverPhoneChange = (index: number, value: string) => {
//     const cleanedValue = normalizePhone(value);

//     const foundDriver = drivers.find(
//       (driver) => normalizePhone(driver.phone) === cleanedValue,
//     );

//     const updatedRows = [...driverRows];
//     updatedRows[index].phone = cleanedValue;
//     updatedRows[index].name = foundDriver ? foundDriver.name : "";

//     setDriverRows(updatedRows);
//   };

//   const handleDriverSalaryChange = (index: number, value?: number) => {
//     const updatedRows = [...driverRows];
//     updatedRows[index].salary = value;

//     setDriverRows(updatedRows);
//     validateSalary(updatedRows);
//   };

//   const addDriverRow = () => {
//     const updatedRows = [
//       ...driverRows,
//       { phone: "", name: "", salary: undefined },
//     ];
//     setDriverRows(updatedRows);
//     validateSalary(updatedRows);
//   };

//   const removeDriverRow = (index: number) => {
//     if (driverRows.length === 1) return;

//     const updatedRows = driverRows.filter((_, i) => i !== index);
//     setDriverRows(updatedRows);
//     validateSalary(updatedRows);
//   };

//   useEffect(() => {
//     if (driverRows.length === 1) {
//       const updatedRows = [...driverRows];
//       updatedRows[0].salary = maxTotalSalary;
//       setDriverRows(updatedRows);
//       setSalaryError("");
//     } else {
//       validateSalary(driverRows);
//     }
//   }, [original, driverRows.length]);

//   return (
//     <Card
//       sx={{
//         width: "100%",
//         maxWidth: 1400,
//         mx: "auto",
//         p: 4,
//         borderRadius: "32px",
//         boxShadow: "lg",
//         backgroundColor: "rgba(255,255,255,0.95)",
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2,
//         }}
//       >
//         <Typography level="h1" sx={{ fontSize: 34, fontWeight: 800 }}>
//           Шинэ захиалга үүсгэх
//         </Typography>

//         <Image src="/globe.svg" alt="globe" width={28} height={28} />
//       </Box>

//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: "1.1fr 1fr 1fr",
//           gap: 2,
//           alignItems: "center",
//           mb: 1,
//         }}
//       >
//         <Box>
//           <Calendar />
//         </Box>

//         <Input
//           placeholder="Захиалагчийн нэр"
//           value={customerName}
//           onChange={(e) => setCustomerName(e.target.value)}
//           sx={{ height: 46 }}
//         />

//         <NumericFormat
//           customInput={Input}
//           placeholder="Үнийн дүн"
//           thousandSeparator=","
//           decimalScale={2}
//           fixedDecimalScale
//           allowNegative={false}
//           value={original}
//           onValueChange={(values) => {
//             setOriginal(values.floatValue);
//           }}
//           sx={{ height: 46 }}
//         />
//       </Box>

//       <Box sx={{ mt: 1 }}>
//         <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 1.5 }}>
//           Жолоочийн мэдээлэл
//         </Typography>

//         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           {driverRows.map((row, index) => (
//             <Box key={index}>
//               <Box
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr 1fr auto auto",
//                   gap: 2,
//                   alignItems: "center",
//                 }}
//               >
//                 <Input
//                   placeholder="Утасны дугаар"
//                   value={row.phone}
//                   onChange={(e) =>
//                     handleDriverPhoneChange(index, e.target.value)
//                   }
//                   sx={{ height: 46 }}
//                 />

//                 <Input
//                   placeholder="Жолоочийн нэр"
//                   value={row.name}
//                   readOnly
//                   sx={{ height: 46 }}
//                 />

//                 <NumericFormat
//                   customInput={Input}
//                   placeholder="Жолоочийн цалин"
//                   thousandSeparator=","
//                   decimalScale={2}
//                   fixedDecimalScale
//                   allowNegative={false}
//                   value={row.salary}
//                   onValueChange={(values) =>
//                     handleDriverSalaryChange(index, values.floatValue)
//                   }
//                   error={Boolean(salaryError)}
//                   sx={{ height: 46 }}
//                 />

//                 <IconButton
//                   variant="solid"
//                   onClick={addDriverRow}
//                   sx={{
//                     width: 46,
//                     height: 46,
//                     borderRadius: "50%",
//                     backgroundColor: "#facc15",
//                     color: "#000",
//                     "&:hover": {
//                       backgroundColor: "#eab308",
//                     },
//                   }}
//                 >
//                   <AddIcon />
//                 </IconButton>

//                 <IconButton
//                   variant="outlined"
//                   color="neutral"
//                   onClick={() => removeDriverRow(index)}
//                   sx={{
//                     width: 46,
//                     height: 46,
//                     borderRadius: "50%",
//                   }}
//                 >
//                   <DeleteOutlineIcon />
//                 </IconButton>
//               </Box>
//             </Box>
//           ))}
//         </Box>

//         {salaryError && (
//           <FormHelperText sx={{ color: "danger.500", mt: 1, ml: 1 }}>
//             {salaryError}
//           </FormHelperText>
//         )}

//         {driverRows.length > 1 && maxTotalSalary !== undefined && (
//           <Typography sx={{ fontSize: 14, color: "neutral.500", mt: 1, ml: 1 }}>
//             Нийт цалин:{" "}
//             {totalDriverSalary.toLocaleString(undefined, {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}{" "}
//             / Дээд хэмжээ:{" "}
//             {maxTotalSalary.toLocaleString(undefined, {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </Typography>
//         )}

//         <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
//           <Button
//             variant="solid"
//             sx={{
//               minWidth: 180,
//               height: 48,
//               borderRadius: "999px",
//               backgroundColor: "#facc15",
//               color: "#000",
//               fontWeight: 700,
//               "&:hover": {
//                 backgroundColor: "#eab308",
//               },
//             }}
//           >
//             Бүртгэх
//           </Button>
//         </Box>
//       </Box>
//     </Card>
//   );
// }

"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import IconButton from "@mui/joy/IconButton";
import { Input } from "@mui/joy";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import FormHelperText from "@mui/joy/FormHelperText";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Calendar from "./Calendar";

const drivers = [
  { phone: "99112233", name: "Бат" },
  { phone: "88114455", name: "Сараа" },
  { phone: "99110000", name: "Тэмүүжин" },
];

type DriverRow = {
  phone: string;
  name: string;
  salary?: number;
};

export default function OrderCard() {
  const [customerName, setCustomerName] = useState("");
  const [original, setOriginal] = useState<number | undefined>(undefined);
  const [salaryError, setSalaryError] = useState("");

  const [driverRows, setDriverRows] = useState<DriverRow[]>([
    { phone: "", name: "", salary: undefined },
  ]);

  const normalizePhone = (value: string) => value.replace(/\D/g, "");

  const maxTotalSalary =
    original !== undefined ? Number((original * 0.8).toFixed(2)) : undefined;

  const totalDriverSalary = useMemo(() => {
    return driverRows.reduce((sum, row) => sum + (row.salary || 0), 0);
  }, [driverRows]);

  const validateSalary = (rows: DriverRow[]) => {
    if (maxTotalSalary === undefined) {
      setSalaryError("");
      return;
    }

    if (rows.length === 1) {
      const firstSalary = rows[0]?.salary;

      if (firstSalary !== undefined && firstSalary > maxTotalSalary) {
        setSalaryError("Үнийн дүнгээс 20% хассан дүнгээс дээш байж болохгүй");
        return;
      }

      setSalaryError("");
      return;
    }

    const totalSalary = rows.reduce((sum, row) => sum + (row.salary || 0), 0);

    if (totalSalary > maxTotalSalary) {
      setSalaryError(
        "Нийт жолоочийн цалингийн нийлбэр үнийн дүнгээс 20% хассан дүнгээс дээш байж болохгүй",
      );
      return;
    }

    setSalaryError("");
  };

  const handleDriverPhoneChange = (index: number, value: string) => {
    const cleanedValue = normalizePhone(value);

    const foundDriver = drivers.find(
      (driver) => normalizePhone(driver.phone) === cleanedValue,
    );

    const updatedRows = [...driverRows];
    updatedRows[index].phone = cleanedValue;
    updatedRows[index].name = foundDriver ? foundDriver.name : "";

    setDriverRows(updatedRows);
  };

  const handleDriverSalaryChange = (index: number, value?: number) => {
    const updatedRows = [...driverRows];
    updatedRows[index].salary = value;

    setDriverRows(updatedRows);
    validateSalary(updatedRows);
  };

  const addDriverRow = () => {
    const updatedRows = [
      ...driverRows,
      { phone: "", name: "", salary: undefined },
    ];
    setDriverRows(updatedRows);
    validateSalary(updatedRows);
  };

  const removeDriverRow = (index: number) => {
    if (driverRows.length === 1) return;

    const updatedRows = driverRows.filter((_, i) => i !== index);
    setDriverRows(updatedRows);
    validateSalary(updatedRows);
  };

  useEffect(() => {
    if (driverRows.length === 1) {
      const updatedRows = [...driverRows];
      updatedRows[0].salary = maxTotalSalary;
      setDriverRows(updatedRows);
      setSalaryError("");
    } else {
      validateSalary(driverRows);
    }
  }, [original, driverRows.length]);

  return (
    <Card
      sx={{
        // textAlign: "center",
        // alignItems: "center",
        // width: 700,
        // maxWidth: "100%",
        // overflow: "auto",
        // borderRadius: "16px",
        // p: 3,
        width: 900,
        maxWidth: "90%",
        borderRadius: "20px",
        p: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Шинэ захиалга үүсгэх
        </Typography>

        <Image src="/globe.svg" alt="globe" width={20} height={20} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1.5,
          width: "100%",
          mb: 1,
        }}
      >
        <Box>
          <Calendar />
        </Box>

        <Input
          placeholder="Захиалагчийн нэр"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          sx={{
            fontSize: "13px",
            height: 40,
          }}
        />

        <NumericFormat
          customInput={Input}
          placeholder="Үнийн дүн"
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          value={original}
          onValueChange={(values) => {
            setOriginal(values.floatValue);
          }}
          sx={{
            fontSize: "13px",
            height: 40,
          }}
        />
      </Box>

      <Box sx={{ width: "100%", mt: 1 }}>
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            textAlign: "left",
            mb: 1.5,
          }}
        >
          Жолоочийн мэдээлэл
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {driverRows.map((row, index) => (
            <Box key={index}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr auto auto",
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <Input
                  placeholder="Утасны дугаар"
                  value={row.phone}
                  onChange={(e) =>
                    handleDriverPhoneChange(index, e.target.value)
                  }
                  sx={{
                    fontSize: "13px",
                    height: 40,
                  }}
                />

                <Input
                  placeholder="Жолоочийн нэр"
                  value={row.name}
                  readOnly
                  sx={{
                    fontSize: "13px",
                    height: 40,
                  }}
                />

                <NumericFormat
                  customInput={Input}
                  placeholder="Жолоочийн цалин"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  value={row.salary}
                  onValueChange={(values) =>
                    handleDriverSalaryChange(index, values.floatValue)
                  }
                  error={Boolean(salaryError)}
                  sx={{
                    fontSize: "13px",
                    height: 40,
                  }}
                />

                <IconButton
                  variant="solid"
                  onClick={addDriverRow}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#facc15",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "#eab308",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>

                <IconButton
                  variant="outlined"
                  color="neutral"
                  onClick={() => removeDriverRow(index)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        {salaryError && (
          <FormHelperText
            sx={{
              color: "danger.500",
              mt: 1,
              textAlign: "left",
              fontSize: "12px",
            }}
          >
            {salaryError}
          </FormHelperText>
        )}

        {driverRows.length > 1 && maxTotalSalary !== undefined && (
          <Typography
            sx={{
              fontSize: "12px",
              color: "neutral.500",
              mt: 1,
              textAlign: "left",
            }}
          >
            Нийт цалин:{" "}
            {totalDriverSalary.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            / Дээд хэмжээ:{" "}
            {maxTotalSalary.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="solid"
            sx={{
              minWidth: 160,
              height: 40,
              borderRadius: "40px",
              backgroundColor: "#facc15",
              color: "#000",
              "&:hover": {
                backgroundColor: "#eab308",
              },
            }}
          >
            Бүртгэх
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
