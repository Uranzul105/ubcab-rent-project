const BASE = "http://localhost:3001/api";

export type Log = {
  _id: string;
  action: "create" | "update" | "delete";
  targetType: "order" | "driver";
  targetId: string;
  targetName: string;
  userId: number;
  userName: string;
  userRole: string;
  changes?: string;
  createdAt: string;
};

export async function getLogs(): Promise<Log[]> {
  const res = await fetch(`${BASE}/logs`);
  return res.json();
}

export async function createLog(log: Omit<Log, "_id" | "createdAt">): Promise<void> {
  await fetch(`${BASE}/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
}