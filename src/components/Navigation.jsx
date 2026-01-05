import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

export default function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 3 }}>
          Cost Manager
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button color="inherit" component={NavLink} to="/">
            Add Cost
          </Button>

          <Button color="inherit" component={NavLink} to="/report">
            Report
          </Button>

          <Button color="inherit" component={NavLink} to="/charts">
            Charts
          </Button>

          <Button color="inherit" component={NavLink} to="/settings">
            Settings
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}