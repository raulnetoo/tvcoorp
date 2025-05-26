import React, { useState, useEffect, useRef } from 'react';

// Main App component for the Corporate TV
function App() {
  // --- State Management ---
  // Load data from localStorage or use defaults if not found
  const [birthdays, setBirthdays] = useState(() => {
    const stored = localStorage.getItem('corporateTvBirthdays');
    return stored ? JSON.parse(stored) : [
      { name: "Ana Silva", date: "26 de Maio", imageUrl: "https://placehold.co/150x150/FFC0CB/000000?text=Ana" },
      { name: "Bruno Costa", date: "27 de Maio", imageUrl: "https://placehold.co/150x150/ADD8E6/000000?text=Bruno" },
      { name: "Carla Dias", date: "28 de Maio", imageUrl: "https://placehold.co/150x150/90EE90/000000?text=Carla" },
      { name: "Daniel Rocha", date: "29 de Maio", imageUrl: "https://placehold.co/150x150/FFD700/000000?text=Daniel" },
      { name: "Elisa Santos", date: "30 de Maio", imageUrl: "https://placehold.co/150x150/DDA0DD/000000?text=Elisa" },
    ];
  });

  const [news, setNews] = useState(() => {
    const stored = localStorage.getItem('corporateTvNews');
    return stored ? JSON.parse(stored) : [
      {
        title: "Nova Filial em São Paulo Inaugurada!",
        content: "Temos o prazer de anunciar a abertura da nossa mais nova filial no coração de São Paulo, expandindo nossa presença e capacidade de atendimento.",
        image: "https://placehold.co/400x200/FF5733/FFFFFF?text=Filial+SP"
      },
      {
        title: "Recorde de Vendas no Último Trimestre",
        content: "Nossa equipe superou todas as expectativas, alcançando um recorde histórico de vendas no último trimestre. Parabéns a todos!",
        image: "https://placehold.co/400x200/33FF57/FFFFFF?text=Recorde+Vendas"
      },
      {
        title: "Campanha de Doação de Alimentos",
        content: "Agradecemos a todos que participaram da nossa campanha de doação de alimentos. Arrecadamos mais de 500kg para a comunidade local.",
        image: "https://placehold.co/400x200/3357FF/FFFFFF?text=Doação+Alimentos"
      },
      {
        title: "Treinamento de Liderança Concluído",
        content: "Parabenizamos os colaboradores que concluíram com sucesso o programa de treinamento de liderança, fortalecendo nossas equipes.",
        image: "https://placehold.co/400x200/FFFF33/000000?text=Treinamento"
      },
    ];
  });

  const [videos, setVideos] = useState(() => {
    const stored = localStorage.getItem('corporateTvVideos');
    return stored ? JSON.parse(stored) : [
      { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Vídeo Institucional 1: Nossa História" }, // Example video
      { src: "https://www.w3schools.com/html/movie.mp4", title: "Vídeo Institucional 2: Nossos Valores" }, // Example video
    ];
  });

  const [weatherCities, setWeatherCities] = useState([
    { name: "São José do Rio Preto", lat: -20.8175, lon: -49.3811 },
    { name: "Guarulhos", lat: -23.4628, lon: -46.5333 },
    { name: "Betim", lat: -19.9691, lon: -44.1983 },
    { name: "Jaboatão dos Guararapes", lat: -8.1033, lon: -34.9189 },
  ]);

  const [weatherData, setWeatherData] = useState({}); // Stores weather data for all cities
  const [currencyData, setCurrencyData] = useState({}); // Stores currency exchange rates
  const [currentPage, setCurrentPage] = useState('tv'); // State to manage current page: 'tv' or 'admin'

  // Current index for cycling through content
  const [currentBirthdayIndex, setCurrentBirthdayIndex] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentWeatherCityIndex, setCurrentWeatherCityIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Reference for the video player to control playback
  const videoRef = useRef(null);

  // --- API Keys (PLACEHOLDERS - REPLACE WITH YOUR OWN) ---
  // You need to get your own API keys for these services.
  // OpenWeatherMap API Key: https://openweathermap.org/api
  const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";
  // ExchangeRate-API Key: https://www.exchangerate-api.com/
  const EXCHANGERATE_API_KEY = "YOUR_EXCHANGERATE_API_KEY";

  // Function to save data to localStorage (called from AdminPanel)
  const saveDataToLocalStorage = (type, data) => {
    localStorage.setItem(`corporateTv${type}`, JSON.stringify(data));
  };

  // --- Fetch Weather Data ---
  useEffect(() => {
    const fetchWeather = async (city) => {
      if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
        console.warn("OpenWeatherMap API Key not set. Weather data will be simulated.");
        // Simulate data if API key is missing
        setWeatherData(prev => ({
          ...prev,
          [city.name]: {
            temp: (Math.random() * 10 + 20).toFixed(1), // Random temp between 20-30
            description: Math.random() > 0.5 ? "Céu Limpo" : "Nuvens Dispersas",
            icon: Math.random() > 0.5 ? "01d" : "04d"
          }
        }));
        return;
      }

      try {
        const prompt = `Previsão do tempo para ${city.name}.`;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = {
          contents: chatHistory,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                "temperature": { "type": "NUMBER" },
                "description": { "type": "STRING" },
                "icon": { "type": "STRING" } // e.g., "01d" for clear sky day
              },
              "propertyOrdering": ["temperature", "description", "icon"]
            }
          }
        };

        const apiKey = ""; // Canvas will provide the API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
          const json = result.candidates[0].content.parts[0].text;
          const parsedJson = JSON.parse(json);
          setWeatherData(prev => ({
            ...prev,
            [city.name]: {
              temp: parsedJson.temperature,
              description: parsedJson.description,
              icon: parsedJson.icon
            }
          }));
        } else {
          console.error("Erro ao gerar previsão do tempo com Gemini API:", result);
          // Fallback to simulated data on error
          setWeatherData(prev => ({
            ...prev,
            [city.name]: {
              temp: (Math.random() * 10 + 20).toFixed(1),
              description: "Dados indisponíveis",
              icon: "01d"
            }
          }));
        }

      } catch (error) {
        console.error("Erro ao buscar previsão do tempo:", error);
        // Fallback to simulated data on error
        setWeatherData(prev => ({
          ...prev,
          [city.name]: {
            temp: (Math.random() * 10 + 20).toFixed(1),
            description: "Erro ao carregar",
            icon: "01d"
          }
        }));
      }
    };

    weatherCities.forEach(city => fetchWeather(city));
  }, [weatherCities, OPENWEATHER_API_KEY]); // Re-fetch if cities or API key changes

  // --- Fetch Currency Data ---
  useEffect(() => {
    const fetchCurrency = async () => {
      if (!EXCHANGERATE_API_KEY || EXCHANGERATE_API_KEY === "YOUR_EXCHANGERATE_API_KEY") {
        console.warn("ExchangeRate-API Key not set. Currency data will be simulated.");
        // Simulate data if API key is missing
        setCurrencyData({
          USD: (5.0 + Math.random() * 0.2 - 0.1).toFixed(2),
          EUR: (5.5 + Math.random() * 0.2 - 0.1).toFixed(2),
          GBP: (6.2 + Math.random() * 0.2 - 0.1).toFixed(2),
        });
        return;
      }

      try {
        const prompt = `Cotações de câmbio para USD, EUR, GBP em relação ao BRL.`;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = {
          contents: chatHistory,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                "USD": { "type": "NUMBER" },
                "EUR": { "type": "NUMBER" },
                "GBP": { "type": "NUMBER" }
              },
              "propertyOrdering": ["USD", "EUR", "GBP"]
            }
          }
        };

        const apiKey = ""; // Canvas will provide the API key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
          const json = result.candidates[0].content.parts[0].text;
          const parsedJson = JSON.parse(json);
          setCurrencyData(parsedJson);
        } else {
          console.error("Erro ao gerar cotação de moedas com Gemini API:", result);
          // Fallback to simulated data on error
          setCurrencyData({
            USD: (5.0 + Math.random() * 0.2 - 0.1).toFixed(2),
            EUR: (5.5 + Math.random() * 0.2 - 0.1).toFixed(2),
            GBP: (6.2 + Math.random() * 0.2 - 0.1).toFixed(2),
          });
        }

      } catch (error) {
        console.error("Erro ao buscar cotação de moedas:", error);
        // Fallback to simulated data on error
        setCurrencyData({
          USD: (5.0 + Math.random() * 0.2 - 0.1).toFixed(2),
          EUR: (5.5 + Math.random() * 0.2 - 0.1).toFixed(2),
          GBP: (6.2 + Math.random() * 0.2 - 0.1).toFixed(2),
        });
      }
    };

    fetchCurrency();
    // Update currency every 5 minutes (300000 ms)
    const interval = setInterval(fetchCurrency, 300000);
    return () => clearInterval(interval);
  }, [EXCHANGERATE_API_KEY]); // Re-fetch if API key changes

  // --- Content Cycling Effects ---
  // These effects only run if the current page is 'tv'
  useEffect(() => {
    if (currentPage !== 'tv') return;
    const interval = setInterval(() => {
      setCurrentBirthdayIndex((prevIndex) => (prevIndex + 1) % birthdays.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [birthdays.length, currentPage]);

  useEffect(() => {
    if (currentPage !== 'tv') return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % news.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [news.length, currentPage]);

  useEffect(() => {
    if (currentPage !== 'tv') return;
    const interval = setInterval(() => {
      setCurrentWeatherCityIndex((prevIndex) => (prevIndex + 1) % weatherCities.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [weatherCities.length, currentPage]);

  useEffect(() => {
    if (currentPage !== 'tv') return;
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
        if (videoRef.current) {
          videoRef.current.play().catch(error => console.log("Video autoplay prevented:", error));
        }
      };
      videoElement.addEventListener('ended', handleVideoEnd);
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [videos.length, currentVideoIndex, currentPage]);

  // --- Helper to get weather icon URL ---
  const getWeatherIconUrl = (iconCode) => {
    // OpenWeatherMap icon URL format
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };


  // --- Admin Panel Component (defined inline for simplicity) ---
  const AdminPanel = () => {
    // State for form inputs
    const [newBirthdayName, setNewBirthdayName] = useState('');
    const [newBirthdayDate, setNewBirthdayDate] = useState('');
    const [newBirthdayImage, setNewBirthdayImage] = useState('');

    const [newNewsTitle, setNewNewsTitle] = useState('');
    const [newNewsContent, setNewNewsContent] = useState('');
    const [newNewsImage, setNewNewsImage] = useState('');

    const [newVideoSrc, setNewVideoSrc] = useState('');
    const [newVideoTitle, setNewVideoTitle] = useState('');

    // Functions to handle CRUD for each type
    const handleAddBirthday = () => {
      if (newBirthdayName && newBirthdayDate) {
        const updatedBirthdays = [...birthdays, { name: newBirthdayName, date: newBirthdayDate, imageUrl: newBirthdayImage || 'https://placehold.co/150x150/CCCCCC/000000?text=Foto' }];
        setBirthdays(updatedBirthdays);
        saveDataToLocalStorage('Birthdays', updatedBirthdays);
        setNewBirthdayName('');
        setNewBirthdayDate('');
        setNewBirthdayImage('');
      }
    };

    const handleDeleteBirthday = (index) => {
      const updatedBirthdays = birthdays.filter((_, i) => i !== index);
      setBirthdays(updatedBirthdays);
      saveDataToLocalStorage('Birthdays', updatedBirthdays);
    };

    const handleAddNews = () => {
      if (newNewsTitle && newNewsContent) {
        const updatedNews = [...news, { title: newNewsTitle, content: newNewsContent, image: newNewsImage || 'https://placehold.co/400x200/CCCCCC/000000?text=Imagem+Notícia' }];
        setNews(updatedNews);
        saveDataToLocalStorage('News', updatedNews);
        setNewNewsTitle('');
        setNewNewsContent('');
        setNewNewsImage('');
      }
    };

    const handleDeleteNews = (index) => {
      const updatedNews = news.filter((_, i) => i !== index);
      setNews(updatedNews);
      saveDataToLocalStorage('News', updatedNews);
    };

    const handleAddVideo = () => {
      if (newVideoSrc && newVideoTitle) {
        const updatedVideos = [...videos, { src: newVideoSrc, title: newVideoTitle }];
        setVideos(updatedVideos);
        saveDataToLocalStorage('Videos', updatedVideos);
        setNewVideoSrc('');
        setNewVideoTitle('');
      }
    };

    const handleDeleteVideo = (index) => {
      const updatedVideos = videos.filter((_, i) => i !== index);
      setVideos(updatedVideos);
      saveDataToLocalStorage('Videos', updatedVideos);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-xl text-gray-800 max-w-4xl mx-auto my-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Painel de Administração</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          *As alterações são salvas localmente no seu navegador. Para sincronização em múltiplas telas, um backend seria necessário.
        </p>

        {/* Birthdays Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Aniversariantes</h3>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Nome"
              className="p-2 border rounded flex-grow"
              value={newBirthdayName}
              onChange={(e) => setNewBirthdayName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Data (ex: 26 de Maio)"
              className="p-2 border rounded flex-grow"
              value={newBirthdayDate}
              onChange={(e) => setNewBirthdayDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL da Imagem (opcional)"
              className="p-2 border rounded flex-grow"
              value={newBirthdayImage}
              onChange={(e) => setNewBirthdayImage(e.target.value)}
            />
            <button
              onClick={handleAddBirthday}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shrink-0"
            >
              Adicionar
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {birthdays.map((b, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm text-sm">
                <span className="truncate">{b.name} - {b.date}</span>
                <button
                  onClick={() => handleDeleteBirthday(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs ml-4 shrink-0"
                >
                  Excluir
                </button>
              </li>
            ))}
            {birthdays.length === 0 && <li className="text-center text-gray-500">Nenhum aniversariante cadastrado.</li>}
          </ul>
        </div>

        {/* News Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Notícias da Empresa</h3>
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              placeholder="Título da Notícia"
              className="p-2 border rounded"
              value={newNewsTitle}
              onChange={(e) => setNewNewsTitle(e.target.value)}
            />
            <textarea
              placeholder="Conteúdo da Notícia"
              className="p-2 border rounded h-24"
              value={newNewsContent}
              onChange={(e) => setNewNewsContent(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL da Imagem (opcional)"
              className="p-2 border rounded"
              value={newNewsImage}
              onChange={(e) => setNewNewsImage(e.target.value)}
            />
            <button
              onClick={handleAddNews}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              Adicionar Notícia
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {news.map((n, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm text-sm">
                <span className="truncate">{n.title}</span>
                <button
                  onClick={() => handleDeleteNews(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs ml-4 shrink-0"
                >
                  Excluir
                </button>
              </li>
            ))}
            {news.length === 0 && <li className="text-center text-gray-500">Nenhuma notícia cadastrada.</li>}
          </ul>
        </div>

        {/* Videos Section */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Vídeos Institucionais</h3>
          <div className="flex flex-col gap-3 mb-4">
            <input
              type="text"
              placeholder="URL do Vídeo (ex: .mp4)"
              className="p-2 border rounded"
              value={newVideoSrc}
              onChange={(e) => setNewVideoSrc(e.target.value)}
            />
            <input
              type="text"
              placeholder="Título do Vídeo"
              className="p-2 border rounded"
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
            />
            <button
              onClick={handleAddVideo}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              Adicionar Vídeo
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {videos.map((v, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm text-sm">
                <span className="truncate">{v.title}</span>
                <button
                  onClick={() => handleDeleteVideo(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs ml-4 shrink-0"
                >
                  Excluir
                </button>
              </li>
            ))}
            {videos.length === 0 && <li className="text-center text-gray-500">Nenhum vídeo cadastrado.</li>}
          </ul>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('tv')} // Change page back to 'tv'
            className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg"
          >
            Voltar para a TV Corporativa
          </button>
        </div>
      </div>
    );
  }; // End of AdminPanel component


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-inter p-4 sm:p-6 md:p-8 flex flex-col">
      {currentPage === 'admin' ? ( // Conditionally render AdminPanel
        <AdminPanel />
      ) : (
        <>
          {/* Header Section */}
          <header className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-xl shadow-lg mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">TV Corporativa</h1>
            {/* Admin link in header */}
            <button
              onClick={() => setCurrentPage('admin')} // Change page to 'admin'
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md text-base"
            >
              Administração
            </button>
          </header>

          {/* Main Content Grid */}
          <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Videos & News */}
            <section className="lg:col-span-2 flex flex-col gap-6">
              {/* Video Player */}
              <div className="bg-white bg-opacity-10 rounded-xl shadow-lg p-4 flex-grow flex flex-col justify-center items-center overflow-hidden">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
                  {videos[currentVideoIndex]?.title || "Carregando Vídeo..."}
                </h2>
                <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden"> {/* 16:9 Aspect Ratio */}
                  {videos.length > 0 ? (
                    <video
                      ref={videoRef}
                      key={videos[currentVideoIndex]?.src} // Key change forces re-render and reloads video
                      src={videos[currentVideoIndex]?.src}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                      autoPlay
                      loop // Loop the current video until it's time to switch
                      muted // Muted for autoplay
                      controls={false} // Hide controls for a cleaner look
                      onEnded={() => {
                        // This will be handled by the useEffect for cycling videos
                      }}
                      onError={(e) => console.error("Erro ao carregar vídeo:", e.target.src, e)}
                    >
                      Seu navegador não suporta a tag de vídeo.
                    </video>
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-lg">Nenhum vídeo disponível.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Company News */}
              <div className="bg-white bg-opacity-10 rounded-xl shadow-lg p-4 flex-grow flex flex-col">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Notícias da Empresa</h2>
                {news.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={news[currentNewsIndex].image}
                      alt={news[currentNewsIndex].title}
                      className="w-full sm:w-1/3 h-auto sm:h-32 object-cover rounded-lg shadow-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/CCCCCC/000000?text=Imagem+Indisponível"; }}
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold text-yellow-300 mb-2">{news[currentNewsIndex].title}</h3>
                      <p className="text-sm sm:text-base text-gray-200 line-clamp-3">{news[currentNewsIndex].content}</p>
                    </div>
                  </div>
                )}
                {news.length === 0 && <p className="text-gray-400">Nenhuma notícia disponível.</p>}
              </div>
            </section>

            {/* Right Column: Birthdays, Weather */}
            <section className="lg:col-span-1 flex flex-col gap-6">
              {/* Birthdays */}
              <div className="bg-white bg-opacity-10 rounded-xl shadow-lg p-4 flex-grow">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Aniversariantes do Dia</h2>
                {birthdays.length > 0 ? (
                  <div key={currentBirthdayIndex} className="flex flex-col items-center justify-center h-full transition-opacity duration-500 ease-in-out opacity-100">
                    <img
                      src={birthdays[currentBirthdayIndex].imageUrl}
                      alt={birthdays[currentBirthdayIndex].name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-pink-400"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/CCCCCC/000000?text=Foto"; }}
                    />
                    <p className="text-4xl sm:text-5xl font-extrabold text-pink-300 mb-2">🎉</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white text-center">{birthdays[currentBirthdayIndex].name}</p>
                    <p className="text-lg sm:text-xl text-gray-200">{birthdays[currentBirthdayIndex].date}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Nenhum aniversariante hoje.</p>
                )}
              </div>

              {/* Weather Forecast */}
              <div className="bg-white bg-opacity-10 rounded-xl shadow-lg p-4 flex-grow">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Previsão do Tempo</h2>
                {weatherCities.length > 0 && weatherData[weatherCities[currentWeatherCityIndex].name] ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-lg sm:text-xl font-bold text-blue-300 mb-2">{weatherCities[currentWeatherCityIndex].name}</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={getWeatherIconUrl(weatherData[weatherCities[currentWeatherCityIndex].name].icon)}
                        alt={weatherData[weatherCities[currentWeatherCityIndex].name].description}
                        className="w-16 h-16 sm:w-20 sm:h-20"
                      />
                      <p className="text-4xl sm:text-5xl font-extrabold text-white">
                        {weatherData[weatherCities[currentWeatherCityIndex].name].temp}°C
                      </p>
                    </div>
                    <p className="text-base sm:text-lg text-gray-200 mt-2 capitalize">
                      {weatherData[weatherCities[currentWeatherCityIndex].name].description}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">Carregando previsão do tempo...</p>
                )}
              </div>
            </section>
          </main>

          {/* Currency Exchange Footer Bar */}
          <footer className="w-full bg-white bg-opacity-10 rounded-xl shadow-lg mt-6 p-3 overflow-hidden relative">
            <style>
              {`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite; /* Adjust duration as needed */
              }
              `}
            </style>
            <div className="flex items-center text-lg sm:text-xl text-white font-semibold whitespace-nowrap animate-marquee">
              {Object.keys(currencyData).length > 0 ? (
                // Duplicate content to ensure continuous scrolling
                <>
                  {Object.entries(currencyData).map(([currency, rate]) => (
                    <span key={`${currency}-1`} className="mx-8">
                      💰 {currency}/BRL: <span className="text-green-300">R$ {rate}</span>
                    </span>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {Object.entries(currencyData).map(([currency, rate]) => (
                    <span key={`${currency}-2`} className="mx-8">
                      💰 {currency}/BRL: <span className="text-green-300">R$ {rate}</span>
                    </span>
                  ))}
                </>
              ) : (
                <span className="mx-8 text-gray-400">Carregando cotações de moedas...</span>
              )}
            </div>
          </footer>

          {/* Original Footer (Optional - moved above currency bar) */}
          <div className="text-center text-gray-400 text-sm mt-2">
            <p>&copy; {new Date().getFullYear()} Grupo Lukma. Todos os direitos reservados.</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
