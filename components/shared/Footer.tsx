import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span id={styles.creator}>Made by regohiro.sol</span>
    </footer>
  );
};

export default Footer;
