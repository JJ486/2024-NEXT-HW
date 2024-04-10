import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import { Grid } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CustomInput from "./CustomInput";
import Cookies from "js-cookie";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useRouter } from "next/router";
import { CHANGE_INFO_SUCCESS} from "../constants/string";
import sha256 from "../utils/sha256";

export default function SettingsCard(props: any) {
  const router = useRouter();

  const [user, setUser] = useState({
    username: "",
    nickname: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    setUser({
      username: props.username,
      nickname: props.nickname,
      phone: props.phone,
      email: props.email,
    });
  }, [props]);

  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newNickName, setNewNickName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setNewPasswordAgain("");
    setNewUserName("");
    setNewNickName("");
    setNewPhone("");
    setNewEmail("");
    setOpen(false);
    setOpen(false);
  };

  const handleNicknameChange = (newNickName: string) => {
    props.onNicknameChange(newNickName);
  };

  const handleSubmit = () => {
    if (oldPassword === "") {
      alert("Please enter your old password.");
      return;
    }
    if (newPassword !== newPasswordAgain) {
      alert("New passwords do not match.");
      setNewPassword("");
      setNewPasswordAgain("");
      return;
    }
    const requestBody = {
      old_password: sha256(oldPassword),
      password: newPassword === "" ? "" : sha256(newPassword),
      email: newEmail,
      phone: newPhone,
      nickname: newNickName,
      username: newUserName,
    };
    const header = new Headers();
    const jwtToken = Cookies.get("jwt_token");
    if (jwtToken) {
      header.append("authorization", jwtToken);
    }
    else {
      router.push(`/SignIn`);
    }
    fetch(`/api/chat/change_userinfo`, {
      method: "POST",
      headers: header,
      body: JSON.stringify(requestBody),
    })
    .then((res) => res.json())
    .then((res) => {
      if (Number(res.code) === 0) {
        alert(((newUserName !== "" && newUserName !== user.username)? newUserName: user.username) + CHANGE_INFO_SUCCESS);
        if (newUserName !== "" && newUserName !== user.username) {
          Cookies.remove("jwt_token");
          router.push(`/SignIn`);
        }
        setUser({
          username: (newUserName !== "" && newUserName !== user.username)? newUserName: user.username,
          nickname: (newNickName !== "" && newNickName !== user.nickname)? newNickName: user.nickname,
          phone: (newPhone !== "" && newPhone !== user.phone)? newPhone: user.phone,
          email: (newEmail !== "" && newEmail !== user.email)? newEmail: user.email,
        });
        handleNicknameChange(newNickName);
      }
      else {
        alert(res.info);
      }
    })
    .catch((error) => {
      alert(error.info);
    });
    setOldPassword("");
    setNewPassword("");
    setNewPasswordAgain("");
    setNewUserName("");
    setNewNickName("");
    setNewPhone("");
    setNewEmail("");
    setOpen(false);
  };

  const handleClickBack = () => {
    router.push(`/Chatroom`);
  };

  return (
    <Card variant="outlined" sx={{ height: "100%", width: "100%" }}>
      {/* TABS */}
      <br></br>
      <Tabs
        textColor="secondary"
        indicatorColor="secondary"
      >
        <Tab value="one" label="Account" />
      </Tabs>
      <Divider></Divider>

      {/* MAIN CONTENT CONTAINER */}
      <form>
        <CardContent
          sx={{
            p: 3,
            maxHeight: { md: "40vh" },
            textAlign: { xs: "center", md: "start" }
          }}
        >
          {/* FIELDS */}
          <FormControl fullWidth>
            <Grid
              container
              direction={{ xs: "column", md: "row" }}
              columnSpacing={5}
              rowSpacing={3}
            >
              {/* FIRST NAME */}
              <Grid component="form" item xs={6}>
                <CustomInput
                  id="userName"
                  name="userName"
                  value={props.username}
                  title="User Name"
                  InputProps={{ readOnly: true }}
                ></CustomInput>
              </Grid>

              {/* FIRST NAME */}
              <Grid component="form" item xs={6}>
                <CustomInput
                  id="nickName"
                  name="nickName"
                  value={user.nickname}
                  title="Nick Name"
                  InputProps={{ readOnly: true }}
                ></CustomInput>
              </Grid>

              {/* PHONE */}
              <Grid item xs={6}>
                <CustomInput
                  id="phone"
                  name="phone"
                  value={user.phone}
                  title="Phone Number"
                  InputProps={{ readOnly: true }}
                ></CustomInput>
              </Grid>

              {/* EMAIL */}
              <Grid item xs={6}>
                <CustomInput
                  id="email"
                  name="email"
                  value={user.email}
                  title="Email Address"
                  InputProps={{ readOnly: true }}
                ></CustomInput>
              </Grid>

              {/* BUTTON */}
              <Grid
                container
                justifyContent={{ xs: "center", md: "flex-end" }}
                item
                xs={10}
                sx={{ marginLeft: "auto", marginRight: "15px" }}
              >
                <Button
                  sx={{ width: "100px", height: "45px", my: 2 }}
                  component="button"
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={handleClickOpen}
                >
                  Edit
                </Button>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Edit Information</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Please enter new information:<br />
                      You must enter your old password for Identity Verification.
                    </DialogContentText>
                    <CustomInput
                      id="oldPassword"
                      name="oldPassword"
                      value={oldPassword}
                      req={true}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                      type="password"
                      title="Old Password"
                      autoFocus
                    ></CustomInput>
                    <CustomInput
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                      type="password"
                      title="New Password"
                      autoFocus
                    ></CustomInput>
                    <CustomInput
                      id="newPasswordAgain"
                      name="newPasswordAgain"
                      value={newPasswordAgain}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPasswordAgain(e.target.value)}
                      type="password"
                      title="New Password Again"
                      autoFocus
                    ></CustomInput>
                    <CustomInput
                      id="newUserName"
                      name="newUserName"
                      value={newUserName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserName(e.target.value)}
                      title="New User Name"
                      autoFocus
                    ></CustomInput>
                    <CustomInput
                      id="newNickName"
                      name="newNickName"
                      value={newNickName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNickName(e.target.value)}
                      title="New Nick Name"
                      autoFocus
                    ></CustomInput>
                    <CustomInput
                      id="newPhone"
                      name="newPhone"
                      value={newPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhone(e.target.value)}
                      title="New Phone"
                      autoFocus
                    ></CustomInput>
                    <CustomInput
                      id="newEmail"
                      name="newEmail"
                      value={newEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                      title="New Email"
                      autoFocus
                    ></CustomInput>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">
                      Submit
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
              <Grid
                container
                justifyContent={{ xs: "center", md: "flex-end" }}
                item
                xs={1}
                sx={{ marginLeft: "auto", marginRight: "15px" }}
              >
                <Button
                  sx={{ width: "100px", height: "45px", my: 2 }}
                  component="button"
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={handleClickBack}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          </FormControl>
        </CardContent>
      </form>
    </Card>
  );
}
