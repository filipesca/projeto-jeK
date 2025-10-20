// Pagina com o formulario de reservas
import React from "react";
import ReservationForm from "../components/ReservationForm";

export default function Home() {
  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">Fazer reserva</h1>
      <ReservationForm />
    </div>
  );
}
