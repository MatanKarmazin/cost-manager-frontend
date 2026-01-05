import React, { useState } from "react";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { DEFAULT_RATES_URL, loadRatesUrl, saveRatesUrl, fetchRates } from "../services/ratesService";

export default function Settings() {
  const [url, setUrl] = useState(loadRatesUrl());
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [lastRates, setLastRates] = useState(null);

  async function onTest() {
    setStatus({ type: "", msg: "" });
    setLastRates(null);

    try {
      const rates = await fetchRates(url);
      setLastRates(rates);
      setStatus({ type: "success", msg: "Rates fetched successfully ✅" });
    } catch (e) {
      setStatus({ type: "error", msg: e?.message || "Failed to fetch rates." });
    }
  }

  function onSave() {
    saveRatesUrl(url);
    setStatus({ type: "success", msg: "Saved URL ✅" });
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Settings
      </Typography>

      {status.msg ? <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert> : null}

      <TextField
        fullWidth
        id="rates-url"
        name="ratesUrl"
        label="Currency Rates URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        helperText={`Default: ${DEFAULT_RATES_URL}`}
        autoComplete="url"
      />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onTest}>Test Fetch</Button>
        <Button variant="contained" onClick={onSave}>Save</Button>
      </Box>

      {lastRates ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Last fetched rates:</Typography>
          <pre style={{ marginTop: 8 }}>{JSON.stringify(lastRates, null, 2)}</pre>
        </Box>
      ) : null}
    </Box>
  );
}
