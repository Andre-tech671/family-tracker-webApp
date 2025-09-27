import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import './TitleCards.css';




function TitleCards({title, category}){

    const navigate = useNavigate();
    const [apiData, setApiData] = useState([]);
    const cardsRef = useRef();

    const handlewheel = (event)=>{
        event.preventDefault();
        cardsRef.current.scrollLeft += event.deltaY
    }

    useEffect(()=>{
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: import.meta.env.VITE_TMDB_API_KEY
            }
        };

        fetch(`https://api.themoviedb.org/3/movie/${category || 'popular'}`, options)
        .then(res => res.json())
        .then(res => setApiData(res.results))
        .catch(() => {});

        const ref = cardsRef.current;
        ref.addEventListener('wheel', handlewheel);
        return () => ref.removeEventListener('wheel', handlewheel);
    },[category])


    return(
        <div className="title-cards">
            <h2>{title?title:"Popular on Netflix"}</h2>
            <div className="card-list" ref={cardsRef}>
                {apiData.map((card)=>{
                    return <div className="card" key={card.id} onClick={() => navigate(`/player/${card.id}`)} style={{cursor: 'pointer'}}>
                        <img src={`https://image.tmdb.org/t/p/w500${card.poster_path}`} alt={card.title} />
                        <p>{card.title}</p>
                    </div>
                })}
            </div>
        </div>
    )
}

export default TitleCards;
