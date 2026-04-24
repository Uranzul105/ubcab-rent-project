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
};

type OrderData = {
  date: string;
  customerName: string;
  totalAmount: number;
  managerId: number;
  managerName: string;
  drivers: { phone: string; name: string; salary: number }[];
};

type Props = {
  onSubmit?: (order: OrderData) => void;
  defaultValues?: Partial<OrderData>;
};

export default function OrderCard({ onSubmit, defaultValues }: Props) {
  const [allDrivers, setAllDrivers] = useState<
    { phone: string; name: string }[]
  >([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/drivers")
      .then((res) => res.json())
      .then(setAllDrivers)
      .catch(() => {});
  }, []);

  const [customerName, setCustomerName] = useState(
    defaultValues?.customerName ?? "",
  );
  const [date, setDate] = useState(defaultValues?.date ?? "");
  const [totalAmount, setTotalAmount] = useState<number | undefined>(
    defaultValues?.totalAmount,
  );
  const [driverRows, setDriverRows] = useState<DriverRow[]>(
    defaultValues?.drivers && defaultValues.drivers.length > 0
      ? defaultValues.drivers
      : [{ phone: "", name: "", salary: undefined }],
  );

  const maxSalary = useMemo(
    () => (totalAmount !== undefined ? totalAmount * 0.8 : undefined),
    [totalAmount],
  );

  const totalSalary = useMemo(
    () => driverRows.reduce((sum, row) => sum + (row.salary ?? 0), 0),
    [driverRows],
  );

  const salaryError = useMemo(() => {
    if (maxSalary === undefined || totalSalary === 0) return "";
    if (totalSalary > maxSalary) {
      return driverRows.length === 1
        ? "Үнийн дүнгээс 20% хассан дүнгээс дээш байж болохгүй"
        : "Нийт цалингийн нийлбэр үнийн дүнгийн 80%-иас дээш байж болохгүй";
    }
    return "";
  }, [totalSalary, maxSalary, driverRows.length]);

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

  const addRow = () =>
    setDriverRows((prev) => [
      ...prev,
      { phone: "", name: "", salary: undefined },
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
      managerId: 1,
      managerName: "Менежер",
      drivers: driverRows.map((d) => ({
        phone: d.phone,
        name: d.name,
        salary: d.salary ?? 0,
      })),
    });

    // Засах үед цэвэрлэхгүй
    if (!defaultValues) {
      setCustomerName("");
      setDate("");
      setTotalAmount(undefined);
      setDriverRows([{ phone: "", name: "", salary: undefined }]);
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
        <Input
          placeholder="Захиалагчийн нэр"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          sx={{ fontSize: "13px", height: 40 }}
        />
        <NumericFormat
          customInput={Input}
          placeholder="Үнийн дүн"
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          value={totalAmount}
          onValueChange={(v) => setTotalAmount(v.floatValue)}
          sx={{ fontSize: "13px", height: 40 }}
        />
      </Box>

      {/* Жолоочийн мэдээлэл */}
      <Typography sx={{ fontSize: "18px", fontWeight: 600, mb: 1.5 }}>
        Жолоочийн мэдээлэл
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {driverRows.map((row, index) => (
          <Box
            key={index}
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
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              sx={{ fontSize: "13px", height: 40 }}
            />
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
              placeholder="Жолоочийн цалин"
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              value={row.salary}
              onValueChange={(v) => handleSalaryChange(index, v.floatValue)}
              error={Boolean(salaryError)}
              sx={{ fontSize: "13px", height: 40 }}
            />
            <IconButton
              onClick={addRow}
              sx={{
                width: 40,
                height: 40,
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
              sx={{ width: 40, height: 40, borderRadius: "50%" }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
        ))}
      </Box>

      {salaryError && (
        <FormHelperText sx={{ color: "danger.500", mt: 1, fontSize: "12px" }}>
          {salaryError}
        </FormHelperText>
      )}

      {driverRows.length > 1 && maxSalary !== undefined && (
        <Typography sx={{ fontSize: "12px", color: "neutral.500", mt: 1 }}>
          Нийт цалин: {totalSalary.toLocaleString()} / Дээд хэмжээ:{" "}
          {maxSalary.toLocaleString()}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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
