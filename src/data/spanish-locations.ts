export interface Province {
  name: string;
  cities: string[];
}

export const SPANISH_PROVINCES: Province[] = [
  {
    name: "Álava",
    cities: ["Vitoria-Gasteiz", "Llodio", "Amurrio", "Salvatierra", "Alegría-Dulantzi", "Labastida", "Oyón", "Laguardia", "Elciego", "Ayala"]
  },
  {
    name: "Albacete", 
    cities: ["Albacete", "Hellín", "Villarrobledo", "Almansa", "Yeste", "Tobarra", "La Roda", "Tarazona de la Mancha", "Caudete", "Chinchilla de Monte-Aragón", "Casas-Ibáñez", "Elche de la Sierra", "Madrigueras", "Munera", "Villatoya", "Alcaraz", "Barrax", "Bonete", "El Ballestero", "Fuentealbilla"]
  },
  {
    name: "Alicante",
    cities: ["Alicante", "Elche", "Torrevieja", "Orihuela", "Benidorm", "Alcoy", "Elda", "Denia", "Villena", "San Vicente del Raspeig", "Petrer", "Calpe", "Altea", "Jávea", "Santa Pola", "Villajoyosa", "Aspe", "Crevillente", "Ibi", "Novelda", "Guardamar del Segura", "Dénia", "Pilar de la Horadada", "San Juan de Alicante", "Mutxamel", "Cocentaina", "Ondara", "Teulada", "Campello", "Almoradí", "Muchamiel", "Cox", "Callosa de Segura", "Dolores", "Rojales", "Formentera del Segura", "Algorfa", "San Fulgencio", "Catral", "Redován", "Granja de Rocamora"]
  },
  {
    name: "Almería",
    cities: ["Almería", "Roquetas de Mar", "El Ejido", "Níjar", "Vícar", "Adra", "Huércal de Almería", "Vera", "Garrucha", "Mojácar", "Cuevas del Almanzora", "Pulpí", "Berja", "Dalías", "Huércal-Overa", "Olula del Río", "Macael", "Carboneras", "Tabernas", "Purchena", "Albox", "Antas", "Cantoria", "Zurgena", "Turre", "Los Gallardos", "Arboleas", "Sorbas", "Canjáyar", "Instinción"]
  },
  {
    name: "Asturias",
    cities: ["Oviedo", "Gijón", "Avilés", "Siero", "Langreo", "Mieres", "Sama de Langreo", "Llanes", "Cangas de Onís", "Villaviciosa", "Llanera", "Castrillón", "Corvera de Asturias", "Noreña", "Las Regueras", "Cudillero", "Carreño", "Gozón", "Ribadesella", "Piloña", "Tineo", "Pravia", "Valdés", "Navia", "Coaña", "El Franco", "Tapia de Casariego", "Castropol", "Vegadeo", "Boal", "Grandas de Salime"]
  },
  {
    name: "Ávila",
    cities: ["Ávila", "Arévalo", "Sotillo de la Adrada", "Las Navas del Marqués", "Piedrahíta", "Candeleda", "Madrigal de las Altas Torres", "Cebreros", "El Barco de Ávila", "Mombeltrán", "Burgohondo", "San Pedro del Arroyo", "Fontiveros", "Lanzahíta", "El Tiemblo", "Casavieja", "Adanero", "Guisando", "Arenas de San Pedro", "Pedro Bernardo"]
  },
  {
    name: "Badajoz",
    cities: ["Badajoz", "Mérida", "Don Benito", "Almendralejo", "Villanueva de la Serena", "Zafra", "Montijo", "Villafranca de los Barros", "Azuaga", "Olivenza", "Jerez de los Caballeros", "Campanario", "Villacañas", "Aceuchal", "Fuente del Maestre", "Ribera del Fresno", "Llerena", "Castuera", "Herrera del Duque", "Fregenal de la Sierra", "Puebla de la Calzada", "Guareña", "Los Santos de Maimona", "Cabeza del Buey", "Santa Marta", "Torremayor"]
  },
  {
    name: "Baleares",
    cities: ["Palma", "Calvià", "Manacor", "Inca", "Llucmajor", "Marratxí", "Ibiza", "Mahón", "Alcúdia", "Pollença", "Felanitx", "Sóller", "Santanyí", "Sa Pobla", "Artà", "Ciutadella de Menorca", "Capdepera", "Campos", "Binissalem", "Petra", "Ses Salines", "Muro", "Andratx", "Santa Margalida", "Valldemossa", "Esporles", "Montuïri", "Porreres", "Sineu", "Vilafranca de Bonany"]
  },
  {
    name: "Barcelona",
    cities: ["Barcelona", "Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Mataró", "Santa Coloma de Gramenet", "Cornellà de Llobregat", "Sant Boi de Llobregat", "Manresa", "Rubí", "Vilanova i la Geltrú", "Viladecans", "Granollers", "Castelldefels", "El Prat de Llobregat", "Cerdanyola del Vallès", "Mollet del Vallès", "Esplugues de Llobregat", "Gavà", "Sant Cugat del Vallès", "Igualada", "Vic", "Sitges", "Reus", "Lleida", "Girona", "Figueres", "Blanes", "Lloret de Mar", "Ripoll", "Berga", "Olesa de Montserrat", "Cardedeu", "Caldes de Montbui", "Sant Adrià de Besòs", "Barberà del Vallès", "Montcada i Reixac", "Sant Feliu de Llobregat", "Ripollet", "Castellar del Vallès", "Pineda de Mar", "Premià de Mar", "El Masnou", "Montgat", "Tiana", "Alella"]
  },
  {
    name: "Burgos",
    cities: ["Burgos", "Aranda de Duero", "Miranda de Ebro", "Villarcayo de Merindad de Castilla la Vieja", "Medina de Pomar", "Briviesca", "Lerma", "Salas de los Infantes", "Espinosa de los Monteros", "Belorado", "Roa", "Melgar de Fernamental", "Castrojeriz", "Covarrubias", "Santo Domingo de Silos", "Oña", "Frías", "Valle de Mena", "Condado de Treviño", "Pradoluengo"]
  },
  {
    name: "Cáceres",
    cities: ["Cáceres", "Plasencia", "Navalmoral de la Mata", "Coria", "Trujillo", "Miajadas", "Arroyo de la Luz", "Casar de Cáceres", "Valencia de Alcántara", "Moraleja", "Jaraíz de la Vera", "Alcántara", "Guadalupe", "Hervás", "Cabezuela del Valle", "Montehermoso", "Torrejoncillo", "Malpartida de Cáceres", "Talayuela", "Villanueva de la Vera", "Aldeanueva del Camino", "Serradilla", "Brozas", "Logrosán", "Garrovillas de Alconétar"]
  },
  {
    name: "Cádiz",
    cities: ["Cádiz", "Jerez de la Frontera", "Algeciras", "San Fernando", "La Línea de la Concepción", "Sanlúcar de Barrameda", "Chiclana de la Frontera", "Puerto Real", "El Puerto de Santa María", "Arcos de la Frontera", "Rota", "Barbate", "Conil de la Frontera", "Tarifa", "Medina-Sidonia", "Olvera", "Ubrique", "Jimena de la Frontera", "Los Barrios", "San José del Valle", "Trebujena", "Chipiona", "Puerto Serrano", "Villamartín", "Espera", "Bornos", "El Bosque", "Grazalema", "Zahara", "Setenil de las Bodegas"]
  },
  {
    name: "Cantabria",
    cities: ["Santander", "Torrelavega", "Castro-Urdiales", "Camargo", "Piélagos", "Santoña", "Laredo", "El Astillero", "Los Corrales de Buelna", "Reinosa", "Santa María de Cayón", "Medio Cudeyo", "Cabezón de la Sal", "Noja", "Suances", "Comillas", "San Vicente de la Barquera", "Ampuero", "Ramales de la Victoria", "Villacarriedo", "Tanos", "Colindres", "Limpias", "Guriezo", "Voto", "Bareyo"]
  },
  {
    name: "Castellón",
    cities: ["Castellón de la Plana", "Vila-real", "Burriana", "Vinaròs", "Onda", "Benicàssim", "Sagunto", "Almassora", "Nules", "La Vall d'Uixó", "Segorbe", "Benicarló", "Peñíscola", "Alcalà de Xivert", "Villarreal", "Betxí", "L'Alcora", "Artana", "Tales", "Xilxes", "Moncofa", "Chilches", "La Llosa", "Almenara", "Canet lo Roig", "Càlig", "Cervera del Maestre", "Traiguera", "San Mateo", "Chert"]
  },
  {
    name: "Ciudad Real",
    cities: ["Ciudad Real", "Puertollano", "Tomelloso", "Alcázar de San Juan", "Valdepeñas", "Manzanares", "Daimiel", "Socuéllamos", "Campo de Criptana", "Miguelturra", "Bolaños de Calatrava", "Membrilla", "La Solana", "Argamasilla de Alba", "Villanueva de los Infantes", "Malagón", "Pedro Muñoz", "Herencia", "Moral de Calatrava", "Almodóvar del Campo", "Santa Cruz de Mudela", "Villarrubia de los Ojos", "Carrión de Calatrava", "Calzada de Calatrava", "Torralba de Calatrava"]
  },
  {
    name: "Córdoba",
    cities: ["Córdoba", "Lucena", "Puente Genil", "Pozoblanco", "Montilla", "Priego de Córdoba", "Cabra", "Baena", "Rute", "Aguilar de la Frontera", "La Carlota", "Villa del Río", "Castro del Río", "Palma del Río", "Fernán-Núñez", "Peñarroya-Pueblonuevo", "Villanueva de Córdoba", "Hinojosa del Duque", "Belalcázar", "Espiel", "Fuente Palmera", "Montemayor", "Nueva Carteya", "Doña Mencía", "Iznájar", "Encinas Reales", "Santaella", "La Rambla", "Pedro Abad", "Bujalance"]
  },
  {
    name: "Coruña, A",
    cities: ["A Coruña", "Santiago de Compostela", "Ferrol", "Narón", "Oleiro", "Culleredo", "Arteixo", "Carballo", "Ribeira", "Betanzos", "Cambre", "Ames", "Rianxo", "Boiro", "Padrón", "Noia", "Teo", "Ortigueira", "Cedeira", "Malpica de Bergantiños", "Ponteceso", "Laxe", "Corme-Porto do Son", "Muros", "Carnota", "Corcubión", "Finisterre", "Muxía", "Camariñas", "Vimianzo", "Zas"]
  },
  {
    name: "Cuenca",
    cities: ["Cuenca", "Tarancón", "Quintanar del Rey", "San Clemente", "Motilla del Palancar", "Las Pedroñeras", "Villamayor de Santiago", "Horcajo de Santiago", "Casasimarro", "Mota del Cuervo", "Belmonte", "Villanueva de la Jara", "Honrubia", "El Provencio", "Iniesta", "Minglanilla", "Huete", "Priego", "Cañete", "Carboneras de Guadazaón", "Sisante", "Villares del Saz", "Barajas de Melo", "Loranca de Tajuña", "Saelices"]
  },
  {
    name: "Girona",
    cities: ["Girona", "Figueres", "Blanes", "Lloret de Mar", "Olot", "Salt", "Palafrugell", "Roses", "Palamós", "Sant Feliu de Guíxols", "Banyoles", "Ripoll", "Puigcerdà", "La Bisbal d'Empordà", "Torroella de Montgrí", "Castelló d'Empúries", "Cadaqués", "L'Escala", "Portbou", "Colera", "Llançà", "El Port de la Selva", "Vilajuïga", "Peralada", "Vilafant", "Llers", "Agullana", "La Jonquera", "Darnius", "Maçanet de la Selva"]
  },
  {
    name: "Granada",
    cities: ["Granada", "Motril", "Almuñécar", "Guadix", "Baza", "Loja", "Armilla", "Maracena", "Las Gabias", "Santa Fe", "Pinos Puente", "Órgiva", "Salobreña", "La Zubia", "Cúllar Vega", "Churriana de la Vega", "Huétor Vega", "Atarfe", "Iznalloz", "Montefrío", "Alhama de Granada", "Illora", "Dúrcal", "Lanjarón", "Cádiar", "Ugíjar", "Albolote", "Calicasas", "Cogollos Vega", "Dílar"]
  },
  {
    name: "Guadalajara",
    cities: ["Guadalajara", "Azuqueca de Henares", "Alovera", "Cabanillas del Campo", "Yebes", "Marchamalo", "Villanueva de la Torre", "Chiloeches", "Yunquera de Henares", "El Casar", "Torija", "Fontanar", "Mondéjar", "Fuentenovilla", "Pozo de Guadalajara", "Valdeaveruelo", "Horche", "Quer", "Villanueva de Alcorón", "Pioz"]
  },
  {
    name: "Guipúzcoa",
    cities: ["San Sebastián", "Irún", "Errenteria", "Pasaia", "Hondarribia", "Arrasate", "Eibar", "Tolosa", "Zarautz", "Hernani", "Andoain", "Urnieta", "Usurbil", "Lezo", "Oiartzun", "Astigarraga", "Villabona", "Zumaia", "Getaria", "Orio", "Deba", "Mutriku", "Ondarroa", "Leintz-Gatzaga", "Soraluze", "Bergara", "Antzuola", "Elgoibar", "Mendaro", "Beizama"]
  },
  {
    name: "Huelva",
    cities: ["Huelva", "Lepe", "Almonte", "Moguer", "Ayamonte", "La Palma del Condado", "Islantilla", "Palos de la Frontera", "Aljaraque", "Punta Umbría", "Cartaya", "Rociana del Condado", "Bollullos Par del Condado", "Valverde del Camino", "Trigueros", "San Juan del Puerto", "Bonares", "Lucena del Puerto", "Niebla", "Beas", "Gibraleón", "Villablanca", "San Bartolomé de la Torre", "El Granado", "Puebla de Guzmán", "Sanlúcar de Guadiana"]
  },
  {
    name: "Huesca",
    cities: ["Huesca", "Barbastro", "Monzón", "Fraga", "Jaca", "Sabiñánigo", "Binéfar", "Sariñena", "Tamarite de Litera", "Graus", "Benabarre", "Aínsa-Sobrarbe", "Boltaña", "Broto", "Torla", "Biescas", "Panticosa", "Canfranc", "Hecho", "Ansó", "Benasque", "Castejón de Sos", "Sallent de Gállego", "Ayerbe", "Almudévar", "Gurrea de Gállego"]
  },
  {
    name: "Jaén",
    cities: ["Jaén", "Linares", "Úbeda", "Andújar", "Baeza", "Martos", "Alcalá la Real", "La Carolina", "Villacarrillo", "Mancha Real", "Torredonjimeno", "Jódar", "Bailén", "Mengíbar", "Rus", "Orcera", "Villanueva del Arzobispo", "Santisteban del Puerto", "Villatorres", "Lupión", "Porcuna", "Arjona", "Espelúy", "Fuerte del Rey", "Cazorla", "Quesada", "Pozo Alcón", "Huesa", "La Iruela", "Hornos"]
  },
  {
    name: "León",
    cities: ["León", "Ponferrada", "San Andrés del Rabanedo", "Astorga", "Valencia de Don Juan", "La Bañeza", "Villaquilambre", "Bembibre", "Cacabelos", "Villafranca del Bierzo", "Sahagún", "Mansilla de las Mulas", "Boñar", "Cistierna", "La Robla", "Valderas", "Gordaliza del Pino", "Santa María del Páramo", "Toral de los Guzmanes", "Matadeón de los Oteros", "Gradefes", "Valdefresno", "Cuadros", "Chozas de Abajo", "Sariegos", "Garrafe de Torío"]
  },
  {
    name: "Lleida",
    cities: ["Lleida", "Balaguer", "Tàrrega", "Mollerussa", "La Seu d'Urgell", "Almacelles", "Alcarràs", "Cervera", "Agramunt", "Guissona", "Solsona", "Tremp", "Sort", "Vielha e Mijaran", "Ponts", "Artesa de Segre", "Bellpuig", "Golmés", "Almenar", "Vilanova de Bellpuig", "Tornabous", "Verdú", "El Palau d'Anglesola", "Castelldans", "Maials", "Seròs"]
  },
  {
    name: "Lugo",
    cities: ["Lugo", "Viveiro", "Monforte de Lemos", "Villalba", "Chantada", "Ribadeo", "Sarria", "Foz", "Burela", "Guitiriz", "Vilalba", "Castro de Rei", "Outeiro de Rei", "Rábade", "Begonte", "Cospeito", "Mondoñedo", "Cervo", "Xove", "O Valadouro", "Alfoz", "Barreiros", "Trabada", "Lourenzá", "Ribadeo", "A Pastoriza"]
  },
  {
    name: "Madrid",
    cities: ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón", "Torrejón de Ardoz", "Parla", "Alcobendas", "Las Rozas de Madrid", "San Sebastián de los Reyes", "Pozuelo de Alarcón", "Coslada", "Valdemoro", "Rivas-Vaciamadrid", "Majadahonda", "Collado Villalba", "Aranjuez", "Arganda del Rey", "Boadilla del Monte", "Tres Cantos", "Mejorada del Campo", "San Fernando de Henares", "Velilla de San Antonio", "Paracuellos de Jarama", "Ciempozuelos", "Humanes de Madrid", "Algete", "Griñón", "Navalcarnero", "El Escorial", "San Lorenzo de El Escorial", "Galapagar", "Torrelodones", "Hoyo de Manzanares", "Colmenar Viejo", "Miraflores de la Sierra", "Soto del Real", "Cercedilla", "Navacerrada"]
  },
  {
    name: "Málaga",
    cities: ["Málaga", "Marbella", "Estepona", "Benalmádena", "Fuengirola", "Torremolinos", "Vélez-Málaga", "Mijas", "Antequera", "Rincón de la Victoria", "Coín", "Alhaurín de la Torre", "Alhaurín el Grande", "Nerja", "Torrox", "Manilva", "Casares", "Frigiliana", "Ronda", "Archidona", "Álora", "Cártama", "Pizarra", "Ojén", "Benahavís", "Istán", "Tolox", "Yunquera", "El Burgo", "Ardales", "Alozaina", "Guaro", "Monda", "Algarrobo", "Sayalonga", "Cómpeta", "Canillas de Aceituno", "Sedella", "Canillas de Albaida", "Árchez", "Salares", "Corumbela", "Cútar", "Benamocarra", "Iznate", "Macharaviaya", "Moclinejo", "Almáchar", "El Borge", "Comares", "Periana", "Alcaucín", "Viñuela", "Alfarnate", "Alfarnatejo", "Colmenar", "Riogordo", "Casabermeja", "Villanueva del Rosario", "Villanueva del Trabuco", "Villanueva de Tapia", "Alameda", "Mollina", "Fuente de Piedra", "Humilladero", "Sierra de Yeguas", "Teba", "Ardales", "Carratraca", "Almargen", "Cañete la Real", "Olvera", "Setenil de las Bodegas", "Alcalá del Valle", "Torre Alháquime", "Zahara de la Sierra", "Algodonales", "El Gastor", "Benaocaz", "Villaluenga del Rosario", "Grazalema", "Benamahoma", "Ubrique", "Benarraba", "Gaucín", "Jimera de Líbar", "Benaoján", "Montejaque", "Cortes de la Frontera", "Jubrique", "Genalguacil", "Pujerra", "Alpandeire", "Faraján", "Cartajima", "Parauta", "Igualeja", "Júzcar"]
  },
  {
    name: "Murcia",
    cities: ["Murcia", "Cartagena", "Lorca", "Molina de Segura", "Alcantarilla", "Jumilla", "Águilas", "Yecla", "Caravaca de la Cruz", "Totana", "San Javier", "Mazarrón", "Cieza", "Alhama de Murcia", "La Unión", "Torre-Pacheco", "Los Alcázares", "Fortuna", "Cehegín", "Santomera", "Abarán", "Beniel", "Archena", "Las Torres de Cotillas", "Fuente Álamo", "Ceutí", "Lorquí", "Bullas", "Mula", "Pliego", "Alguazas", "Campos del Río", "Ojós", "Ulea", "Villanueva del Río Segura", "Ricote", "Blanca", "Abanilla", "Calasparra", "Moratalla"]
  },
  {
    name: "Navarra",
    cities: ["Pamplona", "Tudela", "Barañáin", "Burlada", "Estella-Lizarra", "Tafalla", "Villava", "Ansoáin", "Zizur Mayor", "Noáin", "Berriozar", "Huarte", "Egüés", "Cizur", "Olite", "Sangüesa", "Corella", "Cascante", "Peralta", "Marcilla", "Funes", "Villafranca", "Los Arcos", "Viana", "Lodosa", "Mendavia", "San Adrián", "Azagra", "Caparroso", "Carcastillo"]
  },
  {
    name: "Ourense",
    cities: ["Ourense", "Verín", "O Barco de Valdeorras", "Ribadavia", "Xinzo de Limia", "Allariz", "A Rúa", "Carballiño", "Maceda", "Bande", "Celanova", "Trives", "A Gudiña", "Viana do Bolo", "Puebla de Trives", "Castro Caldelas", "Montederramo", "Petín", "Larouco", "Rubiá", "Chandrexa de Queixa", "Manzaneda", "Teixeira", "A Veiga", "Laza", "Riós", "Cualedro", "Castrelo de Miño", "Beade", "Barbadás"]
  },
  {
    name: "Palencia",
    cities: ["Palencia", "Guardo", "Aguilar de Campoo", "Venta de Baños", "Dueñas", "Carrión de los Condes", "Herrera de Pisuerga", "Saldaña", "Cervera de Pisuerga", "Velilla del Río Carrión", "Astudillo", "Frómista", "Osorno la Mayor", "Villamuriel de Cerrato", "Magaz de Pisuerga", "Grijota", "Villoldo", "Ampudia", "Torquemada", "Paredes de Nava", "Villada", "Becerril de Campos", "Cisneros", "Santoyo", "Villarramiel"]
  },
  {
    name: "Pontevedra",
    cities: ["Vigo", "Pontevedra", "Vilagarcía de Arousa", "Redondela", "Cangas", "Marín", "Ponteareas", "O Porriño", "Lalín", "Estrada", "Sanxenxo", "O Grove", "Cambados", "Ribadumia", "Vilanova de Arousa", "Caldas de Reis", "Tui", "A Guarda", "Oia", "Baiona", "Nigrán", "Gondomar", "Mos", "Salceda de Caselas", "As Neves", "Mondariz", "Mondariz-Balneario", "Salvaterra de Miño", "A Cañiza", "Covelo"]
  },
  {
    name: "La Rioja",
    cities: ["Logroño", "Calahorra", "Arnedo", "Haro", "Santo Domingo de la Calzada", "Lardero", "Villamediana de Iregua", "Nájera", "Alfaro", "Cervera del Río Alhama", "Pradejón", "Rincón de Soto", "Aldeanueva de Ebro", "Autol", "Quel", "Albelda de Iregua", "Fuenmayor", "Cenicero", "Briones", "San Asensio", "Casalarreina", "Ezcaray", "Anguiano", "Torremontalbo", "Villarroya", "Valgañón"]
  },
  {
    name: "Salamanca",
    cities: ["Salamanca", "Béjar", "Ciudad Rodrigo", "Santa Marta de Tormes", "Peñaranda de Bracamonte", "Alba de Tormes", "Vitigudino", "Guijuelo", "La Fuente de San Esteban", "Villares de la Reina", "Carbajosa de la Sagrada", "Cabrerizos", "Villamayor", "Castellanos de Moriscos", "Matilla de los Caños del Río", "Doñinos de Salamanca", "Aldeatejada", "Miranda de Azán", "Arapiles", "Calvarrasa de Abajo", "Villagonzalo de Tormes", "Machacón", "Huerta", "Garcihernández", "Pelabravo", "Carbajosa de la Sagrada"]
  },
  {
    name: "Segovia",
    cities: ["Segovia", "Cuéllar", "San Ildefonso", "Carbonero el Mayor", "Sepúlveda", "Riaza", "Cantalejo", "Coca", "Santa María la Real de Nieva", "Nava de la Asunción", "Chañe", "Bernardos", "Villacastín", "Espirdo", "La Lastrilla", "Palazuelos de Eresma", "Navafría", "Real Sitio de San Ildefonso", "Turégano", "Sacramenia", "Fuentepelayo", "Gomezserracín", "Miguelañez", "Vallelado", "San Cristóbal de Segovia"]
  },
  {
    name: "Sevilla",
    cities: ["Sevilla", "Dos Hermanas", "Alcalá de Guadaíra", "Utrera", "Mairena del Aljarafe", "Écija", "Lebrija", "Los Palacios y Villafranca", "Carmona", "La Rinconada", "Camas", "Tomares", "San Juan de Aznalfarache", "Gelves", "Pilas", "Bormujos", "Espartinas", "Gines", "Castilleja de la Cuesta", "Puebla del Río", "Villamanrique de la Condesa", "Aznalcázar", "Hinojos", "Almensilla", "Palomares del Río", "Salteras", "Olivares", "Albaida del Aljarafe", "Bollullos de la Mitación", "Umbrete", "Benacazón", "Sanlúcar la Mayor", "Villanueva del Ariscal", "Aznalcóllar", "Gerena", "La Puebla de los Infantes", "Lora del Río", "Cantillana", "Tocina", "Brenes", "Villaverde del Río"]
  },
  {
    name: "Soria",
    cities: ["Soria", "Almazán", "Ólvega", "San Leonardo de Yagüe", "Burgo de Osma-Ciudad de Osma", "Ágreda", "Covaleda", "Golmayo", "Navaleno", "Vinuesa", "Duruelo de la Sierra", "Berlanga de Duero", "Arcos de Jalón", "Medinaceli", "San Esteban de Gormaz", "Calatañazor", "Almenar de Soria", "Quintana Redonda", "Langa de Duero", "Gormaz", "El Royo", "Salduero", "Molinos de Duero", "Cidones", "Barca"]
  },
  {
    name: "Tarragona",
    cities: ["Tarragona", "Reus", "Tortosa", "El Vendrell", "Cambrils", "Valls", "Amposta", "Vila-seca", "Salou", "Deltebre", "Sant Carles de la Ràpita", "L'Hospitalet de l'Infant", "Calafell", "Cunit", "Torredembarra", "Altafulla", "La Pineda", "Constantí", "Perafort", "La Canonja", "Vila-rodona", "El Catllar", "Roda de Barà", "Creixell", "Sant Salvador", "Bellvei", "Pobla de Mafumet", "Pobla de Montornès", "Vilallonga del Camp", "La Bisbal del Penedès"]
  },
  {
    name: "Teruel",
    cities: ["Teruel", "Alcañiz", "Calamocha", "Andorra", "Utrillas", "Mora de Rubielos", "Montalbán", "Valderrobres", "Calanda", "Híjar", "Caspe", "Albalate del Arzobispo", "Alcorisa", "Muniesa", "Oliete", "Ariño", "Escucha", "Crivillén", "Alacón", "La Puebla de Híjar", "Samper de Calanda", "Mas de las Matas", "Lledó", "Mazaleón", "Fuentespalda", "Beceite"]
  },
  {
    name: "Toledo",
    cities: ["Toledo", "Talavera de la Reina", "Illescas", "Seseña", "Torrijos", "Ocaña", "Sonseca", "Mora", "Consuegra", "Madridejos", "Quintanar de la Orden", "Villacañas", "Miguel Esteban", "Santa Cruz de la Zarza", "Tembleque", "Corral de Almaguer", "Villa de Don Fadrique", "Lillo", "Villatobas", "El Toboso", "Pedro Muñoz", "Campo de Criptana", "Socuéllamos", "Tomelloso", "Alcázar de San Juan", "Herencia", "Villarrubia de los Ojos", "Daimiel", "Bolaños de Calatrava", "Manzanares"]
  },
  {
    name: "Valencia",
    cities: ["Valencia", "Gandia", "Torrent", "Paterna", "Sagunto", "Alzira", "Xàtiva", "Cullera", "Sueca", "Algemesí", "Catarroja", "Burjassot", "Manises", "Chiva", "Oliva", "Dénia", "Alcúdia", "La Pobla de Vallbona", "Puçol", "L'Eliana", "Bétera", "Foios", "Massanassa", "Alboraya", "Tavernes de la Valldigna", "Xeraco", "Piles", "Bellreguard", "Miramar", "Potríes", "Real de Gandia", "Ador", "Palmera", "Beniarjó", "Beniflá", "Xeresa", "Villalonga", "Rafelcofer", "L'Alqueria de la Comtessa", "Simat de la Valldigna", "Barx", "Benifairó de la Valldigna"]
  },
  {
    name: "Valladolid",
    cities: ["Valladolid", "Medina del Campo", "Laguna de Duero", "Arroyo de la Encomienda", "Íscar", "Peñafiel", "Tordesillas", "Tudela de Duero", "Cigales", "Simancas", "Zaratán", "Boecillo", "Renedo de Esgueva", "Santovenia de Pisuerga", "Cabezón de Pisuerga", "Villanubla", "Aldeamayor de San Martín", "Wamba", "Castrodeza", "Robladillo", "Olivares de Duero", "Traspinedo", "Pesquera de Duero", "Quintanilla de Onésimo", "Valbuena de Duero"]
  },
  {
    name: "Vizcaya",
    cities: ["Bilbao", "Getxo", "Barakaldo", "Leioa", "Santurtzi", "Portugalete", "Basauri", "Galdakao", "Durango", "Erandio", "Sestao", "Mungia", "Gernika-Lumo", "Amorebieta-Etxano", "Bermeo", "Ondarroa", "Markina-Xemein", "Lekeitio", "Ea", "Ispaster", "Mendexa", "Berriatua", "Etxebarria", "Munitibar-Arbatzegi Gerrikaitz-Arratzu", "Amoroto", "Gizaburuaga", "Arbatzegi-Gerrikaitz", "Muxika", "Morga", "Fruiz", "Forua", "Kortezubi", "Nabarniz", "Busturia", "Sukarrieta", "Pedernales", "Errigoiti", "Ibarrangelu", "Elantxobe", "Mundaka"]
  },
  {
    name: "Zamora",
    cities: ["Zamora", "Benavente", "Toro", "Villalpando", "Fuentesaúco", "Puebla de Sanabria", "Morales de Toro", "Santa Cristina de la Polvorosa", "Corrales del Vino", "Fermoselle", "Alcañices", "Trabazos", "Mombuey", "San Cebrián de Castro", "Villaralbo", "Coreses", "Roales", "Fresno de la Ribera", "El Perdigón", "Villamayor de Campos", "Benegiles", "Montamarta", "Torres del Carrizal", "Morales del Vino", "Argañín"]
  },
  {
    name: "Zaragoza",
    cities: ["Zaragoza", "Calatayud", "Utebo", "Ejea de los Caballeros", "Zuera", "Caspe", "Tarazona", "La Almunia de Doña Godina", "Borja", "Épila", "Alagón", "Cuarte de Huerva", "Villanueva de Gállego", "María de Huerva", "Cadrete", "La Puebla de Alfindén", "Pastriz", "Pedrola", "Pinseque", "Sobradiel", "Torres de Berrellén", "Villafranca de Ebro", "Fuentes de Ebro", "Pina de Ebro", "Quinto", "Gelsa", "Sástago", "Escatrón", "Chiprana", "Castelnou"]
  },
  {
    name: "Ceuta",
    cities: ["Ceuta"]
  },
  {
    name: "Melilla",
    cities: ["Melilla"]
  }
];

export const getAllCities = (): string[] => {
  return SPANISH_PROVINCES.flatMap(province => province.cities).sort();
};

export const getCitiesByProvince = (provinceName: string): string[] => {
  const province = SPANISH_PROVINCES.find(p => p.name === provinceName);
  return province ? province.cities.sort() : [];
};

export const getProvinceNames = (): string[] => {
  return SPANISH_PROVINCES.map(p => p.name).sort();
};
