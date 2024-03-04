const header = document.querySelector("header");

window.addEventListener("scroll", function(){

    header.classList.toggle ("sticky", this.window.scrollY > 0)
}); 

let element = document.querySelector("#element");
let menu = document.querySelector("#menu-icon");
let navMenu = document.querySelector("#nav__menu");

menu.addEventListener("click", ()=>{
    element.classList.toggle('fa-x');
    element.classList.toggle('fa-bars');

        navMenu.classList.toggle('open');
   
})