import React from 'react';
import {Box, Typography, Grid, Button} from '@mui/material';

function NotesPage(props) {
  return(
    <Grid container spacing={2} sx={{ alignContent: 'flex-start', flexWrap:'wrap-reverse', p: 3 }}>
      <Grid item xs={12} sm={10}>
        <Typography noWrap variant='h5'>
          {props.title}
        </Typography>
        <Box sx={{ pt: 1, overflowY: 'scroll', height: {xs: 'calc(100vh - 235px)', sm: 'calc(100vh - 175px)'}, bgcolor: 'background.default'}}>
          <Typography sx={{ whiteSpace: 'pre-wrap'}}>
            {props.notes}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={2} sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
        <Box sx={{display: 'flex', flexWrap: 'wrap', justifyContent: {xs: 'space-between', sm: 'flex-start', md: 'flex-end'} }}>
        <Button variant="outlined" color="secondary" sx={{width: {xs: '49%', sm: '90%'} }} >
          Share 
        </Button>
        <Button variant="outlined" color="secondary" sx={{mt: {xs: 0, sm: 1}, width: {xs: '49%', sm: '90%'} }} >
          Download
        </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default NotesPage;
