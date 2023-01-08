import React from 'react';
import {Typography, Box, Button} from '@mui/material';
import demo from './demo.png'

function HomePage(props) {
  
  const fileInput = React.useRef();
  
  return(
    <Box sx={{ px: 5, flexGrow: 1, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignContent: 'center', alignItems: 'flex-start', width: {xs: '90vw', sm: '40vw'} }}>
        <Typography variant='h4'> 
          Transform presentations into readable notes with ease!
        </Typography>
        <Typography>
          Just upload any .pttx file and attain notes you can easily review and share.
        </Typography>
        <Button variant="outlined" color="secondary" onClick={() => fileInput.current.click()} sx={{px: 4, py: 1, mt: 1}} >
          Get Started
        </Button>
        <input ref={fileInput} hidden accept="application/vnd.openxmlformats-officedocument.presentationml.presentation" type="file" onChange={props.handleUpload} />
    </Box>
  );
}

export default HomePage;
