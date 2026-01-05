import React from "react";
import { Container, Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";
import AddCost from "./pages/AddCost";
import Report from "./pages/Report";
import Charts from "./pages/Charts";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Container maxWidth="md">
        <Box sx={{ mt: 3 }}>
          <Routes>
            <Route path="/" element={<AddCost />} />
            <Route path="/report" element={<Report />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
      </Container>
    </BrowserRouter>
  );
}