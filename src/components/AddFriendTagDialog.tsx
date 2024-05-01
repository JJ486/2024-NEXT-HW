import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CustomInput from "./CustomInput";
import Button from "@mui/material/Button";

export default function AddFriendTagDialog(props: any) {
  return (
    <Dialog open={props.open} onClose={props.onhandleAddFriendTagClose}>
      <DialogTitle>Add Friend Tag</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter tag to add friend tag:
        </DialogContentText>
        <CustomInput
          id="friendTag"
          name="friendTag"
          value={props.friendTag}
          req={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setFriendTag(e.target.value)}
          type="friendTag"
          title="Friend Tag"
          autoFocus
        ></CustomInput>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onhandleAddFriendTagClose}>Cancel</Button>
        <Button onClick={props.onhandleAddFriendTag} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}