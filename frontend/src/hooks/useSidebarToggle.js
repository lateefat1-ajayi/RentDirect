import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Open by default on desktop, closed on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const setByMQ = () => setIsOpen(mq.matches);
    setByMQ();
    mq.addEventListener?.("change", setByMQ);
    return () => mq.removeEventListener?.("change", setByMQ);
  }, []);

  // Close on route change (useful on mobile)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) setIsOpen(false);
  }, [location.pathname]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock scroll when open on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Outside click (mobile)
  useEffect(() => {
    const onClick = (e) => {
      const mq = window.matchMedia("(max-width: 767px)");
      if (!mq.matches) return; // only care on mobile
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((s) => !s);

  return { isOpen, open, close, toggle, sidebarRef };
}
