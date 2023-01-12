import React from 'react';
import {Typography, Box, Grid, Button} from '@mui/material';
import fast from '../static/fast.png'
import comprehensive from '../static/comprehensive.png'
import easy from '../static/easy.png'

function HomePage(props) {
  
  const fileInput = React.useRef();
  
  return(
    <Grid container spacing={2} columns={{xs:12, sm: 12, md: 14}} sx={{ flexGrow: 1, alignContent: 'center', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Grid item xs={12} md={5}>
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
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Box sx={{ width: {xs: "100%", sm: "80%", md: "100%"} }}>
          <img width="100%" src={fast} alt="Slidenotes is fast"/>
        </Box>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Box sx={{ width: {xs: "100%", sm: "80%", md: "100%"} }}>
          <img width="100%" src={comprehensive} alt="Slidenotes is comprehensive"/>
        </Box>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Box sx={{ width: {xs: "100%", sm: "80%", md: "100%"} }}>
          <img width="100%" src={easy} alt="Slidenotes is easy"/>
        </Box>
      </Grid>
    </Grid>
  );
}

export default HomePage;
