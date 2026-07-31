"use client";

import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ContactCard() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="contact"
      className="cc"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.35 }}
      variants={reduceMotion ? undefined : staggerContainer}
    >
      <div className="cc-inner">
        <motion.div variants={reduceMotion ? undefined : fadeUp} className="cc-header">
          <h2 className="cc-title">
            Request Finished Fabric Samples
          </h2>
          <p className="cc-lead">
            Shaoxing Shicheng Textile Products Co., Ltd. supports overseas
            buyers with finished knit and woven fabric samples, development
            direction and RFQ follow-up.
          </p>
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : staggerContainer} className="cc-grid">
          <motion.a
            variants={reduceMotion ? undefined : fadeUp}
            href="mailto:folenchen0401@outlook.com?subject=Finished%20fabric%20sample%20request&body=Hello%20O'range%20Textile%2C%0A%0AI%20am%20interested%20in%20your%20finished%20knit%20or%20woven%20fabrics."
            className="cc-card cc-card-link"
          >
            <div className="cc-icon cc-icon-orange">
              <Mail className="cc-symbol cc-symbol-orange" />
            </div>
            <div className="cc-card-copy">
              <h3 className="cc-card-title">Email</h3>
              <p className="cc-value cc-value-orange">folenchen0401@outlook.com</p>
              <p className="cc-note">Send a fabric sample request</p>
            </div>
          </motion.a>

          <motion.a
            variants={reduceMotion ? undefined : fadeUp}
            href="https://wa.me/8613867557317"
            target="_blank"
            rel="noopener noreferrer"
            className="cc-card cc-card-link"
          >
            <div className="cc-icon cc-icon-green">
              <MessageCircle className="cc-symbol cc-symbol-green" />
            </div>
            <div className="cc-card-copy">
              <h3 className="cc-card-title">WhatsApp</h3>
              <p className="cc-value cc-value-green">+86 13867557317</p>
              <p className="cc-note">Chat with the sourcing team</p>
            </div>
          </motion.a>

          <motion.a
            variants={reduceMotion ? undefined : fadeUp}
            href="tel:+8613867550307"
            className="cc-card cc-card-link"
          >
            <div className="cc-icon cc-icon-blue">
              <Phone className="cc-symbol cc-symbol-blue" />
            </div>
            <div className="cc-card-copy">
              <h3 className="cc-card-title">Phone</h3>
              <p className="cc-value cc-value-blue">
                +86 13867550307 / +86 13867557317 / +86 13989587635
              </p>
              <p className="cc-note">Business hours in China time</p>
            </div>
          </motion.a>

          <motion.div
            variants={reduceMotion ? undefined : fadeUp}
            className="cc-card"
          >
            <div className="cc-icon cc-icon-purple">
              <MapPin className="cc-symbol cc-symbol-purple" />
            </div>
            <div className="cc-card-copy">
              <h3 className="cc-card-title">Location</h3>
              <p className="cc-value cc-value-gray">Shaoxing Keqiao, Zhejiang</p>
              <p className="cc-note">China</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
          className="cc-footer"
        >
          <p>
            If the inquiry form is unavailable, contact O&apos;range Textile
            directly by email or WhatsApp.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
