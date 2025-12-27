import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles(() => ({
  focused: {
    "& .MuiInputLabel-root.Mui-focused": {
      color: "black",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "black",
    },
  },
}));