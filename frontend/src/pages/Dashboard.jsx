import React, { useEffect, useState } from "react";
import {
  listReservations,
  deleteReservation,
  getSummary,
  getSettings,
  setSettings,
} from "../api";

function formatDT(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalTables, setTotalTables] = useState(10);
  const today = new Date().toISOString().slice(0, 10);

  async function load() {
    const [resv, sum, st] = await Promise.all([
      listReservations(),
      getSummary(today),
      getSettings(),
    ]);
    setReservations(resv);
    setSummary(sum);
    setTotalTables(st.total_tables);
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    await deleteReservation(id);
    await load();
  }

  async function onSaveSettings() {
    await setSettings(Number(totalTables));
    await load();
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Resumo de hoje</h2>
        {summary && (
          <div className="bg-white shadow rounded-xl p-4 grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Reservas</div>
              <div className="text-2xl font-semibold">
                {summary.total_reservations}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Convidados</div>
              <div className="text-2xl font-semibold">
                {summary.total_guests}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Total de mesas</div>
              <div className="text-2xl font-semibold">
                {summary.total_tables}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Mesas disponíveis</div>
              <div className="text-2xl font-semibold">
                {summary.available_at_peak}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Configurações</h2>
        <div className="bg-white shadow rounded-xl p-4 flex items-end gap-2 w-full max-w-sm">
          <div className="flex-1">
            <label className="text-sm">Total de mesas</label>
            <input
              className="border rounded p-2 w-full"
              placeholder="Nº de mesas"
              type="number"
              min="1"
              value={totalTables}
              onChange={(e) => setTotalTables(e.target.value)}
            />
          </div>
          <button
            onClick={onSaveSettings}
            className="bg-black text-white rounded-lg px-4 py-2"
          >
            Salvar
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Reservas</h2>
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Cliente</th>
                <th className="text-left p-2">Telefone</th>
                <th className="text-left p-2">Data/Hora</th>
                <th className="text-left p-2">Pessoas</th>
                <th className="text-left p-2">Mesa</th>
                <th className="text-left p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2">{formatDT(r.datetime)}</td>
                  <td className="p-2">{r.guests}</td>
                  <td className="p-2">{r.table_number}</td>
                  <td className="p-2">
                    <button
                      onClick={() => onDelete(r.id)}
                      className="text-red-600"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    Sem reservas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
