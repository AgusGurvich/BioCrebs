const estado = document.querySelectorAll('.estado');
const estadoPago = document.querySelectorAll('.estadoPago');
const archivos = document.querySelectorAll('.nombre_archivo');

archivos.forEach( archivo => {
    archivo.onclick = (e) => {   
        e.target.style.cssText = 'background-color: var(--Blue); color: var(--fondo);'

    }
})


// console.log(document.querySelectorAll('#estadoPago'));

estadoPago.forEach(estado => {

    if(estado.textContent == 'No abonado') {
        estado.style.cssText = "background-color: var(--red);";
    }
    if(estado.textContent == 'Abonado') {
        estado.style.cssText = "background-color: var(--thirdty);";
    }
});

estado.forEach(estado => {

    if(estado.textContent == 'Pendiente') {
        estado.style.cssText = "background-color: var(--red);";
    }
    if(estado.textContent == 'Listo') {
        estado.style.cssText = "background-color: var(--thirdty);";
    }
});