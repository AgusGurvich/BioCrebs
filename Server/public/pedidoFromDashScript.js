const create = str => document.createElement(str);
const files = document.querySelectorAll('.fancy-file');
const img = document.getElementById('img');
const defaultFile = 'folder-icon.webp';
let bandera = 0;
let banderaLink = false;
const precio_copia = document.getElementById('precio_copia');
const precio_total = document.getElementById('precio_total');
const calculadora = document.getElementById('calculadora');
const simpleFaz = 30;
const dobleFaz = 32.5;



// Para que no envíe automátiocamente el formulario
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('input[type=number]').forEach( node => node.addEventListener('keypress', e => {
            if(e.keyCode == 13) {
                e.preventDefault();
            }
            }))
        });


// Para decorar el input File
        Array.from(files).forEach(
            f => {
                const label = create('label');
                const span_text = create('span');
                const span_name =create('span');
                const span_button = create('span');

                label.htmlFor = f.id;

                span_text.className = 'fancy-file__fancy-file-name';
                span_button.className = 'fancy-file__fancy-file-button';

                span_name.innerHTML = f.dataset.empty || 'Ningun archivo seleccionado';
                span_button.innerHTML = f.dataset.button || 'Buscar';

                label.appendChild(span_text);
                label.appendChild(span_button);
                span_text.appendChild(span_name);
                f.parentNode.appendChild(label);

                span_name.style.width = (span_text.clientWidth - 20)+'px';

                // Para la previsualización

                f.addEventListener('change', e => {
                    if( f.files.length == 0 ){
                        span_name.innerHTML = f.dataset.empty ||'Ningún archivo seleccionado';
                        img.src = defaultFile;
                        bandera = 0;
                    }else if( f.files.length > 1 ){
                        bandera = 1;
                        span_name.innerHTML = f.files.length + ' archivos seleccionados';
                        
                        const reader = new FileReader();
                            reader.onload = function ( e ){
                                img.src = e.target.result;
                            }
                            reader.readAsDataURL(e.target.files[0]);
                    
                    }else{
                        bandera = 1;
                        span_name.innerHTML = f.files[0].name;

                        if(f.files[0].type == "application/pdf"){
                                img.type = "application/pdf";
                                img.src = URL.createObjectURL(f.files[0]);
                                console.log(e.target.files[0].type);
                            }
                        else {
                            const reader = new FileReader();
                            reader.onload = function ( e ){
                                img.src = e.target.result;
                            }
                            reader.readAsDataURL(e.target.files[0]);
                            console.log(e.target.files[0].type);
                        }
                    }
                } );   
            }
        );


//Calculadora del Usuario

        calculadora.addEventListener("click",  () => {
            
            // calculadora.style.cssText = "background-color: black;";

            let copias = document.getElementById('copias').value;

            let faz = document.getElementById('Faz').value;

            let paginas = document.getElementById('paginas').value;
        
            let resultadoCopia = "Falta llenar campos";
            let resultadoTotal = "Falta llenar campos";

            if(faz != "value0" && copias && paginas) {
                console.log("Afirmativo");
                console.log("Todos los campos están llenos");

                if(faz == "Simple") {
                    let resultadoCopia = paginas * simpleFaz;
                    let resultadoTotal = paginas * simpleFaz * copias;
                    precio_copia.innerHTML = "$" +resultadoCopia;
                    precio_total.innerHTML = "$" + resultadoTotal;
                }
                else {
                    let resultadoCopia = paginas * dobleFaz;
                    const resultadoTotal = paginas * dobleFaz * copias;
                    precio_copia.innerHTML = "$" + resultadoCopia;
                precio_total.innerHTML = "$" + resultadoTotal;
                }
            }
            else {
                
                precio_copia.innerHTML = resultadoCopia;
                precio_total.innerHTML = resultadoTotal;
            }
        })




// Mandar el Formulario

        const form = document.getElementById('form_areas');

        form.onsubmit = async (e) => {
            e.preventDefault();
            
            let anillado = document.getElementById('Anillado').value;
            let Tipo = document.getElementById('Tipo').value;
            let copias = document.getElementById('copias').value;
            let faz = document.getElementById('Faz').value;
            let paginas = document.getElementById('paginas').value;
            
            banderaLink = bandera2(document.getElementById('Link').value);
            let resultadoTotal = 20;


            if(faz != 'value0' && Tipo != 'value0' && anillado != 'value0' && (bandera || banderaLink) && copias && paginas){
                let formData = new FormData(form);
                formData.append("precio", resultadoTotal);
                let response = await fetch('/pedidoFromDash', {
                    method: 'POST',
                    body: formData
                });
                console.log(formData);
                window.location.href = "/dashboard";
            }
            else {
                alert('Faltan campos por llenar');
            }

        };


    // Calculadora del Sistema

        function calcularPrecioTotal () {
            let anillado = document.getElementById('Anillado').value;
            let copias = document.getElementById('copias').value;
            let faz = document.getElementById('Faz').value;
            let paginas = document.getElementById('paginas').value;

      


            if(anillado == "Anillado") {
                if(faz == "Simple") {
                    const precio = paginas * copias * simpleFaz;
                    
                }
            
            }



            const precio = 20;
            return precio;
        }

        function calcularAnillado () {

            let paginas = document.getElementById('paginas').value;
            const tapas = 500;
            
        


            let precioAnillado = 20;

            return precioAnillado
        }

        function bandera2 (enlace) {
            let comprobante = "https://drive.google.com";
            
            let bandera = enlace.includes(comprobante);

            return bandera
        }

        //https://drive.google.com