import { apiRequest } from "@/lib/api/client";
import type { ParkingAvailability } from "@/types";
export const getParkingAvailability=(input:{date:string;startTime:string;durationMinutes:number})=>{const query=new URLSearchParams({date:input.date,startTime:input.startTime,durationMinutes:String(input.durationMinutes)});return apiRequest<ParkingAvailability>(`/api/parking/availability?${query}`)};
export const getParkingStatus=()=>apiRequest<Pick<ParkingAvailability,"totalCapacity"|"reserved"|"occupied"|"available">>("/api/parking/status");
