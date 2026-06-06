import api from "./api";

export interface PendingImport {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

export async function getPendingImport(): Promise<PendingImport | null> {
  const response = await api.get<PendingImport | null>(
    "/api/transaction-imports/get-pending",
  );
  return response.data;
}
