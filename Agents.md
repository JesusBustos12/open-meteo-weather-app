## Proyecto
WebApp del tiempo.

## Descripcion del proyecto
Una pagina que tiene como finalidad de mostrar el estado del tiempo de diversas ciudades del mundo atraves de un mapa. Ademas de tener persistencia con el localStorage con respecto a las busquedas de distintas ciudades para mirar el pronostico del tiempo tanto ahora como en las proximas 12/horas. Esto atraves de la comunicasion de una Api externa.

## Rol del agente
Desarrollador web con dos decadas de experiencia.

## Objectivo del proyecto
- Tener una pagina que muestre el pronostico del tiempo de distintas partes del mundo.

## API externa a consumir (sin autentificacion)
https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m

## Stack o tecnologias por emplear
- HTML5
- CSS3 (sin frameworks)
- JavaScript (Vanilla, sin frameworks)

## Funcionalidades del proyecto
- Funcionalidades adicionales:
    - Button o input con efecto deslizante que cambia el tema de todas las paginas del proyecto de la version: lite a la darck y vise-versa.
    - Button o input con efecto deslizante que cambia el idioma predeterminado que es: español a ingles y vise-versa en todas las paginas y aparatados de las mismas.
    - Seccion o icono para editar el perfil del usuario con los campos de registro de sesion.
    - Seccion o icono representativo de cerrar sesion.
    - ¡Importante recordar la persistencia de los datos de las paginas del proyecto en el "localStorage"!

- Busqueda de ciudad:
    - input para buscar la ciudad.
    - Boton para buscar.
    - Mensaje por si la ciudad no existe.
    - Dar sugerencias de ciudades mientras escribimos.

- Clima actual:
    - Nombre de la ciudad.
    - Temperatura actual.
    - Descripcion del clima(nublado, soleado, templado, lluvioso, etc).
    - Icono representativo del tiempo actual.
    - Sensacion termica actual.
    - Humedad.
    - Velocidad del viento.

- Clima por cada horas:
    - Nombre de la ciudad.
    - Temperatura por horas.
    - Descripcion del clima por horas.
    - Icono representativo del clima por horas.
    - Hora.
    - Boton para guardar la ciudad.

- Localidades guardadas:
    - Boton para guardar ciudad o localidad.
    - Boton para eliminar ciudad o localidad.
    - Lista de ciudades o localidades guardadas.
    - Evitar guardar duplicados.


## Preferencia de estilos
- En la carpeta "Proyect" se encuentrar dos carpetas: "Imgs", "Html" donde encotraras los archivos necesarios para emplear los estilos tanto de arquitectura del proyecto como de los estilos esteticos y de distribucion del fornt-end.


## Estilos o estetica del proyecto
- ¡Importante recordar eliminar TailwindCSS y pasarlo a CSS nativo!
- ¡Importante tu peoridad sera la usabilidad del proyecto!
- Colores: Las del apartado de: ## Preferencia de estilos.
- Uso de medidas con “rem” en el css apartir del font-size base de: 10px.
- Uso de html5 y css3 nativos sin “tailwind o frameworks”.
- Usa buenas practicas de maquetacion css como: Grid, flex, flexbox.
- Incluye al principio del css un apartado para los nombres o variables de todas las secciones como: buttons, inputs, contenedores, etc. Para que los colores de la pagina sean mas faciles de manipular.
- La pagina por defecto sera en español.
- La webapp sea responsive.

## Preferencias en el codigo
- No añadas dependencias externas.
- HTML debe de ser semantico.
- No uses alerts, confirm, prompts. Todo el feedBack debe de ser visual ante el DOM.
- No uses innerHTML. En ves de eso usa createElement y appendChild.
- Cuidado con olvidarte de prevenir el default de los eventos: submit, keydown, click.
- Prioriza la escalabilidad, legibilidad y mantenibilidad del proyecto.
- Codigo sensillo de entender con las id y class con nombres descriptivos y cortos.
- Si el agente duda acerca de algo concreto. Puesde preguntarme para encontrar una solucion.
- Persistencia de los datos tanto en la pagina principla como en la del login en el "localStorage".

## Estructura de archivos
- Carpeta (Proyect)
    - Carpeta (Html)
    - Carpeta (Imgs)
- Carpeta (public)
    - Carpeta (assets)
        - Carpeta (css)
            - styles.css
        - Carpeta (Img)
        - Carpeta (js)
            - main.js
    - index.html
- Agents.md