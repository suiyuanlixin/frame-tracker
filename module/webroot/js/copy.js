import { toast } from "kernelsu";

document.addEventListener("DOMContentLoaded", () => {
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                toast("Content copied");
            }).catch(err => {
                console.error("Copy failed: ", err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        };
    };
    function fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            toast("Content copied");
        } catch (err) {
            console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textArea);
    };
    const pathTxts = document.querySelectorAll(".path-txt");
    pathTxts.forEach(el => {
        el.addEventListener("click", () => {
            const text = el.innerText.trim();
            copyText(text);
        });
    });
    const links = document.querySelectorAll(".link-list a");
    links.forEach(link => {
        link.addEventListener("click", () => {
            const url = link.href;
            copyText(url);
        });
    });
});
