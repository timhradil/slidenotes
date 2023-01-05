import React from 'react';
import {Box, Typography, LinearProgress} from '@mui/material';

function ProgressPage(props) {
  return(
    <Box sx={{ flexGrow: 1, alignItems: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant='h4'>
        {props.status}
      </Typography>
      <Box sx={{ width: '60%', pt: 4 }}>
        <LinearProgress color="secondary" variant="determinate" value={props.progress}/>
      </Box>
    </Box>
  );
}

export default ProgressPage;
