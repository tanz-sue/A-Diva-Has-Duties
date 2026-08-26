/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                cream: "#F7EFDA",
                butter: "#F0D998",
                "butter-dark": "#E4C878",
                skyfog: "#AFC8E6",
                ink: "#2B2620",
                darkskyfog: "#7390BC",
            },
            fontFamily: {
                display: ["'Playfair Display'", "serif"],
                body: ["'EB Garamond'", "serif"],
            },
            backgroundImage:{
                "diva-gradient": "linear-gradient(180deg, #F7EFDA 0%, #DCE7F2 55%, #A9C6E8 100%)",
            },
        },
    },
    plugins: []
};