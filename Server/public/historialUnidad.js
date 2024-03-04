console.log('holaaa');
        const btnDescarga = document.getElementById('Descargar');
        const estado = document.querySelector('.estado');
        const estadoPago = document.querySelector('.estadoPago');

    
    //Configuraciones de Colores bandera
        btnDescarga.onclick = (e) => {
            e.target.style.cssText = 'background-color: var(--lightBlue); color: var(--fondo);'
        }

        if(estado.textContent == 'Pendiente') {
        estado.style.cssText = "background-color: var(--red);";
        }
        if(estado.textContent == 'Listo') {
            estado.style.cssText = "background-color: var(--lightBlue);";
        }

        if(estadoPago.textContent == 'No abonado') {
            estadoPago.style.cssText = "background-color: var(--red);";
        }
        if(estadoPago.textContent == 'Abonado') {
            estadoPago.style.cssText = "background-color: var(--lightBlue);";
        }

    //Configuracion de Boton Pagar
        const pagar = document.getElementById('pagar');

        if(estadoPago.textContent == 'No abonado') {
    
            pagar.textContent = "Abonado Presencial";
            pagar.style.cssText = "background-color: var(--lightBlue); color: var(--fondo);";
        }
    
        
        if(estadoPago.textContent == 'Abonado') {
            pagar.textContent = "Ya abonado!";
            pagar.style.cssText = "background-color: var(--verde);";
        }


        //Gestionar Pago
            //Pedir saldo y precio
            console.log('RE');
            console.log(document.getElementById('pedidoID'));
            const precioLink = "";
            const saldoLink = ""; 


        pagar.onclick = (e) => {
        
            const bandera = e.target.textContent;
            const pedido = document.getElementById('pedidoID');
            const pedidoID = pedido.textContent;
            if(bandera == "Abonado Presencial") {
            
                const url = `/abonarPedidoPresencial/${pedidoID}`;
                let data = {
                    id:pedidoID
                }

                let fetchData = {
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers:  {"Content-type": "application/json; charset=UTF-8"}
                }

            fetch(url, fetchData)
            .then(response =>   window.location.href = `/Dashpedido/${pedidoID}`)
                    
            }

            else {
                e.target.style.cssText = "background-color: black;"
            }

            console.log(bandera);
        }

        //Gestionar Cambio de Precio

