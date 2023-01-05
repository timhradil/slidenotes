import React from 'react';
import {Typography, Grid, Button} from '@mui/material';

function HomePage(props) {
  
  const fileInput = React.useRef();
  
  return(
    <Grid container spacing={2} sx={{ alignItems: 'center', height: 'calc(100vh - 150px)', p: 3 }}>
      <Grid item xs={12} sm={6}>
        <Typography variant='h4'>
          Transform Presentations into readable notes with ease!
        </Typography>
        <Typography>
          Just upload any .pttx file and attain notes you can easily review and share.
        </Typography>
        <Button variant="outlined" color="secondary" onClick={() => fileInput.current.click()} sx={{px: 4, py: 1, mt: 1}} >
          Get Started
        </Button>
        <input ref={fileInput} hidden accept="application/vnd.openxmlformats-officedocument.presentationml.presentation" type="file" onChange={props.handleUpload} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography>
          Demo Image Goes here
        </Typography>
      </Grid>
    </Grid>
  );
}

export default HomePage;
