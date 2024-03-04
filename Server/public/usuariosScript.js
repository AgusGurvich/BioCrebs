


console.log('hola');

const searchContainer = document.querySelector('.search-input-box');
const inputSearch = searchContainer.querySelector('input');
const boxSuggestions = document.querySelector('.container-suggestions');

const searchLink = document.getElementById('buscar');
const url = 'http://localhost:4000/usuariosFetch';
function select(element) {
	let selectUserData = element.textContent;
	inputSearch.value = selectUserData;

	searchLink.href = `/usuario/${inputSearch.value}`;
	searchContainer.classList.remove('active');
}

fetch(url)
.then((resp) => resp.json())
.then(function(data) {
    console.log(data);
    
    let suggestions = [];

    data.forEach((usuario) => {
        console.log(usuario.DNI);

        suggestions.push(usuario.DNI.toString());
    });


console.log(suggestions);


inputSearch.onkeyup = e => {
	let userData = e.target.value;
	let emptyArray = [];

	if (userData) {
		emptyArray = suggestions.filter(data => {
			return data
				.toLocaleLowerCase()
				.startsWith(userData.toLocaleLowerCase());
		});

		emptyArray = emptyArray.map(data => {
			return (data = `<li>${data}</li>`);
		});
		searchContainer.classList.add('active');
		showSuggestions(emptyArray);

		let allList = boxSuggestions.querySelectorAll('li');

		allList.forEach(li => {
			li.setAttribute('onclick', 'select(this)');
           
        });
	} else {
		searchContainer.classList.remove('active');
	}
};

function select(element) {
	let selectUserData = element.textContent;
	inputSearch.value = selectUserData;

	searchLink.href = `/usuario/${inputSearch.value}`;
	searchContainer.classList.remove('active');
}

const showSuggestions = list => {
	let listData;

	if (!list.length) {
		userValue = inputSearch.value;
		listData = `<li>${userValue}</li>`;
	} else {
		listData = list.join(' ');
	}
	boxSuggestions.innerHTML = listData;
};
        

});







// let suggestions = [
// 	'Youtube',
// 	'Desarrollador Web',
// 	'Diseñador Web',
// 	'Formularios con HTML y CSS',
// 	'Crear un canal en Youtube',
// 	'Dinero en la programación',
// 	'Programación en Python',
// 	'Desarrollo Frontend',
// 	'Desarrollo Backend',
// 	'Rest api con Nodejs',
// 	'Como crear un blog con Django',
// 	'Como crear un sitio web responsive',
// 	'Como consumir una api con React',
// 	'Aprender React desde cero',
// 	'Aprender Css desde cero',
// 	'Aprender Html desde cero',
// 	'Como convertirse en programador rapidamente',
// 	'Aprender python desde cero',
// ];