import React, { useState } from "react";
import { Box, Button, MenuItem, TextField, Typography, Alert } from "@mui/material";
import { getDb } from "../services/db";

const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

export default function AddCost() {
  const [sum, setSum] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] = useState({ type: "", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    const sumNum = Number(sum);

    if (!Number.isFinite(sumNum)) {
      setStatus({ type: "error", msg: "Sum must be a valid number." });
      return;
    }
    if (!category.trim()) {
      setStatus({ type: "error", msg: "Category is required." });
      return;
    }

    try {
      const db = await getDb();
      const result = await db.addCost({
        sum: sumNum,
        currency,
        category: category.trim(),
        description: description.trim()
      });

      setStatus({ type: "success", msg: `Saved! (id=${result.id})` });

      // reset form
      setSum("");
      setCurrency("USD");
      setCategory("");
      setDescription("");
    } catch (err) {
      setStatus({ type: "error", msg: err?.message || "Failed saving cost." });
    }
  }

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add Cost
      </Typography>

      {status.msg ? <Alert severity={status.type}>{status.msg}</Alert> : null}

      <Box component="form" onSubmit={onSubmit} sx={{ mt: 2, display: "grid", gap: 2 }}>
        <TextField
          label="Sum"
          value={sum}
          onChange={(e) => setSum(e.target.value)}
          inputProps={{ inputMode: "decimal" }}
          required
        />

        <TextField
          select
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        >
          {CURRENCIES.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
        />

        <Button type="submit" variant="contained">
          Save
        </Button>
      </Box>
    </Box>
  );
}
