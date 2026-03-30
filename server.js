import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY en .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function sanitizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidMexicanPhone(value) {
  const digits = sanitizeDigits(value);
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("52"));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/registro", async (req, res) => {
  try {
    const { nombre, apellidos, pesoMeta, celular } = req.body;

    if (!nombre || !apellidos || !pesoMeta || !celular) {
      return res.status(400).json({
        ok: false,
        message: "Todos los campos son obligatorios."
      });
    }

    const peso = Number(pesoMeta);
    if (Number.isNaN(peso) || peso <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El peso meta no es válido."
      });
    }

    if (!isValidMexicanPhone(celular)) {
      return res.status(400).json({
        ok: false,
        message: "El celular no es válido."
      });
    }

    const { data, error } = await supabase
      .from("inscripciones_reto")
      .insert([
        {
          nombre: String(nombre).trim(),
          apellidos: String(apellidos).trim(),
          peso_meta: peso,
          celular: sanitizeDigits(celular)
        }
      ])
      .select();

    if (error) {
      console.error("Error al guardar en Supabase:", error);
      return res.status(500).json({
        ok: false,
        message: "No se pudo guardar la inscripción."
      });
    }

    return res.status(201).json({
      ok: true,
      message: "Inscripción guardada correctamente.",
      registro: data[0]
    });
  } catch (err) {
    console.error("Error inesperado:", err);
    return res.status(500).json({
      ok: false,
      message: "Ocurrió un error inesperado."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
