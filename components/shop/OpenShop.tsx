import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PasswordInput from "./PasswordInput";
import { useStore } from "../../store";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNotify, useProvider } from "../../hooks";
import { Dialog } from "@mui/material";

const OpenShop = () => {
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const store = useStore();
  const provider = useProvider();

  const handleNext = async () => {
    try {
      setLoading(true);
      if (!store.hashedPassword) {
        throw new Error("Password must be at least one character long");
      }
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      if (!signMessage) {
        throw new Error("Wallet does not support signing. ");
      }
      await store.signHashedPassword(publicKey, signMessage);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (error: any) {
      notify("error", `Signing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (!publicKey || !provider) {
        throw new Error("Wallet not connected");
      }
      if (!store.signerKeypair) {
        throw new Error("Step 1 not completed");
      }
      const tx = await store.openShopTx(provider);
      const txid = await sendTransaction(tx, provider.connection);
      notify("info", "Open shop transaction sent: ", txid);

      await provider.connection.confirmTransaction(txid, "confirmed");
      notify("success", "Transaction successful! ", txid);
      store.setView(null);
    } catch (error: any) {
      notify("error", `Open shop failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const steps = [
    {
      label: "Create password",
      element: (
        <>
          <div style={{"margin": "15px 5px"}}>
            Create a password of your choosing. This password and your signature will be used to
            create a signer account.
          </div>
          <PasswordInput />
        </>
      ),
    },
    {
      label: "Open shop",
      element: (
        <>
          <div>This is a one time transaction to open your shop.</div>
        </>
      ),
    },
  ];

  return (
    <Dialog
      onClose={() => {
        store.setView(null);
      }}
      open={store.view === "openshop"}
    >
      <Box sx={{width: 500, padding: 1.5}}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography component={"span"}>{step.element}</Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={() => (index === steps.length - 1 ? handleConfirm() : handleNext())}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {index === steps.length - 1 ? "Confirm" : "Sign & Continue"}
                    </Button>
                    <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Dialog>
  );
};

export default OpenShop;
