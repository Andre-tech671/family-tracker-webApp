import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './Player.css';
import back_arrow_icon from '../../assets/back_arrow_icon.png'
import { auth } from "../../Firebase";

function Player() {

  const navigate = useNavigate();
  const { id } = useParams();
  const [apiData, setApiData] = useState({
    name: "",
    key: "",
    published_at: "",
    type: ""
  });

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: import.meta.env.VITE_TMDB_API_KEY
      }
    };

    fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
      .then(response => response.json())
      .then(response => {
        if (response.results && response.results.length > 0) {
          // Find the first YouTube trailer video
          const trailer = response.results.find(video => video.site === "YouTube" && video.type === "Trailer");
          if (trailer) {
            setApiData(trailer);
          } else {
            setApiData(response.results[0]);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <div className="player">
      <img src={back_arrow_icon} alt="Back" onClick={() => navigate(-1)} style={{cursor: 'pointer'}} />
      {apiData.key && (
        <iframe
          width='90%'
          height='90%'
          src={`https://www.youtube.com/embed/${apiData.key}`}
          title='trailer'
          frameBorder='0'
          allowFullScreen
        ></iframe>
      )}
      <div className="player-info">
        <p>{apiData.published_at}</p>
        <p>{apiData.name}</p>
        <p>{apiData.type}</p>
      </div>
    </div>
  );
}

export default Player;


