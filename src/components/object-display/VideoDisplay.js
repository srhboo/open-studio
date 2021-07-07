import React, { useEffect, useState } from "react";

export const VideoDisplay = ({ textContent, downloadUrl, creator }) => {
  const [iframe, setIframe] = useState("");
  useEffect(() => {
    const isVimeo = downloadUrl.match(/vimeo/g);
    const isYoutube = downloadUrl.match(/youtu\.?be/g);
    if (isVimeo) {
      const reqUrl = `https://vimeo.com/api/oembed.json?url=${downloadUrl}`;
      fetch(reqUrl)
        .then((res) => res.json())
        .then((data) => {
          const html = data.html;
          setIframe(html);
        });
    }
    if (isYoutube) {
      const reqUrl = `https://www.youtube.com/oembed?url=${downloadUrl}`;
      fetch(reqUrl)
        .then((res) => res.json())
        .then((data) => {
          const html = data.html;
          setIframe(html);
        });
    }
  }, [setIframe, downloadUrl]);
  return (
    <div className="video-display-container">
      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: iframe }}
      ></div>
      <div className="text-display-container">
        {textContent}
        <div className="creator-container">- {creator.username}</div>
      </div>
    </div>
  );
};
