import { exec } from "kernelsu";

const confirmIcon = `
<svg t="1765024984833" class="icon" viewBox="0 0 1024 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" p-id="11417" id="mx_n_1765024984835" width="25" height="25">
    <path
        d="M413.243 806.833a40.913 40.913 0 0 1-28.924-11.984L73.985 484.475c-15.98-15.98-15.98-41.888 0-57.848 15.98-15.98 41.888-15.98 57.848 0l281.41 281.449 478.923-478.924c15.961-15.98 41.889-15.98 57.85 0 15.979 15.98 15.979 41.868 0 57.848L442.167 794.849a40.915 40.915 0 0 1-28.924 11.984z"
        p-id="11418" fill="#000000bb"></path>
</svg>`;
const deleteIcon = `
<svg t="1763030250410" class="icon" viewBox="0 0 1024 1024" version="1.1"
    xmlns="http://www.w3.org/2000/svg" p-id="1270" width="30" height="30">
    <path
        d="M828.9 317.1H195.1c-12.9 0-22.9 11.4-21.1 24.2l73 522.3c5.2 42.8 41.6 75.1 84.7 75.1h360.8c43.2 0 79.5-32.2 84.7-75.1l73-522.3c1.6-12.8-8.4-24.2-21.3-24.2zM722 856.9c-1.8 15-14.6 26.3-29.6 26.3H331.6c-15.1 0-27.8-11.3-29.8-27.3l-67.5-483.3h555.4L722 856.9z"
        p-id="1271" fill="#000000bb"></path>
    <path
        d="M398.9 478.6h55.5v298.7h-55.5zM569.6 478.6h55.5v298.7h-55.5zM701 193.2l-30.1-71c-7.6-17.9-25.4-29.5-45.3-29.5H398.4c-19.9 0-37.7 11.6-45.3 29.5l-30.1 71H128v55.5h768v-55.5H701z m-298.6-45.1h219.3l19.1 45.1H383.2l19.2-45.1z"
        p-id="1272" fill="#000000bb"></path>
</svg>`;

const csvDir = "/data/adb/frame_tracker/csv";
const deleteButtons = document.querySelectorAll(".delete-action");
const cancelButtons = document.querySelectorAll(".record-info-card-link");
document.addEventListener("click", function(e) {
    const deleteBtn = e.target.closest(".delete-action");
    if (deleteBtn) {
        e.preventDefault();
        if (deleteBtn.classList.contains("will-delete")) {
            const linkBtn = deleteBtn.parentElement.querySelector(".record-info-card-link");
            const href = linkBtn.getAttribute("href");
            const url = href.substring(href.lastIndexOf("/") + 1, href.lastIndexOf("."));
            exec(`rm -f "${csvDir}/${url}.csv"`).catch(error => {
                console.error("Delete csv failed: ", error);
            });
            deleteBtn.parentElement.remove();
        } else {
            deleteBtn.classList.add("will-delete");
            deleteBtn.innerHTML = confirmIcon;
        };
        return;
    };
    const linkBtn = e.target.closest(".record-info-card-link");
    if (linkBtn) {
        const parentCard = linkBtn.parentElement;
        const siblingDeleteBtn = parentCard ? parentCard.querySelector(".delete-action") : null;
        if (siblingDeleteBtn && siblingDeleteBtn.classList.contains("will-delete")) {
            e.preventDefault();
            siblingDeleteBtn.classList.remove("will-delete");
            siblingDeleteBtn.innerHTML = deleteIcon;
        };
    };
});
