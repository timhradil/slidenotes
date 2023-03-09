import React from "react";
import { Box, Typography, Grid, Button, CircularProgress } from "@mui/material";
import { RWebShare } from "react-web-share";
import downloadNotes from "../helpers/downloadNotes.js";

function NotesPage(props) {
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    const url =
      "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/getNotes";
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: props.id }),
    };
    fetch(url, requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error");
      })
      .then((data) => {
        setTitle(data["s3key"].split(".")[0]);
        setNotes(data["notes_text"]);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [props.id]);

  const onDownload = () => {
    downloadNotes(props.id, notes);
  };

  return (
    <>
      {notes.length > 0 ? (
        <Grid
          container
          spacing={2}
          sx={{ alignContent: "flex-start", flexWrap: "wrap-reverse", p: 3 }}
        >
          <Grid item xs={12} sm={10}>
            <Typography noWrap variant="h5">
              {title}
            </Typography>
            <Box
              sx={{
                pt: 1,
                overflowY: "scroll",
                height: {
                  xs: "calc(100vh - 235px)",
                  sm: "calc(100vh - 175px)",
                },
                bgcolor: "background.default",
              }}
            >
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{notes}</Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={2}
            sx={{ display: "flex", flexDirection: "column", flexWrap: "wrap" }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: {
                  xs: "space-between",
                  sm: "flex-start",
                  md: "flex-end",
                },
              }}
            >
              <RWebShare
                data={{
                  text: "Check out my notes for " + title,
                  url: window.location.href,
                  title: "Share your notes on " + title,
                }}
                sites={["whatsapp", "telegram", "mail", "copy"]}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ width: { xs: "49%", sm: "90%" } }}
                >
                  Share
                </Button>
              </RWebShare>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ mt: { xs: 0, sm: 1 }, width: { xs: "49%", sm: "90%" } }}
                onClick={onDownload}
              >
                Download
              </Button>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 100px)"
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
    </>
  );
}

export default NotesPage;
