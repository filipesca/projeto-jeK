// Formulario para criar reservas
import React, { useEffect, useState } from "react";
import { createReservation, getAvailableTables } from "../api";

export default function ReservationForm() {
  // Estado do formulario
  const [form, setForm] = useState({
    name: "",
    phone: "",
    datetime: "",
    guests: 2,
    notes: "",
    table_number: "auto",
  });

  // Mensagem mostrada abaixo do botao
  const [status, setStatus] = useState(null);

  // Mesas livres para o dia e hora
  const [available, setAvailable] = useState([]);

  // A carregar as mesas
  const [loadingTables, setLoadingTables] = useState(false);

  // Atualiza campos do formulario
  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // Carrega mesas quando data/hora muda
  useEffect(() => {
    (async () => {
      if (!form.datetime) {
        setAvailable([]);
        return;
      }
      setLoadingTables(true);
      try {
        const list = await getAvailableTables(form.datetime);
        setAvailable(list);
      } catch {
        setAvailable([]);
      } finally {
        setLoadingTables(false);
      }
    })();
  }, [form.datetime]);

  // Submissao do formulário
  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      const payload = { ...form };
      if (payload.table_number === "auto") delete payload.table_number; // se o cliente escolher auto-atribuicao, deixa backend escolher
      const res = await createReservation(payload);

      // Caso haja sucesso
      setStatus(`Reserva criada! Mesa #${res.table_number}`);
      setForm({
        name: "",
        phone: "",
        datetime: "",
        guests: 2,
        notes: "",
        table_number: "auto",
      });
      setAvailable([]);
    } catch (err) {
      // Erros do backend chegam como err.message
      setStatus(err.message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white shadow p-4 rounded-xl grid gap-3"
    >
      {/* Nome */}
      <div className="grid gap-1">
        <label className="text-sm">Nome</label>
        <input
          className="border rounded p-2"
          name="name"
          value={form.name}
          onChange={onChange}
          required
        />
      </div>

      {/* Telefone */}
      <div className="grid gap-1">
        <label className="text-sm">Telefone</label>
        <input
          className="border rounded p-2"
          name="phone"
          value={form.phone}
          onChange={onChange}
          required
        />
      </div>

      {/* Data e hora */}
      <div className="grid gap-1">
        <label className="text-sm">Data e hora</label>
        <input
          className="border rounded p-2"
          type="datetime-local"
          name="datetime"
          value={form.datetime}
          onChange={onChange}
          required
        />
      </div>

      {/* Numero de pessoas */}
      <div className="grid gap-1">
        <label className="text-sm">Pessoas</label>
        <input
          className="border rounded p-2"
          type="number"
          min="1"
          name="guests"
          value={form.guests}
          onChange={onChange}
          required
        />
      </div>

      {/* Seleção de mesa */}
      <div className="grid gap-1">
        <label className="text-sm">Mesa</label>
        <select
          className="border rounded p-2"
          name="table_number"
          value={form.table_number}
          onChange={onChange}
          disabled={!form.datetime || loadingTables}
        >
          <option value="auto">Auto-atribuir</option>
          {available.map((n) => (
            <option key={n} value={n}>
              Mesa #{n}
            </option>
          ))}
        </select>

        {/* Quando nao ha data/hora ou nao ha mesa */}
        {!form.datetime && (
          <p className="text-xs text-gray-500">
            Escolha a data e hora para ver mesas disponíveis
          </p>
        )}
        {form.datetime && !loadingTables && available.length === 0 && (
          <p className="text-xs text-red-600">
            Sem mesas disponíveis neste horáriop
          </p>
        )}
      </div>

      {/* Observacoes */}
      <div className="grid gap-1">
        <label className="text-sm">Observações</label>
        <textarea
          className="border rounded p-2"
          name="notes"
          value={form.notes}
          onChange={onChange}
        />
      </div>

      {/* Botao para fazer reserva */}
      <button className="bg-black text-white rounded-lg px-4 py-2">
        Fazer reserva
      </button>

      {/* Mensagem abaixo do botao */}
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
}
