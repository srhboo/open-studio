import React, { useState } from "react";

const Player = ({ downloadUrl }) => (
  <audio controls>
    <source src={downloadUrl} type="audio/mpeg" />
  </audio>
);

export const SoundDisplay = ({ textContent, downloadUrl, creator }) => {
  const [iframe, setIframe] = useState("");
  const isSoundCloud = downloadUrl.indexOf("soundcloud") > 0;
  const isDirectUrl = !isSoundCloud;
  if (isSoundCloud) {
    const reqUrl = `https://soundcloud.com/oembed?format=json&url=${downloadUrl}&iframe=true`;
    fetch(reqUrl)
      .then((res) => res.json())
      .then((data) => {
        const html = data.html;
        setIframe(html);
      });
  }
  if (isDirectUrl) {
  }
  return (
    <div className="sound-display-container">
      {isDirectUrl && <Player downloadUrl={downloadUrl} />}
      {isSoundCloud && (
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: iframe }}
        ></div>
      )}
      <div className="text-display-container">
        {textContent}
        <div className="creator-container">- {creator.username}</div>
      </div>
    </div>
  );
};
//http://soundcloud.com/oembed?format=js&url=[escaped_url]&iframe=true
