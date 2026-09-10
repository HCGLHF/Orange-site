"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Minus, Plus, X } from "lucide-react";
import type { Fabric } from "@/lib/data";
import { fabricCollections, formatFabricMeasurement, getFabricCollectionId } from "@/lib/fabric-collections";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { RequestQuoteButton } from "@/components/RequestQuoteButton";
import { useCollectionMotion } from "./useCollectionMotion";

export function ArticleDialog({ fabric, onClose }: { fabric: Fabric | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);
  const [feedback, setFeedback] = useState("");
  const { addItem, removeItem, isSelected } = useInquiryCart();
  const animate = useCollectionMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!fabric || !dialog) return;
    closing.current = false;
    setFeedback("");
    dialog.showModal();
    animate(dialog, [{ opacity: .3, transform: "translateY(14px) scale(.985)" }, { opacity: 1, transform: "none" }], 300);
    return () => {
      dialog.getAnimations?.().forEach((animation) => animation.cancel());
      dialog.close();
    };
  }, [fabric, animate]);

  const close = async () => {
    const dialog = dialogRef.current;
    if (!dialog || closing.current) return;
    closing.current = true;
    dialog.classList.add("is-closing");
    dialog.getAnimations?.().forEach((animation) => animation.cancel());
    await animate(dialog, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(8px)" }], 170);
    dialog.classList.remove("is-closing");
    dialog.close();
  };
  const collection = fabricCollections.find((item) => item.id === (fabric && getFabricCollectionId(fabric)));
  const selected = !!fabric && isSelected(fabric.id);

  return <dialog ref={dialogRef} className="article-dialog" aria-labelledby="article-dialog-title"
    onClose={onClose}
    onCancel={(event) => { event.preventDefault(); void close(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) void close();
    }}>
    {fabric && <>
      <div className="dialog-top"><p className="section-label">{collection?.shortName}</p><button type="button" className="close-button" aria-label="Close article details" onClick={() => void close()}><X className="icon" aria-hidden /></button></div>
      <h2 id="article-dialog-title">{fabric.articleNumber || fabric.name}</h2>
      <p className="detail-series">{fabric.series}</p>
      <dl className="detail-specs">
        <div><dt>Composition</dt><dd>{fabric.composition}</dd></div>
        <div><dt>Weight</dt><dd>{formatFabricMeasurement(fabric, "weight")}</dd></div>
        <div><dt>Usable width</dt><dd>{formatFabricMeasurement(fabric, "width")}</dd></div>
        <div><dt>Construction</dt><dd>Finished knit</dd></div>
      </dl>
      <p className="detail-note">Use this article as a reference for your sample inquiry. Confirm colour, finish, quantity and testing requirements with the sourcing team.</p>
      <button type="button" className="button-primary detail-action" aria-pressed={selected} aria-label={`${selected ? "Remove" : "Add"} ${fabric.articleNumber} ${selected ? "from" : "to"} sample selection`}
        onClick={() => {
          if (selected) removeItem(fabric.id); else addItem(fabric);
          setFeedback(`${fabric.articleNumber} ${selected ? "removed from" : "added to"} sample selection`);
        }}>
        {selected ? "Remove from sample selection" : "Add to sample selection"}{selected ? <Minus className="icon" aria-hidden /> : <Plus className="icon" aria-hidden />}
      </button>
      <p className="dialog-feedback" role="status">{feedback && <><Check className="icon" aria-hidden /> {feedback}</>}</p>
      {selected && <RequestQuoteButton className="text-link" onBeforeOpen={() => dialogRef.current?.close()}>Review sample selection <ArrowUpRight className="icon" aria-hidden /></RequestQuoteButton>}
    </>}
  </dialog>;
}
