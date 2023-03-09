import React from "react";
import {
  Modal,
  Box,
  Grid,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import OtpInput from "react-otp-input";

function LoginModal(props) {
  const [step, setStep] = React.useState("phone");
  const [otp, setOtp] = React.useState("");
  const [newCodeBtn, setNewCodeBtn] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const [alertText, setAlertText] = React.useState("");

  const onPhoneSubmit = React.useCallback(() => {
    setStep("loading");
    const phoneRegex = /^\+[1-9]\d{10,14}$/;
    let phone = props.phone;
    if (phone?.match(phoneRegex)) {
      const url =
        "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/sendPhoneCode";
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      };
      fetch(url, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          setStep("otp");
        })
        .catch((err) => {
          setStep("phone");
          setAlertText("Unknown error");
          setAlert("error");
          console.log(err.message);
        });
    } else {
      setStep("phone");
      setAlertText("Enter a valid US phone number");
      setAlert("error");
    }
  }, [props.phone]);

  const onOtpSubmit = React.useCallback(() => {
    setStep("loading");
    let phone = props.phone;
    if (otp.length === 4) {
      const url =
        "https://jego7yc194.execute-api.us-west-2.amazonaws.com/Stage/checkPhoneCode";
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp: otp }),
      };
      fetch(url, requestOptions)
        .then((response) => {
          if (response.status === 401) {
            setStep("otp");
            setAlertText("Code not submitted within 5 minutes");
            setAlert("error");
          } else if (response.status === 403) {
            setStep("otp");
            setAlertText("Incorrect code");
            setAlert("error");
          } else {
            props.onLogin();
            props.onClose();
            setStep("phone");
          }
          setOtp("");
        })
        .catch((err) => {
          setStep("otp");
          setAlertText("Unknown error");
          console.log(err.message);
        });
    } else {
      setAlertText("Enter the four digit code sent to your phone number");
      setAlert("error");
    }
  }, [props, otp]);

  React.useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => setNewCodeBtn(true), 15000)
    } else {
      setNewCodeBtn(false)
    }
  }, [step])

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          outline: "none",
          height: "auto",
          minHeight: "300px",
          width: "80%",
          maxWidth: "560px",
          bgcolor: "background.default",
          py: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 4 },
          boxShadow: 24,
          border: "2px solid #000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
        {step === "phone" && (
          <>
            <form
              height="auto"
              onKeyDown={(e) => {
                e.key === "Enter" && onPhoneSubmit();
              }}
            >
              <Grid
                container
                spacing={{xs: 2, sm: 4}}
                sx={{
                  height: "100%",
                  flexDirection: "row",
                  flexGrow: 1,
                  alignContent: "space-between",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  p: 3,
                }}
              >
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5">
                    You must be logged in to use SlideNotes
                  </Typography>
                  <Typography>
                    Enter your phone number below for a one time code
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <PhoneInput
                      country={"us"}
                      onlyCountries={["us"]}
                      value={props.phone}
                      onChange={(value) => props.onPhoneChange("+" + value)}
                      specialLabel={""}
                      inputStyle={{ width: "100%" }}
                      countryCodeEditable={false}
                    />
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={() => onPhoneSubmit()}
                    variant="outlined"
                    color="secondary"
                    sx={{ width: { xs: "49%", sm: "50%" } }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </>
        )}
        {step === "otp" && (
          <>
            <form
              onKeyDown={(e) => {
                e.key === "Enter" && onOtpSubmit();
              }}
            >
              <Grid
                container
                columnSpacing={0}
                rowSpacing={{xs: newCodeBtn ? 2 : 4, sm: 4}}
                sx={{
                  height: "100%",
                  flexDirection: "row",
                  flexGrow: 1,
                  alignContent: "space-between",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  p: 3,
                }}
              >
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography>Enter your one time code below</Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      isInputNum={true}
                      inputStyle={{
                        width: "10vmin",
                        height: "10vmin",
                        fontSize: "20px",
                      }}
                      containerStyle={{ width: "auto", height: "auto" }}
                    />
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={newCodeBtn ? 6 : 12}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={() => onOtpSubmit()}
                    variant="outlined"
                    color="secondary"
                    sx={{ width: { xs: "60%", sm: newCodeBtn ? "85%" : "60%" } }}
                  >
                    Submit
                  </Button>
                </Grid>
                {newCodeBtn && <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={() => onPhoneSubmit()}
                    variant="outlined"
                    color="secondary"
                    sx={{ width: { xs: "60%", sm: "85%" } }}
                  >
                    Send New Code
                  </Button>
                </Grid>}
              </Grid>
            </form>
          </>
        )}
        {step === "loading" && (
          <>
            <CircularProgress color="secondary" />
          </>
        )}
      </Box>
    </Modal>
  );
}

export default LoginModal;
