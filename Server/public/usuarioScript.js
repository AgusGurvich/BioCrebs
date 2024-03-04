console.log('hola');

const btnCargar = document.getElementById('btn-cargar');
const boxCarga = document.querySelector(".cargarSaldo");
const carga = document.getElementById('carga');

btnCargar.style.cssText = 'background-color: black;'


carga.onkeyup = e => {
    
    console.log(e.target.value);
    let nuevaCarga = e.target.value;
    if(e.target.value > 0) { 
        btnCargar.style.cssText = 'background-color: var(--lightBlue);';
    } 
    else {
        btnCargar.style.cssText = 'background-color: var(--thirdty);';
    }

    return nuevaCarga;
}

btnCargar.onclick = e => {


    const nuevaCarga = carga.value;
    console.log(nuevaCarga);

    const url = '/nuevaCarga';

    let data = {
        valor: "chau"    
    }

// var request = new Request(url, {
// 	method: 'PUT',
// 	body: data,
// 	headers: new Headers()
// });

    let fetchData = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers:  {"Content-type": "application/json; charset=UTF-8"}
    }

    fetch(url, fetchData)
    .then(response => response.json())
    .then(json => {
        console.log(json);
        console.log('recibido');
    });

}



