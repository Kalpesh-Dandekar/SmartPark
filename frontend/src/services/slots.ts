import { apiRequest } from "@/lib/api/client";
import type { ApiParkingSlot } from "@/types";
export const getSlots = () => apiRequest<ApiParkingSlot[]>("/api/slots");
export const getSlot = (id: string) => apiRequest<ApiParkingSlot>(`/api/slots/${id}`);
