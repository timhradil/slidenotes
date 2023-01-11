import React from 'react';
import { uploadFile } from 'react-s3';
import { Box } from '@mui/material';
import Protect from 'react-app-protect'
import 'react-app-protect/dist/index.css'
import NotesPage from './NotesPage.js';
import ProgressPage from './ProgressPage.js';
import HomePage from './HomePage.js';
import Navbar from './Navbar.js';
import './App.css';

const config = {
  bucketName: process.env.REACT_APP_PPTX_S3_NAME,
  region: process.env.REACT_APP_PPTX_S3_REGION,
  accessKeyId: process.env.REACT_APP_PPTX_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_PPTX_S3_SECRET_ACCESS_KEY,
}

function App() {
  const [progress, setProgress] = React.useState(0)
  const [title, setTitle] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [path, setPath] = React.useState(window.location.pathname)
  
  React.useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const id = path.slice(1)
    if (id.match(uuidRegex)) {
      setStatus("Sending Request")
      setProgress(25)
      checkRequestStatus(id)
    }
  }, [path])

  function handlePPTXUpload(e){
    if (!e.target.files) {
      return
    }
    const file = e.target.files[0]
    setStatus("Uploading")
    uploadFile(file, config)
      .then(data => sendRequest(data["key"]))
      .catch(err => console.error(err))
  }

  function sendRequest(key){
    setTitle(key)
    setProgress(25)
    setStatus("Sending Request")
    const url = "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/submitRequest"
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ s3key: key })
    }
    fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      window.location = "/" + data["id"]
    })
    .catch((err) => {
      console.log(err.message)
    })
  }

  function checkRequestStatus(id){
    const interval = setInterval(() => {
      const url = "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/checkRequestStatus"
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      }
      fetch(url, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setTitle(data["s3key"])
        setProgress(data["progress"])
        setStatus(data["status"])
        if (data["notes_text"].length > 0){
          clearInterval(interval)
          setTimeout(() => {
            setNotes(data["notes_text"].trimStart())
          }, 1000)
        }
      })
      .catch((err) => {
        console.log(err.message)
      })
    }, 1000)
  }

  return (
    <Protect sha512={process.env.REACT_APP_SHA512_PASSWORD_HASH}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
        <Navbar />
        {status.length === 0 &&
          <HomePage handleUpload={handlePPTXUpload} />}
        {status.length > 0 && notes.length === 0 &&
          <ProgressPage status={status} progress={progress} />}
        {notes.length > 0 &&
          <NotesPage title={title} notes={notes} />}
      </Box>
    </Protect>
  );
}

export default App;
