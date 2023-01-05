import React from 'react';
import {Box, Button, Toolbar, AppBar} from '@mui/material';
import logo from './logo.png'

function Navbar(props) {
  return(
    <Box>
      <AppBar position='static'>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ py: 1 }}>
            <img src={logo} alt="Slidenotes" height="100px" /> 
          </Box>
          <Box>
            <Button color="secondary">Home</Button>
            <Button color="secondary">Premium</Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
