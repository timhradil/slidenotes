import React from 'react';
import {Box, Typography, Grid, Button} from '@mui/material';

function NotesPage(props) {
  return(
    <Grid container spacing={2} sx={{ alignContent: 'flex-start', flexWrap:'wrap-reverse', p: 3 }}>
      <Grid item xs={12} sm={9}>
        <Typography noWrap variant='h5'>
          {props.title}
        </Typography>
        <Box sx={{ pt: 1, overflow: 'auto', height: 'calc(100vh-150px)', bgcolor: 'background.default'}}>
          <Typography sx={{ whiteSpace: 'pre-wrap'}}>
            {props.notes}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
        <Box sx={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Button variant="outlined" color="secondary" sx={{px: 4, py: 1, width: {xs: '49%', sm: '100%'} }} >
          Share 
        </Button>
        <Button variant="outlined" color="secondary" sx={{px: 4, py: 1, mt: {xs: 0, sm: 1}, width: {xs: '49%', sm: '100%'} }} >
          Download
        </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default NotesPage;
