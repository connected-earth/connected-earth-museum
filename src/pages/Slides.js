import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Plot from 'react-plotly.js';
import { useNavigate } from "react-router-dom";
import { page_slides } from '../content/slides';
import "./Slides.css";



const Slides = ({ slideId }) => {
    const slides = page_slides[slideId];
    console.log('slides', slideId, page_slides, slides);


    const [i, setI] = useState(0);
    const navigate = useNavigate();


    const mediaQuery = window.matchMedia("(max-width: 800px)");
    const isMobile = mediaQuery.matches;

    const next = () => {
        if (i < slides.length - 1) {
            setI(i + 1);
        }
    };

    const prev = () => {
        if (i > 0) {
            setI(i - 1);
        }
    };

    return (
            <motion.div
                className="slides"
                key={i}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
            >
                <div
                    id="slides-container"
                    style={{ background: `url(${slides[i].imageUrl}) no-repeat center / cover` }}
                >
                    <motion.div
                        initial={{
                            x: `${i % 2 === 0 ? '-100vw' : '200vw'}`
                        }}
                        animate={{
                            x: `${i % 2 === 0 ? '0vw' : (
                                isMobile ? '0vw' : '45vw'
                            )}`}}
                        transition={{ duration: 1.2, ease: 'circOut' }}
                        style={{ width: `${isMobile ? '90vw' : '45vw'}` }}
                    >
                        <h1>{slides[i].title}</h1>
                        <p>{slides[i].upperText}</p>
                    </motion.div>

                    <motion.div
                        initial={{ right: `${i % 2 === 0 ? '-200vw' : '100vw'}` }}
                        animate={{ right: `${i % 2 === 0 ? (
                                isMobile ? '0vw' : '-45vw'
                            ) : '0vw'}` }}
                        transition={{ duration: 1.2, ease: 'circOut', delay: 1.5 }}
                        style={{ position: "relative", width: `${isMobile ? '90vw' : '45vw'}` }}
                    >

                        <p>{slides[i].lowerText}</p>
                    </motion.div>

                    <div id="nav-buttons">
                        <div className='button-container' id='go-to-museum' onClick={prev}>
                            <div className='circle' id='circle-go-to-museum-left'>
                                <span className='arrow' id='arrow-go-to-museum-left'> ← </span>
                            </div>
                            <a className='button-text' id='button-text-go-to-museum'>Previous</a>
                        </div>

                        <div className='button-container' id='go-to-museum' onClick={next}>
                            <a className='button-text' id='button-text-go-to-museum'>Next</a>
                            <div className='circle' id='circle-go-to-museum-right'>
                                <span className='arrow' id='arrow-go-to-museum-right'> → </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
    )
};

export default Slides;
