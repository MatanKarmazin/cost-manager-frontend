import React, { useState } from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Alert,
    Paper,
    Tabs,
    Tab
} from "@mui/material";
import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from "recharts";
import { getDb } from "../services/db";

const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

function currentYear() {
    return new Date().getFullYear();
}
function currentMonth() {
    return new Date().getMonth() + 1;
}

export default function Charts() {
    const [tab, setTab] = useState(0);

    const [year, setYear] = useState(String(currentYear()));
    const [month, setMonth] = useState(String(currentMonth()));
    const [currency, setCurrency] = useState("USD");

    const [status, setStatus] = useState({ type: "", msg: "" });
    const [pieData, setPieData] = useState([]);
    const [barData, setBarData] = useState([]);

    async function onGenerate() {
        setStatus({ type: "", msg: "" });

        const y = Number(year);
        const m = Number(month);

        if (!Number.isInteger(y) || y < 1970 || y > 2100) {
            setStatus({ type: "error", msg: "Year must be valid (e.g. 2026)." });
            return;
        }
        if (tab === 0 && (!Number.isInteger(m) || m < 1 || m > 12)) {
            setStatus({ type: "error", msg: "Month must be between 1 and 12." });
            return;
        }

        try {
            const db = await getDb();

            if (tab === 0) {
                const data = await db.getCategoryTotals(y, m, currency);
                setPieData(data);
                setStatus({
                    type: "success",
                    msg: `Pie chart generated for ${y}-${String(m).padStart(2, "0")} in ${currency} ✅`
                });
            } else {
                const data = await db.getYearMonthlyTotals(y, currency);
                setBarData(data);
                setStatus({
                    type: "success",
                    msg: `Bar chart generated for ${y} in ${currency} ✅`
                });
            }
        } catch (e) {
            setStatus({ type: "error", msg: e?.message || "Failed to generate chart." });
        }
    }

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Charts
            </Typography>

            {status.msg ? (
                <Alert severity={status.type} sx={{ mb: 2 }}>
                    {status.msg}
                </Alert>
            ) : null}

            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    variant="fullWidth"
                >
                    <Tab label="Pie by Category (Month)" />
                    <Tab label="Bar by Month (Year)" />
                </Tabs>
            </Paper>

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                    mb: 2
                }}
            >
                <TextField
                    id="charts-year"
                    name="year"
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ width: 140 }}
                    size="small"
                />


                <TextField
                    id="charts-month"
                    name="month"
                    label="Month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    sx={{ width: 140 }}
                    size="small"
                    disabled={tab === 1}
                />

                <TextField
                    select
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    sx={{ width: 160 }}
                    size="small"
                    // 1. Set the ID here once. 
                    // MUI will automatically use this for the label's 'htmlFor' 
                    // and the Select's 'id'.
                    id="charts-currency"

                    // 2. Remove the manual 'htmlFor' and 'id' from InputLabelProps
                    InputLabelProps={{ id: "charts-currency-label" }}

                    SelectProps={{
                        inputProps: {
                            // 3. Remove 'id' from here to avoid duplication
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
                    sx={{ height: 40, alignSelf: "center" }}
                >
                    Generate
                </Button>
            </Box>

            <Paper sx={{ p: 2, minWidth: 0 }}>
                {tab === 0 ? (
                    pieData.length === 0 ? (
                        <Typography>No data for selected month/year.</Typography>
                    ) : (
                        <ResponsiveContainer width="100%" height={420}>
                            <PieChart>
                                <Tooltip formatter={(value, name) => [`${value} ${currency}`, name]} />
                                <Legend />
                                <Pie data={pieData} dataKey="total" nameKey="category" />
                            </PieChart>
                        </ResponsiveContainer>
                    )
                ) : barData.length === 0 ? (
                    <Typography>No data for selected year.</Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={barData}>
                            <CartesianGrid />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value} ${currency}`} />
                            <Legend />
                            <Bar dataKey="total" name={`Total (${currency})`} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Paper>
        </Box>
    );
}