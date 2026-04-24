const BASE = "http://localhost:3001/api";

export type Driver = {
  _id: string;
  phone: string;
  name: string;
};

// GET
export async function getDrivers(): Promise<Driver[]> {
  const res = await fetch(`${BASE}/drivers`);
  return res.json();
}

// POST
export async function createDriver(
  driver: Omit<Driver, "_id">
): Promise<Driver> {
  const res = await fetch(`${BASE}/drivers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(driver),
  });
  return res.json();
}

// PATCH
export async function updateDriver(
  id: string,
  data: Partial<Driver>
): Promise<Driver> {
  const res = await fetch(`${BASE}/drivers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// DELETE
export async function deleteDriver(id: string): Promise<void> {
  await fetch(`${BASE}/drivers/${id}`, { method: "DELETE" });
}