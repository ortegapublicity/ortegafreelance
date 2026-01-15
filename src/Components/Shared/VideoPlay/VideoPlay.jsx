import React, { useEffect } from "react";
import { XLg } from "react-bootstrap-icons";

const VideoPlay = ({ setLightboxOpen, url }) => {
  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeLightbox();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="lightbox" onClick={handleBackdropClick}>
      <div className="lightbox__content lightbox__content-video">
        <button className="close_button" onClick={closeLightbox}>
          <i>
            <XLg />
          </i>
        </button>
        <div style={{position: 'relative', paddingBottom: '62.5%', height: 0}}>
          <iframe 
            src="https://www.loom.com/embed/4f5baa2ee5f94283920a35c0fd805199?sid=13ace094-7841-4d0f-88ff-f1fa3a79bccf" 
            frameBorder="0" 
            webkitAllowFullScreen 
            mozAllowFullScreen 
            allowFullScreen 
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoPlay;
