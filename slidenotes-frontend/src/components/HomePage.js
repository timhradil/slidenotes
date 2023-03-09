import React from "react";
import {
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import fast from "../static/fast.png";
import comprehensive from "../static/comprehensive.png";
import easy from "../static/easy.png";

function HomePage(props) {
  const [notes, setNotes] = React.useState([]);
  const [premium, setPremium] = React.useState(false);

  const fileInput = React.useRef();

  const onUpload = React.useCallback(() => {
    if (props.loggedIn) {
      fileInput.current.click();
    } else {
      props.login();
    }
  }, [props, fileInput]);

  const handleUpload = React.useCallback(
    (e) => {
      if (!e.target.files) {
        props.createAlert("error", "Please upload a pdf or pptx file.");
        return;
      }
      const file = e.target.files[0];
      if (!premium && file.size > 10485760) {
        props.createAlert("error", "The max size for free users is 10MB");
        return;
      }
      props.handleUpload(file);
    },
    [props, premium]
  );

  const handleSubscribe = () => {
    const url =
      "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/createStripeCheckoutSession";
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: props.phone, returnUrl: window.location.href }),
    };
    fetch(url, requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error");
      })
      .then((data) => {
        window.location.href = data["url"];
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleUpdateSubscribe = () => {
    const url =
      "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/createStripePortalSession";
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: props.phone, returnUrl: window.location.href }),
    };
    fetch(url, requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error");
      })
      .then((data) => {
        window.location.href = data["url"];
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  React.useEffect(() => {
    if (props.loggedIn) {
      const url =
        "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/getUserNotes";
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: props.phone }),
      };
      fetch(url, requestOptions)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Error");
        })
        .then((data) => {
          setPremium(data["premium"]);
          setNotes(data["items"]);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, [props]);

  return (
    <>
      {!props.loggedIn ? (
        <Grid
          container
          spacing={2}
          columns={{ xs: 12, sm: 12, md: 14 }}
          sx={{
            flexGrow: 1,
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            height: { xs: "100%", sm: "calc(100vh - 100px)" },
          }}
        >
          <Grid item xs={12} md={5}>
            <Typography variant="h4">
              Transform presentations into readable notes with ease!
            </Typography>
            <Typography>
              Just upload any .pttx or .pdf file and obtain notes you can easily
              review and share.
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onUpload}
              sx={{ px: 4, py: 1, mt: 1 }}
            >
              Get Started
            </Button>
            <input
              ref={fileInput}
              hidden
              accept="application/vnd.openxmlformats-officedocument.presentationml.presentation, application/pdf"
              type="file"
              onChange={handleUpload}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ width: { xs: "100%", sm: "80%", md: "100%" } }}>
              <img width="100%" src={fast} alt="Slidenotes is fast" />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ width: { xs: "100%", sm: "80%", md: "100%" } }}>
              <img
                width="100%"
                src={comprehensive}
                alt="Slidenotes is comprehensive"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ width: { xs: "100%", sm: "80%", md: "100%" } }}>
              <img width="100%" src={easy} alt="Slidenotes is easy" />
            </Box>
          </Grid>
        </Grid>
      ) : (
        <>
          {notes.length === 0 ? (
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
                height: "calc(100vh - 100px)",
              }}
            >
              <CircularProgress color="secondary" />
            </Grid>
          ) : (
            <Grid
              container
              columns={{ xs: 12, sm: 12, md: 12 }}
              sx={{
                flexGrow: 1,
                alignContent: "top",
                alignItems: "top",
                justifyContent: "top",
                mt: 2,
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  alignContent: "top",
                  justifyContent: "top",
                }}
              >
                <Typography>Welcome {props.phone},</Typography>
              </Grid>
              {/*<Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  alignContent: "top",
                  justifyContent: "top",
                }}
              >
                <Button
                  variant={premium ? "outlined" : "contained"}
                  color="secondary"
                  onClick={premium ? handleUpdateSubscribe : handleSubscribe}
                  sx={{ px: 4, py: 1, m: 1 }}
                >
                  {premium ? "Update Subscription" : "Subscribe to Premium"}
                </Button>
              </Grid> */}
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  alignContent: "top",
                  justifyContent: "top",
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onUpload}
                  sx={{ px: 4, py: 1, m: 1 }}
                >
                  Upload Presentation
                </Button>
              </Grid>
              <input
                ref={fileInput}
                hidden
                accept="application/vnd.openxmlformats-officedocument.presentationml.presentation, application/pdf"
                type="file"
                onChange={handleUpload}
              />

              {notes.map((note, index) => {
                return (
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      alignContent: "top",
                      justifyContent: "top",
                      m: "10px",
                    }}
                    key={index}
                  >
                    <Card sx={{ width: "70%" }} raised={true}>
                      <CardActionArea
                        onClick={() => (window.location = "/" + note["id"])}
                      >
                        <CardContent>
                          <Typography key={index}>
                            {note["s3key"].split(".")[0]}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}
    </>
  );
}

export default HomePage;
