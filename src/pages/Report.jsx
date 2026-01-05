import React, { useState } from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
import { getDb } from "../services/db";

const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

function pad2(n) {
    return String(n).padStart(2, "0");
}

function formatFullDate(reportYear, reportMonth, day) {
    if (!day) return "";
    return `${reportYear}-${pad2(reportMonth)}-${pad2(day)}`; // YYYY-MM-DD
}

function currentYear() {
    return new Date().getFullYear();
}

function currentMonth() {
    return new Date().getMonth() + 1;
}

export default function Report() {
    const [year, setYear] = useState(String(currentYear()));
    const [month, setMonth] = useState(String(currentMonth()));
    const [currency, setCurrency] = useState("USD");

    const [status, setStatus] = useState({ type: "", msg: "" });
    const [report, setReport] = useState(null);

    async function onGenerate() {
        setStatus({ type: "", msg: "" });
        setReport(null);

        const y = Number(year);
        const m = Number(month);

        if (!Number.isInteger(y) || y < 1970 || y > 2100) {
            setStatus({ type: "error", msg: "Year must be a valid number (e.g. 2025)." });
            return;
        }
        if (!Number.isInteger(m) || m < 1 || m > 12) {
            setStatus({ type: "error", msg: "Month must be between 1 and 12." });
            return;
        }

        try {
            const db = await getDb();
            const result = await db.getReport(y, m, currency);
            setReport(result);
            setStatus({ type: "success", msg: "Report generated ✅" });
        } catch (e) {
            setStatus({ type: "error", msg: e?.message || "Failed to generate report." });
        }
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Monthly Report
            </Typography>

            {status.msg ? <Alert severity={status.type} sx={{ mb: 2 }}>{status.msg}</Alert> : null}

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                <TextField
                    id="report-year"
                    name="year"
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ width: 140 }}
                    size="small"
                />

                <TextField
                    id="report-month"
                    name="month"
                    label="Month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    sx={{ width: 140 }}
                    size="small"
                />

                <TextField
                    select
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    sx={{ width: 160 }}
                    size="small"

                    // these are for the label
                    id="report-currency"
                    InputLabelProps={{ htmlFor: "report-currency", id: "report-currency-label" }}

                    // these are for the actual select
                    SelectProps={{
                        inputProps: {
                            id: "report-currency",
                            name: "currency",
                        },
                    }}
                >
                    {CURRENCIES.map((c) => (
                        <MenuItem key={c} value={c}>
                            {c}
                        </MenuItem>
                    ))}
                </TextField>



                <Button
                    variant="contained"
                    onClick={onGenerate}
                >
                    Generate
                </Button>
            </Box>

            {report ? (
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Total: <b>{report.total.total}</b> {report.total.currency}
                    </Typography>

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Sum</TableCell>
                                    <TableCell>Currency</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {report.costs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            No costs found for this month.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    report.costs.map((c, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{formatFullDate(report.year, report.month, c.Date?.day)}</TableCell>
                                            <TableCell>{c.category}</TableCell>
                                            <TableCell>{c.description}</TableCell>
                                            <TableCell align="right">{c.sum}</TableCell>
                                            <TableCell>{c.currency}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : null}
        </Box>
    );
}
