"use client";

import { useState } from "react";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import RentListDetails from "./RentListDetails";

type CarType = {
  type: string;
  count: number;
  description: string;
  price: number;
  icon: string;
};

type RentOption = {
  name: string;
  description: string;
  image: string;
  cars: CarType[];
};

export default function RentList() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [rentOptions, setRentOptions] = useState<RentOption[]>([
    {
      name: "Нислэг тосох үйлчилгээ",
      description: "Нисэх буудлаас тосох, хүргэх үйлчилгээ",
      image: "/globe.svg",
      cars: [
        {
          type: "Standard taxi",
          count: 0,
          description: "Энгийн суудлын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VIP",
          count: 0,
          description: "Тансаг зэрэглэлийн машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "SUV",
          count: 0,
          description: "Жийп, том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VAN",
          count: 0,
          description: "Том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "Mini bus",
          count: 0,
          description: "Жижиг автобус",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "BUS",
          count: 0,
          description: "Том автобус",
          price: 120000,
          icon: "/globe.svg",
        },
      ],
    },
    {
      name: "Өдрийн түрээс",
      description: "Өдөржин ашиглах боломжтой түрээс",
      image: "/globe.svg",
      cars: [
        {
          type: "Standard taxi",
          count: 0,
          description: "Энгийн суудлын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VIP",
          count: 0,
          description: "Тансаг зэрэглэлийн машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "SUV",
          count: 0,
          description: "Жийп, том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VAN",
          count: 0,
          description: "Том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "Mini bus",
          count: 0,
          description: "Жижиг автобус",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "BUS",
          count: 0,
          description: "Том автобус",
          price: 120000,
          icon: "/globe.svg",
        },
      ],
    },
    {
      name: "Цагийн түрээс",
      description: "Цагаар тооцогдох уян хатан түрээс",
      image: "/globe.svg",
      cars: [
        {
          type: "Standard taxi",
          count: 0,
          description: "Энгийн суудлын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VIP",
          count: 0,
          description: "Тансаг зэрэглэлийн машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "SUV",
          count: 0,
          description: "Жийп, том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VAN",
          count: 0,
          description: "Том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "Mini bus",
          count: 0,
          description: "Жижиг автобус",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "BUS",
          count: 0,
          description: "Том автобус",
          price: 120000,
          icon: "/globe.svg",
        },
      ],
    },
    {
      name: "Орон нутгийн түрээс",
      description: "Хот хооронд болон орон нутагт явах үйлчилгээ",
      image: "/globe.svg",
      cars: [
        {
          type: "Standard taxi",
          count: 0,
          description: "Энгийн суудлын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VIP",
          count: 0,
          description: "Тансаг зэрэглэлийн машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "SUV",
          count: 0,
          description: "Жийп, том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "VAN",
          count: 0,
          description: "Том оврын машин",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "Mini bus",
          count: 0,
          description: "Жижиг автобус",
          price: 120000,
          icon: "/globe.svg",
        },
        {
          type: "BUS",
          count: 0,
          description: "Том автобус",
          price: 120000,
          icon: "/globe.svg",
        },
      ],
    },
  ]);

  const handleAddCar = (optionIndex: number, carIndex: number) => {
    setRentOptions((prev) =>
      prev.map((option, i) =>
        i === optionIndex
          ? {
              ...option,
              cars: option.cars.map((car, j) =>
                j === carIndex ? { ...car, count: car.count + 1 } : car,
              ),
            }
          : option,
      ),
    );
  };

  const handleRemoveCar = (optionIndex: number, carIndex: number) => {
    setRentOptions((prev) =>
      prev.map((option, i) =>
        i === optionIndex
          ? {
              ...option,
              cars: option.cars.map((car, j) =>
                j === carIndex
                  ? { ...car, count: Math.max(0, car.count - 1) } // 0-оос доош буухгүй
                  : car,
              ),
            }
          : option,
      ),
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 4,
        alignItems: "flex-start",
      }}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {/* LEFT SIDE */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {rentOptions.map((item, index) => (
          <Box
            key={index}
            onMouseEnter={() => setActiveIndex(index)}
            sx={{
              display: "flex",
              width: 400,
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid",
              borderColor: activeIndex === index ? "#f4b400" : "#999",
              borderRadius: "18px",
              px: 2,
              py: 1.5,
              minHeight: 100,
              position: "relative",
              backgroundColor: activeIndex === index ? "#fff7e6" : "#fff",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: -10,
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#fff",
                border: `4px solid ${
                  activeIndex === index ? "#f4b400" : "#ccc"
                }`,
              }}
            />

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: activeIndex === index ? "#f4b400" : "#000",
                }}
              >
                {item.name}
              </Typography>

              <Typography sx={{ fontSize: 12, mt: 0.5 }}>
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* RIGHT SIDE */}
      {activeIndex !== null && (
        <RentListDetails
          image={rentOptions[activeIndex].image}
          serviceName={rentOptions[activeIndex].name}
          cars={rentOptions[activeIndex].cars}
          onAdd={(carIndex) => handleAddCar(activeIndex, carIndex)}
          onRemove={(carIndex) => handleRemoveCar(activeIndex, carIndex)}
        />
      )}
    </Box>
  );
}
