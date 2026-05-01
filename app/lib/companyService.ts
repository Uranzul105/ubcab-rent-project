const BASE = "http://localhost:3001/api";

export type Company = {
  _id: string;
  name: string;
  regno: string;
};

export async function getCompanies(): Promise<Company[]> {
  const res = await fetch(`${BASE}/companies`);
  return res.json();
}

export async function createCompany(data: { name: string; regno: string }): Promise<Company> {
  const res = await fetch(`${BASE}/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCompany(id: string): Promise<void> {
  await fetch(`${BASE}/companies/${id}`, { method: "DELETE" });
}