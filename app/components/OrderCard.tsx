"use client";

import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import IconButton from "@mui/joy/IconButton";
import { Input } from "@mui/joy";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import FormHelperText from "@mui/joy/FormHelperText";
import { useMemo, useState, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import Calendar from "./Calendar";

type DriverRow = {
  phone: string;
  name: string;
  salary?: number;
  fuelToggle?: boolean;
  fuel?: number;
};

type OrderData = {
  date: string;
  customerName: string;
  totalAmount: number;
  managerId: number;
  managerName: string;
  drivers: { phone: string; name: string; salary: number; fuel: number }[];
};

type Props = {
  onSubmit?: (order: OrderData) => void;
  defaultValues?: Partial<OrderData>;
  currentUser?: any;
};

export default function OrderCard({
  onSubmit,
  defaultValues,
  currentUser,
}: Props) {
  const [customerName, setCustomerName] = useState(
    defaultValues?.customerName ?? "",
  );
  const [date, setDate] = useState(defaultValues?.date ?? "");
  const [totalAmount, setTotalAmount] = useState<number | undefined>(
    defaultValues?.totalAmount,
  );
  const [driverRows, setDriverRows] = useState<DriverRow[]>(
    defaultValues?.drivers && defaultValues.drivers.length > 0
      ? defaultValues.drivers.map((d) => ({
          ...d,
          fuelToggle: (d.fuel ?? 0) > 0,
        }))
      : [
          {
            phone: "",
            name: "",
            salary: undefined,
            fuelToggle: false,
            fuel: undefined,
          },
        ],
  );

  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://ubcab-rent-project.onrender.com/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(data.map((c: any) => c.name)))
      .catch(() => {});
  }, []);

  const [allDrivers, setAllDrivers] = useState<
    { phone: string; name: string }[]
  >([]);

  useEffect(() => {
    fetch("https://ubcab-rent-project.onrender.com/api/drivers")
      .then((res) => res.json())
      .then(setAllDrivers)
      .catch(() => {});
  }, []);

  const maxSalary = useMemo(
    () => (totalAmount !== undefined ? totalAmount * 0.8 : undefined),
    [totalAmount],
  );

  const totalSalary = useMemo(
    () => driverRows.reduce((s, d) => s + (d.salary ?? 0), 0),
    [driverRows],
  );

  const totalFuel = useMemo(
    () => driverRows.reduce((s, d) => s + (d.fuel ?? 0), 0),
    [driverRows],
  );

  // Цалин + шатахуун нийлсэн дүн 80%-иас хэтрэхгүй байх
  const salaryError = useMemo(() => {
    if (maxSalary === undefined) return "";
    const total = totalSalary + totalFuel;
    if (total > maxSalary) {
      return `Цалин + шатахуун нийлсэн дүн (${total.toLocaleString()}₮) 80%-иас хэтэрч болохгүй`;
    }
    return "";
  }, [totalSalary, totalFuel, maxSalary]);

  const handlePhoneChange = (index: number, value: string) => {
    const phone = value.replace(/\D/g, "");
    const found = allDrivers.find((d) => d.phone === phone);
    const updated = [...driverRows];
    updated[index] = {
      ...updated[index],
      phone,
      name: found?.name ?? updated[index].name,
    };
    setDriverRows(updated);
  };

  const handleSalaryChange = (index: number, value?: number) => {
    const updated = [...driverRows];
    updated[index] = { ...updated[index], salary: value };
    setDriverRows(updated);
  };

  const handleFuelToggle = (index: number) => {
    const updated = [...driverRows];
    updated[index] = {
      ...updated[index],
      fuelToggle: !updated[index].fuelToggle,
      fuel: !updated[index].fuelToggle ? undefined : 0,
    };
    setDriverRows(updated);
  };

  const handleFuelChange = (index: number, value?: number) => {
    const updated = [...driverRows];
    updated[index] = { ...updated[index], fuel: value };
    setDriverRows(updated);
  };

  const addRow = () =>
    setDriverRows((prev) => [
      ...prev,
      {
        phone: "",
        name: "",
        salary: undefined,
        fuelToggle: false,
        fuel: undefined,
      },
    ]);

  const removeRow = (index: number) => {
    if (driverRows.length === 1) return;
    setDriverRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!customerName || !totalAmount || !date) {
      alert("Огноо, захиалагчийн нэр, үнийн дүнг бөглөнө үү");
      return;
    }
    if (salaryError) return;

    onSubmit?.({
      date,
      customerName,
      totalAmount,
      managerId: currentUser?.id ?? 1,
      managerName: currentUser?.name ?? "Менежер",
      drivers: driverRows.map((d) => ({
        phone: d.phone,
        name: d.name,
        salary: d.salary ?? 0,
        fuel: d.fuel ?? 0,
      })),
    });

    if (!defaultValues) {
      setCustomerName("");
      setDate("");
      setTotalAmount(undefined);
      setDriverRows([
        {
          phone: "",
          name: "",
          salary: undefined,
          fuelToggle: false,
          fuel: undefined,
        },
      ]);
    }
  };

  return (
    <Card sx={{ width: "100%", borderRadius: "20px", p: 3, boxShadow: "none" }}>
      {/* Үндсэн мэдээлэл */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Calendar value={date} onChange={setDate} />

        <>
          <datalist id="company-list">
            {companies.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <Input
            placeholder="Захиалагчийн нэр"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            slotProps={{
              input: { list: "company-list" },
            }}
            sx={{ fontSize: "13px", height: 40 }}
          />
        </>
        <NumericFormat
          customInput={Input}
          placeholder="Үнийн дүн"
          thousandSeparator=","
          allowNegative={false}
          value={totalAmount}
          onValueChange={(v) => setTotalAmount(v.floatValue)}
          sx={{ fontSize: "13px", height: 40 }}
        />
      </Box>

      {/* 20% hint */}
      {totalAmount && (
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              background: "#DCFCE7",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#15803D",
              fontWeight: 600,
            }}
          >
            🏢 Компани (20%): {(totalAmount * 0.2).toLocaleString()}₮
          </Box>
          <Box
            sx={{
              background: "#DBEAFE",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#1D4ED8",
              fontWeight: 600,
            }}
          >
            🚗 Жолоочид max (80%): {(totalAmount * 0.8).toLocaleString()}₮
          </Box>
          <Box
            sx={{
              background:
                totalSalary + totalFuel > totalAmount * 0.8
                  ? "#FEE2E2"
                  : "#F8FAFC",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color:
                totalSalary + totalFuel > totalAmount * 0.8
                  ? "#DC2626"
                  : "#64748B",
              fontWeight: 600,
            }}
          >
            Одоо: {(totalSalary + totalFuel).toLocaleString()}₮
          </Box>
        </Box>
      )}

      {/* Алдаа */}
      {salaryError && (
        <FormHelperText sx={{ color: "danger.500", mb: 1, fontSize: "12px" }}>
          ⛔ {salaryError}
        </FormHelperText>
      )}

      {/* Жолоочийн мэдээлэл */}
      <Typography sx={{ fontSize: "15px", fontWeight: 600, mb: 1.5 }}>
        Жолоочийн мэдээлэл
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {driverRows.map((row, index) => (
          <Box key={index}>
            {/* Үндсэн мөр */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto auto",
                gap: 1,
                alignItems: "center",
              }}
            >
              <div>
                <Input
                  placeholder="Утасны дугаар"
                  value={row.phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  slotProps={{
                    input: { list: "driver-suggestions" },
                  }}
                  sx={{ fontSize: "13px", height: 38 }}
                />
                <datalist id={`ph-${index}`}>
                  {allDrivers
                    .filter(
                      (d) =>
                        d.phone.includes(row.phone) && row.phone.length >= 4,
                    )
                    .slice(0, 8)
                    .map((d) => (
                      <option key={d.phone} value={d.phone}>
                        {d.name}
                      </option>
                    ))}
                </datalist>
              </div>
              <Input
                placeholder="Жолоочийн нэр"
                value={row.name}
                onChange={(e) => {
                  const updated = [...driverRows];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setDriverRows(updated);
                }}
                sx={{ fontSize: "13px", height: 40 }}
              />
              <NumericFormat
                customInput={Input}
                placeholder="Цалин"
                thousandSeparator=","
                allowNegative={false}
                value={row.salary}
                onValueChange={(v) => handleSalaryChange(index, v.floatValue)}
                sx={{ fontSize: "13px", height: 40 }}
              />
              <IconButton
                onClick={addRow}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "#facc15",
                  color: "#000",
                  "&:hover": { backgroundColor: "#eab308" },
                }}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                variant="outlined"
                color="neutral"
                onClick={() => removeRow(index)}
                sx={{ width: 36, height: 36, borderRadius: "50%" }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>

            {/* Шатахуун toggle + input */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 0.8,
                ml: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  cursor: "pointer",
                }}
                onClick={() => handleFuelToggle(index)}
              >
                <div
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 9,
                    background: row.fuelToggle ? "#16A34A" : "#D1D5DB",
                    position: "relative",
                    transition: "background .2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 1,
                      left: row.fuelToggle ? 15 : 1,
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
                  sx={{ fontSize: "12px", color: "#888", userSelect: "none" }}
                >
                  ⛽ Шатахуун
                </Typography>
              </Box>

              {row.fuelToggle && (
                <NumericFormat
                  customInput={Input}
                  placeholder="Шатахуун дүн"
                  thousandSeparator=","
                  allowNegative={false}
                  value={row.fuel}
                  onValueChange={(v) => handleFuelChange(index, v.floatValue)}
                  sx={{ fontSize: "13px", height: 36, maxWidth: 180 }}
                />
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Нийт */}
      {driverRows.length > 1 && maxSalary !== undefined && (
        <Typography sx={{ fontSize: "12px", color: "#888", mt: 1 }}>
          Нийт цалин: {totalSalary.toLocaleString()}₮
          {totalFuel > 0 &&
            ` + Шатахуун: ${totalFuel.toLocaleString()}₮ = ${(totalSalary + totalFuel).toLocaleString()}₮`}
        </Typography>
      )}

      {/* Бүртгэх товч */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
        <Button
          onClick={handleSubmit}
          variant="solid"
          sx={{
            minWidth: 160,
            height: 40,
            borderRadius: "40px",
            backgroundColor: "#facc15",
            color: "#000",
            "&:hover": { backgroundColor: "#eab308" },
          }}
        >
          {defaultValues ? "Хадгалах" : "Бүртгэх"}
        </Button>
      </Box>
    </Card>
  );
}
