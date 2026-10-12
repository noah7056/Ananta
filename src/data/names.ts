import type { EraId } from '../types';

/**
 * Name pools keyed by birthplace, with gendered first names, so
 * generated names fit the period, the country and the person. Falls
 * back to the era pool for any place without its own.
 *
 * To support a new era or place, add a pool here — the creation
 * screen and family generator pick it up automatically.
 */

export type NameGender = 'male' | 'female';

interface GenderedPool {
  male: string[];
  female: string[];
  last: string[];
}

const BY_PLACE: Record<string, GenderedPool> = {
  // --- Ancient World ---
  'roman-rome': {
    male: ['Gaius', 'Lucius', 'Marcus', 'Titus', 'Publius', 'Quintus', 'Decimus', 'Servius'],
    female: ['Julia', 'Livia', 'Claudia', 'Velia', 'Aemilia', 'Cornelia', 'Junia', 'Fabia'],
    last: ['Romanus', 'Gallicus', 'Brutus', 'Cassius', 'Flavius', 'Aurelius', 'Nerva', 'Traianus'],
  },
  'roman-egypt': {
    male: ['Ptolemy', 'Kleop', 'Horus', 'Serapis', 'Menes', 'Anubis', 'Rameses', 'Tarek'],
    female: ['Nefertiti', 'Isis', 'Cleopatra', 'Amara', 'Zenobia', 'Hatshepsut', 'Zoe', 'Nile'],
    last: ['Kleopatra', 'Petosiris', 'Eusebios', 'Djedhor', 'Anthous', 'Pharaon', 'Nilous', 'Sais'],
  },
  'roman-britain': {
    male: ['Bran', 'Cunedda', 'Ecgberht', 'Maelgwn', 'Owain', 'Rhodri', 'Dafydd', 'Caius'],
    female: ['Brynhild', 'Eira', 'Gwenllian', 'Mabon', 'Aderyn', 'Cartim', 'Nia', 'Bronwen'],
    last: ['Dux', 'Princis', 'Rex', 'Cantius', 'Brennus', 'Cunedda', 'Vallois', 'Marlow'],
  },
  'roman-gaul': {
    male: ['Julius', 'Amandus', 'Vitalis', 'Bassus', 'Claudius', 'Segimer', 'Orgetorix', 'Lucien'],
    female: ['Aelia', 'Sabina', 'Divitia', 'Paulina', 'Vercissa', 'Lutatia', 'Cammilla', 'Thesia'],
    last: ['Lugdunensis', 'Aedui', 'Parisiorum', 'Mediomatrica', 'Morini', 'Suessionum', 'Atrebat', 'Rauraci'],
  },
  'greece-athens': {
    male: ['Pericles', 'Solon', 'Demosthenes', 'Alcibiades', 'Sophocles', 'Aristides', 'Themistocles', 'Xenophon'],
    female: ['Aspasia', 'Xanthippe', 'Sappho', 'Lysistrata', 'Antigone', 'Penelope', 'Helen', 'Clytemnestra'],
    last: ['Athenaios', 'Attikos', 'Marathonios', 'Piraikos', 'Kekropides', 'Erechtheus', 'Aegeus', 'Pallantis'],
  },
  'greece-corinth': {
    male: ['Diogenes', 'Periander', 'Glaucus', 'Eumelus', 'Archias', 'Damophon', 'Philolaus', 'Jason'],
    female: ['Lais', 'Melissa', 'Medea', 'Creusa', 'Ephyra', 'Pirene', 'Damarete', 'Philisto'],
    last: ['Korinthios', 'Sisyphides', 'Bacchiadai', 'Kypselides', 'Isthmios', 'Peirenaios', 'Ephyraios', 'Glaucos'],
  },
  'judea-jerusalem': {
    male: ['Yohanan', 'Shimon', 'Yehuda', 'Eleazar', 'Mattathias', 'Jonathan', 'Simeon', 'Hezekiah'],
    female: ['Miriam', 'Salome', 'Esther', 'Judith', 'Ruth', 'Deborah', 'Hannah', 'Sarah'],
    last: ['ben David', 'ben Ezra', 'Halevi', 'Kohen', 'ben Judah', 'Maccabeus', 'ben Mattathias', 'Yerushalmi'],
  },
  'hispania-tarraco': {
    male: ['Quintus', 'Gaius', 'Lucius', 'Marcus', 'Publius', 'Sertorius', 'Balbus', 'Seneca'],
    female: ['Julia', 'Marcia', 'Claudia', 'Flavia', 'Domitia', 'Aelia', 'Postumia', 'Valeria'],
    last: ['Tarraconensis', 'Baeticus', 'Lusitanus', 'Celtiber', 'Calagurritanus', 'Saguntinus', 'Emeritensis', 'Cordubensis'],
  },
  'africa-carthage': {
    male: ['Hanno', 'Himilco', 'Mago', 'Hasdrubal', 'Bomilcar', 'Adherbal', 'Gisco', 'Hamilcar'],
    female: ['Dido', 'Sophonisba', 'Salammbo', 'Perpetua', 'Felicitas', 'Crispina', 'Monima', 'Tanit'],
    last: ['Barca', 'Hannonis', 'Gisconis', 'Magonius', 'Bomilcar', 'Adherbal', 'Carthaginiensis', 'Afer'],
  },
  'syria-antioch': {
    male: ['Antiochus', 'Seleucus', 'Demetrius', 'Menander', 'Zenon', 'Apollonius', 'Diodorus', 'Libanius'],
    female: ['Laodice', 'Cleopatra', 'Berenice', 'Zenobia', 'Julia', 'Domna', 'Maesa', 'Soaemias'],
    last: ['Antiochenus', 'Seleucides', 'Apamensis', 'Laodicenus', 'Hierapolitanus', 'Emesenus', 'Palmyrenus', 'Sidonius'],
  },
  'parthia-ctesiphon': {
    male: ['Arsaces', 'Mithridates', 'Phraates', 'Orodes', 'Vologases', 'Tiridates', 'Artabanus', 'Suren'],
    female: ['Musa', 'Laodice', 'Anzaze', 'Aryazate', 'Isbubarza', 'Teleonike', 'Philostrate', 'Cleopatra'],
    last: ['Arsacides', 'Surena', 'Karen', 'Mihran', 'Ispahbudhan', 'Ctesiphontes', 'Babylonius', 'Elymaeus'],
  },
  'germania-frontier': {
    male: ['Arminius', 'Segimer', 'Maroboduus', 'Ariovistus', 'Chariovalda', 'Flavus', 'Inguiomerus', 'Segestes'],
    female: ['Thusnelda', 'Albruna', 'Veleda', 'Ganna', 'Ramiona', 'Ida', 'Hilda', 'Swanhild'],
    last: ['Cheruscus', 'Marcomannus', 'Chattus', 'Suebus', 'Bructerus', 'Tencterus', 'Usipetes', 'Mattiacus'],
  },
  'china-changan': {
    male: ['Wei', 'Huo', 'Zhang', 'Sima', 'Ban', 'Cao', 'Dong', 'Guan'],
    female: ['Zhao', 'Cai', 'Zhen', 'Fu', 'Feng', 'Yin', 'Guo', 'Xiao'],
    last: ['Liu', 'Wang', 'Li', 'Zhang', 'Zhao', 'Chen', 'Yang', 'Huang'],
  },
  'nubia-meroe': {
    male: ['Natakamani', 'Akinidad', 'Teriteqas', 'Amanikhabale', 'Arkamani', 'Nastasen', 'Harsiotef', 'Aktisanes'],
    female: ['Amanitore', 'Amanishakheto', 'Shanakdakhete', 'Nawidemak', 'Maleqorobar', 'Kandake', 'Artennis', 'Meroe'],
    last: ['Meroitic', 'Kushites', 'Napatan', 'of Meroe', 'of Napata', 'Kandakes', 'Amanit', 'Terit'],
  },
  'italy-ostia': {
    male: ['Gaius', 'Aulus', 'Sextus', 'Decimus', 'Numerius', 'Spurius', 'Tiberius', 'Vibius'],
    female: ['Octavia', 'Livia', 'Drusilla', 'Antonia', 'Valeria', 'Horatia', 'Caecilia', 'Pomponia'],
    last: ['Ostiensis', 'Portuensis', 'Claudius', 'Traianus', 'Hadrianus', 'Antoninus', 'Septimius', 'Verus'],
  },
  'egypt-memphis': {
    male: ['Ptahhotep', 'Imhotep', 'Horemheb', 'Amenemhat', 'Senusret', 'Khufu', 'Djoser', 'Unas'],
    female: ['Merit', 'Neith', 'Seshat', 'Maat', 'Bastet', 'Sekhmet', 'Hathor', 'Mut'],
    last: ['Memphites', 'Ptahmoses', 'Heliopolitanus', 'Sakkaranus', 'Busiritis', 'Letopolites', 'Aphroditopolites', 'Oxyrhynchites'],
  },
  'india-pataliputra': {
    male: ['Ashoka', 'Chandra', 'Samudra', 'Kumara', 'Skanda', 'Ravi', 'Deva', 'Vikrama'],
    female: ['Devi', 'Lakshmi', 'Kumari', 'Sita', 'Tara', 'Maya', 'Priya', 'Shakti'],
    last: ['Gupta', 'Maurya', 'Sharma', 'Varma', 'Nanda', 'Pala', 'Sena', 'Kushana'],
  },
  'japan-yamato': {
    male: ['Ojin', 'Nintoku', 'Yuryaku', 'Keitai', 'Kimmei', 'Bidatsu', 'Yomei', 'Sushun'],
    female: ['Himiko', 'Jingu', 'Suiko', 'Iwanohime', 'Nakatsuhime', 'Kusaka', 'Hatuse', 'Sasage'],
    last: ['Yamato', 'Soga', 'Mononobe', 'Otomo', 'Kibi', 'Heguri', 'Kose', 'Katsuragi'],
  },
  'arabia-petra': {
    male: ['Obodas', 'Aretas', 'Malichus', 'Rabbel', 'Taymu', 'Zayd', 'Wahb', 'Amrat'],
    female: ['Huldu', 'Shuqilat', 'Gamilat', 'Hagiru', 'Abiat', 'Rafat', 'Salmat', 'Kulayb'],
    last: ['Nabataeus', 'Petraeus', 'Hauranitis', 'Moabites', 'Edomites', 'Thamudeni', 'Lihyanitis', 'Qedarites'],
  },
  'ethiopia-axum': {
    male: ['Ezana', 'Kaleb', 'Gebra', 'Armah', 'Eon', 'Nezana', 'Ousanas', 'Gadarat'],
    female: ['Makeda', 'Helena', 'Sofya', 'Amles', 'Wolete', 'Mulu', 'Askala', 'Zewditu'],
    last: ['Axumites', 'Habesha', 'Agaw', 'Beja', 'Tigray', 'Amhara', 'Gondar', 'Shewa'],
  },

  'ethiopia-gondar': {
    male: ['Fasil', 'Yostos', 'Iyasu', 'Bakaffa', 'Dawit', 'Tekle', 'Giyorgis', 'Amda', 'Tewoflos', 'Yoas'],
    female: ['Iyasu', 'Eleni', 'Walatta', 'Fikir', 'Zewditu', 'Menen', 'Sabla', 'Tewabech', 'Mentewab', 'Dinqinesh'],
    last: ['Gondar', 'Solomonic', 'Tigray', 'Amhara', 'Shewa', 'Gojjam', 'Wollo', 'Lasta', 'Semien', 'Begemder'],
  },
  'india-varanasi': {
    male: ['Ashoka', 'Harsha', 'Vikram', 'Chandra', 'Surya', 'Vishnu', 'Raman', 'Arjun', 'Bhima', 'Nakul'],
    female: ['Sita', 'Ganga', 'Parvati', 'Lakshmi', 'Saraswati', 'Savitri', 'Tara', 'Maya', 'Devi', 'Kamala'],
    last: ['Gupta', 'Chauhan', 'Rathore', 'Verma', 'Shastri', 'Trivedi', 'Chopra', 'Banerjee', 'Mukherjee', 'Sengupta'],
  },
  'japan-nara': {
    male: ['Kammu', 'Saga', 'Korehito', 'Uda', 'Suzaku', 'Kazan', 'Ichijo', 'Sanjo', 'Goichi', 'Tamehito'],
    female: ['Sako', 'Yasuko', 'Toshiko', 'Murasako', 'Senshi', 'Atsuko', 'Miyako', 'Nariko', 'Himiko', 'Sadako'],
    last: ['Fujiwara', 'Tachibana', 'Kiyohara', 'Abe', 'Ono', 'Mononobe', 'Otomo', 'Soga', 'Nakatomi', 'Minamoto'],
  },
  'arabia-medina': {
    male: ['Zayd', 'Usamah', 'Safwan', 'Khalid', 'Bilal', 'Salman', 'Ammar', 'Talhah', 'Saad', 'Abu'],
    female: ['Amina', 'Khadijah', 'Safiyyah', 'Rumaysa', 'Shams', 'Nusaybah', 'Asma', 'Fatimah', 'Ruqayyah', 'Umm'],
    last: ['al Ansar', 'Banu Qurayza', 'Banu Makhzum', 'Banu Umayya', 'Banu Tamim', 'Banu Asad', 'Banu Zuhrah', 'Banu Nawfal', 'Banu Ghassan', 'Banu Kalb'],
  },
  'britain-eboracum': {
    male: ['Cerialis', 'Agricola', 'Ulpian', 'Severus', 'Constans', 'Magnus', 'Flavius', 'Julius', 'Aulus', 'Decius'],
    female: ['Regina', 'Claudia', 'Aurelia', 'Flavia', 'Julia', 'Valeria', 'Domitia', 'Aelia', 'Severa', 'Martia'],
    last: ['Eboracensis', 'Legionis', 'Vicus', 'Coloniae', 'Britannicus', 'Eboraci', 'Castrorum', 'Vallum', 'Fossae', 'Portae'],
  },
  'china-luoyang': {
    male: ['Ban', 'Zhang', 'Cai', 'Wang', 'Liu', 'Yang', 'Zhao', 'Ma', 'Dong', 'Cui'],
    female: ['Ban', 'Cai', 'Wang', 'Liu', 'Yang', 'Zhao', 'Li', 'Feng', 'Du', 'He'],
    last: ['Ban', 'Zhang', 'Cai', 'Wang', 'Liu', 'Yang', 'Zhao', 'Ma', 'Dong', 'Cui'],
  },
  'china-chengdu': {
    male: ['Zhuge', 'Liu', 'Guan', 'Zhang', 'Zhao', 'Ma', 'Huang', 'Wei', 'Pang', 'Fa'],
    female: ['Sun', 'Wu', 'Gan', 'Mi', 'Xiahou', 'Cao', 'Liu', 'Zhang', 'Yang', 'Li'],
    last: ['Liu', 'Guan', 'Zhang', 'Zhao', 'Ma', 'Huang', 'Wei', 'Pang', 'Fa', 'Zhuge'],
  },
  'germania-mogontiacum': {
    male: ['Ariovistus', 'Chariovalda', 'Flavus', 'Inguiomerus', 'Segestes', 'Thusnelda', 'Ramona', 'Berta'],
    female: ['Thusnelda', 'Albruna', 'Veleda', 'Ganna', 'Ramiona', 'Ida', 'Hilda', 'Swanhild', 'Berta', 'Alfhild'],
    last: ['Mogontiacensis', 'Rhenanus', 'Ubii', 'Vangiones', 'Nemetes', 'Triboci', 'Mattiacus', 'Suebus', 'Chattus', 'Bructerus'],
  },
  'judea-caesarea': {
    male: ['Herod', 'Agrippa', 'Philip', 'Antipas', 'Felix', 'Festus', 'Ananias', 'Caiaphas', 'Gamaliel', 'Saul'],
    female: ['Berenice', 'Drusilla', 'Mariamne', 'Salome', 'Alexandra', 'Cypros', 'Helena', 'Martha', 'Joanna', 'Susanna'],
    last: ['Herodianus', 'Caesariensis', 'Idumaeus', 'Ituraeus', 'Trachonitis', 'Galilaeus', 'Peraeus', 'Decapolitanus', 'Samnite', 'Ascalonites'],
  },
  'nubia-napata': {
    male: ['Piankhi', 'Shabaka', 'Shabataka', 'Taharqa', 'Tanutamani', 'Atlanersa', 'Senkamanisken', 'Anlamani', 'Aspelta', 'Aramatle'],
    female: ['Peksater', 'Khensa', 'Qalhata', 'Tabiry', 'Abar', 'Takahatenamun', 'Arty', 'Kheperkare', 'Madiken', 'Nesakhma'],
    last: ['Napatan', 'Kushites', 'Gebel', 'Dongola', 'Kerma', 'Sai', 'Soleb', 'Sesebi', 'Tombos', 'Pnubs'],
  },
  'parthia-ecbatana': {
    male: ['Arsaces', 'Mithridates', 'Phraates', 'Orodes', 'Vologases', 'Tiridates', 'Artabanus', 'Suren', 'Karen', 'Mihran'],
    female: ['Musa', 'Laodice', 'Anzaze', 'Aryazate', 'Isbubarza', 'Teleonike', 'Philostrate', 'Rinnu', 'Amat', 'Bath'],
    last: ['Ecbatana', 'Media', 'Rhagae', 'Hecatompylos', 'Nisa', 'Dara', 'Margiana', 'Hyrcania', 'Parthyene', 'Apavortene'],
  },
  'hispania-emerita': {
    male: ['Quintus', 'Marcus', 'Lucius', 'Gaius', 'Publius', 'Sertorius', 'Balbus', 'Seneca', 'Lucan', 'Martial'],
    female: ['Julia', 'Marcia', 'Claudia', 'Flavia', 'Domitia', 'Aelia', 'Postumia', 'Valeria', 'Lucilla', 'Marcella'],
    last: ['Emeritensis', 'Lusitanus', 'Turdetanus', 'Celticus', 'Vettonus', 'Carpetanus', 'Oretanus', 'Bastetanus', 'Contestanus', 'Edetanus'],
  },
  'hispania-corduba': {
    male: ['Seneca', 'Lucan', 'Martial', 'Quintilian', 'Columella', 'Juba', 'Bocchus', 'Masinissa', 'Syphax', 'Vermina'],
    female: ['Helvia', 'Acilia', 'Cornelia', 'Pomponia', 'Calpurnia', 'Aurelia', 'Fabia', 'Manlia', 'Sulpicia', 'Terentia'],
    last: ['Cordubensis', 'Baeticus', 'Hispalensis', 'Gaditanus', 'Malacitanus', 'Astigitanus', 'Egabrum', 'Illiturgitanus', 'Obulco', 'Ulia'],
  },
  'syria-palmyra': {
    male: ['Odaenathus', 'Vaballathus', 'Zabdas', 'Zabda', 'Hairan', 'Timolaus', 'Maqqai', 'Yarhai', 'Nebuzaradan', 'Malchos'],
    female: ['Zenobia', 'Julia', 'Domna', 'Maesa', 'Soaemias', 'Mamaea', 'Severa', 'Aquilia', 'Cornelia', 'Ulpia'],
    last: ['Palmyrenus', 'Emesenus', 'Heliopolitanus', 'Damascenus', 'Berytius', 'Sidonius', 'Tyrius', 'Byblius', 'Tripolitanus', 'Aradius'],
  },
  'syria-dura': {
    male: ['Dura', 'Europos', 'Seleucus', 'Antiochus', 'Demetrius', 'Timon', 'Nicanor', 'Heliodorus', 'Lysias', 'Philip'],
    female: ['Laodice', 'Cleopatra', 'Berenice', 'Apama', 'Stratonice', 'Antiochis', 'Nysa', 'Tryphaena', 'Marianne', 'Alexandra'],
    last: ['Durenus', 'Europaeus', 'Macedonius', 'Thessalonicensis', 'Pellaeus', 'Amphipolitanus', 'Cassandreus', 'Philippensis', 'Heracleotes', 'Miletus'],
  },
  'africa-utica': {
    male: ['Cato', 'Scipio', 'Marius', 'Sulla', 'Pompey', 'Caesar', 'Cicero', 'Brutus', 'Cassius', 'Antony'],
    female: ['Porcia', 'Cornelia', 'Aurelia', 'Julia', 'Servilia', 'Fulvia', 'Octavia', 'Livia', 'Drusilla', 'Agrippina'],
    last: ['Uticensis', 'Africanus', 'Numidicus', 'Mauretanus', 'Gaetulus', 'Garamantes', 'Nasamones', 'Marmarica', 'Cyrenaicus', 'Tripolitanus'],
  },

  // --- Middle Ages ---
  'england-village': {
    male: ['Aldric', 'Cedric', 'Rowan', 'Hugh', 'Thomas', 'Walter', 'Edmund', 'Oswald', 'Harold', 'Edgar'],
    female: ['Edith', 'Matilda', 'Beatrice', 'Agnes', 'Mabel', 'Alice', 'Joan', 'Margaret', 'Eleanor', 'Cecily'],
    last: ['Blackwood', 'Thatcher', 'Grimm', 'Fairfax', 'Stone', 'Marsh', 'Fletcher', 'Cooper', 'Ashdown', 'Miller'],
  },
  'italy-florence': {
    male: ['Marco', 'Dante', 'Lorenzo', 'Matteo', 'Giovanni', 'Piero', 'Antonio', 'Francesco', 'Niccolo', 'Sandro'],
    female: ['Elena', 'Lucia', 'Sofia', 'Isabella', 'Chiara', 'Caterina', 'Lucrezia', 'Ginevra', 'Alessandra', 'Bianca'],
    last: ['Rossi', 'Medici', 'Conti', 'Ricci', 'Bianchi', 'Donati', 'Strozzi', 'Alberti', 'Vespucci', 'Neri'],
  },
  'russia-novgorod': {
    male: ['Ivan', 'Dmitri', 'Boris', 'Pyotr', 'Vasily', 'Mikhail', 'Alexei', 'Nikolai', 'Sergei', 'Oleg'],
    female: ['Olga', 'Anya', 'Natasha', 'Irina', 'Katya', 'Sonya', 'Maria', 'Daria', 'Elena', 'Nadia'],
    last: ['Volkov', 'Sokolov', 'Morozov', 'Kuznetsov', 'Petrov', 'Smirnov', 'Orlov', 'Fedorov', 'Zaitsev', 'Belov'],
  },
  'france-paris': {
    male: ['Jean', 'Pierre', 'Guillaume', 'Etienne', 'Renaud', 'Gaucher', 'Hugues', 'Thibaut'],
    female: ['Alix', 'Marguerite', 'Clemence', 'Jeanne', 'Agnes', 'Blanche', 'Isabeau', 'Helene'],
    last: ['de Montfort', 'Beauclerc', 'de Valois', 'Marchand', 'Lefevre', 'Dupont', 'de Sorrel', 'Petit'],
  },
  'iberia-toledo': {
    male: ['Rodrigo', 'Fernando', 'Gonzalo', 'Alfonso', 'Diego', 'Ruy', 'Pelayo', 'Ibrahim'],
    female: ['Leonor', 'Teresa', 'Blanca', 'Mencia', 'Constanza', 'Luzia', 'Sol', 'Fatima'],
    last: ['de Toledo', 'Castillo', 'Ibarra', 'Mendoza', 'Almohad', 'del Vega', 'Salcedo', 'Barrios'],
  },
  'england-york': {
    male: ['Eadric', 'Siward', 'Morcar', 'Waltheof', 'Gospatric', 'Cnut', 'Thorkell', 'Erik', 'Harold', 'Uhtred'],
    female: ['Edith', 'Sigrid', 'Gunnhild', 'Estrith', 'Aelfgifu', 'Ragnhild', 'Gytha', 'Tora', 'Ingrid', 'Suniva'],
    last: ['of York', 'Jorviksson', 'Northumbrian', 'Daneson', 'Staller', 'the Red', 'Bloodaxe', 'Forkbeard', 'Hardrada', 'Godwinson'],
  },
  'england-canterbury': {
    male: ['Anselm', 'Lanfranc', 'Dunstan', 'Augustine', 'Theodore', 'Eadmer', 'Osbern', 'Gervase', 'Reginald', 'Hubert'],
    female: ['Eadburga', 'Mildred', 'Ethelburga', 'Bertha', 'Seaxburh', 'Eanswythe', 'Domneva', 'Ermenburga', 'Tekla', 'Cristina'],
    last: ['of Canterbury', 'Christchurch', 'Kentish', 'de Burgh', 'atte Water', 'Godwinson', 'Parker', 'Sexton', 'Bell', 'Chaucer'],
  },
  'france-rouen': {
    male: ['Rollo', 'Richard', 'Robert', 'William', 'Geoffrey', 'Tancred', 'Osmond', 'Raoul', 'Serlo', 'Nigel'],
    female: ['Emma', 'Gunnora', 'Judith', 'Adelaide', 'Mathilde', 'Constance', 'Sibyl', 'Hawise', 'Eleanor', 'Alice'],
    last: ['de Rouen', 'Normand', 'de Clare', 'FitzOsbern', 'de Beaumont', 'Talbot', 'de Warenne', 'Bigod', 'Malet', 'de Tosny'],
  },
  'italy-venice': {
    male: ['Enrico', 'Sebastiano', 'Marino', 'Pietro', 'Andrea', 'Giovanni', 'Paolo', 'Alvise', 'Domenico', 'Jacopo'],
    female: ['Elena', 'Marietta', 'Bianca', 'Veronica', 'Caterina', 'Paolina', 'Lucrezia', 'Cecilia', 'Orsetta', 'Faustina'],
    last: ['Dandolo', 'Contarini', 'Morosini', 'Corner', 'Grimani', 'Loredan', 'Barbarigo', 'Mocenigo', 'Foscari', 'Dona'],
  },
  'italy-rome-med': {
    male: ['Gregorio', 'Leone', 'Benedetto', 'Stefano', 'Pasquale', 'Giovanni', 'Pietro', 'Paolo', 'Alberico', 'Crescenzio'],
    female: ['Marozia', 'Theodora', 'Sergia', 'Berta', 'Giacinta', 'Faustina', 'Plautilla', 'Costanza', 'Ortensia', 'Lavinia'],
    last: ['Orsini', 'Colonna', 'Frangipani', 'Pierleoni', 'Savelli', 'Conti', 'Annibaldi', 'Crescenzi', 'Massimi', 'Caffarelli'],
  },
  'spain-cordoba': {
    male: ['Abd al-Rahman', 'Al-Hakam', 'Hisham', 'Hasdai', 'Samuel', 'Yusuf', 'Tariq', 'Muza', 'Almanzor', 'Ziyad'],
    female: ['Subh', 'Wallada', 'Lubna', 'Fatima', 'Aisha', 'Zaynab', 'Maryam', 'Sara', 'Qamar', 'Itimad'],
    last: ['ibn Rushd', 'ibn Zuhr', 'al-Qurtubi', 'ibn Hazm', 'al-Zahrawi', 'ibn Firnas', 'Halevi', 'Nagrela', 'Shaprut', 'Umayyad'],
  },
  'russia-kiev': {
    male: ['Vladimir', 'Yaroslav', 'Sviatoslav', 'Igor', 'Oleg', 'Mstislav', 'Vsevolod', 'Izyaslav', 'Rostislav', 'Gleb'],
    female: ['Olga', 'Rogneda', 'Yanka', 'Predslava', 'Verkhoslava', 'Eupraxia', 'Maria', 'Anna', 'Malgorzata', 'Ingegerd'],
    last: ['Rurikovich', 'Monomakh', 'Mstislavich', 'Izyaslavich', 'Vsevolodovich', 'Yaroslavich', 'Svyatoslavich', 'Vladimirovich', 'Olgovich', 'Rostislavich'],
  },
  'germany-aachen': {
    male: ['Otto', 'Heinrich', 'Konrad', 'Friedrich', 'Lothar', 'Arnulf', 'Karlmann', 'Pepin', 'Ludwig', 'Einhard'],
    female: ['Adelheid', 'Theophanu', 'Kunigunde', 'Mathilde', 'Gisela', 'Richenza', 'Agnes', 'Beatrix', 'Hildegard', 'Emma'],
    last: ['von Aachen', 'Karolinger', 'Ottonen', 'Salier', 'Billunger', 'Wettiner', 'Zahringer', 'Staufer', 'Welfen', 'Askanier'],
  },
  'germany-lubeck': {
    male: ['Hinrich', 'Bernd', 'Cord', 'Ludeke', 'Tideman', 'Hermann', 'Johann', 'Nikolaus', 'Gottschalk', 'Detmar'],
    female: ['Wobbeke', 'Geseke', 'Taleke', 'Mette', 'Alheid', 'Grete', 'Ilsebe', 'Katerine', 'Margarete', 'Elsebe'],
    last: ['Hanse', 'Wullenwever', 'Bromse', 'Kerkring', 'Luneburg', 'Moller', 'Schmidt', 'Kramer', 'Becker', 'Schroder'],
  },
  'ireland-dublin': {
    male: ['Brian', 'Muirchertach', 'Diarmait', 'Turlough', 'Niall', 'Aed', 'Flann', 'Cormac', 'Sitric', 'Ivar'],
    female: ['Gormlaith', 'Niamh', 'Sadhbh', 'Muirgel', 'Orla', 'Derbforgaill', 'Cacht', 'Land', 'Bebinn', 'Emer'],
    last: ['Boruma', 'Ua Briain', 'Ua Conchobair', 'Ua Neill', 'Mac Murchada', 'Ua Ruairc', 'Mac Lochlainn', 'Ua Mael Sechnaill', 'Ivarsson', 'Sigtryggsson'],
  },
  'scotland-edinburgh': {
    male: ['Malcolm', 'Duncan', 'Macbeth', 'David', 'Alexander', 'William', 'Robert', 'James', 'Donald', 'Kenneth'],
    female: ['Margaret', 'Matilda', 'Ermengarde', 'Joan', 'Isabella', 'Marjorie', 'Euphemia', 'Annabella', 'Mary', 'Elizabeth'],
    last: ['Canmore', 'Dunkeld', 'Moray', 'Bruce', 'Comyn', 'Stewart', 'Douglas', 'Macduff', 'Atholl', 'Ross'],
  },
  'byzantium-constantinople': {
    male: ['Basil', 'Constantine', 'Leo', 'Justinian', 'Alexios', 'Manuel', 'John', 'Michael', 'Theodore', 'Andronikos'],
    female: ['Theodora', 'Irene', 'Zoe', 'Anna', 'Eudokia', 'Maria', 'Pulcheria', 'Helena', 'Theophano', 'Euphrosyne'],
    last: ['Komnenos', 'Doukas', 'Palaiologos', 'Macedon', 'Phokas', 'Skleros', 'Bryennios', 'Kantakouzenos', 'Laskaris', 'Angelus'],
  },
  'egypt-cairo-med': {
    male: ['Yusuf', 'Khalil', 'Ahmad', 'Hasan', 'Husayn', 'Ali', 'Umar', 'Ibrahim', 'Saladin', 'Baybars'],
    female: ['Shajar', 'Asma', 'Zaynab', 'Fatima', 'Aisha', 'Khadija', 'Maryam', 'Sara', 'Sitt', 'Qamar'],
    last: ['al-Din', 'Ayyubid', 'Mamluk', 'al-Qahiri', 'ibn Tulun', 'Ikhshidid', 'Fatimid', 'al-Nasir', 'Qalawun', 'al-Zahir'],
  },
  'holyland-jerusalem': {
    male: ['Baldwin', 'Godfrey', 'Raymond', 'Bohemond', 'Tancred', 'Renaud', 'Guy', 'Conrad', 'Saladin', 'Nur'],
    female: ['Sibylla', 'Isabella', 'Melisende', 'Alice', 'Constance', 'Stephanie', 'Agnes', 'Maria', 'Theodora', 'Morphia'],
    last: ['de Bouillon', 'de Toulouse', 'de Lusignan', 'de Courtenay', 'de Tripoli', 'de Antioche', 'al-Din', 'ibn Munqidh', 'de Brienne', 'de Montfort'],
  },
  'norway-bergen': {
    male: ['Olaf', 'Harald', 'Magnus', 'Sverre', 'Haakon', 'Eirik', 'Sigurd', 'Bjarne', 'Torstein', 'Leif'],
    female: ['Ingrid', 'Astrid', 'Sigrid', 'Gunnhild', 'Halldis', 'Ragnhild', 'Thora', 'Bergljot', 'Liv', 'Solveig'],
    last: ['Haraldsson', 'Fairhair', 'Hardrada', 'Sigurdsson', 'Olafsson', 'Magnusson', 'Haakonsson', 'Eiriksson', 'Bergen', 'Gulating'],
  },
  'poland-krakow': {
    male: ['Boleslaw', 'Mieszko', 'Kazimierz', 'Wladyslaw', 'Zbigniew', 'Leszek', 'Henryk', 'Konrad', 'Przemysl', 'Janusz'],
    female: ['Jadwiga', 'Dobrawa', 'Richeza', 'Salomea', 'Anna', 'Elzbieta', 'Katarzyna', 'Zofia', 'Malgorzata', 'Agnieszka'],
    last: ['Piast', 'Jagiello', 'Waza', 'Leszczynski', 'Sobieski', 'Potocki', 'Radziwill', 'Wisniowiecki', 'Tarnowski', 'Odrowaz'],
  },
  'china-hangzhou': {
    male: ['Shi', 'Anshi', 'Dongpo', 'Yu', 'Fan', 'Ouyang', 'Sima', 'Zhu', 'Lu', 'Han'],
    female: ['Qingzhao', 'Shuzhen', 'Wanrong', 'Yifan', 'Ruoshui', 'Lianxiang', 'Mulan', 'Caiwen', 'Ying', 'Yan'],
    last: ['Li', 'Wang', 'Zhang', 'Zhao', 'Qian', 'Sun', 'Zhou', 'Wu', 'Su', 'Ouyang'],
  },
  'japan-kyoto': {
    male: ['Michinaga', 'Yorimichi', 'Tadamori', 'Kiyomori', 'Yoritomo', 'Yoshitsune', 'Kukai', 'Saicho', 'Sugawara', 'Abe'],
    female: ['Murasaki', 'Sei', 'Izumi', 'Akiko', 'Teishi', 'Senshi', 'Koshibe', 'Uda', 'Fujitsubo', 'Aoi'],
    last: ['Fujiwara', 'Taira', 'Minamoto', 'Sugawara', 'Abe', 'Ki', 'Tachibana', 'Oe', 'Sakanoue', 'Koremune'],
  },
  'india-delhi-med': {
    male: ['Prithviraj', 'Qutbuddin', 'Iltutmish', 'Balban', 'Alauddin', 'Harsha', 'Bhoja', 'Chauhan', 'Tomara', 'Solanki'],
    female: ['Razia', 'Rani', 'Padmini', 'Samyukta', 'Deval', 'Rupmati', 'Mrinal', 'Chand', 'Lila', 'Kamala'],
    last: ['Chauhan', 'Tomar', 'Solanki', 'Parihar', 'Chandel', 'Kalachuri', 'Gahadavala', 'Khalji', 'Tughlaq', 'Sayyid'],
  },
  'hungary-buda': {
    male: ['Istvan', 'Laszlo', 'Bela', 'Geza', 'Kalman', 'Andras', 'Zsigmond', 'Matyas', 'Janos', 'Ferenc'],
    female: ['Gizella', 'Anna', 'Erzsebet', 'Margit', 'Katalin', 'Ilona', 'Judit', 'Zsuzsanna', 'Maria', 'Klara'],
    last: ['Arpad', 'Hunyadi', 'Bathory', 'Szapolyai', 'Rakoczi', 'Esterhazy', 'Kovacs', 'Nagy', 'Toth', 'Szabo'],
  },
  'sweden-uppsala': {
    male: ['Erik', 'Olof', 'Bjorn', 'Sten', 'Gustav', 'Karl', 'Birger', 'Magnus', 'Knut', 'Harald'],
    female: ['Sigrid', 'Astrid', 'Ingrid', 'Karin', 'Margareta', 'Birgitta', 'Kristina', 'Ulvhild', 'Ragnhild', 'Gyda'],
    last: ['Vasa', 'Sture', 'Bonde', 'Oxenstierna', 'Bjelbo', 'Folkung', 'Eriksson', 'Karlsson', 'Ragnvaldsson', 'Skoglund'],
  },
  'portugal-coimbra': {
    male: ['Afonso', 'Sancho', 'Dinis', 'Joao', 'Pedro', 'Fernando', 'Henrique', 'Manuel', 'Duarte', 'Alvaro'],
    female: ['Teresa', 'Urraca', 'Mafalda', 'Beatriz', 'Isabel', 'Leonor', 'Filipa', 'Maria', 'Ines', 'Constanca'],
    last: ['Borgonha', 'Meneses', 'Sousa', 'Castro', 'Pereira', 'Almeida', 'Costa', 'Silva', 'Coimbra', 'Porto'],
  },
  'mali-timbuktu': {
    male: ['Sundiata', 'Mansa', 'Kankan', 'Maghan', 'Sakura', 'Uli', 'Khalifa', 'Abubakari', 'Musa', 'Suleyman'],
    female: ['Sogolon', 'Kassi', 'Nana', 'Awa', 'Fanta', 'Mariam', 'Sira', 'Kadiatou', 'Aminata', 'Fatoumata'],
    last: ['Keita', 'Cisse', 'Toure', 'Diarra', 'Traore', 'Konate', 'Kouyate', 'Sissoko', 'Bah', 'Diallo'],
  },

  'mali-djenne': {
    male: ['Suleyman', 'Kankan', 'Sumaoro', 'Kante', 'Moussa', 'Sakoura', 'Mari', 'Dia', 'Konko', 'Kelem'],
    female: ['Sogolon', 'Kassi', 'Nana', 'Sira', 'Keme', 'Fasa', 'Kadiatou', 'Safiatou', 'Mariama', 'Rokia'],
    last: ['Keita', 'Koné', 'Traoré', 'Touré', 'Diallo', 'Cissé', 'Sylla', 'Camara', 'Kéïta', 'Doumbia'],
  },
  'england-london-med': {
    male: ['Walter', 'Roger', 'Simon', 'Adam', 'Hugh', 'Ralph', 'Gilbert', 'Nigel', 'Osbert', 'Turstin'],
    female: ['Matilda', 'Adeliza', 'Mabel', 'Gunnora', 'Rohese', 'Hawise', 'Ida', 'Elena', 'Avelina', 'Clarice'],
    last: ['FitzWalter', 'de Mandeville', 'de Vere', 'Bigod', 'Clare', 'FitzGilbert', 'de Lacy', 'Percy', 'Neville', 'Beaumont'],
  },
  'france-lyon-med': {
    male: ['Guichard', 'Humbert', 'Amédée', 'Girard', 'Payen', 'Dalmas', 'Artaud', 'Jocerand', 'Hugues', 'Renaud'],
    female: ['Alix', 'Mahaut', 'Blanche', 'Jeanne', 'Sibylle', 'Agnès', 'Clemence', 'Marguerite', 'Isabeau', 'Philippa'],
    last: ['de Beaujeu', 'de Forez', 'de Villars', 'de Thoire', 'de Lay', 'de Chandieu', 'de Jarez', 'de Chamousset', 'de Rochefort', 'de Urgel'],
  },
  'spain-merida-med': {
    male: ['Musa', 'Tariq', 'Abd', 'Umar', 'Yusuf', 'Ibrahim', 'Ahmad', 'Ali', 'Hasan', 'Husayn'],
    female: ['Zaida', 'Subh', 'Wallada', 'Itimad', 'Buthayna', 'Qasmuna', 'Nazhun', 'Hafsa', 'Maryam', 'Sara'],
    last: ['Umayyad', 'Hammudid', 'Abbadid', 'Aftasid', 'Birzalid', 'Dhu', 'Banu', 'Hudid', 'Tujibid', 'Amirid'],
  },
  'germany-mainz-med': {
    male: ['Willigis', 'Aribo', 'Bardo', 'Luitpold', 'Siegfried', 'Adalbert', 'Ruthard', 'Arnold', 'Christian', 'Konrad'],
    female: ['Hildegard', 'Bertha', 'Agnes', 'Mathilde', 'Gertrud', 'Sophie', 'Adelheid', 'Kunigunde', 'Richenza', 'Liutgard'],
    last: ['Mainz', 'Nassau', 'Katzenelnbogen', 'Eppstein', 'Falkenstein', 'Hanau', 'Isenburg', 'Westerburg', 'Rieneck', 'Bickenbach'],
  },
  'russia-moscow-med': {
    male: ['Daniil', 'Yuri', 'Ivan', 'Simeon', 'Dmitri', 'Vasily', 'Boris', 'Gleb', 'Vladimir', 'Yaroslav'],
    female: ['Maria', 'Evdokia', 'Anastasia', 'Sofia', 'Elena', 'Anna', 'Feodosia', 'Uliana', 'Agripina', 'Vassa'],
    last: ['Moskva', 'Danilovich', 'Yurievich', 'Ivanovich', 'Simeonovich', 'Dmitrievich', 'Vasilyevich', 'Borisovich', 'Glebovich', 'Vladimirovich'],
  },
  'china-luoyang-med': {
    male: ['Shi', 'Anshi', 'Dongpo', 'Yu', 'Fan', 'Ouyang', 'Sima', 'Zhu', 'Lu', 'Han'],
    female: ['Qingzhao', 'Shuzhen', 'Wanrong', 'Yifan', 'Ruoshui', 'Lianxiang', 'Caiwen', 'Ying', 'Yan', 'Xiu'],
    last: ['Shi', 'An', 'Dong', 'Fan', 'Ouyang', 'Sima', 'Zhu', 'Lu', 'Han', 'Hu'],
  },
  'japan-nara-med': {
    male: ['Kukai', 'Saicho', 'Ennin', 'Enchin', 'Kobo', 'Dengyo', 'Jikaku', 'Chisho', 'Annen', 'Ryogen'],
    female: ['Ono', 'Kasa', 'Otomo', 'Sakanoue', 'Abe', 'Ki', 'Tachibana', 'Fujiwara', 'Minamoto', 'Taira'],
    last: ['Kukai', 'Saicho', 'Ennin', 'Enchin', 'Kobo', 'Dengyo', 'Jikaku', 'Chisho', 'Annen', 'Ryogen'],
  },
  'india-varanasi-med': {
    male: ['Kabir', 'Tulsidas', 'Ravidas', 'Surdas', 'Mirabai', 'Nanak', 'Chaitanya', 'Vallabha', 'Ramananda', 'Nimbarka'],
    female: ['Mira', 'Lalla', 'Akka', 'Bahina', 'Janabai', 'Soyarabai', 'Nirmala', 'Sahajo', 'Daya', 'Paltu'],
    last: ['Das', 'Misra', 'Tiwari', 'Pandey', 'Shukla', 'Upadhyay', 'Dube', 'Chaturvedi', 'Awasthi', 'Pathak'],
  },
  'hungary-esztergom': {
    male: ['László', 'Géza', 'András', 'Béla', 'István', 'Kálmán', 'Péter', 'Imre', 'Lajos', 'Zoltán'],
    female: ['Erzsébet', 'Judit', 'Anna', 'Katalin', 'Magdolna', 'Mária', 'Erzsébet', 'Gizella', 'Margit', 'Ilona'],
    last: ['Hunyadi', 'Báthory', 'Zrínyi', 'Esterházy', 'Szapolyai', 'Nádasdy', 'Pálffy', 'Károlyi', 'Németh', 'Kovács'],
  },
  'sweden-visby': {
    male: ['Gustav', 'Johan', 'Erik', 'Bengt', 'Nils', 'Olof', 'Lars', 'Per', 'Anders', 'Knut'],
    female: ['Ingrid', 'Astrid', 'Margareta', 'Kristina', 'Hedvig', 'Ulrika', 'Lovisa', 'Brita', 'Elin', 'Sara'],
    last: ['Trolle', 'Oxenstierna', 'Wrangel', 'Banér', 'Lilliehöök', 'Bonde', 'Gyllenstierna', 'Horn', 'Torstensson', 'Ribbing'],
  },
  'portugal-evora': {
    male: ['Afonso', 'Dinis', 'Pedro', 'Fernando', 'João', 'Duarte', 'Henrique', 'Manuel', 'Sebastião', 'Carlos'],
    female: ['Beatriz', 'Leonor', 'Isabel', 'Maria', 'Catarina', 'Teresa', 'Inês', 'Filipa', 'Joana', 'Luísa'],
    last: ['Bragança', 'Albuquerque', 'Meneses', 'Castro', 'Vasconcelos', 'Melo', 'Pacheco', 'Lencastre', 'Távora', 'Feijóo'],
  },
  'byzantium-nicaea': {
    male: ['Theodore', 'John', 'Michael', 'Constantine', 'Alexios', 'Manuel', 'Andronikos', 'Isaac', 'Nikephoros', 'Basil'],
    female: ['Irene', 'Theodora', 'Anna', 'Maria', 'Eudokia', 'Zoe', 'Helena', 'Martha', 'Euphrosyne', 'Theophano'],
    last: ['Laskaris', 'Vatatzes', 'Palaiologos', 'Kantakouzenos', 'Doukas', 'Komnenos', 'Angelos', 'Tornikes', 'Philantes', 'Mouzalon'],
  },
  'china-kaifeng': {
    male: ['Zhao', 'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Xu'],
    female: ['Zhao', 'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Xu'],
    last: ['Zhao', 'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Xu'],
  },
  'egypt-alexandria-med': {
    male: ['Saladin', 'Baybars', 'Qutuz', 'Aybak', 'Qalawun', 'Nasir', 'Barquq', 'Barsbay', 'Jaqmaq', 'Qaitbay'],
    female: ['Shajar', 'Fatima', 'Zaynab', 'Aisha', 'Khadija', 'Maryam', 'Nafisa', 'Ruqayya', 'Hafsa', 'Jawhara'],
    last: ['Ayyubid', 'Mamluk', 'Bahri', 'Burji', 'Salihi', 'Kamili', 'Adili', 'Muazzami', 'Nasiri', 'Mansuri'],
  },
  'holyland-acre': {
    male: ['Baldwin', 'Raymond', 'Bohemond', 'Tancred', 'Godfrey', 'Fulk', 'Amalric', 'Guy', 'Conrad', 'Henry'],
    female: ['Melisende', 'Sibylla', 'Isabella', 'Maria', 'Alice', 'Helvis', 'Stephanie', 'Agnes', 'Beatrice', 'Eschiva'],
    last: ['Acre', 'Tyre', 'Sidon', 'Beirut', 'Jaffa', 'Ascalon', 'Caesarea', 'Tripoli', 'Antioch', 'Edessa'],
  },
  'ireland-limerick': {
    male: ['Brian', 'Turlough', 'Donal', 'Cormac', 'Muirchertach', 'Niall', 'Aed', 'Cathal', 'Felim', 'Rory'],
    female: ['Gormlaith', 'Morfydd', 'Orla', 'Sadhbh', 'Caitlin', 'Aine', 'Muireann', 'Sorcha', 'Blathnaid', 'Eithne'],
    last: ['Boru', 'OBrien', 'MacCarthy', 'ONeill', 'OConnor', 'MacMahon', 'OFlaherty', 'ORourke', 'MacNamara', 'Fitzgerald'],
  },
  'japan-kamakura': {
    male: ['Yoritomo', 'Yoshitsune', 'Hojo', 'Tokimune', 'Sadako', 'Takauji', 'Masashige', 'Nitta', 'Ashikaga', 'Kitabatake'],
    female: ['Masako', 'Shizuka', 'Tokiwa', 'Abutsu', 'Nakatsukasa', 'Ben', 'Koshikibu', 'Izumi', 'Murasaki', 'Sei'],
    last: ['Minamoto', 'Taira', 'Hojo', 'Ashikaga', 'Nitta', 'Kusunoki', 'Kitabatake', 'Uesugi', 'Takeda', 'Imagawa'],
  },
  'norway-nidaros': {
    male: ['Olaf', 'Harald', 'Magnus', 'Sigurd', 'Eystein', 'Inge', 'Sverre', 'Haakon', 'Eirik', 'Skule'],
    female: ['Astrid', 'Ingrid', 'Margaret', 'Kristina', 'Ingeborg', 'Ragnhild', 'Gyda', 'Sigrid', 'Halldis', 'Torhild'],
    last: ['Haraldsson', 'Olafsson', 'Magnusson', 'Sigurdsson', 'Eysteinsson', 'Ingesson', 'Sverresson', 'Haakonsson', 'Eiriksson', 'Skulesson'],
  },
  'poland-gniezno': {
    male: ['Mieszko', 'Boleslaw', 'Kazimierz', 'Wladyslaw', 'Zbigniew', 'Leszek', 'Konrad', 'Henryk', 'Przemysl', 'Siemowit'],
    female: ['Dobrawa', 'Richeza', 'Jadwiga', 'Kunegunda', 'Salomea', 'Agnes', 'Matylda', 'Gertruda', 'Ofka', 'Ludmila'],
    last: ['Piast', 'Jagiellon', 'Mazowiecki', 'Slaski', 'Wielkopolski', 'Malopolski', 'Kujawski', 'Pomorski', 'Leczycki', 'Sieradzki'],
  },
  'scotland-perth': {
    male: ['Malcolm', 'Duncan', 'Macbeth', 'David', 'William', 'Alexander', 'Robert', 'James', 'John', 'Walter'],
    female: ['Margaret', 'Matilda', 'Ermengarde', 'Isabella', 'Marjorie', 'Joan', 'Elizabeth', 'Euphemia', 'Annabella', 'Mary'],
    last: ['Canmore', 'Dunkeld', 'Moray', 'Strathearn', 'Atholl', 'Buchan', 'Ross', 'Mar', 'Lennox', 'Stewart'],
  },
  'india-kannauj': {
    male: ['Harsha', 'Yashovarman', 'Nagabhata', 'Mihira', 'Bhoja', 'Mahipala', 'Devapala', 'Rajyapala', 'Trilochan', 'Vigraha'],
    female: ['Rajyashri', 'Durgavati', 'Ahilyabai', 'Lakshmibai', 'Jijabai', 'Tarabai', 'Chand', 'Mrinal', 'Lila', 'Kamala'],
    last: ['Vardhana', 'Pratihara', 'Pala', 'Rashtrakuta', 'Chola', 'Chalukya', 'Paramara', 'Chandela', 'Kalachuri', 'Gahadavala'],
  },

  // --- Age of Sail ---
  'netherlands-amsterdam': {
    male: ['Jan', 'Pieter', 'Willem', 'Cornelis', 'Joris', 'Hendrik', 'Barent', 'Dirck'],
    female: ['Maria', 'Neeltje', 'Trijntje', 'Aeltje', 'Willemijn', 'Catharina', 'Anna', 'Griet'],
    last: ['van der Meer', 'de Vries', 'Bakker', 'de Graaf', 'van Rijn', 'Janszoon', 'van Houten', 'de Wit'],
  },
  'spain-sevilla': {
    male: ['Diego', 'Alonso', 'Cristobal', 'Bartolome', 'Rodrigo', 'Ignacio', 'Pedro', 'Manuel'],
    female: ['Catalina', 'Isabel', 'Juana', 'Leonor', 'Ines', 'Bartola', 'Margarita', 'Teresa'],
    last: ['de Sevilla', 'Corral', 'de la Vega', 'Mendoza', 'Perez', 'de-triana', 'Bermudez', 'Salcedo'],
  },
  'england-london-17c': {
    male: ['Oliver', 'Thomas', 'Samuel', 'Josiah', 'Nathaniel', 'Ephraim', 'Josiah', 'Robert'],
    female: ['Mary', 'Anne', 'Elizabeth', 'Sarah', 'Abigail', 'Susanna', 'Frances', 'Grace'],
    last: ['Pepys', 'Bunyan', 'Hobbes', 'Dryden', 'Walton', 'Marlowe', 'Waller', 'Clarke'],
  },
  'japan-osaka': {
    male: ['Takeshi', 'Hiroshi', 'Kenji', 'Daigo', 'Masaru', 'Yoshio', 'Noboru', 'Ichiro'],
    female: ['Yuki', 'Hanako', 'Sakura', 'Keiko', 'Rin', 'Aiko', 'Sayuri', 'Naoko'],
    last: ['Tanaka', 'Yamamoto', 'Nakamura', 'Saito', 'Kobayashi', 'Watanabe', 'Ito', 'Fujimoto'],
  },
  'india-surat': {
    male: ['Arjun', 'Vikram', 'Rohan', 'Karan', 'Nikhil', 'Aditya', 'Sanjay', 'Mahesh'],
    female: ['Priya', 'Anjali', 'Meera', 'Divya', 'Isha', 'Kavya', 'Nisha', 'Radhika'],
    last: ['Shah', 'Patel', 'Desai', 'Chatterjee', 'Rao', 'Iyer', 'Mehta', 'Kapoor'],
  },
  'france-paris-sail': {
    male: ['Louis', 'Philippe', 'Armand', 'Francois', 'Henri', 'Charles', 'Jean-Baptiste', 'Nicolas'],
    female: ['Marie', 'Francoise', 'Elisabeth', 'Charlotte', 'Adelaide', 'Victoire', 'Henriette', 'Louise'],
    last: ['de Bourbon', 'de Rohan', 'Montmorency', 'de Guise', 'Colbert', 'de la Roche', 'Beaumarchais', 'Diderot'],
  },
  'france-marseille': {
    male: ['Barnabe', 'Etienne', 'Honore', 'Gaspard', 'Laurent', 'Pascal', 'Raimond', 'Toussaint'],
    female: ['Manon', 'Fanny', 'Honorine', 'Delphine', 'Rosette', 'Clarette', 'Miette', 'Zette'],
    last: ['Panier', 'Roux', 'Blanc', 'Fabre', 'Pastour', 'Grasset', 'Olivier', 'Roman'],
  },
  'italy-venice-sail': {
    male: ['Alvise', 'Sebastiano', 'Vettor', 'Girolamo', 'Paolo', 'Giacomo', 'Zaccaria', 'Lorenzo'],
    female: ['Elena', 'Marietta', 'Veronica', 'Cecilia', 'Paolina', 'Isabella', 'Cornelia', 'Chiara'],
    last: ['Dandolo', 'Contarini', 'Mocenigo', 'Grimani', 'Loredan', 'Barbarigo', 'Foscari', 'Donato'],
  },
  'italy-genoa': {
    male: ['Andrea', 'Giovanni', 'Cristoforo', 'Battista', 'Giacomo', 'Filippo', 'Stefano', 'Agostino'],
    female: ['Simonetta', 'Caterina', 'Battistina', 'Peretta', 'Maria', 'Tommasina', 'Francisca', 'Violante'],
    last: ['Doria', 'Spinola', 'Fieschi', 'Grimaldi', 'Giustiniani', 'Lomellini', 'Sauli', 'Centurione'],
  },
  'ottoman-istanbul': {
    male: ['Mehmed', 'Suleiman', 'Ahmed', 'Mustafa', 'Ibrahim', 'Selim', 'Osman', 'Mahmud'],
    female: ['Hurrem', 'Kosem', 'Turhan', 'Mihrimah', 'Hatice', 'Ayse', 'Fatma', 'Esma'],
    last: ['Pasha', 'Agha', 'Efendi', 'Celebi', 'Koprulu', 'Sokollu', 'Rustem', 'Sinan'],
  },
  'ottoman-cairo': {
    male: ['Ali', 'Hasan', 'Husayn', 'Qaytbay', 'Barsbay', 'Tuman', 'Khalil', 'Umar'],
    female: ['Zaynab', 'Fatima', 'Aisha', 'Khadija', 'Maryam', 'Shamsa', 'Basal', 'Huda'],
    last: ['al-Masri', 'ibn Taghribirdi', 'al-Maqrizi', 'Barsbay', 'Qaytbay', 'al-Ghuri', 'Tumanbay', 'al-Ashrafi'],
  },
  'china-canton': {
    male: ['Howqua', 'Mowqua', 'Puankhequa', 'Chunqua', 'Woo', 'Liang', 'Pan', 'Ye'],
    female: ['Lan', 'Mei', 'Xiu', 'Fang', 'Ju', 'Lian', 'Rong', 'Hui'],
    last: ['Wu', 'Pan', 'Ye', 'Liang', 'Lu', 'He', 'Luo', 'Zheng'],
  },
  'russia-moscow-sail': {
    male: ['Pyotr', 'Alexei', 'Fyodor', 'Ivan', 'Mikhail', 'Nikita', 'Boris', 'Vasily'],
    female: ['Natalya', 'Maria', 'Sofia', 'Anna', 'Praskovya', 'Yevdokiya', 'Marfa', 'Agafya'],
    last: ['Romanov', 'Sheremetev', 'Golitsyn', 'Dolgorukov', 'Naryshkin', 'Miloslavsky', 'Streshnev', 'Odoevsky'],
  },
  'england-bristol': {
    male: ['Edward', 'William', 'John', 'Thomas', 'Richard', 'Henry', 'Nicholas', 'Matthew'],
    female: ['Elizabeth', 'Mary', 'Anne', 'Sarah', 'Margaret', 'Jane', 'Dorothy', 'Hannah'],
    last: ['Cabot', 'Jay', 'Bristow', 'Penn', 'Sturges', 'Harford', 'Miles', 'Day'],
  },
  'ireland-dublin-sail': {
    male: ['Patrick', 'Sean', 'Conor', 'Dermot', 'Tadhg', 'Owen', 'Rory', 'Malachy'],
    female: ['Bridget', 'Caitlin', 'Siobhan', 'Grainne', 'Niamh', 'Maeve', 'Aileen', 'Deirdre'],
    last: ['Guinness', 'Berkeley', 'Fitzgerald', 'Talbot', 'Plunkett', 'Dillon', 'Nugent', 'Barnewall'],
  },
  'scotland-edinburgh-sail': {
    male: ['James', 'Charles', 'George', 'Archibald', 'Colin', 'Duncan', 'Gilbert', 'Hugh'],
    female: ['Jean', 'Margaret', 'Isobel', 'Helen', 'Agnes', 'Janet', 'Marion', 'Elspeth'],
    last: ['Drummond', 'Hay', 'Keith', 'Lindsay', 'Oliphant', 'Ramsay', 'Seton', 'Sinclair'],
  },
  'america-boston': {
    male: ['John', 'Samuel', 'Increase', 'Cotton', 'Benjamin', 'Paul', 'Joseph', 'Thomas'],
    female: ['Abigail', 'Mercy', 'Hannah', 'Susanna', 'Rebecca', 'Deliverance', 'Remember', 'Experience'],
    last: ['Adams', 'Hancock', 'Revere', 'Mather', 'Winthrop', 'Otis', 'Quincy', 'Warren'],
  },
  'brazil-bahia': {
    male: ['Tome', 'Mem', 'Duarte', 'Vasco', 'Goncalo', 'Manuel', 'Francisco', 'Antonio'],
    female: ['Beatriz', 'Catarina', 'Filipa', 'Isabel', 'Joana', 'Leonor', 'Mecia', 'Violante'],
    last: ['de Sousa', 'Coelho', 'Dias', 'Fernandes', 'Pereira', 'Almeida', 'Costa', 'Rocha'],
  },
  'mexico-veracruz': {
    male: ['Hernan', 'Bernal', 'Pedro', 'Alonso', 'Cristobal', 'Gonzalo', 'Diego', 'Francisco'],
    female: ['Marina', 'Isabel', 'Catalina', 'Juana', 'Leonor', 'Beatriz', 'Mencia', 'Elvira'],
    last: ['Cortes', 'Diaz del Castillo', 'de Alvarado', 'de Olid', 'de Sandoval', 'de Tapia', 'de Aguilar', 'Mendoza'],
  },
  'netherlands-batavia': {
    male: ['Jan', 'Pieter', 'Cornelis', 'Herman', 'Dirk', 'Gerrit', 'Willem', 'Adriaen'],
    female: ['Sara', 'Maria', 'Cornelia', 'Elisabeth', 'Johanna', 'Petronella', 'Geertruid', 'Helena'],
    last: ['Coen', 'van Diemen', 'Maetsuycker', 'Speelman', 'Camphuys', 'Valckenier', 'Both', 'Reynst'],
  },
  'india-goa': {
    male: ['Afonso', 'Vasco', 'Francisco', 'Duarte', 'Manuel', 'Joao', 'Pedro', 'Antonio'],
    female: ['Catarina', 'Isabel', 'Beatriz', 'Joana', 'Leonor', 'Mecia', 'Violante', 'Guiomar'],
    last: ['de Albuquerque', 'da Gama', 'de Almeida', 'Pacheco', 'de Sousa', 'Noronha', 'de Meneses', 'Barreto'],
  },
  'portugal-lisbon': {
    male: ['Joao', 'Manuel', 'Sebastiao', 'Pedro', 'Antonio', 'Francisco', 'Domingos', 'Vasco', 'Luis', 'Miguel'],
    female: ['Maria', 'Ana', 'Joana', 'Catarina', 'Madalena', 'Teresa', 'Luisa', 'Rosa', 'Ines', 'Francisca'],
    last: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Souza', 'Rodrigues', 'Gomes', 'Lisboa', 'Tejo'],
  },
  'sweden-stockholm-sail': {
    male: ['Gustav', 'Karl', 'Johan', 'Axel', 'Erik', 'Per', 'Nils', 'Olof', 'Sten', 'Bengt'],
    female: ['Kristina', 'Maria', 'Ulrika', 'Hedvig', 'Lovisa', 'Sofia', 'Charlotta', 'Eva', 'Brita', 'Marta'],
    last: ['Vasa', 'Oxenstierna', 'De la Gardie', 'Bonde', 'Gyllenstierna', 'Wrangell', 'Baner', 'Tott', 'Sparre', 'Bielke'],
  },
  'austria-vienna-sail': {
    male: ['Leopold', 'Joseph', 'Karl', 'Franz', 'Ferdinand', 'Maximilian', 'Rudolf', 'Albrecht', 'Eugen', 'Wenzel'],
    female: ['Maria', 'Anna', 'Elisabeth', 'Eleonora', 'Margarete', 'Theresia', 'Johanna', 'Sophie', 'Karolina', 'Amalia'],
    last: ['Habsburg', 'Lobkowitz', 'Schwarzenberg', 'Liechtenstein', 'Kinsky', 'Harrach', 'Dietrichstein', 'Auersperg', 'Kaunitz', 'Metternich'],
  },
  'siam-ayutthaya': {
    male: ['Naresuan', 'Ekathotsarot', 'Prasat', 'Narai', 'Petracha', 'Borommakot', 'Uthumphon', 'Ekkathat', 'Taksin', 'Rama'],
    female: ['Suphankanlaya', 'Si Sudachan', 'Wisutkasat', 'Suriyothai', 'Amarindra', 'Debsirindra', 'Srinagarindra', 'Chao Fa', 'Thepsirin', 'Arun'],
    last: ['Ayutthaya', 'Sukhothai', 'Lopburi', 'Suphanburi', 'Phitsanulok', 'Nakhon', 'Phetchaburi', 'Chai Nat', 'Thonburi', 'Rattanakosin'],
  },

  'siam-lopburi': {
    male: ['Narai', 'Petracha', 'Chai', 'Chula', 'Naresuan', 'Prasat', 'Borommakot', 'Uthumphon', 'Ekkathat', 'Phetracha'],
    female: ['Kasattri', 'Wongthep', 'Dara', 'Aphai', 'Khae', 'Phra', 'Ubon', 'Sirikit', 'Amphorn', 'Apsorn'],
    last: ['Ayutthaya', 'Sukhothai', 'Lopburi', 'Phitsanulok', 'Phetchaburi', 'Nakhon', 'Thonburi', 'Saraburi', 'Chai Nat', 'Sing Buri'],
  },
  'italy-rome-sail': {
    male: ['Camillo', 'Marcantonio', 'Fabrizio', 'Giovanni', 'Paolo', 'Alessandro', 'Orazio', 'Pompeo', 'Lorenzo', 'Virginio'],
    female: ['Vittoria', 'Giulia', 'Lavinia', 'Porzia', 'Clarice', 'Faustina', 'Sulpizia', 'Emilia', 'Lucrezia', 'Isabella'],
    last: ['Borghese', 'Barberini', 'Pamphilj', 'Chigi', 'Altieri', 'Odescalchi', 'Colonna', 'Orsini', 'Caetani', 'Farnese'],
  },
  'ottoman-alexandria': {
    male: ['Ali', 'Hasan', 'Husayn', 'Ibrahim', 'Muhammad', 'Ahmad', 'Mahmud', 'Mustafa', 'Umar', 'Uthman'],
    female: ['Zaynab', 'Fatima', 'Aisha', 'Khadija', 'Maryam', 'Hawa', 'Sitt', 'Ward', 'Yasmin', 'Layla'],
    last: ['al-Masri', 'al-Iskandarani', 'al-Bahri', 'al-Qahiri', 'al-Saidi', 'al-Dimyati', 'al-Rashidi', 'al-Burullusi', 'al-Mahallawi', 'al-Tantawi'],
  },
  'ottoman-athens': {
    male: ['Mehmed', 'Suleyman', 'Selim', 'Murad', 'Bayezid', 'Ahmed', 'Mustafa', 'Osman', 'Mahmud', 'Abdulhamid'],
    female: ['Hatice', 'Ayse', 'Fatma', 'Emine', 'Zeynep', 'Elif', 'Meryem', 'Hayriye', 'Nimet', 'Saliha'],
    last: ['Athenaios', 'Attikos', 'Voivoda', 'Kocabas', 'Mora', 'Rumeli', 'Yunan', 'Fener', 'Pera', 'Galata'],
  },
  'ottoman-jerusalem': {
    male: ['Suleyman', 'Dawud', 'Ibrahim', 'Musa', 'Isa', 'Yusuf', 'Ayyub', 'Khalil', 'Ridwan', 'Janbulad'],
    female: ['Sitt', 'Tunshuq', 'Esdemir', 'Taghribirdi', 'Khawand', 'Fatimah', 'Aisha', 'Zaynab', 'Maryam', 'Sara'],
    last: ['al-Qudsi', 'al-Khalili', 'al-Nabulsi', 'al-Husayni', 'al-Khalidi', 'al-Dajjani', 'al-Nashashibi', 'al-Alami', 'al-Tamimi', 'al-Jai'],
  },
  'ottoman-antioch': {
    male: ['Ibrahim', 'Mehmed', 'Ali', 'Hasan', 'Husayn', 'Mustafa', 'Ahmed', 'Mahmud', 'Salih', 'Khalil'],
    female: ['Hatice', 'Ayse', 'Fatma', 'Emine', 'Zeynep', 'Elif', 'Meryem', 'Hayriye', 'Nimet', 'Saliha'],
    last: ['Antakya', 'Halabi', 'Shami', 'Urfa', 'Aintab', 'Marash', 'Adana', 'Tarsus', 'Payas', 'Belen'],
  },
  'china-xian-sail': {
    male: ['Wu', 'Zheng', 'Wang', 'Li', 'Zhang', 'Chen', 'Yang', 'Huang', 'Zhao', 'Xu'],
    female: ['Wu', 'Zheng', 'Wang', 'Li', 'Zhang', 'Chen', 'Yang', 'Huang', 'Zhao', 'Xu'],
    last: ['Sang', 'Hong', 'Tai', 'Xi', 'Cao', 'Wei', 'Jia', 'Cheng', 'Xian', 'Guan'],
  },
  'india-delhi-sail': {
    male: ['Babur', 'Humayun', 'Akbar', 'Jahangir', 'Shah', 'Aurangzeb', 'Bahadur', 'Dara', 'Murad', 'Shuja'],
    female: ['Mumtaz', 'Jahanara', 'Roshanara', 'Zeb', 'Jahan', 'Udai', 'Hira', 'Manbai', 'Nadira', 'Sahiba'],
    last: ['Mughal', 'Timurid', 'Chagatai', 'Barlas', 'Gurkani', 'Mirza', 'Beg', 'Khan', 'Sahib', 'Jahan'],
  },
  'japan-kyoto-sail': {
    male: ['Ieyasu', 'Hidetada', 'Iemitsu', 'Tsunayoshi', 'Yoshimune', 'Ienari', 'Yoshinobu', 'Keiki', 'Matsudaira', 'Ii'],
    female: ['Oeyo', 'Sugenin', 'Eisho', 'Tensho', 'Jokoin', 'Keishoin', 'Renjoin', 'Shinjuin', 'Horenin', 'Kakushin'],
    last: ['Tokugawa', 'Matsudaira', 'Ii', 'Honda', 'Sakai', 'Doi', 'Abe', 'Mizuno', 'Ogasawara', 'Naito'],
  },
  'japan-nara-sail': {
    male: ['Kukai', 'Saicho', 'Ennin', 'Enchin', 'Jokei', 'Myoe', 'Eison', 'Ninsho', 'Shinran', 'Honen'],
    female: ['Ono', 'Kasa', 'Otomo', 'Sakanoue', 'Abe', 'Ki', 'Tachibana', 'Fujiwara', 'Minamoto', 'Taira'],
    last: ['Kofukuji', 'Todaiji', 'Horyuji', 'Yakushiji', 'Toshodaiji', 'Saidaiji', 'Gangoji', 'Daianji', 'Kasuga', 'Koyasan'],
  },
  'india-varanasi-sail': {
    male: ['Tulsidas', 'Kabir', 'Ravidas', 'Surdas', 'Nanak', 'Chaitanya', 'Vallabha', 'Ramananda', 'Nimbarka', 'Madhva'],
    female: ['Ratnavali', 'Loi', 'Dhani', 'Punya', 'Kamali', 'Sundari', 'Ganga', 'Yamuna', 'Saraswati', 'Narmada'],
    last: ['Goswami', 'Das', 'Misra', 'Tiwari', 'Pandey', 'Shukla', 'Upadhyay', 'Dube', 'Chaturvedi', 'Awasthi'],
  },
  'austria-salzburg': {
    male: ['Leopold', 'Wolfgang', 'Maximilian', 'Joseph', 'Ferdinand', 'Karl', 'Friedrich', 'Albrecht', 'Eugen', 'Franz'],
    female: ['Maria', 'Anna', 'Elisabeth', 'Sophie', 'Amalie', 'Caroline', 'Johanna', 'Clara', 'Antonia', 'Eleonora'],
    last: ['Salzburg', 'Hohenems', 'Kuenburg', 'Starhemberg', 'Thun', 'Mensdorff', 'Schrattenbach', 'Harrach', 'Esterházy', 'Lobkowitz'],
  },
  'sweden-gothenburg': {
    male: ['Gustav', 'Johan', 'Erik', 'Axel', 'Nils', 'Olof', 'Lars', 'Carl', 'Anders', 'Bengt'],
    female: ['Anna', 'Maria', 'Karin', 'Eva', 'Lena', 'Sara', 'Maja', 'Elin', 'Johanna', 'Ulrika'],
    last: ['Cronstedt', 'Oxenstierna', 'Sparre', 'Wachtmeister', 'Söderhielm', 'Cederström', 'Åkerhielm', 'Gyllenkrok', 'Banér', 'Lantingshausen'],
  },
  'portugal-oporto': {
    male: ['João', 'Pedro', 'Afonso', 'Dinis', 'Fernando', 'Henrique', 'Manuel', 'Duarte', 'Miguel', 'Luís'],
    female: ['Maria', 'Leonor', 'Beatriz', 'Isabel', 'Teresa', 'Inês', 'Catarina', 'Joana', 'Filipa', 'Ana'],
    last: ['Bragança', 'Lencastre', 'Távora', 'Melo', 'Meneses', 'Castro', 'Vasconcelos', 'Pacheco', 'Menezes', 'Albuquerque'],
  },
  'america-philadelphia': {
    male: ['Benjamin', 'William', 'Thomas', 'John', 'Samuel', 'Joseph', 'James', 'Charles', 'George', 'Henry'],
    female: ['Deborah', 'Abigail', 'Hannah', 'Sarah', 'Mary', 'Elizabeth', 'Martha', 'Rebecca', 'Ruth', 'Esther'],
    last: ['Franklin', 'Penn', 'Morris', 'Shippen', 'Allen', 'Norris', 'Dickinson', 'Logan', 'Chew', 'Willing'],
  },
  'america-charleston': {
    male: ['John', 'William', 'Charles', 'Henry', 'Thomas', 'Edward', 'George', 'James', 'Francis', 'Arthur'],
    female: ['Eliza', 'Mary', 'Sarah', 'Martha', 'Anne', 'Elizabeth', 'Harriet', 'Louisa', 'Caroline', 'Emma'],
    last: ['Rutledge', 'Pinckney', 'Middleton', 'Drayton', 'Laurens', 'Gadsden', 'Moultrie', 'Horry', 'Heyward', 'Lynch'],
  },
  'brazil-recife': {
    male: ['Duarte', 'Jorge', 'Mauricio', 'Joao', 'Antonio', 'Francisco', 'Manuel', 'Pedro', 'Luis', 'Miguel'],
    female: ['Clara', 'Beatriz', 'Isabel', 'Joana', 'Maria', 'Ana', 'Francisca', 'Teresa', 'Luisa', 'Rosa'],
    last: ['Coelho', 'Albuquerque', 'Rego', 'Cavalcanti', 'Holanda', 'Sousa', 'Melo', 'Araujo', 'Barros', 'Lins'],
  },
  'brazil-rio-sail': {
    male: ['Joao', 'Pedro', 'Antonio', 'Francisco', 'Manuel', 'Jose', 'Luis', 'Miguel', 'Gabriel', 'Rafael'],
    female: ['Maria', 'Ana', 'Francisca', 'Teresa', 'Joaquina', 'Carlota', 'Leopoldina', 'Isabel', 'Mariana', 'Rita'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Carvalho', 'Ferreira', 'Rodrigues'],
  },
  'china-amoy': {
    male: ['Zheng', 'Shi', 'Chen', 'Lin', 'Huang', 'Wu', 'Xu', 'Sun', 'Ma', 'Zhu'],
    female: ['Zheng', 'Shi', 'Chen', 'Lin', 'Huang', 'Wu', 'Xu', 'Sun', 'Ma', 'Zhu'],
    last: ['Zheng', 'Shi', 'Chen', 'Lin', 'Huang', 'Wu', 'Xu', 'Sun', 'Ma', 'Zhu'],
  },
  'japan-nagasaki': {
    male: ['Sakamoto', 'Katsu', 'Omura', 'Nakagawa', 'Matsudaira', 'Date', 'Shimazu', 'Mori', 'Uesugi', 'Takeda'],
    female: ['Oryo', 'Narazaki', 'Kusumoto', 'Tae', 'Yuki', 'Hana', 'Kiku', 'Ume', 'Take', 'Matsu'],
    last: ['Sakamoto', 'Katsu', 'Omura', 'Nakagawa', 'Matsudaira', 'Date', 'Shimazu', 'Mori', 'Uesugi', 'Takeda'],
  },
  'japan-edo': {
    male: ['Ieyasu', 'Hidetada', 'Iemitsu', 'Tsunayoshi', 'Yoshimune', 'Ienari', 'Yoshinobu', 'Keiki', 'Matsudaira', 'Ii'],
    female: ['Oeyo', 'Sugenin', 'Eisho', 'Tensho', 'Jokoin', 'Keishoin', 'Renjoin', 'Shinjuin', 'Horenin', 'Kakushin'],
    last: ['Tokugawa', 'Matsudaira', 'Ii', 'Honda', 'Sakai', 'Doi', 'Abe', 'Mizuno', 'Ogasawara', 'Naito'],
  },
  'mexico-mexicocity-sail': {
    male: ['Miguel', 'Jose', 'Vicente', 'Ignacio', 'Agustin', 'Guadalupe', 'Nicolas', 'Mariano', 'Valentin', 'Melchor'],
    female: ['Josefa', 'Leona', 'Gertrudis', 'Mariana', 'Ana', 'Teresa', 'Manuela', 'Dolores', 'Luz', 'Refugio'],
    last: ['Hidalgo', 'Morelos', 'Allende', 'Aldama', 'Jimenez', 'Mina', 'Iturbide', 'Guerrero', 'Bravo', 'Victoria'],
  },
  'mexico-acapulco': {
    male: ['Andres', 'Sebastian', 'Cristobal', 'Hernan', 'Bernal', 'Pedro', 'Alonso', 'Diego', 'Francisco', 'Juan'],
    female: ['Marina', 'Isabel', 'Beatriz', 'Catalina', 'Leonor', 'Mencia', 'Aldonza', 'Guiomar', 'Elvira', 'Sancha'],
    last: ['de Urdaneta', 'de Legazpi', 'de Arellano', 'de Saavedra', 'de Villalobos', 'de Loaisa', 'de Elcano', 'de Magallanes', 'de la Cosa', 'de Ojeda'],
  },
  'russia-petersburg-sail': {
    male: ['Peter', 'Alexander', 'Nikolai', 'Pavel', 'Mikhail', 'Vasily', 'Ivan', 'Dmitri', 'Sergei', 'Alexei'],
    female: ['Catherine', 'Anna', 'Elizabeth', 'Maria', 'Natalia', 'Sophia', 'Praskovya', 'Evdokia', 'Martha', 'Daria'],
    last: ['Romanov', 'Sheremetev', 'Golitsyn', 'Dolgorukov', 'Gagarin', 'Volkonsky', 'Trubetskoy', 'Kurakin', 'Naryshkin', 'Menshikov'],
  },
  'scotland-glasgow': {
    male: ['Walter', 'John', 'Robert', 'William', 'James', 'Alexander', 'David', 'George', 'Thomas', 'Charles'],
    female: ['Margaret', 'Mary', 'Elizabeth', 'Anne', 'Jane', 'Isabella', 'Agnes', 'Janet', 'Marion', 'Helen'],
    last: ['Stuart', 'Douglas', 'Hamilton', 'Campbell', 'Gordon', 'Graham', 'Kennedy', 'Montgomery', 'Cunningham', 'Semple'],
  },
  'spain-cadiz': {
    male: ['Alvaro', 'Fadrique', 'Pedro', 'Alonso', 'Diego', 'Cristobal', 'Bartolome', 'Hernan', 'Francisco', 'Juan'],
    female: ['Beatriz', 'Leonor', 'Isabel', 'Maria', 'Ana', 'Catalina', 'Mencia', 'Aldonza', 'Guiomar', 'Elvira'],
    last: ['de Guzman', 'Ponce de Leon', 'Medina Sidonia', 'Arcos', 'Cadiz', 'Jerez', 'Puerto', 'Sanlucar', 'Rota', 'Chiclana'],
  },

  // --- Industrial Age ---
  'uk-manchester': {
    male: ['Thomas', 'William', 'Edward', 'George', 'Arthur', 'Samuel', 'Joseph', 'Albert'],
    female: ['Mary', 'Elizabeth', 'Margaret', 'Annie', 'Emma', 'Sarah', 'Louisa', 'Harriet'],
    last: ['Whitfield', 'Ashcroft', 'Bickerstaff', 'Hargreaves', 'Thornley', 'Prestwich', 'Grimsdale', 'Boulton'],
  },
  'usa-pittsburgh': {
    male: ['Andrew', 'Hugh', 'Fritz', 'Walter', 'Elmer', 'Clarence', 'Harry', 'Franklin'],
    female: ['Eleanor', 'Margaret', 'Clara', 'Hattie', 'Ruth', 'Edith', 'Nellie', 'Louise'],
    last: ['Carnegie', 'Frick', 'Pitts', 'McCormick', 'Heinz', 'Sinclair', 'Braddock', 'Ness'],
  },
  'germany-ruhr': {
    male: ['Friedrich', 'Heinrich', 'Karl', 'Otto', 'Wilhelm', 'Gustav', 'Ernst', 'Johan'],
    female: ['Greta', 'Johanna', 'Clara', 'Elisabeth', 'Hedwig', 'Anna', 'Frieda', 'Helene'],
    last: ['Krupp', 'Thyssen', 'Siemens', 'Henschel', 'Bergmann', 'Kohl', 'Vogel', 'Ruhland'],
  },
  'france-paris-19c': {
    male: ['Henri', 'Louis', 'Etienne', 'Auguste', 'Maurice', 'Emile', 'Rene', 'Marcel'],
    female: ['Marie', 'Amelie', 'Julie', 'Camille', 'Sophie', 'Blanche', 'Margot', 'Lucienne'],
    last: ['de Girard', 'Beaumont', 'Chevalier', 'Moreau', 'Dufour', 'Leroy', 'Rousseau', 'Petit'],
  },
  'india-bombay': {
    male: ['Ramesh', 'Vijay', 'Ashok', 'Sanjay', 'Girish', 'Prakash', 'Dinesh', 'Ravi'],
    female: ['Lakshmi', 'Sunita', 'Anjali', 'Pooja', 'Kavita', 'Rekha', 'Neha', 'Shalini'],
    last: ['Sharma', 'Deshpande', 'Kulkarni', 'Nair', 'Pillai', 'Menon', 'Rao', 'Bose'],
  },
  'uk-london-ind': {
    male: ['Alfred', 'Ernest', 'Herbert', 'Sidney', 'Percy', 'Horace', 'Edgar', 'Cecil', 'Reginald', 'Wilfred'],
    female: ['Florence', 'Ethel', 'Mabel', 'Gertrude', 'Edith', 'Winifred', 'Hilda', 'Dorothy', 'Violet', 'Elsie'],
    last: ['Dickens', 'Brunel', 'Bazalgette', 'Booth', 'Mayhew', 'Greenwood', 'Besant', 'Hyndman', 'Mann', 'Tillett'],
  },
  'uk-birmingham': {
    male: ['Joseph', 'George', 'Arthur', 'Harry', 'Fred', 'Tom', 'Walter', 'Ernest', 'Albert', 'Samuel'],
    female: ['Polly', 'Ada', 'Lizzie', 'Nell', 'Florrie', 'Emmie', 'Clara', 'Beatrice', 'Maggie', 'Rose'],
    last: ['Chamberlain', 'Cadbury', 'Muntz', 'Elkington', 'Nettlefolds', 'Tangye', 'Lucas', 'Wiggin', 'Avery', 'Heaton'],
  },
  'usa-newyork-ind': {
    male: ['Cornelius', 'Jay', 'August', 'Isidor', 'Jacob', 'Otto', 'Morris', 'Patrick', 'Theodore', 'William'],
    female: ['Alva', 'Consuelo', 'Hetty', 'Emma', 'Lillian', 'Rose', 'Sadie', 'Mamie', 'Nellie', 'Grace'],
    last: ['Vanderbilt', 'Astor', 'Gould', 'Morgan', 'Straus', 'Loeb', 'Sullivan', 'Kelly', 'Roosevelt', 'Hearst'],
  },
  'usa-chicago': {
    male: ['Marshall', 'George', 'Philip', 'Gustavus', 'Cyrus', 'Allan', 'John', 'Louis', 'Daniel', 'Charles'],
    female: ['Bertha', 'Jane', 'Ellen', 'Myra', 'Louise', 'Ida', 'Frances', 'Harriet', 'Mary', 'Susan'],
    last: ['Field', 'Pullman', 'Armour', 'Swift', 'McCormick', 'Pinkerton', 'Altgeld', 'Addams', 'Wells', 'Sullivan'],
  },
  'germany-berlin-ind': {
    male: ['Wilhelm', 'Friedrich', 'Heinrich', 'Otto', 'Gustav', 'Hermann', 'Emil', 'Paul', 'Walter', 'Kurt'],
    female: ['Clara', 'Luise', 'Emma', 'Martha', 'Anna', 'Bertha', 'Hedwig', 'Johanna', 'Minna', 'Frieda'],
    last: ['Siemens', 'Borsig', 'Halske', 'Rathenau', 'Ballin', 'Kirdorf', 'Stinnes', 'Hugenberg', 'Vogel', 'Ullstein'],
  },
  'france-lyon': {
    male: ['Claude', 'Benoit', 'Fleury', 'Laurent', 'Marius', 'Camille', 'Alphonse', 'Jules', 'Victor', 'Antoine'],
    female: ['Claudine', 'Benoite', 'Fleur', 'Laurence', 'Marianne', 'Colette', 'Adeline', 'Sidonie', 'Eugenie', 'Philomene'],
    last: ['Canut', 'Guimet', 'Lumiere', 'Berliet', 'Gillet', 'Seguin', 'Testud', 'Morin', 'Poncet', 'Voisin'],
  },
  'italy-milan': {
    male: ['Alessandro', 'Giuseppe', 'Carlo', 'Enrico', 'Luigi', 'Paolo', 'Emilio', 'Cesare', 'Vittorio', 'Eugenio'],
    female: ['Emilia', 'Teresa', 'Adelina', 'Virginia', 'Ernesta', 'Lina', 'Bice', 'Nella', 'Pina', 'Rina'],
    last: ['Manzoni', 'Verdi', 'Cattaneo', 'Pirelli', 'Bocconi', 'Campari', 'Breda', 'Marelli', 'Falck', 'Erba'],
  },
  'italy-turin': {
    male: ['Camillo', 'Vittorio', 'Massimo', 'Cesare', 'Giovanni', 'Federico', 'Luigi', 'Alfonso', 'Teofilo', 'Quintino'],
    female: ['Adelaide', 'Margherita', 'Elena', 'Cristina', 'Bianca', 'Lidia', 'Ersilia', 'Clelia', 'Ines', 'Pia'],
    last: ['Cavour', 'Balbo', 'Gioberti', 'Sella', 'Lanza', 'Minghetti', 'Rattazzi', 'Depretis', 'Crispi', 'Giolitti'],
  },
  'spain-barcelona': {
    male: ['Joan', 'Josep', 'Pere', 'Ramon', 'Jaume', 'Antoni', 'Francesc', 'Miquel', 'Narcis', 'Salvador'],
    female: ['Montserrat', 'Nuria', 'Merce', 'Carme', 'Roser', 'Assumpcio', 'Dolors', 'Enriqueta', 'Josefa', 'Teresa'],
    last: ['Guell', 'Batllo', 'Mila', 'Sert', 'Casas', 'Rusinol', 'Nonell', 'Mir', 'Tapies', 'Puig'],
  },
  'russia-petersburg': {
    male: ['Alexander', 'Nikolai', 'Pavel', 'Grigory', 'Fyodor', 'Vissarion', 'Pyotr', 'Sergei', 'Vladimir', 'Dmitri'],
    female: ['Alexandra', 'Elizaveta', 'Maria', 'Sofia', 'Vera', 'Nadezhda', 'Lyubov', 'Anna', 'Olga', 'Tatiana'],
    last: ['Pushkin', 'Gogol', 'Dostoevsky', 'Turgenev', 'Nekrasov', 'Saltykov', 'Goncharov', 'Leskov', 'Ostrovsky', 'Pisarev'],
  },
  'austria-vienna': {
    male: ['Franz', 'Johann', 'Karl', 'Gustav', 'Arthur', 'Stefan', 'Hugo', 'Robert', 'Otto', 'Leopold'],
    female: ['Alma', 'Clara', 'Adele', 'Emilie', 'Berta', 'Grete', 'Lotte', 'Mitzi', 'Rosa', 'Sisi'],
    last: ['Strauss', 'Mahler', 'Klimt', 'Wittgenstein', 'Freud', 'Herzl', 'Schnitzler', 'Hofmannsthal', 'Zweig', 'Loos'],
  },
  'belgium-liege': {
    male: ['Leopold', 'Henri', 'Emile', 'Georges', 'Fernand', 'Alphonse', 'Victor', 'Jules', 'Oscar', 'Remy'],
    female: ['Marie', 'Louise', 'Henriette', 'Gabrielle', 'Suzanne', 'Yvonne', 'Marcelle', 'Simone', 'Renee', 'Germaine'],
    last: ['Cockerill', 'Solvay', 'Empain', 'Frere', 'Horta', 'Maeterlinck', 'Verhaeren', 'Evenepoel', 'Anspach', 'Janssen'],
  },
  'netherlands-rotterdam': {
    male: ['Jacob', 'Willem', 'Hendrik', 'Pieter', 'Jan', 'Cornelis', 'Gerrit', 'Andries', 'Barend', 'Klaas'],
    female: ['Aletta', 'Johanna', 'Maria', 'Catharina', 'Wilhelmina', 'Grietje', 'Neeltje', 'Trijntje', 'Maartje', 'Antje'],
    last: ['Van Nelle', 'Stork', 'Werkspoor', 'Burgerhout', 'Hudig', 'Mees', 'Chabot', 'Van Beuningen', 'Kroller', 'Muller'],
  },
  'japan-yokohama': {
    male: ['Yukichi', 'Eiichi', 'Takashi', 'Masayoshi', 'Hirobumi', 'Kaoru', 'Yataro', 'Soichiro', 'Shigenobu', 'Aritomo'],
    female: ['Hideko', 'Yoko', 'Sadako', 'Tomi', 'Shige', 'Kiku', 'Taka', 'Mitsu', 'Yae', 'Sutematsu'],
    last: ['Fukuzawa', 'Shibusawa', 'Matsukata', 'Okubo', 'Kido', 'Ito', 'Inoue', 'Mitsui', 'Iwasaki', 'Yasuda'],
  },
  'china-shanghai': {
    male: ['Sheng', 'Rong', 'Guo', 'Zhu', 'Shen', 'Tang', 'Ye', 'Nie', 'Xu', 'Lu'],
    female: ['Ling', 'Mei', 'Xiu', 'Fang', 'Lan', 'Ju', 'Lian', 'Hui', 'Qin', 'Yan'],
    last: ['Xu', 'Rong', 'Guo', 'Zhu', 'Shen', 'Lu', 'Tang', 'Ye', 'Sheng', 'Nie'],
  },
  'brazil-rio': {
    male: ['Pedro', 'Joaquim', 'Manuel', 'Francisco', 'Antonio', 'Jose', 'Domingos', 'Bento', 'Miguel', 'Rafael'],
    female: ['Carlota', 'Leopoldina', 'Teresa', 'Mariana', 'Francisca', 'Joaquina', 'Rita', 'Gertrudes', 'Inacia', 'Custodia'],
    last: ['Braganca', 'Andrada', 'Barbacena', 'Paranagua', 'Itaborai', 'Cotegipe', 'Rio Branco', 'Nabuco', 'Patrocinio', 'Fonseca'],
  },
  'australia-melbourne-ind': {
    male: ['Henry', 'George', 'William', 'Alfred', 'Edwin', 'Sydney', 'Marcus', 'Julian', 'Victor', 'Cecil'],
    female: ['Ada', 'Vida', 'Ivy', 'Dymphna', 'Stella', 'Evelyn', 'Mabel', 'Gladys', 'Irene', 'Lilian'],
    last: ['Deakin', 'Barton', 'Parkes', 'Reid', 'Fisher', 'Hughes', 'Bruce', 'Scullin', 'Lyons', 'Menzies'],
  },
  'sweden-stockholm': {
    male: ['Gustav', 'Oscar', 'Carl', 'Axel', 'Alfred', 'Anton', 'Emil', 'Hjalmar', 'Ivar', 'Knut'],
    female: ['Alma', 'Selma', 'Ellen', 'Anna', 'Hilda', 'Gerda', 'Signe', 'Astrid', 'Karin', 'Elin'],
    last: ['Nobel', 'Ericsson', 'Wallenberg', 'Kreuger', 'Strindberg', 'Lagerlof', 'Heidenstam', 'Branting', 'Hedin', 'Andersson'],
  },
  'ireland-dublin-ind': {
    male: ['Charles', 'John', 'William', 'Robert', 'Thomas', 'George', 'Henry', 'Arthur', 'Edmond', 'Daniel'],
    female: ['Kathleen', 'Maud', 'Constance', 'Hanna', 'Winifred', 'Brigid', 'Nora', 'Delia', 'Sara', 'Julia'],
    last: ['Parnell', 'Davitt', 'Griffith', 'Collins', 'De Valera', 'Redmond', 'Butt', 'Shaw', 'Yeats', 'Wilde'],
  },
  'egypt-cairo-ind': {
    male: ['Muhammad', 'Ibrahim', 'Abbas', 'Said', 'Ismail', 'Tawfiq', 'Urabi', 'Zaghloul', 'Mustafa', 'Saad'],
    female: ['Huda', 'Safiya', 'Aisha', 'Zaynab', 'Fatima', 'Nabawiya', 'Malak', 'Esther', 'Rosa', 'Sara'],
    last: ['Ali', 'Urabi', 'Zaghloul', 'Kamil', 'Sharawi', 'Sidqi', 'Nahas', 'Maher', 'Fahmy', 'Hasan'],
  },
  'ottoman-istanbul-ind': {
    male: ['Mehmed', 'Suleyman', 'Ahmed', 'Mustafa', 'Osman', 'Abdullah', 'Hasan', 'Huseyin', 'Ali', 'Omer'],
    female: ['Hatice', 'Ayse', 'Fatma', 'Emine', 'Zeynep', 'Elif', 'Meryem', 'Hanife', 'Rabia', 'Saliha'],
    last: ['Osmanli', 'Pasha', 'Bey', 'Effendi', 'Agha', 'Celebi', 'Tanzimat', 'Ittihad', 'Istanbulu', 'Rumeli'],
  },
  'mexico-mexicocity-ind': {
    male: ['Benito', 'Porfirio', 'Emiliano', 'Francisco', 'Miguel', 'Jose', 'Antonio', 'Diego', 'Vicente', 'Mariano'],
    female: ['Josefa', 'Leona', 'Carmen', 'Dolores', 'Luz', 'Margarita', 'Soledad', 'Guadalupe', 'Refugio', 'Consuelo'],
    last: ['Juarez', 'Diaz', 'Zapata', 'Madero', 'Hidalgo', 'Morelos', 'Villa', 'Garcia', 'Obregon', 'Calles'],
  },
  'argentina-buenosaires-ind': {
    male: ['Jose', 'Manuel', 'Domingo', 'Juan', 'Julio', 'Bartolome', 'Nicolas', 'Carlos', 'Mariano', 'Esteban'],
    female: ['Mariquita', 'Manuela', 'Juana', 'Mercedes', 'Carmen', 'Rosa', 'Elena', 'Sara', 'Remedios', 'Aurelia'],
    last: ['San Martin', 'Sarmiento', 'Rosas', 'Mitre', 'Roca', 'Alberdi', 'Paz', 'Lavalle', 'Belgrano', 'Moreno'],
  },
  'greece-athens-ind': {
    male: ['Ioannis', 'Georgios', 'Nikolaos', 'Dimitrios', 'Konstantinos', 'Alexandros', 'Theodoros', 'Eleftherios', 'Charilaos', 'Spyridon'],
    female: ['Maria', 'Eleni', 'Katerina', 'Sofia', 'Anna', 'Despina', 'Evangelia', 'Zoe', 'Penelope', 'Aspasia'],
    last: ['Papandreou', 'Venizelos', 'Kolokotronis', 'Mavromichalis', 'Kapodistrias', 'Metaxas', 'Papagos', 'Karamanlis', 'Trikoupis', 'Deligiannis'],
  },

  'greece-thessaloniki': {
    male: ['Ioannis', 'Georgios', 'Nikolaos', 'Dimitrios', 'Konstantinos', 'Alexandros', 'Theodoros', 'Eleftherios', 'Charilaos', 'Spyridon'],
    female: ['Maria', 'Eleni', 'Katerina', 'Anna', 'Sofia', 'Despina', 'Evangelia', 'Zoe', 'Aspasia', 'Lydia'],
    last: ['Venizelos', 'Metaxas', 'Papagos', 'Kolokotronis', 'Mavromichalis', 'Kondylis', 'Papadopoulos', 'Karamanlis', 'Tsakalotos', 'Plastiras'],
  },
  'italy-rome-ind': {
    male: ['Giuseppe', 'Camillo', 'Vittorio', 'Umberto', 'Benedetto', 'Francesco', 'Giovanni', 'Antonio', 'Pietro', 'Luigi'],
    female: ['Anita', 'Margherita', 'Elena', 'Maria', 'Teresa', 'Adelaide', 'Virginia', 'Ernesta', 'Linda', 'Bice'],
    last: ['Garibaldi', 'Cavour', 'Mazzini', 'Vittorio', 'Savoia', 'Crispi', 'Giolitti', 'Depretis', 'Rattazzi', 'La Marmora'],
  },
  'china-xian-ind': {
    male: ['Zeng', 'Li', 'Zuo', 'Zhang', 'Hu', 'Lin', 'Shen', 'Ding', 'Wang', 'Ye'],
    female: ['Zeng', 'Li', 'Zuo', 'Zhang', 'Hu', 'Lin', 'Shen', 'Ding', 'Wang', 'Ye'],
    last: ['Zeng', 'Li', 'Zuo', 'Zhang', 'Hu', 'Lin', 'Shen', 'Ding', 'Wang', 'Ye'],
  },
  'india-delhi-ind': {
    male: ['Bahadur', 'Zafar', 'Ghalib', 'Zauq', 'Momin', 'Ibrahim', 'Hali', 'Azad', 'Shibli', 'Sirhindi'],
    female: ['Zinat', 'Taj', 'Nawab', 'Begum', 'Mumtaz', 'Jahanara', 'Roshanara', 'Zeb', 'Sahiba', 'Malka'],
    last: ['Shah', 'Mirza', 'Khan', 'Beg', 'Sahib', 'Jahan', 'Alam', 'Bahadur', 'Zafar', 'Ghalib'],
  },
  'japan-kyoto-ind': {
    male: ['Yukichi', 'Shoin', 'Takamori', 'Shinbei', 'Ryoma', 'Shintaro', 'Kaishu', 'Eiichi', 'Masayoshi', 'Hirobumi'],
    female: ['Tsuneko', 'Hideko', 'Yoko', 'Umeko', 'Sutematsu', 'Shige', 'Taka', 'Hana', 'Kiku', 'Ume'],
    last: ['Fukuzawa', 'Yoshida', 'Saigo', 'Okubo', 'Kido', 'Ito', 'Okuma', 'Itagaki', 'Matsukata', 'Yamagata'],
  },
  'india-varanasi-ind': {
    male: ['Madan', 'Madan', 'Kashiraj', 'Vibhutinarayan', 'Ishvari', 'Prabhunarayan', 'Aditya', 'Udit', 'Vijay', 'Ajay'],
    female: ['Annapurna', 'Vishalakshi', 'Sankatha', 'Kamakshi', 'Durga', 'Kali', 'Lalita', 'Bhavani', 'Gayatri', 'Manasa'],
    last: ['Narayan', 'Singh', 'Kashi', 'Naresh', 'Maharaj', 'Raja', 'Thakur', 'Pandit', 'Shastri', 'Vyas'],
  },
  'egypt-alexandria-ind': {
    male: ['Muhammad', 'Ibrahim', 'Abbas', 'Said', 'Ismail', 'Tawfiq', 'Fuad', 'Farouk', 'Nasser', 'Naguib'],
    female: ['Huda', 'Safiya', 'Aisha', 'Zaynab', 'Fatima', 'Nabawiya', 'Malak', 'Tahani', 'Mona', 'Laila'],
    last: ['Ali', 'Ibrahim', 'Abbas', 'Said', 'Ismail', 'Tawfiq', 'Fuad', 'Farouk', 'Nasser', 'Naguib'],
  },
  'japan-nara-ind': {
    male: ['Shinran', 'Honen', 'Eisai', 'Dogen', 'Nichiren', 'Ippen', 'Myoe', 'Jokei', 'Eison', 'Ninsho'],
    female: ['Eshinni', 'Ane', 'Hime', 'Tsubone', 'Naishi', 'Myobu', 'Ben', 'Koshikibu', 'Izumi', 'Murasaki'],
    last: ['Honganji', 'Otani', 'Higashi', 'Nishi', 'Koshoji', 'Bukkiji', 'Sennyuji', 'Daitokuji', 'Myoshinji', 'Tenryuji'],
  },
  'ottoman-izmir': {
    male: ['Suleyman', 'Selim', 'Murad', 'Bayezid', 'Mehmed', 'Ahmed', 'Osman', 'Orhan', 'Cem', 'Sultan'],
    female: ['Hurrem', 'Nurbanu', 'Safiye', 'Kösem', 'Handan', 'Ayse', 'Fatma', 'Mihrimah', 'Gevherhan', 'Esma'],
    last: ['Osmanli', 'Karamanli', 'Candarli', 'Hamit', 'Menteshe', 'Saruhan', 'Aydin', 'Germiyan', 'Pasha', 'Bey'],
  },
  'mexico-guadalajara': {
    male: ['Porfirio', 'Emiliano', 'Francisco', 'Miguel', 'Antonio', 'Benito', 'Venustiano', 'Alvaro', 'Plutarco', 'Abelardo'],
    female: ['Carmen', 'Guadalupe', 'Dolores', 'Margarita', 'Petra', 'Juana', 'Elena', 'Rafaela', 'Soledad', 'Amada'],
    last: ['Hernandez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores'],
  },
  'argentina-cordoba': {
    male: ['Jose', 'Domingo', 'Juan', 'Facundo', 'Quiroga', 'Sarmiento', 'Bartolome', 'Mariano', 'Esteban', 'Gregorio'],
    female: ['Maria', 'Manuela', 'Juana', 'Faustina', 'Petrona', 'Rosa', 'Carmen', 'Aurelia', 'Camila', 'Lorenza'],
    last: ['Sarmiento', 'Mitre', 'San Martin', 'Belgrano', 'Alberdi', 'Lavalle', 'Paz', 'Urquiza', 'Castro', 'Juarez'],
  },
  'australia-sydney-ind': {
    male: ['Henry', 'Edmund', 'William', 'Charles', 'George', 'Arthur', 'Frederick', 'Albert', 'Ernest', 'Walter'],
    female: ['Ada', 'Ruby', 'Ivy', 'Stella', 'Evelyn', 'Mabel', 'Gladys', 'Doris', 'Violet', 'Elsie'],
    last: ['Parkes', 'Wentworth', 'Blaxland', 'Lawson', 'Macarthur', 'Jamison', 'Marsden', 'Macquarie', 'Brisbane', 'Darling'],
  },
  'australia-adelaide': {
    male: ['George', 'Charles', 'John', 'William', 'Thomas', 'James', 'Robert', 'Edward', 'Frederick', 'Arthur'],
    female: ['Mary', 'Elizabeth', 'Sarah', 'Ann', 'Emma', 'Ellen', 'Alice', 'Edith', 'Florence', 'Ethel'],
    last: ['Light', 'Hindmarsh', 'Gawler', 'Grey', 'Angas', 'Finniss', 'Hanson', 'Strangways', 'Boucaut', 'Playford'],
  },
  'belgium-antwerp': {
    male: ['Leopold', 'Henri', 'Charles', 'Edouard', 'Albert', 'Baudouin', 'Philippe', 'Jean', 'Pierre', 'François'],
    female: ['Marie', 'Charlotte', 'Louise', 'Henriette', 'Astrid', 'Elisabeth', 'Clémentine', 'Stéphanie', 'Joséphine', 'Paola'],
    last: ['Rubens', 'Van Dyck', 'Teniers', 'Jordaens', 'Snyders', 'Brouwer', 'Bruegel', 'Matsys', 'Massys', 'Francken'],
  },
  'brazil-saopaulo-ind': {
    male: ['José', 'Manoel', 'Antonio', 'Francisco', 'João', 'Pedro', 'Luiz', 'Carlos', 'Paulo', 'Mario'],
    female: ['Maria', 'Ana', 'Francisca', 'Teresa', 'Rita', 'Joaquina', 'Carlota', 'Mariana', 'Emilia', 'Olga'],
    last: ['Prado', 'Almeida', 'Camargo', 'Queiroz', 'Moraes', 'Barros', 'Penteado', 'Souza', 'Oliveira', 'Santos'],
  },
  'china-canton-ind': {
    male: ['Deng', 'Ye', 'Wu', 'Lin', 'Chen', 'Huang', 'Liang', 'He', 'Luo', 'Zheng'],
    female: ['Deng', 'Ye', 'Wu', 'Lin', 'Chen', 'Huang', 'Liang', 'He', 'Luo', 'Zheng'],
    last: ['Deng', 'Ye', 'Wu', 'Lin', 'Chen', 'Huang', 'Liang', 'He', 'Luo', 'Zheng'],
  },
  'india-calcutta': {
    male: ['Rammohan', 'Dwarkanath', 'Radhanath', 'Ishwar', 'Bankim', 'Michael', 'Surendranath', 'Gopal', 'Bipin', 'Aurobindo'],
    female: ['Savitri', 'Kadambini', 'Sarojini', 'Toru', 'Mrinalini', 'Swarnakumari', 'Kamini', 'Mankumari', 'Pritilata', 'Bina'],
    last: ['Roy', 'Tagore', 'Dutt', 'Ghosh', 'Bose', 'Mitra', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Sen'],
  },
  'india-madras': {
    male: ['Subramania', 'Venkata', 'Ramaswami', 'Srinivasa', 'Annamalai', 'Muthu', 'Kandasamy', 'Periyar', 'Rajaji', 'Kamaraj'],
    female: ['Muthulakshmi', 'Janaki', 'Savitri', 'Lakshmi', 'Saraswati', 'Meenakshi', 'Kamakshi', 'Visalakshi', 'Durgabai', 'Annie'],
    last: ['Iyer', 'Iyengar', 'Mudaliar', 'Chettiar', 'Pillai', 'Maruthu', 'Thevar', 'Nadar', 'Reddy', 'Naidu'],
  },
  'ireland-cork-ind': {
    male: ['Michael', 'Daniel', 'Jeremiah', 'Timothy', 'Cornelius', 'Denis', 'Florence', 'Bartholomew', 'Edmond', 'Nicholas'],
    female: ['Mary', 'Ellen', 'Johanna', 'Margaret', 'Bridget', 'Catherine', 'Honora', 'Julia', 'Nora', 'Kitty'],
    last: ['Collins', 'Barry', 'MacCarthy', 'O’Brien', 'O’Sullivan', 'O’Donovan', 'O’Mahony', 'Hegarty', 'Crowley', 'Donegan'],
  },
  'japan-osaka-ind': {
    male: ['Fukuzawa', 'Oishi', 'Dojima', 'Yodoya', 'Konoike', 'Sumitomo', 'Mitsui', 'Kawasaki', 'Shibusawa', 'Iwasaki'],
    female: ['Yoshi', 'Taka', 'Hana', 'Kiku', 'Ume', 'Take', 'Matsu', 'Tsuru', 'Kame', 'Fuji'],
    last: ['Fukuzawa', 'Oishi', 'Dojima', 'Yodoya', 'Konoike', 'Sumitomo', 'Mitsui', 'Kawasaki', 'Shibusawa', 'Iwasaki'],
  },
  'netherlands-amsterdam-ind': {
    male: ['Johan', 'Pieter', 'Willem', 'Hendrik', 'Jan', 'Cornelis', 'Dirk', 'Gerrit', 'Adriaen', 'Barthold'],
    female: ['Aletta', 'Johanna', 'Maria', 'Cornelia', 'Elisabeth', 'Petronella', 'Geertruid', 'Helena', 'Sara', 'Anna'],
    last: ['Thorbecke', 'Van Hall', 'Van Hogendorp', 'Schimmelpenninck', 'Rochussen', 'Van Bosse', 'Kapteyn', 'De Vries', 'Bakker', 'Visser'],
  },
  'russia-moscow-ind': {
    male: ['Alexander', 'Nikolai', 'Mikhail', 'Sergei', 'Dmitri', 'Ivan', 'Pyotr', 'Vasily', 'Fyodor', 'Vladimir'],
    female: ['Anna', 'Maria', 'Sofia', 'Natalia', 'Olga', 'Tatiana', 'Elena', 'Vera', 'Nadezhda', 'Lyubov'],
    last: ['Tolstoy', 'Dostoevsky', 'Turgenev', 'Chekhov', 'Gogol', 'Pushkin', 'Lermontov', 'Goncharov', 'Saltykov', 'Leskov'],
  },
  'spain-madrid-ind': {
    male: ['Fernando', 'Alfonso', 'Amadeo', 'Primo', 'Canovas', 'Sagasta', 'Maura', 'Romanones', 'Dato', 'Sanjurjo'],
    female: ['Isabel', 'Cristina', 'Maria', 'Victoria', 'Elena', 'Pilar', 'Carmen', 'Dolores', 'Mercedes', 'Luisa'],
    last: ['Borbón', 'Canovas', 'Sagasta', 'Maura', 'Romanones', 'Dato', 'Silvela', 'Azcarate', 'Costa', 'Giner'],
  },

  // --- Atomic Age ---
  'uk-london-60s': {
    male: ['Colin', 'Barry', 'Keith', 'Roger', 'Trevor', 'Dennis', 'Ian', 'Brian'],
    female: ['Samantha', 'Angela', 'Yvonne', 'Diane', 'Susan', 'Wendy', 'Karen', 'Gillian'],
    last: ['Whitfield', 'Bennet', 'Hargreaves', 'Macleod', 'Drummond', 'Atkinson', 'Gower', 'Lynch'],
  },
  'usa-detroit': {
    male: ['Marcus', 'Earl', 'Donnie', 'Walt', 'Roy', 'Curtis', 'Leroy', 'Malik'],
    female: ['Diana', 'Lorraine', 'Sharon', 'Cynthia', 'Brenda', 'Yolanda', 'Cheryl', 'Jacqueline'],
    last: ['Reed', 'Brooks', 'Ellis', 'Gentry', 'Slaton', 'Whitfield', 'Massey', 'Okafor'],
  },
  'ussr-moscow': {
    male: ['Dmitri', 'Anatoly', 'Viktor', 'Sergei', 'Boris', 'Yuri', 'Lev', 'Ruslan'],
    female: ['Natasha', 'Lyudmila', 'Irina', 'Zoya', 'Raisa', 'Galina', 'Tatiana', 'Svetlana'],
    last: ['Volkov', 'Zhukov', 'Sokolov', 'Petrov', 'Morozov', 'Ivanov', 'Lebedev', 'Orlov'],
  },
  'japan-tokyo-60s': {
    male: ['Kenji', 'Takeshi', 'Hiro', 'Yasuo', 'Shinji', 'Masaru', 'Hideo', 'Noboru'],
    female: ['Yuki', 'Keiko', 'Haruko', 'Nobuko', 'Rieko', 'Sachiko', 'Aiko', 'Fumiko'],
    last: ['Tanaka', 'Nakamura', 'Yamamoto', 'Kobayashi', 'Saito', 'Watanabe', 'Kimura', 'Hayashi'],
  },
  'india-delhi-60s': {
    male: ['Ramesh', 'Anil', 'Vijay', 'Suresh', 'Girish', 'Mohan', 'Prakash', 'Bhupinder'],
    female: ['Sarla', 'Kamala', 'Sunita', 'Anjali', 'Kavita', 'Rekha', 'Shanti', 'Nirmala'],
    last: ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Kapoor', 'Nair', 'Joshi', 'Bhardwaj'],
  },
  'ussr-leningrad': {
    male: ['Vladimir', 'Alexei', 'Nikolai', 'Pavel', 'Grigory', 'Mikhail', 'Andrei', 'Oleg'],
    female: ['Anna', 'Maria', 'Olga', 'Tatiana', 'Nina', 'Valentina', 'Raisa', 'Zinaida'],
    last: ['Kirov', 'Zhdanov', 'Kosygin', 'Romanov', 'Grigoriev', 'Soloviev', 'Brodsky', 'Akhmatova'],
  },
  'ussr-kiev': {
    male: ['Viktor', 'Leonid', 'Pyotr', 'Ivan', 'Stepan', 'Mykola', 'Oleksandr', 'Vasyl'],
    female: ['Nadia', 'Oksana', 'Lyudmila', 'Valentina', 'Maria', 'Anna', 'Kateryna', 'Halyna'],
    last: ['Khrushchev', 'Brezhnev', 'Shevchenko', 'Kovalenko', 'Bondarenko', 'Tkachenko', 'Shevchuk', 'Kravchuk'],
  },
  'usa-newyork-atomic': {
    male: ['Frank', 'Tony', 'Sal', 'Vinnie', 'Joey', 'Mickey', 'Lou', 'Paulie'],
    female: ['Francine', 'Tina', 'Rosa', 'Angie', 'Marie', 'Lucia', 'Theresa', 'Connie'],
    last: ['Sinatra', 'Sullivan', 'Goldstein', 'Rivera', 'Marciano', 'Berra', 'Kowalski', 'Rizzo'],
  },
  'usa-losangeles': {
    male: ['Jack', 'Chuck', 'Dennis', 'Gary', 'Larry', 'Randy', 'Terry', 'Bruce'],
    female: ['Marilyn', 'Debbie', 'Candy', 'Brenda', 'Donna', 'Linda', 'Sharon', 'Pam'],
    last: ['Warner', 'Disney', 'Hughes', 'Chandler', 'Hearst', 'Goldwyn', 'Mayer', 'Cohn'],
  },
  'uk-liverpool': {
    male: ['John', 'Paul', 'George', 'Ringo', 'Pete', 'Stuart', 'Brian', 'Mick'],
    female: ['Cilla', 'Maureen', 'Cynthia', 'Pattie', 'Mimi', 'Julia', 'Dot', 'Beryl'],
    last: ['Lennon', 'McCartney', 'Harrison', 'Starkey', 'Epstein', 'Martin', 'Sutcliffe', 'Best'],
  },
  'france-paris-atomic': {
    male: ['Jean-Paul', 'Albert', 'Jacques', 'Pierre', 'Claude', 'Michel', 'Andre', 'Bernard'],
    female: ['Simone', 'Francoise', 'Juliette', 'Brigitte', 'Catherine', 'Isabelle', 'Nathalie', 'Sylvie'],
    last: ['Sartre', 'Camus', 'Gainsbourg', 'Truffaut', 'Godard', 'Belmondo', 'Delon', 'Aznavour'],
  },
  'germany-berlin-atomic': {
    male: ['Willy', 'Walter', 'Erich', 'Horst', 'Gunter', 'Klaus', 'Dieter', 'Jurgen'],
    female: ['Marlene', 'Hanna', 'Lotte', 'Greta', 'Ursula', 'Brigitte', 'Ingrid', 'Hildegard'],
    last: ['Brandt', 'Ulbricht', 'Honecker', 'Adenauer', 'Erhard', 'Kiesinger', 'Barzel', 'Wehner'],
  },
  'italy-rome-atomic': {
    male: ['Federico', 'Marcello', 'Vittorio', 'Alberto', 'Nino', 'Ugo', 'Enrico', 'Giancarlo'],
    female: ['Sophia', 'Gina', 'Claudia', 'Monica', 'Virna', 'Sandra', 'Rossana', 'Anita'],
    last: ['Fellini', 'Mastroianni', 'Gassman', 'Sordi', 'Loren', 'Lollobrigida', 'Cardinale', 'Vitti'],
  },
  'china-beijing': {
    male: ['Wei', 'Jian', 'Gang', 'Lei', 'Min', 'Tao', 'Xin', 'Yong'],
    female: ['Fang', 'Jing', 'Li', 'Na', 'Ping', 'Yan', 'Hong', 'Xia'],
    last: ['Mao', 'Zhou', 'Deng', 'Liu', 'Zhu', 'Chen', 'Lin', 'Peng'],
  },
  'brazil-saopaulo-atomic': {
    male: ['Pele', 'Garrincha', 'Zico', 'Socrates', 'Falcao', 'Toninho', 'Careca', 'Bebeto'],
    female: ['Xuxa', 'Maite', 'Fernanda', 'Patricia', 'Luciana', 'Mariana', 'Renata', 'Debora'],
    last: ['Nascimento', 'Pelegrini', 'Buarque', 'Veloso', 'Gil', 'Jobim', 'Bonfim', 'Abreu'],
  },
  'nigeria-lagos-atomic': {
    male: ['Fela', 'Wole', 'Chinua', 'Cyprian', 'Bola', 'Segun', 'Tunde', 'Yomi'],
    female: ['Flora', 'Buchi', 'Mabel', 'Stella', 'Grace', 'Funmilayo', 'Margaret', 'Remi'],
    last: ['Kuti', 'Soyinka', 'Achebe', 'Ekwensi', 'Balewa', 'Azikiwe', 'Awolowo', 'Shagari'],
  },
  'australia-sydney': {
    male: ['Paul', 'John', 'Peter', 'Barry', 'Graham', 'Don', 'Bob', 'Jack'],
    female: ['Olivia', 'Helen', 'Judy', 'Colleen', 'Wendy', 'Robyn', 'Kerrie', 'Denise'],
    last: ['Hogan', 'Newton', 'Humphries', 'Packer', 'Murdoch', 'Thomson', 'Fairfax', 'Myer'],
  },
  'cuba-havana': {
    male: ['Fidel', 'Raul', 'Che', 'Camilo', 'Huber', 'Osvaldo', 'Ramiro', 'Guillermo'],
    female: ['Celia', 'Vilma', 'Haydee', 'Melba', 'Tete', 'Aleida', 'Nydia', 'Mariela'],
    last: ['Castro', 'Guevara', 'Cienfuegos', 'Matos', 'Dorticos', 'Hart', 'Santamaria', 'Espin'],
  },
  'spain-madrid': {
    male: ['Francisco', 'Luis', 'Carlos', 'Miguel', 'Rafael', 'Emilio', 'Vicente', 'Andres'],
    female: ['Carmen', 'Pilar', 'Dolores', 'Mercedes', 'Rosario', 'Esperanza', 'Amparo', 'Consuelo'],
    last: ['Franco', 'Fraga', 'Arias', 'Suarez', 'Gonzalez', 'Carrero', 'Lopez', 'Martin'],
  },
  'poland-warsaw': {
    male: ['Wladyslaw', 'Jozef', 'Tadeusz', 'Stefan', 'Andrzej', 'Jerzy', 'Marian', 'Kazimierz'],
    female: ['Maria', 'Irena', 'Wanda', 'Krystyna', 'Zofia', 'Halina', 'Danuta', 'Barbara'],
    last: ['Gomulka', 'Gierek', 'Jaruzelski', 'Mazowiecki', 'Walesa', 'Michnik', 'Kuron', 'Geremek'],
  },
  'egypt-cairo-atomic': {
    male: ['Gamal', 'Anwar', 'Hosni', 'Naguib', 'Amer', 'Heikal', 'Mahfouz', 'Taha'],
    female: ['Umm', 'Faten', 'Soad', 'Shadia', 'Magda', 'Hind', 'Mariam', 'Laila'],
    last: ['Nasser', 'Sadat', 'Mubarak', 'Naguib', 'Amer', 'Heikal', 'Mahfouz', 'Hussein'],
  },
  'canada-toronto-atomic': {
    male: ['John', 'William', 'Robert', 'Pierre', 'Jean', 'Douglas', 'Murray', 'Gordon'],
    female: ['Mary', 'Margaret', 'Helen', 'Catherine', 'Yvette', 'Shirley', 'Donna', 'Maureen'],
    last: ['Macdonald', 'Laurier', 'Tremblay', 'Gagnon', 'Smith', 'Brown', 'Wilson', 'Roy'],
  },
  'mexico-mexicocity-atomic': {
    male: ['Diego', 'Carlos', 'Miguel', 'Jorge', 'Raul', 'Fernando', 'Andres', 'Hugo'],
    female: ['Frida', 'Maria', 'Lucia', 'Elena', 'Sofia', 'Valeria', 'Camila', 'Ximena'],
    last: ['Hernandez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Rivera', 'Torres', 'Ramirez'],
  },
  'korea-seoul-atomic': {
    male: ['Jinho', 'Minjun', 'Seojun', 'Donghyuk', 'Taeyang', 'Jisung', 'Hyunwoo', 'Sungmin'],
    female: ['Jisoo', 'Minji', 'Seoyeon', 'Hana', 'Yuna', 'Soojin', 'Eunji', 'Chaewon'],
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon'],
  },
  'sweden-stockholm-atomic': {
    male: ['Lars', 'Anders', 'Karl', 'Erik', 'Goran', 'Sten', 'Olof', 'Bjorn'],
    female: ['Anna', 'Margareta', 'Kerstin', 'Ingrid', 'Birgitta', 'Eva', 'Lena', 'Sara'],
    last: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson'],
  },

  'sweden-malmo': {
    male: ['Lars', 'Anders', 'Karl', 'Erik', 'Göran', 'Sten', 'Olof', 'Björn', 'Jörgen', 'Magnus'],
    female: ['Anna', 'Margareta', 'Kerstin', 'Ingrid', 'Birgitta', 'Eva', 'Lena', 'Sara', 'Ulrika', 'Karin'],
    last: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson'],
  },
  'egypt-alexandria-atomic': {
    male: ['Naguib', 'Gamal', 'Anwar', 'Hosni', 'Youssef', 'Taha', 'Naguib', 'Ali', 'Hassan', 'Ibrahim'],
    female: ['Faten', 'Soad', 'Shadia', 'Magda', 'Hind', 'Mariam', 'Laila', 'Hala', 'Madiha', 'Nadia'],
    last: ['Mahfouz', 'Hakim', 'Idris', 'Wali', 'Ghitany', 'El Saadawi', 'Soueif', 'Al Aswany', 'Salih', 'Mourad'],
  },
  'china-xian-atomic': {
    male: ['Xi', 'Li', 'Peng', 'Hu', 'Zhao', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang'],
    female: ['Xi', 'Li', 'Peng', 'Hu', 'Zhao', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang'],
    last: ['Xi', 'Li', 'Peng', 'Hu', 'Zhao', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang'],
  },
  'japan-kyoto-atomic': {
    male: ['Hayato', 'Noboru', 'Kakuei', 'Masayoshi', 'Zenko', 'Yasuhiro', 'Kiichi', 'Takeo', 'Zenko', 'Noboru'],
    female: ['Mitsuko', 'Mutsuko', 'Hana', 'Masa', 'Shigeko', 'Setsu', 'Yoko', 'Akiko', 'Michiko', 'Sadako'],
    last: ['Ikeda', 'Sato', 'Tanaka', 'Ohira', 'Suzuki', 'Nakasone', 'Takeshita', 'Uno', 'Kaifu', 'Miyazawa'],
  },
  'canada-montreal': {
    male: ['Pierre', 'Jean', 'Jacques', 'Louis', 'Michel', 'Francois', 'Paul', 'David', 'Marc', 'Simon'],
    female: ['Marie', 'Anne', 'Marguerite', 'Catherine', 'Louise', 'Madeleine', 'Helene', 'Claire', 'Jeanne', 'Julie'],
    last: ['Tremblay', 'Gagnon', 'Cote', 'Bouchard', 'Roy', 'Morin', 'Lavoie', 'Gauthier', 'Fortin', 'Gagne'],
  },
  'mexico-guadalajara-atomic': {
    male: ['Jose', 'Juan', 'Miguel', 'Carlos', 'Luis', 'Jorge', 'Raul', 'Fernando', 'Andres', 'Ricardo'],
    female: ['Maria', 'Guadalupe', 'Rosa', 'Carmen', 'Ana', 'Leticia', 'Elena', 'Sofia', 'Teresa', 'Veronica'],
    last: ['Hernandez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores'],
  },
  'korea-busan': {
    male: ['Jaehyuk', 'Minho', 'Hyunwoo', 'Sungmin', 'Donghyun', 'Taemin', 'Changmin', 'Yesung', 'Jonghyun', 'Kyuhyun'],
    female: ['Sooyoung', 'Seohyun', 'Yuri', 'Taeyeon', 'Hyoyeon', 'Sunny', 'Yoona', 'Tiffany', 'Jessica', 'Sooyeon'],
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Shin', 'Han'],
  },
  'australia-melbourne-atomic': {
    male: ['Robert', 'Harold', 'Arthur', 'Stanley', 'Gordon', 'Norman', 'Leslie', 'Cecil', 'Ernest', 'Walter'],
    female: ['Dame', 'Nellie', 'Enid', 'Doris', 'Gladys', 'Ivy', 'Ruby', 'Elsie', 'Mabel', 'Ethel'],
    last: ['Menzies', 'Holt', 'Gorton', 'McMahon', 'Whitlam', 'Fraser', 'Hawke', 'Keating', 'Howard', 'Rudd'],
  },
  'brazil-rio-atomic': {
    male: ['Juscelino', 'Janio', 'Joao', 'Castelo', 'Costa', 'Medici', 'Geisel', 'Figueiredo', 'Tancredo', 'Sarney'],
    female: ['Sarah', 'Yara', 'Alzira', 'Carmem', 'Dulce', 'Scylla', 'Risoleta', 'Marly', 'Therezinha', 'Ruth'],
    last: ['Kubitschek', 'Quadros', 'Goulart', 'Branco', 'Silva', 'Medici', 'Geisel', 'Figueiredo', 'Neves', 'Sarney'],
  },
  'china-shanghai-atomic': {
    male: ['Jiang', 'Zhu', 'Li', 'Hu', 'Wen', 'Xi', 'Deng', 'Chen', 'Zhao', 'Qiao'],
    female: ['Jiang', 'Zhu', 'Li', 'Hu', 'Wen', 'Xi', 'Deng', 'Chen', 'Zhao', 'Qiao'],
    last: ['Jiang', 'Zhu', 'Li', 'Hu', 'Wen', 'Xi', 'Deng', 'Chen', 'Zhao', 'Qiao'],
  },
  'cuba-santiago': {
    male: ['Frank', 'Josue', 'Renato', 'Guillermo', 'Faustino', 'Efigenio', 'Raul', 'Ramiro', 'Huber', 'Calixto'],
    female: ['Celia', 'Vilma', 'Haydee', 'Melba', 'Maria', 'Tetey', 'Gladys', 'Dora', 'Nancy', 'Mirta'],
    last: ['Pais', 'Guevara', 'Castro', 'Cienfuegos', 'Matos', 'Almeida', 'Roca', 'Hart', 'Rodriguez', 'Valdes'],
  },
  'france-marseille-atomic': {
    male: ['Gaston', 'Marcel', 'Fernandel', 'Tino', 'Yves', 'Charles', 'Johnny', 'Eddy', 'Michel', 'Alain'],
    female: ['Edith', 'Brigitte', 'Catherine', 'Jeanne', 'Simone', 'Arletty', 'Michèle', 'Annie', 'France', 'Dalida'],
    last: ['Pagnol', 'Raimu', 'Rossi', 'Montand', 'Aznavour', 'Hallyday', 'Mitchell', 'Delon', 'Belmondo', 'Bardot'],
  },
  'germany-hamburg': {
    male: ['Helmut', 'Willy', 'Walter', 'Ernst', 'Herbert', 'Karl', 'Heinrich', 'Otto', 'Fritz', 'Hans'],
    female: ['Lotte', 'Hildegard', 'Grete', 'Anni', 'Frieda', 'Martha', 'Emma', 'Clara', 'Johanna', 'Elisabeth'],
    last: ['Schmidt', 'Brandt', 'Ulbrich', 'Wehner', 'Barzel', 'Strauss', 'Scheel', 'Genscher', 'Kohl', 'Mischnick'],
  },
  'india-bombay-atomic': {
    male: ['Jawaharlal', 'Vallabhbhai', 'Rajendra', 'Sarvepalli', 'Abul', 'Morarji', 'Lal', 'Charan', 'Jagjivan', 'Sanjay'],
    female: ['Indira', 'Vijayalakshmi', 'Sarojini', 'Kamala', 'Sucheta', 'Rajkumari', 'Aruna', 'Usha', 'Najma', 'Mohsina'],
    last: ['Nehru', 'Patel', 'Prasad', 'Radhakrishnan', 'Azad', 'Desai', 'Shastri', 'Singh', 'Ram', 'Gandhi'],
  },
  'italy-milan-atomic': {
    male: ['Enrico', 'Alcide', 'Palmiro', 'Pietro', 'Giuseppe', 'Amintore', 'Aldo', 'Enrico', 'Giulio', 'Bettino'],
    female: ['Nilde', 'Teresa', 'Lina', 'Camilla', 'Tina', 'Rossana', 'Luciana', 'Giuliana', 'Emma', 'Susanna'],
    last: ['Mattei', 'Gasperi', 'Togliatti', 'Nenni', 'Saragat', 'Fanfani', 'Moro', 'Berlinguer', 'Andreotti', 'Craxi'],
  },
  'japan-osaka-atomic': {
    male: ['Shigeru', 'Nobusuke', 'Hayato', 'Eisaku', 'Kakuei', 'Takeo', 'Yasuhiro', 'Noboru', 'Sosuke', 'Toshiki'],
    female: ['Takako', 'Mutsuko', 'Hana', 'Masa', 'Shigeko', 'Setsu', 'Yoko', 'Akiko', 'Michiko', 'Sadako'],
    last: ['Yoshida', 'Kishi', 'Ikeda', 'Sato', 'Tanaka', 'Miki', 'Fukuda', 'Ohira', 'Suzuki', 'Nakasone'],
  },
  'nigeria-ibadan': {
    male: ['Nnamdi', 'Obafemi', 'Ahmadu', 'Tafawa', 'Michael', 'Aminu', 'Joseph', 'Dennis', 'Mbonu', 'Eyo'],
    female: ['Funmilayo', 'Margaret', 'Hannah', 'Adedoyin', 'Olufunmilayo', 'Wuraola', 'Abigail', 'Grace', 'Esther', 'Rebecca'],
    last: ['Azikiwe', 'Awolowo', 'Bello', 'Balewa', 'Okpara', 'Kano', 'Tarka', 'Osadebe', 'Ibiam', 'Adeyemo'],
  },
  'poland-krakow-atomic': {
    male: ['Wladyslaw', 'Edward', 'Stanislaw', 'Jozef', 'Aleksander', 'Leszek', 'Tadeusz', 'Mieczyslaw', 'Karol', 'Stefan'],
    female: ['Maria', 'Wanda', 'Halina', 'Irena', 'Zofia', 'Danuta', 'Barbara', 'Krystyna', 'Ewa', 'Anna'],
    last: ['Gomulka', 'Gierek', 'Jaruzelski', 'Kania', 'Rakowski', 'Messner', 'Zawadzki', 'Ochab', 'Cyrankiewicz', 'Jaroszewicz'],
  },
  'spain-barcelona-atomic': {
    male: ['Jordi', 'Josep', 'Joan', 'Pere', 'Miquel', 'Ramon', 'Antoni', 'Francesc', 'Lluis', 'Carles'],
    female: ['Montserrat', 'Nuria', 'Marta', 'Anna', 'Laia', 'Júlia', 'Clara', 'Aina', 'Mar', 'Jana'],
    last: ['Pujol', 'Maragall', 'Mas', 'Puigdemont', 'Rovira', 'Junqueras', 'Torra', 'Aragonès', 'Illia', 'Tarradellas'],
  },

  // --- Modern Day ---
  'usa-brooklyn': {
    male: ['Jay', 'Leo', 'Sam', 'Kai', 'Omar', 'Eli', 'Mateo', 'Darius', 'Jonah', 'Milan'],
    female: ['Maya', 'Zoe', 'Noor', 'Aria', 'Luna', 'Ivy', 'Amara', 'Sofia', 'Hana', 'Priya'],
    last: ['Reyes', 'Chen', 'Okafor', 'Goldstein', 'Rivera', 'Park', 'Haddad', 'Cohen', 'Diallo', 'Nguyen'],
  },
  'uk-london': {
    male: ['Oliver', 'Freddie', 'Alfie', 'Charlie', 'Harry', 'George', 'Arthur', 'Theo', 'Edward', 'James'],
    female: ['Amelia', 'Poppy', 'Ruby', 'Daisy', 'Isla', 'Lily', 'Florence', 'Evie', 'Grace', 'Sophie'],
    last: ['Bennett', 'Carter', 'Bell', 'Sharma', 'Khan', 'Osei', 'Murphy', 'Patel', 'Davies', 'Clarke'],
  },
  'india-bengaluru': {
    male: ['Arjun', 'Kiran', 'Rohan', 'Vikram', 'Aditya', 'Nikhil', 'Karthik', 'Suresh', 'Deepak', 'Manoj'],
    female: ['Priya', 'Divya', 'Ananya', 'Meera', 'Lakshmi', 'Tara', 'Kavya', 'Pooja', 'Shreya', 'Nandini'],
    last: ['Sharma', 'Rao', 'Iyer', 'Nair', 'Kapoor', 'Das', 'Menon', 'Reddy', 'Kulkarni', 'Bhat'],
  },
  'japan-tokyo': {
    male: ['Haruto', 'Ren', 'Yuto', 'Sota', 'Kaito', 'Riku', 'Hayato', 'Kenji', 'Takumi', 'Daiki'],
    female: ['Yui', 'Aoi', 'Hina', 'Mei', 'Sakura', 'Rin', 'Koharu', 'Akari', 'Yuna', 'Mio'],
    last: ['Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Saito', 'Watanabe'],
  },
  'nigeria-lagos': {
    male: ['Chinedu', 'Oluwaseun', 'Tunde', 'Emeka', 'Kelechi', 'Babatunde', 'Segun', 'Ifeanyi'],
    female: ['Adaeze', 'Folake', 'Ngozi', 'Amaka', 'Chiamaka', 'Yewande', 'Bisi', 'Halima'],
    last: ['Adeyemi', 'Okonkwo', 'Balogun', 'Eze', 'Chukwu', 'Obi', 'Adebayo', 'Nwosu'],
  },
  'australia-melbourne': {
    male: ['Jack', 'Lachlan', 'Hamish', 'Angus', 'Callum', 'Toby', 'Jarrah', 'Riley'],
    female: ['Chloe', 'Mackenzie', 'Poppy', 'Isla', 'Matilda', 'Ruby', 'Sophie', 'Billie'],
    last: ['Whitlam', 'Hargreaves', 'Callaghan', 'Molloy', 'Rafter', 'Kingsley', 'Doherty', 'Baxter'],
  },
  'brazil-saopaulo': {
    male: ['Joao', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Bruno', 'Diego', 'Caio'],
    female: ['Ana', 'Beatriz', 'Larissa', 'Mariana', 'Camila', 'Juliana', 'Luana', 'Isadora'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Barbosa'],
  },
  'usa-chicago-modern': {
    male: ['Barack', 'Michael', 'Walter', 'Jesse', 'Richard', 'Rahm', 'David', 'Anthony', 'Kevin', 'Marcus'],
    female: ['Michelle', 'Oprah', 'Valerie', 'Tammy', 'Lori', 'Toni', 'Carol', 'Dorothy', 'Gwendolyn', 'Sadie'],
    last: ['Obama', 'Jordan', 'Winfrey', 'Jackson', 'Daley', 'Emanuel', 'Axelrod', 'Duckworth', 'Lightfoot', 'Preckwinkle'],
  },
  'usa-losangeles-modern': {
    male: ['LeBron', 'Kobe', 'Brad', 'Leonardo', 'Diego', 'Mateo', 'Jamal', 'Chris', 'Tyler', 'Devin'],
    female: ['Beyonce', 'Ariana', 'Scarlett', 'Jennifer', 'Priya', 'Lucia', 'Ashley', 'Megan', 'Vanessa', 'Zendaya'],
    last: ['James', 'Bryant', 'Pitt', 'DiCaprio', 'Garcia', 'Johnson', 'Smith', 'Brown', 'Lee', 'Kim'],
  },
  'uk-manchester-modern': {
    male: ['Liam', 'Noel', 'Marcus', 'Phil', 'Gary', 'Ryan', 'Paul', 'Ian', 'Andy', 'Shaun'],
    female: ['Beth', 'Lucy', 'Sophie', 'Chloe', 'Hannah', 'Georgia', 'Ella', 'Molly', 'Freya', 'Ruby'],
    last: ['Gallagher', 'Rashford', 'Foden', 'Neville', 'Scholes', 'Giggs', 'Keane', 'Ferdinand', 'Rooney', 'Charlton'],
  },
  'france-paris-modern': {
    male: ['Hugo', 'Louis', 'Jules', 'Adam', 'Nathan', 'Raphael', 'Arthur', 'Ethan', 'Lucas', 'Theo'],
    female: ['Chloe', 'Manon', 'Camille', 'Lea', 'Sarah', 'Ines', 'Jade', 'Louise', 'Emma', 'Anna'],
    last: ['Martin', 'Bernard', 'Dubois', 'Laurent', 'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David'],
  },
  'germany-berlin-modern': {
    male: ['Lukas', 'Felix', 'Jonas', 'Leon', 'Finn', 'Paul', 'Noah', 'Elias', 'Ben', 'David'],
    female: ['Marie', 'Sophie', 'Emilia', 'Hannah', 'Mia', 'Lena', 'Leonie', 'Anna', 'Laura', 'Johanna'],
    last: ['Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schaefer'],
  },
  'italy-rome-modern': {
    male: ['Francesco', 'Alessandro', 'Lorenzo', 'Mattia', 'Gabriele', 'Riccardo', 'Tommaso', 'Edoardo', 'Federico', 'Giuseppe'],
    female: ['Sofia', 'Giulia', 'Aurora', 'Alice', 'Ginevra', 'Beatrice', 'Ludovica', 'Vittoria', 'Matilde', 'Camilla'],
    last: ['Rossi', 'Bianchi', 'Ferrari', 'Esposito', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti'],
  },
  'spain-madrid-modern': {
    male: ['Hugo', 'Martin', 'Lucas', 'Mateo', 'Leo', 'Daniel', 'Alejandro', 'Pablo', 'Alvaro', 'David'],
    female: ['Lucia', 'Sofia', 'Martina', 'Maria', 'Paula', 'Daniela', 'Carla', 'Alba', 'Noa', 'Valeria'],
    last: ['Garcia', 'Fernandez', 'Gonzalez', 'Rodriguez', 'Lopez', 'Martinez', 'Sanchez', 'Perez', 'Martin', 'Gomez'],
  },
  'canada-toronto': {
    male: ['Liam', 'Noah', 'Logan', 'Lucas', 'Ethan', 'Aiden', 'Carter', 'Owen', 'Grayson', 'Wyatt'],
    female: ['Olivia', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Ella'],
    last: ['Smith', 'Brown', 'Tremblay', 'Martin', 'Roy', 'Gagnon', 'Lee', 'Wilson', 'Macdonald', 'Singh'],
  },
  'china-shanghai-modern': {
    male: ['Wei', 'Fang', 'Lei', 'Min', 'Tao', 'Xin', 'Chao', 'Hao', 'Kun', 'Peng'],
    female: ['Fang', 'Jing', 'Li', 'Na', 'Ping', 'Yan', 'Hong', 'Xia', 'Chen', 'Dong'],
    last: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou'],
  },
  'korea-seoul': {
    male: ['Minjun', 'Seojun', 'Jiho', 'Junseo', 'Donghyun', 'Taeyang', 'Jimin', 'Jungkook', 'Namjoon', 'Yoongi'],
    female: ['Seoyeon', 'Jiwoo', 'Seoa', 'Yuna', 'Jieun', 'Chaewon', 'Nayeon', 'Jisoo', 'Minji', 'Hana'],
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Shin', 'Han'],
  },
  'mexico-mexicocity': {
    male: ['Santiago', 'Mateo', 'Sebastian', 'Leonardo', 'Matias', 'Emiliano', 'Diego', 'Miguel', 'Angel', 'Gael'],
    female: ['Sofia', 'Valentina', 'Regina', 'Camila', 'Ximena', 'Daniela', 'Valeria', 'Maria', 'Fernanda', 'Dulce'],
    last: ['Hernandez', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Rodriguez', 'Sanchez', 'Ramirez', 'Torres'],
  },
  'argentina-buenosaires': {
    male: ['Lionel', 'Diego', 'Sergio', 'Javier', 'Pablo', 'Martin', 'Nicolas', 'Facundo', 'Gonzalo', 'Rodrigo'],
    female: ['Micaela', 'Camila', 'Sofia', 'Valentina', 'Martina', 'Luciana', 'Florencia', 'Agustina', 'Paula', 'Daniela'],
    last: ['Messi', 'Maradona', 'Gardel', 'Borges', 'Peron', 'Menem', 'Kirchner', 'Sabato', 'Cortazar', 'Fangio'],
  },
  'southafrica-joburg': {
    male: ['Sipho', 'Thabo', 'Lungile', 'Bongani', 'Sifiso', 'Mandla', 'Johan', 'Pieter', 'Willem', 'Andries'],
    female: ['Naledi', 'Lerato', 'Palesa', 'Karabo', 'Zanele', 'Anika', 'Mariam', 'Elna', 'Sarita', 'Priya'],
    last: ['Dlamini', 'Zulu', 'Mahlangu', 'Botha', 'Smuts', 'Malan', 'Naidoo', 'Pillay', 'Pretorius', 'Van Wyk'],
  },
  'russia-moscow-modern': {
    male: ['Artyom', 'Maxim', 'Ivan', 'Dmitry', 'Kirill', 'Nikita', 'Yegor', 'Timur', 'Vladislav', 'Andrey'],
    female: ['Sofia', 'Maria', 'Anna', 'Alisa', 'Viktoria', 'Polina', 'Alexandra', 'Ksenia', 'Varvara', 'Yelizaveta'],
    last: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Petrov'],
  },
  'netherlands-amsterdam-modern': {
    male: ['Daan', 'Sem', 'Lucas', 'Finn', 'Levi', 'Luuk', 'Mees', 'Noud', 'Thijs', 'Gijs'],
    female: ['Emma', 'Tess', 'Sophie', 'Zoe', 'Mila', 'Anna', 'Sara', 'Eva', 'Noor', 'Liv'],
    last: ['De Jong', 'Jansen', 'De Vries', 'Van den Berg', 'Van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer'],
  },
  'egypt-cairo': {
    male: ['Ahmed', 'Mohamed', 'Mahmoud', 'Mostafa', 'Karim', 'Omar', 'Youssef', 'Tarek', 'Hassan', 'Adel'],
    female: ['Mona', 'Heba', 'Dina', 'Rania', 'Salma', 'Nour', 'Mariam', 'Amira', 'Hala', 'Ghada'],
    last: ['Hassan', 'Ibrahim', 'Ali', 'Mahmoud', 'Saleh', 'Nasser', 'Farouk', 'ElSayed', 'Abdelaziz', 'Fathy'],
  },
  'turkey-istanbul': {
    male: ['Mehmet', 'Mustafa', 'Ahmet', 'Hasan', 'Huseyin', 'Ibrahim', 'Osman', 'Emre', 'Burak', 'Onur'],
    female: ['Ayse', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Selin', 'Deniz', 'Gozde'],
    last: ['Yilmaz', 'Kaya', 'Demir', 'Sahin', 'Celik', 'Yildiz', 'Ozturk', 'Aydin', 'Arslan', 'Dogan'],
  },
  'ireland-dublin-modern': {
    male: ['Sean', 'Patrick', 'Conor', 'Liam', 'Cian', 'Oisin', 'Darragh', 'Eoin', 'Fionn', 'Tadhg'],
    female: ['Saoirse', 'Niamh', 'Aoife', 'Ciara', 'Orla', 'Sinead', 'Maeve', 'Clodagh', 'Aisling', 'Roise'],
    last: ['Murphy', 'Kelly', 'Byrne', 'Ryan', 'OBrien', 'Lynch', 'Doyle', 'Walsh', 'Brennan', 'Quinn'],
  },
  'indonesia-jakarta': {
    male: ['Budi', 'Agus', 'Dedi', 'Rian', 'Fajar', 'Hendra', 'Yoga', 'Rizky', 'Andi', 'Bayu'],
    female: ['Siti', 'Dewi', 'Putri', 'Rina', 'Wulan', 'Fitri', 'Ayu', 'Nadia', 'Maya', 'Ratna'],
    last: ['Santoso', 'Wijaya', 'Pratama', 'Kusuma', 'Saputra', 'Nugroho', 'Setiawan', 'Hidayat', 'Rahman', 'Hakim'],
  },
  'indonesia-surabaya': {
    male: ['Agus', 'Bambang', 'Dedi', 'Eko', 'Fajar', 'Hendra', 'Iwan', 'Joko', 'Krisna', 'Rudi'],
    female: ['Siti', 'Dewi', 'Putri', 'Rina', 'Wulan', 'Fitri', 'Ayu', 'Maya', 'Nadia', 'Ratna'],
    last: ['Santoso', 'Wijaya', 'Pratama', 'Saputra', 'Nugroho', 'Setiawan', 'Hidayat', 'Rahman', 'Hakim', 'Kusuma'],
  },
  'egypt-alexandria': {
    male: ['Ahmed', 'Mohamed', 'Mahmoud', 'Mostafa', 'Karim', 'Omar', 'Youssef', 'Tarek', 'Hassan', 'Adel'],
    female: ['Mona', 'Heba', 'Dina', 'Rania', 'Salma', 'Nour', 'Mariam', 'Amira', 'Hala', 'Ghada'],
    last: ['Hassan', 'Ibrahim', 'Ali', 'Mahmoud', 'Saleh', 'Nasser', 'Farouk', 'Abdelaziz', 'Fathy', 'Sabbagh'],
  },
  'ireland-cork': {
    male: ['Liam', 'Conor', 'Cian', 'Darragh', 'Eoin', 'Padraig', 'Ronan', 'Shane', 'Fintan', 'Tadhg'],
    female: ['Aoife', 'Niamh', 'Saoirse', 'Ciara', 'Orla', 'Sinead', 'Maeve', 'Clodagh', 'Aisling', 'Eimear'],
    last: ['Murphy', 'Kelly', 'Byrne', 'Ryan', 'OBrien', 'Lynch', 'Doyle', 'Walsh', 'Brennan', 'Quinn'],
  },
  'turkey-ankara': {
    male: ['Mehmet', 'Mustafa', 'Ahmet', 'Hasan', 'Huseyin', 'Ibrahim', 'Osman', 'Emre', 'Burak', 'Onur'],
    female: ['Ayse', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Selin', 'Deniz', 'Gozde'],
    last: ['Yilmaz', 'Kaya', 'Demir', 'Sahin', 'Celik', 'Yildiz', 'Ozturk', 'Aydin', 'Arslan', 'Dogan'],
  },
  'china-xian-modern': {
    male: ['Lei', 'Yang', 'Wei', 'Chao', 'Xin', 'Jian', 'Tao', 'Bin', 'Peng', 'Yu'],
    female: ['Lei', 'Yang', 'Wei', 'Chao', 'Xin', 'Jian', 'Tao', 'Bin', 'Peng', 'Yu'],
    last: ['Lei', 'Yang', 'Wei', 'Chao', 'Xin', 'Jian', 'Tao', 'Bin', 'Peng', 'Yu'],
  },
  'india-delhi-modern': {
    male: ['Arvind', 'Rahul', 'Narendra', 'Amit', 'Rajnath', 'Nitin', 'Piyush', 'Smriti', 'Nirmala', 'Jaishankar'],
    female: ['Sonia', 'Priyanka', 'Mamata', 'Mayawati', 'Vasundhara', 'Uma', 'Sushma', 'Nirmala', 'Smriti', 'Hema'],
    last: ['Kejriwal', 'Gandhi', 'Modi', 'Shah', 'Singh', 'Rajnath', 'Gadkari', 'Goyal', 'Irani', 'Sitharaman'],
  },
  'japan-kyoto-modern': {
    male: ['Shigeru', 'Yoshihide', 'Fumio', 'Taro', 'Shinzo', 'Yoshiro', 'Junichiro', 'Yasuo', 'Taro', 'Naoto'],
    female: ['Yuko', 'Akiko', 'Seiko', 'Tomomi', 'Sanae', 'Yuriko', 'Renho', 'Mari', 'Aya', 'Kana'],
    last: ['Ishiba', 'Suga', 'Kishida', 'Kono', 'Abe', 'Mori', 'Koizumi', 'Fukuda', 'Aso', 'Kan'],
  },
  'india-varanasi-modern': {
    male: ['Narendra', 'Yogi', 'Akhilesh', 'Mayawati', 'Rahul', 'Priyanka', 'Amit', 'Rajnath', 'Nitin', 'Piyush'],
    female: ['Sonia', 'Priyanka', 'Mamata', 'Mayawati', 'Vasundhara', 'Uma', 'Sushma', 'Nirmala', 'Smriti', 'Hema'],
    last: ['Modi', 'Adityanath', 'Yadav', 'Kumari', 'Gandhi', 'Shah', 'Singh', 'Gadkari', 'Goyal', 'Irani'],
  },
  'uk-york-modern': {
    male: ['Rishi', 'Boris', 'David', 'Gordon', 'Tony', 'John', 'Theresa', 'Liz', 'Jeremy', 'Keir'],
    female: ['Margaret', 'Theresa', 'Liz', 'Priti', 'Suella', 'Kemi', 'Nadine', 'Penny', 'Lucy', 'Angela'],
    last: ['Sunak', 'Johnson', 'Cameron', 'Brown', 'Blair', 'Major', 'May', 'Truss', 'Corbyn', 'Starmer'],
  },
  'france-lyon-modern': {
    male: ['Emmanuel', 'Nicolas', 'François', 'Jacques', 'Lionel', 'Alain', 'Dominique', 'Bernard', 'Jean', 'Marine'],
    female: ['Brigitte', 'Carla', 'Cécilia', 'Valérie', 'Ségolène', 'Martine', 'Marine', 'Nathalie', 'Aurore', 'Élisabeth'],
    last: ['Macron', 'Sarkozy', 'Hollande', 'Chirac', 'Jospin', 'Juppé', 'Villepin', 'Kouchner', 'Le Pen', 'Borne'],
  },
  'china-chengdu-modern': {
    male: ['Wei', 'Fang', 'Lei', 'Min', 'Tao', 'Xin', 'Chao', 'Hao', 'Kun', 'Peng'],
    female: ['Fang', 'Jing', 'Li', 'Na', 'Ping', 'Yan', 'Hong', 'Xia', 'Chen', 'Dong'],
    last: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou'],
  },
  'china-luoyang-modern': {
    male: ['Jian', 'Tao', 'Bin', 'Peng', 'Yu', 'Lei', 'Yang', 'Wei', 'Chao', 'Xin'],
    female: ['Yan', 'Hong', 'Xia', 'Chen', 'Dong', 'Fang', 'Jing', 'Li', 'Na', 'Ping'],
    last: ['Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Wang', 'Li', 'Zhang'],
  },
  'japan-nara-modern': {
    male: ['Yoshihide', 'Fumio', 'Taro', 'Shinzo', 'Yoshiro', 'Shigeru', 'Junichiro', 'Yasuo', 'Naoto', 'Yukio'],
    female: ['Akiko', 'Seiko', 'Tomomi', 'Sanae', 'Yuriko', 'Yuko', 'Renho', 'Mari', 'Aya', 'Kana'],
    last: ['Suga', 'Kishida', 'Kono', 'Abe', 'Mori', 'Ishiba', 'Koizumi', 'Fukuda', 'Kan', 'Hatoyama'],
  },
  'india-patna-modern': {
    male: ['Nitish', 'Lalu', 'Tejashwi', 'Sushil', 'Ravi', 'Rajiv', 'Arvind', 'Amit', 'Rajnath', 'Nitin'],
    female: ['Rabri', 'Misa', 'Meira', 'Sonia', 'Priyanka', 'Mamata', 'Mayawati', 'Uma', 'Sushma', 'Hema'],
    last: ['Kumar', 'Yadav', 'Prasad', 'Modi', 'Shankar', 'Singh', 'Devi', 'Bharti', 'Kumari', 'Sahni'],
  },
  'spain-tarragona-modern': {
    male: ['Pedro', 'Mariano', 'José', 'Felipe', 'Pablo', 'Albert', 'Santiago', 'Iñigo', 'Gabriel', 'Jordi'],
    female: ['Soraya', 'Carmen', 'Cristina', 'Ana', 'Elena', 'Isabel', 'Yolanda', 'Nadia', 'Teresa', 'Marta'],
    last: ['Sánchez', 'Rajoy', 'Zapatero', 'Aznar', 'Iglesias', 'Rivera', 'Abascal', 'Errejón', 'Rufián', 'Borrell'],
  },
  'spain-merida-modern': {
    male: ['Guillermo', 'Pedro', 'Mariano', 'José', 'Pablo', 'Felipe', 'Albert', 'Santiago', 'Gabriel', 'Iñigo'],
    female: ['María', 'Carmen', 'Cristina', 'Ana', 'Elena', 'Isabel', 'Soraya', 'Yolanda', 'Nadia', 'Marta'],
    last: ['Vara', 'Sánchez', 'Rajoy', 'Zapatero', 'Aznar', 'Iglesias', 'Rivera', 'Borrell', 'Montero', 'Calvo'],
  },
  'spain-cordoba-modern': {
    male: ['Julio', 'Pedro', 'Mariano', 'José', 'Pablo', 'Felipe', 'Santiago', 'Gabriel', 'Albert', 'Jordi'],
    female: ['Carmen', 'Cristina', 'Ana', 'Elena', 'Isabel', 'María', 'Soraya', 'Yolanda', 'Teresa', 'Nadia'],
    last: ['Anguita', 'Sánchez', 'Rajoy', 'Zapatero', 'Aznar', 'Iglesias', 'Rivera', 'Garzón', 'Díaz', 'Montero'],
  },
  'germany-mainz-modern': {
    male: ['Olaf', 'Angela', 'Gerhard', 'Helmut', 'Wolfgang', 'Frank', 'Christian', 'Robert', 'Friedrich', 'Markus'],
    female: ['Annalena', 'Sahra', 'Alice', 'Ursula', 'Claudia', 'Katrin', 'Marie', 'Saskia', 'Nancy', 'Svenja'],
    last: ['Scholz', 'Merkel', 'Schröder', 'Kohl', 'Schäuble', 'Steinmeier', 'Lindner', 'Habeck', 'Merz', 'Söder'],
  },
  'greece-athens-modern': {
    male: ['Kyriakos', 'Alexis', 'Antonis', 'George', 'Evangelos', 'Nikos', 'Panos', 'Yanis', 'Kostas', 'Dimitris'],
    female: ['Katerina', 'Dora', 'Fofi', 'Olga', 'Nadia', 'Elena', 'Maria', 'Anna', 'Sofia', 'Zoe'],
    last: ['Mitsotakis', 'Tsipras', 'Samaras', 'Papandreou', 'Venizelos', 'Dendias', 'Kammenos', 'Varoufakis', 'Bakoyannis', 'Gennimata'],
  },
  'greece-corinth-modern': {
    male: ['Nikos', 'Kostas', 'Dimitris', 'Yannis', 'Vasilis', 'Thanasis', 'Kyriakos', 'Alexis', 'Antonis', 'George'],
    female: ['Maria', 'Anna', 'Sofia', 'Elena', 'Katerina', 'Olga', 'Dora', 'Nadia', 'Zoe', 'Fofi'],
    last: ['Papadopoulos', 'Nikolaou', 'Georgiou', 'Pappas', 'Karagiannis', 'Vlachos', 'Mitsotakis', 'Tsipras', 'Samaras', 'Venizelos'],
  },
  'israel-jerusalem-modern': {
    male: ['Benjamin', 'Yair', 'Naftali', 'Benny', 'Avigdor', 'Gideon', 'Itamar', 'Bezalel', 'Aryeh', 'Moshe'],
    female: ['Sara', 'Miriam', 'Tzipi', 'Ayelet', 'Miri', 'Orna', 'Merav', 'Penina', 'Yifat', 'Galit'],
    last: ['Netanyahu', 'Lapid', 'Bennett', 'Gantz', 'Lieberman', 'Saar', 'Ben-Gvir', 'Smotrich', 'Deri', 'Kahlon'],
  },
  'turkey-antakya-modern': {
    male: ['Recep', 'Kemal', 'Devlet', 'Meral', 'Ekrem', 'Mansur', 'Selahattin', 'Ahmet', 'Ali', 'Mevlüt'],
    female: ['Emine', 'Sare', 'Canan', 'Meral', 'Figen', 'Pervin', 'Gültan', 'Ayşe', 'Fatma', 'Zeynep'],
    last: ['Erdoğan', 'Kılıçdaroğlu', 'Bahçeli', 'Akşener', 'İmamoğlu', 'Yavaş', 'Demirtaş', 'Davutoğlu', 'Babacan', 'Çavuşoğlu'],
  },
  'iran-hamadan-modern': {
    male: ['Ebrahim', 'Hassan', 'Mahmoud', 'Mohammad', 'Ali', 'Saeed', 'Javad', 'Hossein', 'Ahmad', 'Mostafa'],
    female: ['Fatemeh', 'Zahra', 'Maryam', 'Masoumeh', 'Narges', 'Sara', 'Leila', 'Shirin', 'Nasrin', 'Azar'],
    last: ['Raisi', 'Rouhani', 'Ahmadinejad', 'Khatami', 'Khamenei', 'Jalili', 'Zarif', 'Larijani', 'Qalibaf', 'Jahangiri'],
  },
  'saudi-medina-modern': {
    male: ['Mohammed', 'Salman', 'Abdullah', 'Khalid', 'Faisal', 'Turki', 'Sultan', 'Nayef', 'Saud', 'Talal'],
    female: ['Reema', 'Lina', 'Haifa', 'Sara', 'Noura', 'Latifa', 'Maha', 'Rania', 'Huda', 'Abeer'],
    last: ['Al Saud', 'Al-Rashid', 'Al-Otaibi', 'Al-Dossari', 'Al-Ghamdi', 'Al-Qahtani', 'Al-Shammari', 'Al-Harbi', 'Al-Mutairi', 'Al-Anzi'],
  },
  'ethiopia-axum-modern': {
    male: ['Abiy', 'Hailemariam', 'Meles', 'Mulatu', 'Sahle', 'Demeke', 'Debretsion', 'Lemma', 'Gedu', 'Workneh'],
    female: ['Sahle', 'Meaza', 'Aster', 'Tirunesh', 'Derartu', 'Genzeb', 'Almaz', 'Hirut', 'Mulu', 'Zinash'],
    last: ['Ahmed', 'Desalegn', 'Zenawi', 'Teshome', 'Work', 'Mekonnen', 'Gebremichael', 'Megersa', 'Andargachew', 'Gebre'],
  },
  'ethiopia-gondar-modern': {
    male: ['Gedu', 'Demeke', 'Abiy', 'Hailemariam', 'Meles', 'Lemma', 'Workneh', 'Debretsion', 'Mulatu', 'Sahle'],
    female: ['Hirut', 'Mulu', 'Zinash', 'Sahle', 'Meaza', 'Aster', 'Tirunesh', 'Derartu', 'Genzeb', 'Almaz'],
    last: ['Andargachew', 'Mekonnen', 'Ahmed', 'Desalegn', 'Zenawi', 'Megersa', 'Gebre', 'Teshome', 'Work', 'Gebremichael'],
  },
  'tunisia-tunis-modern': {
    male: ['Kaïs', 'Beji', 'Moncef', 'Youssef', 'Habib', 'Rached', 'Nabil', 'Mehdi', 'Slim', 'Ridha'],
    female: ['Najla', 'Amel', 'Samira', 'Sihem', 'Leïla', 'Olfa', 'Rim', 'Henda', 'Sana', 'Mongia'],
    last: ['Saïed', 'Essebsi', 'Marzouki', 'Chahed', 'Essid', 'Ghannouchi', 'Karoui', 'Jomaa', 'Riahi', 'Belhaj'],
  },
  'syria-palmyra-modern': {
    male: ['Bashar', 'Hafez', 'Farouk', 'Walid', 'Faisal', 'Maher', 'Riyad', 'Ghassan', 'Omar', 'Hassan'],
    female: ['Asma', 'Anisa', 'Bouthaina', 'Fayssal', 'Luna', 'Rania', 'Hala', 'Sana', 'Maha', 'Noura'],
    last: ['Al-Assad', 'Al-Sharaa', 'Muallem', 'Mekdad', 'Hijazi', 'Jaafari', 'Laham', 'Sabbagh', 'Tlass', 'Khaddam'],
  },
  'argentina-rosario': {
    male: ['Lionel', 'Angel', 'Cesar', 'Hernan', 'Pablo', 'Javier', 'Martin', 'Santiago', 'Mateo', 'Thiago'],
    female: ['Micaela', 'Camila', 'Sofia', 'Valentina', 'Martina', 'Luciana', 'Florencia', 'Agustina', 'Paula', 'Daniela'],
    last: ['Messi', 'Di Maria', 'Menotti', 'Bielsa', 'Simeone', 'Gallardo', 'Pochettino', 'Scaloni', 'Maradona', 'Kempes'],
  },
  'australia-sydney-modern': {
    male: ['Jack', 'Oliver', 'Leo', 'William', 'Charlie', 'Henry', 'George', 'Alfred', 'Arthur', 'Harry'],
    female: ['Charlotte', 'Ruby', 'Olivia', 'Ava', 'Mia', 'Isla', 'Grace', 'Chloe', 'Sophie', 'Ella'],
    last: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson', 'White', 'Martin', 'Anderson'],
  },
  'brazil-rio-modern': {
    male: ['Gabriel', 'Lucas', 'Matheus', 'Pedro', 'Gustavo', 'Rafael', 'Thiago', 'Bruno', 'Diego', 'Felipe'],
    female: ['Alice', 'Laura', 'Manuela', 'Valentina', 'Sophia', 'Isabella', 'Helena', 'Cecilia', 'Laura', 'Maria'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Carvalho', 'Ferreira', 'Rodrigues'],
  },
  'canada-montreal-modern': {
    male: ['Liam', 'Noah', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Mason', 'Ethan'],
    female: ['Olivia', 'Emma', 'Charlotte', 'Amelia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Evelyn', 'Harper'],
    last: ['Tremblay', 'Gagnon', 'Roy', 'Cote', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie', 'Fortin', 'Gagne'],
  },
  'china-beijing-modern': {
    male: ['Wei', 'Fang', 'Lei', 'Min', 'Tao', 'Xin', 'Chao', 'Hao', 'Kun', 'Peng'],
    female: ['Fang', 'Jing', 'Li', 'Na', 'Ping', 'Yan', 'Hong', 'Xia', 'Chen', 'Dong'],
    last: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou'],
  },
  'germany-hamburg-modern': {
    male: ['Lukas', 'Leon', 'Finn', 'Paul', 'Jonas', 'Felix', 'Noah', 'Elias', 'Ben', 'Louis'],
    female: ['Mia', 'Emma', 'Hannah', 'Sofia', 'Anna', 'Lea', 'Lena', 'Marie', 'Lina', 'Mila'],
    last: ['Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch'],
  },
  'india-mumbai-modern': {
    male: ['Aarav', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan', 'Kabir', 'Ananya'],
    female: ['Diya', 'Aadhya', 'Myra', 'Sara', 'Ira', 'Priya', 'Anika', 'Navya', 'Riya', 'Saanvi'],
    last: ['Sharma', 'Verma', 'Gupta', 'Mehta', 'Shah', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Khan'],
  },
  'japan-osaka-modern': {
    male: ['Ren', 'Hayato', 'Haruto', 'Sota', 'Yuto', 'Shun', 'Koki', 'Daiki', 'Takumi', 'Sho'],
    female: ['Aoi', 'Yui', 'Hina', 'Mio', 'Sakura', 'Hana', 'Rin', 'Koharu', 'Airi', 'Miyu'],
    last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Ito', 'Kato'],
  },
  'nigeria-abuja': {
    male: ['Emeka', 'Chinedu', 'Olumide', 'Tunde', 'Segun', 'Adeola', 'Ibrahim', 'Musa', 'Yusuf', 'Ahmed'],
    female: ['Adaeze', 'Chiamaka', 'Funke', 'Aisha', 'Zainab', 'Ngozi', 'Blossom', 'Temi', 'Kemi', 'Amina'],
    last: ['Adeyemi', 'Okafor', 'Eze', 'Bello', 'Sule', 'Abubakar', 'Mohammed', 'Ibrahim', 'Okonkwo', 'Adeola'],
  },
  'russia-petersburg-modern': {
    male: ['Artyom', 'Maxim', 'Ivan', 'Dmitry', 'Kirill', 'Nikita', 'Yegor', 'Timur', 'Vladislav', 'Andrey'],
    female: ['Sofia', 'Maria', 'Anna', 'Alisa', 'Viktoria', 'Polina', 'Alexandra', 'Ksenia', 'Varvara', 'Yelizaveta'],
    last: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Petrov'],
  },
  'southafrica-capetown': {
    male: ['Liam', 'Daniel', 'Matthew', 'James', 'Ethan', 'Joshua', 'Andrew', 'David', 'Christopher', 'Michael'],
    female: ['Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Ella'],
    last: ['Botha', 'Smuts', 'Malan', 'Strijdom', 'Verwoerd', 'Vorster', 'Botha', 'De Klerk', 'Mandela', 'Mbeki'],
  },
  'spain-barcelona-modern': {
    male: ['Hugo', 'Martin', 'Lucas', 'Mateo', 'Leo', 'Daniel', 'Alejandro', 'Pablo', 'Alvaro', 'David'],
    female: ['Lucia', 'Sofia', 'Martina', 'Maria', 'Paula', 'Daniela', 'Carla', 'Alba', 'Noa', 'Valeria'],
    last: ['Garcia', 'Fernandez', 'Gonzalez', 'Rodriguez', 'Lopez', 'Martinez', 'Sanchez', 'Perez', 'Martin', 'Gomez'],
  },
};

const BY_ERA: Record<EraId, GenderedPool> = {
  'ancient-world': {
    male: ['Gaius', 'Lucius', 'Marcus', 'Titus', 'Publius'],
    female: ['Julia', 'Claudia', 'Aemilia', 'Velia', 'Junia'],
    last: ['Romanus', 'Flavius', 'Aurelius', 'Gallicus', 'Nerva'],
  },
  medieval: {
    male: ['Aldric', 'Rowan', 'Hugh', 'Thomas', 'Oswald'],
    female: ['Matilda', 'Edith', 'Beatrice', 'Agnes', 'Joan'],
    last: ['Stone', 'Marsh', 'Grimm', 'Miller', 'Ashdown'],
  },
  'age-of-sail': {
    male: ['Jan', 'Willem', 'Pieter', 'Diego', 'Janek'],
    female: ['Maria', 'Anna', 'Ines', 'Neeltje', 'Yuki'],
    last: ['van Rijn', 'Bakker', 'Perez', 'Vermeer', 'Yoshida'],
  },
  industrial: {
    male: ['Thomas', 'William', 'Heinrich', 'Andrew', 'Ramesh'],
    female: ['Mary', 'Elisabeth', 'Clara', 'Anne', 'Meera'],
    last: ['Hargreaves', 'Krupp', 'Whitfield', 'Sharma', 'Becker'],
  },
  atomic: {
    male: ['Dmitri', 'Kenji', 'Roger', 'Marcus', 'Ramesh'],
    female: ['Natasha', 'Yuki', 'Susan', 'Diana', 'Sarla'],
    last: ['Volkov', 'Tanaka', 'Hargreaves', 'Reed', 'Sharma'],
  },
  'modern-day': {
    male: ['Leo', 'Sam', 'Jay', 'Kai', 'Eli'],
    female: ['Maya', 'Zoe', 'Ivy', 'Noor', 'Luna'],
    last: ['Reyes', 'Chen', 'Patel', 'Garcia', 'Khan'],
  },
};

function pick(pool: string[], rng: () => number): string {
  return pool[Math.floor(rng() * pool.length)];
}

/** Whether a birthplace has its own pool (else the era pool reads). */
export function hasNamePool(placeId: string): boolean {
  return placeId in BY_PLACE;
}

/**
 * A first + last name fitting the period, birthplace and gender.
 * Without a gender the pool is picked at random.
 */
export function randomName(
  eraId: EraId,
  placeId: string,
  rng: () => number = Math.random,
  gender?: NameGender,
): string {
  const pool = BY_PLACE[placeId] ?? BY_ERA[eraId] ?? BY_ERA['modern-day'];
  const first = pool[gender ?? (rng() < 0.5 ? 'male' : 'female')];
  return `${pick(first, rng)} ${pick(pool.last, rng)}`;
}

/** Map a character identity option to a name pool. */
export function identityGender(
  identity: string,
  rng: () => number = Math.random,
): NameGender {
  if (identity === 'Male') return 'male';
  if (identity === 'Female') return 'female';
  return rng() < 0.5 ? 'male' : 'female';
}

export const GENDERS = ['Female', 'Male', 'Non-binary'] as const;
