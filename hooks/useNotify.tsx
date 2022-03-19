import makeStyles from "@mui/styles/makeStyles";
import LaunchIcon from "@mui/material/Icon";
import Link from "@mui/material/Link";
import { useSnackbar, VariantType } from "notistack";
import { useCallback } from "react";

const useStyles = makeStyles({
  notification: {
    display: "flex",
    alignItems: "center",
  },
  link: {
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    marginLeft: 16,
    textDecoration: "underline",
    "&:hover": {
      color: "#000000",
    },
  },
  icon: {
    fontSize: 20,
    marginLeft: 8,
  },
});

export function useNotify() {
  const styles = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const cluster = process.env.NEXT_PUBLIC_RPC_URL ? "devnet" : "custom";

  return useCallback(
    (variant: VariantType, message: string, signature?: string) => {
      enqueueSnackbar(
        <span className={styles.notification}>
          {message}
          {signature && (
            <Link
              className={styles.link}
              href={`https://explorer.solana.com/tx/${signature}?cluster=${cluster}`}
              target="_blank"
            >
              Transaction
              <LaunchIcon className={styles.icon} />
            </Link>
          )}
        </span>,
        { variant },
      );
    },
    [enqueueSnackbar, styles, cluster],
  );
}
