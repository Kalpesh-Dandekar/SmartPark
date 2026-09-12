"use client";
import { CalendarCheck2, CheckCircle2, CircleParking } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockUser } from "@/data/mock";
import { useAuth } from "@/features/auth/auth-provider";
import { getParkingAvailability } from "@/services/parking";
import { createReservation } from "@/services/reservations";
import type { ApiReservation, ParkingAvailability } from "@/types";

const durations=[{value:"30",label:"30 minutes"},{value:"60",label:"1 hour"},{value:"120",label:"2 hours"},{value:"180",label:"3 hours"},{value:"240",label:"4 hours"}];

export function BookSlotView(){
  const {profile}=useAuth();
  const [date,setDate]=useState(()=>new Date(Date.now()+86400000).toISOString().slice(0,10));
  const [time,setTime]=useState("10:00");
  const [duration,setDuration]=useState("120");
  const [availability,setAvailability]=useState<ParkingAvailability|null>(null);
  const [confirmed,setConfirmed]=useState<ApiReservation|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const durationLabel=durations.find((item)=>item.value===duration)?.label??duration;

  async function check(){
    setLoading(true);setError("");
    try{setAvailability(await getParkingAvailability({date,startTime:time,durationMinutes:Number(duration)}));setConfirmed(null)}
    catch(value){setError(value instanceof Error?value.message:"Unable to check availability. Please try again.")}
    finally{setLoading(false)}
  }

  async function reserve(){
    if(!availability?.available||!profile||loading)return;
    setLoading(true);setError("");
    const request={bookingDate:date,startTime:time,durationMinutes:Number(duration),vehicleNumber:profile.vehicleNumber??""};
    try{
      const fresh=await getParkingAvailability({date:request.bookingDate,startTime:request.startTime,durationMinutes:request.durationMinutes});
      setAvailability(fresh);
      if(fresh.available<=0)return;
      setConfirmed(await createReservation(request));
      setAvailability({...fresh,available:Math.max(0,fresh.available-1),reserved:fresh.reserved+1});
    }catch(value){setError(value instanceof Error?value.message:"Unable to refresh availability. Please try again.")}
    finally{setLoading(false)}
  }

  return <AppShell user={{...mockUser,...profile}}><main className="min-w-0"><Container className="py-8 sm:py-10 lg:py-12"><PageHeader title="Book Parking" description="Reserve one parking space for your preferred date and time."/><div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]"><div className="space-y-6"><Card><CardHeader className="border-b border-slate-200"><CardTitle>Reservation details</CardTitle><p className="mt-1 text-sm text-slate-600">Choose when you plan to park.</p></CardHeader><CardContent className="p-5 sm:p-6"><form onSubmit={(event)=>{event.preventDefault();void check()}} className="grid gap-5 sm:grid-cols-2"><Input label="Booking date" type="date" value={date} disabled={loading} onChange={(event)=>{setDate(event.target.value);setAvailability(null)}} required/><Input label="Start time" type="time" value={time} disabled={loading} onChange={(event)=>{setTime(event.target.value);setAvailability(null)}} required/><label className="block text-sm font-medium text-slate-800">Duration<select value={duration} disabled={loading} onChange={(event)=>{setDuration(event.target.value);setAvailability(null)}} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-100">{durations.map((item)=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label><Input label="Vehicle" value={profile?.vehicleNumber??""} readOnly helperText={profile?.vehicleNumber?"From your SmartPark profile.":"Add a vehicle before booking."}/><Button type="submit" className="sm:col-span-2 sm:w-fit" disabled={loading}>Check Parking Availability</Button></form></CardContent></Card>{availability&&<Card><CardHeader className="border-b border-slate-200"><CardTitle>Parking availability</CardTitle><p className="mt-1 text-sm text-slate-600">For the selected reservation period.</p></CardHeader><CardContent className="p-5 sm:p-6"><div className="flex items-center justify-between gap-5"><div><p className={`text-2xl font-bold ${availability.available?"text-emerald-700":"text-red-700"}`}>{availability.available?`${availability.available} spaces available`:"Parking is full"}</p><p className="mt-2 text-sm text-slate-600">{formatDate(date)} at {formatTime(time)}</p></div><CircleParking className="size-12 text-blue-700"/></div><dl className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 text-center"><Capacity label="Total" value={availability.totalCapacity}/><Capacity label="Reserved" value={availability.reserved}/><Capacity label="Parked" value={availability.occupied}/></dl><p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">Availability excludes terminal and non-overlapping reservations.</p></CardContent></Card>}</div><Card className="xl:sticky xl:top-6"><CardHeader className="border-b border-slate-200"><CardTitle>Booking summary</CardTitle></CardHeader><CardContent className="p-5 sm:p-6">{availability?<><dl className="grid grid-cols-2 gap-5"><Detail label="Date" value={formatDate(date)}/><Detail label="Time" value={formatTime(time)}/><Detail label="Duration" value={durationLabel}/><Detail label="Vehicle" value={profile?.vehicleNumber||"Not configured"}/><Detail label="Parking space" value="1 reservation"/><Detail label="Available after booking" value={availability.available?String(Math.max(0,availability.available-1)):"—"}/></dl>{confirmed?<div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4" role="status"><div className="flex gap-3"><CheckCircle2 className="size-5 shrink-0 text-emerald-700"/><div><p className="font-semibold text-emerald-950">Parking reserved successfully</p><p className="mt-1 text-sm text-emerald-900">Status: Booked. Your QR is ready.</p></div></div><Link href="/bookings" className={buttonStyles({className:"mt-4 w-full"})}>View Booking &amp; QR</Link></div>:<Button className="mt-6 w-full" disabled={loading||!availability.available||!profile?.vehicleNumber} onClick={()=>void reserve()}><CalendarCheck2 className="size-4"/>{loading?"Checking availability…":"Reserve Parking"}</Button>}</>:<div className="py-8 text-center"><CalendarCheck2 className="mx-auto size-9 text-slate-400"/><p className="mt-3 text-sm text-slate-600">Check availability to review your reservation.</p></div>}{error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<p className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-600">Your reservation guarantees capacity. SmartPark&apos;s hardware finds an available physical position when you arrive.</p></CardContent></Card></div></Container></main></AppShell>;
}

function Capacity({label,value}:{label:string;value:number}){return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-xl font-bold">{value}</dd></div>}
function Detail({label,value}:{label:string;value:string}){return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>}
function formatDate(value:string){return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Kolkata"}).format(new Date(`${value}T00:00:00+05:30`))}
function formatTime(value:string){return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:"Asia/Kolkata"}).format(new Date(`2026-01-01T${value}:00+05:30`))}
