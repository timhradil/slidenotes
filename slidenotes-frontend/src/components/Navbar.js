import React from "react";
import { Box, Button, Toolbar, AppBar } from "@mui/material";
import logo from "../static/logo.png";

function Navbar(props) {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ py: 1 }}>
            <a href="/">
              <img src={logo} alt="Slidenotes" height="70px" />
            </a>
          </Box>
          <Box>
            <Button color="secondary" href="/">
              Home
            </Button>
            {!props.loggedIn ? (
              <Button color="secondary" onClick={props.login}>
                Login
              </Button>
            ) : (
              <Button color="secondary" onClick={props.logout}>
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
