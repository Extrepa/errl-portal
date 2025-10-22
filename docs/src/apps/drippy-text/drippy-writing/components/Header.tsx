import React from 'react';

const Header: React.FC = () => {
  // Using a Data URL to embed the logo directly, guaranteeing it will load.
  const logoUrl = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='448' height='96' viewBox='0 0 448 96'%3e%3cdefs%3e%3clinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3e%3cstop offset='0%25' style='stop-color:rgb(6,182,212);stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:rgb(168,85,247);stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3cstyle%3e.title %7b font-family: 'Segoe UI', 'Helvetica Neue', sans-serif; font-size: 32px; font-weight: bold; fill: url(%23grad1); %7d%3c/style%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' class='title'%3eDrippy Text Maker%3c/text%3e%3c/svg%3e";

  return (
    <header className="text-center p-4 md:p-6 flex flex-col items-center">
      <img src={logoUrl} alt="Drippy Text Maker" className="w-full max-w-md mb-2" />
      <p className="text-cyan-200/70 text-lg">
        Transform your words into liquid chrome art.
      </p>
    </header>
  );
};

export default Header;