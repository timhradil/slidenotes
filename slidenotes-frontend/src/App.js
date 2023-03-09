import React from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import NotesPage from "./components/NotesPage.js";
import ProgressPage from "./components/ProgressPage.js";
import HomePage from "./components/HomePage.js";
import Navbar from "./components/Navbar.js";
import LoginModal from "./components/LoginModal.js";
import "./App.css";

function App() {
  const [page, setPage] = React.useState("");
  // eslint-disable-next-line
  const [id, setId] = React.useState("");
  const [file, setFile] = React.useState();
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  //const [phone, setPhone] = React.useState("");
  const [phone, setPhone] = React.useState("+16305018956");
  //const [loggedIn, setLoggedIn] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(true);
  const [alert, setAlert] = React.useState("");
  const [alertText, setAlertText] = React.useState("");

  React.useEffect(() => {
    const foundPhone = localStorage.getItem("phone");
    if (foundPhone) {
      setLoggedIn(true);
      setPhone(foundPhone);
    }
  }, []);

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.length > 1) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const possibleId = path.slice(1);
      if (possibleId.match(uuidRegex)) {
        setId(possibleId);
        setPage("notes");
      }
    } else {
      setPage("home");
    }
  }, []);

  React.useEffect(() => {
    if (alert === "error") {
      setId("");
      setPage("home");
    }
  }, [alert]);

  function handleUpload(file) {
    setFile(file);
    setPage("progress");
  }

  function login() {
    setLoggedIn(true);
    localStorage.setItem("phone", phone);
  }

  function logout() {
    setLoggedIn(false);
    setPhone("");
    localStorage.clear();
  }

  function createAlert(type, message) {
    setAlert(type);
    setAlertText(message);
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
      }}
    >
      <Snackbar
        open={alert.length > 0}
        autoHideDuration={5000}
        onClose={() => setAlert("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert("")}
          severity={alert.length > 0 ? alert : "error"}
          sx={{ width: "100%" }}
        >
          {alertText}
        </Alert>
      </Snackbar>
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        phone={phone}
        onPhoneChange={setPhone}
        onLogin={login}
      />
      <Navbar
        loggedIn={loggedIn}
        login={() => setLoginModalOpen(true)}
        logout={logout}
      />
      {page === "home" && (
        <HomePage
          loggedIn={loggedIn}
          phone={phone}
          handleUpload={handleUpload}
          login={() => setLoginModalOpen(true)}
          createAlert={createAlert}
        />
      )}
      {page === "progress" && (
        <ProgressPage
          phone={phone}
          file={file}
          onFinished={() => {window.location = "/" + id}}
          createAlert={createAlert}
          onRequestSent={(id) => setId(id)}
        />
      )}
      {page === "notes" && <NotesPage id={id} />}
    </Box>
  );
}

export default App;
