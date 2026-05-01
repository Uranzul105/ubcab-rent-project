"use client";

import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Divider from "@mui/joy/Divider";

type CarType = {
  type: string;
  count: number;
  description: string;
  price: number;
  icon: string;
};

type RentListDetailsProps = {
  image: string;
  serviceName: string;
  cars: CarType[];
  onAdd: (carIndex: number) => void;
  onRemove: (carIndex: number) => void;
};

export default function RentListDetails({
  image,
  serviceName,
  cars,
  onAdd,
  onRemove,
}: RentListDetailsProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: 600,
        borderRadius: "20px",
        p: 2.5,
        boxShadow: "sm",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src={image}
          alt={serviceName}
          sx={{
            width: 70,
            height: 50,
            objectFit: "contain",
          }}
        />

        <Box>
          <Typography level="title-lg" sx={{ fontWeight: "bold" }}>
            {serviceName}
          </Typography>
          <Typography level="body-sm" sx={{ color: "neutral.600" }}>
            Машины төрлөө сонгоно уу
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {cars.map((car, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 0.5,
            }}
          >
            {/* LEFT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={car.icon}
                  alt={car.type}
                  sx={{
                    width: 28,
                    height: 28,
                    objectFit: "contain",
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {car.type}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "neutral.500",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {car.description}
                </Typography>
              </Box>
            </Box>

            {/* RIGHT */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "85px 135px 95px",
                alignItems: "center",
                columnGap: 1,
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {car.price.toLocaleString()}₮
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid",
                  borderColor: "neutral.outlinedBorder",
                  borderRadius: "12px",
                  height: 46,
                  px: 1,
                  boxSizing: "border-box",
                }}
              >
                <IconButton
                  variant="plain"
                  onClick={() => onRemove(index)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    fontSize: 22,
                    fontWeight: 500,
                  }}
                >
                  -
                </IconButton>

                <Typography
                  sx={{
                    minWidth: 24,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {car.count}
                </Typography>

                <IconButton
                  variant="plain"
                  onClick={() => onAdd(index)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    fontSize: 22,
                    fontWeight: 500,
                  }}
                >
                  +
                </IconButton>
              </Box>

              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 16,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                {(car.price * car.count).toLocaleString()}₮
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
