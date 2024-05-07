import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CustomInput from "./CustomInput";
import Button from "@mui/material/Button";

export default function ChatHistoryDialog(props: any) {

  return (
    <Dialog open={props.open} onClose={props.onhandleClose}>
      <DialogTitle>Chat History</DialogTitle>
    </Dialog>
  );
}