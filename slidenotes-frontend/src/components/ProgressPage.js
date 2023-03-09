import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { uploadFile } from "react-s3";
import s3Config from "../config/s3Config.js";

function ProgressPage(props) {
  const [status, setStatus] = React.useState("");
  const [progress, setProgress] = React.useState(0);

  const checkRequestStatus = React.useCallback((id) => {
    const interval = setInterval(() => {
      const url =
        "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/checkRequestStatus";
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      };
      fetch(url, requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const status = data["status"]
          if (status.includes("Failed")) {
            throw new Error(status)
          }
          setStatus(status)
          if (data["status"] === "Finished") {
            clearInterval(interval)
            setTimeout(() => {
              props.onFinished()
            }, 1000)
          }
        })
        .catch((err) => {
          props.createAlert("error", err.message);
          clearInterval(interval);
        });
    }, 1000);
  }, [props]);

  const sendRequest = React.useCallback(
    (key) => {
      setStatus("Sending Request");
      const url =
        "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/submitRequest";
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3key: key, phoneNumber: props.phone }),
      };
      fetch(url, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if ("warning" in data) {
            props.createAlert("warning", data["warning"]);
          } else if ("error" in data) {
            throw new Error(data["error"]);
          }
          props.onRequestSent(data["id"]);
          checkRequestStatus(data["id"]);
        })
        .catch((err) => {
          console.log(err.message);
          if (err.message.startsWith("No free notes")) {
            props.createAlert("error", err.message);
          } else {
            props.createAlert("error", "Sending Request Failed, Try Again.");
          }
        });
    },
    [props, checkRequestStatus]
  );

  React.useEffect(() => {
    if (status === "") {
      setStatus("Uploading");
      uploadFile(props.file, s3Config)
        .then((data) => sendRequest(data["key"]))
        .catch((err) => {
          console.error(err);
          props.createAlert("error", "Uploading Failed, Try Again.");
        });
    }
    // eslint-disable-next-line no-use-before-define
  }, [props, status, sendRequest]);

  React.useEffect(() => {
    switch (status) {
      case "Uploading":
        setProgress(0);
        break;
      case "Sending Request":
        setProgress(25);
        break;
      case "Converting To Text":
        setProgress(50);
        break;
      case "Creating Notes":
        setProgress(75);
        break;
      case "Finished":
        setProgress(100);
        break;
      default:
        setProgress(0);
    }
  }, [status, setProgress]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        alignItems: "center",
        alignContent: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "calc(100vh - 100px)"
      }}
    >
      <Typography variant="h4">{status}</Typography>
      <Box sx={{ width: "60%", pt: 4 }}>
        <LinearProgress
          color="secondary"
          variant="determinate"
          value={progress}
        />
      </Box>
    </Box>
  );
}

export default ProgressPage;
