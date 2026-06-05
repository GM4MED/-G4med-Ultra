// cadastro-siglas.js

const statusButtons = document.querySelectorAll(".status");

statusButtons.forEach(button => {

    button.addEventListener("click", () => {

        statusButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

    });

});