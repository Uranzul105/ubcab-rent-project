const BASE = "http://localhost:3001/api";

export type DriverRow = {
  phone: string;
  name: string;
  salary: number;
  fuel: number;
};

export type Order = {
  _id: string;        // MongoDB _id
  id?: number; 
  date: string;
  customerName: string;
  totalAmount: number;
  status: "new" | "active" | "done" | "cancelled";
  paid: boolean;
  managerId: number;
  managerName: string;
  drivers: DriverRow[];
};

// GET
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE}/orders`);
  return res.json();
}

// POST
export async function createOrder(
  order: Omit<Order, "_id" | "status" | "paid">
): Promise<Order> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return res.json();
}

// PATCH
export async function updateOrder(
  id: string,
  data: Partial<Order>
): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// DELETE
export async function deleteOrder(id: string): Promise<void> {
  await fetch(`${BASE}/orders/${id}`, { method: "DELETE" });
}